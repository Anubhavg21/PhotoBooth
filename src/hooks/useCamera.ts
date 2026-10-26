import { useState, useRef, useCallback, useEffect } from 'react';

export interface CameraState {
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
  facingMode: 'user' | 'environment';
  hasMultipleCameras: boolean;
}

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [state, setState] = useState<CameraState>({
    isActive: false,
    isLoading: false,
    error: null,
    facingMode: 'user',
    hasMultipleCameras: false,
  });

  // Check available video devices
  const checkDevices = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === 'videoinput');
      setState((prev) => ({ ...prev, hasMultipleCameras: videoDevices.length > 1 }));
    } catch {
      // Ignore device enum error
    }
  }, []);

  // Stop current active stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setState((prev) => ({ ...prev, isActive: false, isLoading: false }));
  }, []);

  // Start camera with requested facingMode
  const startCamera = useCallback(
    async (preferredFacing: 'user' | 'environment' = state.facingMode) => {
      // Check secure context
      if (
        typeof window !== 'undefined' &&
        !window.isSecureContext &&
        window.location.hostname !== 'localhost' &&
        window.location.hostname !== '127.0.0.1'
      ) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Camera requires a secure HTTPS connection or localhost in modern browsers.',
        }));
        return;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Camera is not supported on this browser. You can still upload your photos below!',
        }));
        return;
      }

      stopCamera();
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        facingMode: preferredFacing,
      }));

      try {
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: preferredFacing,
            width: { ideal: 1280 },
            height: { ideal: 960 },
          },
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setState((prev) => ({
          ...prev,
          isActive: true,
          isLoading: false,
          error: null,
        }));

        await checkDevices();
      } catch (err: unknown) {
        const errorObj = err as Error;
        let message = 'Unable to access camera. Please allow camera permissions or upload photos.';
        if (errorObj.name === 'NotAllowedError' || errorObj.name === 'PermissionDeniedError') {
          message = 'Camera permission was denied. Please allow camera access in your browser settings or use the upload option below.';
        } else if (errorObj.name === 'NotFoundError' || errorObj.name === 'DevicesNotFoundError') {
          message = 'No camera found on this device. You can upload photos directly from your camera roll!';
        } else if (errorObj.name === 'NotReadableError' || errorObj.name === 'TrackStartError') {
          message = 'Camera is currently in use by another application. Please close other camera apps and retry.';
        }

        setState((prev) => ({
          ...prev,
          isActive: false,
          isLoading: false,
          error: message,
        }));
      }
    },
    [checkDevices, state.facingMode, stopCamera]
  );

  // Switch between front and back camera
  const switchCamera = useCallback(async () => {
    const nextFacing = state.facingMode === 'user' ? 'environment' : 'user';
    await startCamera(nextFacing);
  }, [startCamera, state.facingMode]);

  // Capture current high-res frame from video stream
  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || !state.isActive) return null;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // If front camera, mirror horizontally so preview matches mirror selfie experience
    if (state.facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', 0.95);
  }, [state.isActive, state.facingMode]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    state,
    startCamera,
    stopCamera,
    switchCamera,
    captureFrame,
  };
}
