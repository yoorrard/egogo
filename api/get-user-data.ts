import { kv } from '@vercel/kv';
import type { User, UserData } from '../types';

export const config = {
  runtime: 'edge',
};

const DAILY_ENERGY = 20;
const RECHARGE_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Type guard to validate the structure of UserData from KV store
function isUserData(obj: any): obj is UserData {
    return (
        obj &&
        typeof obj === 'object' &&
        'user' in obj &&
        'persona' in obj &&
        'chatEnergy' in obj &&
        'lastRechargeTimestamp' in obj
    );
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const user: User = await req.json();
    if (!user || !user.email) {
      return new Response(JSON.stringify({ error: 'User email is required.' }), { status: 400 });
    }

    const rawData: unknown = await kv.get(user.email);
    let userData: UserData | null = null;
    const now = Date.now();
    
    // Validate data retrieved from KV store
    if (isUserData(rawData)) {
        userData = rawData;
    } else if (rawData) {
        // Data exists but is malformed. Log it and treat as a new user.
        console.warn('Malformed user data found in KV store for user:', user.email);
    }

    if (!userData) {
      // First time user, or data was malformed
      userData = {
        user: user,
        persona: null,
        chatEnergy: DAILY_ENERGY,
        lastRechargeTimestamp: now,
      };
    } else {
      // Returning user, data is valid. Check for energy recharge.
      if (now - userData.lastRechargeTimestamp >= RECHARGE_INTERVAL_MS) {
        userData.chatEnergy = DAILY_ENERGY;
        userData.lastRechargeTimestamp = now;
      }
      // Ensure user profile is up-to-date with latest from Google
      userData.user = user;
    }

    await kv.set(user.email, userData);

    return new Response(JSON.stringify(userData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in get-user-data function:", error);
    return new Response(JSON.stringify({ error: 'Failed to get user data.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}