import { useCallback, useEffect, useMemo, useState } from 'react';
/**
 * =================================================================
 * 📊 useDashboardInsights - Hook lấy Vision Dashboard Insights (AI + Cache)
 * =================================================================
 *
 * MỤC ĐÍCH:
 * - Tạo tóm tắt thông minh (score, rating, trend, insights) dựa vào lịch sử bài test.
 * - Tự cache kết quả trong 5 phút theo fingerprint (dựa trên history + language).
 * - Nếu AI bận/không có API KEY → sinh dữ liệu fallback từ lịch sử gần nhất.
 *
 * CÁCH DÙNG:
 *   const { insights, isLoading, error, refresh } = useDashboardInsights(history, language);
 *
 * LƯU Ý:
 * - Không khởi tạo AIService ở module scope để tránh throw khi thiếu API KEY.
 * - Thay vào đó, khởi tạo bên trong effect và fallback gracefully nếu thất bại.
 */
// AI service will be dynamically imported when needed
import { DashboardInsights, StoredTestResult } from '../types';

const CACHE_KEY = 'dashboard_insights_cache_v1';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CachePayload {
    timestamp: number;
    language: string;
    fingerprint: string;
    insights: DashboardInsights;
}

interface UseDashboardInsightsResult {
    insights: DashboardInsights | null;
    isLoading: boolean;
    error: string | null;
    refresh: () => void;
}

/**
 * Tạo fingerprint để cache insights theo dữ liệu và ngôn ngữ
 * - Dựa vào 5 bản ghi gần nhất: testType + report.timestamp + report.severity
 */
const buildFingerprint = (history: StoredTestResult[]) => {
    if (!history.length) return 'empty';
    const recent = history
        .slice(-5)
        .map(item => `${item.testType}-${item.report?.timestamp || item.date}-${item.report?.severity || 'LOW'}`)
        .join('|');
    return `${history.length}:${recent}`;
};

const getCachedInsights = (fingerprint: string, language: string): DashboardInsights | null => {
    try {
        const cachedRaw = localStorage.getItem(CACHE_KEY);
        if (!cachedRaw) return null;
        const payload: CachePayload = JSON.parse(cachedRaw);
        const isExpired = Date.now() - payload.timestamp > CACHE_TTL;
        if (isExpired) return null;
        if (payload.language !== language) return null;
        if (payload.fingerprint !== fingerprint) return null;
        return payload.insights;
    } catch (error) {
        console.error('Failed to read cache', error);
        return null;
    }
};

const persistInsights = (insights: DashboardInsights, fingerprint: string, language: string) => {
    try {
        const payload: CachePayload = {
            timestamp: Date.now(),
            language,
            fingerprint,
            insights,
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    } catch (error) {
        console.warn('Failed to cache dashboard insights', error);
    }
};

const buildFallbackInsights = (history: StoredTestResult[]): DashboardInsights | null => {
    if (history.length < 2) return null;

    const lastFive = history.slice(-5);

    const severityToScore = (sev?: 'LOW' | 'MEDIUM' | 'HIGH') => {
        switch (sev) {
            case 'LOW': return 90;
            case 'MEDIUM': return 70;
            case 'HIGH': return 50;
            default: return 80;
        }
    };

    const scores = lastFive.map(r => severityToScore(r.report?.severity as any));
    const avgScore = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);

    const severityCounts = lastFive.reduce(
        (acc, curr) => {
            const sev = (curr.report?.severity as 'LOW' | 'MEDIUM' | 'HIGH') || 'LOW';
            acc[sev] += 1;
            return acc;
        },
        { LOW: 0, MEDIUM: 0, HIGH: 0 } as Record<'LOW' | 'MEDIUM' | 'HIGH', number>
    );

    const hasHighSeverity = severityCounts.HIGH > 0;
    const rating: DashboardInsights['rating'] = hasHighSeverity
        ? 'NEEDS_ATTENTION'
        : avgScore >= 85
            ? 'EXCELLENT'
            : avgScore >= 70
                ? 'GOOD'
                : 'AVERAGE';

    const trend: DashboardInsights['trend'] = (() => {
        if (scores.length < 2) return 'INSUFFICIENT_DATA';
        const first = scores[0];
        const last = scores[scores.length - 1];
        if (last - first > 5) return 'IMPROVING';
        if (first - last > 5) return 'DECLINING';
        return 'STABLE';
    })();

    return {
        score: avgScore,
        rating,
        trend,
        overallSummary: hasHighSeverity
            ? 'Một vài bài test gần đây có mức độ cao. Hãy ưu tiên nghỉ ngơi và xem lại hướng dẫn của bác sĩ.'
            : 'Các bài test gần đây khá ổn định. Tiếp tục duy trì thói quen tốt cho mắt.',
        positives: [
            'Bạn duy trì nhịp kiểm tra đều trong tuần qua.',
            'Điểm trung bình ổn định so với lần trước.',
        ],
        areasToMonitor: hasHighSeverity
            ? ['Có bài test đánh dấu mức độ cao, nên xem lại kết quả chi tiết.', 'Đảm bảo thực hiện bài tập mắt đầy đủ để giảm mỏi.']
            : ['Tiếp tục theo dõi độ sắc nét của mắt vào cuối ngày.', 'Nghỉ giữa giờ 20-20-20 để giữ điểm ở mức cao.'],
        proTip: hasHighSeverity
            ? 'Ghi chú thời điểm mắt mệt nhất để AI giúp điều chỉnh lộ trình hợp lý hơn.'
            : 'Thêm nhắc nhở 20-20-20 trên Reminders để giữ phong độ tốt.',
    };
};

