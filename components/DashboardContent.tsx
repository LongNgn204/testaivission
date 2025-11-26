/**
 * =================================================================
 * 📈 DashboardContent - Khối hiển thị Vision Wellness Dashboard
 * =================================================================
 *
 * MỤC ĐÍCH:
 * - Nhận `dashboardInsights` (score, rating, trend, summaries) và lịch sử để render UI.
 * - Hiển thị thang điểm, xếp hạng, xu hướng, positives, areasToMonitor và Pro Tip.
 * - Nếu thiếu dữ liệu/AI lỗi: hiển thị thông báo và nút thử lại (onRetry).
 *
 * CÁCH DÙNG:
 * <DashboardContent history={history} dashboardInsights={insights} errorMessage={error} onRetry={refresh} />
 */
import React from 'react';
import { ShieldCheck, CheckCircle, Activity, AlertTriangle, TrendingUp, Minus, TrendingDown, BrainCircuit, Lightbulb } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { DashboardInsights, StoredTestResult } from '../types';
import { translations } from '../i18n';

// Map rating → text key + màu + icon
const RATING_MAP: Record<DashboardInsights['rating'], {
    textKey: keyof typeof translations.en;
    color: string;
    Icon: React.ElementType;
}> = {
    EXCELLENT: { textKey: 'rating_excellent', color: 'text-green-500', Icon: ShieldCheck },
    GOOD: { textKey: 'rating_good', color: 'text-blue-500', Icon: CheckCircle },
    AVERAGE: { textKey: 'rating_average', color: 'text-yellow-500', Icon: Activity },
    NEEDS_ATTENTION: { textKey: 'rating_needs_attention', color: 'text-red-500', Icon: AlertTriangle },
};

const ScoreGauge: React.FC<{ score: number }> = ({ score }) => {
    const size = 160;
    const strokeWidth = 14;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const getColor = () => {
        if (score >= 85) return 'text-green-500';
        if (score >= 70) return 'text-blue-500';
        if (score >= 50) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <div className="relative drop-shadow-lg" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle
                    className="text-gray-200 dark:text-gray-700"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                    className={`${getColor()} transition-all duration-1000 ease-out`}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    style={{ transitionProperty: 'stroke-dashoffset' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${getColor()}`}>{score}</span>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">/ 100</span>
            </div>
        </div>
    );
};

const TrendIndicator: React.FC<{ trend: DashboardInsights['trend'] }> = ({ trend }) => {
    const { t } = useLanguage();
    const trendMap = {
        IMPROVING: { Icon: TrendingUp, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-500/20', textKey: 'trend_improving' as const},
        STABLE: { Icon: Minus, color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-500/20', textKey: 'trend_stable' as const},
        DECLINING: { Icon: TrendingDown, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-500/20', textKey: 'trend_declining' as const},
        INSUFFICIENT_DATA: { Icon: BrainCircuit, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-500/20', textKey: 'trend_insufficient_data' as const},
    };
    const { Icon, color, bg, textKey } = trendMap[trend] || trendMap.INSUFFICIENT_DATA;
    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${bg} ${color}`}>
            <Icon size={18} />
            <span>{t(textKey)}</span>
        </div>
    );
};

const INSIGHT_COLOR_CLASSES = {
    green: {
        heading: 'text-green-700 dark:text-green-400',
        bullet: 'before:text-green-500 dark:before:text-green-400',
    },
    yellow: {
        heading: 'text-yellow-700 dark:text-yellow-400',
        bullet: 'before:text-yellow-500 dark:before:text-yellow-400',
    },
};

const InsightCard: React.FC<{title: string; items: string[]; icon: React.ElementType; color: keyof typeof INSIGHT_COLOR_CLASSES;}> = ({ title, items, icon: Icon, color }) => {
    const palette = INSIGHT_COLOR_CLASSES[color] || INSIGHT_COLOR_CLASSES.green;
    return (
        <div>
            <h4 className={`flex items-center gap-2 font-bold text-md ${palette.heading} mb-2`}>
                <Icon size={20} />
                {title}
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300 pl-7">
                {items.map((item: string, i: number) => (
                    <li key={i} className={`relative pl-4 before:content-['•'] before:absolute before:left-0 ${palette.bullet}`}>
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const ScoreDisplay: React.FC<{ insights: DashboardInsights }> = ({ insights }) => {
    const { score, rating, trend } = insights;
    const { t } = useLanguage();

    const ratingInfo = RATING_MAP[rating] || RATING_MAP.AVERAGE;
    const { textKey, color, Icon } = ratingInfo;

    return (
        <div className="lg:col-span-1 flex flex-col items-center justify-center space-y-4 lg:border-r lg:pr-8 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{t('vision_wellness_score')}</h3>
            <ScoreGauge score={score} />
            <div className={`flex items-center gap-2 font-bold text-lg ${color}`}>
                <Icon size={22} />
                <span>{t(textKey)}</span>
            </div>
            <TrendIndicator trend={trend} />
        </div>
    );
};

interface DashboardContentProps {
    history: StoredTestResult[];
    dashboardInsights: DashboardInsights | null;
    errorMessage?: string | null;
    onRetry?: () => void;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({ history, dashboardInsights, errorMessage, onRetry }) => {
    const { t } = useLanguage();

    if (history.length < 2) {
        return (
            <div className="text-center p-10">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t('no_history_for_score_title')}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{t('no_history_for_score_desc')}</p>
            </div>
        );
    }
    
    if (!dashboardInsights) {
        return (
            <div className="text-center p-10 text-red-600">
                {t('error_report')}
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 space-y-4">
            {errorMessage && (
                <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:border-amber-400/30 dark:text-amber-200">
                    <span className="text-sm font-medium">{errorMessage}</span>
                    {onRetry && (
                        <button onClick={onRetry} className="px-3 py-1 text-sm font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-500 transition-colors">
                            {t('try_again')}
                        </button>
                    )}
                </div>
            )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <ScoreDisplay insights={dashboardInsights} />
            <div className="lg:col-span-2 space-y-5">
                <div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-2">{t('overall_summary')}</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">{dashboardInsights.overallSummary}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t dark:border-gray-700">
                    <InsightCard title={t('whats_going_well')} items={dashboardInsights.positives} icon={CheckCircle} color="green" />
                    <InsightCard title={t('areas_to_monitor')} items={dashboardInsights.areasToMonitor} icon={AlertTriangle} color="yellow" />
                </div>
                 <div className="pt-4 border-t dark:border-gray-700">
                     <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg dark:bg-blue-900/30 dark:border-blue-500">
                         <h4 className="flex items-center gap-2 font-bold text-md text-blue-800 dark:text-blue-300 mb-2">
                             <Lightbulb size={20} />
                             {t('ai_pro_tip')}
                         </h4>
                         <p className="text-sm text-blue-700 dark:text-blue-200">{dashboardInsights.proTip}</p>
                     </div>
                 </div>
            </div>
        </div>
        </div>
    );
};
