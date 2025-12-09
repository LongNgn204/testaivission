# [object Object]rams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Frontend (React + TypeScript)               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Test Components                           │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │  • SnellenTest.tsx                                           │  │
│  │  • ColorBlindTest.tsx                                        │  │
│  │  • AstigmatismTest.tsx                                       │  │
│  │  • AmslerGridTest.tsx                                        │  │
│  │  • DuochromeTest.tsx                                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↓                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                  ChatbotService                              │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │  • chat(message, context, profile, language)                │  │
│  │  • report(testType, testData, history, language)            │  │
│  │  • dashboard(history, language)                             │  │
│  │  • routine(profile, language)                               │  │
│  │  • tip(profile, language)                                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↓                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              openRouterService                               │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │  • callOpenRouter(systemPrompt, userMessage, options)        │  │
│  │  • openRouterChat(message, context, profile, language)      │  │
│  │  • openRouterReport(testType, testData, history, language)  │  │
│  │  • openRouterDashboard(history, language)                   │  │
│  │  • openRouterRoutine(answers, language)                     │  │
│  │  • openRouterProactiveTip(lastTest, profile, language)      │  │
│  │  • parseJsonResponse<T>(text)                               │  │
│  │  • hasOpenRouterKey()                                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↓                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              fetch() API Call                                │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │  POST https://openrouter.ai/api/v1/chat/completions         │  │
│  │                                                               │  │
│  │  Headers:                                                    │  │
│  │  • Authorization: Bearer {VITE_OPENROUTER_API_KEY}           │  │
│  │  • Content-Type: application/json                            │  │
│  │  • HTTP-Referer: {window.location.origin}                   │  │
│  │  • X-Title: Vision Coach - Eye Health App                   │  │
│  │                                                               │  │
│  │  Body:                                                       │  │
│  │  • model: tngtech/deepseek-r1t2-chimera:free                │  │
│  │  • messages: [system, user]                                 │  │
│  │  • max_tokens: 512-1024                                     │  │
│  │  • temperature: 0.5-0.8                                     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↓                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │           OpenRouter API Response                            │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │  {                                                            │  │
│  │    "choices": [{                                             │  │
│  │      "message": {                                            │  │
│  │        "role": "assistant",                                  │  │
│  │        "content": "AI response text"                         │  │
│  │      }                                                        │  │
│  │    }]                                                         │  │
│  │  }                                                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↓                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │           Response Processing                                │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │  • Extract content from response                             │  │
│  │  • Parse JSON (if needed)                                    │  │
│  │  • Remove <think> tags (DeepSeek)                            │  │
│  │  • Validate response format                                  │  │
│  │  • Return typed result (AIReport, DashboardInsights, etc.)   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↓                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │           Display Components                                 │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │  • ReportDisplayContent.tsx                                  │  │
│  │  • DashboardContent.tsx                                      │  │
│  │  • ChatInterface.tsx                                         │  │
│  │  • VisionCoach.tsx                                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↓                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │           Storage                                            │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │  • StorageService (localStorage)                             │  │
│  │  • Cache dashboard insights (5 min TTL)                      │  │
│  │  • Save test results                                         │  │
│  │  • Persist user data                                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Report Generation Flow

```
User completes test (e.g., Snellen)
        ↓
SnellenTest.finishTest()
        ↓
Calculate test result
        ↓
Load test history from storage
        ↓
Try to generate AI report:
    ├─ Import ChatbotService
    ├─ Create instance
    ├─ Call svc.report(testType, testData, history, language)
    │   ↓
    │   ChatbotService.report()
    │   ├─ Import openRouterReport
    │   ├─ Call openRouterReport(testType, testData, history, language)
    │   │   ↓
    │   │   openRouterReport()
    │   │   ├─ Check if VITE_OPENROUTER_API_KEY exists
    │   │   │   ├─ If NO: throw error "OpenRouter API key not configured"
    │   │   │   └─ If YES: continue
    │   │   ├─ Build user message with test data and history
    │   │   ├─ Get report system prompt (language-specific)
    │   │   ├─ Call callOpenRouter(systemPrompt, userMessage, options)
    │   │   │   ↓
    │   │   │   callOpenRouter()
    │   │   │   ├─ Check API key again
    │   │   │   ├─ Log API call details
    │   │   │   ├─ Send POST to OpenRouter
    │   │   │   ├─ Wait for response
    │   │   │   ├─ Check if response.ok
    │   │   │   │   ├─ If NO: throw error with API error message
    │   │   │   │   └─ If YES: continue
    │   │   │   ├─ Extract content from response
    │   │   │   └─ Return content
    │   │   ├─ Parse JSON response
    │   │   │   ├─ Remove <think> tags
    │   │   │   ├─ Extract JSON from markdown
    │   │   │   ├─ Parse JSON
    │   │   │   └─ Return AIReport object
    │   │   └─ Return AIReport
    │   └─ Return AIReport
    ├─ If success: aiReport = report
    └─ If error: aiReport = null (caught by catch block)
        ↓
Create final report:
    ├─ If aiReport exists: use it
    └─ If aiReport null: create fallback with error message
        ↓
Save to storage:
    ├─ StorageService.saveTestResult(testResult, report)
    └─ Save to localStorage
        ↓
Display report:
    ├─ ReportDisplayContent.tsx
    ├─ Show summary, causes, recommendations, etc.
    └─ If error: show "Không thể tạo báo cáo"
```

