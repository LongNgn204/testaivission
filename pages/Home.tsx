import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Droplets, Target, Grid, CircleDot, History, Timer, Hand, Move3d, PlayCircle, X, TrendingUp, TrendingDown, Minus, Activity, ShieldCheck, AlertTriangle, BrainCircuit, CheckCircle, Lightbulb, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useRoutine } from '../context/RoutineContext';
import { RoutineActivity, DashboardInsights, StoredTestResult } from '../types';
import { AIService } from '../services/aiService';
import { StorageService } from '../services/storageService';
import { InteractiveExerciseModal } from '../components/InteractiveExerciseModal';
import { translations } from '../i18n';

const aiService = new AIService();
const storageService = new StorageService();

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
        <div className="relative" style={{ width: size, height: size }}>
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
    // Fix: Add textKey to map trend status to translation keys.
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

const ActivityCard: React.FC<{ 
    activity: RoutineActivity; 
    onActivityClick: (activity: RoutineActivity) => void;
    isCompleted: boolean;
    onToggle: () => void;
}> = ({ activity, onActivityClick, isCompleted, onToggle }) => {
    const { t } = useLanguage();
    const Icon = ICONS[activity.key] || Eye;
    const isTest = activity.type === 'test';
    const isInteractive = activity.key === 'exercise_focus_change';
    const color = isTest ? 'blue' : 'green';

    const handleCardClick = () => {
        onActivityClick(activity);
    };

    const handleCheckboxClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click when checkbox is clicked
        onToggle();
    };


    return (
        <div className={`group w-full text-left p-4 rounded-xl shadow-md transition-all duration-300 ${isCompleted ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'}`}>
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
                    <PlayCircle className={`text-gray-300 group-hover:text-${color}-400 transition-colors dark:text-gray-600 dark:group-hover:text-${color}-400`} size={28} />
                </button>
            </div>
        </div>
    );
};

const TestCard: React.FC<{test: any}> = ({ test }) => {
    const { t } = useLanguage();
    return (
        <Link to={test.path} className="block group">
            <div className={`relative flex flex-col items-center justify-center p-6 rounded-2xl h-48 transition-all duration-300 transform bg-white shadow-md group-hover:shadow-xl group-hover:-translate-y-2 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:group-hover:border-blue-500`}>
                <div className={`mb-4 p-3 rounded-full ${test.bgColor} dark:bg-gray-700`}>
                    <test.icon className={test.color} size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t(test.nameKey)}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">{t(test.descKey)}</p>
            </div>
        </Link>
    );
};

const InsightCard: React.FC<{title: string; items: string[]; icon: React.ElementType; color: string;}> = ({ title, items, icon: Icon, color }) => (
  <div>
      <h4 className={`flex items-center gap-2 font-bold text-md text-${color}-700 dark:text-${color}-400 mb-2`}>
          <Icon size={20} />
          {title}
      </h4>
      <ul className={`space-y-2 text-sm text-gray-600 dark:text-gray-300 pl-7`}>
          {items.map((item, i) => <li key={i} className={`relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-${color}-500 dark:before:text-${color}-400`}>{item}</li>)}
      </ul>
  </div>
);

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

// Fix: Refactor the render function into a proper React component to resolve scoping issues.
const RenderDashboardContent: React.FC<{
    isLoadingDashboard: boolean;
    history: StoredTestResult[];
    dashboardInsights: DashboardInsights | null;
}> = ({ isLoadingDashboard, history, dashboardInsights }) => {
    const { t } = useLanguage();

    if (isLoadingDashboard) {
        return <div className="text-center p-10 text-gray-600 dark:text-gray-400">{t('health_dashboard_loading')}</div>
    }
    
    if (history.length < 2) {
        return (
            <div className="text-center p-10">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t('no_history_for_score_title')}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{t('no_history_for_score_desc')}</p>
            </div>
        );
    }
    
    if (!dashboardInsights) {
        return <div className="text-center p-10 text-red-600">{t('error_report')}</div>
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 md:p-8">
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
    );
};


export const Home: React.FC = () => {
  const { t, language } = useLanguage();
  const { weeklyRoutine, completedActivities, toggleActivityCompletion } = useRoutine();
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
    
    // ✅ FIX: Reload insights when window regains focus (after completing a test)
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

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = daysOfWeek[new Date().getDay()];
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
    <main>
        {/* Vision Insights Dashboard */}
        <div className="bg-gradient-to-b from-gray-50 via-blue-50 to-gray-50 dark:from-gray-900/50 dark:via-blue-900/10 dark:to-gray-900/50">
            <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                 <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg dark:bg-gray-800/70 dark:shadow-2xl dark:border dark:border-gray-700">
                    {/* Fix: Call the new component using JSX syntax. */}
                    <RenderDashboardContent
                        isLoadingDashboard={isLoadingDashboard}
                        history={history}
                        dashboardInsights={dashboardInsights}
                    />
                 </div>
            </div>
        </div>

        <div className="max-w-5xl mx-auto p-6 lg:p-12">
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
                        <div className="text-center py-10 px-6 bg-gray-50 rounded-xl dark:bg-gray-800/50">
                            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">{t('rest_day_title')}</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">{t('rest_day_desc')}</p>
                        </div>
                    )}
                </div>
            </div>

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