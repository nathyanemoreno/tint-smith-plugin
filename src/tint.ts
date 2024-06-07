import { rgbToHls, hlsToRgb } from "./convert";

export function generateTint(
  rgb: string,
  level: number,
): { r: number; g: number; b: number } {
  const rgbArray = rgb.split('(')[1].split(',');
  const r = Number(rgbArray[0]) / 255;
  const g = Number(rgbArray[1]) / 255;
  const b = Number(rgbArray[2].slice(0, -1)) / 255;

  const step_lightness = 0.5 / 11;

  const { h, l, s } = rgbToHls(r, g, b);
  // * Create tints
  let lightness = l - level * step_lightness;
  lightness = Math.max(0, Math.min(1, lightness));

  // * Return the lightness tint
  return hlsToRgb(h, lightness, s);
}
