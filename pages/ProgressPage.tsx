import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { TrendingUp, TrendingDown, Minus, Activity, Eye, Droplet, Palette, Grid, TestTube } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { StoredTestResult, TestType } from '../types';
import { AIService } from '../services/aiService';

const storage = new StorageService();
const aiService = new AIService();

const scoreToNumber = (score: string): number => {
  switch (score) {
    case '20/20':
      return 100;
    case '20/30':
      return 80;
    case '20/40':
      return 60;
    case '20/60':
      return 40;
    case '20/100':
      return 20;
    case 'Dưới 20/100':
    case 'Below 20/100': // Backward compatibility
      return 5;
    case '20/200':
      return 10;
    default:
      return 0;
  }
};

const SimpleLineChart: React.FC<{ points: { x: string; y: number }[] }> = ({ points }) => {
  // Simple SVG line chart
  const width = 700;
  const height = 200;
  const padding = 30;

  if (points.length === 0) return <div className="text-gray-500">No data</div>;

  const xs = points.map((_, i) => padding + (i * (width - padding * 2)) / Math.max(1, points.length - 1));
  const ys = points.map((p) => padding + (1 - p.y / 100) * (height - padding * 2));

  const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x} ${ys[i]}`).join(' ');

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
      <rect x="0" y="0" width="100%" height="100%" fill="transparent" />
      {/* grid lines */}
      {[0, 25, 50, 75, 100].map((g) => (
        <line
          key={g}
          x1={padding}
          x2={width - padding}
          y1={padding + (1 - g / 100) * (height - padding * 2)}
          y2={padding + (1 - g / 100) * (height - padding * 2)}
          stroke="#e6e6e6"
          strokeWidth={1}
        />
      ))}

      <path d={path} fill="none" stroke="#7c3aed" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

      {/* points */}
      {xs.map((x, i) => (
        <g key={i}>
          <circle cx={x} cy={ys[i]} r={3.5} fill="#7c3aed" />
        </g>
      ))}

      {/* labels */}
      {points.map((p, i) => (
        <text key={i} x={xs[i]} y={height - 4} fontSize={10} textAnchor="middle" fill="#374151">
          {new Date(p.x).toLocaleDateString()}
        </text>
      ))}
    </svg>
  );
};

export default function ProgressPage() {
  const { language } = useLanguage();
  const history: StoredTestResult[] = storage.getTestHistory();
  const [insights, setInsights] = useState<any>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Load AI insights on mount and when history changes
  useEffect(() => {
    if (history.length > 0) {
      setLoadingInsights(true);
      aiService
        .generateDashboardInsights(history, language)
        .then((data) => setInsights(data))
        .catch((err) => console.error('Failed to load insights:', err))
        .finally(() => setLoadingInsights(false));
    } else {
      setInsights(null); // Clear insights if no history
    }
  }, [history.length, language]); // ✅ FIX: Added history.length dependency

  // Snellen trend
  const snellenData = history
    .filter((h) => h.testType === 'snellen')
    .map((h) => ({ x: h.date, y: scoreToNumber((h.resultData as any).score) }))
    .reverse();

  // Counts per test type
  const counts = history.reduce<Record<TestType, number>>(
    (acc, cur) => {
      const k = cur.testType as TestType;
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    },
    { snellen: 0, colorblind: 0, astigmatism: 0, amsler: 0, duochrome: 0 }
  );

  // Amsler heatmap counts
  const amslerQuadrantCounts: Record<string, number> = { 'top-left': 0, 'top-right': 0, 'bottom-left': 0, 'bottom-right': 0 };
  history
    .filter((h) => h.testType === 'amsler')
    .forEach((h) => {
      const res: any = h.resultData;
      (res.distortedQuadrants || []).forEach((q: string) => {
        const key = q.toLowerCase();
        amslerQuadrantCounts[key] = (amslerQuadrantCounts[key] || 0) + 1;
      });
    });

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2 flex items-center justify-center gap-3">
            <TrendingUp className="w-10 h-10 text-purple-600" />
            {language === 'vi' ? 'Tiến trình & Xu hướng' : 'Progress & Trends'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">{language === 'vi' ? 'Theo dõi thị lực của bạn theo thời gian' : 'Track your vision over time'}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{language === 'vi' ? 'Xu hướng Snellen' : 'Snellen Trend'}</h2>
          </div>
          {snellenData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Eye className="w-16 h-16 text-gray-300 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">{language === 'vi' ? 'Chưa có dữ liệu Snellen. Hãy làm bài kiểm tra!' : 'No Snellen data yet. Take a test!'}</p>
            </div>
          ) : (
            <SimpleLineChart points={snellenData} />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <TestTube className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{language === 'vi' ? 'Số lần làm bài theo loại' : 'Tests by Type'}</h3>
            </div>
            <div className="flex items-end gap-4 h-40">
              {Object.entries(counts).map(([k, v]) => (
                <div key={k} className="flex-1 text-center">
                  <div className="h-full flex items-end justify-center">
                    <div style={{ height: `${Math.max(6, v * 8)}px` }} className="bg-indigo-500 w-12 rounded-t-md"></div>
                  </div>
                  <div className="text-xs mt-2 capitalize">{language === 'vi' ? k : k}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Grid className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{language === 'vi' ? 'Bản đồ nhiệt Amsler' : 'Amsler Heatmap'}</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 w-64 mx-auto">
              {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((q) => {
                const v = amslerQuadrantCounts[q] || 0;
                const intensity = Math.min(0.9, v / 5 + 0.1);
                const bg = `rgba(239, 68, 68, ${intensity})`;
                return (
                  <div key={q} className="p-6 rounded-md text-center" style={{ background: bg }}>
                    <div className="font-semibold text-white text-sm">{q}</div>
                    <div className="text-white text-2xl font-bold">{v}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* AI Insights Section */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl shadow-lg p-6 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              {language === 'vi' ? 'Phân tích AI của Eva' : "Eva's AI Analysis"}
            </h3>
          </div>

          {loadingInsights && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">{language === 'vi' ? 'Đang phân tích...' : 'Analyzing...'}</span>
            </div>
          )}

          {!loadingInsights && history.length === 0 && (
            <div className="text-center py-8">
              <TestTube className="w-16 h-16 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'vi' 
                  ? 'Chưa có dữ liệu. Hãy làm một số bài kiểm tra để xem phân tích!' 
                  : 'No data yet. Complete some tests to see your analysis!'}
              </p>
            </div>
          )}

          {!loadingInsights && insights && (
            <div className="space-y-6">
              {/* Score & Rating */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow">
                  <div className="text-4xl font-bold text-purple-600">{insights.score}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {language === 'vi' ? 'Điểm tổng quát' : 'Overall Score'}
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow">
                  <div className={`text-2xl font-bold ${
                    insights.rating === 'Xuất sắc' || insights.rating === 'Excellent' ? 'text-green-600' :
                    insights.rating === 'Tốt' || insights.rating === 'Good' ? 'text-blue-600' :
                    insights.rating === 'Trung bình' || insights.rating === 'Fair' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {insights.rating}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {language === 'vi' ? 'Xếp hạng' : 'Rating'}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow">
                  <div className="flex items-center justify-center gap-2">
                    {insights.trend === 'IMPROVING' && <TrendingUp className="w-8 h-8 text-green-600" />}
                    {insights.trend === 'STABLE' && <Minus className="w-8 h-8 text-blue-600" />}
                    {insights.trend === 'DECLINING' && <TrendingDown className="w-8 h-8 text-red-600" />}
                    <div className={`text-xl font-bold ${
                      insights.trend === 'IMPROVING' ? 'text-green-600' :
                      insights.trend === 'STABLE' ? 'text-blue-600' :
                      'text-red-600'
                    }`}>
                      {insights.trend === 'IMPROVING' ? (language === 'vi' ? 'Cải thiện' : 'Improving') :
                       insights.trend === 'STABLE' ? (language === 'vi' ? 'Ổn định' : 'Stable') :
                       (language === 'vi' ? 'Giảm sút' : 'Declining')}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {language === 'vi' ? 'Xu hướng' : 'Trend'}
                  </div>
                </div>
              </div>

              {/* Positives */}
              {insights.positives && insights.positives.length > 0 && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    {language === 'vi' ? 'Điểm mạnh' : 'Strengths'}
                  </h4>
                  <ul className="space-y-1">
                    {insights.positives.map((p: string, i: number) => (
                      <li key={i} className="text-green-700 dark:text-green-400 text-sm flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Areas to Monitor */}
              {insights.areasToMonitor && insights.areasToMonitor.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2 flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    {language === 'vi' ? 'Cần theo dõi' : 'Monitor Closely'}
                  </h4>
                  <ul className="space-y-1">
                    {insights.areasToMonitor.map((a: string, i: number) => (
                      <li key={i} className="text-yellow-700 dark:text-yellow-400 text-sm flex items-start gap-2">
                        <span className="text-yellow-600 mt-0.5">⚠</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Pro Tip */}
              {insights.proTip && (
                <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-4 border-l-4 border-purple-600">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">
                    💡 {language === 'vi' ? 'Mẹo từ Eva' : "Eva's Pro Tip"}
                  </h4>
                  <p className="text-purple-700 dark:text-purple-400 text-sm">{insights.proTip}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
