import { CapturedPhoto, BrandingConfig, GeneratedDesign, FrameConfig, PlacedSticker, PlacedCaption, LayoutId } from '../types';

export function generateAutoMemories(
  capturedPhotos: CapturedPhoto[],
  branding: BrandingConfig
): GeneratedDesign[] {
  const count = capturedPhotos.length;
  const now = new Date();
  const dateStr = `'${String(now.getFullYear()).slice(-2)} ${String(now.getMonth() + 1).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}`;

  const displayName = branding.productName;
  const friendName = branding.showRecipientName && branding.recipientName.trim().length > 0
    ? branding.recipientName.trim()
    : null;

  // -------------------------------------------------------------------------
  // 1. OG Film Strip — Authentic disposable warmth, grain & vignette
  // -------------------------------------------------------------------------
  const ogLayout: LayoutId = count === 1 ? 'polaroid-stack' : count === 6 ? 'six-shot-strip' : 'classic-strip';
  const ogFrame: FrameConfig = {
    layoutId: ogLayout,
    backgroundColor: '#F7F4EC', // Authentic warm cream film border
    borderColor: '#1F1D1D',
    borderWidth: 0,
    borderRadius: count === 1 ? 4 : 4,
    photoGap: count === 1 ? 0 : 14,
    aspectRatio: 'strip',
    title: displayName.toUpperCase(),
    subtitle: friendName ? `For ${friendName} • Core Memories ✨` : 'Disposable 35mm • Core Memories',
    showDateStamp: true,
    dateStampText: dateStr,
    dateStampColor: '#F59E0B',
    dateStampFont: 'retro',
  };

  const ogPhotos: CapturedPhoto[] = capturedPhotos.map((p) => ({
    ...p,
    filterId: 'disposable-camera',
    filterIntensity: 85,
  }));

  // -------------------------------------------------------------------------
  // 2. Y2K Flash — Punchy direct-flash highlights, metallic lavender, chrome stars
  // -------------------------------------------------------------------------
  const y2kLayout: LayoutId = count === 1 ? 'y2k-collage' : count <= 4 ? 'y2k-collage' : 'six-shot-strip';
  const y2kFrame: FrameConfig = {
    layoutId: y2kLayout,
    backgroundColor: '#EDE9FE', // Metallic Cyber Lilac
    borderColor: '#1F1D1D',
    borderWidth: 2,
    borderRadius: 16,
    photoGap: 16,
    aspectRatio: 'strip',
    title: `${displayName.toUpperCase()} • Y2K ARCHIVE`,
    subtitle: friendName ? `Main Character: ${friendName} ⚡` : 'Main Character Energy • 2000s Pop',
    showDateStamp: true,
    dateStampText: dateStr,
    dateStampColor: '#C026D3',
    dateStampFont: 'retro',
  };

  const y2kPhotos: CapturedPhoto[] = capturedPhotos.map((p) => ({
    ...p,
    filterId: 'y2k-flash',
    filterIntensity: 90,
  }));

  const y2kStickers: PlacedSticker[] = [
    { id: 'y2k_st_1', emoji: '⭐', x: 16, y: count === 1 ? 14 : 10, scale: 1.15, rotation: -14 },
    { id: 'y2k_st_2', emoji: '⚡', x: 84, y: count === 1 ? 15 : 11, scale: 1.1, rotation: 12 },
    { id: 'y2k_st_3', emoji: '💖', x: 82, y: count === 1 ? 84 : 88, scale: 1.2, rotation: -8 },
  ];

  const y2kCaptions: PlacedCaption[] = [
    {
      id: 'y2k_cap_1',
      text: 'MAIN CHARACTER ENERGY 🕶️',
      x: 50,
      y: count === 1 ? 83 : 92,
      fontSize: 20,
      fontFamily: 'Space Grotesk',
      color: '#0F172A',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      rotation: -1,
    },
  ];

  // -------------------------------------------------------------------------
  // 3. Dreamy Pastel — Soft highlight bloom, gentle pastels & white pill borders
  // -------------------------------------------------------------------------
  const dreamyLayout: LayoutId = count === 1 ? 'modern-editorial' : count <= 4 ? 'minimal-grid' : 'six-shot-strip';
  const dreamyFrame: FrameConfig = {
    layoutId: dreamyLayout,
    backgroundColor: '#FCE7F3', // Cotton Candy Blush
    borderColor: '#FFFFFF',
    borderWidth: 3,
    borderRadius: 22,
    photoGap: 18,
    aspectRatio: 'portrait',
    title: displayName,
    subtitle: friendName ? `Good memories with ${friendName} ✨` : branding.tagline,
    showDateStamp: true,
    dateStampText: dateStr,
    dateStampColor: '#DB2777',
    dateStampFont: 'clean',
  };

  const dreamyPhotos: CapturedPhoto[] = capturedPhotos.map((p) => ({
    ...p,
    filterId: 'dreamy',
    filterIntensity: 85,
  }));

  const dreamyStickers: PlacedSticker[] = [
    { id: 'drm_st_1', emoji: '🌸', x: 18, y: count === 1 ? 16 : 12, scale: 1.1, rotation: -10 },
    { id: 'drm_st_2', emoji: '✨', x: 82, y: count === 1 ? 84 : 88, scale: 1.1, rotation: 15 },
  ];

  // -------------------------------------------------------------------------
  // 4. Meme & Fun — Comic-style tilts, washi tape, vibrant pop & funny badges
  // -------------------------------------------------------------------------
  const funLayout: LayoutId = 'scrapbook';
  const funFrame: FrameConfig = {
    layoutId: funLayout,
    backgroundColor: '#FEF08A', // Playful Butter Yellow
    borderColor: '#1F1D1D',
    borderWidth: 1,
    borderRadius: 12,
    photoGap: 20,
    aspectRatio: 'strip',
    title: displayName.toUpperCase(),
    subtitle: friendName ? `${friendName}'s Certified Chaos Club 😜` : 'Certified Chaos • Core Memories',
    showDateStamp: true,
    dateStampText: dateStr,
    dateStampColor: '#E11D48',
    dateStampFont: 'hand',
  };

  const funPhotos: CapturedPhoto[] = capturedPhotos.map((p, idx) => ({
    ...p,
    filterId: idx % 2 === 0 ? 'crisp' : 'kodak-gold',
    filterIntensity: 85,
  }));

  const funStickers: PlacedSticker[] = [
    { id: 'fun_st_1', emoji: '😜', x: 18, y: count === 1 ? 15 : 12, scale: 1.2, rotation: -12 },
    { id: 'fun_st_2', emoji: '🔥', x: 84, y: count === 1 ? 16 : 14, scale: 1.1, rotation: 10 },
    { id: 'fun_st_3', emoji: '✌️', x: 82, y: count === 1 ? 84 : 89, scale: 1.2, rotation: 8 },
  ];

  const funCaptions: PlacedCaption[] = [
    {
      id: 'fun_cap_1',
      text: 'No thoughts, head empty ✌️',
      x: 50,
      y: count === 1 ? 82 : 93,
      fontSize: 22,
      fontFamily: 'Caveat',
      color: '#1F1D1D',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      rotation: -2,
    },
  ];

  // -------------------------------------------------------------------------
  // 5. Editorial Collage — High-fashion magazine masthead, clean lines & matte tone
  // -------------------------------------------------------------------------
  const editorialLayout: LayoutId = count === 1 ? 'modern-editorial' : count === 6 ? 'contact-sheet' : 'modern-editorial';
  const editorialFrame: FrameConfig = {
    layoutId: editorialLayout,
    backgroundColor: '#F5EFEB', // Warm Editorial Linen Taupe
    borderColor: '#1F1D1D',
    borderWidth: 1,
    borderRadius: 2, // Sharp high-fashion museum corners
    photoGap: 16,
    aspectRatio: 'portrait',
    title: `${displayName.toUpperCase()} • VOLUME 01`,
    subtitle: friendName ? `PHOTOGRAPHY ARCHIVE • FEATURING ${friendName.toUpperCase()}` : 'PHOTOGRAPHY ARCHIVE • ISSUE NO. 1',
    showDateStamp: true,
    dateStampText: dateStr,
    dateStampColor: '#1F1D1D',
    dateStampFont: 'clean',
  };

  const editorialPhotos: CapturedPhoto[] = capturedPhotos.map((p) => ({
    ...p,
    filterId: 'cinematic',
    filterIntensity: 80,
  }));

  return [
    {
      id: 'og-film',
      name: 'OG Film Strip',
      badge: 'Authentic 35mm',
      description: 'Disposable-camera warmth, authentic film grain, subtle vignette, and retro cream borders.',
      frameConfig: ogFrame,
      photos: ogPhotos,
      stickers: [],
      captions: [],
    },
    {
      id: 'y2k-flash',
      name: 'Y2K Flash',
      badge: 'Direct Flash',
      description: 'Punchy contrast, vivid flash highlights, metallic lavender frame, chrome stars & stars.',
      frameConfig: y2kFrame,
      photos: y2kPhotos,
      stickers: y2kStickers,
      captions: y2kCaptions,
    },
    {
      id: 'dreamy-pastel',
      name: 'Dreamy Pastel',
      badge: 'Soft Ethereal',
      description: 'Soft highlight bloom, pastel color grading, cotton candy frame, and smooth rounded corners.',
      frameConfig: dreamyFrame,
      photos: dreamyPhotos,
      stickers: dreamyStickers,
      captions: [],
    },
    {
      id: 'meme-fun',
      name: 'Meme & Fun',
      badge: 'Playful & Chaos',
      description: 'Vibrant saturated pop, scrapbook washi tape, funny expressive stickers and playful tilts.',
      frameConfig: funFrame,
      photos: funPhotos,
      stickers: funStickers,
      captions: funCaptions,
    },
    {
      id: 'editorial',
      name: 'Editorial Collage',
      badge: 'Vogue Magazine',
      description: 'Magazine-grade masthead layout, balanced contrast, lifted matte shadows, and warm taupe.',
      frameConfig: editorialFrame,
      photos: editorialPhotos,
      stickers: [],
      captions: [],
    },
  ];
}
