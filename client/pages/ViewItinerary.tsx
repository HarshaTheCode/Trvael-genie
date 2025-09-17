
import { Link } from "react-router-dom";

const title = "Sample Trip Title";
const heroImage = "/placeholder.svg";
const originalRequest = {
  destination: "Paris",
  startDate: "2025-09-20",
  endDate: "2025-09-27",
  travelers: 2,
  style: "Adventure",
  budget: "Mid"
};
const itineraryData = {
  days: [
    {
      day: 1,
      date: "2025-09-20",
      segments: [
        {
          time: "09:00",
          duration_min: 60,
          place: "Eiffel Tower",
          note: "Visit the Eiffel Tower",
          food: "Croissant",
          transport_min_to_next: 15
        }
      ],
      daily_tip: "Buy tickets in advance!"
    }
  ]
};
const budgetRange = "$2000 - $3000";
const medianEstimate = "$2500";

function getIconForSegment(note: string) {
  if (note && note.toLowerCase().includes("food")) return () => <span role="img" aria-label="Food">🍽️</span>;
  if (note && note.toLowerCase().includes("visit")) return () => <span role="img" aria-label="Sightseeing">🗼</span>;
  return () => <span role="img" aria-label="Activity">🎯</span>;
}

export default function ViewItinerary() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <img src={heroImage} alt={title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        {/* Header Navigation */}
        <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between">
          <Link to="/saved-plans">
            <button className="text-white hover:bg-white/20 px-3 py-1 rounded flex items-center">
              <span role="img" aria-label="Back">⬅️</span> Back to Plans
            </button>
          </Link>
          <div className="flex gap-2">
            <button className="text-white hover:bg-white/20 px-3 py-1 rounded flex items-center">
              <span role="img" aria-label="Share">🔗</span>
            </button>
            <button className="text-white hover:bg-white/20 px-3 py-1 rounded flex items-center">
              <span role="img" aria-label="Heart">❤️</span>
            </button>
          </div>
        </div>
        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-2 text-balance">{title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-white/90">
              <div className="flex items-center gap-1">
                <span role="img" aria-label="Location">📍</span>
                <span>{originalRequest.destination}</span>
              </div>
              <div className="flex items-center gap-1">
                <span role="img" aria-label="Calendar">📅</span>
                <span>{`${originalRequest.startDate} to ${originalRequest.endDate}`}</span>
              </div>
              <div className="flex items-center gap-1">
                <span role="img" aria-label="Travelers">🧑‍🤝‍🧑</span>
                <span>{originalRequest.travelers} adults</span>
              </div>
              <span className="inline-block bg-accent text-accent-foreground rounded px-2 py-1 text-xs font-semibold">
                {originalRequest.style}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Itinerary Timeline */}
          <div className="lg:col-span-2 space-y-8">
            {itineraryData.days.map((day) => (
              <div key={day.day} className="overflow-hidden border-0 shadow-lg rounded-lg bg-white mb-6">
                <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">Day {day.day}</h3>
                      <p className="text-white/90">{day.date}</p>
                    </div>
                    <span className="inline-block bg-white/20 text-white border-0 rounded px-2 py-1 text-xs font-semibold">
                      {day.segments.length} Activities
                    </span>
                  </div>
                </div>
                <div className="p-0">
                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />
                    {day.segments.map((segment, activityIndex) => {
                      const IconComponent = getIconForSegment(segment.note);
                      return (
                        <div key={activityIndex} className="relative flex gap-6 p-6 hover:bg-muted/50 transition-colors">
                          {/* Timeline Dot */}
                          <div className="relative z-10 flex-shrink-0">
                            <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
                              <IconComponent />
                            </div>
                          </div>
                          {/* Activity Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="text-sm font-medium text-teal-600">{segment.time}</span>
                                  <span className="inline-block border border-gray-300 text-xs rounded px-2 py-0.5 align-middle">
                                    <span role="img" aria-label="Clock">⏰</span> {segment.duration_min} min
                                  </span>
                                </div>
                                <h4 className="text-lg font-semibold text-foreground mb-1">{segment.place}</h4>
                                <p className="text-muted-foreground mb-2">{segment.note}</p>
                                {segment.food && (
                                  <span className="inline-block text-xs bg-green-100 text-green-800 border border-green-200 rounded px-2 py-0.5 ml-2 align-middle">
                                    {segment.food}
                                  </span>
                                )}
                              </div>
                            </div>
                            {segment.transport_min_to_next > 0 && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3 pt-3 border-t border-border">
                                <span role="img" aria-label="Car">🚗</span>
                                <span>{segment.transport_min_to_next} min to next location</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {/* Daily Tip */}
                    <div className="bg-teal-50 border-l-4 border-teal-500 p-4 m-6 rounded-r-lg">
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs text-white font-bold">💡</span>
                        </div>
                        <div>
                          <h5 className="font-medium text-foreground mb-1">Daily Tip</h5>
                          <p className="text-sm text-muted-foreground">{day.daily_tip}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Budget Card */}
            <div className="border-0 shadow-lg rounded-lg bg-white p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span role="img" aria-label="Budget">💰</span>
                <h3 className="font-semibold text-foreground">Budget Estimate</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Budget Range:</span>
                  <span className="text-sm font-medium">{budgetRange}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Median Estimate:</span>
                  <span className="text-lg font-bold text-teal-600">{medianEstimate}</span>
                </div>
              </div>
            </div>
            {/* Trip Details Card */}
            <div className="border-0 shadow-lg rounded-lg bg-white p-6 mb-6">
              <h3 className="font-semibold text-foreground mb-4">Trip Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Travelers:</span>
                  <span className="text-sm font-medium">{originalRequest.travelers} adults</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Style:</span>
                  <span className="text-sm font-medium">{originalRequest.style}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Budget:</span>
                  <span className="text-sm font-medium">{originalRequest.budget}</span>
                </div>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="space-y-3">
              <button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-2 rounded flex items-center">
                <span role="img" aria-label="Heart">❤️</span>
                <span style={{ marginLeft: 8 }}>Save Itinerary</span>
              </button>
              <button className="w-full bg-transparent border border-gray-300 px-4 py-2 rounded flex items-center">
                <span role="img" aria-label="Share">🔗</span>
                <span style={{ marginLeft: 8 }}>Share Trip</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
