"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Clock, AlertCircle, Edit2, Save, X, Download, Trash2 } from "lucide-react"
import type { Analysis } from "@prisma/client"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { getPublicImageUrl } from "@/lib/public-image-url";

interface AppointmentWithAnalysis {
  id: string
  appointmentDate: string
  reason: string | null
  status: string
  outcome: string | null
  resolutionStatus: string | null
  user: {
    id: string
    name: string
    email: string
  }
  analysis: Analysis | null
  createdAt: string
  updatedAt: string
}

// Helper to resolve Supabase or legacy image URLs
function resolveAnalysisImageUrl(imageUrl?: string | null): string | null {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  if (!imageUrl.startsWith("/")) return getPublicImageUrl(imageUrl);
  return imageUrl;
}

export default function AppointmentHistoryPage() {
  const [appointments, setAppointments] = useState<AppointmentWithAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<{
    outcome: string
    resolutionStatus: string
  }>({ outcome: "", resolutionStatus: "" })
  const [savingId, setSavingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("authToken")
        const response = await fetch("/api/vet/history", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setAppointments(data.appointments || [])
        } else {
          setError("Failed to load appointment history")
        }
      } catch (err) {
        console.error("Failed to fetch history:", err)
        setError("Failed to load appointment history")
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
    // Load uploadedPreview from localStorage
    const savedPreview = localStorage.getItem("latestUploadedPreview");
    if (savedPreview) {
      setUploadedPreview(savedPreview);
    }
  }, [])

  const startEdit = (apt: AppointmentWithAnalysis) => {
    setEditingId(apt.id)
    setEditData({
      outcome: apt.outcome || "",
      resolutionStatus: apt.resolutionStatus || "IN_PROGRESS",
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditData({ outcome: "", resolutionStatus: "" })
  }

  const saveEdit = async (appointmentId: string) => {
    setSavingId(appointmentId)
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch("/api/vet/history", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          appointmentId,
          outcome: editData.outcome,
          resolutionStatus: editData.resolutionStatus,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAppointments(prev =>
          prev.map(apt =>
            apt.id === appointmentId
              ? { ...apt, ...data.appointment }
              : apt
          )
        )
        setEditingId(null)
      } else {
        setError("Failed to save changes")
      }
    } catch (err) {
      console.error("Failed to save:", err)
      setError("Failed to save changes")
    } finally {
      setSavingId(null)
    }
  }

  const deleteAppointment = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to delete this appointment record? This action cannot be undone.")) {
      return
    }

    setDeletingId(appointmentId)
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`/api/vet/history?appointmentId=${appointmentId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setAppointments(prev => prev.filter(apt => apt.id !== appointmentId))
      } else {
        setError("Failed to delete appointment")
      }
    } catch (err) {
      console.error("Failed to delete:", err)
      setError("Failed to delete appointment")
    } finally {
      setDeletingId(null)
    }
  }

  const downloadPDF = async (apt: AppointmentWithAnalysis) => {
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      let yOffset = 20

      // Header with logo area
      doc.setFillColor(62, 207, 142) // Primary color
      doc.rect(0, 0, pageWidth, 35, 'F')
      
      // Title
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(24)
      doc.setFont("helvetica", "bold")
      doc.text("VETERINARY REPORT", pageWidth / 2, 20, { align: "center" })
      
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text("Herd AI - Livestock Health Management", pageWidth / 2, 28, { align: "center" })

      yOffset = 45

      // Client Information Section
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Client Information", 15, yOffset)
      yOffset += 8

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(`Name: ${apt.user.name}`, 15, yOffset)
      yOffset += 6
      doc.text(`Email: ${apt.user.email}`, 15, yOffset)
      yOffset += 10

      // Appointment Details Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Appointment Details", 15, yOffset)
      yOffset += 8

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(`Date & Time: ${new Date(apt.appointmentDate).toLocaleString()}`, 15, yOffset)
      yOffset += 6
      doc.text(`Status: ${apt.status}`, 15, yOffset)
      yOffset += 6
      if (apt.reason) {
        doc.text(`Reason: ${apt.reason.substring(0, 80)}${apt.reason.length > 80 ? '...' : ''}`, 15, yOffset)
        yOffset += 6
      }
      yOffset += 6

      // Include uploaded image if available
      if (apt.analysis?.imageUrl) {
        try {
          const resolvedUrl = resolveAnalysisImageUrl(apt.analysis.imageUrl);
          const response = await fetch(resolvedUrl!);
          const blob = await response.blob();
          const reader = new FileReader();
          await new Promise((resolve, reject) => {
            reader.onloadend = () => {
              try {
                const base64data = reader.result as string;
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.text("Uploaded Livestock Image", 15, yOffset);
                yOffset += 8;
                const maxWidth = pageWidth - 30;
                const maxHeight = 80;
                const imgWidth = Math.min(maxWidth, 120);
                const imgHeight = Math.min(maxHeight, 80);
                doc.addImage(base64data, 'JPEG', 15, yOffset, imgWidth, imgHeight);
                yOffset += imgHeight + 10;
                resolve(true);
              } catch (err) {
                console.error("Error adding image:", err);
                resolve(false);
              }
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (err) {
          console.error("Failed to load image:", err);
          doc.setFontSize(10);
          doc.setFont("helvetica", "italic");
          doc.text("(Image could not be loaded)", 15, yOffset);
          yOffset += 10;
        }
      }

      // Check if we need a new page
      if (yOffset > pageHeight - 60) {
        doc.addPage()
        yOffset = 20
      }

      // Analysis Results Section
      if (apt.analysis) {
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("AI Analysis Results", 15, yOffset)
        yOffset += 8

        // Create analysis results table
        const analysisData = [
          ['Detected Disease', apt.analysis.detectedDisease || 'Not analyzed'],
          ['Confidence Score', `${(apt.analysis.confidence * 100).toFixed(1)}%`],
          ['Healthy Score', `${(apt.analysis.healthy * 100).toFixed(1)}%`],
          ['Foot-and-Mouth Score', `${(apt.analysis.footAndMouth * 100).toFixed(1)}%`],
          ['Lumpy Skin Score', `${(apt.analysis.lumpySkin * 100).toFixed(1)}%`],
          ['Anthrax Score', `${(apt.analysis.anthrax * 100).toFixed(1)}%`],
        ]

        autoTable(doc, {
          startY: yOffset,
          head: [['Parameter', 'Value']],
          body: analysisData,
          theme: 'grid',
          headStyles: { fillColor: [62, 207, 142], textColor: 255, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [245, 245, 245] },
          margin: { left: 15, right: 15 },
        })

        yOffset = (doc as any).lastAutoTable.finalY + 10
      }

      // Check if we need a new page
      if (yOffset > pageHeight - 40) {
        doc.addPage()
        yOffset = 20
      }

      // Appointment Outcome Section
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Veterinary Assessment", 15, yOffset)
      yOffset += 8

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      
      if (apt.outcome) {
        doc.text("Outcome:", 15, yOffset)
        yOffset += 6
        
        // Split long outcome text into lines
        const outcomeLines = doc.splitTextToSize(apt.outcome, pageWidth - 30)
        doc.text(outcomeLines, 15, yOffset)
        yOffset += (outcomeLines.length * 5) + 6
      } else {
        doc.setFont("helvetica", "italic")
        doc.text("No outcome recorded", 15, yOffset)
        yOffset += 10
      }

      doc.setFont("helvetica", "normal")
      doc.text(`Resolution Status: ${apt.resolutionStatus || 'Not set'}`, 15, yOffset)
      yOffset += 10

      // Footer
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text(
        `Generated by Herd AI on ${new Date().toLocaleString()}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      )

      // Save the PDF
      const fileName = `VetReport_${apt.user.name.replace(/\s+/g, '_')}_${new Date(apt.appointmentDate).getTime()}.pdf`
      doc.save(fileName)
    } catch (err) {
      console.error("Failed to generate PDF:", err)
      alert("Failed to generate PDF report. Please try again.")
    }
  }


  const getResolutionColor = (status: string | null) => {
    switch (status) {
      case "RESOLVED":
        return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
      case "IN_PROGRESS":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20"
      case "NOT_RESOLVED":
        return "bg-red-500/10 text-red-700 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-500/20"
    }
  }

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "RESOLVED":
        return <CheckCircle2 className="h-4 w-4" />
      case "NOT_RESOLVED":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading appointment history...</p>
      </div>
    )
  }

  if (appointments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-secondary/50 p-12 text-center">
        <p className="text-muted-foreground">No appointment history yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}

      {appointments.map(apt => (
        <div
          key={apt.id}
          className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-colors"
        >
          {/* Main Content */}
          <div className="p-6 space-y-4">
            {/* Header with client info and status */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-foreground">{apt.user.name}</h3>
                <p className="text-xs text-muted-foreground">{apt.user.email}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(apt.appointmentDate).toLocaleString()}
                </p>
              </div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                apt.status === "CONFIRMED" 
                  ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" 
                  : "bg-red-500/10 text-red-700 border-red-500/20"
              }`}>
                {apt.status === "CONFIRMED" ? "✔ Confirmed" : "✕ Cancelled"}
              </div>
            </div>

            {/* Image Display */}
            {apt.analysis?.imageUrl && (
              <div className="rounded-lg overflow-hidden border border-border">
                <img 
                  src={resolveAnalysisImageUrl(apt.analysis.imageUrl) || undefined} 
                  alt="Cattle analysis image"
                  className="w-full h-48 object-cover"
                />
              </div>
            )}

            {/* Reason */}
            {apt.reason && (
              <div className="bg-secondary/50 rounded-lg p-3 border border-border">
                <p className="text-xs text-muted-foreground font-medium">Reason</p>
                <p className="text-sm text-foreground mt-1">{apt.reason}</p>
              </div>
            )}

            {/* Analysis Results */}
            {apt.analysis && (
              <div className="bg-secondary/50 rounded-lg p-3 border border-border">
                <p className="text-xs text-muted-foreground font-medium">Detected Disease</p>
                <p className="text-sm text-foreground font-semibold mt-1">{apt.analysis.detectedDisease}</p>
                {apt.analysis.advice && (
                  <p className="text-xs text-muted-foreground mt-2">{apt.analysis.advice}</p>
                )}
              </div>
            )}

            {/* Outcome and Resolution Status */}
            {editingId === apt.id ? (
              <div className="space-y-3 bg-secondary/50 rounded-lg p-4 border border-border">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Outcome</label>
                  <textarea
                    value={editData.outcome}
                    onChange={(e) => setEditData({ ...editData, outcome: e.target.value })}
                    placeholder="Describe the appointment outcome..."
                    rows={3}
                    className="w-full mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Resolution Status</label>
                  <select
                    value={editData.resolutionStatus}
                    onChange={(e) => setEditData({ ...editData, resolutionStatus: e.target.value })}
                    className="w-full mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                  >
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="NOT_RESOLVED">Not Resolved</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <div
                    onClick={() => {
                      if (savingId !== apt.id) {
                        saveEdit(apt.id)
                      }
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 ${
                      savingId === apt.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <Save className="h-4 w-4" />
                    {savingId === apt.id ? "Saving..." : "Save"}
                  </div>
                  <div
                    onClick={cancelEdit}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-all hover:border-primary/30 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {apt.outcome ? (
                  <div className="bg-secondary/50 rounded-lg p-3 border border-border">
                    <p className="text-xs text-muted-foreground font-medium">Outcome</p>
                    <p className="text-sm text-foreground mt-1">{apt.outcome}</p>
                  </div>
                ) : (
                  <div className="bg-secondary/50 rounded-lg p-3 border border-border/50">
                    <p className="text-xs text-muted-foreground italic">No outcome recorded yet</p>
                  </div>
                )}

                {apt.resolutionStatus ? (
                  <div className={`rounded-lg p-3 border inline-flex items-center gap-2 ${getResolutionColor(apt.resolutionStatus)}`}>
                    {getStatusIcon(apt.resolutionStatus)}
                    <span className="text-xs font-semibold">{apt.resolutionStatus}</span>
                  </div>
                ) : (
                  <div className="bg-secondary/50 rounded-lg p-3 border border-border/50">
                    <p className="text-xs text-muted-foreground italic">No resolution status set</p>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              {editingId !== apt.id && (
                <>
                  <div
                    onClick={() => startEdit(apt)}
                    className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline transition-colors cursor-pointer"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit Outcome
                  </div>
                  <div
                    onClick={() => downloadPDF(apt)}
                    className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline transition-colors cursor-pointer"
                    title="Download professional PDF report with analysis image"
                  >
                    <Download className="h-4 w-4" />
                    Download Report
                  </div>
                  <div
                    onClick={() => {
                      if (deletingId !== apt.id) {
                        deleteAppointment(apt.id)
                      }
                    }}
                    className={`ml-auto flex items-center gap-2 text-sm font-semibold text-red-600 hover:underline transition-colors ${
                      deletingId === apt.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <Trash2 className="h-4 w-4" />
                    {deletingId === apt.id ? "Deleting..." : "Delete"}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
