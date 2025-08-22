import axios from 'axios';
import { scrapeUrl } from '../src/services/scraper';
import { LiveData } from '../src/schemas/itinerarySchemas';

// We tell Jest to mock the entire axios module.
jest.mock('axios');

// We cast the mocked axios to its mocked type to get type safety on mock functions.
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Scraper Service: scrapeUrl', () => {

  // Reset mocks before each test to ensure test isolation.
  afterEach(() => {
    jest.clearAllMocks();
  });

  const MOCK_URL = 'https://mock-restaurant-page.com';

  const MOCK_HTML_WITH_JSON_LD = `
    <html>
      <head>
        <title>The Mock Nook</title>
        <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "Restaurant",
            "name": "The Mock Nook",
            "openingHours": "Mo-Su 09:00-22:00",
            "aggregateRating": { "ratingValue": "4.8" },
            "url": "https://official-mock-nook.com"
          }
        </script>
      </head>
      <body><h1>Welcome</h1></body>
    </html>`;

  const MOCK_HTML_EMPTY = '<html><body><p>This page has no structured data.</p></body></html>';

  test('should correctly parse data from a page with valid JSON-LD', async () => {
    // Arrange: Configure the mock to return a successful response with our test HTML.
    mockedAxios.get.mockResolvedValue({ data: MOCK_HTML_WITH_JSON_LD, status: 200, statusText: 'OK', headers: {}, config: {} });

    // Act: Call the function we are testing.
    const result = await scrapeUrl(MOCK_URL);

    // Assert: Verify the function behaved as expected.
    expect(mockedAxios.get).toHaveBeenCalledWith(MOCK_URL, expect.any(Object));
    expect(result.error).toBeNull();
    expect(result.operating_hours).toBe('Mo-Su 09:00-22:00');
    expect(result.rating).toBe('4.8');
    expect(result.website_url).toBe('https://official-mock-nook.com');
    expect(result.scraped_at).toBeDefined();
  });

  test('should handle network errors gracefully', async () => {
    // Arrange: Configure the mock to simulate a network error.
    const errorMessage = 'Network Error: Could not connect';
    mockedAxios.get.mockRejectedValue(new Error(errorMessage));

    // Act
    const result = await scrapeUrl(MOCK_URL);

    // Assert: The function should catch the error and report it in the result.
    expect(result.error).toContain(errorMessage);
    expect(result.operating_hours).toBeNull();
    expect(result.rating).toBeNull();
  });

  test('should handle pages with no parsable data without errors', async () => {
    // Arrange: Configure the mock to return HTML with no useful data.
    mockedAxios.get.mockResolvedValue({ data: MOCK_HTML_EMPTY, status: 200, statusText: 'OK', headers: {}, config: {} });

    // Act
    const result = await scrapeUrl(MOCK_URL);

    // Assert: The function should not find data, but it should not report an error.
    expect(result.error).toBeNull();
    expect(result.operating_hours).toBeNull();
    expect(result.rating).toBeNull();
    // It should fall back to using the scraped URL as the website URL.
    expect(result.website_url).toBe(MOCK_URL);
  });
});
