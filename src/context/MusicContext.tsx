import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Track,
  Album,
  Artist,
  Playlist,
  MetroAccent,
  AppView,
  HubPivot,
  EqualizerBand,
  EqualizerPreset,
  PinnedTile,
} from '../types/music';
import {
  INITIAL_TRACKS,
  INITIAL_ALBUMS,
  INITIAL_ARTISTS,
  INITIAL_PLAYLISTS,
} from '../data/initialTracks';
import { AudioEngine, EQ_FREQUENCIES } from '../services/audioEngine';

export const METRO_ACCENT_HEX: Record<MetroAccent, string> = {
  mango: '#F09609',
  cyan: '#1BA1E2',
  magenta: '#D80073',
  lime: '#8CBF26',
  cobalt: '#0050EF',
  crimson: '#E51400',
  emerald: '#008A00',
  amber: '#F0A30A',
  violet: '#AA00FF',
  teal: '#00ABA9',
};

const DEFAULT_PINNED_TILES: PinnedTile[] = [
  {
    id: 'tile-now-playing',
    type: 'now_playing',
    title: 'music+videos',
    subtitle: 'Now playing',
    size: 'wide',
  },
  {
    id: 'tile-artists',
    type: 'music_hub',
    title: 'artists',
    subtitle: '4 in collection',
    size: 'medium',
  },
  {
    id: 'tile-smartdj',
    type: 'playlist',
    title: 'Zune SmartDJ',
    subtitle: 'Dynamic mix',
    size: 'medium',
    targetId: 'pl-smartdj',
    gradient: 'linear-gradient(135deg, #F09609 0%, #D80073 100%)',
  },
  {
    id: 'tile-favorites',
    type: 'playlist',
    title: 'favorites',
    subtitle: 'Marked with heart',
    size: 'small',
    targetId: 'pl-favorites',
    gradient: 'linear-gradient(135deg, #D80073 0%, #0050EF 100%)',
  },
  {
    id: 'tile-album-1',
    type: 'album',
    title: 'Neon Horizon',
    subtitle: 'Lumina Noir',
    size: 'small',
    targetId: 'Neon Horizon',
    gradient: 'linear-gradient(135deg, #FF007A 0%, #7B00FF 50%, #00F0FF 100%)',
  },
];

interface MusicContextType {
  tracks: Track[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  accent: MetroAccent;
  accentHex: string;
  themeMode: 'dark' | 'light';
  playTapSound: boolean;
  currentView: AppView;
  activePivot: HubPivot;
  selectedArtist: Artist | null;
  selectedAlbum: Album | null;
  selectedPlaylist: Playlist | null;
  pinnedTiles: PinnedTile[];
  eqBands: EqualizerBand[];
  currentPreset: EqualizerPreset;
  bassBoost: number;
  spatial8D: boolean;
  searchQuery: string;
  isSearchOpen: boolean;
  isJumpListOpen: boolean;
  jumpListCategory: 'artists' | 'albums' | 'songs';
  isDeviceFrameEnabled: boolean;
  historyTrackIds: string[];

  // Actions
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  toggleFavorite: (trackId: string) => void;
  setAccent: (accent: MetroAccent) => void;
  setThemeMode: (mode: 'dark' | 'light') => void;
  setPlayTapSound: (enabled: boolean) => void;
  setEQBandGain: (index: number, gain: number) => void;
  applyEQPreset: (preset: EqualizerPreset) => void;
  setBassBoostValue: (val: number) => void;
  setSpatial8DValue: (enabled: boolean) => void;
  pinToStart: (tile: PinnedTile) => void;
  unpinFromStart: (tileId: string) => void;
  addCustomTrack: (file: File) => Promise<void>;
  createPlaylist: (title: string, description: string, trackIds: string[]) => void;
  setView: (view: AppView) => void;
  setActivePivot: (pivot: HubPivot) => void;
  openArtist: (artist: Artist) => void;
  openAlbum: (album: Album) => void;
  openPlaylist: (playlist: Playlist) => void;
  setSearchQuery: (query: string) => void;
  setIsSearchOpen: (open: boolean) => void;
  openJumpList: (category: 'artists' | 'albums' | 'songs') => void;
  closeJumpList: () => void;
  setIsDeviceFrameEnabled: (enabled: boolean) => void;
  triggerTap: () => void;
  audioEngine: AudioEngine;
}

const MusicContext = createContext<MusicContextType | null>(null);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioEngine = useMemo(() => AudioEngine.getInstance(), []);

