/**
 * =================================================================
 * 🎙️ VoiceControlContext - Quyền micro & trạng thái giọng nói toàn cục
 * =================================================================
 *
 * MỤC ĐÍCH:
 * - Quản lý quyền truy cập microphone (Permissions API + getUserMedia).
 * - Bật/tắt tính năng giọng nói toàn cục (persist qua localStorage).
 * - Cung cấp hàm yêu cầu quyền micro theo nhu cầu.
 *
 * CÁCH SỬ DỤNG:
 * 1) Bọc <VoiceControlProvider> quanh App (xem App.tsx).
 * 2) Trong component: const { hasMicPermission, requestMicPermission, voiceEnabled, setVoiceEnabled } = useVoiceControl();
 * 3) Gợi ý UI: Nếu hasMicPermission === 'denied' → hiển thị hướng dẫn bật mic trong trình duyệt.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type MicPermission = 'granted' | 'denied' | 'prompt' | 'unknown';

interface VoiceControlContextType {
  hasMicPermission: MicPermission;
  checkingPermission: boolean;
  requestMicPermission: () => Promise<MicPermission>;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
}

const VoiceControlContext = createContext<VoiceControlContextType | undefined>(undefined);

const VOICE_ENABLED_KEY = 'voice_enabled';

export const VoiceControlProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasMicPermission, setHasMicPermission] = useState<MicPermission>('unknown');
  const [checkingPermission, setCheckingPermission] = useState(true);
  const [voiceEnabled, setVoiceEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(VOICE_ENABLED_KEY);
      return saved ? JSON.parse(saved) : true; // mặc định bật
    } catch {
      return true;
    }
  });

  const setVoiceEnabled = useCallback((enabled: boolean) => {
    setVoiceEnabledState(enabled);
    try { localStorage.setItem(VOICE_ENABLED_KEY, JSON.stringify(enabled)); } catch {}
  }, []);

  // Kiểm tra quyền micro (nếu trình duyệt hỗ trợ Permissions API)
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      setCheckingPermission(true);
      try {
        // Some browsers use 'microphone', others 'camera'/'microphone' via mediaDevices only
        const anyNav: any = navigator;
        if (anyNav.permissions && anyNav.permissions.query) {
          const status = await anyNav.permissions.query({ name: 'microphone' as PermissionName });
          if (!cancelled) setHasMicPermission(status.state as MicPermission);
          status.onchange = () => {
            if (!cancelled) setHasMicPermission(status.state as MicPermission);
          };
        } else {
          // Fallback: Không hỗ trợ Permissions API → chờ đến khi user yêu cầu
          if (!cancelled) setHasMicPermission('unknown');
        }
      } catch {
        if (!cancelled) setHasMicPermission('unknown');
      } finally {
        if (!cancelled) setCheckingPermission(false);
      }
    };
    check();
    return () => { cancelled = true; };
  }, []);

  // Yêu cầu quyền micro chủ động
  const requestMicPermission = useCallback(async (): Promise<MicPermission> => {
    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('Microphone permission denied or unavailable: getUserMedia not supported');
        setHasMicPermission('denied');
        return 'denied';
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      setHasMicPermission('granted');
      return 'granted';
    } catch (e) {
      console.warn('Microphone permission denied or unavailable:', e);
      // Lưu ý: khi user bấm "Block", trạng thái có thể là 'denied' hoặc vẫn 'prompt' tùy trình duyệt
      setHasMicPermission('denied');
      return 'denied';
    }
  }, []);

  const value = useMemo<VoiceControlContextType>(() => ({
    hasMicPermission,
    checkingPermission,
    requestMicPermission,
    voiceEnabled,
    setVoiceEnabled,
  }), [hasMicPermission, checkingPermission, requestMicPermission, voiceEnabled, setVoiceEnabled]);

  return (
    <VoiceControlContext.Provider value={value}>
      {children}
    </VoiceControlContext.Provider>
  );
};

export const useVoiceControl = (): VoiceControlContextType => {
  const ctx = useContext(VoiceControlContext);
  if (!ctx) throw new Error('useVoiceControl must be used within VoiceControlProvider');
  return ctx;
};

