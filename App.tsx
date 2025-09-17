import React, { useState, useCallback, useEffect } from 'react';
import type { User, UserData, PersonaFormData, PersonaInstance } from './types';
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
  const [activePersona, setActivePersona] = useState<PersonaInstance | null>(null);
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('LOGIN');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Show loading screen briefly on initial load before login screen
    const timer = setTimeout(() => {
      if(currentScreen === 'LOGIN') setIsLoading(false)
    }, 500);
    return () => clearTimeout(timer);
  }, [currentScreen]);

  const handleLoginSuccess = useCallback(async (loggedInUser: User) => {
    setIsLoading(true);
    setUser(loggedInUser);
    try {
        const data = await fetchUserData(loggedInUser);
        setUserData(data);
        setCurrentScreen('HOME');
    } catch (err) {
        console.error("Login Error:", err);
        setError("데이터를 불러오는데 실패했어요. 새로고침 해주세요.");
    } finally {
        setIsLoading(false);
    }
  }, []);

  const handleLogout = () => {
    setUser(null);
    setUserData(null);
    setActivePersona(null);
    setError(null);
    setCurrentScreen('LOGIN');
  };

  const handlePersonaCreate = useCallback(async (formData: PersonaFormData) => {
    if (!user?.email) return;
    setIsLoading(true);
    setError(null);
    try {
      const updatedUserData = await createPersona(formData, user.email);
      setUserData(updatedUserData);
      setCurrentScreen('HOME');
    } catch (err) {
      const errorMessage = (err as Error).message || "페르소나 생성에 실패했어요. 잠시 후 다시 시도해주세요.";
      console.error("Error creating persona:", err);
      setError(errorMessage);
    } finally {
        setIsLoading(false);
    }
  }, [user]);

  const handleSelectPersona = useCallback((personaId: number) => {
    if (!userData) return;
    const selected = userData.personas.find(p => p.id === personaId);
    if (selected) {
        setActivePersona(selected);
        setCurrentScreen('CHAT');
    }
  }, [userData]);
  
  const handleNavigateHome = () => {
    setActivePersona(null);
    setCurrentScreen('HOME');
  };

  const renderContent = () => {
    if (isLoading) return <LoadingScreen />;

    switch (currentScreen) {
        case 'LOGIN':
            return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
        
        case 'HOME':
            if (!userData) return <LoadingScreen />; // Should not happen if logic is correct
            return (
                <HomeScreen 
                    userData={userData}
                    onSelectPersona={handleSelectPersona}
                    onCreatePersona={() => setCurrentScreen('CREATE_PERSONA')}
                    onLogout={handleLogout}
                />
            );
            
        case 'CREATE_PERSONA':
            if (!user) return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
            return (
                <PersonaCreation 
                    user={user} 
                    onSubmit={handlePersonaCreate} 
                    onGoBack={handleNavigateHome}
                    error={error} 
                />
            );

        case 'CHAT':
            if (!userData || !activePersona) return <LoadingScreen />;
            return (
                <ChatScreen
                    user={userData.user}
                    activePersona={activePersona}
                    setUserData={setUserData}
                    onGoHome={handleNavigateHome}
                    onLogout={handleLogout}
                    chatEnergy={userData.chatEnergy}
                />
            );
        
        default:
             return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
    }
  };

  return (
    <div className="bg-[#F8F9FA] text-[#3D405B] min-h-screen w-full flex flex-col items-center justify-center">
      {renderContent()}
    </div>
  );
};

export default App;
