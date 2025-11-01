import React, { useState, useEffect, useRef } from 'react';
// Fix: Import BrainCircuit directly from lucide-react
import { RotateCcw, Download, Share2, BrainCircuit } from 'lucide-react';
import { ColorBlindTestService, Plate } from '../services/colorBlindService';
import { AIService } from '../services/aiService';
import { StorageService } from '../services/storageService';
import { ColorBlindResult, AIReport, StoredTestResult } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useRoutine } from '../context/RoutineContext';
import { usePdfExport } from '../hooks/usePdfExport';
import { ReportDisplayContent } from './ReportDisplayContent';
import { updateStreak } from '../services/reminderService';

const colorBlindService = new ColorBlindTestService();
const aiService = new AIService();
const storageService = new StorageService();

const IshiharaPlate: React.FC<{ text: string; plateId?: number }> = ({ text, plateId = 0 }) => {
    const plateSize = 256;
    const numDots = 800;

    // Colors simulating confusion for red-green deficiency
    const numberColors = ['#F4A460', '#ADFF2F', '#DAA520', '#FFD700']; // SandyBrown, GreenYellow, GoldenRod, Gold
    const backgroundColors = ['#8FBC8F', '#9ACD32', '#6B8E23', '#2E8B57']; // DarkSeaGreen, YellowGreen, OliveDrab, SeaGreen

    // IMPROVEMENT #3: Optimize - only regenerate dots when plateId changes, not text
    const dots = React.useMemo(() => {
        return Array.from({ length: numDots }).map((_, i) => ({
            cx: Math.random() * plateSize,
            cy: Math.random() * plateSize,
            r: Math.random() * 4 + 2,
        }));
    }, [plateId]); // Only regenerate when moving to a new plate

    return (
        <div className="w-64 h-64 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 relative overflow-hidden shadow-inner">
            <svg width={plateSize} height={plateSize} viewBox={`0 0 ${plateSize} ${plateSize}`}>
                <defs>
                    <mask id={`text-mask-${text}`}>
                        {/* White allows content to show, black hides it */}
                        <rect width={plateSize} height={plateSize} fill="black" />
                        {text !== 'nothing' && (
                            <text
                                x="50%"
                                y="50%"
                                dy="0.35em" // Vertical alignment
                                textAnchor="middle" // Horizontal alignment
                                fontSize="120"
                                fontWeight="bold"
                                fill="white"
                            >
                                {text}
                            </text>
                        )}
                    </mask>
                </defs>

                {/* Background dots (visible everywhere) */}
                <g>
                    {dots.map((dot, i) => (
                        <circle key={`bg-${i}`} cx={dot.cx} cy={dot.cy} r={dot.r} fill={backgroundColors[i % backgroundColors.length]} />
                    ))}
                </g>
                {/* Number dots (only visible where the mask is white) */}
                <g mask={`url(#text-mask-${text})`}>
                    {dots.map((dot, i) => (
                        <circle key={`num-${i}`} cx={dot.cx} cy={dot.cy} r={dot.r} fill={numberColors[i % numberColors.length]} />
                    ))}
                </g>
            </svg>
        </div>
    );
};


