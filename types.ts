// Basic user profile from Google Sign-In
export interface User {
  name: string;
  email: string;
  picture: string;
}

// Data for creating a new persona from the form
export interface PersonaFormData {
  personality: string;
  tone: string;
  interests: string;
  goals: string;
  likes: string;
  dislikes: string;
  keywords: string[];
}

// The generated and saved persona data in the database
export interface Persona {
  characterImageUrl: string;
  systemInstruction: string;
}

// Structure for a single chat message
export interface ChatMessage {
  id: number;
  sender: 'user' | 'ai';
  text: string;
}

// Represents a single, complete persona instance with its own chat history
export interface PersonaInstance {
  id: number; // Unique ID for the persona instance (e.g., timestamp)
  persona: Persona;
  chatHistory: ChatMessage[];
}

// The main data structure for a user, stored in the database.
export interface UserData {
  user: User;
  personas: PersonaInstance[];
  chatEnergy: number;
  lastRechargeTimestamp: number; // Unix timestamp in milliseconds
}
