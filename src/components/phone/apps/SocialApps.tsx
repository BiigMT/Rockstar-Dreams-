import React, { useState } from 'react';
import {
  BadgeCheck,
  ChevronLeft,
  Flame,
  Heart,
  MessageCircle,
  Music,
  Play,
  Repeat2,
  Search,
  Send,
  ThumbsUp,
  Video,
  X as XIcon,
} from 'lucide-react';
import { COVER_ARTS } from '../../../data/gameCatalog';
import { GameState } from '../../../types/game';
import { formatCompactNumber, formatMoney, getHot100Songs } from '../../../engine/simulation';

interface SocialAppsProps {
  appId: 'x' | 'instaglam' | 'tictok' | 'youtube' | 'goggle' | 'linkup' | 'phone_settings';
  state: GameState;
  onBackHome: () => void;
  onCreatePost: (
    platform: 'x' | 'instaglam' | 'tictok' | 'youtube',
    content: string,
    extra?: { imageUrl?: string; songId?: string; headline?: string }
  ) => void;
  onLikePost: (postId: string) => void;
  onMatchLinkup: (profileId: string, accepted: boolean) => void;
  onChangePhoneSettings: (wallpaper: GameState['phoneWallpaper']) => void;
  onPlaySong: (songId: string) => void;
}

