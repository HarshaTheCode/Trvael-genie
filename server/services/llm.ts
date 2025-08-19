import { TravelRequest, ItineraryResponse } from '@shared/api';

export class LLMService {
  private static readonly SYSTEM_PROMPT = `You are an expert travel planner specializing in India. Generate detailed, culturally rich itineraries based on user preferences.

CRITICAL: You must respond with ONLY valid JSON matching the exact schema below. No additional text, explanations, or markdown formatting.

Required JSON Schema:
{
  "title": "string - concise itinerary title",
  "meta": {
    "destination": "string - destination from input",
    "start_date": "YYYY-MM-DD - from input",
    "end_date": "YYYY-MM-DD - from input", 
    "travelers": "string - from input",
    "budget": "string - from input",
    "style": "string - from input"
  },
  "days": [
    {
      "day": number,
      "date": "YYYY-MM-DD",
      "segments": [
        {
          "time": "HH:MM - 24h format",
          "place": "string - specific attraction/location",
          "duration_min": number,
          "note": "string - helpful tip or highlight",
          "transport_min_to_next": number,
          "food": "string - local food recommendation"
        }
      ],
      "daily_tip": "string - practical daily advice"
    }
  ],
  "budget_estimate": {
    "low": number,
    "median": number, 
    "high": number
  },
  "generated_at": "ISO8601 timestamp",
  "source_facts": ["string array of practical info about places/timings"]
}

Guidelines:
- Include 4-6 segments per day based on trip duration
- Start days between 8-9 AM, end by 7-8 PM
- Account for travel time between locations
- Suggest authentic local foods at each segment
- Budget estimates in INR per person for the entire trip
- Include practical timing/access information in source_facts
- Match the travel style: culture (temples, heritage), adventure (trekking, activities), food (restaurants, markets), relax (spas, scenic spots)
- Consider budget: low (hostels, street food), medium (3-star hotels, mid-range restaurants), high (luxury hotels, fine dining)`;

  private static readonly API_URL = process.env.LLM_API_URL || 'https://api.openai.com/v1/chat/completions';
  private static readonly API_KEY = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY;

  static async generateItinerary(request: TravelRequest): Promise<ItineraryResponse> {
    if (!this.API_KEY) {
      throw new Error('LLM_API_KEY not configured');
    }

    const userPrompt = this.buildUserPrompt(request);
    
    const payload = {
      model: process.env.LLM_MODEL || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: this.SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    };

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`LLM API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content in LLM response');
      }

      // Attempt to parse and validate JSON
      let itinerary: ItineraryResponse;
      try {
        itinerary = JSON.parse(content);
      } catch (parseError) {
        // Attempt auto-fix: trim whitespace and try again
        const trimmed = content.trim();
        try {
          itinerary = JSON.parse(trimmed);
        } catch (secondParseError) {
          // Attempt auto-fix: wrap in object if needed
          try {
            itinerary = JSON.parse(`{${trimmed}}`);
          } catch (finalParseError) {
            throw new Error('LLM returned malformed JSON');
          }
        }
      }

      // Basic validation
      if (!itinerary.title || !itinerary.meta || !itinerary.days || !Array.isArray(itinerary.days)) {
        throw new Error('LLM response missing required fields');
      }

      // Add generated_at if missing
      if (!itinerary.generated_at) {
        itinerary.generated_at = new Date().toISOString();
      }

      return itinerary;

    } catch (error) {
      console.error('LLM generation error:', error);
      throw new Error('LLM_TIMEOUT');
    }
  }

  private static buildUserPrompt(request: TravelRequest): string {
    const duration = this.calculateDays(request.startDate, request.endDate);
    
    return `Generate a ${duration}-day itinerary for:
Destination: ${request.destination}
Dates: ${request.startDate} to ${request.endDate}
Travelers: ${request.travelers}
Budget: ${request.budget}
Style: ${request.style}
${request.origin ? `Starting from: ${request.origin}` : ''}

Focus on ${request.style} experiences with ${request.budget} budget accommodations and dining.`;
  }

  private static calculateDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  }
}
