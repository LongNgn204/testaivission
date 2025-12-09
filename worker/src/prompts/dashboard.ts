/**
 * ============================================================
 * 📊 Dashboard Prompts
 * ============================================================
 * 
 * Prompts for dashboard insights
 */

export function createDashboardPrompt(
  history: any[],
  language: 'vi' | 'en'
): string {
  const isVi = language === 'vi';

  const langInstruction = isVi ? 'VIETNAMESE' : 'ENGLISH';

  const historyDigest = history
    .slice(0, 6)
    .map((item: any) => {
      const date = new Date(item.date).toLocaleDateString();
      const score = item.resultData?.score || item.report?.score || 'N/A';
      const severity = item.report?.severity || 'unknown';
      return `- ${item.testType.toUpperCase()} (${date}): score ${score}, severity ${severity}`;
    })
    .join('\n');

  return `You are preparing a "Vision Wellness Dashboard" for the patient. Respond strictly in ${langInstruction}.

RULES:
1. Analyze the entire history: Consider test type, severity, recency, and frequency.
2. Calculate a Score (0-100): 100 is perfect vision. Deduct points based on severity.
3. Determine a Rating: 'EXCELLENT' (85-100), 'GOOD' (70-84), 'AVERAGE' (50-69), or 'NEEDS_ATTENTION' (<50).
4. Determine the Trend: 'IMPROVING', 'STABLE', 'DECLINING', or 'INSUFFICIENT_DATA'.
5. Provide Detailed Insights.
6. Language: All text output MUST be in ${langInstruction}.

PATIENT HISTORY DIGEST:
${historyDigest}

OUTPUT FORMAT - Respond with ONLY a valid JSON object (no markdown, no explanation):
{
  "score": <number 0-100>,
  "rating": "EXCELLENT" | "GOOD" | "AVERAGE" | "NEEDS_ATTENTION",
  "trend": "IMPROVING" | "STABLE" | "DECLINING" | "INSUFFICIENT_DATA",
  "overallSummary": "<40-60 words summary>",
  "positives": ["<positive point 1>", "<positive point 2>"],
  "areasToMonitor": ["<area 1>", "<area 2>"],
  "proTip": "<20-30 words actionable tip>"
}`;
}

export function createDashboardSchema(): any {
  return {
    type: 'object',
    properties: {
      score: {
        type: 'number',
        description: 'Vision wellness score from 0 to 100',
      },
      rating: {
        type: 'string',
        enum: ['EXCELLENT', 'GOOD', 'AVERAGE', 'NEEDS_ATTENTION'],
        description: 'Qualitative rating',
      },
      trend: {
        type: 'string',
        enum: ['IMPROVING', 'STABLE', 'DECLINING', 'INSUFFICIENT_DATA'],
        description: 'Trend direction',
      },
      overallSummary: {
        type: 'string',
        description: 'Comprehensive summary (40-60 words)',
      },
      positives: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of 1-2 positive points',
      },
      areasToMonitor: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of 1-2 areas to monitor',
      },
      proTip: {
        type: 'string',
        description: 'Single actionable Pro Tip (20-30 words)',
      },
    },
    required: [
      'score',
      'rating',
      'trend',
      'overallSummary',
      'positives',
      'areasToMonitor',
      'proTip',
    ],
  };
}

