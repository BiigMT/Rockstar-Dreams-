import React from 'react';
import { CustomCoverConfig } from '../types/game';

interface CoverArtViewProps {
  coverUrl: string;
  customCover?: CustomCoverConfig;
  title?: string;
  className?: string;
  compact?: boolean;
}

export const CoverArtView: React.FC<CoverArtViewProps> = ({
  coverUrl,
  customCover,
  title = '',
  className = 'w-12 h-12 rounded-lg',
  compact = false,
}) => {
  if (!customCover || customCover.mode === 'photo') {
    return (
      <div className={`relative overflow-hidden bg-slate-900 shrink-0 ${className}`}>
        <img
          src={coverUrl}
          alt={title || 'Cover Art'}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const { bgColor, accentColor, pattern, badge, subtitle } = customCover;

  return (
    <div
      className={`relative overflow-hidden shrink-0 select-none flex flex-col justify-between ${className}`}
      style={{
        background: `linear-gradient(145deg, ${bgColor} 0%, #070b14 100%)`,
      }}
    >
      {/* Procedural Vector Pattern */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full opacity-45 pointer-events-none"
        preserveAspectRatio="none"
      >
        {pattern === 'vinyl' && (
          <g fill="none" stroke={accentColor} strokeWidth="1.5">
            <circle cx="50" cy="50" r="40" />
            <circle cx="50" cy="50" r="28" strokeOpacity="0.7" />
            <circle cx="50" cy="50" r="14" strokeOpacity="0.9" />
            <circle cx="50" cy="50" r="4" fill={accentColor} />
          </g>
        )}
        {pattern === 'waves' && (
          <g fill="none" stroke={accentColor} strokeWidth="2.5">
            <path d="M0 30 Q 25 10, 50 30 T 100 30" />
            <path d="M0 50 Q 25 30, 50 50 T 100 50" strokeOpacity="0.75" />
            <path d="M0 70 Q 25 50, 50 70 T 100 70" strokeOpacity="0.5" />
          </g>
        )}
        {pattern === 'grid' && (
          <g stroke={accentColor} strokeWidth="1" strokeOpacity="0.55">
            <line x1="25" y1="0" x2="25" y2="100" />
            <line x1="50" y1="0" x2="50" y2="100" />
            <line x1="75" y1="0" x2="75" y2="100" />
            <line x1="0" y1="25" x2="100" y2="25" />
            <line x1="0" y1="50" x2="100" y2="50" />
            <line x1="0" y1="75" x2="100" y2="75" />
          </g>
        )}
        {pattern === 'radial' && (
          <g>
            <circle cx="75" cy="25" r="38" fill={accentColor} fillOpacity="0.45" />
            <circle cx="20" cy="80" r="28" fill={accentColor} fillOpacity="0.25" />
          </g>
        )}
        {pattern === 'minimal' && (
          <rect x="14" y="14" width="72" height="72" stroke={accentColor} strokeWidth="2" fill="none" />
        )}
      </svg>

      {/* Top Badge */}
      <div className="relative z-10 flex items-center justify-between p-1">
        {badge !== 'NONE' ? (
          <span
            className={`px-1 py-0.5 rounded font-black uppercase tracking-wider bg-black/80 text-white border border-white/25 ${
              compact ? 'text-[6px] leading-none' : 'text-[8px] leading-none'
            }`}
          >
            {badge}
          </span>
        ) : (
          <span />
        )}
      </div>

      {/* Bottom Title */}
      {!compact && (
        <div className="relative z-10 p-1.5 bg-gradient-to-t from-black/85 via-black/45 to-transparent">
          {subtitle && (
            <div className="text-[8px] font-bold uppercase tracking-widest text-white/70 truncate">
              {subtitle}
            </div>
          )}
          {title && (
            <div className="text-[11px] font-display font-extrabold text-white leading-tight truncate">
              {title}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
