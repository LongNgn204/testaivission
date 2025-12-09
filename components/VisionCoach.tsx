import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ChatInterface } from './vision-coach/ChatInterface';

/**
 * =================================================================
 * Eva AI Chat Assistant (FREE - Cloudflare AI)
 * =================================================================
 *
 * CHỨC NĂNG:
 * - Hiển thị nút Chat nổi để chat với Dr. Eva
 * - Sử dụng Cloudflare Workers AI (MIỄN PHÍ 100%)
 * - Không cần API key trên frontend
 */
export const VisionCoach: React.FC = () => {
    const { language } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <>
            {/* Chat Button - Always visible */}
            <div
                data-tour="eva-coach"
                className={`fixed bottom-8 right-8 z-40 group ${isOpen ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'} transition-all duration-300`}
            >
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-gradient-to-br from-green-500 to-emerald-700 text-white rounded-full p-4 shadow-lg hover:shadow-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-300 transform hover:scale-110 active:scale-95"
                    aria-label={language === 'vi' ? 'Chat với Eva' : 'Chat with Eva'}
                    title={language === 'vi' ? 'Chat với Eva' : 'Chat with Eva'}
                >
                    <MessageCircle size={28} className="drop-shadow-md" />
                </button>
                <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 dark:bg-gray-800 text-white text-sm px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg font-medium">
                    {language === 'vi' ? 'Chat với Bác sĩ Eva (AI)' : 'Chat with Dr. Eva (AI)'}
                </span>
            </div>

            {/* Chat Interface Modal */}
            {isOpen && (
                <ChatInterface isOpen={isOpen} onClose={handleClose} />
            )}
        </>
    );
};
