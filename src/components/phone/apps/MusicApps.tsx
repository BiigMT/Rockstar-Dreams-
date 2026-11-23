import React, { useState } from 'react';
import {
  BadgeCheck,
  ChevronLeft,
  Disc,
  Megaphone,
  Pause,
  Play,
  Radio,
  ShoppingBag,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { GameState } from '../../../types/game';
import { formatCompactNumber, formatMoney, getHot100Songs } from '../../../engine/simulation';

interface MusicAppsProps {
  appId: 'soundify' | 'pearmusic' | 'amazone' | 'streaming';
  state: GameState;
  onBackHome: () => void;
  onPlaySong: (songId: string) => void;
  onPromoteSong: (songId: string, channel: 'playlist' | 'radio' | 'viral', cost: number) => void;
  onBuyAmazonePerk: (title: string, cost: number, energyBoost: number, popBoost: number) => void;
}

export const MusicApps: React.FC<MusicAppsProps> = ({
  appId,
  state,
  onBackHome,
  onPlaySong,
  onPromoteSong,
  onBuyAmazonePerk,
}) => {
  const releasedSongs = [...state.songs]
    .filter((s) => s.released)
    .sort((a, b) => b.totalStreams - a.totalStreams);
  const [selectedPromoSongId, setSelectedPromoSongId] = useState<string>(
    releasedSongs[0]?.id || ''
  );

  // 1. SOUNDIFY (Spotify clone)
  if (appId === 'soundify') {
    const heroImg = releasedSongs[0]?.coverUrl;
    return (
      <div className="h-full bg-[#121212] text-white flex flex-col">
        <div className="relative h-44 bg-gradient-to-b from-[#1f4e37] to-[#121212] p-3.5 flex flex-col justify-between shrink-0">
          {heroImg && (
            <img
              src={heroImg}
              alt={state.artistName}
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
          )}
          <div className="relative flex items-center justify-between">
            <button
              type="button"
              onClick={onBackHome}
              className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-[11px] font-bold text-emerald-300 bg-black/40 px-2.5 py-1 rounded-full">
              Soundify
            </span>
          </div>

          <div className="relative">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-sky-300">
              <BadgeCheck className="w-3.5 h-3.5 fill-sky-400 text-black" />
              Verified Artist
            </div>
            <h1 className="text-[28px] font-extrabold tracking-tight leading-tight">
              {state.artistName}
            </h1>
            <div className="text-xs text-zinc-300 tabular-nums">
              {formatCompactNumber(state.socialFollowers.soundifyMonthly)} monthly listeners
            </div>
          </div>
        </div>

        <div className="px-3.5 py-2.5 flex items-center justify-between border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full border border-zinc-600 text-xs font-bold">
              Following
            </span>
            <span className="text-xs text-zinc-400 tabular-nums">
              {releasedSongs.length} releases
            </span>
          </div>
          {releasedSongs[0] && (
            <button
              type="button"
              onClick={() => onPlaySong(releasedSongs[0].id)}
              className="w-11 h-11 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black flex items-center justify-center shadow-lg"
            >
              {state.nowPlayingSongId === releasedSongs[0].id && state.isAudioPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto slim-scroll p-3.5 space-y-2">
          <div className="text-sm font-bold text-white mb-1">Popular</div>
          {releasedSongs.length === 0 ? (
            <p className="text-xs text-zinc-400 py-8 text-center">
              Release your first track in the Studio to appear on Soundify!
            </p>
          ) : (
            releasedSongs.map((song, i) => {
              const active = state.nowPlayingSongId === song.id && state.isAudioPlaying;
              return (
                <button
                  key={song.id}
                  type="button"
                  onClick={() => onPlaySong(song.id)}
                  className="w-full py-1.5 px-1.5 rounded-lg hover:bg-white/5 flex items-center gap-3 text-left"
                >
                  <span className="w-4 text-xs font-bold text-zinc-400 tabular-nums">
                    {i + 1}
                  </span>
                  <img
                    src={song.coverUrl}
                    alt={song.title}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-sm font-bold truncate ${
                        active ? 'text-[#1db954]' : 'text-white'
                      }`}
                    >
                      {song.title}
                    </div>
                    <div className="text-[11px] text-zinc-400 tabular-nums">
                      {formatCompactNumber(song.totalStreams)} streams
                    </div>
                  </div>
                  <div className="text-zinc-400">
                    {active ? <Pause className="w-4 h-4 text-[#1db954]" /> : <Play className="w-4 h-4" />}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // 2. PEAR MUSIC (Apple Music clone)
  if (appId === 'pearmusic') {
    const hot100 = getHot100Songs(state).slice(0, 12);
    return (
      <div className="h-full bg-[#ffffff] text-slate-900 flex flex-col">
        <div className="px-3.5 pt-3 pb-2 flex items-center justify-between border-b border-slate-200">
          <button
            type="button"
            onClick={onBackHome}
            className="flex items-center text-[#fa243c] text-sm font-semibold"
          >
            <ChevronLeft className="w-5 h-5" /> Home
          </button>
          <span className="font-extrabold text-sm text-[#fa243c]">Pear Music</span>
          <div className="w-10" />
        </div>

        <div className="flex-1 overflow-y-auto slim-scroll p-3.5 space-y-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Top Charts</h2>
            <p className="text-xs text-slate-500">Global Spatial Audio · Updated Live</p>
          </div>

          <div className="space-y-2">
            {hot100.map((entry) => {
              const isPlayerSong = entry.isPlayer;
              const active = state.nowPlayingSongId === entry.songId && state.isAudioPlaying;
              return (
                <div
                  key={entry.songId}
                  className={`p-2 rounded-xl flex items-center gap-2.5 ${
                    isPlayerSong ? 'bg-rose-50 border border-rose-200' : 'bg-slate-50'
                  }`}
                >
                  <span className="w-5 text-xs font-extrabold text-slate-500 tabular-nums text-center">
                    {entry.rank}
                  </span>
                  <img
                    src={entry.coverUrl}
                    alt={entry.title}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 truncate">{entry.title}</div>
                    <div className="text-[11px] text-slate-500 truncate">{entry.artistLine}</div>
                  </div>
                  {isPlayerSong && (
                    <button
                      type="button"
                      onClick={() => onPlaySong(entry.songId)}
                      className="w-7 h-7 rounded-full bg-[#fa243c] text-white flex items-center justify-center shrink-0"
                    >
                      {active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 3. AMAZONE (Gear & Digital Perks Store)
  if (appId === 'amazone') {
    const items = [
      { title: 'Studio Espresso Machine', desc: '+10 Energy now', cost: 450, energy: 10, pop: 0 },
      { title: 'Acoustic Diffuser Kit', desc: '+1.5 Popularity & +5 Energy', cost: 2800, energy: 5, pop: 1.5 },
      { title: 'Tour In-Ear Monitors', desc: '+3.0 Popularity & +8 Energy', cost: 8500, energy: 8, pop: 3.0 },
      { title: 'Limited Vinyl Box Run', desc: '+5.5 Popularity boost', cost: 24000, energy: 0, pop: 5.5 },
    ];
    return (
      <div className="h-full bg-[#0f172a] text-white flex flex-col">
        <div className="bg-[#131921] px-3.5 pt-3 pb-2.5 flex items-center justify-between border-b border-white/10">
          <button type="button" onClick={onBackHome} className="text-sky-400 flex items-center text-sm">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-extrabold text-base tracking-tight text-white">
            amazone<span className="text-[#38bdf8]">.music</span>
          </span>
          <ShoppingBag className="w-4 h-4 text-[#38bdf8]" />
        </div>

        <div className="flex-1 overflow-y-auto slim-scroll p-3.5 space-y-2.5">
          <div className="p-3 rounded-2xl bg-[#1e293b] border border-sky-500/20">
            <div className="text-xs text-sky-300 font-bold">Prime Artist Delivery</div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              Order studio gear, vinyl runs, and energy boosters delivered instantly.
            </div>
          </div>

          {items.map((item) => (
            <div
              key={item.title}
              className="p-3 rounded-2xl bg-[#1e293b] flex items-center justify-between gap-2"
            >
              <div>
                <div className="font-bold text-sm text-white">{item.title}</div>
                <div className="text-xs text-slate-400">{item.desc}</div>
              </div>
              <button
                type="button"
                disabled={state.cash < item.cost}
                onClick={() => onBuyAmazonePerk(item.title, item.cost, item.energy, item.pop)}
                className="px-3 py-1.5 rounded-xl bg-[#38bdf8] hover:bg-[#7dd3fc] disabled:opacity-40 text-slate-950 text-xs font-extrabold tabular-nums shrink-0"
              >
                {formatMoney(item.cost)}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 4. STREAMING (Campaigns & Playlist Pitching)
  const targetSong = releasedSongs.find((s) => s.id === selectedPromoSongId) || releasedSongs[0];

  return (
    <div className="h-full bg-[#091c1a] text-white flex flex-col">
      <div className="px-3.5 pt-3 pb-2.5 flex items-center justify-between border-b border-white/10">
        <button type="button" onClick={onBackHome} className="text-emerald-400 flex items-center text-sm">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1.5 font-extrabold text-sm">
          <Megaphone className="w-4 h-4 text-[#13ca9b]" /> Streaming Promo
        </div>
        <div className="w-6" />
      </div>

      <div className="flex-1 overflow-y-auto slim-scroll p-3.5 space-y-3">
        {releasedSongs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Drop a song in the Studio first to run streaming & radio campaigns.
          </div>
        ) : (
          <>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Select Song to Push
              </label>
              <select
                value={targetSong?.id || ''}
                onChange={(e) => setSelectedPromoSongId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#132c29] border border-white/10 text-sm text-white"
              >
                {releasedSongs.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({formatCompactNumber(s.weeklyStreams)}/wk)
                  </option>
                ))}
              </select>
            </div>

            {targetSong && (
              <div className="p-3 rounded-2xl bg-[#132c29] space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Playlist Reach</span>
                  <span className="font-bold text-emerald-400 tabular-nums">{targetSong.playlistReach}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Radio Rotation</span>
                  <span className="font-bold text-sky-400 tabular-nums">{targetSong.radioPush}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Viral Momentum</span>
                  <span className="font-bold text-rose-400 tabular-nums">{targetSong.viralScore}%</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {[
                {
                  channel: 'playlist' as const,
                  title: 'Editorial Playlist Pitch',
                  desc: '+22 Playlist Reach · Instant stream surge',
                  cost: 5000,
                  icon: Disc,
                },
                {
                  channel: 'radio' as const,
                  title: 'National Top 40 Radio Push',
                  desc: '+25 Radio Rotation · Long chart longevity',
                  cost: 22000,
                  icon: Radio,
                },
                {
                  channel: 'viral' as const,
                  title: 'Global Billboard & Creator Blitz',
                  desc: '+30 Viral Score · Massive Hot 100 spike',
                  cost: 48000,
                  icon: TrendingUp,
                },
              ].map((camp) => (
                <button
                  key={camp.channel}
                  type="button"
                  disabled={!targetSong || state.cash < camp.cost}
                  onClick={() => targetSong && onPromoteSong(targetSong.id, camp.channel, camp.cost)}
                  className="w-full p-3 rounded-2xl bg-[#132c29] hover:bg-[#193b37] disabled:opacity-40 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <camp.icon className="w-5 h-5 text-[#13ca9b] shrink-0" />
                    <div>
                      <div className="font-bold text-xs text-white">{camp.title}</div>
                      <div className="text-[11px] text-slate-400">{camp.desc}</div>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-400 tabular-nums shrink-0">
                    {formatMoney(camp.cost)}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
