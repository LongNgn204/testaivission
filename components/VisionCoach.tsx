<<<<<<< HEAD
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, X, Bot, MessageCircle, Send, Sparkles, Activity, Volume2, StopCircle } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration, Blob } from '@google/genai';
import { useLanguage } from '../context/LanguageContext';
import { useRoutine } from '../context/RoutineContext';
import { useAI } from '../context/AIContext';
import { StorageService } from '../services/storageService';
import { encode, decode, decodeAudioData } from '../utils/audioUtils';

const storageService = new StorageService();

// --- Function Declarations for Gemini ---
const startTestFunctionDeclaration: FunctionDeclaration = {
    name: 'startTest',
    parameters: {
        type: Type.OBJECT,
        description: 'Starts a specific vision test for the user.',
        properties: {
            testName: {
                type: Type.STRING,
                description: 'The name of the test to start. Must be one of: snellen, colorblind, astigmatism, amsler, duochrome.',
            },
        },
        required: ['testName'],
    },
};

const navigateToFunctionDeclaration: FunctionDeclaration = {
    name: 'navigateTo',
    parameters: {
        type: Type.OBJECT,
        description: 'Navigates the user to a specific page in the application.',
        properties: {
            page: {
                type: Type.STRING,
                description: 'The name of the page to navigate to. Must be one of: home, history, about, progress, reminders, hospitals.',
            },
        },
        required: ['page'],
    },
};

const getSystemInstruction = (language: 'vi' | 'en') => {
    if (language === 'vi') {
        return `Bạn là Bác sĩ Eva - Trợ lý Bác sĩ Chuyên khoa Nhãn khoa thông minh với chuyên môn sâu.

CHUYÊN MÔN & VAI TRÒ:
- Bạn là bác sĩ nhãn khoa với 15+ năm kinh nghiệm lâm sàng
- Chuyên sâu: Thị lực, bệnh võng mạc, loạn thị, mù màu, khúc xạ
- Phong cách: Chuyên nghiệp, chi tiết, giải thích dễ hiểu như giáo sư dạy học
- Ngôn ngữ: TIẾNG VIỆT thuần túy, dùng thuật ngữ y khoa chuẩn

CÁCH TƯ VẤN:
1. GIẢI THÍCH CHI TIẾT: 
   - Giải thích bệnh lý, nguyên nhân, cơ chế bệnh
   - Dùng ví dụ thực tế dễ hiểu
   - Liên hệ với sinh hoạt hàng ngày
   
2. PHÂN TÍCH CHUYÊN SÂU:
   - Đọc kết quả test như đọc bệnh án
   - Phân tích từng chỉ số (độ chính xác, mức độ nghiêm trọng)
   - So sánh với tiêu chuẩn y khoa quốc tế
   
3. TƯ VẤN THỰC TẾ:
   - Lộ trình điều trị cụ thể (ngắn hạn/dài hạn)
   - Đưa ra thời gian theo dõi rõ ràng
   - Khuyến cáo khi nào CẦN gặp bác sĩ KHẨN CẤP
   - Hướng dẫn chăm sóc tại nhà chi tiết
   
4. GIÁO DỤC BỆNH NHÂN:
   - Giải thích "Tại sao" sau mỗi khuyến nghị
   - Dạy cách tự theo dõi sức khỏe mắt
   - Phòng ngừa biến chứng
   
5. TƯƠNG TÁC GIỌNG NÓI:
   - Giọng điệu ấm áp, dễ gần như bác sĩ gia đình
   - Trả lời ngắn gọn (30-40 từ) nhưng đủ thông tin
   - Hỏi lại nếu không rõ triệu chứng
   
6. SỬ DỤNG CÔNG CỤ:
   - startTest(testName): Bắt đầu bài kiểm tra (snellen, colorblind, astigmatism, amsler, duochrome)
     VD: Khi user nói "tôi muốn làm test thị lực" → gọi startTest({testName: "snellen"})
     VD: Khi user nói "test mù màu" → gọi startTest({testName: "colorblind"})
   
   - navigateTo(page): Chuyển trang (home, history, about, progress, reminders, hospitals)
     VD: Khi user nói "xem lịch sử" → gọi navigateTo({page: "history"})
     VD: Khi user nói "tìm bệnh viện" → gọi navigateTo({page: "hospitals"})

PHONG CÁCH NÓI CHUYỆN:
"Chào anh/chị, tôi là Bác sĩ Eva. Để tôi xem kết quả kiểm tra của anh/chị..."
"Từ kết quả này, tôi thấy thị lực của anh/chị đang ở mức..."
"Điều này có nghĩa là... Tôi khuyên anh/chị nên..."
"Lý do là vì... nên cần phải..."

HÃY LÀM NHƯ MỘT BÁC SĨ THẬT SỰ: Chuyên nghiệp, tận tâm, giải thích dễ hiểu.`;
    } else {
        return `You are Dr. Eva - AI Medical Assistant specializing in Ophthalmology with deep expertise.

EXPERTISE & ROLE:
- You are an ophthalmologist with 15+ years of clinical experience
- Specialization: Vision, retinal diseases, astigmatism, color blindness, refraction
- Style: Professional, detailed, easy to understand explanations like a professor
- Language: ENGLISH, using standard medical terminology

CONSULTATION METHOD:
1. DETAILED EXPLANATION:
   - Explain pathology, causes, disease mechanisms
   - Use easy-to-understand real-world examples
   - Relate to daily activities

2. IN-DEPTH ANALYSIS:
   - Read test results like a medical record
   - Analyze each indicator (accuracy, severity)
   - Compare with international medical standards

3. PRACTICAL ADVICE:
   - Specific treatment roadmap (short-term/long-term)
   - Give clear follow-up times
   - Recommend when to see a doctor URGENTLY
   - Detailed home care instructions

4. PATIENT EDUCATION:
   - Explain "Why" after each recommendation
   - Teach how to self-monitor eye health
   - Prevent complications

5. VOICE INTERACTION:
   - Warm tone, approachable like a family doctor
   - Concise answers (30-40 words) but informative
   - Ask back if symptoms are unclear

6. TOOL USAGE:
   - startTest(testName): Start a test (snellen, colorblind, astigmatism, amsler, duochrome)
     Ex: When user says "I want to do a vision test" -> call startTest({testName: "snellen"})
   
   - navigateTo(page): Navigate to page (home, history, about, progress, reminders, hospitals)
     Ex: When user says "view history" -> call navigateTo({page: "history"})

CONVERSATION STYLE:
"Hello, I am Dr. Eva. Let me check your test results..."
"From these results, I see your vision is at..."
"This means... I recommend you should..."
"The reason is... so you need to..."

ACT LIKE A REAL DOCTOR: Professional, dedicated, easy to understand.`;
    }
};

