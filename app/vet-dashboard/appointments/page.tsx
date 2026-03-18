"use client"

import { useState, useEffect } from "react"
import { Check, X, Clock, User, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface Appointment {
  id: string
  appointmentDate: string
  reason?: string
  status: string
  user: {
    id: string
    name: string
    email: string
  }
  analysis?: {
    id: string
    imageUrl: string
    detectedDisease: string
    confidence: number
    healthy: number
    footAndMouth: number
    lumpySkin: number
    anthrax: number
  } | null
}

function resolveImageUrl(imageUrl: string): string {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http")) return imageUrl;
  return imageUrl;
}

export default function VetAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("authToken")
        if (!token) {
          setError("Not authenticated")
          setLoading(false)
          return
        }

        const response = await fetch("/api/vet/appointments", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch appointments")
        }

        const data = await response.json()
        console.log("Fetched appointments:", data.appointments)
        setAppointments(data.appointments || [])
      } catch (err) {
        console.error("Error fetching appointments:", err)
        setError(err instanceof Error ? err.message : "Failed to load appointments")
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  const handleApprove = async (appointmentId: string) => {
    setUpdatingId(appointmentId)
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch("/api/vet/appointments", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          appointmentId,
          status: "CONFIRMED",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to approve appointment")
      }

      // Update local state - remove from list since it's no longer pending
      setAppointments(prev => prev.filter(apt => apt.id !== appointmentId))
    } catch (err) {
      console.error("Error approving appointment:", err)
      setError("Failed to approve appointment")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleCancel = async (appointmentId: string) => {
    setUpdatingId(appointmentId)
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch("/api/vet/appointments", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          appointmentId,
          status: "CANCELLED",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to cancel appointment")
      }

      // Update local state - remove from list since it's no longer pending
      setAppointments(prev => prev.filter(apt => apt.id !== appointmentId))
    } catch (err) {
      console.error("Error cancelling appointment:", err)
      setError("Failed to cancel appointment")
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Appointment Bookings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Review client appointments with their analysis results and images
        </p>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-500/5 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading appointments...</p>
        </div>
      ) : appointments.filter(a => a.status === "PENDING").length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No pending appointment bookings</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {appointments
            .filter(a => a.status === "PENDING")
            .map(appointment => (
            <Card
              key={appointment.id}
              className={`border transition-all overflow-hidden ${
                appointment.status === "CONFIRMED"
                  ? "border-emerald-200 bg-emerald-500/5"
                  : appointment.status === "CANCELLED"
                  ? "border-red-200 bg-red-500/5 opacity-60"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex flex-col lg:flex-row h-full">
                {/* Image Section */}
                <div className="lg:w-1/4 bg-secondary flex items-center justify-center p-6 min-h-80">
                  {appointment.analysis ? (
                    <img
                      src={resolveImageUrl(appointment.analysis.imageUrl)}
                      alt="Uploaded cattle image"
                      className="max-h-96 max-w-full object-contain rounded-lg shadow-sm"
                    />
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">No image available</p>
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  {/* Client Info */}
                  <div>
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">{appointment.user.name}</h3>
                        <p className="text-sm text-muted-foreground">{appointment.user.email}</p>
                      </div>
                    </div>

                    {/* Appointment Details */}
                    <div className="mb-6 space-y-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground font-medium">
                          {new Date(appointment.appointmentDate).toLocaleString()}
                        </span>
                      </div>
                      {appointment.reason && (
                        <div className="text-sm">
                          <span className="font-medium text-foreground">Reason: </span>
                          <span className="text-muted-foreground">{appointment.reason}</span>
                        </div>
                      )}
                    </div>

                    {/* Analysis Results */}
                    {appointment.analysis && (
                      <div className="mb-6 pb-6 border-t border-border pt-6">
                        <h4 className="font-semibold text-foreground mb-4">Analysis Results</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Primary Detection */}
                          <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                            <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Detected Condition</p>
                            <p className="text-lg font-bold text-foreground">{appointment.analysis.detectedDisease}</p>
                            <p className="text-sm text-primary font-semibold mt-2">
                              {(appointment.analysis.confidence * 100).toFixed(1)}% Confidence
                            </p>
                          </div>

                          {/* Disease Probabilities */}
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground uppercase font-semibold mb-3">All Scores</p>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-card border border-border rounded p-2">
                                <p className="text-xs text-muted-foreground">Healthy</p>
                                <p className="text-sm font-semibold text-foreground">{(appointment.analysis.healthy * 100).toFixed(1)}%</p>
                              </div>
                              <div className="bg-card border border-border rounded p-2">
                                <p className="text-xs text-muted-foreground">FMD</p>
                                <p className="text-sm font-semibold text-foreground">{(appointment.analysis.footAndMouth * 100).toFixed(1)}%</p>
                              </div>
                              <div className="bg-card border border-border rounded p-2">
                                <p className="text-xs text-muted-foreground">Lumpy Skin</p>
                                <p className="text-sm font-semibold text-foreground">{(appointment.analysis.lumpySkin * 100).toFixed(1)}%</p>
                              </div>
                              <div className="bg-card border border-border rounded p-2">
                                <p className="text-xs text-muted-foreground">Anthrax</p>
                                <p className="text-sm font-semibold text-foreground">{(appointment.analysis.anthrax * 100).toFixed(1)}%</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div>
                      <span className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full ${
                        appointment.status === "CONFIRMED"
                          ? "bg-emerald-100 text-emerald-700"
                          : appointment.status === "CANCELLED"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {appointment.status === "CONFIRMED" && <Check className="h-3 w-3" />}
                        {appointment.status === "CANCELLED" && <X className="h-3 w-3" />}
                        {appointment.status === "PENDING" && <Clock className="h-3 w-3" />}
                        {appointment.status}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {appointment.status === "PENDING" && (
                    <div className="flex gap-2 mt-6 pt-6 border-t border-border">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(appointment.id)}
                        disabled={updatingId === appointment.id}
                        className="gap-2 bg-emerald-600 hover:bg-emerald-700 flex-1"
                      >
                        <Check className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancel(appointment.id)}
                        disabled={updatingId === appointment.id}
                        className="gap-2 flex-1"
                      >
                        <X className="h-4 w-4" />
                        Decline
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
