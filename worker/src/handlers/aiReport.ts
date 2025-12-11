/**
 * ============================================================
 * 📋 AI Report Handler (Cloudflare AI - FREE)
 * ============================================================
 * 
 * Generates detailed medical reports for test results
 * using Cloudflare Workers AI (LLAMA 3.1) - FREE!
 */

import { IRequest } from 'itty-router';
import { generateJSONWithCloudflareAI } from '../services/gemini';
import { CacheService, CACHE_TTL } from '../services/cache';
import { createReportPrompt } from '../prompts/report';

export async function generateReport(
  request: IRequest,
  env: any
): Promise<Response> {
  try {
    const { testType, testData, history, language } = (await request.json()) as any;

    // Validate input
    if (!testType || !testData || !language) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields',
          required: ['testType', 'testData', 'language'],
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

    // Helper fallback when AI missing or fails
    const buildFallback = (tt: string, td: any, lang: 'vi' | 'en') => {
      const isVi = lang === 'vi';
      const base = {
        confidence: 65,
        severity: 'MEDIUM' as const,
        trend: 'STABLE',
        causes: '',
        prediction: ''
      };
      switch (tt) {
        case 'snellen': {
          const acc = td?.accuracy ?? 0;
          const score = td?.score ?? '20/20';
          return {
            ...base,
            summary: isVi
              ? `Kết quả Snellen ${score}. Độ chính xác ${acc}%. Thị lực tổng thể ở mức chấp nhận được, nên tiếp tục theo dõi định kỳ và giữ vệ sinh thị giác.`
              : `Snellen result ${score}. Accuracy ${acc}%. Overall visual acuity is acceptable; continue regular checks and good visual hygiene.`,
            recommendations: isVi
              ? ['Nghỉ mắt 20-20-20 trong lúc dùng màn hình', 'Kiểm tra lại sau 1–2 tuần nếu có mỏi mắt', 'Giữ khoảng cách đọc phù hợp (30–40cm)']
              : ['Use 20-20-20 breaks while on screens', 'Retest in 1–2 weeks if eye strain occurs', 'Maintain proper reading distance (30–40cm)']
          };
        }
        case 'colorblind': {
          return {
            ...base,
            summary: isVi
              ? 'Kết quả kiểm tra sắc giác cho thấy ngưỡng phân biệt màu ở mức ổn định. Nếu gặp khó khăn khi phân biệt đỏ–xanh, nên ưu tiên nhãn có ký hiệu thay vì màu.'
              : 'Color vision appears stable. If distinguishing red–green is difficult, prefer labels/icons rather than color-only cues.',
            recommendations: isVi
              ? ['Sử dụng giao diện high-contrast khi cần', 'Tránh chỉ dựa vào màu để phân biệt thông tin']
              : ['Use high-contrast UI when needed', 'Avoid relying solely on color for information']
          };
        }
        default: {
          return {
            ...base,
            summary: isVi
              ? 'Báo cáo AI tạm thời không khả dụng. Dưới đây là gợi ý an toàn dựa trên kết quả gần đây.'
              : 'AI report is temporarily unavailable. Providing safe, general guidance from recent results.',
            recommendations: isVi
              ? ['Giữ thói quen nghỉ mắt 20-20-20', 'Tránh nhìn màn hình liên tục trong thời gian dài', 'Duy trì ánh sáng làm việc phù hợp']
              : ['Keep 20-20-20 breaks', 'Avoid prolonged continuous screen time', 'Maintain proper ambient lighting']
          };
        }
      }
    };

    // If AI binding missing → graceful fallback 200
    if (!env.AI) {
      const result = {
        id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        testType,
        timestamp: new Date().toISOString(),
        language,
        ...buildFallback(testType, testData, language)
      };
      return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Initialize cache service
    const cacheService = new CacheService(env.CACHE);

    // Generate cache key
    const cacheKey = cacheService.generateKey(
      'report',
      testType,
      language,
      JSON.stringify(testData)
    );

    // Check cache
    const cached = await cacheService.get(cacheKey);
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

    // Generate report using Cloudflare AI
    const prompt = createReportPrompt(testType, testData, history, language);

    let report: any;
    try {
      report = await generateJSONWithCloudflareAI(env.AI, prompt, language);
    } catch (e) {
      // Graceful fallback if AI fails
      const fallback = {
        id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        testType,
        timestamp: new Date().toISOString(),
        language,
        ...buildFallback(testType, testData, language)
      };
      return new Response(JSON.stringify(fallback), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Add metadata
    const result = {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      testType,
      timestamp: new Date().toISOString(),
      language,
      ...report,
      fromCache: false,
    };

    // Cache result
    await cacheService.set(cacheKey, result, { ttl: CACHE_TTL.REPORT });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Report generation error:', error);
    // Ultimate fallback
    return new Response(
      JSON.stringify({
        id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        testType: 'unknown',
        timestamp: new Date().toISOString(),
        confidence: 60,
        severity: 'MEDIUM',
        summary: 'Fallback report generated due to error.',
        recommendations: [],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
