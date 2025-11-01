
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, X, Bot } from 'lucide-react';
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
        description: 'The name of the page to navigate to. Must be one of: home, history, about.',
      },
    },
    required: ['page'],
  },
};

const getSystemInstruction = (language: 'vi' | 'en') => {
    const langInstruction = language === 'vi' ? 'VIETNAMESE' : 'ENGLISH';
    return `You are an AI-powered vision wellness coach. Your name is Eva.
    1. You interact with the user via voice. Keep your responses concise and conversational.
    2. Your primary language for this conversation is ${langInstruction}.
    3. Use the provided tools (functions) to help the user navigate the app or start tests.
    4. When a function is called successfully, give a brief confirmation like "Okay, starting the Snellen test now."
    5. Be friendly, encouraging, and helpful.`;
};

const storageService = new StorageService();
const aiService = new AIService();

export const VisionCoach: React.FC = () => {
    const { t, language } = useLanguage();
    const { userProfile } = useRoutine();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
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

    const availableFunctions = {
        startTest: ({ testName }: { testName: string }) => {
            const validTests = ['snellen', 'colorblind', 'astigmatism', 'amsler', 'duochrome'];
            const lowerTestName = testName.toLowerCase();
            if (validTests.includes(lowerTestName)) {
                navigate(`/test/${lowerTestName}`);
                setIsOpen(false);
                return `Okay, starting the ${testName} test.`;
            }
            return `Sorry, I can't start a test called ${testName}.`;
        },
        navigateTo: ({ page }: { page: string }) => {
            const validPages = ['home', 'history', 'about'];
            const lowerPage = page.toLowerCase();
            if (validPages.includes(lowerPage)) {
                const path = lowerPage === 'home' ? '/' : `/${lowerPage}`;
                navigate(path);
                setIsOpen(false);
                return `Navigating to the ${page} page.`;
            }
            return `Sorry, I can't navigate to a page called ${page}.`;
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

        if (isOpen && status === 'listening') {
            idleTimerRef.current = window.setTimeout(triggerProactiveTip, 15000); // 15 seconds idle timeout
        }

        return () => {
            if (idleTimerRef.current) {
                clearTimeout(idleTimerRef.current);
            }
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
        if (isOpen) {
            startSession();
        } else {
            cleanup();
        }
        return cleanup;
    }, [isOpen, startSession, cleanup]);

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
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-8 right-8 z-40 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all duration-300 ${isOpen ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}
                aria-label={t('coach_button_aria')}
            >
                <Mic size={28} />
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/70 z-50 flex flex-col items-center justify-center animate-fade-in p-4">
                    <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 text-white/70 hover:text-white"><X size={32} /></button>
                    
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
            <style>{`
                .animate-fade-in { animation: fadeIn 0.3s ease-out both; }
                @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
            `}</style>
        </>
    );
};