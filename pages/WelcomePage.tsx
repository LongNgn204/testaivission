/**
 * =================================================================
 * 🏠 WelcomePage - Premium Landing Page for Vision Coach
 * =================================================================
 *
 * A beautifully designed landing page showcasing:
 * - Hero section with animated background and AI doctor
 * - Detailed information about vision health testing
 * - Feature showcase with images
 * - Benefits and use cases
 * - Testimonials
 * - Call-to-action sections
 * - Fully responsive for all devices
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
    ArrowRight, Shield, Clock, Award, Users, Star, Zap, CheckCircle2,
    Eye, Brain, TrendingUp, Bell, MapPin, Sparkles, Heart, Activity,
    Glasses, Monitor, Sun, Moon, ChevronDown, Play, Check
} from 'lucide-react';
import { FeatureSlider } from '../components/FeatureSlider';
import logo from '../assets/logo.png';
import visionTestsImg from '../assets/vision_tests.png';
import drEvaImg from '../assets/dr_eva.png';

export const WelcomePage: React.FC = () => {
    const { language } = useLanguage();
    const navigate = useNavigate();
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleStart = () => {
        navigate('/login');
    };

    // Vision problems statistics
    const visionStats = [
        {
            value: '2.2B',
            label: language === 'vi' ? 'Người bị vấn đề thị lực' : 'People with vision issues',
            sublabel: language === 'vi' ? 'trên toàn thế giới' : 'worldwide'
        },
        {
            value: '80%',
            label: language === 'vi' ? 'Có thể phòng ngừa' : 'Are preventable',
            sublabel: language === 'vi' ? 'nếu phát hiện sớm' : 'if detected early'
        },
        {
            value: '50%',
            label: language === 'vi' ? 'Không biết mình có vấn đề' : "Don't know they have issues",
            sublabel: language === 'vi' ? 'do thiếu kiểm tra' : 'due to lack of testing'
        },
    ];

    // Test types with details
    const testTypes = [
        {
            icon: Eye,
            name: language === 'vi' ? 'Snellen Test' : 'Snellen Test',
            description: language === 'vi'
                ? 'Kiểm tra độ sắc nét thị lực với thuật toán thích ứng thông minh'
                : 'Test visual acuity with smart adaptive algorithm',
            color: 'from-blue-500 to-indigo-600',
            bg: 'bg-blue-50 dark:bg-blue-900/20'
        },
        {
            icon: Activity,
            name: language === 'vi' ? 'Mù Màu Ishihara' : 'Color Blind Ishihara',
            description: language === 'vi'
                ? 'Phát hiện các loại khiếm khuyết màu sắc với 20 bảng màu'
                : 'Detect color deficiencies with 20 color plates',
            color: 'from-pink-500 to-rose-600',
            bg: 'bg-pink-50 dark:bg-pink-900/20'
        },
        {
            icon: Target,
            name: language === 'vi' ? 'Loạn Thị' : 'Astigmatism',
            description: language === 'vi'
                ? 'Kiểm tra độ cong giác mạc và phát hiện loạn thị'
                : 'Check corneal curvature and detect astigmatism',
            color: 'from-purple-500 to-violet-600',
            bg: 'bg-purple-50 dark:bg-purple-900/20'
        },
        {
            icon: Grid,
            name: language === 'vi' ? 'Lưới Amsler' : 'Amsler Grid',
            description: language === 'vi'
                ? 'Phát hiện sớm các vấn đề về võng mạc và điểm vàng'
                : 'Early detection of retinal and macula issues',
            color: 'from-emerald-500 to-teal-600',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20'
        },
        {
            icon: Glasses,
            name: language === 'vi' ? 'Duochrome' : 'Duochrome',
            description: language === 'vi'
                ? 'Kiểm tra độ chính xác của kính đeo hiện tại'
                : 'Check accuracy of current glasses prescription',
            color: 'from-amber-500 to-orange-600',
            bg: 'bg-amber-50 dark:bg-amber-900/20'
        },
    ];

    // Why vision health matters
    const whyMatters = [
        {
            icon: Monitor,
            title: language === 'vi' ? 'Thời đại số' : 'Digital Age',
            description: language === 'vi'
                ? 'Người trưởng thành dành trung bình 7+ giờ/ngày nhìn màn hình, gây căng thẳng mắt nghiêm trọng.'
                : 'Adults spend 7+ hours/day on screens, causing serious eye strain.'
        },
        {
            icon: Heart,
            title: language === 'vi' ? 'Sức khỏe tổng thể' : 'Overall Health',
            description: language === 'vi'
                ? 'Mắt là cửa sổ của sức khỏe - có thể phát hiện sớm tiểu đường, cao huyết áp qua kiểm tra mắt.'
                : 'Eyes are windows to health - detect diabetes, hypertension early through eye exams.'
        },
        {
            icon: Sun,
            title: language === 'vi' ? 'Chất lượng cuộc sống' : 'Quality of Life',
            description: language === 'vi'
                ? '80% thông tin chúng ta nhận được qua mắt. Thị lực tốt = Cuộc sống tốt hơn.'
                : '80% of information we receive is through eyes. Good vision = Better life.'
        },
    ];

    // Benefits
    const benefits = [
        language === 'vi' ? 'Kiểm tra miễn phí, không giới hạn' : 'Free unlimited testing',
        language === 'vi' ? 'Phân tích AI chính xác đến 93%' : '93% accurate AI analysis',
        language === 'vi' ? 'Theo dõi tiến trình theo thời gian' : 'Track progress over time',
        language === 'vi' ? 'Nhận lời khuyên cá nhân hóa' : 'Get personalized advice',
        language === 'vi' ? 'Tìm bác sĩ mắt gần nhất' : 'Find nearest eye doctors',
        language === 'vi' ? 'Nhắc nhở kiểm tra định kỳ' : 'Regular check-up reminders',
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 overflow-hidden">
            {/* Decorative Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-blob" />
                <div className="absolute -top-20 right-0 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-teal-400/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
                <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-gradient-to-br from-indigo-400/15 to-pink-400/15 rounded-full blur-3xl animate-blob animation-delay-4000" />
            </div>

            {/* Header */}
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg shadow-lg' : ''}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        <div className="flex items-center gap-3">
                            <img src={logo} alt="Vision Coach" className="h-10 md:h-12 w-auto drop-shadow-lg" />
                            <span className="hidden sm:block text-lg font-bold text-gray-800 dark:text-white">Vision Coach</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleStart}
                                className="px-4 py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-colors"
                            >
                                {language === 'vi' ? 'Đăng nhập' : 'Login'}
                            </button>
                            <button
                                onClick={handleStart}
                                className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full hover:from-indigo-500 hover:to-purple-500 shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                {language === 'vi' ? 'Bắt đầu' : 'Get Started'}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative z-10 pt-24 md:pt-32 pb-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left: Text Content */}
                        <div className="text-center lg:text-left">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200/50 dark:border-indigo-800/50">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                </span>
                                <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                                    {language === 'vi' ? '🎉 Miễn phí 100% • Được hỗ trợ bởi AI' : '🎉 100% Free • Powered by AI'}
                                </span>
                            </div>

                            {/* Title */}
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-white mb-6 leading-[1.1]">
                                <span className="block">{language === 'vi' ? 'Kiểm Tra' : 'Test Your'}</span>
                                <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    {language === 'vi' ? 'Sức Khỏe Thị Lực' : 'Vision Health'}
                                </span>
                                <span className="block text-2xl sm:text-3xl mt-2 text-gray-600 dark:text-gray-300">
                                    {language === 'vi' ? 'Ngay Tại Nhà' : 'From Home'}
                                </span>
                            </h1>

                            {/* Subtitle */}
                            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                                {language === 'vi'
                                    ? 'Ứng dụng kiểm tra thị lực thông minh với 5 bài test chuyên nghiệp, phân tích bởi AI và lời khuyên từ bác sĩ ảo Eva.'
                                    : 'Smart vision testing app with 5 professional tests, AI analysis, and advice from virtual doctor Eva.'}
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8">
                                <button
                                    onClick={handleStart}
                                    className="group relative px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-indigo-500/30 transform hover:-translate-y-1 transition-all duration-300"
                                >
                                    <span className="flex items-center gap-3">
                                        {language === 'vi' ? 'Kiểm Tra Ngay' : 'Start Testing'}
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 blur-xl opacity-50 group-hover:opacity-70 transition-opacity -z-10" />
                                </button>
                                <button
                                    onClick={() => document.getElementById('why-section')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="flex items-center gap-2 px-6 py-4 text-lg font-semibold text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                >
                                    <Play className="w-5 h-5" />
                                    {language === 'vi' ? 'Tìm hiểu thêm' : 'Learn More'}
                                </button>
                            </div>

                            {/* Trust indicators */}
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Shield className="w-4 h-4 text-green-500" />
                                    <span>{language === 'vi' ? 'Bảo mật dữ liệu' : 'Data Secure'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Clock className="w-4 h-4 text-blue-500" />
                                    <span>{language === 'vi' ? 'Kết quả tức thì' : 'Instant Results'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Brain className="w-4 h-4 text-purple-500" />
                                    <span>Google Gemini AI</span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Image */}
                        <div className="relative">
                            <div className="relative z-10">
                                <img
                                    src={visionTestsImg}
                                    alt="Vision Tests"
                                    className="w-full max-w-lg mx-auto rounded-3xl shadow-2xl"
                                />
                            </div>
                            {/* Floating elements */}
                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl animate-bounce-slow">
                                <Eye className="w-12 h-12 text-white" />
                            </div>
                            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
                                <CheckCircle2 className="w-10 h-10 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="relative z-10 py-16 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                            {language === 'vi' ? 'Tại Sao Cần Kiểm Tra Thị Lực?' : 'Why Vision Testing Matters?'}
                        </h2>
                        <p className="text-white/80 max-w-2xl mx-auto">
                            {language === 'vi'
                                ? 'Theo WHO, các vấn đề về thị lực đang là mối quan ngại toàn cầu'
                                : 'According to WHO, vision problems are a global concern'}
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {visionStats.map((stat, index) => (
                            <div key={index} className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm">
                                <div className="text-4xl md:text-5xl font-black text-white mb-2">{stat.value}</div>
                                <div className="text-lg font-semibold text-white/90 mb-1">{stat.label}</div>
                                <div className="text-sm text-white/70">{stat.sublabel}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Vision Health Matters */}
            <section id="why-section" className="relative z-10 py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
                            {language === 'vi' ? 'TẠI SAO QUAN TRỌNG?' : 'WHY IT MATTERS?'}
                        </span>
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
                            {language === 'vi' ? 'Chăm Sóc Mắt Là Chăm Sóc Bản Thân' : 'Eye Care Is Self Care'}
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {whyMatters.map((item, index) => (
                            <div key={index} className="p-8 rounded-3xl bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6">
                                    <item.icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Meet Dr. Eva */}
            <section className="relative z-10 py-20 px-4 bg-gradient-to-br from-slate-100 to-blue-50 dark:from-gray-900 dark:to-gray-800">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="order-2 lg:order-1">
                            <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 rounded-full">
                                {language === 'vi' ? 'TRỢ LÝ AI' : 'AI ASSISTANT'}
                            </span>
                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-6">
                                {language === 'vi' ? 'Gặp Bác Sĩ Eva' : 'Meet Dr. Eva'}
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                                {language === 'vi'
                                    ? 'Bác sĩ Eva là trợ lý AI được đào tạo chuyên sâu về nhãn khoa. Eva sẽ phân tích kết quả kiểm tra, đưa ra lời khuyên cá nhân hóa, và trả lời mọi câu hỏi của bạn về sức khỏe mắt.'
                                    : 'Dr. Eva is an AI assistant trained in ophthalmology. Eva will analyze your test results, provide personalized advice, and answer all your eye health questions.'}
                            </p>
                            <ul className="space-y-4 mb-8">
                                {[
                                    language === 'vi' ? 'Phân tích chuyên sâu như bác sĩ thật' : 'Expert analysis like a real doctor',
                                    language === 'vi' ? 'Hỗ trợ 24/7 bằng giọng nói và văn bản' : '24/7 support via voice and text',
                                    language === 'vi' ? 'Đề xuất bài tập và chế độ chăm sóc' : 'Recommend exercises and care routines',
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={handleStart}
                                className="px-6 py-3 text-base font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg hover:shadow-xl transition-all"
                            >
                                {language === 'vi' ? 'Nói chuyện với Eva' : 'Talk to Eva'}
                            </button>
                        </div>
                        <div className="order-1 lg:order-2">
                            <img
                                src={drEvaImg}
                                alt="Dr. Eva AI"
                                className="w-full max-w-md mx-auto rounded-3xl shadow-2xl"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Slider */}
            <section className="relative z-10 py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
                            {language === 'vi' ? '5 BÀI KIỂM TRA' : '5 VISION TESTS'}
                        </span>
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
                            {language === 'vi' ? 'Các Bài Kiểm Tra Chuyên Nghiệp' : 'Professional Vision Tests'}
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            {language === 'vi'
                                ? 'Được thiết kế theo tiêu chuẩn y khoa quốc tế, phù hợp để sàng lọc ban đầu tại nhà'
                                : 'Designed to international medical standards, suitable for preliminary home screening'}
                        </p>
                    </div>

                    <div className="rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 shadow-2xl overflow-hidden">
                        <FeatureSlider language={language} autoPlayInterval={5000} />
                    </div>
                </div>
            </section>

            {/* Benefits Grid */}
            <section className="relative z-10 py-20 px-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
                            {language === 'vi' ? 'Lợi Ích Khi Sử Dụng' : 'Benefits of Using'}
                        </h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center gap-4 p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
                                    <Check className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-gray-800 dark:text-gray-200 font-medium">{benefit}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="relative z-10 py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="p-12 rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-0 left-0 w-40 h-40 bg-white/20 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white/20 rounded-full blur-3xl" />
                        </div>

                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                                {language === 'vi' ? 'Bắt Đầu Kiểm Tra Ngay Hôm Nay' : 'Start Testing Today'}
                            </h2>
                            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                                {language === 'vi'
                                    ? 'Chỉ mất 5 phút để hoàn thành một bài kiểm tra. Nhận báo cáo AI chi tiết và lời khuyên chuyên gia ngay lập tức.'
                                    : 'Only takes 5 minutes to complete a test. Get detailed AI report and expert advice instantly.'}
                            </p>
                            <button
                                onClick={handleStart}
                                className="inline-flex items-center gap-3 px-8 py-4 text-lg font-bold text-indigo-600 bg-white rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                            >
                                {language === 'vi' ? 'Bắt Đầu Miễn Phí' : 'Start Free Now'}
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 py-12 px-4 border-t border-gray-100 dark:border-gray-800">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <img src={logo} alt="Vision Coach" className="h-10 w-auto opacity-70" />
                            <span className="text-gray-600 dark:text-gray-400 text-sm">
                                © {new Date().getFullYear()} Vision Coach
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 text-center max-w-md">
                            {language === 'vi'
                                ? '⚠️ Ứng dụng này chỉ mang tính chất tham khảo và không thay thế cho việc khám bác sĩ chuyên khoa.'
                                : '⚠️ This app is for reference only and does not replace professional medical examination.'}
                        </p>
                    </div>
                </div>
            </footer>

            {/* CSS Animations */}
            <style>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-blob { animation: blob 8s ease-in-out infinite; }
                .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-4000 { animation-delay: 4s; }
            `}</style>
        </div>
    );
};

// Missing icon components
const Target: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
);

const Grid: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
);

export default WelcomePage;