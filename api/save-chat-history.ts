import { kv } from '@vercel/kv';
import type { UserData } from '../types';

export const config = {
  runtime: 'edge',
};

const MAX_HISTORY_LENGTH = 50;

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { userEmail, personaId, chatHistory } = await req.json();

    if (!userEmail || !personaId || !chatHistory) {
      return new Response(JSON.stringify({ error: 'userEmail, personaId, and chatHistory are required.' }), { status: 400 });
    }

    let userData: UserData | null = await kv.get(userEmail);

    if (!userData) {
      return new Response(JSON.stringify({ error: 'User not found.' }), { status: 404 });
    }

    if (!userData.persona || userData.persona.id !== personaId) {
      return new Response(JSON.stringify({ error: 'Persona not found.' }), { status: 404 });
    }

    // Enforce the message limit
    let updatedHistory = chatHistory;
    if (updatedHistory.length > MAX_HISTORY_LENGTH) {
      // Keep the most recent 50 messages
      updatedHistory = updatedHistory.slice(-MAX_HISTORY_LENGTH);
    }
    
    userData.persona.chatHistory = updatedHistory;

    await kv.set(userEmail, userData);

    return new Response(JSON.stringify({ success: true, message: 'Chat history saved.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in save-chat-history function:", error);
    return new Response(JSON.stringify({ error: 'Failed to save chat history.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}