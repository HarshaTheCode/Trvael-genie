import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Calendar, DollarSign, Save, Share2, ThumbsUp, ThumbsDown, Download, Edit, Copy, Check } from 'lucide-react';
import { GenerateItineraryResponse, TravelRequest } from '@shared/api';
import { useAuth, useAuthenticatedFetch } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ItineraryDisplayProps {
  itinerary: GenerateItineraryResponse;
  originalRequest: TravelRequest;
  onEdit: () => void;
  onRegenerate: (newRequest: TravelRequest) => void;
}

export function ItineraryDisplay({ itinerary, originalRequest, onEdit, onRegenerate }: ItineraryDisplayProps) {
  const { user, isAuthenticated } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<number | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleSaveTrip = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to save your itinerary');
      return;
    }

    setIsSaving(true);
    try {
      const response = await authenticatedFetch('/api/itineraries', {
        method: 'POST',
        body: JSON.stringify({
          itineraryData: itinerary.itinerary,
          originalRequest,
          title: `Trip to ${originalRequest.destination}`
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Trip saved successfully!');
      } else {
        toast.error(result.message || 'Failed to save trip');
      }
    } catch (error) {
      toast.error('Failed to save trip. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to share your itinerary');
      return;
    }

    setIsSharing(true);
    try {
      // First save the itinerary, then generate share link
      const saveResponse = await authenticatedFetch('/api/itineraries', {
        method: 'POST',
        body: JSON.stringify({
          itineraryData: itinerary.itinerary,
          originalRequest,
          title: `Trip to ${originalRequest.destination}`
        })
      });

      const saveResult = await saveResponse.json();
      if (!saveResult.success) {
        throw new Error(saveResult.message);
      }

      // Generate share link
      const shareResponse = await authenticatedFetch(`/api/itineraries/${saveResult.itinerary.id}/share`, {
        method: 'PATCH'
      });

      const shareResult = await shareResponse.json();
      if (shareResult.success) {
        setShareUrl(shareResult.shareUrl);
        toast.success('Share link generated!');
      } else {
        toast.error(shareResult.message || 'Failed to generate share link');
      }
    } catch (error) {
      toast.error('Failed to generate share link. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleFeedback = async (value: number) => {
    try {
      const response = await authenticatedFetch('/api/feedback', {
        method: 'POST',
        body: JSON.stringify({
          itineraryId: itinerary.itineraryId || 'temp',
          feedbackValue: value
        })
      });

      const result = await response.json();
      if (result.success) {
        setFeedbackGiven(value);
        toast.success('Thank you for your feedback!');
      } else {
        toast.error(result.message || 'Failed to submit feedback');
      }
    } catch (error) {
      toast.error('Failed to submit feedback. Please try again.');
    }
  };

  const handleDownloadPDF = () => {
    if (itinerary.itineraryId) {
      window.open(`/api/pdf/${itinerary.itineraryId}?format=html`, '_blank');
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
              {itinerary.itinerary.meta.destination} • {itinerary.itinerary.meta.start_date} to {itinerary.itinerary.meta.end_date}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button onClick={onEdit} variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Preferences
            </Button>
            
            <Button 
              id="save-trip-btn"
              onClick={handleSaveTrip} 
              disabled={isSaving}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Trip'}
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  onClick={handleShare}
                  disabled={isSharing}
                  size="sm"
                  variant="outline"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  {isSharing ? 'Sharing...' : 'Share'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Share Your Itinerary</DialogTitle>
                  <DialogDescription>
                    Share this itinerary with friends and family
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {shareUrl ? (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input value={shareUrl} readOnly />
                        <Button onClick={handleCopyLink}>
                          {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">
                        Anyone with this link can view your itinerary
                      </p>
                    </div>
                  ) : (
                    <Button onClick={handleShare} disabled={isSharing} className="w-full">
                      {isSharing ? 'Generating Link...' : 'Generate Share Link'}
                    </Button>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Button 
              id="download-pdf-btn"
              onClick={handleDownloadPDF}
              size="sm"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Download as PDF
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main itinerary content */}
          <div className="lg:col-span-2 space-y-6">
            {itinerary.itinerary.days.map((day) => (
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
                    <p className="text-sm font-medium text-blue-800">���� Daily Tip</p>
                    <p className="text-sm text-blue-700">{day.daily_tip}</p>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Feedback section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How was this itinerary?</CardTitle>
                <CardDescription>
                  Your feedback helps us improve our recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 items-center">
                  <Button
                    id="feedback-up-btn"
                    variant={feedbackGiven === 1 ? "default" : "outline"}
                    onClick={() => handleFeedback(1)}
                    disabled={feedbackGiven !== null}
                    className={feedbackGiven === 1 ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Helpful
                  </Button>
                  <Button
                    id="feedback-down-btn"
                    variant={feedbackGiven === -1 ? "default" : "outline"}
                    onClick={() => handleFeedback(-1)}
                    disabled={feedbackGiven !== null}
                    className={feedbackGiven === -1 ? "bg-red-600 hover:bg-red-700" : ""}
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Not Helpful
                  </Button>
                  {feedbackGiven && (
                    <span className="text-sm text-gray-600">
                      Thank you for your feedback!
                    </span>
                  )}
                </div>
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
                    <span className="font-medium">₹{itinerary.itinerary.budget_estimate.low.toLocaleString()} - ₹{itinerary.itinerary.budget_estimate.high.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Median Estimate:</span>
                    <span className="font-medium text-green-600">₹{itinerary.itinerary.budget_estimate.median.toLocaleString()}</span>
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
                  <span className="font-medium">{itinerary.itinerary.meta.travelers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Style:</span>
                  <span className="font-medium capitalize">{itinerary.itinerary.meta.style}</span>
                </div>
                <div className="flex justify-between">
                  <span>Budget:</span>
                  <span className="font-medium capitalize">{itinerary.itinerary.meta.budget}</span>
                </div>
              </CardContent>
            </Card>

            {itinerary.itinerary.source_facts && itinerary.itinerary.source_facts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Useful Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-xs text-gray-600">
                    {itinerary.itinerary.source_facts.map((fact, idx) => (
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
