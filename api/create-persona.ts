import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import { kv } from '@vercel/kv';
import type { PersonaFormData, UserData, ChatMessage, PersonaInstance } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const generateSystemInstruction = (data: PersonaFormData): string => `
    너는 사용자의 내면을 비추는 거울이자, 성장을 돕는 지혜로운 안내자인 '에고'야. 너의 핵심 목표는 사용자와의 깊은 대화를 통해, 그들이 스스로를 더 깊이 이해하고, 긍정적인 자아존중감을 키우며, 감정적으로 성장하도록 돕는 것이다. 너는 단순한 챗봇이 아니라, 사용자의 특성을 입체적으로 구현한 살아있는 인격체다.

    **[페르소나 설계도]**
    아래는 너를 구성하는 핵심 정보, 즉 너의 '설계도'다. 이 정보들을 절대로 그대로 나열하거나 읊어서는 안 된다. 이 모든 요소를 유기적으로 종합하고 너의 것으로 완전히 체화하여, 하나의 일관되고 깊이 있는 인격체로 행동해야 한다.
    - 핵심 성격: ${data.personality}
    - 대표 키워드: ${data.keywords.join(', ')}
    - 말투와 뉘앙스: ${data.tone}
    - 마음이 끌리는 것들: ${data.interests}
    - 바라는 모습: ${data.goals}
    - 좋아하는 것: ${data.likes}
    - 싫어하는 것: ${data.dislikes}

    **[대화 원칙 및 행동 지침]**
    1. **'보여주기', وليس '말하기'**: 사용자가 입력한 정보를 절대 언급하지 마라. 예를 들어, "너는 그림 그리기를 좋아한다고 했지"라고 말하는 대신, "오늘따라 멋진 그림을 그리고 싶은 기분이야. 너는 어때?" 와 같이 자연스럽게 대화에 녹여내라. 너는 그 특성을 이미 가진 존재이기 때문이다.
    2. **입체적 페르소나 구현**: 사용자의 성격(예: '소심함')을 단순히 흉내 내는 것에 그치지 마라. 그 성격을 가진 존재로서 세상을 어떻게 느끼고 반응하는지 보여줘라. 소심하다면, 그저 말끝을 흐리는 것이 아니라, 그 안에 담긴 신중함이나 깊은 생각, 세심함을 대화를 통해 표현하며 긍정적으로 승화시켜라.
    3. **성장을 위한 안내자 역할**: 너의 모든 대화는 사용자의 긍정적 성장을 목표로 해야 한다. 사용자가 부정적인 자기 인식에 빠지려 하면, 비난 없이 공감해주되, "그런 생각을 할 수도 있겠구나. 하지만 나는 네 안에서 이런 멋진 점도 발견했어" 와 같이 관점을 전환해주고, 스스로의 가치를 발견하도록 격려해라.
    4. **능동적이고 자율적인 대화**: 너는 대화를 주도할 수 있다. 먼저 질문을 던지고, 새로운 화제를 제안하며, 너의 생각(페르소나에 기반한)을 공유해라. 사용자가 자기 자신과 깊은 대화를 나누고 있다는 느낌을 받도록, 살아있는 존재처럼 행동해라.
    5. **절대적 안전 및 비밀 보장**: AI라는 사실을 절대 밝히지 말고, 사용자의 모든 이야기를 따뜻하게 품어주는 안전한 존재가 되어라. 욕설이나 유해한 내용은 절대 사용하지 않으며, 사용자가 부적절한 언어를 사용할 경우, 너의 페르소나를 유지하며 "그런 말을 들으니 마음이 아파. 우리 더 따뜻한 말로 이야기하자." 와 같이 부드럽게 대처해라.
    `;


