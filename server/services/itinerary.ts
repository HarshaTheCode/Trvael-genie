import { RequestHandler } from "express";
import { randomUUID } from "crypto";
import {
  TravelRequest,
  GenerateItineraryResponse,
  GetItineraryResponse,
  ExportResponse,
} from "@shared/api";
import { LLMService } from "./llm";
import { CacheService } from "./cache";
import { ValidationService } from "./validation";
import { SupabaseService } from "./supabase";
import { PDFExportService } from "./pdf-export";

export const generateItinerary: RequestHandler = async (req, res) => {
  try {
    const sanitizedRequest = ValidationService.sanitizeRequest(req.body);
    const validation =
      ValidationService.validateTravelRequest(sanitizedRequest);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: `Validation failed: ${validation.errors.join(", ")}`,
      });
    }

    if (
      !ValidationService.isSupportedDestination(sanitizedRequest.destination)
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Currently we only support destinations within India. Please choose an Indian city or state.",
      });
    }

    const request: TravelRequest = {
      ...sanitizedRequest,
  userId: (req as any).user?.id,
    };

    const userIdOrIP = ValidationService.getUserIdentifier(req);

    const rateCheck = CacheService.checkRateLimit(userIdOrIP, !!request.userId);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: "Rate limit exceeded. Please try again tomorrow.",
      });
    }

    const cacheKey = CacheService.generateCacheKey(request);
    const cachedItinerary = CacheService.getCachedItinerary(cacheKey);

    if (cachedItinerary) {
      const itineraryId = randomUUID();
      if (request.userId) {
        await SupabaseService.storeItinerary({
          id: itineraryId,
          user_id: request.userId,
          input_payload: request,
          output_json: cachedItinerary,
          cached_key: cacheKey,
        });
      }

      const response: GenerateItineraryResponse = {
        success: true,
        itinerary: cachedItinerary,
        itineraryId: itineraryId,
      };
      return res.json(response);
    }

    try {
      const normalizedRequest = LLMService.normalizeInput(request);
      const itinerary = await LLMService.generateItinerary(normalizedRequest);

      CacheService.setCachedItinerary(cacheKey, itinerary);

      const itineraryId = randomUUID();
      if (request.userId) {
        await SupabaseService.storeItinerary({
          id: itineraryId,
          user_id: request.userId,
          input_payload: request,
          output_json: itinerary,
          cached_key: cacheKey,
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

    const storedItinerary = await SupabaseService.getItineraryById(id);
    
    if (!storedItinerary) {
      return res.status(404).json({
        success: false,
        error: "Itinerary not found",
      });
    }

    const response: GetItineraryResponse = {
      success: true,
      itinerary: storedItinerary.output_json,
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

    const storedItinerary = await SupabaseService.getItineraryById(itineraryId);
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

export const generatePDF: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { format = "html" } = req.query; // 'html' or 'text'

    const storedItinerary = await SupabaseService.getItineraryById(id);
    if (!storedItinerary) {
      return res.status(404).json({ error: "Itinerary not found" });
    }

    const itinerary = storedItinerary.output_json;

    if (format === "html") {
      const htmlContent = PDFExportService.generateHTML(itinerary);
      const filename = PDFExportService.getFilename(itinerary);
      res.setHeader("Content-Type", "text/html");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${filename.replace(".pdf", ".html")}"`,
      );
      res.send(htmlContent);
    } else {
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