import React, { useState, useCallback } from 'react';
import type { User, UserData, PersonaFormData } from './types';
import LoginScreen from './components/LoginScreen';
import PersonaCreation from './components/PersonaCreation';
import LoadingScreen from './components/LoadingScreen';
import ChatScreen from './components/ChatScreen';
import HomeScreen from './components/HomeScreen';
import { fetchUserData, createPersona } from './services/geminiService';

type AppScreen = 'LOGIN' | 'HOME' | 'CREATE_PERSONA' | 'CHAT';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('LOGIN');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCreatingPersona, setIsCreatingPersona] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoginSuccess = useCallback(async (loggedInUser: User) => {
    setIsLoading(true);
    setError(null); // Reset error on new login attempt
    setUser(loggedInUser);
    try {
        const data = await fetchUserData(loggedInUser);
        setUserData(data);
        setCurrentScreen('HOME');
    } catch (err) {
        console.error("Login Error:", err);
        setError("데이터를 불러오는데 실패했어요. 새로고침 해주세요.");
        // Stay on LOGIN screen if fetch fails
    } finally {
        setIsLoading(false);
    }
  }, []);

  const handleLogout = () => {
    setUser(null);
    setUserData(null);
    setError(null);
    setCurrentScreen('LOGIN');
  };

  const handlePersonaCreate = useCallback(async (formData: PersonaFormData) => {
    if (!user?.email) return;
    setIsCreatingPersona(true);
    setIsLoading(true);
    setError(null);
    try {
      const updatedUserData = await createPersona(formData, user.email);
      setUserData(updatedUserData);
      setCurrentScreen('CHAT'); // Go directly to chat after creation
    } catch (err) {
      const errorMessage = (err as Error).message || "페르소나 생성에 실패했어요. 잠시 후 다시 시도해주세요.";
      console.error("Error creating persona:", err);
      setError(errorMessage);
    } finally {
        setIsLoading(false);
        setIsCreatingPersona(false);
    }
  }, [user]);

  const handleStartChat = useCallback(() => {
    if (userData?.persona) {
        setCurrentScreen('CHAT');
    }
  }, [userData]);
  
  const handleNavigateHome = () => {
    setCurrentScreen('HOME');
  };

  const renderContent = () => {
    if (isLoading) return <LoadingScreen isPersonaCreation={isCreatingPersona} />;

    switch (currentScreen) {
        case 'LOGIN':
            return <LoginScreen onLoginSuccess={handleLoginSuccess} error={error} />;
        
        case 'HOME':
            if (!userData) return <LoadingScreen isPersonaCreation={false} />; 
            return (
                <HomeScreen 
                    userData={userData}
                    onStartChat={handleStartChat}
                    onCreatePersona={() => setCurrentScreen('CREATE_PERSONA')}
                    onLogout={handleLogout}
                />
            );
            
        case 'CREATE_PERSONA':
            if (!user) return <LoginScreen onLoginSuccess={handleLoginSuccess} error={error} />;
            return (
                <PersonaCreation 
                    onSubmit={handlePersonaCreate} 
                    onGoBack={handleNavigateHome}
                    error={error} 
                />
            );

        case 'CHAT':
            if (!userData || !userData.persona) return <LoadingScreen isPersonaCreation={false} />;
            return (
                <ChatScreen
                    user={userData.user}
                    persona={userData.persona}
                    setUserData={setUserData}
                    onGoHome={handleNavigateHome}
                    onLogout={handleLogout}
                    chatEnergy={userData.chatEnergy}
                />
            );
        
        default:
             return <LoginScreen onLoginSuccess={handleLoginSuccess} error={error} />;
    }
  };

  return (
    <div className="bg-[#F8F9FA] text-[#3D405B] min-h-screen w-full flex flex-col items-center justify-center">
      {renderContent()}
    </div>
  );
};

export default App;