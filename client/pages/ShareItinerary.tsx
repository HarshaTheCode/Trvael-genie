import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
// Removed all shadcn/ui and lucide-react imports. Use standard HTML elements and emojis instead.
import { ItineraryResponse } from "@shared/api";
import { toast } from "sonner";

interface SharedItinerary {
  title: string;
  itineraryData: ItineraryResponse;
  originalRequest: {
    destination: string;
    startDate: string;
    endDate: string;
    travelers: string;
    budget: string;
    style: string;
  };
  createdAt: string;
}

export default function ShareItinerary() {
  const { shareId } = useParams<{ shareId: string }>();
  const [itinerary, setItinerary] = useState<SharedItinerary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shareId) {
      fetchSharedItinerary(shareId);
    }
  }, [shareId]);

  const fetchSharedItinerary = async (id: string) => {
    try {
      const response = await fetch(`/api/public/itinerary/${id}`);
      const data = await response.json();

      if (data.success) {
        setItinerary(data.itinerary);
      } else {
        setError(data.message || "Shared itinerary not found");
      }
    } catch (err) {
      setError("Failed to load shared itinerary");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleDownloadPDF = () => {
    if (shareId) {
      // In a real implementation, this would generate PDF from the shared itinerary
      toast.info("PDF download would be available for saved itineraries");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <span className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-4 text-3xl">⏳</span>
          <p className="text-gray-600">Loading shared itinerary...</p>
        </div>
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Itinerary Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              {error ||
                "This shared itinerary may have been removed or the link is invalid."}
            </p>
            <Link to="/index">
              <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded flex items-center justify-center mx-auto">
                <span className="mr-2">🧭</span>
                Create Your Own Itinerary
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/index" className="flex items-center gap-2">
              <span className="h-8 w-8 text-teal-600 text-2xl">🧭</span>
              <h1 className="text-2xl font-bold text-gray-900">TravelGenie</h1>
            </Link>

            <div className="flex items-center gap-2">
              <span className="bg-teal-50 text-teal-700 border border-teal-200 rounded px-2 py-1 text-xs flex items-center">
                <span className="mr-1">🔗</span>
                Shared Itinerary
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {itinerary.title}
            </h1>
            <p className="text-gray-600">
              {itinerary.originalRequest.destination} •{" "}
              {itinerary.originalRequest.startDate} to{" "}
              {itinerary.originalRequest.endDate}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Shared on {new Date(itinerary.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={handleShare} className="border rounded px-3 py-1 text-sm flex items-center mr-2">
              <span className="mr-2">🔗</span>
              Copy Link
            </button>

            <Link to="/index">
              <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded flex items-center">
                <span className="mr-2">🌐</span>
                Create My Own
              </button>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main itinerary content */}
          <div className="lg:col-span-2 space-y-6">
            {itinerary.itineraryData.days.map((day) => (
              <div key={day.day} className="border-l-4 border-l-teal-500 bg-white rounded-lg mb-6">
                <div className="flex items-center gap-2 px-4 py-2 border-b">
                  <span className="text-teal-600">📅</span>
                  <span className="font-bold">Day {day.day} - {day.date}</span>
                </div>
                <div className="p-4 space-y-4">
                  {day.segments.map((segment, idx) => (
                    <div
                      key={idx}
                      className="border-l-2 border-gray-200 pl-4 pb-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-teal-600">
                              {segment.time}
                            </span>
                            <span className="text-sm text-gray-500">
                              ({segment.duration_min} min)
                            </span>
                          </div>
                          <h4 className="font-semibold text-gray-900">
                            {segment.place}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {segment.note}
                          </p>
                          {segment.food && (
                            <p className="text-sm text-green-600 mt-1">
                              🍽️ {segment.food}
                            </p>
                          )}
                          {segment.transport_min_to_next > 0 && (
                            <p className="text-xs text-gray-500 mt-2">
                              🚗 {segment.transport_min_to_next} min to next
                              location
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="bg-teal-50 rounded-lg p-3 mt-4">
                    <p className="text-sm font-medium text-teal-800">
                      💡 Daily Tip
                    </p>
                    <p className="text-sm text-teal-700">{day.daily_tip}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Call to action */}
            <div className="bg-gradient-to-r from-orange-50 to-rose-50 border-orange-200 rounded-lg text-center py-8 mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Love this itinerary?
              </h3>
              <p className="text-gray-600 mb-4">
                Create your own personalized travel plans with TravelGenie's
                AI-powered planner
              </p>
              <Link to="/index">
                <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded flex items-center justify-center mx-auto">
                  <span className="mr-2">🧭</span>
                  Plan My Trip
                </button>
              </Link>
            </div>
          </div>

          {/* Sidebar with trip details */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-600">💰</span>
                <span className="font-bold">Budget Estimate</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Budget Range:</span>
                  <span className="font-medium">
                    ₹
                    {itinerary.itineraryData.budget_estimate.low.toLocaleString()} {" "}
                    - ₹
                    {itinerary.itineraryData.budget_estimate.high.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Median Estimate:</span>
                  <span className="font-medium text-green-600">
                    ₹
                    {itinerary.itineraryData.budget_estimate.median.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Estimates may vary based on season and personal preferences
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <div className="font-bold mb-2">Trip Details</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Travelers:</span>
                  <span className="font-medium">
                    {itinerary.originalRequest.travelers}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Style:</span>
                  <span className="font-medium capitalize">
                    {itinerary.originalRequest.style}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Budget:</span>
                  <span className="font-medium capitalize">
                    {itinerary.originalRequest.budget}
                  </span>
                </div>
              </div>
            </div>

            {itinerary.itineraryData.source_facts &&
              itinerary.itineraryData.source_facts.length > 0 && (
                <div className="bg-white rounded-lg p-4">
                  <div className="font-bold mb-2 text-sm">Useful Information</div>
                  <ul className="space-y-1 text-xs text-gray-600">
                    {itinerary.itineraryData.source_facts.map((fact, idx) => (
                      <li key={idx}>• {fact}</li>
                    ))}
                  </ul>
                </div>
              )}

            {/* TravelGenie Promotion */}
            <div className="bg-gradient-to-br from-orange-100 to-rose-100 border-orange-200 rounded-lg text-center py-6 mt-6">
              <span className="h-8 w-8 text-orange-600 mx-auto mb-3 text-2xl block">🧭</span>
              <h3 className="font-bold text-gray-900 mb-2">
                Powered by TravelGenie
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                AI-powered travel planning for incredible India
              </p>
              <Link to="/index">
                <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded flex items-center justify-center mx-auto">
                  Start Planning
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
