# Exact Code Fixes Needed

## Fix #1: VoiceInterface - Add AIService Import

**File:** `components/vision-coach/VoiceInterface.tsx`

**Add at top of file (after other imports):**
```typescript
import { AIService } from '../../services/aiService';
```

**Add inside component (after other refs):**
```typescript
const aiService = new AIService();
```

---

## Fix #2: VoiceInterface - Fix API Key Check

**File:** `components/vision-coach/VoiceInterface.tsx` (line ~170)

**Replace this:**
```typescript
const startSession = useCallback(async () => {
    if (!process.env.API_KEY || sessionPromiseRef.current) return;
    setStatus('connecting');

    aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
```

**With this:**
```typescript
const startSession = useCallback(async () => {
    const apiKey = (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_GEMINI_API_KEY) 
      || (typeof process !== 'undefined' && (process as any)?.env?.API_KEY);
    
    if (!apiKey || sessionPromiseRef.current) return;
    setStatus('connecting');

    aiRef.current = new GoogleGenAI({ apiKey });
```

---

## Fix #3: ChatInterface - Fix AIService Import

**File:** `components/vision-coach/ChatInterface.tsx`

**Add at top of file (after other imports):**
```typescript
import { AIService } from '../../services/aiService';
```

**Replace this (line ~35):**
```typescript
const handleChatSubmit = useCallback(async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = chatInput.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setStatus('thinking');
    
    try {
        const history = storageService.getTestHistory();
        const context = history.length > 0 ? history[0] : null;
        
        const { AIService } = await import('../../services/aiService');
        const svc = new AIService();
        const response = await svc.chat(userMessage, context, userProfile, language);
```

**With this:**
```typescript
const handleChatSubmit = useCallback(async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = chatInput.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setStatus('thinking');
    
    try {
        const history = storageService.getTestHistory();
        const context = history.length > 0 ? history[0] : null;
        
        const svc = new AIService();
        const response = await svc.chat(userMessage, context, userProfile, language);
```

---

## Fix #4: VoiceInterface - Add Microphone Permission Handling

**File:** `components/vision-coach/VoiceInterface.tsx` (line ~180)

**Replace this:**
```typescript
try {
    mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
} catch (error) {
    console.error("Microphone access denied:", error);
    setStatus('idle');
    return;
}
```

**With this:**
```typescript
try {
    mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
} catch (error: any) {
    let errorMsg = 'Microphone error';
    
    if (error.name === 'NotAllowedError') {
        errorMsg = language === 'vi' 
            ? 'Cần cấp quyền truy cập microphone' 
            : 'Microphone permission required';
        alert(errorMsg);
    } else if (error.name === 'NotFoundError') {
        errorMsg = language === 'vi' 
            ? 'Không tìm thấy microphone' 
            : 'No microphone found';
        alert(errorMsg);
    } else if (error.name === 'NotReadableError') {
        errorMsg = language === 'vi' 
            ? 'Microphone đang được sử dụng bởi ứng dụng khác' 
            : 'Microphone is in use by another application';
        alert(errorMsg);
    }
    
    console.error("Microphone error:", error);
    setStatus('idle');
    onClose();
    return;
}
```

---

## Fix #5: Add Timeout Wrapper Utility

**File:** `utils/apiUtils.ts` (NEW FILE)

```typescript
/**
 * Wraps a promise with a timeout
 * @param promise The promise to wrap
 * @param ms Timeout in milliseconds
 * @param timeoutMessage Optional custom timeout message
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  timeoutMessage: string = 'Request timeout'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutMessage)), ms)
    ),
  ]);
}

/**
 * Retries a function with exponential backoff
 * @param fn Function to retry
 * @param maxAttempts Maximum number of attempts
 * @param delayMs Initial delay in milliseconds
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        const delay = delayMs * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}
```

---

## Fix #6: ChatInterface - Add API Key Validation

**File:** `components/vision-coach/ChatInterface.tsx`

