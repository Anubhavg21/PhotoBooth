import React, { useState, useEffect } from 'react';
import { Step, CapturedPhoto, FrameConfig, PlacedSticker, PlacedCaption, ShotCount, BrandingConfig, GeneratedDesign } from './types';
import { Navbar } from './components/Navbar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { CameraCapture } from './components/CameraCapture';
import { AutoResultsScreen } from './components/AutoResultsScreen';
import { ReviewStep } from './components/ReviewStep';
import { FilterStudio } from './components/FilterStudio';
import { FrameStudio } from './components/FrameStudio';
import { StickerStudio } from './components/StickerStudio';
import { ExportModal } from './components/ExportModal';
import { FilterExploreModal } from './components/FilterExploreModal';
import { PersonalizationModal } from './components/PersonalizationModal';
import { createSamplePhoto, SAMPLE_SHOTS } from './utils/sampleImages';
import { getInitialBranding, saveBranding } from './utils/brandingConfig';

export const App: React.FC = () => {
  // Centralized branding & personalization state
  const [branding, setBranding] = useState<BrandingConfig>(getInitialBranding);
  const [isPersonalizeOpen, setIsPersonalizeOpen] = useState(false);

  // Default frame configuration synced with branding
  const getInitialFrameConfig = (brand: BrandingConfig): FrameConfig => ({
    layoutId: 'classic-strip',
    backgroundColor: '#FDFBF7',
    borderColor: '#1F1D1D',
    borderWidth: 0,
    borderRadius: 8,
    photoGap: 16,
    aspectRatio: 'strip',
    title: brand.productName,
    subtitle: brand.showRecipientName && brand.recipientName
      ? `For ${brand.recipientName} • Core Memories ✨`
      : brand.tagline,
    showDateStamp: true,
    dateStampText: "'26 10 26",
    dateStampColor: '#F59E0B',
    dateStampFont: 'retro',
  });

  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [frameConfig, setFrameConfig] = useState<FrameConfig>(() => getInitialFrameConfig(branding));
  const [stickers, setStickers] = useState<PlacedSticker[]>([]);
  const [captions, setCaptions] = useState<PlacedCaption[]>([]);

  // Explore filters modal
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [preferredFilter, setPreferredFilter] = useState<string>('original');

  // Confirmation modal for session reset
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Update branding
  const handleUpdateBranding = (newBranding: BrandingConfig) => {
    setBranding(newBranding);
    saveBranding(newBranding);
    setFrameConfig((prev) => ({
      ...prev,
      title: newBranding.productName,
      subtitle: newBranding.showRecipientName && newBranding.recipientName
        ? `For ${newBranding.recipientName} • Core Memories ✨`
        : newBranding.tagline,
    }));
  };

  // Navigate to step
  const handleNavigate = (step: Step) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Start new session
  const handleResetSession = () => {
    setPhotos([]);
    setStickers([]);
    setCaptions([]);
    setFrameConfig(getInitialFrameConfig(branding));
    setCurrentStep('welcome');
    setShowResetConfirm(false);
  };

  // Populate sample photos for instant demo and jump to Auto Memories!
  const handleUseSamplePhotos = (count: ShotCount = 4) => {
    const samples: CapturedPhoto[] = [];
    for (let i = 0; i < count; i++) {
      const shotMeta = SAMPLE_SHOTS[i % SAMPLE_SHOTS.length];
      const dataUrl = createSamplePhoto(i, shotMeta.title, shotMeta.subtitle);
      samples.push({
        id: `sample_${i}_${Date.now()}`,
        originalDataUrl: dataUrl,
        filterId: preferredFilter || 'original',
        filterIntensity: 80,
        timestamp: Date.now(),
      });
    }

    setPhotos(samples);
    handleNavigate('auto-results');
  };

  // When user clicks "Customize" from Auto Results
  const handleCustomizeDesign = (design: GeneratedDesign) => {
    setPhotos(design.photos);
    setFrameConfig(design.frameConfig);
    setStickers(design.stickers);
    setCaptions(design.captions);
    handleNavigate('filter');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#1F1D1D]">
      {/* Top Navigation */}
      <Navbar
        currentStep={currentStep}
        onNavigate={handleNavigate}
        hasPhotos={photos.length > 0}
        onReset={() => setShowResetConfirm(true)}
        onOpenExplore={() => setIsExploreOpen(true)}
        onOpenPersonalize={() => setIsPersonalizeOpen(true)}
        branding={branding}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentStep === 'welcome' && (
          <WelcomeScreen
            branding={branding}
            onStartBooth={() => handleNavigate('camera')}
            onOpenExplore={() => setIsExploreOpen(true)}
            onUseSamplePhotos={() => handleUseSamplePhotos(4)}
            onOpenPersonalize={() => setIsPersonalizeOpen(true)}
          />
        )}

        {currentStep === 'camera' && (
          <CameraCapture
            branding={branding}
            onSessionComplete={(capturedPhotos) => {
              setPhotos(capturedPhotos);
              // Automatically process photos and show ready-made designs!
              handleNavigate('auto-results');
            }}
            onUseSamplePhotos={handleUseSamplePhotos}
          />
        )}

        {currentStep === 'auto-results' && (
          <AutoResultsScreen
            photos={photos}
            branding={branding}
            onCustomizeDesign={handleCustomizeDesign}
            onRetake={() => handleNavigate('camera')}
          />
        )}

        {currentStep === 'review' && (
          <ReviewStep
            photos={photos}
            onUpdatePhotos={setPhotos}
            onRetakeInCamera={() => handleNavigate('camera')}
            onProceedToFilters={() => handleNavigate('filter')}
            onProceedToAuto={() => handleNavigate('auto-results')}
          />
        )}

        {currentStep === 'filter' && (
          <FilterStudio
            photos={photos}
            onUpdatePhotos={setPhotos}
            onProceedToFrames={() => handleNavigate('frame')}
            onBackToReview={() => handleNavigate('review')}
            onBackToAuto={() => handleNavigate('auto-results')}
          />
        )}

        {currentStep === 'frame' && (
          <FrameStudio
            photos={photos}
            frameConfig={frameConfig}
            onUpdateFrameConfig={setFrameConfig}
            onProceedToDecorate={() => handleNavigate('stickers')}
            onBackToFilters={() => handleNavigate('filter')}
          />
        )}

        {currentStep === 'stickers' && (
          <StickerStudio
            photos={photos}
            frameConfig={frameConfig}
            stickers={stickers}
            onUpdateStickers={setStickers}
            captions={captions}
            onUpdateCaptions={setCaptions}
            onProceedToExport={() => handleNavigate('export')}
            onBackToFrames={() => handleNavigate('frame')}
          />
        )}

        {currentStep === 'export' && (
          <ExportModal
            photos={photos}
            frameConfig={frameConfig}
            stickers={stickers}
            captions={captions}
            branding={branding}
            onBackToDecorate={() => handleNavigate('stickers')}
            onBackToAuto={() => handleNavigate('auto-results')}
            onStartNewSession={() => setShowResetConfirm(true)}
          />
        )}
      </main>

      {/* Explore Filters Showroom Modal */}
      <FilterExploreModal
        isOpen={isExploreOpen}
        onClose={() => setIsExploreOpen(false)}
        onSelectAndStartBooth={(filterId) => {
          setPreferredFilter(filterId);
          handleNavigate('camera');
        }}
      />

      {/* Personalize & Gift Settings Modal */}
      <PersonalizationModal
        isOpen={isPersonalizeOpen}
        onClose={() => setIsPersonalizeOpen(false)}
        branding={branding}
        onSave={handleUpdateBranding}
      />

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white p-5 rounded-3xl border-3 border-[#1F1D1D] shadow-scrapbook flex flex-col gap-3">
            <h3 className="text-lg font-black text-[#1F1D1D] font-display">
              Start a New Session?
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              This will clear the current photos and customizations. Make sure you’ve downloaded your final strip first!
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleResetSession}
                className="px-4 py-2 text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-button active:scale-95 transition-all"
              >
                Yes, Start Fresh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