export const useDashboardInsights = (
    history: StoredTestResult[],
    language: string
): UseDashboardInsightsResult => {
    const [insights, setInsights] = useState<DashboardInsights | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refreshCount, setRefreshCount] = useState(0);

    const fingerprint = useMemo(() => buildFingerprint(history), [history]);

    const refresh = useCallback(() => {
        setInsights(null);
        setError(null);
        setRefreshCount(prev => prev + 1);
    }, []);

    useEffect(() => {
        if (history.length < 2) {
            setInsights(null);
            setError(null);
            setIsLoading(false);
            return;
        }

        const controller = new AbortController();

        const fetchInsights = async () => {
            setIsLoading(true);
            setError(null);

            const cached = getCachedInsights(fingerprint, language);
            if (cached) {
                setInsights(cached);
                setIsLoading(false);
                return;
            }

            try {
                // Sử dụng OpenRouter API trực tiếp qua ChatbotService
                const { ChatbotService } = await import('../services/chatbotService');
                const svc = new ChatbotService();
                const backendInsights = await svc.dashboard(history, language as 'vi' | 'en');

                if (controller.signal.aborted) return;

                // OpenRouter trả về DashboardInsights trực tiếp
                const insights = backendInsights as DashboardInsights;
                if (insights && (insights.overallSummary || insights.score)) {
                    const result: DashboardInsights = {
                        score: insights.score || 80,
                        rating: (insights.rating || 'GOOD') as DashboardInsights['rating'],
                        trend: (insights.trend || 'STABLE') as DashboardInsights['trend'],
                        overallSummary: insights.overallSummary || 'Tình trạng sức khỏe mắt ổn định.',
                        positives: Array.isArray(insights.positives) ? insights.positives : [],
                        areasToMonitor: Array.isArray(insights.areasToMonitor) ? insights.areasToMonitor : [],
                        proTip: insights.proTip || 'Tiếp tục duy trì thói quen tốt cho mắt.',
                    };
                    setInsights(result);
                    persistInsights(result, fingerprint, language);
                } else {
                    // API returned null or invalid response - use fallback
                    console.warn('Dashboard API returned invalid response, using fallback');
                    const fallback = buildFallbackInsights(history);
                    setInsights(fallback);
                    if (fallback) {
                        // Downgrade to console warning to avoid noisy UI banner
console.warn(language === 'vi' ? 'Đang sử dụng dữ liệu tính toán cục bộ.' : 'Using locally computed data.');
                    }
                }
            } catch (err) {
                if (controller.signal.aborted) return;
                console.error('Failed to load dashboard insights from OpenRouter', err);
                const fallback = buildFallbackInsights(history);
                setInsights(fallback);
                setError('AI đang bận, đã chuyển sang dữ liệu gần nhất.');
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        fetchInsights();
        return () => controller.abort();
    }, [fingerprint, history, language, refreshCount]);

    return { insights, isLoading, error, refresh };
};

