import dotenv from 'dotenv';

// Load environment variables from a .env file if it exists
dotenv.config();

/**
 * Application-wide configuration.
 */
export const config = {
  /**
   * The maximum number of concurrent scraping requests to make.
   * This helps prevent IP bans and overwhelming external services.
   * @default 8
   */
  concurrencyLimit: parseInt(process.env.CONCURRENCY_LIMIT || '8', 10),
};
