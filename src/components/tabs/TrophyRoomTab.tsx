import React from 'react';
import { Award, CheckCircle2, Disc3, Gem, Lock, ShieldCheck, Trophy } from 'lucide-react';
import { ACHIEVEMENTS_CATALOG } from '../../data/gameCatalog';
import { formatCompactNumber, getAchievementPerks } from '../../engine/simulation';
import { GameState } from '../../types/game';
import { CoverArtView } from '../CoverArtView';

interface TrophyRoomTabProps {
  state: GameState;
}

export const TrophyRoomTab: React.FC<TrophyRoomTabProps> = ({ state }) => {
  const perks = getAchievementPerks(state.unlockedAchievements || []);
  const unlockedSet = new Set(state.unlockedAchievements || []);

  return (
    <div className="flex-1 min-h-0 p-2 sm:p-2.5 flex flex-col gap-2.5 overflow-y-auto lg:overflow-hidden">
      {/* Top Permanent Perks Banner */}
      <div className="career-panel rounded-xl px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-white">
              RIAA Plaque Vault & Active Career Perks
            </div>
            <div className="text-[11px] text-slate-300">
              Unlocked {unlockedSet.size} / {ACHIEVEMENTS_CATALOG.length} Milestones ·{' '}
              {state.plaques.length} RIAA Plaques · {state.careerStats.grammyAwards} Music Awards
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-black">
          <span className="px-2.5 py-1 rounded bg-sky-500/20 border border-sky-400/40 text-sky-200">
            Streams: {Math.round(perks.streamMult * 100)}%
          </span>
          <span className="px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-400/40 text-emerald-200">
            Max Energy: +{perks.maxEnergyBonus}
          </span>
          <span className="px-2.5 py-1 rounded bg-amber-500/20 border border-amber-400/40 text-amber-200">
            Fee Discount: -{Math.round(perks.feeDiscount * 100)}%
          </span>
          <span className="px-2.5 py-1 rounded bg-purple-500/20 border border-purple-400/40 text-purple-200">
            Tour Rev: {Math.round(perks.tourMult * 100)}%
          </span>
          <span className="px-2.5 py-1 rounded bg-rose-500/20 border border-rose-400/40 text-rose-200">
            Merch Profit: {Math.round(perks.merchMult * 100)}%
          </span>
        </div>
      </div>

      {/* Main 2-Column Trophy Room */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-2.5">
        {/* LEFT: RIAA PLAQUES WALL & ANNUAL MUSIC AWARDS */}
        <div className="career-panel rounded-xl p-3 flex flex-col gap-3 min-h-0 overflow-y-auto slim-scroll">
          <div>
            <div className="flex items-center justify-between border-b border-slate-600/35 pb-1.5 mb-2.5">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Disc3 className="w-4 h-4" /> RIAA Certifications Wall ({state.plaques.length})
              </span>
              <span className="text-[10px] text-slate-400">
                Gold 500K · Platinum 1M · Multi-Plat 2M+ · Diamond 10M
              </span>
            </div>

            {state.plaques.length === 0 ? (
              <div className="career-inset rounded-xl p-6 text-center text-xs text-slate-400">
                No RIAA plaques earned yet. Reach 500K equivalent units (6M streams) on a single or album to earn your first Gold Plaque!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {state.plaques.map((plq) => {
                  const frameClass =
                    plq.tier === 'Diamond'
                      ? 'from-cyan-950/80 via-slate-900 to-sky-950/80 border-cyan-300/60'
                      : plq.tier === 'Gold'
                      ? 'from-amber-950/70 via-slate-900 to-yellow-950/60 border-amber-400/60'
                      : 'from-slate-800 via-slate-900 to-zinc-900 border-slate-300/60';

                  const discGradient =
                    plq.tier === 'Diamond'
                      ? 'from-cyan-200 via-sky-400 to-indigo-400'
                      : plq.tier === 'Gold'
                      ? 'from-amber-200 via-yellow-400 to-amber-600'
                      : 'from-slate-100 via-slate-300 to-slate-500';

                  return (
                    <div
                      key={plq.id}
                      className={`rounded-xl border-2 bg-gradient-to-br p-3 flex items-center gap-3 shadow-lg ${frameClass}`}
                    >
                      {/* Shimmering Vinyl Disc */}
                      <div className="relative flex items-center shrink-0">
                        <CoverArtView
                          coverUrl={plq.coverUrl}
                          customCover={plq.customCover}
                          title={plq.title}
                          compact
                          className="w-12 h-12 rounded-md border border-white/25 z-10 shadow"
                        />
                        <div
                          className={`w-12 h-12 rounded-full bg-gradient-to-br ${discGradient} -ml-5 flex items-center justify-center border border-white/50 shadow-inner`}
                        >
                          <div className="w-3.5 h-3.5 rounded-full bg-slate-950 border border-white/60" />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                          {plq.tier} {plq.type}
                        </div>
                        <div className="font-display text-sm font-black text-white truncate">
                          {plq.title}
                        </div>
                        <div className="text-[10px] text-slate-300 font-mono-num">
                          {formatCompactNumber(plq.units)} Units · {plq.dateStr}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Music Awards Cabinet */}
          <div>
            <div className="border-b border-slate-600/35 pb-1.5 mb-2 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                <Award className="w-4 h-4" /> Global Music Awards ({state.awardsHistory.filter((a) => a.won).length} Won)
              </span>
            </div>
            {state.awardsHistory.length === 0 ? (
              <div className="career-inset rounded-lg p-4 text-center text-xs text-slate-400">
                Annual Global Music Awards take place every February. Release charting hits to get nominated!
              </div>
            ) : (
              <div className="space-y-1.5">
                {state.awardsHistory.map((aw) => (
                  <div
                    key={aw.id}
                    className={`career-inset rounded-lg p-2.5 flex items-center justify-between text-xs ${
                      aw.won ? 'border-amber-400/45' : ''
                    }`}
                  >
                    <div>
                      <div className="font-bold text-white">
                        {aw.year} {aw.showName} — {aw.category}
                      </div>
                      <div className="text-[10px] text-slate-400">Nominee: {aw.nomineeTitle}</div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        aw.won ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {aw.won ? '🏆 WINNER' : 'NOMINATED'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: PERK-BASED ACHIEVEMENTS */}
        <div className="career-panel rounded-xl p-3 flex flex-col gap-2 min-h-0">
          <div className="flex items-center justify-between border-b border-slate-600/35 pb-1.5">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Perk-Based Achievements
            </span>
            <span className="text-[10px] text-slate-400">Permanent Passive Bonuses</span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto slim-scroll space-y-1.5 pr-1">
            {ACHIEVEMENTS_CATALOG.map((ach) => {
              const unlocked = unlockedSet.has(ach.id);
              return (
                <div
                  key={ach.id}
                  className={`career-inset rounded-lg p-2.5 flex items-center justify-between gap-2.5 ${
                    unlocked ? 'border-emerald-500/45 bg-emerald-950/20' : 'opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        unlocked ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {unlocked ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black text-white truncate">{ach.title}</div>
                      <div className="text-[10px] text-slate-400 truncate">{ach.desc}</div>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-black shrink-0 ${
                      unlocked
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/35'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {ach.perkLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
