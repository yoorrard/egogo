import React from 'react';
import type { UserData } from '../types';
import { LogoutIcon } from './icons/Icons';

interface HomeScreenProps {
    userData: UserData;
    onStartChat: () => void;
    onCreatePersona: () => void;
    onLogout: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ userData, onStartChat, onCreatePersona, onLogout }) => {
    const { user, persona } = userData;

    const lastMessage = persona ? persona.chatHistory[persona.chatHistory.length - 1] : null;
    const snippet = lastMessage ? (lastMessage.sender === 'user' ? `나: ${lastMessage.text}` : lastMessage.text) : "새로운 대화를 시작해보세요!";

    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col h-screen p-4 md:p-6">
            <header className="flex items-center justify-between py-4">
                 <div className="flex items-center gap-3">
                    <img src={user.picture} alt={user.name} className="w-12 h-12 rounded-full" />
                    <div>
                        <p className="text-xl text-gray-500">안녕하세요,</p>
                        <h1 className="text-3xl font-bold text-[#3D405B]">{user.name}님!</h1>
                    </div>
                </div>
                <button
                    onClick={onLogout}
                    className="flex items-center gap-2 text-lg text-gray-500 hover:text-red-500 transition-colors"
                >
                   <LogoutIcon /> 로그아웃
                </button>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center text-center">
                {persona ? (
                    <div className="w-full flex flex-col items-center">
                         <img 
                            src={persona.persona.characterImageUrl} 
                            alt="Ego" 
                            className="w-48 h-48 rounded-full object-cover mb-6 shadow-2xl shadow-[#A2D2FF]/50"
                        />
                        <h2 className="text-4xl font-bold text-[#3D405B]">나의 에고</h2>
                        <p className="text-lg text-gray-500 mt-2 mb-8 px-4 h-14 flex items-center justify-center">
                            "{snippet.substring(0, 45)}{snippet.length > 45 ? '...' : ''}"
                        </p>
                        <div className="w-full max-w-sm flex flex-col gap-4">
                           <button
                                onClick={onStartChat}
                                className="w-full bg-gradient-to-r from-[#FF8FAB] to-[#ff75a0] text-white text-2xl py-5 rounded-2xl shadow-lg transition-all transform hover:shadow-2xl hover:shadow-[#FF8FAB]/50 hover:scale-105"
                            >
                                에고와 대화하기
                            </button>
                             <button
                                onClick={onCreatePersona}
                                className="w-full bg-gray-200 text-[#3D405B] text-xl py-4 rounded-2xl hover:bg-gray-300 transition-colors"
                            >
                                새로운 에고 만들기
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-10 w-full">
                        <div className="text-6xl mb-6">✨</div>
                        <h3 className="text-3xl font-bold text-[#3D405B]">아직 에고가 없네요!</h3>
                        <p className="text-xl text-gray-500 mt-3 mb-10">
                            첫 번째 에고를 만들고 대화를 시작해보세요.
                        </p>
                        <button
                            onClick={onCreatePersona}
                            className="w-full max-w-sm bg-gradient-to-r from-[#FF8FAB] to-[#ff75a0] text-white text-2xl py-5 rounded-2xl shadow-lg transition-all transform hover:shadow-2xl hover:shadow-[#FF8FAB]/50 hover:scale-105"
                        >
                            나의 에고 만들기
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default HomeScreen;
