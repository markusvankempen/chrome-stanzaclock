/**
 * Colour modes.
 *
 * themeColor() and scaleColor() come from src/main.cpp; ColorHSV() and the
 * gamma table are the Adafruit_NeoPixel implementations, reproduced so the
 * on-screen hues match the LEDs rather than merely looking similar.
 */

export const MAX_BRIGHTNESS = 80;

export const COLOR_MODES = [
  { id: 0, name: 'hour', label: 'Hour hue - colour shifts through the day' },
  { id: 1, name: 'solid', label: 'Solid colour' },
  { id: 2, name: 'rainbow', label: 'Rainbow - hue varies per letter' },
  { id: 3, name: 'warm', label: 'Warm white' },
];

const GAMMA = (() => {
  const table = new Uint8Array(256);
  for (let i = 0; i < 256; i += 1) {
    table[i] = Math.floor((i / 255) ** 2.6 * 255 + 0.5);
  }
  return table;
})();

/** Adafruit_NeoPixel::ColorHSV. hue is 16-bit and wraps. */
export function colorHSV(hue16, sat, val) {
  const hue = Math.floor((((hue16 & 0xffff) * 1530 + 32768) / 65536));
  let r;
  let g;
  let b;
  if (hue < 510) {
    b = 0;
    if (hue < 255) {
      r = 255;
      g = hue;
    } else {
      r = 510 - hue;
      g = 255;
    }
  } else if (hue < 1020) {
    r = 0;
    if (hue < 765) {
      g = 255;
      b = hue - 510;
    } else {
      g = 1020 - hue;
      b = 255;
    }
  } else if (hue < 1530) {
    g = 0;
    if (hue < 1275) {
      r = hue - 1020;
      b = 255;
    } else {
      r = 255;
      b = 1530 - hue;
    }
  } else {
    r = 255;
    g = 0;
    b = 0;
  }
  const v1 = 1 + val;
  const s1 = 1 + sat;
  const s2 = 255 - sat;
  return [
    (((((r * s1) >> 8) + s2) * v1) >> 8) & 0xff,
    (((((g * s1) >> 8) + s2) * v1) >> 8) & 0xff,
    (((((b * s1) >> 8) + s2) * v1) >> 8) & 0xff,
  ];
}

export function gamma(rgb) {
  return [GAMMA[rgb[0]], GAMMA[rgb[1]], GAMMA[rgb[2]]];
}

/** Truncating channel scale, matching the integer maths on the device. */
export function scaleColor(rgb, gainRaw) {
  const gain = Math.min(Math.max(gainRaw, 0), 1.4);
  return [
    Math.floor(rgb[0] * gain) & 0xff,
    Math.floor(rgb[1] * gain) & 0xff,
    Math.floor(rgb[2] * gain) & 0xff,
  ];
}

/**
 * Base colour for a lit cell before brightness is applied.
 *
 * @param {number} mode 0 hour hue, 1 solid, 2 rainbow, 3 warm
 * @param {number} hour12 1-12, drives the hue
 * @param {number} index letter index plus cell index, for the rainbow spread
 * @param {number[]} solid [r,g,b] for solid mode
 */
export function themeColor(mode, hour12, index, solid) {
  switch (mode) {
    case 1:
      return solid;
    case 2:
      return gamma(colorHSV(hour12 * 5461 + index * 2500, 200, 255));
    case 3:
      return [255, 170, 70];
    default:
      return gamma(colorHSV((hour12 % 12) * 5461, 180, 255));
  }
}

export function wordGain(brightness) {
  return brightness / MAX_BRIGHTNESS;
}

export const DOT_COLOR = [255, 210, 70];

export function css(rgb) {
  return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
}

export function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) {
    return [255, 160, 40];
  }
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

export function rgbToHex(rgb) {
  const h = (v) => v.toString(16).padStart(2, '0');
  return `#${h(rgb[0])}${h(rgb[1])}${h(rgb[2])}`;
}
