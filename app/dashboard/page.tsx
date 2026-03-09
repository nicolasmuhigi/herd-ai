"use client"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Upload, ImageIcon, X, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { parseApiResponse } from "@/lib/http"

interface UploadItem {
  file: File
  previewUrl: string
}

interface GeoCoordinates {
  latitude: number
  longitude: number
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const value = reader.result
      if (typeof value === "string") {
        resolve(value)
      } else {
        reject(new Error("Failed to read image preview"))
      }
    }
    reader.onerror = () => reject(new Error("Failed to read image preview"))
    reader.readAsDataURL(file)
  })
}

function getCurrentCoordinates(): Promise<GeoCoordinates | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      resolve(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      () => resolve(null),
      {
        enableHighAccuracy: false,
        timeout: 7000,
        maximumAge: 1000 * 60 * 10,
      }
    )
  })
}

export default function UploadPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<UploadItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const appendFiles = useCallback((incomingFiles: File[]) => {
    const uploadItems = incomingFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }))
    setFiles((prev) => [...prev, ...uploadItems])
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"))
    if (droppedFiles.length === 0) {
      toast.error("Please drop an image file (JPG, PNG, WebP)")
      return
    }
    appendFiles(droppedFiles)
  }, [appendFiles])

  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []).filter((file) => file.type.startsWith("image/"))
    if (selectedFiles.length === 0) {
      toast.error("Please select an image file (JPG, PNG, WebP)")
      return
    }
    appendFiles(selectedFiles)
    e.target.value = ""
  }, [appendFiles])

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => {
      const item = prev[index]
      if (item) {
        URL.revokeObjectURL(item.previewUrl)
      }
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  const handleAnalyze = useCallback(async () => {
    if (files.length === 0) {
      toast.error("Please upload at least one image")
      return
    }

    setIsAnalyzing(true)
    try {
      const formData = new FormData()
      formData.append("image", files[0].file)

      const coordinates = await getCurrentCoordinates()
      if (coordinates) {
        formData.append("latitude", String(coordinates.latitude))
        formData.append("longitude", String(coordinates.longitude))
      }

      const token = localStorage.getItem("authToken")
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      })

      const parsed = await parseApiResponse<{ analysis: unknown; error?: string }>(
        response,
        "Failed to analyze image"
      )

      if (!response.ok) {
        throw new Error(parsed.errorMessage || "Failed to analyze image")
      }

      if (!parsed.data || !parsed.data.analysis) {
        throw new Error(parsed.errorMessage || "Invalid analysis response")
      }

      localStorage.setItem("latestAnalysis", JSON.stringify(parsed.data.analysis))

      try {
        const previewDataUrl = await fileToDataUrl(files[0].file)
        localStorage.setItem("latestUploadedPreview", previewDataUrl)
      } catch {
        // Fallback to object URL if data URL storage fails (e.g., quota limits).
        localStorage.setItem("latestUploadedPreview", files[0].previewUrl)
      }

      toast.success("Image analyzed successfully")
      router.push("/dashboard/results")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to analyze image"
      toast.error(message)
    } finally {
      setIsAnalyzing(false)
    }
  }, [files, router])

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Upload Image</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Upload a photo of your livestock for AI-powered disease detection and analysis.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleInputChange}
          className="hidden"
        />

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={handleFileSelect}
          role="button"
          tabIndex={0}
          aria-label="Upload area. Click or drag and drop images here."
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleFileSelect() }}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-all ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/40 hover:bg-primary/5"
          }`}
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Upload className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm font-semibold text-foreground">Drop your images here</p>
          <p className="mt-1 text-xs text-muted-foreground">or click to browse your files</p>
          <p className="mt-3 text-xs text-muted-foreground/60">Supports JPG, PNG, WebP up to 25MB</p>
        </div>

        {files.length > 0 && (
          <div className="mt-6 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Selected Files</h3>
            {files.map((file, i) => (
              <div key={`${file.file.name}-${i}`} className="flex items-center gap-3 rounded-lg bg-secondary border border-border p-3">
                <div className="h-12 w-12 overflow-hidden rounded-md border border-border bg-muted">
                  <img
                    src={file.previewUrl}
                    alt={file.file.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file.file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.file.size / (1024 * 1024)).toFixed(1)} MB</p>
                </div>
                <div
                  onClick={(e) => { e.stopPropagation(); removeFile(i) }}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                  role="button"
                  aria-label={`Remove ${file.file.name}`}
                >
                  <X className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        <div
          onClick={() => {
            if (files.length > 0 && !isAnalyzing) {
              handleAnalyze()
            }
          }}
          className={`mt-6 group flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 ${
            files.length === 0 || isAnalyzing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Analyze Images
            </>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          { title: "Fast Analysis", desc: "Results in under 10 seconds" },
          { title: "Multi-Disease", desc: "Checks 50+ known diseases" },
          { title: "High Accuracy", desc: "94%+ detection confidence" },
        ].map((info) => (
          <div key={info.title} className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-sm font-semibold text-foreground">{info.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{info.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
