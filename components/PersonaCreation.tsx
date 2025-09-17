import React, { useState, useCallback, useMemo } from 'react';
import type { PersonaData, User } from '../types';
import { ALL_KEYWORDS } from '../constants';

interface PersonaCreationProps {
  user: User | null;
  onSubmit: (data: PersonaData) => void;
  error: string | null;
}

interface FormFieldProps {
  id: keyof Omit<PersonaData, 'keywords'>;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  maxLength: number;
}

const FormField: React.FC<FormFieldProps> = ({ id, label, value, onChange, maxLength }) => (
  <div className="w-full">
    <label htmlFor={id} className="block text-xl text-[#3D405B] mb-2">
      {label}
    </label>
    <div className="relative">
      <textarea
        id={id}
        name={id}
        rows={3}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-[#3D405B] focus:ring-2 focus:ring-[#FF8FAB] focus:border-[#FF8FAB] transition-all duration-200 text-lg shadow-sm"
      />
      <span className="absolute bottom-2 right-3 text-sm text-gray-400">
        {value.length} / {maxLength}
      </span>
    </div>
  </div>
);

const PersonaCreation: React.FC<PersonaCreationProps> = ({ user, onSubmit, error }) => {
  const [formData, setFormData] = useState<Omit<PersonaData, 'keywords'>>({
    personality: '',
    tone: '',
    interests: '',
    goals: '',
    likes: '',
    dislikes: '',
  });
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [showValidationPopup, setShowValidationPopup] = useState(false);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const toggleKeyword = useCallback((keyword: string) => {
    setSelectedKeywords((prev) =>
      prev.includes(keyword)
        ? prev.filter((k) => k !== keyword)
        : [...prev, keyword]
    );
  }, []);

  const isFormValid = useMemo(() => {
    return Object.values(formData).every(val => val.trim() !== '');
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setShowValidationPopup(true);
      return;
    }
    onSubmit({ ...formData, keywords: selectedKeywords });
  };
  
  const formFields: FormFieldProps[] = [
      { id: 'personality', label: '나의 성격은?', value: formData.personality, onChange: handleInputChange, maxLength: 200 },
      { id: 'tone', label: '나의 말투는?', value: formData.tone, onChange: handleInputChange, maxLength: 200 },
      { id: 'interests', label: '나의 관심사는?', value: formData.interests, onChange: handleInputChange, maxLength: 200 },
      { id: 'goals', label: '나의 목표는?', value: formData.goals, onChange: handleInputChange, maxLength: 200 },
      { id: 'likes', label: '내가 좋아하는 것은?', value: formData.likes, onChange: handleInputChange, maxLength: 200 },
      { id: 'dislikes', label: '내가 싫어하는 것은?', value: formData.dislikes, onChange: handleInputChange, maxLength: 200 },
  ];

  return (
    <div className="w-full max-w-4xl p-4 md:p-8">
      <div className="text-center mb-10">
        <h1 className="text-6xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF8FAB] to-[#A2D2FF]">
          {user ? `${user.name}님의 에고고` : '에고고'}
        </h1>
        <p className="text-[#7A7C8B] mt-3 text-xl">AI 페르소나와 대화하며 나를 발견하는 시간</p>
      </div>
      
      {error && <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-center mb-6 text-lg">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-10 shadow-xl border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
          {formFields.map(field => <FormField key={field.id} {...field} />)}
        </div>
        
        <div className="mt-12">
            <div className="mb-4">
              <p className="font-semibold text-xl text-[#3D405B] mb-4">나를 표현하는 키워드는 무엇인가요? <span className="text-gray-400 font-normal">(선택)</span></p>
              <div className="flex flex-wrap gap-3">
                {ALL_KEYWORDS.map(keyword => (
                  <button
                    type="button"
                    key={keyword}
                    onClick={() => toggleKeyword(keyword)}
                    className={`px-4 py-2 text-md rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 ${selectedKeywords.includes(keyword) ? 'bg-[#FF8FAB] text-white shadow-lg' : 'bg-gray-100 border border-gray-200 text-[#7A7C8B] hover:bg-gray-200'}`}
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>
        </div>

        <div className="mt-16 text-center">
            <button
                type="submit"
                className="bg-gradient-to-r from-[#FF8FAB] to-[#ff75a0] text-white text-2xl py-4 px-16 rounded-full shadow-lg transition-all transform hover:shadow-2xl hover:shadow-[#FF8FAB]/50 hover:scale-105"
            >
                나의 '에고' 만나기
            </button>
        </div>
      </form>

      {showValidationPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 md:p-10 shadow-2xl text-center max-w-md w-full modal-animation">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-2xl font-bold text-[#3D405B] mb-4">잠깐만! 너의 이야기가 더 필요해</h3>
            <p className="text-[#7A7C8B] text-lg mb-8">
              너의 모든 이야기를 들려줘야, 온전한 너의 '에고'를 만날 수 있어! 비어있는 칸을 모두 채워줘.
            </p>
            <button
              onClick={() => setShowValidationPopup(false)}
              className="bg-gradient-to-r from-[#FF8FAB] to-[#ff75a0] text-white text-xl py-3 px-10 rounded-full shadow-lg transition-all transform hover:shadow-xl hover:scale-105"
            >
              알겠어!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonaCreation;