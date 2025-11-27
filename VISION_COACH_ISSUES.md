# VisionCoach Component - Issues Found

## [object Object]

### 1. VoiceInterface - Missing AIService Import
**File:** `components/vision-coach/VoiceInterface.tsx` (Line ~200)
```typescript
// ❌ WRONG - aiService không được khai báo
const tipText = await aiService.generateProactiveTip(...)

// ✅ FIX - Thêm import
import { AIService } from '../../services/aiService';
const aiService = new AIService();
```

### 2. VoiceInterface - Wrong API Key Check
**File:** `components/vision-coach/VoiceInterface.tsx` (Line ~170)
```typescript
// ❌ WRONG - Vite dùng import.meta.env, không phải process.env
if (!process.env.API_KEY || sessionPromiseRef.current) return;

// ✅ FIX
const apiKey = (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_GEMINI_API_KEY) 
  || (typeof process !== 'undefined' && (process as any)?.env?.API_KEY);
if (!apiKey || sessionPromiseRef.current) return;
aiRef.current = new GoogleGenAI({ apiKey });
```

### 3. ChatInterface - Wrong Import Path
**File:** `components/vision-coach/ChatInterface.tsx` (Line ~35)
```typescript
// ❌ WRONG - AIService không có named export
const { AIService } = await import('../../services/aiService');

// ✅ FIX
import { AIService } from '../../services/aiService';
// Trong handleChatSubmit:
const svc = new AIService();
```

### 4. VoiceInterface - No Microphone Permission Handling
**File:** `components/vision-coach/VoiceInterface.tsx` (Line ~180)
```typescript
// ❌ WRONG - Chỉ có console.error khi user từ chối
try {
  mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
} catch (error) {
  console.error("Microphone access denied:", error);
  setStatus('idle');
  return;
}

// ✅ FIX - Thêm xử lý chi tiết
try {
  mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
} catch (error: any) {
  if (error.name === 'NotAllowedError') {
    alert(language === 'vi' ? 'Cần cấp quyền microphone' : 'Microphone permission required');
  } else if (error.name === 'NotFoundError') {
    alert(language === 'vi' ? 'Không tìm thấy microphone' : 'No microphone found');
  }
  setStatus('idle');
  onClose();
  return;
}
```

## 🟠 HIGH PRIORITY ISSUES

### 5. No Timeout for API Calls
Both VoiceInterface and ChatInterface can hang indefinitely if API doesn't respond.

**Fix:** Add timeout wrapper
```typescript
const withTimeout = (promise: Promise<any>, ms: number) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('API Timeout')), ms)
    )
  ]);
};
```

### 6. No Error Boundary
If VoiceInterface or ChatInterface crashes, entire app crashes.

**Fix:** Create ErrorBoundary component
```typescript
// components/vision-coach/ErrorBoundary.tsx
export class VisionCoachErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return <div>Error loading Vision Coach</div>;
    }
    return this.props.children;
  }
}
```

## 🟡 MEDIUM PRIORITY ISSUES

### 7. ChatInterface - No API Key Validation
```typescript
// ✅ ADD - Check if API key exists before using AIService
useEffect(() => {
  const hasApiKey = (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_GEMINI_API_KEY)
    || (typeof process !== 'undefined' && (process as any)?.env?.API_KEY);
  
  if (!hasApiKey) {
    setChatHistory([{ 
      role: 'bot', 
      text: language === 'vi' ? 'API key chưa được cấu hình' : 'API key not configured' 
    }]);
  }
}, [language]);
```

### 8. No Fallback UI for Errors
ChatInterface should show retry button on error.

```typescript
// ✅ ADD
const [error, setError] = useState<string | null>(null);

{error && (
  <div className="p-4 bg-red-100 text-red-700 rounded">
    <p>{error}</p>
    <button onClick={() => { setError(null); setChatHistory([]); }}>
      {language === 'vi' ? 'Thử lại' : 'Retry'}
    </button>
  </div>
)}
```

## 📋 CHECKLIST

- [ ] Add AIService import to VoiceInterface
- [ ] Fix API key check in VoiceInterface
- [ ] Fix AIService import in ChatInterface
- [ ] Add microphone permission handling
- [ ] Add timeout handling for API calls
- [ ] Create ErrorBoundary component
- [ ] Add API key validation in ChatInterface
- [ ] Add fallback UI for errors
- [ ] Test with API key missing
- [ ] Test with microphone denied
- [ ] Test with API timeout

## ⏱️ Estimated Fix Time: 1-2 hours

**Critical fixes (30 min):** Issues 1-3
**High priority (30 min):** Issues 4-5
**Medium priority (30 min):** Issues 6-8

