import React, { useState } from 'react';
// Fix: Import BrainCircuit directly from lucide-react
import { ArrowUp, ArrowRight, ArrowDown, ArrowLeft, RotateCcw, Download, Share2, BrainCircuit } from 'lucide-react';
import { SnellenTestService, levels } from '../services/snellenService';
import { AIService } from '../services/aiService';
import { StorageService } from '../services/storageService';
import { SnellenResult, AIReport, StoredTestResult } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useRoutine } from '../context/RoutineContext';
import { usePdfExport } from '../hooks/usePdfExport';
import { ReportDisplayContent } from './ReportDisplayContent';
import { updateStreak } from '../services/reminderService';

const snellenService = new SnellenTestService();
const aiService = new AIService();
const storageService = new StorageService();

interface SnellenQuestion {
  level: number;
  size: number;
  rotation: 0 | 90 | 180 | 270;
}

const Loader: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="relative flex items-center justify-center h-24 w-24 mb-6">
                <div className="absolute h-full w-full border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                <div className="absolute h-full w-full border-t-4 border-blue-600 rounded-full animate-spin"></div>
                {/* Fix: Use BrainCircuit component directly */}
                <BrainCircuit className="text-blue-600" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">{t('loading_title')}</h2>
            <p className="text-gray-600 dark:text-gray-400">{t('loading_subtitle')}</p>
        </div>
    );
};

const TestCompleteView: React.FC<{ storedResult: StoredTestResult }> = ({ storedResult }) => {
    const { t } = useLanguage();
    const { reportRef, exportToPdf, isExporting, sharePdf, isSharing } = usePdfExport();
    const canShare = navigator.share;

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div ref={reportRef}>
                <ReportDisplayContent storedResult={storedResult} />
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button onClick={() => window.location.reload()} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"><RotateCcw size={18}/>{t('redo_test')}</button>
                <button 
                    onClick={() => exportToPdf(`snellen-report-${storedResult.date.split('T')[0]}`)}
                    disabled={isExporting}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    <Download size={18}/>
                    {isExporting ? t('exporting_pdf') : t('export_pdf')}
                </button>
                 {canShare && (
                    <button 
                        onClick={() => sharePdf(`snellen-report-${storedResult.date.split('T')[0]}`)}
                        disabled={isSharing}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        <Share2 size={18}/>
                        {isSharing ? t('sharing_pdf') : t('share_report')}
                    </button>
                )}
            </div>
        </div>
    );
};

