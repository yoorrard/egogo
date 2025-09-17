import React from 'react';
import type { UserData, PersonaInstance } from '../types';
import { LogoutIcon } from './icons/Icons';

interface HomeScreenProps {
    userData: UserData;
    onSelectPersona: (personaId: number) => void;
    onCreatePersona: () => void;
    onLogout: () => void;
}

const PersonaListItem: React.FC<{ personaInstance: PersonaInstance; onClick: () => void }> = ({ personaInstance, onClick }) => {
    const lastMessage = personaInstance.chatHistory[personaInstance.chatHistory.length - 1];
    const snippet = lastMessage ? (lastMessage.sender === 'user' ? `나: ${lastMessage.text}` : lastMessage.text) : "새로운 대화를 시작해보세요!";

    return (
        <li 
            onClick={onClick}
            className="flex items-center p-4 bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg hover:border-[#FF8FAB] transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
        >
            <img 
                src={personaInstance.persona.characterImageUrl} 
                alt="Ego" 
                className="w-16 h-16 rounded-full object-cover mr-4 flex-shrink-0"
            />
            <div className="overflow-hidden">
                <h3 className="text-xl font-bold text-[#3D405B] truncate">나의 에고</h3>
                <p className="text-gray-500 truncate text-lg">{snippet.substring(0, 40)}{snippet.length > 40 ? '...' : ''}</p>
            </div>
        </li>
    );
};


const HomeScreen: React.FC<HomeScreenProps> = ({ userData, onSelectPersona, onCreatePersona, onLogout }) => {
    const canCreatePersona = userData.personas.length < 2;

    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col h-screen p-4 md:p-6">
            <header className="flex items-center justify-between py-4">
                 <div className="flex items-center gap-3">
                    <img src={userData.user.picture} alt={userData.user.name} className="w-12 h-12 rounded-full" />
                    <div>
                        <p className="text-xl text-gray-500">안녕하세요,</p>
                        <h1 className="text-3xl font-bold text-[#3D405B]">{userData.user.name}님!</h1>
                    </div>
                </div>
                <button
                    onClick={onLogout}
                    className="flex items-center gap-2 text-lg text-gray-500 hover:text-red-500 transition-colors"
                >
                   <LogoutIcon /> 로그아웃
                </button>
            </header>

            <main className="flex-1 overflow-y-auto py-6">
                <h2 className="text-2xl font-bold text-[#3D405B] mb-6 px-2">나의 에고 목록</h2>
                {userData.personas.length > 0 ? (
                    <ul className="space-y-4">
                        {userData.personas.map(p => (
                            <PersonaListItem 
                                key={p.id} 
                                personaInstance={p} 
                                onClick={() => onSelectPersona(p.id)} 
                            />
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border">
                        <div className="text-5xl mb-4">✨</div>
                        <h3 className="text-2xl font-bold text-[#3D405B]">아직 에고가 없네요!</h3>
                        <p className="text-lg text-gray-500 mt-2">첫 번째 에고를 만들고 대화를 시작해보세요.</p>
                    </div>
                )}
            </main>

            <footer className="py-4">
                <button
                    onClick={onCreatePersona}
                    disabled={!canCreatePersona}
                    className="w-full bg-gradient-to-r from-[#FF8FAB] to-[#ff75a0] text-white text-2xl py-5 rounded-2xl shadow-lg transition-all transform hover:shadow-2xl hover:shadow-[#FF8FAB]/50 hover:scale-105 disabled:bg-gradient-to-r disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
                >
                    {canCreatePersona ? '나의 에고 만들기' : '에고는 2개까지 만들 수 있어요'}
                </button>
            </footer>
        </div>
    );
};

export default HomeScreen;
