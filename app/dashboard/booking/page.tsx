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
        <div className="rounded-2xl border border-border bg-card p-10 text-center animate-fade-in-up">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/10">
            <CheckCircle2 className="h-7 w-7 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Appointment Booked!</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Your appointment with <span className="font-semibold text-foreground">{vets[selectedVet!].name}</span> has been
            confirmed for <span className="font-semibold text-foreground">{timeSlots[selectedSlot!]}</span>.
          </p>
          <div className="mt-6 rounded-xl bg-primary/5 border border-primary/10 p-4">
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
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
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
        <p className="mt-2 text-sm text-muted-foreground">
          Connect with certified veterinary professionals for on-site consultations and treatment plans.
        </p>
      </div>

      {/* Vet selection */}
      <div className="mb-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Select a Veterinarian</h2>
        <div className="flex flex-col gap-2">
          {vets.map((vet, i) => (
            <button
              key={vet.name}
              onClick={() => setSelectedVet(i)}
              className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                selectedVet === i
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-lg text-base font-bold ${
                selectedVet === i
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground border border-border"
              }`}>
                {vet.initial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-foreground">{vet.name}</div>
                <div className="text-xs text-muted-foreground">{vet.specialty}</div>
                <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
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
              <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                selectedVet === i
                  ? "border-primary bg-primary"
                  : "border-border"
              }`}>
                {selectedVet === i && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Time slot selection */}
      <div className="mb-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Choose a Time Slot</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {timeSlots.map((slot, i) => (
            <button
              key={slot}
              onClick={() => setSelectedSlot(i)}
              className={`flex items-center justify-center gap-2 rounded-lg p-3 text-sm font-medium transition-all ${
                selectedSlot === i
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground border border-border hover:border-primary/30"
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
      <button
        onClick={handleBook}
        disabled={selectedVet === null || selectedSlot === null}
        className="group flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Confirm Booking
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  )
}
