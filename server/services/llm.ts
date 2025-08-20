import { TravelRequest, ItineraryResponse } from "@shared/api";
import { DestinationService } from "./destinations";

export class LLMService {
  private static readonly GEMINI_API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";
  private static readonly API_KEY = process.env.GEMINI_API_KEY;

  // Primary LLM system prompt (meta)
  private static readonly SYSTEM_PROMPT = `You are an expert Indian travel planner. Return ONLY valid JSON matching this schema exactly. No markdown, no explanation, no extra text.

CRITICAL: Ensure the JSON is complete and properly closed. For multi-day trips, include ALL days with complete segments.

JSON Schema:
{
  "title": "X-day [Destination] [Style] Tour",
  "meta": {
    "destination": "[City], India",
    "start_date": "YYYY-MM-DD",
    "end_date": "YYYY-MM-DD", 
    "travelers": "[number] adults",
    "budget": "low|medium|high",
    "style": "culture|adventure|relaxation|food|shopping"
  },
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "segments": [
        {
          "time": "HH:MM",
          "place": "Place name",
          "duration_min": 60,
          "note": "Brief description (max 15 words)",
          "transport_min_to_next": 15,
          "food": "Food recommendation"
        }
      ],
      "daily_tip": "One practical tip for the day"
    }
  ],
  "budget_estimate": {
    "low": 1000,
    "median": 3000,
    "high": 8000
  },
  "generated_at": "ISO timestamp",
  "source_facts": ["Fact 1", "Fact 2"]
}

Rules: ALL numbers as integers, ALL strings in quotes, complete JSON structure.`;

