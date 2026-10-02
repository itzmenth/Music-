import React, { useEffect, useRef, useState } from 'react';
import { useMusic } from '../context/MusicContext';

interface AudioVisualizerProps {
  className?: string;
  barCount?: number;
  height?: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  className = '',
  barCount = 36,
  height = 160,
}) => {
  const { audioEngine, isPlaying, accentHex, themeMode } = useMusic();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [visualMode, setVisualMode] = useState<'bars' | 'wave' | 'peak'>('bars');
  const animationFrameRef = useRef<number | null>(null);
  const peakHoldRef = useRef<number[]>(new Array(barCount).fill(0));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dataArray = new Uint8Array(64);

    const render = () => {
      audioEngine.getFrequencyData(dataArray);

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, rect.width, rect.height);

      const w = rect.width;
      const h = rect.height;

      if (visualMode === 'bars' || visualMode === 'peak') {
        const gap = 3;
        const totalGap = gap * (barCount - 1);
        const barWidth = Math.max(2, (w - totalGap) / barCount);

        for (let i = 0; i < barCount; i++) {
          const dataIdx = Math.floor((i / barCount) * 48);
          // If not playing, keep a quiet gentle idle breathing amplitude
          let rawVal = dataArray[dataIdx] || 0;
          if (!isPlaying) {
            rawVal = Math.sin(Date.now() * 0.002 + i * 0.2) * 6 + 8;
          }

          const percent = rawVal / 255;
          const barHeight = Math.max(4, percent * (h - 10));
          const x = i * (barWidth + gap);
          const y = h - barHeight;

          // Gradient color from accent color to white/glow
          const grad = ctx.createLinearGradient(0, y, 0, h);
          grad.addColorStop(0, accentHex);
          grad.addColorStop(1, `${accentHex}33`);

          ctx.fillStyle = grad;
          ctx.fillRect(x, y, barWidth, barHeight);

          // Peak hold indicator (classic Zune EQ)
          if (visualMode === 'peak' || visualMode === 'bars') {
            if (barHeight > peakHoldRef.current[i]) {
              peakHoldRef.current[i] = barHeight;
            } else {
              peakHoldRef.current[i] = Math.max(2, peakHoldRef.current[i] - 1.2);
            }
            const peakY = h - peakHoldRef.current[i] - 2;
            ctx.fillStyle = themeMode === 'dark' ? '#FFFFFF' : '#000000';
            ctx.fillRect(x, peakY, barWidth, 2);
          }
        }
      } else if (visualMode === 'wave') {
        // Smooth Oscilloscope line
        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = accentHex;
        ctx.shadowColor = accentHex;
        ctx.shadowBlur = 8;

        const sliceWidth = w / barCount;
        let x = 0;

        for (let i = 0; i < barCount; i++) {
          const dataIdx = Math.floor((i / barCount) * 48);
          let rawVal = dataArray[dataIdx] || 0;
          if (!isPlaying) {
            rawVal = Math.sin(Date.now() * 0.003 + i * 0.3) * 12 + 128;
          }
          const v = rawVal / 128.0;
          const y = (v * h) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      ctx.restore();
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioEngine, isPlaying, accentHex, barCount, visualMode, themeMode]);

  return (
    <div className={`relative flex flex-col justify-end w-full ${className}`}>
      <canvas
        ref={canvasRef}
        style={{ height: `${height}px`, width: '100%' }}
        className="w-full select-none"
      />
      {/* Mode Selector Pill Buttons */}
      <div className="flex items-center justify-center gap-2 pt-2 pb-1">
        <button
          onClick={() => setVisualMode('bars')}
          className={`px-2.5 py-1 text-[11px] font-medium transition-colors ${
            visualMode === 'bars'
              ? 'text-white'
              : 'text-white/40 hover:text-white/80'
          }`}
          style={visualMode === 'bars' ? { backgroundColor: accentHex } : {}}
        >
          Spectrum
        </button>
        <button
          onClick={() => setVisualMode('peak')}
          className={`px-2.5 py-1 text-[11px] font-medium transition-colors ${
            visualMode === 'peak'
              ? 'text-white'
              : 'text-white/40 hover:text-white/80'
          }`}
          style={visualMode === 'peak' ? { backgroundColor: accentHex } : {}}
        >
          Peak Hold
        </button>
        <button
          onClick={() => setVisualMode('wave')}
          className={`px-2.5 py-1 text-[11px] font-medium transition-colors ${
            visualMode === 'wave'
              ? 'text-white'
              : 'text-white/40 hover:text-white/80'
          }`}
          style={visualMode === 'wave' ? { backgroundColor: accentHex } : {}}
        >
          Oscilloscope
        </button>
      </div>
    </div>
  );
};
