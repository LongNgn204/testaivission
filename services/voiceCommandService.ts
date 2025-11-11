/**
 * 🎤 VOICE COMMAND SERVICE - Enhanced Voice Control
 * 
 * Xử lý và phân tích các lệnh giọng nói phức tạp
 * Hỗ trợ đa ngôn ngữ (Tiếng Việt + English)
 */

export interface VoiceCommand {
  intent: string; // Ý định của lệnh (navigate, test, export, etc.)
  action: string; // Hành động cụ thể (start, stop, show, etc.)
  target?: string; // Đối tượng (snellen, history, pdf, etc.)
  params?: Record<string, any>; // Tham số bổ sung
  confidence: number; // Độ tin cậy (0-1)
}

export interface CommandPattern {
  patterns: RegExp[]; // Các pattern regex để match
  intent: string;
  action: string;
  target?: string;
  examples: string[]; // Ví dụ câu lệnh
}

class VoiceCommandService {
  private commandPatterns: CommandPattern[] = [];

  constructor() {
    this.initializeCommandPatterns();
  }

  /**
   * Khởi tạo tất cả command patterns (Tiếng Việt + English)
   */
  private initializeCommandPatterns() {
    this.commandPatterns = [
      // ===== NAVIGATION COMMANDS =====
      {
        patterns: [
          /(?:eva|ai)?\s*(?:về|đi|chuyển|go to?|navigate to?|open)\s*(?:trang|page)?\s*(?:chủ|home|main)/i,
          /(?:eva|ai)?\s*(?:back to )?home/i,
        ],
        intent: 'navigate',
        action: 'go',
        target: 'home',
        examples: ['Eva, về trang chủ', 'Go home', 'Navigate to home page']
      },
      {
        patterns: [
          /(?:eva|ai)?\s*(?:xem|show|open|display)\s*(?:lịch sử|history)/i,
          /(?:eva|ai)?\s*(?:đi|go to?)\s*(?:lịch sử|history)/i,
        ],
        intent: 'navigate',
        action: 'go',
        target: 'history',
        examples: ['Eva, xem lịch sử', 'Show history', 'Open history page']
      },
      {
        patterns: [
          /(?:eva|ai)?\s*(?:tìm|find|search|locate)\s*(?:bệnh viện|hospital)/i,
          /(?:eva|ai)?\s*(?:bệnh viện|hospital)\s*(?:gần|near)/i,
        ],
        intent: 'navigate',
        action: 'go',
        target: 'hospitals',
        examples: ['Eva, tìm bệnh viện', 'Find hospital', 'Locate nearest hospital']
      },
      {
        patterns: [
          /(?:eva|ai)?\s*(?:xem|show|open)\s*(?:nhắc nhở|reminder)/i,
          /(?:eva|ai)?\s*(?:đi|go to?)\s*(?:reminder|nhắc nhở)/i,
        ],
        intent: 'navigate',
        action: 'go',
        target: 'reminders',
        examples: ['Eva, xem nhắc nhở', 'Show reminders', 'Open reminders']
      },
      {
        patterns: [
          /(?:eva|ai)?\s*(?:về|about|giới thiệu)/i,
        ],
        intent: 'navigate',
        action: 'go',
        target: 'about',
        examples: ['Eva, về chúng tôi', 'About', 'Giới thiệu']
      },

      // ===== TEST COMMANDS =====
      {
        patterns: [
          /(?:eva|ai)?\s*(?:bắt đầu|start|begin|run)\s*(?:bài |test |kiểm tra )?(?:test )?(?:thị lực|snellen|vision|sight)/i,
          /(?:eva|ai)?\s*(?:làm|do|take)\s*(?:bài |test )?snellen/i,
        ],
        intent: 'test',
        action: 'start',
        target: 'snellen',
        examples: ['Eva, bắt đầu test thị lực', 'Start Snellen test', 'Begin vision test']
      },
      {
        patterns: [
          /(?:eva|ai)?\s*(?:bắt đầu|start|begin|run)\s*(?:bài |test |kiểm tra )?(?:test )?(?:mù màu|color\s*blind|ishihara)/i,
          /(?:eva|ai)?\s*(?:làm|do|take)\s*(?:bài |test )?(?:mù màu|color\s*blind)/i,
        ],
        intent: 'test',
        action: 'start',
        target: 'colorblind',
        examples: ['Eva, bắt đầu test mù màu', 'Start color blind test', 'Begin Ishihara test']
      },
      {
        patterns: [
          /(?:eva|ai)?\s*(?:bắt đầu|start|begin|run)\s*(?:bài |test |kiểm tra )?(?:test )?(?:loạn thị|astigmatism)/i,
          /(?:eva|ai)?\s*(?:làm|do|take)\s*(?:bài |test )?(?:loạn thị|astigmatism)/i,
        ],
        intent: 'test',
        action: 'start',
        target: 'astigmatism',
        examples: ['Eva, bắt đầu test loạn thị', 'Start astigmatism test']
      },
      {
        patterns: [
          /(?:eva|ai)?\s*(?:bắt đầu|start|begin|run)\s*(?:bài |test |kiểm tra )?(?:test )?(?:lưới amsler|amsler|grid)/i,
          /(?:eva|ai)?\s*(?:làm|do|take)\s*(?:bài |test )?amsler/i,
        ],
        intent: 'test',
        action: 'start',
        target: 'amsler',
        examples: ['Eva, bắt đầu test lưới Amsler', 'Start Amsler grid test']
      },
      {
        patterns: [
          /(?:eva|ai)?\s*(?:bắt đầu|start|begin|run)\s*(?:bài |test |kiểm tra )?(?:test )?(?:duochrome|đỏ xanh)/i,
          /(?:eva|ai)?\s*(?:làm|do|take)\s*(?:bài |test )?duochrome/i,
        ],
        intent: 'test',
        action: 'start',
        target: 'duochrome',
        examples: ['Eva, bắt đầu test Duochrome', 'Start duochrome test']
      },

      // ===== EXPORT/REPORT COMMANDS =====
      {
        patterns: [
          /(?:eva|ai)?\s*(?:xuất|export|download|save|tải)\s*(?:báo cáo|report)?\s*(?:ra |to )?(?:pdf|file)/i,
          /(?:eva|ai)?\s*(?:tạo|create|generate)\s*(?:báo cáo|report)\s*pdf/i,
        ],
        intent: 'export',
        action: 'pdf',
        target: 'report',
        examples: ['Eva, xuất báo cáo PDF', 'Export report to PDF', 'Download PDF report']
      },
      {
        patterns: [
          /(?:eva|ai)?\s*(?:xem|show|display|open)\s*(?:báo cáo|report|kết quả|result)/i,
        ],
        intent: 'export',
        action: 'show',
        target: 'report',
        examples: ['Eva, xem báo cáo', 'Show report', 'Display results']
      },

      // ===== SETTINGS COMMANDS =====
      {
        patterns: [
          /(?:eva|ai)?\s*(?:bật|turn on|enable|switch on)\s*(?:chế độ|mode)?\s*(?:tối|dark)/i,
          /(?:eva|ai)?\s*(?:dark mode|chế độ tối)/i,
        ],
        intent: 'settings',
        action: 'enable',
        target: 'dark_mode',
        examples: ['Eva, bật chế độ tối', 'Turn on dark mode', 'Enable dark mode']
      },
      {
        patterns: [
          /(?:eva|ai)?\s*(?:tắt|turn off|disable|switch off)\s*(?:chế độ|mode)?\s*(?:tối|dark)/i,
          /(?:eva|ai)?\s*(?:light mode|chế độ sáng)/i,
        ],
        intent: 'settings',
        action: 'disable',
        target: 'dark_mode',
        examples: ['Eva, tắt chế độ tối', 'Turn off dark mode', 'Light mode']
      },
      {
        patterns: [
          /(?:eva|ai)?\s*(?:đổi|change|switch)\s*(?:sang |to )?(?:ngôn ngữ|language)?\s*(?:tiếng )?(?:việt|vietnamese)/i,
        ],
        intent: 'settings',
        action: 'change',
        target: 'language_vi',
        examples: ['Eva, đổi sang tiếng Việt', 'Change to Vietnamese', 'Switch language to Vietnamese']
      },
      {
        patterns: [
          /(?:eva|ai)?\s*(?:đổi|change|switch)\s*(?:sang |to )?(?:ngôn ngữ|language)?\s*(?:tiếng )?(?:anh|english)/i,
        ],
        intent: 'settings',
        action: 'change',
        target: 'language_en',
        examples: ['Eva, đổi sang tiếng Anh', 'Change to English', 'Switch language to English']
      },

      // ===== HELP COMMANDS =====
      {
        patterns: [
          /(?:eva|ai)?\s*(?:giúp|help|hướng dẫn|guide|how)/i,
          /(?:eva|ai)?\s*(?:tôi có thể|can i|what can)\s*(?:nói|say|command)/i,
        ],
        intent: 'help',
        action: 'show',
        target: 'commands',
        examples: ['Eva, giúp tôi', 'Help', 'What can I say?', 'Show commands']
      },

      // ===== GENERAL COMMANDS =====
      {
        patterns: [
          /(?:eva|ai)?\s*(?:dừng|stop|cancel|thoát|exit|close)/i,
        ],
        intent: 'general',
        action: 'stop',
        target: 'current',
        examples: ['Eva, dừng lại', 'Stop', 'Cancel', 'Exit']
      },
      {
        patterns: [
          /(?:eva|ai)?\s*(?:làm mới|refresh|reload)/i,
        ],
        intent: 'general',
        action: 'refresh',
        target: 'page',
        examples: ['Eva, làm mới', 'Refresh', 'Reload page']
      },
    ];
  }

