import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Type, Trash2, RotateCcw, ArrowRight, ArrowLeft, Plus, Move, Smile } from 'lucide-react';
import { CapturedPhoto, FrameConfig, PlacedSticker, PlacedCaption } from '../types';
import { renderCompositionToCanvas } from '../utils/canvasExport';

interface StickerStudioProps {
  photos: CapturedPhoto[];
  frameConfig: FrameConfig;
  stickers: PlacedSticker[];
  onUpdateStickers: (stickers: PlacedSticker[]) => void;
  captions: PlacedCaption[];
  onUpdateCaptions: (captions: PlacedCaption[]) => void;
  onProceedToExport: () => void;
  onBackToFrames: () => void;
}

export const StickerStudio: React.FC<StickerStudioProps> = ({
  photos,
  frameConfig,
  stickers,
  onUpdateStickers,
  captions,
  onUpdateCaptions,
  onProceedToExport,
  onBackToFrames,
}) => {
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Selected element for rotation/scale/delete
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [selectedCaptionId, setSelectedCaptionId] = useState<string | null>(null);

  // Dragging state
  const [dragItem, setDragItem] = useState<{ type: 'sticker' | 'caption'; id: string } | null>(null);

  // New caption input state
  const [captionText, setCaptionText] = useState('');
  const [captionFont, setCaptionFont] = useState<'Caveat' | 'Space Grotesk' | 'Fraunces' | 'VT323'>('Caveat');
  const [captionColor, setCaptionColor] = useState('#1F1D1D');

  const STICKER_PALETTE = [
    '⭐', '💖', '✨', '🌸', '🍒', '🦋', '🕶️', '✌️', 
    '🎀', '🧸', '🧁', '💌', '🔥', '📸', '🍓', '🌼',
    '🍄', '🌈', '🍦', '🎉', '💫', '🥑', '⚡', '🌷'
  ];

  const PRESET_BADGES = [
    'Certified chaos',
    'No thoughts, just vibes',
    'Main character energy',
    'Camera roll classics',
    'Besties being unserious',
    'One for the memories ✨',
  ];

  // Render composition preview with stickers & captions
  useEffect(() => {
    let isCancelled = false;
    const render = async () => {
      try {
        const fullCanvas = await renderCompositionToCanvas(photos, frameConfig, stickers, captions);
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
        console.error('Sticker preview render error', err);
      }
    };

    render();
    return () => {
      isCancelled = true;
    };
  }, [photos, frameConfig, stickers, captions]);

  // Add new emoji sticker at center
  const addSticker = (emoji: string) => {
    const newSticker: PlacedSticker = {
      id: `st_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      emoji,
      x: 35 + Math.random() * 30,
      y: 35 + Math.random() * 30,
      scale: 1,
      rotation: Math.round((Math.random() - 0.5) * 30),
    };
    onUpdateStickers([...stickers, newSticker]);
    setSelectedStickerId(newSticker.id);
    setSelectedCaptionId(null);
  };

  // Add caption
  const handleAddCaption = (textToAdd = captionText) => {
    if (!textToAdd.trim()) return;

    const newCaption: PlacedCaption = {
      id: `cap_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      text: textToAdd.trim(),
      x: 50,
      y: 50 + (captions.length * 8) % 30,
      fontSize: 22,
      fontFamily: captionFont,
      color: captionColor,
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      rotation: Math.round((Math.random() - 0.5) * 10),
    };

    onUpdateCaptions([...captions, newCaption]);
    setSelectedCaptionId(newCaption.id);
    setSelectedStickerId(null);
    setCaptionText('');
  };

  // Delete selected
  const deleteSelected = () => {
    if (selectedStickerId) {
      onUpdateStickers(stickers.filter((s) => s.id !== selectedStickerId));
      setSelectedStickerId(null);
    }
    if (selectedCaptionId) {
      onUpdateCaptions(captions.filter((c) => c.id !== selectedCaptionId));
      setSelectedCaptionId(null);
    }
  };

  // Reset all decorations
  const resetAllDecorations = () => {
    onUpdateStickers([]);
    onUpdateCaptions([]);
    setSelectedStickerId(null);
    setSelectedCaptionId(null);
  };

  // Pointer drag handling on the overlay container
  const handlePointerDown = (type: 'sticker' | 'caption', id: string) => {
    setDragItem({ type, id });
    if (type === 'sticker') {
      setSelectedStickerId(id);
      setSelectedCaptionId(null);
    } else {
      setSelectedCaptionId(id);
      setSelectedStickerId(null);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragItem || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = Math.min(95, Math.max(5, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.min(95, Math.max(5, ((e.clientY - rect.top) / rect.height) * 100));

    if (dragItem.type === 'sticker') {
      onUpdateStickers(
        stickers.map((s) => (s.id === dragItem.id ? { ...s, x: xPct, y: yPct } : s))
      );
    } else {
      onUpdateCaptions(
        captions.map((c) => (c.id === dragItem.id ? { ...c, x: xPct, y: yPct } : c))
      );
    }
  };

  const handlePointerUp = () => {
    setDragItem(null);
  };

  const activeSticker = stickers.find((s) => s.id === selectedStickerId);
  const activeCaption = captions.find((c) => c.id === selectedCaptionId);

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="max-w-6xl mx-auto px-4 py-4 sm:py-6 flex flex-col gap-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border-2 border-[#1F1D1D]/15 shadow-sm">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1F1D1D] font-display">
            Stickers & Scrapbook Studio
          </h2>
          <p className="text-xs text-[#52525B] font-medium">
            Add stickers, playful badges, and handwritten notes. Drag them anywhere on your strip.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onBackToFrames}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-black/20 hover:bg-black/5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Frames</span>
          </button>

          <button
            onClick={onProceedToExport}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-extrabold rounded-xl border-2 border-[#1F1D1D] bg-[#1F1D1D] text-[#FEF08A] shadow-button active:scale-95 transition-all"
          >
            <span>Final Export</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Canvas with Draggable Overlay (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div
            ref={containerRef}
            className="relative w-full max-w-[340px] sm:max-w-[380px] bg-neutral-100 p-2.5 rounded-2xl border-2 border-[#1F1D1D] shadow-polaroid select-none overflow-hidden touch-none"
          >
            <canvas ref={previewCanvasRef} className="w-full h-auto rounded-md shadow-sm block" />

            {/* Draggable Overlays */}
            {stickers.map((st) => {
              const isSelected = st.id === selectedStickerId;
              return (
                <div
                  key={st.id}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    handlePointerDown('sticker', st.id);
                  }}
                  style={{
                    left: `${st.x}%`,
                    top: `${st.y}%`,
                    transform: `translate(-50%, -50%) rotate(${st.rotation}deg) scale(${st.scale})`,
                  }}
                  className={`absolute cursor-grab active:cursor-grabbing text-3xl select-none z-20 ${
                    isSelected ? 'ring-2 ring-purple-600 rounded-lg p-1 bg-white/40' : ''
                  }`}
                >
                  {st.emoji}
                </div>
              );
            })}

            {captions.map((cap) => {
              const isSelected = cap.id === selectedCaptionId;
              return (
                <div
                  key={cap.id}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    handlePointerDown('caption', cap.id);
                  }}
                  style={{
                    left: `${cap.x}%`,
                    top: `${cap.y}%`,
                    transform: `translate(-50%, -50%) rotate(${cap.rotation}deg)`,
                    fontFamily: cap.fontFamily,
                    color: cap.color,
                  }}
                  className={`absolute cursor-grab active:cursor-grabbing px-2.5 py-1 rounded-md text-sm font-bold shadow-sm whitespace-nowrap select-none z-20 ${
                    cap.backgroundColor ? 'bg-white/90 border border-black/20' : ''
                  } ${isSelected ? 'ring-2 ring-purple-600' : ''}`}
                >
                  {cap.text}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between w-full max-w-[340px] sm:max-w-[380px] mt-2 px-1 text-[11px] text-gray-500 font-medium">
            <span>💡 Drag any sticker to reposition</span>
            {(stickers.length > 0 || captions.length > 0) && (
              <button
                onClick={resetAllDecorations}
                className="text-rose-600 hover:text-rose-800 font-bold underline"
              >
                Reset All
              </button>
            )}
          </div>
        </div>

        {/* Right: Stickers Picker, Presets & Controls (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Active Item Transformation Controls */}
          {(activeSticker || activeCaption) && (
            <div className="bg-[#FEF08A]/30 p-3.5 rounded-2xl border-2 border-[#1F1D1D] shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black font-display text-[#1F1D1D]">
                  Selected: {activeSticker ? activeSticker.emoji : `"${activeCaption?.text}"`}
                </span>

                {/* Rotate slider */}
                {activeSticker && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                    <span>Rotate:</span>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={activeSticker.rotation}
                      onChange={(e) =>
                        onUpdateStickers(
                          stickers.map((s) =>
                            s.id === activeSticker.id ? { ...s, rotation: Number(e.target.value) } : s
                          )
                        )
                      }
                      className="w-20 accent-[#1F1D1D] h-1.5 bg-gray-200 rounded"
                    />
                  </div>
                )}

                {/* Scale slider */}
                {activeSticker && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                    <span>Size:</span>
                    <input
                      type="range"
                      min="0.5"
                      max="2.5"
                      step="0.1"
                      value={activeSticker.scale}
                      onChange={(e) =>
                        onUpdateStickers(
                          stickers.map((s) =>
                            s.id === activeSticker.id ? { ...s, scale: Number(e.target.value) } : s
                          )
                        )
                      }
                      className="w-20 accent-[#1F1D1D] h-1.5 bg-gray-200 rounded"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={deleteSelected}
                className="flex items-center gap-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-3 py-1.5 rounded-xl shadow-sm transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          )}

          {/* 1. Emoji / Stickers Gallery */}
          <div className="bg-white p-4 rounded-2xl border-2 border-[#1F1D1D]/15 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-sm font-extrabold text-[#1F1D1D] font-display">
              <Smile className="w-4 h-4 text-amber-500" />
              <span>Tap to Add Stickers</span>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
              {STICKER_PALETTE.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => addSticker(emoji)}
                  className="w-10 h-10 rounded-xl bg-[#F5EFEB] hover:bg-[#FEF08A] border border-black/15 flex items-center justify-center text-xl hover:scale-110 active:scale-95 transition-all"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Preset Cute Badges */}
          <div className="bg-white p-4 rounded-2xl border-2 border-[#1F1D1D]/15 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-sm font-extrabold text-[#1F1D1D] font-display">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Quick Badges & Quotes</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {PRESET_BADGES.map((badge) => (
                <button
                  key={badge}
                  onClick={() => handleAddCaption(badge)}
                  className="px-3 py-1.5 rounded-xl bg-[#F5EFEB] hover:bg-[#FBCFE8] border border-black/15 text-xs font-bold text-[#1F1D1D] hover:scale-105 active:scale-95 transition-all"
                >
                  + “{badge}”
                </button>
              ))}
            </div>
          </div>

          {/* 3. Custom Text & Handwritten Captions */}
          <div className="bg-white p-4 rounded-2xl border-2 border-[#1F1D1D]/15 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-sm font-extrabold text-[#1F1D1D] font-display">
              <Type className="w-4 h-4 text-blue-600" />
              <span>Custom Caption</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Write a cute note or caption..."
                value={captionText}
                onChange={(e) => setCaptionText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCaption()}
                className="flex-1 px-3 py-2 text-xs font-bold rounded-xl border border-black/20 focus:outline-none focus:ring-2 focus:ring-[#FEF08A]"
              />
              <button
                onClick={() => handleAddCaption()}
                disabled={!captionText.trim()}
                className="flex items-center gap-1 bg-[#1F1D1D] hover:bg-black text-[#FEF08A] px-4 py-2 rounded-xl text-xs font-extrabold disabled:opacity-40 transition-all shadow-button"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            {/* Font choice */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-gray-500">Font:</span>
              {(['Caveat', 'Space Grotesk', 'Fraunces', 'VT323'] as const).map((font) => (
                <button
                  key={font}
                  onClick={() => setCaptionFont(font)}
                  style={{ fontFamily: font }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    captionFont === font
                      ? 'bg-[#1F1D1D] text-[#FEF08A]'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {font}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex flex-col xs:flex-row justify-between items-stretch xs:items-center gap-2.5 pt-2 border-t border-black/10">
        <button
          onClick={onBackToFrames}
          className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-black text-center"
        >
          ← Back to Frames
        </button>

        <button
          onClick={onProceedToExport}
          className="w-full xs:w-auto flex items-center justify-center gap-2 bg-[#1F1D1D] hover:bg-[#333033] text-[#FEF08A] font-extrabold text-sm sm:text-base px-7 sm:px-8 py-3.5 rounded-2xl border-2 border-[#1F1D1D] shadow-button active:scale-95 transition-all"
        >
          <span>Preview Final Strip & Download →</span>
        </button>
      </div>
    </div>
  );
};
