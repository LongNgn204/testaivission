import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Bot, Mic, MicOff, Volume2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useRoutine } from '../../context/RoutineContext';
import { StorageService } from '../../services/storageService';
import { ChatbotService } from '../../services/chatbotService';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

const storageService = new StorageService();

interface VoiceInterfaceProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Free Voice Chat Interface
 * Uses:
 * - Browser Web Speech API for Speech Recognition (STT)
 * - Cloudflare Workers AI (GPT-OSS-120B) for AI response - FREE!
 * - Browser SpeechSynthesis for Text-to-Speech (TTS)
 * 
 * NO API KEY REQUIRED!
 */
export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ isOpen, onClose }) => {
    const { t, language } = useLanguage();
    const { userProfile } = useRoutine();
    const navigate = useNavigate();

    const [status, setStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
    const [botTranscript, setBotTranscript] = useState('');
    
    // Chú thích: dùng hook useSpeechRecognition để quản lý STT
    const speechRecognition = useSpeechRecognition(language);
    const { isSupported: isSpeechSupported, isListening, interimText, finalText, error: speechError, start: startSTT, stop: stopSTT, reset: resetSTT } = speechRecognition;
    
    const [error, setError] = useState<string | null>(null);
    const lastSentTextRef = useRef<string>('');
    const chatbotService = useRef(new ChatbotService());

    // Check if speech synthesis is supported
    const isSynthesisSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

    // Chú thích: TTS với callback để restart listening sau khi nói xong
    const speak = useCallback((text: string) => {
        if (!isSynthesisSupported || !text) return;

        setStatus('speaking');
        setBotTranscript(text);

        // Chú thích: dùng SpeechSynthesis với callback để restart listening
        const synth = window.speechSynthesis;
        synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'vi' ? 'vi-VN' : 'en-US';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onend = () => {
            setStatus('listening');
            setBotTranscript('');
            // Restart listening sau khi nói xong
            if (isOpen) {
                startSTT();
            }
        };

        utterance.onerror = () => {
            setStatus('listening');
            if (isOpen) {
                startSTT();
            }
        };

        synth.speak(utterance);
    }, [language, isSynthesisSupported, isOpen, startSTT]);

    // Process voice command and handle navigation/tests
    const processCommand = useCallback((transcript: string): boolean => {
        const lower = transcript.toLowerCase();

        // Test commands
        const testMap: Record<string, string> = {
            'snellen': 'snellen',
            'thị lực': 'snellen',
            'visual acuity': 'snellen',
            'mù màu': 'colorblind',
            'color blind': 'colorblind',
            'colorblind': 'colorblind',
            'loạn thị': 'astigmatism',
            'astigmatism': 'astigmatism',
            'amsler': 'amsler',
            'hoàng điểm': 'amsler',
            'macular': 'amsler',
            'duochrome': 'duochrome',
            'hai màu': 'duochrome',
        };

        for (const [keyword, test] of Object.entries(testMap)) {
            if (lower.includes(keyword) && (lower.includes('test') || lower.includes('kiểm tra') || lower.includes('làm'))) {
                const msg = language === 'vi'
                    ? `Đang bắt đầu bài kiểm tra ${test}...`
                    : `Starting ${test} test...`;
                setBotTranscript(msg);
                speak(msg);
                setTimeout(() => {
                    navigate(`/home/test/${test}`);
                    onClose();
                }, 1500);
                return true;
            }
        }

        // Navigation commands
        const navMap: Record<string, string> = {
            'lịch sử': 'history',
            'history': 'history',
            'tiến trình': 'progress',
            'progress': 'progress',
            'nhắc nhở': 'reminders',
            'reminders': 'reminders',
            'bệnh viện': 'hospitals',
            'hospitals': 'hospitals',
            'trang chủ': '',
            'home': '',
        };

        for (const [keyword, page] of Object.entries(navMap)) {
            if (lower.includes(keyword)) {
                const msg = language === 'vi'
                    ? `Đang chuyển đến ${keyword}...`
                    : `Navigating to ${keyword}...`;
                setBotTranscript(msg);
                speak(msg);
                setTimeout(() => {
                    navigate(`/home${page ? '/' + page : ''}`);
                    onClose();
                }, 1500);
                return true;
            }
        }

        return false;
    }, [language, navigate, onClose, speak]);

    // Send message to AI and speak response
    const sendToAI = useCallback(async (text: string) => {
        if (!text.trim()) return;

        setStatus('thinking');
        stopSTT(); // Chú thích: dừng STT khi đang suy nghĩ

        try {
            const history = storageService.getTestHistory();
            const context = history.length > 0 ? history[0] : null;

            const response = await chatbotService.current.chat(text, context, userProfile, language);

            speak(response);
        } catch (err: any) {
            console.error('Voice AI error:', err);
            const errorMsg = language === 'vi'
                ? 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.'
                : 'Sorry, an error occurred. Please try again.';
            speak(errorMsg);
        }
    }, [language, userProfile, speak, stopSTT]);

    // Chú thích: theo dõi finalText và gửi khi có thay đổi mới
    useEffect(() => {
        if (finalText && finalText !== lastSentTextRef.current && finalText.trim()) {
            const textToSend = finalText.trim();
            lastSentTextRef.current = textToSend;

            // Check if it's a command first
            if (!processCommand(textToSend)) {
                // Not a command, send to AI
                sendToAI(textToSend);
            }
            
            // Reset STT để chuẩn bị cho lần nói tiếp theo
            resetSTT();
            lastSentTextRef.current = '';
        }
    }, [finalText, processCommand, sendToAI, resetSTT]);

    // Chú thích: sync status với isListening từ hook
    useEffect(() => {
        if (isListening && status !== 'thinking' && status !== 'speaking') {
            setStatus('listening');
        } else if (!isListening && status === 'listening') {
            setStatus('idle');
        }
    }, [isListening, status]);

    // Chú thích: sync error từ hook
    useEffect(() => {
        if (speechError) {
            setError(speechError);
        }
    }, [speechError]);

    // Start listening
    const startListening = useCallback(() => {
        if (!isSpeechSupported) {
            setError(language === 'vi'
                ? 'Trình duyệt không hỗ trợ nhận diện giọng nói'
                : 'Browser does not support speech recognition');
            return;
        }
        setError(null);
        startSTT();
    }, [isSpeechSupported, language, startSTT]);

    // Stop listening
    const stopListening = useCallback(() => {
        stopSTT();
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        setStatus('idle');
    }, [stopSTT]);

    // Toggle listening
    const toggleListening = useCallback(() => {
        if (status === 'listening') {
            stopListening();
        } else if (status === 'idle') {
            startListening();
        }
    }, [status, startListening, stopListening]);

    // Cleanup on close
    useEffect(() => {
        if (!isOpen) {
            stopListening();
            resetSTT();
            setBotTranscript('');
            setError(null);
            lastSentTextRef.current = '';
        }
    }, [isOpen, stopListening, resetSTT]);

    // Auto-start listening when opened
    useEffect(() => {
        if (isOpen && status === 'idle' && !error) {
            // Small delay to ensure modal is visible
            const timer = setTimeout(startListening, 500);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Load voices
    useEffect(() => {
        if (isSynthesisSupported) {
            speechSynthesis.getVoices();
            speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
        }
    }, [isSynthesisSupported]);

    const getStatusText = () => {
        switch (status) {
            case 'listening': return language === 'vi' ? '🎤 Đang nghe...' : '🎤 Listening...';
            case 'thinking': return language === 'vi' ? '🤔 Đang suy nghĩ...' : '🤔 Thinking...';
            case 'speaking': return language === 'vi' ? '🔊 Đang nói...' : '🔊 Speaking...';
            default: return language === 'vi' ? 'Nhấn để nói' : 'Tap to speak';
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'listening': return 'from-green-400 to-emerald-600';
            case 'thinking': return 'from-yellow-400 to-orange-500';
            case 'speaking': return 'from-blue-400 to-indigo-600';
            default: return 'from-gray-400 to-gray-600';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-fade-in p-4">
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
            >
                <X size={32} />
            </button>

            <div className="flex flex-col items-center justify-center text-center text-white flex-grow w-full max-w-2xl">

                {/* Error message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
                        {error}
                    </div>
                )}

                {/* Visualizer */}
                <div
                    onClick={toggleListening}
                    className={`relative w-48 h-48 rounded-full flex items-center justify-center cursor-pointer
                        transition-all duration-500 ${status === 'listening' ? 'scale-110' : 'scale-100'}
                        bg-gradient-to-br ${getStatusColor()} shadow-2xl`}
                >
                    {/* Pulse animation */}
                    {status === 'listening' && (
                        <>
                            <div className="absolute inset-0 rounded-full bg-green-500/30 animate-ping"></div>
                            <div className="absolute inset-0 rounded-full bg-green-500/20 animate-pulse"></div>
                        </>
                    )}

                    {/* Icon */}
                    <div className="relative z-10">
                        {status === 'listening' ? (
                            <Mic size={64} className="text-white animate-pulse" />
                        ) : status === 'speaking' ? (
                            <Volume2 size={64} className="text-white" />
                        ) : status === 'thinking' ? (
                            <Bot size={64} className="text-white animate-bounce" />
                        ) : (
                            <MicOff size={64} className="text-white/70" />
                        )}
                    </div>
                </div>

                {/* Status text */}
                <p className="mt-8 text-2xl font-light tracking-wide text-white/90">
                    {getStatusText()}
                </p>

                {/* Transcripts */}
                <div className="mt-8 min-h-[120px] space-y-4 px-4 w-full">
                    {(interimText || finalText) && (
                        <div className="bg-white/10 rounded-lg p-4 animate-fade-in">
                            <p className="text-sm text-gray-400 mb-1">
                                {language === 'vi' ? 'Bạn nói:' : 'You said:'}
                            </p>
                            <p className="text-lg text-white">
                                {finalText && <span>"{finalText}"</span>}
                                {interimText && !finalText && <span className="text-gray-400">"{interimText}"</span>}
                            </p>
                        </div>
                    )}

                    {botTranscript && (
                        <div className="bg-green-500/20 rounded-lg p-4 animate-fade-in">
                            <p className="text-sm text-green-300 mb-1">
                                {language === 'vi' ? 'Bác sĩ Eva:' : 'Dr. Eva:'}
                            </p>
                            <p className="text-lg text-white">{botTranscript}</p>
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <div className="mt-8 text-white/50 text-sm max-w-md">
                    <p>{language === 'vi'
                        ? 'Bạn có thể hỏi về sức khỏe mắt, hoặc nói "làm test Snellen", "xem lịch sử"...'
                        : 'Ask about eye health, or say "start Snellen test", "show history"...'}
                    </p>
                </div>

                {/* Mic Button for repeated speaking */}
                {(status === 'speaking' || status === 'idle') && (
                    <button
                        onClick={startListening}
                        className="mt-6 flex items-center gap-2 px-6 py-3 bg-green-500/20 hover:bg-green-500/40 border border-green-500/50 rounded-full text-green-300 font-medium transition-all"
                    >
                        <Mic size={20} />
                        {language === 'vi' ? 'Nhấn để nói tiếp' : 'Tap to speak again'}
                    </button>
                )}
            </div>

            {/* Footer */}
            <div className="mb-8 text-center">
                <p className="text-sm text-white/40 font-light tracking-widest uppercase">
                    {language === 'vi' ? 'Bác sĩ Eva - Trợ lý AI' : 'Dr. Eva - AI Assistant'}
                </p>
            </div>

            <style>{`
                .animate-fade-in { animation: fadeIn 0.3s ease-out both; }
                @keyframes fadeIn { 
                    0% { opacity: 0; transform: translateY(10px); } 
                    100% { opacity: 1; transform: translateY(0); } 
                }
            `}</style>
        </div>
    );
};
