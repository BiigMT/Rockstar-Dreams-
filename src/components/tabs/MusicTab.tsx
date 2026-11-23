import React, { useState } from 'react';
import { ChevronRight, Disc, Music2, Pause, Play, Radio, Sparkles, X } from 'lucide-react';
import { Album, GameState, Song } from '../../types/game';
import { formatCompactNumber, formatMoney } from '../../engine/simulation';

interface MusicTabProps {
  state: GameState;
  onPlaySong: (songId: string) => void;
  onPromoteSong: (songId: string, channel: 'playlist' | 'radio' | 'viral', cost: number) => void;
}

export const MusicTab: React.FC<MusicTabProps> = ({
  state,
  onPlaySong,
  onPromoteSong,
}) => {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [listModal, setListModal] = useState<null | 'albums' | 'singles' | 'all' | 'features'>(null);

  const releasedSongs = state.songs.filter((s) => s.released);
  const popularTop5 = [...releasedSongs]
    .sort((a, b) => b.totalStreams - a.totalStreams)
    .slice(0, 5);

  const latestSingle = [...releasedSongs].reverse()[0] || null;
  const latestAlbum: Album | null = [...state.albums].filter((a) => a.released).reverse()[0] || null;
  const featureSongs = releasedSongs.filter((s) => Boolean(s.featuredArtistName));

  return (
    <div className="flex-1 overflow-y-auto slim-scroll px-3.5 py-3 space-y-3.5">
      {/* POPULAR TOP 5 */}
      <div>
        <div className="flex items-center justify-between px-1 mb-2">
          <span className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
            POPULAR TRACKLIST
          </span>
          <span className="font-mono-num text-[10px] text-zinc-500">STREAMS</span>
        </div>
        <div className="pad-card rounded-2xl p-1.5 divide-y divide-white/[0.04]">
          {popularTop5.length === 0 ? (
            <div className="py-6 text-center text-xs text-zinc-400">
              No released songs yet. Head to the Studio tab to drop your debut!
            </div>
          ) : (
            popularTop5.map((song, idx) => {
              const isPlaying = state.nowPlayingSongId === song.id && state.isAudioPlaying;
              return (
                <div
                  key={song.id}
                  className="px-2.5 py-2 rounded-xl hover:bg-white/[0.03] flex items-center justify-between gap-2.5 snap-transition"
                >
                  <button
                    type="button"
                    onClick={() => onPlaySong(song.id)}
                    aria-label={isPlaying ? `Pause ${song.title}` : `Play ${song.title}`}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 snap-transition ${
                      isPlaying
                        ? 'bg-amber-400 text-zinc-950'
                        : 'bg-white/[0.05] text-zinc-400 hover:text-white'
                    }`}
                  >
                    {isPlaying ? (
                      <Pause className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedSong(song)}
                    className="flex-1 min-w-0 flex items-center justify-between gap-3 text-left"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono-num text-[12px] font-bold text-zinc-500 tabular-nums">
                        0{idx + 1}
                      </span>
                      <span className="text-[14px] font-bold text-white truncate">
                        {song.title}
                      </span>
                    </div>
                    <span className="font-mono-num text-[13px] font-semibold text-amber-400 tabular-nums shrink-0">
                      {formatCompactNumber(song.totalStreams)}
                    </span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* LAST ALBUM & LAST SINGLE */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
            LAST ALBUM
          </span>
          <button
            type="button"
            onClick={() => setListModal('albums')}
            className="px-4 py-1 rounded-lg bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-300 text-[10px] font-extrabold tracking-wider uppercase snap-transition"
          >
            ALBUMS
          </button>
        </div>

        {latestAlbum && (
          <button
            type="button"
            onClick={() => setListModal('albums')}
            className="w-full pad-card pad-card-hover rounded-2xl p-3 flex items-center gap-3.5 text-left snap-transition"
          >
            <img
              src={latestAlbum.coverUrl}
              alt={latestAlbum.title}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-xl object-cover shrink-0 bg-zinc-800 border border-white/10"
            />
            <div className="min-w-0 flex-1">
              <div className="text-[16px] font-extrabold text-white truncate">
                {latestAlbum.title}
              </div>
              <div className="font-mono-num text-[12px] text-zinc-400 tabular-nums">
                {latestAlbum.releaseYear || state.date.year} · {formatCompactNumber(latestAlbum.totalStreams)}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-500 shrink-0" />
          </button>
        )}

        <div className="flex items-center justify-between px-1 pt-1">
          <span className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
            LAST SINGLE
          </span>
          <button
            type="button"
            onClick={() => setListModal('singles')}
            className="px-4 py-1 rounded-lg bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-300 text-[10px] font-extrabold tracking-wider uppercase snap-transition"
          >
            SINGLES
          </button>
        </div>

        {latestSingle && (
          <button
            type="button"
            onClick={() => setSelectedSong(latestSingle)}
            className="w-full pad-card pad-card-hover rounded-2xl p-3 flex items-center gap-3.5 text-left snap-transition"
          >
            <img
              src={latestSingle.coverUrl}
              alt={latestSingle.title}
              referrerPolicy="no-referrer"
              className="w-[72px] h-[72px] rounded-xl object-cover shrink-0 bg-zinc-800 border border-white/10"
            />
            <div className="min-w-0 flex-1">
              <div className="text-[17px] font-extrabold text-white truncate">
                {latestSingle.title}
              </div>
              <div className="font-mono-num text-[12px] text-zinc-400 tabular-nums mt-0.5">
                {latestSingle.releaseYear || state.date.year} · {latestSingle.genre}
              </div>
              {latestSingle.peakChartPos && (
                <div className="text-[11px] font-bold text-emerald-400 mt-1">
                  Peak #{latestSingle.peakChartPos} Hot 100
                </div>
              )}
            </div>
            <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-zinc-300 shrink-0">
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        )}
      </div>

      {/* ALL YOUR SONGS & YOUR FEATURES */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={() => setListModal('all')}
          className="pad-card pad-card-hover rounded-xl px-3 py-3 flex items-center justify-between text-left snap-transition"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-rose-500/15 flex items-center justify-center text-rose-400 shrink-0">
              <Music2 className="w-4 h-4" />
            </div>
            <span className="text-[12px] font-extrabold text-white tracking-wide truncate">
              ALL SONGS
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => setListModal('features')}
          className="pad-card pad-card-hover rounded-xl px-3 py-3 flex items-center justify-between text-left snap-transition"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-sky-500/15 flex items-center justify-center text-sky-400 shrink-0">
              <Disc className="w-4 h-4" />
            </div>
            <span className="text-[12px] font-extrabold text-white tracking-wide truncate">
              FEATURES
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
        </button>
      </div>

      {/* Song Analytics & Promo Modal */}
      {selectedSong && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-3">
          <div className="w-full max-w-md bg-[#14161c] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 flex items-start gap-3.5 border-b border-white/[0.07] bg-[#0e1015]">
              <img
                src={selectedSong.coverUrl}
                alt={selectedSong.title}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-xl object-cover shrink-0 bg-zinc-800 border border-white/10"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-lg font-extrabold text-white truncate">
                      {selectedSong.title}
                    </h3>
                    <div className="text-xs text-zinc-400">
                      {selectedSong.genre} · {selectedSong.mood} · {selectedSong.bpm} BPM
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedSong(null)}
                    className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-2.5">
                  <button
                    type="button"
                    onClick={() => onPlaySong(selectedSong.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-extrabold flex items-center gap-1.5"
                  >
                    {state.nowPlayingSongId === selectedSong.id && state.isAudioPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" /> Pause Audio
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" /> Play Beat
                      </>
                    )}
                  </button>
                  {selectedSong.peakChartPos && (
                    <span className="font-mono-num text-xs font-bold text-amber-400 tabular-nums">
                      Peak #{selectedSong.peakChartPos}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-[#1a1d26]">
                  <div className="text-[10px] text-zinc-400">Total Streams</div>
                  <div className="font-mono-num font-bold text-white tabular-nums">
                    {formatCompactNumber(selectedSong.totalStreams)}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#1a1d26]">
                  <div className="text-[10px] text-zinc-400">Weekly</div>
                  <div className="font-mono-num font-bold text-emerald-400 tabular-nums">
                    {formatCompactNumber(selectedSong.weeklyStreams)}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#1a1d26]">
                  <div className="text-[10px] text-zinc-400">Quality</div>
                  <div className="font-mono-num font-bold text-amber-400 tabular-nums">
                    {selectedSong.quality}/100
                  </div>
                </div>
              </div>

              <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Promote Track
              </div>
              <div className="space-y-2">
                {[
                  { id: 'playlist' as const, label: 'Soundify Playlist Pitch', cost: 4500, icon: Disc },
                  { id: 'radio' as const, label: 'National Radio Push', cost: 18000, icon: Radio },
                  { id: 'viral' as const, label: 'TicTok Creator Seeding', cost: 9500, icon: Sparkles },
                ].map((promo) => (
                  <button
                    key={promo.id}
                    type="button"
                    disabled={state.cash < promo.cost}
                    onClick={() => {
                      onPromoteSong(selectedSong.id, promo.id, promo.cost);
                      setSelectedSong(null);
                    }}
                    className="w-full p-2.5 rounded-xl bg-[#1a1d26] hover:bg-[#222632] border border-white/[0.05] disabled:opacity-40 flex items-center justify-between text-xs"
                  >
                    <span className="flex items-center gap-2 font-bold text-white">
                      <promo.icon className="w-4 h-4 text-amber-400" />
                      {promo.label}
                    </span>
                    <span className="font-mono-num font-bold text-emerald-400 tabular-nums">
                      {formatMoney(promo.cost)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List Modal */}
      {listModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-3">
          <div className="w-full max-w-md bg-[#14161c] border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07] bg-[#0e1015]">
              <h3 className="font-display text-base font-extrabold text-white uppercase">
                {listModal === 'albums' && 'Your Albums & Projects'}
                {listModal === 'singles' && 'Released Singles'}
                {listModal === 'all' && `All Songs (${state.songs.length})`}
                {listModal === 'features' && `Collaborations (${featureSongs.length})`}
              </h3>
              <button
                type="button"
                onClick={() => setListModal(null)}
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 overflow-y-auto slim-scroll space-y-2">
              {listModal === 'albums' ? (
                state.albums.filter((a) => a.released).length === 0 ? (
                  <p className="text-xs text-zinc-400 text-center py-6">
                    No albums released yet. Create one in Studio &gt; Albums.
                  </p>
                ) : (
                  state.albums
                    .filter((a) => a.released)
                    .map((alb) => (
                      <div
                        key={alb.id}
                        className="p-2.5 rounded-xl bg-[#1a1d26] flex items-center gap-3"
                      >
                        <img
                          src={alb.coverUrl}
                          alt={alb.title}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-white text-sm truncate">{alb.title}</div>
                          <div className="text-xs text-zinc-400">
                            {alb.type} · {alb.songIds.length} tracks
                          </div>
                        </div>
                        <div className="font-mono-num text-xs font-bold text-emerald-400 tabular-nums">
                          {formatCompactNumber(alb.totalStreams)}
                        </div>
                      </div>
                    ))
                )
              ) : (
                (listModal === 'features'
                  ? featureSongs
                  : listModal === 'singles'
                  ? releasedSongs.filter((s) => s.isSingle)
                  : state.songs
                ).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setListModal(null);
                      if (s.released) setSelectedSong(s);
                    }}
                    className="w-full p-2.5 rounded-xl bg-[#1a1d26] hover:bg-[#222632] flex items-center gap-3 text-left"
                  >
                    <img
                      src={s.coverUrl}
                      alt={s.title}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-white text-sm truncate">{s.title}</div>
                      <div className="text-xs text-zinc-400 truncate">
                        {s.released ? `${s.genre} · Quality ${s.quality}` : 'Unreleased Demo'}
                        {s.featuredArtistName ? ` · ft. ${s.featuredArtistName}` : ''}
                      </div>
                    </div>
                    <div className="font-mono-num text-xs font-bold text-zinc-300 tabular-nums">
                      {s.released ? formatCompactNumber(s.totalStreams) : 'Draft'}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
