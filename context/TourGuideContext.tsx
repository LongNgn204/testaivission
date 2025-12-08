/**
 * =================================================================
 * 🎯 TourGuideContext - State Management for Onboarding Tour
 * =================================================================
 *
 * Manages the tour guide state across the application:
 * - Track current step and tour progress
 * - Persist completion status in localStorage
 * - Provide navigation controls
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface TourStep {
    id: string;
    target: string; // CSS selector for the target element
    title: string;
    titleEn: string;
    description: string;
    descriptionEn: string;
    placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
    highlight?: boolean; // Should the element be highlighted
}

// Default tour steps for new users
export const defaultTourSteps: TourStep[] = [
    {
        id: 'welcome',
        target: '[data-tour="dashboard"]',
        title: 'Chào mừng đến với Vision Coach! 👋',
        titleEn: 'Welcome to Vision Coach! 👋',
        description: 'Đây là bảng điều khiển sức khỏe thị lực của bạn. AI sẽ phân tích và đưa ra thông tin chi tiết về tình trạng mắt của bạn.',
        descriptionEn: 'This is your vision health dashboard. AI will analyze and provide detailed insights about your eye condition.',
        placement: 'bottom',
        highlight: true,
    },
    {
        id: 'todays-plan',
        target: '[data-tour="todays-plan"]',
        title: 'Kế Hoạch Hôm Nay 📅',
        titleEn: "Today's Plan 📅",
        description: 'Mỗi ngày, AI sẽ tạo ra một kế hoạch chăm sóc mắt được cá nhân hóa cho bạn. Hoàn thành các hoạt động để duy trì sức khỏe mắt tốt nhất.',
        descriptionEn: 'Every day, AI creates a personalized eye care plan for you. Complete activities to maintain optimal eye health.',
        placement: 'top',
        highlight: true,
    },
    {
        id: 'tests',
        target: '[data-tour="tests"]',
        title: 'Các Bài Kiểm Tra Thị Lực 👁️',
        titleEn: 'Vision Tests 👁️',
        description: 'Chúng tôi có 5 bài kiểm tra chuyên nghiệp: Snellen (thị lực), Mù màu, Loạn thị, Lưới Amsler, và Duochrome. Mỗi bài test được thiết kế theo tiêu chuẩn y học.',
        descriptionEn: 'We have 5 professional tests: Snellen (visual acuity), Color Blind, Astigmatism, Amsler Grid, and Duochrome. Each test follows medical standards.',
        placement: 'top',
        highlight: true,
    },
    {
        id: 'eva-coach',
        target: '[data-tour="eva-coach"]',
        title: 'Gặp Bác Sĩ Eva 🤖',
        titleEn: 'Meet Dr. Eva 🤖',
        description: 'Bác sĩ Eva là trợ lý AI của bạn. Bạn có thể nói chuyện với Eva bằng giọng nói hoặc văn bản để nhận lời khuyên về sức khỏe mắt.',
        descriptionEn: 'Dr. Eva is your AI assistant. You can talk to Eva using voice or text to receive eye health advice.',
        placement: 'left',
        highlight: true,
    },
    {
        id: 'navigation',
        target: '[data-tour="navigation"]',
        title: 'Điều Hướng Ứng Dụng 🧭',
        titleEn: 'App Navigation 🧭',
        description: 'Sử dụng menu để truy cập các trang khác: Lịch sử kiểm tra, Tiến trình, Bệnh viện gần bạn, và Nhắc nhở.',
        descriptionEn: 'Use the menu to access other pages: Test History, Progress, Nearby Hospitals, and Reminders.',
        placement: 'bottom',
        highlight: true,
    },
    {
        id: 'complete',
        target: '',
        title: 'Bạn Đã Sẵn Sàng! 🎉',
        titleEn: "You're All Set! 🎉",
        description: 'Tuyệt vời! Bây giờ bạn đã biết cách sử dụng Vision Coach. Hãy bắt đầu với bài kiểm tra đầu tiên để AI phân tích sức khỏe mắt của bạn.',
        descriptionEn: "Great! Now you know how to use Vision Coach. Start with your first test so AI can analyze your eye health.",
        placement: 'center',
        highlight: false,
    },
];

interface TourGuideContextType {
    // State
    isTourActive: boolean;
    currentStep: number;
    steps: TourStep[];
    hasCompletedTour: boolean;

    // Actions
    startTour: (customSteps?: TourStep[]) => void;
    nextStep: () => void;
    prevStep: () => void;
    goToStep: (stepIndex: number) => void;
    endTour: (markAsCompleted?: boolean) => void;
    resetTour: () => void;
}

const TourGuideContext = createContext<TourGuideContextType | null>(null);

interface TourGuideProviderProps {
    children: ReactNode;
}

export const TourGuideProvider: React.FC<TourGuideProviderProps> = ({ children }) => {
    const [isTourActive, setIsTourActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [steps, setSteps] = useState<TourStep[]>(defaultTourSteps);
    const [hasCompletedTour, setHasCompletedTour] = useState(false);

    // Load tour completion status from localStorage
    useEffect(() => {
        try {
            const completed = localStorage.getItem('tour_completed');
            setHasCompletedTour(completed === 'true');
        } catch {
            setHasCompletedTour(false);
        }
    }, []);

    const startTour = useCallback((customSteps?: TourStep[]) => {
        if (customSteps) {
            setSteps(customSteps);
        } else {
            setSteps(defaultTourSteps);
        }
        setCurrentStep(0);
        setIsTourActive(true);
    }, []);

    const nextStep = useCallback(() => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            // End tour at the last step
            endTour(true);
        }
    }, [currentStep, steps.length]);

    const prevStep = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);

    const goToStep = useCallback((stepIndex: number) => {
        if (stepIndex >= 0 && stepIndex < steps.length) {
            setCurrentStep(stepIndex);
        }
    }, [steps.length]);

    const endTour = useCallback((markAsCompleted = true) => {
        setIsTourActive(false);
        setCurrentStep(0);

        if (markAsCompleted) {
            setHasCompletedTour(true);
            try {
                localStorage.setItem('tour_completed', 'true');
            } catch {
                // Ignore localStorage errors
            }
        }
    }, []);

    const resetTour = useCallback(() => {
        setHasCompletedTour(false);
        try {
            localStorage.removeItem('tour_completed');
        } catch {
            // Ignore localStorage errors
        }
    }, []);

    // Keyboard navigation
    useEffect(() => {
        if (!isTourActive) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'Escape':
                    endTour();
                    break;
                case 'ArrowRight':
                case 'Enter':
                    nextStep();
                    break;
                case 'ArrowLeft':
                    prevStep();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isTourActive, nextStep, prevStep, endTour]);

    const value: TourGuideContextType = {
        isTourActive,
        currentStep,
        steps,
        hasCompletedTour,
        startTour,
        nextStep,
        prevStep,
        goToStep,
        endTour,
        resetTour,
    };

    return (
        <TourGuideContext.Provider value={value}>
            {children}
        </TourGuideContext.Provider>
    );
};

export const useTourGuide = (): TourGuideContextType => {
    const context = useContext(TourGuideContext);
    if (!context) {
        throw new Error('useTourGuide must be used within a TourGuideProvider');
    }
    return context;
};

export default TourGuideContext;
