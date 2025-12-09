# 🔧 OpenRouter Technical Implementation Details

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Test Components (SnellenTest, ColorBlindTest, etc.)            │
│         ↓                                                         │
│  ChatbotService (services/chatbotService.ts)                    │
│         ↓                                                         │
│  openRouterService (services/openRouterService.ts)              │
│         ↓                                                         │
│  fetch() → OpenRouter API (https://openrouter.ai/api/v1/...)    │
│         ↓                                                         │
│  AIReport / DashboardInsights / Chat Response                   │
│         ↓                                                         │
│  StorageService (localStorage)                                  │
│         ↓                                                         │
│  Display Components (ReportDisplayContent, DashboardContent)    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints Used

### 1. Chat Completions
**Endpoint:** `POST https://openrouter.ai/api/v1/chat/completions`

**Used for:**
- Chat with Dr. Eva
- Report generation
- Dashboard insights
- Weekly routine
- Proactive tips

**Request Format:**
```json
{
  "model": "tngtech/deepseek-r1t2-chimera:free",
  "messages": [
    {
      "role": "system",
      "content": "You are Dr. Eva, an ophthalmologist..."
    },
    {
      "role": "user",
      "content": "User message here"
    }
  ],
  "max_tokens": 1024,
  "temperature": 0.7
}
```

**Response Format:**
```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Response text here"
      }
    }
  ]
}
```

---

## Service Layer Architecture

### openRouterService.ts

**Purpose:** Direct API calls to OpenRouter

**Key Functions:**

#### 1. `callOpenRouter(systemPrompt, userMessage, options)`
```typescript
async function callOpenRouter(
    systemPrompt: string,
    userMessage: string,
    options: { maxTokens?: number; temperature?: number } = {}
): Promise<string>
```

**Flow:**
1. Check if API key exists
2. Log API call details
3. Send POST request to OpenRouter
4. Parse response
5. Return content or throw error

**Error Handling:**
```typescript
if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error((error as any)?.error?.message || `OpenRouter API error: ${response.status}`);
}
```

#### 2. `openRouterChat(message, context, userProfile, language)`
```typescript
async function openRouterChat(
    message: string,
    context: StoredTestResult | null,
    userProfile: AnswerState | null,
    language: 'vi' | 'en'
): Promise<string>
```

**Flow:**
1. Build user message with context (if available)
2. Get system prompt for language
3. Call `callOpenRouter()` with 512 max tokens
4. Return response

**System Prompt (Vietnamese):**
```
Bạn là Bác sĩ Eva - chuyên gia nhãn khoa với 30 năm kinh nghiệm...
```

#### 3. `openRouterReport(testType, testData, history, language)`
```typescript
async function openRouterReport(
    testType: string,
    testData: any,
    history: StoredTestResult[],
    language: 'vi' | 'en'
): Promise<AIReport>
```

**Flow:**
1. Build user message with test data and history
2. Get report system prompt for language
3. Call `callOpenRouter()` with 1024 max tokens
4. Parse JSON response
5. Return AIReport object

**Expected JSON Response:**
```json
{
  "summary": "100-150 word summary",
  "causes": "50-100 word causes",
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
  "severity": "LOW|MEDIUM|HIGH",
  "prediction": "50 word prediction",
  "trend": "Trend analysis",
  "confidence": 0.85
}
```

#### 4. `openRouterDashboard(history, language)`
```typescript
async function openRouterDashboard(
    history: StoredTestResult[],
    language: 'vi' | 'en'
): Promise<DashboardInsights>
```

**Expected JSON Response:**
```json
{
  "score": 75,
  "rating": "GOOD|EXCELLENT|AVERAGE|NEEDS_ATTENTION",
  "trend": "IMPROVING|STABLE|DECLINING|INSUFFICIENT_DATA",
  "overallSummary": "50 word summary",
  "positives": ["Positive 1", "Positive 2"],
  "areasToMonitor": ["Area 1", "Area 2"],
  "proTip": "Expert tip"
}
```

#### 5. `openRouterRoutine(answers, language)`
```typescript
async function openRouterRoutine(
    answers: { worksWithComputer: string; wearsGlasses: string; goal: string },
    language: 'vi' | 'en'
): Promise<WeeklyRoutine>
```

**Expected JSON Response:**
```json
{
  "Monday": [
    {
      "type": "test|exercise",
      "key": "snellen",
      "name": "Test name",
      "duration": 3
    }
  ],
  "Tuesday": [...],
  ...
}
```

#### 6. `parseJsonResponse<T>(text: string): T`
```typescript
function parseJsonResponse<T>(text: string): T
```

**Features:**
- Removes `<think>...</think>` tags (DeepSeek models)
- Extracts JSON from markdown code blocks
- Handles both object `{}` and array `[]` formats
- Throws error if JSON invalid

**Example:**
```typescript
// Input: "```json\n{\"key\": \"value\"}\n```"
// Output: { key: "value" }

// Input: "<think>reasoning...</think>\n{\"key\": \"value\"}"
// Output: { key: "value" }
```

---

### chatbotService.ts

**Purpose:** Wrapper around openRouterService

**Key Functions:**

#### 1. `chat(message, lastTestResult, userProfile, language)`
```typescript
async chat(
    message: string,
    lastTestResult: any,
    userProfile: any,
    language: 'vi' | 'en'
): Promise<string>
```

**Flow:**
1. Check if API key exists
2. Call `openRouterChat()`
3. Return response or throw error

#### 2. `report(testType, testData, history, language)`
```typescript
async report(
    testType: string,
    testData: any,
    history: any[],
    language: 'vi' | 'en'
)
```

**Flow:**
1. Import `openRouterReport` dynamically
2. Call `openRouterReport()`
3. Return AIReport

---

### aiService.ts

**Purpose:** High-level AI operations

**Key Functions:**

#### 1. `generateReport(testType, testData, history, language)`
```typescript
async generateReport(
    testType: TestType,
    testData: any,
    history: StoredTestResult[],
    language: 'vi' | 'en'
): Promise<AIReport>
```

**Flow:**
1. Start timer
2. Call `openRouterReport()`
3. Add elapsed time to report
4. Return report

#### 2. `generateDashboardInsights(history, language)`
```typescript
async generateDashboardInsights(
    history: StoredTestResult[],
    language: 'vi' | 'en'
): Promise<DashboardInsights>
```

**Flow:**
1. Start timer
2. Call `openRouterDashboard()`
3. Log elapsed time
4. Return insights

#### 3. `chat(userMessage, lastTestResult, userProfile, language)`
```typescript
async chat(
    userMessage: string,
    lastTestResult: StoredTestResult | null,
    userProfile: AnswerState | null,
    language: 'vi' | 'en'
): Promise<string>
```

**Flow:**
1. Start timer
2. Call `openRouterChat()`
3. Log elapsed time
4. Return response

---

## Component Integration

### Test Components (SnellenTest, ColorBlindTest, etc.)

**Flow:**
```typescript
const finishTest = async () => {
    setTestState('loading');
    const baseResult = snellenService.calculateResult();
    
    try {
        const history = storageService.getTestHistory();
        let aiReport: AIReport | null = null;
        
        try {
            // Import and use ChatbotService
            const { ChatbotService } = await import('../services/chatbotService');
            const svc = new ChatbotService();
            const backendReport = await svc.report('snellen', testResult, history, language);
            
            // Parse response
            const report = backendReport as AIReport;
            if (report && report.summary) {
                aiReport = {
                    id: report.id || Date.now().toString(),
                    testType: 'snellen',
                    timestamp: report.timestamp || new Date().toISOString(),
                    totalResponseTime: report.totalResponseTime || 0,
                    confidence: report.confidence || 85,
                    summary: report.summary || '',
                    recommendations: Array.isArray(report.recommendations) ? report.recommendations : [],
                    severity: (report.severity || 'MEDIUM') as 'LOW' | 'MEDIUM' | 'HIGH',
                    trend: report.trend || 'STABLE',
                    causes: report.causes || '',
                    prediction: report.prediction || '',
                };
            }
        } catch (e) {
            console.error('Report generation error:', e);
            aiReport = null;
        }
        
        // Create fallback report if needed
        const report: AIReport = aiReport || {
            id: Date.now().toString(),
            testType: 'snellen',
            timestamp: new Date().toISOString(),
            totalResponseTime: 0,
            confidence: 0,
            summary: t('error_report'),
            recommendations: [],
            severity: 'MEDIUM',
        };
        
        // Save and display
        storageService.saveTestResult(testResult, report);
        setStoredResult(newStoredResult);
        setTestState('report');
    } catch (err) {
        setError(t('error_report'));
    }
};
```

### ChatInterface Component

**Flow:**
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
        
        const { ChatbotService } = await import('../../services/chatbotService');
        const svc = new ChatbotService();
        const response = await svc.chat(userMessage, context, userProfile, language);
        
        setChatHistory(prev => [...prev, { role: 'bot', text: response }]);
        setStatus('idle');
    } catch (error) {
        console.error('Chat error:', error);
        const errorMsg = language === 'vi' 
            ? 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.' 
            : 'Sorry, an error occurred. Please try again.';
        setChatHistory(prev => [...prev, { role: 'bot', text: errorMsg }]);
        setStatus('idle');
    }
}, [chatInput, language, userProfile]);
```

### useDashboardInsights Hook

**Flow:**
```typescript
const fetchInsights = async () => {
    setIsLoading(true);
    setError(null);
    
    const cached = getCachedInsights(fingerprint, language);
    if (cached) {
        setInsights(cached);
        setIsLoading(false);
        return;
    }
    
    try {
        const { ChatbotService } = await import('../services/chatbotService');
        const svc = new ChatbotService();
        const backendInsights = await svc.dashboard(history, language as 'vi' | 'en');
        
        const insights = backendInsights as DashboardInsights;
        if (insights && (insights.overallSummary || insights.score)) {
            const result: DashboardInsights = {
                score: insights.score || 80,
                rating: (insights.rating || 'GOOD') as DashboardInsights['rating'],
                trend: (insights.trend || 'STABLE') as DashboardInsights['trend'],
                overallSummary: insights.overallSummary || 'Tình trạng sức khỏe mắt ổn định.',
                positives: Array.isArray(insights.positives) ? insights.positives : [],
                areasToMonitor: Array.isArray(insights.areasToMonitor) ? insights.areasToMonitor : [],
                proTip: insights.proTip || 'Tiếp tục duy trì thói quen tốt cho mắt.',
            };
            setInsights(result);
            persistInsights(result, fingerprint, language);
        } else {
            throw new Error('Invalid response format');
        }
    } catch (err) {
        console.error('Failed to load dashboard insights from OpenRouter', err);
        const fallback = buildFallbackInsights(history);
        setInsights(fallback);
        setError('AI đang bận, đã chuyển sang dữ liệu gần nhất.');
    } finally {
        setIsLoading(false);
    }
};
```

---

## Error Handling Strategy

### Level 1: API Key Check
```typescript
if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key not configured. Add VITE_OPENROUTER_API_KEY to environment.');
}
```

### Level 2: API Response Check
```typescript
if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error((error as any)?.error?.message || `OpenRouter API error: ${response.status}`);
}
```

### Level 3: JSON Parsing
```typescript
try {
    return parseJsonResponse<T>(response);
} catch (e) {
    console.error('Failed to parse response JSON:', e);
    // Return fallback or throw
}
```

### Level 4: Component Catch
```typescript
try {
    const report = await svc.report(...);
} catch (e) {
    console.error('Report generation error:', e);
    aiReport = null;  // Use fallback
}
```

---

## Caching Strategy

### Dashboard Insights Cache
```typescript
const CACHE_KEY = 'dashboard_insights_cache_v1';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cache key includes:
// - Fingerprint (based on last 5 tests)
// - Language
// - Timestamp

// Cache hit if:
// - Fingerprint matches
// - Language matches
// - Not expired (< 5 minutes)
```

---

## Performance Optimizations

### 1. Dynamic Imports
```typescript
// Lazy load services only when needed
const { ChatbotService } = await import('../services/chatbotService');
```

### 2. Parallel Requests
```typescript
// If multiple reports needed, could parallelize:
const reports = await Promise.all([
    svc.report('snellen', ...),
    svc.report('colorblind', ...),
]);
```

### 3. Caching
```typescript
// Dashboard insights cached for 5 minutes
// Reduces API calls for repeated views
```

### 4. Fallback Data
```typescript
// If API fails, use fallback:
// - Dashboard: buildFallbackInsights()
// - Report: error message
// - Chat: error message
```

---

## Testing Checklist

### Unit Tests
- [ ] `parseJsonResponse()` with various formats
- [ ] `hasOpenRouterKey()` with/without key
- [ ] Error handling for missing API key

### Integration Tests
- [ ] Chat flow end-to-end
- [ ] Report generation end-to-end
- [ ] Dashboard insights end-to-end
- [ ] Error handling and fallbacks

### Manual Tests
- [ ] Chat with Dr. Eva
- [ ] Complete test and view report
- [ ] View dashboard with 2+ tests
- [ ] Check console for errors
- [ ] Test with invalid API key
- [ ] Test with network offline

---

## Debugging Tips

### 1. Check API Key
```javascript
console.log(import.meta.env.VITE_OPENROUTER_API_KEY?.slice(0, 20) + '...')
```

### 2. Check API Call
```javascript
// In Network tab (DevTools):
// Look for POST to https://openrouter.ai/api/v1/chat/completions
// Check request headers and body
// Check response status and content
```

### 3. Check Response Parsing
```javascript
// In console, after API call:
console.log('Response:', response)
console.log('Parsed:', parseJsonResponse(response))
```

### 4. Check Service Chain
```javascript
// Test each layer:
import { hasOpenRouterKey } from './services/openRouterService'
import { ChatbotService } from './services/chatbotService'
import { AIService } from './services/aiService'

console.log('Has key:', hasOpenRouterKey())
const svc = new ChatbotService()
const response = await svc.chat('Hello', null, null, 'en')
console.log('Response:', response)
```

---

## Future Improvements

1. **Backend Proxy:** Move API key to backend for security
2. **Rate Limiting:** Implement client-side rate limiting
3. **Request Queuing:** Queue requests if rate limited
4. **Better Fallbacks:** More sophisticated fallback data
5. **Retry Logic:** Automatic retry with exponential backoff
6. **Analytics:** Track API usage and performance
7. **A/B Testing:** Test different models and prompts
8. **Cost Optimization:** Switch between free/paid models

---

**Last Updated:** 2025-01-01

