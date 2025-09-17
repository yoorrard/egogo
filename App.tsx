import React, { useState, useCallback } from 'react';
import type { PersonaData, ChatMessage, User } from './types';
import { AppState } from './types';
import LoginScreen from './components/LoginScreen';
import PersonaCreation from './components/PersonaCreation';
import LoadingScreen from './components/LoadingScreen';
import ChatScreen from './components/ChatScreen';
import { createPersona, generateInitialGreeting } from './services/geminiService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.CREATION);
  const [personaData, setPersonaData] = useState<PersonaData | null>(null);
  const [characterImageUrl, setCharacterImageUrl] = useState<string>('');
  const [systemInstruction, setSystemInstruction] = useState<string>('');
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
  };
  
  const handleLogout = () => {
    setUser(null);
    setAppState(AppState.CREATION);
    setPersonaData(null);
    setCharacterImageUrl('');
    setSystemInstruction('');
    setInitialMessages([]);
    setError(null);
  };

  const handlePersonaCreate = useCallback(async (data: PersonaData) => {
    setAppState(AppState.LOADING);
    setPersonaData(data);
    setError(null);

    try {
      const result = await createPersona(data);
      setCharacterImageUrl(result.imageUrl);
      setSystemInstruction(result.systemInstruction);

      // Generate the initial greeting based on the persona
      const greetingText = await generateInitialGreeting(result.systemInstruction);

      const initialGreeting: ChatMessage = {
        id: Date.now(),
        sender: 'ai',
        text: greetingText,
      };
      setInitialMessages([initialGreeting]);

      setAppState(AppState.CHAT);
    } catch (err) {
      console.error("Error creating persona:", err);
      setError("페르소나 생성에 실패했어요. 잠시 후 다시 시도해주세요.");
      setAppState(AppState.CREATION);
    }
  }, []);

  const handleRestart = () => {
    setAppState(AppState.CREATION);
    setPersonaData(null);
    setCharacterImageUrl('');
    setSystemInstruction('');
    setInitialMessages([]);
    setError(null);
  }

  const renderContent = () => {
    if (!user) {
      return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
    }

    switch (appState) {
      case AppState.LOADING:
        return <LoadingScreen />;
      case AppState.CHAT:
        if (personaData && characterImageUrl && systemInstruction) {
          return (
            <ChatScreen
              user={user}
              characterImageUrl={characterImageUrl}
              systemInstruction={systemInstruction}
              initialMessages={initialMessages}
              onRestart={handleRestart}
              onLogout={handleLogout}
            />
          );
        }
        // Fallback to creation if data is missing
        setAppState(AppState.CREATION);
        return <PersonaCreation user={user} onSubmit={handlePersonaCreate} error={error} />;
      case AppState.CREATION:
      default:
        return <PersonaCreation user={user} onSubmit={handlePersonaCreate} error={error} />;
    }
  };

  return (
    <div className="bg-[#F8F9FA] text-[#3D405B] min-h-screen w-full flex flex-col items-center justify-center">
      {renderContent()}
    </div>
  );
};

export default App;