=======
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
>>>>>>> cab493fd386716360f3fd4f7e7a23ccc7972d8e7
export const VisionCoach: React.FC = () => {
    const { t, language } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<'voice' | 'chat'>('voice');
<<<<<<< HEAD
    const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking' | 'thinking'>('idle');

    const [userTranscript, setUserTranscript] = useState('');
    const [botTranscript, setBotTranscript] = useState('');

    // Chat mode states
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'bot', text: string }>>([]);
    const chatEndRef = useRef<HTMLDivElement>(null);
=======
>>>>>>> cab493fd386716360f3fd4f7e7a23ccc7972d8e7

    // Kiểm tra API key từ Vite env
    const hasApiKey = (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_GEMINI_API_KEY)
        || (typeof process !== 'undefined' && (process as any)?.env?.VITE_GEMINI_API_KEY)
        || (typeof process !== 'undefined' && (process as any)?.env?.API_KEY);

    if (!hasApiKey) return null;

<<<<<<< HEAD
    // Use the AI hook
    const aiService = useAI();

    const availableFunctions = {
        startTest: ({ testName }: { testName: string }) => {
            const validTests = ['snellen', 'colorblind', 'astigmatism', 'amsler', 'duochrome'];
            const lowerTestName = testName.toLowerCase();
            if (validTests.includes(lowerTestName)) {
                // Close session before navigating to prevent errors
                if (mode === 'voice') {
                    cleanup();
                }

                // Small delay to ensure cleanup completes
                setTimeout(() => {
                    navigate(`/home/test/${lowerTestName}`);
                    setIsOpen(false);
                }, 100);

                return language === 'vi'
                    ? `Được rồi, đang bắt đầu bài test ${testName}.`
                    : `Okay, starting the ${testName} test.`;
            }
            return language === 'vi'
                ? `Xin lỗi, tôi không thể bắt đầu bài test ${testName}.`
                : `Sorry, I can't start a test called ${testName}.`;
        },
        navigateTo: ({ page }: { page: string }) => {
            const validPages = ['home', 'history', 'about', 'progress', 'reminders', 'hospitals'];
            const lowerPage = page.toLowerCase();
            if (validPages.includes(lowerPage)) {
                // Close session before navigating to prevent errors
                if (mode === 'voice') {
                    cleanup();
                }

                // Small delay to ensure cleanup completes
                setTimeout(() => {
                    const path = lowerPage === 'home' ? '/home' : `/home/${lowerPage}`;
                    navigate(path);
                    setIsOpen(false);
                }, 100);

                return language === 'vi'
                    ? `Đang chuyển đến trang ${page}.`
                    : `Navigating to the ${page} page.`;
            }
            return language === 'vi'
                ? `Xin lỗi, tôi không thể chuyển đến trang ${page}.`
                : `Sorry, I can't navigate to a page called ${page}.`;
        }
    };

    const stopAudioPlayback = () => {
        audioQueueRef.current.forEach(source => {
            source.stop();
            audioQueueRef.current.delete(source);
        });
        nextStartTimeRef.current = 0;
    };

    const triggerProactiveTip = useCallback(async () => {
        if (status !== 'listening') return; // Only trigger if truly idle

        setStatus('thinking');
        const history = storageService.getTestHistory();
        const lastTest = history.length > 0 ? history[0] : null;

        const tipText = await aiService.generateProactiveTip(lastTest, userProfile, language);

        if (tipText) {
            setBotTranscript(tipText); // Show the tip as text
            const audioData = await aiService.generateSpeech(tipText, language);
            if (audioData && outputAudioContextRef.current) {
                setStatus('speaking');
                const outputContext = outputAudioContextRef.current;
                const audioBuffer = await decodeAudioData(decode(audioData), outputContext, 24000, 1);
                const source = outputContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputContext.destination);
                source.start();
                audioQueueRef.current.add(source);
                source.onended = () => {
                    audioQueueRef.current.delete(source);
                    setBotTranscript('');
                    setStatus('listening');
                };
            } else {
                setStatus('listening'); // Fallback if speech generation fails
            }
        } else {
            setStatus('listening'); // Fallback if tip generation fails
        }
    }, [language, userProfile, status, aiService]);

    useEffect(() => {
        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
        }

        // Chỉ trigger proactive tip ở chế độ voice
        if (isOpen && mode === 'voice' && status === 'listening') {
            idleTimerRef.current = window.setTimeout(triggerProactiveTip, 15000); // 15 seconds idle timeout
        }

        return () => {
            if (idleTimerRef.current) {
                clearTimeout(idleTimerRef.current);
            }
        };
    }, [isOpen, mode, status, triggerProactiveTip]);

    const handleClose = useCallback(() => {
        setIsOpen(false);
        // Reset chat state khi đóng
        if (mode === 'chat') {
            setChatInput('');
            setStatus('idle');
        }
    }, [mode]);

    const handleChatSubmit = useCallback(async () => {
        if (!chatInput.trim()) return;

        const userMessage = chatInput.trim();
        setChatInput('');
        setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
        setStatus('thinking');

        try {
            const history = storageService.getTestHistory();
            const context = history.length > 0 ? history[0] : null;

            const response = await aiService.chat(userMessage, context, userProfile, language);

            setChatHistory(prev => [...prev, { role: 'bot', text: response }]);
            setStatus('idle');
        } catch (error) {
            console.error('Chat error:', error);
            const errorMsg = language === 'vi'
                ? 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.'
                : 'Sorry, an error occurred. Please try again.';
            setChatHistory(prev => [...prev, { role: 'bot', text: errorMsg }]);
            setStatus('idle');
        }
    }, [chatInput, language, userProfile, aiService]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const cleanup = useCallback(() => {
        stopAudioPlayback();
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (mediaSourceNodeRef.current) {
            mediaSourceNodeRef.current.disconnect();
            mediaSourceNodeRef.current = null;
        }

        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            inputAudioContextRef.current.close();
        }
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            outputAudioContextRef.current.close();
        }

        sessionPromiseRef.current?.then(session => session.close());
        sessionPromiseRef.current = null;
        setStatus('idle');
    }, []);

    const startSession = useCallback(async () => {
        if (!import.meta.env.VITE_GEMINI_API_KEY || sessionPromiseRef.current) return;
        setStatus('connecting');

        aiRef.current = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

        try {
            mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (error) {
            console.error("Microphone access denied:", error);
            setStatus('idle');
            return;
        }

        try {
            sessionPromiseRef.current = aiRef.current.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: language === 'vi' ? 'Kore' : 'Zephyr' } } },
                    systemInstruction: getSystemInstruction(language),
                    tools: [{ functionDeclarations: [startTestFunctionDeclaration, navigateToFunctionDeclaration] }],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
                callbacks: {
                    onopen: () => {
                        setStatus('listening');
                        mediaSourceNodeRef.current = inputAudioContextRef.current!.createMediaStreamSource(mediaStreamRef.current!);
                        scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current.onaudioprocess = (event) => {
                            const inputData = event.inputBuffer.getChannelData(0);
                            const pcmBlob: Blob = {
                                data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            sessionPromiseRef.current?.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                        };
                        mediaSourceNodeRef.current.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.interrupted) {
                            stopAudioPlayback();
                        }
                        if (message.serverContent?.inputTranscription?.text) {
                            setUserTranscript(prev => prev + message.serverContent!.inputTranscription!.text);
                        }
                        if (message.serverContent?.outputTranscription?.text) {
                            setBotTranscript(prev => prev + message.serverContent!.outputTranscription!.text);
                        }
                        if (message.serverContent?.turnComplete) {
                            setUserTranscript('');
                            setBotTranscript('');
                        }

                        const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (audioData) {
                            setStatus('speaking');
                            const outputContext = outputAudioContextRef.current!;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputContext.currentTime);
                            const audioBuffer = await decodeAudioData(decode(audioData), outputContext, 24000, 1);
                            const source = outputContext.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputContext.destination);
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            audioQueueRef.current.add(source);
                            source.onended = () => {
                                audioQueueRef.current.delete(source);
                                if (audioQueueRef.current.size === 0) {
                                    setStatus('listening');
                                }
                            };
                        }

                        if (message.toolCall?.functionCalls) {
                            setStatus('thinking');
                            for (const fc of message.toolCall.functionCalls) {
                                const func = (availableFunctions as any)[fc.name];
                                if (func) {
                                    const result = func(fc.args);
                                    sessionPromiseRef.current?.then(session => {
                                        session.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result } } });
                                    });
                                }
                            }
                        }
                    },
                    onerror: (e) => console.error("Session error:", e),
                    onclose: () => cleanup(),
                },
            });

            sessionPromiseRef.current.catch(err => {
                console.error("Session connection failed:", err);
                setStatus('idle');
                setIsOpen(false);
            });
        } catch (error) {
            console.error("Failed to start session:", error);
            setStatus('idle');
        }


    }, [language, navigate, cleanup]);

    useEffect(() => {
        if (isOpen && mode === 'voice') {
            startSession();
        } else {
            cleanup();
        }
        return cleanup;
    }, [isOpen, mode, startSession, cleanup]);

    if (!import.meta.env.VITE_GEMINI_API_KEY) return null;

    const getStatusText = () => {
        switch (status) {
            case 'connecting': return t('coach_status_connecting');
            case 'listening': return t('coach_status_speak');
            case 'speaking': return t('coach_status_listening');
            case 'thinking': return t('coach_status_thinking');
            default: return '';
        }
=======
    const handleClose = () => {
        setIsOpen(false);
>>>>>>> cab493fd386716360f3fd4f7e7a23ccc7972d8e7
    };

    return (
        <>
<<<<<<< HEAD
            {/* Floating Action Buttons - Glassmorphism Style */}
            <div className={`fixed bottom-8 right-8 z-40 flex flex-col gap-4 transition-all duration-500 ${isOpen ? 'translate-y-20 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
                <button
                    onClick={() => { setMode('chat'); setIsOpen(true); }}
                    className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-glass hover:bg-white/20 transition-all duration-300 hover:scale-110"
=======
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
>>>>>>> cab493fd386716360f3fd4f7e7a23ccc7972d8e7
                    aria-label={language === 'vi' ? 'Chat với Eva' : 'Chat with Eva'}
                    title={language === 'vi' ? 'Chat với Eva' : 'Chat with Eva'}
                >
<<<<<<< HEAD
                    <MessageCircle size={24} className="text-white drop-shadow-glow" />
                    <span className="absolute right-full mr-4 px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {language === 'vi' ? 'Chat' : 'Chat'}
                    </span>
                </button>

                <button
                    onClick={() => { setMode('voice'); setIsOpen(true); }}
                    className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 shadow-neon hover:shadow-glow transition-all duration-300 hover:scale-110 animate-pulse-slow"
                    aria-label={t('coach_button_aria')}
                >
                    <Mic size={28} className="text-white" />
                    <span className="absolute right-full mr-4 px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {language === 'vi' ? 'Trợ lý ảo' : 'Voice Assistant'}
                    </span>
                </button>
            </div>

            {/* Voice Interface - Holographic/Futuristic */}
            {isOpen && mode === 'voice' && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl animate-fade-in">
                    <button
                        onClick={handleClose}
                        className="absolute top-8 right-8 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
                    >
                        <X size={32} />
                    </button>

                    <div className="flex flex-col items-center justify-center w-full max-w-4xl px-4">
                        {/* Holographic Avatar */}
                        <div className="relative w-64 h-64 mb-12 flex items-center justify-center">
                            {/* Outer Rings */}
                            <div className={`absolute inset-0 rounded-full border-2 border-primary-500/30 animate-[spin_10s_linear_infinite] ${status === 'speaking' ? 'border-green-500/50' : ''}`} />
                            <div className={`absolute inset-4 rounded-full border border-secondary-500/30 animate-[spin_15s_linear_infinite_reverse]`} />

                            {/* Core Glow */}
                            <div className={`absolute inset-0 rounded-full blur-3xl transition-colors duration-500 ${status === 'listening' ? 'bg-primary-500/20' :
                                    status === 'speaking' ? 'bg-green-500/20' :
                                        status === 'thinking' ? 'bg-purple-500/20' : 'bg-blue-500/10'
                                }`} />

                            {/* Center Visual */}
                            <div className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center bg-black/50 backdrop-blur-md border border-white/10 shadow-inner transition-transform duration-500 ${status === 'speaking' ? 'scale-110' : 'scale-100'}`}>
                                {status === 'thinking' ? (
                                    <Sparkles size={48} className="text-purple-400 animate-pulse" />
                                ) : status === 'speaking' ? (
                                    <Volume2 size={48} className="text-green-400 animate-pulse" />
                                ) : (
                                    <Bot size={48} className="text-primary-400" />
                                )}
                            </div>

                            {/* Audio Waves (Visual only) */}
                            {status === 'speaking' && (
                                <>
                                    <div className="absolute inset-0 rounded-full border border-green-500/40 animate-ping" />
                                    <div className="absolute inset-0 rounded-full border border-green-500/20 animate-ping delay-300" />
                                </>
                            )}
                        </div>

                        {/* Status Text */}
                        <div className="text-center space-y-6 max-w-2xl">
                            <h2 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-secondary-300 animate-pulse">
                                {getStatusText()}
                            </h2>

                            <div className="min-h-[120px] space-y-4">
                                {userTranscript && (
                                    <p className="text-xl text-gray-300 font-light leading-relaxed animate-fade-in-up">
                                        "{userTranscript}"
                                    </p>
                                )}
                                {botTranscript && (
                                    <p className="text-xl text-white font-medium leading-relaxed animate-fade-in-up">
                                        {botTranscript}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-12 text-white/30 text-sm font-mono tracking-widest">
                        AI VISION ASSISTANT ACTIVE
                    </div>
                </div>
            )}

            {/* Chat Interface - Modern Glassmorphism */}
            {isOpen && mode === 'chat' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="glass-card w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-white/20 dark:border-gray-700/50">
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg">
                                        <Bot size={24} className="text-white" />
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display">
                                        {language === 'vi' ? 'Bác sĩ Eva' : 'Dr. Eva'}
                                    </h3>
                                    <p className="text-xs text-primary-600 dark:text-primary-400 font-medium tracking-wide uppercase">
                                        {language === 'vi' ? 'Trợ lý Nhãn khoa AI' : 'AI Ophthalmology Assistant'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 dark:bg-gray-900/50">
                            {chatHistory.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-60">
                                    <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-2">
                                        <Sparkles size={40} className="text-primary-500" />
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 max-w-xs">
                                        {language === 'vi'
                                            ? 'Chào bạn! Tôi là Eva. Tôi có thể giúp gì cho đôi mắt của bạn hôm nay?'
                                            : 'Hello! I\'m Eva. How can I help with your eye health today?'}
                                    </p>
                                </div>
                            )}

                            {chatHistory.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                                    <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm ${msg.role === 'user'
                                            ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-br-none'
                                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-none'
                                        }`}>
                                        <p className="text-sm leading-relaxed">{msg.text}</p>
                                    </div>
                                </div>
                            ))}

                            {status === 'thinking' && (
                                <div className="flex justify-start animate-fade-in">
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-none px-5 py-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-900/50 p-1.5 rounded-full border border-gray-200 dark:border-gray-700 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                                    placeholder={language === 'vi' ? 'Nhập câu hỏi của bạn...' : 'Type your question...'}
                                    className="flex-1 px-4 py-2 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400"
                                    disabled={status === 'thinking'}
                                />
                                <button
                                    onClick={handleChatSubmit}
                                    disabled={!chatInput.trim() || status === 'thinking'}
                                    className="p-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-full transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
=======
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
>>>>>>> cab493fd386716360f3fd4f7e7a23ccc7972d8e7
            )}
        </>
    );
};
