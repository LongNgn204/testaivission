/**
 * ========================================
 * CONTEXT COMPRESSION SERVICE
 * ========================================
 * Giảm kích thước context để tiết kiệm tokens
 * Tuân thủ TypeScript strict mode
 */

export interface CompressionConfig {
  maxTokens: number;
  maxMessages: number;
  summaryLength: number;
}

/**
 * Context compression service
 */
export class ContextCompressionService {
  private config: CompressionConfig;

  constructor(config: Partial<CompressionConfig> = {}) {
    this.config = {
      maxTokens: config.maxTokens ?? 2000,
      maxMessages: config.maxMessages ?? 10,
      summaryLength: config.summaryLength ?? 100,
    };
  }

  /**
   * Estimate token count (rough approximation)
   * Trong production, dùng proper tokenizer
   */
  private estimateTokens(text: string): number {
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * Compress conversation history
   */
  compressConversationHistory(
    messages: Array<{ role: string; content: string }>,
    maxMessages: number = this.config.maxMessages
  ): Array<{ role: string; content: string }> {
    if (messages.length <= maxMessages) {
      return messages;
    }

    // Keep first message (context) and last N messages (recent)
    const firstMessage = messages[0];
    const recentMessages = messages.slice(-(maxMessages - 1));

    return firstMessage ? [firstMessage, ...recentMessages] : recentMessages;
  }

  /**
   * Compress context to fit token limit
   */
  compressContext(
    context: string,
    maxTokens: number = this.config.maxTokens
  ): string {
    const tokens = this.estimateTokens(context);

    if (tokens <= maxTokens) {
      return context;
    }

    // Calculate compression ratio
    const ratio = maxTokens / tokens;
    const targetLength = Math.floor(context.length * ratio);

    // Truncate context
    return context.substring(0, targetLength) + '...';
  }

  /**
   * Summarize long text
   */
  summarizeText(text: string, maxLength: number = this.config.summaryLength): string {
    if (text.length <= maxLength) {
      return text;
    }

    // Simple summarization: take first sentences until max length
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

    let summary = '';
    for (const sentence of sentences) {
      if ((summary + sentence).length > maxLength) {
        break;
      }
      summary += sentence + '. ';
    }

    return summary.trim() || text.substring(0, maxLength);
  }

  /**
   * Compress user profile
   */
  compressUserProfile(profile: Record<string, unknown>): Record<string, unknown> {
    const compressed: Record<string, unknown> = {};

    // Keep only essential fields
    const essentialFields = ['age', 'name', 'lastTestDate', 'testHistory'];

    for (const field of essentialFields) {
      if (field in profile) {
        compressed[field] = profile[field];
      }
    }

    return compressed;
  }

  /**
   * Compress test result
   */
  compressTestResult(result: Record<string, unknown>): Record<string, unknown> {
    const compressed: Record<string, unknown> = {};

    // Keep only essential fields
    const essentialFields = ['testType', 'score', 'severity', 'date'];

    for (const field of essentialFields) {
      if (field in result) {
        compressed[field] = result[field];
      }
    }

    return compressed;
  }

  /**
   * Build optimized prompt context
   */
  buildOptimizedContext(
    userProfile?: Record<string, unknown>,
    conversationHistory?: Array<{ role: string; content: string }>,
    testResults?: Record<string, unknown>[],
    maxTokens: number = this.config.maxTokens
  ): string {
    let context = '';
    let currentTokens = 0;

    // Add user profile
    if (userProfile) {
      const profileStr = JSON.stringify(this.compressUserProfile(userProfile));
      const profileTokens = this.estimateTokens(profileStr);

      if (currentTokens + profileTokens <= maxTokens) {
        context += `User Profile:\n${profileStr}\n\n`;
        currentTokens += profileTokens;
      }
    }

    // Add conversation history
    if (conversationHistory && conversationHistory.length > 0) {
      const compressed = this.compressConversationHistory(conversationHistory);
      const historyStr = compressed
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join('\n');
      const historyTokens = this.estimateTokens(historyStr);

      if (currentTokens + historyTokens <= maxTokens) {
        context += `Conversation History:\n${historyStr}\n\n`;
        currentTokens += historyTokens;
      }
    }

    // Add test results
    if (testResults && testResults.length > 0) {
      const compressedResults = testResults.map((r) => this.compressTestResult(r));
      const resultsStr = JSON.stringify(compressedResults);
      const resultsTokens = this.estimateTokens(resultsStr);

      if (currentTokens + resultsTokens <= maxTokens) {
        context += `Test Results:\n${resultsStr}\n\n`;
        currentTokens += resultsTokens;
      }
    }

    return context;
  }

  /**
   * Get compression stats
   */
  getCompressionStats(
    original: string,
    compressed: string
  ): { originalTokens: number; compressedTokens: number; ratio: number } {
    const originalTokens = this.estimateTokens(original);
    const compressedTokens = this.estimateTokens(compressed);

    return {
      originalTokens,
      compressedTokens,
      ratio: compressedTokens / originalTokens,
    };
  }
}

/**
 * Export singleton instance
 */
export const contextCompressionService = new ContextCompressionService();

