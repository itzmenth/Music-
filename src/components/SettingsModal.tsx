import React, { useState } from 'react';
import { X, Check, Volume2, Moon, Sun, Smartphone, Clock } from 'lucide-react';
import { useMusic, METRO_ACCENT_HEX } from '../context/MusicContext';
import { MetroAccent } from '../types/music';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ACCENT_OPTIONS: { id: MetroAccent; label: string; hex: string }[] = [
  { id: 'magenta', label: 'Magenta', hex: METRO_ACCENT_HEX.magenta },
  { id: 'cyan', label: 'Cyan', hex: METRO_ACCENT_HEX.cyan },
  { id: 'mango', label: 'Mango', hex: METRO_ACCENT_HEX.mango },
  { id: 'lime', label: 'Lime', hex: METRO_ACCENT_HEX.lime },
  { id: 'cobalt', label: 'Cobalt', hex: METRO_ACCENT_HEX.cobalt },
  { id: 'crimson', label: 'Crimson', hex: METRO_ACCENT_HEX.crimson },
  { id: 'emerald', label: 'Emerald', hex: METRO_ACCENT_HEX.emerald },
  { id: 'amber', label: 'Amber', hex: METRO_ACCENT_HEX.amber },
  { id: 'violet', label: 'Violet', hex: METRO_ACCENT_HEX.violet },
  { id: 'teal', label: 'Teal', hex: METRO_ACCENT_HEX.teal },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    accent,
    setAccent,
    themeMode,
    setThemeMode,
    playTapSound,
    setPlayTapSound,
    isDeviceFrameEnabled,
    setIsDeviceFrameEnabled,
    audioEngine,
    accentHex,
    triggerTap,
  } = useMusic();

  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);

  if (!isOpen) return null;

  const isDark = themeMode === 'dark';

  const handleSetSleepTimer = (mins: number | null) => {
    triggerTap();
    setSleepTimerMinutes(mins);
    if (mins) {
      setTimeout(() => {
        audioEngine.stop();
      }, mins * 60 * 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none">
      <div
        className={`w-full max-w-md p-5 border shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar ${
          isDark
            ? 'bg-neutral-950 border-neutral-800 text-white'
            : 'bg-white border-neutral-300 text-black'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-current/10 mb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">settings & theme</h2>
            <p className="text-xs opacity-60 font-light">Windows Phone Personalization</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-current/40 flex items-center justify-center hover:bg-current/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Metro Accent Color */}
        <div className="mb-5">
          <span className="text-xs font-bold uppercase tracking-wider opacity-60 block mb-2">
            Metro Accent Color
          </span>
          <div className="grid grid-cols-5 gap-2">
            {ACCENT_OPTIONS.map((item) => {
              const isSelected = accent === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setAccent(item.id)}
                  title={item.label}
                  className="aspect-square flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer relative"
                  style={{ backgroundColor: item.hex }}
                >
                  {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Theme Mode: Dark vs Light */}
        <div className="mb-5">
          <span className="text-xs font-bold uppercase tracking-wider opacity-60 block mb-2">
            Background Theme
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setThemeMode('dark')}
              className={`p-3 border flex items-center justify-center gap-2 text-xs font-semibold uppercase ${
                isDark ? 'border-white bg-neutral-900 text-white' : 'border-neutral-300 text-neutral-600'
              }`}
            >
              <Moon className="w-4 h-4" /> Dark (OLED Black)
            </button>
            <button
              onClick={() => setThemeMode('light')}
              className={`p-3 border flex items-center justify-center gap-2 text-xs font-semibold uppercase ${
                !isDark ? 'border-black bg-neutral-100 text-black' : 'border-neutral-800 text-neutral-400'
              }`}
            >
              <Sun className="w-4 h-4" /> Light (Metro White)
            </button>
          </div>
        </div>

        {/* 3. Sleep Timer */}
        <div className="mb-5">
          <span className="text-xs font-bold uppercase tracking-wider opacity-60 block mb-2">
            Sleep Timer
          </span>
          <div className="flex gap-1.5 flex-wrap">
            {[null, 15, 30, 45, 60].map((mins) => {
              const isActive = sleepTimerMinutes === mins;
              return (
                <button
                  key={String(mins)}
                  onClick={() => handleSetSleepTimer(mins)}
                  className={`px-3 py-1.5 text-xs font-semibold uppercase transition-colors ${
                    isActive ? 'text-white' : 'bg-current/10 hover:bg-current/20'
                  }`}
                  style={isActive ? { backgroundColor: accentHex } : {}}
                >
                  {mins ? `${mins} min` : 'Off'}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Tap Sounds */}
        <div className="mb-5 flex items-center justify-between py-2 border-t border-current/10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider block">
              UI Navigation Clicks
            </span>
            <span className="text-[11px] opacity-60 font-light">
              Synthesized Windows Phone tap acoustic feedback
            </span>
          </div>
          <button
            onClick={() => {
              triggerTap();
              setPlayTapSound(!playTapSound);
            }}
            className="px-3 py-1 text-xs font-bold uppercase text-white"
            style={{ backgroundColor: playTapSound ? accentHex : '#444' }}
          >
            {playTapSound ? 'On' : 'Off'}
          </button>
        </div>

        {/* 5. Device Shell Chassis */}
        <div className="flex items-center justify-between py-2 border-t border-current/10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider block">
              Phone Frame Chassis
            </span>
            <span className="text-[11px] opacity-60 font-light">
              Lumia bezel with capacitive hardware buttons
            </span>
          </div>
          <button
            onClick={() => setIsDeviceFrameEnabled(!isDeviceFrameEnabled)}
            className="px-3 py-1 text-xs font-bold uppercase text-white"
            style={{ backgroundColor: isDeviceFrameEnabled ? accentHex : '#444' }}
          >
            {isDeviceFrameEnabled ? 'Enabled' : 'Full-bleed'}
          </button>
        </div>
      </div>
    </div>
  );
};
