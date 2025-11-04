
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Volume2, X, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { AIService } from '../services/aiService';
import { decode, decodeAudioData, playAudioBuffer } from '../utils/audioUtils';

const aiService = new AIService();

// General instructions (spoken first for ALL tests)
const GENERAL_INSTRUCTIONS: (keyof typeof import('../i18n').translations.en)[] = [
    'general_instructions_title',
    'general_instruction_1',
    'general_instruction_2', 
    'general_instruction_3'
];

const TEST_INSTRUCTIONS_MAP: Record<string, (keyof typeof import('../i18n').translations.en)[]> = {
    '/home/test/snellen': ['snellen_instructions_title', 'snellen_instruction_1', 'snellen_instruction_2', 'snellen_instruction_3'],
    '/home/test/colorblind': ['colorblind_instructions_title', 'colorblind_instruction_1', 'colorblind_instruction_2', 'colorblind_instruction_3'],
    '/home/test/astigmatism': ['astigmatism_instructions_title', 'astigmatism_instruction_1', 'astigmatism_instruction_2', 'astigmatism_instruction_3', 'astigmatism_instruction_4'],
    '/home/test/amsler': ['amsler_instructions_title', 'amsler_instruction_1', 'amsler_instruction_2', 'amsler_instruction_3', 'amsler_instruction_4'],
    '/home/test/duochrome': ['duochrome_instructions_title', 'duochrome_instruction_1', 'duochrome_instruction_2', 'duochrome_instruction_3'],
};

