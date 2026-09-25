// Detects icons that would be hard to see on a dark theme:
//   'mono-dark'  dark and colourless (GitHub, Express)  -> shown in soft white
//   'dark-color' dark but coloured (SQL's navy)          -> brightened, hue kept
//   'normal'     everything else, left untouched

const SAMPLE_SIZE = 32;
// Contrast of each pixel against a typical dark surface (#111)
const DARK_SURFACE_LUMINANCE = 0.0056;
const MIN_CONTRAST = 3;
// Share of the icon's pixels below MIN_CONTRAST for it to count as dark
const DARK_SHARE = 0.6;
const MAX_MONO_SATURATION = 0.25;

const cache = new Map();

const linear = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);

const analyse = (img) => {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SAMPLE_SIZE;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
  const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);

  let pixels = 0;
  let lowContrast = 0;
  let saturation = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue; // ignore transparent areas
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]].map(v => v / 255);
    const luminance = 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
    const max = Math.max(r, g, b);
    saturation += max ? (max - Math.min(r, g, b)) / max : 0;
    if ((luminance + 0.05) / (DARK_SURFACE_LUMINANCE + 0.05) < MIN_CONTRAST) lowContrast += 1;
    pixels += 1;
  }

  if (!pixels || lowContrast / pixels < DARK_SHARE) return 'normal';
  return saturation / pixels < MAX_MONO_SATURATION ? 'mono-dark' : 'dark-color';
};

// Resolves to a tone; anything that can't be read (e.g. blocked by CORS) is 'normal'
export const detectIconTone = (url) => {
  if (!cache.has(url)) {
    cache.set(url, new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          resolve(analyse(img));
        } catch {
          resolve('normal');
        }
      };
      img.onerror = () => resolve('normal');
      img.src = url;
    }));
  }
  return cache.get(url);
};
