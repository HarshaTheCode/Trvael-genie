import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuthenticatedFetch } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

// Type Definitions for Itinerary Data
interface Segment {
  time: string;
  duration_min: number;
  place: string;
  note: string;
  food?: string;
  transport_min_to_next: number;
}

interface Day {
  day: number;
  date: string;
  segments: Segment[];
  daily_tip: string;
}

interface ItineraryData {
  days: Day[];
}

interface OriginalRequest {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  style: string;
  budget: string;
}

interface Itinerary {
  title: string;
  heroImage?: string;
  originalRequest: OriginalRequest;
  itineraryData: ItineraryData;
  budgetRange: string;
  medianEstimate: string;
}

function getIconForSegment(note: string, index: number) {
  const colors = ['#14b8a6', '#f97316', '#a855f7', '#3b82f6', '#10b981', '#ec4899'];
  const color = colors[index % colors.length];
  
  let icon = '🎯';
  if (note && note.toLowerCase().includes('food')) icon = '🍽️';
  else if (note && note.toLowerCase().includes('visit')) icon = '🏛️';
  else if (note && note.toLowerCase().includes('shop')) icon = '🛍️';
  else if (note && note.toLowerCase().includes('music')) icon = '🎵';
  else if (note && note.toLowerCase().includes('night')) icon = '🌙';
  else icon = (index + 1).toString();

  return { color, icon };
}

