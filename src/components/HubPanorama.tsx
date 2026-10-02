import React, { useRef } from 'react';
import {
  Heart,
  Play,
  Clock,
  Music,
  Plus,
  Radio,
  Disc,
  User,
  Sparkles,
  Search,
  X,
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { HubPivot, Track } from '../types/music';
import { ArtworkVisual } from './ArtworkVisual';

const PIVOTS: { id: HubPivot; label: string }[] = [
  { id: 'history', label: 'history' },
  { id: 'new', label: 'new' },
  { id: 'artists', label: 'artists' },
  { id: 'albums', label: 'albums' },
  { id: 'songs', label: 'songs' },
  { id: 'playlists', label: 'playlists' },
  { id: 'radio', label: 'radio' },
];

export const HubPanorama: React.FC = () => {
  const {
    tracks,
    albums,
    artists,
    playlists,
    historyTrackIds,
    activePivot,
    setActivePivot,
    playTrack,
    currentTrack,
    isPlaying,
    themeMode,
    accentHex,
    toggleFavorite,
    openArtist,
    openAlbum,
    openPlaylist,
    searchQuery,
    setSearchQuery,
    isSearchOpen,
    setIsSearchOpen,
    openJumpList,
    triggerTap,
  } = useMusic();

  const isDark = themeMode === 'dark';
  const containerRef = useRef<HTMLDivElement>(null);

  // Filtered tracks if search is open
  const filteredTracks = tracks.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.artist.toLowerCase().includes(q) ||
      t.album.toLowerCase().includes(q) ||
      t.genre.toLowerCase().includes(q)
    );
  });

  const historyTracks = historyTrackIds
    .map((id) => tracks.find((t) => t.id === id))
    .filter((t): t is Track => t !== undefined);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className={`flex-1 flex flex-col overflow-hidden select-none transition-colors ${
        isDark ? 'bg-black text-white' : 'bg-white text-black'
      }`}
    >
      {/* Search Charm Bar (if toggled) */}
      {isSearchOpen && (
        <div
          className={`px-4 py-2 border-b flex items-center gap-2 ${
            isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-100 border-neutral-200'
          }`}
        >
          <Search className="w-4 h-4 opacity-50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="search music, artists, albums..."
            autoFocus
            className="w-full bg-transparent text-sm focus:outline-none placeholder:opacity-40"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="p-1 opacity-60 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Signature Windows Phone Oversized Panorama Title Header */}
      <div className="pt-2 px-5 pb-1">
        <h1
          className="text-4xl sm:text-5xl font-segoe-light tracking-tight truncate leading-none text-current"
          style={{ letterSpacing: '-0.03em' }}
        >
          music<span className="font-extralight opacity-60">+videos</span>
        </h1>

        {/* Pivot Navigation Strip */}
        <div className="flex items-center gap-5 mt-3 overflow-x-auto no-scrollbar scroll-smooth">
          {PIVOTS.map((pivot) => {
            const isActive = activePivot === pivot.id;
            return (
              <button
                key={pivot.id}
                onClick={() => {
                  triggerTap();
                  setActivePivot(pivot.id);
                }}
                className={`text-xl sm:text-2xl font-segoe whitespace-nowrap transition-all pb-1 ${
                  isActive
                    ? 'font-medium opacity-100 scale-100'
                    : 'font-light opacity-35 hover:opacity-60 scale-95'
                }`}
                style={
                  isActive
                    ? {
                        borderBottom: `2.5px solid ${accentHex}`,
                      }
                    : {}
                }
              >
                {pivot.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pivot Content Area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 no-scrollbar">
        {/* PIVOT 1: HISTORY */}
        {activePivot === 'history' && (
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs uppercase tracking-widest opacity-60 font-semibold">
                recently played
              </span>
              <span className="text-xs opacity-40 font-mono">
                {historyTracks.length} items
              </span>
            </div>

            {historyTracks.length === 0 ? (
              <div className="py-12 text-center opacity-40 font-light">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No recent tracks played yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-current/10">
                {historyTracks.map((track) => {
                  const isCurrent = currentTrack?.id === track.id;
                  return (
                    <div
                      key={track.id}
                      onClick={() => playTrack(track)}
                      className="py-3 flex items-center justify-between group cursor-pointer hover:bg-current/5 transition-colors -mx-2 px-2"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <ArtworkVisual
                          title={track.title}
                          artist={track.artist}
                          gradient={track.coverGradient}
                          accentColor={accentHex}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <div
                            className={`text-sm font-semibold truncate leading-tight ${
                              isCurrent ? 'text-current' : ''
                            }`}
                            style={isCurrent ? { color: accentHex } : {}}
                          >
                            {track.title}
                          </div>
                          <div className="text-xs opacity-65 truncate font-light mt-0.5">
                            {track.artist} · {track.album}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 ml-2">
                        <span className="text-xs font-mono opacity-50">
                          {formatTime(track.duration)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(track.id);
                          }}
                          className="p-1 opacity-40 hover:opacity-100 transition-opacity"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              track.isFavorite
                                ? 'fill-current text-rose-500 opacity-100'
                                : ''
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PIVOT 2: NEW / FEATURED */}
        {activePivot === 'new' && (
          <div className="space-y-6 max-w-4xl">
            {/* Metro Showcase Tile Banner */}
            <div
              onClick={() => playTrack(tracks[0])}
              className="relative p-5 cursor-pointer metro-tile-press overflow-hidden shadow-md"
              style={{ background: tracks[0].coverGradient }}
            >
              <div className="relative z-10 text-white">
                <span className="text-[10px] uppercase font-bold tracking-widest bg-black/60 px-2 py-0.5 inline-block mb-2">
                  Featured Album Spotlight
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
                  {tracks[0].title}
                </h3>
                <p className="text-sm text-white/80 font-light mt-1">
                  by {tracks[0].artist} · {tracks[0].genre}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-black font-semibold text-xs uppercase tracking-wider">
                    <Play className="w-3.5 h-3.5 fill-current" /> Play Now
                  </span>
                  <span className="text-xs text-white/70 font-mono">
                    {formatTime(tracks[0].duration)}
                  </span>
                </div>
              </div>
            </div>

            {/* Fresh Grid */}
            <div>
              <div className="text-xs uppercase tracking-widest opacity-60 font-semibold mb-3">
                new additions
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {tracks.slice(1, 5).map((track) => (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track)}
                    className="cursor-pointer metro-tile-press group"
                  >
                    <ArtworkVisual
                      title={track.title}
                      artist={track.artist}
                      gradient={track.coverGradient}
                      accentColor={accentHex}
                      size="full"
                      className="aspect-square mb-2"
                      showPlayOverlay
                    />
                    <div className="text-xs font-semibold truncate leading-tight">
                      {track.title}
                    </div>
                    <div className="text-[11px] opacity-65 truncate font-light">
                      {track.artist}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PIVOT 3: ARTISTS */}
        {activePivot === 'artists' && (
          <div className="space-y-4 max-w-2xl">
            {/* Quick Jump List Header */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => openJumpList('artists')}
                className="w-8 h-8 flex items-center justify-center font-bold text-white text-xs hover:scale-105 active:scale-95 transition-transform"
                style={{ backgroundColor: accentHex }}
                title="Open alphabetical jump list"
              >
                A-Z
              </button>
              <span className="text-xs uppercase tracking-wider opacity-60 font-semibold">
                artists in collection
              </span>
            </div>

            <div className="divide-y divide-current/10">
              {artists.map((artist) => (
                <div
                  key={artist.id}
                  onClick={() => openArtist(artist)}
                  className="py-3.5 flex items-center justify-between cursor-pointer hover:bg-current/5 transition-colors -mx-2 px-2"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 shrink-0 flex items-center justify-center text-white font-bold text-base"
                      style={{ background: artist.gradient }}
                    >
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-base font-semibold leading-tight">
                        {artist.name}
                      </div>
                      <div className="text-xs opacity-60 font-light mt-0.5">
                        {artist.genre} · {artist.albumIds.length} albums
                      </div>
                    </div>
                  </div>

                  <span className="text-xs opacity-40 font-mono">
                    {
                      tracks.filter((t) => t.artist.toLowerCase() === artist.name.toLowerCase()).length
                    }{' '}
                    songs
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PIVOT 4: ALBUMS */}
        {activePivot === 'albums' && (
          <div className="space-y-4 max-w-4xl">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest opacity-60 font-semibold">
                albums
              </span>
              <span className="text-xs opacity-40 font-mono">
                {albums.length} albums
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {albums.map((album) => (
                <div
                  key={album.id}
                  onClick={() => openAlbum(album)}
                  className="cursor-pointer metro-tile-press group"
                >
                  <ArtworkVisual
                    title={album.title}
                    artist={album.artist}
                    gradient={album.coverGradient}
                    accentColor={accentHex}
                    size="full"
                    className="aspect-square mb-2"
                    showPlayOverlay
                  />
                  <div className="text-sm font-semibold truncate leading-tight">
                    {album.title}
                  </div>
                  <div className="text-xs opacity-65 truncate font-light mt-0.5">
                    {album.artist} · {album.year}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PIVOT 5: SONGS */}
        {activePivot === 'songs' && (
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openJumpList('songs')}
                  className="w-8 h-8 flex items-center justify-center font-bold text-white text-xs hover:scale-105 active:scale-95 transition-transform"
                  style={{ backgroundColor: accentHex }}
                  title="Alphabetical Jump List"
                >
                  #
                </button>
                <span className="text-xs uppercase tracking-widest opacity-60 font-semibold">
                  all tracks ({filteredTracks.length})
                </span>
              </div>

              <button
                onClick={() => tracks[0] && playTrack(tracks[0])}
                className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1 hover:underline"
                style={{ color: accentHex }}
              >
                <Play className="w-3 h-3 fill-current" /> Play All
              </button>
            </div>

            <div className="divide-y divide-current/10">
              {filteredTracks.map((track, idx) => {
                const isCurrent = currentTrack?.id === track.id;
                return (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track)}
                    className="py-3 flex items-center justify-between group cursor-pointer hover:bg-current/5 transition-colors -mx-2 px-2"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-5 text-right font-mono text-xs opacity-40 shrink-0">
                        {idx + 1}
                      </span>
                      <ArtworkVisual
                        title={track.title}
                        artist={track.artist}
                        gradient={track.coverGradient}
                        accentColor={accentHex}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <div
                          className="text-sm font-semibold truncate leading-tight"
                          style={isCurrent ? { color: accentHex } : {}}
                        >
                          {track.title}
                        </div>
                        <div className="text-xs opacity-65 truncate font-light mt-0.5">
                          {track.artist}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      <span className="text-xs font-mono opacity-50">
                        {formatTime(track.duration)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(track.id);
                        }}
                        className="p-1 opacity-40 hover:opacity-100 transition-opacity"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            track.isFavorite
                              ? 'fill-current text-rose-500 opacity-100'
                              : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PIVOT 6: PLAYLISTS */}
        {activePivot === 'playlists' && (
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest opacity-60 font-semibold">
                smart playlists & mixes
              </span>
              <span className="text-xs opacity-40 font-mono">
                {playlists.length} playlists
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {playlists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => openPlaylist(pl)}
                  className="p-4 cursor-pointer metro-tile-press flex flex-col justify-between h-32 relative overflow-hidden text-white"
                  style={{ background: pl.coverGradient }}
                >
                  <div className="flex items-center justify-between">
                    <Sparkles className="w-5 h-5 opacity-80" />
                    <span className="text-[10px] font-mono tracking-widest bg-black/40 px-2 py-0.5">
                      {pl.trackIds.length} tracks
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold leading-tight">
                      {pl.title}
                    </h3>
                    <p className="text-xs text-white/80 line-clamp-1 font-light mt-0.5">
                      {pl.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PIVOT 7: RADIO / GENERATOR */}
        {activePivot === 'radio' && (
          <div className="space-y-4 max-w-2xl">
            <div className="text-xs uppercase tracking-widest opacity-60 font-semibold">
              procedural synth radio stations
            </div>
            <p className="text-xs opacity-70 font-light">
              Continuous real-time synthesizers tuned to classic Windows Phone sonic aesthetics.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div
                onClick={() => playTrack(tracks[0])}
                className="p-4 cursor-pointer metro-tile-press text-white"
                style={{
                  background:
                    'linear-gradient(135deg, #D80073 0%, #0050EF 100%)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Radio className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Station 01
                  </span>
                </div>
                <div className="text-lg font-bold">Retrowave Drive</div>
                <p className="text-xs text-white/80 font-light mt-1">
                  124 BPM · Heavy analog arpeggios & kick
                </p>
              </div>

              <div
                onClick={() => playTrack(tracks[1])}
                className="p-4 cursor-pointer metro-tile-press text-white"
                style={{
                  background:
                    'linear-gradient(135deg, #1BA1E2 0%, #00ABA9 100%)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Radio className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Station 02
                  </span>
                </div>
                <div className="text-lg font-bold">Pacific Lo-Fi</div>
                <p className="text-xs text-white/80 font-light mt-1">
                  86 BPM · Relaxed jazz chords & vinyl crackle
                </p>
              </div>

              <div
                onClick={() => playTrack(tracks[2])}
                className="p-4 cursor-pointer metro-tile-press text-white"
                style={{
                  background:
                    'linear-gradient(135deg, #F09609 0%, #E51400 100%)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Radio className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Station 03
                  </span>
                </div>
                <div className="text-lg font-bold">Cyber Electro</div>
                <p className="text-xs text-white/80 font-light mt-1">
                  128 BPM · Pumping sidechain bass & leads
                </p>
              </div>

              <div
                onClick={() => playTrack(tracks[3])}
                className="p-4 cursor-pointer metro-tile-press text-white"
                style={{
                  background:
                    'linear-gradient(135deg, #008A00 0%, #8CBF26 100%)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Radio className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Station 04
                  </span>
                </div>
                <div className="text-lg font-bold">Redmond Ambient</div>
                <p className="text-xs text-white/80 font-light mt-1">
                  112 BPM · Glass bells, reverb pads & chime
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
