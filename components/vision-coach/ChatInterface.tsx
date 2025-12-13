import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Bot, Send, User, Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useRoutine } from '../../context/RoutineContext';
import { StorageService } from '../../services/storageService';

const storageService = new StorageService();

interface ChatInterfaceProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ isOpen, onClose }) => {
    const { t, language } = useLanguage();
    const { userProfile } = useRoutine();
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'bot', text: string }>>([]);
    const [status, setStatus] = useState<'idle' | 'thinking'>('idle');
    const [liveVoice, setLiveVoice] = useState(false);
    const [model, setModel] = useState<string>(() => localStorage.getItem('chat_model') || '@cf/meta/llama-3.1-8b-instruct');
    const [temperature, setTemperature] = useState<number>(() => {
        const v = localStorage.getItem('chat_temperature');
        return v ? Number(v) : 0.7;
    });
    const [topP, setTopP] = useState<number>(() => {
        const v = localStorage.getItem('chat_top_p');
        return v ? Number(v) : 0.8;
    });
    const [maxTokens, setMaxTokens] = useState<number>(() => {
        const v = localStorage.getItem('chat_max_tokens');
        return v ? Number(v) : 1200;
    });
    const speechQueueRef = useRef<string[]>([]);
    const speakingRef = useRef(false);
    const [speakingUI, setSpeakingUI] = useState(false);
    const [paused, setPaused] = useState(false);
    const speechBufferRef = useRef<string>('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, status]);

    // Reset state when closed
    useEffect(() => {
        if (!isOpen) {
            setChatInput('');
            setStatus('idle');
        }
    }, [isOpen]);

    // One-time disclaimer as a bot message (per device)
    useEffect(() => {
        if (!isOpen) return;
        try {
            const key = 'eva_disclaimer_seen_v1';
            const seen = localStorage.getItem(key);
            if (!seen) {
                const msg = language === 'vi'
                    ? 'Lưu ý: Eva là trợ lý AI hỗ trợ sức khỏe mắt và KHÔNG thay thế chẩn đoán/bác sĩ. Nếu có triệu chứng khẩn cấp (mất thị lực đột ngột, đau mắt dữ dội, chấn thương mắt), hãy đi cấp cứu ngay.'
                    : 'Note: Eva is an AI eye health assistant and does NOT replace a doctor. For emergencies (sudden vision loss, severe eye pain, eye trauma), seek urgent care immediately.';
                setChatHistory(prev => [...prev, { role: 'bot', text: msg }]);
                localStorage.setItem(key, '1');
            }
        } catch {}
    }, [isOpen, language]);

    // =====================
    // LIVE VOICE (TTS) – theo chunk streaming
    // =====================
    const cancelSpeech = useCallback(() => {
        try {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        } catch {}
        speakingRef.current = false;
        speechQueueRef.current = [];
        if (speechBufferRef.current) speechBufferRef.current = '';
    }, []);

    const speakNext = useCallback(() => {
        if (!liveVoice) return;
        if (speakingRef.current) return;
        const next = speechQueueRef.current.shift();
        if (!next) return;
        if (!('speechSynthesis' in window)) return;

        try {
            speakingRef.current = true;
            const utter = new SpeechSynthesisUtterance(next);
            utter.lang = language === 'vi' ? 'vi-VN' : 'en-US';
            utter.rate = 1.0;
            utter.pitch = 1.0;
            utter.volume = 1.0;
            utter.onend = () => {
                speakingRef.current = false;
                setSpeakingUI(false);
                setPaused(false);
                // Nói tiếp chunk kế tiếp (nếu còn)
                speakNext();
            };
            utter.onerror = () => {
                speakingRef.current = false;
                setSpeakingUI(false);
                setPaused(false);
                speakNext();
            };
            // Chọn voice phù hợp (nếu có)
            const voices = window.speechSynthesis.getVoices();
            const target = voices.find(v => v.lang?.toLowerCase().startsWith(language === 'vi' ? 'vi' : 'en'));
            if (target) utter.voice = target;
            window.speechSynthesis.speak(utter);
            setSpeakingUI(true);
            setPaused(false);
        } catch {
            speakingRef.current = false;
            setSpeakingUI(false);
        }
    }, [language, liveVoice]);

    const enqueueSpeech = useCallback((text: string) => {
        if (!liveVoice) return;
        if (!text) return;
        if (!('speechSynthesis' in window)) return;
        speechQueueRef.current.push(text);
        // Nếu đang rảnh thì bắt đầu nói
        if (!speakingRef.current) speakNext();
    }, [liveVoice, speakNext]);

    // Tắt tiếng ngay khi đóng chat hoặc khi tắt toggle
    useEffect(() => {
        if (!isOpen || !liveVoice) {
            cancelSpeech();
        }
        // cleanup khi unmount
        return () => cancelSpeech();
    }, [isOpen, liveVoice, cancelSpeech]);

    const handleChatSubmit = useCallback(async () => {
        if (!chatInput.trim()) return;
        
        const userMessage = chatInput.trim();
        setChatInput('');
        // push user message
        setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
        setStatus('thinking');
        // Live voice: hủy tiếng cũ và reset buffer
        cancelSpeech();
        speechBufferRef.current = '';
        
        try {
            const history = storageService.getTestHistory();
            const context = history.length > 0 ? history[0] : null;
            
            const { ChatbotService } = await import('../../services/chatbotService');
            const svc = new ChatbotService();

            // create placeholder bot bubble and capture its index
            let botIndex = -1;
            setChatHistory(prev => {
                botIndex = prev.length; // after pushing user, bot will be at the end
                return [...prev, { role: 'bot', text: '' }];
            });

            // helper: đẩy chunk vào UI và hàng đợi đọc
            const handleChunk = (chunk: string) => {
                // UI append
                setChatHistory(prev => {
                    const idx = botIndex >= 0 ? botIndex : prev.findIndex((m, i) => m.role === 'bot' && i === prev.length - 1);
                    if (idx === -1) return prev;
                    const copy = [...prev];
                    copy[idx] = { ...copy[idx], text: (copy[idx].text || '') + chunk };
                    return copy;
                });
                // TTS sentence-level: gom chunk thành câu ngắn
                if (liveVoice) {
                    speechBufferRef.current += chunk;
                    const parts = speechBufferRef.current.split(/([.!?]+\s+)/);
                    // Kết hợp lại để lấy các câu hoàn chỉnh
                    let assembled = '';
                    const sentences: string[] = [];
                    for (let i = 0; i < parts.length; i += 2) {
                        const seg = parts[i] || '';
                        const end = parts[i + 1] || '';
                        const sentence = (seg + end).trim();
                        if (!sentence) continue;
                        if (end) {
                            sentences.push(sentence);
                        } else {
                            assembled = sentence; // phần còn lại chưa đủ dấu
                        }
                    }
                    // enqueue các câu hoàn chỉnh
                    for (const s of sentences) enqueueSpeech(s);
                    speechBufferRef.current = assembled; // phần dư giữ lại
                }
            };

            // stream chunks and append progressively
            const final = await svc.chatStream(
                userMessage,
                context,
                userProfile,
                language,
                handleChunk,
                { model: model || undefined, temperature, topP, maxTokens }
            );

            // enqueue phần còn lại nếu có
            if (liveVoice && speechBufferRef.current) {
                enqueueSpeech(speechBufferRef.current);
                speechBufferRef.current = '';
            }

            // ensure there is some content in case streaming produced nothing
            if (!final) {
                setChatHistory(prev => {
                    const copy = [...prev];
                    const idx = botIndex >= 0 ? botIndex : copy.length - 1;
                    if (idx >= 0) copy[idx] = { ...copy[idx], text: language === 'vi' ? 'Không có nội dung.' : 'No content.' };
                    return copy;
                });
            }
            setStatus('idle');
        } catch (error) {
            console.error('Chat error:', error);
            const errorMsg = language === 'vi' 
                ? 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.' 
                : 'Sorry, an error occurred. Please try again.';
            setChatHistory(prev => [...prev, { role: 'bot', text: errorMsg }]);
            setStatus('idle');
        }
    }, [chatInput, language, userProfile, liveVoice, cancelSpeech, enqueueSpeech]);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg h-[85vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                                <Bot size={20} className="text-white" />
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">
                                {language === 'vi' ? 'Bác sĩ Eva' : 'Dr. Eva'}
                            </h3>
                            <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                                {language === 'vi' ? 'Đang hoạt động' : 'Online'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setLiveVoice(v => !v)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${liveVoice ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}
                            title={language === 'vi' ? 'Đọc theo thời gian thực' : 'Live voice (TTS)'}
                        >
                            {liveVoice ? <Volume2 size={16} /> : <VolumeX size={16} />}
                            <span className="hidden sm:inline">{liveVoice ? (language === 'vi' ? 'Đang đọc' : 'Speaking') : (language === 'vi' ? 'Tắt tiếng' : 'Muted')}</span>
                        </button>
                        {liveVoice && speakingUI && (
                          <>
                            <button
                              onClick={() => { try { if ('speechSynthesis' in window) { if (paused) { window.speechSynthesis.resume(); setPaused(false); } else { window.speechSynthesis.pause(); setPaused(true); } } } catch {} }}
                              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                              aria-label={paused ? 'Resume' : 'Pause'}
                            >
                              {paused ? <Play size={16} /> : <Pause size={16} />}
                            </button>
                            <span className="text-xs text-emerald-600 dark:text-emerald-400">{language === 'vi' ? 'Đang nói…' : 'Speaking…'}</span>
                          </>
                        )}
                        <button 
                            onClick={onClose} 
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Chat Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50 dark:bg-gray-950/50">
                    {chatHistory.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-60">
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                                <Bot size={40} className="text-green-600 dark:text-green-400" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">
                                {language === 'vi' 
                                    ? 'Chào bạn! Tôi là Eva. Tôi có thể giúp gì cho đôi mắt của bạn hôm nay?' 
                                    : 'Hello! I\'m Eva. How can I help with your eye health today?'}
                            </p>
                        </div>
                    )}
                    
                    {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                                msg.role === 'user' 
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                                    : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            }`}>
                                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                            </div>

                            {/* Bubble */}
                            <div className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm ${
                                msg.role === 'user' 
                                    ? 'bg-blue-600 text-white rounded-tr-none' 
                                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-tl-none'
                            }`}>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    
                    {status === 'thinking' && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex-shrink-0 flex items-center justify-center">
                                <Bot size={16} />
                            </div>
                            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    )}
                    
                    <div ref={chatEndRef} />
                </div>

                {/* Advanced settings */}
                <div className="px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 w-20">Model</label>
                            <select
                                value={model}
                                onChange={(e) => { setModel(e.target.value); localStorage.setItem('chat_model', e.target.value); }}
                                className="flex-1 text-sm px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
                            >
                                <option value="@cf/meta/llama-3.1-8b-instruct">Llama 3.1 8B Instruct (default)</option>
                                <option value="">Use server default</option>
                                <option value="@cf/meta/llama-3.1-70b-instruct">Llama 3.1 70B Instruct (if available)</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 w-20">Temperature</label>
                            <input
                                type="range"
                                min={0}
                                max={1.5}
                                step={0.1}
                                value={temperature}
                                onChange={(e) => { const v = Number(e.target.value); setTemperature(v); localStorage.setItem('chat_temperature', String(v)); }}
                                className="flex-1"
                            />
                            <span className="text-xs text-gray-600 dark:text-gray-300 w-10 text-right">{temperature.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 w-20">top_p</label>
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.05}
                                value={topP}
                                onChange={(e) => { const v = Number(e.target.value); setTopP(v); localStorage.setItem('chat_top_p', String(v)); }}
                                className="flex-1"
                            />
                            <span className="text-xs text-gray-600 dark:text-gray-300 w-10 text-right">{topP.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 w-20">max_tokens</label>
                            <input
                                type="number"
                                min={64}
                                max={4096}
                                step={64}
                                value={maxTokens}
                                onChange={(e) => { const v = Number(e.target.value); setMaxTokens(v); localStorage.setItem('chat_max_tokens', String(v)); }}
                                className="w-28 px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
                            />
                        </div>
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 border border-transparent focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20 transition-all">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                            placeholder={language === 'vi' ? 'Nhập câu hỏi...' : 'Type a message...'}
                            className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 text-sm py-2"
                            disabled={status === 'thinking'}
                        />
                        <button
                            onClick={handleChatSubmit}
                            disabled={!chatInput.trim() || status === 'thinking'}
                            className="p-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-full transition-all shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
            
            <style>{`
                .animate-fade-in { animation: fadeIn 0.3s ease-out both; }
                @keyframes fadeIn { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
            `}</style>
        </div>
    );
};
