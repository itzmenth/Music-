import React from 'react';
import { X, Sliders, Sparkles } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { EqualizerPreset } from '../types/music';
import { AudioVisualizer } from './AudioVisualizer';

interface EqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESETS: EqualizerPreset[] = [
  'flat',
  'rock',
  'pop',
  'jazz',
  'electronic',
  'hiphop',
  'bassboost',
  'metro',
];

export const EqualizerModal: React.FC<EqualizerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    eqBands,
    setEQBandGain,
    currentPreset,
    applyEQPreset,
    bassBoost,
    setBassBoostValue,
    spatial8D,
    setSpatial8DValue,
    accentHex,
    themeMode,
  } = useMusic();

  if (!isOpen) return null;

  const isDark = themeMode === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none">
      <div
        className={`w-full max-w-lg p-5 border shadow-2xl relative ${
          isDark
            ? 'bg-neutral-950 border-neutral-800 text-white'
            : 'bg-white border-neutral-300 text-black'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-current/10 mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 opacity-80" />
            <div>
              <h2 className="text-xl font-bold tracking-tight">audio equalizer</h2>
              <p className="text-xs opacity-60 font-light">
                Hardware acoustic profiles & enhancements
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-current/40 flex items-center justify-center hover:bg-current/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Spectrum Strip */}
        <div className="mb-4 p-2 bg-black/40 border border-white/5">
          <AudioVisualizer height={80} barCount={32} />
        </div>

        {/* Presets */}
        <div className="mb-5">
          <span className="text-[11px] font-bold uppercase tracking-wider opacity-60 block mb-2">
            presets
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => applyEQPreset(preset)}
                className={`px-3 py-1 text-xs uppercase font-semibold transition-colors ${
                  currentPreset === preset
                    ? 'text-white'
                    : 'bg-current/10 hover:bg-current/20'
                }`}
                style={currentPreset === preset ? { backgroundColor: accentHex } : {}}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* 10-Band Sliders */}
        <div className="mb-6">
          <span className="text-[11px] font-bold uppercase tracking-wider opacity-60 block mb-2">
            frequency bands (±12 dB)
          </span>
          <div className="grid grid-cols-10 gap-1 items-end h-36 bg-current/5 p-3">
            {eqBands.map((band, idx) => (
              <div key={band.freq} className="flex flex-col items-center h-full">
                <span className="text-[9px] font-mono opacity-60 mb-1">
                  {band.gain > 0 ? `+${band.gain}` : band.gain}
                </span>
                <div className="flex-1 flex items-center justify-center">
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="1"
                    value={band.gain}
                    onChange={(e) => setEQBandGain(idx, Number(e.target.value))}
                    className="w-20 -rotate-90 origin-center cursor-pointer"
                    style={{ accentColor: accentHex }}
                  />
                </div>
                <span className="text-[9px] font-mono opacity-70 mt-1">
                  {band.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bass Boost & 8D Spatial */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-current/10">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                Bass Boost
              </span>
              <span className="text-xs font-mono opacity-60">+{bassBoost} dB</span>
            </div>
            <input
              type="range"
              min="0"
              max="12"
              step="1"
              value={bassBoost}
              onChange={(e) => setBassBoostValue(Number(e.target.value))}
              className="w-full cursor-pointer"
              style={{ accentColor: accentHex }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider opacity-80 block">
                8D Spatial Sound
              </span>
              <span className="text-[10px] opacity-60">Headphone rotation</span>
            </div>
            <button
              onClick={() => setSpatial8DValue(!spatial8D)}
              className="px-3 py-1 text-xs font-bold uppercase text-white transition-colors"
              style={{ backgroundColor: spatial8D ? accentHex : '#444' }}
            >
              {spatial8D ? 'Active' : 'Off'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
