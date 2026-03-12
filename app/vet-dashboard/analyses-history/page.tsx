import dynamic from "next/dynamic"

const AnalysesHistorySection = dynamic(() => import("./../analyses-history"), { ssr: false })

export default function AnalysesHistoryPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-foreground">All Analyses History</h1>
      <AnalysesHistorySection />
    </div>
  )
}
