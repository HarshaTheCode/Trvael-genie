import { RequestHandler } from "express";
import { randomUUID } from "crypto";
import crypto from "crypto";
import { ItineraryResponse, TravelRequest } from "@shared/api";
import { SupabaseService } from "../services/supabase";

// In-memory storage for development (replace with database)
interface SavedItinerary {
  id: string;
  userId: string;
  title: string;
  itineraryData: ItineraryResponse;
  originalRequest: TravelRequest;
  publicShareId?: string;
  isPublic: boolean;
  favorite: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const savedItineraries = new Map<string, SavedItinerary>();
const publicItineraries = new Map<string, SavedItinerary>(); // shareId -> itinerary

/**
 * Save an itinerary for authenticated user
 * POST /api/itineraries
 */
export const saveItinerary: RequestHandler = async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { itineraryData, originalRequest, title, tags = [] } = req.body;

    if (!itineraryData || !originalRequest) {
      return res.status(400).json({
        success: false,
        message: "Itinerary data and original request are required",
      });
    }

    const itineraryId = randomUUID();
    const savedItinerary: SavedItinerary = {
      id: itineraryId,
      userId: req.user.id,
      title: title || `Trip to ${originalRequest.destination}`,
      itineraryData,
      originalRequest,
      isPublic: false,
      favorite: false,
      tags: Array.isArray(tags) ? tags : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    savedItineraries.set(itineraryId, savedItinerary);

    res.json({
      success: true,
      message: "Trip saved successfully!",
      itinerary: {
        id: savedItinerary.id,
        title: savedItinerary.title,
        destination: originalRequest.destination,
        startDate: originalRequest.startDate,
        endDate: originalRequest.endDate,
        createdAt: savedItinerary.createdAt,
        favorite: savedItinerary.favorite,
        tags: savedItinerary.tags,
      },
    });
  } catch (error) {
    console.error("Save itinerary error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save itinerary",
    });
  }
};

/**
 * Get all saved itineraries for authenticated user
 * GET /api/itineraries
 */
export const getUserItineraries: RequestHandler = async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Try to get from Supabase first
    let userItineraries = [];
    
    try {
      userItineraries = await SupabaseService.getUserItineraries(req.user.id);
      
      // Transform Supabase data to match expected format
      if (userItineraries.length > 0) {
        userItineraries = userItineraries.map(item => ({
          id: item.id,
          title: item.output_json?.title || `Trip to ${item.input_payload?.destination || 'Unknown'}`,
          destination: item.input_payload?.destination || 'Unknown',
          startDate: item.input_payload?.startDate || '',
          endDate: item.input_payload?.endDate || '',
          createdAt: new Date(item.created_at),
          favorite: false, // Default value
          tags: [], // Default value
        }));
      }
    } catch (error) {
      console.error('Error fetching from Supabase:', error);
      console.log('Falling back to in-memory storage');
    }
    
    // Fallback to in-memory storage if Supabase failed or returned no results
    if (userItineraries.length === 0) {
      userItineraries = Array.from(savedItineraries.values())
        .filter((itinerary) => itinerary.userId === req.user.id)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((itinerary) => ({
          id: itinerary.id,
          title: itinerary.title,
          destination: itinerary.originalRequest.destination,
          startDate: itinerary.originalRequest.startDate,
          endDate: itinerary.originalRequest.endDate,
          travelers: itinerary.originalRequest.travelers,
          budget: itinerary.originalRequest.budget,
          style: itinerary.originalRequest.style,
          createdAt: itinerary.createdAt,
          updatedAt: itinerary.updatedAt,
          favorite: itinerary.favorite,
          tags: itinerary.tags,
          isPublic: itinerary.isPublic,
          publicShareId: itinerary.publicShareId,
        }));
    }

    res.json({
      success: true,
      itineraries: userItineraries,
      total: userItineraries.length,
    });
  } catch (error) {
    console.error("Get user itineraries error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch itineraries",
    });
  }
}

/**
 * Get a specific saved itinerary
 * GET /api/itineraries/:id
 */
