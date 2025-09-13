import { RequestHandler } from "express";
import { randomUUID } from "crypto";
import {
  TravelRequest,
  GenerateItineraryResponse,
  GetItineraryResponse,
  ExportResponse,
  SaveEmailResponse,
} from "@shared/api";
import { LLMService } from "../services/llm";
import { CacheService } from "../services/cache";
import { ValidationService } from "../services/validation";
import { SupabaseService } from "../services/supabase";

// In-memory storage for development - in production, use PostgreSQL/Supabase
const itineraries = new Map();
const users = new Map();

export const generateItinerary: RequestHandler = async (req, res) => {
  try {
    // Sanitize and validate input
    const sanitizedRequest = ValidationService.sanitizeRequest(req.body);
    const validation =
      ValidationService.validateTravelRequest(sanitizedRequest);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: `Validation failed: ${validation.errors.join(", ")}`,
      });
    }

    // Check if destination is supported
    if (
      !ValidationService.isSupportedDestination(sanitizedRequest.destination)
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Currently we only support destinations within India. Please choose an Indian city or state.",
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
        error: "Rate limit exceeded. Please try again tomorrow.",
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
        created_at: new Date().toISOString(),
      });

      const response: GenerateItineraryResponse = {
        success: true,
        itinerary: cachedItinerary,
        itineraryId: itineraryId,
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

      // Store in Supabase database
      const itineraryId = randomUUID();
      let storedItinerary = null;
      
      try {
        storedItinerary = await SupabaseService.storeItinerary({
          id: itineraryId,
          user_id: request.userId,
          input_payload: normalizedRequest,
          output_json: itinerary,
          cached_key: cacheKey,
        });
      } catch (error) {
        console.error('Failed to store itinerary in Supabase:', error);
      }

      if (!storedItinerary) {
        console.log('Falling back to in-memory storage');
        // Fallback to in-memory storage
        itineraries.set(itineraryId, {
          id: itineraryId,
          user_id: request.userId,
          input_payload: normalizedRequest,
          output_json: itinerary,
          cached_key: cacheKey,
          created_at: new Date().toISOString(),
        });
      }

      const response: GenerateItineraryResponse = {
        success: true,
        itinerary: itinerary,
        itineraryId: itineraryId,
      };

      res.json(response);
    } catch (error) {
      console.error("LLM generation failed:", error);

      // Handle specific error types
      if (error instanceof Error) {
        if (error.message === "LLM_INVALID_JSON") {
          return res.status(502).json({
            success: false,
            error: "LLM_INVALID_JSON: Failed to generate valid itinerary. Please try again.",
          });
        } else if (error.message.startsWith("DATE_RANGE_TOO_LONG")) {
          return res.status(400).json({
            success: false,
            error:
              "DATE_RANGE_TOO_LONG: Please split trips longer than 14 days into smaller chunks",
          });
        } else if (error.message.includes("Rate limit exceeded")) {
          return res.status(429).json({
            success: false,
            error: "Rate limit exceeded. Please wait a few minutes and try again.",
          });
        } else if (error.message.includes("timed out")) {
          return res.status(408).json({
            success: false,
            error: "Request timed out. Please try again.",
          });
        } else if (error.message.includes("GEMINI_API_KEY not configured")) {
          return res.status(500).json({
            success: false,
            error: "API configuration error. Please contact support.",
          });
        }
      }

      // Log the actual error for debugging
      console.error("Unhandled LLM error:", error);
      res.status(502).json({
        success: false,
        error: "LLM_ERROR: " + (error instanceof Error ? error.message : "Unknown error"),
      });
    }
  } catch (error) {
    console.error("Generate itinerary error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const getItinerary: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // Try to get from Supabase first
    let storedItinerary = await SupabaseService.getItineraryById(id);
    
    // Fallback to in-memory storage if not found in Supabase
    if (!storedItinerary) {
      storedItinerary = itineraries.get(id);
    }
    
    if (!storedItinerary) {
      return res.status(404).json({
        success: false,
        error: "Itinerary not found",
      });
    }

    const response: GetItineraryResponse = {
      success: true,
      itinerary: storedItinerary.output_json || storedItinerary,
    };

    res.json(response);
  } catch (error) {
    console.error("Get itinerary error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const exportItinerary: RequestHandler = async (req, res) => {
  try {
    const { itineraryId } = req.body;

    if (!itineraryId) {
      return res.status(400).json({
        success: false,
        error: "Missing itineraryId",
      });
    }

    // Try in-memory first
    let storedItinerary = itineraries.get(itineraryId);
    // If not found, try Supabase
    if (!storedItinerary) {
      storedItinerary = await SupabaseService.getItineraryById(itineraryId);
    }
    if (!storedItinerary) {
      return res.status(404).json({
        success: false,
        error: "Itinerary not found",
      });
    }

    const pdfUrl = `/api/pdf/${itineraryId}`;
    const response: ExportResponse = {
      pdfUrl: pdfUrl,
    };
    res.json(response);
  } catch (error) {
    console.error("Export itinerary error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const saveEmail: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "Valid email required",
      });
    }

    // Store email for marketing (in-memory for MVP)
    const userId = randomUUID();
    users.set(userId, {
      id: userId,
      email: email,
      created_at: new Date().toISOString(),
    });

    const response: SaveEmailResponse = {
      success: true,
      message: "Email saved successfully",
    };

    res.json(response);
  } catch (error) {
    console.error("Save email error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

import { PDFExportService } from "../services/pdf-export";

// Professional PDF generation endpoint
export const generatePDF: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { format = "html" } = req.query; // 'html' or 'text'

    // Try in-memory first
    let storedItinerary = itineraries.get(id);
    // If not found, try Supabase
    if (!storedItinerary) {
      storedItinerary = await SupabaseService.getItineraryById(id);
    }
    if (!storedItinerary) {
      return res.status(404).json({ error: "Itinerary not found" });
    }

    // Support both in-memory and Supabase formats
    const itinerary = storedItinerary.output_json || storedItinerary;

    if (format === "html") {
      // Return HTML for PDF generation (can be used with puppeteer)
      const htmlContent = PDFExportService.generateHTML(itinerary);
      const filename = PDFExportService.getFilename(itinerary);
      res.setHeader("Content-Type", "text/html");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${filename.replace(".pdf", ".html")}"`,
      );
      res.send(htmlContent);
    } else {
      // Return professionally formatted text
      const pdfContent = PDFExportService.generateProfessionalPDF(itinerary);
      const filename = PDFExportService.getFilename(itinerary);
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename.replace(".pdf", ".txt")}"`,
      );
      res.send(pdfContent);
    }
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ error: "PDF generation failed" });
  }
};
