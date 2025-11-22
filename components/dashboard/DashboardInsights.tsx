import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { StoredTestResult, DashboardInsights as DashboardInsightsType } from '../../types';
import { ScoreGauge } from './ScoreGauge';
import { TrendIndicator } from './TrendIndicator';
import { CheckCircleIcon, AlertTriangleIcon, LightbulbIcon, ActivityIcon } from '../ui/Icons';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface DashboardInsightsProps {
    isLoadingDashboard: boolean;
    history: StoredTestResult[];
    dashboardInsights: DashboardInsightsType | null;
}

const InsightItem: React.FC<{ title: string; items: string[]; icon: React.ElementType; color: string }> = ({
    title,
    items,
    icon: Icon,
    color
}) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
        <h4 className={`flex items-center gap-2 font-bold text-md ${color} mb-3`}>
            <Icon size={20} />
            {title}
        </h4>
        <ul className="space-y-2">
            {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${color.replace('text-', 'bg-').split(' ')[0]}`}></span>
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    </div>
);

export const DashboardInsights: React.FC<DashboardInsightsProps> = ({
    isLoadingDashboard,
    history,
    dashboardInsights
}) => {
    const { t } = useLanguage();

    if (isLoadingDashboard) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <div className="spinner mb-4 text-primary"></div>
                <span>{t('health_dashboard_loading')}</span>
            </div>
        );
    }

    if (history.length < 2) {
        return (
            <div className="text-center py-12 px-6">
                <div className="inline-flex p-4 rounded-full bg-blue-50 dark:bg-blue-900/20 text-primary mb-4">
                    <ActivityIcon size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('no_history_for_score_title')}</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">{t('no_history_for_score_desc')}</p>
            </div>
        );
    }

    if (!dashboardInsights) {
        return (
            <div className="text-center py-12 text-red-500">
                <AlertTriangleIcon size={32} className="mx-auto mb-2" />
                {t('error_report')}
            </div>
        );
    }

    const RATING_MAP: Record<string, { textKey: string; color: string; Icon: React.ElementType }> = {
        EXCELLENT: { textKey: 'rating_excellent', color: 'text-green-500', Icon: CheckCircleIcon },
        GOOD: { textKey: 'rating_good', color: 'text-blue-500', Icon: CheckCircleIcon },
        AVERAGE: { textKey: 'rating_average', color: 'text-yellow-500', Icon: ActivityIcon },
        NEEDS_ATTENTION: { textKey: 'rating_needs_attention', color: 'text-red-500', Icon: AlertTriangleIcon },
    };

    const ratingInfo = RATING_MAP[dashboardInsights.rating] || RATING_MAP.AVERAGE;

    return (
        <div className="space-y-8">
            {/* Score Section */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 py-6">
                <ScoreGauge score={dashboardInsights.score} />

                <div className="flex flex-col items-center md:items-start space-y-4">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                            {t('vision_wellness_score')}
                        </h3>
                        <div className={`flex items-center gap-2 font-bold text-2xl ${ratingInfo.color}`}>
                            <ratingInfo.Icon size={28} />
                            <span>{t(ratingInfo.textKey as any)}</span>
                        </div>
                    </div>

                    <TrendIndicator trend={dashboardInsights.trend} />
                </div>
            </div>

            {/* Analysis Section */}
            <div className="space-y-6">
                <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-blue-900 dark:text-blue-100 text-base">
                            {t('overall_summary')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-blue-800 dark:text-blue-200 leading-relaxed text-sm">
                            {dashboardInsights.overallSummary}
                        </p>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InsightItem
                        title={t('whats_going_well')}
                        items={dashboardInsights.positives}
                        icon={CheckCircleIcon}
                        color="text-green-600 dark:text-green-400"
                    />
                    <InsightItem
                        title={t('areas_to_monitor')}
                        items={dashboardInsights.areasToMonitor}
                        icon={AlertTriangleIcon}
                        color="text-yellow-600 dark:text-yellow-400"
                    />
                </div>

                {/* Pro Tip */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-5 rounded-xl border border-purple-100 dark:border-purple-800 flex gap-4">
                    <div className="flex-shrink-0 p-2 bg-white dark:bg-gray-800 rounded-full h-fit text-purple-600 dark:text-purple-400 shadow-sm">
                        <LightbulbIcon size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-purple-900 dark:text-purple-100 mb-1">
                            {t('ai_pro_tip')}
                        </h4>
                        <p className="text-sm text-purple-800 dark:text-purple-200">
                            {dashboardInsights.proTip}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
