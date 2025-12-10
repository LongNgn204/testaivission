import React, { useState, useEffect, useCallback } from 'react';
import { Eye, Droplets, Target, Grid, CircleDot, Trash2, Calendar, FileText } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { StoredTestResult, TestType, SnellenResult, ColorBlindResult, AstigmatismResult, AmslerGridResult, DuochromeResult, AIReport } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { ReportDetailModal } from '../components/ReportDetailModal';
import { getTestHistory } from '../services/authService';

const storageService = new StorageService();

const ICONS: Record<TestType, React.ElementType> = {
  snellen: Eye,
  colorblind: Droplets,
  astigmatism: Target,
  amsler: Grid,
  duochrome: CircleDot,
};

const ResultSummary: React.FC<{ result: StoredTestResult }> = ({ result }) => {
  const { t } = useLanguage();
  const data = result.resultData;
  switch (result.testType) {
    case 'snellen': {
      const snellenData = data as SnellenResult;
      return <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{snellenData.score}</p>;
    }
    case 'colorblind': {
      const colorBlindData = data as ColorBlindResult;
      return <p className="text-2xl font-bold text-green-600 dark:text-green-400">{colorBlindData.accuracy}%</p>;
    }
    case 'astigmatism': {
      const astigData = data as AstigmatismResult;
      const hasAstigmatism = astigData.overallSeverity !== 'NONE';
      return <p className={`text-xl font-bold ${hasAstigmatism ? 'text-purple-600 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300'}`}>{hasAstigmatism ? t('astigmatism_detected_short') : t('astigmatism_normal_short')}</p>;
    }
    case 'amsler': {
      const amslerData = data as AmslerGridResult;
      return <p className={`text-xl font-bold ${amslerData.issueDetected ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>{amslerData.issueDetected ? t('amsler_issue_short') : t('amsler_normal_short')}</p>;
    }
    case 'duochrome': {
      const duochromeData = data as DuochromeResult;
      const textMap: Record<DuochromeResult['overallResult'], string> = {
        normal: t('astigmatism_normal_short'),
        myopic: t('duochrome_myopic_short'),
        hyperopic: t('duochrome_hyperopic_short'),
        mixed: t('duochrome_mixed_short')
      };
      return <p className={`text-xl font-bold text-yellow-700 dark:text-yellow-400`}>{textMap[duochromeData.overallResult]}</p>;
    }
    default:
      return null;
  }
}

export const History: React.FC = () => {
  const [history, setHistory] = useState<StoredTestResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<StoredTestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number | undefined>(undefined);
  const [limit] = useState<number>(10);
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  const { t, language } = useLanguage();

  const TITLES: Record<TestType, string> = {
    snellen: t('snellen_test'),
    colorblind: t('colorblind_test'),
    astigmatism: t('astigmatism_test'),
    amsler: t('amsler_grid_test'),
    duochrome: t('duochrome_test'),
  };

  // Get localStorage history once for report lookup
  const localHistory = React.useMemo(() => storageService.getTestHistory(), []);

  // Find matching report from localStorage by comparing testType and date
  const findLocalReport = useCallback((testType: string, timestamp: number): AIReport | null => {
    // Find a local item with same testType and similar timestamp (within 5 minutes)
    const matchingItem = localHistory.find(item => {
      const localTs = new Date(item.date).getTime();
      const backendTs = timestamp;
      const timeDiff = Math.abs(localTs - backendTs);
      return item.testType === testType && timeDiff < 5 * 60 * 1000; // 5 minutes tolerance
    });
    return matchingItem?.report || null;
  }, [localHistory]);

  // Map backend record to StoredTestResult, try to find report from localStorage
  const mapBackendToStored = useCallback((item: any): StoredTestResult => {
    const ts = item.timestamp || Date.now();
    const testType = item.testType as TestType;

    // Try to find the report from localStorage
    const localReport = findLocalReport(testType, ts);

    // Use local report if available, otherwise create fallback
    const report: AIReport = localReport || {
      id: `report_${item.id}`,
      testType: testType,
      timestamp: new Date(ts).toISOString(),
      totalResponseTime: 0,
      confidence: 0,
      summary: language === 'vi'
        ? 'Báo cáo AI không có sẵn cho bản ghi này. Vui lòng làm lại bài test để nhận phân tích đầy đủ.'
        : 'AI report not available for this record. Please retake the test for full analysis.',
      recommendations: [],
      severity: 'LOW',
    };

    return {
      id: item.id,
      testType: testType,
      date: new Date(ts).toISOString(),
      resultData: item.testData,
      report: report,
    };
  }, [findLocalReport, language]);

  const loadPage = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    setError(null);
    try {
      // First try: Use localStorage directly if available (has full report data)
      if (offset === 0 && localHistory.length > 0) {
        // Use localStorage which has complete report data
        setHistory(localHistory);
        setTotal(localHistory.length);
        setHasMore(false);
        setIsLoading(false);
        return;
      }

      // Fallback: Try backend API
      const res = await getTestHistory('', limit, offset);
      if (!res.success) {
        // Fallback to local if backend not available
        const local = storageService.getTestHistory();
        setHistory(local);
        setHasMore(false);
        setTotal(local.length);
        return;
      }
      const mapped = (res.history || []).map(mapBackendToStored);
      setHistory(prev => [...prev, ...mapped]);
      const newTotal = res.total ?? (prev => prev + mapped.length);
      setTotal(typeof newTotal === 'number' ? newTotal : (total ?? 0));
      const nextOffset = offset + (res.limit ?? limit);
      setOffset(nextOffset);
      setHasMore(mapped.length > 0 && (res.total === undefined || nextOffset < (res.total as number)));
    } catch (e: any) {
      setError(e?.message || 'Failed to load history');
      // Fallback local once
      const local = storageService.getTestHistory();
      if (local.length && history.length === 0) {
        setHistory(local);
        setHasMore(false);
        setTotal(local.length);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, limit, offset, mapBackendToStored, history.length, total, localHistory]);

  useEffect(() => {
    // initial load
    loadPage();
  }, []);

  useEffect(() => {
    // infinite scroll via IntersectionObserver
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadPage();
        }
      });
    }, { rootMargin: '200px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadPage]);

  const handleClearHistory = () => {
    if (window.confirm(t('confirm_clear_history'))) {
      storageService.clearHistory();
      setHistory([]);
      setTotal(0);
      setHasMore(false);
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto p-6 lg:p-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-200">{t('history_title')}</h1>
          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
            >
              <Trash2 size={18} />
              {t('clear_all')}
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        <div className="flex items-center justify-between mb-4 text-sm text-gray-500 dark:text-gray-400">
          <span>{language === 'vi' ? 'Đã tải' : 'Loaded'}: {history.length}{typeof total === 'number' ? ` / ${total}` : ''}</span>
          <span>{language === 'vi' ? 'Trang' : 'Offset'}: {offset}</span>
        </div>

        {history.length === 0 && !isLoading ? (
          <div className="text-center py-20 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">{t('history_empty_title')}</h2>
            <p className="text-gray-500 dark:text-gray-400">{t('history_empty_desc')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {history.map((item) => {
              const Icon = ICONS[item.testType as TestType] || Eye;
              return (
                <div key={item.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transition-all hover:shadow-lg dark:border dark:border-gray-700/50 dark:hover:border-blue-500">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4 flex-grow">
                      <Icon className="text-gray-500 dark:text-gray-400 flex-shrink-0" size={32} />
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{TITLES[item.testType]}</h3>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <Calendar size={14} className="mr-2" />
                          {new Date(item.date).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}
                        </div>
                      </div>
                    </div>
                    <div className="text-left sm:text-right flex-shrink-0 w-full sm:w-auto">
                      <ResultSummary result={item} />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start gap-4">
                    <p className="text-gray-600 dark:text-gray-300 text-sm flex-grow"><span className="font-semibold">{t('ai_assessment')}:</span> {item.report.summary}</p>
                    <button
                      onClick={() => setSelectedResult(item)}
                      className="flex-shrink-0 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                      {t('view_details')}
                    </button>
                  </div>
                </div>
              );
            })}
            <div ref={sentinelRef} className="h-8" />
            {isLoading && (
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">{language === 'vi' ? 'Đang tải...' : 'Loading...'}</div>
            )}
            {!hasMore && total !== undefined && (
              <div className="text-center text-xs text-gray-400">{language === 'vi' ? 'Đã tải toàn bộ lịch sử' : 'All history loaded'}</div>
            )}
          </div>
        )}
      </div>
      {selectedResult && (
        <ReportDetailModal
          storedResult={selectedResult}
          onClose={() => setSelectedResult(null)}
        />
      )}
    </>
  );
};
