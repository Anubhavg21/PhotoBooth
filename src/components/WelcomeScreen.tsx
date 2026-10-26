import React, { useState, useEffect } from 'react';
import { Camera, Sparkles, Wand2, ArrowRight, Download, Film, Settings } from 'lucide-react';
import { BrandingConfig } from '../types';
import { createSamplePhoto } from '../utils/sampleImages';
import { getAccentColor } from '../utils/brandingConfig';

interface WelcomeScreenProps {
  branding: BrandingConfig;
  onStartBooth: () => void;
  onOpenExplore: () => void;
  onUseSamplePhotos: () => void;
  onOpenPersonalize: () => void;
}

const ROTATING_AFFIRMATIONS = [
  "You're doing better than you think 💛",
  "Zero pressure to look camera-ready today 🫧",
  "Be as goofy as you want — no judgment here 🌸",
  "Even a 1% good day counts as a win ✨",
  "Take a slow breath, you're doing great 🌿",
  "Bad days don't cancel out good moments 🎈",
];

type MoodKey = 'smile' | 'good' | 'create';

const MOOD_CONFIG: Record<MoodKey, { label: string; emoji: string; color: string; messages: string[] }> = {
  smile: {
    label: 'Need a smile',
    emoji: '🫶',
    color: '#FBCFE8',
    messages: [
      "You're more liked than your brain tells you 🌸",
      "Someone out there is thinking of you right now 💌",
      "Even clouds take breaks — so can you ☁️",
      "A bad chapter ≠ a bad story, promise 📖",
      "You deserve softness on your hard days 🧸",
    ],
  },
  good: {
    label: 'Feeling good',
    emoji: '✨',
    color: '#FEF08A',
    messages: [
      "Yesss, ride this wave — you've earned it 🏄‍♀️",
      "Good energy is contagious, keep spreading it 💫",
      "This is the version of you future-you will thank 🪞",
      "Protect this peace like it's your wifi password 🔐",
      "Main character energy detected 🕶️",
    ],
  },
  create: {
    label: 'Ready to create',
    emoji: '🎨',
    color: '#E9D5FF',
    messages: [
      "The camera is ready when you are 📸",
      "Imperfect photos > no photos, always 🎞️",
      "Your vibe is the best filter tbh ✌️",
      "Make something silly, make something real 🌈",
      "Future you will love looking back at this 💛",
    ],
  },
};