**Add this useEffect after other useEffects:**
```typescript
// Check API key on mount
useEffect(() => {
  const hasApiKey = (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_GEMINI_API_KEY)
    || (typeof process !== 'undefined' && (process as any)?.env?.API_KEY);
  
  if (!hasApiKey) {
    const errorMsg = language === 'vi' 
      ? 'API key chưa được cấu hình. Vui lòng kiểm tra biến môi trường VITE_GEMINI_API_KEY.' 
      : 'API key not configured. Please check VITE_GEMINI_API_KEY environment variable.';
    
    setChatHistory([{ 
      role: 'bot', 
      text: errorMsg
    }]);
    setChatInput('');
  }
}, [language]);
```

---

## Fix #7: ChatInterface - Add Error State & Fallback UI

**File:** `components/vision-coach/ChatInterface.tsx`

**Add state:**
```typescript
const [error, setError] = useState<string | null>(null);
```

**Update handleChatSubmit:**
```typescript
const handleChatSubmit = useCallback(async () => {
    if (!chatInput.trim()) return;
    
    setError(null); // Clear previous error
    const userMessage = chatInput.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setStatus('thinking');
    
    try {
        const history = storageService.getTestHistory();
        const context = history.length > 0 ? history[0] : null;
        
        const svc = new AIService();
        const response = await svc.chat(userMessage, context, userProfile, language);
        
        setChatHistory(prev => [...prev, { role: 'bot', text: response }]);
        setStatus('idle');
    } catch (error) {
        console.error('Chat error:', error);
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        setError(errorMsg);
        
        const fallbackMsg = language === 'vi' 
            ? 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.' 
            : 'Sorry, an error occurred. Please try again.';
        setChatHistory(prev => [...prev, { role: 'bot', text: fallbackMsg }]);
        setStatus('idle');
    }
}, [chatInput, language, userProfile]);
```

**Add error display in JSX (before Input Area):**
```typescript
{/* Error Message */}
{error && (
  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mx-4 mb-4">
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1">
        <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
      </div>
      <button
        onClick={() => setError(null)}
        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex-shrink-0"
      >
        ✕
      </button>
    </div>
  </div>
)}
```

---

## Fix #8: Create Error Boundary Component

**File:** `components/vision-coach/ErrorBoundary.tsx` (NEW FILE)

```typescript
import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class VisionCoachErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('VisionCoach Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="fixed bottom-8 right-8 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 rounded-lg p-4 max-w-sm">
            <h3 className="font-bold text-red-800 dark:text-red-200 mb-2">
              Vision Coach Error
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mb-3">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
            >
              Reload
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

---

## Fix #9: Wrap VisionCoach with Error Boundary

**File:** `components/VisionCoach.tsx`

**Replace the return statement:**
```typescript
// OLD:
return (
  <>
    {/* Floating action buttons */}
    ...
  </>
);

// NEW:
import { VisionCoachErrorBoundary } from './vision-coach/ErrorBoundary';

return (
  <VisionCoachErrorBoundary>
    <>
      {/* Floating action buttons */}
      ...
    </>
  </VisionCoachErrorBoundary>
);
```

---

## Summary of Changes

| File | Type | Changes |
|------|------|---------|
| VoiceInterface.tsx | Modify | Add AIService import, fix API key check, add permission handling |
| ChatInterface.tsx | Modify | Fix AIService import, add API validation, add error handling |
| VisionCoach.tsx | Modify | Wrap with ErrorBoundary |
| apiUtils.ts | Create | Add withTimeout and withRetry utilities |
| ErrorBoundary.tsx | Create | Create error boundary component |

**Total Files Changed:** 3 modified + 2 new = 5 files  
**Estimated Time:** 1-2 hours  
**Difficulty:** Medium (straightforward fixes, no complex logic)

---

## Testing Checklist

After applying fixes, test:

- [ ] Voice feature works with API key
- [ ] Chat feature works with API key
- [ ] Both hide when API key missing
- [ ] Microphone permission dialog shows when denied
- [ ] API timeout shows error after 10 seconds
- [ ] Chat error shows retry button
- [ ] Error boundary catches exceptions
- [ ] No console errors in browser dev tools
- [ ] Works in both VI and EN languages
- [ ] Mobile responsive

