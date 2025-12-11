import React, { useState } from 'react';
import { MessageCircle, Mic } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ChatInterface } from './vision-coach/ChatInterface';
import { VoiceInterface } from './vision-coach/VoiceInterface';

/**
 * =================================================================
 * Eva AI Assistant (FREE - Cloudflare AI + Browser APIs)
 * =================================================================
 *
 * CHỨC NĂNG:
 * - Nút Chat (xanh lá): Chat text với Dr. Eva
 * - Nút Voice (xanh dương): Nói chuyện bằng giọng nói
 * - Chat: Cloudflare Workers AI (LLAMA 3.1)
 * - Voice: Browser Web Speech API + Cloudflare AI
 */
export const VisionCoach: React.FC = () => {
    const { language } = useLanguage();
    const [chatOpen, setChatOpen] = useState(false);
    const [voiceOpen, setVoiceOpen] = useState(false);

    const isAnyOpen = chatOpen || voiceOpen;

    return (
        <>
            {/* Floating Buttons Container */}
            <div
                className={`fixed bottom-8 right-8 z-40 flex flex-col gap-3 
                    ${isAnyOpen ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'} 
                    transition-all duration-300`}
            >
                {/* Voice Button */}
                <div className="group relative" data-tour="eva-voice">
                    <button
                        onClick={() => setVoiceOpen(true)}
                        className="bg-gradient-to-br from-blue-500 to-indigo-700 text-white rounded-full p-3 shadow-lg hover:shadow-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-300 transform hover:scale-110 active:scale-95"
                        aria-label={language === 'vi' ? 'Nói chuyện với Eva' : 'Talk to Eva'}
                        title={language === 'vi' ? 'Nói chuyện với Eva' : 'Talk to Eva'}
                    >
                        <Mic size={22} className="drop-shadow-md" />
                    </button>
                    <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 dark:bg-gray-800 text-white text-sm px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg font-medium">
                        {language === 'vi' ? 'Nói chuyện 🎤' : 'Voice Chat 🎤'}
                    </span>
                </div>

                {/* Chat Button */}
                <div className="group relative" data-tour="eva-coach">
                    <button
                        onClick={() => setChatOpen(true)}
                        className="bg-gradient-to-br from-green-500 to-emerald-700 text-white rounded-full p-4 shadow-lg hover:shadow-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-300 transform hover:scale-110 active:scale-95"
                        aria-label={language === 'vi' ? 'Chat với Eva' : 'Chat with Eva'}
                        title={language === 'vi' ? 'Chat với Eva' : 'Chat with Eva'}
                    >
                        <MessageCircle size={28} className="drop-shadow-md" />
                    </button>
                    <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 dark:bg-gray-800 text-white text-sm px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg font-medium">
                        {language === 'vi' ? 'Chat văn bản 💬' : 'Text Chat 💬'}
                    </span>
                </div>
            </div>

            {/* Chat Interface Modal */}
            {chatOpen && (
                <ChatInterface isOpen={chatOpen} onClose={() => setChatOpen(false)} />
            )}

            {/* Voice Interface Modal */}
            {voiceOpen && (
                <VoiceInterface isOpen={voiceOpen} onClose={() => setVoiceOpen(false)} />
            )}
        </>
    );
};
