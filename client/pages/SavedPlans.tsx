import { SavedPlansHeader } from "../components/saved-plans-header"
import { SavedPlansGrid } from "../components/saved-plans-grid"
import { SavedPlansFilters } from "../components/saved-plans-filters"
import { useAuth, useAuthenticatedFetch, withAuth } from "../contexts/AuthContext"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

function SavedPlansPageInner() {
  const { user, logout } = useAuth()
  const authenticatedFetch = useAuthenticatedFetch()
  const [itineraries, setItineraries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<any>({})
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    const fetchItineraries = async () => {
      try {
        const res = await authenticatedFetch('/api/itineraries')
        const data = await res.json().catch(() => null)
        if (!mounted) return
        if (data?.success && Array.isArray(data.itineraries)) {
          setItineraries(data.itineraries)
        } else if (Array.isArray(data)) {
          setItineraries(data)
        }
      } catch (err) {
        console.error('Failed to fetch itineraries', err)
        toast.error?.('Could not load saved plans')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchItineraries()
    return () => {
      mounted = false
    }
  }, [authenticatedFetch])

  const handleDelete = async (id: string) => {
    try {
      const res = await authenticatedFetch(`/api/itineraries/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setItineraries((prev) => prev.filter((it) => it.id !== id))
      toast.success?.('Plan deleted')
    } catch (err) {
      console.error(err)
      toast.error?.('Could not delete plan')
    }
  }

  const handleToggleFavorite = async (id: string, current: boolean) => {
    try {
      const res = await authenticatedFetch(`/api/itineraries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorite: !current }),
      })
      if (!res.ok) throw new Error('Update failed')
      setItineraries((prev) => prev.map((it) => (it.id === id ? { ...it, favorite: !current } : it)))
      toast.success?.('Updated favorite')
    } catch (err) {
      console.error(err)
      toast.error?.('Could not update favorite')
    }
  }

  const handleView = (id: string) => {
    navigate(`/itinerary/${id}`)
  }

  const handleShare = async (id: string) => {
    try {
      const url = `${window.location.origin}/itinerary/${id}`
      await navigator.clipboard.writeText(url)
      toast.success?.('Link copied to clipboard')
    } catch (err) {
      console.error(err)
      toast.error?.('Could not copy link')
    }
  }

  const onSearch = (q: string) => setSearch(q)
  const onFiltersChange = (f: any) => setFilters(f)

  const filtered = itineraries.filter((it) => {
    // Search filter
    if (search) {
      const q = search.toLowerCase();
      if (!((it.title || '').toLowerCase().includes(q) || (it.destination || '').toLowerCase().includes(q))) {
        return false;
      }
    }
    // Date filters (support both startDate/endDate and start_date/end_date)
    const start = it.startDate || it.start_date;
    const end = it.endDate || it.end_date;
    if (filters.from && start && start < filters.from) return false;
    if (filters.to && end && end > filters.to) return false;
    // Destination filter
    if (filters.destination && it.destination && !it.destination.toLowerCase().includes(filters.destination.toLowerCase())) return false;
    // Trip type filter (support trip_type, type, style)
    const tripType = it.trip_type || it.type || it.style;
    if (filters.tripType && filters.tripType !== 'all' && tripType && tripType !== filters.tripType) return false;
    // Duration filter (support duration as string or number, and match ranges)
    if (filters.duration && filters.duration !== 'all') {
      const dur = Number(it.duration) || 0;
      if (filters.duration === '1-3' && !(dur >= 1 && dur <= 3)) return false;
      if (filters.duration === '4-7' && !(dur >= 4 && dur <= 7)) return false;
      if (filters.duration === '8-14' && !(dur >= 8 && dur <= 14)) return false;
      if (filters.duration === '15+' && !(dur >= 15)) return false;
    }
    return true;
  })

  return (
    <div className="min-h-screen bg-white">
      <SavedPlansHeader userEmail={user?.email} onSignOut={logout} onSearch={onSearch} />
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-80">
            <SavedPlansFilters onFilterChange={onFiltersChange} />
          </aside>
          <div className="flex-1">
            <SavedPlansGrid
              itineraries={filtered}
              loading={loading}
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFavorite}
              onView={handleView}
              onShare={handleShare}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

const SavedPlansPage = withAuth(SavedPlansPageInner);
export default SavedPlansPage;
