export type MetroAccent =
  | 'mango'
  | 'cyan'
  | 'magenta'
  | 'lime'
  | 'cobalt'
  | 'crimson'
  | 'emerald'
  | 'amber'
  | 'violet'
  | 'teal';

export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // seconds
  genre: string;
  bpm: number;
  year: number;
  lyrics: LyricLine[];
  isCustomFile?: boolean;
  fileUrl?: string;
  coverGradient: string;
  accentColor: string;
  playCount: number;
  isFavorite: boolean;
  dateAdded: number; // timestamp
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  year: number;
  genre: string;
  coverGradient: string;
  accentColor: string;
  trackIds: string[];
}

export interface Artist {
  id: string;
  name: string;
  genre: string;
  bio: string;
  gradient: string;
  accentColor: string;
  albumIds: string[];
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  trackIds: string[];
  isBuiltin?: boolean;
  coverGradient: string;
}

export type AppView =
  | 'hub'
  | 'nowPlaying'
  | 'startScreen'
  | 'artistDetail'
  | 'albumDetail'
  | 'playlistDetail';

export type HubPivot =
  | 'history'
  | 'new'
  | 'artists'
  | 'albums'
  | 'songs'
  | 'playlists'
  | 'radio';

export type NowPlayingTab = 'artwork' | 'visualizer' | 'lyrics' | 'equalizer' | 'fx';

export interface EqualizerBand {
  freq: number;
  label: string;
  gain: number; // -12 to +12 dB
}

export type EqualizerPreset =
  | 'flat'
  | 'rock'
  | 'pop'
  | 'jazz'
  | 'electronic'
  | 'hiphop'
  | 'vocal'
  | 'bassboost'
  | 'metro'
  | 'custom';

export interface PinnedTile {
  id: string;
  type: 'music_hub' | 'artist' | 'album' | 'playlist' | 'track' | 'now_playing';
  title: string;
  subtitle?: string;
  size: 'small' | 'medium' | 'wide';
  targetId?: string;
  gradient?: string;
  iconName?: string;
}
