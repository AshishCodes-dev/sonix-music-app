// Extracts a dominant accent color from album artwork and applies it as a
// live CSS variable (--accent). Gives the whole UI a dynamic, album-aware glow.

let lastUrl = '';

export function applyAlbumColor(imageUrl: string) {
  if (!imageUrl || imageUrl === lastUrl) return;
  lastUrl = imageUrl;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.referrerPolicy = 'no-referrer';
  img.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      const size = 24; // tiny — fast sampling
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;
      let r = 0, g = 0, b = 0, count = 0;
      for (let i = 0; i < data.length; i += 4) {
        const cr = data[i], cg = data[i + 1], cb = data[i + 2];
        // skip near-black / near-white so we get a vivid accent
        const max = Math.max(cr, cg, cb), min = Math.min(cr, cg, cb);
        if (max < 40 || min > 220) continue;
        r += cr; g += cg; b += cb; count++;
      }
      if (!count) return;
      r = Math.round(r / count); g = Math.round(g / count); b = Math.round(b / count);
      // boost saturation a touch
      const accent = `rgb(${r}, ${g}, ${b})`;
      document.documentElement.style.setProperty('--accent', accent);
      document.documentElement.style.setProperty('--accent-soft', `rgba(${r},${g},${b},0.35)`);
    } catch { /* cross-origin taint — ignore silently */ }
  };
  img.src = imageUrl;
}