---

## Chat Flow

```
User clicks chat button
        ↓
ChatInterface opens
        ↓
User types message and clicks send
        ↓
handleChatSubmit()
        ↓
Add user message to chat history
        ↓
Set status to "thinking"
        ↓
Load test history and get last test context
        ↓
Try to send message:
    ├─ Import ChatbotService
    ├─ Create instance
    ├─ Call svc.chat(userMessage, context, userProfile, language)
    │   ↓
    │   ChatbotService.chat()
    │   ├─ Check if hasOpenRouterKey()
    │   │   ├─ If NO: throw error "OpenRouter API Key not configured"
    │   │   └─ If YES: continue
    │   ├─ Call openRouterChat(message, context, userProfile, language)
    │   │   ↓
    │   │   openRouterChat()
    │   │   ├─ Build user message with context
    │   │   ├─ Get system prompt (language-specific)
    │   │   ├─ Call callOpenRouter(systemPrompt, userMessage, options)
    │   │   │   ↓ (same as report flow)
    │   │   └─ Return response
    │   └─ Return response
    ├─ If success: response = message from Dr. Eva
    └─ If error: response = error message
        ↓
Add bot message to chat history
        ↓
Set status to "idle"
        ↓
Display message in chat
```

---

## Dashboard Insights Flow

```
useDashboardInsights hook mounts
        ↓
Check if history has 2+ tests
    ├─ If NO: return null
    └─ If YES: continue
        ↓
Build fingerprint from last 5 tests
        ↓
Check cache:
    ├─ If cache hit (valid & not expired): return cached insights
    └─ If cache miss: continue
        ↓
Try to fetch from OpenRouter:
    ├─ Import ChatbotService
    ├─ Create instance
    ├─ Call svc.dashboard(history, language)
    │   ↓
    │   ChatbotService.dashboard()
    │   ├─ Import openRouterDashboard
    │   ├─ Call openRouterDashboard(history, language)
    │   │   ↓
    │   │   openRouterDashboard()
    │   │   ├─ Check if VITE_OPENROUTER_API_KEY exists
    │   │   ├─ Build user message with history
    │   │   ├─ Get system prompt (language-specific)
    │   │   ├─ Call callOpenRouter(systemPrompt, userMessage, options)
    │   │   │   ↓ (same as report flow)
    │   │   ├─ Parse JSON response
    │   │   └─ Return DashboardInsights
    │   └─ Return DashboardInsights
    ├─ If success: insights = DashboardInsights from API
    │   ├─ Validate response format
    │   ├─ Cache insights (5 min TTL)
    │   └─ Return insights
    └─ If error: 
        ├─ Log error
        ├─ Build fallback insights from history
        ├─ Set error message: "AI đang bận, đã chuyển sang dữ liệu gần nhất."
        └─ Return fallback insights
        ↓
Display dashboard:
    ├─ DashboardContent.tsx
    ├─ Show score, rating, trend
    ├─ Show overall summary
    ├─ Show positives & areas to monitor
    ├─ Show pro tip
    └─ If error: show error message
```

---

## Error Handling Flow

