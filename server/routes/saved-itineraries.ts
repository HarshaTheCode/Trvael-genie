import { RequestHandler } from "express";
import { randomUUID } from "crypto";
import crypto from "crypto";
import { ItineraryResponse, TravelRequest } from "@shared/api";
import { SupabaseService } from "../services/supabase";



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
    
    const savedItinerary = await SupabaseService.storeItinerary({
      id: itineraryId,
      user_id: req.user.id,
      input_payload: originalRequest,
      output_json: itineraryData,
    });

    if (!savedItinerary) {
      return res.status(500).json({
        success: false,
        message: "Failed to save itinerary to database",
      });
    }
    
    res.json({
      success: true,
      message: "Trip saved successfully!",
      itinerary: {
        id: savedItinerary.id,
        title: title || `Trip to ${originalRequest.destination}`,
        destination: originalRequest.destination,
        startDate: originalRequest.startDate,
        endDate: originalRequest.endDate,
        createdAt: savedItinerary.created_at,
        favorite: false,
        tags: [],
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

    let userItineraries = await SupabaseService.getUserItineraries(req.user.id);
    
    // Transform Supabase data to match expected format
    const formattedItineraries = userItineraries.map(item => ({
      id: item.id,
      title: item.output_json?.title || `Trip to ${item.input_payload?.destination || 'Unknown'}`,
      destination: item.input_payload?.destination || 'Unknown',
      startDate: item.input_payload?.startDate || '',
      endDate: item.input_payload?.endDate || '',
      createdAt: new Date(item.created_at),
      favorite: false, // Default value, you might want to store this in the DB
      tags: [], // Default value, you might want to store this in the DB
    }));

    res.json({
      success: true,
      itineraries: formattedItineraries,
      total: formattedItineraries.length,
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
    const itinerary = await SupabaseService.getItineraryById(id);

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: "Itinerary not found",
      });
    }

    // Check if user owns this itinerary or if it's public
    if (itinerary.user_id !== req.user?.id && !itinerary.is_public) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      itinerary: {
        id: itinerary.id,
        title: itinerary.output_json?.title || `Trip to ${itinerary.input_payload?.destination}`,
        itineraryData: itinerary.output_json,
        originalRequest: itinerary.input_payload,
        favorite: false, // Add to DB later
        tags: [], // Add to DB later
        isPublic: itinerary.is_public,
        publicShareId: itinerary.public_share_id,
        createdAt: itinerary.created_at,
        updatedAt: itinerary.updated_at,
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
    const itinerary = await SupabaseService.getItineraryById(id);

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: "Itinerary not found",
      });
    }

    if (itinerary.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    let shareId = itinerary.public_share_id;
    if (!shareId) {
      shareId = crypto.randomBytes(16).toString("hex");
      const updated = await SupabaseService.updateItinerary(id, {
        public_share_id: shareId,
        is_public: true,
        updated_at: new Date().toISOString(),
      });

      if (!updated) {
        return res.status(500).json({ success: false, message: "Failed to create share link" });
      }
    }

    const shareUrl = `${process.env.FRONTEND_URL || "http://localhost:8080"}/share/${shareId}`;

    res.json({
      success: true,
      message: "Share link generated successfully",
      shareUrl,
      shareId,
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
    const itinerary = await SupabaseService.getItineraryByShareId(shareId);

    if (!itinerary || !itinerary.is_public) {
      return res.status(404).json({
        success: false,
        message: "Shared itinerary not found or no longer public",
      });
    }

    res.json({
      success: true,
      itinerary: {
        title: itinerary.output_json.title,
        itineraryData: itinerary.output_json,
        originalRequest: {
          destination: itinerary.input_payload.destination,
          startDate: itinerary.input_payload.startDate,
          endDate: itinerary.input_payload.endDate,
          travelers: itinerary.input_payload.travelers,
          budget: itinerary.input_payload.budget,
          style: itinerary.input_payload.style,
        },
        createdAt: itinerary.created_at,
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
    const itinerary = await SupabaseService.getItineraryById(id);

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: "Itinerary not found",
      });
    }

    if (itinerary.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const success = await SupabaseService.deleteItinerary(id);

    if (!success) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete itinerary from database",
      });
    }

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
    
    const itinerary = await SupabaseService.getItineraryById(id);

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: "Itinerary not found",
      });
    }

    if (itinerary.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Prepare updates
    const updates: any = {};
    if (title !== undefined) {
      // We need to update the JSON blob
      const newOutputJson = { ...itinerary.output_json, title };
      updates.output_json = newOutputJson;
    }
    // TODO: Add favorite and tags to the database schema
    // if (favorite !== undefined) updates.favorite = favorite;
    // if (tags !== undefined) updates.tags = tags;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No updates provided" });
    }

    updates.updated_at = new Date().toISOString();

    const updatedItinerary = await SupabaseService.updateItinerary(id, updates);

    if (!updatedItinerary) {
      return res.status(500).json({
        success: false,
        message: "Failed to update itinerary",
      });
    }

    res.json({
      success: true,
      message: "Itinerary updated successfully",
      itinerary: {
        id: updatedItinerary.id,
        title: updatedItinerary.output_json.title,
        // favorite: updatedItinerary.favorite,
        // tags: updatedItinerary.tags,
        updatedAt: updatedItinerary.updated_at,
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
