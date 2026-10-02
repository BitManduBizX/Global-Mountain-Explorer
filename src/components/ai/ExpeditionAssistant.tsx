import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Compass,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  Bot,
  User,
  ExternalLink,
  ChevronDown,
  Info
} from 'lucide-react';
import { Mountain } from '../../types/mountain';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  offline?: boolean;
}

interface ExpeditionAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMountain: Mountain | null;
  onClearSelectedMountain: () => void;
}

export const ExpeditionAssistant: React.FC<ExpeditionAssistantProps> = ({
  isOpen,
  onClose,
  selectedMountain,
  onClearSelectedMountain,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Greetings Alpinist! I am your AI Expedition Director powered by Google Gemini.\n\nI can analyze climbing routes, high-altitude physiology (AMS/HAPE prevention), mandatory national park permits, gear requirements, and hydration strategies worldwide. How may I advise your expedition today?`,
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          mountainContext: selectedMountain
            ? {
                name: selectedMountain.name,
                elevationM: selectedMountain.elevationM,
                range: selectedMountain.range,
                country: selectedMountain.country,
                standardRoute: selectedMountain.standardRoute,
                difficulty: selectedMountain.difficulty,
                permitRequirements: selectedMountain.permitRequirements,
              }
            : null,
          history: messages.slice(-5).map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });

      const data = await res.json();

      if (data.offline) {
        setOfflineNotice('AI Assistant running in offline mode. Please add your Gemini API Key in settings.');
      } else {
        setOfflineNotice(null);
      }

      const botReply: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || data.fallbackReply || 'No response available.',
        timestamp: Date.now(),
        offline: !!data.offline,
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (err: any) {
      console.warn('[GME AI Assistant] API query error:', err);
      setOfflineNotice('AI Assistant running in offline mode. Please add your Gemini API Key in settings.');
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'assistant',
          text: `AI Assistant is running in offline mode. Please add your Gemini API Key in settings.\n\nOffline Advisory for ${selectedMountain?.name || 'Mountaineering'}:\nAlways carry two-way satellite comms (inReach), hydrate with 4-5 liters daily (warm tea with electrolytes), acclimatize conservatively ("climb high, sleep low"), and verify mandatory permits with the relevant national park authorities.`,
          timestamp: Date.now(),
          offline: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    selectedMountain
      ? `What is the optimal gear list and permit protocol for ${selectedMountain.name}?`
      : 'What are the main symptoms and treatment protocols for Acute Mountain Sickness (AMS)?',
    'How do I prepare traditional high-altitude Sherpa butter tea (Po Cha)?',
    'What training exercises best prevent knee pain during steep alpine descents?',
    'What are the mandatory permit fees and liaison rules for the Seven Summits?',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-white shadow-2xl border-l border-gray-200 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#1E3A2B] to-[#12281b] text-white flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF9F1C] to-[#00A8E8] p-0.5 flex items-center justify-center">
            <div className="w-full h-full bg-[#1E3A2B] rounded-[9px] flex items-center justify-center text-[#FFBF00]">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base tracking-tight">AI Expedition Agent</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#FF9F1C] text-gray-950 uppercase tracking-wider">
                Gemini
              </span>
            </div>
            <p className="text-xs text-gray-300">
              {selectedMountain ? `Focus: ${selectedMountain.name}` : 'Worldwide Mountain Intelligence'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Close Assistant"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Selected Peak Context Pill */}
      {selectedMountain && (
        <div className="bg-amber-50 px-4 py-2 border-b border-amber-200 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
            <Compass className="w-3.5 h-3.5 text-[#FF9F1C] shrink-0" />
            <span>
              Active Mountain Focus: <strong>{selectedMountain.name}</strong> ({selectedMountain.elevationM}m)
            </span>
          </div>
          <button
            onClick={onClearSelectedMountain}
            className="text-[11px] text-amber-700 hover:text-amber-950 font-bold ml-2 underline shrink-0 cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}

      {/* Offline Notice Banner (If missing key or offline) */}
      {offlineNotice && (
        <div className="bg-amber-100/80 px-4 py-2 text-xs text-amber-900 flex items-center gap-2 border-b border-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>{offlineNotice}</span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/60">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-[#1E3A2B] text-[#FF9F1C] flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-gradient-to-r from-[#FF9F1C] to-[#FFBF00] text-gray-950 font-medium rounded-tr-xs shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-tl-xs shadow-xs whitespace-pre-line'
              }`}
            >
              {m.text}
              {m.offline && (
                <div className="mt-2 pt-2 border-t border-gray-100 text-[10px] text-gray-400 italic">
                  Advisory rendered via offline fallback system.
                </div>
              )}
            </div>

            {m.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center shrink-0 text-xs font-bold">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-white p-3 rounded-2xl border border-gray-200 w-fit">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#FF9F1C]" />
            <span>Consulting Gemini high-altitude expedition models...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-3 bg-white border-t border-gray-100 overflow-x-auto no-scrollbar flex items-center gap-2">
        {quickPrompts.slice(0, 3).map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="text-[11px] px-3 py-1.5 rounded-full bg-gray-100 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-300 border border-gray-200 text-gray-700 whitespace-nowrap transition-colors cursor-pointer shrink-0"
          >
            {prompt.length > 40 ? prompt.slice(0, 40) + '...' : prompt}
          </button>
        ))}
      </div>

      {/* Chat Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder={selectedMountain ? `Ask about ${selectedMountain.name}...` : 'Ask routes, gear, permits, AMS...'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            className="flex-1 py-2.5 px-4 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#FF9F1C] focus:outline-hidden disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-[#FF9F1C] to-[#FFBF00] text-gray-950 font-bold hover:brightness-105 disabled:opacity-40 transition-all cursor-pointer shadow-xs shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-gray-400 mt-2 text-center">
          Always cross-reference real-time weather and avalanche bulletins with local park authorities.
        </p>
      </div>
    </div>
  );
};
