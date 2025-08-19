import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Calendar, Users, DollarSign, Compass, Loader2 } from 'lucide-react';
import { TravelRequest, GenerateItineraryResponse } from '@shared/api';

export default function Index() {
  const [formData, setFormData] = useState<TravelRequest>({
    destination: '',
    startDate: '',
    endDate: '',
    travelers: '',
    budget: 'medium',
    style: 'culture',
    language: 'en',
    origin: '',
    customRequirements: '',
    accessibility: '',
    travelPace: 'moderate'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] = useState<GenerateItineraryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof TravelRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Client-side validation for date range
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

      if (diffDays > 14) {
        setError('Trip duration cannot exceed 14 days. Please split longer trips into smaller chunks.');
        setIsLoading(false);
        return;
      }
    }

    try {
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        // Try to get the error message from the response
        const errorResult = await response.json().catch(() => null);
        const errorMessage = errorResult?.error || `Server error (${response.status})`;
        setError(errorMessage);
        return;
      }

      const result: GenerateItineraryResponse = await response.json();

      if (result.success && result.itinerary) {
        setGeneratedItinerary(result);
      } else {
        setError(result.error || 'Failed to generate itinerary');
      }
    } catch (err) {
      console.error('Request failed:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (generatedItinerary?.itinerary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-rose-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setGeneratedItinerary(null)}
              className="mb-4"
            >
              ← Create New Itinerary
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {generatedItinerary.itinerary.title}
            </h1>
            <p className="text-gray-600">
              {generatedItinerary.itinerary.meta.destination} • {generatedItinerary.itinerary.meta.start_date} to {generatedItinerary.itinerary.meta.end_date}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {generatedItinerary.itinerary.days.map((day) => (
                <Card key={day.day} className="border-l-4 border-l-orange-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-orange-600" />
                      Day {day.day} - {day.date}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {day.segments.map((segment, idx) => (
                      <div key={idx} className="border-l-2 border-gray-200 pl-4 pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-orange-600">{segment.time}</span>
                              <span className="text-sm text-gray-500">({segment.duration_min} min)</span>
                            </div>
                            <h4 className="font-semibold text-gray-900">{segment.place}</h4>
                            <p className="text-sm text-gray-600 mt-1">{segment.note}</p>
                            {segment.food && (
                              <p className="text-sm text-green-600 mt-1">🍽️ {segment.food}</p>
                            )}
                            {segment.transport_min_to_next > 0 && (
                              <p className="text-xs text-gray-500 mt-2">
                                🚗 {segment.transport_min_to_next} min to next location
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="bg-blue-50 rounded-lg p-3 mt-4">
                      <p className="text-sm font-medium text-blue-800">💡 Daily Tip</p>
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
                      <span className="font-medium">₹{generatedItinerary.itinerary.budget_estimate.low.toLocaleString()} - ₹{generatedItinerary.itinerary.budget_estimate.high.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Median Estimate:</span>
                      <span className="font-medium text-green-600">₹{generatedItinerary.itinerary.budget_estimate.median.toLocaleString()}</span>
                    </div>
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
                    <span className="font-medium">{generatedItinerary.itinerary.meta.travelers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Style:</span>
                    <span className="font-medium capitalize">{generatedItinerary.itinerary.meta.style}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Budget:</span>
                    <span className="font-medium capitalize">{generatedItinerary.itinerary.meta.budget}</span>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Button 
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/export', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ itineraryId: generatedItinerary.itineraryId })
                      });
                      const result = await response.json();
                      if (result.pdfUrl) {
                        window.open(result.pdfUrl, '_blank');
                      }
                    } catch (err) {
                      console.error('Export failed:', err);
                    }
                  }}
                >
                  📄 Export as PDF
                </Button>
                
                <Button variant="outline" className="w-full">
                  💾 Save Itinerary
                </Button>
              </div>

              {generatedItinerary.itinerary.source_facts && generatedItinerary.itinerary.source_facts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Useful Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-xs text-gray-600">
                      {generatedItinerary.itinerary.source_facts.map((fact, idx) => (
                        <li key={idx}>• {fact}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
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
            <div className="flex items-center gap-2">
              <Compass className="h-8 w-8 text-orange-600" />
              <h1 className="text-2xl font-bold text-gray-900">TravelGenie</h1>
            </div>
            <div className="text-sm text-gray-600">
              AI-Powered India Travel Planner
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Plan Your Perfect Trip to <span className="text-orange-600">India</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Get personalized travel itineraries powered by AI. Discover amazing destinations, 
            local cuisine, and hidden gems across incredible India.
          </p>
        </div>
      </section>

      {/* Travel Request Form */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Create Your Travel Itinerary</CardTitle>
              <CardDescription className="text-center">
                Fill in your travel preferences and let our AI create the perfect itinerary for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="destination" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-orange-600" />
                      Destination in India *
                    </Label>
                    <Input
                      id="destination"
                      placeholder="e.g., Hyderabad, Jaipur, Mumbai, hyd, blr, del..."
                      value={formData.destination}
                      onChange={(e) => handleInputChange('destination', e.target.value)}
                      required
                    />
                    <p className="text-xs text-gray-500">
                      💡 Try: Full names (Hyderabad) or shortcuts (hyd, blr, del, mum)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="origin">Starting From (Optional)</Label>
                    <Input
                      id="origin"
                      placeholder="e.g., Delhi, Mumbai"
                      value={formData.origin}
                      onChange={(e) => handleInputChange('origin', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-orange-600" />
                      Start Date *
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="travelers" className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-orange-600" />
                      Travelers *
                    </Label>
                    <Input
                      id="travelers"
                      placeholder="e.g., 2 adults, 1 child"
                      value={formData.travelers}
                      onChange={(e) => handleInputChange('travelers', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-orange-600" />
                      Budget *
                    </Label>
                    <Select value={formData.budget} onValueChange={(value: any) => handleInputChange('budget', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Budget (₹3,000-8,000/day)</SelectItem>
                        <SelectItem value="medium">Medium Budget (₹8,000-20,000/day)</SelectItem>
                        <SelectItem value="high">High Budget (₹20,000+/day)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="style">Travel Style *</Label>
                    <Select value={formData.style} onValueChange={(value: any) => handleInputChange('style', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select travel style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="culture">🏛️ Cultural & Heritage</SelectItem>
                        <SelectItem value="adventure">🏔️ Adventure & Nature</SelectItem>
                        <SelectItem value="food">🍽️ Food & Culinary</SelectItem>
                        <SelectItem value="relax">🧘 Relaxation & Wellness</SelectItem>
                        <SelectItem value="spiritual">🕉️ Spiritual & Religious</SelectItem>
                        <SelectItem value="photography">📸 Photography & Sightseeing</SelectItem>
                        <SelectItem value="shopping">🛍️ Shopping & Markets</SelectItem>
                        <SelectItem value="wildlife">��� Wildlife & Safari</SelectItem>
                        <SelectItem value="wellness">💆 Wellness & Spa</SelectItem>
                        <SelectItem value="nightlife">🌃 Nightlife & Entertainment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={formData.language} onValueChange={(value: any) => handleInputChange('language', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="travelPace">Travel Pace</Label>
                    <Select value={formData.travelPace} onValueChange={(value: any) => handleInputChange('travelPace', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select travel pace" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="slow">🐢 Slow & Relaxed (2-3 places/day)</SelectItem>
                        <SelectItem value="moderate">🚶 Moderate (4-5 places/day)</SelectItem>
                        <SelectItem value="fast">🏃 Fast-Paced (6+ places/day)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customRequirements">Special Requests & Preferences (Optional)</Label>
                    <Textarea
                      id="customRequirements"
                      placeholder="e.g., Want to visit specific temples, prefer vegetarian restaurants, need wheelchair accessibility, interested in local festivals, want photography workshops..."
                      value={formData.customRequirements}
                      onChange={(e) => handleInputChange('customRequirements', e.target.value)}
                      className="min-h-[100px]"
                    />
                    <p className="text-sm text-gray-500">
                      Tell us about any specific interests, requirements, or experiences you're looking for
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accessibility">Accessibility Needs (Optional)</Label>
                    <Input
                      id="accessibility"
                      placeholder="e.g., wheelchair access, mobility assistance, hearing/visual aids"
                      value={formData.accessibility}
                      onChange={(e) => handleInputChange('accessibility', e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-orange-600 hover:bg-orange-700 h-12 text-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Your Perfect Itinerary...
                    </>
                  ) : (
                    '✨ Generate My Travel Itinerary'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose TravelGenie?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Compass className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Planning</h3>
              <p className="text-gray-600">Our advanced AI understands your preferences and creates personalized itineraries</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Local Expertise</h3>
              <p className="text-gray-600">Discover hidden gems and authentic experiences across India</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Results</h3>
              <p className="text-gray-600">Get detailed day-by-day itineraries in seconds, not hours</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Compass className="h-6 w-6 text-orange-500" />
            <span className="text-xl font-bold">TravelGenie</span>
          </div>
          <p className="text-gray-400">
            AI-Powered Travel Planning for Incredible India
          </p>
        </div>
      </footer>
    </div>
  );
}
