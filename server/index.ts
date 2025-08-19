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

  // Travel Itinerary API routes
  app.post("/api/generate-itinerary", generateItinerary);
  app.get("/api/itineraries/:id", getItinerary);
  app.post("/api/export", exportItinerary);
  app.post("/api/save-email", saveEmail);
  app.get("/api/pdf/:id", generatePDF);

  return app;
}
