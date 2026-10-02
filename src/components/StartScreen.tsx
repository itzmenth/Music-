import React, { useState, useEffect } from 'react';
import {
  Play,
  Music,
  Users,
  Disc,
  Radio,
  Sliders,
  Settings,
  X,
  Sparkles,
  Heart,
  Plus,
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { ArtworkVisual } from './ArtworkVisual';

export const StartScreen: React.FC = () => {
  const {
    pinnedTiles,
    unpinFromStart,
    currentTrack,
    isPlaying,
    accentHex,
    themeMode,
    setView,
    setActivePivot,
    playTrack,
    tracks,
    triggerTap,
  } = useMusic();

  // Flip state for Live Tile 3D effect
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    // 3D tile flip animation every 6 seconds
    const interval = setInterval(() => {
      setIsFlipped((prev) => !prev);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const isDark = themeMode === 'dark';

  return (
    <div
      className={`flex-1 flex flex-col overflow-y-auto px-4 py-5 select-none no-scrollbar ${
        isDark ? 'bg-black text-white' : 'bg-neutral-100 text-black'
      }`}
    >
      {/* Start Screen Title */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-segoe-light tracking-tight">Start</h1>
          <p className="text-xs opacity-60 font-light">Windows Phone Live Tiles</p>
        </div>
        <button
          onClick={() => {
            triggerTap();
            setView('hub');
          }}
          className="text-xs uppercase font-bold tracking-wider px-3 py-1.5 transition-colors text-white"
          style={{ backgroundColor: accentHex }}
        >
          Open Hub →
        </button>
      </div>

      {/* Grid of Dynamic Live Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* TILE 1: NOW PLAYING LIVE TILE (3D Perspective Flip) */}
        <div
          onClick={() => {
            triggerTap();
            setView('nowPlaying');
          }}
          className="col-span-2 aspect-[2/1] relative perspective-1000 cursor-pointer metro-tile-press"
        >
          <div
            className={`w-full h-full relative transform-style-3d transition-transform duration-700 ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* Front Side: Album Art & Title */}
            <div
              className="absolute inset-0 backface-hidden p-3 flex flex-col justify-between text-white shadow-md"
              style={{
                background: currentTrack
                  ? currentTrack.coverGradient
                  : 'linear-gradient(135deg, #D80073 0%, #0050EF 100%)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-black/40 px-1.5 py-0.5">
                  Now Playing
                </span>
                {isPlaying && (
                  <div className="flex items-end gap-0.5 h-3">
                    <span className="w-0.5 bg-white animate-pulse h-3" />
                    <span className="w-0.5 bg-white animate-pulse h-2" />
                    <span className="w-0.5 bg-white animate-pulse h-3.5" />
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xl font-bold leading-tight truncate">
                  {currentTrack?.title || 'Windows Music'}
                </h3>
                <p className="text-xs text-white/80 truncate font-light">
                  {currentTrack?.artist || 'Ready to play'}
                </p>
              </div>
            </div>

            {/* Back Side: Live Visualizer & Quotes */}
            <div
              className="absolute inset-0 backface-hidden rotate-y-180 p-3 flex flex-col justify-between text-white shadow-md"
              style={{ backgroundColor: accentHex }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-black/40 px-1.5 py-0.5">
                  Zune Audio Hub
                </span>
                <Music className="w-3.5 h-3.5 opacity-80" />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-light italic line-clamp-2">
                  "{currentTrack?.lyrics[1]?.text || 'Pure high-fidelity sound'}"
                </p>
                <div className="text-[10px] font-mono opacity-80 uppercase tracking-widest">
                  Tap to open player
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TILE 2: MUSIC+VIDEOS HUB SHORTCUT */}
        <div
          onClick={() => {
            triggerTap();
            setView('hub');
          }}
          className="aspect-square p-3 cursor-pointer metro-tile-press flex flex-col justify-between text-white shadow-md"
          style={{ backgroundColor: accentHex }}
        >
          <Music className="w-6 h-6 opacity-90" />
          <div>
            <h3 className="text-base font-bold leading-tight">music+videos</h3>
            <p className="text-[10px] opacity-75 font-light">Collection Hub</p>
          </div>
        </div>

        {/* TILE 3: ARTISTS */}
        <div
          onClick={() => {
            triggerTap();
            setActivePivot('artists');
            setView('hub');
          }}
          className="aspect-square p-3 cursor-pointer metro-tile-press flex flex-col justify-between text-white shadow-md bg-neutral-800"
        >
          <Users className="w-6 h-6 opacity-90" />
          <div>
            <h3 className="text-base font-bold leading-tight">artists</h3>
            <p className="text-[10px] opacity-75 font-light">4 cataloged</p>
          </div>
        </div>

        {/* TILE 4: SMARTDJ MIX */}
        <div
          onClick={() => {
            triggerTap();
            setActivePivot('playlists');
            setView('hub');
          }}
          className="col-span-2 aspect-[2/1] p-3 cursor-pointer metro-tile-press flex flex-col justify-between text-white shadow-md"
          style={{
            background: 'linear-gradient(135deg, #F09609 0%, #D80073 100%)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-black/40 px-1.5 py-0.5">
              Smart Playlist
            </span>
            <Sparkles className="w-4 h-4 opacity-80" />
          </div>
          <div>
            <h3 className="text-xl font-bold leading-tight">Zune SmartDJ</h3>
            <p className="text-xs text-white/80 font-light">
              Algorithmic music flow matching your tempo
            </p>
          </div>
        </div>

        {/* TILE 5: FAVORITES */}
        <div
          onClick={() => {
            triggerTap();
            setActivePivot('songs');
            setView('hub');
          }}
          className="aspect-square p-3 cursor-pointer metro-tile-press flex flex-col justify-between text-white shadow-md bg-rose-700"
        >
          <Heart className="w-6 h-6 fill-current opacity-90" />
          <div>
            <h3 className="text-base font-bold leading-tight">favorites</h3>
            <p className="text-[10px] opacity-75 font-light">
              {tracks.filter((t) => t.isFavorite).length} tracks
            </p>
          </div>
        </div>

        {/* TILE 6: RADIO */}
        <div
          onClick={() => {
            triggerTap();
            setActivePivot('radio');
            setView('hub');
          }}
          className="aspect-square p-3 cursor-pointer metro-tile-press flex flex-col justify-between text-white shadow-md bg-cyan-700"
        >
          <Radio className="w-6 h-6 opacity-90" />
          <div>
            <h3 className="text-base font-bold leading-tight">radio</h3>
            <p className="text-[10px] opacity-75 font-light">4 stations</p>
          </div>
        </div>

        {/* PINNED CUSTOM TILES */}
        {pinnedTiles
          .filter((t) => t.type !== 'now_playing' && t.type !== 'music_hub')
          .map((tile) => (
            <div
              key={tile.id}
              onClick={() => {
                triggerTap();
                if (tile.type === 'track' && tile.targetId) {
                  const trk = tracks.find((t) => t.id === tile.targetId);
                  if (trk) playTrack(trk);
                } else if (tile.type === 'album') {
                  setActivePivot('albums');
                  setView('hub');
                } else if (tile.type === 'playlist') {
                  setActivePivot('playlists');
                  setView('hub');
                }
              }}
              className="group relative aspect-square p-3 cursor-pointer metro-tile-press flex flex-col justify-between text-white shadow-md"
              style={{
                background: tile.gradient || accentHex,
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  unpinFromStart(tile.id);
                }}
                title="Unpin from start"
                className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 p-1 bg-black/60 text-white rounded-none hover:bg-black transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>

              <Disc className="w-5 h-5 opacity-80" />

              <div>
                <h4 className="text-sm font-bold leading-tight truncate">
                  {tile.title}
                </h4>
                {tile.subtitle && (
                  <p className="text-[10px] opacity-75 truncate font-light">
                    {tile.subtitle}
                  </p>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
