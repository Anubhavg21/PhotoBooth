import { CapturedPhoto, FrameConfig, PlacedSticker, PlacedCaption } from '../types';
import { getFilter, applyCanvasOverlay } from './filters';

// Helper to load HTMLImageElement from data URL
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

// Draw an image centered with "cover" aspect ratio and optional border radius
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number = 0
) {
  ctx.save();
  if (radius > 0) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.clip();
  }

  const imgRatio = img.width / img.height;
  const targetRatio = width / height;
  let renderWidth = width;
  let renderHeight = height;
  let offsetX = x;
  let offsetY = y;

  if (imgRatio > targetRatio) {
    // Image is wider than target
    renderWidth = height * imgRatio;
    offsetX = x - (renderWidth - width) / 2;
  } else {
    // Image is taller than target
    renderHeight = width / imgRatio;
    offsetY = y - (renderHeight - height) / 2;
  }

  ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
  ctx.restore();
}

// Draw decorative washi tape
function drawWashiTape(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  angle: number,
  color: string = 'rgba(254, 240, 138, 0.75)'
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.fillStyle = color;
  ctx.shadowColor = 'rgba(0,0,0,0.15)';
  ctx.shadowBlur = 4;
  ctx.fillRect(-w / 2, -h / 2, w, h);

  // Jagged edges
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillRect(-w / 2, -h / 2, 4, h);
  ctx.fillRect(w / 2 - 4, -h / 2, 4, h);
  ctx.restore();
}

