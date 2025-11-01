import React from 'react';
import { 
    CheckCircle, AlertTriangle, Activity, BrainCircuit, TrendingUp, Scale, AlertOctagon, Zap 
} from 'lucide-react';
import { 
    StoredTestResult, SnellenResult, ColorBlindResult, AstigmatismResult, AmslerGridResult, DuochromeResult 
} from '../types';
import { useLanguage } from '../context/LanguageContext';

const ReportHeader: React.FC<{ storedResult: StoredTestResult }> = ({ storedResult }) => {
    const { t } = useLanguage();
    const { testType, resultData, report } = storedResult;
    const severityStyles = {
        LOW: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        HIGH: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    };

    const renderSnellen = (result: SnellenResult) => (
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">{t('test_result')}</h3>
            <p className="text-5xl font-bold text-blue-600 dark:text-blue-400">{result.score}</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div><p className="font-bold text-lg dark:text-gray-200">{result.correctAnswers}/{result.totalQuestions}</p><p className="text-xs text-gray-500 dark:text-gray-400">{t('correct')}</p></div>
                <div><p className="font-bold text-lg dark:text-gray-200">{result.accuracy}%</p><p className="text-xs text-gray-500 dark:text-gray-400">{t('accuracy')}</p></div>
                <div><p className="font-bold text-lg dark:text-gray-200">{result.duration}s</p><p className="text-xs text-gray-500 dark:text-gray-400">{t('duration')}</p></div>
            </div>
        </div>
    );
    
    const renderColorblind = (result: ColorBlindResult) => (
         <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">{t('test_result')}</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{result.type}</p>
             <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div><p className="font-bold text-lg dark:text-gray-200">{result.correct}/{result.total}</p><p className="text-xs text-gray-500 dark:text-gray-400">{t('correct')}</p></div>
                <div><p className="font-bold text-lg dark:text-gray-200">{result.accuracy}%</p><p className="text-xs text-gray-500 dark:text-gray-400">{t('accuracy')}</p></div>
                <div><p className="font-bold text-lg dark:text-gray-200">{result.duration}s</p><p className="text-xs text-gray-500 dark:text-gray-400">{t('duration')}</p></div>
            </div>
        </div>
    );

    const renderAstigmatism = (result: AstigmatismResult) => {
        const hasAstigmatism = result.overallSeverity !== 'NONE';
        return (
            <div className={`col-span-full text-center rounded-xl p-6 ${hasAstigmatism ? 'bg-purple-50 dark:bg-purple-900/30' : 'bg-green-50 dark:bg-green-900/30'}`}>
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">{t('test_result')}</h3>
                <p className={`text-3xl font-bold ${hasAstigmatism ? 'text-purple-700 dark:text-purple-300' : 'text-green-700 dark:text-green-300'}`}>
                    {hasAstigmatism ? t('astigmatism_detected') : t('astigmatism_not_detected')}
                </p>
            </div>
        );
    };

    const renderAmsler = (result: AmslerGridResult) => (
        <div className={`col-span-full text-center rounded-xl p-6 ${result.issueDetected ? 'bg-red-50 dark:bg-red-900/30' : 'bg-green-50 dark:bg-green-900/30'}`}>
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">{t('test_result')}</h3>
            <p className={`text-3xl font-bold ${result.issueDetected ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}`}>
                {result.issueDetected ? t('amsler_issue_detected') : t('amsler_no_issue')}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{result.details}</p>
        </div>
    );
    
    const renderDuochrome = (result: DuochromeResult) => {
         const resultTextMap = { myopic: t('duochrome_myopic'), hyperopic: t('duochrome_hyperopic'), normal: t('duochrome_normal'), mixed: t('duochrome_mixed_short') };
         const resultColorMap = {
            myopic: 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30',
            hyperopic: 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30',
            normal: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30',
            mixed: 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30',
         };
         return (
            <div className={`col-span-full text-center rounded-xl p-6 ${resultColorMap[result.overallResult]}`}>
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">{t('test_result')}</h3>
                <p className="text-3xl font-bold">{resultTextMap[result.overallResult]}</p>
            </div>
        );
    };

    const renderResult = () => {
        switch (testType) {
            case 'snellen': return renderSnellen(resultData as SnellenResult);
            case 'colorblind': return renderColorblind(resultData as ColorBlindResult);
            case 'astigmatism': return renderAstigmatism(resultData as AstigmatismResult);
            case 'amsler': return renderAmsler(resultData as AmslerGridResult);
            case 'duochrome': return renderDuochrome(resultData as DuochromeResult);
            default: return null;
        }
    };
    
    const hasDetailedResult = testType === 'snellen' || testType === 'colorblind';

    return (
        <div className={`grid grid-cols-1 ${hasDetailedResult ? 'md:grid-cols-2' : ''} gap-6 mb-6`}>
            {renderResult()}
            {hasDetailedResult && (
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
                     <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">{t('ai_confidence')}</h3>
                    <p className={`text-5xl font-bold ${report.confidence >= 90 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>{report.confidence}%</p>
                    <div className="mt-4 flex items-center justify-center gap-2">
                        <div className={`px-3 py-1 text-xs font-semibold rounded-full ${severityStyles[report.severity]}`}>{t('severity')}: {t(`severity_${report.severity.toLowerCase()}` as any)}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const ReportDisplayContent: React.FC<{ storedResult: StoredTestResult }> = ({ storedResult }) => {
    const { t } = useLanguage();
    const { report } = storedResult;

    const ICONS: Record<string, { icon: React.ElementType; color: string }> = {
        general_assessment: { icon: Activity, color: "blue" },
        potential_causes: { icon: AlertTriangle, color: "yellow" },
        recommendations: { icon: CheckCircle, color: "green" },
        trend_analysis: { icon: TrendingUp, color: "indigo" },
        snellen: { icon: Activity, color: "blue" },
        colorblind: { icon: Activity, color: "blue" },
        astigmatism: { icon: Zap, color: "blue" },
        amsler: { icon: AlertOctagon, color: "blue" },
        duochrome: { icon: Scale, color: "blue" },
    };

    const mainIcon = ICONS[report.testType];

    const reportTitles: Record<string, string> = {
        snellen: t('report_title_snellen'),
        colorblind: t('report_title_colorblind'),
        astigmatism: t('report_title_astigmatism'),
        amsler: t('report_title_amsler'),
        duochrome: t('report_title_duochrome'),
    };
    
    return (
         <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl animate-fade-in">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">{reportTitles[report.testType]}</h2>
            
            <ReportHeader storedResult={storedResult} />

            <div className="space-y-6">
                <div><h4 className="font-bold text-lg mb-2 flex items-center dark:text-gray-200"><mainIcon.icon className={`mr-2 text-${mainIcon.color}-500`}/>{t('general_assessment')}</h4><p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">{report.summary}</p></div>
                {report.trend && (
                    <div><h4 className="font-bold text-lg mb-2 flex items-center dark:text-gray-200"><TrendingUp className="mr-2 text-indigo-500"/>{t('trend_analysis')}</h4><p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg">{report.trend}</p></div>
                )}
                {report.causes && <div><h4 className="font-bold text-lg mb-2 flex items-center dark:text-gray-200"><AlertTriangle className="mr-2 text-yellow-500"/>{t('potential_causes')}</h4><p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">{report.causes}</p></div>}
                <div>
                    <h4 className="font-bold text-lg mb-2 flex items-center dark:text-gray-200"><CheckCircle className="mr-2 text-green-500"/>{t('recommendations')}</h4>
                    <ul className="space-y-2 list-inside text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                        {report.recommendations.map((rec, i) => <li key={i} className="flex"><span className="text-green-600 dark:text-green-400 mr-2 font-bold">✓</span>{rec}</li>)}
                    </ul>
                </div>
            </div>
        </div>
    );
};
