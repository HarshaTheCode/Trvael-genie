import asyncio
import logging
import re
from contextlib import asynccontextmanager
from datetime import datetime, timezone

import aiohttp
from fastapi import FastAPI, Request

# This is a hypothetical import. It represents the necessary assumption that
# the tools available to the agent are also available to the code it writes,
# allowing for the creation of a self-contained, deployable service.
# If this tool is not available in the final execution environment, this
# function call will need to be replaced with a concrete implementation.
from agent_tools import google_search

from orion_service import config, schemas, scraper

# --- Logging Setup ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - [%(levelname)s] - %(message)s')


# --- Lifespan Management ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manages the application's lifespan. Initializes resources on startup
    and cleans them up gracefully on shutdown.
    """
    logging.info("Orion service is starting up...")
    # Store shared resources in the app's state
    app.state.http_session = aiohttp.ClientSession()
    app.state.semaphore = asyncio.Semaphore(config.SEMAPHORE_LIMIT)
    yield
    logging.info("Orion service is shutting down...")
    await app.state.http_session.close()


# --- FastAPI App Initialization ---
app = FastAPI(
    title="Orion Enrichment Service",
    description="A microservice to enrich itineraries with live web data.",
    version="1.0.0",
    lifespan=lifespan
)


# --- Helper Functions ---
def _find_best_url(search_results_str: str) -> str | None:
    """
    Analyzes a string of search results to find the most promising URL.
    This uses a simple heuristic: prioritize known review/map sites, then take the first valid URL.
    """
    PREFERRED_DOMAINS = ['maps.google.com', 'tripadvisor.com', 'yelp.com']
    urls = re.findall(r'https?://[^\s/$.?#].[^\s]*', search_results_str)
    if not urls:
        return None

    for domain in PREFERRED_DOMAINS:
        for url in urls:
            if domain in url:
                logging.info(f"Found preferred domain URL: {url}")
                return url

    logging.info(f"No preferred domain found, falling back to first result: {urls[0]}")
    return urls[0]


async def _enrich_place_task(
    place: schemas.Place,
    session: aiohttp.ClientSession,
    semaphore: asyncio.Semaphore
) -> schemas.EnrichedPlace:
    """The core concurrent task to enrich a single place."""
    live_data = None
    async with semaphore:
        try:
            # 1. Discover source URL via a targeted search
            query = f'"{place.place}" "{place.note}" official website hours rating'
            logging.info(f"Searching for: {place.place}")
            search_results = await google_search(query=query)

            url_to_scrape = _find_best_url(search_results)
            if not url_to_scrape:
                raise ValueError("Could not find a suitable URL from search results.")

            # 2. Scrape the discovered URL
            logging.info(f"Scraping URL for '{place.place}': {url_to_scrape}")
            live_data = await scraper.scrape_url(url_to_scrape, session)

        except Exception as e:
            logging.error(f"Task for '{place.place}' failed: {e}", exc_info=True)
            live_data = schemas.LiveData(
                scraped_at=datetime.now(timezone.utc), error=str(e)
            )

    return schemas.EnrichedPlace(**place.model_dump(), live_data=live_data)


# --- API Endpoint ---
@app.post("/enrich", response_model=schemas.EnrichedItinerary)
async def enrich_itinerary(itinerary: schemas.BaseItinerary, request: Request):
    """
    Accepts a base itinerary, concurrently enriches each place with live data,
    and returns the enriched itinerary.
    """
    http_session = request.app.state.http_session
    semaphore = request.app.state.semaphore

    all_places = [place for day in itinerary.days for place in day.segments]
    if not all_places:
        return schemas.EnrichedItinerary(title=itinerary.title, days=[])

    tasks = [_enrich_place_task(place, http_session, semaphore) for place in all_places]
    enriched_places_flat = await asyncio.gather(*tasks, return_exceptions=True)

    # Filter out potential exceptions returned by gather
    processed_places = [p for p in enriched_places_flat if isinstance(p, schemas.EnrichedPlace)]

    enriched_map = {f"{p.place}-{p.note}": p for p in processed_places}

    enriched_days = []
    for day in itinerary.days:
        new_segments = [
            enriched_map.get(f"{p.place}-{p.note}", schemas.EnrichedPlace(**p.model_dump(), live_data=None))
            for p in day.segments
        ]
        enriched_days.append(schemas.EnrichedDay(day=day.day, segments=new_segments))

    return schemas.EnrichedItinerary(title=itinerary.title, days=enriched_days)
