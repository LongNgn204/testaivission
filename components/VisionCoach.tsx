
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, X, Bot, MessageCircle, Send } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration, Blob } from '@google/genai';
import { useLanguage } from '../context/LanguageContext';
import { useRoutine } from '../context/RoutineContext';
import { StorageService } from '../services/storageService';
import { AIService } from '../services/aiService';
import { encode, decode, decodeAudioData } from '../utils/audioUtils';


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
    const langInstruction = language === 'vi' ? 'VIETNAMESE' : 'ENGLISH';
    
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
- Ophthalmologist with 15+ years clinical experience
- Specialties: Vision, retinal diseases, astigmatism, color blindness, refractive errors
- Style: Professional, detailed, explain like a professor
- Language: ENGLISH only, use proper medical terminology

CONSULTATION APPROACH:
1. DETAILED EXPLANATION:
   - Explain pathology, causes, disease mechanisms
   - Use real-life examples
   - Relate to daily activities
   
2. IN-DEPTH ANALYSIS:
   - Read test results like medical records
   - Analyze each metric (accuracy, severity)
   - Compare with international standards
   
3. PRACTICAL ADVICE:
   - Specific treatment roadmap (short/long-term)
   - Clear follow-up timeline
   - Urgent care warnings
   - Detailed home care instructions
   
4. PATIENT EDUCATION:
   - Explain "Why" behind each recommendation
   - Teach self-monitoring techniques
   - Prevent complications
   
5. VOICE INTERACTION:
   - Warm, friendly like a family doctor
   - Concise (30-40 words) but informative
   - Ask clarifying questions about symptoms
   
6. TOOLS USAGE:
   - startTest: Begin specialized vision tests
   - navigateTo: View results/history

SPEAKING STYLE:
"Hello, I'm Dr. Eva. Let me review your test results..."
"Based on these findings, your vision is at..."
"This means... I recommend you should..."
"The reason is... so you need to..."

BE A REAL DOCTOR: Professional, caring, easy to understand.`;
    }
};

const storageService = new StorageService();
const aiService = new AIService();

export const VisionCoach: React.FC = () => {
    const { t, language } = useLanguage();
    const { userProfile } = useRoutine();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<'voice' | 'chat'>('voice');
    const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking' | 'thinking'>('idle');
    
    const [userTranscript, setUserTranscript] = useState('');
    const [botTranscript, setBotTranscript] = useState('');
    
    // Chat mode states
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'bot', text: string }>>([]);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const aiRef = useRef<GoogleGenAI | null>(null);
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaSourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

    const audioQueueRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const nextStartTimeRef = useRef(0);
    const idleTimerRef = useRef<number | null>(null);

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
    }, [language, userProfile, status]);
    
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
    }, [chatInput, language, userProfile]);
    
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
        if (!process.env.API_KEY || sessionPromiseRef.current) return;
        setStatus('connecting');

        aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
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

    if (!process.env.API_KEY) return null;

    const getStatusText = () => {
        switch(status) {
            case 'connecting': return t('coach_status_connecting');
            case 'listening': return t('coach_status_speak');
            case 'speaking': return t('coach_status_listening');
            case 'thinking': return t('coach_status_thinking');
            default: return '';
        }
    };

    return (
        <>
            {/* Floating action buttons */}
            <div className={`fixed bottom-24 right-8 z-40 group ${isOpen ? 'opacity-0 scale-90' : 'opacity-100 scale-100'} transition-all duration-300`}>
                <button
                    onClick={() => { setMode('voice'); setIsOpen(true); }}
                    className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all duration-300"
                    aria-label={t('coach_button_aria')}
                >
                    <Mic size={28} />
                </button>
                <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {language === 'vi' ? 'Nói chuyện bằng giọng' : 'Voice Chat'}
                </span>
            </div>
            
            <div className={`fixed bottom-8 right-8 z-40 group ${isOpen ? 'opacity-0 scale-90' : 'opacity-100 scale-100'} transition-all duration-300`}>
                <button
                    onClick={() => { setMode('chat'); setIsOpen(true); }}
                    className="bg-green-600 text-white rounded-full p-4 shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 transition-all duration-300"
                    aria-label={language === 'vi' ? 'Chat với Eva' : 'Chat with Eva'}
                >
                    <MessageCircle size={28} />
                </button>
                <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {language === 'vi' ? 'Chat bằng văn bản' : 'Text Chat'}
                </span>
            </div>

            {isOpen && mode === 'voice' && (
                <div className="fixed inset-0 bg-black/70 z-50 flex flex-col items-center justify-center animate-fade-in p-4">
                    <button onClick={handleClose} className="absolute top-6 right-6 text-white/70 hover:text-white"><X size={32} /></button>
                    
                    <div className="flex flex-col items-center justify-center text-center text-white flex-grow">
                         <div className={`relative w-48 h-48 rounded-full flex items-center justify-center transition-colors duration-300 ${status === 'speaking' ? 'bg-green-500/20' : 'bg-blue-500/20'}`}>
                            <div className={`absolute w-full h-full rounded-full ${status === 'listening' || status === 'speaking' ? 'animate-pulse' : ''} ${status === 'speaking' ? 'bg-green-500/30' : 'bg-blue-500/30'}`}></div>
                             <Bot size={64} className={`${status === 'speaking' ? 'text-green-300' : 'text-blue-300'}`}/>
                        </div>

                        <p className="mt-8 text-2xl font-semibold h-8">{getStatusText()}</p>
                        
                        <div className="mt-4 h-24 max-w-xl w-full text-center">
                            <p className="text-lg text-gray-300 min-h-[28px]">{userTranscript}</p>
                            <p className="text-xl font-medium text-white min-h-[32px]">{botTranscript}</p>
                        </div>
                    </div>
                   
                    <p className="text-sm text-white/50 mb-4">{t('coach_title')}</p>
                </div>
            )}

            {isOpen && mode === 'chat' && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                                    <Bot size={24} className="text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{language === 'vi' ? 'Chat với Eva' : 'Chat with Eva'}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{language === 'vi' ? 'Trợ lý Bác sĩ Nhãn khoa AI' : 'AI Ophthalmology Assistant'}</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleClose} 
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Chat messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {chatHistory.length === 0 && (
                                <div className="text-center text-gray-500 dark:text-gray-400 mt-20">
                                    <Bot size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>{language === 'vi' ? 'Chào bạn! Tôi là Eva. Hỏi tôi bất cứ điều gì về sức khỏe mắt của bạn.' : 'Hello! I\'m Eva. Ask me anything about your eye health.'}</p>
                                </div>
                            )}
                            
                            {chatHistory.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                        msg.role === 'user' 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                                    }`}>
                                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                            
                            {status === 'thinking' && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3">
                                        <div className="flex gap-2">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                                    placeholder={language === 'vi' ? 'Gõ câu hỏi của bạn...' : 'Type your question...'}
                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    disabled={status === 'thinking'}
                                />
                                <button
                                    onClick={handleChatSubmit}
                                    disabled={!chatInput.trim() || status === 'thinking'}
                                    className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl transition-colors duration-200 flex items-center justify-center"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .animate-fade-in { animation: fadeIn 0.3s ease-out both; }
                @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
            `}</style>
        </>
    );
};