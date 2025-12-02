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
<<<<<<< HEAD
import { Eye, Droplets, Target, Grid, CircleDot, History, Timer, Hand, Move3d, PlayCircle, X, TrendingUp, TrendingDown, Minus, Activity, ShieldCheck, AlertTriangle, BrainCircuit, CheckCircle, Lightbulb, Check, Calendar, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useRoutine } from '../context/RoutineContext';
import { RoutineActivity, DashboardInsights, StoredTestResult } from '../types';
import { useAI } from '../context/AIContext';
import { StorageService } from '../services/storageService';
import { InteractiveExerciseModal } from '../components/InteractiveExerciseModal';
import { translations } from '../i18n';
=======
import { Eye, Droplets, Target, Grid, CircleDot, History, Timer, Hand, Move3d, PlayCircle, X, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useRoutine } from '../context/RoutineContext';
import { RoutineActivity, StoredTestResult } from '../types';
import { StorageService } from '../services/storageService';
import { InteractiveExerciseModal } from '../components/InteractiveExerciseModal';
import { DashboardContent } from '../components/DashboardContent';
import { useDashboardInsights } from '../hooks/useDashboardInsights';

>>>>>>> cab493fd386716360f3fd4f7e7a23ccc7972d8e7
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

<<<<<<< HEAD
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
    const size = 180;
    const strokeWidth = 12;
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
        <div className="relative drop-shadow-2xl" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle
                    className="text-gray-100 dark:text-gray-800"
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
                <span className={`text-5xl font-display font-bold ${getColor()}`}>{score}</span>
                <span className="text-sm font-medium text-gray-400 dark:text-gray-500 mt-1">/ 100</span>
            </div>
        </div>
    );
};

