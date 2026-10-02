import React from 'react';
import { ExternalLink, ShieldCheck, MapPin, AlertCircle, X } from 'lucide-react';

interface ConsentModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  targetUrl?: string;
  type?: 'external_link' | 'geolocation' | 'ai_query';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({
  isOpen,
  title,
  message,
  targetUrl,
  type = 'external_link',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 md:p-8 space-y-5">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#FF9F1C] flex items-center justify-center flex-shrink-0">
            {type === 'external_link' ? (
              <ExternalLink className="w-6 h-6" />
            ) : type === 'geolocation' ? (
              <MapPin className="w-6 h-6" />
            ) : (
              <ShieldCheck className="w-6 h-6" />
            )}
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-[#00A8E8]">
              Explicit Consent Required
            </span>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          </div>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed">{message}</p>

        {targetUrl && (
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs font-mono text-gray-700 break-all flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>Destination: {targetUrl}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF9F1C] to-[#FFBF00] text-gray-950 text-sm font-semibold shadow hover:brightness-105 transition-all cursor-pointer flex items-center gap-2"
          >
            Proceed Safely
          </button>
        </div>
      </div>
    </div>
  );
};
