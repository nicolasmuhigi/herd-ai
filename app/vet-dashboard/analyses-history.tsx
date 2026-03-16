"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const FILTERS = [
  { label: "Name", value: "name" },
  { label: "Disease", value: "disease" },
  { label: "District", value: "district" },
  { label: "All", value: "all" },
]

interface AnalysisWithUser {
  id: string
  imageUrl: string
  detectedDisease: string
  confidence: number
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    district?: string
  }
}

export default function AnalysesHistorySection() {
  const [analyses, setAnalyses] = useState<AnalysisWithUser[]>([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const token = localStorage.getItem("authToken")
        const response = await fetch("/api/analyses", {
          headers: { "Authorization": `Bearer ${token}` },
        })
        if (response.ok) {
          const data = await response.json()
          setAnalyses(data.analyses || [])
        } else {
          setError("Failed to load analyses history")
        }
      } catch (err) {
        setError("Failed to load analyses history")
      } finally {
        setLoading(false)
      }
    }
    fetchAnalyses()
  }, [])

  const filtered = analyses.filter(a => {
    const q = search.toLowerCase()
    if (!q) return true
    if (filter === "name") {
      return a.user.name.toLowerCase().includes(q)
    } else if (filter === "disease") {
      return a.detectedDisease.toLowerCase().includes(q)
    } else if (filter === "district") {
      return (a.user.district?.toLowerCase().includes(q) ?? false)
    } else {
      return (
        a.user.name.toLowerCase().includes(q) ||
        a.user.email.toLowerCase().includes(q) ||
        (a.user.district?.toLowerCase().includes(q) ?? false) ||
        a.detectedDisease.toLowerCase().includes(q)
      )
    }
  })

  if (loading) return <div className="py-8 text-center text-muted-foreground">Loading analysis history...</div>
  if (error) return <div className="py-8 text-center text-red-600">{error}</div>
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="border rounded px-2 py-1 text-sm bg-background"
        >
          {FILTERS.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
        <Input
          placeholder={
            filter === "name"
              ? "Search by name..."
              : filter === "disease"
              ? "Search by disease..."
              : filter === "district"
              ? "Search by district..."
              : "Search by name, email, district, or disease..."
          }
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>
      {filtered.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">No analyses found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(a => (
            <Card key={a.id} className="p-4 flex flex-col gap-2">
              <div className="font-semibold text-foreground">{a.user.name}</div>
              <div className="text-xs text-muted-foreground">{a.user.email}</div>
              {a.user.district && <div className="text-xs text-muted-foreground">District: {a.user.district}</div>}
              <div className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</div>
              <div className="font-medium">Disease: <span className="text-primary">{a.detectedDisease}</span></div>
              <div className="text-xs">Confidence: {(a.confidence * 100).toFixed(1)}%</div>
              {a.imageUrl && (
                <img src={resolveAnalysisImageUrl(a.imageUrl)} alt="Analysis" className="w-full h-32 object-cover rounded border" />
              )}

// Image URL normalization function (same as results page)
function resolveAnalysisImageUrl(imageUrl?: string | null): string | null {
  if (!imageUrl) return null;
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
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
