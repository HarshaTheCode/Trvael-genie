import pLimit from 'p-limit';
import { scrapeUrl } from './scraper';
import {
  BaseItinerary,
  EnrichedDay,
  EnrichedItinerary,
  EnrichedPlace,
  EnrichedPlaceSchema,
  LiveData,
  Place,
} from '../schemas/itinerarySchemas';
import { config } from '../config';
import { google_search } from 'agent_tools'; // Hypothetical import

/**
 * Finds the best URL from a string of search results.
 * @param searchResults The raw string from the google_search tool.
 * @returns The best URL found, or null.
 */
const findBestUrl = (searchResults: string): string | null => {
  if (!searchResults) return null;
  // A simple regex to find the first URL. A more robust implementation
  // would prioritize known-good domains.
  const urlMatch = searchResults.match(/https?:\/\/[^\s/$.?#].[^\s]*/);
  return urlMatch ? urlMatch[0] : null;
};

/**
 * Enriches a single place by finding a source URL and scraping it.
 * This function is designed to be wrapped by a promise limiter.
 * @param place The place to enrich.
 * @returns A promise that resolves to an EnrichedPlace.
 */
const enrichSinglePlace = async (place: Place): Promise<EnrichedPlace> => {
  let liveData: LiveData;
  try {
    const query = `"${place.place}" "${place.note}" official website hours rating`;
    console.log(`Searching for: ${place.place}`);
    const searchResults = await google_search({ query });

    const urlToScrape = findBestUrl(searchResults);
    if (!urlToScrape) {
      throw new Error('Could not find a suitable URL from search results.');
    }

    console.log(`Scraping URL for '${place.place}': ${urlToScrape}`);
    liveData = await scrapeUrl(urlToScrape);

  } catch (error: any) {
    console.error(`Failed to enrich "${place.place}":`, error.message);
    liveData = {
      scraped_at: new Date().toISOString(),
      error: error.message,
      operating_hours: null,
      rating: null,
      website_url: null,
    };
  }

  return {
    ...place,
    live_data: liveData,
  };
};

/**
 * Orchestrates the concurrent enrichment of a full itinerary.
 * @param baseItinerary The itinerary to enrich.
 * @returns A promise that resolves to the EnrichedItinerary.
 */
export const enrichItinerary = async (baseItinerary: BaseItinerary): Promise<EnrichedItinerary> => {
  const limit = pLimit(config.concurrencyLimit);

  const allPlaces = baseItinerary.days.flatMap(day => day.segments);

  const enrichmentTasks = allPlaces.map(place => {
    return limit(() => enrichSinglePlace(place));
  });

  const enrichedPlaces = await Promise.all(enrichmentTasks);

  const enrichedMap = new Map<string, EnrichedPlace>();
  enrichedPlaces.forEach(p => enrichedMap.set(`${p.place}-${p.note}`, p));

  const enrichedDays: EnrichedDay[] = baseItinerary.days.map(day => ({
    ...day,
    segments: day.segments.map(place => enrichedMap.get(`${place.place}-${place.note}`)!),
  }));

  return {
    title: baseItinerary.title,
    days: enrichedDays,
  };
};
