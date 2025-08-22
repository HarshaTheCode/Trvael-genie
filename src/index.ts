import express, { Request, Response } from 'express';
import { ZodError } from 'zod';
import { BaseItinerarySchema } from './schemas/itinerarySchemas';
import { enrichItinerary } from './services/orchestrator';

const app = express();
const port = process.env.PORT || 8080;

// Middleware to parse JSON bodies. A limit is set to prevent payload-based attacks.
app.use(express.json({ limit: '5mb' }));

/**
 * A simple health check endpoint to confirm the service is up and running.
 */
app.get('/', (req: Request, res: Response) => {
  res.status(200).send('Orion Enrichment Service is active.');
});

/**
 * The main endpoint for enriching an itinerary.
 * It validates the input and delegates the core logic to the orchestrator service.
 */
app.post('/enrich', async (req: Request, res: Response) => {
  try {
    // 1. Validate the request body against the Zod schema.
    // This provides runtime validation and type safety.
    const baseItinerary = BaseItinerarySchema.parse(req.body);

    // 2. Delegate the complex enrichment logic to the orchestration service.
    const enrichedItinerary = await enrichItinerary(baseItinerary);

    // 3. Return the successful response.
    res.status(200).json(enrichedItinerary);

  } catch (error) {
    // Handle validation errors from Zod specifically.
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: 'Invalid request body provided.',
        errors: error.flatten().fieldErrors,
      });
    }

    // Handle any other unexpected errors during the process.
    console.error('An unexpected error occurred in the /enrich endpoint:', error);
    return res.status(500).json({
      message: 'An internal server error occurred. Please try again later.',
    });
  }
});

// Start the server only if this file is run directly (useful for testing)
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Orion server listening at http://localhost:${port}`);
  });
}

// Export the app for potential use in serverless environments or supertest
export default app;