  /**
   * Parse câu lệnh giọng nói thành VoiceCommand object
   */
  parseCommand(transcript: string): VoiceCommand | null {
    const normalizedTranscript = transcript.toLowerCase().trim();

    // Thử match với từng pattern
    for (const commandPattern of this.commandPatterns) {
      for (const pattern of commandPattern.patterns) {
        const match = normalizedTranscript.match(pattern);
        if (match) {
          return {
            intent: commandPattern.intent,
            action: commandPattern.action,
            target: commandPattern.target,
            confidence: this.calculateConfidence(normalizedTranscript, pattern),
          };
        }
      }
    }

    // Không match được lệnh nào
    return null;
  }

  /**
   * Tính độ tin cậy của match (0-1)
   */
  private calculateConfidence(transcript: string, pattern: RegExp): number {
    const match = transcript.match(pattern);
    if (!match) return 0;

    // Độ tin cậy dựa trên:
    // 1. Độ dài match so với transcript (càng match nhiều càng tốt)
    // 2. Vị trí match (match từ đầu = tốt hơn)
    
    const matchLength = match[0].length;
    const transcriptLength = transcript.length;
    const matchRatio = matchLength / transcriptLength;

    const matchIndex = match.index || 0;
    const positionScore = 1 - (matchIndex / transcriptLength);

    // Weighted average
    const confidence = (matchRatio * 0.7) + (positionScore * 0.3);

    return Math.min(confidence, 0.99); // Cap at 0.99
  }