export const TestInstructionsPlayer: React.FC = () => {
    const { t, language } = useLanguage();
    const location = useLocation();
    const [isToastVisible, setIsToastVisible] = useState(false);
    const [audioReady, setAudioReady] = useState(false);
    
    const audioContextRef = useRef<AudioContext | null>(null);
    const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const audioQueueRef = useRef<AudioBuffer[]>([]);
    const isPlayingRef = useRef(false);
    const currentPathRef = useRef<string | null>(null);
    const hasAttemptedAutoplayRef = useRef(false);

    const stopPlayback = useCallback(() => {
        console.log('🛑 Stopping all playback...');
        
        // 🛑 Stop Web Speech API
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            console.log('🛑 Stopped Web Speech API');
        }
        
        // Stop all active audio sources
        activeSourcesRef.current.forEach(source => {
            try {
                source.stop();
                source.disconnect();
            } catch (e) {
                // Source might already be stopped
            }
        });
        activeSourcesRef.current.clear();
        audioQueueRef.current = [];
        isPlayingRef.current = false;
        setIsToastVisible(false);
        setAudioReady(false);
        hasAttemptedAutoplayRef.current = false;
        console.log('✅ Playback stopped, all state cleared');
    }, []);

    const playNextInQueue = useCallback(() => {
        console.log('🎵 playNextInQueue called. Playing:', isPlayingRef.current, 'Queue:', audioQueueRef.current.length);
        
        if (isPlayingRef.current || audioQueueRef.current.length === 0) {
            if (!isPlayingRef.current) {
                // Finished queue
                console.log('✅ Playback finished');
                stopPlayback();
            }
            return;
        }

        const audioContext = audioContextRef.current;
        if (!audioContext || audioContext.state === 'closed') {
            console.log('❌ Audio context not available or closed');
            return;
        }
        
        console.log('🔊 Playing audio, context state:', audioContext.state);
        isPlayingRef.current = true;
        const bufferToPlay = audioQueueRef.current.shift();
        
        if (bufferToPlay) {
            const source = playAudioBuffer(bufferToPlay, audioContext);
            source.playbackRate.value = 1.15; // Tăng tốc độ 15%
            activeSourcesRef.current.add(source);
            console.log('✅ Audio source started at 1.15x speed');
            source.onended = () => {
                activeSourcesRef.current.delete(source);
                isPlayingRef.current = false;
                console.log('🔚 Audio ended, playing next...');
                playNextInQueue();
            };
        }
    }, [stopPlayback]);
    
    useEffect(() => {
        console.log('🎙️ TestInstructionsPlayer - Current path:', location.pathname);
        console.log('🎙️ TestInstructionsPlayer - Previous path:', currentPathRef.current);
        
        // Always stop playback when route changes
        if (currentPathRef.current && location.pathname !== currentPathRef.current) {
            console.log('🛑 Route changed from', currentPathRef.current, 'to', location.pathname);
            stopPlayback();
        }
        
        const instructionKeys = TEST_INSTRUCTIONS_MAP[location.pathname];
        console.log('🎙️ TestInstructionsPlayer - Found instructions:', !!instructionKeys);
        
        if (instructionKeys && location.pathname !== currentPathRef.current) {
            console.log('✅ Starting TTS pipeline for:', location.pathname);
            console.log('✅ Instruction keys:', instructionKeys);
            
            const pipelineInstructions = async () => {
                currentPathRef.current = location.pathname;
                setIsToastVisible(true);

                if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                }

                // Resume AudioContext (needed for autoplay policy)
                if (audioContextRef.current.state === 'suspended') {
                    await audioContextRef.current.resume();
                }

                // Combine general instructions + specific test instructions
                const allInstructionKeys = [...GENERAL_INSTRUCTIONS, ...instructionKeys];
                
                console.log('🎙️ Preparing to generate TTS...');
                console.log('🎙️ All instruction keys:', allInstructionKeys);
                console.log('🎙️ Language:', language);

                // 🔥 NEW BATCH MODE: Generate ALL audio at once for better quality
                const allTexts = allInstructionKeys.map(key => {
                    const text = t(key);
                    console.log(`   Key: ${key} → Text: ${text.substring(0, 50)}...`);
                    return text;
                });
                const fullText = allTexts.join('. ');
                console.log('🎙️ Full combined text (', fullText.length, 'chars):', fullText.substring(0, 150) + '...');
                
                try {
                    const audioContext = audioContextRef.current!;
                    console.log('🎙️ Audio context state:', audioContext.state);

                    // 🎙️ WEB SPEECH API: Tự động play, không cần decode
                    console.log('🎙️ Calling generateSpeech for complete audio...');
                    const speechId = await aiService.generateSpeech(fullText, language);
                    console.log('🎙️ Speech generated:', !!speechId);
                    
                    if (speechId) {
                        // Web Speech API tự động play, chỉ cần set state
                        setAudioReady(true);
                        hasAttemptedAutoplayRef.current = true;
                        console.log('✅ Speech playing via Web Speech API');
                        
                        // Set timeout để stop sau khi đọc xong (ước tính)
                        const estimatedDuration = fullText.length * 60; // ~60ms per character
                        setTimeout(() => {
                            stopPlayback();
                        }, estimatedDuration);
                    } else {
                        console.log('⚠️ No speech generated');
                    }
                } catch (error) {
                    console.error("Error in audio pipeline:", error);
                    stopPlayback();
                }
            };
            pipelineInstructions();
        }
        
        return () => {
            // Cleanup khi unmount hoặc route change
            console.log('🧹 TestInstructionsPlayer cleanup running...');
            stopPlayback();
            
            // Close audio context when component unmounts
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close().catch(err => {
                    console.log('⚠️ Error closing audio context:', err);
                });
            }
        };

    }, [location.pathname, t, language, stopPlayback, playNextInQueue]);

    if (!isToastVisible) {
        return null;
    }

    const handleToastClick = async () => {
        // Resume audio context and play on user click
        if (audioContextRef.current) {
            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
            }
            if (audioReady && !isPlayingRef.current) {
                playNextInQueue();
            }
        }
    };

    const needsUserInteraction = audioReady && audioContextRef.current?.state === 'suspended';

    return (
        <div className="fixed top-4 right-4 z-50 w-full max-w-sm animate-fade-in">
            <div 
                onClick={needsUserInteraction ? handleToastClick : undefined}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 flex items-start gap-3 border border-gray-200 dark:border-gray-700 ${needsUserInteraction ? 'cursor-pointer hover:shadow-2xl transition-all' : ''}`}
            >
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    {isPlayingRef.current ? (
                        <Volume2 className="text-blue-600 dark:text-blue-400 animate-pulse" size={20} />
                    ) : needsUserInteraction ? (
                        <Volume2 className="text-blue-600 dark:text-blue-400" size={20} />
                    ) : (
                        <Loader2 className="text-blue-600 dark:text-blue-400 animate-spin" size={20} />
                    )}
                </div>
                <div className="flex-grow">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                        {needsUserInteraction 
                            ? (language === 'vi' ? 'Eva sẵn sàng' : 'Eva ready')
                            : (language === 'vi' ? 'Eva đang giải thích...' : 'Eva is explaining...')}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        {needsUserInteraction 
                            ? (language === 'vi' ? 'Nhấn để nghe hướng dẫn' : 'Click to hear instructions')
                            : (language === 'vi' ? 'Lắng nghe hướng dẫn trước khi bắt đầu bài test.' : 'Listen to instructions before starting the test.')}
                    </p>
                </div>
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        stopPlayback();
                    }} 
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex-shrink-0"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};
