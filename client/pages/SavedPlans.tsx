import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Search,
  Plus,
  Heart,
  Share2,
  Trash2,
  Edit,
  Compass,
  User,
  LogOut,
} from "lucide-react";
import {
  useAuth,
  useAuthenticatedFetch,
  withAuth,
} from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SavedItinerary {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: string;
  budget: string;
  style: string;
  createdAt: string;
  favorite: boolean;
  tags: string[];
  isPublic: boolean;
}

function SavedPlans() {
  const { user, logout } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  const navigate = useNavigate();

  const [itineraries, setItineraries] = useState<SavedItinerary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStyle, setFilterStyle] = useState<string>("all");

  useEffect(() => {
    fetchItineraries();
  }, []);

  const fetchItineraries = async () => {
    try {
      const response = await authenticatedFetch("/api/itineraries");
      const data = await response.json();

      if (data.success) {
        setItineraries(data.itineraries);
      } else {
        toast.error("Failed to load saved itineraries");
      }
    } catch (error) {
      toast.error("Failed to load saved itineraries");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this itinerary?")) return;

    try {
      const response = await authenticatedFetch(`/api/itineraries/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        setItineraries((prev) => prev.filter((item) => item.id !== id));
        toast.success("Itinerary deleted successfully");
      } else {
        toast.error(data.message || "Failed to delete itinerary");
      }
    } catch (error) {
      toast.error("Failed to delete itinerary");
    }
  };

  const handleToggleFavorite = async (id: string, currentFavorite: boolean) => {
    try {
      const response = await authenticatedFetch(`/api/itineraries/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ favorite: !currentFavorite }),
      });

      const data = await response.json();
      if (data.success) {
        setItineraries((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, favorite: !currentFavorite } : item,
          ),
        );
        toast.success(
          currentFavorite ? "Removed from favorites" : "Added to favorites",
        );
      } else {
        toast.error("Failed to update favorite status");
      }
    } catch (error) {
      toast.error("Failed to update favorite status");
    }
  };

  const filteredItineraries = itineraries.filter((itinerary) => {
    const matchesSearch =
      itinerary.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      itinerary.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStyle =
      filterStyle === "all" || itinerary.style === filterStyle;
    return matchesSearch && matchesStyle;
  });

  const travelStyles = [
    "all",
    "culture",
    "adventure",
    "food",
    "relax",
    "spiritual",
    "photography",
    "shopping",
    "wildlife",
    "wellness",
    "nightlife",
  ];

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

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">{user?.email}</span>
                {user?.subscriptionTier === "pro" && (
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-700"
                  >
                    Pro
                  </Badge>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Saved Plans
            </h1>
            <p className="text-gray-600">
              {itineraries.length} saved itinerary
              {itineraries.length !== 1 ? "ies" : ""}
            </p>
          </div>

          <Button
            onClick={() => navigate("/")}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Itinerary
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search destinations or trip names..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={filterStyle}
            onChange={(e) => setFilterStyle(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
          >
            {travelStyles.map((style) => (
              <option key={style} value={style}>
                {style === "all"
                  ? "All Styles"
                  : style.charAt(0).toUpperCase() + style.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && itineraries.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No saved itineraries yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start creating amazing travel plans and save them here for easy
              access.
            </p>
            <Button
              onClick={() => navigate("/")}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Create Your First Itinerary
            </Button>
          </div>
        )}

        {/* Itineraries Grid */}
        {!isLoading && filteredItineraries.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItineraries.map((itinerary) => (
              <Card
                key={itinerary.id}
                className="hover:shadow-lg transition-shadow duration-200"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-1">
                        {itinerary.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {itinerary.destination}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleToggleFavorite(itinerary.id, itinerary.favorite)
                      }
                      className="p-1"
                    >
                      <Heart
                        className={`h-4 w-4 ${itinerary.favorite ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                      />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {itinerary.startDate} to {itinerary.endDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3" />
                      <span>{itinerary.travelers}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">
                      {itinerary.budget}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {itinerary.style}
                    </Badge>
                    {itinerary.isPublic && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-blue-50 text-blue-700"
                      >
                        Shared
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/itinerary/${itinerary.id}`)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      View
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // In a real app, this would copy share link
                        toast.success("Share link copied!");
                      }}
                    >
                      <Share2 className="h-3 w-3" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(itinerary.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading &&
          itineraries.length > 0 &&
          filteredItineraries.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No itineraries match your search
              </h3>
              <p className="text-gray-600">
                Try adjusting your search terms or filters.
              </p>
            </div>
          )}
      </div>
    </div>
  );
}

export default withAuth(SavedPlans);
