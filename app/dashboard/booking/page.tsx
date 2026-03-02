"use client"

import { useState, useCallback } from "react"
import { CalendarCheck, CheckCircle2, Clock, MapPin, Star, ArrowRight } from "lucide-react"

const vets = [
  {
    name: "Dr. Sarah Mitchell",
    specialty: "Large Animal Specialist",
    rating: 4.9,
    reviews: 127,
    location: "Within 30 miles",
    initial: "S",
  },
  {
    name: "Dr. James Okonkwo",
    specialty: "Livestock Disease Expert",
    rating: 4.8,
    reviews: 94,
    location: "Within 15 miles",
    initial: "J",
  },
  {
    name: "Dr. Maria Chen",
    specialty: "Bovine Health Specialist",
    rating: 4.7,
    reviews: 83,
    location: "Within 50 miles",
    initial: "M",
  },
]

const timeSlots = [
  "Mon 9:00 AM",
  "Mon 2:00 PM",
  "Tue 10:00 AM",
  "Tue 3:00 PM",
  "Wed 9:00 AM",
  "Wed 1:00 PM",
  "Thu 11:00 AM",
  "Thu 4:00 PM",
  "Fri 10:00 AM",
]

export default function BookingPage() {
  const [selectedVet, setSelectedVet] = useState<number | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [booked, setBooked] = useState(false)
  const [notes, setNotes] = useState("")

  const handleBook = useCallback(() => {
    if (selectedVet !== null && selectedSlot !== null) {
      setBooked(true)
    }
  }, [selectedVet, selectedSlot])

  if (booked) {
    return (
      <div className="mx-auto max-w-lg flex min-h-[60vh] items-center justify-center">
        <div className="rounded-3xl bg-card border border-border/50 p-10 text-center shadow-xl shadow-primary/5 animate-fade-in-up">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Appointment Booked!</h2>
          <p className="mt-3 text-base text-muted-foreground">
            Your appointment with <span className="font-semibold text-foreground">{vets[selectedVet!].name}</span> has been
            confirmed for <span className="font-semibold text-foreground">{timeSlots[selectedSlot!]}</span>.
          </p>
          <div className="mt-6 rounded-2xl bg-primary/5 border border-primary/10 p-4">
            <p className="text-sm text-primary font-medium">
              A confirmation email has been sent. The vet will also receive your latest analysis results for review.
            </p>
          </div>
          <button
            onClick={() => {
              setBooked(false)
              setSelectedVet(null)
              setSelectedSlot(null)
              setNotes("")
            }}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:-translate-y-0.5"
          >
            Book Another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground lg:text-3xl">Book a Veterinary Expert</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Connect with certified veterinary professionals for on-site consultations and treatment plans.
        </p>
      </div>

      {/* Vet selection */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-bold text-foreground">Select a Veterinarian</h2>
        <div className="flex flex-col gap-3">
          {vets.map((vet, i) => (
            <button
              key={vet.name}
              onClick={() => setSelectedVet(i)}
              className={`flex items-center gap-4 rounded-2xl border p-5 text-left transition-all ${
                selectedVet === i
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                  : "border-border/50 bg-card hover:border-primary/30 hover:bg-primary/5"
              }`}
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold ${
                selectedVet === i
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/30 text-primary"
              }`}>
                {vet.initial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-base font-bold text-foreground">{vet.name}</div>
                <div className="text-sm text-muted-foreground">{vet.specialty}</div>
                <div className="mt-1.5 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-foreground">{vet.rating}</span>
                    ({vet.reviews})
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {vet.location}
                  </span>
                </div>
              </div>
              <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
                selectedVet === i
                  ? "border-primary bg-primary"
                  : "border-border"
              }`}>
                {selectedVet === i && <CheckCircle2 className="h-4 w-4 text-primary-foreground" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Time slot selection */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-bold text-foreground">Choose a Time Slot</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {timeSlots.map((slot, i) => (
            <button
              key={slot}
              onClick={() => setSelectedSlot(i)}
              className={`flex items-center justify-center gap-2 rounded-xl p-3.5 text-sm font-semibold transition-all ${
                selectedSlot === i
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-card text-foreground border border-border/50 hover:border-primary/30 hover:bg-primary/5"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              {slot}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-bold text-foreground">Additional Notes</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Describe symptoms, number of affected animals, or any other relevant details..."
          rows={4}
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
        />
      </div>

      {/* Booking info */}
      <div className="mb-6 rounded-2xl bg-primary/5 border border-primary/10 p-4">
        <div className="flex items-start gap-2 text-sm text-primary font-medium">
          <CalendarCheck className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>Appointment includes: on-site visit, full diagnostics, treatment plan, and follow-up support. Your analysis results will be shared with the veterinarian.</span>
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleBook}
        disabled={selectedVet === null || selectedSlot === null}
        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
      >
        Confirm Booking
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  )
}
