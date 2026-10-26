import React, { useState } from 'react';
import { Sparkles, Sliders, Check, Layers, Eye, ArrowRight, ArrowLeft } from 'lucide-react';
import { CapturedPhoto, FilterCategory } from '../types';
import { FILTERS, getFilter } from '../utils/filters';

interface FilterStudioProps {
  photos: CapturedPhoto[];
  onUpdatePhotos: (photos: CapturedPhoto[]) => void;
  onProceedToFrames: () => void;
  onBackToReview: () => void;
  onBackToAuto?: () => void;
}

export const FilterStudio: React.FC<FilterStudioProps> = ({
  photos,
  onUpdatePhotos,
  onProceedToFrames,
  onBackToReview,
  onBackToAuto,
}) => {
  // Currently active selected photo index
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);

  // Active filter category tab
  const [category, setCategory] = useState<FilterCategory | 'all'>('retro');

  // Holding "Compare with Original"
  const [isComparingOriginal, setIsComparingOriginal] = useState(false);

  // Success toast for "Applied to all"
  const [appliedAllNotice, setAppliedAllNotice] = useState(false);

  const activePhoto = photos[selectedPhotoIndex] || photos[0];
  if (!activePhoto) return null;

  const currentFilter = getFilter(activePhoto.filterId);

  // Apply a filter to the active photo
  const selectFilterForCurrentPhoto = (filterId: string) => {
    onUpdatePhotos(
      photos.map((p, idx) =>
        idx === selectedPhotoIndex
          ? { ...p, filterId, filterIntensity: p.filterIntensity ?? 80 }
          : p
      )
    );
  };

  // Adjust intensity
  const handleIntensityChange = (val: number) => {
    onUpdatePhotos(
      photos.map((p, idx) =>
        idx === selectedPhotoIndex
          ? { ...p, filterIntensity: val }
          : p
      )
    );
  };

  // Apply current filter & intensity to ALL photos
  const handleApplyToAll = () => {
    const targetFilterId = activePhoto.filterId;
    const targetIntensity = activePhoto.filterIntensity ?? 80;

    onUpdatePhotos(
      photos.map((p) => ({
        ...p,
        filterId: targetFilterId,
        filterIntensity: targetIntensity,
      }))
    );

    setAppliedAllNotice(true);
    setTimeout(() => setAppliedAllNotice(false), 2000);
  };

  // Filter list by category tab
  const displayedFilters = FILTERS.filter((f) => {
    if (category === 'all') return true;
    if (f.id === 'original') return true;
    return f.category === category;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 sm:py-6 flex flex-col gap-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border-2 border-[#1F1D1D]/15 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-[#1F1D1D] font-display">
              Filter Studio
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#FEF08A] border border-[#1F1D1D]">
              24 Styles
            </span>
          </div>
          <p className="text-xs text-[#52525B] font-medium mt-0.5">
            OG social retro & modern film presets. Customize per photo or apply to all.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onBackToAuto && (
            <button
              onClick={onBackToAuto}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-black/20 hover:bg-black/5 transition-colors"
            >
              <span>Auto Designs</span>
            </button>
          )}

          <button
            onClick={onBackToReview}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-black/20 hover:bg-black/5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Review</span>
          </button>

          <button
            onClick={onProceedToFrames}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-extrabold rounded-xl border-2 border-[#1F1D1D] bg-[#1F1D1D] text-[#FEF08A] shadow-button active:scale-95 transition-all"
          >
            <span>Frames Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Workspace: Left Big Preview + Right Filters Library */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Active Photo Large Preview & Intensity Slider (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Large Preview Frame */}
          <div className="relative bg-white p-3 rounded-2xl border-2 border-[#1F1D1D] shadow-scrapbook">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-900 border border-black/10">
              <img
                src={activePhoto.originalDataUrl}
                alt="Active photo preview"
                className="w-full h-full object-cover transition-all duration-200"
                style={{
                  filter: isComparingOriginal
                    ? 'none'
                    : currentFilter.cssFilter(activePhoto.filterIntensity ?? 80),
                }}
              />

              {/* Active Filter Badge */}
              <div className="absolute top-2.5 left-2.5 bg-[#1F1D1D]/90 backdrop-blur-sm text-[#FEF08A] px-2.5 py-1 rounded-lg text-xs font-bold font-display shadow-sm flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#FEF08A]" />
                <span>{isComparingOriginal ? 'ORIGINAL' : currentFilter.name}</span>
              </div>

              {/* Press & Hold to compare button */}
              <button
                onMouseDown={() => setIsComparingOriginal(true)}
                onMouseUp={() => setIsComparingOriginal(false)}
                onTouchStart={() => setIsComparingOriginal(true)}
                onTouchEnd={() => setIsComparingOriginal(false)}
                className="absolute bottom-2.5 right-2.5 bg-black/75 hover:bg-black text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 select-none active:scale-95 transition-all"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Hold to Compare</span>
              </button>
            </div>

            {/* Photo description */}
            <div className="mt-2.5 px-1">
              <p className="text-xs text-[#52525B] font-medium italic">
                {currentFilter.description}
              </p>
            </div>
          </div>

          {/* Intensity Slider Control */}
          <div className="bg-white p-4 rounded-2xl border-2 border-[#1F1D1D]/15 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#1F1D1D]">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-purple-600" />
                <span>Filter Intensity</span>
              </span>
              <span className="font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                {activePhoto.filterIntensity ?? 80}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={activePhoto.filterIntensity ?? 80}
              onChange={(e) => handleIntensityChange(Number(e.target.value))}
              className="w-full accent-[#1F1D1D] h-2 bg-gray-200 rounded-lg cursor-pointer"
            />

            {/* Apply To All Button */}
            <button
              onClick={handleApplyToAll}
              className="w-full flex items-center justify-center gap-2 py-2 bg-[#F5EFEB] hover:bg-[#EADBCC] text-[#1F1D1D] font-extrabold text-xs rounded-xl border border-[#1F1D1D]/20 transition-all"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Apply "{currentFilter.name}" to All Photos</span>
            </button>

            {appliedAllNotice && (
              <p className="text-center text-xs font-bold text-emerald-600 animate-fade-in">
                ✓ Applied to all {photos.length} photos!
              </p>
            )}
          </div>

          {/* Photo Selector Switcher Strip */}
          <div className="bg-[#F5EFEB] p-3 rounded-2xl border-2 border-black/10">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Select Photo to Edit:
            </span>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {photos.map((photo, idx) => {
                const isSelected = idx === selectedPhotoIndex;
                const pFilter = getFilter(photo.filterId);
                return (
                  <button
                    key={photo.id}
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
                      isSelected
                        ? 'border-[#1F1D1D] scale-105 shadow-md ring-2 ring-[#FEF08A]'
                        : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={photo.originalDataUrl}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                      style={{ filter: pFilter.cssFilter(photo.filterIntensity ?? 80) }}
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[9px] font-bold text-center py-0.5">
                      #{idx + 1}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Filter Category Tabs & Presets Gallery (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Tabs: Retro vs Modern */}
          <div className="flex items-center gap-2 bg-[#F5EFEB] p-1.5 rounded-2xl border-2 border-black/10">
            <button
              onClick={() => setCategory('retro')}
              className={`flex-1 py-2 text-xs sm:text-sm font-extrabold rounded-xl transition-all ${
                category === 'retro'
                  ? 'bg-[#1F1D1D] text-[#FEF08A] shadow-button'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              🎞️ OG & Retro (12)
            </button>

            <button
              onClick={() => setCategory('modern')}
              className={`flex-1 py-2 text-xs sm:text-sm font-extrabold rounded-xl transition-all ${
                category === 'modern'
                  ? 'bg-[#1F1D1D] text-[#FEF08A] shadow-button'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              ✨ Modern & Aesthetic (12)
            </button>

            <button
              onClick={() => setCategory('all')}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                category === 'all'
                  ? 'bg-[#1F1D1D] text-[#FEF08A] shadow-button'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              All (24)
            </button>
          </div>

          {/* Filter Thumbnails Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-1">
            {displayedFilters.map((filter) => {
              const isActive = activePhoto.filterId === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => selectFilterForCurrentPhoto(filter.id)}
                  className={`flex flex-col text-left p-2 rounded-2xl bg-white border-2 transition-all group ${
                    isActive
                      ? 'border-[#1F1D1D] shadow-scrapbook bg-[#FEF08A]/10 scale-[1.02]'
                      : 'border-black/10 hover:border-black/30 hover:shadow-sm'
                  }`}
                >
                  {/* Thumbnail Image with Live Filter Effect */}
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-900 border border-black/10 mb-2">
                    <img
                      src={activePhoto.originalDataUrl}
                      alt={filter.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      style={{ filter: filter.cssFilter(80) }}
                    />
                    {isActive && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#1F1D1D] text-[#FEF08A] flex items-center justify-center shadow">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Filter Name & Category Pill */}
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-extrabold text-xs text-[#1F1D1D] font-display truncate">
                      {filter.name}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono bg-gray-100 text-gray-600">
                      {filter.category === 'retro' ? 'OG' : 'MOD'}
                    </span>
                  </div>

                  <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">
                    {filter.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex flex-col xs:flex-row justify-between items-stretch xs:items-center gap-2.5 pt-2 border-t border-black/10">
        <button
          onClick={onBackToReview}
          className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-black text-center"
        >
          ← Back to Review
        </button>

        <button
          onClick={onProceedToFrames}
          className="w-full xs:w-auto flex items-center justify-center gap-2 bg-[#1F1D1D] hover:bg-[#333033] text-[#FEF08A] font-extrabold text-sm sm:text-base px-7 sm:px-8 py-3.5 rounded-2xl border-2 border-[#1F1D1D] shadow-button active:scale-95 transition-all"
        >
          <span>Choose Frame & Layout →</span>
        </button>
      </div>
    </div>
  );
};
