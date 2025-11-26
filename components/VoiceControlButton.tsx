/**
 * =================================================================
 * 🎙️ VoiceControlButton - Nút bật/tắt giọng nói + xin quyền micro
 * =================================================================
 *
 * MỤC ĐÍCH:
 * - Cho phép người dùng bật/tắt Voice Coach toàn cục (voiceEnabled trong Context).
 * - Xin quyền microphone khi bật lần đầu (Permissions API + getUserMedia).
 * - Hiển thị trạng thái quyền: granted / prompt / denied.
 *
 * CÁCH DÙNG:
 * - Đặt nút ở Header hoặc bất kỳ nơi nào thuận tiện:
 *   <VoiceControlButton />
 */
import React from 'react';
import { Mic, MicOff, ShieldAlert } from 'lucide-react';
import { useVoiceControl } from '../context/VoiceControlContext';

export const VoiceControlButton: React.FC = () => {
  const { hasMicPermission, checkingPermission, requestMicPermission, voiceEnabled, setVoiceEnabled } = useVoiceControl();

  const onToggle = async () => {
    if (!voiceEnabled) {
      // Bật: nếu chưa có quyền thì xin quyền trước
      const status = await requestMicPermission();
      if (status === 'granted') setVoiceEnabled(true);
    } else {
      // Tắt
      setVoiceEnabled(false);
    }
  };

  const renderStatus = () => {
    if (checkingPermission) return <span className="text-xs text-gray-400">...</span>;
    if (hasMicPermission === 'denied') return (
      <span className="flex items-center gap-1 text-xs text-amber-600"><ShieldAlert size={14}/>Bật mic trong trình duyệt</span>
    );
    if (hasMicPermission === 'prompt') return <span className="text-xs text-gray-500">Yêu cầu quyền khi bật</span>;
    if (hasMicPermission === 'granted') return <span className="text-xs text-green-600">Mic OK</span>;
    return <span className="text-xs text-gray-500">Chưa rõ</span>;
  };

  return (
    <button
      onClick={onToggle}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${voiceEnabled ? 'bg-blue-600 text-white border-blue-700' : 'bg-white/70 dark:bg-gray-800/60 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700'}`}
    >
      {voiceEnabled ? <Mic size={16}/> : <MicOff size={16}/>}
      <span className="text-sm font-semibold">{voiceEnabled ? 'Voice ON' : 'Voice OFF'}</span>
      {renderStatus()}
    </button>
  );
};

