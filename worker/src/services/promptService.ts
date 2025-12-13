/**
 * ========================================
 * PROMPT SERVICE
 * ========================================
 * Quản lý prompts với versioning
 * Tuân thủ TypeScript strict mode
 */

import { createHash } from 'crypto';

export interface PromptVersion {
  version: string; // semver: e.g., "1.3.2"
  name: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
  parameters: Record<string, unknown>;
  createdAt: string;
  hash: string;
}

export interface PromptContext {
  userProfile?: {
    age?: number;
    name?: string;
    lastTestResult?: unknown;
  };
  conversationHistory?: Array<{ role: string; content: string }>;
  language?: 'vi' | 'en';
}

/**
 * Prompt service class
 */
class PromptService {
  private prompts: Map<string, PromptVersion[]> = new Map();

  /**
   * Register prompt version
   */
  registerPrompt(
    name: string,
    version: string,
    systemPrompt: string,
    userPromptTemplate: string,
    description: string = '',
    parameters: Record<string, unknown> = {}
  ): PromptVersion {
    const hash = this.generateHash(systemPrompt + userPromptTemplate);

    const promptVersion: PromptVersion = {
      version,
      name,
      description,
      systemPrompt,
      userPromptTemplate,
      parameters,
      createdAt: new Date().toISOString(),
      hash,
    };

    if (!this.prompts.has(name)) {
      this.prompts.set(name, []);
    }

    this.prompts.get(name)!.push(promptVersion);

    console.log(`[PromptService] Registered prompt: ${name}@${version} (hash: ${hash})`);

    return promptVersion;
  }

  /**
   * Get prompt version
   */
  getPrompt(name: string, version?: string): PromptVersion | null {
    const versions = this.prompts.get(name);

    if (!versions || versions.length === 0) {
      return null;
    }

    if (!version) {
      // Return latest version
      return versions[versions.length - 1] ?? null;
    }

    // Return specific version
    return versions.find((v) => v.version === version) ?? null;
  }

  /**
   * Get all versions of a prompt
   */
  getPromptVersions(name: string): PromptVersion[] {
    return this.prompts.get(name) ?? [];
  }

  /**
   * Build full prompt with context
   */
  buildPrompt(
    name: string,
    userInput: string,
    context: PromptContext = {},
    version?: string
  ): { systemPrompt: string; userPrompt: string; promptVersion: string; hash: string } {
    const prompt = this.getPrompt(name, version);

    if (!prompt) {
      throw new Error(`Prompt not found: ${name}@${version}`);
    }

    // Build system prompt
    const systemPrompt = prompt.systemPrompt;

    // Build user prompt from template
    let userPrompt = prompt.userPromptTemplate;

    // Replace template variables
    userPrompt = userPrompt.replace('{input}', userInput);
    userPrompt = userPrompt.replace('{language}', context.language ?? 'vi');

    if (context.userProfile) {
      userPrompt = userPrompt.replace('{age}', String(context.userProfile.age ?? 'unknown'));
      userPrompt = userPrompt.replace('{name}', context.userProfile.name ?? 'unknown');
    }

    // Add conversation history if available
    if (context.conversationHistory && context.conversationHistory.length > 0) {
      const history = context.conversationHistory
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join('\n');

      userPrompt = userPrompt.replace('{conversation_history}', history);
    }

    return {
      systemPrompt,
      userPrompt,
      promptVersion: prompt.version,
      hash: prompt.hash,
    };
  }

  /**
   * Generate hash for prompt
   */
  private generateHash(content: string): string {
    return createHash('sha256').update(content).digest('hex').substring(0, 8);
  }
}

/**
 * Export singleton instance
 */
export const promptService = new PromptService();

/**
 * Register default prompts
 */
export function initializeDefaultPrompts(): void {
  // Chat prompt
  promptService.registerPrompt(
    'chat',
    '1.0.0',
    `Bạn là TIẾN SĨ - BÁC Sĩ EVA, MD, PhD với 20 năm kinh nghiệm trong lĩnh vực nhãn khoa.
Bạn là một bác sĩ chuyên nghiệp, kiên nhẫn, và luôn đặt sức khỏe của bệnh nhân lên hàng đầu.

HƯỚNG DẪN:
- Trả lời bằng tiếng {language} (thuần túy, không pha trộn)
- Cung cấp câu trả lời chi tiết 150-300 từ
- Luôn trích dẫn nguồn khoa học khi sử dụng thông tin từ tài liệu
- Nếu thiếu thông tin, hãy hỏi lại người bệnh thay vì bịa đặt
- Tránh chẩn đoán quá sớm; đề xuất kiểm tra chuyên khoa khi cần
- Cấu trúc: Đánh giá → Phân tích → Khuyến nghị → Tiên lượng`,
    `Bệnh nhân (tuổi {age}): {input}

Hãy trả lời như một bác sĩ nhãn khoa chuyên nghiệp.`,
    'Dr. Eva chat responses'
  );

  // Report prompt
  promptService.registerPrompt(
    'report',
    '1.0.0',
    `Bạn là TIẾN SĨ - BÁC SĨ EVA, MD, PhD với 20 năm kinh nghiệm trong lĩnh vực nhãn khoa.
Bạn sẽ phân tích kết quả kiểm tra thị lực và cung cấp báo cáo chi tiết.

TIÊU CHUẨN:
- WHO (World Health Organization) guidelines
- AAO (American Academy of Ophthalmology) standards
- AREDS2 (Age-Related Eye Disease Study 2) recommendations

YÊUCẦU:
- Tóm tắt: 400-500 từ chi tiết
- Khuyến nghị: 12-15 mục cụ thể
- Ngôn ngữ: Tiếng {language} (thuần túy 100%)
- Cấu trúc: Đánh giá → Phân tích → Khuyến nghị → Tiên lượng`,
    `Kết quả kiểm tra thị lực:
{test_data}

Lịch sử bệnh nhân:
{patient_history}

Hãy cung cấp báo cáo chi tiết và chuyên nghiệp.`,
    'AI report generation'
  );

  // Proactive tip prompt
  promptService.registerPrompt(
    'proactive_tip',
    '1.0.0',
    `Bạn là TIẾN SĨ - BÁC SĨ EVA, MD, PhD.
Bạn sẽ cung cấp mẹo chăm sóc mắt dựa trên tình trạng sức khỏe của bệnh nhân.`,
    `Bệnh nhân tuổi {age} có tình trạng: {condition}

Hãy cung cấp 1 mẹo chăm sóc mắt cụ thể (50-70 từ) dựa trên tình trạng này.`,
    'Proactive health tips'
  );

  console.log('[PromptService] Default prompts initialized');
}

