import axios, { AxiosError } from 'axios';
import * as cheerio from 'cheerio';
import { LiveData } from '../schemas/itinerarySchemas';

// A simple list of user agents to rotate through.
// In a production app, this should come from a configuration file.
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
];

const getRandomUserAgent = (): string => {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
};

/**
 * Extracts data from embedded application/ld+json scripts. This is the primary, most reliable method.
 * @param $ A cheerio instance representing the document.
 * @returns A partial LiveData object containing any found data.
 */
const _extractFromLdJson = ($: cheerio.CheerioAPI): Partial<Omit<LiveData, 'scraped_at' | 'error'>> => {
  const extractedData: Partial<Omit<LiveData, 'scraped_at' | 'error'>> = {};

  $('script[type="application/ld+json"]').each((_, element) => {
    try {
      const scriptContent = $(element).html();
      if (!scriptContent) return;

      const data = JSON.parse(scriptContent);
      const graph = data['@graph'] || [data];

      for (const item of graph) {
        if (typeof item !== 'object' || item === null) continue;

        const type = item['@type'] || '';
        const isPlace = ['Place', 'LocalBusiness', 'Restaurant', 'TouristAttraction', 'Museum'].some(placeType => type.includes(placeType));

        if (isPlace) {
          if (item.openingHours && !extractedData.operating_hours) {
            extractedData.operating_hours = Array.isArray(item.openingHours) ? item.openingHours.join(', ') : String(item.openingHours);
          }
          if (item.aggregateRating?.ratingValue && !extractedData.rating) {
            extractedData.rating = String(item.aggregateRating.ratingValue);
          }
          if (item.url && !extractedData.website_url) {
            extractedData.website_url = item.url;
          }
        }
      }
    } catch (e) {
      console.error('Failed to parse a JSON-LD script:', e);
    }
  });

  return extractedData;
};

/**
 * Scrapes a single URL for place information using axios and cheerio.
 * It prioritizes structured JSON-LD data for reliability.
 * @param url The URL to scrape.
 * @returns A promise that resolves to a LiveData object.
 */
export const scrapeUrl = async (url: string): Promise<LiveData> => {
  const scraped_at = new Date().toISOString();

  try {
    const response = await axios.get(url, {
      headers: { 'User-Agent': getRandomUserAgent() },
      timeout: 15000, // 15-second timeout for resilience
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const scrapedData = _extractFromLdJson($);

    // Fallback for website URL if not found in structured data.
    if (!scrapedData.website_url) {
      scrapedData.website_url = url;
    }

    return {
      operating_hours: scrapedData.operating_hours ?? null,
      rating: scrapedData.rating ?? null,
      website_url: scrapedData.website_url ?? null,
      scraped_at,
      error: null,
    };
  } catch (error) {
    let errorMessage = `An unknown error occurred while processing ${url}.`;
    if (axios.isAxiosError(error)) {
      errorMessage = `Failed to fetch ${url}: ${error.message}`;
    } else if (error instanceof Error) {
      errorMessage = `An error occurred during parsing for ${url}: ${error.message}`;
    }

    console.error(errorMessage);
    return {
      scraped_at,
      error: errorMessage,
      operating_hours: null,
      rating: null,
      website_url: null,
    };
  }
};
