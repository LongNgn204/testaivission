import React, { useState } from 'react';
// Fix: Import BrainCircuit directly from lucide-react
import { RotateCcw, Download, Share2, BrainCircuit } from 'lucide-react';
import { DuochromeTestService, DuochromeUserInput } from '../services/duochromeService';
import { AIService } from '../services/aiService';
import { StorageService } from '../services/storageService';
import { DuochromeResult, AIReport, StoredTestResult } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useRoutine } from '../context/RoutineContext';
import { usePdfExport } from '../hooks/usePdfExport';
import { ReportDisplayContent } from './ReportDisplayContent';
import { updateStreak } from '../services/reminderService';

const duochromeService = new DuochromeTestService();
const aiService = new AIService();
const storageService = new StorageService();

const Loader: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="relative flex items-center justify-center h-24 w-24 mb-6">
                <div className="absolute h-full w-full border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                <div className="absolute h-full w-full border-t-4 border-yellow-500 rounded-full animate-spin"></div>
                {/* Fix: Use BrainCircuit component directly */}
                <BrainCircuit className="text-yellow-500" size={40} />
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
                    onClick={() => exportToPdf(`duochrome-report-${storedResult.date.split('T')[0]}`)}
                    disabled={isExporting}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    <Download size={18}/>
                    {isExporting ? t('exporting_pdf') : t('export_pdf')}
                </button>
                {canShare && (
                    <button 
                        onClick={() => sharePdf(`duochrome-report-${storedResult.date.split('T')[0]}`)}
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

const DuochromeChart: React.FC = () => (
    <div className="flex w-full max-w-lg h-48 rounded-lg overflow-hidden shadow-lg">
        <div className="w-1/2 bg-red-600 flex items-center justify-center">
            <span className="text-6xl font-sans font-bold text-black">E</span>
        </div>
        <div className="w-1/2 bg-green-600 flex items-center justify-center">
             <span className="text-6xl font-sans font-bold text-black">E</span>
        </div>
    </div>
);

const TestScreen: React.FC<{ 
    currentEye: 'right' | 'left';
    handleSelection: (selection: DuochromeUserInput) => void;
}> = ({ currentEye, handleSelection }) => {
  const { t } = useLanguage();

  const options = [
      { labelKey: 'duochrome_option_red', value: 'red', color: 'bg-red-500 hover:bg-red-600' },
      { labelKey: 'duochrome_option_green', value: 'green', color: 'bg-green-500 hover:bg-green-600' },
      { labelKey: 'duochrome_option_equal', value: 'equal', color: 'bg-gray-500 hover:bg-gray-600' }
  ];
  
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto">
      <div className="w-full mb-4 text-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            {t('test_step_eye', { step: currentEye === 'right' ? 1 : 2, total: 2, eye: t(currentEye === 'right' ? 'right_eye' : 'left_eye') })}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
            {t(currentEye === 'right' ? 'cover_eye_instruction_left' : 'cover_eye_instruction_right')}
        </p>
      </div>
      <div className="mb-8"><DuochromeChart /></div>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 text-center">{t('duochrome_question')}</p>
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        {options.map(opt => (
             <button key={opt.value} onClick={() => handleSelection(opt.value as DuochromeUserInput)} className={`flex-1 text-white p-4 rounded-lg font-semibold transition-colors ${opt.color}`}>
                {t(opt.labelKey as any)}
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
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('duochrome_start_title')}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{t('duochrome_start_desc')}</p>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200 p-4 mb-8 text-left rounded-r-lg">
            <h3 className="font-bold">{t('duochrome_instructions_title')}</h3>
            <ul className="mt-2 list-disc list-inside">
                <li>{t('duochrome_instruction_1')}</li>
                <li>{t('duochrome_instruction_2')}</li>
                <li>{t('duochrome_instruction_3')}</li>
            </ul>
            </div>
            <button onClick={onStart} className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700">{t('start_test')}</button>
        </div>
    );
};

export const DuochromeTest: React.FC = () => {
  const { t, language } = useLanguage();
  const { markActivityAsCompleted } = useRoutine();
  const [testState, setTestState] = useState<'start' | 'testing' | 'loading' | 'report'>('start');
  const [currentEye, setCurrentEye] = useState<'right' | 'left'>('right');
  const [rightEyeResult, setRightEyeResult] = useState<DuochromeUserInput | null>(null);

  const [storedResult, setStoredResult] = useState<StoredTestResult | null>(null);

  const startTest = () => {
    duochromeService.startTest();
    setTestState('testing');
  };

  const finishTest = async (leftEyeSelection: DuochromeUserInput) => {
    if (!rightEyeResult) return;

    setTestState('loading');
    const testResult = duochromeService.calculateResult(rightEyeResult, leftEyeSelection);

    try {
      const history = storageService.getTestHistory();
      const aiReport = await aiService.generateReport('duochrome', testResult, history, language);
      const newStoredResult: StoredTestResult = {
        id: aiReport.id,
        testType: 'duochrome',
        date: testResult.date,
        resultData: testResult,
        report: aiReport,
      };
      setStoredResult(newStoredResult);
      storageService.saveTestResult(testResult, aiReport);
      markActivityAsCompleted('duochrome');
      updateStreak('test'); // 🔥 Update streak & check badges
    } catch (err) {
      console.error(err);
    }
    setTestState('report');
  };
  
  const handleSelection = (selection: DuochromeUserInput) => {
      if (currentEye === 'right') {
          setRightEyeResult(selection);
          setCurrentEye('left');
      } else {
          finishTest(selection);
      }
  };


  const renderContent = () => {
    switch (testState) {
      case 'start':
        return <StartScreen onStart={startTest} />;
      case 'testing':
        return <TestScreen currentEye={currentEye} handleSelection={handleSelection} />;
      case 'loading':
        return <Loader />;
      case 'report':
        if (storedResult) return <TestCompleteView storedResult={storedResult} />;
        return <div className="text-center text-red-500">{t('error_report')}</div>
    }
  };

  return (
    <div className="flex items-center justify-center min-h-full p-4 sm:p-6">
      {renderContent()}
    </div>
  );
};
