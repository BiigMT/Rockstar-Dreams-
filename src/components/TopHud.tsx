import React from 'react';
import { Volume2, VolumeX, Zap } from 'lucide-react';
import { GameDate, MainTab } from '../types/game';
import { formatDateDot, formatDateMonthYear, formatMoney } from '../engine/simulation';

interface TopHudProps {
  date: GameDate;
  energy: number;
  cash: number;
  activeTab: MainTab;
  muted: boolean;
  onToggleMute: () => void;
}

export const TopHud: React.FC<TopHudProps> = ({
  date,
  energy,
  cash,
  activeTab,
  muted,
  onToggleMute,
}) => {
  const { month, year } = formatDateMonthYear(date);

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-[#0b0c10]/90 shrink-0 select-none">
      <div className="flex items-center gap-2.5">
        <div className="w-2 h-6 rounded-full bg-amber-400" />
        {activeTab === 'home' ? (
          <div>
            <div className="font-mono-num text-[15px] font-bold tracking-tight text-white tabular-nums leading-none">
              {formatDateDot(date)}
            </div>
            <div className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase mt-0.5">
              CAREER LOG
            </div>
          </div>
        ) : (
          <div className="leading-tight">
            <div className="font-display text-[15px] font-extrabold tracking-wider text-white uppercase leading-none">
              {month}
            </div>
            <div className="font-mono-num text-[11px] font-semibold text-amber-400/90 tabular-nums mt-0.5">
              {year}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? 'Unmute audio' : 'Mute audio'}
          className="w-8 h-8 rounded-lg bg-[#16181f] hover:bg-[#1e212b] border border-white/[0.07] flex items-center justify-center text-zinc-400 hover:text-white snap-transition"
        >
          {muted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#16181f] border border-white/[0.07] font-mono-num text-[12px] font-bold text-amber-400 tabular-nums">
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>{energy}</span>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-[#11221b] border border-emerald-500/25 font-mono-num text-[12px] font-bold text-emerald-400 tabular-nums">
          {formatMoney(cash)}
        </div>
      </div>
    </header>
  );
};
