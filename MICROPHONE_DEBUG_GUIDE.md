# Microphone Not Working - Debug Guide

## 🔴 THE MAIN PROBLEM

```
Line 282 in VoiceInterface.tsx:

if (!process.env.API_KEY || sessionPromiseRef.current) return;
                    ↓
        This is ALWAYS undefined in browser!
                    ↓
        Function returns early
                    ↓
        Microphone NEVER initialized
                    ↓
        NOTHING WORKS
```

---

## 🔍 How to Debug

### Step 1: Open Browser Console
Press `F12` → Click "Console" tab

### Step 2: Click Mic Button
You should see console logs. If you don't see ANY logs, the API key check is failing.

### Step 3: Check for These Errors

**Error 1: No logs at all**
```
❌ Problem: API key check is failing
✅ Solution: Fix process.env.API_KEY → import.meta.env.VITE_GEMINI_API_KEY
```

**Error 2: "Microphone access denied"**
```
❌ Problem: Browser permission denied
✅ Solution: Check browser settings, allow microphone access
```

**Error 3: "Session error" or "Connection timeout"**
```
❌ Problem: Gemini API not responding
✅ Solution: Check API key is valid, check internet connection
```

**Error 4: Audio plays but no microphone input**
```
❌ Problem: Audio chain is broken
✅ Solution: Remove scriptProcessor.connect(destination) line
```

---

## 📊 What Should Happen (After Fixes)

### Timeline:
```
1. User clicks Mic button
   ↓
2. Console shows: "[object Object]oiceInterface: Starting session..."
   ↓
3. Console shows: "🎤 VoiceInterface: AudioContexts created"
   ↓
4. Browser asks for microphone permission
   ↓
5. User clicks "Allow"
   ↓
6. Console shows: "🎤 VoiceInterface: Microphone access granted"
   ↓
7. Console shows: "🎤 VoiceInterface: Connecting to Gemini..."
   ↓
8. Console shows: "🎤 VoiceInterface: Connected to Gemini"
   ↓
9. UI shows "Listening..." status
   ↓
10. User speaks into microphone
    ↓
11. Console shows user transcript
    ↓
12. Eva responds
    ↓
13. Audio plays
    ↓
14. UI shows "Speaking..." status
```

---

## 🧪 Test Cases

### Test 1: API Key Check
```javascript
// In browser console, type:
console.log(import.meta.env.VITE_GEMINI_API_KEY);

// Should show your API key (not undefined)
// If undefined, check .env file
```

### Test 2: Microphone Permission
```javascript
// In browser console, type:
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(() => console.log('✅ Microphone access granted'))
  .catch(err => console.error('❌ Microphone error:', err));

// Should show "✅ Microphone access granted"
```

### Test 3: AudioContext
```javascript
// In browser console, type:
const ctx = new AudioContext();
console.log('AudioContext state:', ctx.state);
if (ctx.state === 'suspended') {
  ctx.resume().then(() => console.log('✅ Resumed'));
}

// Should show "running" or "✅ Resumed"
```

