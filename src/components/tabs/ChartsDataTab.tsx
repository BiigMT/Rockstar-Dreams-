import React, { useState } from 'react';
import {
  BarChart3,
  Disc3,
  Flame,
  Globe2,
  Handshake,
  Pause,
  Play,
  Search,
  Swords,
  Users,
} from 'lucide-react';
import {
  formatCompactNumber,
  getHot200Albums,
  getRegionalHot100Songs,
} from '../../engine/simulation';
import { ChartRegion, GameState, NpcArtist } from '../../types/game';
import { CoverArtView } from '../CoverArtView';

interface ChartsDataTabProps {
  state: GameState;
  onPlaySong: (songId: string) => void;
  onBefriendNpc: (npcId: string) => void;
  onStartBeef: (npcId: string) => void;
}

const REGIONS: ChartRegion[] = ['Global', 'North America', 'Europe', 'UK'];
const TIERS: Array<'All' | NonNullable<NpcArtist['tier']>> = [
  'All',
  'Legend',
  'Superstar',
  'Mainstream',
  'Rising',
  'Underground',
];

export const ChartsDataTab: React.FC<ChartsDataTabProps> = ({
  state,
  onPlaySong,
  onBefriendNpc,
  onStartBeef,
}) => {
  const [region, setRegion] = useState<ChartRegion>('Global');
  const [chartType, setChartType] = useState<'songs' | 'albums'>('songs');
  const [tierFilter, setTierFilter] = useState<typeof TIERS[number]>('All');
  const [npcSearch, setNpcSearch] = useState('');

  const hot100 = getRegionalHot100Songs(state, region);
  const hot200 = getHot200Albums(state);

  const filteredNpcs = state.npcs.filter((n) => {
    const matchesTier = tierFilter === 'All' || n.tier === tierFilter;
    const matchesText =
      !npcSearch.trim() ||
      n.name.toLowerCase().includes(npcSearch.toLowerCase()) ||
      n.genre.toLowerCase().includes(npcSearch.toLowerCase());
    return matchesTier && matchesText;
  });

  return (
    <div className="flex-1 min-h-0 p-2 sm:p-2.5 grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-2.5 overflow-y-auto lg:overflow-hidden">
      {/* LEFT PANEL: REGIONAL BILLBOARD CHARTS */}
      <div className="career-panel rounded-xl p-3 flex flex-col gap-2.5 min-h-0">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-600/35 pb-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-black uppercase tracking-wider text-white">
              Billboard Charts · {region}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setChartType('songs')}
              className={`px-2.5 py-1 rounded text-[11px] font-extrabold ${
                chartType === 'songs' ? 'royal-active-tab' : 'bg-[#091529] text-slate-300'
              }`}
            >
              Hot 100 Songs
            </button>
            <button
              type="button"
              onClick={() => setChartType('albums')}
              className={`px-2.5 py-1 rounded text-[11px] font-extrabold ${
                chartType === 'albums' ? 'royal-active-tab' : 'bg-[#091529] text-slate-300'
              }`}
            >
              Hot 200 Albums
            </button>
          </div>
        </div>

        {/* Region Tabs */}
        {chartType === 'songs' && (
          <div className="flex items-center gap-1.5 overflow-x-auto slim-scroll">
            {REGIONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRegion(r)}
                className={`px-3 py-1 rounded text-[11px] font-extrabold flex items-center gap-1 whitespace-nowrap ${
                  region === r ? 'bg-sky-500 text-slate-950' : 'bg-[#091529] text-slate-300'
                }`}
              >
                <Globe2 className="w-3 h-3" /> {r}
              </button>
            ))}
          </div>
        )}

        {/* Chart Rows */}
        <div className="flex-1 min-h-0 overflow-y-auto slim-scroll space-y-1.5 pr-1">
          {chartType === 'songs'
            ? hot100.slice(0, 40).map((entry) => {
                const playing = state.nowPlayingSongId === entry.songId && state.isAudioPlaying;
                return (
                  <div
                    key={entry.songId}
                    className={`career-inset rounded-lg p-2 flex items-center justify-between gap-2 text-xs ${
                      entry.isPlayer ? 'border-sky-400/60 bg-sky-500/15' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-6 text-center font-mono-num font-black ${
                          entry.rank <= 3 ? 'text-amber-300 text-sm' : 'text-slate-400'
                        }`}
                      >
                        #{entry.rank}
                      </span>
                      <CoverArtView
                        coverUrl={entry.coverUrl}
                        customCover={entry.customCover}
                        title={entry.title}
                        compact
                        className="w-9 h-9 rounded"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-white truncate">
                          {entry.title}{' '}
                          {entry.isPlayer && (
                            <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-black ml-1">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {entry.artistLine} · {entry.genre} · Peak #{entry.peak} · {entry.weeksOnChart} wks
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <div className="font-mono-num font-black text-sky-300">
                          {formatCompactNumber(entry.weeklyStreams)}/wk
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono-num">
                          {formatCompactNumber(entry.totalStreams)} total
                        </div>
                      </div>
                      {entry.isPlayer && (
                        <button
                          type="button"
                          onClick={() => onPlaySong(entry.songId)}
                          className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center"
                        >
                          {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            : hot200.map((alb) => (
                <div
                  key={alb.albumId}
                  className={`career-inset rounded-lg p-2 flex items-center justify-between gap-2 text-xs ${
                    alb.isPlayer ? 'border-sky-400/60 bg-sky-500/15' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 text-center font-mono-num font-black text-amber-300">
                      #{alb.rank}
                    </span>
                    <CoverArtView
                      coverUrl={alb.coverUrl}
                      customCover={alb.customCover}
                      title={alb.title}
                      compact
                      className="w-9 h-9 rounded"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-white truncate">{alb.title}</div>
                      <div className="text-[10px] text-slate-400 truncate">{alb.artistLine}</div>
                    </div>
                  </div>
                  <div className="text-right font-mono-num">
                    <div className="font-black text-sky-300">{formatCompactNumber(alb.weeklyStreams)}/wk</div>
                    <div className="text-[10px] text-slate-400">{formatCompactNumber(alb.totalStreams)} total</div>
                  </div>
                </div>
              ))}
        </div>
      </div>

      {/* RIGHT PANEL: 54 LIVING AI RIVAL ARTISTS DIRECTORY */}
      <div className="career-panel rounded-xl p-3 flex flex-col gap-2.5 min-h-0">
        <div className="flex items-center justify-between border-b border-slate-600/35 pb-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black uppercase tracking-wider text-white">
              Global Artist Directory ({filteredNpcs.length} / {state.npcs.length})
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold">Live AI Rivals</span>
        </div>

        <div className="space-y-1.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={npcSearch}
              onChange={(e) => setNpcSearch(e.target.value)}
              placeholder="Search artist or genre (e.g. Drill, K-Pop, Pop)..."
              className="w-full pl-8 pr-3 py-1.5 rounded bg-[#091529] border border-slate-700 text-xs text-white focus:outline-none focus:border-sky-400"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto slim-scroll">
            {TIERS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTierFilter(t)}
                className={`px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap ${
                  tierFilter === t ? 'royal-active-tab' : 'bg-[#091529] text-slate-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto slim-scroll space-y-1.5 pr-1">
          {filteredNpcs.map((npc) => (
            <div
              key={npc.id}
              className="career-inset rounded-lg p-2 flex items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0"
                  style={{ backgroundColor: npc.avatarColor }}
                >
                  {npc.initials}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white truncate">{npc.name}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                        npc.relationship === 'friend'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : npc.relationship === 'beef'
                          ? 'bg-rose-500/25 text-rose-300'
                          : npc.relationship === 'rival'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {npc.relationship}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {npc.tier || `Fame ${npc.fame}`} · {npc.genre} ·{' '}
                    {formatCompactNumber(npc.monthlyListeners)}/mo · "{npc.signatureHit}"
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => onBefriendNpc(npc.id)}
                  title="Compliment / Build Friendship"
                  className="px-2 py-1 rounded bg-emerald-600/25 hover:bg-emerald-600/40 border border-emerald-500/35 text-[10px] font-bold text-emerald-200 flex items-center gap-1"
                >
                  <Handshake className="w-3 h-3" /> Ally
                </button>
                <button
                  type="button"
                  onClick={() => onStartBeef(npc.id)}
                  title="Start Public Beef on Chirper"
                  className="px-2 py-1 rounded bg-rose-600/25 hover:bg-rose-600/40 border border-rose-500/35 text-[10px] font-bold text-rose-200 flex items-center gap-1"
                >
                  <Swords className="w-3 h-3" /> Beef
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
