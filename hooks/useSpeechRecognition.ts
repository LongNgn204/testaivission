/**
 * ============================================================
 * 🎤 useSpeechRecognition Hook - Browser Web Speech API
 * ============================================================
 * 
 * Hook để sử dụng Speech Recognition API của trình duyệt
 * Hỗ trợ continuous mode, interim results, và final text tracking
 */

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  onresult: ((event: any) => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechState {
  isSupported: boolean;
  isListening: boolean;
  interimText: string;
  finalText: string;
  error: string | null;
}

export function useSpeechRecognition(language: 'vi' | 'en' = 'vi') {
  const [state, setState] = useState<SpeechState>({
    isSupported: false,
    isListening: false,
    interimText: '',
    finalText: '',
    error: null,
  });

  const recRef = useRef<SpeechRecognitionLike | null>(null);

  const SpeechRecognitionCtor = useMemo(() => {
    // Chrome/Edge thường là webkitSpeechRecognition
    const w = window as any;
    return w.SpeechRecognition || w.webkitSpeechRecognition || null;
  }, []);

  useEffect(() => {
    setState((s) => ({ ...s, isSupported: Boolean(SpeechRecognitionCtor) }));
  }, [SpeechRecognitionCtor]);

  const start = useCallback(() => {
    if (!SpeechRecognitionCtor) {
      setState((s) => ({ ...s, error: 'Trình duyệt không hỗ trợ SpeechRecognition' }));
      return;
    }

    // Nếu đang chạy thì stop trước để tránh "double start"
    try { 
      recRef.current?.stop?.(); 
    } catch {}

    const rec = new SpeechRecognitionCtor();
    recRef.current = rec;

    // Chú thích: tiếng Việt thuần, ưu tiên nhận dạng ổn định
    rec.lang = language === 'vi' ? 'vi-VN' : 'en-US';
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setState((s) => ({ ...s, isListening: true, error: null, interimText: '', finalText: '' }));
    };

    rec.onerror = (e: any) => {
      // Chú thích: log/lỗi gọn để UI hiện thông báo
      setState((s) => ({
        ...s,
        error: e?.error ? `STT lỗi: ${e.error}` : 'STT lỗi không xác định',
        isListening: false,
      }));
    };

    rec.onend = () => {
      setState((s) => ({ ...s, isListening: false }));
    };

    rec.onresult = (evt: any) => {
      let interim = '';
      let final = '';

      for (let i = evt.resultIndex; i < evt.results.length; i++) {
        const r = evt.results[i];
        const text = String(r?.[0]?.transcript ?? '');
        if (r.isFinal) final += text;
        else interim += text;
      }

      setState((s) => ({
        ...s,
        interimText: interim.trim(),
        finalText: (s.finalText + ' ' + final).trim(),
      }));
    };

    try {
      rec.start();
    } catch (e: any) {
      setState((s) => ({ ...s, error: `Không start được STT: ${String(e)}` }));
    }
  }, [SpeechRecognitionCtor, language]);

  const stop = useCallback(() => {
    try { 
      recRef.current?.stop?.(); 
    } catch {}
  }, []);

  const reset = useCallback(() => {
    setState((s) => ({ ...s, interimText: '', finalText: '', error: null }));
  }, []);

  return { ...state, start, stop, reset };
}

