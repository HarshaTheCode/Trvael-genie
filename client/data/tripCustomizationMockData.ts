// Mock data for the trip customization form
import { BudgetLevel, TravelStyle, AccessibilityOption, TravelPace } from '@/types/enums';

export const mockRootProps = {
  initialDestination: "Jaipur",
  initialStartDate: "2024-03-15",
  initialEndDate: "2024-03-20", 
  initialTravelers: "2 adults",
  initialBudget: BudgetLevel.MEDIUM,
  initialStyle: TravelStyle.CULTURE,
  initialAccessibility: AccessibilityOption.NONE,
  initialPace: TravelPace.MODERATE,
  initialCustomRequirements: "Prefer vegetarian food and cultural sites"
};