export const getSavedItinerary: RequestHandler = async (req: any, res) => {
  try {
    const { id } = req.params;
    const itinerary = savedItineraries.get(id);

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: "Itinerary not found",
      });
    }

    // Check if user owns this itinerary or if it's public
    if (itinerary.userId !== req.user?.id && !itinerary.isPublic) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      itinerary: {
        id: itinerary.id,
        title: itinerary.title,
        itineraryData: itinerary.itineraryData,
        originalRequest: itinerary.originalRequest,
        favorite: itinerary.favorite,
        tags: itinerary.tags,
        isPublic: itinerary.isPublic,
        publicShareId: itinerary.publicShareId,
        createdAt: itinerary.createdAt,
        updatedAt: itinerary.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get saved itinerary error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch itinerary",
    });
  }
};

/**
 * Generate public share link for itinerary
 * PATCH /api/itineraries/:id/share
 */
export const generateShareLink: RequestHandler = async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { id } = req.params;
    const itinerary = savedItineraries.get(id);

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: "Itinerary not found",
      });
    }

    if (itinerary.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Generate public share ID if not exists
    if (!itinerary.publicShareId) {
      itinerary.publicShareId = crypto.randomBytes(16).toString("hex");
      itinerary.isPublic = true;
      itinerary.updatedAt = new Date();
      publicItineraries.set(itinerary.publicShareId, itinerary);
    }

    const shareUrl = `${process.env.FRONTEND_URL || "http://localhost:8080"}/share/${itinerary.publicShareId}`;

    res.json({
      success: true,
      message: "Share link generated successfully",
      shareUrl,
      shareId: itinerary.publicShareId,
    });
  } catch (error) {
    console.error("Generate share link error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate share link",
    });
  }
};

/**
 * Get public itinerary by share ID
 * GET /api/public/itinerary/:shareId
 */
export const getPublicItinerary: RequestHandler = async (req, res) => {
  try {
    const { shareId } = req.params;
    const itinerary = publicItineraries.get(shareId);

    if (!itinerary || !itinerary.isPublic) {
      return res.status(404).json({
        success: false,
        message: "Shared itinerary not found or no longer public",
      });
    }

    res.json({
      success: true,
      itinerary: {
        title: itinerary.title,
        itineraryData: itinerary.itineraryData,
        originalRequest: {
          destination: itinerary.originalRequest.destination,
          startDate: itinerary.originalRequest.startDate,
          endDate: itinerary.originalRequest.endDate,
          travelers: itinerary.originalRequest.travelers,
          budget: itinerary.originalRequest.budget,
          style: itinerary.originalRequest.style,
        },
        createdAt: itinerary.createdAt,
      },
    });
  } catch (error) {
    console.error("Get public itinerary error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch shared itinerary",
    });
  }
};

/**
 * Delete saved itinerary
 * DELETE /api/itineraries/:id
 */
export const deleteItinerary: RequestHandler = async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { id } = req.params;
    const itinerary = savedItineraries.get(id);

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: "Itinerary not found",
      });
    }

    if (itinerary.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Remove from public share if exists
    if (itinerary.publicShareId) {
      publicItineraries.delete(itinerary.publicShareId);
    }

    savedItineraries.delete(id);

    res.json({
      success: true,
      message: "Itinerary deleted successfully",
    });
  } catch (error) {
    console.error("Delete itinerary error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete itinerary",
    });
  }
};

/**
 * Update itinerary (toggle favorite, update tags, etc.)
 * PATCH /api/itineraries/:id
 */
export const updateItinerary: RequestHandler = async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { id } = req.params;
    const { title, favorite, tags } = req.body;
    const itinerary = savedItineraries.get(id);

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: "Itinerary not found",
      });
    }

    if (itinerary.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Update fields
    if (title !== undefined) itinerary.title = title;
    if (favorite !== undefined) itinerary.favorite = favorite;
    if (tags !== undefined) itinerary.tags = Array.isArray(tags) ? tags : [];
    itinerary.updatedAt = new Date();

    res.json({
      success: true,
      message: "Itinerary updated successfully",
      itinerary: {
        id: itinerary.id,
        title: itinerary.title,
        favorite: itinerary.favorite,
        tags: itinerary.tags,
        updatedAt: itinerary.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update itinerary error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update itinerary",
    });
  }
};
