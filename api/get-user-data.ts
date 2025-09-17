import { kv } from '@vercel/kv';
import type { User, UserData } from '../types';

export const config = {
  runtime: 'edge',
};

const DAILY_ENERGY = 20;
const RECHARGE_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const user: User = await req.json();
    if (!user || !user.email) {
      return new Response(JSON.stringify({ error: 'User email is required.' }), { status: 400 });
    }

    let userData: UserData | null = await kv.get(user.email);
    const now = Date.now();

    if (!userData) {
      // First time user, create new record
      userData = {
        user: user,
        personas: [], // Initialize with an empty array for personas
        chatEnergy: DAILY_ENERGY,
        lastRechargeTimestamp: now,
      };
    } else {
      // Returning user, check for energy recharge
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
