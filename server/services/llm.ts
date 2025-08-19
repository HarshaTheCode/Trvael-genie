import { TravelRequest, ItineraryResponse } from '@shared/api';
import { DestinationService } from './destinations';

export class LLMService {
  private static readonly GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
  private static readonly API_KEY = process.env.GEMINI_API_KEY;

  // Primary LLM system prompt (meta)
  private static readonly SYSTEM_PROMPT = `You are an expert Indian travel planner that returns MACHINE-READABLE JSON matching the given schema exactly. Use the local facts provided. Keep descriptions concise (<= 20 words). If you cannot answer, set fields to null.

Return ONLY a valid JSON object with this exact schema:
{
  "title": "string - concise itinerary title",
  "meta": {
    "destination": "string - destination from input",
    "start_date": "YYYY-MM-DD",
    "end_date": "YYYY-MM-DD", 
    "travelers": "string",
    "budget": "string",
    "style": "string"
  },
  "days": [
    {
      "day": number,
      "date": "YYYY-MM-DD",
      "segments": [
        {
          "time": "HH:MM",
          "place": "string",
          "duration_min": number,
          "note": "string (max 20 words)",
          "transport_min_to_next": number,
          "food": "string"
        }
      ],
      "daily_tip": "string (max 20 words)"
    }
  ],
  "budget_estimate": {
    "low": number,
    "median": number, 
    "high": number
  },
  "generated_at": "ISO8601 timestamp",
  "source_facts": ["array of strings with practical info"]
}`;

  static async generateItinerary(request: TravelRequest): Promise<ItineraryResponse> {
    if (!this.API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // Cost reduction strategy: limit date range
    const duration = this.calculateDays(request.startDate, request.endDate);
    if (duration > 10) {
      throw new Error('DATE_RANGE_TOO_LONG: Please split trips longer than 10 days into smaller chunks');
    }

    // Build destination snippet for RAG (150-300 tokens max)
    const destinationSnippet = DestinationService.getDestinationSnippet(request.destination);
    
    // User prompt template (exact format as specified)
    const userPrompt = `CONTEXT:
${destinationSnippet}

TASK:
Given this input:
${JSON.stringify(request)}

Generate EXACTLY ONE JSON object matching the provided itinerary schema. Use the destination facts above when relevant. Include budget_estimate in INR rounded to nearest 100. Provide generated_at as ISO8601. Keep sentences concise (under 20 words).

If multiple valid itineraries possible, pick the "best for given budget". Do not include additional commentary outside the JSON.`;

    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      try {
        const response = await this.callGeminiAPI(userPrompt, attempts === 1 ? 0.0 : 0.2);
        const itinerary = await this.parseAndValidateResponse(response, request);
        return itinerary;
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          console.error('LLM generation failed after retries:', error);
          throw new Error('LLM_INVALID_JSON');
        }
        // On first failure, try to fix the JSON with retry
        console.warn(`LLM attempt ${attempts} failed, retrying with temperature 0.0`);
      }
    }

    throw new Error('LLM_INVALID_JSON');
  }

  private static async callGeminiAPI(prompt: string, temperature: number = 0.2): Promise<string> {
    const payload = {
      contents: [
        {
          parts: [
            { text: this.SYSTEM_PROMPT },
            { text: prompt }
          ]
        }
      ],
      generationConfig: {
        temperature: temperature,
        maxOutputTokens: 1500,
        topK: 40,
        topP: 0.95
      }
    };

    const response = await fetch(`${this.GEMINI_API_URL}?key=${this.API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('No content in Gemini response');
    }

    return data.candidates[0].content.parts[0].text;
  }

  private static async parseAndValidateResponse(response: string, request: TravelRequest): Promise<ItineraryResponse> {
    let itinerary: ItineraryResponse;

    // Log the raw response for debugging
    console.log('Gemini API raw response:', response.substring(0, 500));

    try {
      // First attempt: direct JSON parse
      itinerary = JSON.parse(response);
    } catch (parseError) {
      console.log('Direct JSON parse failed, trying regex extraction');
      try {
        // Second attempt: extract JSON with regex
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          console.log('Extracted JSON:', jsonMatch[0].substring(0, 300));
          itinerary = JSON.parse(jsonMatch[0]);
        } else {
          console.log('No JSON found in response, trying LLM fix');
          // Third attempt: call LLM again to fix JSON
          const fixPrompt = `Fix the JSON only: ${response}`;
          const fixedResponse = await this.callGeminiAPI(fixPrompt, 0.0);
          console.log('Fixed response:', fixedResponse.substring(0, 300));
          itinerary = JSON.parse(fixedResponse);
        }
      } catch (regexError) {
        console.error('All JSON parsing attempts failed:', regexError);
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

  private static validateItinerary(itinerary: ItineraryResponse, request: TravelRequest): void {
    // Validate required fields
    if (!itinerary.title || !itinerary.meta || !itinerary.days || !Array.isArray(itinerary.days)) {
      throw new Error('Missing required fields: title, meta, or days');
    }

    // Validate days array (1-14 days)
    if (itinerary.days.length < 1 || itinerary.days.length > 14) {
      throw new Error('Days must be between 1 and 14');
    }

    // Validate each day
    for (const day of itinerary.days) {
      if (!day.segments || !Array.isArray(day.segments)) {
        throw new Error(`Day ${day.day} missing segments`);
      }

      // Validate each segment
      for (const segment of day.segments) {
        // Validate time format (HH:MM)
        if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(segment.time)) {
          throw new Error(`Invalid time format: ${segment.time}. Must be HH:MM`);
        }

        // Validate duration and transport as integers
        if (!Number.isInteger(segment.duration_min) || segment.duration_min < 0) {
          throw new Error(`Invalid duration_min: ${segment.duration_min}. Must be positive integer`);
        }

        if (!Number.isInteger(segment.transport_min_to_next) || segment.transport_min_to_next < 0) {
          throw new Error(`Invalid transport_min_to_next: ${segment.transport_min_to_next}. Must be non-negative integer`);
        }
      }
    }

    // Validate budget estimates
    if (!itinerary.budget_estimate || 
        typeof itinerary.budget_estimate.low !== 'number' ||
        typeof itinerary.budget_estimate.median !== 'number' ||
        typeof itinerary.budget_estimate.high !== 'number') {
      throw new Error('Invalid budget_estimate structure');
    }

    // Validate budget ordering
    if (itinerary.budget_estimate.median < itinerary.budget_estimate.low ||
        itinerary.budget_estimate.median > itinerary.budget_estimate.high) {
      throw new Error('Budget median must be between low and high values');
    }

    // Normalize dates to ISO and validate
    try {
      const startDate = new Date(request.startDate);
      const endDate = new Date(request.endDate);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Invalid date format in request');
      }

      // Validate meta dates match request
      if (itinerary.meta.start_date !== request.startDate || 
          itinerary.meta.end_date !== request.endDate) {
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
      origin: request.origin?.toLowerCase().trim() || ''
    };
  }
}
