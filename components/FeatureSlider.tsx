/**
 * =================================================================
 * 🎠 FeatureSlider - Animated Feature Carousel Component
 * =================================================================
 *
 * A premium feature slider for the landing page showcasing
 * key features of the Vision Coach app with smooth animations.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Eye, Brain, TrendingUp, Bell, MapPin, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface Slide {
    id: number;
    icon: React.ElementType;
    gradient: string;
    iconBg: string;
    title: string;
    titleEn: string;
    description: string;
    descriptionEn: string;
    highlight: string;
    highlightEn: string;
}

const slides: Slide[] = [
    {
        id: 1,
        icon: Eye,
        gradient: 'from-blue-500 via-indigo-500 to-purple-600',
        iconBg: 'bg-blue-100 dark:bg-blue-900/50',
        title: '5 Bài Kiểm Tra Thị Lực Chuyên Nghiệp',
        titleEn: '5 Professional Vision Tests',
        description: 'Snellen, Mù màu, Loạn thị, Lưới Amsler, và Duochrome - Tất cả được thiết kế theo tiêu chuẩn y học quốc tế.',
        descriptionEn: 'Snellen, Color Blind, Astigmatism, Amsler Grid, and Duochrome - All designed to international medical standards.',
        highlight: 'Chuẩn Y Khoa',
        highlightEn: 'Medical Standard',
    },
    {
        id: 2,
        icon: Brain,
        gradient: 'from-purple-500 via-pink-500 to-rose-500',
        iconBg: 'bg-purple-100 dark:bg-purple-900/50',
        title: 'Phân Tích AI Thông Minh',
        titleEn: 'Smart AI Analysis',
        description: 'Được hỗ trợ bởi Google Gemini AI - Bác sĩ Eva phân tích kết quả và đưa ra lời khuyên chuyên sâu như bác sĩ thực thụ.',
        descriptionEn: 'Powered by Google Gemini AI - Dr. Eva analyzes results and provides expert advice like a real doctor.',
        highlight: 'Google Gemini AI',
        highlightEn: 'Google Gemini AI',
    },
    {
        id: 3,
        icon: TrendingUp,
        gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
        iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
        title: 'Theo Dõi Tiến Trình & Gamification',
        titleEn: 'Progress Tracking & Gamification',
        description: 'Xem xu hướng sức khỏe mắt qua thời gian, thu thập huy hiệu, và duy trì chuỗi ngày kiểm tra để có động lực.',
        descriptionEn: 'Track your eye health trends over time, collect badges, and maintain streaks for motivation.',
        highlight: 'Huy Hiệu & Điểm Thưởng',
        highlightEn: 'Badges & Rewards',
    },
    {
        id: 4,
        icon: Bell,
        gradient: 'from-amber-500 via-orange-500 to-red-500',
        iconBg: 'bg-amber-100 dark:bg-amber-900/50',
        title: 'Nhắc Nhở Thông Minh',
        titleEn: 'Smart Reminders',
        description: 'Hệ thống nhắc nhở thông minh giúp bạn không bao giờ quên kiểm tra mắt và thực hiện các bài tập hàng ngày.',
        descriptionEn: 'Smart reminder system ensures you never forget to check your eyes and do daily exercises.',
        highlight: 'Tự Động Nhắc',
        highlightEn: 'Auto Remind',
    },
    {
        id: 5,
        icon: MapPin,
        gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
        iconBg: 'bg-cyan-100 dark:bg-cyan-900/50',
        title: 'Tìm Bệnh Viện Mắt Gần Bạn',
        titleEn: 'Find Eye Hospitals Near You',
        description: 'Định vị GPS để tìm các bác sĩ nhãn khoa và bệnh viện mắt uy tín gần vị trí của bạn một cách nhanh chóng.',
        descriptionEn: 'GPS location to quickly find reputable ophthalmologists and eye hospitals near you.',
        highlight: 'GPS Tích Hợp',
        highlightEn: 'GPS Integrated',
    },
];

interface FeatureSliderProps {
    language?: 'vi' | 'en';
    autoPlayInterval?: number;
}

export const FeatureSlider: React.FC<FeatureSliderProps> = ({
    language = 'vi',
    autoPlayInterval = 5000,
}) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [direction, setDirection] = useState<'left' | 'right'>('right');

    const nextSlide = useCallback(() => {
        setDirection('right');
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, []);

    const prevSlide = useCallback(() => {
        setDirection('left');
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }, []);

    const goToSlide = useCallback((index: number) => {
        setDirection(index > currentSlide ? 'right' : 'left');
        setCurrentSlide(index);
    }, [currentSlide]);

    // Auto-play
    useEffect(() => {
        if (!isAutoPlaying) return;
        const timer = setInterval(nextSlide, autoPlayInterval);
        return () => clearInterval(timer);
    }, [isAutoPlaying, autoPlayInterval, nextSlide]);

    // Pause on hover
    const handleMouseEnter = () => setIsAutoPlaying(false);
    const handleMouseLeave = () => setIsAutoPlaying(true);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'ArrowRight') nextSlide();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [prevSlide, nextSlide]);

    const slide = slides[currentSlide];
    const Icon = slide.icon;

    return (
        <div
            className="relative w-full overflow-hidden"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Slide Content */}
            <div className="relative min-h-[400px] md:min-h-[450px] flex items-center justify-center px-4 py-12">
                {/* Animated Background */}
                <div
                    className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-10 dark:opacity-20 transition-all duration-700`}
                />

                {/* Content Card */}
                <div
                    key={slide.id}
                    className={`relative z-10 max-w-4xl mx-auto text-center transform transition-all duration-500 ease-out
            ${direction === 'right' ? 'animate-slide-in-right' : 'animate-slide-in-left'}`}
                >
                    {/* Icon */}
                    <div className="mb-8">
                        <div
                            className={`inline-flex items-center justify-center w-24 h-24 md:w-28 md:h-28 rounded-3xl ${slide.iconBg} shadow-2xl transform hover:scale-110 transition-transform duration-300`}
                        >
                            <Icon className={`w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br ${slide.gradient} bg-clip-text`} style={{ color: 'transparent', background: `linear-gradient(135deg, var(--tw-gradient-stops))`, WebkitBackgroundClip: 'text', backgroundClip: 'text' }} />
                            <Icon className={`w-12 h-12 md:w-14 md:h-14 text-transparent`} style={{
                                background: `linear-gradient(135deg, ${slide.gradient.includes('blue') ? '#3B82F6' : slide.gradient.includes('purple') ? '#A855F7' : slide.gradient.includes('emerald') ? '#10B981' : slide.gradient.includes('amber') ? '#F59E0B' : '#06B6D4'}, ${slide.gradient.includes('purple') ? '#EC4899' : slide.gradient.includes('pink') ? '#F43F5E' : slide.gradient.includes('teal') ? '#14B8A6' : slide.gradient.includes('orange') ? '#EF4444' : '#6366F1'})`,
                                WebkitBackgroundClip: 'text',
                                backgroundClip: 'text'
                            }} />
                        </div>
                    </div>

                    {/* Badge */}
                    <div className="mb-6">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${slide.gradient} shadow-lg`}>
                            <Sparkles className="w-4 h-4" />
                            {language === 'vi' ? slide.highlight : slide.highlightEn}
                        </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                        {language === 'vi' ? slide.title : slide.titleEn}
                    </h2>

                    {/* Description */}
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                        {language === 'vi' ? slide.description : slide.descriptionEn}
                    </p>
                </div>
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 hover:scale-110 transition-all duration-200 z-20"
                aria-label="Previous slide"
            >
                <ChevronLeft className="w-6 h-6 md:w-7 md:h-7" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 hover:scale-110 transition-all duration-200 z-20"
                aria-label="Next slide"
            >
                <ChevronRight className="w-6 h-6 md:w-7 md:h-7" />
            </button>

            {/* Dots Indicator */}
            <div className="flex items-center justify-center gap-3 pb-8">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`relative h-3 rounded-full transition-all duration-300 ${index === currentSlide
                                ? 'w-10 bg-gradient-to-r ' + slide.gradient
                                : 'w-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
                <div
                    className={`h-full bg-gradient-to-r ${slide.gradient} transition-all duration-300`}
                    style={{
                        width: `${((currentSlide + 1) / slides.length) * 100}%`,
                    }}
                />
            </div>

            {/* CSS Animations */}
            <style>{`
        @keyframes slide-in-right {
          0% { opacity: 0; transform: translateX(50px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-in-left {
          0% { opacity: 0; transform: translateX(-50px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in-right { animation: slide-in-right 0.5s ease-out forwards; }
        .animate-slide-in-left { animation: slide-in-left 0.5s ease-out forwards; }
      `}</style>
        </div>
    );
};

export default FeatureSlider;
