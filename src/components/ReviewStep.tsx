import React, { useRef } from 'react';
import { ArrowRight, ArrowLeft, RotateCcw, Upload, Check, Sparkles } from 'lucide-react';
import { CapturedPhoto } from '../types';

interface ReviewStepProps {
  photos: CapturedPhoto[];
  onUpdatePhotos: (photos: CapturedPhoto[]) => void;
  onRetakeInCamera: () => void;
  onProceedToFilters: () => void;
  onProceedToAuto?: () => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  photos,
  onUpdatePhotos,
  onRetakeInCamera,
  onProceedToFilters,
  onProceedToAuto,
}) => {
  const replaceInputRef = useRef<HTMLInputElement | null>(null);
  const replacingPhotoIdRef = useRef<string | null>(null);

  // Swap photo positions
  const movePhoto = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= photos.length) return;

    const newPhotos = [...photos];
    const temp = newPhotos[index];
    newPhotos[index] = newPhotos[targetIndex];
    newPhotos[targetIndex] = temp;
    onUpdatePhotos(newPhotos);
  };

  // Replace photo from gallery upload
  const handleReplaceClick = (id: string) => {
    replacingPhotoIdRef.current = id;
    replaceInputRef.current?.click();
  };

  const handleFileReplaced = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetId = replacingPhotoIdRef.current;
    if (!file || !targetId) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onUpdatePhotos(
          photos.map((p) =>
            p.id === targetId
              ? { ...p, originalDataUrl: dataUrl, filteredDataUrl: undefined }
              : p
          )
        );
      }
    };
    reader.readAsDataURL(file);

    if (replaceInputRef.current) {
      replaceInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6">
      {/* Hidden file input for single photo replacement */}
      <input
        type="file"
        ref={replaceInputRef}
        onChange={handleFileReplaced}
        accept="image/*"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border-2 border-[#1F1D1D]/15 shadow-sm">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1F1D1D] font-display">
            Review Your Shots
          </h2>
          <p className="text-xs text-[#52525B] font-medium">
            Check your poses, reorder them, or replace any shot.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onRetakeInCamera}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border-2 border-[#1F1D1D] bg-[#F5EFEB] hover:bg-[#EADBCC] text-[#1F1D1D] shadow-button active:scale-95 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake in Booth</span>
          </button>

          {onProceedToAuto && (
            <button
              onClick={onProceedToAuto}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-extrabold rounded-xl border-2 border-[#1F1D1D] bg-[#FEF08A] text-[#1F1D1D] shadow-button active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Auto Designs</span>
            </button>
          )}

          <button
            onClick={onProceedToFilters}
            className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-extrabold rounded-xl border-2 border-[#1F1D1D] bg-[#1F1D1D] text-[#FEF08A] shadow-button active:scale-95 transition-all"
          >
            <span>Filters Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Photos Grid */}
      <div className={`grid gap-4 ${photos.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'}`}>
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="bg-white p-3 rounded-2xl border-2 border-[#1F1D1D] shadow-polaroid flex flex-col gap-2.5"
          >
            {/* Image Preview */}
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 border border-black/10">
              <img
                src={photo.filteredDataUrl || photo.originalDataUrl}
                alt={`Shot #${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-[#1F1D1D] text-[#FEF08A] text-xs font-extrabold px-2 py-0.5 rounded-md font-mono">
                SHOT #{index + 1}
              </div>
            </div>

            {/* Actions for this photo */}
            <div className="flex items-center justify-between pt-1">
              {/* Move position buttons */}
              {photos.length > 1 ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => movePhoto(index, 'left')}
                    disabled={index === 0}
                    title="Move left/up"
                    className="w-8 h-8 rounded-lg border border-black/20 flex items-center justify-center hover:bg-black/5 disabled:opacity-30 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => movePhoto(index, 'right')}
                    disabled={index === photos.length - 1}
                    title="Move right/down"
                    className="w-8 h-8 rounded-lg border border-black/20 flex items-center justify-center hover:bg-black/5 disabled:opacity-30 transition-colors"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : <div />}

              {/* Replace Button */}
              <button
                onClick={() => handleReplaceClick(photo.id)}
                className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-[#1F1D1D]/30 hover:bg-[#FEF08A]/40 transition-colors"
              >
                <Upload className="w-3 h-3" />
                <span>Replace</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 pt-2">
        {onProceedToAuto && (
          <button
            onClick={onProceedToAuto}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#FEF08A] hover:bg-[#FDE047] text-[#1F1D1D] font-extrabold text-base px-7 py-3.5 rounded-2xl border-2 border-[#1F1D1D] shadow-button active:scale-95 transition-all"
          >
            <Sparkles className="w-5 h-5 text-amber-600" />
            <span>Generate Ready-Made Designs →</span>
          </button>
        )}

        <button
          onClick={onProceedToFilters}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1F1D1D] hover:bg-[#333033] text-[#FEF08A] font-extrabold text-base px-7 py-3.5 rounded-2xl border-2 border-[#1F1D1D] shadow-button active:scale-95 transition-all"
        >
          <Check className="w-5 h-5" />
          <span>Manual Filter Studio →</span>
        </button>
      </div>
    </div>
  );
};
