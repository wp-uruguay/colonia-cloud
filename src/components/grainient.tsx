'use client';

import React, { useEffect, useRef } from 'react';

interface GrainientProps {
  color1?: string;
  color2?: string;
  color3?: string;
  timeSpeed?: number;
  colorBalance?: number;
  warpStrength?: number;
  warpFrequency?: number;
  warpSpeed?: number;
  warpAmplitude?: number;
  blendAngle?: number;
  blendSoftness?: number;
  rotationAmount?: number;
  noiseScale?: number;
  grainAmount?: number;
  grainScale?: number;
  grainAnimated?: boolean;
  contrast?: number;
  gamma?: number;
  saturation?: number;
  centerX?: number;
  centerY?: number;
  zoom?: number;
}

export function Grainient({
  color1 = '#b2aeb2',
  color2 = '#434242',
  color3 = '#aaa7a7',
  timeSpeed = 0.45,
  colorBalance = 0.37,
  warpStrength = 1.1,
  warpFrequency = 5,
  warpSpeed = 2.4,
  warpAmplitude = 50,
  blendAngle = 0,
  blendSoftness = 0.05,
  rotationAmount = 500,
  noiseScale = 2.4,
  grainAmount = 0.12,
  grainScale = 2,
  grainAnimated = true,
  contrast = 0.9,
  gamma = 1,
  saturation = 1.35,
  centerX = 0,
  centerY = 0,
  zoom = 1,
}: GrainientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : { r: 0, g: 0, b: 0 };
    };

    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);
    const c3 = hexToRgb(color3);

    const render = () => {
      const { width, height } = canvas;
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;

      time += timeSpeed * 0.01;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;

          // Centered coordinates
          const cx = (x - width / 2 - centerX) / zoom;
          const cy = (y - height / 2 - centerY) / zoom;

          // Warping
          const warpX =
            cx +
            Math.sin(cy * warpFrequency * 0.01 + time * warpSpeed) *
              warpAmplitude *
              warpStrength;
          const warpY =
            cy +
            Math.cos(cx * warpFrequency * 0.01 + time * warpSpeed) *
              warpAmplitude *
              warpStrength;

          // Gradient calculation
          const dist = Math.sqrt(warpX * warpX + warpY * warpY);
          const angle = Math.atan2(warpY, warpX) + (rotationAmount * time * 0.001);
          
          const gradientValue =
            (Math.sin(dist * 0.01 + time + angle * blendAngle) + 1) * 0.5;

          // Noise
          const noise =
            Math.sin(x * noiseScale * 0.1 + time) *
            Math.cos(y * noiseScale * 0.1 + time) *
            0.5 +
            0.5;

          // Color mixing
          const t = gradientValue * colorBalance + noise * (1 - colorBalance);
          
          let r, g, b;
          if (t < 0.5) {
            const mix = t * 2;
            r = c1.r + (c2.r - c1.r) * mix;
            g = c1.g + (c2.g - c1.g) * mix;
            b = c1.b + (c2.b - c1.b) * mix;
          } else {
            const mix = (t - 0.5) * 2;
            r = c2.r + (c3.r - c2.r) * mix;
            g = c2.g + (c3.g - c2.g) * mix;
            b = c2.b + (c3.b - c2.b) * mix;
          }

          // Grain
          const grainValue = grainAnimated
            ? Math.random() * grainAmount
            : (Math.sin(x * grainScale + y * grainScale) + 1) * 0.5 * grainAmount;

          r += (grainValue - grainAmount * 0.5) * 255;
          g += (grainValue - grainAmount * 0.5) * 255;
          b += (grainValue - grainAmount * 0.5) * 255;

          // Contrast
          r = ((r / 255 - 0.5) * contrast + 0.5) * 255;
          g = ((g / 255 - 0.5) * contrast + 0.5) * 255;
          b = ((b / 255 - 0.5) * contrast + 0.5) * 255;

          // Gamma
          r = Math.pow(r / 255, gamma) * 255;
          g = Math.pow(g / 255, gamma) * 255;
          b = Math.pow(b / 255, gamma) * 255;

          // Saturation
          const gray = r * 0.299 + g * 0.587 + b * 0.114;
          r = gray + (r - gray) * saturation;
          g = gray + (g - gray) * saturation;
          b = gray + (b - gray) * saturation;

          data[i] = Math.max(0, Math.min(255, r));
          data[i + 1] = Math.max(0, Math.min(255, g));
          data[i + 2] = Math.max(0, Math.min(255, b));
          data[i + 3] = 255;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    color1,
    color2,
    color3,
    timeSpeed,
    colorBalance,
    warpStrength,
    warpFrequency,
    warpSpeed,
    warpAmplitude,
    blendAngle,
    rotationAmount,
    noiseScale,
    grainAmount,
    grainScale,
    grainAnimated,
    contrast,
    gamma,
    saturation,
    centerX,
    centerY,
    zoom,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
