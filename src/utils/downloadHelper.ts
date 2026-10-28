/**
 * Cross-platform download and photo-saving helper.
 * 
 * Special handling for iOS Safari / WebKit:
 * 1. iOS Safari does not support saving directly to the Photos Gallery via <a download>.
 * 2. iOS Safari silently ignores or blocks <a download> with data: URIs.
 * 3. On iOS, Web Share API Level 2 (navigator.share with File[]) opens the native
 *    iOS Share Sheet, which includes the native "Save Image" / "Save 5 Images" button
 *    that writes directly to Apple Photos (Camera Roll).
 * 4. Fallback for in-app browsers (Instagram, TikTok, WhatsApp) or when Web Share is
 *    not supported: Display image with touch-and-hold instructions ("Save to Photos").
 * 5. On Desktop / Android: Use Blob URL + <a download> for direct, reliable downloads.
 */

export const isIOS = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
};

export const isMobile = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || isIOS();
};

/**
 * Synchronously convert a base64 Data URL to a binary Blob.
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Convert HTMLCanvasElement to a Blob promise.
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string = 'image/png',
  quality: number = 0.95
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          // Fallback to dataUrl conversion
          try {
            const dataUrl = canvas.toDataURL(mimeType, quality);
            resolve(dataUrlToBlob(dataUrl));
          } catch (err) {
            reject(err);
          }
        }
      },
      mimeType,
      quality
    );
  });
}

/**
 * Trigger standard browser file download via Blob URL.
 * Works reliably on Android, PC, macOS Chrome/Firefox/Safari.
 */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Revoke object URL after short delay to free memory
  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 4000);
}

export interface SaveImageResult {
  success: boolean;
  action: 'saved-photos' | 'shared' | 'downloaded' | 'modal' | 'cancelled' | 'error';
  message?: string;
}

export interface SaveSingleImageOptions {
  blob: Blob;
  dataUrl?: string;
  filename: string;
  title?: string;
  text?: string;
  onOpenFallbackModal?: (dataUrl: string, filename: string) => void;
}

/**
 * Save single image cross-platform.
 * - On iOS: uses Web Share API so the user can tap "Save Image" to Apple Photos.
 * - On PC/Android: triggers direct file download.
 */
export async function saveOrDownloadImage(
  options: SaveSingleImageOptions
): Promise<SaveImageResult> {
  const { blob, dataUrl, filename, title = 'Photo Booth Memory', text = 'Saved from Photo Booth ✨', onOpenFallbackModal } = options;

  const mimeType = blob.type || (filename.endsWith('.jpg') || filename.endsWith('.jpeg') ? 'image/jpeg' : 'image/png');
  const file = new File([blob], filename, { type: mimeType });

  // 1. On iOS: Web Share is the ONLY standard way to save to Photos Gallery
  if (isIOS()) {
    const canShare =
      typeof navigator !== 'undefined' &&
      navigator.canShare &&
      typeof navigator.share === 'function' &&
      navigator.canShare({ files: [file] });

    if (canShare) {
      try {
        await navigator.share({
          files: [file],
          title,
          text,
        });
        return {
          success: true,
          action: 'saved-photos',
          message: 'Saved / Shared successfully! 💖',
        };
      } catch (err: unknown) {
        if ((err as Error)?.name === 'AbortError') {
          // User closed share sheet without saving - not an error, do not show fake "Downloaded"
          return { success: false, action: 'cancelled' };
        }
        // If Web Share throws NotAllowedError or other, proceed to fallback
        console.warn('Web Share failed on iOS, falling back:', err);
      }
    }

    // iOS Fallback: Open touch-and-hold modal if provided
    if (onOpenFallbackModal) {
      const finalDataUrl = dataUrl || URL.createObjectURL(blob);
      onOpenFallbackModal(finalDataUrl, filename);
      return {
        success: true,
        action: 'modal',
        message: 'Touch and hold image to save to Photos!',
      };
    }

    // Fallback: Blob URL download for iOS Files app
    triggerBlobDownload(blob, filename);
    return {
      success: true,
      action: 'downloaded',
      message: 'Downloaded to Files folder!',
    };
  }

  // 2. On PC / Android / other systems: Direct download via Blob
  try {
    triggerBlobDownload(blob, filename);
    return {
      success: true,
      action: 'downloaded',
      message: `Downloaded ${filename}! ✨`,
    };
  } catch (err) {
    console.error('Download error:', err);
    return {
      success: false,
      action: 'error',
      message: 'Failed to download image',
    };
  }
}

export interface SaveMultipleImagesOptions {
  items: Array<{ blob: Blob; filename: string; dataUrl?: string }>;
  title?: string;
  onOpenFallbackModal?: (dataUrls: string[]) => void;
}

/**
 * Save multiple designs cross-platform.
 * - On iOS: attempts sharing all files at once (shows "Save 5 Images" in native share sheet).
 * - On PC/Android: downloads each with a staggered delay to avoid browser blocking.
 */
export async function saveOrDownloadMultipleImages(
  options: SaveMultipleImagesOptions
): Promise<SaveImageResult> {
  const { items, title = 'Photo Booth Memories', onOpenFallbackModal } = options;
  if (!items.length) return { success: false, action: 'error', message: 'No images to save' };

  if (isIOS()) {
    const files = items.map((item) => new File([item.blob], item.filename, { type: item.blob.type || 'image/png' }));
    const canShare =
      typeof navigator !== 'undefined' &&
      navigator.canShare &&
      typeof navigator.share === 'function' &&
      navigator.canShare({ files });

    if (canShare) {
      try {
        await navigator.share({
          files,
          title,
          text: `Here are all ${items.length} photo booth styles! 📸✨`,
        });
        return {
          success: true,
          action: 'saved-photos',
          message: `Saved all ${items.length} styles to Photos! 🎉`,
        };
      } catch (err: unknown) {
        if ((err as Error)?.name === 'AbortError') {
          return { success: false, action: 'cancelled' };
        }
        console.warn('Multi-share failed on iOS:', err);
      }
    }

    // iOS Fallback: Open modal with all images for easy touch-and-hold saving
    if (onOpenFallbackModal) {
      const urls = items.map((i) => i.dataUrl || URL.createObjectURL(i.blob));
      onOpenFallbackModal(urls);
      return {
        success: true,
        action: 'modal',
        message: 'Touch and hold images to save each one to Photos!',
      };
    }
  }

  // Desktop / Android: Download sequentially with delay
  for (let i = 0; i < items.length; i++) {
    triggerBlobDownload(items[i].blob, items[i].filename);
    if (i < items.length - 1) {
      await new Promise((r) => setTimeout(r, 600));
    }
  }

  return {
    success: true,
    action: 'downloaded',
    message: `All ${items.length} designs downloaded! 🎉`,
  };
}

