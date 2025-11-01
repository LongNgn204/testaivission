import React, { useState } from 'react';
// Fix: Import BrainCircuit directly from lucide-react
import { RotateCcw, Check, Download, Share2, BrainCircuit } from 'lucide-react';
import { AmslerGridTestService } from '../services/amslerGridService';
import { AIService } from '../services/aiService';
import { StorageService } from '../services/storageService';
import { AmslerGridResult, AIReport, StoredTestResult } from '../types';
import { AmslerGrid } from './AmslerGrid';
import { useLanguage } from '../context/LanguageContext';
import { useRoutine } from '../context/RoutineContext';
import { usePdfExport } from '../hooks/usePdfExport';
import { ReportDisplayContent } from './ReportDisplayContent';
import { updateStreak } from '../services/reminderService';

const amslerService = new AmslerGridTestService();
const aiService = new AIService();
const storageService = new StorageService();

const Loader: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="relative flex items-center justify-center h-24 w-24 mb-6">
                <div className="absolute h-full w-full border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                <div className="absolute h-full w-full border-t-4 border-red-600 rounded-full animate-spin"></div>
                {/* Fix: Use BrainCircuit component directly */}
                <BrainCircuit className="text-red-600" size={40} />
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
                    onClick={() => exportToPdf(`amsler-grid-report-${storedResult.date.split('T')[0]}`)}
                    disabled={isExporting}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    <Download size={18}/>
                    {isExporting ? t('exporting_pdf') : t('export_pdf')}
                </button>
                {canShare && (
                     <button 
                        onClick={() => sharePdf(`amsler-grid-report-${storedResult.date.split('T')[0]}`)}
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

const TestScreen: React.FC<{ handleResult: (symptoms: string[], distortedAreas: string[]) => void; }> = ({ handleResult }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<'initial' | 'symptoms' | 'interactive'>('initial');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [distortedCells, setDistortedCells] = useState<{x: number, y: number}[]>([]);
  
  const symptomsOptions = [
      { key: 'wavy', label: t('amsler_symptom_wavy') },
      { key: 'blurry', label: t('amsler_symptom_blurry') },
      { key: 'missing', label: t('amsler_symptom_missing') },
      { key: 'distorted', label: t('amsler_symptom_distorted') },
  ];

  const toggleSymptom = (symptomKey: string) => {
      setSelectedSymptoms(prev => 
          prev.includes(symptomKey) ? prev.filter(s => s !== symptomKey) : [...prev, symptomKey]
      );
  };

  const handleCellClick = (x: number, y: number) => {
    setDistortedCells(prev => {
      if (prev.some(cell => cell.x === x && cell.y === y)) {
        return prev.filter(cell => cell.x !== x || cell.y !== y);
      }
      return [...prev, {x, y}];
    });
  };

  const finishTest = () => {
    // FIX BUG #7: Accurate quadrant mapping based on grid size (20x20 divisions)
    const GRID_SIZE = 20; // Must match AmslerGrid divisions
    const areaNames = distortedCells.map(({x, y}) => {
        // Standardize to English for the AI
        const xPos = x < GRID_SIZE / 2 ? 'left' : 'right';
        const yPos = y < GRID_SIZE / 2 ? 'top' : 'bottom';
        return `${yPos}-${xPos}`;
    });
    handleResult(selectedSymptoms, Array.from(new Set(areaNames)));
  }

  if (step === 'initial') {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto">
        <div className="mb-6 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md"><AmslerGrid isInteractive={false} /></div>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 text-center">{t('amsler_question')}</p>
        <div className="flex gap-4 w-full">
          <button onClick={() => handleResult([], [])} className="flex-1 bg-green-600 text-white p-4 rounded-lg font-semibold hover:bg-green-700">{t('amsler_option_no')}</button>
          <button onClick={() => setStep('symptoms')} className="flex-1 bg-red-600 text-white p-4 rounded-lg font-semibold hover:bg-red-700">{t('amsler_option_yes')}</button>
        </div>
      </div>
    );
  }

  if (step === 'symptoms') {
      return (
          <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">{t('amsler_symptom_question')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-6">
                  {symptomsOptions.map(opt => (
                      <button 
                          key={opt.key}
                          onClick={() => toggleSymptom(opt.key)}
                          className={`relative text-left p-4 rounded-lg border-2 transition-all duration-200 ${selectedSymptoms.includes(opt.key) ? 'bg-blue-50 border-blue-500 shadow-md dark:bg-blue-900/30 dark:border-blue-500' : 'bg-gray-50 border-gray-200 hover:border-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:border-blue-500'}`}
                      >
                          {opt.label}
                          {selectedSymptoms.includes(opt.key) && (
                              <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center">
                                  <Check size={16} />
                              </div>
                          )}
                      </button>
                  ))}
              </div>
              <button 
                  onClick={() => setStep('interactive')} 
                  disabled={selectedSymptoms.length === 0}
                  className="w-full bg-blue-600 text-white p-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
              >
                  {t('next_step')}
              </button>
          </div>
      );
  }

  if (step === 'interactive') {
      return (
        <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto">
          <div className="mb-6 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md"><AmslerGrid onCellClick={handleCellClick} distortedCells={distortedCells} isInteractive={true} /></div>
          <p className="text-lg text-gray-700 dark:text-blue-200 mb-6 text-center bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">{t('amsler_instruction_after_yes')}</p>
          <button onClick={finishTest} className="w-full bg-blue-600 text-white p-4 rounded-lg font-semibold hover:bg-blue-700">{t('finish_selection')}</button>
        </div>
      );
  }
  
  return null;
};

const StartScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => {
    const { t } = useLanguage();
    return (
        <div className="max-w-2xl text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('amsler_start_title')}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{t('amsler_start_desc')}</p>
            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-800 dark:text-red-200 p-4 mb-8 text-left rounded-r-lg">
                <h3 className="font-bold">{t('amsler_instructions_title')}</h3>
                <ul className="mt-2 list-disc list-inside">
                    <li>{t('amsler_instruction_1')}</li>
                    <li>{t('amsler_instruction_2')}</li>
                    <li>{t('amsler_instruction_3')}</li>
                    <li>{t('amsler_instruction_4')}</li>
                </ul>
            </div>
            <button onClick={onStart} className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700">{t('start_test')}</button>
        </div>
    );
};

export const AmslerGridTest: React.FC = () => {
  const { t, language } = useLanguage();
  const { markActivityAsCompleted } = useRoutine();
  const [testState, setTestState] = useState<'start' | 'testing' | 'loading' | 'report'>('start');
  const [storedResult, setStoredResult] = useState<StoredTestResult | null>(null);

  const startTest = () => {
    amslerService.startTest();
    setTestState('testing');
  };

  const handleResult = async (symptoms: string[], distortedAreas: string[]) => {
    setTestState('loading');
    const calculation = amslerService.calculateResult(distortedAreas, symptoms);

    const details = calculation.issueDetected
      ? t('amsler_distortion_details', { areas: calculation.distortedQuadrants.join(', ') || 'N/A' })
      : t('amsler_no_issue');

    const testResult: AmslerGridResult = {
      ...calculation,
      details,
    };
    
    try {
      const history = storageService.getTestHistory();
      const aiPayload = {
        issueDetected: testResult.issueDetected,
        severity: testResult.severity,
        distortedQuadrants: testResult.distortedQuadrants,
        symptoms: testResult.symptoms,
      };
      const aiReport = await aiService.generateReport('amsler', aiPayload, history, language);
      
      const newStoredResult: StoredTestResult = {
        id: aiReport.id,
        testType: 'amsler',
        date: testResult.date,
        resultData: testResult,
        report: aiReport,
      };
      setStoredResult(newStoredResult);

      storageService.saveTestResult(testResult, aiReport);
      markActivityAsCompleted('amsler');
      updateStreak('test'); // 🔥 Update streak & check badges
    } catch (err) {
      console.error(err);
    }
    setTestState('report');
  };

  const renderContent = () => {
    switch (testState) {
      case 'start':
        return <StartScreen onStart={startTest} />;
      case 'testing':
        return <TestScreen handleResult={handleResult} />;
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
