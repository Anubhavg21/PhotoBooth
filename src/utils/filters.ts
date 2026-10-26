import { FilterDefinition } from '../types';

export const FILTERS: FilterDefinition[] = [
  // --- A. OG / RETRO FILTERS ---
  {
    id: 'original',
    name: 'Original',
    category: 'modern',
    description: 'Raw, unedited capture with natural lighting',
    cssFilter: () => 'none',
  },
  {
    id: 'og-instagram',
    name: 'OG Instagram',
    category: 'retro',
    description: 'Warm, saturated, nostalgic early-2010s photo feed aesthetic',
    overlay: 'vignette',
    cssFilter: (intensity) => {
      const f = intensity / 100;
      return `sepia(${0.3 * f}) saturate(${1 + 0.35 * f}) contrast(${1 + 0.15 * f}) brightness(${1 - 0.04 * f}) hue-rotate(${-10 * f}deg)`;
    },
  },
  {
    id: 'vintage-2012',
    name: '2012 Vintage',
    category: 'retro',
    description: 'Cross-processed look with golden magenta tints',
    cssFilter: (intensity) => {
      const f = intensity / 100;
      return `sepia(${0.38 * f}) contrast(${1 + 0.28 * f}) brightness(${1 + 0.06 * f}) saturate(${1 + 0.25 * f}) hue-rotate(${12 * f}deg)`;
    },
  },
  {
    id: 'disposable-camera',
    name: 'Disposable Camera',
    category: 'retro',
    description: 'Flash-heavy warm film tones with analog grain and vignette',
    overlay: 'grain-vignette',
    cssFilter: (intensity) => {
      const f = intensity / 100;
      return `sepia(${0.28 * f}) contrast(${1 + 0.22 * f}) brightness(${1 + 0.06 * f}) saturate(${1 + 0.3 * f}) hue-rotate(${-6 * f}deg)`;
    },
  },
  {
    id: 'kodak-gold',
    name: 'Kodak Gold',
    category: 'retro',
    description: 'Golden warmth, creamy skin tones, and rich analog highlights',
    cssFilter: (intensity) => {
      const f = intensity / 100;
      return `sepia(${0.32 * f}) saturate(${1 + 0.42 * f}) contrast(${1 + 0.12 * f}) brightness(${1 + 0.03 * f}) hue-rotate(${-8 * f}deg)`;
    },
  },
  {
    id: 'polaroid',
    name: 'Polaroid Instant',
    category: 'retro',
    description: 'Soft lifted blacks, creamy shadows, and instant-film contrast',
    overlay: 'vignette',
    cssFilter: (intensity) => {
      const f = intensity / 100;
      return `contrast(${1 - 0.08 * f}) brightness(${1 + 0.1 * f}) saturate(${1 - 0.18 * f}) sepia(${0.2 * f})`;
    },
  },
  {
    id: 'film-grain',
    name: 'Film Grain 35mm',
    category: 'retro',
    description: 'Textured 35mm grain with cinematic monochrome-tinged contrast',
    overlay: 'grain',
    cssFilter: (intensity) => {
      const f = intensity / 100;
      return `contrast(${1 + 0.22 * f}) brightness(${1 - 0.02 * f}) saturate(${1 - 0.12 * f})`;
    },
  },
  {
    id: 'vhs-camcorder',
    name: 'VHS Camcorder',
    category: 'retro',
    description: 'Nostalgic home video with scanline artifacts and shifted hues',
    overlay: 'vhs',
    cssFilter: (intensity) => {
      const f = intensity / 100;
      return `contrast(${1 + 0.25 * f}) saturate(${1 + 0.35 * f}) brightness(${1 + 0.04 * f}) hue-rotate(${18 * f}deg)`;
    },
  },
  {
    id: 'y2k-flash',
    name: 'Y2K Flash',
    category: 'retro',
    description: 'Party snapshot direct flash, punchy specular highlights',
    overlay: 'chrome-flash',
    cssFilter: (intensity) => {
      const f = intensity / 100;
      return `contrast(${1 + 0.5 * f}) brightness(${1 + 0.16 * f}) saturate(${1 + 0.35 * f})`;
    },
  },
  {
    id: 'sepia-memories',
    name: 'Sepia Memories',
    category: 'retro',
    description: 'Warm brown vintage tint from cherished photo albums',
    cssFilter: (intensity) => {
      const f = intensity / 100;
      return `sepia(${0.85 * f}) contrast(${1 + 0.15 * f}) brightness(${1 - 0.08 * f}) saturate(${1 + 0.2 * f})`;
    },
  },
  {
    id: 'classic-bw',
    name: 'Classic B&W',
    category: 'retro',
    description: 'Timeless silver-gelatin monochrome with dramatic depth',
    cssFilter: (intensity) => {
      const f = intensity / 100;
      return `grayscale(${1 * f}) contrast(${1 + 0.35 * f}) brightness(${1 + 0.02 * f})`;
    },
  },
  {
    id: 'faded-film',
    name: 'Faded Film',
    category: 'retro',
    description: 'Milky washed highlights, muted nostalgic pastels',
    cssFilter: (intensity) => {
      const f = intensity / 100;
      return `contrast(${1 - 0.15 * f}) brightness(${1 + 0.14 * f}) saturate(${1 - 0.32 * f}) sepia(${0.18 * f})`;
    },
  },
  {
    id: 'retro-date-stamp',
    name: 'Retro Date Stamp',
    category: 'retro',
    description: 'Subtle film grading with bright digital date overlay',
    overlay: 'date-stamp',
    cssFilter: (intensity) => {
      const f = intensity / 100;
      return `contrast(${1 + 0.1 * f}) brightness(${1 + 0.05 * f}) sepia(${0.15 * f})`;
    },
  },

  // --- B. MODERN FILTERS ---
  {
    id: 'clean',
    name: 'Clean',
    category: 'modern',
    description: 'Balanced contrast, crisp whites, and true-to-life tones',
    cssFilter: (intensity) => {
      const f = intensity / 100;
      return `contrast(${1 + 0.08 * f}) saturate(${1 + 0.08 * f}) brightness(${1 + 0.02 * f})`;
    },
  },
  {
    id: 'warm-glow',
    name: 'Warm Glow',
    category: 'modern',
    description: 'Sun-drenched warmth with soft flattering highlights',
    cssFilter: (intensity) => {
      const f = intensity / 100;
      return `sepia(${0.22 * f}) saturate(${1 + 0.2 * f}) brightness(${1 + 0.06 * f}) contrast(${1 + 0.06 * f})`;
    },
  },
  {
    id: 'cool-tones',
    name: 'Cool Tones',
    category: 'modern',
    description: 'Nordic cyan/blue coolness and modern editorial clarity',
    cssFilter: (intensity) => {
      const f = intensity / 100;
      return `contrast(${1 + 0.12 * f}) hue-rotate(${14 * f}deg) saturate(${1 - 0.08 * f}) brightness(${1 + 0.02 * f})`;
    },
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    category: 'modern',
    description: 'Restrained teal-orange grading with deep cinematic shadows',
    overlay: 'vignette',
    cssFilter: (intensity) => {
      const f = intensity / 100;
      return `contrast(${1 + 0.32 * f}) saturate(${1 + 0.15 * f}) brightness(${1 - 0.05 * f}) sepia(${0.14 * f}) hue-rotate(${-14 * f}deg)`;
    },
  },
  {
    id: 'dreamy',
    name: 'Dreamy',
    category: 'modern',
    description: 'Soft ethereal pastels and tender radiant highlight glow',
    overlay: 'dreamy-bloom',
    cssFilter: (intensity) => {
      const f = intensity / 100;
      return `brightness(${1 + 0.14 * f}) contrast(${1 - 0.1 * f}) saturate(${1 + 0.28 * f}) hue-rotate(${6 * f}deg)`;
    },
  },
  {
    id: 'soft-glow',
    name: 'Soft Glow',
    category: 'modern',
    description: 'Gentle bloom on highlights and flattering skin smoothing',
    cssFilter: (intensity) => {
      const f = intensity / 100;
      return `brightness(${1 + 0.1 * f}) contrast(${1 - 0.06 * f}) saturate(${1 + 0.12 * f})`;
    },
  },
  {
    id: 'matte',
    name: 'Velvet Matte',
    category: 'modern',
    description: 'Lifted deep blacks with contemporary magazine matte finish',
    cssFilter: (intensity) => {
      const f = intensity / 100;
      return `contrast(${1 - 0.14 * f}) brightness(${1 + 0.12 * f}) saturate(${1 - 0.12 * f})`;
    },
  },
  {
    id: 'moody',
    name: 'Moody',
    category: 'modern',
    description: 'Deep expressive shadows with controlled indie lighting',
    cssFilter: (intensity) => {
      const f = intensity / 100;
      return `contrast(${1 + 0.38 * f}) brightness(${1 - 0.16 * f}) saturate(${1 - 0.15 * f})`;
    },
  },
  {
    id: 'pastel',
    name: 'Pastel Pop',
    category: 'modern',
    description: 'Cotton candy lightness with gentle desaturated tones',
    cssFilter: (intensity) => {
      const f = intensity / 100;
      return `saturate(${1 - 0.22 * f}) brightness(${1 + 0.14 * f}) contrast(${1 - 0.1 * f})`;
    },
  },
  {
    id: 'crisp',
    name: 'Crisp & Punchy',
    category: 'modern',
    description: 'High micro-contrast, vibrant pop, and razor clarity',
    cssFilter: (intensity) => {
      const f = intensity / 100;
      return `contrast(${1 + 0.28 * f}) saturate(${1 + 0.22 * f}) brightness(${1 + 0.03 * f})`;
    },
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    category: 'modern',
    description: 'Magical 6 PM sunset light filtering through the lens',
    overlay: 'light-leak',
    cssFilter: (intensity) => {
      const f = intensity / 100;
      return `sepia(${0.38 * f}) saturate(${1 + 0.45 * f}) brightness(${1 + 0.08 * f}) contrast(${1 + 0.14 * f}) hue-rotate(${-15 * f}deg)`;
    },
  },
  {
    id: 'night-out',
    name: 'Night Out',
    category: 'modern',
    description: 'Late-night energy, punchy club lights and deep contrast',
    cssFilter: (intensity) => {
      const f = intensity / 100;
      return `contrast(${1 + 0.42 * f}) saturate(${1 + 0.35 * f}) brightness(${1 - 0.02 * f})`;
    },
  },
];

