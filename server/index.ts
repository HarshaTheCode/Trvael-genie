import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  generateItinerary,
  getItinerary,
  exportItinerary,
  saveEmail,
  generatePDF
} from "./routes/itinerary";
import {
  sendMagicLink,
  verifyMagicLink,
  getCurrentUser,
  logout,
  refreshToken
} from "./routes/auth";
import {
  saveItinerary,
  getUserItineraries,
  getSavedItinerary,
  generateShareLink,
  getPublicItinerary,
  deleteItinerary,
  updateItinerary
} from "./routes/saved-itineraries";
import {
  submitFeedback,
  getFeedbackStats,
  checkUserFeedback,
  getAllFeedback
} from "./routes/feedback";
import { authenticateJWT, optionalAuth, authenticateAdmin } from "./services/auth";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Health check routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Authentication routes
  app.post("/api/auth/magic-link", sendMagicLink);
  app.post("/api/auth/verify", verifyMagicLink);
  app.get("/api/auth/me", authenticateJWT, getCurrentUser);
  app.post("/api/auth/logout", logout);
  app.post("/api/auth/refresh", authenticateJWT, refreshToken);

  // Travel Itinerary API routes (with optional auth for anonymous usage)
  app.post("/api/generate-itinerary", optionalAuth, generateItinerary);
  app.get("/api/itineraries/:id", optionalAuth, getItinerary);
  app.post("/api/export", exportItinerary);
  app.post("/api/save-email", saveEmail);
  app.get("/api/pdf/:id", generatePDF);

  // Saved Itineraries routes (require authentication)
  app.post("/api/itineraries", authenticateJWT, saveItinerary);
  app.get("/api/itineraries", authenticateJWT, getUserItineraries);
  app.get("/api/itineraries/:id", optionalAuth, getSavedItinerary);
  app.patch("/api/itineraries/:id/share", authenticateJWT, generateShareLink);
  app.patch("/api/itineraries/:id", authenticateJWT, updateItinerary);
  app.delete("/api/itineraries/:id", authenticateJWT, deleteItinerary);

  // Public sharing routes (no auth required)
  app.get("/api/public/itinerary/:shareId", getPublicItinerary);

  // Feedback routes
  app.post("/api/feedback", optionalAuth, submitFeedback);
  app.get("/api/feedback/:itineraryId", getFeedbackStats);
  app.get("/api/feedback/check/:itineraryId", optionalAuth, checkUserFeedback);
  app.get("/api/admin/feedback", authenticateAdmin, getAllFeedback);

  return app;
}
