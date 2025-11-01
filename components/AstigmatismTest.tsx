import React, { useState } from 'react';
// Fix: Import BrainCircuit directly from lucide-react
import { RotateCcw, Check, Download, Share2, BrainCircuit } from 'lucide-react';
import { AstigmatismTestService } from '../services/astigmatismService';
import { AIService } from '../services/aiService';
import { StorageService } from '../services/storageService';
import { AstigmatismUserInput, AstigmatismResult, AIReport, StoredTestResult } from '../types';
import { AstigmatismWheel } from './AstigmatismWheel';
import { useLanguage } from '../context/LanguageContext';
import { useRoutine } from '../context/RoutineContext';
import { usePdfExport } from '../hooks/usePdfExport';
import { ReportDisplayContent } from './ReportDisplayContent';
import { updateStreak } from '../services/reminderService';

const astigmatismService = new AstigmatismTestService();
const aiService = new AIService();
const storageService = new StorageService();

const Loader: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="relative flex items-center justify-center h-24 w-24 mb-6">
                <div className="absolute h-full w-full border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                <div className="absolute h-full w-full border-t-4 border-purple-600 rounded-full animate-spin"></div>
                {/* Fix: Use BrainCircuit component directly */}
                <BrainCircuit className="text-purple-600" size={40} />
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
                    onClick={() => exportToPdf(`astigmatism-report-${storedResult.date.split('T')[0]}`)}
                    disabled={isExporting}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    <Download size={18}/>
                    {isExporting ? t('exporting_pdf') : t('export_pdf')}
                </button>
                {canShare && (
                    <button 
                        onClick={() => sharePdf(`astigmatism-report-${storedResult.date.split('T')[0]}`)}
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

const TestScreen: React.FC<{ 
    currentEye: 'right' | 'left';
    handleSelection: (selection: AstigmatismUserInput) => void;
}> = ({ currentEye, handleSelection }) => {
  const { t } = useLanguage();

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
      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-full shadow-md"><AstigmatismWheel /></div>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 text-center">{t('astigmatism_question')}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <button onClick={() => handleSelection('none')} className="flex items-center justify-center gap-2 bg-green-100 text-green-800 border-2 border-green-200 rounded-lg p-4 h-20 hover:border-green-600 transition-all font-semibold dark:bg-green-900/50 dark:text-green-300 dark:border-green-800 dark:hover:border-green-600"><Check size={24}/>{t('astigmatism_option_all_sharp')}</button>
        <button onClick={() => handleSelection('vertical')} className="flex items-center justify-center gap-2 bg-white border-2 border-gray-300 rounded-lg p-4 h-20 hover:border-purple-600 hover:bg-purple-50 transition-all dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:border-purple-500 dark:hover:bg-purple-900/30"><span className="font-bold text-lg">|</span>{t('astigmatism_option_vertical')}</button>
        <button onClick={() => handleSelection('horizontal')} className="flex items-center justify-center gap-2 bg-white border-2 border-gray-300 rounded-lg p-4 h-20 hover:border-purple-600 hover:bg-purple-50 transition-all dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:border-purple-500 dark:hover:bg-purple-900/30"><span className="font-bold text-lg">─</span>{t('astigmatism_option_horizontal')}</button>
        <button onClick={() => handleSelection('oblique')} className="flex items-center justify-center gap-2 bg-white border-2 border-gray-300 rounded-lg p-4 h-20 hover:border-purple-600 hover:bg-purple-50 transition-all dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:border-purple-500 dark:hover:bg-purple-900/30"><span className="font-bold text-lg">/</span>{t('astigmatism_option_oblique')}</button>
      </div>
    </div>
  );
};

const StartScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => {
    const { t } = useLanguage();
    return (
        <div className="max-w-2xl text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('astigmatism_start_title')}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{t('astigmatism_start_desc')}</p>
            <div className="bg-purple-50 dark:bg-purple-900/30 border-l-4 border-purple-500 text-purple-800 dark:text-purple-200 p-4 mb-8 text-left rounded-r-lg">
            <h3 className="font-bold">{t('astigmatism_instructions_title')}</h3>
            <ul className="mt-2 list-disc list-inside">
                <li>{t('astigmatism_instruction_1')}</li>
                <li>{t('astigmatism_instruction_2')}</li>
                <li>{t('astigmatism_instruction_3')}</li>
                <li>{t('astigmatism_instruction_4')}</li>
            </ul>
            </div>
            <button onClick={onStart} className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700">{t('start_test')}</button>
        </div>
    );
};

export const AstigmatismTest: React.FC = () => {
  const { t, language } = useLanguage();
  const { markActivityAsCompleted } = useRoutine();
  const [testState, setTestState] = useState<'start' | 'testing' | 'loading' | 'report'>('start');
  const [currentEye, setCurrentEye] = useState<'right' | 'left'>('right');
  const [rightEyeResult, setRightEyeResult] = useState<AstigmatismUserInput | null>(null);
  
  const [storedResult, setStoredResult] = useState<StoredTestResult | null>(null);

  const startTest = () => {
    astigmatismService.startTest();
    setTestState('testing');
  };

  const finishTest = async (leftEyeSelection: AstigmatismUserInput) => {
    if (!rightEyeResult) return; // Should not happen

    setTestState('loading');
    const testResult = astigmatismService.calculateResult(rightEyeResult, leftEyeSelection);

    try {
      const history = storageService.getTestHistory();
      const aiReport = await aiService.generateReport('astigmatism', testResult, history, language);
      const newStoredResult: StoredTestResult = {
        id: aiReport.id,
        testType: 'astigmatism',
        date: testResult.date,
        resultData: testResult,
        report: aiReport,
      };
      setStoredResult(newStoredResult);
      storageService.saveTestResult(testResult, aiReport);
      markActivityAsCompleted('astigmatism');
      updateStreak('test'); // 🔥 Update streak & check badges
    } catch (err) {
      console.error(err);
    }
    setTestState('report');
  };

  const handleSelection = (selection: AstigmatismUserInput) => {
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
