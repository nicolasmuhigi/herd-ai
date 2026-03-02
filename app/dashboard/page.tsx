"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Upload, ImageIcon, X, Loader2, CheckCircle2 } from "lucide-react"

export default function UploadPage() {
  const router = useRouter()
  const [files, setFiles] = useState<{ name: string; size: string }[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files).map((f) => ({
      name: f.name,
      size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
    }))
    setFiles((prev) => [...prev, ...droppedFiles])
  }, [])

  const handleFileSelect = useCallback(() => {
    const mockFiles = [
      { name: `livestock_scan_${Date.now()}.jpg`, size: "3.2 MB" },
    ]
    setFiles((prev) => [...prev, ...mockFiles])
  }, [])

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleAnalyze = useCallback(() => {
    setIsAnalyzing(true)
    setTimeout(() => {
      router.push("/dashboard/results")
    }, 2000)
  }, [router])

  return (
    <div className="mx-auto max-w-3xl">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Upload Image</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Upload a photo of your livestock for AI-powered disease detection and analysis.
        </p>
      </div>

      {/* Upload card */}
      <div className="rounded-3xl bg-card border border-border/50 p-6 shadow-lg shadow-primary/5 sm:p-8">
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={handleFileSelect}
          role="button"
          tabIndex={0}
          aria-label="Upload area. Click or drag and drop images here."
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleFileSelect() }}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-border hover:border-primary/50 hover:bg-primary/5"
          }`}
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Upload className="h-7 w-7 text-primary" />
          </div>
          <p className="text-base font-semibold text-foreground">Drop your images here</p>
          <p className="mt-1 text-sm text-muted-foreground">or click to browse your files</p>
          <p className="mt-3 text-xs text-muted-foreground">Supports JPG, PNG, WebP up to 25MB</p>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Selected Files</h3>
            {files.map((file, i) => (
              <div key={`${file.name}-${i}`} className="flex items-center gap-3 rounded-xl bg-background border border-border/50 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/30">
                  <ImageIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{file.size}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(i) }}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Analyze button */}
        <button
          onClick={handleAnalyze}
          disabled={files.length === 0 || isAnalyzing}
          className="mt-6 group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
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
        </button>
      </div>

      {/* Info cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { title: "Fast Analysis", desc: "Results in under 10 seconds" },
          { title: "Multi-Disease", desc: "Checks 50+ known diseases" },
          { title: "High Accuracy", desc: "94%+ detection confidence" },
        ].map((info) => (
          <div key={info.title} className="rounded-2xl bg-card border border-border/50 p-5 text-center">
            <p className="text-sm font-bold text-foreground">{info.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{info.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
