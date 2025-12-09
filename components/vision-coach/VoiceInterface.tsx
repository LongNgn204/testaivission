import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Bot, Mic, MicOff, Volume2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useRoutine } from '../../context/RoutineContext';
import { StorageService } from '../../services/storageService';
import { ChatbotService } from '../../services/chatbotService';

const storageService = new StorageService();

interface VoiceInterfaceProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Free Voice Chat Interface
 * Uses:
 * - Browser Web Speech API for Speech Recognition (STT)
 * - Cloudflare Workers AI (LLAMA 3.1) for AI response - FREE!
 * - Browser SpeechSynthesis for Text-to-Speech (TTS)
 * 
 * NO API KEY REQUIRED!
 */
export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ isOpen, onClose }) => {
    const { t, language } = useLanguage();
    const { userProfile } = useRoutine();
    const navigate = useNavigate();

    const [status, setStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
    const [userTranscript, setUserTranscript] = useState('');
    const [botTranscript, setBotTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);

    const recognitionRef = useRef<any>(null);
    const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
    const chatbotService = useRef(new ChatbotService());

    // Check if speech recognition is supported
    const isSpeechSupported = typeof window !== 'undefined' &&
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

    // Check if speech synthesis is supported
    const isSynthesisSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

    // Get best voice for language
    const getBestVoice = useCallback(() => {
        if (!isSynthesisSupported) return null;

        const voices = speechSynthesis.getVoices();
        const targetLang = language === 'vi' ? 'vi' : 'en';

        // Try to find a good quality voice
        const preferredVoices = voices.filter(v =>
            v.lang.startsWith(targetLang) &&
            (v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Natural') || v.localService === false)
        );

        if (preferredVoices.length > 0) return preferredVoices[0];

        // Fallback to any voice for the language
        const langVoices = voices.filter(v => v.lang.startsWith(targetLang));
        if (langVoices.length > 0) return langVoices[0];

        // Last resort: first available voice
        return voices[0] || null;
    }, [language, isSynthesisSupported]);

    // Speak text using browser TTS
    const speak = useCallback((text: string) => {
        if (!isSynthesisSupported || !text) return;

        // Cancel any ongoing speech
        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = getBestVoice();
        utterance.lang = language === 'vi' ? 'vi-VN' : 'en-US';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => setStatus('speaking');
        utterance.onend = () => {
            setStatus('listening');
            setBotTranscript('');
            startListening();
        };
        utterance.onerror = () => {
            setStatus('listening');
            startListening();
        };

        synthRef.current = utterance;
        speechSynthesis.speak(utterance);
    }, [language, isSynthesisSupported, getBestVoice]);

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

        try {
            const history = storageService.getTestHistory();
            const context = history.length > 0 ? history[0] : null;

            const response = await chatbotService.current.chat(text, context, userProfile, language);

            setBotTranscript(response);
            speak(response);
        } catch (err: any) {
            console.error('Voice AI error:', err);
            const errorMsg = language === 'vi'
                ? 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.'
                : 'Sorry, an error occurred. Please try again.';
            setBotTranscript(errorMsg);
            speak(errorMsg);
        }
    }, [language, userProfile, speak]);

    // Start speech recognition
    const startListening = useCallback(() => {
        if (!isSpeechSupported) {
            setError(language === 'vi'
                ? 'Trình duyệt không hỗ trợ nhận diện giọng nói'
                : 'Browser does not support speech recognition');
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = language === 'vi' ? 'vi-VN' : 'en-US';
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => {
            setStatus('listening');
            setUserTranscript('');
            setError(null);
        };

        recognition.onresult = (event: any) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            setUserTranscript(transcript);

            // If final result
            if (event.results[event.results.length - 1].isFinal) {
                const finalTranscript = transcript.trim();

                // Check if it's a command first
                if (!processCommand(finalTranscript)) {
                    // Not a command, send to AI
                    sendToAI(finalTranscript);
                }
            }
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'not-allowed') {
                setError(language === 'vi'
                    ? 'Vui lòng cho phép truy cập microphone'
                    : 'Please allow microphone access');
            } else if (event.error !== 'no-speech') {
                setError(language === 'vi'
                    ? 'Lỗi nhận diện giọng nói: ' + event.error
                    : 'Speech recognition error: ' + event.error);
            }
            setStatus('idle');
        };

        recognition.onend = () => {
            // Auto-restart if still in listening mode and no error
            if (status === 'listening' && !error) {
                // Don't auto-restart, wait for user to click again
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [isSpeechSupported, language, status, error, processCommand, sendToAI]);

    // Stop listening
    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        speechSynthesis.cancel();
        setStatus('idle');
    }, []);

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
            setUserTranscript('');
            setBotTranscript('');
            setError(null);
        }
    }, [isOpen, stopListening]);

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
                    {userTranscript && (
                        <div className="bg-white/10 rounded-lg p-4 animate-fade-in">
                            <p className="text-sm text-gray-400 mb-1">
                                {language === 'vi' ? 'Bạn nói:' : 'You said:'}
                            </p>
                            <p className="text-lg text-white">"{userTranscript}"</p>
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
