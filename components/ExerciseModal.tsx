import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { RoutineActivity } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import {
    TimerIcon,
    HandIcon,
    Move3dIcon,
    EyeIcon
} from './ui/Icons';

// Map icons to activity keys if needed, or use generic ones
// I'll use a helper to get the icon based on activity key
const getIconForActivity = (key: string) => {
    switch (key) {
        case 'exercise_20_20_20': return TimerIcon;
        case 'exercise_palming': return HandIcon;
        case 'exercise_focus_change': return Move3dIcon;
        default: return EyeIcon;
    }
};

// We need to define EXERCISE_DETAILS or import it. 
// Since it was inline in Home.tsx, I'll redefine it here for now.
const EXERCISE_DETAILS: Record<string, { titleKey: string; stepsKey: string[] }> = {
    'exercise_20_20_20': {
        titleKey: 'exercise_202020_title',
        stepsKey: ['exercise_202020_step1', 'exercise_202020_step2', 'exercise_202020_step3']
    },
    'exercise_palming': {
        titleKey: 'exercise_palming_title',
        stepsKey: ['exercise_palming_step1', 'exercise_palming_step2', 'exercise_palming_step3', 'exercise_palming_step4']
    },
    'exercise_focus_change': {
        titleKey: 'exercise_focus_change_title',
        stepsKey: ['exercise_focus_change_step1', 'exercise_focus_change_step2', 'exercise_focus_change_step3', 'exercise_focus_change_step4']
    }
};

interface ExerciseModalProps {
    activity: RoutineActivity;
    onClose: () => void;
}

export const ExerciseModal: React.FC<ExerciseModalProps> = ({ activity, onClose }) => {
    const { t } = useLanguage();
    const details = EXERCISE_DETAILS[activity.key];

    if (!details) return null;

    const Icon = getIconForActivity(activity.key) || EyeIcon;

    return (
        <Modal isOpen={true} onClose={onClose} title={t(details.titleKey as any)} size="md">
            <div className="flex flex-col items-center mb-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-4 text-primary">
                    <Icon size={48} />
                </div>
            </div>

            <div className="space-y-4 mb-8">
                {details.stepsKey.map((stepKey, i) => (
                    <div key={i} className="flex items-start gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary text-white font-bold text-sm rounded-full flex items-center justify-center shadow-sm">
                            {i + 1}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">
                            {t(stepKey as any)}
                        </p>
                    </div>
                ))}
            </div>

            <div className="flex justify-end">
                <Button onClick={onClose} fullWidth size="lg">
                    {t('got_it')}
                </Button>
            </div>
        </Modal>
    );
};
