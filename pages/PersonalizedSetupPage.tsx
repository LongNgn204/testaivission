
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { AIService } from '../services/aiService';
import { useRoutine } from '../context/RoutineContext';
import { AnswerState } from '../types';
import { BrainCircuit, Check, Calendar } from 'lucide-react';

const aiService = new AIService();

const Loader: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 animate-fade-in">
            <div className="relative flex items-center justify-center h-24 w-24 mb-6">
                <div className="absolute h-full w-full border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                <div className="absolute h-full w-full border-t-4 border-blue-600 rounded-full animate-spin"></div>
                <BrainCircuit className="text-blue-600" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">{t('setup_loading_title')}</h2>
            <p className="text-gray-600 dark:text-gray-400">{t('setup_loading_subtitle')}</p>
        </div>
    );
};

export const PersonalizedSetupPage: React.FC = () => {
    const { t, language } = useLanguage();
    const { saveRoutine } = useRoutine();
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<AnswerState>({ worksWithComputer: '', wearsGlasses: '', goal: '' });
    const [isLoading, setIsLoading] = useState(false);
    
    // Get user data for personalization
    const userData = React.useMemo(() => {
        const data = localStorage.getItem('user_data');
        return data ? JSON.parse(data) : null;
    }, []);

    const questions = [
        { key: 'worksWithComputer', title: t('setup_q1_title'), options: [ {label: t('setup_q1_op1'), value: 'Yes'}, {label: t('setup_q1_op2'), value: 'No'} ] },
        { key: 'wearsGlasses', title: t('setup_q2_title'), options: [ {label: t('setup_q2_op1'), value: 'Yes'}, {label: t('setup_q2_op2'), value: 'No'} ] },
        { key: 'goal', title: t('setup_q3_title'), options: [ {label: t('setup_q3_op1'), value: 'General Check-up'}, {label: t('setup_q3_op2'), value: 'Monitor a Condition'}, {label: t('setup_q3_op3'), value: 'Check for Retinal Issues'} ] },
    ];

    const handleAnswer = (key: keyof AnswerState, value: string) => {
        setAnswers(prev => ({ ...prev, [key]: value }));
    };
    
    const handleNext = async () => {
        if (step < questions.length - 1) {
            setStep(step + 1);
        } else {
            setIsLoading(true);
            const routine = await aiService.generatePersonalizedRoutine(answers, language);
            saveRoutine(routine, answers);
            // The app will re-render automatically due to context change
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <Loader />
            </div>
        );
    }
    
    const currentQuestion = questions[step];
    const currentAnswer = answers[currentQuestion.key as keyof AnswerState];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 flex flex-col items-center justify-center p-4 text-center">
            <div className="max-w-2xl w-full animate-fade-in">
                {/* User Greeting Card */}
                {userData && (
                    <div className="mb-6 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-3xl shadow-xl p-6 text-white border border-white/10">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-white/30 rounded-full blur-md"></div>
                                <div className="relative w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center text-2xl font-bold shadow-lg">
                                    {userData.name.split(' ').pop()?.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <div className="flex-1 text-left">
                                <h2 className="text-2xl font-bold mb-1">
                                    {language === 'vi' ? `Xin chào, ${userData.name.split(' ').slice(-2).join(' ')}!` : `Hello, ${userData.name}!`}
                                </h2>
                                <p className="text-white/90 text-sm flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {language === 'vi' ? `${userData.age} tuổi • Thiết lập lịch trình cá nhân` : `${userData.age} years old • Personalize your routine`}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                
                <header className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{t('setup_title')}</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mt-3">{t('setup_subtitle')}</p>
                </header>
                
                <div className="w-full bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('setup_progress')}</span>
                            <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                                {step + 1} / {questions.length}
                            </span>
                        </div>
                        <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-indigo-200 dark:from-blue-900/30 dark:to-indigo-900/30"></div>
                            <div 
                                className="relative h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500 ease-out shadow-lg"
                                style={{width: `${((step + 1) / questions.length) * 100}%`}} 
                            />
                        </div>
                    </div>
                    
                    {/* Question Title */}
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">
                        {currentQuestion.title}
                    </h2>
                    
                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        {currentQuestion.options.map(opt => (
                            <button 
                                key={opt.value} 
                                onClick={() => handleAnswer(currentQuestion.key as keyof AnswerState, opt.value)}
                                className={`relative text-left p-5 rounded-xl border-2 transition-all duration-300 ${
                                    currentAnswer === opt.value 
                                        ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-500 shadow-lg dark:bg-gradient-to-br dark:from-blue-900/40 dark:to-indigo-900/40 dark:border-blue-400 scale-[1.02]' 
                                        : 'bg-white dark:bg-gray-700 border-gray-200 hover:border-indigo-300 dark:border-gray-600 dark:text-gray-300 dark:hover:border-indigo-500 hover:shadow-md'
                                }`}
                            >
                                <span className={`font-medium ${currentAnswer === opt.value ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {opt.label}
                                </span>
                                {currentAnswer === opt.value && (
                                    <div className="absolute top-3 right-3 w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg">
                                        <Check size={16} strokeWidth={3} />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                    
                    {/* Next/Finish Button */}
                    <button 
                        onClick={handleNext} 
                        disabled={!currentAnswer}
                        className="w-full relative group bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 group-disabled:opacity-0 transition-opacity duration-300"></div>
                        <span className="relative z-10">
                            {step < questions.length - 1 ? t('setup_button_next') : t('setup_button_finish')}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};