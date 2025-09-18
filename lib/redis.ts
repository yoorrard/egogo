import { Redis } from '@upstash/redis';

// Use a singleton pattern to ensure we only have one instance of the client.
let redisClient: Redis | null = null;

/**
 * Creates and returns a singleton Redis client instance.
 * Throws an error if the required environment variables are not set.
 * This "lazy initialization" prevents the server from crashing on startup
 * if the environment variables are missing.
 * @returns {Redis} The Redis client instance.
 */
export const getRedisClient = (): Redis => {
  if (redisClient) {
    return redisClient;
  }

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    // This error will be caught by the API handler's try...catch block,
    // preventing a server crash and allowing a clear error message to be sent to the user.
    throw new Error('Database connection is not configured. Please check server environment variables (KV_REST_API_URL, KV_REST_API_TOKEN).');
  }

  redisClient = new Redis({
    url,
    token,
  });

  return redisClient;
};
