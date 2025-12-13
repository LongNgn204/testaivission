/**
 * ========================================
 * LLM EVALUATION SERVICE
 * ========================================
 * Smoke tests và eval suite cho LLM outputs
 * Tuân thủ TypeScript strict mode
 */

export interface EvalCase {
  id: string;
  input: string;
  expectedTopics?: string[];
  minLength?: number;
  maxLength?: number;
  rubric?: Record<string, number>; // e.g., { accuracy: 1, clarity: 1 }
}

export interface EvalResult {
  caseId: string;
  input: string;
  output: string;
  passed: boolean;
  score: number; // 0-100
  issues: string[];
  timestamp: string;
}

export interface EvalReport {
  totalCases: number;
  passedCases: number;
  failedCases: number;
  passRate: number; // 0-100
  averageScore: number;
  results: EvalResult[];
  timestamp: string;
}

/**
 * Evaluation service
 */
export class EvalService {
  private goldenCases: Map<string, EvalCase[]> = new Map();
  private evalHistory: EvalResult[] = [];

  /**
   * Register golden test cases
   */
  registerGoldenCases(name: string, cases: EvalCase[]): void {
    this.goldenCases.set(name, cases);
    console.log(`[EvalService] Registered ${cases.length} golden cases for ${name}`);
  }

  /**
   * Get golden test cases
   */
  getGoldenCases(name: string): EvalCase[] {
    return this.goldenCases.get(name) ?? [];
  }

  /**
   * Evaluate LLM output
   */
  async evaluateOutput(
    caseId: string,
    input: string,
    output: string,
    evalCase: EvalCase
  ): Promise<EvalResult> {
    const issues: string[] = [];
    let score = 100;

    // Check length constraints
    if (evalCase.minLength && output.length < evalCase.minLength) {
      issues.push(`Output too short (${output.length} < ${evalCase.minLength})`);
      score -= 20;
    }

    if (evalCase.maxLength && output.length > evalCase.maxLength) {
      issues.push(`Output too long (${output.length} > ${evalCase.maxLength})`);
      score -= 10;
    }

    // Check expected topics
    if (evalCase.expectedTopics && evalCase.expectedTopics.length > 0) {
      const outputLower = output.toLowerCase();
      const foundTopics = evalCase.expectedTopics.filter((topic) =>
        outputLower.includes(topic.toLowerCase())
      );

      const topicCoverage = foundTopics.length / evalCase.expectedTopics.length;
      if (topicCoverage < 0.5) {
        issues.push(
          `Missing topics: expected ${evalCase.expectedTopics.join(', ')}, found ${foundTopics.join(', ')}`
        );
        score -= 30;
      } else if (topicCoverage < 1) {
        issues.push(
          `Incomplete topic coverage: ${foundTopics.length}/${evalCase.expectedTopics.length}`
        );
        score -= 10;
      }
    }

    // Check for empty output
    if (output.trim().length === 0) {
      issues.push('Output is empty');
      score = 0;
    }

    // Ensure score is in range [0, 100]
    score = Math.max(0, Math.min(100, score));

    const result: EvalResult = {
      caseId,
      input,
      output,
      passed: score >= 70, // 70% threshold
      score,
      issues,
      timestamp: new Date().toISOString(),
    };

    this.evalHistory.push(result);
    return result;
  }

  /**
   * Run smoke eval on a set of cases
   */
  async runSmokeEval(
    name: string,
    evalFn: (input: string) => Promise<string>
  ): Promise<EvalReport> {
    const cases = this.getGoldenCases(name);

    if (cases.length === 0) {
      throw new Error(`No golden cases found for ${name}`);
    }

    const results: EvalResult[] = [];

    for (const evalCase of cases) {
      try {
        const output = await evalFn(evalCase.input);
        const result = await this.evaluateOutput(
          evalCase.id,
          evalCase.input,
          output,
          evalCase
        );
        results.push(result);
      } catch (error) {
        results.push({
          caseId: evalCase.id,
          input: evalCase.input,
          output: '',
          passed: false,
          score: 0,
          issues: [`Evaluation error: ${String(error)}`],
          timestamp: new Date().toISOString(),
        });
      }
    }

    const passedCases = results.filter((r) => r.passed).length;
    const passRate = (passedCases / results.length) * 100;
    const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;

    const report: EvalReport = {
      totalCases: results.length,
      passedCases,
      failedCases: results.length - passedCases,
      passRate,
      averageScore,
      results,
      timestamp: new Date().toISOString(),
    };

    console.log(`[EvalService] Smoke eval for ${name}: ${passRate.toFixed(1)}% pass rate`);

    return report;
  }

  /**
   * Get eval history
   */
  getEvalHistory(): EvalResult[] {
    return [...this.evalHistory];
  }

  /**
   * Clear eval history
   */
  clearEvalHistory(): void {
    this.evalHistory = [];
  }
}

/**
 * Export singleton instance
 */
export const evalService = new EvalService();

/**
 * Register default golden cases
 */
export function initializeDefaultGoldenCases(): void {
  // Chat golden cases
  evalService.registerGoldenCases('chat', [
    {
      id: 'chat-1',
      input: 'Tôi bị cận thị, có nên đeo kính liên tục?',
      expectedTopics: ['cận thị', 'kính', 'mắt'],
      minLength: 100,
      maxLength: 500,
    },
    {
      id: 'chat-2',
      input: 'Làm sao phòng tránh mù màu?',
      expectedTopics: ['mù màu', 'phòng tránh', 'di truyền'],
      minLength: 80,
      maxLength: 400,
    },
    {
      id: 'chat-3',
      input: 'Tôi thường xuyên nhìn màn hình, có ảnh hưởng gì không?',
      expectedTopics: ['màn hình', 'mắt', 'chăm sóc'],
      minLength: 100,
      maxLength: 500,
    },
  ]);

  // Report golden cases
  evalService.registerGoldenCases('report', [
    {
      id: 'report-1',
      input: 'Snellen test result: 20/40',
      expectedTopics: ['snellen', 'thị lực', 'khuyến nghị'],
      minLength: 300,
      maxLength: 800,
    },
    {
      id: 'report-2',
      input: 'Color blind test: Red-Green deficiency',
      expectedTopics: ['mù màu', 'đỏ', 'xanh'],
      minLength: 300,
      maxLength: 800,
    },
  ]);

  console.log('[EvalService] Default golden cases initialized');
}

