import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
  redis = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });
} else {
  // This warning will be visible in the Vercel logs.
  console.warn("Redis environment variables (KV_REST_API_URL, KV_REST_API_TOKEN) are not set. Redis client not initialized.");
}

export { redis };
