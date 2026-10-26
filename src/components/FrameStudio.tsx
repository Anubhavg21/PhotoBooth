import React, { useState, useEffect, useRef } from 'react';
import { Layout, Palette, Type, Calendar, ArrowRight, ArrowLeft, Sliders, Check } from 'lucide-react';
import { CapturedPhoto, FrameConfig, LayoutId } from '../types';
import { renderCompositionToCanvas } from '../utils/canvasExport';

interface FrameStudioProps {
  photos: CapturedPhoto[];
  frameConfig: FrameConfig;
  onUpdateFrameConfig: (config: FrameConfig) => void;
  onProceedToDecorate: () => void;
  onBackToFilters: () => void;
}

export const FrameStudio: React.FC<FrameStudioProps> = ({
  photos,
  frameConfig,
  onUpdateFrameConfig,
  onProceedToDecorate,
  onBackToFilters,
}) => {
  // Live render preview canvas ref
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  // Available Layouts
  const layouts: { id: LayoutId; name: string; icon: string; desc: string }[] = [
    { id: 'classic-strip', name: 'Classic Strip', icon: '🎞️', desc: 'Authentic 3 or 4 photo vertical booth strip' },
    { id: 'six-shot-strip', name: 'Six-Shot Collage', icon: '📐', desc: 'Balanced 2-column strip for all 6 core memories' },
    { id: 'polaroid-stack', name: 'Polaroid Stack', icon: '📷', desc: 'Instant photo cards with signature bottoms' },
    { id: 'scrapbook', name: 'Scrapbook & Tape', icon: '📒', desc: 'Tilted playful photos with cute washi tape' },
    { id: 'minimal-grid', name: 'Minimal Grid', icon: '🔲', desc: 'Clean, modern magazine gallery layout' },
    { id: 'contact-sheet', name: 'Contact Sheet', icon: '🎞️', desc: 'Retro 35mm film proof sheet with frame numbers' },
    { id: 'y2k-collage', name: 'Y2K Collage', icon: '💿', desc: 'Playful early-2000s vibrant pop borders' },
    { id: 'modern-editorial', name: 'Modern Editorial', icon: '✨', desc: 'Spacious museum borders and elegant serif' },
  ];

  // Palette options
  const colorPalettes = [
    { name: 'Warm Cream', hex: '#FDFBF7', textHex: '#1F1D1D' },
    { name: 'Film Black', hex: '#18181B', textHex: '#FFFFFF' },
    { name: 'Blush Pink', hex: '#FCE7F3', textHex: '#1F1D1D' },
    { name: 'Butter Yellow', hex: '#FEF9C3', textHex: '#1F1D1D' },
    { name: 'Vintage Lilac', hex: '#F3E8FF', textHex: '#1F1D1D' },
    { name: 'Matcha Sage', hex: '#DCFCE7', textHex: '#1F1D1D' },
    { name: 'Kraft Paper', hex: '#EAD7C3', textHex: '#1F1D1D' },
    { name: 'Y2K Silver', hex: '#E2E8F0', textHex: '#1F1D1D' },
  ];

  // Render composition preview on changes
  useEffect(() => {
    let isCancelled = false;
    const render = async () => {
      setIsRendering(true);
      try {
        const fullCanvas = await renderCompositionToCanvas(photos, frameConfig);
        if (isCancelled) return;

        const target = previewCanvasRef.current;
        if (target) {
          target.width = fullCanvas.width;
          target.height = fullCanvas.height;
          const ctx = target.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, target.width, target.height);
            ctx.drawImage(fullCanvas, 0, 0);
          }
        }
      } catch (err) {
        console.error('Preview render error', err);
      } finally {
        if (!isCancelled) setIsRendering(false);
      }
    };

    render();
    return () => {
      isCancelled = true;
    };
  }, [photos, frameConfig]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border-2 border-[#1F1D1D]/15 shadow-sm">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1F1D1D] font-display">
            Frames & Layout Studio
          </h2>
          <p className="text-xs text-[#52525B] font-medium">
            Switch templates anytime without losing photos. Customize borders, background, and titles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onBackToFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-black/20 hover:bg-black/5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          <button
            onClick={onProceedToDecorate}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-extrabold rounded-xl border-2 border-[#1F1D1D] bg-[#1F1D1D] text-[#FEF08A] shadow-button active:scale-95 transition-all"
          >
            <span>Decorate & Stickers</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Canvas Live Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative w-full max-w-[340px] sm:max-w-[380px] bg-neutral-100 p-3 rounded-2xl border-2 border-[#1F1D1D] shadow-polaroid flex items-center justify-center min-h-[480px]">
            {isRendering && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-xs flex items-center justify-center z-10 rounded-xl">
                <div className="w-8 h-8 rounded-full border-3 border-[#1F1D1D] border-t-[#FEF08A] animate-spin" />
              </div>
            )}
            <canvas
              ref={previewCanvasRef}
              className="w-full h-auto max-h-[580px] object-contain rounded-md shadow-sm"
            />
          </div>
          <span className="text-[11px] text-gray-500 font-mono mt-2">
            Live Strip Composition Preview
          </span>
        </div>

        {/* Right: Layout & Customization Controls (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* 1. Layout Template Chooser */}
          <div className="bg-white p-4 rounded-2xl border-2 border-[#1F1D1D]/15 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-sm font-extrabold text-[#1F1D1D] font-display">
              <Layout className="w-4 h-4 text-purple-600" />
              <span>Choose Layout Style</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {layouts.map((l) => {
                const isActive = frameConfig.layoutId === l.id;
                return (
                  <button
                    key={l.id}
                    onClick={() => onUpdateFrameConfig({ ...frameConfig, layoutId: l.id })}
                    className={`flex flex-col text-left p-2.5 rounded-xl border-2 transition-all ${
                      isActive
                        ? 'border-[#1F1D1D] bg-[#FEF08A]/30 shadow-button'
                        : 'border-black/10 hover:border-black/30 bg-white'
                    }`}
                  >
                    <span className="text-lg">{l.icon}</span>
                    <span className="font-extrabold text-xs text-[#1F1D1D] font-display mt-1">
                      {l.name}
                    </span>
                    <span className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">
                      {l.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Color Palette */}
          <div className="bg-white p-4 rounded-2xl border-2 border-[#1F1D1D]/15 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-sm font-extrabold text-[#1F1D1D] font-display">
              <Palette className="w-4 h-4 text-amber-500" />
              <span>Frame Background Color</span>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {colorPalettes.map((c) => {
                const isSelected = frameConfig.backgroundColor === c.hex;
                return (
                  <button
                    key={c.hex}
                    onClick={() => onUpdateFrameConfig({ ...frameConfig, backgroundColor: c.hex })}
                    className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-[#1F1D1D] shadow-button scale-105'
                        : 'border-black/15 hover:border-black/40'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-black/30"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-xs font-bold text-[#1F1D1D]">{c.name}</span>
                    {isSelected && <Check className="w-3 h-3 text-[#1F1D1D]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Spacing, Borders, and Corners */}
          <div className="bg-white p-4 rounded-2xl border-2 border-[#1F1D1D]/15 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-extrabold text-[#1F1D1D] font-display">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>Borders & Spacing</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Photo Gap */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-gray-700">
                  <span>Photo Spacing</span>
                  <span className="font-mono text-gray-500">{frameConfig.photoGap}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={frameConfig.photoGap}
                  onChange={(e) =>
                    onUpdateFrameConfig({ ...frameConfig, photoGap: Number(e.target.value) })
                  }
                  className="w-full accent-[#1F1D1D] h-2 bg-gray-200 rounded cursor-pointer"
                />
              </div>

              {/* Corner Radius */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-gray-700">
                  <span>Rounded Corners</span>
                  <span className="font-mono text-gray-500">{frameConfig.borderRadius}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="28"
                  value={frameConfig.borderRadius}
                  onChange={(e) =>
                    onUpdateFrameConfig({ ...frameConfig, borderRadius: Number(e.target.value) })
                  }
                  className="w-full accent-[#1F1D1D] h-2 bg-gray-200 rounded cursor-pointer"
                />
              </div>

              {/* Border Width */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-gray-700">
                  <span>Border Outline</span>
                  <span className="font-mono text-gray-500">{frameConfig.borderWidth}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  value={frameConfig.borderWidth}
                  onChange={(e) =>
                    onUpdateFrameConfig({ ...frameConfig, borderWidth: Number(e.target.value) })
                  }
                  className="w-full accent-[#1F1D1D] h-2 bg-gray-200 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 4. Captions & Date Stamp */}
          <div className="bg-white p-4 rounded-2xl border-2 border-[#1F1D1D]/15 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-sm font-extrabold text-[#1F1D1D] font-display">
              <Type className="w-4 h-4 text-blue-600" />
              <span>Frame Title & Date Stamp</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">
                  Main Title:
                </label>
                <input
                  type="text"
                  value={frameConfig.title}
                  onChange={(e) =>
                    onUpdateFrameConfig({ ...frameConfig, title: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-black/20 focus:outline-none focus:ring-2 focus:ring-[#FEF08A]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">
                  Subtitle:
                </label>
                <input
                  type="text"
                  value={frameConfig.subtitle}
                  onChange={(e) =>
                    onUpdateFrameConfig({ ...frameConfig, subtitle: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-black/20 focus:outline-none focus:ring-2 focus:ring-[#FEF08A]"
                />
              </div>
            </div>

            {/* Date Stamp Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-black/5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={frameConfig.showDateStamp}
                  onChange={(e) =>
                    onUpdateFrameConfig({ ...frameConfig, showDateStamp: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#1F1D1D] rounded"
                />
                <span className="text-xs font-bold text-[#1F1D1D] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span>Show Retro Date Stamp</span>
                </span>
              </label>

              {frameConfig.showDateStamp && (
                <div className="flex items-center gap-1.5">
                  {(['retro', 'hand', 'clean'] as const).map((font) => (
                    <button
                      key={font}
                      onClick={() => onUpdateFrameConfig({ ...frameConfig, dateStampFont: font })}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
                        frameConfig.dateStampFont === font
                          ? 'bg-[#1F1D1D] text-[#FEF08A]'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex flex-col xs:flex-row justify-between items-stretch xs:items-center gap-2.5 pt-2 border-t border-black/10">
        <button
          onClick={onBackToFilters}
          className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-black text-center"
        >
          ← Back to Filters
        </button>

        <button
          onClick={onProceedToDecorate}
          className="w-full xs:w-auto flex items-center justify-center gap-2 bg-[#1F1D1D] hover:bg-[#333033] text-[#FEF08A] font-extrabold text-sm sm:text-base px-7 sm:px-8 py-3.5 rounded-2xl border-2 border-[#1F1D1D] shadow-button active:scale-95 transition-all"
        >
          <span>Add Stickers & Decorate →</span>
        </button>
      </div>
    </div>
  );
};
