import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Smartphone, Maximize2 } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export const SystemTray: React.FC = () => {
  const { themeMode, isDeviceFrameEnabled, setIsDeviceFrameEnabled } = useMusic();
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const isDark = themeMode === 'dark';
  const textColor = isDark ? 'text-white/80' : 'text-black/85';

  return (
    <div
      className={`h-7 px-4 flex items-center justify-between text-[11px] font-medium tracking-tight select-none shrink-0 z-30 transition-colors ${textColor} ${
        isDark ? 'bg-black/90' : 'bg-white/95'
      }`}
    >
      {/* Left: Clock */}
      <div className="flex items-center gap-2">
        <span className="font-semibold font-mono">{timeStr || '12:30'}</span>
      </div>

      {/* Right: Cellular, Wi-Fi, Battery & View Mode */}
      <div className="flex items-center gap-3">
        {/* Toggle Phone Shell Frame */}
        <button
          onClick={() => setIsDeviceFrameEnabled(!isDeviceFrameEnabled)}
          title={isDeviceFrameEnabled ? 'Switch to Fullscreen View' : 'Switch to Phone Frame View'}
          className="opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1 cursor-pointer"
        >
          {isDeviceFrameEnabled ? (
            <Maximize2 className="w-3 h-3" />
          ) : (
            <Smartphone className="w-3 h-3" />
          )}
        </button>

        {/* Signal Bars */}
        <div className="flex items-end gap-0.5 h-2.5">
          <span className="w-0.5 h-1 bg-current opacity-80" />
          <span className="w-0.5 h-1.5 bg-current opacity-80" />
          <span className="w-0.5 h-2 bg-current opacity-80" />
          <span className="w-0.5 h-2.5 bg-current opacity-80" />
          <span className="text-[9px] font-bold ml-0.5 tracking-tighter">LTE</span>
        </div>

        {/* Wi-Fi */}
        <Wifi className="w-3 h-3 opacity-90 stroke-[2.5]" />

        {/* Battery */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono">92%</span>
          <div className="relative flex items-center">
            <Battery className="w-3.5 h-3.5 rotate-90" />
          </div>
        </div>
      </div>
    </div>
  );
};
