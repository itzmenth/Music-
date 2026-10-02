import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  Heart,
  Sliders,
  Sparkles,
  FileText,
  Activity,
  Image as ImageIcon,
  Share2,
  Volume2,
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { NowPlayingTab, LyricLine } from '../types/music';
import { ArtworkVisual } from './ArtworkVisual';
import { AudioVisualizer } from './AudioVisualizer';

export const NowPlayingView: React.FC = () => {
  const {
    currentTrack,
    currentTime,
    duration,
    seek,
    volume,
    setVolume,
    toggleFavorite,
    setView,
    accentHex,
    themeMode,
    isPlaying,
    eqBands,
    setEQBandGain,
    applyEQPreset,
    currentPreset,
    bassBoost,
    setBassBoostValue,
    spatial8D,
    setSpatial8DValue,
    triggerTap,
  } = useMusic();

  const [activeTab, setActiveTab] = useState<NowPlayingTab>('artwork');
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Find active lyric index
  const activeLyricIndex = currentTrack?.lyrics.reduce((acc, line, idx) => {
    if (currentTime >= line.time) {
      return idx;
    }
    return acc;
  }, 0) ?? 0;

  // Auto scroll active lyric into view
  useEffect(() => {
    if (activeTab === 'lyrics' && lyricsContainerRef.current) {
      const activeEl = lyricsContainerRef.current.children[activeLyricIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeLyricIndex, activeTab]);

  if (!currentTrack) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-lg font-light opacity-60">No track selected.</p>
        <button
          onClick={() => setView('hub')}
          className="mt-4 px-4 py-2 bg-white text-black font-semibold text-xs uppercase"
        >
          Return to Hub
        </button>
      </div>
    );
  }

  const isDark = themeMode === 'dark';

  return (
    <div className="flex-1 relative flex flex-col justify-between overflow-hidden select-none bg-black text-white">
      {/* Background Artist Ambient Backdrop with Ken Burns Zoom */}
      <div
        className="absolute inset-0 z-0 opacity-25 filter blur-2xl scale-110 pointer-events-none transition-transform duration-10000"
        style={{
          background: currentTrack.coverGradient,
          transform: isPlaying ? 'scale(1.25)' : 'scale(1.05)',
        }}
      />

      {/* Top Header Bar */}
      <div className="relative z-10 px-4 pt-3 pb-2 flex items-center justify-between">
        <button
          onClick={() => {
            triggerTap();
            setView('hub');
          }}
          className="flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-xs uppercase tracking-wider font-semibold">
            music+videos
          </span>
        </button>

        {/* Tab switchers in Now Playing */}
        <div className="flex items-center gap-1 bg-black/60 p-1 backdrop-blur-md">
          <button
            onClick={() => {
              triggerTap();
              setActiveTab('artwork');
            }}
            title="Artwork"
            className={`p-1.5 transition-colors ${
              activeTab === 'artwork' ? 'text-white' : 'opacity-40 hover:opacity-80'
            }`}
            style={activeTab === 'artwork' ? { backgroundColor: accentHex } : {}}
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              triggerTap();
              setActiveTab('visualizer');
            }}
            title="Frequency Spectrum Visualizer"
            className={`p-1.5 transition-colors ${
              activeTab === 'visualizer' ? 'text-white' : 'opacity-40 hover:opacity-80'
            }`}
            style={activeTab === 'visualizer' ? { backgroundColor: accentHex } : {}}
          >
            <Activity className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              triggerTap();
              setActiveTab('lyrics');
            }}
            title="Synchronized Lyrics"
            className={`p-1.5 transition-colors ${
              activeTab === 'lyrics' ? 'text-white' : 'opacity-40 hover:opacity-80'
            }`}
            style={activeTab === 'lyrics' ? { backgroundColor: accentHex } : {}}
          >
            <FileText className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              triggerTap();
              setActiveTab('equalizer');
            }}
            title="Graphic Equalizer"
            className={`p-1.5 transition-colors ${
              activeTab === 'equalizer' ? 'text-white' : 'opacity-40 hover:opacity-80'
            }`}
            style={activeTab === 'equalizer' ? { backgroundColor: accentHex } : {}}
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              triggerTap();
              setActiveTab('fx');
            }}
            title="Audio FX & 8D Spatial"
            className={`p-1.5 transition-colors ${
              activeTab === 'fx' ? 'text-white' : 'opacity-40 hover:opacity-80'
            }`}
            style={activeTab === 'fx' ? { backgroundColor: accentHex } : {}}
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Favorite */}
        <button
          onClick={() => toggleFavorite(currentTrack.id)}
          className="p-1 opacity-80 hover:opacity-100 transition-opacity"
        >
          <Heart
            className={`w-5 h-5 ${
              currentTrack.isFavorite
                ? 'fill-current text-rose-500'
                : 'text-white'
            }`}
          />
        </button>
      </div>

      {/* Main Center Stage */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 overflow-hidden">
        {/* TAB 1: ARTWORK */}
        {activeTab === 'artwork' && (
          <div className="flex flex-col items-center justify-center w-full max-w-sm">
            <div className="relative shadow-2xl overflow-hidden aspect-square w-64 sm:w-72">
              <ArtworkVisual
                title={currentTrack.title}
                artist={currentTrack.artist}
                gradient={currentTrack.coverGradient}
                accentColor={accentHex}
                size="full"
              />
            </div>
          </div>
        )}

        {/* TAB 2: SPECTRUM VISUALIZER */}
        {activeTab === 'visualizer' && (
          <div className="w-full max-w-md flex flex-col items-center justify-center px-2">
            <div className="w-full bg-black/50 p-4 border border-white/10 shadow-2xl">
              <div className="text-[11px] font-bold uppercase tracking-widest opacity-60 mb-2">
                Zune Graphic Spectrum
              </div>
              <AudioVisualizer height={180} barCount={40} />
            </div>
          </div>
        )}

        {/* TAB 3: SYNCHRONIZED LYRICS */}
        {activeTab === 'lyrics' && (
          <div
            ref={lyricsContainerRef}
            className="w-full max-w-md h-64 overflow-y-auto px-4 py-8 space-y-6 text-center no-scrollbar"
          >
            {currentTrack.lyrics.map((line, idx) => {
              const isActive = idx === activeLyricIndex;
              return (
                <div
                  key={idx}
                  onClick={() => seek(line.time)}
                  className={`cursor-pointer transition-all duration-300 font-segoe ${
                    isActive
                      ? 'text-lg sm:text-xl font-bold opacity-100 scale-105'
                      : 'text-sm font-light opacity-30 hover:opacity-60'
                  }`}
                  style={isActive ? { color: accentHex } : {}}
                >
                  {line.text}
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 4: 10-BAND GRAPHIC EQUALIZER */}
        {activeTab === 'equalizer' && (
          <div className="w-full max-w-md bg-black/75 p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                10-Band Graphic EQ
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 bg-white/10 uppercase">
                {currentPreset}
              </span>
            </div>

            {/* Presets Strip */}
            <div className="flex gap-1 overflow-x-auto no-scrollbar pb-2 mb-3">
              {(
                [
                  'flat',
                  'rock',
                  'pop',
                  'jazz',
                  'electronic',
                  'hiphop',
                  'bassboost',
                  'metro',
                ] as const
              ).map((preset) => (
                <button
                  key={preset}
                  onClick={() => applyEQPreset(preset)}
                  className={`px-2 py-0.5 text-[10px] uppercase font-semibold whitespace-nowrap transition-colors ${
                    currentPreset === preset
                      ? 'text-white'
                      : 'bg-white/10 opacity-60 hover:opacity-100'
                  }`}
                  style={currentPreset === preset ? { backgroundColor: accentHex } : {}}
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* EQ Sliders */}
            <div className="grid grid-cols-10 gap-1.5 items-end h-32 pt-2">
              {eqBands.map((band, idx) => (
                <div key={band.freq} className="flex flex-col items-center h-full">
                  <span className="text-[9px] font-mono opacity-50 mb-1">
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
                      className="w-20 -rotate-90 origin-center cursor-pointer accent-current"
                      style={{ accentColor: accentHex }}
                    />
                  </div>
                  <span className="text-[9px] font-mono opacity-60 mt-1">
                    {band.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: AUDIO FX */}
        {activeTab === 'fx' && (
          <div className="w-full max-w-sm bg-black/75 p-5 border border-white/10 space-y-5">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs uppercase font-bold tracking-wider opacity-70">
                  8D Spatial Sound
                </span>
                <button
                  onClick={() => setSpatial8DValue(!spatial8D)}
                  className="px-3 py-0.5 text-xs font-bold uppercase transition-colors"
                  style={{
                    backgroundColor: spatial8D ? accentHex : '#333',
                    color: '#fff',
                  }}
                >
                  {spatial8D ? 'Active' : 'Disabled'}
                </button>
              </div>
              <p className="text-[11px] opacity-50 font-light">
                Rotating dynamic stereo soundstage for headphones.
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs uppercase font-bold tracking-wider opacity-70">
                  Bass Boost
                </span>
                <span className="text-xs font-mono opacity-80">+{bassBoost} dB</span>
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

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs uppercase font-bold tracking-wider opacity-70">
                  Output Gain
                </span>
                <span className="text-xs font-mono opacity-80">
                  {Math.round(volume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: accentHex }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Typography & Scrubber Zone */}
      <div className="relative z-10 px-6 pb-4 pt-2">
        {/* Huge Iconic Metro Typography */}
        <div className="mb-3 text-left">
          <h2
            className="text-2xl sm:text-3xl font-segoe font-bold tracking-tight truncate leading-tight text-white"
            style={{ textWrap: 'balance' }}
          >
            {currentTrack.title}
          </h2>
          <div className="text-lg sm:text-xl font-segoe-light opacity-80 truncate text-white/90">
            {currentTrack.artist}
          </div>
          <div className="text-xs opacity-50 uppercase tracking-widest font-mono mt-0.5">
            {currentTrack.album} · {currentTrack.genre}
          </div>
        </div>

        {/* Metro Track Progress Bar */}
        <div className="space-y-1">
          <div className="relative flex items-center group cursor-pointer">
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="1"
              value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              className="w-full h-1 bg-white/20 appearance-none rounded-none cursor-pointer outline-none"
              style={{
                accentColor: accentHex,
              }}
            />
          </div>

          <div className="flex justify-between items-center text-xs font-mono tabular-nums opacity-60">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
