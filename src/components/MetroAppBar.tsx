import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  Repeat1,
  Search,
  Sliders,
  MoreHorizontal,
  Plus,
  Settings,
  Grid,
  Radio,
  Clock,
  Sparkles,
  ChevronUp,
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { ArtworkVisual } from './ArtworkVisual';

interface MetroAppBarProps {
  onOpenSettings: () => void;
  onOpenAddMusic: () => void;
  onOpenEqualizer: () => void;
  onOpenSleepTimer: () => void;
}

export const MetroAppBar: React.FC<MetroAppBarProps> = ({
  onOpenSettings,
  onOpenAddMusic,
  onOpenEqualizer,
  onOpenSleepTimer,
}) => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    nextTrack,
    prevTrack,
    isShuffle,
    toggleShuffle,
    repeatMode,
    cycleRepeat,
    currentView,
    setView,
    themeMode,
    accentHex,
    setIsSearchOpen,
    isSearchOpen,
    pinToStart,
    triggerTap,
    spatial8D,
    setSpatial8DValue,
  } = useMusic();

  const [isExpanded, setIsExpanded] = useState(false);

  const isDark = themeMode === 'dark';
  const bgColor = isDark ? 'bg-black/95 text-white border-t border-neutral-900' : 'bg-neutral-100/98 text-black border-t border-neutral-300';

  const toggleExpand = () => {
    triggerTap();
    setIsExpanded((prev) => !prev);
  };

  const handlePinCurrent = () => {
    triggerTap();
    if (currentTrack) {
      pinToStart({
        id: `tile-track-${currentTrack.id}`,
        type: 'track',
        title: currentTrack.title,
        subtitle: currentTrack.artist,
        size: 'medium',
        targetId: currentTrack.id,
        gradient: currentTrack.coverGradient,
      });
      setIsExpanded(false);
    }
  };

  return (
    <div className="relative z-40 shrink-0">
      {/* Mini Player Bar (shown when not on Now Playing screen and track exists) */}
      {currentTrack && currentView !== 'nowPlaying' && (
        <div
          onClick={() => {
            triggerTap();
            setView('nowPlaying');
          }}
          className={`px-3 py-2 flex items-center justify-between cursor-pointer border-b transition-colors ${
            isDark
              ? 'bg-neutral-950/90 border-neutral-800 text-white hover:bg-neutral-900'
              : 'bg-neutral-200/90 border-neutral-300 text-black hover:bg-neutral-200'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <ArtworkVisual
              title={currentTrack.title}
              artist={currentTrack.artist}
              gradient={currentTrack.coverGradient}
              accentColor={accentHex}
              size="sm"
              className="rounded-none"
            />
            <div className="min-w-0">
              <div className="text-xs font-semibold tracking-tight truncate leading-tight">
                {currentTrack.title}
              </div>
              <div className="text-[11px] opacity-70 truncate font-light">
                {currentTrack.artist}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isPlaying && (
              <div className="flex items-end gap-0.5 h-3 px-1 mr-1">
                <span
                  className="w-0.5 bg-current animate-pulse h-3"
                  style={{ animationDuration: '0.4s' }}
                />
                <span
                  className="w-0.5 bg-current animate-pulse h-2"
                  style={{ animationDuration: '0.6s' }}
                />
                <span
                  className="w-0.5 bg-current animate-pulse h-3.5"
                  style={{ animationDuration: '0.35s' }}
                />
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="w-8 h-8 rounded-full border border-current flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Expanded Menu Drawer (Metro Sheet) */}
      {isExpanded && (
        <>
          <div
            onClick={() => setIsExpanded(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30"
          />
          <div
            className={`absolute bottom-full left-0 right-0 z-40 p-4 shadow-2xl transition-all ${bgColor} border-b border-white/10`}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-current/10">
              <span className="text-xs font-bold uppercase tracking-widest opacity-60">
                Menu
              </span>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-xs opacity-60 hover:opacity-100 flex items-center gap-1"
              >
                <ChevronUp className="w-3.5 h-3.5 rotate-180" />
              </button>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => {
                  triggerTap();
                  setIsExpanded(false);
                  setView('startScreen');
                }}
                className="w-full text-left py-2.5 px-2 hover:bg-current/10 flex items-center gap-3 transition-colors text-sm font-light"
              >
                <Grid className="w-4 h-4 opacity-75" />
                <span>start screen</span>
              </button>

              <button
                onClick={() => {
                  triggerTap();
                  setIsExpanded(false);
                  setView('nowPlaying');
                }}
                className="w-full text-left py-2.5 px-2 hover:bg-current/10 flex items-center gap-3 transition-colors text-sm font-light"
              >
                <Radio className="w-4 h-4 opacity-75" />
                <span>now playing</span>
              </button>

              <button
                onClick={() => {
                  triggerTap();
                  setIsExpanded(false);
                  onOpenEqualizer();
                }}
                className="w-full text-left py-2.5 px-2 hover:bg-current/10 flex items-center gap-3 transition-colors text-sm font-light"
              >
                <Sliders className="w-4 h-4 opacity-75" />
                <span>equalizer & sound</span>
              </button>

              <button
                onClick={() => {
                  setSpatial8DValue(!spatial8D);
                  setIsExpanded(false);
                }}
                className="w-full text-left py-2.5 px-2 hover:bg-current/10 flex items-center justify-between transition-colors text-sm font-light"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 opacity-75" />
                  <span>8D spatial audio</span>
                </div>
                <span
                  className="text-xs px-2 py-0.5 text-white uppercase font-bold"
                  style={{ backgroundColor: spatial8D ? accentHex : '#555' }}
                >
                  {spatial8D ? 'On' : 'Off'}
                </span>
              </button>

              <button
                onClick={() => {
                  triggerTap();
                  setIsExpanded(false);
                  onOpenAddMusic();
                }}
                className="w-full text-left py-2.5 px-2 hover:bg-current/10 flex items-center gap-3 transition-colors text-sm font-light"
              >
                <Plus className="w-4 h-4 opacity-75" />
                <span>add music files</span>
              </button>

              {currentTrack && (
                <button
                  onClick={handlePinCurrent}
                  className="w-full text-left py-2.5 px-2 hover:bg-current/10 flex items-center gap-3 transition-colors text-sm font-light"
                >
                  <Grid className="w-4 h-4 opacity-75" />
                  <span>pin current to start</span>
                </button>
              )}

              <button
                onClick={() => {
                  triggerTap();
                  setIsExpanded(false);
                  onOpenSleepTimer();
                }}
                className="w-full text-left py-2.5 px-2 hover:bg-current/10 flex items-center gap-3 transition-colors text-sm font-light"
              >
                <Clock className="w-4 h-4 opacity-75" />
                <span>sleep timer</span>
              </button>

              <button
                onClick={() => {
                  triggerTap();
                  setIsExpanded(false);
                  onOpenSettings();
                }}
                className="w-full text-left py-2.5 px-2 hover:bg-current/10 flex items-center gap-3 transition-colors text-sm font-light"
              >
                <Settings className="w-4 h-4 opacity-75" />
                <span>settings & theme</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Signature Windows Phone Application Bar */}
      <div className={`h-14 px-3 flex items-center justify-between ${bgColor}`}>
        {/* Previous */}
        <button
          onClick={prevTrack}
          aria-label="Previous track"
          className="w-10 h-10 rounded-full border border-current/80 flex items-center justify-center hover:bg-current/10 active:scale-90 transition-transform"
        >
          <SkipBack className="w-4 h-4 fill-current" />
        </button>

        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="w-11 h-11 rounded-full border-2 border-current flex items-center justify-center hover:bg-current/10 active:scale-95 transition-transform"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        {/* Next */}
        <button
          onClick={nextTrack}
          aria-label="Next track"
          className="w-10 h-10 rounded-full border border-current/80 flex items-center justify-center hover:bg-current/10 active:scale-90 transition-transform"
        >
          <SkipForward className="w-4 h-4 fill-current" />
        </button>

        {/* Shuffle or Repeat depending on view */}
        {currentView === 'nowPlaying' ? (
          <button
            onClick={toggleShuffle}
            aria-label="Toggle shuffle"
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
              isShuffle ? 'border-current text-white' : 'border-current/40 opacity-50'
            }`}
            style={isShuffle ? { backgroundColor: accentHex } : {}}
          >
            <Shuffle className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => {
              triggerTap();
              setIsSearchOpen(!isSearchOpen);
            }}
            aria-label="Search"
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
              isSearchOpen ? 'border-current text-white' : 'border-current/80 hover:bg-current/10'
            }`}
            style={isSearchOpen ? { backgroundColor: accentHex } : {}}
          >
            <Search className="w-4 h-4" />
          </button>
        )}

        {/* Ellipsis Expander */}
        <button
          onClick={toggleExpand}
          aria-label="More options"
          className="w-8 h-10 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
