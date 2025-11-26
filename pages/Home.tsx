/**
 * =================================================================
 * 🏠 Home.tsx - Trang chủ & Dashboard chính
 * =================================================================
 *
 * MỤC ĐÍCH:
 * - Hiển thị Vision Wellness Dashboard với điểm số, xếp hạng, và xu hướng từ AI.
 * - Hiển thị kế hoạch hàng ngày (Today's Plan) từ RoutineContext.
 * - Cho phép người dùng check/uncheck và bắt đầu các hoạt động.
 * - Liệt kê danh sách tất cả các bài test có sẵn.
 * - Xử lý việc mở modal cho các bài tập mắt (thông thường và tương tác).
 *
 * LUỒNG DỮ LIỆU:
 * 1. `useEffect` → `storageService.getTestHistory()` → lấy lịch sử test.
 * 2. Lịch sử được truyền vào hook `useDashboardInsights`.
 * 3. `useDashboardInsights` → gọi `aiService.generateDashboardInsights` → nhận về insights.
 * 4. `useRoutine` → lấy `weeklyRoutine` và `completedActivities` để hiển thị Today's Plan.
 * 5. `DashboardContent` nhận `insights` và `history` để render UI.
 * 6. `ActivityCard` nhận `activity` và trạng thái `isCompleted` để render.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Droplets, Target, Grid, CircleDot, History, Timer, Hand, Move3d, PlayCircle, X, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useRoutine } from '../context/RoutineContext';
import { RoutineActivity, StoredTestResult } from '../types';
import { StorageService } from '../services/storageService';
import { InteractiveExerciseModal } from '../components/InteractiveExerciseModal';
import { DashboardContent } from '../components/DashboardContent';
import { useDashboardInsights } from '../hooks/useDashboardInsights';

const storageService = new StorageService();

// Map key của activity với icon tương ứng từ thư viện Lucide
const ICONS: Record<string, React.ElementType> = {
  snellen: Eye,
  colorblind: Droplets,
  astigmatism: Target,
  amsler: Grid,
  duochrome: CircleDot,
  exercise_20_20_20: Timer,
  exercise_palming: Hand,
  exercise_focus_change: Move3d,
  history: History,
};

// Chi tiết các bước cho từng bài tập (dùng để hiển thị trong modal)
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

// Modal hiển thị hướng dẫn bài tập mắt
const ExerciseModal: React.FC<{ activity: RoutineActivity; onClose: () => void }> = ({ activity, onClose }) => {
    const { t } = useLanguage();
    const details = EXERCISE_DETAILS[activity.key];
    if (!details) return null;

    return (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full p-6 sm:p-8 relative animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"><X size={24} /></button>
                <div className="flex items-center gap-4 mb-4">
                    {React.createElement(ICONS[activity.key], { size: 32, className: "text-blue-500 flex-shrink-0" })}
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t(details.titleKey as any)}</h3>
                </div>
                <div className="space-y-3 text-gray-600 dark:text-gray-300">
                    {details.stepsKey.map((stepKey, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white font-bold text-sm rounded-full flex items-center justify-center mt-1">{i + 1}</div>
                            <p>{t(stepKey as any)}</p>
                        </div>
                    ))}
                </div>
                 <button onClick={onClose} className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">{t('got_it')}</button>
            </div>
        </div>
    );
};

// Card cho một hoạt động trong "Today's Plan"
const ActivityCard: React.FC<{ 
    activity: RoutineActivity; 
    onActivityClick: (activity: RoutineActivity) => void;
    isCompleted: boolean;
    onToggle: () => void;
}> = ({ activity, onActivityClick, isCompleted, onToggle }) => {
    const { t } = useLanguage();
    const isInteractive = activity.key === 'exercise_focus_change';

    const handleCardClick = () => onActivityClick(activity);

    const handleCheckboxClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Ngăn sự kiện click vào card khi chỉ click checkbox
        onToggle();
    };

    return (
        <div className={`pill-card group w-full text-left p-4 ${isCompleted ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800' : 'bg-surface-light dark:bg-surface-dark border border-surface-light/50 dark:border-surface-dark/50'}`}>
            <div className="flex items-center gap-4">
                 <div onClick={handleCheckboxClick} className="cursor-pointer p-2 -ml-2">
                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${isCompleted ? 'bg-blue-600 border-blue-600' : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400'}`}>
                        {isCompleted && <Check size={16} className="text-white" />}
                    </div>
                </div>
                <div className={`flex-grow transition-opacity ${isCompleted ? 'opacity-50' : 'opacity-100'}`} onClick={handleCardClick}>
                    <div className="flex items-center gap-2">
                         <h4 className={`font-bold text-gray-800 dark:text-gray-200 ${isCompleted ? 'line-through' : ''}`}>{activity.name}</h4>
                         {isInteractive && <span className="text-xs font-semibold text-white bg-purple-500 px-2 py-0.5 rounded-full">AI</span>}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{activity.duration} {t('minutes')}</p>
                </div>
                <button onClick={handleCardClick} className={`p-2 transition-opacity ${isCompleted ? 'opacity-30' : 'opacity-100'}`}>
                    <PlayCircle className={`text-white bg-primary rounded-full p-1 shadow-md group-hover:shadow-glow transition-all`} size={28} />
                </button>
            </div>
        </div>
    );
};

// Skeleton UI cho Dashboard khi đang tải dữ liệu
const DashboardSkeleton: React.FC = () => (
    <div className="p-8 space-y-6 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-48 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700"></div>
            <div className="lg:col-span-2 space-y-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-5/6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-32 rounded-2xl bg-gray-100 dark:bg-gray-800"></div>
                    <div className="h-32 rounded-2xl bg-gray-100 dark:bg-gray-800"></div>
                </div>
            </div>
        </div>
    </div>
);

// Card cho một bài test trong danh sách "All Tests"
const TestCard: React.FC<{test: any}> = ({ test }) => {
    const { t } = useLanguage();
    return (
        <Link to={test.path} className="block group">
            <div className={`glass relative flex flex-col items-center justify-center p-6 rounded-2xl h-48 transition-all duration-300 transform shadow-md group-hover:shadow-xl group-hover:-translate-y-2 group-hover:shadow-glow`}>
                <div className="mb-4 p-3 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20">
                    <test.icon className={test.color} size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t(test.nameKey)}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">{t(test.descKey)}</p>
            </div>
        </Link>
    );
};

export const Home: React.FC = () => {
  const { t, language } = useLanguage();
  const { weeklyRoutine, completedActivities, toggleActivityCompletion } = useRoutine();
  const navigate = useNavigate();
  const [modalActivity, setModalActivity] = useState<RoutineActivity | null>(null);
  const [interactiveModalActivity, setInteractiveModalActivity] = useState<RoutineActivity | null>(null);
  const [history, setHistory] = useState<StoredTestResult[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  // Tải lịch sử test từ storage
  const loadHistoryData = useCallback(() => {
    setIsHistoryLoading(true);
    const historyData = storageService.getTestHistory();
    setHistory(historyData);
    setIsHistoryLoading(false);
  }, []);

  // Tải lại dữ liệu khi component mount hoặc khi focus lại vào tab (để cập nhật)
  useEffect(() => {
    loadHistoryData();
    const handleFocus = () => loadHistoryData();

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadHistoryData, language]);

  // Hook để lấy insights từ AI dựa trên lịch sử
  const {
    insights: dashboardInsights,
    isLoading: isInsightsLoading,
    error: dashboardError,
    refresh: refreshInsights,
  } = useDashboardInsights(history, language);

  const isLoadingDashboard = isHistoryLoading || isInsightsLoading;

  // Danh sách các bài test có sẵn
  const tests = [
    { nameKey: 'snellen_test', descKey: 'snellen_desc', path: '/home/test/snellen', icon: Eye, color: 'text-blue-500 dark:text-blue-400' },
    { nameKey: 'colorblind_test', descKey: 'colorblind_desc', path: '/home/test/colorblind', icon: Droplets, color: 'text-green-500 dark:text-green-400' },
    { nameKey: 'astigmatism_test', descKey: 'astigmatism_desc', path: '/home/test/astigmatism', icon: Target, color: 'text-purple-500 dark:text-purple-400' },
    { nameKey: 'amsler_grid_test', descKey: 'amsler_grid_desc', path: '/home/test/amsler', icon: Grid, color: 'text-red-500 dark:text-red-400' },
    { nameKey: 'duochrome_test', descKey: 'duochrome_desc', path: '/home/test/duochrome', icon: CircleDot, color: 'text-yellow-500 dark:text-yellow-400' },
    { nameKey: 'history_page', descKey: 'history_desc', path: '/home/history', icon: History, color: 'text-gray-500 dark:text-gray-400' },
  ];

  // Lấy hoạt động của ngày hôm nay từ routine
  const daysOfWeekKeys = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = daysOfWeekKeys[new Date().getDay()];
  const todaysActivities = weeklyRoutine ? weeklyRoutine[today] : [];

  // Tính toán tiến độ hoàn thành
  const completedCount = todaysActivities.filter((_, index) => !!completedActivities[`${todaysActivities[index].key}-${index}`]).length;
  const totalActivities = todaysActivities.length;
  const progress = totalActivities > 0 ? (completedCount / totalActivities) * 100 : 0;
  const allActivitiesCompleted = totalActivities > 0 && progress === 100;

  // Xử lý khi click vào một hoạt động
  const handleActivityClick = (activity: RoutineActivity) => {
      if (activity.type === 'test') {
          navigate(`/home/test/${activity.key}`);
      } else if (activity.key === 'exercise_focus_change') {
          setInteractiveModalActivity(activity); // Mở modal bài tập tương tác
      } else {
          setModalActivity(activity); // Mở modal bài tập thông thường
      }
  };

  return (
    <main>
        {/* Vision Insights Dashboard */}
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-sky-900/20">
            <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                 <div className="glass rounded-2xl shadow-lg dark:shadow-2xl">
                    {isLoadingDashboard ? (
                        <DashboardSkeleton />
                    ) : (
                        <DashboardContent
                            history={history}
                            dashboardInsights={dashboardInsights}
                            errorMessage={dashboardError}
                            onRetry={refreshInsights}
                        />
                    )}
                 </div>
            </div>
        </div>

        <div className="max-w-5xl mx-auto p-6 lg:p-12">
            {/* Today's Plan */}
            <div className="mb-16 -mt-16">
                <div className="p-6 bg-white rounded-2xl shadow-lg dark:bg-gray-800 dark:border dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">{t('todays_plan')}</h2>
                    {todaysActivities && todaysActivities.length > 0 ? (
                        <>
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-1">
                                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('todays_plan_progress')}</h3>
                                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{Math.round(progress)}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                                    <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                                </div>
                            </div>
                            <div className="space-y-4">
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
                            </div>
                            {allActivitiesCompleted && (
                                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg text-center border border-green-200 dark:border-green-800 animate-fade-in">
                                    <h4 className="font-bold text-green-800 dark:text-green-300">{t('todays_plan_complete_title')}</h4>
                                    <p className="text-sm text-green-700 dark:text-green-400 mt-1">{t('todays_plan_complete_desc')}</p>
                                </div>
                            )}
                        </>
                    ) : (
                        // Hiển thị khi là ngày nghỉ
                        <div className="text-center py-10 px-6 bg-gray-50 rounded-xl dark:bg-gray-800/50">
                            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">{t('rest_day_title')}</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">{t('rest_day_desc')}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* All Vision Tests */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">{t('all_tests_title')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tests.map(test => <TestCard key={test.nameKey} test={test} />)}
                </div>
            </div>
        </div>
      
        {modalActivity && <ExerciseModal activity={modalActivity} onClose={() => setModalActivity(null)} />}
        {interactiveModalActivity && <InteractiveExerciseModal activity={interactiveModalActivity} onClose={() => setInteractiveModalActivity(null)} />}
    </main>
  );
};