  /**
   * Lấy tất cả examples để hiển thị help
   */
  getAllExamples(): { category: string; commands: string[] }[] {
    const categories = [
      { category: 'Điều hướng / Navigation', intent: 'navigate' },
      { category: 'Bài test / Tests', intent: 'test' },
      { category: 'Xuất báo cáo / Export', intent: 'export' },
      { category: 'Cài đặt / Settings', intent: 'settings' },
      { category: 'Trợ giúp / Help', intent: 'help' },
      { category: 'Chung / General', intent: 'general' },
    ];

    return categories.map(cat => ({
      category: cat.category,
      commands: this.commandPatterns
        .filter(p => p.intent === cat.intent)
        .flatMap(p => p.examples),
    }));
  }

  /**
   * Tạo feedback message cho user
   */
  getFeedbackMessage(command: VoiceCommand, language: 'vi' | 'en'): string {
    const isVi = language === 'vi';

    // Navigate commands
    if (command.intent === 'navigate') {
      const targets: Record<string, { vi: string; en: string }> = {
        home: { vi: 'Đang chuyển về trang chủ', en: 'Navigating to home page' },
        history: { vi: 'Đang mở lịch sử', en: 'Opening history' },
        hospitals: { vi: 'Đang tìm bệnh viện', en: 'Finding hospitals' },
        reminders: { vi: 'Đang mở nhắc nhở', en: 'Opening reminders' },
        about: { vi: 'Đang mở trang giới thiệu', en: 'Opening about page' },
      };
      return targets[command.target || '']?.[language] || (isVi ? 'Đang điều hướng' : 'Navigating');
    }

    // Test commands
    if (command.intent === 'test') {
      const targets: Record<string, { vi: string; en: string }> = {
        snellen: { vi: 'Bắt đầu test thị lực', en: 'Starting vision test' },
        colorblind: { vi: 'Bắt đầu test mù màu', en: 'Starting color blind test' },
        astigmatism: { vi: 'Bắt đầu test loạn thị', en: 'Starting astigmatism test' },
        amsler: { vi: 'Bắt đầu test lưới Amsler', en: 'Starting Amsler grid test' },
        duochrome: { vi: 'Bắt đầu test Duochrome', en: 'Starting duochrome test' },
      };
      return targets[command.target || '']?.[language] || (isVi ? 'Đang bắt đầu test' : 'Starting test');
    }

    // Export commands
    if (command.intent === 'export') {
      if (command.action === 'pdf') {
        return isVi ? 'Đang xuất báo cáo PDF' : 'Exporting PDF report';
      }
      return isVi ? 'Đang mở báo cáo' : 'Opening report';
    }

    // Settings commands
    if (command.intent === 'settings') {
      if (command.target === 'dark_mode') {
        return command.action === 'enable'
          ? (isVi ? 'Bật chế độ tối' : 'Enabling dark mode')
          : (isVi ? 'Tắt chế độ tối' : 'Disabling dark mode');
      }
      if (command.target?.startsWith('language_')) {
        const lang = command.target.split('_')[1];
        return isVi ? `Đổi sang tiếng ${lang === 'vi' ? 'Việt' : 'Anh'}` : `Changing to ${lang === 'vi' ? 'Vietnamese' : 'English'}`;
      }
    }

    // Help commands
    if (command.intent === 'help') {
      return isVi ? 'Hiển thị trợ giúp' : 'Showing help';
    }

    // General commands
    if (command.intent === 'general') {
      if (command.action === 'stop') {
        return isVi ? 'Đã dừng' : 'Stopped';
      }
      if (command.action === 'refresh') {
        return isVi ? 'Làm mới trang' : 'Refreshing page';
      }
    }

    return isVi ? 'Đã thực hiện' : 'Done';
  }
}

export const voiceCommandService = new VoiceCommandService();
