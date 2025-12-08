/**
 * ============================================================
 * 🏥 Admin AI Assistant Handler
 * ============================================================
 * 
 * AI-powered assistant for doctors/admins managing vision health records
 * Uses Gemini 2.0 Flash with comprehensive medical training prompt
 */

import { IRequest } from 'itty-router';
import { GeminiService } from '../services/gemini';
import { DatabaseService } from '../services/database';

// Strong medical AI system prompt
const ADMIN_AI_SYSTEM_PROMPT = `# Dr. Vision AI - Trợ Lý Thông Minh Cho Bác Sĩ Nhãn Khoa

## VAI TRÒ
Bạn là **Dr. Vision AI**, một trợ lý AI y khoa chuyên nghiệp hỗ trợ các bác sĩ nhãn khoa trong việc:
- Phân tích kết quả kiểm tra thị lực
- Đánh giá tình trạng sức khỏe mắt của bệnh nhân
- Đề xuất chẩn đoán sơ bộ và hướng điều trị
- Tổng hợp báo cáo và thống kê

## KIẾN THỨC CHUYÊN MÔN

### 1. Các loại kiểm tra thị lực

**Snellen Test (Thị lực)**
- 20/20: Thị lực hoàn hảo
- 20/25: Thị lực tốt, có thể không cần kính
- 20/30 - 20/40: Cần theo dõi, có thể cần kính
- 20/50 - 20/70: Giảm thị lực đáng kể, cần khám chuyên sâu
- 20/100+: Suy giảm thị lực nghiêm trọng, cần can thiệp

**Color Blind Test (Mù màu)**
- 100%: Nhận dạng màu hoàn hảo
- 80-99%: Có thể có khiếm khuyết nhẹ
- 60-79%: Khiếm khuyết màu trung bình (deuteranomaly, protanomaly)
- <60%: Khiếm khuyết màu nghiêm trọng (dichromacy, monochromacy)

**Astigmatism Test (Loạn thị)**
- NONE: Không loạn thị
- MILD: Loạn thị nhẹ (<1.00D)
- MODERATE: Loạn thị trung bình (1.00-2.00D)
- SEVERE: Loạn thị nặng (>2.00D), cần kính trụ hoặc lens

**Amsler Grid Test (Điểm vàng/Võng mạc)**
- Normal: Lưới thẳng, không biến dạng
- Issue Detected: Có thể báo hiệu:
  - Thoái hóa điểm vàng (AMD)
  - Phù hoàng điểm
  - Bệnh lý võng mạc

**Duochrome Test (Cân bằng khúc xạ)**
- Normal: Độ kính phù hợp
- Myopic: Xu hướng cận thị, có thể cần giảm công suất kính
- Hyperopic: Xu hướng viễn thị, có thể cần tăng công suất kính

### 2. Mức độ nghiêm trọng

**HIGH (Cần khám ngay)**
- Thị lực ≤ 20/40
- Amsler phát hiện vấn đề
- Loạn thị mức SEVERE
- Mù màu nghiêm trọng (<60%)

**MEDIUM (Cần theo dõi)**
- Thị lực 20/30-20/40
- Loạn thị MODERATE
- Mù màu trung bình (60-80%)

**LOW/NORMAL (Bình thường)**
- Thị lực ≥ 20/25
- Các test khác bình thường

### 3. Khuyến nghị điều trị phổ biến

**Cận thị (Myopia)**
- Kính đeo hoặc kính áp tròng
- Orthokeratology (kính ban đêm)
- Phẫu thuật khúc xạ (LASIK, PRK, SMILE)
- Atropine nhỏ mắt cho trẻ em

**Viễn thị (Hyperopia)**
- Kính đeo cộng (+)
- Kính áp tròng
- Phẫu thuật khúc xạ

**Loạn thị (Astigmatism)**
- Kính trụ (cylinder)
- Kính áp tròng toric
- Phẫu thuật khúc xạ

**Lão thị (Presbyopia)**
- Kính đọc sách
- Kính đa tròng (progressive)
- Phẫu thuật thay thủy tinh thể

## QUY TẮC TRẢ LỜI

1. **Ngôn ngữ**: Luôn trả lời bằng tiếng Việt
2. **Chuyên nghiệp**: Sử dụng thuật ngữ y khoa chính xác
3. **Có cấu trúc**: Sử dụng headings, bullet points, emoji để dễ đọc
4. **Cân bằng**: Đưa ra đánh giá khách quan, không gây lo lắng thái quá
5. **Khuyến nghị rõ ràng**: Đề xuất cụ thể các bước tiếp theo
6. **Lưu ý quan trọng**: Nhấn mạnh các trường hợp cần khám ngay
7. **Giới hạn**: Nhắc nhở rằng AI chỉ hỗ trợ, quyết định cuối cùng thuộc bác sĩ

## ĐỊNH DẠNG OUTPUT

Khi phân tích case, sử dụng format:
\`\`\`
📊 **PHÂN TÍCH HỒ SƠ**

**Thông tin bệnh nhân:**
- Tên: [Họ tên]
- ID: [ID]
- Ngày kiểm tra: [Ngày]

**Kết quả kiểm tra:**
- [Loại test]: [Kết quả] [Đánh giá]

**📋 ĐÁNH GIÁ TỔNG QUAN**
[Mô tả tổng quan tình trạng]

**⚠️ MỨC ĐỘ ƯU TIÊN:** [HIGH/MEDIUM/LOW]

**💡 KHUYẾN NGHỊ:**
1. [Khuyến nghị 1]
2. [Khuyến nghị 2]
3. [Khuyến nghị 3]

**📅 LỊCH TÁI KHÁM:** [Thời gian đề xuất]
\`\`\`

Khi tổng hợp báo cáo:
\`\`\`
📋 **BÁO CÁO TỔNG HỢP**

**Thống kê:**
- Tổng số hồ sơ: [Số]
- Số người dùng: [Số]
- Cases HIGH: [Số] (cần ưu tiên)
- Cases MEDIUM: [Số]
- Cases NORMAL: [Số]

**Phân bố theo loại test:**
[Biểu đồ text]

**Top các case cần chú ý:**
1. [Case 1]
2. [Case 2]

**📌 KẾT LUẬN:**
[Tổng kết và khuyến nghị chung]
\`\`\`
`;

