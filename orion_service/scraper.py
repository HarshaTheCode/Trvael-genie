import asyncio
import json
import logging
from datetime import datetime, timezone

import aiohttp
from bs4 import BeautifulSoup

from orion_service import config, schemas

# Configure logging for the module
logging.basicConfig(level=logging.INFO, format='%(asctime)s - [%(levelname)s] - %(message)s')

def _extract_from_ld_json(soup: BeautifulSoup) -> dict:
    """
    Finds and parses application/ld+json scripts in the page to extract structured data.
    It checks for common schema.org types related to places.
    """
    extracted_data = {}
    try:
        ld_json_scripts = soup.find_all('script', type='application/ld+json')
        for script in ld_json_scripts:
            if not script.string:
                continue

            data = json.loads(script.string)
            # A page can have a single JSON-LD object or a @graph list of objects
            graph = data.get('@graph', [data])
            for item in graph:
                # Ensure item is a dictionary before processing
                if not isinstance(item, dict):
                    continue

                item_type = item.get('@type', '')
                is_place = isinstance(item_type, str) and item_type in [
                    'Place', 'LocalBusiness', 'Restaurant', 'TouristAttraction', 'Museum'
                ]
                if not is_place:
                    continue

                # Extract data points, only if not already found
                if 'openingHours' in item and not extracted_data.get('operating_hours'):
                    hours = item['openingHours']
                    extracted_data['operating_hours'] = ", ".join(hours) if isinstance(hours, list) else str(hours)

                if 'aggregateRating' in item and not extracted_data.get('rating'):
                    rating_info = item.get('aggregateRating', {})
                    if 'ratingValue' in rating_info:
                        extracted_data['rating'] = str(rating_info['ratingValue'])

                if 'url' in item and not extracted_data.get('website_url'):
                    extracted_data['website_url'] = item['url']

                # If we have all key data points, we can stop parsing this graph
                if 'operating_hours' in extracted_data and 'rating' in extracted_data:
                    break
    except (json.JSONDecodeError, TypeError, AttributeError) as e:
        logging.warning(f"Could not parse LD+JSON data: {e}")

    return extracted_data

async def _fetch_html(session: aiohttp.ClientSession, url: str) -> str:
    """
    Fetches HTML content from a URL.
    This function will raise exceptions on failure, to be handled by the caller.
    """
    headers = {'User-Agent': config.get_random_user_agent()}
    timeout = aiohttp.ClientTimeout(total=config.REQUEST_TIMEOUT_SECONDS)
    async with session.get(url, headers=headers, timeout=timeout, allow_redirects=True) as response:
        response.raise_for_status()
        return await response.text()

async def scrape_url(url: str, session: aiohttp.ClientSession) -> schemas.LiveData:
    """
    Scrapes a single URL for place information.

    This function attempts to find structured (JSON-LD) data first, then
    falls back to simple heuristics if needed. It handles network errors gracefully.
    """
    start_time = datetime.now(timezone.utc)
    try:
        html = await _fetch_html(session, url)
        soup = BeautifulSoup(html, 'html.parser')

        # Primary Strategy: Parse structured JSON-LD data
        scraped_data = _extract_from_ld_json(soup)
        logging.info(f"For URL {url}, extracted from JSON-LD: {scraped_data}")

        # Fallback for website_url
        if not scraped_data.get('website_url'):
            scraped_data['website_url'] = url

        return schemas.LiveData(
            operating_hours=scraped_data.get('operating_hours'),
            rating=scraped_data.get('rating'),
            website_url=scraped_data.get('website_url'),
            scraped_at=start_time,
        )

    except (aiohttp.ClientError, asyncio.TimeoutError) as e:
        logging.warning(f"Network error while fetching {url}: {e}")
        return schemas.LiveData(
            scraped_at=start_time,
            error=f"Failed to fetch URL due to network error: {e}",
        )
    except Exception as e:
        logging.error(f"An unexpected error occurred while scraping {url}: {e}", exc_info=True)
        return schemas.LiveData(
            scraped_at=start_time,
            error=f"An unexpected error occurred while processing {url}: {e}",
        )
