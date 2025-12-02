import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useRoutine } from '../context/RoutineContext';
import { Info, ListChecks, ArrowRight, Activity, Shield, Zap } from 'lucide-react';
import logo from '../assets/logo.png';

export const WelcomePage: React.FC = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();

    const handleStart = () => {
        navigate('/login');
    };

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 font-sans">
            {/* Abstract Background Shapes */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-3xl animate-blob"></div>
            <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-blue-200/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-indigo-200/30 rounded-full blur-3xl animate-blob animation-delay-4000"></div>

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">

                {/* Logo Section */}
                <div className="mb-10 animate-fade-in-down">
                    <img src={logo} alt="Sức Khỏe AI Logo" className="h-28 md:h-36 w-auto drop-shadow-xl hover:scale-105 transition-transform duration-500" />
                </div>

                {/* Main Hero Card */}
                <div className="w-full backdrop-blur-2xl bg-white/60 border border-white/50 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 overflow-hidden p-8 md:p-16 text-center animate-fade-in-up">

                    <h1 className="text-5xl md:text-7xl font-black tracking-tight text-gray-900 mb-6">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-gradient-x">
                            {t('welcome_title')}
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
                        {t('welcome_subtitle')}
                    </p>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-3 gap-8 mb-16 text-left">
                        <div className="bg-white/80 hover:bg-white transition-all duration-300 p-8 rounded-3xl border border-indigo-50 shadow-lg hover:shadow-xl hover:-translate-y-1 group">
                            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Activity className="text-indigo-600" size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{t('welcome_info_title')}</h3>
                            <p className="text-gray-500 text-base leading-relaxed">{t('welcome_info_p1')}</p>
                        </div>

                        <div className="bg-white/80 hover:bg-white transition-all duration-300 p-8 rounded-3xl border border-purple-50 shadow-lg hover:shadow-xl hover:-translate-y-1 group">
                            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <ListChecks className="text-purple-600" size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{t('welcome_info_tests_title')}</h3>
                            <p className="text-gray-500 text-base leading-relaxed">{t('welcome_info_tests_list')}</p>
                        </div>

                        <div className="bg-white/80 hover:bg-white transition-all duration-300 p-8 rounded-3xl border border-blue-50 shadow-lg hover:shadow-xl hover:-translate-y-1 group">
                            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Shield className="text-blue-600" size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">AI Powered</h3>
                            <p className="text-gray-500 text-base leading-relaxed">Advanced artificial intelligence analysis for accurate health insights.</p>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <button
                        onClick={handleStart}
                        className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white transition-all duration-300 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-4 focus:ring-indigo-200 shadow-xl hover:shadow-indigo-500/30 transform hover:-translate-y-1"
                    >
                        <span className="mr-3">{t('get_started')}</span>
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        <div className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-500 animate-pulse-slow"></div>
                    </button>

                    <p className="mt-10 text-sm font-semibold text-gray-400 uppercase tracking-widest">
                        {t('welcome_slogan')}
                    </p>
                </div>
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes fade-in-down {
                    0% { opacity: 0; transform: translateY(-30px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(30px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes gradient-x {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-fade-in-down { animation: fade-in-down 1s cubic-bezier(0.2, 0.8, 0.2, 1); }
                .animate-fade-in-up { animation: fade-in-up 1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s both; }
                .animate-gradient-x { background-size: 200% auto; animation: gradient-x 6s linear infinite; }
                .animate-blob { animation: blob 7s infinite; }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-4000 { animation-delay: 4s; }
                .animate-pulse-slow { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                /* Reduce Motion: tắt/giảm animation cho thiết bị nhạy cảm */
                @media (prefers-reduced-motion: reduce) {
                    .animate-fade-in-down,
                    .animate-fade-in-up,
                    .animate-gradient-x,
                    .animate-blob,
                    .animate-pulse-slow { animation: none !important; }
                }
            `}</style>
        </div>
    );
};