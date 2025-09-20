import { useState } from "react";

interface ItineraryDisplayProps {
  itinerary: any;
  originalRequest: any;
  onEdit: () => void;
  onRegenerate: (newRequest: any) => void;
}

export function ItineraryDisplay({
  itinerary,
  originalRequest,
  onEdit,
  onRegenerate,
}: ItineraryDisplayProps) {
  // Mock auth context for demo - replace with your actual useAuth and useAuthenticatedFetch
  const user = { id: 1, name: "User" };
  const isAuthenticated = true;
  const authenticatedFetch = async (url: string, options: any) => {
    // Replace with your actual authenticatedFetch implementation
    return new Promise((resolve) => {
      setTimeout(() => resolve({ 
        json: () => Promise.resolve({ success: true, itinerary: { id: "123" }, shareUrl: "https://example.com/share/123" })
      }), 1000);
    });
  };

  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<number | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleSaveTrip = async () => {
    if (!isAuthenticated) {
      alert("Please sign in to save your itinerary");
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
        alert("Trip saved successfully!");
      } else {
        alert(result.message || "Failed to save trip");
      }
    } catch (error) {
      alert("Failed to save trip. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (!isAuthenticated) {
      alert("Please sign in to share your itinerary");
      return;
    }

    setIsSharing(true);
    try {
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

      const shareResponse = await authenticatedFetch(
        `/api/itineraries/${saveResult.itinerary.id}/share`,
        {
          method: "PATCH",
        },
      );

      const shareResult = await shareResponse.json();
      if (shareResult.success) {
        setShareUrl(shareResult.shareUrl);
        alert("Share link generated!");
      } else {
        alert(shareResult.message || "Failed to generate share link");
      }
    } catch (error) {
      alert("Failed to generate share link. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      alert("Link copied to clipboard!");
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
        alert("Thank you for your feedback!");
      } else {
        alert(result.message || "Failed to submit feedback");
      }
    } catch (error) {
      alert("Failed to submit feedback. Please try again.");
    }
  };

  const handleDownloadPDF = () => {
    if (itinerary.itineraryId) {
      window.open(`/api/pdf/${itinerary.itineraryId}?format=html`, "_blank");
    }
  };

  if (!itinerary.itinerary) return null;

  const getActivityIcon = (place: string, note: string) => {
    if (place.toLowerCase().includes('restaurant') || note.toLowerCase().includes('food') || note.toLowerCase().includes('eat')) return '🍽️';
    if (place.toLowerCase().includes('hotel') || note.toLowerCase().includes('stay')) return '🏨';
    if (place.toLowerCase().includes('temple') || place.toLowerCase().includes('mosque') || place.toLowerCase().includes('church')) return '🕌';
    if (place.toLowerCase().includes('museum') || place.toLowerCase().includes('gallery')) return '🏛️';
    if (place.toLowerCase().includes('park') || place.toLowerCase().includes('garden')) return '🌳';
    if (place.toLowerCase().includes('market') || place.toLowerCase().includes('bazaar') || place.toLowerCase().includes('mall')) return '🛍️';
    if (place.toLowerCase().includes('bar') || place.toLowerCase().includes('club') || place.toLowerCase().includes('nightlife')) return '🍸';
    return '📍';
  };

  const getCategoryTag = (place: string, note: string) => {
    if (place.toLowerCase().includes('restaurant') || note.toLowerCase().includes('food')) return { text: 'Continental cuisine', color: '#E53E3E' };
    if (place.toLowerCase().includes('market') || place.toLowerCase().includes('bazaar')) return { text: 'Hyderabad Biryani', color: '#D69E2E' };
    if (place.toLowerCase().includes('bar') || place.toLowerCase().includes('club')) return { text: 'Indian street food', color: '#38A169' };
    if (place.toLowerCase().includes('mall')) return { text: 'Cafe snacks', color: '#3182CE' };
    return null;
  };

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroOverlay}>
          <button style={styles.backButton} onClick={onEdit}>
            ← Back to Plans
          </button>
          <div style={styles.heroActions}>
            <button style={styles.heroActionBtn}>⟨</button>
            <button style={styles.heroActionBtn}>♡</button>
          </div>
          <div style={styles.heroContent}>
            <h1 style={styles.heroTitle}>{itinerary.itinerary.title}</h1>
            <div style={styles.heroMeta}>
              <span>📍 {itinerary.itinerary.meta.destination}</span>
              <span>📅 {itinerary.itinerary.meta.start_date} to {itinerary.itinerary.meta.end_date}</span>
              <span>👥 {itinerary.itinerary.meta.travelers}</span>
              <span style={styles.nightlifeTag}>Nightlife</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.leftColumn}>
          {/* Header */}
          <div style={styles.contentHeader}>
            <h2 style={styles.itineraryTitle}>Your Itinerary</h2>
            <button style={styles.exportBtn} onClick={handleDownloadPDF}>
              📄 Export as PDF
            </button>
          </div>

          {/* Itinerary Days */}
          {itinerary.itinerary.days.map((day, dayIndex) => (
            <div key={day.day} style={styles.daySection}>
              <div style={styles.dayHeader}>
                <h3 style={styles.dayTitle}>Day {day.day}</h3>
                <span style={styles.dayDate}>{day.date}</span>
                <span style={styles.activitiesCount}>{day.segments.length} Activities</span>
              </div>

              <div style={styles.timeline}>
                {day.segments.map((segment, segmentIndex) => (
                  <div key={segmentIndex} style={styles.timelineItem}>
                    <div style={styles.timelineIcon}>
                      <div style={styles.iconCircle}>
                        {getActivityIcon(segment.place, segment.note)}
                      </div>
                    </div>
                    
                    <div style={styles.timelineContent}>
                      <div style={styles.timelineCard}>
                        <div style={styles.activityImage}>
                          <div style={styles.placeholderImage}>
                            <span style={styles.placeholderIcon}>
                              {getActivityIcon(segment.place, segment.note)}
                            </span>
                          </div>
                        </div>
                        
                        <div style={styles.activityDetails}>
                          <div style={styles.timeInfo}>
                            <span style={styles.time}>{segment.time}</span>
                            <span style={styles.duration}>{segment.duration_min} min</span>
                          </div>
                          
                          <h4 style={styles.placeName}>{segment.place}</h4>
                          <p style={styles.placeDescription}>{segment.note}</p>
                          
                          {getCategoryTag(segment.place, segment.note) && (
                            <span 
                              style={{
                                ...styles.categoryTag,
                                backgroundColor: getCategoryTag(segment.place, segment.note).color
                              }}
                            >
                              {getCategoryTag(segment.place, segment.note).text}
                            </span>
                          )}
                          
                          {segment.food && (
                            <div style={styles.foodInfo}>
                              🍽️ {segment.food}
                            </div>
                          )}
                          
                          {segment.transport_min_to_next > 0 && (
                            <div style={styles.transportInfo}>
                              🚗 {segment.transport_min_to_next} min to next location
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {day.daily_tip && (
                  <div style={styles.dailyTip}>
                    <div style={styles.tipIcon}>💡</div>
                    <div style={styles.tipContent}>
                      <strong>Daily Tip</strong>
                      <p>{day.daily_tip}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Feedback Section */}
          <div style={styles.feedbackSection}>
            <h3>How was this itinerary?</h3>
            <p>Your feedback helps us improve our recommendations</p>
            <div style={styles.feedbackButtons}>
              <button
                style={{
                  ...styles.feedbackBtn,
                  ...(feedbackGiven === 1 ? styles.feedbackActive : {})
                }}
                onClick={() => handleFeedback(1)}
                disabled={feedbackGiven !== null}
              >
                👍 Helpful
              </button>
              <button
                style={{
                  ...styles.feedbackBtn,
                  ...(feedbackGiven === -1 ? styles.feedbackActive : {})
                }}
                onClick={() => handleFeedback(-1)}
                disabled={feedbackGiven !== null}
              >
                👎 Not Helpful
              </button>
            </div>
            {feedbackGiven && (
              <span style={styles.feedbackThanks}>Thank you for your feedback!</span>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div style={styles.rightColumn}>
          {/* Budget Estimate */}
          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>💰 Budget Estimate</h3>
            <div style={styles.budgetInfo}>
              <div style={styles.budgetRow}>
                <span>Budget Range:</span>
                <span style={styles.budgetValue}>
                  ₹{itinerary.itinerary.budget_estimate.low.toLocaleString()} - ₹{itinerary.itinerary.budget_estimate.high.toLocaleString()}
                </span>
              </div>
              <div style={styles.budgetRow}>
                <span>Median Estimate:</span>
                <span style={styles.medianEstimate}>
                  ₹{itinerary.itinerary.budget_estimate.median.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Trip Details */}
          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>Trip Details</h3>
            <div style={styles.tripDetails}>
              <div style={styles.detailRow}>
                <span>Travelers:</span>
                <span>{itinerary.itinerary.meta.travelers}</span>
              </div>
              <div style={styles.detailRow}>
                <span>Style:</span>
                <span style={styles.capitalize}>{itinerary.itinerary.meta.style}</span>
              </div>
              <div style={styles.detailRow}>
                <span>Budget:</span>
                <span style={styles.capitalize}>{itinerary.itinerary.meta.budget}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <button 
            style={styles.saveButton}
            onClick={handleSaveTrip}
            disabled={isSaving}
          >
            ❤️ {isSaving ? 'Saving...' : 'Save Itinerary'}
          </button>
          
          <button 
            style={styles.shareButton}
            onClick={handleShare}
            disabled={isSharing}
          >
            📤 {isSharing ? 'Sharing...' : 'Share Trip'}
          </button>

          {shareUrl && (
            <div style={styles.shareUrlContainer}>
              <input 
                value={shareUrl} 
                readOnly 
                style={styles.shareInput}
              />
              <button 
                onClick={handleCopyLink} 
                style={styles.copyButton}
              >
                {isCopied ? '✅' : '📋'}
              </button>
            </div>
          )}

          {/* Trip Highlights */}
          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>Trip Highlights</h3>
            <ul style={styles.highlightsList}>
              <li>• Vibrant nightlife scene</li>
              <li>• Authentic local cuisine</li>
              <li>• Historic landmarks</li>
              <li>• Modern entertainment districts</li>
            </ul>
          </div>

          {/* Useful Information */}
          {itinerary.itinerary.source_facts && itinerary.itinerary.source_facts.length > 0 && (
            <div style={styles.sidebarCard}>
              <h3 style={styles.sidebarTitle}>Useful Information</h3>
              <ul style={styles.factsList}>
                {itinerary.itinerary.source_facts.map((fact, idx) => (
                  <li key={idx}>• {fact}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  hero: {
    height: '400px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
  },
  heroOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5))',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
    padding: '20px',
    color: 'white',
  },
  backButton: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '20px',
    cursor: 'pointer',
    alignSelf: 'flex-start',
    fontSize: '14px',
    backdropFilter: 'blur(10px)',
  },
  heroActions: {
    position: 'absolute' as const,
    top: '20px',
    right: '20px',
    display: 'flex',
    gap: '10px',
  },
  heroActionBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
  },
  heroContent: {
    textAlign: 'center' as const,
    marginTop: 'auto',
    marginBottom: '40px',
  },
  heroTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '0 0 16px 0',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
  heroMeta: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
    gap: '20px',
    fontSize: '14px',
    alignItems: 'center',
  },
  nightlifeTag: {
    background: '#e53e3e',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
  },
  mainContent: {
    display: 'flex',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
    gap: '40px',
    flexWrap: 'wrap' as const,
  },
  leftColumn: {
    flex: '2',
    minWidth: '600px',
  },
  rightColumn: {
    flex: '1',
    minWidth: '300px',
  },
  contentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  itineraryTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1a202c',
    margin: 0,
  },
  exportBtn: {
    background: '#3182ce',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  daySection: {
    marginBottom: '40px',
  },
  dayHeader: {
    background: '#3182ce',
    color: 'white',
    padding: '15px 20px',
    borderRadius: '8px 8px 0 0',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  dayTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: 0,
  },
  dayDate: {
    fontSize: '14px',
    opacity: 0.9,
  },
  activitiesCount: {
    marginLeft: 'auto',
    fontSize: '12px',
    background: 'rgba(255,255,255,0.2)',
    padding: '4px 8px',
    borderRadius: '12px',
  },
  timeline: {
    background: 'white',
    borderRadius: '0 0 8px 8px',
    padding: '0',
  },
  timelineItem: {
    display: 'flex',
    padding: '20px',
    borderBottom: '1px solid #e2e8f0',
    position: 'relative' as const,
  },
  timelineIcon: {
    marginRight: '20px',
  },
  iconCircle: {
    width: '40px',
    height: '40px',
    background: '#3182ce',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    color: 'white',
  },
  timelineContent: {
    flex: 1,
  },
  timelineCard: {
    display: 'flex',
    gap: '15px',
  },
  activityImage: {
    width: '80px',
    height: '80px',
    flexShrink: 0,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
  },
  placeholderIcon: {
    color: 'white',
  },
  activityDetails: {
    flex: 1,
  },
  timeInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px',
  },
  time: {
    fontWeight: '600',
    color: '#3182ce',
    fontSize: '14px',
  },
  duration: {
    fontSize: '12px',
    color: '#718096',
    background: '#f7fafc',
    padding: '2px 6px',
    borderRadius: '10px',
  },
  placeName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a202c',
    margin: '0 0 4px 0',
  },
  placeDescription: {
    fontSize: '14px',
    color: '#4a5568',
    margin: '0 0 8px 0',
    lineHeight: '1.4',
  },
  categoryTag: {
    display: 'inline-block',
    color: 'white',
    fontSize: '11px',
    fontWeight: '500',
    padding: '3px 8px',
    borderRadius: '10px',
    marginBottom: '8px',
  },
  foodInfo: {
    fontSize: '12px',
    color: '#38a169',
    marginBottom: '4px',
  },
  transportInfo: {
    fontSize: '11px',
    color: '#718096',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  dailyTip: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    background: '#e6fffa',
    border: '1px solid #81e6d9',
    borderRadius: '8px',
    padding: '16px',
    margin: '20px',
  },
  tipIcon: {
    fontSize: '20px',
  },
  tipContent: {
    flex: 1,
  },
  feedbackSection: {
    background: 'white',
    borderRadius: '8px',
    padding: '20px',
    marginTop: '40px',
    textAlign: 'center' as const,
  },
  feedbackButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginTop: '16px',
  },
  feedbackBtn: {
    border: '1px solid #e2e8f0',
    background: 'white',
    padding: '8px 16px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
  },
  feedbackActive: {
    background: '#3182ce',
    color: 'white',
    borderColor: '#3182ce',
  },
  feedbackThanks: {
    display: 'block',
    marginTop: '12px',
    color: '#38a169',
    fontSize: '14px',
  },
  sidebarCard: {
    background: 'white',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  sidebarTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a202c',
    margin: '0 0 16px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  budgetInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  budgetRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
  },
  budgetValue: {
    fontWeight: '500',
    color: '#1a202c',
  },
  medianEstimate: {
    fontWeight: '600',
    color: '#38a169',
    fontSize: '16px',
  },
  tripDetails: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
  },
  capitalize: {
    textTransform: 'capitalize' as const,
    fontWeight: '500',
  },
  saveButton: {
    width: '100%',
    background: '#e53e3e',
    color: 'white',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  shareButton: {
    width: '100%',
    background: 'white',
    color: '#1a202c',
    border: '1px solid #e2e8f0',
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  shareUrlContainer: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
  },
  shareInput: {
    flex: 1,
    padding: '8px',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    fontSize: '12px',
  },
  copyButton: {
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    background: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  highlightsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    fontSize: '14px',
    lineHeight: '1.6',
  },
  factsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    fontSize: '12px',
    lineHeight: '1.5',
    color: '#4a5568',
  },
} as const;

// Mock data for demonstration
const mockItinerary = {
  itinerary: {
    title: "2-day Hyderabad Nightlife Tour",
    meta: {
      destination: "Hyderabad, India",
      start_date: "2025-09-13",
      end_date: "2025-09-14",
      travelers: "2 adults",
      style: "nightlife",
      budget: "low"
    },
    budget_estimate: {
      low: 2500,
      high: 11000,
      median: 5500
    },
    days: [
      {
        day: 1,
        date: "2025-09-13",
        segments: [
          {
            time: "18:00",
            duration_min: 120,
            place: "Jubilee Hills",
            note: "Explore pubs and restaurants",
            food: "Continental cuisine",
            transport_min_to_next: 15
          },
          {
            time: "21:30",
            duration_min: 90,
            place: "Gachibowli",
            note: "Live music and rooftop bars",
            food: "Indian street food",
            transport_min_to_next: 20
          },
          {
            time: "23:00",
            duration_min: 60,
            place: "Inorbit Mall",
            note: "Late-night shopping and cafes",
            food: "Cafe snacks",
            transport_min_to_next: 10
          }
        ],
        daily_tip: "Use ride-sharing apps for transport. Stay hydrated and be aware of surroundings."
      },
      {
        day: 2,
        date: "2025-09-14",
        segments: [
          {
            time: "19:00",
            duration_min: 60,
            place: "Laad Bazaar",
            note: "Explore street food and markets",
            food: "Hyderabad Biryani",
            transport_min_to_next: 15
          },
          {
            time: "20:00",
            duration_min: 30,
            place: "Charminar",
            note: "Night view of Charminar",
            food: "Fini day",
            transport_min_to_next: 20
          },
          {
            time: "21:30",
            duration_min: 120,
            place: "Ameerpet",
            note: "Night clubs and pubs",
            food: "Full meals",
            transport_min_to_next: 15
          }
        ],
        daily_tip: "Stay hydrated and be aware of surroundings."
      }
    ],
    source_facts: [
      "Hyderabad is known for its vibrant nightlife.",
      "Many options for food and entertainment.",
      "Best experienced with local guides.",
      "Safe transportation options available."
    ]
  },
  itineraryId: "mock-123"
};

const mockOriginalRequest = {
  destination: "Hyderabad, India",
  travelers: "2 adults",
  budget: "low",
  style: "nightlife"
};

export default function App() {
  const handleEdit = () => {
    console.log("Edit clicked");
  };

  const handleRegenerate = (newRequest: any) => {
    console.log("Regenerate clicked", newRequest);
  };

  return (
    <ItineraryDisplay
      itinerary={mockItinerary}
      originalRequest={mockOriginalRequest}
      onEdit={handleEdit}
      onRegenerate={handleRegenerate}
    />
  );
}