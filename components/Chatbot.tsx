import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Mic, Bot, User, Loader2 } from 'lucide-react';
import { useAI } from '../context/AIContext';
import { useLanguage } from '../context/LanguageContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { sanitizeText, isLikelyInjection } from '../utils/sanitize';
import { useToastContext } from '../context/ToastContext';
import { analytics, EventType } from '../services/analyticsService';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

export const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const aiService = useAI();
  const { language } = useLanguage();
  const { error: toastError } = useToastContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition({ language });

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = useCallback(async () => {
    if (isGenerating) return;

    const cleaned = sanitizeText(input, 300);
    if (!cleaned) return;

    if (isLikelyInjection(cleaned)) {
      toastError(language === 'vi' ? 'Nội dung không hợp lệ.' : 'Input not allowed.');
      return;
    }

    // Track analytics
    analytics.trackEvent(EventType.AI_CHAT_MESSAGE, { source: 'user', len: cleaned.length });

    const userMessage: Message = { sender: 'user', text: cleaned };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);

    // Placeholder AI message
    setMessages(prev => [...prev, { sender: 'ai', text: '' }]);

    try {
      await aiService.generateChatResponse(cleaned, language, (chunk) => {
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.sender === 'ai') {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { ...lastMessage, text: lastMessage.text + chunk };
            return newMessages;
          }
          return prev;
        });
      });
      analytics.trackEvent(EventType.AI_CHAT_MESSAGE, { source: 'ai' });
    } catch (error) {
      console.error('Chat generation error:', error);
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.sender === 'ai') {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { ...lastMessage, text: language === 'vi' ? 'Xin lỗi, tôi gặp lỗi.' : 'Sorry, I encountered an error.' };
          return newMessages;
        }
        return prev;
      });
      toastError(language === 'vi' ? 'Lỗi khi tạo phản hồi' : 'Error generating response');
    } finally {
      setIsGenerating(false);
      stopListening();
    }
  }, [input, isGenerating, language, aiService, stopListening, toastError]);

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl mx-auto my-8">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender === 'ai' && <Bot className="w-8 h-8 text-blue-500 flex-shrink-0" />}
            <div className={`px-4 py-3 rounded-2xl max-w-md ${msg.sender === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
              {msg.text || <Loader2 className="w-5 h-5 animate-spin" />}
            </div>
            {msg.sender === 'user' && <User className="w-8 h-8 text-gray-500 flex-shrink-0" />}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t dark:border-gray-700 p-4 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask me anything about your eye health..."
          className="flex-1 w-full px-4 py-2 rounded-full border dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isGenerating}
        />
        <button onClick={() => isListening ? stopListening() : startListening()} className={`p-3 rounded-full ${isListening ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>
          <Mic className="w-6 h-6" />
        </button>
        <button onClick={handleSend} disabled={isGenerating || input.trim() === ''} className="p-3 rounded-full bg-blue-500 text-white disabled:bg-gray-400">
          {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
};

