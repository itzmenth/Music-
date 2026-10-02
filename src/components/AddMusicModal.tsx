import React, { useState, useRef } from 'react';
import { X, Upload, Music, Plus, Check } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

interface AddMusicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddMusicModal: React.FC<AddMusicModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addCustomTrack, createPlaylist, tracks, accentHex, themeMode, triggerTap } = useMusic();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Playlist creation sub-state
  const [playlistTitle, setPlaylistTitle] = useState('');
  const [playlistDesc, setPlaylistDesc] = useState('');
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const isDark = themeMode === 'dark';

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    setSuccessMsg('');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(file.name)) {
        await addCustomTrack(file);
      }
    }

    setIsProcessing(false);
    setSuccessMsg(`Added ${files.length} track(s) to collection!`);
    triggerTap();
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleCreatePlaylistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistTitle.trim()) return;
    createPlaylist(
      playlistTitle.trim(),
      playlistDesc.trim() || 'Custom user created mix',
      selectedTrackIds.length > 0 ? selectedTrackIds : [tracks[0]?.id].filter(Boolean)
    );
    setPlaylistTitle('');
    setPlaylistDesc('');
    setSelectedTrackIds([]);
    onClose();
  };

  const toggleTrackSelection = (id: string) => {
    setSelectedTrackIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none">
      <div
        className={`w-full max-w-lg p-5 border shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar ${
          isDark
            ? 'bg-neutral-950 border-neutral-800 text-white'
            : 'bg-white border-neutral-300 text-black'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-current/10 mb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">add music & playlists</h2>
            <p className="text-xs opacity-60 font-light">
              Import local audio or assemble a new playlist
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-current/40 flex items-center justify-center hover:bg-current/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* File Drop Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`p-6 border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-white bg-white/10'
              : 'border-current/20 hover:border-current/40 bg-current/5'
          }`}
        >
          <Upload className="w-8 h-8 opacity-60 mb-2" />
          <p className="text-sm font-semibold">Drop audio files here or browse</p>
          <p className="text-xs opacity-50 font-light mt-1">
            Supports MP3, WAV, OGG, M4A, FLAC
          </p>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />

          {isProcessing && (
            <div className="mt-3 text-xs font-mono animate-pulse" style={{ color: accentHex }}>
              Processing audio metadata...
            </div>
          )}

          {successMsg && (
            <div className="mt-3 text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <Check className="w-4 h-4" /> {successMsg}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-current/10" />

        {/* Create Playlist Form */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider mb-2">
            create new playlist
          </h3>

          <form onSubmit={handleCreatePlaylistSubmit} className="space-y-3">
            <div>
              <label className="text-xs opacity-60 block mb-1">Playlist Name</label>
              <input
                type="text"
                required
                value={playlistTitle}
                onChange={(e) => setPlaylistTitle(e.target.value)}
                placeholder="e.g. Summer Commute"
                className={`w-full px-3 py-2 text-sm border focus:outline-none ${
                  isDark
                    ? 'bg-neutral-900 border-neutral-700 text-white'
                    : 'bg-neutral-100 border-neutral-300 text-black'
                }`}
              />
            </div>

            <div>
              <label className="text-xs opacity-60 block mb-1">Description (Optional)</label>
              <input
                type="text"
                value={playlistDesc}
                onChange={(e) => setPlaylistDesc(e.target.value)}
                placeholder="e.g. High tempo roadtrip tracks"
                className={`w-full px-3 py-2 text-sm border focus:outline-none ${
                  isDark
                    ? 'bg-neutral-900 border-neutral-700 text-white'
                    : 'bg-neutral-100 border-neutral-300 text-black'
                }`}
              />
            </div>

            <div>
              <label className="text-xs opacity-60 block mb-1">
                Select tracks to include ({selectedTrackIds.length} chosen)
              </label>
              <div className="max-h-36 overflow-y-auto border border-current/10 divide-y divide-current/10 p-1 no-scrollbar">
                {tracks.map((t) => {
                  const isSelected = selectedTrackIds.includes(t.id);
                  return (
                    <div
                      key={t.id}
                      onClick={() => toggleTrackSelection(t.id)}
                      className="px-2 py-1.5 flex items-center justify-between text-xs cursor-pointer hover:bg-current/10"
                    >
                      <span className="truncate">
                        {t.title} · <span className="opacity-60">{t.artist}</span>
                      </span>
                      <div
                        className={`w-4 h-4 border flex items-center justify-center ${
                          isSelected ? 'text-white' : 'border-current/40'
                        }`}
                        style={isSelected ? { backgroundColor: accentHex, borderColor: accentHex } : {}}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-white font-semibold text-xs uppercase tracking-wider transition-colors hover:brightness-110 active:scale-98"
              style={{ backgroundColor: accentHex }}
            >
              Save Playlist
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