### Test 4: Gemini API
```javascript
// In browser console, type:
const { GoogleGenAI } = window;
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
console.log('✅ Gemini client created');

// Should show "✅ Gemini client created"
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "process.env.API_KEY is undefined"
```
Cause: Using process.env instead of import.meta.env
Fix: Change to import.meta.env.VITE_GEMINI_API_KEY
Time: 2 minutes
```

### Issue 2: "aiService is not defined"
```
Cause: Missing import statement
Fix: Add import { AIService } from '../../services/aiService';
Time: 1 minute
```

### Issue 3: "Microphone permission denied"
```
Cause: User clicked "Block" or browser doesn't have permission
Fix: Check browser settings, reset permissions, try again
Time: 2 minutes
```

### Issue 4: "Connection timeout"
```
Cause: Gemini API not responding
Fix: Check internet connection, check API key validity
Time: 5 minutes
```

### Issue 5: "Audio plays but no microphone input"
```
Cause: Audio chain is broken (scriptProcessor connected to destination)
Fix: Remove scriptProcessor.connect(destination) line
Time: 2 minutes
```

### Issue 6: "Audio is too quiet"
```
Cause: No gain node for microphone boost
Fix: Add gainNode with gain.value = 1.5
Time: 3 minutes
```

### Issue 7: "No audio output"
```
Cause: OutputAudioContext is suspended
Fix: Add outputAudioContext.resume() call
Time: 2 minutes
```

---

## 📝 Checklist Before Fixes

- [ ] Check .env file has VITE_GEMINI_API_KEY
- [ ] Check API key is valid (not expired, not empty)
- [ ] Check browser allows microphone access
- [ ] Check internet connection is working
- [ ] Check Gemini API is not rate-limited
- [ ] Check browser console for errors

---

## ✅ Checklist After Fixes

- [ ] Console shows "🎤 VoiceInterface: Starting session..."
- [ ] Console shows[object Object]Interface: AudioContexts created"
- [ ] Console shows "🎤 VoiceInterface: Microphone access granted"
- [ ] Console shows "🎤 VoiceInterface: Connecting to Gemini..."
- [ ] Console shows "🎤 VoiceInterface: Connected to Gemini"
- [ ] UI shows "Listening..." status
- [ ] Microphone captures audio
- [ ] User transcript appears
- [ ] Eva responds
- [ ] Audio plays
- [ ] No console errors

---

## 🎯 Priority Order

1. **FIRST:** Fix API key check (2 min) - This is the blocker
2. **SECOND:** Add AIService import (1 min) - Prevents crash
3. **THIRD:** Fix audio chain (3 min) - Enables audio input
4. **FOURTH:** Add error handling (5 min) - Better UX
5. **FIFTH:** Add timeout (5 min) - Prevent hanging
6. **SIXTH:** Add logging (5 min) - Debugging
7. **SEVENTH:** Add gain control (3 min) - Better audio
8. **EIGHTH:** Resume AudioContext (2 min) - Ensure works

**Total Time:** ~30 minutes

---

## 🚀 Quick Start

1. **Read:** MICROPHONE_FIXES.md (10 min)
2. **Apply:** All 8 fixes (20 min)
3. **Test:** Using checklist above (5 min)
4. **Debug:** If issues, check console logs (5 min)

---

## 📞 If Still Not Working

### Check 1: Is API key set?
```bash
# In project root, check .env file
cat .env | grep VITE_GEMINI_API_KEY
```

### Check 2: Is Vite running?
```bash
# Should see:
# ➜  Local:   http://localhost:3001/
```

### Check 3: Are there console errors?
```
F12 → Console tab → Look for red errors
```

### Check 4: Is microphone working?
```
System Settings → Privacy → Microphone → Check app is allowed
```

### Check 5: Is Gemini API working?
```
Try: curl https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-native-audio-preview-09-2025:generateContent \
  -H "x-goog-api-key: YOUR_API_KEY"
```

---

## 📊 Expected Console Output

```
🎤 VoiceInterface: Starting session... { hasApiKey: true }
🎤 VoiceInterface: AudioContexts created
🎤 VoiceInterface: Input AudioContext resumed
🎤 VoiceInterface: Output AudioContext resumed
🎤 VoiceInterface: Microphone access granted
🎤 VoiceInterface: Connecting to Gemini...
🎤 VoiceInterface: Connected to Gemini
[User speaks]
🎤 VoiceInterface: User transcript: "Hello Eva"
🎤 VoiceInterface: Bot transcript: "Hello! How can I help with your eye health?"
[Audio plays]
```

---

## 🎓 Key Concepts

### API Key Check
- **Old (Wrong):** `process.env.API_KEY` → Always undefined in browser
- **New (Correct):** `import.meta.env.VITE_GEMINI_API_KEY` → Works in Vite

### Audio Chain
- **Microphone** → **GainNode** → **ScriptProcessor** → **Gemini**
- NOT: ScriptProcessor → Destination (this breaks it)

### PCM Encoding
- **Input:** Float32 audio data [-1, 1]
- **Output:** Int16 PCM data [-32768, 32767]
- **Important:** Clip to [-1, 1] before conversion

### AudioContext States
- **suspended:** Audio not yet started (need to resume)
- **running:** Audio is active (good)
- **closed:** Audio is stopped (need to create new)

---

**Generated:** 2025-11-27  
**Status:** Ready for Debugging

