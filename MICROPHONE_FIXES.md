# Microphone & Audio - Exact Code Fixes

## Fix #1: API Key Check (CRITICAL - This is the main problem!)

**File:** `components/vision-coach/VoiceInterface.tsx` (line ~282)

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
    // ✅ FIX: Use import.meta.env for Vite
    const apiKey = (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_GEMINI_API_KEY) 
      || (typeof process !== 'undefined' && (process as any)?.env?.API_KEY);
    
    if (!apiKey || sessionPromiseRef.current) return;
    setStatus('connecting');

    aiRef.current = new GoogleGenAI({ apiKey });
```

---

## Fix #2: Add AIService Import

**File:** `components/vision-coach/VoiceInterface.tsx` (top of file, after other imports)

**Add this:**
```typescript
import { AIService } from '../../services/aiService';
```

**Then inside component (after other refs):**
```typescript
const aiService = new AIService();
```

---

## Fix #3: Fix Audio Chain (Remove Destination Connection)

**File:** `components/vision-coach/VoiceInterface.tsx` (line ~310-320)

**Replace this:**
```typescript
onopen: () => {
    setStatus('listening');
    mediaSourceNodeRef.current = inputAudioContextRef.current!.createMediaStreamSource(mediaStreamRef.current!);
    scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
    scriptProcessorRef.current.onaudioprocess = (event) => {
        const inputData = event.inputBuffer.getChannelData(0);
        const pcmBlob: Blob = {
            data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)),
            mimeType: 'audio/pcm;rate=16000',
        };
        sessionPromiseRef.current?.then(session => session.sendRealtimeInput({ media: pcmBlob }));
    };
    mediaSourceNodeRef.current.connect(scriptProcessorRef.current);
    scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);
},
```

**With this:**
```typescript
onopen: () => {
    setStatus('listening');
    mediaSourceNodeRef.current = inputAudioContextRef.current!.createMediaStreamSource(mediaStreamRef.current!);
    scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
    
    // ✅ FIX: Proper Float32 to Int16 conversion with clipping
    scriptProcessorRef.current.onaudioprocess = (event) => {
        const inputData = event.inputBuffer.getChannelData(0);
        
        // Proper conversion with clipping
        const int16Data = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
            // Clip to [-1, 1] range
            let s = Math.max(-1, Math.min(1, inputData[i]));
            // Convert to Int16
            int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        
        const pcmBlob: Blob = {
            data: encode(new Uint8Array(int16Data.buffer)),
            mimeType: 'audio/pcm;rate=16000',
        };
        sessionPromiseRef.current?.then(session => session.sendRealtimeInput({ media: pcmBlob }));
    };
    
    // ✅ FIX: Add gain node for volume boost
    const gainNode = inputAudioContextRef.current!.createGain();
    gainNode.gain.value = 1.5; // Boost by 50%
    
    mediaSourceNodeRef.current.connect(gainNode);
    gainNode.connect(scriptProcessorRef.current);
    // ✅ FIX: REMOVE this line - don't connect to destination
    // scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);
},
```

---

## Fix #4: Add AudioContext Resume

**File:** `components/vision-coach/VoiceInterface.tsx` (after creating AudioContexts, line ~285-286)

**Replace this:**
```typescript
inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

try {
    mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
```

**With this:**
```typescript
inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

// ✅ FIX: Resume audio contexts if suspended
if (inputAudioContextRef.current.state === 'suspended') {
    await inputAudioContextRef.current.resume();
}
if (outputAudioContextRef.current.state === 'suspended') {
    await outputAudioContextRef.current.resume();
}

try {
    mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
```

---

## Fix #5: Add Proper Error Handling for Microphone

**File:** `components/vision-coach/VoiceInterface.tsx` (line ~289-293)

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

## Fix #6: Add Timeout for Gemini Connection

**File:** `components/vision-coach/VoiceInterface.tsx` (before startSession function)

**Add this helper function:**
```typescript
// ✅ ADD: Timeout wrapper for API calls
const withTimeout = (promise: Promise<any>, ms: number) => {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Connection timeout')), ms)
        ),
    ]);
};
```

**Then replace the Gemini connection (line ~295):**
```typescript
// ❌ OLD:
sessionPromiseRef.current = aiRef.current.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    config: { ... },
    callbacks: { ... },
});

