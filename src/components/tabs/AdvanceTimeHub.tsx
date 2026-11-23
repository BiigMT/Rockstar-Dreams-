import React, { useState } from 'react';
import {
  Briefcase,
  CalendarDays,
  ChevronRight,
  Disc3,
  Flame,
  Pause,
  Play,
  ShieldAlert,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { MONTH_NAMES } from '../../data/gameCatalog';
import {
  formatCompactNumber,
  formatMoney,
  getHot100Songs,
  getLifestyleBonuses,
} from '../../engine/simulation';
import { GameState, MainTab, PhoneAppId } from '../../types/game';
import { PressBackdrop } from '../PressBackdrop';

interface AdvanceTimeHubProps {
  state: GameState;
  headlineIdx: number;
  onCycleHeadline: () => void;
  onAdvanceTime: (step: 'day' | 'week' | 'month') => void;
  onQuickAction: (action: string, payload?: Record<string, string | number>) => void;
  onNavigateTab: (tab: MainTab) => void;
  onOpenPhoneApp: (app: PhoneAppId) => void;
  onPlaySong: (songId: string) => void;
}

type DrawerMode = 'none' | 'actions' | 'skills' | 'crime';

export const AdvanceTimeHub: React.FC<AdvanceTimeHubProps> = ({
  state,
  headlineIdx,
  onCycleHeadline,
  onAdvanceTime,
  onQuickAction,
  onNavigateTab,
  onOpenPhoneApp,
  onPlaySong,
}) => {
  const [drawer, setDrawer] = useState<DrawerMode>('none');

  const hot100 = getHot100Songs(state);
  const top5 = hot100.slice(0, 5);
  const topPlayerSong = state.songs.find((s) => s.released && s.currentChartPos === 1) || state.songs[0];

  const monthName = MONTH_NAMES[(state.date.month - 1) % 12];
  const weekStartDay = Math.max(1, state.date.day - ((state.date.day - 1) % 7));
  const weekDays = Array.from({ length: 7 }, (_, i) => ((weekStartDay + i - 1) % 30) + 1);
  const lifestyle = getLifestyleBonuses(state);

  // Build dynamic rotating Press Headlines
  const pressHeadlines = [
    topPlayerSong && topPlayerSong.currentChartPos === 1
      ? {
          title: `${state.artistName.toUpperCase()} DOMINATES GLOBAL CHARTS WITH "${topPlayerSong.title.toUpperCase()}"`,
          body: `Chart dominance confirmed as "${topPlayerSong.title}" hits Billboard Hot 100 #1 with ${formatCompactNumber(topPlayerSong.weeklyStreams)} weekly streams. ${
            state.contract ? `Signed under ${state.contract.labelName}.` : 'Major label negotiations & world tour buzz building...'
          }`,
        }
      : {
          title: `${state.artistName.toUpperCase()} HOLDS PRESS CONFERENCE AHEAD OF NEXT DROP`,
          body: `With Fame Tier ${state.fameLevel} and ${formatCompactNumber(state.socialFollowers.soundifyMonthly)} monthly listeners, industry insiders predict a breakout chart run.`,
        },
    ...state.posts
      .filter((p) => p.isNews || p.platform === 'x')
      .slice(0, 4)
      .map((p) => ({
        title: (p.headline || `${p.authorName} BREAKS THE INTERNET`).toUpperCase(),
        body: p.content,
      })),
  ];

  const activeHeadline = pressHeadlines[headlineIdx % pressHeadlines.length];

  const unreleasedCount = state.songs.filter((s) => !s.released).length;

  return (
    <div className="flex-1 min-h-0 p-2 sm:p-2.5 grid grid-cols-1 lg:grid-cols-[1.45fr_1fr] gap-2.5 overflow-y-auto lg:overflow-hidden">
      {/* LEFT COLUMN: GLOBAL MUSIC MEDIA CENTRE HERO STAGE */}
      <div className="career-panel rounded-xl overflow-hidden flex flex-col min-h-[420px] lg:min-h-0 relative">
        {/* Stage Canvas */}
        <div className="relative flex-1 min-h-[290px]">
          <PressBackdrop
            avatar={state.avatar}
            artistName={state.artistName}
            fameLevel={state.fameLevel}
          />

          {/* Top-Left Simulation Time Buttons: Day +1, Week +1, Month +1 */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onAdvanceTime('day')}
              className="px-3.5 py-1.5 rounded royal-active-tab text-xs font-black tracking-wide shadow-lg hover:brightness-110 active:scale-95 snap-transition"
            >
              Day +1
            </button>
            <button
              type="button"
              onClick={() => onAdvanceTime('week')}
              className="px-3.5 py-1.5 rounded bg-slate-900/90 hover:bg-slate-800 border border-slate-500/50 text-xs font-black text-white shadow-lg active:scale-95 snap-transition"
            >
              Week +1
            </button>
            <button
              type="button"
              onClick={() => onAdvanceTime('month')}
              className="px-3.5 py-1.5 rounded bg-slate-900/90 hover:bg-slate-800 border border-slate-500/50 text-xs font-black text-white shadow-lg active:scale-95 snap-transition"
            >
              Month +1
            </button>
          </div>

          {/* Top-Right Red Crimson Ribbon: FAME TIER Badge */}
          <div className="absolute top-0 right-4 z-20">
            <div
              className="crimson-ribbon px-3.5 pt-2 pb-4 text-center border-x border-b border-red-300/35"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% 82%, 50% 100%, 0 82%)' }}
            >
              <div className="text-[9px] font-black tracking-widest text-red-100 uppercase leading-tight">
                FAME
                <br />
                TIER
              </div>
              <div className="font-display text-3xl font-black text-white leading-none mt-0.5 tabular-nums">
                {state.fameLevel}
              </div>
            </div>
          </div>

          {/* Right-Mid Translucent ARTIST STATS Overlay */}
          <div className="hidden sm:block absolute right-3 bottom-[106px] z-20 w-[215px] rounded-md bg-[#081326]/88 backdrop-blur-md border border-slate-400/30 p-2.5 shadow-xl">
            <div className="text-[11px] font-black tracking-wider text-sky-300 uppercase border-b border-slate-500/35 pb-1 mb-1.5">
              ARTIST STATS
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Fame Level:</span>
                <span className="font-mono-num font-black text-white">{state.fameLevel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Popularity:</span>
                <span className="font-mono-num font-black text-amber-300">
                  {state.popularity.toFixed(1)} / 100
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Net Worth:</span>
                <span className="font-mono-num font-black text-emerald-400">
                  {formatMoney(state.netWorth)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Hype:</span>
                <span className="font-mono-num font-black text-sky-300">{state.hype}%</span>
              </div>
            </div>
          </div>

          {/* Press Conference Breaking Headline Overlay */}
          <button
            type="button"
            onClick={onCycleHeadline}
            title="Click to cycle press headline"
            className="absolute inset-x-0 bottom-0 z-20 text-left bg-gradient-to-t from-[#040914] via-[#071124]/92 to-transparent px-4 pt-8 pb-3 hover:bg-[#071124]/95 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-base sm:text-xl font-black tracking-tight text-white uppercase leading-tight drop-shadow">
                {activeHeadline.title}
              </h2>
              <ChevronRight className="w-4 h-4 text-sky-400 shrink-0" />
            </div>
            <p className="text-[11px] sm:text-xs text-slate-200/90 mt-1 line-clamp-2 max-w-2xl">
              {activeHeadline.body}
            </p>
          </button>
        </div>

        {/* Interactive Quick-Action Drawer (opens cleanly over stage footer when clicked) */}
        {drawer !== 'none' && (
          <div className="bg-[#081429] border-t border-sky-500/35 px-3 py-2.5 space-y-2 z-30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-sky-300">
                {drawer === 'actions'
                  ? 'Career Quick Actions'
                  : drawer === 'skills'
                  ? 'Artist Skill Training'
                  : 'Street Hustle & Heat Management'}
              </span>
              <button
                type="button"
                onClick={() => setDrawer('none')}
                className="text-[11px] font-bold text-slate-400 hover:text-white"
              >
                Close ✕
              </button>
            </div>

            {drawer === 'actions' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => onQuickAction('rest')}
                  className="p-2 rounded bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-left"
                >
                  <div className="text-xs font-extrabold text-emerald-300">Rest & Recover</div>
                  <div className="text-[10px] text-slate-300">Restore 100% Energy</div>
                </button>
                <button
                  type="button"
                  disabled={state.energy < 6}
                  onClick={() => onQuickAction('press_run')}
                  className="p-2 rounded bg-sky-600/20 hover:bg-sky-600/30 disabled:opacity-40 border border-sky-500/30 text-left"
                >
                  <div className="text-xs font-extrabold text-sky-300">Press & Radio Run</div>
                  <div className="text-[10px] text-slate-300">-6⚡ · +12 Hype · +2.8 Pop</div>
                </button>
                <button
                  type="button"
                  disabled={state.energy < 5}
                  onClick={() => onQuickAction('produce_beat')}
                  className="p-2 rounded bg-amber-600/20 hover:bg-amber-600/30 disabled:opacity-40 border border-amber-500/30 text-left"
                >
                  <div className="text-xs font-extrabold text-amber-300">Sell Custom Beat</div>
                  <div className="text-[10px] text-slate-300">
                    -5⚡ · +{formatMoney(1200 + state.studio.level * 1800)}
                  </div>
                </button>
                <button
                  type="button"
                  disabled={state.energy < 6}
                  onClick={() => onQuickAction('act_role')}
                  className="p-2 rounded bg-purple-600/20 hover:bg-purple-600/30 disabled:opacity-40 border border-purple-500/30 text-left"
                >
                  <div className="text-xs font-extrabold text-purple-300">Film Cameo / Role</div>
                  <div className="text-[10px] text-slate-300">
                    -6⚡ · +{formatMoney(4500 + state.fameLevel * 7500)}
                  </div>
                </button>
                <button
                  type="button"
                  disabled={state.energy < 5}
                  onClick={() =>
                    onQuickAction('cash_gig', {
                      title: 'Private Showcase',
                      reward: 1800 + state.fameLevel * 3200,
                      energy: 5,
                    })
                  }
                  className="p-2 rounded bg-teal-600/20 hover:bg-teal-600/30 disabled:opacity-40 border border-teal-500/30 text-left"
                >
                  <div className="text-xs font-extrabold text-teal-300">Club Appearance</div>
                  <div className="text-[10px] text-slate-300">
                    -5⚡ · +{formatMoney(1800 + state.fameLevel * 3200)}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenPhoneApp('chirper')}
                  className="p-2 rounded bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-left"
                >
                  <div className="text-xs font-extrabold text-blue-300">Open Chirper Feed</div>
                  <div className="text-[10px] text-slate-300">Post, Promo & Beef Rivals</div>
                </button>
              </div>
            )}

            {drawer === 'skills' && (
              <div className="space-y-2">
                <div className="grid grid-cols-5 gap-1.5 text-center text-[10px]">
                  {[
                    { k: 'Lyrics', v: state.skills.songwriting },
                    { k: 'Vocals', v: state.skills.vocals },
                    { k: 'Prod', v: state.skills.production },
                    { k: 'Stage', v: state.skills.stagePresence },
                    { k: 'Mktg', v: state.skills.marketing },
                  ].map((s) => (
                    <div key={s.k} className="career-inset rounded p-1.5">
                      <div className="text-slate-400 font-bold">{s.k}</div>
                      <div className="font-mono-num text-sm font-black text-sky-300">{s.v}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    disabled={state.energy < 4 || state.cash < 500}
                    onClick={() => onQuickAction('vocal_coach')}
                    className="p-2 rounded bg-sky-600/20 border border-sky-500/30 disabled:opacity-40 text-left"
                  >
                    <div className="text-xs font-bold text-white">Vocal & Lyric Coach</div>
                    <div className="text-[10px] text-sky-300">$500 · -4⚡ · +4 Vocals</div>
                  </button>
                  <button
                    type="button"
                    disabled={state.energy < 4 || state.cash < 800}
                    onClick={() => onQuickAction('train_production')}
                    className="p-2 rounded bg-emerald-600/20 border border-emerald-500/30 disabled:opacity-40 text-left"
                  >
                    <div className="text-xs font-bold text-white">Mix & Beat Lab</div>
                    <div className="text-[10px] text-emerald-300">$800 · -4⚡ · +5 Prod</div>
                  </button>
                  <button
                    type="button"
                    disabled={state.energy < 4 || state.cash < 650}
                    onClick={() => onQuickAction('stage_rehearsal')}
                    className="p-2 rounded bg-amber-600/20 border border-amber-500/30 disabled:opacity-40 text-left"
                  >
                    <div className="text-xs font-bold text-white">Arena Rehearsal</div>
                    <div className="text-[10px] text-amber-300">$650 · -4⚡ · +6 Stage</div>
                  </button>
                </div>
              </div>
            )}

            {drawer === 'crime' && (
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  disabled={state.energy < 4}
                  onClick={() => onQuickAction('crime_hustle', { reward: 4500, heat: 16 })}
                  className="p-2 rounded bg-rose-600/20 border border-rose-500/35 disabled:opacity-40 text-left"
                >
                  <div className="text-xs font-extrabold text-rose-300">Bootleg Merch Flip</div>
                  <div className="text-[10px] text-slate-300">-4⚡ · +$4.5K · +16% Heat</div>
                </button>
                <button
                  type="button"
                  disabled={state.energy < 6}
                  onClick={() => onQuickAction('crime_hustle', { reward: 14000, heat: 28 })}
                  className="p-2 rounded bg-rose-700/25 border border-rose-500/40 disabled:opacity-40 text-left"
                >
                  <div className="text-xs font-extrabold text-rose-200">Underground Leak Deal</div>
                  <div className="text-[10px] text-slate-300">-6⚡ · +$14K · Heat {state.heatLevel}%</div>
                </button>
                <button
                  type="button"
                  disabled={state.cash < 2500 || state.heatLevel === 0}
                  onClick={() => onQuickAction('lay_low')}
                  className="p-2 rounded bg-slate-700/40 border border-slate-500/40 disabled:opacity-40 text-left"
                >
                  <div className="text-xs font-extrabold text-white">Hire Fixer ($2.5K)</div>
                  <div className="text-[10px] text-emerald-300">Clear Heat ({state.heatLevel}% now)</div>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Bottom 6 Quick-Action Pills matching Screenshot */}
        <div className="bg-[#091529] border-t border-slate-700/70 px-3 py-2 flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setDrawer((d) => (d === 'actions' ? 'none' : 'actions'))}
            className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 snap-transition ${
              drawer === 'actions'
                ? 'bg-sky-400 text-slate-950'
                : 'bg-[#1d6ce0] hover:bg-[#2575ec] text-white'
            }`}
          >
            <Zap className="w-3 h-3" /> Actions (6)
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('charts')}
            className="px-3 py-1 rounded-full bg-slate-700/80 hover:bg-slate-600 text-xs font-extrabold text-white flex items-center gap-1"
          >
            <Users className="w-3 h-3 text-sky-300" /> Artists & Collab
          </button>

          <button
            type="button"
            onClick={() => setDrawer((d) => (d === 'skills' ? 'none' : 'skills'))}
            className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 snap-transition ${
              drawer === 'skills'
                ? 'bg-sky-400 text-slate-950'
                : 'bg-[#0284c7] hover:bg-[#0ea5e9] text-white'
            }`}
          >
            <TrendingUp className="w-3 h-3" /> Skills
          </button>

          <button
            type="button"
            onClick={() => setDrawer((d) => (d === 'crime' ? 'none' : 'crime'))}
            className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 snap-transition ${
              drawer === 'crime'
                ? 'bg-rose-400 text-slate-950'
                : 'bg-[#b91c1c] hover:bg-[#dc2626] text-white'
            }`}
          >
            <ShieldAlert className="w-3 h-3" /> Crime / Hustle
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('brand')}
            className="px-3 py-1 rounded-full bg-[#059669] hover:bg-[#10b981] text-xs font-extrabold text-white flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" /> Touring & Merch
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('label')}
            className="px-3 py-1 rounded-full bg-[#0e7490] hover:bg-[#0891b2] text-xs font-extrabold text-white flex items-center gap-1"
          >
            <Briefcase className="w-3 h-3" /> Contracts
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: TOP CHARTS, ARTIST STATUS, SCHEDULE & CALENDAR */}
      <div className="flex flex-col gap-2.5 min-h-0 lg:overflow-y-auto slim-scroll">
        {/* TOP CHARTS (Billboard Hot 100) */}
        <div className="career-panel rounded-xl p-2.5 space-y-1.5">
          <div className="flex items-center justify-between border-b border-slate-600/35 pb-1">
            <h3 className="text-xs font-black tracking-wider text-sky-300 uppercase">
              TOP CHARTS <span className="text-slate-300 font-bold">(Billboard Hot 100)</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('charts')}
              className="text-[10px] font-bold text-sky-400 hover:underline"
            >
              Full Top 100 →
            </button>
          </div>

          <div className="divide-y divide-slate-700/45">
            {top5.map((entry) => {
              const playing = state.nowPlayingSongId === entry.songId && state.isAudioPlaying;
              return (
                <div
                  key={entry.songId}
                  className={`py-1.5 px-1.5 flex items-center justify-between gap-2 text-xs rounded ${
                    entry.isPlayer ? 'bg-sky-500/15' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-4 font-mono-num font-black text-center ${
                        entry.rank === 1 ? 'text-amber-300' : 'text-slate-400'
                      }`}
                    >
                      {entry.rank}
                    </span>
                    <Disc3
                      className={`w-4 h-4 shrink-0 ${
                        entry.isPlayer ? 'text-amber-400' : 'text-sky-400/75'
                      }`}
                    />
                    <span className="font-bold text-white truncate">
                      {entry.artistLine}{' '}
                      <span className="text-slate-400 font-normal">({entry.genre})</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono-num font-bold text-sky-200 text-[11px]">
                      {formatCompactNumber(entry.weeklyStreams)}
                    </span>
                    <span className="text-[11px] text-slate-300 truncate max-w-[95px]">
                      '{entry.title}'
                    </span>
                    {entry.isPlayer && (
                      <button
                        type="button"
                        onClick={() => onPlaySong(entry.songId)}
                        className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center"
                      >
                        {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ARTIST STATUS & CONTRACTS */}
        <div className="career-panel rounded-xl p-2.5 space-y-2">
          <div className="text-xs font-black tracking-wider text-sky-300 uppercase border-b border-slate-600/35 pb-1">
            ARTIST STATUS & CONTRACTS
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">Fame Level:</span>
              <span className="px-2 py-0.5 rounded bg-red-700 text-white font-mono-num font-black text-[11px]">
                {state.fameLevel}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">Popularity:</span>
              <span className="font-mono-num font-bold text-white">
                {state.popularity.toFixed(1)} / 100
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">Reputation:</span>
              <span className="font-bold text-amber-300 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {state.reputation}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">Energy:</span>
              <span className="font-mono-num font-bold text-emerald-400">
                {Math.round((state.energy / state.maxEnergy) * 100)}% (+{14 + lifestyle.energyPerDay}/d)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">Hype:</span>
              <span className="font-mono-num font-bold text-sky-300 flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-400" /> {state.hype}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">Plaques:</span>
              <span className="font-mono-num font-bold text-amber-300">
                {state.plaques.length} RIAA
              </span>
            </div>
          </div>

          <div className="pt-1 border-t border-slate-700/50 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-semibold">Contracts:</span>
            <button
              type="button"
              onClick={() => onNavigateTab('label')}
              className="font-extrabold text-amber-300 hover:underline truncate max-w-[215px]"
            >
              {state.playerLabel
                ? `Founder: ${state.playerLabel.name}`
                : state.contract
                ? `${state.contract.labelName} (${state.contract.albumsDelivered}/${state.contract.albumsRequired})`
                : state.emails.some((e) => e.actionType === 'sign_label' && !e.actionCompleted)
                ? 'Pending Major Label Offer'
                : 'Independent (100% Masters)'}
            </button>
          </div>
        </div>

        {/* RECORDING & RELEASE SCHEDULE + CALENDAR GRID */}
        <div className="career-panel rounded-xl p-2.5 space-y-2 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-600/35 pb-1 mb-1.5">
              <span className="text-xs font-black tracking-wider text-sky-300 uppercase">
                RECORDING & RELEASE SCHEDULE
              </span>
              <button
                type="button"
                onClick={() => onNavigateTab('studio')}
                className="text-[10px] font-bold text-emerald-300 hover:underline"
              >
                Open Studio →
              </button>
            </div>

            {/* 5-Stage Pipeline Strip */}
            <div className="grid grid-cols-5 gap-1 text-center">
              {[
                { num: 6, label: 'Record', active: true },
                { num: 7, label: 'Record', active: state.songs.length > 0 },
                { num: 8, label: 'Mix', active: state.studio.level >= 2 },
                { num: 9, label: 'Master', active: unreleasedCount > 0 || state.songs.length > 0 },
                { num: 10, label: 'Release', active: Boolean(state.activeTour) || state.songs.some((s) => s.released) },
              ].map((st) => (
                <div
                  key={`${st.num}_${st.label}`}
                  className={`rounded py-1 border text-[10px] ${
                    st.active
                      ? 'bg-[#10264a] border-sky-500/40 text-white'
                      : 'bg-[#081326] border-slate-700/50 text-slate-400'
                  }`}
                >
                  <div className="font-mono-num font-black text-sky-300">{st.num}</div>
                  <div className="font-semibold">{st.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar Week Header */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-black tracking-wider text-white uppercase">
              <span className="flex items-center gap-1.5 text-sky-300">
                <CalendarDays className="w-3.5 h-3.5" /> {monthName} {state.date.year}
              </span>
              {state.activeTour && (
                <span className="text-[10px] font-bold text-emerald-300">
                  Tour: {state.activeTour.citiesCompleted}/{state.activeTour.citiesTotal} Cities
                </span>
              )}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((d, idx) => {
                const isToday = d === state.date.day;
                const hasDrop = idx === 6 || (idx === 4 && state.activeTour);
                return (
                  <div
                    key={d}
                    className={`rounded border p-1.5 text-center min-h-[54px] flex flex-col justify-between ${
                      isToday
                        ? 'royal-active-tab'
                        : 'bg-[#081326] border-slate-700/60 text-slate-300'
                    }`}
                  >
                    <div className="font-mono-num text-[11px] font-black">{d}</div>
                    <div className="text-[9px] font-bold leading-tight">
                      {isToday ? (
                        <span className="text-amber-200">Media</span>
                      ) : idx === 1 || idx === 2 ? (
                        <span className="text-sky-300">Studio</span>
                      ) : hasDrop ? (
                        <span className="text-emerald-300">
                          {state.activeTour ? 'Show' : 'Release'}
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
