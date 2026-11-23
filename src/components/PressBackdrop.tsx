import React from 'react';
import { AvatarConfig } from '../types/game';
import { ArtistAvatar } from './ArtistAvatar';

interface PressBackdropProps {
  avatar: AvatarConfig;
  artistName: string;
  fameLevel: number;
}

const SPONSOR_TILES = [
  { kind: 'text', top: 'Global', mid: 'Music', bot: 'Awards' },
  { kind: 'disc' },
  { kind: 'brand', top: 'MUSIC', mid: 'WARS', bot: 'Rockstar' },
  { kind: 'text', top: 'Global', mid: 'Music', bot: 'Awards' },
  { kind: 'disc' },
  { kind: 'text', top: 'Top', mid: 'Artist', bot: 'Forum' },
  { kind: 'brand', top: 'MUSIC', mid: 'WARS', bot: 'Rockstar' },
  { kind: 'disc' },
];

export const PressBackdrop: React.FC<PressBackdropProps> = ({
  avatar,
  artistName,
  fameLevel,
}) => {
  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-[#eef2f7] via-[#dde5ef] to-[#9aa8bd] select-none">
      {/* Step-and-repeat Press Conference Wall */}
      <div
        className="absolute inset-0 grid grid-cols-4 gap-3 p-4 opacity-90"
        style={{ backgroundSize: 'cover' }}
      >
        {Array.from({ length: 16 }, (_, idx) => {
          const tile = SPONSOR_TILES[(idx + Math.floor(idx / 4)) % SPONSOR_TILES.length];
          if (tile.kind === 'disc') {
            return (
              <div key={idx} className="flex items-center justify-center opacity-85">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#020617] border-[3px] border-[#d4af37] flex items-center justify-center shadow-md">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#facc15] to-[#b45309] border border-amber-100/50" />
                </div>
              </div>
            );
          }
          if (tile.kind === 'brand') {
            return (
              <div key={idx} className="flex flex-col items-center justify-center text-center leading-[0.95]">
                <span className="text-[11px] font-black tracking-widest text-slate-900">
                  {tile.top}
                </span>
                <span className="text-[12px] font-black tracking-wider text-slate-900">
                  {tile.mid}
                </span>
                <span className="text-[10px] font-bold text-slate-600">{tile.bot}</span>
              </div>
            );
          }
          return (
            <div key={idx} className="flex flex-col items-center justify-center text-center leading-[1.02]">
              <span className="text-[10px] font-extrabold text-slate-800">{tile.top}</span>
              <span className="text-[10px] font-extrabold text-slate-800">{tile.mid}</span>
              <span className="text-[10px] font-bold text-slate-700">{tile.bot}</span>
            </div>
          );
        })}
      </div>

      {/* Overhead Stage Light & Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_44%_22%,rgba(255,255,255,0.55)_0%,rgba(15,23,42,0.12)_60%,rgba(2,6,23,0.72)_100%)]" />

      {/* Artist Avatar standing behind Podium */}
      <div className="absolute inset-x-0 bottom-[64px] sm:bottom-[72px] flex justify-center sm:justify-start sm:pl-[19%] pointer-events-none">
        <div className="relative drop-shadow-[0_14px_24px_rgba(0,0,0,0.45)]">
          <ArtistAvatar avatar={avatar} size={205} className="sm:scale-105 origin-bottom" />
        </div>
      </div>

      {/* Press Podium + 5 Station Microphones */}
      <div className="absolute inset-x-0 bottom-0 h-[126px] flex flex-col items-center sm:items-start sm:pl-[17%] justify-end pointer-events-none">
        {/* Microphones Cluster */}
        <svg viewBox="0 0 260 66" className="w-[230px] h-14 -mb-2 z-20 drop-shadow-md">
          {/* Mic Stems */}
          <line x1="72" y1="64" x2="105" y2="28" stroke="#0f172a" strokeWidth="3.5" />
          <line x1="95" y1="64" x2="118" y2="22" stroke="#1e293b" strokeWidth="3.5" />
          <line x1="128" y1="64" x2="128" y2="18" stroke="#0f172a" strokeWidth="4" />
          <line x1="162" y1="64" x2="146" y2="22" stroke="#1e293b" strokeWidth="3.5" />
          <line x1="186" y1="64" x2="159" y2="26" stroke="#0f172a" strokeWidth="3.5" />

          {/* Mic Flags */}
          <rect x="60" y="34" width="22" height="14" rx="2" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1.5" transform="rotate(-18 71 41)" />
          <rect x="85" y="25" width="21" height="14" rx="2" fill="#1d4ed8" stroke="#0f172a" strokeWidth="1.5" transform="rotate(-10 95 32)" />
          <rect x="118" y="18" width="20" height="15" rx="2" fill="#dc2626" stroke="#0f172a" strokeWidth="1.5" />
          <rect x="148" y="24" width="21" height="14" rx="2" fill="#b91c1c" stroke="#0f172a" strokeWidth="1.5" transform="rotate(12 158 31)" />
          <rect x="174" y="32" width="21" height="14" rx="2" fill="#059669" stroke="#0f172a" strokeWidth="1.5" transform="rotate(20 184 39)" />

          {/* Mic Heads */}
          <circle cx="105" cy="24" r="5" fill="#111827" />
          <circle cx="118" cy="18" r="5" fill="#111827" />
          <circle cx="128" cy="14" r="5.5" fill="#111827" />
          <circle cx="146" cy="18" r="5" fill="#111827" />
          <circle cx="159" cy="22" r="5" fill="#111827" />
        </svg>

        {/* Podium Lectern */}
        <div className="w-[238px] h-[78px] bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#020617] border-t-[3px] border-[#334155] rounded-t-md shadow-2xl flex flex-col items-center justify-center relative z-10 px-3">
          <div className="w-11 h-11 rounded-full border-2 border-[#d4af37]/75 bg-[#0f172a] flex flex-col items-center justify-center">
            <span className="text-[6px] font-black tracking-widest text-amber-300 uppercase">
              TIER {fameLevel}
            </span>
            <span className="text-[7px] font-extrabold text-white truncate max-w-[36px]">
              {artistName.split(' ')[0]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
