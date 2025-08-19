/**
 * Shared code between client and server
 * API types and interfaces for the Travel Itinerary Planner
 */

export interface DemoResponse {
  message: string;
}

// Travel Request Input
export interface TravelRequest {
  userId?: string;
  origin?: string;
  destination: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  travelers: string; // e.g., "2 adults, 1 child"
  budget: "low" | "medium" | "high";
  style: "culture" | "adventure" | "food" | "relax" | "spiritual" | "photography" | "shopping" | "wildlife" | "wellness" | "nightlife";
  language: "en" | "hi";
  customRequirements?: string; // Additional user preferences
  accessibility?: string; // Accessibility needs
  travelPace?: "slow" | "moderate" | "fast"; // How much they want to cover per day
}

// Itinerary Response Schema
export interface ItinerarySegment {
  time: string;
  place: string;
  duration_min: number;
  note: string;
  transport_min_to_next: number;
  food: string;
}

export interface ItineraryDay {
  day: number;
  date: string; // YYYY-MM-DD
  segments: ItinerarySegment[];
  daily_tip: string;
}

export interface ItineraryResponse {
  title: string;
  meta: {
    destination: string;
    start_date: string;
    end_date: string;
    travelers: string;
    budget: string;
    style: string;
  };
  days: ItineraryDay[];
  budget_estimate: {
    low: number;
    median: number;
    high: number;
  };
  generated_at: string; // ISO8601 timestamp
  source_facts: string[];
}

// Database Models
export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface StoredItinerary {
  id: string;
  user_id?: string;
  input_payload: TravelRequest;
  output_json: ItineraryResponse;
  cached_key: string;
  created_at: string;
}

export interface Destination {
  slug: string;
  city: string;
  state: string;
  top_attractions: string[];
  best_time: string;
  transport_summary: string;
  local_foods: string[];
  seed_image_url: string;
}

export interface RateLimit {
  id: string;
  user_id_or_ip: string;
  credits_left: number;
  last_reset: string;
}

// API Response Types
export interface GenerateItineraryResponse {
  success: boolean;
  itinerary?: ItineraryResponse;
  itineraryId?: string;
  error?: string;
}

export interface ExportResponse {
  pdfUrl: string;
}

export interface SaveEmailResponse {
  success: boolean;
  message: string;
}

export interface GetItineraryResponse {
  success: boolean;
  itinerary?: StoredItinerary;
  error?: string;
}
