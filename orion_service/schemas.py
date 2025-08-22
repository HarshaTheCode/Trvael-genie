from datetime import datetime
from pydantic import BaseModel

# --- Input Schemas ---
# These models define the structure of the incoming POST request body.

class Place(BaseModel):
    """Represents a single point of interest to be enriched."""
    place: str  # The name of the place, e.g., "Eiffel Tower"
    note: str   # Additional context, e.g., "Paris, France" or a user-provided note.

class Day(BaseModel):
    """Represents one day of an itinerary, containing multiple places."""
    day: int
    segments: list[Place]

class BaseItinerary(BaseModel):
    """The root model for the input itinerary."""
    title: str
    days: list[Day]


# --- Output Schemas ---
# These models define the structure of the JSON response.

class LiveData(BaseModel):
    """
    Holds the real-time data scraped for a single place.
    All fields are optional, allowing for graceful failures.
    """
    operating_hours: str | None = None
    rating: str | None = None
    website_url: str | None = None
    scraped_at: datetime
    error: str | None = None  # Field to note if scraping failed for this item

class EnrichedPlace(Place):
    """
    Extends the original Place model with the scraped live data.
    """
    live_data: LiveData | None = None

class EnrichedDay(BaseModel):
    """A day in the itinerary composed of EnrichedPlace objects."""
    day: int
    segments: list[EnrichedPlace]

class EnrichedItinerary(BaseModel):
    """The final, enriched itinerary object that will be returned by the API."""
    title: str
    days: list[EnrichedDay]
