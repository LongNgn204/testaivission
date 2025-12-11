/**
 * ============================================================
 * 📊 Dashboard Handler (Cloudflare AI - FREE)
 * ============================================================
 * 
 * Generates dashboard insights from test history
 * using Cloudflare Workers AI - FREE!
 */

import { IRequest } from 'itty-router';
import { generateJSONWithCloudflareAI } from '../services/gemini';
import { CacheService, CACHE_TTL } from '../services/cache';
import { createDashboardPrompt } from '../prompts/dashboard';

export async function generateDashboardInsights(
  request: IRequest,
  env: any
): Promise<Response> {
  try {
    const { history, language } = await (request as unknown as Request).json() as any;

    // Validate input
    if (!history || !Array.isArray(history) || !language) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields',
          required: ['history (array)', 'language'],
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!['vi', 'en'].includes(language)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid language',
          supported: ['vi', 'en'],
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Helper: local fallback when AI unavailable or fails
    const buildFallback = (arr: any[], lang: 'vi' | 'en') => {
      if (!Array.isArray(arr) || arr.length < 2) {
        return {
          score: 70,
          rating: 'AVERAGE',
          trend: 'INSUFFICIENT_DATA',
          overallSummary: lang === 'vi' ? 'Chưa đủ dữ liệu để phân tích chi tiết' : 'Not enough data for detailed analysis',
          positives: [],
          areasToMonitor: [],
          proTip: lang === 'vi' ? 'Hoàn thành thêm bài test để đánh giá chính xác hơn' : 'Complete more tests for accurate assessment',
        }
      }
      const lastFive = arr.slice(-5)
      const sevScore = (sev?: string) => sev === 'LOW' ? 90 : sev === 'MEDIUM' ? 70 : sev === 'HIGH' ? 50 : 80
      const scores = lastFive.map((r: any) => sevScore(r?.report?.severity))
      const avg = Math.round(scores.reduce((s: number, v: number) => s + v, 0) / scores.length)
      const hasHigh = lastFive.some((r: any) => r?.report?.severity === 'HIGH')
      const rating = hasHigh ? 'NEEDS_ATTENTION' : avg >= 85 ? 'EXCELLENT' : avg >= 70 ? 'GOOD' : 'AVERAGE'
      const trend = scores.length < 2 ? 'INSUFFICIENT_DATA' : (scores[scores.length - 1] - scores[0] > 5 ? 'IMPROVING' : (scores[0] - scores[scores.length - 1] > 5 ? 'DECLINING' : 'STABLE'))
      return {
        score: avg,
        rating,
        trend,
        overallSummary: hasHigh
          ? (lang === 'vi' ? 'Một vài bài test gần đây có mức độ cao. Hãy ưu tiên nghỉ ngơi và xem lại hướng dẫn.' : 'Some recent tests show high severity. Prioritize rest and follow guidance.')
          : (lang === 'vi' ? 'Các bài test gần đây khá ổn định.' : 'Recent tests look stable.'),
        positives: [lang === 'vi' ? 'Duy trì kiểm tra đều.' : 'Maintained regular checks.'],
        areasToMonitor: hasHigh ? [lang === 'vi' ? 'Theo dõi các bài test có mức độ cao.' : 'Monitor high-severity tests.'] : [lang === 'vi' ? 'Tiếp tục nghỉ 20-20-20.' : 'Continue 20-20-20 breaks.'],
        proTip: lang === 'vi' ? 'Thêm nhắc nhở 20-20-20 để giữ phong độ tốt.' : 'Add 20-20-20 reminders to stay consistent.',
      }
    }

    // If AI binding missing → return graceful fallback (200)
    if (!env.AI) {
      const result = buildFallback(history, language)
      return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    // Initialize cache service
    const cacheService = new CacheService(env.CACHE);

    // Generate cache key based on recent history
    const recentHistory = history.slice(0, 5);
    const cacheKey = cacheService.generateKey(
      'dashboard',
      language,
      JSON.stringify(recentHistory)
    );

    // Check cache
    const cached = await cacheService.get<any>(cacheKey);
    if (cached) {
      return new Response(
        JSON.stringify({
          ...cached,
          fromCache: true,
          cacheKey,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate insights using Cloudflare AI
    const prompt = createDashboardPrompt(history, language);

    const insights = await generateJSONWithCloudflareAI(env.AI, prompt, language);

    // Add metadata
    const result = {
      ...insights,
      timestamp: new Date().toISOString(),
      language,
      fromCache: false,
    };

    // Cache result
    await cacheService.set(cacheKey, result, { ttl: CACHE_TTL.DASHBOARD });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Dashboard insights error:', error);
    // Trả về fallback data thay vì error 500
    const { history, language } = await (request as unknown as Request).json().catch(() => ({ history: [], language: 'vi' })) as any;
    const buildFallback = (arr: any[], lang: 'vi' | 'en') => {
      if (!Array.isArray(arr) || arr.length < 2) {
        return {
          score: 70,
          rating: 'AVERAGE',
          trend: 'INSUFFICIENT_DATA',
          overallSummary: lang === 'vi' ? 'Chưa đủ dữ liệu để phân tích chi tiết' : 'Not enough data for detailed analysis',
          positives: [],
          areasToMonitor: [],
          proTip: lang === 'vi' ? 'Hoàn thành thêm bài test để đánh giá chính xác hơn' : 'Complete more tests for accurate assessment',
        }
      }
      const lastFive = arr.slice(-5)
      const sevScore = (sev?: string) => sev === 'LOW' ? 90 : sev === 'MEDIUM' ? 70 : sev === 'HIGH' ? 50 : 80
      const scores = lastFive.map((r: any) => sevScore(r?.report?.severity))
      const avg = Math.round(scores.reduce((s: number, v: number) => s + v, 0) / scores.length)
      const hasHigh = lastFive.some((r: any) => r?.report?.severity === 'HIGH')
      const rating = hasHigh ? 'NEEDS_ATTENTION' : avg >= 85 ? 'EXCELLENT' : avg >= 70 ? 'GOOD' : 'AVERAGE'
      const trend = scores.length < 2 ? 'INSUFFICIENT_DATA' : (scores[scores.length - 1] - scores[0] > 5 ? 'IMPROVING' : (scores[0] - scores[scores.length - 1] > 5 ? 'DECLINING' : 'STABLE'))
      return {
        score: avg,
        rating,
        trend,
        overallSummary: hasHigh
          ? (lang === 'vi' ? 'Một vài bài test gần đây có mức độ cao. Hãy ưu tiên nghỉ ngơi.' : 'Some recent tests show high severity. Prioritize rest.')
          : (lang === 'vi' ? 'Các bài test gần đây khá ổn định.' : 'Recent tests look stable.'),
        positives: [lang === 'vi' ? 'Duy trì kiểm tra đều.' : 'Maintained regular checks.'],
        areasToMonitor: hasHigh ? [lang === 'vi' ? 'Theo dõi các bài test có mức độ cao.' : 'Monitor high-severity tests.'] : [lang === 'vi' ? 'Tiếp tục nghỉ 20-20-20.' : 'Continue 20-20-20 breaks.'],
        proTip: lang === 'vi' ? 'Thêm nhắc nhở 20-20-20 để giữ phong độ tốt.' : 'Add 20-20-20 reminders to stay consistent.',
      }
    }
    const result = buildFallback(history || [], language || 'vi')
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
