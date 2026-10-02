import React from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { SystemTray } from './SystemTray';

interface PhoneShellProps {
  children: React.ReactNode;
}

export const PhoneShell: React.FC<PhoneShellProps> = ({ children }) => {
  const {
    isDeviceFrameEnabled,
    currentView,
    setView,
    isSearchOpen,
    setIsSearchOpen,
    accentHex,
    themeMode,
    triggerTap,
  } = useMusic();

  const handleBack = () => {
    triggerTap();
    if (currentView === 'nowPlaying' || currentView === 'artistDetail' || currentView === 'albumDetail' || currentView === 'playlistDetail') {
      setView('hub');
    } else if (currentView === 'startScreen') {
      setView('hub');
    }
  };

  const handleStart = () => {
    triggerTap();
    if (currentView === 'startScreen') {
      setView('hub');
    } else {
      setView('startScreen');
    }
  };

  const handleSearch = () => {
    triggerTap();
    if (currentView !== 'hub') {
      setView('hub');
    }
    setIsSearchOpen(!isSearchOpen);
  };

  if (!isDeviceFrameEnabled) {
    // Full-bleed mode
    return (
      <div className="min-h-screen w-full flex flex-col bg-black overflow-hidden font-segoe">
        <SystemTray />
        <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  // Authentic Lumia Smartphone Shell Mode
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6 bg-neutral-950 font-segoe select-none">
      <div
        className="w-full max-w-[430px] h-[860px] max-h-[96vh] rounded-[44px] p-3 shadow-2xl relative flex flex-col transition-all duration-300"
        style={{
          background: `radial-gradient(ellipse at top, ${accentHex} 0%, #151515 55%, #080808 100%)`,
          boxShadow: `0 25px 60px -15px ${accentHex}33, 0 10px 25px rgba(0,0,0,0.8)`,
        }}
      >
        {/* Top Speaker Bar & Front Camera */}
        <div className="h-6 flex items-center justify-center relative shrink-0">
          <div className="w-12 h-1 bg-black/60 rounded-full" />
          <div className="absolute right-12 w-2.5 h-2.5 bg-neutral-800/80 rounded-full border border-black/40" />
        </div>

        {/* Screen Bezel Window */}
        <div className="flex-1 flex flex-col bg-black rounded-[28px] overflow-hidden relative shadow-inner border border-white/5">
          <SystemTray />
          <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
            {children}
          </div>
        </div>

        {/* Bottom Capacitive Touch Bar: Back, Windows Start, Search */}
        <div className="h-12 flex items-center justify-around px-8 shrink-0 text-white/70">
          {/* Back Button */}
          <button
            onClick={handleBack}
            aria-label="Back"
            className="p-2 hover:text-white active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>

          {/* Windows Start Button (Four tilted rectangles) */}
          <button
            onClick={handleStart}
            aria-label="Start Screen"
            className="p-2 hover:text-white active:scale-90 transition-transform"
          >
            <svg
              className="w-5 h-5 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
            </svg>
          </button>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            aria-label="Search"
            className="p-2 hover:text-white active:scale-90 transition-transform"
          >
            <Search className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>
      </div>
    </div>
  );
};