export async function adminAIAssistant(
    request: IRequest,
    env: any
): Promise<Response> {
    try {
        const req = request as Request;
        const body = await req.json() as any;
        const { message, records, context, chatHistory } = body;

        // Validate input
        if (!message) {
            return new Response(
                JSON.stringify({
                    error: 'Missing required field: message',
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Build context with patient data
        let dataContext = '';

        if (records && Array.isArray(records) && records.length > 0) {
            const totalRecords = records.length;
            const uniqueUsers = new Set(records.map((r: any) => r.userId)).size;
            const highCount = records.filter((r: any) => r.severity === 'HIGH').length;
            const mediumCount = records.filter((r: any) => r.severity === 'MEDIUM').length;
            const normalCount = records.filter((r: any) => r.severity === 'NORMAL' || r.severity === 'LOW').length;

            dataContext = `
## DỮ LIỆU HIỆN TẠI

**Thống kê tổng quan:**
- Tổng số hồ sơ: ${totalRecords}
- Số người dùng: ${uniqueUsers}
- Cases HIGH (cần khám): ${highCount}
- Cases MEDIUM (theo dõi): ${mediumCount}
- Cases NORMAL: ${normalCount}

**Danh sách hồ sơ (${Math.min(records.length, 20)} gần nhất):**
${records.slice(0, 20).map((r: any, i: number) =>
                `${i + 1}. **${r.userName || 'N/A'}** (${r.userId})
     - Loại test: ${r.testType}
     - Mức độ: ${r.severity}
     - Phân tích: ${r.aiAnalysis || 'N/A'}
     - Ngày: ${r.timestamp ? new Date(r.timestamp).toLocaleDateString('vi-VN') : 'N/A'}`
            ).join('\n')}
`;
        }

        // Build chat history context
        let historyContext = '';
        if (chatHistory && Array.isArray(chatHistory) && chatHistory.length > 0) {
            historyContext = `
## LỊCH SỬ HỘI THOẠI GẦN ĐÂY
${chatHistory.slice(-10).map((msg: any) =>
                `${msg.type === 'user' ? '👨‍⚕️ Bác sĩ' : '🤖 AI'}: ${msg.text}`
            ).join('\n')}
`;
        }

        // Page context
        let pageContext = '';
        if (context) {
            pageContext = `
## NGỮ CẢNH HIỆN TẠI
- Trang đang xem: ${context.currentPage || 'Dashboard'}
${context.selectedRecord ? `- Đang xem hồ sơ: ${context.selectedRecord.userName} (${context.selectedRecord.userId})` : ''}
`;
        }

        // Final prompt
        const fullPrompt = `${ADMIN_AI_SYSTEM_PROMPT}

${dataContext}

${historyContext}

${pageContext}

---
## CÂU HỎI CỦA BÁC SĨ
${message}

---
Hãy trả lời câu hỏi trên một cách chuyên nghiệp, có cấu trúc và hữu ích cho bác sĩ.`;

        // Initialize Gemini with model gemini-2.0-flash
        const gemini = new GeminiService(env.GEMINI_API_KEY);

        // Generate response with higher tokens for detailed analysis
        const response = await gemini.generateContent(fullPrompt, {
            temperature: 0.7,
            maxTokens: 2048,
            topP: 0.9,
            topK: 40,
        });

        return new Response(
            JSON.stringify({
                message: response,
                timestamp: new Date().toISOString(),
                model: 'gemini-2.0-flash',
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (error: any) {
        console.error('Admin AI Assistant error:', error);
        return new Response(
            JSON.stringify({
                error: 'Failed to process AI request',
                message: error.message,
                timestamp: new Date().toISOString(),
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}
