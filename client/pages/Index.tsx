import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Compass, History, Save, User } from "lucide-react";
import { GenerateItineraryResponse } from "../../shared/api";
import { HistorySidebar } from "../components/HistorySidebar";
import { ItineraryDisplay } from "../components/ItineraryDisplay";
import TripCustomizationForm from "../components/TripCustomizationForm";
import { TripFormData } from "../types/tripForm";
import { useAuth, useAuthenticatedFetch } from "../contexts/AuthContext";
import { toast } from "sonner";
import './Index.css';

export default function Index() {
  const { user, isAuthenticated, logout } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  const [showHistory, setShowHistory] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] =
    useState<GenerateItineraryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<TripFormData | null>(null);

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
        const errorMessage =
          errorResult?.error || `Server error (${response.status})`;
        setError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      const result: GenerateItineraryResponse = await response.json();

      if (result.success && result.itinerary) {
        setGeneratedItinerary(result);
        setHistoryKey(prevKey => prevKey + 1); // Triggers history refresh
      } else {
        if (result.error === "LLM_GENERATION_FAILED") {
          setError("The AI model is currently overloaded. Please try again in a few moments.");
          toast.error("The AI model is currently overloaded. Please try again in a few moments.");
        } else {
          setError(result.error || "Failed to generate itinerary");
          toast.error(result.error || "Failed to generate itinerary");
        }
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
    <div className="index-page-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <Compass className="sidebar-logo" />
          <h1 className="sidebar-title">TravelGenie</h1>
        </div>
        
        <div className="sidebar-content">
          <div className="trip-details-section">
            <h2 className="trip-details-title">Trip Details</h2>
            <div className="trip-details-info">
              <p>Destination: {formData?.destination || 'Not set'}</p>
              <p>Dates: {formData?.startDate ? `${formData.startDate} to ${formData.endDate}` : 'Not set'}</p>
              <p>Travelers: {formData?.travelers || 'Not set'}</p>
            </div>
          </div>
        </div>
        
        <div className="sidebar-footer">
          {isAuthenticated ? (
            <>
              <Link to="/saved-plans">
                <button className="sidebar-btn">
                  <Save className="h-5 w-5" />
                  <span>Saved Plans</span>
                </button>
              </Link>
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="sidebar-btn"
              >
                <History className="h-5 w-5" />
                <span>History</span>
              </button>
              <button 
                onClick={logout}
                className="sidebar-btn"
              >
                <User className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="sidebar-btn">Login</button>
              </Link>
              <Link to="/signup">
                <button className="sidebar-btn">Sign Up</button>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="main-content">
        <div className="main-content-container">
          <div className="main-header">
            <h1 className="main-title">Customize Your Trip</h1>
            <p className="main-subtitle">We'll generate your perfect itinerary based on your preferences</p>
          </div>
          
          <div className="form-container">
            <TripCustomizationForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
          
          {error && (
            <div className="error-message-container">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="preview-panel">
        <h2 className="preview-title">Quick Preview</h2>
        <div className="preview-section">
          <div className="preview-item">
            <h3>Destination</h3>
            <p>{formData?.destination || 'Not selected yet'}</p>
          </div>
          <div className="preview-item">
            <h3>Style</h3>
            <p>{formData?.style || 'Not selected yet'}</p>
          </div>
          <div className="preview-item">
            <h3>Budget</h3>
            <p>{formData?.budget || 'Not selected yet'}</p>
          </div>
          <div className="preview-item">
            <h3>Pace</h3>
            <p>{formData?.pace || 'Not selected yet'}</p>
          </div>
        </div>
        
        <div className="generate-btn-container">
          <button 
            className="generate-btn"
            onClick={() => handleSubmit(formData || {} as TripFormData)}
            disabled={!formData?.destination || isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate Itinerary'}
          </button>
        </div>
      </div>

      {isAuthenticated && showHistory && (
        <div className="history-overlay">
          <div className="history-overlay-backdrop" onClick={() => setShowHistory(false)}></div>
          <HistorySidebar key={historyKey} onHistoryItemClick={handleHistoryItemClick} />
        </div>
      )}
    </div>
  );
}