import React, { useState, useEffect } from 'react';
import { Download, Sparkles, Sliders, RotateCcw, Share2, Check, Eye } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CapturedPhoto, BrandingConfig, GeneratedDesign } from '../types';
import { generateAutoMemories } from '../utils/autoDesignEngine';
import { renderCompositionToCanvas } from '../utils/canvasExport';

interface AutoResultsScreenProps {
  photos: CapturedPhoto[];
  branding: BrandingConfig;
  onCustomizeDesign: (design: GeneratedDesign) => void;
  onRetake: () => void;
}

export const AutoResultsScreen: React.FC<AutoResultsScreenProps> = ({
  photos,
  branding,
  onCustomizeDesign,
  onRetake,
}) => {
  // Generate the 5 automatic designs
  const [designs, setDesigns] = useState<GeneratedDesign[]>([]);
  const [selectedDesignIndex, setSelectedDesignIndex] = useState<number>(0);

  // Rendered preview cache for each design
  const [renderedPreviews, setRenderedPreviews] = useState<{ [key: string]: string }>({});
  const [isRendering, setIsRendering] = useState(true);

  // Export settings
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg'>('png');
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // Generate designs on mount or photos/branding change
  useEffect(() => {
    const autoDesigns = generateAutoMemories(photos, branding);
    setDesigns(autoDesigns);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#FEF08A', '#FBCFE8', '#E9D5FF', '#1F1D1D'],
      });
    } catch {
      // ignore
    }
  }, [photos, branding]);

  // Render previews for each design
  useEffect(() => {
    if (designs.length === 0) return;
    let isCancelled = false;

    const renderAll = async () => {
      setIsRendering(true);
      const cache: { [key: string]: string } = {};

      for (const design of designs) {
        if (isCancelled) return;
        try {
          const canvas = await renderCompositionToCanvas(
            design.photos,
            design.frameConfig,
            design.stickers,
            design.captions
          );
          cache[design.id] = canvas.toDataURL('image/jpeg', 0.92);
        } catch (e) {
          console.error('Error rendering auto preview', e);
        }
      }

      if (!isCancelled) {
        setRenderedPreviews(cache);
        setIsRendering(false);
      }
    };

    renderAll();
    return () => {
      isCancelled = true;
    };
  }, [designs]);

  const activeDesign = designs[selectedDesignIndex] || designs[0];
  const activePreviewUrl = activeDesign ? renderedPreviews[activeDesign.id] : null;

  // Single download action
  const handleDownloadActive = async () => {
    if (!activeDesign) return;
    setIsRendering(true);
    try {
      const canvas = await renderCompositionToCanvas(
        activeDesign.photos,
        activeDesign.frameConfig,
        activeDesign.stickers,
        activeDesign.captions
      );

      const mimeType = exportFormat === 'png' ? 'image/png' : 'image/jpeg';
      const dataUrl = canvas.toDataURL(mimeType, 0.95);

      const now = new Date();
      const dateFormatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const prefix = branding.showRecipientName && branding.recipientName
        ? `${branding.recipientName.toLowerCase()}-memories`
        : 'click-and-keep';
      const filename = `${prefix}-${activeDesign.id}-${dateFormatted}.${exportFormat}`;

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadNotice(`Downloaded "${activeDesign.name}"! ✨`);
      setTimeout(() => setDownloadNotice(null), 3000);
    } catch (err) {
      console.error('Download error', err);
    } finally {
      setIsRendering(false);
    }
  };

  // Download all 5 designs
  const handleDownloadAll = async () => {
    setIsRendering(true);
    setDownloadNotice('Packaging all 5 designs...');
    try {
      for (let i = 0; i < designs.length; i++) {
        const design = designs[i];
        const canvas = await renderCompositionToCanvas(
          design.photos,
          design.frameConfig,
          design.stickers,
          design.captions
        );

        const mimeType = exportFormat === 'png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, 0.95);

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `click-and-keep-${design.id}-${Date.now()}.${exportFormat}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Brief delay between downloads to prevent browser blocking
        await new Promise((r) => setTimeout(r, 600));
      }
      setDownloadNotice('All 5 designs downloaded! 🎉');
      setTimeout(() => setDownloadNotice(null), 3500);
    } catch (e) {
      console.error('Download all error', e);
    } finally {
      setIsRendering(false);
    }
  };

  // Web Share API
  const handleShare = async () => {
    if (!activeDesign) return;
    try {
      const canvas = await renderCompositionToCanvas(
        activeDesign.photos,
        activeDesign.frameConfig,
        activeDesign.stickers,
        activeDesign.captions
      );

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `click-and-keep-${activeDesign.id}.png`, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: branding.productName,
            text: `${branding.tagline} ✨📸`,
          });
        } else {
          handleDownloadActive();
        }
      }, 'image/png');
    } catch {
      handleDownloadActive();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border-2 border-[#1F1D1D]/15 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-black text-[#1F1D1D] font-display">
              Ready-Made Core Memories
            </h2>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-xs sm:text-sm text-[#52525B] font-medium mt-0.5">
            5 distinct aesthetic styles automatically curated from your captured shots. Pick your favorite or download all!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRetake}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border-2 border-black/20 hover:bg-black/5 text-[#1F1D1D] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Photos</span>
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Large High-Res Preview of Selected Design (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative w-full max-w-[380px] sm:max-w-[440px] bg-neutral-100 p-3 rounded-2xl border-2 border-[#1F1D1D] shadow-scrapbook flex items-center justify-center min-h-[500px]">
            {isRendering && !activePreviewUrl ? (
              <div className="flex flex-col items-center gap-3 py-16">
                <div className="w-10 h-10 rounded-full border-4 border-[#1F1D1D] border-t-[#FEF08A] animate-spin" />
                <p className="font-bold text-xs text-gray-700 font-display">Compositing {activeDesign?.name || 'memories'}...</p>
              </div>
            ) : activePreviewUrl ? (
              <img
                src={activePreviewUrl}
                alt={activeDesign?.name || 'Preview'}
                className="w-full h-auto max-h-[660px] object-contain rounded shadow transition-opacity duration-200"
              />
            ) : null}
          </div>

          <div className="text-center mt-3">
            <span className="text-xs text-gray-500 font-mono">
              Composited Canvas Output • {activeDesign?.name} • 100% Client-Side
            </span>
          </div>
        </div>

        {/* Right: Design Selector Cards & Quick Actions (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* 5 Generated Design Options Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#1F1D1D] font-display uppercase tracking-wider block">
                Choose 1 of 5 Styles:
              </span>
              <span className="text-[11px] font-bold text-gray-500">
                Tap to preview
              </span>
            </div>

            <div className="flex flex-col gap-2.5 max-h-[390px] overflow-y-auto pr-1">
              {designs.map((design, idx) => {
                const isSelected = selectedDesignIndex === idx;
                const thumb = renderedPreviews[design.id];
                return (
                  <button
                    key={design.id}
                    onClick={() => setSelectedDesignIndex(idx)}
                    className={`flex items-center gap-3.5 p-3 rounded-2xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-[#1F1D1D] bg-[#FEF08A]/35 shadow-button scale-[1.01]'
                        : 'border-black/15 bg-white hover:border-black/30'
                    }`}
                  >
                    {/* Small thumbnail preview */}
                    <div className="w-14 h-16 rounded-lg overflow-hidden bg-gray-100 border border-black/10 flex-shrink-0 flex items-center justify-center">
                      {thumb ? (
                        <img src={thumb} alt={design.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-sm text-[#1F1D1D] font-display">
                          {design.name}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-black/20 text-gray-700">
                          {design.badge}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                        {design.description}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-[#1F1D1D] text-[#FEF08A] flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Download & Share Actions Card */}
          <div className="bg-white p-5 rounded-2xl border-2 border-[#1F1D1D]/15 shadow-sm space-y-3">
            {/* Format toggle */}
            <div className="flex items-center justify-between pb-1 border-b border-black/10 text-xs">
              <span className="font-bold text-gray-600">Download Format:</span>
              <div className="flex items-center gap-1">
                {(['png', 'jpeg'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setExportFormat(fmt)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                      exportFormat === fmt
                        ? 'bg-[#1F1D1D] text-[#FEF08A]'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Download Button */}
            <button
              onClick={handleDownloadActive}
              disabled={isRendering}
              className="w-full flex items-center justify-center gap-2 bg-[#1F1D1D] hover:bg-[#333033] text-[#FEF08A] font-extrabold text-base py-3.5 rounded-2xl border-2 border-[#1F1D1D] shadow-button active:scale-95 disabled:opacity-50 transition-all"
            >
              <Download className="w-5 h-5" />
              <span>Download {activeDesign?.name || 'Design'}</span>
            </button>

            {/* Download All 5 Designs */}
            <button
              onClick={handleDownloadAll}
              disabled={isRendering}
              className="w-full flex items-center justify-center gap-2 bg-[#F5EFEB] hover:bg-[#EADBCC] text-[#1F1D1D] font-bold text-xs sm:text-sm py-2.5 rounded-xl border border-[#1F1D1D]/30 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Download All 5 Styles</span>
            </button>

            {/* Native Share */}
            <button
              onClick={handleShare}
              disabled={isRendering}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-600 hover:text-black font-semibold py-1"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share with friends</span>
            </button>

            {downloadNotice && (
              <p className="text-center text-xs font-bold text-emerald-600 animate-fade-in">
                {downloadNotice}
              </p>
            )}
          </div>

          {/* Customize CTA Card */}
          <div className="bg-[#FBCFE8]/30 p-4 rounded-2xl border-2 border-[#1F1D1D] shadow-sm flex items-center justify-between gap-3">
            <div>
              <h4 className="font-extrabold text-xs text-[#1F1D1D] font-display">
                Want to fine-tune this style?
              </h4>
              <p className="text-[11px] text-gray-600 font-medium">
                Open studio initialized with {activeDesign?.name}
              </p>
            </div>

            <button
              onClick={() => activeDesign && onCustomizeDesign(activeDesign)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 border-2 border-[#1F1D1D] rounded-xl text-xs font-extrabold text-[#1F1D1D] shadow-button active:scale-95 transition-all flex-shrink-0"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Customize</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
