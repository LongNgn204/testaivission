/**
 * 🎤 VOICE COMMAND BUTTON
 * 
 * Floating button để kích hoạt voice control
 * Hiển thị visual feedback, listening state, và command suggestions
 */

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, HelpCircle } from 'lucide-react';
import { useVoiceControl } from '../hooks/useVoiceControl';
import { useLanguage } from '../context/LanguageContext';

export const VoiceCommandButton: React.FC = () => {
  const {
    isListening,
    isSpeaking,
    transcript,
    feedback,
    command,
    toggleListening,
  } = useVoiceControl();

  const { t, language } = useLanguage();
  const [showHelp, setShowHelp] = useState(false);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  // Listen for custom event to show help
  useEffect(() => {
    const handleShowHelp = () => setShowHelp(true);
    window.addEventListener('show-voice-help', handleShowHelp);
    return () => window.removeEventListener('show-voice-help', handleShowHelp);
  }, []);

  // Pulse animation when listening
  useEffect(() => {
    if (isListening) {
      setPulseAnimation(true);
    } else {
      setPulseAnimation(false);
    }
  }, [isListening]);

  return (
    <>
      {/* Main Voice Control Button */}
      <div className="fixed bottom-40 right-8 z-40">
        <div className="relative">
          {/* Pulse animation rings */}
          {isListening && (
            <>
              <div className="absolute inset-0 rounded-full bg-purple-500/30 animate-ping"></div>
              <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </>
          )}

          {/* Main button */}
          <button
            onClick={toggleListening}
            className={`relative p-5 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 ${
              isListening
                ? 'bg-gradient-to-br from-purple-600 to-pink-600 ring-4 ring-purple-400/50'
                : isSpeaking
                ? 'bg-gradient-to-br from-blue-600 to-cyan-600 animate-pulse'
                : 'bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700'
            }`}
            aria-label={isListening ? 'Stop voice control' : 'Start voice control'}
          >
            {isListening ? (
              <Mic size={32} className="text-white" />
            ) : isSpeaking ? (
              <Volume2 size={32} className="text-white" />
            ) : (
              <MicOff size={32} className="text-white" />
            )}
          </button>

          {/* Status indicator dot */}
          <div
            className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
              isListening
                ? 'bg-green-500 animate-pulse'
                : isSpeaking
                ? 'bg-blue-500 animate-pulse'
                : 'bg-gray-400'
            }`}
          ></div>

          {/* Help button */}
          <button
            onClick={() => setShowHelp(true)}
            className="absolute -bottom-12 left-1/2 -translate-x-1/2 p-2 bg-gray-700/80 hover:bg-gray-600/90 rounded-full transition-all"
            aria-label="Voice commands help"
          >
            <HelpCircle size={20} className="text-white" />
          </button>
        </div>

        {/* Transcript/Feedback bubble */}
        {(transcript || feedback) && (
          <div className="absolute bottom-full right-0 mb-4 max-w-xs animate-fade-in">
            <div className="bg-gray-900/95 backdrop-blur-sm text-white rounded-2xl px-4 py-3 shadow-2xl">
              {/* Transcript (what user said) */}
              {transcript && (
                <div className="mb-2">
                  <p className="text-xs text-gray-400 mb-1">
                    {language === 'vi' ? '🎤 Bạn nói:' : '🎤 You said:'}
                  </p>
                  <p className="text-sm font-medium">{transcript}</p>
                </div>
              )}

              {/* Feedback (system response) */}
              {feedback && command && (
                <div className={transcript ? 'pt-2 border-t border-gray-700' : ''}>
                  <p className="text-xs text-gray-400 mb-1">
                    {language === 'vi' ? '✨ Eva:' : '✨ Eva:'}
                  </p>
                  <p className="text-sm text-green-400">{feedback}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'vi' ? 'Độ chính xác:' : 'Confidence:'} {Math.round(command.confidence * 100)}%
                  </p>
                </div>
              )}

              {/* Error state */}
              {feedback && !command && (
                <div>
                  <p className="text-sm text-red-400">{feedback}</p>
                </div>
              )}
            </div>
            
            {/* Arrow pointer */}
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-gray-900/95 transform rotate-45"></div>
          </div>
        )}

        {/* Status text below button */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 text-center">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
            {isListening
              ? (language === 'vi' ? '🎤 Đang nghe...' : '🎤 Listening...')
              : isSpeaking
              ? (language === 'vi' ? '🔊 Eva đang nói...' : '🔊 Eva speaking...')
              : (language === 'vi' ? 'Nhấn để nói' : 'Click to speak')}
          </p>
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Mic size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {language === 'vi' ? '🎤 Lệnh Giọng Nói' : '🎤 Voice Commands'}
                    </h2>
                    <p className="text-sm text-purple-100">
                      {language === 'vi' 
                        ? 'Điều khiển toàn bộ app bằng giọng nói' 
                        : 'Control the entire app with your voice'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <span className="text-2xl text-white">×</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
              {/* Quick Start */}
              <div className="mb-6 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'vi' ? '🚀 Bắt đầu nhanh' : '🚀 Quick Start'}
                </h3>
                <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <span>{language === 'vi' ? 'Nhấn nút mic tròn màu tím' : 'Click the purple mic button'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <span>{language === 'vi' ? 'Nói lệnh rõ ràng (có thể bỏ qua "Eva")' : 'Speak your command clearly (you can skip "Eva")'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <span>{language === 'vi' ? 'Eva sẽ thực hiện và phản hồi bằng giọng nói' : 'Eva will execute and respond with voice'}</span>
                  </li>
                </ol>
              </div>

              {/* Command Categories */}
              <div className="space-y-4">
                {/* Navigation */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-2">
                    📍 {language === 'vi' ? 'Điều hướng' : 'Navigation'}
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• "{language === 'vi' ? 'Eva, về trang chủ' : 'Eva, go home'}"</li>
                    <li>• "{language === 'vi' ? 'Eva, xem lịch sử' : 'Eva, show history'}"</li>
                    <li>• "{language === 'vi' ? 'Eva, tìm bệnh viện' : 'Eva, find hospital'}"</li>
                    <li>• "{language === 'vi' ? 'Eva, xem nhắc nhở' : 'Eva, show reminders'}"</li>
                  </ul>
                </div>

                {/* Tests */}
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-2">
                    🧪 {language === 'vi' ? 'Bài Test' : 'Tests'}
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• "{language === 'vi' ? 'Eva, bắt đầu test thị lực' : 'Eva, start vision test'}"</li>
                    <li>• "{language === 'vi' ? 'Eva, làm test mù màu' : 'Eva, start color blind test'}"</li>
                    <li>• "{language === 'vi' ? 'Eva, test loạn thị' : 'Eva, start astigmatism test'}"</li>
                    <li>• "{language === 'vi' ? 'Eva, test lưới Amsler' : 'Eva, start Amsler grid test'}"</li>
                    <li>• "{language === 'vi' ? 'Eva, test Duochrome' : 'Eva, start duochrome test'}"</li>
                  </ul>
                </div>

                {/* Export */}
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-2">
                    📄 {language === 'vi' ? 'Xuất báo cáo' : 'Export'}
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• "{language === 'vi' ? 'Eva, xuất báo cáo PDF' : 'Eva, export PDF report'}"</li>
                    <li>• "{language === 'vi' ? 'Eva, xem báo cáo' : 'Eva, show report'}"</li>
                  </ul>
                </div>

                {/* Settings */}
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-2">
                    ⚙️ {language === 'vi' ? 'Cài đặt' : 'Settings'}
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• "{language === 'vi' ? 'Eva, bật chế độ tối' : 'Eva, turn on dark mode'}"</li>
                    <li>• "{language === 'vi' ? 'Eva, tắt chế độ tối' : 'Eva, turn off dark mode'}"</li>
                    <li>• "{language === 'vi' ? 'Eva, đổi sang tiếng Việt' : 'Eva, change to Vietnamese'}"</li>
                    <li>• "{language === 'vi' ? 'Eva, đổi sang tiếng Anh' : 'Eva, change to English'}"</li>
                  </ul>
                </div>

                {/* General */}
                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-2">
                    🎯 {language === 'vi' ? 'Chung' : 'General'}
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• "{language === 'vi' ? 'Eva, giúp tôi' : 'Eva, help'}"</li>
                    <li>• "{language === 'vi' ? 'Eva, dừng lại' : 'Eva, stop'}"</li>
                    <li>• "{language === 'vi' ? 'Eva, làm mới' : 'Eva, refresh'}"</li>
                  </ul>
                </div>
              </div>

              {/* Tips */}
              <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl">
                <h3 className="text-md font-semibold text-amber-900 dark:text-amber-300 mb-2">
                  💡 {language === 'vi' ? 'Mẹo' : 'Tips'}
                </h3>
                <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
                  <li>• {language === 'vi' ? 'Bạn có thể bỏ qua từ "Eva" - chỉ cần nói lệnh trực tiếp' : 'You can skip the word "Eva" - just say the command directly'}</li>
                  <li>• {language === 'vi' ? 'Nói rõ ràng và với tốc độ vừa phải' : 'Speak clearly at a moderate pace'}</li>
                  <li>• {language === 'vi' ? 'Trong môi trường ồn, hãy đến gần micro hơn' : 'In noisy environments, move closer to the microphone'}</li>
                  <li>• {language === 'vi' ? 'Kiểm tra độ chính xác trong bong bóng phản hồi' : 'Check accuracy in the feedback bubble'}</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
              <button
                onClick={() => setShowHelp(false)}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all"
              >
                {language === 'vi' ? 'Đã hiểu' : 'Got it'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};
