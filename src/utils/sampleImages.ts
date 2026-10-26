// Generate rich, self-contained SVG portrait data URLs for Palak's Photo Club demo & fallback
export function createSamplePhoto(seed: number, title: string, subtitle: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 750;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const palettes = [
    { bg: ['#FDE68A', '#F472B6'], skin: '#FCD34D', hair: '#1F2937', shirt: '#3B82F6', glasses: '#EF4444' },
    { bg: ['#A7F3D0', '#60A5FA'], skin: '#FBBF24', hair: '#7C2D12', shirt: '#10B981', glasses: '#8B5CF6' },
    { bg: ['#FBCFE8', '#C084FC'], skin: '#FDE047', hair: '#111827', shirt: '#EC4899', glasses: '#F59E0B' },
    { bg: ['#FED7AA', '#FB7185'], skin: '#F59E0B', hair: '#374151', shirt: '#6366F1', glasses: '#10B981' },
    { bg: ['#DDD6FE', '#93C5FD'], skin: '#FCD34D', hair: '#4B5563', shirt: '#14B8A6', glasses: '#EC4899' },
    { bg: ['#FEF08A', '#86EFAC'], skin: '#FBBF24', hair: '#18181B', shirt: '#F97316', glasses: '#3B82F6' },
  ];

  const p = palettes[seed % palettes.length];

  // Background Gradient
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, p.bg[0]);
  grad.addColorStop(1, p.bg[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Decorative soft background circles (bokeh)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.beginPath();
  ctx.arc(120, 150, 90, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(480, 260, 130, 0, Math.PI * 2);
  ctx.fill();

  // Draw Cute Character / Silhouette
  // Body / Shirt
  ctx.fillStyle = p.shirt;
  ctx.beginPath();
  ctx.ellipse(300, 680, 240, 180, 0, 0, Math.PI * 2);
  ctx.fill();

  // Neck
  ctx.fillStyle = p.skin;
  ctx.fillRect(265, 420, 70, 90);

  // Head
  ctx.fillStyle = p.skin;
  ctx.beginPath();
  ctx.ellipse(300, 320, 130, 150, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = p.hair;
  ctx.beginPath();
  ctx.arc(300, 280, 145, Math.PI * 0.85, Math.PI * 2.15, false);
  ctx.fill();
  // Curly / wavy bangs
  ctx.beginPath();
  ctx.arc(240, 220, 45, 0, Math.PI * 2);
  ctx.arc(300, 205, 55, 0, Math.PI * 2);
  ctx.arc(360, 220, 45, 0, Math.PI * 2);
  ctx.fill();

  // Cute Quirky Sunglasses / Glasses
  ctx.strokeStyle = p.glasses;
  ctx.lineWidth = 14;
  ctx.fillStyle = 'rgba(25, 20, 30, 0.85)';
  // Left lens
  ctx.beginPath();
  ctx.roundRect(205, 305, 75, 55, 12);
  ctx.fill();
  ctx.stroke();
  // Right lens
  ctx.beginPath();
  ctx.roundRect(320, 305, 75, 55, 12);
  ctx.fill();
  ctx.stroke();
  // Bridge
  ctx.beginPath();
  ctx.moveTo(280, 332);
  ctx.lineTo(320, 332);
  ctx.stroke();

  // Cheerful Blush
  ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
  ctx.beginPath();
  ctx.ellipse(215, 385, 25, 15, 0, 0, Math.PI * 2);
  ctx.ellipse(385, 385, 25, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Playful Smile
  ctx.strokeStyle = '#1F1D1D';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (seed % 2 === 0) {
    // Open joyful grin
    ctx.arc(300, 395, 35, 0.15 * Math.PI, 0.85 * Math.PI, false);
    ctx.stroke();
  } else {
    // Winking tongue or smirking curve
    ctx.arc(300, 400, 28, 0.1 * Math.PI, 0.9 * Math.PI, false);
    ctx.stroke();
    ctx.fillStyle = '#FB7185';
    ctx.beginPath();
    ctx.ellipse(305, 425, 12, 10, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Floating playful sparkles or star
  ctx.fillStyle = '#FEF08A';
  ctx.strokeStyle = '#1F1D1D';
  ctx.lineWidth = 3;
  drawStar(ctx, 480, 140, 5, 25, 12);
  drawStar(ctx, 110, 280, 4, 18, 8);

  // Handwritten label badge at bottom
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.strokeStyle = '#1F1D1D';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(50, 640, 500, 75, 16);
  ctx.fill();
  ctx.stroke();

  // Text
  ctx.fillStyle = '#1F1D1D';
  ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, 300, 672);

  ctx.font = '16px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#4B5563';
  ctx.fillText(subtitle, 300, 700);

  return canvas.toDataURL('image/jpeg', 0.92);
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

export const SAMPLE_SHOTS = [
  { title: "Shot 1 — Warmup Laugh", subtitle: "Strike a pose, Palak!" },
  { title: "Shot 2 — Main Character", subtitle: "Bestie energy is off the charts" },
  { title: "Shot 3 — Certified Chaos", subtitle: "No perfect poses allowed" },
  { title: "Shot 4 — Core Memory", subtitle: "Good pics & timeless vibes" },
  { title: "Shot 5 — Unserious Vibe", subtitle: "A little chaos, a lot of love" },
  { title: "Shot 6 — Retro Mood", subtitle: "Saved for the photobook" },
];