  // Library State
  const [tracks, setTracks] = useState<Track[]>(() => {
    const saved = localStorage.getItem('wm_tracks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return INITIAL_TRACKS;
  });

  const [albums, setAlbums] = useState<Album[]>(INITIAL_ALBUMS);
  const [artists, setArtists] = useState<Artist[]>(INITIAL_ARTISTS);
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem('wm_playlists');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return INITIAL_PLAYLISTS;
  });

  const [historyTrackIds, setHistoryTrackIds] = useState<string[]>(['track-1', 'track-3', 'track-2']);

  // Playback State
  const [currentTrack, setCurrentTrack] = useState<Track | null>(INITIAL_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(INITIAL_TRACKS[0].duration);
  const [volume, setVolumeState] = useState(0.85);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');

  // Navigation & View State
  const [currentView, setCurrentView] = useState<AppView>('hub');
  const [activePivot, setActivePivotState] = useState<HubPivot>('history');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  // Search & Jump List
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isJumpListOpen, setIsJumpListOpen] = useState(false);
  const [jumpListCategory, setJumpListCategory] = useState<'artists' | 'albums' | 'songs'>('songs');

  // Personalization
  const [accent, setAccentState] = useState<MetroAccent>(() => {
    return (localStorage.getItem('wm_accent') as MetroAccent) || 'magenta';
  });
  const [themeMode, setThemeModeState] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('wm_theme') as 'dark' | 'light') || 'dark';
  });
  const [playTapSound, setPlayTapSoundState] = useState(true);
  const [isDeviceFrameEnabled, setIsDeviceFrameEnabledState] = useState(false);

  // Live Tiles
  const [pinnedTiles, setPinnedTiles] = useState<PinnedTile[]>(() => {
    const saved = localStorage.getItem('wm_pinned_tiles');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEFAULT_PINNED_TILES;
  });

  // Equalizer
  const [eqBands, setEqBands] = useState<EqualizerBand[]>(() =>
    EQ_FREQUENCIES.map((freq) => ({
      freq,
      label: freq >= 1000 ? `${freq / 1000}k` : `${freq}`,
      gain: 0,
    }))
  );
  const [currentPreset, setCurrentPreset] = useState<EqualizerPreset>('flat');
  const [bassBoost, setBassBoostState] = useState(0);
  const [spatial8D, setSpatial8DState] = useState(false);

  const accentHex = METRO_ACCENT_HEX[accent] || '#D80073';

  // Haptic UI tap sound
  const triggerTap = useCallback(() => {
    if (playTapSound) {
      audioEngine.playClickSound();
    }
  }, [audioEngine, playTapSound]);

  // Audio Engine Callbacks
  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handleTrackEnded = useCallback(() => {
    if (repeatMode === 'one' && currentTrack) {
      audioEngine.playTrack(currentTrack, 0);
      setIsPlaying(true);
      return;
    }

    // Auto play next track
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack?.id);
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * tracks.length);
      const nextT = tracks[randomIndex];
      playTrack(nextT);
    } else if (currentIndex < tracks.length - 1) {
      playTrack(tracks[currentIndex + 1]);
    } else if (repeatMode === 'all' && tracks.length > 0) {
      playTrack(tracks[0]);
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [tracks, currentTrack, repeatMode, isShuffle, audioEngine]);

  useEffect(() => {
    audioEngine.setCallbacks(handleTimeUpdate, handleTrackEnded);
  }, [audioEngine, handleTimeUpdate, handleTrackEnded]);

  // Play a specific track
  const playTrack = useCallback(
    (track: Track) => {
      triggerTap();
      setCurrentTrack(track);
      setDuration(track.duration);
      setCurrentTime(0);
      setIsPlaying(true);
      audioEngine.playTrack(track, 0);

      // Record to history
      setHistoryTrackIds((prev) => [track.id, ...prev.filter((id) => id !== track.id)].slice(0, 20));

      // Increase playCount
      setTracks((prev) =>
        prev.map((t) => (t.id === track.id ? { ...t, playCount: (t.playCount || 0) + 1 } : t))
      );
    },
    [audioEngine, triggerTap]
  );

  const togglePlay = useCallback(() => {
    triggerTap();
    if (!currentTrack) {
      if (tracks.length > 0) playTrack(tracks[0]);
      return;
    }

    if (isPlaying) {
      audioEngine.pause();
      setIsPlaying(false);
    } else {
      audioEngine.resume();
      setIsPlaying(true);
    }
  }, [currentTrack, isPlaying, audioEngine, playTrack, tracks, triggerTap]);

  const nextTrack = useCallback(() => {
    triggerTap();
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);

    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * tracks.length);
      playTrack(tracks[randomIndex]);
    } else {
      const nextIndex = (currentIndex + 1) % tracks.length;
      playTrack(tracks[nextIndex]);
    }
  }, [currentTrack, tracks, isShuffle, playTrack, triggerTap]);

  const prevTrack = useCallback(() => {
    triggerTap();
    if (!currentTrack || tracks.length === 0) return;
    if (currentTime > 3) {
      // Restart current track if played more than 3 seconds
      seek(0);
      return;
    }
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    playTrack(tracks[prevIndex]);
  }, [currentTrack, currentTime, tracks, playTrack, triggerTap]);

  const seek = useCallback(
    (time: number) => {
      setCurrentTime(time);
      audioEngine.seek(time);
    },
    [audioEngine]
  );

  const setVolume = useCallback(
    (vol: number) => {
      setVolumeState(vol);
      audioEngine.setVolume(vol);
    },
    [audioEngine]
  );

  const toggleShuffle = useCallback(() => {
    triggerTap();
    setIsShuffle((prev) => !prev);
  }, [triggerTap]);

  const cycleRepeat = useCallback(() => {
    triggerTap();
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, [triggerTap]);

  const toggleFavorite = useCallback(
    (trackId: string) => {
      triggerTap();
      setTracks((prev) =>
        prev.map((t) => {
          if (t.id === trackId) {
            return { ...t, isFavorite: !t.isFavorite };
          }
          return t;
        })
      );
      if (currentTrack?.id === trackId) {
        setCurrentTrack((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
      }
    },
    [currentTrack, triggerTap]
  );

  const setAccent = useCallback(
    (newAccent: MetroAccent) => {
      triggerTap();
      setAccentState(newAccent);
      localStorage.setItem('wm_accent', newAccent);
    },
    [triggerTap]
  );

  const setThemeMode = useCallback(
    (mode: 'dark' | 'light') => {
      triggerTap();
      setThemeModeState(mode);
      localStorage.setItem('wm_theme', mode);
    },
    [triggerTap]
  );

  const setPlayTapSound = useCallback((enabled: boolean) => {
    setPlayTapSoundState(enabled);
  }, []);

  const setIsDeviceFrameEnabled = useCallback(
    (enabled: boolean) => {
      triggerTap();
      setIsDeviceFrameEnabledState(enabled);
    },
    [triggerTap]
  );

  // Equalizer controls
  const setEQBandGain = useCallback(
    (index: number, gain: number) => {
      setEqBands((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], gain };
        return next;
      });
      setCurrentPreset('custom');
      audioEngine.setEqualizerBand(index, gain);
    },
    [audioEngine]
  );

  const applyEQPreset = useCallback(
    (preset: EqualizerPreset) => {
      triggerTap();
      setCurrentPreset(preset);

      let presetGains: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      switch (preset) {
        case 'flat':
          presetGains = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
          break;
        case 'rock':
          presetGains = [4, 3, 2, 0, -1, 0, 2, 4, 5, 5];
          break;
        case 'pop':
          presetGains = [-1, 1, 3, 4, 4, 2, 0, 1, 2, 3];
          break;
        case 'jazz':
          presetGains = [3, 2, 1, 2, -1, -1, 0, 1, 3, 4];
          break;
        case 'electronic':
          presetGains = [5, 4, 2, 0, -2, 2, 1, 3, 5, 6];
          break;
        case 'hiphop':
          presetGains = [6, 5, 3, 1, -1, -1, 1, 2, 3, 4];
          break;
        case 'vocal':
          presetGains = [-2, -1, -1, 2, 4, 4, 3, 1, 0, -1];
          break;
        case 'bassboost':
          presetGains = [7, 6, 4, 2, 0, 0, 0, 0, 0, 0];
          break;
        case 'metro':
          presetGains = [3, 2, 1, 0, 1, 2, 3, 4, 4, 5];
          break;
      }

      setEqBands((prev) =>
        prev.map((b, i) => ({
          ...b,
          gain: presetGains[i] ?? 0,
        }))
      );

      presetGains.forEach((gain, i) => {
        audioEngine.setEqualizerBand(i, gain);
      });
    },
    [audioEngine, triggerTap]
  );

  const setBassBoostValue = useCallback(
    (val: number) => {
      setBassBoostState(val);
      audioEngine.setBassBoost(val);
    },
    [audioEngine]
  );

  const setSpatial8DValue = useCallback(
    (enabled: boolean) => {
      triggerTap();
      setSpatial8DState(enabled);
      audioEngine.setSpatial8D(enabled);
    },
    [audioEngine, triggerTap]
  );

  // Live Tiles management
  const pinToStart = useCallback(
    (tile: PinnedTile) => {
      triggerTap();
      setPinnedTiles((prev) => {
        const filtered = prev.filter((t) => t.id !== tile.id);
        const updated = [...filtered, tile];
        localStorage.setItem('wm_pinned_tiles', JSON.stringify(updated));
        return updated;
      });
    },
    [triggerTap]
  );

  const unpinFromStart = useCallback(
    (tileId: string) => {
      triggerTap();
      setPinnedTiles((prev) => {
        const updated = prev.filter((t) => t.id !== tileId);
        localStorage.setItem('wm_pinned_tiles', JSON.stringify(updated));
        return updated;
      });
    },
    [triggerTap]
  );

  // Upload custom music file
  const addCustomTrack = useCallback(
    async (file: File) => {
      const fileUrl = URL.createObjectURL(file);
      // Clean filename for title
      const fileNameClean = file.name.replace(/\.[^/.]+$/, '');
      const parts = fileNameClean.split(' - ');
      const artist = parts.length > 1 ? parts[0].trim() : 'Unknown Artist';
      const title = parts.length > 1 ? parts[1].trim() : fileNameClean;

      // Extract duration using temp audio element
      const tempAudio = new Audio();
      tempAudio.src = fileUrl;

      const dur: number = await new Promise((resolve) => {
        tempAudio.addEventListener('loadedmetadata', () => {
          resolve(Math.round(tempAudio.duration) || 180);
        });
        tempAudio.addEventListener('error', () => {
          resolve(180);
        });
      });

      const newTrack: Track = {
        id: `custom-${Date.now()}`,
        title,
        artist,
        album: 'My Uploads',
        duration: dur,
        genre: 'Audio File',
        bpm: 120,
        year: new Date().getFullYear(),
        isCustomFile: true,
        fileUrl,
        coverGradient: 'linear-gradient(135deg, #1BA1E2 0%, #D80073 100%)',
        accentColor: '#1BA1E2',
        playCount: 0,
        isFavorite: false,
        dateAdded: Date.now(),
        lyrics: [
          { time: 0, text: `♪ ${title} ♪` },
          { time: 5, text: `Playing custom audio file: ${file.name}` },
        ],
      };

      setTracks((prev) => {
        const next = [newTrack, ...prev];
        localStorage.setItem('wm_tracks', JSON.stringify(next));
        return next;
      });

      // Also ensure "My Uploads" album exists
      setAlbums((prev) => {
        const exists = prev.find((a) => a.title === 'My Uploads');
        if (exists) {
          return prev.map((a) => (a.title === 'My Uploads' ? { ...a, trackIds: [...a.trackIds, newTrack.id] } : a));
        }
        return [
          ...prev,
          {
            id: 'My Uploads',
            title: 'My Uploads',
            artist: 'Various',
            year: new Date().getFullYear(),
            genre: 'User Library',
            coverGradient: 'linear-gradient(135deg, #1BA1E2 0%, #D80073 100%)',
            accentColor: '#1BA1E2',
            trackIds: [newTrack.id],
          },
        ];
      });

      playTrack(newTrack);
    },
    [playTrack]
  );

  // Create playlist
  const createPlaylist = useCallback(
    (title: string, description: string, trackIds: string[]) => {
      triggerTap();
      const newPlaylist: Playlist = {
        id: `pl-${Date.now()}`,
        title,
        description,
        trackIds,
        isBuiltin: false,
        coverGradient: 'linear-gradient(135deg, #0050EF 0%, #00ABA9 100%)',
      };
      setPlaylists((prev) => {
        const next = [newPlaylist, ...prev];
        localStorage.setItem('wm_playlists', JSON.stringify(next));
        return next;
      });
    },
    [triggerTap]
  );

  // Navigation handlers
  const setView = useCallback(
    (view: AppView) => {
      triggerTap();
      setCurrentView(view);
    },
    [triggerTap]
  );

  const setActivePivot = useCallback(
    (pivot: HubPivot) => {
      triggerTap();
      setActivePivotState(pivot);
    },
    [triggerTap]
  );

  const openArtist = useCallback(
    (artist: Artist) => {
      triggerTap();
      setSelectedArtist(artist);
      setCurrentView('artistDetail');
    },
    [triggerTap]
  );

  const openAlbum = useCallback(
    (album: Album) => {
      triggerTap();
      setSelectedAlbum(album);
      setCurrentView('albumDetail');
    },
    [triggerTap]
  );

  const openPlaylist = useCallback(
    (playlist: Playlist) => {
      triggerTap();
      setSelectedPlaylist(playlist);
      setCurrentView('playlistDetail');
    },
    [triggerTap]
  );

  const openJumpList = useCallback(
    (category: 'artists' | 'albums' | 'songs') => {
      triggerTap();
      setJumpListCategory(category);
      setIsJumpListOpen(true);
    },
    [triggerTap]
  );

  const closeJumpList = useCallback(() => {
    triggerTap();
    setIsJumpListOpen(false);
  }, [triggerTap]);

  return (
    <MusicContext.Provider
      value={{
        tracks,
        albums,
        artists,
        playlists,
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isShuffle,
        repeatMode,
        accent,
        accentHex,
        themeMode,
        playTapSound,
        currentView,
        activePivot,
        selectedArtist,
        selectedAlbum,
        selectedPlaylist,
        pinnedTiles,
        eqBands,
        currentPreset,
        bassBoost,
        spatial8D,
        searchQuery,
        isSearchOpen,
        isJumpListOpen,
        jumpListCategory,
        isDeviceFrameEnabled,
        historyTrackIds,
        playTrack,
        togglePlay,
        nextTrack,
        prevTrack,
        seek,
        setVolume,
        toggleShuffle,
        cycleRepeat,
        toggleFavorite,
        setAccent,
        setThemeMode,
        setPlayTapSound,
        setEQBandGain,
        applyEQPreset,
        setBassBoostValue,
        setSpatial8DValue,
        pinToStart,
        unpinFromStart,
        addCustomTrack,
        createPlaylist,
        setView,
        setActivePivot,
        openArtist,
        openAlbum,
        openPlaylist,
        setSearchQuery,
        setIsSearchOpen,
        openJumpList,
        closeJumpList,
        setIsDeviceFrameEnabled,
        triggerTap,
        audioEngine,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
