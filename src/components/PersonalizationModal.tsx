import React, { useState } from 'react';
import { X, Sparkles, Heart, Check, Copy, Palette, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { BrandingConfig } from '../types';
import { DEFAULT_BRANDING, saveBranding } from '../utils/brandingConfig';

interface PersonalizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  branding: BrandingConfig;
  onSave: (newBranding: BrandingConfig) => void;
}

export const PersonalizationModal: React.FC<PersonalizationModalProps> = ({
  isOpen,
  onClose,
  branding,
  onSave,
}) => {
  const [form, setForm] = useState<BrandingConfig>({ ...branding });
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const themes: { id: BrandingConfig['accentTheme']; name: string; hex: string }[] = [
    { id: 'butter', name: 'Butter Yellow', hex: '#FEF08A' },
    { id: 'blush', name: 'Blush Pink', hex: '#FBCFE8' },
    { id: 'lilac', name: 'Vintage Lilac', hex: '#E9D5FF' },
    { id: 'sage', name: 'Matcha Sage', hex: '#DCFCE7' },
    { id: 'peach', name: 'Soft Peach', hex: '#FED7AA' },
  ];

  const handleSave = () => {
    saveBranding(form);
    onSave(form);
    onClose();
  };

  const handleResetDefaults = () => {
    setForm({ ...DEFAULT_BRANDING });
  };

  // Generate shareable link with query parameters
  const shareableUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?to=${encodeURIComponent(form.recipientName)}&title=${encodeURIComponent(form.productName)}`
    : '';

  const copyShareableLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#FDFBF7] rounded-3xl border-4 border-[#1F1D1D] shadow-scrapbook flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b-2 border-[#1F1D1D]/15 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#FEF08A] border-2 border-[#1F1D1D] flex items-center justify-center shadow-button">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            </div>
            <div>
              <h3 className="text-xl font-black text-[#1F1D1D] font-display">
                Personalize & Gift Settings
              </h3>
              <p className="text-xs text-[#52525B] font-medium">
                Make it a gift for someone special or customize branding
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#F5EFEB] hover:bg-black/10 border-2 border-[#1F1D1D] flex items-center justify-center text-[#1F1D1D] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Recipient Name Toggle & Input */}
          <div className="bg-white p-4 rounded-2xl border-2 border-[#1F1D1D]/15 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-[#1F1D1D] font-display uppercase tracking-wider">
                Recipient / Friend's Name
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                <input
                  type="checkbox"
                  checked={form.showRecipientName}
                  onChange={(e) => setForm({ ...form, showRecipientName: e.target.checked })}
                  className="w-4 h-4 accent-[#1F1D1D] rounded"
                />
                <span>Show in Greeting</span>
              </label>
            </div>

            <input
              type="text"
              value={form.recipientName}
              onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
              placeholder="e.g. Palak, Alex, Maya..."
              className="w-full px-3 py-2 text-sm font-bold rounded-xl border-2 border-black/20 focus:outline-none focus:border-[#1F1D1D]"
            />
            <p className="text-[11px] text-gray-500">
              When enabled, a special badge "A little gift for {form.recipientName || 'you'}" appears on the welcome screen and photo frames.
            </p>
          </div>

          {/* Product Title & Tagline */}
          <div className="bg-white p-4 rounded-2xl border-2 border-[#1F1D1D]/15 shadow-sm space-y-3">
            <div>
              <label className="text-xs font-black text-[#1F1D1D] font-display uppercase tracking-wider block mb-1">
                Product Name
              </label>
              <input
                type="text"
                value={form.productName}
                onChange={(e) => setForm({ ...form, productName: e.target.value })}
                placeholder="Click & Keep"
                className="w-full px-3 py-2 text-sm font-bold rounded-xl border-2 border-black/20 focus:outline-none focus:border-[#1F1D1D]"
              />
            </div>

            <div>
              <label className="text-xs font-black text-[#1F1D1D] font-display uppercase tracking-wider block mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                placeholder="Good pics. Weird poses. Core memories."
                className="w-full px-3 py-2 text-sm font-bold rounded-xl border-2 border-black/20 focus:outline-none focus:border-[#1F1D1D]"
              />
            </div>

            <div>
              <label className="text-xs font-black text-[#1F1D1D] font-display uppercase tracking-wider block mb-1">
                Welcome Message
              </label>
              <input
                type="text"
                value={form.welcomeMessage}
                onChange={(e) => setForm({ ...form, welcomeMessage: e.target.value })}
                placeholder="A little place for your favourite memories."
                className="w-full px-3 py-2 text-sm font-bold rounded-xl border-2 border-black/20 focus:outline-none focus:border-[#1F1D1D]"
              />
            </div>
          </div>

          {/* Accent Theme Picker */}
          <div className="bg-white p-4 rounded-2xl border-2 border-[#1F1D1D]/15 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-[#1F1D1D] font-display uppercase tracking-wider">
              <Palette className="w-4 h-4 text-amber-500" />
              <span>Accent Color Theme</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {themes.map((t) => {
                const isSelected = form.accentTheme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setForm({ ...form, accentTheme: t.id })}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all ${
                      isSelected
                        ? 'border-[#1F1D1D] shadow-button scale-105'
                        : 'border-black/15 hover:border-black/40'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/30"
                      style={{ backgroundColor: t.hex }}
                    />
                    <span>{t.name}</span>
                    {isSelected && <Check className="w-3 h-3 text-[#1F1D1D]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Shareable Link Note */}
          <div className="bg-[#FEF08A]/40 p-4 rounded-2xl border-2 border-[#1F1D1D] shadow-scrapbook space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#1F1D1D] font-display">
                <LinkIcon className="w-4 h-4 text-purple-600" />
                <span>Shareable Link with Custom Name</span>
              </div>
              <button
                onClick={copyShareableLink}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-white hover:bg-gray-50 border border-[#1F1D1D] rounded-lg shadow-sm transition-all"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
            <p className="text-[11px] text-gray-700 leading-relaxed font-medium">
              Locally saved settings remain in this browser. To send a link pre-customized for another friend, share the link with <code className="bg-white/80 px-1 py-0.5 rounded text-[10px]">?to=Name</code>.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t-2 border-[#1F1D1D]/15 bg-white flex items-center justify-between gap-3">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-black py-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-6 py-2.5 text-xs sm:text-sm font-extrabold text-[#1F1D1D] bg-[#FEF08A] hover:bg-[#FDE047] border-2 border-[#1F1D1D] rounded-xl shadow-button active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
