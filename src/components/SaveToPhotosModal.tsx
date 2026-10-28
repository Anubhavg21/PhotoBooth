import React from 'react';
import { X, Sparkles, Check, Share2, Download, AlertCircle } from 'lucide-react';

interface SaveToPhotosModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  imageUrls?: string[];
  filename?: string;
  onShareSheet?: () => void;
  onDirectDownload?: () => void;
}

export const SaveToPhotosModal: React.FC<SaveToPhotosModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  imageUrls,
  filename = 'click-and-keep-photo.png',
  onShareSheet,
  onDirectDownload,
}) => {
  if (!isOpen) return null;

  const images = imageUrls && imageUrls.length > 0 ? imageUrls : imageUrl ? [imageUrl] : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div
        className="bg-[#FDFBF7] w-full max-w-lg max-h-[92vh] rounded-3xl border-2 border-[#1F1D1D] shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b-2 border-[#1F1D1D]/10 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FEF08A] border-2 border-[#1F1D1D] flex items-center justify-center font-bold text-xs">
              📸
            </div>
            <div>
              <h3 className="font-extrabold text-[#1F1D1D] text-base sm:text-lg font-display">
                Save to iPhone Photos
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
                Apple requires one simple touch to save to your Camera Roll
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step-by-Step Instructions Banner */}
        <div className="bg-[#FEF08A]/60 px-4 py-3 border-b border-[#1F1D1D]/15 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-[#1F1D1D] font-semibold leading-relaxed">
            <span className="font-extrabold underline">How to save:</span> Press and hold (long-press) the photo below, then tap <span className="bg-white px-1.5 py-0.5 rounded border border-black/20 font-bold">Save to Photos</span> in the menu!
          </div>
        </div>

        {/* Scrollable Image Area */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col items-center gap-4 bg-[#F5EFEB]">
          {images.map((src, index) => (
            <div key={index} className="flex flex-col items-center gap-2 w-full max-w-sm">
              {images.length > 1 && (
                <span className="text-xs font-bold text-gray-600 bg-white/80 px-2.5 py-0.5 rounded-full border border-black/10">
                  Style #{index + 1}
                </span>
              )}
              <div className="relative group rounded-2xl overflow-hidden border-2 border-[#1F1D1D] shadow-md bg-white p-1.5">
                <img
                  src={src}
                  alt={`Photobooth strip ${index + 1}`}
                  className="max-h-[48vh] sm:max-h-[55vh] w-auto rounded-xl object-contain"
                  style={{
                    WebkitTouchCallout: 'default',
                    userSelect: 'auto',
                    touchAction: 'auto',
                    pointerEvents: 'auto',
                  }}
                />
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full pointer-events-none opacity-90 shadow">
                  👆 Touch & Hold to Save
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t-2 border-[#1F1D1D]/10 bg-white flex flex-col gap-2">
          {onShareSheet && (
            <button
              onClick={onShareSheet}
              className="w-full flex items-center justify-center gap-2 bg-[#1F1D1D] hover:bg-black text-[#FEF08A] font-extrabold text-sm py-3 rounded-xl border-2 border-[#1F1D1D] shadow-button active:scale-95 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>Open iPhone Share Menu</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            {onDirectDownload && (
              <button
                onClick={onDirectDownload}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 font-bold py-2 rounded-xl transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save to Files App</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 text-xs text-center font-bold text-[#1F1D1D] bg-[#F5EFEB] hover:bg-[#EADBCC] py-2 rounded-xl border border-black/15 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

