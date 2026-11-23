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
    <header className="rockstar-top-hud flex items-center justify-between px-4 py-3 border-b shrink-0 select-none">
      <div className="flex items-center gap-2.5">
        <div className="hud-accent w-1.5 h-7 rounded-full" />
        {activeTab === 'home' ? (
          <div>
            <div className="font-mono-num text-[15px] font-bold tracking-tight text-white tabular-nums leading-none">
              {formatDateDot(date)}
            </div>
            <div className="text-[9px] font-extrabold tracking-[.18em] text-zinc-500 uppercase mt-1">
              CAREER JOURNAL
            </div>
          </div>
        ) : (
          <div className="leading-tight">
            <div className="font-display text-[15px] font-extrabold tracking-wider text-white uppercase leading-none">
              {month}
            </div>
            <div className="font-mono-num text-[11px] font-semibold text-amber-300/90 tabular-nums mt-1">
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
          className="w-9 h-9 rounded-xl bg-white/[0.045] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-white snap-transition"
        >
          {muted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        <div className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-amber-400/[0.08] border border-amber-400/20 font-mono-num text-[12px] font-bold text-amber-300 tabular-nums">
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>{energy}</span>
        </div>

        <div className="px-3 py-2 rounded-xl bg-emerald-400/[0.07] border border-emerald-400/20 font-mono-num text-[12px] font-bold text-emerald-300 tabular-nums">
          {formatMoney(cash)}
        </div>
      </div>
    </header>
  );
};
