import React from 'react';

interface ArtworkVisualProps {
  title: string;
  artist?: string;
  gradient?: string;
  accentColor?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
  showPlayOverlay?: boolean;
  className?: string;
}

export const ArtworkVisual: React.FC<ArtworkVisualProps> = ({
  title,
  artist,
  gradient,
  accentColor = '#D80073',
  size = 'md',
  showPlayOverlay = false,
  className = '',
}) => {
  // Generate deterministic seed pattern based on title
  const charSum = title.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const patternType = charSum % 4; // 0: concentric, 1: diagonal stripes, 2: retro grid, 3: typographic blocks

  const sizeClasses = {
    sm: 'w-12 h-12 text-[10px]',
    md: 'w-24 h-24 text-xs',
    lg: 'w-48 h-48 sm:w-60 sm:h-60 text-sm',
    full: 'w-full h-full text-base',
  }[size];

  const defaultGradient =
    gradient || 'linear-gradient(135deg, #1BA1E2 0%, #0050EF 50%, #001040 100%)';

  return (
    <div
      className={`relative overflow-hidden shrink-0 flex flex-col justify-between p-3 select-none ${sizeClasses} ${className}`}
      style={{ background: defaultGradient }}
    >
      {/* Abstract Graphic Background Pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-35 pointer-events-none mix-blend-overlay"
        xmlns="http://www.w3.org/2000/svg"
      >
        {patternType === 0 && (
          // Concentric Vinyl Rings
          <g stroke="white" strokeWidth="1.5" fill="none">
            <circle cx="50%" cy="50%" r="20%" />
            <circle cx="50%" cy="50%" r="35%" strokeDasharray="4 4" />
            <circle cx="50%" cy="50%" r="50%" />
            <circle cx="50%" cy="50%" r="68%" strokeDasharray="8 6" />
            <circle cx="50%" cy="50%" r="85%" />
          </g>
        )}
        {patternType === 1 && (
          // Metro Diagonal Slanted Blocks
          <g fill="white" opacity="0.4">
            <polygon points="0,0 40,0 100,100 60,100" />
            <polygon points="50,0 80,0 140,100 110,100" />
            <polygon points="90,0 130,0 190,100 150,100" />
          </g>
        )}
        {patternType === 2 && (
          // Sound Waveform Bars
          <g fill="white">
            <rect x="15%" y="60%" width="8%" height="25%" rx="1" />
            <rect x="28%" y="40%" width="8%" height="45%" rx="1" />
            <rect x="41%" y="25%" width="8%" height="60%" rx="1" />
            <rect x="54%" y="35%" width="8%" height="50%" rx="1" />
            <rect x="67%" y="50%" width="8%" height="35%" rx="1" />
            <rect x="80%" y="65%" width="8%" height="20%" rx="1" />
          </g>
        )}
        {patternType === 3 && (
          // Minimalist Geometric Bauhaus Triangles
          <g stroke="white" strokeWidth="2" fill="none" opacity="0.6">
            <polygon points="20,10 80,90 10,90" />
            <circle cx="60" cy="40" r="18" fill="white" fillOpacity="0.2" />
          </g>
        )}
      </svg>

      {/* Metro Typographic Watermark */}
      <div className="relative z-10 flex justify-between items-start">
        <span
          className="font-bold uppercase tracking-wider text-[9px] px-1.5 py-0.5 text-black"
          style={{ backgroundColor: accentColor }}
        >
          {artist ? artist.slice(0, 8) : 'AUDIO'}
        </span>
        <span className="text-[10px] font-mono text-white/70 tracking-widest">
          {charSum.toString().slice(-3)}
        </span>
      </div>

      {/* Clean Bottom Title Badge */}
      <div className="relative z-10 mt-auto pt-2">
        <div className="font-semibold text-white tracking-tight leading-tight truncate">
          {title}
        </div>
        {artist && (
          <div className="text-[11px] text-white/80 font-light truncate">
            {artist}
          </div>
        )}
      </div>

      {/* Subtle play indicator if hover/active */}
      {showPlayOverlay && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px] opacity-0 hover:opacity-100 transition-opacity">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg"
            style={{ backgroundColor: accentColor }}
          >
            <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};
