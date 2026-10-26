import React, { useState, useEffect } from 'react';
import { Download, Share2, Sparkles, RotateCcw, ArrowLeft, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CapturedPhoto, FrameConfig, PlacedSticker, PlacedCaption, BrandingConfig } from '../types';
import { renderCompositionToCanvas } from '../utils/canvasExport';

interface ExportModalProps {
  photos: CapturedPhoto[];
  frameConfig: FrameConfig;
  stickers: PlacedSticker[];
  captions: PlacedCaption[];
  onBackToDecorate: () => void;
  onBackToAuto?: () => void;
  onStartNewSession: () => void;
  branding?: BrandingConfig;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  photos,
  frameConfig,
  stickers,
  captions,
  onBackToDecorate,
  onBackToAuto,
  onStartNewSession,
  branding,
}) => {
  const [isExporting, setIsExporting] = useState(true);
  const [exportedDataUrl, setExportedDataUrl] = useState<string | null>(null);
  const [exportedBlob, setExportedBlob] = useState<Blob | null>(null);
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg'>('png');
  const [exportQuality] = useState<number>(0.95);
  const [copySuccess, setCopySuccess] = useState(false);
  const [shareNotice, setShareNotice] = useState<string | null>(null);

  // Trigger high-res canvas render
  useEffect(() => {
    let isCancelled = false;

    const exportImage = async () => {
      setIsExporting(true);
      try {
        const fullCanvas = await renderCompositionToCanvas(photos, frameConfig, stickers, captions);
        if (isCancelled) return;

        const mimeType = exportFormat === 'png' ? 'image/png' : 'image/jpeg';
        const dataUrl = fullCanvas.toDataURL(mimeType, exportQuality);

        fullCanvas.toBlob(
          (blob) => {
            if (isCancelled || !blob) return;
            setExportedBlob(blob);
            setExportedDataUrl(dataUrl);
            setIsExporting(false);

            // Pop confetti celebration!
            try {
              confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FEF08A', '#FBCFE8', '#E9D5FF', '#1F1D1D'],
              });
            } catch {
              // ignore
            }
          },
          mimeType,
          exportQuality
        );
      } catch (err) {
        console.error('Final export error', err);
        setIsExporting(false);
      }
    };

    exportImage();
    return () => {
      isCancelled = true;
    };
  }, [photos, frameConfig, stickers, captions, exportFormat, exportQuality]);

  // Download action
  const handleDownload = () => {
    if (!exportedDataUrl) return;

    const now = new Date();
    const dateFormatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const baseName = branding?.showRecipientName && branding.recipientName
      ? `${branding.recipientName.toLowerCase()}-memories`
      : 'click-and-keep';
    const filename = `${baseName}-${dateFormatted}.${exportFormat}`;

    const link = document.createElement('a');
    link.href = exportedDataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Web Share API action
  const handleShare = async () => {
    if (!exportedBlob) return;

    const baseName = branding?.showRecipientName && branding.recipientName
      ? `${branding.recipientName.toLowerCase()}-memories`
      : 'click-and-keep';
    const filename = `${baseName}-${Date.now()}.${exportFormat}`;
    const file = new File([exportedBlob], filename, {
      type: exportFormat === 'png' ? 'image/png' : 'image/jpeg',
    });

    const appTitle = branding?.productName || 'Click & Keep';
    const appTagline = branding?.tagline || 'Good pics. Weird poses. Core memories.';

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: appTitle,
          text: `${appTagline} ✨📸`,
        });
        setShareNotice('Shared successfully! 💖');
        setTimeout(() => setShareNotice(null), 3000);
      } catch (err: unknown) {
        if ((err as Error).name !== 'AbortError') {
          handleDownload();
        }
      }
    } else {
      // Fallback: Copy to clipboard or trigger download
      try {
        if (navigator.clipboard && window.ClipboardItem && exportFormat === 'png') {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': exportedBlob }),
          ]);
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2500);
        } else {
          handleDownload();
          setShareNotice('Downloaded to your device!');
          setTimeout(() => setShareNotice(null), 3000);
        }
      } catch {
        handleDownload();
      }
    }
  };

  const hasRecipient = branding?.showRecipientName && branding.recipientName;

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border-2 border-[#1F1D1D]/15 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-[#1F1D1D] font-display">
              Your Photo Strip is Ready!
            </h2>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-xs text-[#52525B] font-medium">
            Saved in high definition. No watermarks, no server uploads, ready for your camera roll.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onBackToAuto && (
            <button
              onClick={onBackToAuto}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-black/20 hover:bg-black/5 transition-colors"
            >
              <span>Auto Designs</span>
            </button>
          )}

          <button
            onClick={onBackToDecorate}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-black/20 hover:bg-black/5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Decorate</span>
          </button>

          <button
            onClick={onStartNewSession}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border-2 border-[#1F1D1D] bg-[#FBCFE8] hover:bg-[#F472B6] text-[#1F1D1D] shadow-button active:scale-95 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Session</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left: Final Render Preview (7 cols) */}
        <div className="md:col-span-7 flex flex-col items-center">
          <div className="relative w-full max-w-[360px] sm:max-w-[400px] bg-neutral-100 p-3 rounded-2xl border-2 border-[#1F1D1D] shadow-polaroid flex items-center justify-center min-h-[460px]">
            {isExporting ? (
              <div className="flex flex-col items-center gap-3 py-16">
                <div className="w-10 h-10 rounded-full border-4 border-[#1F1D1D] border-t-[#FEF08A] animate-spin" />
                <p className="font-bold text-xs text-gray-700">Compositing your memories...</p>
              </div>
            ) : exportedDataUrl ? (
              <img
                src={exportedDataUrl}
                alt="Final Photo Strip"
                className="w-full h-auto max-h-[620px] object-contain rounded shadow"
              />
            ) : null}
          </div>

          <div className="text-center mt-3">
            <span className="text-xs text-gray-500 font-mono">
              Composited HD Canvas Output • 100% Client-Side
            </span>
          </div>
        </div>

        {/* Right: Download, Share & Format Settings (5 cols) */}
        <div className="md:col-span-5 flex flex-col gap-4">
          {/* Format Selector */}
          <div className="bg-white p-4 rounded-2xl border-2 border-[#1F1D1D]/15 shadow-sm space-y-3">
            <span className="text-xs font-extrabold text-[#1F1D1D] font-display uppercase tracking-wider block">
              Export Format
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setExportFormat('png')}
                className={`py-2 px-3 rounded-xl border-2 text-xs font-bold transition-all ${
                  exportFormat === 'png'
                    ? 'border-[#1F1D1D] bg-[#FEF08A] shadow-button'
                    : 'border-black/10 hover:border-black/30'
                }`}
              >
                PNG (Lossless)
              </button>

              <button
                onClick={() => setExportFormat('jpeg')}
                className={`py-2 px-3 rounded-xl border-2 text-xs font-bold transition-all ${
                  exportFormat === 'jpeg'
                    ? 'border-[#1F1D1D] bg-[#FEF08A] shadow-button'
                    : 'border-black/10 hover:border-black/30'
                }`}
              >
                JPEG (Compact)
              </button>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="bg-white p-5 rounded-2xl border-2 border-[#1F1D1D]/15 shadow-sm space-y-3">
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2.5 bg-[#1F1D1D] hover:bg-[#333033] text-[#FEF08A] font-extrabold text-base py-3.5 rounded-2xl border-2 border-[#1F1D1D] shadow-button active:scale-95 disabled:opacity-50 transition-all"
            >
              <Download className="w-5 h-5" />
              <span>Download to Device</span>
            </button>

            <button
              onClick={handleShare}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 bg-[#F5EFEB] hover:bg-[#EADBCC] text-[#1F1D1D] font-bold text-sm py-3 rounded-2xl border-2 border-[#1F1D1D] shadow-button active:scale-95 disabled:opacity-50 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>Share / Send to Friend</span>
            </button>

            {copySuccess && (
              <p className="text-center text-xs font-bold text-emerald-600 animate-fade-in">
                ✓ Copied image to clipboard!
              </p>
            )}

            {shareNotice && (
              <p className="text-center text-xs font-bold text-purple-700 animate-fade-in">
                {shareNotice}
              </p>
            )}
          </div>

          {/* Personalized Message Card */}
          <div className="bg-[#FEF08A]/40 p-4 rounded-2xl border-2 border-[#1F1D1D] shadow-scrapbook space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#1F1D1D] font-display">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>{hasRecipient ? `A note for ${branding?.recipientName}:` : 'Photo Booth Club:'}</span>
            </div>
            <p className="text-xs text-[#374151] font-medium leading-relaxed">
              Keep taking silly poses, making core memories, and saving good times forever! ✨
            </p>
            <p className="font-handwriting text-lg text-[#1F1D1D] font-bold text-right pt-1">
              — {branding?.productName || 'Click & Keep'} 📸
            </p>
          </div>

          {/* Create Another Option */}
          <div className="pt-2">
            <button
              onClick={onStartNewSession}
              className="w-full text-center text-xs text-gray-500 hover:text-black font-bold underline"
            >
              Create another photo strip →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
