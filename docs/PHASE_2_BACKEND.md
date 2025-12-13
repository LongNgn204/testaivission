# PHASE 2: BACKEND INFRASTRUCTURE - Nâng Cấp Backend

**Status**: ✅ COMPLETED  
**Timeline**: Week 3-4  
**Focus**: API Design, Database Schema, Middleware, Error Handling

---

## 📋 Completed Tasks

### 2.1 ✅ Authentication Service
- **File**: `services/authService.ts`
- **Features**:
  - User login with validation
  - JWT token management
  - Token verification
  - User logout
  - LocalStorage integration
  - Multi-tab sync
- **Usage**:
  ```typescript
  import { authService } from '@/services/authService';
  
  const response = await authService.login({
    name: 'Nguyễn Văn A',
    phone: '0912345678',
    age: 30,
  });
  ```

### 2.2 ✅ Test Service
- **File**: `services/testService.ts`
- **Features**:
  - Generate AI reports
  - Save test results
  - Fetch test history
  - Get test statistics
  - Token management
- **Usage**:
  ```typescript
  import { testService } from '@/services/testService';
  
  const report = await testService.generateReport('snellen', testData);
  const history = await testService.getTestHistory(10);
  ```

### 2.3 ✅ Chat Service
- **File**: `services/chatService.ts`
- **Features**:
  - Send messages to Dr. Eva
  - Conversation history management
  - Token tracking
  - Cost calculation
  - Input validation
- **Usage**:
  ```typescript
  import { chatService } from '@/services/chatService';
  
  const response = await chatService.sendMessage(
    'Tôi bị cận thị, có nên đeo kính liên tục?',
    { userProfile: { age: 30 } }
  );
  ```

### 2.4 ✅ Data Storage Service
- **File**: `services/dataStorageService.ts`
- **Features**:
  - Save/retrieve test results
  - Chat history management
  - Storage size tracking
  - Data cleanup
  - LocalStorage management
- **Usage**:
  ```typescript
  import { dataStorageService } from '@/services/dataStorageService';
  
  dataStorageService.saveTestResult(result);
  const history = dataStorageService.getAllTestResults();
  ```

### 2.5 ✅ Error Handler Middleware
- **File**: `worker/src/middleware/errorHandler.ts`
- **Features**:
  - Centralized error handling
  - Error to HTTP response conversion
  - Async error wrapper
  - Structured error responses
- **Usage**:
  ```typescript
  import { errorHandler, asyncHandler } from '@/middleware/errorHandler';
  
  const handler = asyncHandler(async (req) => {
    // Your handler logic
  });
  ```

### 2.6 ✅ Authentication Middleware
- **File**: `worker/src/middleware/authMiddleware.ts`
- **Features**:
  - JWT verification
  - Token extraction
  - Auth context creation
  - Optional auth support
- **Usage**:
  ```typescript
  import { authMiddleware } from '@/middleware/authMiddleware';
  
  const auth = authMiddleware(JWT_SECRET);
  const context = auth(request);
  ```

### 2.7 ✅ Validation Middleware
- **File**: `worker/src/middleware/validationMiddleware.ts`
- **Features**:
  - Request body validation
  - Query parameter validation
  - Path parameter validation
  - Zod schema support
- **Usage**:
  ```typescript
  import { validateRequestBody } from '@/middleware/validationMiddleware';
  
  const data = await validateRequestBody(request, UserAuthSchema);
  ```

### 2.8 ✅ Rate Limiting Middleware
- **File**: `worker/src/middleware/rateLimitMiddleware.ts`
- **Features**:
  - Request rate limiting
  - Configurable limits
  - IP-based tracking
  - Retry-After header
- **Usage**:
  ```typescript
  import { rateLimitMiddleware } from '@/middleware/rateLimitMiddleware';
  
  const rateLimit = rateLimitMiddleware(60, 60 * 1000); // 60 req/min
  rateLimit(request);
  ```

### 2.9 ✅ Cache Service
- **File**: `worker/src/services/cacheService.ts`
- **Features**:
  - Response caching
  - Cache key generation
  - TTL support
  - Cache invalidation