export const SocialApps: React.FC<SocialAppsProps> = ({
  appId,
  state,
  onBackHome,
  onCreatePost,
  onLikePost,
  onMatchLinkup,
  onChangePhoneSettings,
  onPlaySong,
}) => {
  const [draft, setDraft] = useState('');
  const [goggleQuery, setGoggleQuery] = useState('');
  const [selectedCover, setSelectedCover] = useState(COVER_ARTS[0].url);
  const [selectedSongId, setSelectedSongId] = useState(
    state.songs.find((s) => s.released)?.id || ''
  );

  // 1. X (Twitter)
  if (appId === 'x') {
    const posts = state.posts.filter((p) => p.platform === 'x');
    return (
      <div className="h-full bg-black text-white flex flex-col">
        <div className="px-3.5 pt-3 pb-2 flex items-center justify-between border-b border-zinc-800">
          <button type="button" onClick={onBackHome} className="text-zinc-300">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-extrabold text-lg">𝕏</span>
          <span className="text-xs text-zinc-400 tabular-nums">
            {formatCompactNumber(state.socialFollowers.x)} followers
          </span>
        </div>

        <div className="p-3 border-b border-zinc-800 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="What's happening?"
              className="flex-1 bg-zinc-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
            <button
              type="button"
              disabled={!draft.trim()}
              onClick={() => {
                onCreatePost('x', draft.trim());
                setDraft('');
              }}
              className="px-3.5 py-2 rounded-full bg-[#1d9bf0] disabled:opacity-40 text-white text-xs font-bold"
            >
              Post
            </button>
          </div>
          <div className="flex gap-1.5 overflow-x-auto slim-scroll">
            {[
              `New single coming soon.`,
              `Shoutout to everyone streaming right now!`,
              `Who wants a collab next?`,
            ].map((quick) => (
              <button
                key={quick}
                type="button"
                onClick={() => onCreatePost('x', quick)}
                className="px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300 whitespace-nowrap"
              >
                {quick}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto slim-scroll divide-y divide-zinc-800">
          {posts.map((p) => (
            <div key={p.id} className="p-3 space-y-1.5">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center shrink-0"
                  style={{ backgroundColor: p.authorColor }}
                >
                  {p.authorInitials}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-xs font-bold truncate">
                    <span>{p.authorName}</span>
                    {p.isVerified && <BadgeCheck className="w-3.5 h-3.5 text-[#1d9bf0]" />}
                    <span className="text-zinc-500 font-normal">{p.authorHandle} · {p.timeAgo}</span>
                  </div>
                </div>
              </div>
              <p className="text-[13px] text-zinc-100 leading-snug">{p.content}</p>
              <div className="flex items-center gap-6 pt-1 text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5" /> {formatCompactNumber(p.comments)}
                </span>
                <span className="flex items-center gap-1">
                  <Repeat2 className="w-3.5 h-3.5" /> {formatCompactNumber(p.shares)}
                </span>
                <button
                  type="button"
                  onClick={() => onLikePost(p.id)}
                  className={`flex items-center gap-1 ${p.likedByPlayer ? 'text-rose-500' : ''}`}
                >
                  <Heart className="w-3.5 h-3.5" /> {formatCompactNumber(p.likes)}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. INSTAGLAM
  if (appId === 'instaglam') {
    const posts = state.posts.filter((p) => p.platform === 'instaglam');
    return (
      <div className="h-full bg-[#09090b] text-white flex flex-col">
        <div className="px-3.5 pt-3 pb-2 flex items-center justify-between border-b border-zinc-800">
          <button type="button" onClick={onBackHome} className="text-zinc-300">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-base tracking-tight">Instaglam</span>
          <span className="text-xs text-pink-400 font-bold tabular-nums">
            {formatCompactNumber(state.socialFollowers.instaglam)}
          </span>
        </div>

        <div className="p-3 border-b border-zinc-800 space-y-2">
          <div className="flex gap-1.5">
            {COVER_ARTS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCover(c.url)}
                className={`w-10 h-10 rounded-lg overflow-hidden border-2 ${
                  selectedCover === c.url ? 'border-pink-500' : 'border-transparent opacity-60'
                }`}
              >
                <img src={c.url} alt={c.label} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a caption for your photo..."
              className="flex-1 bg-zinc-900 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
            />
            <button
              type="button"
              disabled={!draft.trim()}
              onClick={() => {
                onCreatePost('instaglam', draft.trim(), { imageUrl: selectedCover });
                setDraft('');
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 disabled:opacity-40 text-white text-xs font-bold"
            >
              Share
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto slim-scroll space-y-3 pb-3">
          {posts.map((p) => (
            <div key={p.id} className="border-b border-zinc-900 pb-2.5">
              <div className="px-3 py-2 flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full text-[10px] font-bold flex items-center justify-center"
                  style={{ backgroundColor: p.authorColor }}
                >
                  {p.authorInitials}
                </div>
                <span className="text-xs font-bold">{p.authorHandle.replace('@', '')}</span>
              </div>
              {p.imageUrl && (
                <img
                  src={p.imageUrl}
                  alt="IG"
                  referrerPolicy="no-referrer"
                  className="w-full aspect-square object-cover"
                />
              )}
              <div className="px-3 pt-2 space-y-1">
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => onLikePost(p.id)}>
                    <Heart className={`w-5 h-5 ${p.likedByPlayer ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
                  </button>
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div className="text-xs font-bold tabular-nums">{formatCompactNumber(p.likes)} likes</div>
                <p className="text-xs text-zinc-200">
                  <strong>{p.authorHandle.replace('@', '')}</strong> {p.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. TICTOK (Viral Song Snippets)
  if (appId === 'tictok') {
    const posts = state.posts.filter((p) => p.platform === 'tictok');
    const releasedSongs = state.songs.filter((s) => s.released);
    return (
      <div className="h-full bg-black text-white flex flex-col">
        <div className="px-3.5 pt-3 pb-2 flex items-center justify-between border-b border-zinc-800">
          <button type="button" onClick={onBackHome} className="text-zinc-300">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-extrabold text-sm">
            Tic<span className="text-[#25f4ee]">T</span><span className="text-[#fe2c55]">ok</span>
          </span>
          <span className="text-xs text-zinc-400 tabular-nums">
            {formatCompactNumber(state.socialFollowers.tictok)}
          </span>
        </div>

        <div className="p-3 bg-zinc-950 border-b border-zinc-800 space-y-2">
          <div className="text-[11px] font-bold text-[#25f4ee]">Post 15s Viral Sound Clip</div>
          <select
            value={selectedSongId}
            onChange={(e) => setSelectedSongId(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white"
          >
            {releasedSongs.length === 0 ? (
              <option value="">Freestyle Snippet (No Song)</option>
            ) : (
              releasedSongs.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))
            )}
          </select>
          <div className="flex gap-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Clip caption / #challenge..."
              className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-900 text-xs text-white focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                const s = releasedSongs.find((x) => x.id === selectedSongId);
                onCreatePost('tictok', draft.trim() || `Studio snippet going crazy #newmusic`, {
                  songId: s?.id,
                });
                setDraft('');
              }}
              className="px-3 py-1.5 rounded-lg bg-[#fe2c55] text-white text-xs font-extrabold"
            >
              Upload
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto slim-scroll p-3 space-y-2.5">
          {posts.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-3.5 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{p.authorHandle}</span>
                <span className="text-[11px] font-bold text-[#25f4ee] tabular-nums">
                  {formatCompactNumber(p.views || p.likes * 12)} views
                </span>
              </div>
              <p className="text-xs text-zinc-200">{p.content}</p>
              {p.songTitle && (
                <button
                  type="button"
                  onClick={() => p.songId && onPlaySong(p.songId)}
                  className="flex items-center gap-1.5 text-[11px] text-[#fe2c55] font-semibold"
                >
                  <Music className="w-3.5 h-3.5" /> Sound: {p.songTitle}
                </button>
              )}
              <div className="flex items-center gap-4 text-xs text-zinc-400 pt-1">
                <button type="button" onClick={() => onLikePost(p.id)} className="flex items-center gap-1">
                  <Heart className={`w-3.5 h-3.5 ${p.likedByPlayer ? 'fill-[#fe2c55] text-[#fe2c55]' : ''}`} />
                  {formatCompactNumber(p.likes)}
                </button>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5" /> {formatCompactNumber(p.comments)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 4. YOUTUBE
  if (appId === 'youtube') {
    const posts = state.posts.filter((p) => p.platform === 'youtube');
    return (
      <div className="h-full bg-[#0f0f0f] text-white flex flex-col">
        <div className="px-3.5 pt-3 pb-2 flex items-center justify-between border-b border-zinc-800">
          <button type="button" onClick={onBackHome} className="text-zinc-300">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-extrabold text-sm flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-[#ff0000] text-white text-[10px]">▶</span>
            YouTube
          </span>
          <span className="text-xs text-zinc-400 tabular-nums">
            {formatCompactNumber(state.socialFollowers.youtube)} subs
          </span>
        </div>

        <div className="p-3 border-b border-zinc-800 flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Upload vlog or freestyle title..."
            className="flex-1 px-3 py-1.5 rounded-lg bg-[#272727] text-xs text-white focus:outline-none"
          />
          <button
            type="button"
            disabled={!draft.trim()}
            onClick={() => {
              onCreatePost('youtube', 'New official channel upload.', {
                headline: draft.trim(),
                imageUrl: COVER_ARTS[2].url,
              });
              setDraft('');
            }}
            className="px-3 py-1.5 rounded-lg bg-[#ff0000] disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1"
          >
            <Video className="w-3.5 h-3.5" /> Post
          </button>
        </div>

        <div className="flex-1 overflow-y-auto slim-scroll p-3 space-y-3">
          {posts.map((v) => (
            <div key={v.id} className="space-y-2">
              <div className="relative rounded-xl overflow-hidden bg-zinc-900 aspect-video flex items-center justify-center">
                {v.imageUrl && (
                  <img
                    src={v.imageUrl}
                    alt={v.headline || 'Video'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-80"
                  />
                )}
                <button
                  type="button"
                  onClick={() => v.songId && onPlaySong(v.songId)}
                  className="absolute w-12 h-12 rounded-full bg-black/75 flex items-center justify-center text-white"
                >
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </button>
              </div>
              <div>
                <div className="font-bold text-xs text-white leading-snug">
                  {v.headline || v.content}
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5 tabular-nums">
                  {v.authorName} · {formatCompactNumber(v.views || 120000)} views · {v.timeAgo}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 5. GOGGLE (Real Search Engine)
  if (appId === 'goggle') {
    const q = goggleQuery.trim().toLowerCase();
    const matchedSong = state.songs.find((s) => s.title.toLowerCase().includes(q));
    const matchedNpc = state.npcs.find((n) => n.name.toLowerCase().includes(q));
    const hot100 = getHot100Songs(state);

    return (
      <div className="h-full bg-white text-slate-900 flex flex-col">
        <div className="px-3.5 pt-3 pb-2 flex items-center justify-between">
          <button type="button" onClick={onBackHome} className="text-slate-700">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xl font-extrabold tracking-tight">
            <span className="text-[#4285F4]">G</span>
            <span className="text-[#EA4335]">o</span>
            <span className="text-[#FBBC05]">g</span>
            <span className="text-[#4285F4]">g</span>
            <span className="text-[#34A853]">l</span>
            <span className="text-[#EA4335]">e</span>
          </span>
          <div className="w-5" />
        </div>

        <div className="px-3.5 pb-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={goggleQuery}
              onChange={(e) => setGoggleQuery(e.target.value)}
              placeholder={`Search "${state.artistName}", songs, net worth...`}
              className="w-full pl-9 pr-3 py-2 rounded-full border border-slate-300 text-xs focus:outline-none focus:border-[#4285F4]"
            />
          </div>
          <div className="flex gap-1.5 mt-2 overflow-x-auto slim-scroll">
            {[state.artistName, 'Hot 100', state.songs[0]?.title || 'ZillaMorgue', 'Net Worth'].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setGoggleQuery(chip)}
                className="px-2.5 py-1 rounded-full bg-slate-100 text-[11px] font-medium text-slate-700 whitespace-nowrap"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto slim-scroll px-3.5 pb-4 space-y-3">
          {!q || state.artistName.toLowerCase().includes(q) || q.includes('net worth') ? (
            <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 space-y-1.5">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Knowledge Panel</div>
              <div className="font-extrabold text-base">{state.artistName}</div>
              <div className="text-xs text-slate-600">
                {state.genre} Artist · {state.hometown}
              </div>
              <div className="text-xs text-slate-800 pt-1">
                <strong>Estimated Net Worth:</strong> {formatMoney(state.netWorth)}
              </div>
              <div className="text-xs text-slate-800">
                <strong>Career Streams:</strong> {formatCompactNumber(state.careerStats.totalStreams)}
              </div>
            </div>
          ) : null}

          {q && matchedSong && (
            <div className="p-3 rounded-2xl border border-slate-200 space-y-1">
              <div className="text-[11px] text-emerald-700 font-semibold">soundify.io › track</div>
              <div className="font-bold text-sm text-[#1a0dab]">{matchedSong.title} — {state.artistName}</div>
              <p className="text-xs text-slate-600">
                Released {matchedSong.releaseYear} · {formatCompactNumber(matchedSong.totalStreams)} streams · Peak #{matchedSong.peakChartPos || 'Uncharted'}.
              </p>
            </div>
          )}

          {q && matchedNpc && (
            <div className="p-3 rounded-2xl border border-slate-200 space-y-1">
              <div className="text-[11px] text-emerald-700 font-semibold">musicwiki.org › artist</div>
              <div className="font-bold text-sm text-[#1a0dab]">{matchedNpc.name} ({matchedNpc.genre})</div>
              <p className="text-xs text-slate-600">
                Known for "{matchedNpc.signatureHit}". {formatCompactNumber(matchedNpc.monthlyListeners)} monthly listeners.
              </p>
            </div>
          )}

          {q.includes('hot 100') || q.includes('chart') ? (
            <div className="p-3 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="font-bold text-sm text-[#1a0dab]">Billboard Hot 100 Top 5</div>
              {hot100.slice(0, 5).map((c) => (
                <div key={c.songId} className="text-xs text-slate-700">
                  #{c.rank} <strong>{c.title}</strong> — {c.artistLine}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // 6. LINKUP (Swipe Networking / Dating)
  if (appId === 'linkup') {
    const candidate = state.linkupPool.find((p) => !p.matched);
    return (
      <div className="h-full bg-[#091614] text-white flex flex-col">
        <div className="px-3.5 pt-3 pb-2 flex items-center justify-between border-b border-white/10">
          <button type="button" onClick={onBackHome} className="text-emerald-400">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-extrabold text-sm text-[#13ca9b]">Linkup</span>
          <span className="text-xs text-slate-400">
            {state.linkupPool.filter((p) => p.matched).length} matches
          </span>
        </div>

        <div className="flex-1 p-4 flex flex-col justify-center">
          {candidate ? (
            <div className="rounded-3xl bg-[#132925] border border-emerald-500/20 p-5 space-y-4">
              <div
                className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-2xl font-extrabold text-white shadow-lg"
                style={{ backgroundColor: candidate.color }}
              >
                {candidate.initials}
              </div>
              <div className="text-center">
                <div className="font-display text-xl font-extrabold">
                  {candidate.name}, {candidate.age}
                </div>
                <div className="text-xs font-bold text-[#13ca9b]">{candidate.role}</div>
                <p className="text-xs text-slate-300 mt-2">{candidate.bio}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onMatchLinkup(candidate.id, false)}
                  className="py-3 rounded-2xl bg-white/10 hover:bg-white/15 flex items-center justify-center text-rose-400"
                >
                  <XIcon className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={() => onMatchLinkup(candidate.id, true)}
                  className="py-3 rounded-2xl bg-[#13ca9b] hover:bg-[#19dfac] flex items-center justify-center text-slate-950"
                >
                  <Flame className="w-6 h-6 fill-current" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-xs text-slate-400 space-y-2">
              <ThumbsUp className="w-8 h-8 text-[#13ca9b] mx-auto" />
              <div className="font-bold text-white text-sm">You've matched with everyone nearby!</div>
              <p>Check the Heart tab in the main game dock to hang out with your new connections.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 7. PHONE SETTINGS
  return (
    <div className="h-full bg-[#1c1c1e] text-white flex flex-col">
      <div className="px-3.5 pt-3 pb-2 flex items-center justify-between border-b border-zinc-800">
        <button type="button" onClick={onBackHome} className="text-[#0a84ff] flex items-center text-sm">
          <ChevronLeft className="w-5 h-5" /> Home
        </button>
        <span className="font-bold text-sm">Settings</span>
        <div className="w-10" />
      </div>

      <div className="p-3.5 space-y-3">
        <div className="p-3 rounded-2xl bg-[#2c2c2e] flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-emerald-600 flex items-center justify-center font-bold">
            {state.artistName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-sm">{state.artistName}</div>
            <div className="text-xs text-zinc-400">{state.handle} · Artist ID</div>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[#2c2c2e] space-y-2">
          <div className="text-xs font-bold text-zinc-400 uppercase">Wallpaper</div>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { id: 'ocean', label: 'Ocean Teal' },
                { id: 'midnight', label: 'Midnight Indigo' },
                { id: 'emerald', label: 'Emerald Smoke' },
                { id: 'obsidian', label: 'Obsidian Matte' },
              ] as const
            ).map((wp) => (
              <button
                key={wp.id}
                type="button"
                onClick={() => onChangePhoneSettings(wp.id)}
                className={`py-2 px-3 rounded-xl text-xs font-bold ${
                  state.phoneWallpaper === wp.id
                    ? 'bg-[#0a84ff] text-white'
                    : 'bg-[#1c1c1e] text-zinc-300'
                }`}
              >
                {wp.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
