import { TravelRequest } from "@shared/api";

export class ValidationService {
  /**
   * Validate travel request input before processing
   */
  static validateTravelRequest(request: TravelRequest): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Required fields validation
    if (!request.destination?.trim()) {
      errors.push("Destination is required");
    }

    if (!request.startDate) {
      errors.push("Start date is required");
    }

    if (!request.endDate) {
      errors.push("End date is required");
    }

    if (!request.travelers?.trim()) {
      errors.push("Travelers information is required");
    }

    if (
      !request.budget ||
      !["low", "medium", "high"].includes(request.budget)
    ) {
      errors.push("Valid budget selection is required (low, medium, high)");
    }

    if (
      !request.style ||
      ![
        "culture",
        "adventure",
        "food",
        "relax",
        "spiritual",
        "photography",
        "shopping",
        "wildlife",
        "wellness",
        "nightlife",
      ].includes(request.style)
    ) {
      errors.push("Valid travel style is required");
    }

    // Date validation
    if (request.startDate && request.endDate) {
      const startDate = new Date(request.startDate);
      const endDate = new Date(request.endDate);

      if (isNaN(startDate.getTime())) {
        errors.push("Invalid start date format");
      }

      if (isNaN(endDate.getTime())) {
        errors.push("Invalid end date format");
      }

      if (startDate > endDate) {
        errors.push("Start date must be before end date");
      }

      // Check if dates are too far in the future (optional constraint)
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

      if (startDate > oneYearFromNow) {
        errors.push("Start date cannot be more than 1 year in the future");
      }

      // Check if dates are in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) {
        errors.push("Start date cannot be in the past");
      }

      // Check trip duration (cost reduction strategy)
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24))); // Same day = 1 day

      if (diffDays > 14) {
        errors.push(
          "Trip duration cannot exceed 14 days. Please split longer trips into smaller chunks.",
        );
      }
    }

    // Travelers validation
    if (request.travelers) {
      const travelersText = request.travelers.toLowerCase();
      // Basic validation for travelers format
      if (
        !travelersText.match(/\d+/) &&
        !travelersText.includes("adult") &&
        !travelersText.includes("person")
      ) {
        errors.push(
          'Travelers must include number information (e.g., "2 adults", "1 person")',
        );
      }
    }

    // Language validation
    if (request.language && !["en", "hi"].includes(request.language)) {
      errors.push('Language must be either "en" (English) or "hi" (Hindi)');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Sanitize and normalize user input
   */
  static sanitizeRequest(request: TravelRequest): TravelRequest {
    return {
      userId: request.userId?.trim(),
      origin: request.origin?.trim() || undefined,
      destination: request.destination?.trim() || "",
      startDate: request.startDate?.trim() || "",
      endDate: request.endDate?.trim() || "",
      travelers: request.travelers?.trim() || "",
      budget: request.budget as any,
      style: request.style as any,
      language: request.language || "en",
    };
  }

  /**
   * Check if destination is supported
   */
  static isSupportedDestination(destination: string): boolean {
    const supportedKeywords = [
      "india",
      "delhi",
      "mumbai",
      "bangalore",
      "chennai",
      "kolkata",
      "hyderabad",
      "pune",
      "jaipur",
      "agra",
      "goa",
      "kerala",
      "rajasthan",
      "uttar pradesh",
      "maharashtra",
      "karnataka",
      "tamil nadu",
      "west bengal",
      "gujarat",
      "udaipur",
      "varanasi",
      "rishikesh",
      "shimla",
      "ooty",
      "mysore",
      "amritsar",
      "leh",
      "ladakh",
      "kochi",
      "madurai",
    ];

    const normalizedDestination = destination.toLowerCase();

    return supportedKeywords.some(
      (keyword) =>
        normalizedDestination.includes(keyword) ||
        keyword.includes(normalizedDestination),
    );
  }

  /**
   * Rate limiting helper
   */
  static getUserIdentifier(request: any): string {
    // Use user ID if available, otherwise use IP
    const userId = request.body?.userId;
    const ip = request.ip || request.connection?.remoteAddress || "unknown";

    return userId || ip;
  }
}
