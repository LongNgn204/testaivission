import React, { useState } from 'react';
import { Mic, MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { VoiceInterface } from './vision-coach/VoiceInterface';
import { ChatInterface } from './vision-coach/ChatInterface';

/**
 * =================================================================
 * 🤖 VisionCoach - Nút gọi Coach (Voice/Chat) nổi góc màn hình
 * =================================================================
 *
 * MỤC ĐÍCH:
 * - Hiển thị 2 nút nổi: Voice (Mic) và Chat.
 * - Mở giao diện hội thoại tương ứng (VoiceInterface/ChatInterface).
 * - Ẩn hoàn toàn nếu thiếu API KEY (dev có thể bật VITE_GEMINI_API_KEY).
 */
export const VisionCoach: React.FC = () => {
    const { t, language } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<'voice' | 'chat'>('voice');

    // Hỗ trợ cả Vite và môi trường khác
    const hasApiKey = (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_GEMINI_API_KEY)
        || (typeof process !== 'undefined' && (process as any)?.env?.API_KEY);

    if (!hasApiKey) return null;

    return (
        <>
            {/* Floating action buttons */}
            <div className={`fixed bottom-24 right-8 z-40 group ${isOpen ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'} transition-all duration-300`}>
                <button
                    onClick={() => { setMode('voice'); setIsOpen(true); }}
                    className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all duration-300 transform hover:scale-110"
                    aria-label={t('coach_button_aria')}
                >
                    <Mic size={28} />
                </button>
                <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
                    {language === 'vi' ? 'Nói chuyện với Eva' : 'Talk to Eva'}
                </span>
            </div>
            
            <div className={`fixed bottom-8 right-8 z-40 group ${isOpen ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'} transition-all duration-300`}>
                <button
                    onClick={() => { setMode('chat'); setIsOpen(true); }}
                    className="bg-green-600 text-white rounded-full p-4 shadow-lg hover:bg-green-700 hover:shadow-green-500/30 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 transition-all duration-300 transform hover:scale-110"
                    aria-label={language === 'vi' ? 'Chat với Eva' : 'Chat with Eva'}
                >
                    <MessageCircle size={28} />
                </button>
                <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
                    {language === 'vi' ? 'Chat với Eva' : 'Chat with Eva'}
                </span>
            </div>

            {/* Interfaces */}
            {isOpen && mode === 'voice' && (
                <VoiceInterface isOpen={isOpen} onClose={() => setIsOpen(false)} />
            )}

            {isOpen && mode === 'chat' && (
                <ChatInterface isOpen={isOpen} onClose={() => setIsOpen(false)} />
            )}
        </>
    );
};
