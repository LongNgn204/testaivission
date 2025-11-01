
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useRoutine } from '../context/RoutineContext';
import { Eye } from 'lucide-react';

export const WelcomePage: React.FC = () => {
    const { t } = useLanguage();
    const { markWelcomeAsSeen } = useRoutine();
    const navigate = useNavigate();

    const handleStart = () => {
        // Go to login page
        navigate('/login');
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-gray-900">
            <style>{`
                .welcome-bg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(135deg, #1e3a8a, #3b0764, #0f172a);
                    background-size: 400% 400%;
                    animation: gradient-animation 15s ease infinite;
                }
                @keyframes gradient-animation {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .shape {
                    position: absolute;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 50%;
                    animation: float 20s infinite ease-in-out;
                }
                .shape1 { width: 200px; height: 200px; top: 10%; left: 15%; animation-duration: 22s; }
                .shape2 { width: 100px; height: 100px; top: 70%; left: 5%; animation-duration: 18s; animation-delay: 2s; }
                .shape3 { width: 150px; height: 150px; top: 20%; right: 10%; animation-duration: 25s; animation-delay: 4s; }
                .shape4 { width: 50px; height: 50px; bottom: 10%; right: 20%; animation-duration: 15s; }
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-20px) translateX(20px); }
                    100% { transform: translateY(0px); }
                }
                .animate-fade-in-up { animation: fadeInUp 1s ease-out both; }
                .delay-200 { animation-delay: 200ms; }
                .delay-400 { animation-delay: 400ms; }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
            <div className="welcome-bg"></div>
            <div className="shape shape1"></div>
            <div className="shape shape2"></div>
            <div className="shape shape3"></div>
            <div className="shape shape4"></div>

            <div className="relative z-10 text-center text-white max-w-3xl">
                <Eye size={64} className="mx-auto mb-6 text-blue-300 animate-fade-in-up" />
                
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 animate-fade-in-up delay-200" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                    {t('welcome_title')}
                </h1>

                <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 animate-fade-in-up delay-400">
                    {t('welcome_subtitle')}
                </p>

                <button 
                    onClick={handleStart}
                    className="bg-blue-500 text-white px-10 py-4 rounded-full text-lg font-bold shadow-2xl hover:bg-blue-400 transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 animate-fade-in-up delay-400"
                >
                    {t('get_started')}
                </button>
            </div>
        </div>
    );
};