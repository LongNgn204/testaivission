import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Activity, Eye, Grid, Minus, RefreshCcw, Sparkles, TestTube, TrendingDown, TrendingUp } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { StoredTestResult, TestType } from '../types';
import { useDashboardInsights } from '../hooks/useDashboardInsights';
import { GlassCard, StatPill, EmptyState as UiEmptyState } from '../components/ui/GlassCard';
import { SkeletonBlock } from '../components/ui/GlassCard';

// Chuyển thang Snellen (chuỗi) sang điểm số để vẽ biểu đồ
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

// Wrapper nhỏ giúp tái sử dụng EmptyState chuẩn
const EmptyState: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <UiEmptyState title={title} description={description} />
);

// Biểu đồ đường đơn giản để hiển thị xu hướng Snellen
const SimpleLineChart: React.FC<{ points: { x: string; y: number }[] }> = ({ points }) => {
  const width = 700;
  const height = 220;
  const padding = 30;

  if (points.length === 0) {
    return <div className="text-center text-text-sub text-sm py-6">No data</div>;
  }

  const xs = points.map((_, i) => padding + (i * (width - padding * 2)) / Math.max(1, points.length - 1));
  const ys = points.map((p) => padding + (1 - p.y / 100) * (height - padding * 2));
  const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x} ${ys[i]}`).join(' ');

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
      {[0, 25, 50, 75, 100].map((g) => (
        <line
          key={g}
          x1={padding}
          x2={width - padding}
          y1={padding + (1 - g / 100) * (height - padding * 2)}
          y2={padding + (1 - g / 100) * (height - padding * 2)}
          stroke="#E2E8F0"
          strokeDasharray="4"
        />
      ))}
      <path d={path} fill="none" stroke="#4C6EF5" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      {xs.map((x, i) => (
        <circle key={i} cx={x} cy={ys[i]} r={5} fill="#22B8CF" stroke="#fff" strokeWidth={2} />
      ))}
      {points.map((p, i) => (
        <text key={i} x={xs[i]} y={height - 4} fontSize={11} textAnchor="middle" fill="#475569">
          {new Date(p.x).toLocaleDateString()}
        </text>
      ))}
    </svg>
  );
};

export default function ProgressPage() {
  const { language } = useLanguage();
  const VALID_TYPES: TestType[] = ['snellen','colorblind','astigmatism','amsler','duochrome'];
  const isValidType = (t: any): t is TestType => VALID_TYPES.includes(t as TestType);
  const [history, setHistory] = useState<StoredTestResult[]>([]);
  const storage = useMemo(() => new StorageService(), []);

  const loadHistory = useCallback(() => {
    setHistory(storage.getTestHistory());
  }, [storage]);

  useEffect(() => {
    loadHistory();
    const handleFocus = () => loadHistory();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadHistory]);

  const { insights, isLoading, error, refresh } = useDashboardInsights(history, language);

  const snellenData = history
    .filter((h) => h.testType === 'snellen')
    .map((h) => {
      const score = (h?.resultData as any)?.score ?? '20/20';
      return { x: h.date, y: scoreToNumber(String(score)) };
    })
    .reverse();

  const counts = history.reduce<Record<TestType, number>>(
    (acc, cur) => {
      const k = cur?.testType;
      if (!isValidType(k)) return acc; // ignore invalid/unknown types
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    },
    { snellen: 0, colorblind: 0, astigmatism: 0, amsler: 0, duochrome: 0 }
  );

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

  const totalTests = history.length;
  const uniqueDays = useMemo(() => {
    const dates = new Set(history.map((item) => new Date(item.date).toDateString()));
    return dates.size;
  }, [history]);

  const trendLabel = () => {
    switch (insights?.trend) {
      case 'IMPROVING':
        return language === 'vi' ? 'Đang cải thiện' : 'Improving';
      case 'STABLE':
        return language === 'vi' ? 'Ổn định' : 'Stable';
      case 'DECLINING':
        return language === 'vi' ? 'Có dấu hiệu giảm' : 'Declining';
      default:
        return language === 'vi' ? 'Cần thêm dữ liệu' : 'Need more data';
    }
  };

  const testLabel = (type: TestType) => {
    const map: Record<TestType, { vi: string; en: string }> = {
      snellen: { vi: 'Snellen', en: 'Snellen' },
      colorblind: { vi: 'Mù màu', en: 'Colorblind' },
      astigmatism: { vi: 'Loạn thị', en: 'Astigmatism' },
      amsler: { vi: 'Amsler', en: 'Amsler' },
      duochrome: { vi: 'Duochrome', en: 'Duochrome' },
    };
    const entry = map[type as TestType];
    if (!entry) return language === 'vi' ? 'Không xác định' : 'Unknown';
    return language === 'vi' ? entry.vi : entry.en;
  };

  return (
    <div className="min-h-screen bg-app-gradient dark:bg-background-dark">
      <div className="page-shell space-y-8">
        <section className="page-hero">
          <div className="flex flex-col gap-4">
            <div className="chip w-fit">
              <Sparkles className="w-4 h-4" />
              {language === 'vi' ? 'Trung tâm thị lực' : 'Vision hub'}
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-text-main dark:text-text-dark">
                {language === 'vi' ? 'Tiến trình & Xu hướng' : 'Progress & Trends'}
              </h1>
              <p className="text-text-sub dark:text-slate-300">
                {language === 'vi'
                  ? 'Theo dõi từng bài test và để Eva phân tích như bác sĩ nhãn khoa 10 năm kinh nghiệm.'
                  : 'Track every test and let Eva analyse like a senior ophthalmologist.'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={refresh}
              className="inline-flex items-center gap-2 rounded-full bg-primary text-white px-4 py-2 text-sm font-semibold shadow-glow hover:bg-primary-light transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              {language === 'vi' ? 'Làm mới phân tích' : 'Refresh insights'}
            </button>
            {error && <span className="text-xs text-accent-dark">{error}</span>}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <GlassCard className="p-6 xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-primary-dark/70">{language === 'vi' ? 'Xu hướng' : 'Trend'}</p>
                <h2 className="text-xl font-semibold text-text-main dark:text-text-dark">
                  {language === 'vi' ? 'Đường xu hướng Snellen' : 'Snellen trendline'}
                </h2>
              </div>
            </div>
            {snellenData.length === 0 ? (
              <EmptyState
                title={language === 'vi' ? 'Chưa có dữ liệu Snellen' : 'No Snellen data yet'}
                description={
                  language === 'vi'
                    ? 'Thực hiện bài test Snellen để kích hoạt biểu đồ.'
                    : 'Complete a Snellen test to unlock this insight.'
                }
              />
            ) : (
              <SimpleLineChart points={snellenData} />
            )}
          </GlassCard>

          <GlassCard className="p-6 flex flex-col gap-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-primary-dark/70">{language === 'vi' ? 'Tóm tắt' : 'At a glance'}</p>
              <h3 className="text-lg font-semibold text-text-main dark:text-text-dark">
                {language === 'vi' ? 'Nhịp kiểm tra hôm nay' : 'Your testing rhythm'}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <StatPill label={language === 'vi' ? 'Tổng bài test' : 'Total tests'} value={totalTests} />
              <StatPill label={language === 'vi' ? 'Ngày khác nhau' : 'Unique days'} value={uniqueDays} />
              <StatPill label={language === 'vi' ? 'Xu hướng' : 'Trend'} value={trendLabel()} />
              <StatPill label={language === 'vi' ? 'Loại bài test' : 'Active types'} value={Object.values(counts).filter(Boolean).length} />
            </div>
          </GlassCard>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <GlassCard className="p-6 space-y-5 lg:col-span-2">
            <div className="flex items-center gap-2">
              <TestTube className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-widest text-primary-dark/70">
                  {language === 'vi' ? 'Phân bố bài test' : 'Test distribution'}
                </p>
                <h3 className="text-lg font-semibold text-text-main dark:text-text-dark">
                  {language === 'vi' ? 'Số lần làm bài theo loại' : 'Attempts per test type'}
                </h3>
              </div>
            </div>
            {totalTests === 0 ? (
              <EmptyState
                title={language === 'vi' ? 'Chưa có dữ liệu' : 'No data yet'}
                description={
                  language === 'vi'
                    ? 'Hoàn thành bất kỳ bài test nào để xem biểu đồ này.'
                    : 'Complete any test to populate this chart.'
                }
              />
            ) : (
              <div className="space-y-4">
                {(Object.entries(counts) as [TestType, number][]).map(([key, value]) => {
                  const values = Object.values(counts) as number[];
                  const maxValue = Math.max(...values, 1);
                  const width = value === 0 ? 4 : (value / maxValue) * 100;
                  return (
                    <div key={key} className="flex items-center gap-4">
                      <span className="w-32 text-sm font-medium text-text-sub capitalize">{testLabel(key as TestType)}</span>
                      <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${width}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-text-main dark:text-text-dark w-8 text-right">{value}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Grid className="w-5 h-5 text-secondary" />
              <div>
                <p className="text-xs uppercase tracking-widest text-secondary-dark/70">Amsler</p>
                <h3 className="text-lg font-semibold text-text-main dark:text-text-dark">
                  {language === 'vi' ? 'Bản đồ nhiệt' : 'Heatmap'}
                </h3>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'top-left', labelVi: 'Trên - Trái', labelEn: 'Top left' },
                { key: 'top-right', labelVi: 'Trên - Phải', labelEn: 'Top right' },
                { key: 'bottom-left', labelVi: 'Dưới - Trái', labelEn: 'Bottom left' },
                { key: 'bottom-right', labelVi: 'Dưới - Phải', labelEn: 'Bottom right' },
              ].map((quadrant) => (
                <div key={quadrant.key} className="rounded-2xl border border-secondary/30 bg-secondary-light/30 dark:bg-secondary-dark/20 p-4 text-center shadow-soft">
                  <p className="text-xs uppercase tracking-widest text-secondary-dark">
                    {language === 'vi' ? quadrant.labelVi : quadrant.labelEn}
                  </p>
                  <p className="text-3xl font-bold text-secondary mt-1">{amslerQuadrantCounts[quadrant.key] || 0}</p>
                  <p className="text-[11px] text-secondary-dark/70">
                    {language === 'vi' ? 'lần phát hiện' : 'detections'}
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>
        </section>

        <GlassCard className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent-dark" />
              <div>
                <p className="text-xs uppercase tracking-widest text-accent-dark/80">
                  {language === 'vi' ? 'Trợ lý Eva' : 'Eva assistant'}
                </p>
                <h3 className="text-xl font-semibold text-text-main dark:text-text-dark">
                  {language === 'vi' ? 'Phân tích AI cá nhân' : 'Personalised AI analysis'}
                </h3>
              </div>
            </div>
            {isLoading && <span className="text-xs text-text-sub">{language === 'vi' ? 'Đang phân tích...' : 'Analyzing...'}</span>}
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <SkeletonBlock height="h-8" />
              <SkeletonBlock height="h-24" />
              <SkeletonBlock height="h-20" />
            </div>
          ) : history.length === 0 ? (
            <EmptyState
              title={language === 'vi' ? 'Cần thêm dữ liệu' : 'Need more data'}
              description={
                language === 'vi'
                  ? 'Hoàn thành vài bài kiểm tra để Eva xây dựng báo cáo.'
                  : 'Complete a few tests to let Eva build your report.'
              }
            />
          ) : insights ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-primary-muted p-4 text-center">
                  <p className="text-sm text-primary-dark/70">{language === 'vi' ? 'Điểm tổng quát' : 'Overall score'}</p>
                  <p className="text-4xl font-bold text-primary-dark">{insights.score}</p>
                </div>
                <div className="rounded-2xl bg-secondary-light p-4 text-center">
                  <p className="text-sm text-secondary-dark/70">{language === 'vi' ? 'Xếp hạng' : 'Rating'}</p>
                  <p className="text-2xl font-bold text-secondary-dark">{insights.rating}</p>
                </div>
                <div className="rounded-2xl bg-accent-light p-4 text-center">
                  <p className="text-sm text-accent-dark/70">{language === 'vi' ? 'Xu hướng' : 'Trend'}</p>
                  <div className="flex items-center justify-center gap-2 text-accent-dark font-semibold">
                    {insights.trend === 'IMPROVING' && <TrendingUp className="w-5 h-5" />}
                    {insights.trend === 'STABLE' && <Minus className="w-5 h-5" />}
                    {insights.trend === 'DECLINING' && <TrendingDown className="w-5 h-5" />}
                    {trendLabel()}
                  </div>
                </div>
              </div>

              {insights.overallSummary && (
                <div className="rounded-2xl border border-slate-100 dark:border-white/10 p-4 bg-white/70 dark:bg-white/5">
                  <p className="text-sm text-text-sub dark:text-slate-300 leading-relaxed">{insights.overallSummary}</p>
                </div>
              )}

              {insights.positives?.length > 0 && (
                <div className="rounded-2xl bg-primary-muted/70 p-4">
                  <h4 className="font-semibold text-primary-dark text-sm mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    {language === 'vi' ? 'Điểm mạnh' : 'Strengths'}
                  </h4>
                  <ul className="space-y-2">
                    {insights.positives.map((item: string, idx: number) => (
                      <li key={idx} className="text-sm text-primary-dark/80 flex gap-2">
                        <span>•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {insights.areasToMonitor?.length > 0 && (
                <div className="rounded-2xl bg-accent-light/60 p-4">
                  <h4 className="font-semibold text-accent-dark text-sm mb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    {language === 'vi' ? 'Cần lưu ý' : 'Monitor closely'}
                  </h4>
                  <ul className="space-y-2">
                    {insights.areasToMonitor.map((item: string, idx: number) => (
                      <li key={idx} className="text-sm text-accent-dark/90 flex gap-2">
                        <span>•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {insights.proTip && (
                <div className="rounded-2xl border-l-4 border-primary bg-white/80 dark:bg-surface-dark/80 p-4">
                  <h4 className="font-semibold text-primary-dark mb-2 text-sm">
                    💡 {language === 'vi' ? 'Mẹo từ Eva' : 'Eva’s pro tip'}
                  </h4>
                  <p className="text-sm text-text-sub dark:text-slate-300">{insights.proTip}</p>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              title={language === 'vi' ? 'Eva đang bận' : 'Eva is busy'}
              description={
                language === 'vi'
                  ? 'Không thể lấy dữ liệu AI. Thử nhấn làm mới.'
                  : 'Unable to fetch AI insights. Try refreshing.'
              }
            />
          )}
        </GlassCard>
      </div>
    </div>
  );
}
