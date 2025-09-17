// Type definitions for trip customization form
import { BudgetLevel, TravelStyle, AccessibilityOption, TravelPace } from './enums';

export interface TripFormData {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: string;
  budget: "low" | "medium" | "high";
  style:
    | "culture"
    | "adventure"
    | "food"
    | "relax"
    | "spiritual"
    | "photography"
    | "shopping"
    | "wildlife"
    | "wellness"
    | "nightlife";
  // allow string to be compatible with shared/TravelRequest which uses string for accessibility
  accessibility?: string;
  pace?: TravelPace;
  customRequirements?: string;
  // align with shared/api TravelRequest (required there)
  language: "en" | "hi";
  origin?: string;
}

export interface TripFormProps {
  initialData?: Partial<TripFormData>;
  onSubmit: (data: TripFormData) => void;
  isLoading?: boolean;
}