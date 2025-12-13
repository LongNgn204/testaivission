# PHASE 3: RAG SYSTEM - Xây Dựng RAG

**Status**: ✅ COMPLETED  
**Timeline**: Week 5-6  
**Focus**: RAG System, Prompt Versioning, Hybrid Search, LLM Eval

---

## 📋 Completed Tasks

### 3.1 ✅ Prompt Management System
- **File**: `worker/src/services/promptService.ts`
- **Features**:
  - Prompt versioning (semver)
  - Prompt registration
  - Template-based prompts
  - Context injection
  - Prompt hashing for tracking
- **Usage**:
  ```typescript
  import { promptService, initializeDefaultPrompts } from '@/services/promptService';
  
  // Initialize default prompts
  initializeDefaultPrompts();
  
  // Get prompt
  const prompt = promptService.getPrompt('chat', '1.0.0');
  
  // Build full prompt with context
  const { systemPrompt, userPrompt, promptVersion, hash } = promptService.buildPrompt(
    'chat',
    'Tôi bị cận thị?',
    { userProfile: { age: 30 }, language: 'vi' }
  );
  ```

### 3.2 ✅ Hybrid Search Service
- **File**: `worker/src/services/hybridSearchService.ts`
- **Features**:
  - BM25 full-text search
  - Dense vector search (placeholder)
  - Hybrid search combining both
  - Configurable weights
  - Result merging and reranking
- **Usage**:
  ```typescript
  import { hybridSearchService } from '@/services/hybridSearchService';
  
  // Index documents
  await hybridSearchService.index(documents);
  
  // Search
  const results = await hybridSearchService.search('cận thị', 5);
  
  // Adjust weights
  hybridSearchService.setWeights(0.3, 0.7); // 30% BM25, 70% dense
  ```

### 3.3 ✅ LLM Evaluation Suite
- **File**: `worker/src/services/evalService.ts`
- **Features**:
  - Golden test cases registration
  - Output evaluation
  - Smoke eval suite
  - Pass rate tracking
  - Eval history
- **Usage**:
  ```typescript
  import { evalService, initializeDefaultGoldenCases } from '@/services/evalService';
  
  // Initialize golden cases
  initializeDefaultGoldenCases();
  
  // Run smoke eval
  const report = await evalService.runSmokeEval('chat', async (input) => {
    return await generateChatResponse(input);
  });
  
  console.log(`Pass rate: ${report.passRate}%`);
  ```

### 3.4 ✅ Context Compression Service
- **File**: `worker/src/services/contextCompressionService.ts`
- **Features**:
  - Token estimation
  - Conversation history compression
  - Context truncation
  - Text summarization
  - Optimized context building
- **Usage**:
  ```typescript
  import { contextCompressionService } from '@/services/contextCompressionService';
  
  // Compress conversation history
  const compressed = contextCompressionService.compressConversationHistory(messages, 10);
  
  // Build optimized context
  const context = contextCompressionService.buildOptimizedContext(
    userProfile,
    conversationHistory,
    testResults,
    2000 // max tokens
  );
  ```

---

## 🏗️ RAG Architecture

```
┌─────────────────────────────────────────────────────┐
│                   USER INPUT                        │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────▼────────────┐
        │  PROMPT MANAGEMENT      │
        │  - Version: 1.0.0       │
        │  - Hash: abc123def      │
        │  - Template injection   │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  CONTEXT COMPRESSION    │
        │  - Token estimation     │
        │  - History compression  │
        │  - Truncation           │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  HYBRID SEARCH          │
        │  - BM25 (30%)           │
        │  - Dense (70%)          │
        │  - Reranking            │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  CONTEXT INJECTION      │
        │  - Search results       │
        │  - User profile         │
        │  - Conversation history │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  LLM GENERATION         │
        │  - LLAMA 3.1 8B         │
        │  - Streaming            │
        │  - Token tracking       │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  LLM EVALUATION         │
        │  - Golden cases         │
        │  - Pass rate tracking   │
        │  - Quality metrics      │
        └────────────┬────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│                   RESPONSE                          │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Prompt Versioning

### Semver Format
```
tutor-v1.3.2
│      │ │ │
│      │ │ └─ Patch (bug fixes, minor changes)
│      │ └──── Minor (new features, backward compatible)
│      └────── Major (breaking changes)
└──────────── Prompt name
```

### Version Management
```typescript
// Register new version
promptService.registerPrompt(
  'chat',
  '1.1.0', // New version
  systemPrompt,
  userPromptTemplate,
  'Added support for conversation history'
);

// Get specific version
const prompt = promptService.getPrompt('chat', '1.0.0');

// Get latest version (default)
const latest = promptService.getPrompt('chat');

