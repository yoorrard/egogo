
export interface PersonaData {
  personality: string;
  tone: string;
  interests: string;
  goals: string;
  likes: string;
  dislikes: string;
  keywords: string[];
}

export interface ChatMessage {
  id: number;
  sender: 'user' | 'ai';
  text: string;
}

export interface User {
  name: string;
  email: string;
  picture: string;
}

export enum AppState {
  CREATION = 'CREATION',
  LOADING = 'LOADING',
  CHAT = 'CHAT',
}