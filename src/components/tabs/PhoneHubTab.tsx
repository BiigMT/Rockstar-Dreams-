import React, { useState } from 'react';
import { ChevronRight, Globe2, Smartphone, Trophy, X } from 'lucide-react';
import { GameState } from '../../types/game';
import { formatCompactNumber, formatMoney, getHot100Songs, getHot200Albums } from '../../engine/simulation';

interface PhoneHubTabProps {
  state: GameState;
  onOpenPhone: () => void;
}

export const PhoneHubTab: React.FC<PhoneHubTabProps> = ({ state, onOpenPhone }) => {
  const [modal, setModal] = useState<null | 'charts' | 'wiki' | 'records'>(null);
  const [chartTab, setChartTab] = useState<'songs' | 'albums'>('songs');

  const hot100 = getHot100Songs(state);
  const hot200 = getHot200Albums(state);
  const topSong = hot100[0];
  const topPlayerAlbum =
    hot200.find((a) => a.isPlayer) || (state.albums.some((a) => a.released) ? hot200[0] : null);

  const worldRecords = [
    {
      label: 'Highest Streamed Single',
      holder: topSong ? `${topSong.title} (${topSong.artistLine})` : 'Velvet Echo',
      val: topSong ? formatCompactNumber(topSong.totalStreams) : '164M',
      isPlayer: topSong?.isPlayer,
    },
    {
      label: 'Most #1 Hot 100 Hits',
      holder: state.careerStats.numberOneHits >= 1 ? state.artistName : 'Vespera',
      val: `${Math.max(1, state.careerStats.numberOneHits)} #1s`,
      isPlayer: state.careerStats.numberOneHits >= 1,
    },
    {
      label: 'Peak Weekly Streams',
      holder: state.careerStats.highestWeeklyStreams > 18400000 ? state.artistName : 'Vespera',
      val: formatCompactNumber(Math.max(18400000, state.careerStats.highestWeeklyStreams)),
      isPlayer: state.careerStats.highestWeeklyStreams > 18400000,
    },
    {
      label: 'Richest Active Artist',
      holder: state.netWorth > 12000000 ? state.artistName : 'Mariah Carei',
      val: formatMoney(Math.max(12000000, state.netWorth)),
      isPlayer: state.netWorth > 12000000,
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto slim-scroll px-3.5 py-3 space-y-3.5">
      {/* SOCIAL MEDIA LOGIN Card */}
      <button
        type="button"
        onClick={onOpenPhone}
        className="w-full pad-card pad-card-hover rounded-2xl px-4 py-3.5 flex items-center justify-between text-left snap-transition"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-[15px] font-extrabold text-white tracking-wide">
              SOCIAL MEDIA
            </div>
            <div className="text-[11px] font-semibold text-amber-400/90 tracking-wider">
              OPEN SMARTPHONE OS
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-zinc-400" />
      </button>

      {/* CHARTS Card */}
      <div>
        <div className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase px-1 mb-1.5">
          BILLBOARD CHARTS
        </div>
        <div className="pad-card rounded-2xl p-4 space-y-4">
          <div>
            <div className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase mb-2.5">
              HOT 100 SONGS
            </div>
            {topSong && (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-8 h-8 rounded-lg bg-amber-400 text-zinc-950 font-mono-num text-[17px] font-extrabold flex items-center justify-center shrink-0 tabular-nums">
                    1
                  </span>
                  <div className="min-w-0">
                    <div className="text-[15px] font-extrabold text-white truncate">
                      {topSong.title}
                    </div>
                    <div className="text-[12px] text-zinc-400 truncate">
                      {topSong.artistLine}
                    </div>
                  </div>
                </div>
                <img
                  src={topSong.coverUrl}
                  alt={topSong.title}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-lg object-cover shrink-0 bg-zinc-800 border border-white/10"
                />
              </div>
            )}
          </div>

          <div className="border-t border-white/[0.06]" />

          <div>
            <div className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase mb-1.5">
              HOT 200 ALBUMS
            </div>
            {topPlayerAlbum ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono-num text-[18px] font-extrabold text-white tabular-nums">
                    #{topPlayerAlbum.rank}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[14px] font-bold text-white truncate">
                      {topPlayerAlbum.title}
                    </div>
                    <div className="text-xs text-zinc-400 truncate">
                      {topPlayerAlbum.artistLine}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-lg font-bold text-zinc-500 px-1">-</div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setModal('charts')}
            className="w-full py-2 rounded-xl bg-amber-400/12 hover:bg-amber-400/20 border border-amber-400/25 text-center text-[12px] font-extrabold tracking-wider text-amber-300 snap-transition"
          >
            SEE FULL CHARTS
          </button>
        </div>
      </div>

      {/* OTHER */}
      <div>
        <div className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase px-1 mb-1.5">
          ARCHIVES & RECORDS
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setModal('wiki')}
            className="pad-card pad-card-hover rounded-xl px-3.5 py-3 flex items-center gap-3 text-left snap-transition"
          >
            <div className="w-9 h-9 rounded-lg bg-zinc-200 flex items-center justify-center font-serif text-lg font-bold text-zinc-900 shrink-0">
              W
            </div>
            <div className="text-[12px] font-extrabold text-white leading-tight">
              WIKI
              <br />
              PAGE
            </div>
          </button>

          <button
            type="button"
            onClick={() => setModal('records')}
            className="pad-card pad-card-hover rounded-xl px-3.5 py-3 flex items-center gap-3 text-left snap-transition"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-400/15 border border-amber-400/25 flex items-center justify-center text-amber-400 shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div className="text-[12px] font-extrabold text-white leading-tight">
              WORLD
              <br />
              RECORDS
            </div>
          </button>
        </div>
      </div>

      {/* MODALS */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-3">
          <div className="w-full max-w-md bg-[#14161c] border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07] bg-[#0e1015]">
              <h3 className="font-display text-base font-extrabold text-white uppercase">
                {modal === 'charts' && 'Global Music Charts'}
                {modal === 'wiki' && `${state.artistName} — Encyclopedia`}
                {modal === 'records' && 'All-Time World Records'}
              </h3>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto slim-scroll space-y-3">
              {modal === 'charts' && (
                <>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#0e1015] rounded-xl border border-white/[0.06]">
                    <button
                      type="button"
                      onClick={() => setChartTab('songs')}
                      className={`py-1.5 rounded-lg text-xs font-extrabold ${
                        chartTab === 'songs' ? 'bg-amber-400 text-zinc-950' : 'text-zinc-400'
                      }`}
                    >
                      HOT 100 SONGS
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartTab('albums')}
                      className={`py-1.5 rounded-lg text-xs font-extrabold ${
                        chartTab === 'albums' ? 'bg-amber-400 text-zinc-950' : 'text-zinc-400'
                      }`}
                    >
                      HOT 200 ALBUMS
                    </button>
                  </div>

                  <div className="space-y-2">
                    {chartTab === 'songs'
                      ? hot100.slice(0, 25).map((entry) => (
                          <div
                            key={entry.songId}
                            className={`p-2.5 rounded-xl flex items-center gap-3 ${
                              entry.isPlayer
                                ? 'bg-amber-400/12 border border-amber-400/35'
                                : 'bg-[#1a1d26]'
                            }`}
                          >
                            <span className="w-6 text-center font-mono-num font-extrabold text-white tabular-nums">
                              {entry.rank}
                            </span>
                            <img
                              src={entry.coverUrl}
                              alt={entry.title}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-lg object-cover shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-white text-sm truncate">{entry.title}</div>
                              <div className="text-xs text-zinc-400 truncate">{entry.artistLine}</div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="font-mono-num text-xs font-bold text-emerald-400 tabular-nums">
                                {formatCompactNumber(entry.weeklyStreams)}
                              </div>
                              <div className="text-[10px] text-zinc-500">wk</div>
                            </div>
                          </div>
                        ))
                      : hot200.map((alb) => (
                          <div
                            key={alb.albumId}
                            className={`p-2.5 rounded-xl flex items-center gap-3 ${
                              alb.isPlayer
                                ? 'bg-amber-400/12 border border-amber-400/35'
                                : 'bg-[#1a1d26]'
                            }`}
                          >
                            <span className="w-6 text-center font-mono-num font-extrabold text-white tabular-nums">
                              {alb.rank}
                            </span>
                            <img
                              src={alb.coverUrl}
                              alt={alb.title}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-lg object-cover shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-white text-sm truncate">{alb.title}</div>
                              <div className="text-xs text-zinc-400 truncate">{alb.artistLine}</div>
                            </div>
                            <div className="font-mono-num text-xs font-bold text-emerald-400 tabular-nums">
                              {formatCompactNumber(alb.weeklyStreams)}
                            </div>
                          </div>
                        ))}
                  </div>
                </>
              )}

              {modal === 'wiki' && (
                <div className="bg-white text-slate-900 rounded-xl p-4 space-y-3">
                  <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                    <div>
                      <h4 className="font-serif text-xl font-bold">{state.artistName}</h4>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Globe2 className="w-3.5 h-3.5" /> Recording Artist · {state.hometown}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-600">Fame {state.fameLevel}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-700">
                    <strong>{state.artistName}</strong> ({state.handle}) is a {state.genre} recording
                    artist, producer, and actor from {state.hometown}. With{' '}
                    {formatCompactNumber(state.careerStats.totalStreams)} career streams and{' '}
                    {state.careerStats.numberOneHits} Billboard Hot 100 #1 hit
                    {state.careerStats.numberOneHits === 1 ? '' : 's'}, their estimated net worth stands
                    at {formatMoney(state.netWorth)}.
                  </p>
                  <div className="bg-slate-100 rounded-xl p-3 text-xs space-y-1.5">
                    <div className="font-bold text-slate-900">Quick Facts</div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Genres</span>
                      <span className="font-semibold">{state.genre}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Label</span>
                      <span className="font-semibold">{state.contract?.labelName || 'Independent'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Songs Released</span>
                      <span className="font-semibold tabular-nums">{state.songs.filter((s) => s.released).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Acting Credits</span>
                      <span className="font-semibold tabular-nums">{state.actorCredits}</span>
                    </div>
                  </div>
                </div>
              )}

              {modal === 'records' && (
                <div className="space-y-2.5">
                  {worldRecords.map((r) => (
                    <div
                      key={r.label}
                      className={`p-3 rounded-xl flex items-center justify-between ${
                        r.isPlayer ? 'bg-amber-400/12 border border-amber-400/35' : 'bg-[#1a1d26]'
                      }`}
                    >
                      <div>
                        <div className="text-[11px] text-zinc-400 uppercase font-bold">{r.label}</div>
                        <div className="font-bold text-white text-sm mt-0.5">{r.holder}</div>
                      </div>
                      <div className="font-mono-num font-extrabold text-amber-400 tabular-nums">
                        {r.val}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
