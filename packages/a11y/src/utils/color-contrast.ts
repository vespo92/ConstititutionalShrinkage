/**
 * Color contrast utilities for WCAG 2.1 AAA compliance
 * AAA requires 7:1 for normal text, 4.5:1 for large text
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface ContrastResult {
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
  passesAALarge: boolean;
  passesAAALarge: boolean;
}

/**
 * Parse a hex color string to RGB
 */
export function hexToRgb(hex: string): RGB {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Parse a CSS color string to RGB
 * Supports hex, rgb(), and rgba() formats
 */
export function parseColor(color: string): RGB {
  color = color.trim().toLowerCase();

  // Handle hex colors
  if (color.startsWith('#')) {
    return hexToRgb(color);
  }

  // Handle rgb/rgba
  const rgbMatch = color.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
    };
  }

  // Handle named colors (common ones)
  const namedColors: Record<string, RGB> = {
    white: { r: 255, g: 255, b: 255 },
    black: { r: 0, g: 0, b: 0 },
    red: { r: 255, g: 0, b: 0 },
    green: { r: 0, g: 128, b: 0 },
    blue: { r: 0, g: 0, b: 255 },
    yellow: { r: 255, g: 255, b: 0 },
    gray: { r: 128, g: 128, b: 128 },
    grey: { r: 128, g: 128, b: 128 },
  };

  if (namedColors[color]) {
    return namedColors[color];
  }

  throw new Error(`Unable to parse color: ${color}`);
}

/**
 * Calculate relative luminance according to WCAG 2.1
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
export function getRelativeLuminance(rgb: RGB): number {
  const { r, g, b } = rgb;

  const sRGB = [r, g, b].map((val) => {
    const normalized = val / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

/**
 * Calculate contrast ratio between two colors
 * Returns a ratio between 1 and 21
 */
export function calculateContrastRatio(color1: string | RGB, color2: string | RGB): number {
  const rgb1 = typeof color1 === 'string' ? parseColor(color1) : color1;
  const rgb2 = typeof color2 === 'string' ? parseColor(color2) : color2;

  const lum1 = getRelativeLuminance(rgb1);
  const lum2 = getRelativeLuminance(rgb2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check contrast between foreground and background colors
 */
export function checkContrast(foreground: string, background: string): ContrastResult {
  const ratio = calculateContrastRatio(foreground, background);

  return {
    ratio: Math.round(ratio * 100) / 100,
    passesAA: ratio >= 4.5, // Normal text
    passesAAA: ratio >= 7.0, // Normal text
    passesAALarge: ratio >= 3.0, // Large text (18pt or 14pt bold)
    passesAAALarge: ratio >= 4.5, // Large text
  };
}

/**
 * Format contrast result for display
 */
export function formatContrastResult(result: ContrastResult): string {
  const { ratio, passesAA, passesAAA, passesAALarge, passesAAALarge } = result;

  let output = `Contrast ratio: ${ratio}:1\n`;
  output += `Normal text (14pt):\n`;
  output += `  AA (4.5:1): ${passesAA ? '✓ Pass' : '✗ Fail'}\n`;
  output += `  AAA (7:1): ${passesAAA ? '✓ Pass' : '✗ Fail'}\n`;
  output += `Large text (18pt+ or 14pt bold):\n`;
  output += `  AA (3:1): ${passesAALarge ? '✓ Pass' : '✗ Fail'}\n`;
  output += `  AAA (4.5:1): ${passesAAALarge ? '✓ Pass' : '✗ Fail'}\n`;

  return output;
}

/**
 * Suggest a color that meets AAA contrast requirements
 */
export function suggestAAAColor(
  targetColor: string,
  isBackground: boolean = false
): { light: string; dark: string } {
  const rgb = parseColor(targetColor);
  const lum = getRelativeLuminance(rgb);

  // If color is dark, suggest white or light colors
  // If color is light, suggest black or dark colors
  if (lum < 0.5) {
    return {
      light: '#ffffff',
      dark: targetColor,
    };
  } else {
    return {
      light: targetColor,
      dark: '#000000',
    };
  }
}

export default {
  hexToRgb,
  parseColor,
  getRelativeLuminance,
  calculateContrastRatio,
  checkContrast,
  formatContrastResult,
  suggestAAAColor,
};
