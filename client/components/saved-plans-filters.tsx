import React from "react";
import { Filter, Calendar, MapPin, ChevronDown } from "lucide-react";

interface SavedPlansFiltersProps {
  onFilterChange?: (filters: { 
    from?: string; 
    to?: string; 
    destination?: string; 
    tripType?: string; 
    duration?: string 
  }) => void;
}

export function SavedPlansFilters({ onFilterChange }: SavedPlansFiltersProps) {
  const [filters, setFilters] = React.useState({
    from: "",
    to: "",
    destination: "",
    tripType: "",
    duration: "",
  });

  const handleApply = () => {
    onFilterChange?.(filters);
  };

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <style>
        {`
          .filters-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            padding: 24px;
            height: fit-content;
            min-width: 300px;
          }
          
          .filters-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 24px;
            font-size: 18px;
            font-weight: 600;
            color: #111827;
          }
          
          .filter-icon {
            width: 20px;
            height: 20px;
            color: #0891b2;
          }
          
          .filter-group {
            margin-bottom: 20px;
          }
          
          .filter-label {
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: 500;
            color: #374151;
          }
          
          .date-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }
          
          .input-wrapper {
            position: relative;
          }
          
          .filter-input {
            width: 100%;
            padding: 10px 12px 10px 36px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
          }
          
          .filter-input:focus {
            border-color: #0891b2;
            box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1);
          }
          
          .input-icon {
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            width: 16px;
            height: 16px;
            color: #6b7280;
          }
          
          .select-wrapper {
            position: relative;
          }
          
          .filter-select {
            width: 100%;
            padding: 10px 36px 10px 12px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 14px;
            outline: none;
            background: white;
            appearance: none;
            cursor: pointer;
            transition: border-color 0.2s;
          }
          
          .filter-select:focus {
            border-color: #0891b2;
            box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1);
          }
          
          .select-icon {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            width: 16px;
            height: 16px;
            color: #6b7280;
            pointer-events: none;
          }
          
          .apply-btn {
            width: 100%;
            background: #0891b2;
            color: white;
            border: none;
            padding: 12px;
            border-radius: 8px;
            font-weight: 500;
            font-size: 14px;
            cursor: pointer;
            transition: background-color 0.2s;
            margin-top: 4px;
          }
          
          .apply-btn:hover {
            background: #0e7490;
          }
        `}
      </style>
      
      <div className="filters-container">
        <div className="filters-header">
          <Filter className="filter-icon" />
          Filter Plans
        </div>

        <div className="filter-group">
          <label className="filter-label">Date Range</label>
          <div className="date-row">
            <div className="input-wrapper">
              <Calendar className="input-icon" />
              <input
                type="date"
                className="filter-input"
                placeholder="dd-mm-yyyy"
                value={filters.from}
                onChange={(e) => updateFilter("from", e.target.value)}
              />
            </div>
            <div className="input-wrapper">
              <Calendar className="input-icon" />
              <input
                type="date"
                className="filter-input"
                placeholder="dd-mm-yyyy"
                value={filters.to}
                onChange={(e) => updateFilter("to", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label">Destination</label>
          <div className="input-wrapper">
            <MapPin className="input-icon" />
            <input
              type="text"
              placeholder="Search destinations..."
              className="filter-input"
              value={filters.destination}
              onChange={(e) => updateFilter("destination", e.target.value)}
            />
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label">Trip Type</label>
          <div className="select-wrapper">
            <select 
              className="filter-select"
              value={filters.tripType}
              onChange={(e) => updateFilter("tripType", e.target.value)}
            >
              <option value="">All Types</option>
              <option value="leisure">Leisure</option>
              <option value="business">Business</option>
              <option value="adventure">Adventure</option>
              <option value="cultural">Cultural</option>
            </select>
            <ChevronDown className="select-icon" />
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label">Duration</label>
          <div className="select-wrapper">
            <select 
              className="filter-select"
              value={filters.duration}
              onChange={(e) => updateFilter("duration", e.target.value)}
            >
              <option value="">Any Duration</option>
              <option value="1-3">1-3 Days</option>
              <option value="4-7">4-7 Days</option>
              <option value="8-14">1-2 Weeks</option>
              <option value="15+">2+ Weeks</option>
            </select>
            <ChevronDown className="select-icon" />
          </div>
        </div>

        <button className="apply-btn" onClick={handleApply}>
          Apply Filters
        </button>
      </div>
    </>
  );
}