const Loader: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="flex flex-col items-center justify-center text-center p-8">
            <div className="relative flex items-center justify-center h-24 w-24 mb-6">
                <div className="absolute h-full w-full border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                <div className="absolute h-full w-full border-t-4 border-green-600 rounded-full animate-spin"></div>
                {/* Fix: Use BrainCircuit component directly */}
                <BrainCircuit className="text-green-600" size={40} />
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
                    onClick={() => exportToPdf(`colorblind-report-${storedResult.date.split('T')[0]}`)}
                    disabled={isExporting}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    <Download size={18}/>
                    {isExporting ? t('exporting_pdf') : t('export_pdf')}
                </button>
                {canShare && (
                    <button 
                        onClick={() => sharePdf(`colorblind-report-${storedResult.date.split('T')[0]}`)}
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

const TestScreen: React.FC<{ plates: Plate[]; currentPlate: number; handleSubmit: (answer: string) => void; }> = ({ plates, currentPlate, handleSubmit }) => {
  const { t } = useLanguage();
  const [answer, setAnswer] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentPlate]);

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(answer);
    setAnswer('');
  };

  const handleNothingClick = () => {
      handleSubmit('nothing');
      setAnswer('');
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto">
      <div className="w-full mb-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('plate')} {currentPlate + 1} / {plates.length}</p>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-green-600 rounded-full transition-all duration-300" style={{ width: `${((currentPlate + 1) / plates.length) * 100}%` }}/>
        </div>
      </div>
       <div className="mb-6"><IshiharaPlate text={plates[currentPlate].correctAnswer} plateId={plates[currentPlate].id} /></div>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">{t('colorblind_question')}</p>
      <form onSubmit={onFormSubmit} className="flex flex-col items-center gap-4 w-full max-w-xs">
          <div className="flex gap-2 w-full">
            <input
              ref={inputRef}
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value.trim())}
              className="text-center text-2xl font-bold w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
              placeholder={t('input_placeholder')}
            />
            <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700">{t('submit')}</button>
          </div>
          <button type="button" onClick={handleNothingClick} className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">{t('nothing_button')}</button>
      </form>
    </div>
  );
};

const StartScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => {
    const { t } = useLanguage();
    return (
        <div className="max-w-2xl text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('colorblind_start_title')}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{t('colorblind_start_desc')}</p>
            <div className="bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 text-green-800 dark:text-green-200 p-4 mb-8 text-left rounded-r-lg">
            <h3 className="font-bold">{t('colorblind_instructions_title')}</h3>
            <ul className="mt-2 list-disc list-inside">
                <li>{t('colorblind_instruction_1')}</li>
                <li>{t('colorblind_instruction_2')}</li>
                <li>{t('colorblind_instruction_3')}</li>
            </ul>
            </div>
            <button onClick={onStart} className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700">{t('start_test')}</button>
        </div>
    );
};

export const ColorBlindTest: React.FC = () => {
  const { t, language } = useLanguage();
  const { markActivityAsCompleted } = useRoutine();
  const [testState, setTestState] = useState<'start' | 'testing' | 'loading' | 'report'>('start');
  const [plates, setPlates] = useState<Plate[]>([]);
  const [currentPlate, setCurrentPlate] = useState(0);
  const [storedResult, setStoredResult] = useState<StoredTestResult | null>(null);

  const startTest = () => {
    setPlates(colorBlindService.startTest());
    setCurrentPlate(0);
    setTestState('testing');
  };

  const handleSubmit = async (answer: string) => {
    colorBlindService.submitAnswer(plates[currentPlate].id, answer);
    if (currentPlate < plates.length - 1) {
      setCurrentPlate(currentPlate + 1);
    } else {
      setTestState('loading');
      const testResult = colorBlindService.calculateResult();
      try {
        const history = storageService.getTestHistory();
        const aiReport = await aiService.generateReport('colorblind', testResult, history, language);
        const newStoredResult: StoredTestResult = {
            id: aiReport.id,
            testType: 'colorblind',
            date: testResult.date,
            resultData: testResult,
            report: aiReport,
        };
        setStoredResult(newStoredResult);
        storageService.saveTestResult(testResult, aiReport);
        markActivityAsCompleted('colorblind');
        updateStreak('test'); // 🔥 Update streak & check badges
      } catch (err) {
        console.error(err);
      }
      setTestState('report');
    }
  };

  const renderContent = () => {
    switch (testState) {
      case 'start':
        return <StartScreen onStart={startTest} />;
      case 'testing':
        return <TestScreen plates={plates} currentPlate={currentPlate} handleSubmit={handleSubmit} />;
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
