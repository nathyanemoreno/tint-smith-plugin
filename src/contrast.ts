export function relativeLuminance(r: number, g: number, b: number): number {
  const adjust = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const R = adjust(r),
    G = adjust(g),
    B = adjust(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function contrastRatio(l1: number, l2: number): number {
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export function getContrastRatios(
  r: number,
  g: number,
  b: number,
): { black: number; white: number } {
  const lumColor = relativeLuminance(r, g, b);
  const contrastWithBlack = contrastRatio(lumColor, 0);
  const contrastWithWhite = contrastRatio(1, lumColor);
  return { black: contrastWithBlack, white: contrastWithWhite };
}
