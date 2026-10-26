import { BrandingConfig } from '../types';

export const DEFAULT_BRANDING: BrandingConfig = {
  productName: 'Click & Keep',
  recipientName: 'Palak',
  tagline: 'Good pics. Weird poses. Core memories.',
  welcomeMessage: 'A little place for your favourite memories.',
  showRecipientName: true,
  accentTheme: 'butter',
};

const STORAGE_KEY = 'click_keep_branding_v1';

export function getInitialBranding(): BrandingConfig {
  let config: BrandingConfig = { ...DEFAULT_BRANDING };

  // 1. Check LocalStorage
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        config = { ...config, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to parse stored branding config', e);
    }

    // 2. Check URL query parameters (allows easy shareable customized links like ?to=Alex)
    try {
      const params = new URLSearchParams(window.location.search);
      const toParam = params.get('to') || params.get('name') || params.get('recipient');
      const titleParam = params.get('title') || params.get('product');
      const taglineParam = params.get('tagline');

      if (toParam) {
        config.recipientName = toParam;
        config.showRecipientName = true;
      }
      if (titleParam) {
        config.productName = titleParam;
      }
      if (taglineParam) {
        config.tagline = taglineParam;
      }
    } catch {
      // Ignore URL parse error
    }
  }

  return config;
}

export function saveBranding(config: BrandingConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('Failed to save branding config to localStorage', e);
  }
}

export function getAccentColor(theme: BrandingConfig['accentTheme']): {
  bg: string;
  lightBg: string;
  border: string;
  text: string;
} {
  switch (theme) {
    case 'blush':
      return { bg: '#FBCFE8', lightBg: '#FDF2F8', border: '#F472B6', text: '#831843' };
    case 'lilac':
      return { bg: '#E9D5FF', lightBg: '#FAF5FF', border: '#C084FC', text: '#581C87' };
    case 'sage':
      return { bg: '#DCFCE7', lightBg: '#F0FDF4', border: '#86EFAC', text: '#14532D' };
    case 'peach':
      return { bg: '#FED7AA', lightBg: '#FFF7ED', border: '#FB923C', text: '#7C2D12' };
    case 'butter':
    default:
      return { bg: '#FEF08A', lightBg: '#FEFCE8', border: '#FACC15', text: '#713F12' };
  }
}