```
API Call
    ↓
Level 1: API Key Check
    ├─ if (!OPENROUTER_API_KEY)
    │   └─ throw Error("OpenRouter API key not configured...")
    └─ Continue if key exists
    ↓
Level 2: API Response Check
    ├─ if (!response.ok)
    │   └─ throw Error(error.message || "OpenRouter API error: {status}")
    └─ Continue if response OK
    ↓
Level 3: JSON Parsing
    ├─ try parseJsonResponse()
    │   ├─ Remove <think> tags
    │   ├─ Extract JSON
    │   ├─ Parse JSON
    │   └─ Return parsed object
    └─ catch (e)
        └─ throw Error("Failed to parse JSON")
    ↓
Level 4: Component Catch
    ├─ try { await service.call() }
    └─ catch (error)
        ├─ Log error
        ├─ Create fallback data
        └─ Display fallback or error message
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User Input                               │
├─────────────────────────────────────────────────────────────┤
│  • Complete test                                            │
│  • Send chat message                                        │
│  • View dashboard                                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                  Component Layer                            │
├─────────────────────────────────────────────────────────────┤
│  • SnellenTest, ColorBlindTest, etc.                        │
│  • ChatInterface                                            │
│  • DashboardContent                                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                  Service Layer                              │
├─────────────────────────────────────────────────────────────┤
│  • ChatbotService                                           │
│  • AIService                                                │
│  • StorageService                                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              openRouterService Layer                         │
├─────────────────────────────────────────────────────────────┤
│  • callOpenRouter()                                         │
│  • openRouterChat()                                         │
│  • openRouterReport()                                       │
│  • openRouterDashboard()                                    │
│  • parseJsonResponse()                                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              External API Layer                             │
├─────────────────────────────────────────────────────────────┤
│  • OpenRouter API                                           │
│  • Model: tngtech/deepseek-r1t2-chimera:free               │
│  • Endpoint: /api/v1/chat/completions                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              Response Processing                            │
├─────────────────────────────────────────────────────────────┤
│  • Extract content                                          │
│  • Parse JSON                                               │
│  • Validate format                                          │
│  • Return typed result                                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              Storage Layer                                  │
├─────────────────────────────────────────────────────────────┤
│  • localStorage (StorageService)                            │
│  • Cache (5 min TTL for dashboard)                          │
│  • Test results                                             │
│  • User data                                                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              Display Layer                                  │
├─────────────────────────────────────────────────────────────┤
│  • ReportDisplayContent                                     │
│  • DashboardContent                                         │
│  • ChatInterface                                            │
│  • User sees results                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Configuration Dependency

```
VITE_OPENROUTER_API_KEY
        ↓
        ├─→ openRouterService.ts (line 15)
        │   ├─→ openRouterChat()
        │   ├─→ openRouterReport()
        │   ├─→ openRouterDashboard()
        │   ├─→ openRouterRoutine()
        │   ├─→ openRouterProactiveTip()
        │   └─→ hasOpenRouterKey()
        │
        ├─→ ChatbotService.ts
        │   ├─→ chat()
        │   ├─→ report()
        │   ├─→ dashboard()
        │   ├─→ routine()
        │   └─→ tip()
        │
        ├─→ AIService.ts
        │   ├─→ generateReport()
        │   ├─→ generateDashboardInsights()
        │   ├─→ generatePersonalizedRoutine()
        │   ├─→ chat()
        │   └─→ generateProactiveTip()
        │
        ├─→ Test Components
        │   ├─→ SnellenTest.tsx (report generation)
        │   ├─→ ColorBlindTest.tsx (report generation)
        │   ├─→ AstigmatismTest.tsx (report generation)
        │   ├─→ AmslerGridTest.tsx (report generation)
        │   └─→ DuochromeTest.tsx (report generation)
        │
        ├─→ ChatInterface.tsx (chat)
        │
        ├─→ useDashboardInsights.ts (dashboard)
        │
        └─→ VisionCoach.tsx (chat button)
```

---

## Fallback Strategy

```
API Call Fails
        ↓
        ├─→ Report Generation
        │   └─→ Create fallback with error message
        │       └─→ User sees: "Không thể tạo báo cáo"
        │
        ├─→ Chat
        │   └─→ Show error message
        │       └─→ User sees: "Sorry, an error occurred. Please try again."
        │
        └─→ Dashboard Insights
            ├─→ buildFallbackInsights() from history
            ├─→ Cache fallback data
            └─→ User sees: "AI đang bận, đã chuyển sang dữ liệu gần nhất."
                └─→ Shows fallback score, rating, trend
```

---

**Diagrams Created:** January 1, 2025

