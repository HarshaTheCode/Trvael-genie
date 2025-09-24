import { RequestHandler } from "express";
import { randomUUID } from "crypto";
import { SupabaseService } from "./supabase";

export const saveItinerary: RequestHandler = async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { itineraryData, originalRequest } = req.body;

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
      itinerary: savedItinerary,
    });
  } catch (error) {
    console.error("Save itinerary error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save itinerary",
    });
  }
};

export const getUserItineraries: RequestHandler = async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    let userItineraries = await SupabaseService.getUserItineraries(req.user.id);
    
    const formattedItineraries = userItineraries.map(item => ({
      id: item.id,
      title: item.output_json?.title || `Trip to ${item.input_payload?.destination || 'Unknown'}`,
      destination: item.input_payload?.destination || 'Unknown',
      startDate: item.input_payload?.startDate || '',
      endDate: item.input_payload?.endDate || '',
      createdAt: new Date(item.created_at),
      favorite: false, 
      tags: [], 
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

    if (itinerary.user_id !== req.user?.id) {
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