const TrendIndicator: React.FC<{ trend: DashboardInsights['trend'] }> = ({ trend }) => {
    const { t } = useLanguage();
    const trendMap = {
        IMPROVING: { Icon: TrendingUp, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-500/20', textKey: 'trend_improving' as const },
        STABLE: { Icon: Minus, color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-500/20', textKey: 'trend_stable' as const },
        DECLINING: { Icon: TrendingDown, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-500/20', textKey: 'trend_declining' as const },
        INSUFFICIENT_DATA: { Icon: BrainCircuit, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-500/20', textKey: 'trend_insufficient_data' as const },
    };
    const { Icon, color, bg, textKey } = trendMap[trend] || trendMap.INSUFFICIENT_DATA;
    return (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${bg} ${color} shadow-sm`}>
            <Icon size={18} />
            <span>{t(textKey)}</span>
        </div>
    );
};

=======
// Modal hiển thị hướng dẫn bài tập mắt
>>>>>>> cab493fd386716360f3fd4f7e7a23ccc7972d8e7
const ExerciseModal: React.FC<{ activity: RoutineActivity; onClose: () => void }> = ({ activity, onClose }) => {
    const { t } = useLanguage();
    const details = EXERCISE_DETAILS[activity.key];
    if (!details) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="glass-card max-w-lg w-full p-8 relative animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"><X size={24} /></button>
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                        {React.createElement(ICONS[activity.key], { size: 32, className: "text-primary-600 dark:text-primary-400" })}
                    </div>
                    <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white">{t(details.titleKey as any)}</h3>
                </div>
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                    {details.stepsKey.map((stepKey, i) => (
                        <div key={i} className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white font-bold text-sm rounded-full flex items-center justify-center mt-0.5 shadow-md">{i + 1}</div>
                            <p className="leading-relaxed">{t(stepKey as any)}</p>
                        </div>
                    ))}
                </div>
                <button onClick={onClose} className="mt-8 w-full btn-primary">{t('got_it')}</button>
            </div>
        </div>
    );
};

<<<<<<< HEAD
const ActivityCard: React.FC<{
    activity: RoutineActivity;
=======
// Card cho một hoạt động trong "Today's Plan"
const ActivityCard: React.FC<{ 
    activity: RoutineActivity; 
>>>>>>> cab493fd386716360f3fd4f7e7a23ccc7972d8e7
    onActivityClick: (activity: RoutineActivity) => void;
    isCompleted: boolean;
    onToggle: () => void;
}> = ({ activity, onActivityClick, isCompleted, onToggle }) => {
    const { t } = useLanguage();
<<<<<<< HEAD
    const Icon = ICONS[activity.key] || Eye;
=======
>>>>>>> cab493fd386716360f3fd4f7e7a23ccc7972d8e7
    const isInteractive = activity.key === 'exercise_focus_change';

    const handleCardClick = () => onActivityClick(activity);

    const handleCheckboxClick = (e: React.MouseEvent) => {
<<<<<<< HEAD
        e.stopPropagation();
=======
        e.stopPropagation(); // Ngăn sự kiện click vào card khi chỉ click checkbox
>>>>>>> cab493fd386716360f3fd4f7e7a23ccc7972d8e7
        onToggle();
    };

    return (
        <div className={`glass-card group w-full text-left p-4 flex items-center gap-4 cursor-pointer hover:bg-white/80 dark:hover:bg-slate-800/80 ${isCompleted ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200/50 dark:border-green-800/30' : ''}`} onClick={handleCardClick}>
            <div onClick={handleCheckboxClick} className="cursor-pointer p-2 -ml-2">
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${isCompleted ? 'bg-green-500 border-green-500 scale-110' : 'border-gray-300 dark:border-gray-600 group-hover:border-primary-400'}`}>
                    {isCompleted && <Check size={14} className="text-white" />}
                </div>
            </div>

            <div className={`p-3 rounded-xl transition-colors ${isCompleted ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30'}`}>
                <Icon size={24} />
            </div>

            <div className={`flex-grow transition-opacity ${isCompleted ? 'opacity-50' : 'opacity-100'}`}>
                <div className="flex items-center gap-2">
                    <h4 className={`font-bold text-gray-900 dark:text-white ${isCompleted ? 'line-through decoration-gray-400' : ''}`}>{activity.name}</h4>
                    {isInteractive && <span className="text-[10px] font-bold text-white bg-gradient-to-r from-purple-500 to-indigo-500 px-2 py-0.5 rounded-full shadow-sm">AI</span>}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Timer size={12} />
                    {activity.duration} {t('minutes')}
                </p>
            </div>

            <button className={`p-2 transition-all transform ${isCompleted ? 'opacity-0 scale-75' : 'opacity-100 group-hover:scale-110'}`}>
                <PlayCircle className="text-primary-500 drop-shadow-md" size={32} />
            </button>
        </div>
    );
};

<<<<<<< HEAD
const TestCard: React.FC<{ test: any, index: number }> = ({ test, index }) => {
=======
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
>>>>>>> cab493fd386716360f3fd4f7e7a23ccc7972d8e7
    const { t } = useLanguage();
    return (
        <Link to={test.path} className="block group">
            <div
                className="glass-card relative flex items-center gap-4 p-4 hover:bg-white/90 dark:hover:bg-slate-800/90"
                style={{ animationDelay: `${index * 100}ms` }}
            >
                <div className={`p-3 rounded-xl ${test.bgColor} dark:bg-opacity-20 transition-transform group-hover:scale-110 duration-300`}>
                    <test.icon className={test.color} size={24} />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{t(test.nameKey)}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{t(test.descKey)}</p>
                </div>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                    <PlayCircle size={20} className="text-gray-400 dark:text-gray-500" />
                </div>
            </div>
        </Link>
    );
};

<<<<<<< HEAD
const InsightCard: React.FC<{ title: string; items: string[]; icon: React.ElementType; color: string; }> = ({ title, items, icon: Icon, color }) => (
    <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
        <h4 className={`flex items-center gap-2 font-bold text-md text-${color}-700 dark:text-${color}-400 mb-3`}>
            <Icon size={20} />
            {title}
        </h4>
        <ul className={`space-y-2 text-sm text-gray-600 dark:text-gray-300`}>
            {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                    <div className={`mt-1.5 w-1.5 h-1.5 rounded-full bg-${color}-500 flex-shrink-0`} />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    </div>
);

const ScoreDisplay: React.FC<{ insights: DashboardInsights }> = ({ insights }) => {
    const { score, rating, trend } = insights;
    const { t } = useLanguage();

    const ratingInfo = RATING_MAP[rating] || RATING_MAP.AVERAGE;
    const { textKey, color, Icon } = ratingInfo;

    return (
        <div className="lg:col-span-1 flex flex-col items-center justify-center space-y-6 lg:border-r lg:pr-8 border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white text-center">{t('vision_wellness_score')}</h3>
            <ScoreGauge score={score} />
            <div className="text-center space-y-2">
                <div className={`flex items-center justify-center gap-2 font-bold text-xl ${color}`}>
                    <Icon size={24} />
                    <span>{t(textKey)}</span>
                </div>
                <TrendIndicator trend={trend} />
            </div>
        </div>
    );
};

const RenderDashboardContent: React.FC<{
    isLoadingDashboard: boolean;
    history: StoredTestResult[];
    dashboardInsights: DashboardInsights | null;
}> = ({ isLoadingDashboard, history, dashboardInsights }) => {
    const { t } = useLanguage();

    if (isLoadingDashboard) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                <p className="text-gray-500 dark:text-gray-400 animate-pulse">{t('health_dashboard_loading')}</p>
            </div>
        );
    }

    if (history.length < 2) {
        return (
            <div className="text-center p-12 flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <Activity size={32} className="text-gray-400" />
                </div>
                <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">{t('no_history_for_score_title')}</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">{t('no_history_for_score_desc')}</p>
            </div>
        );
    }

    if (!dashboardInsights) {
        return <div className="text-center p-10 text-red-500">{t('error_report')}</div>
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <ScoreDisplay insights={dashboardInsights} />
            <div className="lg:col-span-2 space-y-6">
                <div>
                    <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Sparkles size={18} className="text-yellow-500" />
                        {t('overall_summary')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm bg-white/50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                        {dashboardInsights.overallSummary}
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InsightCard title={t('whats_going_well')} items={dashboardInsights.positives} icon={CheckCircle} color="green" />
                    <InsightCard title={t('areas_to_monitor')} items={dashboardInsights.areasToMonitor} icon={AlertTriangle} color="yellow" />
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50">
                    <h4 className="flex items-center gap-2 font-bold text-md text-blue-700 dark:text-blue-300 mb-2">
                        <Lightbulb size={20} className="text-yellow-500" />
                        {t('ai_pro_tip')}
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">{dashboardInsights.proTip}</p>
                </div>
            </div>
        </div>
    );
};


export const Home: React.FC = () => {
    const { t, language } = useLanguage();
    const { weeklyRoutine, completedActivities, toggleActivityCompletion } = useRoutine();
    // Use AI service inside component to respect React Hooks rules
    const aiService = useAI();
    const navigate = useNavigate();
    const [modalActivity, setModalActivity] = useState<RoutineActivity | null>(null);
    const [interactiveModalActivity, setInteractiveModalActivity] = useState<RoutineActivity | null>(null);

    const [dashboardInsights, setDashboardInsights] = useState<DashboardInsights | null>(null);
    const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
    const [history, setHistory] = useState<StoredTestResult[]>([]);

    useEffect(() => {
        const loadDashboardData = async () => {
            setIsLoadingDashboard(true);
            const historyData = storageService.getTestHistory();
            setHistory(historyData);

            if (historyData.length >= 2) {
                try {
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


    const tests = [
        { nameKey: 'snellen_test', descKey: 'snellen_desc', path: '/home/test/snellen', icon: Eye, color: 'text-blue-500 dark:text-blue-400', bgColor: 'bg-blue-100' },
        { nameKey: 'colorblind_test', descKey: 'colorblind_desc', path: '/home/test/colorblind', icon: Droplets, color: 'text-green-500 dark:text-green-400', bgColor: 'bg-green-100' },
        { nameKey: 'astigmatism_test', descKey: 'astigmatism_desc', path: '/home/test/astigmatism', icon: Target, color: 'text-purple-500 dark:text-purple-400', bgColor: 'bg-purple-100' },
        { nameKey: 'amsler_grid_test', descKey: 'amsler_grid_desc', path: '/home/test/amsler', icon: Grid, color: 'text-red-500 dark:text-red-400', bgColor: 'bg-red-100' },
        { nameKey: 'duochrome_test', descKey: 'duochrome_desc', path: '/home/test/duochrome', icon: CircleDot, color: 'text-yellow-500 dark:text-yellow-400', bgColor: 'bg-yellow-100' },
        { nameKey: 'history_page', descKey: 'history_desc', path: '/home/history', icon: History, color: 'text-gray-500 dark:text-gray-400', bgColor: 'bg-gray-200' },
    ];

    const daysOfWeek = language === 'vi'
        ? ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"]
        : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
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

    const handleActivityClick = (activity: RoutineActivity) => {
        if (activity.type === 'test') {
            navigate(`/home/test/${activity.key}`);
        } else if (activity.key === 'exercise_focus_change') {
            setInteractiveModalActivity(activity);
        } else {
            setModalActivity(activity);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-24 pb-12 transition-colors duration-500">
            {/* Vision Insights Dashboard */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                <div className="glass-card p-8 animate-fade-in-up shadow-2xl border-white/40 dark:border-white/10">
                    <RenderDashboardContent
                        isLoadingDashboard={isLoadingDashboard}
                        history={history}
                        dashboardInsights={dashboardInsights}
                    />
                </div>
=======
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
>>>>>>> cab493fd386716360f3fd4f7e7a23ccc7972d8e7
            </div>

<<<<<<< HEAD
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Today's Plan */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Calendar className="text-primary-500" />
                            {t('todays_plan')}
                        </h2>
                        {todaysActivities.length > 0 && (
                            <div className="flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
                                <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
=======
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
>>>>>>> cab493fd386716360f3fd4f7e7a23ccc7972d8e7
                                </div>
                                <span className="text-xs font-bold text-primary-600 dark:text-primary-400">{Math.round(progress)}%</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        {todaysActivities && todaysActivities.length > 0 ? (
                            <>
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
                                    <div className="mt-6 p-6 bg-green-50/80 dark:bg-green-900/20 rounded-2xl text-center border border-green-200 dark:border-green-800 animate-fade-in-up backdrop-blur-sm">
                                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
                                        </div>
                                        <h4 className="font-bold text-green-800 dark:text-green-300 text-lg">{t('todays_plan_complete_title')}</h4>
                                        <p className="text-green-700 dark:text-green-400 mt-1">{t('todays_plan_complete_desc')}</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12 px-6 glass-card border-dashed border-2 border-gray-200 dark:border-gray-700">
                                <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Calendar size={32} className="text-gray-400" />
                                </div>
<<<<<<< HEAD
                                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">{t('rest_day_title')}</h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">{t('rest_day_desc')}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Tests */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Activity className="text-secondary-500" />
                        {t('all_tests_title')}
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                        {tests.map((test, index) => (
                            <TestCard key={test.nameKey} test={test} index={index} />
                        ))}
                    </div>
                </div>
            </div>

            {modalActivity && <ExerciseModal activity={modalActivity} onClose={() => setModalActivity(null)} />}
            {interactiveModalActivity && <InteractiveExerciseModal activity={interactiveModalActivity} onClose={() => setInteractiveModalActivity(null)} />}
        </main>
    );
};
=======
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
>>>>>>> cab493fd386716360f3fd4f7e7a23ccc7972d8e7
