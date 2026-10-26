export type Step = 'welcome' | 'camera' | 'auto-results' | 'review' | 'filter' | 'frame' | 'stickers' | 'export';

export type ShotCount = 1 | 3 | 4 | 6;
export type CountdownDuration = 1 | 3 | 5 | 10;

export interface CapturedPhoto {
  id: string;
  originalDataUrl: string;
  filteredDataUrl?: string;
  filterId: string;
  filterIntensity: number; // 0 to 100
  timestamp: number;
}

export type FilterCategory = 'retro' | 'modern';

export interface FilterDefinition {
  id: string;
  name: string;
  category: FilterCategory;
  description: string;
  cssFilter: (intensity: number) => string;
  overlay?: 'grain' | 'vhs' | 'date-stamp' | 'vignette' | 'light-leak' | 'grain-vignette' | 'chrome-flash' | 'dreamy-bloom';
  tintColor?: string;
  contrast?: number;
  brightness?: number;
  saturate?: number;
  sepia?: number;
  hueRotate?: number;
}

export type LayoutId = 
  | 'classic-strip'      // Vertical strip (1, 3 or 4)
  | 'six-shot-strip'     // 2 columns or 6 vertical
  | 'polaroid-stack'     // Instant polaroid cards
  | 'scrapbook'          // Tilted photos with tape & stickers
  | 'minimal-grid'       // Clean modern grid
  | 'contact-sheet'      // Retro film sheet with frame numbers
  | 'y2k-collage'        // Playful chunky border
  | 'modern-editorial';  // Editorial spacing & typography

export interface FrameConfig {
  layoutId: LayoutId;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number; // in px
  borderRadius: number; // in px
  photoGap: number; // in px
  aspectRatio: 'strip' | 'square' | 'portrait';
  title: string;
  subtitle: string;
  showDateStamp: boolean;
  dateStampText: string;
  dateStampColor: string;
  dateStampFont: 'retro' | 'hand' | 'clean';
}

export interface PlacedSticker {
  id: string;
  emoji?: string;
  svgType?: string;
  x: number; // Percentage 0 - 100
  y: number; // Percentage 0 - 100
  scale: number;
  rotation: number; // In degrees
}

export interface PlacedCaption {
  id: string;
  text: string;
  x: number; // Percentage 0 - 100
  y: number; // Percentage 0 - 100
  fontSize: number; // in pt
  fontFamily: 'Caveat' | 'Space Grotesk' | 'Fraunces' | 'VT323';
  color: string;
  backgroundColor?: string;
  rotation: number;
}

export interface BrandingConfig {
  productName: string;
  recipientName: string;
  tagline: string;
  welcomeMessage: string;
  showRecipientName: boolean;
  accentTheme: 'butter' | 'blush' | 'lilac' | 'sage' | 'peach';
}

export type AutoDesignId = 'og-film' | 'y2k-flash' | 'dreamy-pastel' | 'meme-fun' | 'editorial';

export interface GeneratedDesign {
  id: AutoDesignId;
  name: string;
  badge: string;
  description: string;
  frameConfig: FrameConfig;
  photos: CapturedPhoto[];
  stickers: PlacedSticker[];
  captions: PlacedCaption[];
}
