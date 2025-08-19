import { RequestHandler } from 'express';
import { randomUUID } from 'crypto';
import {
  TravelRequest,
  GenerateItineraryResponse,
  GetItineraryResponse,
  ExportResponse,
  SaveEmailResponse
} from '@shared/api';
import { LLMService } from '../services/llm';
import { CacheService } from '../services/cache';
import { ValidationService } from '../services/validation';

// In-memory storage for development - in production, use PostgreSQL/Supabase
const itineraries = new Map();
const users = new Map();

export const generateItinerary: RequestHandler = async (req, res) => {
  try {
    // Sanitize and validate input
    const sanitizedRequest = ValidationService.sanitizeRequest(req.body);
    const validation = ValidationService.validateTravelRequest(sanitizedRequest);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: `Validation failed: ${validation.errors.join(', ')}`
      });
    }

    // Check if destination is supported
    if (!ValidationService.isSupportedDestination(sanitizedRequest.destination)) {
      return res.status(400).json({
        success: false,
        error: 'Currently we only support destinations within India. Please choose an Indian city or state.'
      });
    }

    const request: TravelRequest = sanitizedRequest;

    // Get user identifier for rate limiting
    const userIdOrIP = ValidationService.getUserIdentifier(req);
    
    // Check rate limits
    const rateCheck = CacheService.checkRateLimit(userIdOrIP, !!request.userId);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Please try again tomorrow.'
      });
    }

    // Check cache first
    const cacheKey = CacheService.generateCacheKey(request);
    const cachedItinerary = CacheService.getCachedItinerary(cacheKey);
    
    if (cachedItinerary) {
      // Return cached result
      const itineraryId = randomUUID();
      itineraries.set(itineraryId, {
        id: itineraryId,
        user_id: request.userId,
        input_payload: request,
        output_json: cachedItinerary,
        cached_key: cacheKey,
        created_at: new Date().toISOString()
      });

      const response: GenerateItineraryResponse = {
        success: true,
        itinerary: cachedItinerary,
        itineraryId: itineraryId
      };
      return res.json(response);
    }

    // Generate new itinerary via LLM
    try {
      // Normalize input for consistent processing
      const normalizedRequest = LLMService.normalizeInput(request);
      const itinerary = await LLMService.generateItinerary(normalizedRequest);

      // Cache the result
      CacheService.setCachedItinerary(cacheKey, itinerary);

      // Store in database
      const itineraryId = randomUUID();
      itineraries.set(itineraryId, {
        id: itineraryId,
        user_id: request.userId,
        input_payload: normalizedRequest,
        output_json: itinerary,
        cached_key: cacheKey,
        created_at: new Date().toISOString()
      });

      const response: GenerateItineraryResponse = {
        success: true,
        itinerary: itinerary,
        itineraryId: itineraryId
      };

      res.json(response);
    } catch (error) {
      console.error('LLM generation failed:', error);

      // Handle specific error types
      if (error instanceof Error) {
        if (error.message === 'LLM_INVALID_JSON') {
          return res.status(502).json({
            success: false,
            error: 'LLM_INVALID_JSON'
          });
        } else if (error.message.startsWith('DATE_RANGE_TOO_LONG')) {
          return res.status(400).json({
            success: false,
            error: 'DATE_RANGE_TOO_LONG: Please split trips longer than 10 days into smaller chunks'
          });
        }
      }

      res.status(502).json({
        success: false,
        error: 'LLM_TIMEOUT'
      });
    }

  } catch (error) {
    console.error('Generate itinerary error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getItinerary: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    const storedItinerary = itineraries.get(id);
    if (!storedItinerary) {
      return res.status(404).json({
        success: false,
        error: 'Itinerary not found'
      });
    }

    const response: GetItineraryResponse = {
      success: true,
      itinerary: storedItinerary
    };
    
    res.json(response);
  } catch (error) {
    console.error('Get itinerary error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const exportItinerary: RequestHandler = async (req, res) => {
  try {
    const { itineraryId } = req.body;
    
    if (!itineraryId) {
      return res.status(400).json({
        success: false,
        error: 'Missing itineraryId'
      });
    }

    const storedItinerary = itineraries.get(itineraryId);
    if (!storedItinerary) {
      return res.status(404).json({
        success: false,
        error: 'Itinerary not found'
      });
    }

    // For MVP, we'll return a placeholder PDF URL
    // In production, implement actual PDF generation service
    const pdfUrl = `/api/pdf/${itineraryId}`;
    
    const response: ExportResponse = {
      pdfUrl: pdfUrl
    };
    
    res.json(response);
  } catch (error) {
    console.error('Export itinerary error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const saveEmail: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Valid email required'
      });
    }

    // Store email for marketing (in-memory for MVP)
    const userId = randomUUID();
    users.set(userId, {
      id: userId,
      email: email,
      created_at: new Date().toISOString()
    });

    const response: SaveEmailResponse = {
      success: true,
      message: 'Email saved successfully'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Save email error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// PDF generation endpoint (placeholder for MVP)
export const generatePDF: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    const storedItinerary = itineraries.get(id);
    if (!storedItinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }

    // For MVP, return a simple text representation
    // In production, use libraries like puppeteer or jsPDF
    const itinerary = storedItinerary.output_json;
    
    let pdfContent = `${itinerary.title}\n\n`;
    pdfContent += `Destination: ${itinerary.meta.destination}\n`;
    pdfContent += `Dates: ${itinerary.meta.start_date} to ${itinerary.meta.end_date}\n`;
    pdfContent += `Travelers: ${itinerary.meta.travelers}\n\n`;
    
    itinerary.days.forEach((day: any) => {
      pdfContent += `Day ${day.day} (${day.date}):\n`;
      day.segments.forEach((segment: any) => {
        pdfContent += `${segment.time} - ${segment.place} (${segment.duration_min}min)\n`;
        pdfContent += `  ${segment.note}\n`;
        if (segment.food) pdfContent += `  Food: ${segment.food}\n`;
      });
      pdfContent += `Tip: ${day.daily_tip}\n\n`;
    });

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="itinerary-${id}.txt"`);
    res.send(pdfContent);
    
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'PDF generation failed' });
  }
};
