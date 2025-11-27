/**
 * ============================================================
 * 💬 Chat Prompts
 * ============================================================
 * 
 * Prompts for chat conversations
 */

export function createChatPrompt(
  message: string,
  lastTestResult: any,
  userProfile: any,
  language: 'vi' | 'en'
): string {
  const isVi = language === 'vi';

  const systemInstruction = isVi
    ? `Bạn là Bác sĩ Eva - Trợ lý Bác sĩ Chuyên khoa Nhãn khoa thông minh.

PHONG CÁCH TRẢ LỜI:
- Chuyên nghiệp nhưng thân thiện, dễ hiểu, như một người bạn bác sĩ.
- Trả lời ngắn gọn (50-100 từ) nhưng đầy đủ thông tin.
- Dùng thuật ngữ y khoa kèm giải thích đơn giản.
- Nếu cần khám bác sĩ, nói rõ lý do và mức độ khẩn cấp.
- Luôn dựa trên bằng chứng y khoa.
- Thể hiện sự đồng cảm và quan tâm.`
    : `You are Dr. Eva - AI Medical Assistant specializing in Ophthalmology.

RESPONSE STYLE:
- Professional but friendly and easy to understand, like a doctor friend.
- Concise (50-100 words) but complete.
- Use medical terms with simple explanations.
- If medical consultation needed, explain why and urgency level.
- Always based on medical evidence.
- Show empathy and care.`;

  let contextInfo = '';

  if (lastTestResult) {
    contextInfo += isVi
      ? `\n\nKẾT QUẢ TEST GẦN NHẤT:\nLoại test: ${lastTestResult.testType}\nNgày: ${new Date(lastTestResult.date).toLocaleDateString('vi-VN')}\nKết quả: ${JSON.stringify(lastTestResult.resultData)}`
      : `\n\nLATEST TEST RESULT:\nTest type: ${lastTestResult.testType}\nDate: ${new Date(lastTestResult.date).toLocaleDateString('en-US')}\nResult: ${JSON.stringify(lastTestResult.resultData)}`;
  }

  if (userProfile) {
    contextInfo += isVi
      ? `\n\nHỒ SƠ NGƯỜI DÙNG:\nLàm việc với máy tính: ${userProfile.worksWithComputer}\nĐeo kính: ${userProfile.wearsGlasses}\nMục tiêu: ${userProfile.goal}`
      : `\n\nUSER PROFILE:\nComputer work: ${userProfile.worksWithComputer}\nWears glasses: ${userProfile.wearsGlasses}\nGoal: ${userProfile.goal}`;
  }

  return `${systemInstruction}${contextInfo}\n\n${isVi ? 'CÂU HỎI' : 'QUESTION'}: ${message}`;
}

