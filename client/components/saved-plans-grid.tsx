import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Calendar, MapPin, Users, Eye, Share2, Trash2, Heart, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export type Itinerary = any;

interface SavedPlansGridProps {
  itineraries: Itinerary[];
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string, current: boolean) => void;
  onView?: (id: string) => void;
  onShare?: (id: string) => void;
  loading?: boolean;
}

export function SavedPlansGrid({
  itineraries,
  onDelete,
  onToggleFavorite,
  onView,
  onShare,
  loading,
}: SavedPlansGridProps) {
  const navigate = useNavigate();

  const handleView = (id: string) => {
    if (onView) {
      onView(id);
    } else {
      navigate(`/itinerary/${id}`);
    }
  };

  const handleShare = (item: any) => {
    if (onShare) {
      onShare(item.id);
    } else {
      // Default share behavior
      console.log("Share item:", item);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground text-balance">My Saved Plans</h1>
            <p className="text-muted-foreground mt-1">Loading...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden border-0 shadow-lg">
              <div className="h-48 bg-muted animate-pulse" />
              <CardContent className="p-6 space-y-4">
                <div className="h-6 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground text-balance">My Saved Plans</h1>
          <p className="text-muted-foreground mt-1">{itineraries.length} saved itineraries</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {itineraries.map((plan) => (
          <Card
            key={plan.id}
            className="group hover:shadow-lg transition-all duration-300 bg-card border-border overflow-hidden"
          >
            <div className="relative">
              <img
                src={plan.heroImage || plan.image || "/placeholder.svg"}
                alt={plan.title || plan.itinerary?.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3">
                <Button
                  size="sm"
                  variant="ghost"
                  className={`bg-white/90 hover:bg-white ${plan.isFavorite ? "text-red-500" : "text-gray-500"}`}
                  onClick={() => onToggleFavorite?.(plan.id, plan.isFavorite)}
                >
                  <Heart className={`w-4 h-4 ${plan.isFavorite ? "fill-current" : ""}`} />
                </Button>
              </div>
              <div className="absolute top-3 left-3">
                <Badge variant="secondary" className="bg-primary text-primary-foreground">
                  {plan.style || plan.itinerary?.meta?.style || "Travel"}
                </Badge>
              </div>
            </div>

            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-card-foreground text-balance group-hover:text-primary transition-colors">
                  {plan.title || plan.itinerary?.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 text-pretty">
                  {plan.description || plan.itinerary?.meta?.destination}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-2 text-primary" />
                  {plan.destination || plan.itinerary?.meta?.destination}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2 text-primary" />
                  {plan.dates || `${plan.itinerary?.meta?.start_date} - ${plan.itinerary?.meta?.end_date}`}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="w-4 h-4 mr-2 text-primary" />
                  {plan.travelers || plan.itinerary?.meta?.travelers} {plan.travelers === 1 || plan.itinerary?.meta?.travelers === 1 ? "traveler" : "travelers"}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Badge variant="outline" className="text-xs">
                  {plan.duration || `${plan.itinerary?.days?.length || 0} days`}
                </Badge>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10" onClick={() => handleView(plan.id)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10" onClick={() => handleShare(plan)}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete?.(plan.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State (if no plans) */}
      {itineraries.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No saved plans yet</h3>
          <p className="text-muted-foreground mb-6 text-pretty">
            Start planning your next adventure and save your itineraries here.
          </p>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => navigate("/")}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Plan
          </Button>
        </div>
      )}
    </div>
  );
}