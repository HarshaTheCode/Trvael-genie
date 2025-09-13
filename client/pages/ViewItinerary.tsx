
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calendar,
  DollarSign,
  Compass,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { ItineraryResponse, TravelRequest } from "@shared/api";
import { useAuthenticatedFetch } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SavedItinerary {
  id: string;
  title: string;
  itineraryData: ItineraryResponse;
  originalRequest: TravelRequest;
  createdAt: string;
}

export default function ViewItinerary() {
  const { id } = useParams<{ id: string }>();
  const [itinerary, setItinerary] = useState<SavedItinerary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authenticatedFetch = useAuthenticatedFetch();

  useEffect(() => {
    if (id) {
      fetchItinerary(id);
    }
  }, [id]);

  const fetchItinerary = async (itineraryId: string) => {
    try {
      const response = await authenticatedFetch(`/api/itineraries/${itineraryId}`);
      const data = await response.json();

      if (data.success) {
        setItinerary(data.itinerary);
      } else {
        setError(data.message || "Itinerary not found");
        toast.error(data.message || "Itinerary not found");
      }
    } catch (err) {
      setError("Failed to load itinerary");
      toast.error("Failed to load itinerary");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading itinerary...</p>
        </div>
      </div>
    );
  }

  if (error || !itinerary || !itinerary.originalRequest || !itinerary.itineraryData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-rose-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Itinerary Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              {error ||
                "This itinerary may have been removed, the link is invalid, or the data is incomplete."}
            </p>
            <Link to="/saved-plans">
              <Button className="bg-orange-600 hover:bg-orange-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Saved Plans
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-rose-50">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/index" className="flex items-center gap-2">
              <Compass className="h-8 w-8 text-orange-600" />
              <h1 className="text-2xl font-bold text-gray-900">TravelGenie</h1>
            </Link>
            <Link to="/saved-plans">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Saved Plans
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
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
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {itinerary.itineraryData.days.map((day) => (
              <Card key={day.day} className="border-l-4 border-l-orange-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    Day {day.day} - {day.date}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Budget Estimate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Budget Range:</span>
                    <span className="font-medium">
                      ₹
                      {itinerary.itineraryData.budget_estimate.low.toLocaleString()}{" "}
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
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
