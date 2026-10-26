import React from 'react';
import { Camera, Sparkles, ShieldCheck, RotateCcw, Settings, Heart } from 'lucide-react';
import { Step, BrandingConfig } from '../types';
import { getAccentColor } from '../utils/brandingConfig';

interface NavbarProps {
  currentStep: Step;
  onNavigate: (step: Step) => void;
  hasPhotos: boolean;
  onReset: () => void;
  onOpenExplore: () => void;
  onOpenPersonalize: () => void;
  branding: BrandingConfig;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStep,
  onNavigate,
  hasPhotos,
  onReset,
  onOpenExplore,
  onOpenPersonalize,
  branding,
}) => {
  const steps: { id: Step; label: string; icon: string }[] = [
    { id: 'welcome', label: 'Welcome', icon: '✨' },
    { id: 'camera', label: 'Booth', icon: '📸' },
    { id: 'auto-results', label: 'Auto Memories', icon: '⚡' },
    { id: 'filter', label: 'Filters', icon: '🎨' },
    { id: 'frame', label: 'Frames', icon: '🎞️' },
    { id: 'stickers', label: 'Decorate', icon: '✨' },
    { id: 'export', label: 'Export', icon: '📥' },
  ];

  const accent = getAccentColor(branding.accentTheme);

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/90 backdrop-blur-md border-b-2 border-[#1F1D1D]/10 px-4 py-2.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        {/* Brand / Logo */}
        <button
          onClick={() => onNavigate('welcome')}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div
            style={{ backgroundColor: accent.bg }}
            className="w-10 h-10 rounded-xl border-2 border-[#1F1D1D] shadow-button flex items-center justify-center transition-transform group-hover:rotate-6"
          >
            <Camera className="w-5 h-5 text-[#1F1D1D]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#1F1D1D] font-display">
                {branding.productName}
              </span>
              {branding.showRecipientName && branding.recipientName && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FBCFE8] border border-[#1F1D1D] text-[#1F1D1D] max-w-[100px] xs:max-w-[140px] sm:max-w-none truncate">
                  <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500 flex-shrink-0" />
                  <span className="truncate">for {branding.recipientName}</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#52525B] font-medium hidden xs:block">
              {branding.tagline}
            </p>
          </div>
        </button>

        {/* Step Navigation Pill (Desktop & Tablet) */}
        {hasPhotos && currentStep !== 'welcome' && (
          <nav className="hidden md:flex items-center bg-[#F5EFEB] p-1 rounded-full border border-[#1F1D1D]/15">
            {steps
              .filter((s) => s.id !== 'welcome')
              .map((s) => {
                const isActive = currentStep === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => onNavigate(s.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#1F1D1D] text-[#FEF08A] shadow-sm'
                        : 'text-[#52525B] hover:text-[#1F1D1D] hover:bg-black/5'
                    }`}
                  >
                    <span>{s.icon}</span>
                    <span>{s.label}</span>
                  </button>
                );
              })}
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Personalize Button */}
          <button
            onClick={onOpenPersonalize}
            title="Personalize & Gift Settings"
            className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-[#1F1D1D]/20 bg-white hover:bg-gray-100 text-[#1F1D1D] transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden sm:inline">Personalize</span>
          </button>

          {/* Explore Filters Button */}
          <button
            onClick={onOpenExplore}
            title="Explore Filter Styles"
            className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-[#1F1D1D]/20 bg-white hover:bg-[#FEF08A]/40 text-[#1F1D1D] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span className="hidden sm:inline">Filters</span>
          </button>

          {/* Privacy Badge */}
          <div
            title="100% Private: Photos are processed in your browser and never uploaded anywhere"
            className="hidden lg:flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>On-Device</span>
          </div>

          {/* Reset Session button if photos exist */}
          {hasPhotos && (
            <button
              onClick={onReset}
              title="Start a new photo session"
              className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-[#1F1D1D] bg-[#FBCFE8] hover:bg-[#F472B6] text-[#1F1D1D] shadow-sm transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Step Bar when in active editing */}
      {hasPhotos && currentStep !== 'welcome' && (
        <div className="md:hidden mt-2 pt-2 border-t border-[#1F1D1D]/10 flex items-center justify-between overflow-x-auto no-scrollbar gap-1 px-1">
          {steps
            .filter((s) => s.id !== 'welcome')
            .map((s) => {
              const isActive = currentStep === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => onNavigate(s.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[#1F1D1D] text-[#FEF08A]'
                      : 'text-[#71717A] bg-white/60 border border-black/5'
                  }`}
                >
                  <span>{s.icon}</span>
                  <span>{s.label}</span>
                </button>
              );
            })}
        </div>
      )}
    </header>
  );
};
