import React, { useState } from 'react';
import { X, Sparkles, Wand2, Camera, ArrowRight } from 'lucide-react';
import { FILTERS } from '../utils/filters';
import { FilterDefinition } from '../types';
import { createSamplePhoto } from '../utils/sampleImages';

interface FilterExploreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAndStartBooth: (filterId: string) => void;
}

export const FilterExploreModal: React.FC<FilterExploreModalProps> = ({
  isOpen,
  onClose,
  onSelectAndStartBooth,
}) => {
  const [activeTab, setActiveTab] = useState<'retro' | 'modern'>('retro');
  const [selectedFilter, setSelectedFilter] = useState<FilterDefinition>(FILTERS[1]);

  // Generate self-contained demo portrait for filter showroom
  const samplePhoto = createSamplePhoto(0, "Filter Showcase", "Sample preview photo");

  if (!isOpen) return null;

  const currentFilters = FILTERS.filter((f) => f.category === activeTab && f.id !== 'original');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#FDFBF7] rounded-3xl border-4 border-[#1F1D1D] shadow-scrapbook flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b-2 border-[#1F1D1D]/15 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#FEF08A] border-2 border-[#1F1D1D] flex items-center justify-center shadow-button">
              <Sparkles className="w-5 h-5 text-[#1F1D1D]" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-[#1F1D1D] font-display">
                Filter Library & Showroom
              </h3>
              <p className="text-xs text-[#52525B] font-medium">
                Sample preview showing how all 24 filters stylize photos before opening the camera
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-[#F5EFEB] hover:bg-black/10 border-2 border-[#1F1D1D] flex items-center justify-center text-[#1F1D1D] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column: Big Interactive Preview (5 cols) */}
          <div className="md:col-span-5 flex flex-col gap-3">
            <div className="bg-white p-3 rounded-2xl border-2 border-[#1F1D1D] shadow-polaroid">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-900 border border-black/10">
                <img
                  src={samplePhoto}
                  alt={selectedFilter.name}
                  className="w-full h-full object-cover transition-all duration-300"
                  style={{ filter: selectedFilter.cssFilter(85) }}
                />

                <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-sm text-[#FEF08A] px-2.5 py-1 rounded-md text-xs font-bold font-display">
                  {selectedFilter.name}
                </div>
              </div>

              <div className="mt-3 px-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-base text-[#1F1D1D] font-display">
                    {selectedFilter.name}
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono bg-[#FEF08A] border border-[#1F1D1D] text-[#1F1D1D]">
                    {selectedFilter.category === 'retro' ? 'Retro & Analog' : 'Modern Aesthetic'}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {selectedFilter.description}
                </p>
              </div>
            </div>

            {/* CTA: Try in Photo Booth */}
            <button
              onClick={() => {
                onClose();
                onSelectAndStartBooth(selectedFilter.id);
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#1F1D1D] hover:bg-[#333033] text-[#FEF08A] font-extrabold text-sm py-3.5 rounded-2xl border-2 border-[#1F1D1D] shadow-button active:scale-95 transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>Try "{selectedFilter.name}" in Booth</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Column: Category Tabs & 12 Filter Thumbnails (7 cols) */}
          <div className="md:col-span-7 flex flex-col gap-4">
            {/* Tabs */}
            <div className="flex items-center gap-2 bg-[#F5EFEB] p-1.5 rounded-2xl border-2 border-black/10">
              <button
                onClick={() => setActiveTab('retro')}
                className={`flex-1 py-2 text-xs sm:text-sm font-extrabold rounded-xl transition-all ${
                  activeTab === 'retro'
                    ? 'bg-[#1F1D1D] text-[#FEF08A] shadow-button'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                🎞️ OG & Retro Filters (12)
              </button>

              <button
                onClick={() => setActiveTab('modern')}
                className={`flex-1 py-2 text-xs sm:text-sm font-extrabold rounded-xl transition-all ${
                  activeTab === 'modern'
                    ? 'bg-[#1F1D1D] text-[#FEF08A] shadow-button'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                ✨ Modern Aesthetic (12)
              </button>
            </div>

            {/* Filter Thumbnails Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {currentFilters.map((filter) => {
                const isSelected = selectedFilter.id === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter)}
                    className={`flex flex-col text-left p-2 rounded-2xl bg-white border-2 transition-all ${
                      isSelected
                        ? 'border-[#1F1D1D] bg-[#FEF08A]/20 shadow-scrapbook scale-[1.02]'
                        : 'border-black/10 hover:border-black/30'
                    }`}
                  >
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-900 border border-black/10 mb-1.5">
                      <img
                        src={samplePhoto}
                        alt={filter.name}
                        className="w-full h-full object-cover"
                        style={{ filter: filter.cssFilter(80) }}
                      />
                    </div>
                    <span className="font-extrabold text-xs text-[#1F1D1D] font-display truncate">
                      {filter.name}
                    </span>
                    <span className="text-[10px] text-gray-500 line-clamp-1">
                      {filter.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