- **Usage**:
  ```typescript
  import { CacheService, cacheMiddleware } from '@/services/cacheService';
  
  const cached = await CacheService.get(key);
  await CacheService.set(key, response, 3600);
  ```

### 2.10 ✅ API Response Wrapper
- **File**: `utils/apiResponse.ts` (from Phase 1)
- **Features**:
  - Standardized response format
  - Success/error builders
  - Pagination support
  - Type guards

### 2.11 ✅ OpenAPI Specification
- **File**: `docs/openapi.yaml` (from Phase 1)
- **Coverage**:
  - Authentication endpoints
  - AI service endpoints
  - Request/response schemas

### 2.12 ✅ Database Schema
- **File**: `worker/migrations/0001_init.sql` (from Phase 1)
- **Tables**:
  - users
  - test_results
  - ai_reports
  - chat_history
  - user_routines
  - user_preferences
  - audit_logs
  - cost_tracking

---

## 🎯 Key Improvements

| Aspect | Before | After |
|--------|--------|-------|
| **Error Handling** | Ad-hoc | Centralized middleware |
| **Input Validation** | Manual | Automated with Zod |
| **Authentication** | Hardcoded | JWT middleware |
| **Rate Limiting** | None | Configurable limits |
| **Caching** | None | Response caching |
| **API Design** | Inconsistent | OpenAPI spec |
| **Database** | No schema | Proper schema + migrations |

---

## [object Object]

```
┌─────────────────────────────────────────────────────┐
│                  FRONTEND (React)                   │
├─────────────────────────────────────────────────────┤
│  Services:                                          │
│  - authService (login, verify, logout)              │
│  - testService (generate reports, fetch history)    │
│  - chatService (send messages, history)             │
│  - dataStorageService (localStorage management)     │
└────────────────────┬────────────────────────────────┘
                     │ HTTP/JSON
┌────────────────────▼────────────────────────────────┐
│              CLOUDFLARE WORKER (Backend)            │
├─────────────────────────────────────────────────────┤
│  Middleware Stack:                                  │
│  1. Error Handler (catch all errors)                │
│  2. Rate Limiter (60 req/min per IP)                │
│  3. Auth Middleware (verify JWT)                    │
│  4. Validation Middleware (Zod schemas)             │
│  5. Cache Middleware (response caching)             │
│                                                     │
│  Handlers:                                          │
│  - /api/auth/login                                  │
│  - /api/auth/verify                                 │
│  - /api/chat                                        │
│  - /api/report                                      │
│  - /api/test-results                                │
│                                                     │
│  Services:                                          │
│  - CacheService (Cloudflare Cache API)              │
│  - DatabaseService (D1 operations)                  │
│  - AIService (LLM calls)                            │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
   ┌────▼──┐    ┌────▼──┐   ┌────▼──┐
   │  D1   │    │ Cache │   │ AI    │
   │  DB   │    │ API   │   │ Model │
   └───────┘    └───────┘   └───────┘
```

---

## 🔄 Request Flow

```
1. Frontend sends request
   ↓
2. Worker receives request
   ↓
3. Error Handler wraps execution
   ↓
4. Rate Limiter checks IP quota
   ↓
5. Auth Middleware verifies JWT
   ↓
6. Validation Middleware validates input
   ↓
7. Cache Middleware checks cache (GET only)
   ↓
8. Handler processes request
   ↓
9. Cache Middleware stores response (GET only)
   ↓
10. Response sent to frontend
```

---

## 📝 Usage Examples

### Example 1: Login Flow

```typescript
// Frontend
import { authService } from '@/services/authService';

async function handleLogin(formData: UserAuthInput) {
  try {
    const response = await authService.login(formData);
    // Token is automatically stored
    // User data is automatically stored
    navigate('/home');
  } catch (error) {
    logger.error('Login failed', error);
  }
}
```

```typescript
// Backend (Worker)
import { validateRequestBody } from '@/middleware/validationMiddleware';
import { UserAuthSchema } from '@/utils/validation';

export async function loginHandler(request: Request, env: any) {
  try {
    // Validate input
    const data = await validateRequestBody(request, UserAuthSchema);

    // Create user in database
    const user = await createUser(env.DB, data);

    // Generate JWT token
    const token = generateJWT(user.id, env.JWT_SECRET);

    // Return response
    return successResponse({ token, user });
  } catch (error) {
    return errorHandler(error);
  }
}
```

