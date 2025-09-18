import React, { useState, useEffect } from 'react';

const personaCreationMessages = [
  "당신의 페르소나를 만들고 있어요...",
  "캐릭터에 생명을 불어넣는 중...",
  "당신만의 특별한 '에고'를 조립하고 있어요.",
  "곧 당신의 이야기를 들어줄 친구가 태어납니다.",
  "거의 다 됐어요! 잠시만 기다려주세요."
];

const LoadingSpinner: React.FC = () => (
    <div className="w-20 h-20 border-4 border-t-transparent border-[#FF8FAB] rounded-full animate-spin"></div>
);

interface LoadingScreenProps {
  isPersonaCreation?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isPersonaCreation = false }) => {
    const [messageIndex, setMessageIndex] = useState(0);
    const messages = isPersonaCreation ? personaCreationMessages : ["잠시만 기다려주세요..."];

    useEffect(() => {
        if (!isPersonaCreation || messages.length <= 1) return;

        const intervalId = setInterval(() => {
            setMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
        }, 2500);

        return () => clearInterval(intervalId);
    }, [isPersonaCreation, messages.length]);

    return (
        <div className="flex flex-col items-center justify-center h-screen w-full bg-[#F8F9FA] text-[#3D405B]">
            <LoadingSpinner />
            <h2 className="text-4xl mt-10 text-[#FF8FAB]">
                {isPersonaCreation ? '에고 생성 중' : '불러오는 중'}
            </h2>
            <p className="mt-4 text-[#7A7C8B] text-xl text-center px-4 transition-opacity duration-500">
                {messages[messageIndex]}
            </p>
        </div>
    );
};

export default LoadingScreen;
