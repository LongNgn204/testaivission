import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { RoutineActivity } from '../../types';
import { CheckIcon, PlayIcon, EyeIcon } from '../ui/Icons';
import { Card } from '../ui/Card';

interface ActivityCardProps {
    activity: RoutineActivity;
    onActivityClick: (activity: RoutineActivity) => void;
    isCompleted: boolean;
    onToggle: () => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
    activity,
    onActivityClick,
    isCompleted,
    onToggle
}) => {
    const { t } = useLanguage();
    const isInteractive = activity.key === 'exercise_focus_change';

    const handleCardClick = () => {
        onActivityClick(activity);
    };

    const handleCheckboxClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggle();
    };

    return (
        <Card
            className={`group w-full p-4 transition-all duration-300 cursor-pointer ${isCompleted
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'hover:border-blue-200 dark:hover:border-blue-800'
                }`}
            onClick={handleCardClick}
            padding="none"
        >
            <div className="flex items-center gap-4 p-4">
                {/* Checkbox */}
                <div
                    onClick={handleCheckboxClick}
                    className="cursor-pointer p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${isCompleted
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400'
                        }`}>
                        {isCompleted && <CheckIcon size={14} className="text-white" />}
                    </div>
                </div>

                {/* Content */}
                <div className={`flex-grow transition-opacity ${isCompleted ? 'opacity-50' : 'opacity-100'}`}>
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-bold text-gray-900 dark:text-white ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                            {activity.name}
                        </h4>
                        {isInteractive && (
                            <span className="text-[10px] font-bold text-white bg-purple-500 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                AI
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                        {activity.duration} {t('minutes')}
                    </p>
                </div>

                {/* Action Button */}
                <div className={`p-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-all ${isCompleted ? 'hidden' : ''}`}>
                    <EyeIcon size={20} />
                </div>
            </div>
        </Card>
    );
};
