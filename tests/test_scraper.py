import asyncio
from unittest.mock import AsyncMock, MagicMock

import pytest
import aiohttp
from aiohttp import ClientError

from orion_service import scraper, schemas

# Mark all tests in this file as asyncio, a requirement for pytest-asyncio
pytestmark = pytest.mark.asyncio


# --- Test Fixtures ---

@pytest.fixture
def mock_url() -> str:
    """A standard URL to be used across tests."""
    return "https://mock-restaurant-reviews.com/place/the-mock-nook"

@pytest.fixture
def mock_html_with_json_ld() -> str:
    """Provides a sample HTML body containing a valid schema.org JSON-LD script."""
    return """
    <html>
    <head>
        <title>The Mock Nook</title>
        <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@type": "Restaurant",
            "name": "The Mock Nook",
            "openingHours": [
                "Mo-Fr 11:00-22:00",
                "Sa-Su 10:00-23:00"
            ],
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.7"
            },
            "url": "https://official-mock-nook.com"
        }
        </script>
    </head>
    <body>
        <h1>Welcome to The Mock Nook</h1>
    </body>
    </html>
    """

@pytest.fixture
def mock_html_empty() -> str:
    """Provides a valid but empty HTML body with no parsable data."""
    return "<html><head><title>Empty Page</title></head><body><p>Nothing to see here.</p></body></html>"


# --- Test Cases ---

async def test_scrape_url_success_with_json_ld(mock_url, mock_html_with_json_ld):
    """
    Tests the happy path: valid JSON-LD data is found and parsed correctly.
    """
    # Arrange: Mock the aiohttp session to return a successful response with our mock HTML
    mock_session = AsyncMock(spec=aiohttp.ClientSession)
    mock_response = mock_session.get.return_value.__aenter__.return_value
    mock_response.status = 200
    mock_response.text.return_value = mock_html_with_json_ld
    mock_response.raise_for_status = MagicMock()

    # Act: Call the function under test
    result = await scraper.scrape_url(mock_url, mock_session)

    # Assert: Verify the returned LiveData object is correctly populated
    assert isinstance(result, schemas.LiveData)
    assert result.error is None
    assert result.operating_hours == "Mo-Fr 11:00-22:00, Sa-Su 10:00-23:00"
    assert result.rating == "4.7"
    assert result.website_url == "https://official-mock-nook.com"
    assert result.scraped_at is not None

async def test_scrape_url_http_error_is_handled_gracefully(mock_url):
    """
    Tests that a network-level error during the HTTP request is caught
    and reported correctly in the LiveData object.
    """
    # Arrange: Mock the session to raise a ClientError on get()
    mock_session = AsyncMock(spec=aiohttp.ClientSession)
    mock_session.get.side_effect = ClientError("Failed to connect")

    # Act: Call the function
    result = await scraper.scrape_url(mock_url, mock_session)

    # Assert: Verify an error is reported and data fields are empty
    assert isinstance(result, schemas.LiveData)
    assert result.error is not None
    assert "Failed to fetch URL due to network error" in result.error
    assert "Failed to connect" in result.error # Check for original error message
    assert result.operating_hours is None
    assert result.rating is None
    assert result.website_url is None

async def test_scrape_url_timeout_is_handled_gracefully(mock_url):
    """
    Tests that a request timeout is caught and reported correctly.
    """
    # Arrange: Mock the session's get() method to raise an asyncio.TimeoutError
    mock_session = AsyncMock(spec=aiohttp.ClientSession)
    mock_session.get.side_effect = asyncio.TimeoutError()

    # Act: Call the function
    result = await scraper.scrape_url(mock_url, mock_session)

    # Assert: Verify a timeout-related error is reported
    assert isinstance(result, schemas.LiveData)
    assert result.error is not None
    assert "Failed to fetch URL due to network error" in result.error
    assert result.operating_hours is None

async def test_scrape_url_no_parsable_data_found(mock_url, mock_html_empty):
    """
    Tests scraping a page that is valid but contains no parsable data.
    This should not result in an error, just empty data fields.
    """
    # Arrange: Mock a valid response but with HTML that has no JSON-LD
    mock_session = AsyncMock(spec=aiohttp.ClientSession)
    mock_response = mock_session.get.return_value.__aenter__.return_value
    mock_response.status = 200
    mock_response.text.return_value = mock_html_empty
    mock_response.raise_for_status = MagicMock()

    # Act: Call the function
    result = await scraper.scrape_url(mock_url, mock_session)

    # Assert: Verify the result has no data but also no error message
    assert isinstance(result, schemas.LiveData)
    assert result.error is None
    assert result.operating_hours is None
    assert result.rating is None
    # It should fall back to using the scraped URL as the website URL
    assert result.website_url == mock_url