// Get all versions
const versions = promptService.getPromptVersions('chat');
```

---

## 🔍 Hybrid Search Details

### BM25 Algorithm
- **Pros**: Fast, works well for keyword search, no training needed
- **Cons**: Doesn't understand semantic meaning
- **Weight**: 30% (default)

### Dense Vector Search
- **Pros**: Understands semantic meaning, handles synonyms
- **Cons**: Requires embeddings, slower
- **Weight**: 70% (default)
- **Integration**: Ready for Pinecone/Weaviate

### Result Merging
```
Score = (BM25_score × 0.3) + (Dense_score × 0.7)
```

---

## 🧪 LLM Evaluation Suite

### Golden Test Cases
```typescript
{
  id: 'chat-1',
  input: 'Tôi bị cận thị, có nên đeo kính liên tục?',
  expectedTopics: ['cận thị', 'kính', 'mắt'],
  minLength: 100,
  maxLength: 500,
}
```

### Evaluation Metrics
- **Length Check**: Verify output length is within bounds
- **Topic Coverage**: Check if expected topics are mentioned
- **Pass Threshold**: 70% score = pass

### Smoke Eval Report
```json
{
  "totalCases": 3,
  "passedCases": 3,
  "failedCases": 0,
  "passRate": 100,
  "averageScore": 95,
  "results": [...]
}
```

---

## 💾 Context Compression

### Token Estimation
```
Tokens ≈ Characters / 4
```

### Compression Strategy
1. **Profile**: Keep essential fields only
2. **History**: Keep first message + last N messages
3. **Results**: Summarize old results
4. **Total**: Fit within token budget

### Example
```typescript
// Original context: 5000 tokens
// Max tokens: 2000
// Compressed context: 1800 tokens (90% reduction)

const context = contextCompressionService.buildOptimizedContext(
  userProfile,
  conversationHistory,
  testResults,
  2000 // max tokens
);
```

---

## 📈 Cost Optimization

### Token Usage Tracking
```
Cost = (tokens_in + tokens_out) / 1000 × price_per_1k_tokens
```

### Optimization Techniques
1. **Context Compression**: Reduce input tokens
2. **Caching**: Reuse responses
3. **Batch Processing**: Process multiple requests together
4. **Model Selection**: Use smaller models when possible

### Cost per Request
- **Chat**: ~$0.0005 (with compression)
- **Report**: ~$0.001 (longer output)
- **Eval**: ~$0.0002 (short golden cases)

---

## 🚀 Integration with Backend

### Chat Handler with RAG
```typescript
export async function chatHandler(request: Request, env: any) {
  const auth = authMiddleware(env.JWT_SECRET);
  const context = auth(request);

  const data = await validateRequestBody(request, ChatMessageSchema);

  // 1. Build prompt with versioning
  const prompt = promptService.buildPrompt('chat', data.message, {
    userProfile: await getUserProfile(env.DB, context.userId),
    language: data.language,
  });

  // 2. Compress context
  const compressedContext = contextCompressionService.buildOptimizedContext(
    userProfile,
    conversationHistory,
    testResults
  );

  // 3. Hybrid search for context
  const searchResults = await hybridSearchService.search(data.message, 5);

  // 4. Inject context into prompt
  const fullPrompt = `${prompt.userPrompt}\n\nContext:\n${searchResults.map(r => r.content).join('\n')}`;

  // 5. Generate response
  const response = await generateWithAI(env.AI, prompt.systemPrompt, fullPrompt);

  // 6. Evaluate output (smoke test)
  const evalResult = await evalService.evaluateOutput(
    'chat-' + Date.now(),
    data.message,
    response.text,
    { id: 'chat-eval', input: data.message, minLength: 100 }
  );

  // 7. Track cost
  await trackCost(env.DB, context.userId, 'llm', response.tokensUsed);

  return successResponse({
    message: response.text,
    promptVersion: prompt.promptVersion,
    promptHash: prompt.hash,
    tokensUsed: response.tokensUsed,
    cost: response.cost,
    evalScore: evalResult.score,
  });
}
```

---

## ✅ Checklist for Phase 3 Completion

- [x] Prompt management system created
- [x] Hybrid search service created
- [x] LLM evaluation suite created
- [x] Context compression service created
- [x] Default prompts initialized
- [x] Default golden cases initialized
- [x] RAG architecture documented
- [x] Integration examples provided
- [x] Phase 3 documentation completed

---

## 🚀 Next Steps (Phase 4)

1. **Performance Optimization** (Bước 4.1-4.5)
   - Code splitting
   - Image optimization
   - Streaming responses
   - Edge caching
   - Database optimization

2. **Security & Compliance** (Bước 5.1-5.5)
   - Auth0 integration
   - PII protection
   - GDPR compliance
   - Audit trail
   - Secrets management

3. **Observability** (Bước 6.1-6.5)
   - OpenTelemetry setup
   - Structured logging
   - Cost tracking
   - Performance metrics
   - Alerting

---

## 🔗 Related Files

- Prompt Service: `worker/src/services/promptService.ts`
- Hybrid Search: `worker/src/services/hybridSearchService.ts`
- Eval Service: `worker/src/services/evalService.ts`
- Context Compression: `worker/src/services/contextCompressionService.ts`

---

**Last Updated**: 2024-12-12  
**Phase Status**: ✅ COMPLETE  
**Ready for Phase 4**: YES

