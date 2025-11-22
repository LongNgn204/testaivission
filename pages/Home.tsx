import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useRoutine } from '../context/RoutineContext';
import { AIService } from '../services/aiService';
import { StorageService } from '../services/storageService';
import { DashboardInsights, RoutineActivity, StoredTestResult } from '../types';
import {
    EyeIcon,
    CalendarIcon,
    ActivityIcon,
    TrophyIcon,
    FlameIcon,
    StarIcon,
    ChevronRightIcon,
    PlayIcon,
    TargetIcon,
    GridIcon,
    CircleDotIcon
} from '../components/ui/Icons';

import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { InteractiveExerciseModal } from '../components/InteractiveExerciseModal';
import { ExerciseModal } from '../components/ExerciseModal'; // We need to ensure this exists or use the inline one I'll create/restore
// Actually, ExerciseModal was inline in the old file. I should probably extract it or use a simplified version.
// I'll check if components/ExerciseModal.tsx exists. If not, I'll create it.
// For now, I'll assume it might not exist as a standalone file if it was inline.
// I'll create a simple ExerciseModal in components/ExerciseModal.tsx if I haven't already.
// Wait, line 9 of old Home.tsx imported InteractiveExerciseModal.
// Line 119 defined ExerciseModal inline.
// I will create components/ExerciseModal.tsx to be safe.

import { DashboardInsights as DashboardInsightsComponent } from '../components/dashboard/DashboardInsights';
import { ActivityCard } from '../components/dashboard/ActivityCard';
import { TestCard } from '../components/dashboard/TestCard';

const aiService = new AIService();
const storageService = new StorageService();