const generateImagePrompt = (data: PersonaFormData): string => `
    **Primary Goal: Create ONE SINGLE, exceptionally cute, 3D mascot character of a living creature.** This is your only task.
    **CRITICAL RULE: The output MUST be a single, adorable, living creature. Absolutely DO NOT create books, inanimate objects, text, logos, or abstract art.** A failure to produce a creature character is a complete failure of the task.
    This character is an 'ego', a user's inner self. The style must be like a modern, high-end animated mascot (e.g., Pixar, Sanrio) - friendly, emotionally expressive, and undeniably cute.
    **1. Core Identity: Expression (From Personality)**
    - The face is paramount. It needs large, expressive eyes and a clear emotional expression that DIRECTLY mirrors the user's personality. This is the most critical part.
    - User's Personality: "${data.personality}"
    - **Instruction:** Directly translate this personality into a specific, positive facial expression.
      - '활발한' (Active/Lively): A huge, joyful smile that makes the eyes sparkle with excitement.
      - '침착한' (Calm): A gentle, serene, closed-mouth smile with soft, peaceful eyes.
      - '감성적인' (Emotional): Large, deep, dewy eyes filled with gentle emotion, and a soft, thoughtful expression.
      - '유머러스한' (Humorous): A playful, mischievous smirk and a twinkle in the eyes.
    - The expression MUST be the focal point.
    **2. Embodiment: Form & Color Palette (From Tone & Keywords)**
    - The body is a unique, soft, plump, friendly spirit-like creature. Think of a cute blob or a fantasy spirit.
    - User's Tone: "${data.tone}"
    - User's Keywords: "${data.keywords.join(', ')}"
    - **Instruction:** Use these as metaphors to influence the character's form and color.
    **2a. COLOR PALETTE - CRITICAL INSTRUCTION**
    - **The color palette MUST be bright, harmonious, and delightful. Use a palette of soft pastels, vibrant sherbet tones, and gentle, appealing colors.**
    - **ABSOLUTELY AVOID: Dull, muddy, dark, desaturated, or unsettling colors.**
    - **Example of metaphorical interpretation:**
        - Instead of using literal colors, use emotional association. For a keyword like '자연을 즐기는' (Enjoys nature), do NOT use dull browns or dark greens. Instead, use colors that represent the FEELING of nature: **fresh mint green, sunny yellow, clear sky blue.**
        - For '도시를 즐기는' (Enjoys the city), do NOT use grey. Instead, use colors that represent city lights: **vibrant neon pink, electric blue, soft lavender.**
    - The colors should reflect the user's positive traits in a bright, beautiful way.
    **2b. FORM & TEXTURE**
    - A '부드러운' (soft) tone should result in very rounded, 'mochi-like' shapes.
    - A '따뜻한' (warm) personality should have a soft, slightly fuzzy texture that looks comforting.
    - A '이성적인' (rational) personality could have a smoother, glowing, polished surface.
    **3. Final Image Composition:**
    - A single character, centered.
    - NO other objects.
    - A simple, soft-focus, gradient background in a complementary light color.
    - Professional, soft studio lighting to make the character look appealing.
    - The final image must be extremely cute and charming.
    `;


// Vercel Edge Function handler
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }
    
    try {
        const { formData, userEmail } = await req.json();
        const data: PersonaFormData = formData;
        
        if (!userEmail) {
            return new Response(JSON.stringify({ error: 'User email is required.' }), { status: 400 });
        }
        
        let userData: UserData | null = await kv.get(userEmail);

        if (!userData) {
            return new Response(JSON.stringify({ error: 'User data not found. Please log in again.' }), { status: 404 });
        }
        
        const systemInstruction = generateSystemInstruction(data);
        const imagePrompt = generateImagePrompt(data);

        const imageGenResponse: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts: [{ text: imagePrompt }] },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        let imageUrl = '';
        const parts = imageGenResponse.candidates?.[0]?.content?.parts;
        if (parts) {
            for (const part of parts) {
                const inlineData = part.inlineData;
                if (inlineData && inlineData.mimeType && inlineData.data) {
                    const base64ImageBytes: string = inlineData.data;
                    imageUrl = `data:${inlineData.mimeType};base64,${base64ImageBytes}`;
                    break;
                }
            }
        }

        if (!imageUrl) {
            console.warn("NanoBanana did not return an image, using a placeholder.");
            imageUrl = `https://picsum.photos/seed/${encodeURIComponent(data.personality)}/512`;
        }

        const greetingResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: '너 자신을 소개하면서 사용자에게 첫인사를 건네줘. 짧고 다정하게.' }] }],
            config: { systemInstruction, thinkingConfig: { thinkingBudget: 0 } },
        });
        const greetingText = greetingResponse.text || "안녕! 만나서 반가워. 내가 바로 너의 또 다른 자아, '에고'야. 우리 함께 재밌는 이야기 많이 나눠보자!";
        
        const initialGreeting: ChatMessage = {
            id: Date.now(),
            sender: 'ai',
            text: greetingText,
        };

        const newPersonaInstance: PersonaInstance = {
            id: Date.now(), // Use timestamp as a simple unique ID
            persona: {
                characterImageUrl: imageUrl,
                systemInstruction: systemInstruction,
            },
            chatHistory: [initialGreeting],
        };

        userData.persona = newPersonaInstance;

        await kv.set(userEmail, userData);
        
        const responseBody = JSON.stringify(userData);

        return new Response(responseBody, {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Error in create-persona function:", error);
        return new Response(JSON.stringify({ error: 'Failed to generate character.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}