// Helper to get filter by ID
export function getFilter(id: string): FilterDefinition {
  return FILTERS.find((f) => f.id === id) || FILTERS[0];
}

// Function to draw overlays on a canvas context (grain, vignette, scanlines, light leak)
export function applyCanvasOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  overlayType: string | undefined,
  intensity: number = 80
) {
  if (!overlayType) return;
  const factor = intensity / 100;

  if (overlayType === 'grain' || overlayType === 'grain-vignette') {
    // Authentic film grain simulation
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const amount = 24 * factor;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * amount;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imageData, 0, 0);
  }

  if (overlayType === 'vignette' || overlayType === 'grain-vignette') {
    // Smooth radial lens falloff
    const gradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(width, height) * 0.35,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.72
    );
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, `rgba(18, 12, 10, ${0.48 * factor})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  } else if (overlayType === 'dreamy-bloom') {
    // Ethereal pastel radiant glow
    const bloom = ctx.createRadialGradient(
      width * 0.5,
      height * 0.35,
      20,
      width * 0.5,
      height * 0.5,
      Math.max(width, height) * 0.65
    );
    bloom.addColorStop(0, `rgba(255, 230, 240, ${0.28 * factor})`);
    bloom.addColorStop(0.5, `rgba(235, 215, 255, ${0.16 * factor})`);
    bloom.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = bloom;
    ctx.fillRect(0, 0, width, height);
  } else if (overlayType === 'chrome-flash') {
    // Direct point flash specular center wash
    const flash = ctx.createRadialGradient(
      width * 0.5,
      height * 0.3,
      10,
      width * 0.5,
      height * 0.45,
      Math.max(width, height) * 0.55
    );
    flash.addColorStop(0, `rgba(255, 255, 255, ${0.24 * factor})`);
    flash.addColorStop(0.7, `rgba(240, 245, 255, ${0.08 * factor})`);
    flash.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = flash;
    ctx.fillRect(0, 0, width, height);

    // Subtle edge dark dropoff
    const edge = ctx.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(width, height) * 0.45,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.75
    );
    edge.addColorStop(0, 'rgba(0,0,0,0)');
    edge.addColorStop(1, `rgba(10, 15, 25, ${0.35 * factor})`);
    ctx.fillStyle = edge;
    ctx.fillRect(0, 0, width, height);
  } else if (overlayType === 'vhs') {
    // Subtle horizontal scan lines
    ctx.fillStyle = `rgba(0, 0, 0, ${0.12 * factor})`;
    for (let y = 0; y < height; y += 4) {
      ctx.fillRect(0, y, width, 1.5);
    }
    // Subtle chromatic glitch edge
    ctx.fillStyle = `rgba(255, 0, 60, ${0.06 * factor})`;
    ctx.fillRect(0, 0, 4, height);
    ctx.fillStyle = `rgba(0, 220, 255, ${0.06 * factor})`;
    ctx.fillRect(width - 4, 0, 4, height);
  } else if (overlayType === 'light-leak') {
    // Golden warm light leak on the side
    const leak = ctx.createRadialGradient(
      width * 0.95,
      height * 0.1,
      10,
      width * 0.8,
      height * 0.25,
      width * 0.55
    );
    leak.addColorStop(0, `rgba(255, 175, 55, ${0.5 * factor})`);
    leak.addColorStop(0.5, `rgba(255, 80, 80, ${0.25 * factor})`);
    leak.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = leak;
    ctx.fillRect(0, 0, width, height);
  } else if (overlayType === 'date-stamp') {
    // Retro orange 7-segment digital date stamp in corner
    const now = new Date();
    const dateStr = `'${String(now.getFullYear()).slice(-2)} ${String(now.getMonth() + 1).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}`;
    ctx.save();
    ctx.font = `bold ${Math.max(18, Math.round(width * 0.045))}px "VT323", monospace`;
    ctx.fillStyle = '#FF9900';
    ctx.shadowColor = 'rgba(255, 80, 0, 0.75)';
    ctx.shadowBlur = 6;
    ctx.textAlign = 'right';
    ctx.fillText(dateStr, width - 20, height - 20);
    ctx.restore();
  }
}
