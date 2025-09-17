import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import type { ChatMessage } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        const { history, message, systemInstruction, stream: shouldStream } = await req.json();

        // Format history for the Gemini API
        const contents = history.map((msg: ChatMessage) => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));
        // Add the new user message
        contents.push({ role: 'user', parts: [{ text: message }] });

        if (shouldStream === false) {
             const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents,
                config: {
                    systemInstruction,
                    thinkingConfig: { thinkingBudget: 0 },
                    safetySettings,
                },
             });
             return new Response(JSON.stringify({ text: response.text }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const stream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents,
            config: {
                systemInstruction,
                thinkingConfig: { thinkingBudget: 0 },
                safetySettings,
            },
        });

        // Create a new ReadableStream to pipe the Gemini stream through
        const readableStream = new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    const text = chunk.text;
                    if (text) {
                        // Encode the text chunk and enqueue it
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
        return new Response(JSON.stringify({ error: 'Failed to process chat message.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
