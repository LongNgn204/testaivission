import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Bot } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration, Blob } from '@google/genai';
import { useLanguage } from '../../context/LanguageContext';
import { useRoutine } from '../../context/RoutineContext';
import { StorageService } from '../../services/storageService';

import { encode, decode, decodeAudioData } from '../../utils/audioUtils';
import { AIService } from '../../services/aiService';

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

interface VoiceInterfaceProps {
    isOpen: boolean;
    onClose: () => void;
}

export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ isOpen, onClose }) => {
    const { t, language } = useLanguage();
    const { userProfile } = useRoutine();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking' | 'thinking'>('idle');
    
    const [userTranscript, setUserTranscript] = useState('');
    const [botTranscript, setBotTranscript] = useState('');
    
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

    const aiService = new AIService();

    const availableFunctions = {
        startTest: ({ testName }: { testName: string }) => {
            const validTests = ['snellen', 'colorblind', 'astigmatism', 'amsler', 'duochrome'];
            const lowerTestName = testName.toLowerCase();
            if (validTests.includes(lowerTestName)) {
                cleanup();
                setTimeout(() => {
                    navigate(`/home/test/${lowerTestName}`);
                    onClose();
                }, 100);
                return language === 'vi' ? `Được rồi, đang bắt đầu bài test ${testName}.` : `Okay, starting the ${testName} test.`;
            }
            return language === 'vi' ? `Xin lỗi, tôi không thể bắt đầu bài test ${testName}.` : `Sorry, I can't start a test called ${testName}.`;
        },
        navigateTo: ({ page }: { page: string }) => {
            const validPages = ['home', 'history', 'about', 'progress', 'reminders', 'hospitals'];
            const lowerPage = page.toLowerCase();
            if (validPages.includes(lowerPage)) {
                cleanup();
                setTimeout(() => {
                    const path = lowerPage === 'home' ? '/home' : `/home/${lowerPage}`;
                    navigate(path);
                    onClose();
                }, 100);
                return language === 'vi' ? `Đang chuyển đến trang ${page}.` : `Navigating to the ${page} page.`;
            }
            return language === 'vi' ? `Xin lỗi, tôi không thể chuyển đến trang ${page}.` : `Sorry, I can't navigate to a page called ${page}.`;
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
        if (status !== 'listening') return;
    
        setStatus('thinking');
        const history = storageService.getTestHistory();
        const lastTest = history.length > 0 ? history[0] : null;
    
        const tipText = await aiService.generateProactiveTip(lastTest, userProfile, language);
    
        if (tipText) {
            setBotTranscript(tipText);
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
                 setStatus('listening');
            }
        } else {
            setStatus('listening');
        }
    }, [language, userProfile, status]);
    
    useEffect(() => {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        if (isOpen && status === 'listening') {
            idleTimerRef.current = window.setTimeout(triggerProactiveTip, 15000);
        }
        return () => {
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        };
    }, [isOpen, status, triggerProactiveTip]);
    
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

    // Helper: timeout wrapper
    const withTimeout = useCallback(<T,>(promise: Promise<T>, ms: number): Promise<T> => {
        return Promise.race([
            promise,
            new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), ms)) as Promise<T>,
        ]);
    }, []);

    const startSession = useCallback(async () => {
        // Resolve API key from Vite env (preferred) or process.env fallback
        const apiKey: string | undefined = (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_GEMINI_API_KEY)
            || (typeof process !== 'undefined' && (process as any)?.env?.API_KEY);

        if (!apiKey || sessionPromiseRef.current) {
            console.error('VoiceInterface: Missing API key or session already exists');
            return;
        }
        setStatus('connecting');

        aiRef.current = new GoogleGenAI({ apiKey });
        
        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

        // Resume contexts if suspended (Safari/Chrome autoplay policies)
        if (inputAudioContextRef.current.state === 'suspended') {
            await inputAudioContextRef.current.resume();
        }
        if (outputAudioContextRef.current.state === 'suspended') {
            await outputAudioContextRef.current.resume();
        }
        
        try {
            mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (error: any) {
            console.error('Microphone error:', error);
            let msg = 'Microphone error';
            if (error?.name === 'NotAllowedError') {
                msg = language === 'vi' ? 'Cần cấp quyền truy cập microphone' : 'Microphone permission required';
            } else if (error?.name === 'NotFoundError') {
                msg = language === 'vi' ? 'Không tìm thấy microphone' : 'No microphone found';
            } else if (error?.name === 'NotReadableError') {
                msg = language === 'vi' ? 'Microphone đang được ứng dụng khác sử dụng' : 'Microphone is in use by another application';
            }
            alert(msg);
            setStatus('idle');
            onClose();
            return;
        }
        
        try {
            sessionPromiseRef.current = await withTimeout(
                aiRef.current.live.connect({
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
                            const inputCtx = inputAudioContextRef.current!;
                            mediaSourceNodeRef.current = inputCtx.createMediaStreamSource(mediaStreamRef.current!);
                            scriptProcessorRef.current = inputCtx.createScriptProcessor(4096, 1, 1);

                            // Proper Float32 -> Int16 conversion with clipping
                            scriptProcessorRef.current.onaudioprocess = (event) => {
                                const inputData = event.inputBuffer.getChannelData(0);
                                const int16Data = new Int16Array(inputData.length);
                                for (let i = 0; i < inputData.length; i++) {
                                    const s = Math.max(-1, Math.min(1, inputData[i]));
                                    int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
                                }
                                const pcmBlob: Blob = {
                                    data: encode(new Uint8Array(int16Data.buffer)),
                                    mimeType: 'audio/pcm;rate=16000',
                                };
                                sessionPromiseRef.current?.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                            };

                            // Gain for mic boost
                            const gainNode = inputCtx.createGain();
                            gainNode.gain.value = 1.5; // +50%

                            // Silent output chain to keep processor running without feedback
                            const silentGain = inputCtx.createGain();
                            silentGain.gain.value = 0; // mute

                            mediaSourceNodeRef.current.connect(gainNode);
                            gainNode.connect(scriptProcessorRef.current);
                            scriptProcessorRef.current.connect(silentGain);
                            silentGain.connect(inputCtx.destination);
                        },
                        onmessage: async (message: LiveServerMessage) => {
                            if (message.serverContent?.interrupted) stopAudioPlayback();
                            if (message.serverContent?.inputTranscription?.text) setUserTranscript(prev => prev + message.serverContent!.inputTranscription!.text);
                            if (message.serverContent?.outputTranscription?.text) setBotTranscript(prev => prev + message.serverContent!.outputTranscription!.text);
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
                                    if (audioQueueRef.current.size === 0) setStatus('listening');
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
                        onerror: (e) => console.error('Session error:', e),
                        onclose: () => cleanup(),
                    },
                }),
                10000 // 10s timeout
            );

            sessionPromiseRef.current.catch(err => {
                console.error('Session connection failed:', err);
                setStatus('idle');
                onClose();
            });
        } catch (error) {
            console.error('Failed to start session:', error);
            setStatus('idle');
        }
    }, [language, navigate, cleanup, onClose, withTimeout]);

    useEffect(() => {
        if (isOpen) startSession();
        else cleanup();
        return cleanup;
    }, [isOpen, startSession, cleanup]);

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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-fade-in p-4">
            <button onClick={onClose} className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10">
                <X size={32} />
            </button>
            
            <div className="flex flex-col items-center justify-center text-center text-white flex-grow w-full max-w-2xl">
                 {/* Visualizer Effect */}
                 <div className={`relative w-64 h-64 rounded-full flex items-center justify-center transition-all duration-500 ${status === 'speaking' ? 'scale-110' : 'scale-100'}`}>
                    {/* Outer Glow */}
                    <div className={`absolute inset-0 rounded-full blur-3xl transition-opacity duration-500 ${status === 'speaking' ? 'bg-green-500/30 opacity-100' : 'bg-blue-500/20 opacity-50'}`}></div>
                    
                    {/* Ripple Rings */}
                    <div className={`absolute w-full h-full rounded-full border-2 border-white/10 ${status === 'listening' || status === 'speaking' ? 'animate-ping' : ''}`} style={{ animationDuration: '3s' }}></div>
                    <div className={`absolute w-3/4 h-3/4 rounded-full border-2 border-white/20 ${status === 'listening' || status === 'speaking' ? 'animate-ping' : ''}`} style={{ animationDuration: '2s', animationDelay: '0.5s' }}></div>
                    
                    {/* Core Circle */}
                    <div className={`relative w-48 h-48 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 shadow-2xl transition-colors duration-300 ${status === 'speaking' ? 'bg-green-500/20' : 'bg-blue-600/20'}`}>
                         <Bot size={80} className={`transition-colors duration-300 ${status === 'speaking' ? 'text-green-300' : 'text-blue-300'}`}/>
                    </div>
                </div>

                <div className="mt-12 space-y-6 w-full">
                    <p className="text-3xl font-light tracking-wide h-10 text-blue-200">{getStatusText()}</p>
                    
                    <div className="min-h-[120px] space-y-4 px-4">
                        {userTranscript && (
                            <p className="text-xl text-gray-300 font-light animate-fade-in">
                                "{userTranscript}"
                            </p>
                        )}
                        {botTranscript && (
                            <p className="text-2xl font-medium text-white leading-relaxed animate-fade-in text-shadow-sm">
                                {botTranscript}
                            </p>
                        )}
                    </div>
                </div>
            </div>
           
            <p className="text-sm text-white/40 mb-8 font-light tracking-widest uppercase">{t('coach_title')}</p>
            
            <style>{`
                .text-shadow-sm { text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
                .animate-fade-in { animation: fadeIn 0.5s ease-out both; }
                @keyframes fadeIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};
