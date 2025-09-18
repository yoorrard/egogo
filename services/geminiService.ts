import type { PersonaFormData, User, UserData, ChatMessage } from "../types";

export const fetchUserData = async (user: User): Promise<UserData> => {
  const response = await fetch('/api/get-user-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (!response.ok) {
    try {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch user data.");
    } catch (e) {
        throw new Error(response.statusText || "An unknown error occurred while fetching user data.");
    }
  }
  return response.json();
};

export const createPersona = async (formData: PersonaFormData, userEmail: string): Promise<UserData> => {
  const response = await fetch('/api/create-persona', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formData, userEmail }),
  });
  if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create persona.");
  }
  return response.json();
};

export const saveChatHistory = async (userEmail: string, personaId: number, chatHistory: ChatMessage[]): Promise<void> => {
    try {
        const response = await fetch('/api/save-chat-history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userEmail, personaId, chatHistory }),
        });
        if (!response.ok) {
            console.error("Failed to save chat history:", await response.text());
        }
    } catch (error) {
        console.error("Error saving chat history:", error);
    }
};