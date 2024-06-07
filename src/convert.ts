export function rgbFormat(r: number, g: number, b: number): string {
  return `rgb(${(r * 255).toFixed(0)}, ${(g * 255).toFixed(0)}, ${(
    b * 255
  ).toFixed(0)})`;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${(
    (1 << 24) +
    (Math.round(r * 255) << 16) +
    (Math.round(g * 255) << 8) +
    Math.round(b * 255)
  )
    .toString(16)
    .slice(1)}`;
}

export function rgbToHls(r: number, g: number, b: number) {
  const maxc = Math.max(r, g, b);
  const minc = Math.min(r, g, b);
  const sumc = maxc + minc;
  const rangec = maxc - minc;
  const l = sumc / 2.0;
  let s;
  if (minc == maxc) {
    return { h: 0.0, l, s: 0.0 };
  }
  if (l <= 0.5) {
    s = rangec / sumc;
  } else {
    s = rangec / (2.0 - sumc);
  }
  const rc = (maxc - r) / rangec;
  const gc = (maxc - g) / rangec;
  const bc = (maxc - b) / rangec;

  let h;
  if (r == maxc) {
    h = bc - gc;
  } else if (g == maxc) {
    h = 2.0 + rc - bc;
  } else {
    h = 4.0 + gc - rc;
  }
  h = (h / 6.0) % 1.0;
  return { h, l, s };
}

export function hlsToRgb(h: number, l: number, s: number) {
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return { r, g, b };
}

export function _v(m1: number, m2: number, hue: number) {
  hue = hue % 1.0;
  if (hue < 1 / 6) {
    return m1 + (m2 - m1) * hue * 6.0;
  }
  if (hue < 0.5) {
    return m2;
  }
  if (hue < 2 / 3) {
    return m1 + (m2 - m1) * (2 / 3 - hue) * 6.0;
  }
  return m1;
}
