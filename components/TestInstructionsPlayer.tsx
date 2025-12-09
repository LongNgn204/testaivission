
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Volume2, X, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

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

/**
 * TestInstructionsPlayer - Reads test instructions using browser's SpeechSynthesis API
 */
export const TestInstructionsPlayer: React.FC = () => {
    const { t, language } = useLanguage();
    const location = useLocation();
    const [isToastVisible, setIsToastVisible] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const currentPathRef = useRef<string | null>(null);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const stopPlayback = useCallback(() => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        setIsPlaying(false);
        setIsToastVisible(false);
    }, []);

    const speakText = useCallback((text: string) => {
        if (!('speechSynthesis' in window)) {
            console.warn('Browser does not support SpeechSynthesis');
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'vi' ? 'vi-VN' : 'en-US';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Try to find a matching voice
        const voices = window.speechSynthesis.getVoices();
        const targetVoice = voices.find(v =>
            v.lang.startsWith(language === 'vi' ? 'vi' : 'en')
        );
        if (targetVoice) {
            utterance.voice = targetVoice;
        }

        utterance.onstart = () => {
            setIsPlaying(true);
        };

        utterance.onend = () => {
            setIsPlaying(false);
            setIsToastVisible(false);
        };

        utterance.onerror = () => {
            setIsPlaying(false);
            setIsToastVisible(false);
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    }, [language]);

    useEffect(() => {
        // Stop playback when route changes
        if (currentPathRef.current && location.pathname !== currentPathRef.current) {
            stopPlayback();
        }

        const instructionKeys = TEST_INSTRUCTIONS_MAP[location.pathname];

        if (instructionKeys && location.pathname !== currentPathRef.current) {
            currentPathRef.current = location.pathname;
            setIsToastVisible(true);

            // Combine general + specific test instructions
            const allInstructionKeys = [...GENERAL_INSTRUCTIONS, ...instructionKeys];
            const allTexts = allInstructionKeys.map(key => t(key));
            const fullText = allTexts.join('. ');

            // Wait a bit for voices to load, then speak
            setTimeout(() => {
                speakText(fullText);
            }, 500);
        }

        return () => {
            stopPlayback();
        };
    }, [location.pathname, t, stopPlayback, speakText]);

    if (!isToastVisible) {
        return null;
    }

    return (
        <div className="fixed top-4 right-4 z-50 w-full max-w-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 flex items-start gap-3 border border-gray-200 dark:border-gray-700">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    {isPlaying ? (
                        <Volume2 className="text-blue-600 dark:text-blue-400 animate-pulse" size={20} />
                    ) : (
                        <Loader2 className="text-blue-600 dark:text-blue-400 animate-spin" size={20} />
                    )}
                </div>
                <div className="flex-grow">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                        {language === 'vi' ? 'Eva đang giải thích...' : 'Eva is explaining...'}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        {language === 'vi' ? 'Lắng nghe hướng dẫn trước khi bắt đầu bài test.' : 'Listen to instructions before starting the test.'}
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