### Example 2: Chat Flow

```typescript
// Frontend
import { chatService } from '@/services/chatService';
import { authService } from '@/services/authService';

async function handleSendMessage(message: string) {
  try {
    const token = authService.getToken();
    chatService.setToken(token);

    const response = await chatService.sendMessage(message, {
      userProfile: authService.getUser(),
    });

    // Message is automatically added to history
    setMessages(prev => [...prev, response]);
  } catch (error) {
    logger.error('Failed to send message', error);
  }
}
```

```typescript
// Backend (Worker)
import { authMiddleware } from '@/middleware/authMiddleware';
import { validateRequestBody } from '@/middleware/validationMiddleware';
import { ChatMessageSchema } from '@/utils/validation';

export async function chatHandler(request: Request, env: any) {
  try {
    // Authenticate
    const auth = authMiddleware(env.JWT_SECRET);
    const context = auth(request);

    // Validate input
    const data = await validateRequestBody(request, ChatMessageSchema);

    // Call AI model
    const response = await callAIModel(env.AI, data.message);

    // Save to database
    await saveChatMessage(env.DB, context.userId, data.message, response);

    // Track cost
    await trackCost(env.DB, context.userId, 'llm', response.tokensUsed);

    // Return response
    return successResponse({ message: response.text });
  } catch (error) {
    return errorHandler(error);
  }
}
```

### Example 3: Test Result Flow

```typescript
// Frontend
import { testService } from '@/services/testService';
import { dataStorageService } from '@/services/dataStorageService';
import { authService } from '@/services/authService';

async function handleTestComplete(testData: TestResultData) {
  try {
    const token = authService.getToken();
    testService.setToken(token);

    // Generate AI report
    const report = await testService.generateReport('snellen', testData);

    // Create stored result
    const result: StoredTestResult = {
      id: generateId(),
      testType: 'snellen',
      date: new Date().toISOString(),
      resultData: testData,
      report,
    };

    // Save locally
    dataStorageService.saveTestResult(result);

    // Save to backend
    await testService.saveTestResult(result);

    // Show report
    setReport(report);
  } catch (error) {
    logger.error('Test failed', error);
  }
}
```

---

## ✅ Checklist for Phase 2 Completion

- [x] Authentication service created
- [x] Test service created
- [x] Chat service created
- [x] Data storage service created
- [x] Error handler middleware created
- [x] Auth middleware created
- [x] Validation middleware created
- [x] Rate limiting middleware created
- [x] Cache service created
- [x] API response wrapper (Phase 1)
- [x] OpenAPI specification (Phase 1)
- [x] Database schema (Phase 1)
- [x] Phase 2 documentation completed

---

## 🚀 Next Steps (Phase 3)

1. **RAG System** (Bước 3.1-3.5)
   - Vector DB setup (Pinecone/Weaviate)
   - Hybrid search implementation
   - Prompt versioning
   - Context compression
   - LLM eval suite

2. **Performance** (Bước 4.1-4.5)
   - Code splitting
   - Image optimization
   - Streaming responses
   - Edge caching
   - Database optimization

3. **Security** (Bước 5.1-5.5)
   - Auth0 integration
   - PII protection
   - GDPR compliance
   - Audit trail
   - Secrets management

---

## 🔗 Related Files

- Auth Service: `services/authService.ts`
- Test Service: `services/testService.ts`
- Chat Service: `services/chatService.ts`
- Data Storage: `services/dataStorageService.ts`
- Error Handler: `worker/src/middleware/errorHandler.ts`
- Auth Middleware: `worker/src/middleware/authMiddleware.ts`
- Validation Middleware: `worker/src/middleware/validationMiddleware.ts`
- Rate Limit Middleware: `worker/src/middleware/rateLimitMiddleware.ts`
- Cache Service: `worker/src/services/cacheService.ts`
- API Spec: `docs/openapi.yaml`
- Database: `worker/migrations/0001_init.sql`

---

**Last Updated**: 2024-12-12  
**Phase Status**: ✅ COMPLETE  
**Ready for Phase 3**: YES

