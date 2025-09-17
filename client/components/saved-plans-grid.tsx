// Removed Card, Button, Badge, and lucide-react imports. Use standard HTML elements instead.
import { useNavigate } from "react-router-dom"

export type Itinerary = any

interface SavedPlansGridProps {
  itineraries: Itinerary[]
  onDelete?: (id: string) => void
  onToggleFavorite?: (id: string, current: boolean) => void
  onView?: (id: string) => void
  onShare?: (id: string) => void
  loading?: boolean
}

export function SavedPlansGrid({
  itineraries,
  onDelete,
  onToggleFavorite,
  onView,
  onShare,
  loading,
}: SavedPlansGridProps) {
  const navigate = useNavigate()

  const handleView = (id: string) => {
    if (onView) return onView(id)
    navigate(`/itinerary/${id}`)
  }

  const handleShare = (item: any) => {
    if (onShare) return onShare(item.id)
    const shareId = item.public_share_id || item.id
    const url = `${window.location.origin}/itinerary/${shareId}`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        // silent success
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-teal-800 text-balance">My Saved Plans</h1>
          <p className="text-gray-500 mt-1">{itineraries?.length ?? 0} saved itineraries</p>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-12 text-center">Loading saved plans...</div>
      ) : null}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {itineraries && itineraries.length > 0 ? (
          itineraries.map((plan) => (
            <div
              key={plan.id}
              className="group hover:shadow-lg transition-all duration-300 bg-white border border-gray-200 overflow-hidden rounded-lg"
            >
              <div className="relative">
                <img
                  src={plan.image || "/placeholder.svg"}
                  alt={plan.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <button
                    className={`bg-white/90 hover:bg-white rounded-full p-2 ${plan.isFavorite ? "text-red-500" : "text-gray-500"}`}
                    onClick={() => onToggleFavorite?.(plan.id, !!plan.isFavorite)}
                    title="Favorite"
                  >
                    <span style={{fontWeight: plan.isFavorite ? 'bold' : 'normal'}}>&#10084;</span>
                  </button>
                </div>
                <div className="absolute top-3 left-3">
                  <span className="bg-teal-600 text-white px-2 py-1 rounded text-xs">
                    {plan.type || plan.trip_type || plan.style}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 text-balance group-hover:text-teal-600 transition-colors">
                    {plan.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 text-pretty">{plan.description}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="w-4 h-4 mr-2 text-teal-600">📍</span>
                    {plan.destination}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="w-4 h-4 mr-2 text-teal-600">📅</span>
                    {plan.dates || `${plan.startDate} - ${plan.endDate}`}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="w-4 h-4 mr-2 text-teal-600">👥</span>
                    {plan.travelers} {plan.travelers === 1 ? "traveler" : "travelers"}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="border border-gray-300 rounded px-2 py-1 text-xs">
                    {plan.duration}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded p-2" onClick={() => handleView(plan.id)} title="View">
                      <span role="img" aria-label="View">👁️</span>
                    </button>
                    <button className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded p-2" onClick={() => handleShare(plan)} title="Share">
                      <span role="img" aria-label="Share">🔗</span>
                    </button>
                    <button
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded p-2"
                      onClick={() => onDelete?.(plan.id)}
                      title="Delete"
                    >
                      <span role="img" aria-label="Delete">🗑️</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : null}
      </div>

      {/* Empty State (if no plans) */}
      {!loading && (!itineraries || itineraries.length === 0) && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="w-12 h-12 text-gray-400 text-4xl">📍</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No saved plans yet</h3>
          <p className="text-gray-500 mb-6 text-pretty">
            Start planning your next adventure and save your itineraries here.
          </p>
          <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded flex items-center justify-center mx-auto">
            <span className="mr-2">➕</span>
            Create Your First Plan
          </button>
        </div>
      )}
    </div>
  )
}

export default SavedPlansGrid
