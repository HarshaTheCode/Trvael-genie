
import React from "react"

interface SavedPlansFiltersProps {
  onFilterChange?: (filters: { from?: string; to?: string; destination?: string; tripType?: string; duration?: string }) => void
}

export function SavedPlansFilters({ onFilterChange }: SavedPlansFiltersProps) {
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [destination, setDestination] = React.useState("");
  const [tripType, setTripType] = React.useState("");
  const [duration, setDuration] = React.useState("");

  const handleApply = () => {
    onFilterChange?.({ from, to, destination, tripType, duration });
  };

  return (
    <div style={{ background: 'white', border: '1px solid #b2f5ea', boxShadow: '0 1px 4px #0001', borderRadius: 8, padding: 16, maxWidth: 400, margin: '0 auto' }}>
      <div style={{ fontWeight: 600, color: '#134e4a', display: 'flex', alignItems: 'center', fontSize: 20, marginBottom: 12 }}>
        <span role="img" aria-label="Filter" style={{ marginRight: 8 }}>🔎</span> Filter Plans
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Date Range */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 14, fontWeight: 500, color: '#334155' }}>Date Range</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} role="img" aria-label="Calendar">📅</span>
              <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ paddingLeft: 32, background: 'white', border: '1px solid #cbd5e1', borderRadius: 4, height: 32, width: '100%' }} placeholder="From" />
            </div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} role="img" aria-label="Calendar">📅</span>
              <input type="date" value={to} onChange={e => setTo(e.target.value)} style={{ paddingLeft: 32, background: 'white', border: '1px solid #cbd5e1', borderRadius: 4, height: 32, width: '100%' }} placeholder="To" />
            </div>
          </div>
        </div>

        {/* Destination */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 14, fontWeight: 500, color: '#334155' }}>Destination</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} role="img" aria-label="Map Pin">📍</span>
            <input placeholder="Search destinations..." value={destination} onChange={e => setDestination(e.target.value)} style={{ paddingLeft: 32, background: 'white', border: '1px solid #cbd5e1', borderRadius: 4, height: 32, width: '100%' }} />
          </div>
        </div>

        {/* Trip Type */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 14, fontWeight: 500, color: '#334155' }}>Trip Type</label>
          <select value={tripType} onChange={e => setTripType(e.target.value)} style={{ background: 'white', border: '1px solid #cbd5e1', borderRadius: 4, height: 32, width: '100%' }}>
            <option value="all">All Types</option>
            <option value="leisure">Leisure</option>
            <option value="business">Business</option>
            <option value="adventure">Adventure</option>
            <option value="cultural">Cultural</option>
          </select>
        </div>

        {/* Duration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 14, fontWeight: 500, color: '#334155' }}>Duration</label>
          <select value={duration} onChange={e => setDuration(e.target.value)} style={{ background: 'white', border: '1px solid #cbd5e1', borderRadius: 4, height: 32, width: '100%' }}>
            <option value="all">Any Duration</option>
            <option value="1-3">1-3 Days</option>
            <option value="4-7">4-7 Days</option>
            <option value="8-14">1-2 Weeks</option>
            <option value="15+">2+ Weeks</option>
          </select>
        </div>

      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
        <button style={{ width: '100%', background: '#0d9488', color: 'white', border: 'none', borderRadius: 4, padding: '10px 0', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={handleApply}>
          <span role="img" aria-label="Filter" style={{ marginRight: 8 }}>🔎</span> Filter
        </button>
      </div>
    </div>
  )
}

export default SavedPlansFilters