export const Home: React.FC = () => {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const { weeklyRoutine, completedActivities, toggleActivityCompletion } = useRoutine();

    const [dashboardInsights, setDashboardInsights] = useState<DashboardInsights | null>(null);
    const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
    const [showExerciseModal, setShowExerciseModal] = useState(false);
    const [currentActivity, setCurrentActivity] = useState<RoutineActivity | null>(null);
    const [interactiveModalActivity, setInteractiveModalActivity] = useState<RoutineActivity | null>(null);
    const [history, setHistory] = useState<StoredTestResult[]>([]);

    useEffect(() => {
        const loadDashboardData = async () => {
            setIsLoadingDashboard(true);
            const historyData = storageService.getTestHistory();
            setHistory(historyData);

            if (historyData.length >= 2) {
                try {
                    // In a real app, we might cache this or only fetch if new data
                    const insights = await aiService.generateDashboardInsights(historyData, language);
                    setDashboardInsights(insights);
                } catch (error) {
                    console.error("Failed to generate dashboard insights:", error);
                    setDashboardInsights(null);
                }
            } else {
                setDashboardInsights(null);
            }
            setIsLoadingDashboard(false);
        };

        loadDashboardData();

        const handleFocus = () => {
            loadDashboardData();
        };

        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [language]);

    const handleActivityClick = (activity: RoutineActivity) => {
        if (activity.type === 'test') {
            navigate(`/home/test/${activity.key}`);
        } else if (activity.key === 'exercise_focus_change') {
            setInteractiveModalActivity(activity);
        } else {
            setCurrentActivity(activity);
            setShowExerciseModal(true);
        }
    };

    const tests = [
        { nameKey: 'snellen_test', descKey: 'snellen_desc', path: '/home/test/snellen', icon: EyeIcon, color: 'text-blue-500 dark:text-blue-400', bgColor: 'bg-blue-100' },
        { nameKey: 'colorblind_test', descKey: 'colorblind_desc', path: '/home/test/colorblind', icon: StarIcon, color: 'text-green-500 dark:text-green-400', bgColor: 'bg-green-100' },
        { nameKey: 'astigmatism_test', descKey: 'astigmatism_desc', path: '/home/test/astigmatism', icon: TargetIcon, color: 'text-purple-500 dark:text-purple-400', bgColor: 'bg-purple-100' },
        { nameKey: 'amsler_grid_test', descKey: 'amsler_grid_desc', path: '/home/test/amsler', icon: GridIcon, color: 'text-red-500 dark:text-red-400', bgColor: 'bg-red-100' },
        { nameKey: 'duochrome_test', descKey: 'duochrome_desc', path: '/home/test/duochrome', icon: CircleDotIcon, color: 'text-yellow-500 dark:text-yellow-400', bgColor: 'bg-yellow-100' },
    ];

    // Get today's routine
    const daysOfWeekKeys = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = daysOfWeekKeys[new Date().getDay()];
    const todaysActivities = weeklyRoutine ? weeklyRoutine[today] : [];

    const completedCount = todaysActivities.filter((activity, index) => {
        const activityIdentifier = `${activity.key}-${index}`;
        return !!completedActivities[activityIdentifier];
    }).length;

    const totalActivities = todaysActivities.length;
    const progress = totalActivities > 0 ? (completedCount / totalActivities) * 100 : 0;
    const allActivitiesCompleted = totalActivities > 0 && progress === 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-200 pb-20">
            <div className="container mx-auto px-4 py-8">
                {/* Hero Section */}
                <section className="text-center mb-12 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4 font-heading">
                        {t('hero_title')}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
                        {t('hero_subtitle')}
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={() => navigate('/home/test/snellen')}
                            leftIcon={<EyeIcon size={20} />}
                            className="shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
                        >
                            {t('start_test')}
                        </Button>
                        <Button
                            variant="secondary"
                            size="lg"
                            onClick={() => navigate('/home/about')} // Assuming about page exists or similar
                            leftIcon={<ActivityIcon size={20} />}
                        >
                            {t('learn_more')}
                        </Button>
                    </div>
                </section>

                {/* Wellness Hub */}
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {t('wellness_hub_title')}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                {t('wellness_hub_subtitle')}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Today's Plan */}
                        <Card className="h-full transform transition-transform duration-300 hover:scale-[1.01]">
                            <CardHeader className="flex items-center justify-between pb-2">
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarIcon className="text-primary" size={20} />
                                    {t('todays_plan')}
                                </CardTitle>
                                <Badge variant="info">{new Date().toLocaleDateString()}</Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-4">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('todays_plan_progress')}</h3>
                                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{Math.round(progress)}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
                                    </div>
                                </div>

                                {todaysActivities && todaysActivities.length > 0 ? (
                                    <div className="space-y-3">
                                        {todaysActivities.map((activity, index) => {
                                            const activityIdentifier = `${activity.key}-${index}`;
                                            return (
                                                <ActivityCard
                                                    key={activityIdentifier}
                                                    activity={activity}
                                                    onActivityClick={handleActivityClick}
                                                    isCompleted={!!completedActivities[activityIdentifier]}
                                                    onToggle={() => toggleActivityCompletion(activityIdentifier)}
                                                />
                                            );
                                        })}

                                        {allActivitiesCompleted && (
                                            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center border border-green-200 dark:border-green-800 animate-fade-in">
                                                <h4 className="font-bold text-green-800 dark:text-green-300 text-sm">{t('todays_plan_complete_title')}</h4>
                                                <p className="text-xs text-green-700 dark:text-green-400 mt-1">{t('todays_plan_complete_desc')}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">{t('rest_day_title')}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('rest_day_desc')}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Health Dashboard - Spans 2 cols on large screens */}
                        <div className="lg:col-span-2">
                            <Card className="h-full transform transition-transform duration-300 hover:scale-[1.01]">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ActivityIcon className="text-success" size={20} />
                                        {t('health_dashboard_title')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <DashboardInsightsComponent
                                        isLoadingDashboard={isLoadingDashboard}
                                        history={history}
                                        dashboardInsights={dashboardInsights}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* All Tests */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                        {t('all_tests_title')}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tests.map((test) => (
                            <TestCard key={test.nameKey} test={test} />
                        ))}
                        <div onClick={() => navigate('/home/history')} className="cursor-pointer group">
                            <Card className="h-full flex flex-col items-center justify-center p-6 hover:shadow-lg transition-all border-dashed border-2 border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary bg-transparent">
                                <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                                    <ChevronRightIcon size={32} className="text-gray-400 group-hover:text-primary" />
                                </div>
                                <h3 className="font-bold text-gray-600 dark:text-gray-300 group-hover:text-primary">{t('view_history')}</h3>
                            </Card>
                        </div>
                    </div>
                </section>
            </div>

            {showExerciseModal && currentActivity && (
                <ExerciseModal activity={currentActivity} onClose={() => setShowExerciseModal(false)} />
            )}

            {interactiveModalActivity && (
                <InteractiveExerciseModal activity={interactiveModalActivity} onClose={() => setInteractiveModalActivity(null)} />
            )}
        </div>
    );
};