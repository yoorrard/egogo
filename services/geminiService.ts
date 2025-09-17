import type { PersonaData } from "../types";

export const generateInitialGreeting = async (systemInstruction: string): Promise<string> => {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction,
                message: '너 자신을 소개하면서 사용자에게 첫인사를 건네줘. 짧고 다정하게.',
                history: [],
                stream: false, // We want a single response, not a stream for the greeting
            }),
        });
        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }
        const data = await response.json();
        return data.text;

    } catch (error) {
        console.error("Error generating initial greeting:", error);
        // Fallback message
        return "안녕! 만나서 반가워. 내가 바로 너의 또 다른 자아, '에고'야. 우리 함께 재밌는 이야기 많이 나눠보자!";
    }
};

export const createPersona = async (
  data: PersonaData
): Promise<{ imageUrl: string; systemInstruction: string }> => {
  try {
    const response = await fetch('/api/create-persona', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`Failed to create persona. Status: ${response.status}`);
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error("Error calling create-persona API:", error);
    throw new Error("Failed to generate character image.");
  }
};
