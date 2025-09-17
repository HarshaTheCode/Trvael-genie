import { useState } from "react";
// Removed shadcn/ui and lucide-react imports. Use standard HTML elements and emojis instead.
import { GenerateItineraryResponse, TravelRequest } from "@shared/api";
import { useAuth, useAuthenticatedFetch } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ItineraryDisplayProps {
  itinerary: GenerateItineraryResponse;
  originalRequest: TravelRequest;
  onEdit: () => void;
  onRegenerate: (newRequest: TravelRequest) => void;
}

export function ItineraryDisplay({
  itinerary,
  originalRequest,
  onEdit,
  onRegenerate,
}: ItineraryDisplayProps) {
  const { user, isAuthenticated } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();

  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<number | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleSaveTrip = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to save your itinerary");
      return;
    }

    setIsSaving(true);
    try {
      const response = await authenticatedFetch("/api/itineraries", {
        method: "POST",
        body: JSON.stringify({
          itineraryData: itinerary.itinerary,
          originalRequest,
          title: `Trip to ${originalRequest.destination}`,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Trip saved successfully!");
      } else {
        toast.error(result.message || "Failed to save trip");
      }
    } catch (error) {
      toast.error("Failed to save trip. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to share your itinerary");
      return;
    }

    setIsSharing(true);
    try {
      // First save the itinerary, then generate share link
      const saveResponse = await authenticatedFetch("/api/itineraries", {
        method: "POST",
        body: JSON.stringify({
          itineraryData: itinerary.itinerary,
          originalRequest,
          title: `Trip to ${originalRequest.destination}`,
        }),
      });

      const saveResult = await saveResponse.json();
      if (!saveResult.success) {
        throw new Error(saveResult.message);
      }

      // Generate share link
      const shareResponse = await authenticatedFetch(
        `/api/itineraries/${saveResult.itinerary.id}/share`,
        {
          method: "PATCH",
        },
      );

      const shareResult = await shareResponse.json();
      if (shareResult.success) {
        setShareUrl(shareResult.shareUrl);
        toast.success("Share link generated!");
      } else {
        toast.error(shareResult.message || "Failed to generate share link");
      }
    } catch (error) {
      toast.error("Failed to generate share link. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleFeedback = async (value: number) => {
    try {
      const response = await authenticatedFetch("/api/feedback", {
        method: "POST",
        body: JSON.stringify({
          itineraryId: itinerary.itineraryId || "temp",
          feedbackValue: value,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setFeedbackGiven(value);
        toast.success("Thank you for your feedback!");
      } else {
        toast.error(result.message || "Failed to submit feedback");
      }
    } catch (error) {
      toast.error("Failed to submit feedback. Please try again.");
    }
  };

  const handleDownloadPDF = () => {
    if (itinerary.itineraryId) {
      window.open(`/api/pdf/${itinerary.itineraryId}?format=html`, "_blank");
    }
  };

  if (!itinerary.itinerary) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-rose-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {itinerary.itinerary.title}
            </h1>
            <p className="text-gray-600">
              {itinerary.itinerary.meta.destination} •{" "}
              {itinerary.itinerary.meta.start_date} to{" "}
              {itinerary.itinerary.meta.end_date}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={onEdit} className="border rounded px-3 py-1 text-sm flex items-center mr-2">
              <span className="mr-2">✏️</span>
              Edit Preferences
            </button>

            <button
              id="save-trip-btn"
              onClick={handleSaveTrip}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 text-white rounded px-3 py-1 text-sm flex items-center mr-2"
            >
              <span className="mr-2">💾</span>
              {isSaving ? "Saving..." : "Save Trip"}
            </button>

            <button
              onClick={handleShare}
              disabled={isSharing}
              className="border rounded px-3 py-1 text-sm flex items-center mr-2"
            >
              <span className="mr-2">🔗</span>
              {isSharing ? "Sharing..." : "Share"}
            </button>
            {shareUrl && (
              <div className="flex gap-2 mt-2">
                <input value={shareUrl} readOnly className="border px-2 py-1 rounded text-sm flex-1" />
                <button onClick={handleCopyLink} className="border rounded px-2 py-1 text-sm">
                  {isCopied ? "✅" : "📋"}
                </button>
              </div>
            )}

            <button
              id="download-pdf-btn"
              onClick={handleDownloadPDF}
              className="border rounded px-3 py-1 text-sm flex items-center"
            >
              <span className="mr-2">⬇️</span>
              Download as PDF
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main itinerary content */}
          <div className="lg:col-span-2 space-y-6">
            {itinerary.itinerary.days.map((day) => (
              <div key={day.day} className="border-l-4 border-l-orange-500 bg-white rounded-lg mb-6">
                <div className="flex items-center gap-2 px-4 py-2 border-b">
                  <span className="text-orange-600">📅</span>
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
                            <span className="text-sm font-medium text-orange-600">
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
                  <div className="bg-blue-50 rounded-lg p-3 mt-4">
                    <p className="text-sm font-medium text-blue-800">
                      💡 Daily Tip
                    </p>
                    <p className="text-sm text-blue-700">{day.daily_tip}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Feedback section */}
            <div className="bg-white rounded-lg p-4 mt-6">
              <div className="text-lg font-bold mb-2">How was this itinerary?</div>
              <div className="text-gray-600 mb-2 text-sm">Your feedback helps us improve our recommendations</div>
              <div className="flex gap-4 items-center">
                <button
                  id="feedback-up-btn"
                  onClick={() => handleFeedback(1)}
                  disabled={feedbackGiven !== null}
                  className={`border rounded px-3 py-1 text-sm flex items-center ${feedbackGiven === 1 ? "bg-green-600 text-white" : ""}`}
                >
                  <span className="mr-2">👍</span>
                  Helpful
                </button>
                <button
                  id="feedback-down-btn"
                  onClick={() => handleFeedback(-1)}
                  disabled={feedbackGiven !== null}
                  className={`border rounded px-3 py-1 text-sm flex items-center ${feedbackGiven === -1 ? "bg-red-600 text-white" : ""}`}
                >
                  <span className="mr-2">👎</span>
                  Not Helpful
                </button>
                {feedbackGiven && (
                  <span className="text-sm text-gray-600">
                    Thank you for your feedback!
                  </span>
                )}
              </div>
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
                    {itinerary.itinerary.budget_estimate.low.toLocaleString()} {" "}
                    - ₹
                    {itinerary.itinerary.budget_estimate.high.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Median Estimate:</span>
                  <span className="font-medium text-green-600">
                    ₹
                    {itinerary.itinerary.budget_estimate.median.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <div className="font-bold mb-2">Trip Details</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Travelers:</span>
                  <span className="font-medium">
                    {itinerary.itinerary.meta.travelers}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Style:</span>
                  <span className="font-medium capitalize">
                    {itinerary.itinerary.meta.style}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Budget:</span>
                  <span className="font-medium capitalize">
                    {itinerary.itinerary.meta.budget}
                  </span>
                </div>
              </div>
            </div>

            {itinerary.itinerary.source_facts &&
              itinerary.itinerary.source_facts.length > 0 && (
                <div className="bg-white rounded-lg p-4">
                  <div className="font-bold mb-2 text-sm">Useful Information</div>
                  <ul className="space-y-1 text-xs text-gray-600">
                    {itinerary.itinerary.source_facts.map((fact, idx) => (
                      <li key={idx}>• {fact}</li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