// ✅ NEW:
try {
    sessionPromiseRef.current = await withTimeout(
        aiRef.current.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: language === 'vi' ? 'Kore' : 'Zephyr' } } },
                systemInstruction: getSystemInstruction(language),
                tools: [{ functionDeclarations: [startTestFunctionDeclaration, navigateToFunctionDeclaration] }],
                inputAudioTranscription: {},
                outputAudioTranscription: {},
            },
            callbacks: {
                onopen: () => { ... },
                onmessage: async (message: LiveServerMessage) => { ... },
                onerror: (e) => console.error("Session error:", e),
                onclose: () => cleanup(),
            },
        }),
        10000 // 10 second timeout
    );
} catch (error) {
    if (error instanceof Error && error.message === 'Connection timeout') {
        alert(language === 'vi' ? 'Kết nối timeout' : 'Connection timeout');
    }
    console.error("Failed to start session:", error);
    setStatus('idle');
    return;
}
```

---

## Fix #7: Add Logging for Debugging

**File:** `components/vision-coach/VoiceInterface.tsx` (in startSession)

**Add logging after each step:**
```typescript
const startSession = useCallback(async () => {
    const apiKey = (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_GEMINI_API_KEY) 
      || (typeof process !== 'undefined' && (process as any)?.env?.API_KEY);
    
    console.log('🎤 VoiceInterface: Starting session...', { hasApiKey: !!apiKey });
    
    if (!apiKey || sessionPromiseRef.current) {
        console.error('🎤 VoiceInterface: No API key or session already exists');
        return;
    }
    
    setStatus('connecting');
    console.log('🎤 VoiceInterface: Status set to connecting');

    aiRef.current = new GoogleGenAI({ apiKey });
    
    inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    console.log('🎤 VoiceInterface: AudioContexts created');
    
    // Resume audio contexts
    if (inputAudioContextRef.current.state === 'suspended') {
        await inputAudioContextRef.current.resume();
        console.log('🎤 VoiceInterface: Input AudioContext resumed');
    }
    if (outputAudioContextRef.current.state === 'suspended') {
        await outputAudioContextRef.current.resume();
        console.log('🎤 VoiceInterface: Output AudioContext resumed');
    }
    
    try {
        mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('🎤 VoiceInterface: Microphone access granted');
    } catch (error: any) {
        console.error('🎤 VoiceInterface: Microphone error:', error);
        // ... error handling
        return;
    }
    
    try {
        console.log('🎤 VoiceInterface: Connecting to Gemini...');
        sessionPromiseRef.current = await withTimeout(
            aiRef.current.live.connect({ ... }),
            10000
        );
        console.log('🎤 VoiceInterface: Connected to Gemini');
    } catch (error) {
        console.error('🎤 VoiceInterface: Gemini connection failed:', error);
        setStatus('idle');
        return;
    }
}, [language, navigate, cleanup, onClose]);
```

---

## 🧪 Testing Checklist

After applying all fixes:

- [ ] Open browser console (F12)
- [ ] Click the mic button
- [ ] Check console logs:
  - Should see[object Object]Interface: Starting session..."
  - Should see "🎤 VoiceInterface: AudioContexts created"
  - Should see "🎤 VoiceInterface: Microphone access granted"
  - Should see "🎤 VoiceInterface: Connecting to Gemini..."
  - Should see "🎤 VoiceInterface: Connected to Gemini"
- [ ] Status should change to "Listening..."
- [ ] Speak into microphone
- [ ] Should see user transcript appear
- [ ] Should hear Eva respond
- [ ] No console errors

---

## 📋 Summary of Changes

| Fix | File | Lines | Impact |
|-----|------|-------|--------|
| API key check | VoiceInterface.tsx | 282-285 | CRITICAL - Makes it work |
| AIService import | VoiceInterface.tsx | 1-10 | CRITICAL - Prevents crash |
| Audio chain | VoiceInterface.tsx | 310-320 | HIGH - Fixes audio input |
| PCM encoding | VoiceInterface.tsx | 313-318 | HIGH - Better audio quality |
| AudioContext resume | VoiceInterface.tsx | 285-286 | HIGH - Ensures audio works |
| Error handling | VoiceInterface.tsx | 289-293 | HIGH - User feedback |
| Timeout | VoiceInterface.tsx | 295+ | MEDIUM - Prevent hanging |
| Logging | VoiceInterface.tsx | Throughout | MEDIUM - Debugging |

**Total Changes:** 8 fixes  
**Total Lines:** ~100 lines modified/added  
**Estimated Time:** 30 minutes  
**Difficulty:** Medium (straightforward fixes)

---

## ✅ After All Fixes

The microphone will:
1. ✅ Request permission from user
2. ✅ Capture audio properly
3. ✅ Convert to PCM format correctly
4. ✅ Send to Gemini in real-time
5. ✅ Receive Eva's response
6. ✅ Play audio back
7. ✅ Handle errors gracefully
8. ✅ Timeout if connection fails

---

**Generated:** 2025-11-27  
**Status:** Ready for Implementation

