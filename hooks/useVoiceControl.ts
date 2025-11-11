/**
 * 🎤 ENHANCED VOICE CONTROL HOOK
 * 
 * Hook toàn diện để điều khiển app bằng giọng nói
 * Tích hợp với VoiceCommandService và AIService
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { voiceCommandService, VoiceCommand } from '../services/voiceCommandService';
import { AIService } from '../services/aiService';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { usePdfExport } from './usePdfExport';

interface VoiceControlState {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  command: VoiceCommand | null;
  feedback: string;
  error: string | null;
}

export const useVoiceControl = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { exportToPdf } = usePdfExport();
  
  const [state, setState] = useState<VoiceControlState>({
    isListening: false,
    isSpeaking: false,
    transcript: '',
    command: null,
    feedback: '',
    error: null,
  });

  const recognitionRef = useRef<any>(null);
  const aiService = useRef(new AIService());

  /**
   * Khởi tạo Speech Recognition
   */
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setState(prev => ({ ...prev, error: 'Speech recognition not supported' }));
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = language === 'vi' ? 'vi-VN' : 'en-US';
    recognitionRef.current.maxAlternatives = 3;

    recognitionRef.current.onresult = (event: any) => {
      const results = event.results;
      const transcript = Array.from(results)
        .map((result: any) => result[0].transcript)
        .join('');
      
      setState(prev => ({ ...prev, transcript }));

      // Nếu là final result, parse command
      if (results[results.length - 1].isFinal) {
        handleTranscript(transcript);
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setState(prev => ({ 
        ...prev, 
        isListening: false, 
        error: `Recognition error: ${event.error}` 
      }));
    };

    recognitionRef.current.onend = () => {
      setState(prev => ({ ...prev, isListening: false }));
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language]);

  /**
   * Xử lý transcript và thực thi command
   */
  const handleTranscript = useCallback(async (transcript: string) => {
    console.log('🎤 Transcript:', transcript);

    // Parse command
    const command = voiceCommandService.parseCommand(transcript);
    
    if (!command) {
      setState(prev => ({ 
        ...prev, 
        command: null,
        feedback: language === 'vi' ? 'Không hiểu lệnh. Thử lại?' : 'Command not recognized. Try again?',
        error: 'Command not recognized'
      }));
      
      // Speak error feedback
      speakFeedback(language === 'vi' ? 'Xin lỗi, tôi không hiểu lệnh này' : 'Sorry, I didn\'t understand that command');
      return;
    }

    console.log('✅ Command:', command);
    
    // Get feedback message
    const feedback = voiceCommandService.getFeedbackMessage(command, language);
    setState(prev => ({ ...prev, command, feedback }));

    // Speak feedback
    await speakFeedback(feedback);

    // Execute command
    await executeCommand(command);

  }, [language, navigate, setLanguage, setTheme, exportToPdf]);

  /**
   * Thực thi command
   */
  const executeCommand = useCallback(async (command: VoiceCommand) => {
    try {
      // NAVIGATION
      if (command.intent === 'navigate') {
        const routes: Record<string, string> = {
          home: '/',
          history: '/history',
          hospitals: '/hospitals',
          reminders: '/reminders',
          about: '/about',
        };
        
        const route = routes[command.target || ''];
        if (route) {
          navigate(route);
        }
        return;
      }

      // TEST
      if (command.intent === 'test') {
        const testRoutes: Record<string, string> = {
          snellen: '/test/snellen',
          colorblind: '/test/colorblind',
          astigmatism: '/test/astigmatism',
          amsler: '/test/amsler',
          duochrome: '/test/duochrome',
        };
        
        const route = testRoutes[command.target || ''];
        if (route) {
          navigate(route);
        }
        return;
      }

      // EXPORT
      if (command.intent === 'export') {
        if (command.action === 'pdf') {
          const fileName = `vision-report-${new Date().getTime()}`;
          await exportToPdf(fileName);
          await speakFeedback(
            language === 'vi' 
              ? 'Đã xuất báo cáo PDF thành công' 
              : 'PDF report exported successfully'
          );
        }
        return;
      }

      // SETTINGS
      if (command.intent === 'settings') {
        if (command.target === 'dark_mode') {
          setTheme(command.action === 'enable' ? 'dark' : 'light');
        } else if (command.target === 'language_vi') {
          setLanguage('vi');
          await speakFeedback('Đã đổi sang tiếng Việt');
        } else if (command.target === 'language_en') {
          setLanguage('en');
          await speakFeedback('Changed to English');
        }
        return;
      }

      // HELP
      if (command.intent === 'help') {
        // Sẽ trigger modal hiện help
        window.dispatchEvent(new CustomEvent('show-voice-help'));
        return;
      }

      // GENERAL
      if (command.intent === 'general') {
        if (command.action === 'stop') {
          stopListening();
        } else if (command.action === 'refresh') {
          window.location.reload();
        }
        return;
      }

    } catch (error) {
      console.error('Command execution error:', error);
      await speakFeedback(
        language === 'vi' 
          ? 'Xin lỗi, có lỗi xảy ra khi thực hiện lệnh' 
          : 'Sorry, an error occurred while executing the command'
      );
    }
  }, [navigate, setLanguage, setTheme, exportToPdf, language]);

  /**
   * Speak feedback bằng Web Speech API
   */
  const speakFeedback = useCallback(async (text: string) => {
    setState(prev => ({ ...prev, isSpeaking: true }));

    try {
      // Dùng AIService TTS nếu có
      await aiService.current.generateSpeech(text, language);
    } catch (error) {
      // Fallback to Web Speech API
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'vi' ? 'vi-VN' : 'en-US';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        utterance.onend = () => {
          setState(prev => ({ ...prev, isSpeaking: false }));
        };

        window.speechSynthesis.speak(utterance);
      }
    }

    // Reset isSpeaking sau 3 giây (timeout)
    setTimeout(() => {
      setState(prev => ({ ...prev, isSpeaking: false }));
    }, 3000);
  }, [language]);

  /**
   * Bắt đầu listening
   */
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setState(prev => ({ ...prev, error: 'Speech recognition not available' }));
      return;
    }

    try {
      // Reset state
      setState(prev => ({ 
        ...prev, 
        isListening: true, 
        transcript: '', 
        command: null,
        feedback: '',
        error: null 
      }));

      // Update language
      recognitionRef.current.lang = language === 'vi' ? 'vi-VN' : 'en-US';
      
      // Start recognition
      recognitionRef.current.start();

      console.log('🎤 Voice control started');
    } catch (error) {
      console.error('Start listening error:', error);
      setState(prev => ({ ...prev, isListening: false, error: 'Failed to start listening' }));
    }
  }, [language]);

  /**
   * Dừng listening
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setState(prev => ({ ...prev, isListening: false }));
    console.log('🎤 Voice control stopped');
  }, []);

  /**
   * Toggle listening
   */
  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [state.isListening, startListening, stopListening]);

  return {
    ...state,
    startListening,
    stopListening,
    toggleListening,
    speakFeedback,
  };
};
