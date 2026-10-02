import React from 'react';
import { ChevronLeft, Play, Heart, Plus, Grid, Clock } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { ArtworkVisual } from './ArtworkVisual';

export const ArtistDetailView: React.FC = () => {
  const {
    selectedArtist,
    tracks,
    albums,
    playTrack,
    currentTrack,
    setView,
    openAlbum,
    pinToStart,
    accentHex,
    themeMode,
    triggerTap,
  } = useMusic();

  if (!selectedArtist) return null;

  const isDark = themeMode === 'dark';
  const artistTracks = tracks.filter(
    (t) => t.artist.toLowerCase() === selectedArtist.name.toLowerCase()
  );
  const artistAlbums = albums.filter(
    (a) => a.artist.toLowerCase() === selectedArtist.name.toLowerCase()
  );

  return (
    <div
      className={`flex-1 flex flex-col overflow-y-auto select-none no-scrollbar ${
        isDark ? 'bg-black text-white' : 'bg-white text-black'
      }`}
    >
      {/* Hero Header Banner */}
      <div
        className="relative p-6 pt-4 text-white flex flex-col justify-between min-h-[160px]"
        style={{ background: selectedArtist.gradient }}
      >
        <button
          onClick={() => {
            triggerTap();
            setView('hub');
          }}
          className="flex items-center gap-1 opacity-80 hover:opacity-100 text-xs uppercase tracking-wider font-semibold w-fit"
        >
          <ChevronLeft className="w-4 h-4" /> artists
        </button>

        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest bg-black/40 px-2 py-0.5 inline-block mb-1">
            {selectedArtist.genre}
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {selectedArtist.name}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-6 max-w-2xl">
        {/* Bio */}
        <div>
          <h3 className="text-xs uppercase tracking-widest opacity-60 font-semibold mb-1">
            biography
          </h3>
          <p className="text-sm font-light opacity-80 leading-relaxed">
            {selectedArtist.bio}
          </p>
        </div>

        {/* Albums by Artist */}
        <div>
          <h3 className="text-xs uppercase tracking-widest opacity-60 font-semibold mb-3">
            discography
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {artistAlbums.map((album) => (
              <div
                key={album.id}
                onClick={() => openAlbum(album)}
                className="cursor-pointer metro-tile-press"
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
                <div className="text-xs opacity-60 font-mono mt-0.5">
                  {album.year}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Songs */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs uppercase tracking-widest opacity-60 font-semibold">
              top tracks
            </h3>
            {artistTracks.length > 0 && (
              <button
                onClick={() => playTrack(artistTracks[0])}
                className="text-xs font-semibold uppercase flex items-center gap-1 hover:underline"
                style={{ color: accentHex }}
              >
                <Play className="w-3 h-3 fill-current" /> Play All
              </button>
            )}
          </div>

          <div className="divide-y divide-current/10">
            {artistTracks.map((track) => (
              <div
                key={track.id}
                onClick={() => playTrack(track)}
                className="py-3 flex items-center justify-between cursor-pointer hover:bg-current/5 transition-colors -mx-2 px-2"
              >
                <div className="flex items-center gap-3 min-w-0">
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
                      style={currentTrack?.id === track.id ? { color: accentHex } : {}}
                    >
                      {track.title}
                    </div>
                    <div className="text-xs opacity-60 truncate font-light">
                      {track.album}
                    </div>
                  </div>
                </div>

                <span className="text-xs font-mono opacity-50 ml-2">
                  {Math.floor(track.duration / 60)}:
                  {(track.duration % 60).toString().padStart(2, '0')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const AlbumDetailView: React.FC = () => {
  const {
    selectedAlbum,
    tracks,
    playTrack,
    currentTrack,
    setView,
    pinToStart,
    accentHex,
    themeMode,
    triggerTap,
  } = useMusic();

  if (!selectedAlbum) return null;

  const isDark = themeMode === 'dark';
  const albumTracks = selectedAlbum.trackIds
    .map((id) => tracks.find((t) => t.id === id))
    .filter((t) => t !== undefined);

  return (
    <div
      className={`flex-1 flex flex-col overflow-y-auto select-none no-scrollbar ${
        isDark ? 'bg-black text-white' : 'bg-white text-black'
      }`}
    >
      {/* Top Bar */}
      <div className="px-5 pt-3 pb-2 flex items-center justify-between">
        <button
          onClick={() => {
            triggerTap();
            setView('hub');
          }}
          className="flex items-center gap-1 opacity-80 hover:opacity-100 text-xs uppercase tracking-wider font-semibold"
        >
          <ChevronLeft className="w-4 h-4" /> albums
        </button>

        <button
          onClick={() => {
            pinToStart({
              id: `tile-album-${selectedAlbum.id}`,
              type: 'album',
              title: selectedAlbum.title,
              subtitle: selectedAlbum.artist,
              size: 'medium',
              targetId: selectedAlbum.id,
              gradient: selectedAlbum.coverGradient,
            });
          }}
          className="text-xs font-semibold uppercase flex items-center gap-1 opacity-70 hover:opacity-100"
        >
          <Grid className="w-3.5 h-3.5" /> pin to start
        </button>
      </div>

      {/* Album Info */}
      <div className="px-5 py-3 flex gap-4 items-center">
        <ArtworkVisual
          title={selectedAlbum.title}
          artist={selectedAlbum.artist}
          gradient={selectedAlbum.coverGradient}
          accentColor={accentHex}
          size="md"
          className="shadow-lg aspect-square"
        />

        <div className="min-w-0">
          <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">
            {selectedAlbum.genre} · {selectedAlbum.year}
          </span>
          <h2 className="text-2xl font-bold tracking-tight leading-tight truncate">
            {selectedAlbum.title}
          </h2>
          <div className="text-sm font-light opacity-80 mt-0.5 truncate">
            {selectedAlbum.artist}
          </div>

          {albumTracks.length > 0 && (
            <button
              onClick={() => playTrack(albumTracks[0])}
              className="mt-3 px-3 py-1 text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              style={{ backgroundColor: accentHex }}
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Play Album
            </button>
          )}
        </div>
      </div>

      {/* Track List */}
      <div className="p-5 max-w-2xl">
        <div className="text-xs uppercase tracking-widest opacity-60 font-semibold mb-2">
          tracks ({albumTracks.length})
        </div>

        <div className="divide-y divide-current/10">
          {albumTracks.map((track, idx) => (
            <div
              key={track.id}
              onClick={() => playTrack(track)}
              className="py-3 flex items-center justify-between cursor-pointer hover:bg-current/5 transition-colors -mx-2 px-2"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-5 text-right font-mono text-xs opacity-40">
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <div
                    className="text-sm font-semibold truncate leading-tight"
                    style={currentTrack?.id === track.id ? { color: accentHex } : {}}
                  >
                    {track.title}
                  </div>
                  <div className="text-xs opacity-60 font-light truncate mt-0.5">
                    {track.artist}
                  </div>
                </div>
              </div>

              <span className="text-xs font-mono opacity-50">
                {Math.floor(track.duration / 60)}:
                {(track.duration % 60).toString().padStart(2, '0')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const PlaylistDetailView: React.FC = () => {
  const {
    selectedPlaylist,
    tracks,
    playTrack,
    currentTrack,
    setView,
    pinToStart,
    accentHex,
    themeMode,
    triggerTap,
  } = useMusic();

  if (!selectedPlaylist) return null;

  const isDark = themeMode === 'dark';
  const playlistTracks = selectedPlaylist.trackIds
    .map((id) => tracks.find((t) => t.id === id))
    .filter((t) => t !== undefined);

  return (
    <div
      className={`flex-1 flex flex-col overflow-y-auto select-none no-scrollbar ${
        isDark ? 'bg-black text-white' : 'bg-white text-black'
      }`}
    >
      <div
        className="p-6 text-white flex flex-col justify-between min-h-[150px]"
        style={{ background: selectedPlaylist.coverGradient }}
      >
        <button
          onClick={() => {
            triggerTap();
            setView('hub');
          }}
          className="flex items-center gap-1 opacity-80 hover:opacity-100 text-xs uppercase tracking-wider font-semibold w-fit"
        >
          <ChevronLeft className="w-4 h-4" /> playlists
        </button>

        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest bg-black/40 px-2 py-0.5 inline-block mb-1">
            {selectedPlaylist.isBuiltin ? 'Smart Playlist' : 'User Playlist'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {selectedPlaylist.title}
          </h1>
          <p className="text-xs text-white/80 font-light mt-1 max-w-md">
            {selectedPlaylist.description}
          </p>
        </div>
      </div>

      <div className="p-5 max-w-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs uppercase tracking-widest opacity-60 font-semibold">
            {playlistTracks.length} tracks
          </div>
          {playlistTracks.length > 0 && (
            <button
              onClick={() => playTrack(playlistTracks[0])}
              className="text-xs font-semibold uppercase flex items-center gap-1 hover:underline"
              style={{ color: accentHex }}
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Play All
            </button>
          )}
        </div>

        <div className="divide-y divide-current/10">
          {playlistTracks.map((track, idx) => (
            <div
              key={track.id}
              onClick={() => playTrack(track)}
              className="py-3 flex items-center justify-between cursor-pointer hover:bg-current/5 transition-colors -mx-2 px-2"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-5 text-right font-mono text-xs opacity-40">
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
                    style={currentTrack?.id === track.id ? { color: accentHex } : {}}
                  >
                    {track.title}
                  </div>
                  <div className="text-xs opacity-60 font-light truncate mt-0.5">
                    {track.artist}
                  </div>
                </div>
              </div>

              <span className="text-xs font-mono opacity-50">
                {Math.floor(track.duration / 60)}:
                {(track.duration % 60).toString().padStart(2, '0')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
