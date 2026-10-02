import React from 'react';
import { X } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

const ALPHABET = '#abcdefghijklmnopqrstuvwxyz'.split('');

export const JumpListModal: React.FC = () => {
  const {
    isJumpListOpen,
    closeJumpList,
    jumpListCategory,
    tracks,
    artists,
    albums,
    accentHex,
    themeMode,
    triggerTap,
  } = useMusic();

  if (!isJumpListOpen) return null;

  const isDark = themeMode === 'dark';

  // Determine which letters have items
  const activeLetters = new Set<string>();

  const checkItem = (str: string) => {
    const first = str.trim().charAt(0).toLowerCase();
    if (/[a-z]/.test(first)) {
      activeLetters.add(first);
    } else {
      activeLetters.add('#');
    }
  };

  if (jumpListCategory === 'songs') {
    tracks.forEach((t) => checkItem(t.title));
  } else if (jumpListCategory === 'artists') {
    artists.forEach((a) => checkItem(a.name));
  } else if (jumpListCategory === 'albums') {
    albums.forEach((a) => checkItem(a.title));
  }

  const handleSelectLetter = (char: string) => {
    triggerTap();
    // Smoothly close
    closeJumpList();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none">
      <div
        className={`w-full max-w-sm p-5 border shadow-2xl relative ${
          isDark ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-neutral-300 text-black'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">jump to letter</h2>
            <p className="text-xs opacity-60 font-light capitalize">
              in {jumpListCategory}
            </p>
          </div>
          <button
            onClick={closeJumpList}
            className="w-8 h-8 rounded-full border border-current/40 flex items-center justify-center hover:bg-current/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Alphabet Grid: 6 columns */}
        <div className="grid grid-cols-6 gap-2">
          {ALPHABET.map((char) => {
            const hasItems = activeLetters.has(char);
            return (
              <button
                key={char}
                disabled={!hasItems}
                onClick={() => handleSelectLetter(char)}
                className={`aspect-square flex items-center justify-center text-sm font-bold uppercase transition-transform ${
                  hasItems
                    ? 'text-white cursor-pointer active:scale-90 hover:scale-105'
                    : 'bg-neutral-800/40 text-neutral-600 cursor-not-allowed'
                }`}
                style={hasItems ? { backgroundColor: accentHex } : {}}
              >
                {char}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
