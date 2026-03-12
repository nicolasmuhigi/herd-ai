"use client"

import { useState, useEffect } from "react"
import { Check, X, Clock, User, MapPin, AlertCircle } from "lucide-react"
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
  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }
  if (imageUrl.startsWith("/uploads/")) {
    return `/api/uploads/${imageUrl.replace(/^\/uploads\//, "")}`;
  }
  if (!imageUrl.startsWith("/")) {
    return `https://huggingface.co/datasets/NickMuhigi/livestock-disease-detector/resolve/main/images/${imageUrl}`;
  }
  return imageUrl;
}

export default function VetDashboardPage() {
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
        setError("Failed to load appointments")
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

      // Update local state
      setAppointments(appointments.map(apt =>
        apt.id === appointmentId ? { ...apt, status: "CONFIRMED" } : apt
      ))
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

      // Update local state
      setAppointments(appointments.map(apt =>
        apt.id === appointmentId ? { ...apt, status: "CANCELLED" } : apt
      ))
    } catch (err) {
      console.error("Error cancelling appointment:", err)
      setError("Failed to cancel appointment")
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Appointment Requests</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Review and manage appointment requests from clients
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
      ) : appointments.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No appointment requests yet</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {appointments.map(appointment => (
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
              <div className="flex flex-col md:flex-row h-full">
                {/* Image Section */}
                {appointment.analysis ? (
                  <div className="md:w-1/3 bg-secondary flex items-center justify-center p-4">
                    <img
                      src={resolveImageUrl(appointment.analysis.imageUrl)}
                      alt="Uploaded cattle image"
                      className="max-h-80 max-w-full object-contain rounded"
                    />
                  </div>
                ) : (
                  <div className="md:w-1/3 bg-secondary flex items-center justify-center p-4">
                    <p className="text-sm text-muted-foreground">No image available</p>
                  </div>
                )}

                {/* Details Section */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  {/* Client and Appointment Info */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{appointment.user.name}</h3>
                        <p className="text-xs text-muted-foreground">{appointment.user.email}</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
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
                      <div className="mt-6 pt-4 border-t border-border">
                        <h4 className="font-semibold text-foreground mb-3">Analysis Results</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Detected Condition:</span>
                            <span className="text-sm font-medium text-foreground">{appointment.analysis.detectedDisease}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Confidence:</span>
                            <span className="text-sm font-medium text-foreground">{(appointment.analysis.confidence * 100).toFixed(1)}%</span>
                          </div>
                          
                          <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Healthy:</span>
                              <div className="font-medium">{(appointment.analysis.healthy * 100).toFixed(1)}%</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">FMD:</span>
                              <div className="font-medium">{(appointment.analysis.footAndMouth * 100).toFixed(1)}%</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Lumpy Skin:</span>
                              <div className="font-medium">{(appointment.analysis.lumpySkin * 100).toFixed(1)}%</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Anthrax:</span>
                              <div className="font-medium">{(appointment.analysis.anthrax * 100).toFixed(1)}%</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="mt-4">
                      <span className={`inline-flex items-center gap-2 text-xs font-medium px-2.5 py-0.5 rounded-full ${
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
                    <div className="flex gap-2 mt-6 pt-4 border-t border-border">
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