  static async generateItinerary(
    request: TravelRequest,
  ): Promise<ItineraryResponse> {
    if (!this.API_KEY) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    // Cost reduction strategy: limit date range
    const duration = this.calculateDays(request.startDate, request.endDate);
    if (duration > 14) {
      throw new Error(
        "DATE_RANGE_TOO_LONG: Please split trips longer than 14 days into smaller chunks",
      );
    }

    // Build destination snippet for RAG (150-300 tokens max)
    const destinationSnippet = DestinationService.getDestinationSnippet(
      request.destination,
    );

    // User prompt template (exact format as specified)
    const userPrompt = `CONTEXT:
${destinationSnippet}

TASK:
Create a detailed itinerary for: ${request.destination}
Travel Style: ${request.style}
Duration: ${request.startDate} to ${request.endDate}
Travelers: ${request.travelers}
Budget: ${request.budget}
Travel Pace: ${request.travelPace || "moderate"}
${request.customRequirements ? `Special Requirements: ${request.customRequirements}` : ""}
${request.accessibility ? `Accessibility Needs: ${request.accessibility}` : ""}

Generate EXACTLY ONE COMPLETE JSON object matching the provided itinerary schema.

CRITICAL REQUIREMENTS:
- Use the EXACT destination "${request.destination}" in all references
- Focus heavily on ${request.style} experiences and activities
- Include specific local attractions mentioned in the context above
- Match the ${request.travelPace || "moderate"} pace (slow=2-3 places/day, moderate=4-5, fast=6+)
- Budget estimates in INR rounded to nearest 100
- Keep descriptions under 15 words
- Ensure ALL days are included with complete segments
- Generate COMPLETE and properly closed JSON structure
${request.customRequirements ? `- Address these special requests: ${request.customRequirements}` : ""}

Return ONLY the JSON object - no markdown, no explanations, no extra text.`;

    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      try {
        const response = await this.callGeminiAPI(
          userPrompt,
          attempts === 1 ? 0.0 : 0.2,
        );
        const itinerary = await this.parseAndValidateResponse(
          response,
          request,
        );
        return itinerary;
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          console.error("LLM generation failed after retries:", error);
          throw new Error("LLM_INVALID_JSON");
        }
        // On first failure, try to fix the JSON with retry
        console.warn(
          `LLM attempt ${attempts} failed, retrying with temperature 0.0`,
        );
      }
    }

    throw new Error("LLM_INVALID_JSON");
  }

  private static async callGeminiAPI(
    prompt: string,
    temperature: number = 0.2,
  ): Promise<string> {
    const payload = {
      contents: [
        {
          parts: [{ text: this.SYSTEM_PROMPT }, { text: prompt }],
        },
      ],
      generationConfig: {
        temperature: temperature,
        maxOutputTokens: 4000,
        topK: 40,
        topP: 0.95,
      },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch(`${this.GEMINI_API_URL}?key=${this.API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
            if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again in a few minutes.");
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API error:", response.status, errorText);
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();

      if (
        !data.candidates ||
        !data.candidates[0] ||
        !data.candidates[0].content
      ) {
        throw new Error("No content in Gemini response");
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error("Request timed out. Please try again.");
      }
      throw error;
    }
  }

  private static async parseAndValidateResponse(
    response: string,
    request: TravelRequest,
  ): Promise<ItineraryResponse> {
    let itinerary: ItineraryResponse;

    // Log the raw response for debugging
    console.log("Gemini API raw response:", response.substring(0, 500));

    try {
      // First attempt: direct JSON parse
      itinerary = JSON.parse(response);
    } catch (parseError) {
      console.log("Direct JSON parse failed, trying regex extraction");
      try {
        // Second attempt: extract JSON with regex and try to complete it
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          let jsonText = jsonMatch[0];
          console.log("Extracted JSON:", jsonText.substring(0, 300));
          
          // Try to complete incomplete JSON
          if (!jsonText.trim().endsWith('}')) {
            console.log("JSON appears incomplete, attempting to complete...");
            // Add missing closing braces for common incomplete structures
            const openBraces = (jsonMatch[0].match(/\{/g) || []).length;
            const closeBraces = (jsonMatch[0].match(/\}/g) || []).length;
            const openBrackets = (jsonMatch[0].match(/\[/g) || []).length;
            const closeBrackets = (jsonMatch[0].match(/\]/g) || []).length;
            
            // Add missing closing brackets
            while (closeBrackets < openBrackets) {
              jsonText += ']';
            }
            while (closeBraces < openBraces) {
              jsonText += '}';
            }
            
            console.log("Completed JSON attempt:", jsonText.substring(0, 300));
          }
          
          try {
            itinerary = JSON.parse(jsonText);
          } catch (completeError) {
            console.log("Completed JSON still invalid, trying LLM fix");
            // Third attempt: call LLM again to fix JSON
            const fixPrompt = `Complete and fix this incomplete JSON: ${response}`;
            const fixedResponse = await this.callGeminiAPI(fixPrompt, 0.0);
            console.log("Fixed response:", fixedResponse.substring(0, 300));
            itinerary = JSON.parse(fixedResponse);
          }
        } else {
          console.log("No JSON found in response, trying LLM fix");
          // Third attempt: call LLM again to fix JSON
          const fixPrompt = `Fix the JSON only: ${response}`;
          const fixedResponse = await this.callGeminiAPI(fixPrompt, 0.0);
          console.log("Fixed response:", fixedResponse.substring(0, 300));
          itinerary = JSON.parse(fixedResponse);
        }
      } catch (regexError) {
        console.error("All JSON parsing attempts failed:", regexError);
        throw regexError;
      }
    }

    // Validate the parsed JSON
    this.validateItinerary(itinerary, request);

    // Add generated_at if missing
    if (!itinerary.generated_at) {
      itinerary.generated_at = new Date().toISOString();
    }

    return itinerary;
  }

  private static validateItinerary(
    itinerary: ItineraryResponse,
    request: TravelRequest,
  ): void {
    // Validate required fields
    if (
      !itinerary.title ||
      !itinerary.meta ||
      !itinerary.days ||
      !Array.isArray(itinerary.days)
    ) {
      throw new Error("Missing required fields: title, meta, or days");
    }

    // Validate days array (1-14 days)
    if (itinerary.days.length < 1 || itinerary.days.length > 14) {
      throw new Error("Days must be between 1 and 14");
    }

    // Validate each day
    for (const day of itinerary.days) {
      if (!day.segments || !Array.isArray(day.segments)) {
        throw new Error(`Day ${day.day} missing segments`);
      }

      // Validate each segment with auto-fix
      for (const segment of day.segments) {
        // Validate time format (HH:MM) - fix if needed
        if (
          !segment.time ||
          !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(segment.time)
        ) {
          console.log(`Fixing invalid time: ${segment.time}`);
          segment.time = "09:00"; // Default time
        }

        // Validate duration and transport as integers - convert if needed
        if (typeof segment.duration_min === "string") {
          segment.duration_min = parseInt(segment.duration_min) || 60;
        }
        if (
          !Number.isInteger(segment.duration_min) ||
          segment.duration_min < 0
        ) {
          segment.duration_min = 60; // Default 1 hour
        }

        if (typeof segment.transport_min_to_next === "string") {
          segment.transport_min_to_next =
            parseInt(segment.transport_min_to_next) || 0;
        }
        if (
          !Number.isInteger(segment.transport_min_to_next) ||
          segment.transport_min_to_next < 0
        ) {
          segment.transport_min_to_next = 0; // Default no transport
        }

        // Ensure required string fields exist
        if (!segment.place) segment.place = "Unknown Location";
        if (!segment.note) segment.note = "Enjoy your visit";
        if (!segment.food) segment.food = "Local cuisine";
      }
    }

    // Validate budget estimates - be more lenient
    if (!itinerary.budget_estimate) {
      console.log("No budget_estimate found, creating default");
      itinerary.budget_estimate = { low: 3000, median: 7000, high: 15000 };
    } else {
      // Convert strings to numbers if needed
      if (typeof itinerary.budget_estimate.low === "string") {
        itinerary.budget_estimate.low = parseInt(itinerary.budget_estimate.low);
      }
      if (typeof itinerary.budget_estimate.median === "string") {
        itinerary.budget_estimate.median = parseInt(
          itinerary.budget_estimate.median,
        );
      }
      if (typeof itinerary.budget_estimate.high === "string") {
        itinerary.budget_estimate.high = parseInt(
          itinerary.budget_estimate.high,
        );
      }

      // Validate after conversion
      if (
        isNaN(itinerary.budget_estimate.low) ||
        isNaN(itinerary.budget_estimate.median) ||
        isNaN(itinerary.budget_estimate.high)
      ) {
        console.log("Invalid budget numbers, using defaults");
        itinerary.budget_estimate = { low: 3000, median: 7000, high: 15000 };
      } else {
        // Fix ordering if needed
        if (itinerary.budget_estimate.median < itinerary.budget_estimate.low) {
          itinerary.budget_estimate.median =
            itinerary.budget_estimate.low + 1000;
        }
        if (itinerary.budget_estimate.median > itinerary.budget_estimate.high) {
          itinerary.budget_estimate.high =
            itinerary.budget_estimate.median + 1000;
        }
      }
    }

    // Normalize dates to ISO and validate
    try {
      const startDate = new Date(request.startDate);
      const endDate = new Date(request.endDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error("Invalid date format in request");
      }

      // Validate meta dates match request
      if (
        itinerary.meta.start_date !== request.startDate ||
        itinerary.meta.end_date !== request.endDate
      ) {
        // Auto-correct meta dates to match request
        itinerary.meta.start_date = request.startDate;
        itinerary.meta.end_date = request.endDate;
      }
    } catch (dateError) {
      throw new Error(`Date validation failed: ${dateError}`);
    }
  }

  private static calculateDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  }

  /**
   * Normalize input for consistent caching
   */
  static normalizeInput(request: TravelRequest): TravelRequest {
    return {
      ...request,
      destination: request.destination.toLowerCase().trim(),
      travelers: request.travelers.toLowerCase().trim(),
      origin: request.origin?.toLowerCase().trim() || "",
    };
  }
}
