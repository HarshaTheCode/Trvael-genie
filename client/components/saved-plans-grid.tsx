import React from "react";
import { MapPin, Calendar, Users, Eye, Share2, Trash2, Heart, Plus } from "lucide-react";
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
      console.log("Share item:", item);
    }
  };

  if (loading) {
    return (
      <>
        <style>
          {`
            .loading-container {
              flex: 1;
            }
            
            .loading-header {
              margin-bottom: 32px;
            }
            
            .loading-title {
              font-size: 28px;
              font-weight: bold;
              color: #111827;
              margin-bottom: 8px;
            }
            
            .loading-subtitle {
              color: #6b7280;
            }
            
            .loading-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: 24px;
            }
            
            .loading-card {
              background: white;
              border-radius: 16px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            
            .loading-image {
              height: 200px;
              background: #f3f4f6;
              animation: pulse 2s infinite;
            }
            
            .loading-content {
              padding: 24px;
            }
            
            .loading-bar {
              background: #f3f4f6;
              border-radius: 4px;
              animation: pulse 2s infinite;
              margin-bottom: 12px;
            }
            
            .loading-bar.title { height: 24px; }
            .loading-bar.subtitle { height: 16px; width: 75%; }
            .loading-bar.info { height: 16px; width: 90%; }
            
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}
        </style>
        
        <div className="loading-container">
          <div className="loading-header">
            <h1 className="loading-title">My Saved Plans</h1>
            <p className="loading-subtitle">Loading...</p>
          </div>
          <div className="loading-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="loading-card">
                <div className="loading-image" />
                <div className="loading-content">
                  <div className="loading-bar title" />
                  <div className="loading-bar subtitle" />
                  <div className="loading-bar info" />
                  <div className="loading-bar info" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>
        {`
          .grid-container {
            flex: 1;
          }
          
          .grid-header {
            margin-bottom: 32px;
          }
          
          .grid-title {
            font-size: 28px;
            font-weight: bold;
            color: #111827;
            margin-bottom: 8px;
          }
          
          .grid-subtitle {
            color: #6b7280;
            font-size: 16px;
          }
          
          .plans-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 24px;
          }
          
          .plan-card {
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            transition: transform 0.2s, box-shadow 0.2s;
            cursor: pointer;
          }
          
          .plan-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          }
          
          .card-image-container {
            position: relative;
            height: 200px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            overflow: hidden;
          }
          
          .card-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s;
          }
          
          .plan-card:hover .card-image {
            transform: scale(1.05);
          }
          
          .card-badges {
            position: absolute;
            top: 12px;
            left: 12px;
            right: 12px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          
          .trip-type-badge {
            background: rgba(8, 145, 178, 0.9);
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            text-transform: capitalize;
          }
          
          .favorite-btn {
            background: rgba(255, 255, 255, 0.9);
            border: none;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          
          .favorite-btn:hover {
            background: white;
          }
          
          .favorite-icon {
            width: 18px;
            height: 18px;
            color: #6b7280;
            transition: color 0.2s;
          }
          
          .favorite-icon.active {
            color: #ef4444;
            fill: currentColor;
          }
          
          .card-content {
            padding: 24px;
          }
          
          .card-title {
            font-size: 20px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 8px;
            line-height: 1.3;
          }
          
          .card-description {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 16px;
            line-height: 1.4;
          }
          
          .card-info {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 20px;
          }
          
          .info-item {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #6b7280;
            font-size: 14px;
          }
          
          .info-icon {
            width: 16px;
            height: 16px;
            color: #0891b2;
          }
          
          .card-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 16px;
            border-top: 1px solid #f3f4f6;
          }
          
          .duration-badge {
            background: #f3f4f6;
            color: #6b7280;
            padding: 4px 12px;
            border-radius: 16px;
            font-size: 12px;
            font-weight: 500;
          }
          
          .card-actions {
            display: flex;
            gap: 4px;
          }
          
          .action-btn {
            background: none;
            border: none;
            border-radius: 8px;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          
          .action-btn:hover {
            background: #f3f4f6;
          }
          
          .action-btn.view:hover,
          .action-btn.share:hover {
            background: rgba(8, 145, 178, 0.1);
            color: #0891b2;
          }
          
          .action-btn.delete:hover {
            background: rgba(239, 68, 68, 0.1);
            color: #ef4444;
          }
          
          .action-icon {
            width: 16px;
            height: 16px;
          }
          
          .empty-state {
            text-align: center;
            padding: 64px 24px;
          }
          
          .empty-icon {
            width: 64px;
            height: 64px;
            background: #f3f4f6;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
          }
          
          .empty-icon svg {
            width: 32px;
            height: 32px;
            color: #9ca3af;
          }
          
          .empty-title {
            font-size: 20px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 8px;
          }
          
          .empty-description {
            color: #6b7280;
            margin-bottom: 24px;
            max-width: 400px;
            margin-left: auto;
            margin-right: auto;
          }
          
          .empty-button {
            background: #0891b2;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 500;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: background-color 0.2s;
          }
          
          .empty-button:hover {
            background: #0e7490;
          }
          
          @media (max-width: 768px) {
            .plans-grid {
              grid-template-columns: 1fr;
              gap: 16px;
            }
            
            .grid-title {
              font-size: 24px;
            }
            
            .card-content {
              padding: 20px;
            }
          }
        `}
      </style>
      
      <div className="grid-container">
        <div className="grid-header">
          <h1 className="grid-title">My Saved Plans</h1>
          <p className="grid-subtitle">{itineraries.length} saved itineraries</p>
        </div>

        <div className="plans-grid">
          {itineraries.map((plan) => (
            <div key={plan.id} className="plan-card" onClick={() => handleView(plan.id)}>
              <div className="card-image-container">
                <div className="card-image" />
                <div className="card-badges">
                  <div className="trip-type-badge">
                    {plan.style || plan.itinerary?.meta?.style || "Travel"}
                  </div>
                  <button 
                    className="favorite-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite?.(plan.id, plan.isFavorite);
                    }}
                  >
                    <Heart className={`favorite-icon ${plan.isFavorite ? 'active' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="card-content">
                <h3 className="card-title">
                  {plan.title || plan.itinerary?.title}
                </h3>
                <p className="card-description">
                  {plan.description || plan.itinerary?.meta?.destination}
                </p>

                <div className="card-info">
                  <div className="info-item">
                    <MapPin className="info-icon" />
                    {plan.destination || plan.itinerary?.meta?.destination}
                  </div>
                  <div className="info-item">
                    <Calendar className="info-icon" />
                    {plan.dates || `${plan.itinerary?.meta?.start_date} - ${plan.itinerary?.meta?.end_date}`}
                  </div>
                  <div className="info-item">
                    <Users className="info-icon" />
                    {plan.travelers || plan.itinerary?.meta?.travelers} {(plan.travelers === 1 || plan.itinerary?.meta?.travelers === 1) ? "traveler" : "travelers"}
                  </div>
                </div>

                <div className="card-footer">
                  <div className="duration-badge">
                    {plan.duration || `${plan.itinerary?.days?.length || 0} days`}
                  </div>
                  <div className="card-actions">
                    <button 
                      className="action-btn view" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleView(plan.id);
                      }}
                    >
                      <Eye className="action-icon" />
                    </button>
                    <button 
                      className="action-btn share" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(plan);
                      }}
                    >
                      <Share2 className="action-icon" />
                    </button>
                    <button 
                      className="action-btn delete" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(plan.id);
                      }}
                    >
                      <Trash2 className="action-icon" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {itineraries.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">
              <MapPin />
            </div>
            <h3 className="empty-title">No saved plans yet</h3>
            <p className="empty-description">
              Start planning your next adventure and save your itineraries here.
            </p>
            <button className="empty-button" onClick={() => navigate("/")}>
              <Plus size={16} />
              Create Your First Plan
            </button>
          </div>
        )}
      </div>
    </>
  );
}