// High resolution canvas composition engine
export async function renderCompositionToCanvas(
  photos: CapturedPhoto[],
  frameConfig: FrameConfig,
  stickers: PlacedSticker[] = [],
  captions: PlacedCaption[] = []
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const photoCount = photos.length;
  const layout = frameConfig.layoutId;

  // Compute canvas resolution based on layout
  let canvasWidth = 1000;
  let canvasHeight = 2200;

  if (photoCount === 1) {
    canvasWidth = 1000;
    canvasHeight = 1350;
  } else if (layout === 'classic-strip') {
    canvasWidth = 900;
    canvasHeight = photoCount === 6 ? 2700 : photoCount === 4 ? 2200 : 1800;
  } else if (layout === 'six-shot-strip') {
    canvasWidth = 1200;
    canvasHeight = 1800;
  } else if (layout === 'minimal-grid') {
    canvasWidth = 1400;
    canvasHeight = photoCount <= 4 ? 1500 : 1900;
  } else if (layout === 'contact-sheet') {
    canvasWidth = 1200;
    canvasHeight = 1600;
  } else if (layout === 'polaroid-stack') {
    canvasWidth = 1200;
    canvasHeight = 1600;
  } else if (layout === 'scrapbook') {
    canvasWidth = 1300;
    canvasHeight = 1650;
  } else if (layout === 'y2k-collage') {
    canvasWidth = 1200;
    canvasHeight = 1700;
  } else if (layout === 'modern-editorial') {
    canvasWidth = 1200;
    canvasHeight = 1800;
  }

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // 1. Draw Background
  ctx.fillStyle = frameConfig.backgroundColor;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Background subtle border or grain if dark/kraft
  if (frameConfig.backgroundColor === '#18181B' || frameConfig.backgroundColor === '#1F1D1D') {
    ctx.strokeStyle = '#27272A';
    ctx.lineWidth = 12;
    ctx.strokeRect(6, 6, canvasWidth - 12, canvasHeight - 12);
  }

  // Load all photo images
  const loadedImages = await Promise.all(
    photos.map(async (photo) => {
      const src = photo.filteredDataUrl || photo.originalDataUrl;
      const img = await loadImage(src);
      return { photo, img };
    })
  );

  // 2. Render Layout Specific photo positions
  if (layout === 'classic-strip') {
    const padX = 70;
    const headerH = 140;
    const footerH = 220;
    const availableH = canvasHeight - headerH - footerH;
    const gap = frameConfig.photoGap;
    const photoW = canvasWidth - padX * 2;
    const photoH = (availableH - gap * (photoCount - 1)) / photoCount;

    // Header Logo/Title
    ctx.fillStyle = frameConfig.backgroundColor === '#18181B' ? '#F4F4F5' : '#1F1D1D';
    ctx.font = '800 34px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(frameConfig.title.toUpperCase(), canvasWidth / 2, 75);

    ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = frameConfig.backgroundColor === '#18181B' ? '#A1A1AA' : '#6B7280';
    ctx.fillText(frameConfig.subtitle, canvasWidth / 2, 108);

    // Photos
    loadedImages.forEach(({ photo, img }, index) => {
      const py = headerH + index * (photoH + gap);

      // Render photo with filter applied onto temporary offscreen
      renderFilteredPhotoToCanvas(
        ctx,
        img,
        padX,
        py,
        photoW,
        photoH,
        photo,
        frameConfig.borderRadius,
        frameConfig.borderColor,
        frameConfig.borderWidth
      );
    });

    // Footer Branding & Date
    const footerY = canvasHeight - footerH + 60;
    ctx.fillStyle = frameConfig.backgroundColor === '#18181B' ? '#E4E4E7' : '#1F1D1D';
    ctx.font = 'bold 24px "Caveat", cursive';
    ctx.fillText(`${frameConfig.title} — Core Memories ✨`, canvasWidth / 2, footerY);

    if (frameConfig.showDateStamp) {
      ctx.font = frameConfig.dateStampFont === 'retro' ? 'bold 26px "VT323", monospace' : '18px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = frameConfig.dateStampColor || '#F59E0B';
      ctx.fillText(frameConfig.dateStampText, canvasWidth / 2, footerY + 45);
    }
  } else if (layout === 'six-shot-strip' || layout === 'minimal-grid') {
    // 2-column or 3-column clean grid
    const cols = photoCount === 1 ? 1 : photoCount > 4 ? 2 : 2;
    const rows = Math.ceil(photoCount / cols);
    const pad = photoCount === 1 ? 120 : 65;
    const topBar = 130;
    const bottomBar = 150;
    const gap = frameConfig.photoGap;

    const cellW = (canvasWidth - pad * 2 - gap * (cols - 1)) / cols;
    const cellH = (canvasHeight - topBar - bottomBar - gap * (rows - 1)) / rows;

    // Header Title
    ctx.fillStyle = frameConfig.backgroundColor === '#18181B' ? '#FFFFFF' : '#18181B';
    ctx.font = '800 36px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(frameConfig.title.toUpperCase(), canvasWidth / 2, 72);

    ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = frameConfig.backgroundColor === '#18181B' ? '#9CA3AF' : '#4B5563';
    ctx.fillText(frameConfig.subtitle, canvasWidth / 2, 104);

    loadedImages.forEach(({ photo, img }, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const px = pad + col * (cellW + gap);
      const py = topBar + row * (cellH + gap);

      renderFilteredPhotoToCanvas(
        ctx,
        img,
        px,
        py,
        cellW,
        cellH,
        photo,
        frameConfig.borderRadius,
        frameConfig.borderColor,
        frameConfig.borderWidth
      );
    });

    // Bottom Date
    if (frameConfig.showDateStamp) {
      ctx.fillStyle = frameConfig.dateStampColor || '#E11D48';
      ctx.font = frameConfig.dateStampFont === 'retro' ? 'bold 28px "VT323", monospace' : '20px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(frameConfig.dateStampText, canvasWidth / 2, canvasHeight - 55);
    }
  } else if (layout === 'contact-sheet') {
    // Retro film contact sheet: black borders, sprocket dots & frame labels
    ctx.fillStyle = '#09090B';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Film header
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 26px "Space Grotesk", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`KODAK SAFETY FILM 400 • ${frameConfig.title.toUpperCase()}`, 60, 60);

    const cols = photoCount === 1 ? 1 : photoCount > 4 ? 3 : 2;
    const rows = Math.ceil(photoCount / cols);
    const padX = photoCount === 1 ? 100 : 60;
    const topY = 100;
    const gap = 30;
    const cellW = (canvasWidth - padX * 2 - gap * (cols - 1)) / cols;
    const cellH = (canvasHeight - topY - 140 - gap * (rows - 1)) / rows;

    loadedImages.forEach(({ photo, img }, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const px = padX + col * (cellW + gap);
      const py = topY + row * (cellH + gap);

      // Photo frame number
      ctx.fillStyle = '#F59E0B';
      ctx.font = '16px "VT323", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`▶ ${String(idx + 1).padStart(2, '0')}A`, px, py - 8);

      renderFilteredPhotoToCanvas(
        ctx,
        img,
        px,
        py,
        cellW,
        cellH,
        photo,
        4,
        '#27272A',
        2
      );
    });

    // Bottom film strip markings
    ctx.fillStyle = '#F59E0B';
    ctx.font = '20px "VT323", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`• • • EXP ${photoCount} / ${photoCount} • • • ${frameConfig.title.toUpperCase()} • • •`, canvasWidth / 2, canvasHeight - 45);
  } else if (layout === 'polaroid-stack' || layout === 'scrapbook') {
    // Tilted instant cards with washi tape & handwritten stickers
    const isScrapbook = layout === 'scrapbook';
    const topY = 120;
    ctx.fillStyle = frameConfig.backgroundColor === '#18181B' ? '#F4F4F5' : '#1F1D1D';
    ctx.font = '800 36px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(frameConfig.title.toUpperCase(), canvasWidth / 2, 70);

    const tilts = [-4, 3.5, -2.5, 4, -3, 2];
    const tapeColors = ['rgba(254, 240, 138, 0.8)', 'rgba(251, 207, 232, 0.8)', 'rgba(233, 213, 255, 0.8)', 'rgba(167, 243, 208, 0.8)'];

    // Place photos as Polaroid cards
    const cols = photoCount === 1 ? 1 : photoCount <= 4 ? 2 : 3;
    const rows = Math.ceil(photoCount / cols);
    const padX = photoCount === 1 ? 130 : 70;
    const gap = 45;
    const cardW = (canvasWidth - padX * 2 - gap * (cols - 1)) / cols;
    const cardH = cardW * (photoCount === 1 ? 1.16 : 1.25);

    loadedImages.forEach(({ photo, img }, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const cx = padX + col * (cardW + gap) + cardW / 2;
      const cy = topY + row * (cardH + gap) + cardH / 2;
      const tilt = isScrapbook ? tilts[idx % tilts.length] : (idx % 2 === 0 ? -1.5 : 1.5);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((tilt * Math.PI) / 180);

      // Card shadow
      ctx.shadowColor = 'rgba(0,0,0,0.18)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 8;

      // Card white body
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-cardW / 2, -cardH / 2, cardW, cardH);
      ctx.shadowColor = 'transparent';

      // Inner photo
      const innerMargin = 16;
      const innerW = cardW - innerMargin * 2;
      const innerH = cardH - innerMargin - 65;
      const innerX = -cardW / 2 + innerMargin;
      const innerY = -cardH / 2 + innerMargin;

      // Draw photo
      renderFilteredPhotoToCanvas(
        ctx,
        img,
        innerX,
        innerY,
        innerW,
        innerH,
        photo,
        2,
        '#E4E4E7',
        1
      );

      // Polaroid bottom caption
      ctx.fillStyle = '#27272A';
      ctx.font = 'bold 22px "Caveat", cursive';
      ctx.textAlign = 'center';
      const captionsList = ['Core Memory #', 'Strike a Pose #', 'Certified Chaos #', 'Main Character #', 'Besties #', 'Sweet Times #'];
      ctx.fillText(`${captionsList[idx % captionsList.length]}${idx + 1}`, 0, cardH / 2 - 24);

      // Washi tape on corners if scrapbook
      if (isScrapbook) {
        drawWashiTape(ctx, -cardW / 2 + 10, -cardH / 2 + 5, 60, 22, -15, tapeColors[idx % tapeColors.length]);
      }

      ctx.restore();
    });

    // Bottom signature
    ctx.font = 'bold 24px "Caveat", cursive';
    ctx.fillStyle = frameConfig.backgroundColor === '#18181B' ? '#E4E4E7' : '#1F1D1D';
    ctx.textAlign = 'center';
    ctx.fillText(frameConfig.subtitle, canvasWidth / 2, canvasHeight - 45);
  } else {
    // y2k-collage or modern-editorial
    const pad = photoCount === 1 ? 120 : 80;
    const topBar = 150;
    const cols = photoCount === 1 ? 1 : photoCount > 4 ? 3 : 2;
    const rows = Math.ceil(photoCount / cols);
    const gap = 35;
    const cellW = (canvasWidth - pad * 2 - gap * (cols - 1)) / cols;
    const cellH = (canvasHeight - topBar - 150 - gap * (rows - 1)) / rows;

    // Title
    ctx.fillStyle = frameConfig.backgroundColor === '#18181B' ? '#FFFFFF' : '#18181B';
    ctx.font = layout === 'y2k-collage' ? '800 42px "Space Grotesk", sans-serif' : 'italic 38px "Fraunces", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(frameConfig.title, canvasWidth / 2, 85);

    ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = frameConfig.backgroundColor === '#18181B' ? '#A1A1AA' : '#6B7280';
    ctx.fillText(frameConfig.subtitle, canvasWidth / 2, 120);

    loadedImages.forEach(({ photo, img }, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const px = pad + col * (cellW + gap);
      const py = topBar + row * (cellH + gap);

      renderFilteredPhotoToCanvas(
        ctx,
        img,
        px,
        py,
        cellW,
        cellH,
        photo,
        frameConfig.borderRadius,
        frameConfig.borderColor,
        frameConfig.borderWidth
      );
    });

    if (frameConfig.showDateStamp) {
      ctx.fillStyle = frameConfig.dateStampColor || '#E11D48';
      ctx.font = '22px "VT323", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(frameConfig.dateStampText, canvasWidth / 2, canvasHeight - 50);
    }
  }

  // 3. Render User Placed Stickers
  stickers.forEach((st) => {
    const sx = (st.x / 100) * canvasWidth;
    const sy = (st.y / 100) * canvasHeight;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate((st.rotation * Math.PI) / 180);
    ctx.scale(st.scale, st.scale);

    if (st.emoji) {
      ctx.font = '64px "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(st.emoji, 0, 0);
    }
    ctx.restore();
  });

  // 4. Render User Placed Captions
  captions.forEach((cap) => {
    const cx = (cap.x / 100) * canvasWidth;
    const cy = (cap.y / 100) * canvasHeight;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((cap.rotation * Math.PI) / 180);

    ctx.font = `bold ${cap.fontSize * 1.5}px "${cap.fontFamily}", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (cap.backgroundColor) {
      const metrics = ctx.measureText(cap.text);
      const paddingX = 20;
      const paddingY = 12;
      ctx.fillStyle = cap.backgroundColor;
      ctx.beginPath();
      ctx.roundRect(
        -metrics.width / 2 - paddingX,
        -cap.fontSize - paddingY,
        metrics.width + paddingX * 2,
        cap.fontSize * 2 + paddingY * 2,
        8
      );
      ctx.fill();
    }

    ctx.fillStyle = cap.color;
    ctx.fillText(cap.text, 0, 0);
    ctx.restore();
  });

  return canvas;
}

// Render individual filtered photo with borders and overlays
function renderFilteredPhotoToCanvas(
  targetCtx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  photo: CapturedPhoto,
  borderRadius: number,
  borderColor: string,
  borderWidth: number
) {
  // Create offscreen canvas for exact filter processing
  const offscreen = document.createElement('canvas');
  offscreen.width = w;
  offscreen.height = h;
  const offCtx = offscreen.getContext('2d');
  if (!offCtx) return;

  const filterDef = getFilter(photo.filterId);
  const filterString = filterDef.cssFilter(photo.filterIntensity ?? 80);

  // Apply CSS filter if not 'none'
  if (filterString && filterString !== 'none') {
    offCtx.filter = filterString;
  }

  // Draw image cover into offscreen
  drawImageCover(offCtx, img, 0, 0, w, h, 0);

  // Reset filter for subsequent overlay passes
  offCtx.filter = 'none';

  // Apply visual overlays (grain, vignette, VHS, light leak, date stamp)
  if (filterDef.overlay) {
    applyCanvasOverlay(offCtx, w, h, filterDef.overlay, photo.filterIntensity ?? 80);
  }

  // Draw result to target canvas with border radius & border stroke
  targetCtx.save();
  if (borderRadius > 0) {
    targetCtx.beginPath();
    targetCtx.roundRect(x, y, w, h, borderRadius);
    targetCtx.clip();
  }

  targetCtx.drawImage(offscreen, x, y);

  if (borderWidth > 0 && borderColor) {
    targetCtx.strokeStyle = borderColor;
    targetCtx.lineWidth = borderWidth * 2; // Clip clips half
    targetCtx.beginPath();
    targetCtx.roundRect(x, y, w, h, borderRadius);
    targetCtx.stroke();
  }
  targetCtx.restore();
}
