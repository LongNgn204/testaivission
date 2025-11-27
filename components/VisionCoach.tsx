import React, { useState } from 'react';
import { Mic, MessageCircle, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { VoiceInterface } from './vision-coach/VoiceInterface';
import { ChatInterface } from './vision-coach/ChatInterface';

/**
 * =================================================================
 * [object Object] AI Assistant (Voice + Chat Integration)
 * =================================================================
 *
 * CHỨC NĂNG:
 * - Hiển thị 2 nút nổi: Voice (Mic) và Chat.
 * - Tích hợp hoàn toàn với Talk to Eva (VoiceInterface/ChatInterface).
 * - Ẩn hoàn toàn nếu thiếu API KEY.
 * - Xóa nút kiểm tra mic riêng - tất cả trong VisionCoach.
 * 
 * CÁCH DÙNG:
 * - Đặt <VisionCoach /> ở App.tsx hoặc Layout chính
 * - Tự động kiểm tra API key và hiển thị nút
 * - Click nút để mở Voice hoặc Chat interface
 */
export const VisionCoach: React.FC = () => {
    const { t, language } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<'voice' | 'chat'>('voice');

    // Kiểm tra API key từ Vite env
    const hasApiKey = (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_GEMINI_API_KEY)
        || (typeof process !== 'undefined' && (process as any)?.env?.VITE_GEMINI_API_KEY)
        || (typeof process !== 'undefined' && (process as any)?.env?.API_KEY);

    if (!hasApiKey) return null;

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <>
            {/* Floating Action Buttons - Voice & Chat */}
            <div className={`fixed bottom-24 right-8 z-40 group ${isOpen ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'} transition-all duration-300`}>
                <button
                    onClick={() => { setMode('voice'); setIsOpen(true); }}
                    className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-full p-4 shadow-lg hover:shadow-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-300 transform hover:scale-110 active:scale-95"
                    aria-label={language === 'vi' ? 'Nói chuyện với Eva' : 'Talk to Eva'}
                    title={language === 'vi' ? 'Nói chuyện với Eva' : 'Talk to Eva'}
                >
                    <Mic size={28} className="drop-shadow-md" />
                </button>
                <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 dark:bg-gray-800 text-white text-sm px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg font-medium">
                    {language === 'vi' ? 'Nói chuyện với Eva' : 'Talk to Eva'}
                </span>
            </div>
            
            <div className={`fixed bottom-8 right-8 z-40 group ${isOpen ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'} transition-all duration-300`}>
                <button
                    onClick={() => { setMode('chat'); setIsOpen(true); }}
                    className="bg-gradient-to-br from-green-500 to-emerald-700 text-white rounded-full p-4 shadow-lg hover:shadow-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-300 transform hover:scale-110 active:scale-95"
                    aria-label={language === 'vi' ? 'Chat với Eva' : 'Chat with Eva'}
                    title={language === 'vi' ? 'Chat với Eva' : 'Chat with Eva'}
                >
                    <MessageCircle size={28} className="drop-shadow-md" />
                </button>
                <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 dark:bg-gray-800 text-white text-sm px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg font-medium">
                    {language === 'vi' ? 'Chat với Eva' : 'Chat with Eva'}
                </span>
            </div>

            {/* Voice Interface Modal */}
            {isOpen && mode === 'voice' && (
                <VoiceInterface isOpen={isOpen} onClose={handleClose} />
            )}

            {/* Chat Interface Modal */}
            {isOpen && mode === 'chat' && (
                <ChatInterface isOpen={isOpen} onClose={handleClose} />
            )}
        </>
    );
};