const MOOD_KEYS: MoodKey[] = ['smile', 'good', 'create'];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  branding,
  onStartBooth,
  onOpenExplore,
  onUseSamplePhotos,
  onOpenPersonalize,
}) => {
  // Interactive sample photo strip preview on the welcome screen
  const [activeFilterPreview, setActiveFilterPreview] = useState<'disposable' | 'normal' | 'bw' | 'y2k'>('disposable');
  const [currentAffirmationIndex, setCurrentAffirmationIndex] = useState(0);
  const [isAffirmationFading, setIsAffirmationFading] = useState(false);

  // Happiness Corner mood state
  const [selectedMood, setSelectedMood] = useState<MoodKey | null>(null);
  const [moodMsgIndex, setMoodMsgIndex] = useState(0);
  const [isMoodMsgFading, setIsMoodMsgFading] = useState(false);
  const [moodPopKey, setMoodPopKey] = useState(0);

  const accent = getAccentColor(branding.accentTheme);

  // Rotate positive messages smoothly (general ticker)
  useEffect(() => {
    const timer = setInterval(() => {
      setIsAffirmationFading(true);
      setTimeout(() => {
        setCurrentAffirmationIndex((prev) => (prev + 1) % ROTATING_AFFIRMATIONS.length);
        setIsAffirmationFading(false);
      }, 250);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  // Rotate mood-specific messages when a mood is selected
  useEffect(() => {
    if (!selectedMood) return;
    setMoodMsgIndex(0);
    const timer = setInterval(() => {
      setIsMoodMsgFading(true);
      setTimeout(() => {
        setMoodMsgIndex((prev) => (prev + 1) % MOOD_CONFIG[selectedMood].messages.length);
        setIsMoodMsgFading(false);
      }, 220);
    }, 4200);
    return () => clearInterval(timer);
  }, [selectedMood]);

  const handleMoodSelect = (mood: MoodKey) => {
    if (selectedMood === mood) {
      setSelectedMood(null);
      return;
    }
    setSelectedMood(mood);
    setMoodMsgIndex(0);
    setIsMoodMsgFading(false);
    setMoodPopKey((k) => k + 1);
  };

  // Interactive sample shots for the stylish Gen-Z collage
  const sample1 = createSamplePhoto(0, "Warmup Smile", "Strike a pose!");
  const sample2 = createSamplePhoto(1, "Certified Chaos", "No perfect poses allowed");
  const sample3 = createSamplePhoto(2, "Core Memory", "Good pics & timeless vibes");

  const filterStyles = {
    normal: 'none',
    disposable: 'contrast(1.2) brightness(1.08) saturate(1.3) sepia(0.25)',
    bw: 'grayscale(1) contrast(1.35)',
    y2k: 'contrast(1.4) brightness(1.15) saturate(1.2)',
  };

  const recipientName = branding.showRecipientName && branding.recipientName.trim().length > 0
    ? branding.recipientName.trim()
    : 'Palak';

  return (
    <div className="relative min-h-[calc(100vh-65px)] flex flex-col justify-between p-3.5 sm:p-6 lg:p-8 bg-grain overflow-x-hidden overflow-y-visible">
      {/* Soft Pastel Mesh Gradient Blobs in the Background (Responsively Sized) */}
      <div className="absolute top-[-5%] left-[-10%] sm:left-[-4%] w-[280px] xs:w-[360px] sm:w-[520px] h-[280px] xs:h-[360px] sm:h-[520px] rounded-full bg-[#E9D5FF]/45 blur-[60px] sm:blur-[85px] pointer-events-none -z-10" />
      <div className="absolute top-[20%] right-[-10%] sm:right-[-6%] w-[260px] xs:w-[340px] sm:w-[480px] h-[260px] xs:h-[340px] sm:h-[480px] rounded-full bg-[#FED7AA]/50 blur-[65px] sm:blur-[90px] pointer-events-none -z-10" />
      <div className="absolute top-[48%] left-[20%] sm:left-[28%] w-[220px] xs:w-[300px] sm:w-[440px] h-[220px] xs:h-[300px] sm:h-[440px] rounded-full bg-[#FEF08A]/45 blur-[55px] sm:blur-[75px] pointer-events-none -z-10" />

      {/* Floating Doodles & Stickers with playful animations */}
      {/* Top Left Doodle Star */}
      <div className="absolute top-8 left-3 sm:left-12 select-none pointer-events-none z-0 animate-hero-twinkle">
        <svg className="w-6 h-6 sm:w-9 sm:h-9 text-amber-400 drop-shadow-sm" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L14.7 9.3L24 12L14.7 14.7L12 24L9.3 14.7L0 12L9.3 9.3L12 0Z" />
        </svg>
      </div>

      {/* Doodle Squiggle Top Right */}
      <div className="absolute top-14 right-4 sm:right-24 select-none pointer-events-none z-0 hidden sm:block rotate-12 opacity-80 animate-hero-wiggle">
        <svg width="68" height="24" viewBox="0 0 68 24" fill="none" stroke="#F472B6" strokeWidth="3" strokeLinecap="round">
          <path d="M2 12C8 4 14 20 20 12C26 4 32 20 38 12C44 4 50 20 56 12C60 6 64 8 66 12" />
        </svg>
      </div>

      {/* Floating Sticker Flower */}
      <div className="absolute top-28 left-2 sm:left-8 select-none pointer-events-none z-0 opacity-80 animate-hero-float text-xl sm:text-3xl">
        🌸
      </div>

      {/* Sparkle Near Bottom Left */}
      <div className="absolute bottom-28 left-3 sm:left-14 select-none pointer-events-none z-0 opacity-80 animate-hero-twinkle text-xl sm:text-3xl">
        ✨
      </div>

      {/* Floating Cherry / Daisy Right Side */}
      <div className="absolute bottom-36 right-4 sm:right-16 select-none pointer-events-none z-0 opacity-85 rotate-12 animate-hero-float-reverse text-xl sm:text-3xl">
        🍒
      </div>

      {/* Main Hero Container */}
      <div className="max-w-6xl mx-auto w-full my-auto py-2 sm:py-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Playful Editorial Typography, Uplifting Warm Messaging & CTAs */}
          <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-5 text-left">
            
            {/* ═══ Little Happiness Corner ═══ */}
            <div className="flex flex-col gap-2 sm:gap-2.5">
              {/* Row 1: Corner Label + Personalize */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                {/* Happiness Corner label with orbiting doodles */}
                <div className="relative inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 rounded-full bg-white/95 backdrop-blur-md border-2 border-[#1F1D1D] shadow-button">
                  {/* Tiny orbiting star doodle */}
                  <span className="absolute -top-1 -left-1 text-[10px] animate-hc-orbit select-none pointer-events-none">⭐</span>
                  <span className="absolute -bottom-1 -right-1 text-[10px] animate-hc-orbit select-none pointer-events-none" style={{ animationDelay: '-6s' }}>✦</span>

                  <span className="flex h-2 w-2 relative flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <span className="text-xs sm:text-sm font-black text-[#1F1D1D] font-display tracking-tight">
                    Little Happiness Corner
                  </span>
                  <span className="text-sm animate-hero-wiggle">🌻</span>
                </div>

                {/* Personalize Button */}
                <button
                  onClick={onOpenPersonalize}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#1F1D1D]/30 bg-[#FAF5FF] hover:bg-[#F3E8FF] text-xs font-extrabold text-[#1F1D1D] shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer flex-shrink-0"
                  title="Personalize name, title & theme colors"
                >
                  <Settings className="w-3.5 h-3.5 text-purple-700" />
                  <span>Personalize</span>
                </button>
              </div>

              {/* Row 2: Mood Selector Tabs + Rotating Message */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {MOOD_KEYS.map((mood) => {
                  const cfg = MOOD_CONFIG[mood];
                  const isActive = selectedMood === mood;
                  return (
                    <button
                      key={mood}
                      onClick={() => handleMoodSelect(mood)}
                      className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all cursor-pointer border-2 active:scale-95 ${
                        isActive
                          ? 'border-[#1F1D1D] shadow-button scale-[1.03]'
                          : 'border-[#1F1D1D]/20 hover:border-[#1F1D1D]/50 bg-white/90'
                      }`}
                      style={isActive ? { backgroundColor: cfg.color } : undefined}
                    >
                      <span className="text-sm leading-none">{cfg.emoji}</span>
                      <span className="text-[#1F1D1D]">{cfg.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Row 3: Active mood message OR default rotating affirmation */}
              <div className="min-h-[28px] sm:min-h-[32px] flex items-center">
                {selectedMood ? (
                  <div
                    key={`mood-msg-${moodPopKey}`}
                    className="animate-hc-pop inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#1F1D1D]/20 bg-white/80 backdrop-blur-sm max-w-[calc(100vw-60px)] sm:max-w-none"
                    style={{ borderLeftColor: MOOD_CONFIG[selectedMood].color, borderLeftWidth: 3 }}
                  >
                    <span className="text-base leading-none flex-shrink-0">{MOOD_CONFIG[selectedMood].emoji}</span>
                    <span
                      className={`text-xs sm:text-sm font-semibold text-[#374151] font-display transition-opacity duration-200 ${
                        isMoodMsgFading ? 'opacity-0' : 'opacity-100'
                      }`}
                    >
                      {MOOD_CONFIG[selectedMood].messages[moodMsgIndex]}
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/60 backdrop-blur-sm border border-[#1F1D1D]/10 max-w-[calc(100vw-60px)] sm:max-w-none">
                    <span className="text-amber-500 text-sm flex-shrink-0">💛</span>
                    <span
                      className={`text-xs sm:text-sm font-medium text-[#52525B] italic transition-opacity duration-200 truncate ${
                        isAffirmationFading ? 'opacity-0' : 'opacity-100'
                      }`}
                    >
                      {ROTATING_AFFIRMATIONS[currentAffirmationIndex]}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Playful Editorial Typography Headline */}
            <div className="space-y-1">
              {/* Greeting Tag */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-serif italic text-2xl xs:text-3xl sm:text-4xl lg:text-[2.6rem] text-[#1F1D1D]/90 font-medium tracking-tight">
                  Hey {recipientName},
                </span>
                <span className="inline-block animate-hero-wiggle text-xl sm:text-2xl">👋</span>
              </div>

              {/* Main Punchy Editorial Headline */}
              <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-[3.5rem] font-black tracking-tight text-[#1F1D1D] font-display leading-[1.1] sm:leading-[1.08]">
                your little{' '}
                <span className="relative inline-block whitespace-nowrap">
                  <span className="relative z-10">happy place</span>
                  <span
                    style={{ backgroundColor: accent.bg }}
                    className="absolute bottom-0.5 sm:-bottom-1 left-0 right-0 h-3.5 sm:h-4 -rotate-1 z-0 rounded-sm"
                  />
                </span>{' '}
                is here ✨
              </h1>
            </div>

            {/* Warm, Uplifting Friend-to-Friend Copy */}
            <p className="text-sm xs:text-base sm:text-lg text-[#374151] font-medium leading-relaxed max-w-xl">
              Bad day? Weird day? Good day? There's a little room for all of them here. Take a breath, strike a pose, and make a memory.
            </p>

            {/* Gen-Z Sticker-Style Micro Badges */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-0.5">
              <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 bg-white/95 border border-[#1F1D1D]/25 rounded-full text-[11px] sm:text-xs font-bold text-[#1F1D1D] shadow-xs">
                <span className="text-amber-500">⚡</span> Instant 3-photo strips
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 bg-[#FBCFE8]/70 border border-[#1F1D1D]/25 rounded-full text-[11px] sm:text-xs font-bold text-[#1F1D1D] shadow-xs">
                <span>🎞️</span> 24 vintage & flash filters
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 bg-[#FEF08A]/75 border border-[#1F1D1D]/25 rounded-full text-[11px] sm:text-xs font-bold text-[#1F1D1D] shadow-xs">
                <span>🔒</span> 100% private on your device
              </span>
            </div>

            {/* Prominent CTA & Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1.5">
              {/* Primary CTA: "Let's make something fun" */}
              <button
                onClick={onStartBooth}
                className="group w-full sm:w-auto flex items-center justify-center gap-3 bg-[#1F1D1D] hover:bg-[#2D2A2A] text-[#FEF08A] font-extrabold text-base sm:text-lg px-7 sm:px-8 py-3.5 sm:py-4 rounded-2xl border-2 border-[#1F1D1D] shadow-button active:scale-95 transition-all cursor-pointer"
              >
                <Camera className="w-5 h-5 text-[#FEF08A] group-hover:rotate-12 transition-transform duration-200" />
                <span>Let's make something fun</span>
                <ArrowRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Secondary CTA: Explore Filters */}
              <button
                onClick={onOpenExplore}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/95 hover:bg-[#F5EFEB] text-[#1F1D1D] font-bold text-sm sm:text-base px-5 py-3 sm:py-4 rounded-2xl border-2 border-[#1F1D1D] shadow-button active:scale-95 transition-all cursor-pointer"
              >
                <Wand2 className="w-4 h-4 text-purple-600" />
                <span>Explore All Filters</span>
              </button>
            </div>

            {/* Jump into demo with sample photos link */}
            <div className="pt-0.5">
              <button
                onClick={onUseSamplePhotos}
                className="group text-xs sm:text-sm text-[#4B5563] hover:text-[#1F1D1D] underline font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 group-hover:scale-125 transition-transform" />
                <span>Or jump straight into ready-made designs with sample photos</span>
              </button>
            </div>
          </div>

          {/* Right Column: Stylish Gen-Z Photo Collage with Subtle Motion (Mobile-First Centered) */}
          <div className="lg:col-span-5 flex flex-col items-center w-full">
            {/* Collage Canvas */}
            <div className="relative group w-full max-w-[310px] xs:max-w-[340px] sm:max-w-[370px] mx-auto flex justify-center pt-3 pb-3">
              
              {/* Floating Companion Polaroid Card (Tilted behind / beside with gentle reverse float) */}
              <div className="absolute left-1 xs:left-2 sm:-left-5 top-7 sm:top-12 z-10 w-[125px] xs:w-[145px] sm:w-[170px] bg-white p-2 sm:p-2.5 pb-3 sm:pb-3.5 rounded-sm border-2 border-[#1F1D1D] shadow-polaroid -rotate-6 hover:rotate-0 transition-transform duration-300 animate-hero-float-reverse">
                {/* Washi Tape Accent */}
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-14 sm:w-16 h-4 sm:h-5 bg-[#FBCFE8] border border-black/10 rotate-3 shadow-xs flex items-center justify-center">
                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-black/60">CANDID</span>
                </div>

                <div className="relative overflow-hidden aspect-square rounded-xs bg-gray-100 border border-gray-200">
                  <img
                    src={sample1}
                    alt="Candid warmup"
                    className="w-full h-full object-cover transition-all duration-300"
                    style={{ filter: filterStyles[activeFilterPreview] }}
                  />
                  <span className="absolute bottom-0.5 right-1 text-[7px] sm:text-[8px] font-mono font-bold text-amber-400 drop-shadow">
                    '26 10 26
                  </span>
                </div>

                <div className="text-center pt-1.5 sm:pt-2">
                  <p className="font-handwriting text-sm sm:text-base font-bold text-[#1F1D1D] leading-none">
                    warmup smile ✌️
                  </p>
                  <p className="text-[7px] sm:text-[8px] font-mono text-gray-400 uppercase tracking-widest mt-0.5">
                    100% UNFILTERED
                  </p>
                </div>
              </div>

              {/* Main Polaroid Photo Strip (Tilted right with gentle float) */}
              <div className="relative z-20 w-[195px] xs:w-[225px] sm:w-[260px] ml-12 xs:ml-16 sm:ml-20 bg-white p-2.5 sm:p-3 pt-4 sm:pt-5 pb-4 sm:pb-5 rounded-sm border-2 border-[#1F1D1D] shadow-polaroid rotate-2 hover:rotate-0 transition-transform duration-300 animate-hero-float">
                {/* Top Washi Tape Deco */}
                <div
                  style={{ backgroundColor: accent.bg }}
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 sm:w-28 h-5 border border-black/15 -rotate-2 z-30 shadow-xs flex items-center justify-center"
                >
                  <span className="text-[8px] sm:text-[9px] font-extrabold tracking-widest text-[#1F1D1D] uppercase truncate px-1">
                    {branding.productName}
                  </span>
                </div>

                {/* Strip Header */}
                <div className="text-center pb-1.5 sm:pb-2 border-b border-dashed border-gray-300 mb-1.5 sm:mb-2">
                  <span className="text-[10px] sm:text-[11px] font-black tracking-widest uppercase font-display text-[#1F1D1D] truncate block">
                    {branding.productName.toUpperCase()}
                  </span>
                  <p className="text-[8px] sm:text-[9px] text-gray-500 font-mono truncate">
                    FOR {recipientName.toUpperCase()} • SERIES 01
                  </p>
                </div>

                {/* 3 Photos in Strip with live filter styling */}
                <div className="space-y-1.5">
                  <div className="relative overflow-hidden aspect-[4/3] rounded-xs bg-gray-100 border border-gray-200">
                    <img
                      src={sample1}
                      alt="Sample shot 1"
                      className="w-full h-full object-cover transition-all duration-300"
                      style={{ filter: filterStyles[activeFilterPreview] }}
                    />
                    <span className="absolute bottom-0.5 right-1 text-[7px] sm:text-[8px] font-mono font-bold text-amber-400 drop-shadow">
                      '26 10 26
                    </span>
                  </div>

                  <div className="relative overflow-hidden aspect-[4/3] rounded-xs bg-gray-100 border border-gray-200">
                    <img
                      src={sample2}
                      alt="Sample shot 2"
                      className="w-full h-full object-cover transition-all duration-300"
                      style={{ filter: filterStyles[activeFilterPreview] }}
                    />
                    <span className="absolute bottom-0.5 right-1 text-[7px] sm:text-[8px] font-mono font-bold text-amber-400 drop-shadow">
                      '26 10 26
                    </span>
                  </div>

                  <div className="relative overflow-hidden aspect-[4/3] rounded-xs bg-gray-100 border border-gray-200">
                    <img
                      src={sample3}
                      alt="Sample shot 3"
                      className="w-full h-full object-cover transition-all duration-300"
                      style={{ filter: filterStyles[activeFilterPreview] }}
                    />
                    <span className="absolute bottom-0.5 right-1 text-[7px] sm:text-[8px] font-mono font-bold text-amber-400 drop-shadow">
                      '26 10 26
                    </span>
                  </div>
                </div>

                {/* Strip Footer */}
                <div className="text-center pt-2 sm:pt-2.5">
                  <p className="font-handwriting text-base sm:text-xl text-[#1F1D1D] font-bold leading-tight truncate">
                    memories with {recipientName} ✨
                  </p>
                  <p className="text-[7px] sm:text-[8px] font-mono text-gray-400 uppercase tracking-widest mt-0.5">
                    MADE WITH LOVE • KEEP FOREVER
                  </p>
                </div>
              </div>

              {/* Floating Sticker: "COMFORT ZONE" Starburst Pin */}
              <div
                style={{ backgroundColor: accent.bg }}
                className="absolute -bottom-1 -left-1 sm:-left-3 w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[#1F1D1D] shadow-button flex items-center justify-center -rotate-12 z-30 animate-hero-wiggle"
                title="100% Good Vibes"
              >
                <span className="text-sm sm:text-base select-none">💛</span>
              </div>

              {/* Floating Sticker: "REAL & RAW" */}
              <div className="absolute top-1 right-0 sm:-right-2 bg-[#E9D5FF] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border-2 border-[#1F1D1D] shadow-button rotate-12 z-30 select-none">
                <span className="text-[9px] sm:text-[10px] font-black uppercase text-[#1F1D1D] tracking-wider">
                  ★ 100% REAL
                </span>
              </div>
            </div>

            {/* Mini Interactive Filter Switcher */}
            <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 bg-white/95 backdrop-blur-sm p-1 sm:p-1.5 rounded-2xl border-2 border-[#1F1D1D]/20 shadow-sm max-w-full">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-gray-500 pl-1.5 pr-0.5">Try:</span>
              {(['disposable', 'normal', 'bw', 'y2k'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setActiveFilterPreview(mode)}
                  className={`px-2 sm:px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                    activeFilterPreview === mode
                      ? 'bg-[#1F1D1D] text-[#FEF08A] shadow-xs'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {mode === 'disposable'
                    ? '🎞️ Disposable'
                    : mode === 'normal'
                    ? '✨ Clean'
                    : mode === 'bw'
                    ? '🖤 Classic B&W'
                    : '⚡ Y2K Flash'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Cards Grid (Retained & Fully Mobile Responsive) */}
        <div className="mt-10 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white/90 backdrop-blur-sm p-3.5 sm:p-4 rounded-2xl border-2 border-[#1F1D1D]/15 shadow-sm hover:border-[#1F1D1D] transition-colors">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#FEF08A] border border-[#1F1D1D] flex items-center justify-center mb-2.5">
              <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-[#1F1D1D]" />
            </div>
            <h3 className="font-extrabold text-sm text-[#1F1D1D] font-display">Auto Multi-Shot Booth</h3>
            <p className="text-xs text-[#52525B] mt-1 font-medium leading-relaxed">
              1, 3, 4, or 6 shots with pose intervals, countdown timers, and live preview.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-3.5 sm:p-4 rounded-2xl border-2 border-[#1F1D1D]/15 shadow-sm hover:border-[#1F1D1D] transition-colors">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#FBCFE8] border border-[#1F1D1D] flex items-center justify-center mb-2.5">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#1F1D1D]" />
            </div>
            <h3 className="font-extrabold text-sm text-[#1F1D1D] font-display">Auto Memory Maker</h3>
            <p className="text-xs text-[#52525B] mt-1 font-medium leading-relaxed">
              Automatically composites 3 ready-made designs (OG Retro, Modern, Scrapbook) instantly.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-3.5 sm:p-4 rounded-2xl border-2 border-[#1F1D1D]/15 shadow-sm hover:border-[#1F1D1D] transition-colors">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#E9D5FF] border border-[#1F1D1D] flex items-center justify-center mb-2.5">
              <Film className="w-4 h-4 sm:w-5 sm:h-5 text-[#1F1D1D]" />
            </div>
            <h3 className="font-extrabold text-sm text-[#1F1D1D] font-display">24 Indie & Modern Filters</h3>
            <p className="text-xs text-[#52525B] mt-1 font-medium leading-relaxed">
              Kodak Gold, VHS, Disposable 35mm, Velvet Matte, Cinematic, and Golden Hour glow.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-3.5 sm:p-4 rounded-2xl border-2 border-[#1F1D1D]/15 shadow-sm hover:border-[#1F1D1D] transition-colors">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#DCFCE7] border border-[#1F1D1D] flex items-center justify-center mb-2.5">
              <Download className="w-4 h-4 sm:w-5 sm:h-5 text-[#1F1D1D]" />
            </div>
            <h3 className="font-extrabold text-sm text-[#1F1D1D] font-display">High-Res Export & Share</h3>
            <p className="text-xs text-[#52525B] mt-1 font-medium leading-relaxed">
              Save crisp PNG/JPEG strips directly to your device or share instantly with friends.
            </p>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <footer className="text-center py-4 border-t border-black/5 mt-6 sm:mt-8 relative z-10">
        <p className="text-xs text-gray-500 font-medium">
          {branding.productName} • Your photos stay 100% on your device • No server uploads, no signups.
        </p>
      </footer>
    </div>
  );
};
