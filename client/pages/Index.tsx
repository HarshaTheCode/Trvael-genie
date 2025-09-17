import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// Button removed: replaced with native <button>
import { Compass, Loader2 } from "lucide-react";
import { GenerateItineraryResponse } from "@shared/api";
import { HistorySidebar } from "@/components/HistorySidebar";
import { ItineraryDisplay } from "@/components/ItineraryDisplay";
import TripCustomizationForm from "@/components/TripCustomizationForm";
import { TripFormData } from "@/types/tripForm";
import { useAuth, useAuthenticatedFetch } from "@/contexts/AuthContext";
import { toast } from "sonner";

const galleryImages = [
  "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  
];

export default function Index() {
  const { user, isAuthenticated, logout } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  const [showHistory, setShowHistory] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);
  const [currentImage, setCurrentImage] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] =
    useState<GenerateItineraryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<TripFormData | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % galleryImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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
        originalRequest={formData}
        onEdit={() => setGeneratedItinerary(null)}
        onRegenerate={(newRequest) => {
          setFormData(newRequest);
          handleSubmit(newRequest);
        }}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex-grow">
        <header className="absolute top-0 left-0 right-0 z-10 bg-white/95 border-b border-teal-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Compass className="h-8 w-8 text-teal-600" />
              <h1 className="text-2xl font-bold text-teal-700">TravelGenie</h1>
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <button className="text-teal-700 hover:bg-teal-50 px-4 py-2 rounded transition" onClick={() => setShowHistory(!showHistory)}>
                    🕑 History
                  </button>
                  <Link to="/saved-plans">
                    <button className="text-teal-700 hover:bg-teal-50 px-4 py-2 rounded transition">
                      💾 Saved Plans
                    </button>
                  </Link>
                  <button className="text-teal-700 hover:bg-teal-50 px-4 py-2 rounded transition" onClick={logout}>
                    🚪 Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <button className="text-teal-700 hover:bg-teal-50 px-4 py-2 rounded transition">🔑 Login</button>
                  </Link>
                  <Link to="/signup">
                    <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded transition">📝 Sign Up</button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        <main
          className="min-h-screen flex flex-col justify-center items-center bg-white"
        >
          <div className="w-full max-w-4xl py-24">
            <div className="text-center p-4">
              <h1 className="text-5xl font-extrabold mb-4 text-teal-800">Your AI Travel Planner for India</h1>
              <p className="text-xl max-w-2xl mx-auto text-teal-600">Craft your dream itinerary in seconds. Just fill in the details below.</p>
            </div>
            <div className="bg-white border border-teal-100 rounded-xl shadow-lg p-8 mt-8">
              <TripCustomizationForm onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
          </div>
        </main>

        <footer className="bg-white border-t border-teal-100 py-8">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-teal-600">&copy; 2025 TravelGenie. All rights reserved.</p>
          </div>
        </footer>
      </div>
      {isAuthenticated && showHistory && <HistorySidebar key={historyKey} onHistoryItemClick={handleHistoryItemClick} />}
    </div>
  );
}
