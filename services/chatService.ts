/**
 * ========================================
 * CHAT SERVICE
 * ========================================
 * Xử lý chat với Dr. Eva AI
 * Tuân thủ TypeScript strict mode
 */

import { createApiClient } from './apiClient';
import { validateInput, ChatMessageSchema, type ChatMessageInput } from '../utils/validation';
import { logger } from '../utils/logger';
import { config } from '../utils/config';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  tokensUsed?: {
    input: number;
    output: number;
  };
  cost?: number;
}

export interface ChatResponse {
  message: string;
  tokensUsed?: {
    input: number;
    output: number;
  };
  cost?: number;
}

/**
 * Chat service class
 */
class ChatService {
  private api = createApiClient(config.apiUrl);
  private token: string | null = null;
  private conversationHistory: ChatMessage[] = [];
  private maxHistoryLength = 20;

  /**
   * Send message to Dr. Eva
   */
  async sendMessage(
    message: string,
    context?: {
      lastTestResult?: unknown;
      userProfile?: unknown;
    },
    language: 'vi' | 'en' = 'vi'
  ): Promise<ChatResponse> {
    try {
      // Validate input
      const validated = validateInput(
        ChatMessageSchema,
        { message, context, language },
        'Chat message'
      );

      logger.info('Sending chat message', { messageLength: message.length }, 'ChatService');

      // Call API
      const response = await this.api.post<ChatResponse>(
        '/api/chat',
        validated,
        {
          headers: this.getAuthHeaders(),
        }
      );

      // Add to history
      this.addToHistory({
        id: `msg-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      });

      this.addToHistory({
        id: `msg-${Date.now()}-response`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
        tokensUsed: response.tokensUsed,
        cost: response.cost,
      });

      logger.info('Chat message sent successfully', { responseLength: response.message.length }, 'ChatService');

      return response;
    } catch (error) {
      logger.error('Failed to send chat message', error, 'ChatService');
      throw error;
    }
  }

  /**
   * Get conversation history
   */
  getHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
    logger.info('Chat history cleared', {}, 'ChatService');
  }

  /**
   * Add message to history
   */
  private addToHistory(message: ChatMessage): void {
    this.conversationHistory.push(message);

    // Keep only recent messages
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
    }
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): Record<string, string> {
    if (!this.token) {
      return {};
    }

    return {
      'Authorization': `Bearer ${this.token}`,
    };
  }
}

/**
 * Export singleton instance
 */
export const chatService = new ChatService();

