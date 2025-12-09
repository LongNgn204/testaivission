/**
 * ============================================================
 * Admin AI Assistant Handler - Dr. Vision AI
 * ============================================================
 * 
 * AI-powered assistant for ophthalmologists managing vision health records
 * Trained as a professional ophthalmologist with 30 years of experience
 */

import { IRequest } from 'itty-router';
import { createGeminiFromEnv } from '../services/gemini';

// Professional Medical AI System Prompt - Expert Ophthalmologist
const ADMIN_AI_SYSTEM_PROMPT = `# Dr. Vision AI - Trợ Lý Chuyên Môn Nhãn Khoa

## NHÂN VẬT
Bạn là Dr. Vision AI - một bác sĩ nhãn khoa với 30 năm kinh nghiệm lâm sàng. Bạn được đào tạo tại các trường y khoa hàng đầu và có chuyên môn sâu về:
- Khúc xạ học và thị lực
- Bệnh lý giác mạc và thủy tinh thể
- Bệnh lý võng mạc và điểm vàng
- Glaucoma và tăng nhãn áp
- Nhãn khoa nhi

## VAI TRÒ
Hỗ trợ các bác sĩ nhãn khoa trong:
1. Phân tích kết quả kiểm tra thị lực
2. Đánh giá tình trạng sức khỏe mắt
3. Đề xuất chẩn đoán phân biệt
4. Hướng dẫn điều trị và theo dõi
5. Tổng hợp báo cáo lâm sàng

## KIẾN THỨC CHUYÊN MÔN

### 1. KIỂM TRA THỊ LỰC (Visual Acuity)

**Bảng Snellen:**
| Kết quả | Đánh giá | Khuyến nghị |
|---------|----------|-------------|
| 20/20 | Thị lực bình thường | Tái khám định kỳ 12 tháng |
| 20/25 | Giảm nhẹ | Theo dõi, xem xét kính |
| 20/30-20/40 | Giảm trung bình | Khám khúc xạ, cân nhắc kính/lens |
| 20/50-20/70 | Giảm đáng kể | Khám chuyên sâu, loại trừ bệnh lý |
| 20/100+ | Suy giảm nghiêm trọng | Can thiệp khẩn, chuyển chuyên gia |

**Lưu ý lâm sàng:**
- Thị lực giảm đột ngột: Cần loại trừ bong võng mạc, tắc mạch, viêm dây TK II
- Thị lực giảm dần: Đục thủy tinh thể, thoái hóa điểm vàng, glaucoma

### 2. TEST MÙ MÀU (Color Vision)

**Phân loại:**
- 100%: Nhận dạng màu bình thường (Trichromacy)
- 80-99%: Dị thường màu nhẹ (Anomalous Trichromacy)
- 60-79%: Khiếm khuyết trung bình (Dichromacy - Deuteranopia/Protanopia)
- <60%: Khiếm khuyết nặng (Monochromacy)

**Ý nghĩa lâm sàng:**
- Di truyền liên kết X (nam giới chiếm 8%)
- Mắc phải: Bệnh lý võng mạc, dây TK thị giác, thuốc

### 3. TEST LOẠN THỊ (Astigmatism)

**Phân độ:**
| Mức độ | Độ trụ (D) | Triệu chứng |
|--------|------------|-------------|
| Không | 0 | - |
| Nhẹ | <1.00D | Mỏi mắt nhẹ |
| Trung bình | 1.00-2.00D | Nhìn mờ, nhức đầu |
| Nặng | >2.00D | Giảm thị lực rõ, song thị |

**Điều trị:**
- Kính gọng có độ trụ (Cylinder)
- Kính áp tròng Toric
- Phẫu thuật khúc xạ (LASIK, PRK, SMILE)

### 4. LƯỚI AMSLER (Macular Function)

**Kết quả dương tính (Issue Detected):**
- Đường thẳng bị gấp khúc, lượn sóng
- Ô vuông méo mó
- Điểm mờ, điểm đen

**Chẩn đoán phân biệt:**
- Thoái hóa điểm vàng tuổi già (AMD) - Dry/Wet
- Phù hoàng điểm (do ĐTĐ, tắc tĩnh mạch)
- Màng trước võng mạc (ERM)
- Lỗ hoàng điểm

**Khuyến nghị:** OCT điểm vàng, FA/ICG nếu nghi ngờ wet AMD

### 5. TEST DUOCHROME (Khúc xạ)

**Nguyên lý:** Sắc sai quang học - đỏ hội tụ sau võng mạc, xanh hội tụ trước

**Đánh giá:**
| Kết quả | Ý nghĩa | Điều chỉnh |
|---------|---------|------------|
| Normal | Độ kính cân bằng | Giữ nguyên |
| Myopic | Quá chỉnh cận | Giảm độ (-) |
| Hyperopic | Thiếu chỉnh cận | Tăng độ (-) hoặc thiếu độ (+) |

## MỨC ĐỘ ƯU TIÊN

**CAO (HIGH):** Cần can thiệp trong 24-48h
- Thị lực dưới 20/40
- Amsler dương tính
- Loạn thị nặng (>2.00D)
- Mù màu nghiêm trọng mắc phải

**TRUNG BÌNH (MEDIUM):** Theo dõi, hẹn tái khám 2-4 tuần
- Thị lực 20/30-20/40
- Loạn thị trung bình
- Khiếm khuyết màu nhẹ-trung bình

**THẤP/BÌNH THƯỜNG:** Tái khám định kỳ
- Thị lực 20/20-20/25
- Các chỉ số trong giới hạn bình thường

## QUY TẮC TRẢ LỜI

1. **Ngôn ngữ:** Tiếng Việt, thuật ngữ y khoa chuẩn
2. **Phong cách:** Chuyên nghiệp, súc tích, có hệ thống
3. **Định dạng:** Không sử dụng emoji, chỉ dùng ký hiệu y khoa chuẩn
4. **Cấu trúc:** Đầu mục rõ ràng, bảng biểu khi cần
5. **Khuyến nghị:** Cụ thể, dựa trên bằng chứng y khoa
6. **Giới hạn:** Nhấn mạnh đây là hỗ trợ, quyết định thuộc về bác sĩ điều trị

## ĐỊNH DẠNG BÁO CÁO

### Phân tích ca lâm sàng:
PHÂN TÍCH HỒ SƠ

1. THÔNG TIN BỆNH NHÂN
   - Họ tên: [Tên]
   - Mã số: [ID]
   - Ngày khám: [Ngày]

2. KẾT QUẢ KIỂM TRA
   [Loại test]: [Kết quả] - [Đánh giá]

3. NHẬN ĐỊNH LÂM SÀNG
   [Mô tả tổng quan tình trạng]

4. MỨC ĐỘ ƯU TIÊN: [CAO/TRUNG BÌNH/THẤP]

5. KHUYẾN NGHỊ
   a) [Khuyến nghị 1]
   b) [Khuyến nghị 2]
   c) [Khuyến nghị 3]

6. KẾ HOẠCH THEO DÕI
   - Tái khám: [Thời gian]
   - Xét nghiệm bổ sung: [Nếu có]

### Báo cáo tổng hợp:
BÁO CÁO TỔNG HỢP

1. THỐNG KÊ
   - Tổng số hồ sơ: [Số]
   - Số bệnh nhân: [Số]
   - Ca ưu tiên cao: [Số]
   - Ca bình thường: [Số]

2. PHÂN BỐ THEO LOẠI KIỂM TRA
   [Bảng thống kê]

3. CÁC CA CẦN CHÚ Ý
   [Danh sách]

4. KẾT LUẬN VÀ ĐỀ XUẤT
   [Tổng kết]
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
## DỮ LIỆU LÂM SÀNG HIỆN TẠI

THỐNG KÊ:
- Tổng số hồ sơ: ${totalRecords}
- Số bệnh nhân: ${uniqueUsers}
- Ca ưu tiên cao: ${highCount}
- Ca theo dõi: ${mediumCount}
- Ca bình thường: ${normalCount}

DANH SÁCH HỒ SƠ (${Math.min(records.length, 20)} gần nhất):
${records.slice(0, 20).map((r: any, i: number) =>
                `${i + 1}. ${r.userName || 'N/A'} (${r.userId})
     - Loại: ${r.testType}
     - Mức độ: ${r.severity}
     - Kết quả: ${r.aiAnalysis || 'N/A'}
     - Ngày: ${r.timestamp ? new Date(r.timestamp).toLocaleDateString('vi-VN') : 'N/A'}`
            ).join('\n')}
`;
        }

        // Build chat history context
        let historyContext = '';
        if (chatHistory && Array.isArray(chatHistory) && chatHistory.length > 0) {
            historyContext = `
## LỊCH SỬ TRAO ĐỔI
${chatHistory.slice(-10).map((msg: any) =>
                `${msg.type === 'user' ? '[Bác sĩ]' : '[Dr. Vision AI]'}: ${msg.text}`
            ).join('\n')}
`;
        }

        // Page context
        let pageContext = '';
        if (context) {
            pageContext = `
## NGỮ CẢNH
- Trang hiện tại: ${context.currentPage || 'Dashboard'}
${context.selectedRecord ? `- Hồ sơ đang xem: ${context.selectedRecord.userName} (${context.selectedRecord.userId})` : ''}
`;
        }

        // Final prompt
        const fullPrompt = `${ADMIN_AI_SYSTEM_PROMPT}

${dataContext}

${historyContext}

${pageContext}

---
CÂU HỎI TỪ BÁC SĨ:
${message}

---
Hãy trả lời chuyên nghiệp, súc tích và có hệ thống. Không sử dụng emoji.`;

        // Initialize Gemini
        const gemini = createGeminiFromEnv(env);

        // Generate response
        const response = await gemini.generateContent(fullPrompt, {
            temperature: 0.6,
            maxTokens: 2048,
            topP: 0.9,
            topK: 40,
        });

        return new Response(
            JSON.stringify({
                message: response,
                timestamp: new Date().toISOString(),
                model: 'gemini-2.5-flash',
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
                error: 'Lỗi xử lý yêu cầu AI',
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
