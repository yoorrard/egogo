import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { redis } from '../lib/redis';
import type { ChatMessage, UserData } from '../types';

const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        if (!redis) {
            throw new Error('Database connection is not configured. Please check server environment variables.');
        }

        const API_KEY = process.env.API_KEY;
        if (!API_KEY) {
            throw new Error("Gemini API key (API_KEY) is not set in server environment variables.");
        }
        
        const ai = new GoogleGenAI({ apiKey: API_KEY });

        const { history, message, userEmail, personaId } = await req.json();

        if (!userEmail || !personaId) {
            return new Response(JSON.stringify({ error: 'User email and personaId are required.' }), { status: 400 });
        }
        
        let userData: UserData | null = await redis.get(userEmail);
        if (!userData) {
            return new Response(JSON.stringify({ error: 'User not found.' }), { status: 404 });
        }

        const activePersona = userData.persona;
        if (!activePersona || activePersona.id !== personaId) {
            return new Response(JSON.stringify({ error: 'Persona not found.' }), { status: 404 });
        }

        if (userData.chatEnergy <= 0) {
            return new Response(JSON.stringify({ error: 'No chat energy left for today.' }), { status: 429 });
        }

        userData.chatEnergy -= 1;
        await redis.set(userEmail, userData);

        const contents = history.map((msg: ChatMessage) => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));
        contents.push({ role: 'user', parts: [{ text: message }] });
        
        const stream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents,
            config: {
                systemInstruction: activePersona.persona.systemInstruction,
                thinkingConfig: { thinkingBudget: 0 },
                safetySettings,
            },
        });

        const readableStream = new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    const text = chunk.text;
                    if (text) {
                        controller.enqueue(new TextEncoder().encode(text));
                    }
                }
                controller.close();
            },
        });

        return new Response(readableStream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
            },
        });

    } catch (error) {
        console.error("Error in chat function:", error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to process chat message.';
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