const TestScreen: React.FC<{ question: SnellenQuestion; handleAnswer: (rotation: number) => void; }> = ({ question, handleAnswer }) => {
  const { t } = useLanguage();
  const scoreBeingTested = levels[question.level]?.score || '';

  // FIX BUG #11: Correct rotation mapping for CSS transform
  // CSS rotation: 0°=right, 90°=down, 180°=left, 270°=up
  const directionButtons = [
      { Icon: ArrowRight, labelKey: 'direction_right', rotation: 0 },    // E opens RIGHT → 0°
      { Icon: ArrowDown, labelKey: 'direction_down', rotation: 90 },     // E opens DOWN → 90°
      { Icon: ArrowLeft, labelKey: 'direction_left', rotation: 180 },    // E opens LEFT → 180°
      { Icon: ArrowUp, labelKey: 'direction_up', rotation: 270 }         // E opens UP → 270°
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto">
      <div className="w-full mb-8 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('testing_label')}: <span className="font-bold">{scoreBeingTested}</span></p>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${((question.level + 1) / levels.length) * 100}%` }}/>
        </div>
      </div>
      <div className="flex items-center justify-center w-full h-48 mb-12">
        <div className="text-9xl font-bold text-gray-600 dark:text-gray-400 transition-all duration-300" style={{ fontSize: `${question.size}px`, transform: `rotate(${question.rotation}deg)`, opacity: 0.75 }}>E</div>
      </div>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">{t('snellen_question')}</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {directionButtons.map(({ Icon, labelKey, rotation }) => (
          <button key={rotation} onClick={() => handleAnswer(rotation)} className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 h-20 hover:border-blue-600 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all transform hover:scale-105">
            <Icon size={24} /><span className="font-semibold">{t(labelKey as any)}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const StartScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => {
    const { t } = useLanguage();
    return (
        <div className="max-w-2xl text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('snellen_start_title')}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{t('snellen_start_desc')}</p>
            <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 text-blue-800 dark:text-blue-200 p-4 mb-8 text-left rounded-r-lg">
            <h3 className="font-bold">{t('snellen_instructions_title')}</h3>
            <ul className="mt-2 list-disc list-inside">
                <li>{t('snellen_instruction_1')}</li>
                <li>{t('snellen_instruction_2')}</li>
                <li>{t('snellen_instruction_3')}</li>
            </ul>
            </div>
            <button onClick={onStart} className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg">{t('start_test')}</button>
        </div>
    );
};

export const SnellenTest: React.FC = () => {
  const { t, language } = useLanguage();
  const { markActivityAsCompleted } = useRoutine();
  const [testState, setTestState] = useState<'start' | 'testing' | 'loading' | 'report'>('start');
  const [currentQuestion, setCurrentQuestion] = useState<SnellenQuestion | null>(null);
  const [storedResult, setStoredResult] = useState<StoredTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startTest = () => {
    snellenService.startTest();
    const firstQuestion = snellenService.getNextQuestion();
    if (firstQuestion) {
        setCurrentQuestion(firstQuestion);
        setTestState('testing');
    } else {
        finishTest();
    }
  };

  const finishTest = async () => {
    setTestState('loading');
    const testResult = snellenService.calculateResult();
    try {
      const history = storageService.getTestHistory();
      const aiReport = await aiService.generateReport('snellen', testResult, history, language);
      
      const newStoredResult: StoredTestResult = {
        id: aiReport.id,
        testType: 'snellen',
        date: testResult.date,
        resultData: testResult,
        report: aiReport,
      };
      
      storageService.saveTestResult(testResult, aiReport);
      setStoredResult(newStoredResult);
      markActivityAsCompleted('snellen');
      updateStreak('test'); // 🔥 Update streak & check badges
      setTestState('report');
    } catch (err) {
      setError(t('error_report'));
      console.error('Snellen Test Error:', err);
      // Still set a basic result even if AI fails
      const fallbackResult: StoredTestResult = {
        id: Date.now().toString(),
        testType: 'snellen',
        date: testResult.date,
        resultData: testResult,
        report: {
          id: Date.now().toString(),
          testType: 'snellen',
          timestamp: new Date().toISOString(),
          totalResponseTime: 0,
          confidence: 0,
          summary: t('error_report'),
          recommendations: [],
          severity: 'MEDIUM',
        }
      };
      setStoredResult(fallbackResult);
      setTestState('report'); 
    }
  }

  const handleAnswer = (rotation: number) => {
    snellenService.submitAnswer(rotation);
    const nextQuestion = snellenService.getNextQuestion();
    if (nextQuestion) {
      setCurrentQuestion(nextQuestion);
    } else {
      finishTest();
    }
  };

  const renderContent = () => {
    switch (testState) {
      case 'start':
        return <StartScreen onStart={startTest} />;
      case 'testing':
        if (currentQuestion) {
          return <TestScreen question={currentQuestion} handleAnswer={handleAnswer} />;
        }
        return <Loader />;
      case 'loading':
        return <Loader />;
      case 'report':
        if (storedResult) return <TestCompleteView storedResult={storedResult} />;
        if (error) return <div className="text-center text-red-500">{error}<br/><button onClick={() => window.location.reload()} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">{t('try_again')}</button></div>
        return <div className="text-center text-red-500">An unexpected error occurred.</div>
    }
  };

  return (
    <div className="flex items-center justify-center min-h-full p-4 sm:p-6">
      {renderContent()}
    </div>
  );
};
