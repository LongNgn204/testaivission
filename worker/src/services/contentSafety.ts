/**
 * ============================================================
 * 🛡️ Content Safety (lightweight)
 * ============================================================
 * Basic keyword heuristics to prevent unsafe usage and route emergencies.
 */

export type SafetyResult = {
  allowed: boolean
  category?: 'emergency' | 'self_harm' | 'violence' | 'sexual' | 'illegal' | 'medical_diagnosis'
  message?: string
}

function includesAny(text: string, arr: string[]): boolean {
  const lower = text.toLowerCase()
  return arr.some(k => lower.includes(k))
}

export function evaluateContentSafety(text: string, lang: 'vi' | 'en'): SafetyResult {
  const emergencyVi = ['mất thị lực đột ngột', 'đau mắt dữ dội', 'chấn thương mắt', 'chảy máu', 'bỏng mắt']
  const emergencyEn = ['sudden vision loss', 'severe eye pain', 'eye trauma', 'bleeding', 'chemical burn']

  const selfHarm = ['tự tử', 'tự sát', 'suicide', 'kill myself']
  const violence = ['giết người', 'mua súng', 'bomb', 'kill someone']
  const sexual = ['sex với trẻ em', 'child porn', 'rape']
  const illegal = ['mua ma túy', 'buy drugs', 'counterfeit', 'hack bank']

  const isEmergency = includesAny(text, lang === 'vi' ? emergencyVi : emergencyEn)
  if (isEmergency) {
    return {
      allowed: false,
      category: 'emergency',
      message: lang === 'vi'
        ? 'Dấu hiệu khẩn cấp. Vui lòng tới cơ sở y tế gần nhất hoặc gọi cấp cứu ngay.'
        : 'Emergency indicators detected. Please seek urgent medical care or call emergency services immediately.'
    }
  }

  if (includesAny(text, selfHarm)) {
    return {
      allowed: false,
      category: 'self_harm',
      message: lang === 'vi'
        ? 'Tôi không thể hỗ trợ nội dung này. Nếu bạn đang gặp nguy hiểm, hãy liên hệ người thân hoặc gọi số khẩn cấp ngay.'
        : 'I can’t help with that. If you’re in danger, please contact a trusted person or emergency services now.'
    }
  }

  if (includesAny(text, violence)) {
    return {
      allowed: false,
      category: 'violence',
      message: lang === 'vi'
        ? 'Tôi không thể hỗ trợ nội dung bạo lực. Hãy sử dụng dịch vụ một cách an toàn.'
        : 'I can’t assist with violent content. Please use the service safely.'
    }
  }

  if (includesAny(text, sexual)) {
    return {
      allowed: false,
      category: 'sexual',
      message: lang === 'vi'
        ? 'Nội dung không phù hợp. Vui lòng đặt câu hỏi khác.'
        : 'Inappropriate content. Please ask something else.'
    }
  }

  if (includesAny(text, illegal)) {
    return {
      allowed: false,
      category: 'illegal',
      message: lang === 'vi'
        ? 'Tôi không thể hỗ trợ hoạt động bất hợp pháp.'
        : 'I cannot assist with illegal activities.'
    }
  }

  // Encourage safe medical behavior for diagnosis/treatment requests
  const diagVi = ['chẩn đoán', 'kê đơn', 'thuốc gì', 'điều trị ngay', 'phẫu thuật ngay']
  const diagEn = ['diagnose me', 'prescribe', 'what drug', 'treat now', 'immediate surgery']
  if (includesAny(text, lang === 'vi' ? diagVi : diagEn)) {
    return {
      allowed: true,
      category: 'medical_diagnosis',
      message: lang === 'vi'
        ? 'Lưu ý: Eva không thay thế bác sĩ. Tôi sẽ cung cấp thông tin giáo dục sức khỏe mắt, không phải chẩn đoán hay đơn thuốc.'
        : 'Note: Eva does not replace a doctor. I’ll provide general eye health information, not a diagnosis or prescription.'
    }
  }

  return { allowed: true }
}

