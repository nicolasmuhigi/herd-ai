"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { CalendarCheck, CheckCircle2, Clock, MapPin, Star, ArrowRight } from "lucide-react"
import { parseApiResponse } from "@/lib/http"
import { Calendar } from "@/components/ui/calendar"

interface Vet {
  id: string
  name: string
  email: string
  district?: string | null
}

interface Appointment {
  id: string
  appointmentDate: string
  status: string
}

export default function BookingPage() {
  const [vets, setVets] = useState<Vet[]>([])
  const [loadingVets, setLoadingVets] = useState(true)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loadingAppointments, setLoadingAppointments] = useState(true)
  const [selectedVet, setSelectedVet] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [booked, setBooked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [notes, setNotes] = useState("")

  // Generate time slots from 12 PM to 5 PM
  const timeSlots = useMemo(
    () => [
      "12:00 PM",
      "1:00 PM",
      "2:00 PM",
      "3:00 PM",
      "4:00 PM",
      "5:00 PM",
    ],
    []
  )

  // Fetch vets and appointments on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken")
        
        // Fetch vets
        const vetsResponse = await fetch("/api/vets", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })

        const parsedVets = await parseApiResponse<{ vets?: Vet[]; error?: string }>(
          vetsResponse,
          "Failed to load vets"
        )
        
        if (vetsResponse.ok) {
          setVets(parsedVets.data?.vets || [])
        } else {
          console.error("Vets API error:", parsedVets.errorMessage)
          setError(parsedVets.errorMessage || "Failed to load vets")
        }

        // Fetch user's appointments
        const appointmentsResponse = await fetch("/api/appointments", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })

        const parsedAppointments = await parseApiResponse<{ appointments?: Appointment[]; error?: string }>(
          appointmentsResponse,
          "Failed to load appointments"
        )
        
        if (appointmentsResponse.ok) {
          setAppointments(parsedAppointments.data?.appointments || [])
        } else {
          console.error("Appointments API error:", parsedAppointments.errorMessage)
        }
      } catch (err) {
        console.error("Failed to fetch data:", err)
        setError("Failed to load data")
      } finally {
        setLoadingVets(false)
        setLoadingAppointments(false)
      }
    }
    fetchData()
  }, [])

  // Helper function to check if a time slot is booked for the selected date
  const isTimeSlotBooked = useCallback((time: string): boolean => {
    if (!selectedDate) return false

    const timeParts = time.split(" ")
    const [hoursStr, minutesStr] = timeParts[0].split(":").map(Number)
    const isPM = timeParts[1] === "PM"
    let hours = hoursStr

    // Convert to 24-hour format
    if (isPM && hours !== 12) {
      hours += 12
    } else if (!isPM && hours === 12) {
      hours = 0
    }

    const selectedDateTime = new Date(selectedDate)
    selectedDateTime.setHours(hours, minutesStr || 0, 0, 0)

    // Check if any appointment matches this date and time
    return appointments.some(apt => {
      const aptDate = new Date(apt.appointmentDate)
      return (
        aptDate.getFullYear() === selectedDateTime.getFullYear() &&
        aptDate.getMonth() === selectedDateTime.getMonth() &&
        aptDate.getDate() === selectedDateTime.getDate() &&
        aptDate.getHours() === selectedDateTime.getHours() &&
        aptDate.getMinutes() === selectedDateTime.getMinutes()
      )
    })
  }, [selectedDate, appointments])

  const handleBook = useCallback(async () => {
    if (selectedVet === null || selectedDate === undefined || selectedTime === null) return

    setLoading(true)
    setError("")

    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        setError("Not authenticated. Please log in again.")
        setLoading(false)
        return
      }

      // Combine selected date with selected time
      const timeParts = selectedTime.split(" ")
      const [hoursStr, minutesStr] = timeParts[0].split(":").map(Number)
      const isPM = timeParts[1] === "PM"
      let hours = hoursStr
      
      // Convert to 24-hour format
      if (isPM && hours !== 12) {
        hours += 12
      } else if (!isPM && hours === 12) {
        hours = 0
      }
      
      const appointmentDate = new Date(selectedDate)
      appointmentDate.setHours(hours, minutesStr || 0, 0, 0)

      // Get the latest analysis ID from localStorage
      const savedAnalysis = localStorage.getItem("latestAnalysis")
      let analysisId: string | undefined
      if (savedAnalysis) {
        try {
          const analysisData = JSON.parse(savedAnalysis)
          analysisId = analysisData.id
        } catch (e) {
          console.error("Failed to parse analysis data:", e)
        }
      }

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          appointmentDate: appointmentDate.toISOString(),
          reason: notes || "Appointment with veterinary doctor",
          vetId: selectedVet,
          analysisId,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const parsed = await parseApiResponse<{ appointment?: Appointment; error?: unknown }>(
        response,
        "Failed to book appointment"
      )

      if (!response.ok) {
        throw new Error(parsed.errorMessage || "Failed to book appointment")
      }

      // Add new appointment to local state
      const result = parsed.data
      if (result && result.appointment) {
        setAppointments(prev =>
          result.appointment ? [...prev, result.appointment] : prev
        )
      }

      setBooked(true)
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "AbortError") {
          setError("Request timed out. Please try again.")
        } else {
          setError(err.message)
        }
      } else {
        setError("An error occurred")
      }
      console.error("Booking error:", err)
    } finally {
      clearTimeout(timeoutId)
      setLoading(false)
    }
  }, [selectedVet, selectedDate, selectedTime, notes])

  if (booked) {
    const selectedVetData = vets.find(v => v.id === selectedVet)
    return (
      <div className="mx-auto max-w-lg flex min-h-[60vh] items-center justify-center">
        <div className="rounded-2xl border border-border bg-card p-10 text-center animate-fade-in-up">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/10">
            <CheckCircle2 className="h-7 w-7 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Appointment Requested!</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Your appointment request with <span className="font-semibold text-foreground">{selectedVetData?.name || "the veterinarian"}</span> has been sent.
          </p>
          <div className="mt-6 rounded-xl bg-primary/5 border border-primary/10 p-4">
            <p className="text-sm text-primary font-medium">
              The veterinarian will review your request and send you a confirmation email once they approve the appointment.
            </p>
          </div>
          <div
            onClick={() => {
              setBooked(false)
              setSelectedVet(null)
              setSelectedDate(undefined)
              setSelectedTime(null)
              setNotes("")
            }}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 cursor-pointer"
          >
            Book Another
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Book a Veterinary Expert</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Connect with certified veterinary professionals for on-site consultations and treatment plans.
        </p>
      </div>

      {/* Vet selection */}
      <div className="mb-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Select a Veterinarian</h2>
        {loadingVets ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">Loading veterinarians...</p>
          </div>
        ) : vets.length === 0 ? (
          <div className="flex flex-col gap-2">
            <div
              className={`flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition-all ${
                selectedVet === 'avep'
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/30"
              }`}
              onClick={() => setSelectedVet('avep')}
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-lg text-base font-bold flex-shrink-0 ${
                selectedVet === 'avep'
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground border border-border"
              }`}>
                A
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-foreground">AVEP Co Ltd</div>
                <div className="text-xs text-muted-foreground">avep@avep.co.rw</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  <MapPin className="mr-1 inline h-3 w-3" />KN 5 Rd, Kigali
                </div>
              </div>
              <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors flex-shrink-0 ${
                selectedVet === 'avep'
                  ? "border-primary bg-primary"
                  : "border-border"
              }`}>
                {selectedVet === 'avep' && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {vets.map((vet) => (
              <div
                key={vet.id}
                onClick={() => setSelectedVet(vet.id)}
                className={`flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition-all ${
                  selectedVet === vet.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/30"
                }`}
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-lg text-base font-bold flex-shrink-0 ${
                  selectedVet === vet.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground border border-border"
                }`}>
                  {vet.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-foreground">{vet.name}</div>
                  <div className="text-xs text-muted-foreground">{vet.email}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    <MapPin className="mr-1 inline h-3 w-3" />
                    {vet.district || "District not listed"}
                  </div>
                </div>
                <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors flex-shrink-0 ${
                  selectedVet === vet.id
                    ? "border-primary bg-primary"
                    : "border-border"
                }`}>
                  {selectedVet === vet.id && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Date and Time slot selection */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar */}
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Select a Date</h2>
          <div className="flex justify-center p-4 rounded-xl border border-border bg-card">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => {
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                return date < today
              }}
              className="w-full"
            />
          </div>
        </div>

        {/* Time slots */}
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Select a Time</h2>
          {selectedDate ? (
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              {timeSlots.map((time) => {
                const isBooked = isTimeSlotBooked(time)
                return (
                  <div
                    key={time}
                    onClick={() => !isBooked && setSelectedTime(time)}
                    className={`flex items-center justify-center gap-2 rounded-lg p-3 text-sm font-medium transition-all ${
                      isBooked
                        ? "bg-red-500/10 text-muted-foreground border border-red-500/30 cursor-not-allowed opacity-60"
                        : selectedTime === time
                        ? "bg-primary text-primary-foreground cursor-pointer"
                        : "bg-card text-foreground border border-border hover:border-primary/30 cursor-pointer"
                    }`}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    {time}
                    {isBooked && <span className="text-xs ml-1">(Booked)</span>}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-secondary/50 p-8 text-center">
              <p className="text-sm text-muted-foreground">Select a date to see available times</p>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Additional Notes</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Describe symptoms, number of affected animals, or any other relevant details..."
          rows={4}
          className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/30 resize-none"
        />
      </div>

      {/* Booking info */}
      <div className="mb-6 rounded-xl bg-primary/5 border border-primary/10 p-4">
        <div className="flex items-start gap-2 text-sm text-primary font-medium">
          <CalendarCheck className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>Appointment includes: on-site visit, full diagnostics, treatment plan, and follow-up support.</span>
        </div>
      </div>

      {/* Submit */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}
      <div
        onClick={() => {
          if (selectedVet !== null && selectedDate !== undefined && selectedTime !== null && !loading) {
            handleBook()
          }
        }}
        className={`group flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 ${
          selectedVet === null || selectedDate === undefined || selectedTime === null || loading
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer"
        }`}
      >
        {loading ? "Booking..." : "Confirm Booking"}
        {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
      </div>
    </div>
  )
}
