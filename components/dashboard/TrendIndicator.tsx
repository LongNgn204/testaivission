import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { TrendingUpIcon, TrendingDownIcon, MinusIcon, BrainIcon } from '../ui/Icons';
import { DashboardInsights } from '../../types';

interface TrendIndicatorProps {
    trend: DashboardInsights['trend'];
}

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({ trend }) => {
    const { t } = useLanguage();

    const getTrendConfig = () => {
        switch (trend) {
            case 'IMPROVING':
                return {
                    icon: <TrendingUpIcon size={16} />,
                    color: 'text-green-600 dark:text-green-400',
                    bg: 'bg-green-100 dark:bg-green-500/20',
                    textKey: 'trend_improving'
                };
            case 'STABLE':
                return {
                    icon: <MinusIcon size={16} />,
                    color: 'text-gray-600 dark:text-gray-400',
                    bg: 'bg-gray-100 dark:bg-gray-500/20',
                    textKey: 'trend_stable'
                };
            case 'DECLINING':
                return {
                    icon: <TrendingDownIcon size={16} />,
                    color: 'text-red-600 dark:text-red-400',
                    bg: 'bg-red-100 dark:bg-red-500/20',
                    textKey: 'trend_declining'
                };
            default:
                return {
                    icon: <BrainIcon size={16} />,
                    color: 'text-blue-600 dark:text-blue-400',
                    bg: 'bg-blue-100 dark:bg-blue-500/20',
                    textKey: 'trend_insufficient_data'
                };
        }
    };

    const config = getTrendConfig();

    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${config.bg} ${config.color}`}>
            {config.icon}
            <span>{t(config.textKey as any)}</span>
        </div>
    );
};
