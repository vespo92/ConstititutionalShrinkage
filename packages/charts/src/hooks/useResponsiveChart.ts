'use client';

import { useState, useEffect, useCallback, RefObject } from 'react';

export interface ChartDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

export interface UseResponsiveChartOptions {
  defaultWidth?: number;
  defaultHeight?: number;
  aspectRatio?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export function useResponsiveChart(
  containerRef: RefObject<HTMLElement>,
  options: UseResponsiveChartOptions = {}
): ChartDimensions {
  const {
    defaultWidth = 400,
    defaultHeight = 300,
    aspectRatio,
    minWidth = 200,
    minHeight = 150,
    maxWidth = 1200,
    maxHeight = 800,
  } = options;

  const [dimensions, setDimensions] = useState<ChartDimensions>({
    width: defaultWidth,
    height: defaultHeight,
    aspectRatio: defaultWidth / defaultHeight,
  });

  const updateDimensions = useCallback(() => {
    if (!containerRef.current) return;

    const { clientWidth } = containerRef.current;

    let width = Math.max(minWidth, Math.min(clientWidth, maxWidth));
    let height: number;

    if (aspectRatio) {
      height = width / aspectRatio;
    } else {
      height = defaultHeight;
    }

    height = Math.max(minHeight, Math.min(height, maxHeight));

    setDimensions({
      width,
      height,
      aspectRatio: width / height,
    });
  }, [containerRef, aspectRatio, defaultHeight, minWidth, minHeight, maxWidth, maxHeight]);

  useEffect(() => {
    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef, updateDimensions]);

  return dimensions;
}
