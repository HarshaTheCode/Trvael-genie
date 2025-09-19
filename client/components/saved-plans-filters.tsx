import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Calendar, MapPin, Filter } from "lucide-react";

interface SavedPlansFiltersProps {
  onFilterChange?: (filters: { from?: string; to?: string; destination?: string; tripType?: string; duration?: string }) => void;
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
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center text-card-foreground">
          <Filter className="w-5 h-5 mr-2 text-primary" />
          Filter Plans
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Range */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Date Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                type="date" 
                className="pl-10 bg-background border-border" 
                placeholder="From" 
                value={filters.from}
                onChange={(e) => updateFilter("from", e.target.value)}
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                type="date" 
                className="pl-10 bg-background border-border" 
                placeholder="To" 
                value={filters.to}
                onChange={(e) => updateFilter("to", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Destination */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Destination</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Search destinations..." 
              className="pl-10 bg-background border-border" 
              value={filters.destination}
              onChange={(e) => updateFilter("destination", e.target.value)}
            />
          </div>
        </div>

        {/* Trip Type */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Trip Type</Label>
          <Select value={filters.tripType} onValueChange={(value) => updateFilter("tripType", value)}>
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="leisure">Leisure</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="adventure">Adventure</SelectItem>
              <SelectItem value="cultural">Cultural</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Duration</Label>
          <Select value={filters.duration} onValueChange={(value) => updateFilter("duration", value)}>
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder="Any Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Duration</SelectItem>
              <SelectItem value="1-3">1-3 Days</SelectItem>
              <SelectItem value="4-7">4-7 Days</SelectItem>
              <SelectItem value="8-14">1-2 Weeks</SelectItem>
              <SelectItem value="15+">2+ Weeks</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleApply}>
          Apply Filters
        </Button>
      </CardContent>
    </Card>
  );
}