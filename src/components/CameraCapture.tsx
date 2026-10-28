import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, SwitchCamera, Play, RotateCcw, Upload, Sparkles, Check, Trash2, AlertCircle, Pause, Sliders, ArrowRight } from 'lucide-react';
import { ShotCount, CountdownDuration, CapturedPhoto, BrandingConfig } from '../types';
import { useCamera } from '../hooks/useCamera';
import { playCountdownBeep, playCameraShutterSound } from '../utils/audio';

interface CameraCaptureProps {
  onSessionComplete: (photos: CapturedPhoto[]) => void;
  onProceedToEdit?: (photos: CapturedPhoto[]) => void;
  onUseSamplePhotos: (count: ShotCount) => void;
  initialShotCount?: ShotCount;
  branding?: BrandingConfig;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onSessionComplete,
  onProceedToEdit,
  onUseSamplePhotos,
  initialShotCount = 4,
  branding,
}) => {
  // Settings
  const [shotCount, setShotCount] = useState<ShotCount>(initialShotCount);
  const [countdownDuration, setCountdownDuration] = useState<CountdownDuration>(3);
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);

  // Capture State
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownValue, setCountdownValue] = useState<number>(3);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isAutoSequence, setIsAutoSequence] = useState(false);
  const [betweenShotsPrompt, setBetweenShotsPrompt] = useState<string | null>(null);

  // Live refs to prevent stale closures during multi-step async sequences
  const photosRef = useRef<CapturedPhoto[]>([]);
  const shotCountRef = useRef<ShotCount>(initialShotCount);
  const countdownDurationRef = useRef<CountdownDuration>(3);
  const isAutoSequenceRef = useRef<boolean>(false);
  const isSingleCapturingRef = useRef<boolean>(false);

  // Hook for camera
  const { videoRef, state: cameraState, startCamera, stopCamera, switchCamera, captureFrame } = useCamera();

  // File upload input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Keep refs in sync
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    shotCountRef.current = shotCount;
  }, [shotCount]);

  useEffect(() => {
    countdownDurationRef.current = countdownDuration;
  }, [countdownDuration]);

  // Start camera on mount & clean up
  useEffect(() => {
    startCamera('user');
    return () => {
      stopCamera();
      isAutoSequenceRef.current = false;
      isSingleCapturingRef.current = false;
    };
  }, [startCamera, stopCamera]);

  // Execute snapshot
  const takeSnapshot = useCallback(() => {
    playCameraShutterSound();
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 450);

    const frame = captureFrame();
    if (!frame) return null;

    const newPhoto: CapturedPhoto = {
      id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      originalDataUrl: frame,
      filterId: 'original',
      filterIntensity: 80,
      timestamp: Date.now(),
    };

    return newPhoto;
  }, [captureFrame]);

  // --------------------------------------------------------------------------
  // BULLETPROOF AUTO MULTI-SHOT SEQUENCE
  // User clicks ONCE -> automatically captures 4 shots with 3s pose pause
  // --------------------------------------------------------------------------
  const startAutoMultiShotSequence = async () => {
    if (isAutoSequenceRef.current || isSingleCapturingRef.current || !cameraState.isActive) return;

    isAutoSequenceRef.current = true;
    setIsAutoSequence(true);

    const targetCount = 4; // Always 4 shots in hands-free auto mode

    while (isAutoSequenceRef.current && photosRef.current.length < targetCount) {
      const currentCount = photosRef.current.length;

      // 1. Pause between shots (3 seconds) so the user can change poses!
      if (currentCount > 0) {
        const posePrompts = [
          'Change your pose! ✌️',
          'Silly face time! 😜',
          'Big smile! ✨',
          'Main character energy! 🕶️',
          'Strike a classic look! 📸',
        ];
        const promptText = posePrompts[(currentCount - 1) % posePrompts.length];

        for (let p = 3; p > 0; p--) {
          if (!isAutoSequenceRef.current) return;
          setBetweenShotsPrompt(`Photo ${currentCount} saved! Next shot in ${p}s — ${promptText}`);
          await delay(1000);
        }
        setBetweenShotsPrompt(null);
      }

      if (!isAutoSequenceRef.current) return;

      // 2. Countdown before capturing this shot (3, 2, 1)
      setIsCountingDown(true);
      for (let c = countdownDurationRef.current; c > 0; c--) {
        if (!isAutoSequenceRef.current) {
          setIsCountingDown(false);
          return;
        }
        setCountdownValue(c);
        playCountdownBeep(c === 1);
        await delay(1000);
      }

      if (!isAutoSequenceRef.current) {
        setIsCountingDown(false);
        return;
      }

      setIsCountingDown(false);

      // 3. Capture Photo & Flash
      const photo = takeSnapshot();
      if (photo) {
        const nextPhotos = [...photosRef.current, photo];
        photosRef.current = nextPhotos;
        setPhotos(nextPhotos);
      }

      // Brief delay after flash
      await delay(800);
    }

    // 4. Once all 4 photos are captured, automatically proceed to Auto Memories!
    if (isAutoSequenceRef.current && photosRef.current.length >= targetCount) {
      isAutoSequenceRef.current = false;
      setIsAutoSequence(false);
      setBetweenShotsPrompt('All photos captured! Generating ready-made memories... ✨');
      await delay(1000);
      onSessionComplete(photosRef.current);
    }
  };

  // Stop / Pause auto sequence
  const stopAutoMultiShotSequence = () => {
    isAutoSequenceRef.current = false;
    setIsAutoSequence(false);
    setIsCountingDown(false);
    setBetweenShotsPrompt(null);
  };

  // --------------------------------------------------------------------------
  // MANUAL SNAP CAPTURE (Dynamic & User-Driven: 1 photo, or more as desired)
  // --------------------------------------------------------------------------
  const snapSinglePhoto = async () => {
    if (isCountingDown || isAutoSequenceRef.current || isSingleCapturingRef.current || !cameraState.isActive) return;
    if (photosRef.current.length >= 6) return;

    isSingleCapturingRef.current = true;
    setBetweenShotsPrompt(null);
    setIsCountingDown(true);

    for (let c = countdownDurationRef.current; c > 0; c--) {
      setCountdownValue(c);
      playCountdownBeep(c === 1);
      await delay(1000);
    }

    setIsCountingDown(false);
    const photo = takeSnapshot();
    if (photo) {
      const nextPhotos = [...photosRef.current, photo];
      photosRef.current = nextPhotos;
      setPhotos(nextPhotos);

      // If user specifically picked "1 Shot" mode in the selector, auto-proceed
      if (shotCountRef.current === 1) {
        await delay(600);
        if (onProceedToEdit) {
          onProceedToEdit(nextPhotos);
        } else {
          onSessionComplete(nextPhotos);
        }
      }
    }

    isSingleCapturingRef.current = false;
  };

  // Delete specific photo
  const deletePhoto = (id: string) => {
    const nextPhotos = photosRef.current.filter((p) => p.id !== id);
    photosRef.current = nextPhotos;
    setPhotos(nextPhotos);
  };

  // Retake all photos
  const retakeAll = () => {
    stopAutoMultiShotSequence();
    photosRef.current = [];
    setPhotos([]);
  };

  // Handle local file upload fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 6 - photos.length;
    const filesToRead = Array.from(files).slice(0, remainingSlots);

    filesToRead.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          const newPhoto: CapturedPhoto = {
            id: `upload_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            originalDataUrl: result,
            filterId: 'original',
            filterIntensity: 80,
            timestamp: Date.now(),
          };
          const nextPhotos = [...photosRef.current, newPhoto];
          photosRef.current = nextPhotos;
          setPhotos(nextPhotos);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const friendName = branding?.showRecipientName && branding.recipientName ? branding.recipientName : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 flex flex-col gap-5">
      {/* Top Header / Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border-2 border-[#1F1D1D]/15 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1F1D1D] font-display">
            The Photo Booth
          </h2>
          <p className="text-xs text-[#52525B] font-medium">
            {photos.length === 0
              ? 'Snap 1 photo, multiple shots, or use Auto 4-Shot hands-free!'
              : `${photos.length} photo${photos.length > 1 ? 's' : ''} captured • Proceed anytime to frame & edit!`}
          </p>
        </div>

        {/* Shot Count and Timer controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Shot Count selection */}
          <div className="flex items-center bg-[#F5EFEB] p-1 rounded-xl border border-black/10">
            <span className="text-[11px] font-bold text-gray-500 px-2">Manual Target:</span>
            {([1, 3, 4, 6] as ShotCount[]).map((count) => (
              <button
                key={count}
                disabled={isAutoSequence || isCountingDown}
                onClick={() => {
                  setShotCount(count);
                }}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  shotCount === count
                    ? 'bg-[#1F1D1D] text-[#FEF08A] shadow-sm'
                    : 'text-gray-600 hover:text-black disabled:opacity-40'
                }`}
              >
                {count === 1 ? '1 (Single)' : count === 4 ? '4 (Auto/Strip)' : `${count} Shots`}
              </button>
            ))}
          </div>

          {/* Countdown timer selection */}
          <div className="flex items-center bg-[#F5EFEB] p-1 rounded-xl border border-black/10">
            <span className="text-[11px] font-bold text-gray-500 px-2">Timer:</span>
            {([1, 3, 5] as CountdownDuration[]).map((sec) => (
              <button
                key={sec}
                disabled={isAutoSequence || isCountingDown}
                onClick={() => setCountdownDuration(sec)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  countdownDuration === sec
                    ? 'bg-[#1F1D1D] text-[#FEF08A] shadow-sm'
                    : 'text-gray-600 hover:text-black disabled:opacity-40'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Camera Live View Box */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] max-h-[520px] bg-neutral-900 rounded-3xl overflow-hidden border-4 border-[#1F1D1D] shadow-scrapbook flex items-center justify-center">
        {/* Flash Overlay */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white z-40 animate-flash pointer-events-none" />
        )}

        {/* Between Shots Pose Prompt Overlay (Auto Sequence) */}
        {betweenShotsPrompt && (
          <div className="absolute top-6 inset-x-6 z-30 flex items-center justify-between bg-[#FEF08A] border-3 border-[#1F1D1D] px-4 py-2.5 rounded-2xl shadow-button animate-bounce">
            <span className="text-xs sm:text-sm font-black text-[#1F1D1D] font-display">
              {betweenShotsPrompt}
            </span>
            <button
              onClick={stopAutoMultiShotSequence}
              className="text-xs font-extrabold text-white bg-[#1F1D1D] px-2.5 py-1 rounded-lg hover:bg-black"
            >
              Pause
            </button>
          </div>
        )}

        {/* Countdown Overlay */}
        {isCountingDown && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/40 backdrop-blur-xs">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-[#FEF08A] border-4 border-[#1F1D1D] shadow-button flex items-center justify-center animate-pulse">
              <span className="text-5xl sm:text-7xl font-black font-display text-[#1F1D1D]">
                {countdownValue}
              </span>
            </div>
            <p className="mt-4 text-white font-extrabold text-lg sm:text-xl font-display tracking-wide drop-shadow-md">
              {countdownValue === 1 ? 'Say Cheese! 📸' : 'Get Ready!'}
            </p>
          </div>
        )}

        {/* Video stream */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${
            cameraState.facingMode === 'user' ? 'scale-x-[-1]' : ''
          } ${cameraState.isActive ? 'block' : 'hidden'}`}
        />

        {/* Camera Permission / Error Fallback UI */}
        {!cameraState.isActive && (
          <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center bg-[#FDFBF7] text-[#1F1D1D]">
            {cameraState.isLoading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full border-4 border-[#1F1D1D] border-t-[#FEF08A] animate-spin" />
                <p className="font-bold text-sm">Requesting camera access...</p>
              </div>
            ) : (
              <div className="max-w-md flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[#FEF08A] border-2 border-[#1F1D1D] flex items-center justify-center shadow-button">
                  <AlertCircle className="w-7 h-7 text-[#1F1D1D]" />
                </div>
                <h3 className="text-lg font-extrabold font-display">Camera Offline or Restricted</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {cameraState.error ||
                    'Please grant camera permissions in your browser bar, or simply upload photos from your phone gallery.'}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                  <button
                    onClick={() => startCamera()}
                    className="px-4 py-2 bg-[#1F1D1D] text-[#FEF08A] font-bold text-xs rounded-xl shadow-button active:scale-95 transition-all"
                  >
                    Retry Camera
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-white text-[#1F1D1D] border-2 border-[#1F1D1D] font-bold text-xs rounded-xl shadow-button active:scale-95 transition-all"
                  >
                    Upload from Gallery
                  </button>
                  <button
                    onClick={() => onUseSamplePhotos(shotCount)}
                    className="px-4 py-2 bg-[#FBCFE8] text-[#1F1D1D] border-2 border-[#1F1D1D] font-bold text-xs rounded-xl shadow-button active:scale-95 transition-all"
                  >
                    Use Sample Photos
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Live Camera Overlays & Flip Switch */}
        {cameraState.isActive && (
          <>
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>LIVE BOOTH</span>
            </div>

            <div className="absolute bottom-4 left-4 z-20 bg-black/60 backdrop-blur-sm text-[#FEF08A] px-2.5 py-1 rounded-md text-xs font-mono font-bold tracking-wider">
              {photos.length === 0 ? 'READY TO SNAP' : `${photos.length} SHOT${photos.length > 1 ? 'S' : ''} CAPTURED`}
            </div>

            {/* Camera switch toggle button */}
            <button
              onClick={switchCamera}
              title="Flip camera (front/back)"
              className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-[#1F1D1D] border-2 border-[#1F1D1D] shadow-button flex items-center justify-center active:scale-90 transition-all"
            >
              <SwitchCamera className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border-2 border-[#1F1D1D]/15 shadow-sm">
        {/* Left: Upload Fallback & Retake */}
        <div className="flex items-center gap-2 order-2 sm:order-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            multiple
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={photos.length >= 6 || isCountingDown || isAutoSequence}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-black/20 hover:bg-black/5 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Photos</span>
          </button>

          {photos.length > 0 && (
            <button
              onClick={retakeAll}
              disabled={isCountingDown}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart</span>
            </button>
          )}
        </div>

        {/* Center: Main Snap / Sequence / Proceed Buttons */}
        <div className="flex items-center justify-center gap-2.5 order-1 sm:order-2 flex-wrap">
          {isAutoSequence ? (
            <button
              onClick={stopAutoMultiShotSequence}
              className="flex items-center gap-2 bg-[#1F1D1D] hover:bg-black text-[#FEF08A] font-black text-sm px-5 py-3 rounded-2xl border-2 border-[#1F1D1D] shadow-button active:scale-95 transition-all cursor-pointer"
            >
              <Pause className="w-4 h-4" />
              <span>Pause Auto</span>
            </button>
          ) : photos.length === 0 ? (
            <>
              {/* Auto 4-Shot Button */}
              <button
                onClick={startAutoMultiShotSequence}
                disabled={isCountingDown || !cameraState.isActive}
                className="flex items-center gap-2 bg-[#1F1D1D] hover:bg-[#333033] text-[#FEF08A] font-black text-xs sm:text-sm px-4 sm:px-5 py-3.5 rounded-2xl border-2 border-[#1F1D1D] shadow-button active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Auto 4-Shot (Hands-Free)</span>
              </button>

              {/* Single Manual Snap Button */}
              <button
                onClick={snapSinglePhoto}
                disabled={isCountingDown || !cameraState.isActive}
                title="Take 1 photo manually"
                className="flex items-center gap-2 px-4 sm:px-5 py-3.5 rounded-2xl bg-[#FEF08A] hover:bg-[#FDE047] text-[#1F1D1D] border-2 border-[#1F1D1D] font-black text-xs sm:text-sm shadow-button active:scale-90 disabled:opacity-40 transition-all cursor-pointer"
              >
                <Camera className="w-5 h-5" />
                <span>Snap Photo (Manual)</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap justify-center">
              {/* Primary: Proceed to Edit & Frame directly */}
              <button
                onClick={() => (onProceedToEdit ? onProceedToEdit(photos) : onSessionComplete(photos))}
                className="flex items-center gap-2 bg-[#1F1D1D] hover:bg-black text-[#FEF08A] font-extrabold text-xs sm:text-sm px-4 sm:px-5 py-3 rounded-2xl border-2 border-[#1F1D1D] shadow-button active:scale-95 transition-all cursor-pointer"
              >
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Proceed to Edit ({photos.length} Photo{photos.length > 1 ? 's' : ''}) →</span>
              </button>

              {/* Secondary: Auto 5 Ready Styles */}
              <button
                onClick={() => onSessionComplete(photos)}
                className="flex items-center gap-1.5 bg-[#FEF08A] hover:bg-[#FDE047] text-[#1F1D1D] font-extrabold text-xs sm:text-sm px-3.5 sm:px-4 py-3 rounded-2xl border-2 border-[#1F1D1D] shadow-button active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Auto Styles ({photos.length})</span>
              </button>

              {/* Manual Snap Another Photo (if less than 6) */}
              {photos.length < 6 && (
                <button
                  onClick={snapSinglePhoto}
                  disabled={isCountingDown || !cameraState.isActive}
                  className="flex items-center gap-1.5 bg-white hover:bg-gray-100 text-[#1F1D1D] font-bold text-xs sm:text-sm px-3 py-3 rounded-2xl border-2 border-[#1F1D1D] shadow-button active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
                  title="Add another photo to this strip"
                >
                  <Camera className="w-4 h-4" />
                  <span>+ Snap #{photos.length + 1}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: Quick Demo fallback */}
        <div className="order-3">
          <button
            onClick={() => onUseSamplePhotos(shotCount)}
            className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-2 rounded-xl border border-purple-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Try Sample Shots</span>
          </button>
        </div>
      </div>

      {/* Thumbnails Tray of Captured Photos */}
      <div className="bg-[#F5EFEB] p-3.5 sm:p-4 rounded-2xl border-2 border-black/10">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-black/10">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-gray-800 font-display">
              Captured Shots ({photos.length})
            </span>
            {photos.length > 0 && (
              <span className="text-[10px] sm:text-[11px] text-emerald-800 font-bold bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                ✓ Ready to frame & download!
              </span>
            )}
          </div>

          {photos.length > 0 && (
            <button
              onClick={() => (onProceedToEdit ? onProceedToEdit(photos) : onSessionComplete(photos))}
              className="text-xs font-black text-[#1F1D1D] hover:underline flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-black/15 shadow-xs"
            >
              <span>Done with {photos.length} Photo{photos.length > 1 ? 's' : ''} →</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2.5 sm:gap-3 items-center">
          {photos.map((photo, idx) => (
            <div
              key={photo.id}
              className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden border-2 border-[#1F1D1D] bg-white shadow-sm flex-shrink-0 group"
            >
              <img
                src={photo.originalDataUrl}
                alt={`Captured shot ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-1 left-1.5 bg-black/75 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                #{idx + 1}
              </div>
              <button
                onClick={() => deletePhoto(photo.id)}
                disabled={isAutoSequence}
                title="Delete photo"
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-sm opacity-90 hover:opacity-100 disabled:opacity-30 transition-opacity cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* Add more photo slot */}
          {photos.length < 6 && (
            <button
              onClick={snapSinglePhoto}
              disabled={isCountingDown || isAutoSequence || !cameraState.isActive}
              className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl border-2 border-dashed border-gray-400 hover:border-black bg-white/60 hover:bg-white flex flex-col items-center justify-center text-gray-500 hover:text-black transition-all flex-shrink-0 cursor-pointer disabled:opacity-40"
              title="Snap another photo"
            >
              <Camera className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-bold">+ Add #{photos.length + 1}</span>
            </button>
          )}

          {photos.length === 0 && (
            <div className="w-full py-4 text-center text-xs text-gray-500 font-medium">
              No photos taken yet. Click <strong>"Auto 4-Shot"</strong> for a hands-free strip, or <strong>"Snap Photo"</strong> for manual control!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
