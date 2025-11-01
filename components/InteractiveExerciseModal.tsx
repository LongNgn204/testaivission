import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { X, Hand, Mountain, Play, CheckCircle, Loader2 } from 'lucide-react';
import { RoutineActivity } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useRoutine } from '../context/RoutineContext';
import { decode, decodeAudioData, playAudioBuffer } from '../utils/audioUtils';
import { AIService } from '../services/aiService';

const TOTAL_CYCLES = 5;
const STEP_DURATION = 15; // seconds

const aiService = new AIService();

type AudioKey = 'intro' | 'focus_near' | 'focus_far' | 'finished';

export const InteractiveExerciseModal: React.FC<{ activity: RoutineActivity; onClose: () => void }> = ({ activity, onClose }) => {
    const { t, language } = useLanguage();
    const { markActivityAsCompleted } = useRoutine();
    
    const phrases = useMemo(() => ({
        intro: t('interactive_exercise_intro'),
        focus_near: t('interactive_exercise_focus_near'),
        focus_far: t('interactive_exercise_focus_far'),
        finished: t('interactive_exercise_finished'),
    }), [t]);

    const [audioBuffers, setAudioBuffers] = useState<Partial<Record<AudioKey, AudioBuffer>>>({});
    const [isLoadingAudio, setIsLoadingAudio] = useState(true);
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

        const generateAllAudio = async () => {
            setIsLoadingAudio(true);
            const audioContext = audioContextRef.current;
            if (!audioContext) return;
            
            const keys = Object.keys(phrases) as AudioKey[];
            const promises = keys.map(async (key) => {
                const text = phrases[key];
                const base64Audio = await aiService.generateSpeech(text, language);
                if (base64Audio) {
                    const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
                    return { key, buffer: audioBuffer };
                }
                return { key, buffer: null };
            });

            const results = await Promise.all(promises);
            const newBuffers: Partial<Record<AudioKey, AudioBuffer>> = {};
            results.forEach(result => {
                if (result.buffer) {
                    newBuffers[result.key] = result.buffer;
                }
            });
            
            setAudioBuffers(newBuffers);
            setIsLoadingAudio(false);
        };

        generateAllAudio();
        
        const localAudioContext = audioContextRef.current;
        return () => {
            if (localAudioContext && localAudioContext.state !== 'closed') {
                localAudioContext.close();
            }
        };
    }, [phrases, language]);

    const play = useCallback((key: AudioKey) => {
        const buffer = audioBuffers[key];
        if (buffer && audioContextRef.current && audioContextRef.current.state !== 'closed') {
            playAudioBuffer(buffer, audioContextRef.current);
        }
    }, [audioBuffers]);


    const [exerciseState, setExerciseState] = useState<'idle' | 'running' | 'finished'>('idle');
    const [currentStep, setCurrentStep] = useState<'near' | 'far'>('near');
    const [currentCycle, setCurrentCycle] = useState(1);
    const [countdown, setCountdown] = useState(STEP_DURATION);
    
    // Fix: Use correct return type for setInterval in browser environment.
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (exerciseState === 'running') {
            intervalRef.current = window.setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        }
        return () => {
            if(intervalRef.current) clearInterval(intervalRef.current);
        }
    }, [exerciseState]);
    
    useEffect(() => {
        if (countdown === 0) {
            if (currentStep === 'near') {
                setCurrentStep('far');
                setCountdown(STEP_DURATION);
                play('focus_far');
            } else { // currentStep is 'far'
                if (currentCycle < TOTAL_CYCLES) {
                    setCurrentCycle(prev => prev + 1);
                    setCurrentStep('near');
                    setCountdown(STEP_DURATION);
                    play('focus_near');
                } else {
                    setExerciseState('finished');
                    play('finished');
                    markActivityAsCompleted('exercise_focus_change');
                    if(intervalRef.current) clearInterval(intervalRef.current);
                }
            }
        }
    }, [countdown, currentStep, currentCycle, play, markActivityAsCompleted]);
    
    const startExercise = () => {
        setExerciseState('running');
        play('focus_near');
    };

    const progress = ( ( (currentCycle - 1) * 2 + (currentStep === 'near' ? 0 : 1) ) * STEP_DURATION + (STEP_DURATION - countdown) ) / (TOTAL_CYCLES * 2 * STEP_DURATION) * 100;

    const getStatusText = () => {
        if(isLoadingAudio) return t('interactive_exercise_status_loading');
        if(exerciseState === 'idle') return t('interactive_exercise_status_ready');
        if(exerciseState === 'finished') return t('interactive_exercise_finished');
        
        const text = currentStep === 'near' ? t('interactive_exercise_focus_near') : t('interactive_exercise_focus_far');
        return `${text} (${countdown}s)`;
    }

    return (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 sm:p-8 relative animate-fade-in flex flex-col" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"><X size={24} /></button>
                
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 text-center mb-2">{t('interactive_exercise_title')}</h3>
                <p className="text-center text-gray-500 dark:text-gray-400 mb-6">{activity.name}</p>

                <div className="relative flex items-center justify-around my-8">
                    {/* Near Object */}
                    <div className={`flex flex-col items-center gap-2 transition-all duration-500 ${currentStep === 'near' && exerciseState === 'running' ? 'scale-125' : 'opacity-50'}`}>
                        <Hand size={48} className="text-purple-500" />
                        <span className="font-semibold text-sm dark:text-gray-300">Gần</span>
                    </div>

                    {/* Far Object */}
                    <div className={`flex flex-col items-center gap-2 transition-all duration-500 ${currentStep === 'far' && exerciseState === 'running' ? 'scale-125' : 'opacity-50'}`}>
                        <Mountain size={48} className="text-green-500" />
                        <span className="font-semibold text-sm dark:text-gray-300">Xa</span>
                    </div>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
                    <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000 ease-linear" style={{ width: `${progress}%` }}></div>
                </div>

                <div className="text-center my-4 min-h-[5rem]">
                    {exerciseState === 'finished' ? (
                        <div className="flex flex-col items-center text-green-600 dark:text-green-400 animate-fade-in">
                            <CheckCircle size={48} className="mb-2" />
                            <p className="font-bold text-lg">{t('interactive_exercise_finished')}</p>
                        </div>
                    ) : (
                        <>
                             <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{getStatusText()}</p>
                             <p className="text-sm text-gray-500 dark:text-gray-400">{t('interactive_exercise_cycle_complete', { current: currentCycle, total: TOTAL_CYCLES })}</p>
                        </>
                    )}
                </div>

                {exerciseState === 'idle' && (
                    <button onClick={startExercise} disabled={isLoadingAudio} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400">
                        {isLoadingAudio ? <Loader2 className="animate-spin"/> : <Play/>}
                        {isLoadingAudio ? t('interactive_exercise_status_loading') : t('interactive_exercise_start_button')}
                    </button>
                )}
                 {exerciseState === 'finished' && (
                    <button onClick={onClose} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">{t('got_it')}</button>
                )}
            </div>
        </div>
    );
};