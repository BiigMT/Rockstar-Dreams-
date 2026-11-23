import React from 'react';
import { Gift, Heart, Sparkles, UserPlus } from 'lucide-react';
import { GameState } from '../../types/game';
import { formatMoney } from '../../engine/simulation';

interface LoveTabProps {
  state: GameState;
  onLoveAction: (action: 'date' | 'gift' | 'hire_publicist' | 'hire_manager' | 'remove', id?: string) => void;
  onOpenLinkup: () => void;
}

export const LoveTab: React.FC<LoveTabProps> = ({ state, onLoveAction, onOpenLinkup }) => {
  const totalWeekly = state.connections.reduce((acc, c) => acc + c.weeklyCost, 0);

  return (
    <div className="flex-1 overflow-y-auto slim-scroll px-3.5 py-3 space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
          LOVE & CONNECTIONS
        </span>
        <span className="font-mono-num text-xs font-bold text-rose-400 tabular-nums">
          {formatMoney(totalWeekly)} / wk
        </span>
      </div>

      {state.connections.length === 0 ? (
        <div className="pad-card rounded-2xl p-5 text-center space-y-3">
          <Heart className="w-8 h-8 text-rose-400 mx-auto" />
          <div className="font-bold text-white text-sm">No Active Partner or Connections</div>
          <p className="text-xs text-zinc-400">
            Open Linkup inside Social Media to meet creative directors, models, and producers, or hire industry staff below.
          </p>
          <button
            type="button"
            onClick={onOpenLinkup}
            className="px-4 py-2 rounded-xl bg-amber-400 text-zinc-950 text-xs font-extrabold"
          >
            Open Linkup App
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {state.connections.map((person) => (
            <div
              key={person.id}
              className="pad-card rounded-2xl p-3.5 space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shrink-0"
                    style={{ backgroundColor: person.color }}
                  >
                    {person.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="font-extrabold text-white text-sm truncate">
                      {person.name} · <span className="text-rose-400">{person.role}</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate">{person.perkText}</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono-num text-xs font-bold text-white tabular-nums">
                    ${person.weeklyCost.toLocaleString()}/wk
                  </div>
                  <div className="font-mono-num text-[11px] text-amber-400 tabular-nums">
                    {person.loyalty}% Loyalty
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  disabled={state.cash < 500 || state.energy < 2}
                  onClick={() => onLoveAction('date', person.id)}
                  className="py-1.5 rounded-lg bg-[#0e1015] hover:bg-white/[0.06] border border-white/[0.06] disabled:opacity-40 text-xs font-bold text-white flex items-center justify-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" /> Hang ($500)
                </button>
                <button
                  type="button"
                  disabled={state.cash < 2500}
                  onClick={() => onLoveAction('gift', person.id)}
                  className="py-1.5 rounded-lg bg-[#0e1015] hover:bg-white/[0.06] border border-white/[0.06] disabled:opacity-40 text-xs font-bold text-white flex items-center justify-center gap-1"
                >
                  <Gift className="w-3.5 h-3.5 text-amber-400" /> Gift ($2.5K)
                </button>
                <button
                  type="button"
                  onClick={() => onLoveAction('remove', person.id)}
                  className="py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-950/70 border border-rose-500/20 text-xs font-bold text-rose-300"
                >
                  End Tie
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Industry Connections */}
      <div className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase px-1 pt-1">
        NETWORKING & STAFF
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onLoveAction('hire_publicist')}
          className="pad-card pad-card-hover rounded-xl p-3 text-left"
        >
          <div className="flex items-center gap-2 font-bold text-white text-xs">
            <UserPlus className="w-4 h-4 text-sky-400" /> Hire Publicist
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">$600/wk · Press & clout</div>
        </button>

        <button
          type="button"
          onClick={() => onLoveAction('hire_manager')}
          className="pad-card pad-card-hover rounded-xl p-3 text-left"
        >
          <div className="flex items-center gap-2 font-bold text-white text-xs">
            <UserPlus className="w-4 h-4 text-amber-400" /> Hire Manager
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">$1,400/wk · Tour & deal boosts</div>
        </button>
      </div>
    </div>
  );
};
