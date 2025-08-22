import { z } from 'zod';

// --- Input Schemas ---

/**
 * Validates a single point of interest.
 */
export const PlaceSchema = z.object({
  place: z.string().min(1, { message: 'Place name cannot be empty.' }),
  note: z.string(),
});
export type Place = z.infer<typeof PlaceSchema>;

/**
 * Validates a single day in the itinerary.
 */
export const DaySchema = z.object({
  day: z.number().int().positive(),
  segments: z.array(PlaceSchema),
});
export type Day = z.infer<typeof DaySchema>;

/**
 * Validates the root input object for a new itinerary enrichment request.
 */
export const BaseItinerarySchema = z.object({
  title: z.string().min(1, { message: 'Title cannot be empty.' }),
  days: z.array(DaySchema),
});
export type BaseItinerary = z.infer<typeof BaseItinerarySchema>;


// --- Output Schemas ---

/**
 * Holds the real-time data scraped for a single place.
 */
export const LiveDataSchema = z.object({
  operating_hours: z.string().optional().nullable(),
  rating: z.string().optional().nullable(),
  website_url: z.string().url().optional().nullable(),
  scraped_at: z.string().datetime(),
  error: z.string().optional().nullable(),
});
export type LiveData = z.infer<typeof LiveDataSchema>;

/**
 * Represents a place after it has been enriched with live data.
 */
export const EnrichedPlaceSchema = PlaceSchema.extend({
  live_data: LiveDataSchema.optional().nullable(),
});
export type EnrichedPlace = z.infer<typeof EnrichedPlaceSchema>;

/**
 * Represents a day composed of enriched places.
 */
export const EnrichedDaySchema = z.object({
  day: z.number().int(),
  segments: z.array(EnrichedPlaceSchema),
});
export type EnrichedDay = z.infer<typeof EnrichedDaySchema>;

/**
 * The final, enriched itinerary object returned by the API.
 */
export const EnrichedItinerarySchema = z.object({
  title: z.string(),
  days: z.array(EnrichedDaySchema),
});
export type EnrichedItinerary = z.infer<typeof EnrichedItinerarySchema>;
