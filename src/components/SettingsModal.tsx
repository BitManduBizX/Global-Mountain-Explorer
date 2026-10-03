import React, { useState, useEffect } from 'react';
import { Settings, Eye, EyeOff, ShieldCheck, Key, Power, Trash2, X, CheckCircle, AlertCircle } from 'lucide-react';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated: (key: string, isOffline: boolean) => void;
}

export const SettingsModal: React.FC<SettingsProps> = ({ isOpen, onClose, onKeyUpdated }) => {
  const [apiKey, setApiKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forceOffline, setForceOffline] = useState(false);
  const [status, setStatus] = useState<'custom' | 'default' | 'offline'>('offline');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const savedKey = localStorage.getItem('user_gemini_api_key') || '';
    const savedOffline = localStorage.getItem('gme_force_offline_mode') === 'true';

    setApiKey(savedKey);
    setForceOffline(savedOffline);

    if (savedOffline) {
      setStatus('offline');
    } else if (savedKey.trim()) {
      setStatus('custom');
    } else if (import.meta.env.VITE_GEMINI_API_KEY) {
      setStatus('default');
    } else {
      setStatus('offline');
    }
  }, [isOpen]);

  const handleSave = () => {
    const trimmedKey = apiKey.trim();

    if (trimmedKey) {
      localStorage.setItem('user_gemini_api_key', trimmedKey);
    } else {
      localStorage.removeItem('user_gemini_api_key');
    }

    localStorage.setItem('gme_force_offline_mode', forceOffline ? 'true' : 'false');

    if (forceOffline) {
      setStatus('offline');
    } else if (trimmedKey) {
      setStatus('custom');
    } else if (import.meta.env.VITE_GEMINI_API_KEY) {
      setStatus('default');
    } else {
      setStatus('offline');
    }

    onKeyUpdated(trimmedKey, forceOffline);
    setFeedbackMsg('Settings saved successfully!');
    setTimeout(() => {
      setFeedbackMsg(null);
      onClose();
    }, 600);
  };

  const handleClear = () => {
    localStorage.removeItem('user_gemini_api_key');
    setApiKey('');
    const newStatus = forceOffline ? 'offline' : (import.meta.env.VITE_GEMINI_API_KEY ? 'default' : 'offline');
    setStatus(newStatus);
    onKeyUpdated('', forceOffline);
    setFeedbackMsg('Custom API key cleared.');
    setTimeout(() => setFeedbackMsg(null), 2000);
  };

  const handleToggleOffline = () => {
    const nextVal = !forceOffline;
    setForceOffline(nextVal);
    localStorage.setItem('gme_force_offline_mode', nextVal ? 'true' : 'false');

    if (nextVal) {
      setStatus('offline');
    } else if (apiKey.trim()) {
      setStatus('custom');
    } else if (import.meta.env.VITE_GEMINI_API_KEY) {
      setStatus('default');
    } else {
      setStatus('offline');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#111827] text-white rounded-3xl shadow-2xl border border-gray-800 p-6 sm:p-8 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition-colors cursor-pointer"
          aria-label="Close Settings"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 border-b border-gray-800 pb-4">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-[#FF9F1C] border border-amber-500/20 flex items-center justify-center shrink-0">
            <Settings className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-white tracking-tight">Platform & AI Settings</h3>
            </div>
            <p className="text-xs text-gray-400">
              Configure your Gemini AI credentials and offline operational mode
            </p>
          </div>
        </div>

        {/* Feedback Message */}
        {feedbackMsg && (
          <div className="flex items-center gap-2 p-3 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-xs text-emerald-300">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Current Status Indicator */}
        <div className="p-4 bg-gray-900/90 rounded-2xl border border-gray-800 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
            AI Assistant Engine Status
          </span>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {status === 'custom' && (
                <>
                  <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  <span className="text-sm font-extrabold text-emerald-400">
                    🟢 Active (Custom Key)
                  </span>
                </>
              )}
              {status === 'default' && (
                <>
                  <span className="w-3 h-3 rounded-full bg-[#00A8E8] shadow-[0_0_8px_#00A8E8]" />
                  <span className="text-sm font-extrabold text-sky-400">
                    🔵 Active (System Default)
                  </span>
                </>
              )}
              {status === 'offline' && (
                <>
                  <span className="w-3 h-3 rounded-full bg-[#FFBF00] shadow-[0_0_8px_#FFBF00]" />
                  <span className="text-sm font-extrabold text-amber-400">
                    🟡 Offline Demo Mode
                  </span>
                </>
              )}
            </div>

            <span className="text-[11px] text-gray-500 font-mono">
              {status === 'offline' ? 'Local Rule Engine' : 'Live Gemini 3.8'}
            </span>
          </div>
        </div>

        {/* Gemini API Key Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[#FF9F1C]" />
              <span>Google Gemini API Key:</span>
            </label>
            {apiKey && (
              <span className="text-[10px] text-emerald-400 font-medium">Custom key loaded</span>
            )}
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste AIzaSy... key from Google AI Studio"
              disabled={forceOffline}
              className={`w-full pl-4 pr-11 py-3 text-sm bg-gray-900 border rounded-xl text-white placeholder-gray-500 focus:outline-hidden focus:border-[#FF9F1C] focus:ring-1 focus:ring-[#FF9F1C] transition-all font-mono ${
                forceOffline ? 'opacity-40 border-gray-800 cursor-not-allowed' : 'border-gray-700'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={forceOffline}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 p-1.5 transition-colors cursor-pointer disabled:opacity-40"
              title={showPassword ? 'Hide Key' : 'Show Key'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Offline Mode Switch Toggle */}
        <div className="p-4 bg-gray-900/60 rounded-2xl border border-gray-800 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Power className={`w-4 h-4 ${forceOffline ? 'text-amber-400' : 'text-gray-400'}`} />
              <span className="text-sm font-bold text-white">Force Offline Demo Mode</span>
            </div>
            <p className="text-xs text-gray-400">
              Disables network AI queries and uses the high-altitude local rule engine.
            </p>
          </div>

          <button
            type="button"
            onClick={handleToggleOffline}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
              forceOffline ? 'bg-[#FF9F1C]' : 'bg-gray-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                forceOffline ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Privacy Notice */}
        <div className="flex items-start gap-2.5 p-3.5 bg-gray-950/90 rounded-2xl border border-gray-800 text-xs text-gray-400 leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-[#00A8E8] shrink-0 mt-0.5" />
          <span>
            <strong>Privacy Guarantee:</strong> Your API key is stored securely in your browser's local storage (<code className="text-gray-300">localStorage</code>) and is never sent to or logged on our servers.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-800 gap-3">
          <button
            type="button"
            onClick={handleClear}
            disabled={!apiKey}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-900/50 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Saved Key</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF9F1C] to-[#FFBF00] text-gray-950 text-xs font-extrabold shadow-md hover:brightness-105 transition-all cursor-pointer"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
