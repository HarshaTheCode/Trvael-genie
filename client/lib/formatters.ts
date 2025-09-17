// String formatting functions for travel form
import { BudgetLevel, TravelStyle, AccessibilityOption, TravelPace } from '../types/enums';

export const formatBudgetLevel = (budget: BudgetLevel): string => {
  switch (budget) {
    case BudgetLevel.LOW:
      return 'Low';
    case BudgetLevel.MEDIUM:
      return 'Medium';
    case BudgetLevel.HIGH:
      return 'High';
    default:
      return 'Medium';
  }
};

export const formatTravelStyle = (style: TravelStyle): string => {
  switch (style) {
    case TravelStyle.CULTURE:
      return 'Culture';
    case TravelStyle.ADVENTURE:
      return 'Adventure';
    case TravelStyle.FOOD:
      return 'Food';
    case TravelStyle.RELAXATION:
      return 'Relaxation';
    default:
      return 'Culture';
  }
};

export const formatAccessibilityOption = (option: AccessibilityOption): string => {
  switch (option) {
    case AccessibilityOption.WHEELCHAIR:
      return 'Wheelchair accessible';
    case AccessibilityOption.VISUAL:
      return 'Visual impairment support';
    case AccessibilityOption.HEARING:
      return 'Hearing impairment support';
    case AccessibilityOption.MOBILITY:
      return 'Mobility assistance';
    case AccessibilityOption.NONE:
      return 'None';
    default:
      return 'None';
  }
};

export const formatTravelPace = (pace: TravelPace): string => {
  switch (pace) {
    case TravelPace.SLOW:
      return 'Slow';
    case TravelPace.MODERATE:
      return 'Moderate';
    case TravelPace.FAST:
      return 'Fast';
    default:
      return 'Moderate';
  }
};