export default function ViewItinerary() {
  const { id } = useParams<{ id: string }>();
  const authenticatedFetch = useAuthenticatedFetch();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('No itinerary ID provided.');
      setLoading(false);
      return;
    }

    const fetchItinerary = async () => {
      try {
        const res = await authenticatedFetch(`/api/itineraries/${id}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch itinerary');
        }
        setItinerary(data.itinerary);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItinerary();
  }, [id, authenticatedFetch]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9fafb'
      }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        color: '#ef4444',
        backgroundColor: '#f9fafb',
        fontSize: '18px'
      }}>
        Error: {error}
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        fontSize: '18px'
      }}>
        Itinerary not found.
      </div>
    );
  }

  const { title, heroImage, originalRequest, itineraryData, budgetRange, medianEstimate } = itinerary;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <style>{`
        .fade-in {
          animation: fadeIn 0.6s ease-in-out;
        }
        
        .slide-up {
          animation: slideUp 0.8s ease-out;
        }
        
        .hover-scale {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .hover-scale:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .btn-primary:hover {
          background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
          transform: translateY(-1px);
        }
        
        .btn-secondary {
          background: white;
          color: #374151;
          border: 1px solid #d1d5db;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .btn-secondary:hover {
          background: #f9fafb;
          border-color: #9ca3af;
          transform: translateY(-1px);
        }
        
        .btn-save {
          background: #ef4444;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
        }
        
        .btn-save:hover {
          background: #dc2626;
          transform: translateY(-1px);
        }
        
        .activity-item {
          transition: background-color 0.3s ease;
        }
        
        .activity-item:hover {
          background-color: #f9fafb;
        }
        
        .hero-gradient {
          background: linear-gradient(135deg, #14b8a6 0%, #0891b2 50%, #0e7490 100%);
        }
        
        .activity-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
          flex-shrink: 0;
          margin-top: 4px;
        }
        
        .activity-image {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          flex-shrink: 0;
          margin-left: 16px;
        }
        
        .card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          transition: box-shadow 0.3s ease;
        }
        
        .card:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        }
        
        .day-header {
          background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%);
          color: white;
          padding: 24px;
        }
        
        .daily-tip {
          background: #eff6ff;
          border-left: 4px solid #3b82f6;
          padding: 16px;
          margin: 24px;
          border-radius: 0 8px 8px 0;
        }
        
        .tip-icon {
          width: 24px;
          height: 24px;
          background: #3b82f6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .nav-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }
        
        .nav-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        .badge {
          background: #ef4444;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .time-badge {
          background: #f3f4f6;
          color: #374151;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .food-tag {
          background: #fef3c7;
          color: #d97706;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          display: inline-flex;
          align-items: center;
        }
      `}</style>

      {/* Hero Section */}
      <div style={{ position: 'relative', height: '320px', overflow: 'hidden' }}>
        {/* Hero Background */}
        <div className="hero-gradient" style={{ 
          position: 'absolute',
          inset: 0,
          opacity: heroImage ? 0.9 : 1
        }} />
        {heroImage && (
          <img 
            src={heroImage} 
            alt={title}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.3
            }}
          />
        )}
        
        {/* Header Navigation */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10
        }}>
          <Link to="/saved-plans" className="nav-btn">
            ← Back to Plans
          </Link>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="nav-btn">🔗</button>
            <button className="nav-btn">❤️</button>
          </div>
        </div>
        
        {/* Hero Content */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '24px',
          color: 'white',
          zIndex: 10
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h1 className="fade-in" style={{
              fontSize: '32px',
              fontWeight: 'bold',
              marginBottom: '16px'
            }}>
              {title}
            </h1>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '24px',
              color: 'rgba(255, 255, 255, 0.9)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                📍 {originalRequest.destination}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                📅 {originalRequest.startDate} to {originalRequest.endDate}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                👥 {originalRequest.travelers} adults
              </div>
              <span className="badge">
                {originalRequest.style}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 24px',
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '32px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '32px'
        }}>
          {/* Itinerary Timeline */}
          <div className="slide-up">
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#111827'
              }}>
                Your Itinerary
              </h2>
              <button className="btn-primary">
                📄 Export as PDF
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {itineraryData.days.map((day, dayIndex) => (
                <div key={day.day} className="card hover-scale">
                  {/* Day Header */}
                  <div className="day-header">
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>
                          Day {day.day}
                        </h3>
                        <p style={{ opacity: 0.9 }}>{day.date}</p>
                      </div>
                      <span style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {day.segments.length} Activities
                      </span>
                    </div>
                  </div>

                  {/* Activities */}
                  <div>
                    {day.segments.map((segment, activityIndex) => {
                      const { color, icon } = getIconForSegment(segment.note, activityIndex);
                      return (
                        <div key={activityIndex} className="activity-item" style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '16px',
                          padding: '16px',
                          borderBottom: activityIndex === day.segments.length - 1 ? 'none' : '1px solid #f3f4f6'
                        }}>
                          {/* Activity Icon */}
                          <div 
                            className="activity-icon"
                            style={{ backgroundColor: color }}
                          >
                            {icon}
                          </div>

                          {/* Activity Content */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'space-between',
                              marginBottom: '8px'
                            }}>
                              <div style={{ flex: 1 }}>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px',
                                  marginBottom: '8px'
                                }}>
                                  <span style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#14b8a6'
                                  }}>
                                    {segment.time}
                                  </span>
                                  <span className="time-badge">
                                    ⏰ {segment.duration_min} min
                                  </span>
                                </div>
                                <h4 style={{
                                  fontSize: '18px',
                                  fontWeight: '600',
                                  color: '#111827',
                                  marginBottom: '4px'
                                }}>
                                  {segment.place}
                                </h4>
                                <p style={{
                                  color: '#6b7280',
                                  fontSize: '14px',
                                  marginBottom: '8px'
                                }}>
                                  {segment.note}
                                </p>
                                {segment.food && (
                                  <span className="food-tag">
                                    {segment.food}
                                  </span>
                                )}
                              </div>
                              {/* Activity Image Placeholder */}
                              <div className="activity-image">
                                🏛️
                              </div>
                            </div>
                            
                            {segment.transport_min_to_next > 0 && (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '14px',
                                color: '#6b7280',
                                marginTop: '12px',
                                paddingTop: '12px',
                                borderTop: '1px solid #f3f4f6'
                              }}>
                                🚗 {segment.transport_min_to_next} min to next location
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Daily Tip */}
                    <div className="daily-tip">
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px'
                      }}>
                        <div className="tip-icon">
                          💡
                        </div>
                        <div>
                          <h5 style={{
                            fontWeight: '600',
                            color: '#1e40af',
                            marginBottom: '4px'
                          }}>
                            Daily Tip
                          </h5>
                          <p style={{
                            fontSize: '14px',
                            color: '#1e40af'
                          }}>
                            {day.daily_tip}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="slide-up" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            {/* Budget Estimate */}
            <div className="card">
              <div style={{ padding: '24px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '16px'
                }}>
                  Budget Estimate
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Budget Range:</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                      {budgetRange}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Median Estimate:</span>
                    <span style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#14b8a6'
                    }}>
                      {medianEstimate}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trip Details */}
            <div className="card">
              <div style={{ padding: '24px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '16px'
                }}>
                  Trip Details
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Travelers:</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                      {originalRequest.travelers} adults
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Style:</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                      {originalRequest.style}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Budget:</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                      {originalRequest.budget}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="btn-save">
                ❤️ Save Itinerary
              </button>
              <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                🔗 Share Trip
              </button>
            </div>

            {/* Trip Highlights */}
            <div className="card">
              <div style={{ padding: '24px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '16px'
                }}>
                  Trip Highlights
                </h3>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <li style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    <span style={{ color: '#14b8a6', marginTop: '4px' }}>•</span>
                    Vibrant nightlife scene
                  </li>
                  <li style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    <span style={{ color: '#14b8a6', marginTop: '4px' }}>•</span>
                    Authentic local cuisine
                  </li>
                  <li style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    <span style={{ color: '#14b8a6', marginTop: '4px' }}>•</span>
                    Historic landmarks
                  </li>
                  <li style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    <span style={{ color: '#14b8a6', marginTop: '4px' }}>•</span>
                    Modern entertainment districts
                  </li>
                </ul>
              </div>
            </div>

            {/* Useful Information */}
            <div className="card">
              <div style={{ padding: '24px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '16px'
                }}>
                  Useful Information
                </h3>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <li style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    <span style={{ color: '#3b82f6', marginTop: '4px' }}>•</span>
                    Known for its vibrant nightlife
                  </li>
                  <li style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    <span style={{ color: '#3b82f6', marginTop: '4px' }}>•</span>
                    Many options for food and entertainment
                  </li>
                  <li style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    <span style={{ color: '#3b82f6', marginTop: '4px' }}>•</span>
                    Best experienced with local guides
                  </li>
                  <li style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    <span style={{ color: '#3b82f6', marginTop: '4px' }}>•</span>
                    Safe transportation options available
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}