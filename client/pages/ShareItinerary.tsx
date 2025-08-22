import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Compass,
  Share2,
  Download,
  ArrowLeft,
  Loader2,
  ExternalLink,
} from "lucide-react";
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading shared itinerary...</p>
        </div>
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-rose-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Itinerary Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              {error ||
                "This shared itinerary may have been removed or the link is invalid."}
            </p>
            <Link to="/">
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Compass className="h-4 w-4 mr-2" />
                Create Your Own Itinerary
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-rose-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Compass className="h-8 w-8 text-orange-600" />
              <h1 className="text-2xl font-bold text-gray-900">TravelGenie</h1>
            </Link>

            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                <Share2 className="h-3 w-3 mr-1" />
                Shared Itinerary
              </Badge>
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
            <Button onClick={handleShare} variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Copy Link
            </Button>

            <Link to="/">
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                <ExternalLink className="h-4 w-4 mr-2" />
                Create My Own
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main itinerary content */}
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

            {/* Call to action */}
            <Card className="bg-gradient-to-r from-orange-50 to-rose-50 border-orange-200">
              <CardContent className="text-center py-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Love this itinerary?
                </h3>
                <p className="text-gray-600 mb-4">
                  Create your own personalized travel plans with TravelGenie's
                  AI-powered planner
                </p>
                <Link to="/">
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <Compass className="h-4 w-4 mr-2" />
                    Plan My Trip
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar with trip details */}
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
                  <p className="text-xs text-gray-500 mt-2">
                    Estimates may vary based on season and personal preferences
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trip Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
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
              </CardContent>
            </Card>

            {itinerary.itineraryData.source_facts &&
              itinerary.itineraryData.source_facts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Useful Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-xs text-gray-600">
                      {itinerary.itineraryData.source_facts.map((fact, idx) => (
                        <li key={idx}>• {fact}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

            {/* TravelGenie Promotion */}
            <Card className="bg-gradient-to-br from-orange-100 to-rose-100 border-orange-200">
              <CardContent className="text-center py-6">
                <Compass className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">
                  Powered by TravelGenie
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  AI-powered travel planning for incredible India
                </p>
                <Link to="/">
                  <Button
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Start Planning
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
