/**
 * Color Contrast Test Suite
 * Tests for WCAG 2.1 AAA color contrast requirements
 */

import { describe, it, expect } from 'vitest';
import {
  hexToRgb,
  parseColor,
  getRelativeLuminance,
  calculateContrastRatio,
  checkContrast,
} from '../src/utils/color-contrast';

describe('hexToRgb', () => {
  it('should parse 6-digit hex colors', () => {
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('should parse 3-digit hex colors', () => {
    expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb('#000')).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgb('#f00')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('should handle hex without hash', () => {
    expect(hexToRgb('ffffff')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('should throw for invalid hex', () => {
    expect(() => hexToRgb('invalid')).toThrow();
  });
});

describe('parseColor', () => {
  it('should parse hex colors', () => {
    expect(parseColor('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('should parse rgb colors', () => {
    expect(parseColor('rgb(255, 0, 0)')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('should parse rgba colors', () => {
    expect(parseColor('rgba(255, 0, 0, 0.5)')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('should parse named colors', () => {
    expect(parseColor('white')).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseColor('black')).toEqual({ r: 0, g: 0, b: 0 });
  });
});

describe('getRelativeLuminance', () => {
  it('should return 1 for white', () => {
    const luminance = getRelativeLuminance({ r: 255, g: 255, b: 255 });
    expect(luminance).toBeCloseTo(1, 2);
  });

  it('should return 0 for black', () => {
    const luminance = getRelativeLuminance({ r: 0, g: 0, b: 0 });
    expect(luminance).toBeCloseTo(0, 2);
  });

  it('should calculate correctly for mid-gray', () => {
    const luminance = getRelativeLuminance({ r: 128, g: 128, b: 128 });
    expect(luminance).toBeGreaterThan(0);
    expect(luminance).toBeLessThan(1);
  });
});

describe('calculateContrastRatio', () => {
  it('should return 21 for black on white', () => {
    const ratio = calculateContrastRatio('#000000', '#ffffff');
    expect(ratio).toBeCloseTo(21, 0);
  });

  it('should return 21 for white on black', () => {
    const ratio = calculateContrastRatio('#ffffff', '#000000');
    expect(ratio).toBeCloseTo(21, 0);
  });

  it('should return 1 for same colors', () => {
    const ratio = calculateContrastRatio('#777777', '#777777');
    expect(ratio).toBeCloseTo(1, 2);
  });
});

describe('checkContrast', () => {
  it('should pass AAA for black on white', () => {
    const result = checkContrast('#000000', '#ffffff');
    expect(result.passesAA).toBe(true);
    expect(result.passesAAA).toBe(true);
    expect(result.ratio).toBeCloseTo(21, 0);
  });

  it('should fail AAA for low contrast colors', () => {
    // Light gray on white - low contrast
    const result = checkContrast('#cccccc', '#ffffff');
    expect(result.passesAAA).toBe(false);
    expect(result.ratio).toBeLessThan(7);
  });

  it('should include large text requirements', () => {
    const result = checkContrast('#000000', '#ffffff');
    expect(result.passesAALarge).toBe(true);
    expect(result.passesAAALarge).toBe(true);
  });
});

describe('WCAG 2.1 AAA Compliance', () => {
  it('should require 7:1 ratio for normal text', () => {
    const minRatio = 7.0;
    const result = checkContrast('#000000', '#ffffff');
    expect(result.ratio).toBeGreaterThanOrEqual(minRatio);
    expect(result.passesAAA).toBe(true);
  });

  it('should require 4.5:1 ratio for large text', () => {
    const minRatio = 4.5;
    const result = checkContrast('#595959', '#ffffff');
    expect(result.passesAAALarge).toBe(result.ratio >= minRatio);
  });

  it('should validate common government color schemes', () => {
    // Navy blue on white - common government color
    const navyResult = checkContrast('#003366', '#ffffff');
    expect(navyResult.passesAAA).toBe(true);

    // Red on white - often used for alerts
    const redResult = checkContrast('#990000', '#ffffff');
    expect(redResult.passesAA).toBe(true);
  });
});
