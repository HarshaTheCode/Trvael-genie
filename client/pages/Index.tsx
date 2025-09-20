import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth, useAuthenticatedFetch } from "../contexts/AuthContext";
import { GenerateItineraryResponse, ItineraryResponse } from "../../shared/api";
import { ItineraryDisplay } from "../components/ItineraryDisplay";
import TripCustomizationForm from "../components/TripCustomizationForm";
import { TripFormData } from "../types/tripForm";
import "./Index.css";

const PlusIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const StarIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;

interface HistoryItem {
  id: string;
  itinerary_data: ItineraryResponse;
  created_at: string;
}

export default function Index() {
  const { isAuthenticated } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyKey, setHistoryKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] = useState<GenerateItineraryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<TripFormData | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!isAuthenticated) return;
      try {
        const response = await authenticatedFetch('/api/history');
        const data = await response.json();
        if (data.success) {
          setHistory(data.history);
        } else {
          toast.error('Failed to load history');
        }
      } catch (error) {
        toast.error('Failed to load history');
      }
    };

    fetchHistory();
  }, [authenticatedFetch, isAuthenticated, historyKey]);

  const handleHistoryItemClick = (itinerary: GenerateItineraryResponse) => {
    setGeneratedItinerary(itinerary);
  };

  const handleSubmit = async (data: TripFormData) => {
    setFormData(data);
    setIsLoading(true);
    setError(null);

    try {
      const response = await authenticatedFetch("/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorResult = await response.json().catch(() => null);
        const errorMessage = errorResult?.error || `Server error (${response.status})`;
        setError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      const result: GenerateItineraryResponse = await response.json();

      if (result.success && result.itinerary) {
        setGeneratedItinerary(result);
        setHistoryKey(prevKey => prevKey + 1);
      } else {
        setError(result.error || "Failed to generate itinerary");
        toast.error(result.error || "Failed to generate itinerary");
      }
    } catch (err) {
      console.error("Request failed:", err);
      setError("Network error. Please check your connection and try again.");
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (generatedItinerary?.itinerary) {
    return (
      <ItineraryDisplay
        itinerary={generatedItinerary}
        originalRequest={formData!}
        onEdit={() => setGeneratedItinerary(null)}
        onRegenerate={(newRequest) => {
          setFormData(newRequest);
          handleSubmit(newRequest);
        }}
      />
    );
  }

  return (
    <div className="index-page">
      <aside className="left-sidebar">
        <div className="sidebar-header"><div className="logo-icon">🗺️</div><span className="logo-text">TravelGenie</span></div>
        <div className="sidebar-content">
          <nav className="sidebar-nav">
            <Link to="/index" className="nav-link active"><PlusIcon /> New Trip</Link>
            <Link to="/saved-plans" className="nav-link"><StarIcon /> My Saved Plans</Link>
          </nav>
          <div className="history-section">
            <h3>History</h3>
            <div className="history-list">
              {history.map((item) => (
                <div key={item.id} className="history-item" onClick={() => handleHistoryItemClick({ success: true, itinerary: item.itinerary_data, itineraryId: item.id })}>
                  <span>{item.itinerary_data.title || item.itinerary_data.meta.destination || 'Unknown Trip'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="sidebar-footer">
          <button className="generate-button" type="submit" form="trip-customization-form" disabled={isLoading}>
            {isLoading ? "Generating..." : "Generate Itinerary"}
          </button>
        </div>
      </aside>
      <main className="main-content">
        <div className="main-content-inner">
          <h1 className="main-title">Customize Your Trip</h1>
          <p className="main-subtitle">Tell us about your dream trip. Fill in the details below to generate a personalized itinerary.</p>
          <div className="form-wrapper">
            <TripCustomizationForm
              id="trip-customization-form"
              onSubmit={handleSubmit}
              isLoading={isLoading}
              initialData={formData || undefined}
            />
          </div>
        </div>
      </main>
    </div>
  );
}