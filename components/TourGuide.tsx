/**
 * =================================================================
 * 🎯 TourGuide - Interactive Onboarding Tour Component
 * =================================================================
 *
 * A beautiful tour guide component with:
 * - Spotlight effect on target elements
 * - Animated popover with step info
 * - Progress indicator
 * - Keyboard navigation
 * - Smooth scrolling
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Sparkles, HelpCircle } from 'lucide-react';
import { useTourGuide, TourStep } from '../context/TourGuideContext';
import { useLanguage } from '../context/LanguageContext';

interface Position {
    top: number;
    left: number;
    width: number;
    height: number;
}

export const TourGuide: React.FC = () => {
    const {
        isTourActive,
        currentStep,
        steps,
        nextStep,
        prevStep,
        endTour
    } = useTourGuide();
    const { language } = useLanguage();

    const [targetPosition, setTargetPosition] = useState<Position | null>(null);
    const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const popoverRef = useRef<HTMLDivElement>(null);

    const step = steps[currentStep];

    // Find and position the target element
    const updatePositions = useCallback(() => {
        if (!step || !step.target || step.placement === 'center') {
            setTargetPosition(null);
            return;
        }

        const targetElement = document.querySelector(step.target);
        if (!targetElement) {
            setTargetPosition(null);
            return;
        }

        const rect = targetElement.getBoundingClientRect();
        const scrollTop = window.scrollY;
        const scrollLeft = window.scrollX;

        const position: Position = {
            top: rect.top + scrollTop,
            left: rect.left + scrollLeft,
            width: rect.width,
            height: rect.height,
        };

        setTargetPosition(position);

        // Scroll to element with offset
        const elementCenter = rect.top + rect.height / 2;
        const viewportCenter = window.innerHeight / 2;

        if (elementCenter < 100 || elementCenter > window.innerHeight - 100) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Calculate popover position
        if (popoverRef.current) {
            const popoverRect = popoverRef.current.getBoundingClientRect();
            const padding = 16;
            let top = 0;
            let left = 0;

            switch (step.placement) {
                case 'top':
                    top = position.top - popoverRect.height - padding;
                    left = position.left + position.width / 2 - popoverRect.width / 2;
                    break;
                case 'bottom':
                    top = position.top + position.height + padding;
                    left = position.left + position.width / 2 - popoverRect.width / 2;
                    break;
                case 'left':
                    top = position.top + position.height / 2 - popoverRect.height / 2;
                    left = position.left - popoverRect.width - padding;
                    break;
                case 'right':
                    top = position.top + position.height / 2 - popoverRect.height / 2;
                    left = position.left + position.width + padding;
                    break;
                default:
                    top = window.innerHeight / 2 - popoverRect.height / 2 + scrollTop;
                    left = window.innerWidth / 2 - popoverRect.width / 2;
            }

            // Ensure popover stays within viewport
            left = Math.max(padding, Math.min(left, window.innerWidth - popoverRect.width - padding));
            top = Math.max(padding + scrollTop, top);

            setPopoverPosition({ top, left });
        }
    }, [step]);

    useEffect(() => {
        if (isTourActive) {
            updatePositions();
            window.addEventListener('resize', updatePositions);
            window.addEventListener('scroll', updatePositions);

            return () => {
                window.removeEventListener('resize', updatePositions);
                window.removeEventListener('scroll', updatePositions);
            };
        }
    }, [isTourActive, currentStep, updatePositions]);

    // Delay position update after render
    useEffect(() => {
        if (isTourActive) {
            const timer = setTimeout(updatePositions, 100);
            return () => clearTimeout(timer);
        }
    }, [isTourActive, currentStep, updatePositions]);

    if (!isTourActive || !step) return null;

    const isCenterPlacement = step.placement === 'center' || !targetPosition;

    return (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
            {/* Overlay */}
            <div className="absolute inset-0 pointer-events-auto">
                {/* Dark backdrop with cutout for target */}
                <svg className="w-full h-full" style={{ position: 'absolute', top: 0, left: 0 }}>
                    <defs>
                        <mask id="tour-mask">
                            <rect x="0" y="0" width="100%" height="100%" fill="white" />
                            {targetPosition && (
                                <rect
                                    x={targetPosition.left - 8}
                                    y={targetPosition.top - 8}
                                    width={targetPosition.width + 16}
                                    height={targetPosition.height + 16}
                                    rx="12"
                                    fill="black"
                                />
                            )}
                        </mask>
                    </defs>
                    <rect
                        x="0"
                        y="0"
                        width="100%"
                        height="100%"
                        fill="rgba(0, 0, 0, 0.75)"
                        mask="url(#tour-mask)"
                    />
                </svg>

                {/* Highlight ring around target */}
                {targetPosition && (
                    <div
                        className="absolute rounded-xl ring-4 ring-indigo-500/50 animate-pulse-slow pointer-events-none"
                        style={{
                            top: targetPosition.top - 8,
                            left: targetPosition.left - 8,
                            width: targetPosition.width + 16,
                            height: targetPosition.height + 16,
                        }}
                    />
                )}
            </div>

            {/* Popover */}
            <div
                ref={popoverRef}
                className={`absolute z-10 w-[90vw] max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 pointer-events-auto transform transition-all duration-300 ${isCenterPlacement
                        ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                        : ''
                    }`}
                style={!isCenterPlacement ? { top: popoverPosition.top, left: popoverPosition.left } : undefined}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-5 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {language === 'vi' ? step.title : step.titleEn}
                            </h3>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {language === 'vi'
                                    ? `Bước ${currentStep + 1} / ${steps.length}`
                                    : `Step ${currentStep + 1} of ${steps.length}`}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => endTour()}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        aria-label="Close tour"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {language === 'vi' ? step.description : step.descriptionEn}
                    </p>
                </div>

                {/* Progress bar */}
                <div className="px-5 pb-3">
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl border-t border-gray-100 dark:border-gray-700">
                    <button
                        onClick={() => endTour()}
                        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    >
                        {language === 'vi' ? 'Bỏ qua' : 'Skip Tour'}
                    </button>

                    <div className="flex items-center gap-2">
                        {currentStep > 0 && (
                            <button
                                onClick={prevStep}
                                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                {language === 'vi' ? 'Trước' : 'Back'}
                            </button>
                        )}
                        <button
                            onClick={nextStep}
                            className="flex items-center gap-1 px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg shadow-lg hover:shadow-xl transition-all"
                        >
                            {currentStep === steps.length - 1
                                ? (language === 'vi' ? 'Hoàn tất' : 'Finish')
                                : (language === 'vi' ? 'Tiếp' : 'Next')}
                            {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* CSS Animations */}
            <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
      `}</style>
        </div>
    );
};

/**
 * Tour Start Button - Can be placed anywhere to trigger the tour
 */
export const TourStartButton: React.FC<{ className?: string }> = ({ className }) => {
    const { startTour, hasCompletedTour } = useTourGuide();
    const { language } = useLanguage();

    return (
        <button
            onClick={() => startTour()}
            className={`flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors ${className || ''}`}
            title={language === 'vi' ? 'Bắt đầu hướng dẫn' : 'Start Tour'}
        >
            <HelpCircle className="w-4 h-4" />
            {!hasCompletedTour && (
                <span className="animate-pulse">
                    {language === 'vi' ? 'Hướng dẫn' : 'Tour'}
                </span>
            )}
        </button>
    );
};

export default TourGuide;
