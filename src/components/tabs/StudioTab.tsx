import React, { useState } from 'react';
import {
  ArrowRight,
  ChevronRight,
  Disc,
  Film,
  Music,
  Plus,
  Users,
  X,
} from 'lucide-react';
import { COVER_ARTS, STUDIO_LEVELS } from '../../data/gameCatalog';
import { GameState, MusicGenre, SongMood } from '../../types/game';
import { formatMoney } from '../../engine/simulation';

interface StudioTabProps {
  state: GameState;
  onRecordSong: (payload: {
    title: string;
    genre: MusicGenre;
    mood: SongMood;
    bpm: number;
    coverUrl: string;
    featuredArtistId?: string;
    releaseImmediately: boolean;
  }) => void;
  onReleaseSong: (songId: string) => void;
  onReleaseAlbum: (payload: {
    title: string;
    type: 'ALBUM' | 'EP' | 'MIXTAPE' | 'COLLAB';
    coverUrl: string;
    songIds: string[];
    collabArtistId?: string;
  }) => void;
  onShootVideo: (payload: {
    songId: string;
    tier: 'DIY' | 'Indie' | 'Cinematic' | 'Blockbuster';
    cost: number;
  }) => void;
  onUpgradeStudio: () => void;
}

type StudioModal = null | 'songs' | 'record_song' | 'albums' | 'videos' | 'collab' | 'upgrade';

const GENRES: MusicGenre[] = ['Hip-Hop', 'R&B', 'Pop', 'Trap', 'Indie', 'Rock'];
const MOODS: SongMood[] = ['Dark', 'Hype', 'Melodic', 'Emotional', 'Flex', 'Chill'];

export const StudioTab: React.FC<StudioTabProps> = ({
  state,
  onRecordSong,
  onReleaseSong,
  onReleaseAlbum,
  onShootVideo,
  onUpgradeStudio,
}) => {
  const [modal, setModal] = useState<StudioModal>(null);

  const [songTitle, setSongTitle] = useState('');
  const [songGenre, setSongGenre] = useState<MusicGenre>(state.genre);
  const [songMood, setSongMood] = useState<SongMood>('Dark');
  const [songBpm, setSongBpm] = useState(124);
  const [songCover, setSongCover] = useState(COVER_ARTS[0].url);
  const [featId, setFeatId] = useState<string>('');

  const [albumTitle, setAlbumTitle] = useState('');
  const [albumType, setAlbumType] = useState<'ALBUM' | 'EP' | 'MIXTAPE'>('ALBUM');
  const [albumCover, setAlbumCover] = useState(COVER_ARTS[2].url);
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);

  const [collabArtistId, setCollabArtistId] = useState(state.npcs[0]?.id || '');

  const unreleasedSongs = state.songs.filter((s) => !s.released);
  const songsNeedingVideo = state.songs.filter((s) => s.released && !s.hasVideo);
  const nextStudio = STUDIO_LEVELS.find((l) => l.level === state.studio.level + 1);

  const featNpc = state.npcs.find((n) => n.id === featId);
  const featFee = featNpc
    ? featNpc.relationship === 'friend'
      ? Math.round(featNpc.featFee * 0.4)
      : featNpc.featFee
    : 0;

  return (
    <div className="flex-1 overflow-y-auto slim-scroll px-3.5 py-3 space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
          PRODUCTION CONSOLE
        </span>
        <button
          type="button"
          onClick={() => setModal('record_song')}
          className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 text-[10px] font-extrabold tracking-wide flex items-center gap-1"
        >
          <Plus className="w-3 h-3 stroke-[3]" /> NEW TRACK
        </button>
      </div>

      {/* 4 Creation Pads */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setModal('songs')}
          className="pad-card pad-card-hover rounded-xl p-3 flex items-center justify-between text-left snap-transition"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-rose-500/15 border border-rose-500/25 flex items-center justify-center text-rose-400 shrink-0">
              <Music className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-extrabold text-white tracking-wide">SONGS</div>
              <div className="text-[11px] text-zinc-400">
                {unreleasedSongs.length > 0 ? `${unreleasedSongs.length} vaulted` : 'Record track'}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => setModal('albums')}
          className="pad-card pad-card-hover rounded-xl p-3 flex items-center justify-between text-left snap-transition"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-amber-400/15 border border-amber-400/25 flex items-center justify-center text-amber-400 shrink-0">
              <Disc className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-extrabold text-white tracking-wide">ALBUMS</div>
              <div className="text-[11px] text-zinc-400">LP / EP / Tape</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => setModal('videos')}
          className="pad-card pad-card-hover rounded-xl p-3 flex items-center justify-between text-left snap-transition"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-sky-500/15 border border-sky-500/25 flex items-center justify-center text-sky-400 shrink-0">
              <Film className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-extrabold text-white tracking-wide">VIDEOS</div>
              <div className="text-[11px] text-zinc-400">Shoot visual</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => setModal('collab')}
          className="pad-card pad-card-hover rounded-xl p-3 flex items-center justify-between text-left snap-transition"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-extrabold text-white tracking-wide">COLLABS</div>
              <div className="text-[11px] text-zinc-400">Joint project</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
        </button>
      </div>

      {/* MY STUDIO Hardware Monitor Card */}
      <div className="pt-1">
        <div className="flex items-center justify-between px-1 mb-2">
          <span className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
            MY STUDIO ROOM
          </span>
          <span className="font-mono-num text-[11px] font-bold text-amber-400">
            LVL {state.studio.level}/5
          </span>
        </div>

        <div className="pad-card rounded-2xl p-3 space-y-3">
          <div className="rounded-xl overflow-hidden border border-white/10 bg-[#e8e8e6]">
            <svg viewBox="0 0 400 180" className="w-full h-auto block">
              <rect
                width="400"
                height="112"
                fill={state.studio.level >= 4 ? '#141720' : state.studio.level >= 2 ? '#d4d4d8' : '#e5e5e5'}
              />
              {state.studio.level >= 2 && (
                <g opacity="0.85">
                  <rect x="28" y="18" width="44" height="62" rx="4" fill="#27272a" />
                  <rect x="328" y="18" width="44" height="62" rx="4" fill="#27272a" />
                </g>
              )}
              {state.studio.level >= 3 && (
                <g>
                  <rect x="92" y="24" width="32" height="40" rx="2" fill="#18181b" stroke="#eab308" strokeWidth="2" />
                  <circle cx="108" cy="40" r="9" fill="#facc15" />
                  <rect x="276" y="24" width="32" height="40" rx="2" fill="#18181b" stroke="#eab308" strokeWidth="2" />
                  <circle cx="292" cy="40" r="9" fill="#facc15" />
                </g>
              )}
              <rect y="112" width="400" height="68" fill="#5e3a21" />
              <line x1="0" y1="112" x2="400" y2="112" stroke="#3c2312" strokeWidth="3" />
              {state.studio.level >= 2 && (
                <g>
                  <rect x="96" y="64" width="30" height="46" rx="4" fill="#18181b" />
                  <circle cx="111" cy="80" r="6" fill="#3f3f46" />
                  <circle cx="111" cy="96" r="9" fill="#facc15" />
                  <rect x="274" y="64" width="30" height="46" rx="4" fill="#18181b" />
                  <circle cx="289" cy="80" r="6" fill="#3f3f46" />
                  <circle cx="289" cy="96" r="9" fill="#facc15" />
                </g>
              )}
              <rect x="148" y="54" width="104" height="64" rx="4" fill="#111827" stroke="#374151" strokeWidth="2" />
              <rect x="155" y="60" width="90" height="50" fill="#1f2937" />
              <rect x="160" y="66" width="52" height="6" rx="2" fill="#10b981" />
              <rect x="160" y="76" width="68" height="6" rx="2" fill="#f59e0b" />
              <rect x="160" y="86" width="44" height="6" rx="2" fill="#f43f5e" />
              <rect x="160" y="96" width="76" height="6" rx="2" fill="#38bdf8" />
              <polygon points="145,118 255,118 264,144 136,144" fill="#18181b" stroke="#374151" strokeWidth="1.5" />
              <rect x="150" y="122" width="100" height="12" rx="2" fill="#27272a" />
              {state.studio.level >= 2 && (
                <g>
                  <line x1="78" y1="138" x2="78" y2="92" stroke="#18181b" strokeWidth="3" />
                  <rect x="72" y="76" width="12" height="18" rx="6" fill="#9ca3af" stroke="#18181b" strokeWidth="1.5" />
                </g>
              )}
              {state.studio.level >= 4 && (
                <g>
                  <rect x="274" y="122" width="92" height="34" rx="4" fill="#18181b" stroke="#4b5563" />
                  <line x1="286" y1="128" x2="286" y2="150" stroke="#10b981" strokeWidth="2" />
                  <line x1="298" y1="128" x2="298" y2="150" stroke="#38bdf8" strokeWidth="2" />
                  <line x1="310" y1="128" x2="310" y2="150" stroke="#f43f5e" strokeWidth="2" />
                  <line x1="322" y1="128" x2="322" y2="150" stroke="#facc15" strokeWidth="2" />
                </g>
              )}
            </svg>
          </div>

          <div className="flex items-center justify-between px-1">
            <div>
              <div className="font-mono-num text-[22px] font-extrabold text-white leading-none tabular-nums">
                {state.studio.rating.toFixed(1)}
                <span className="text-xs text-zinc-500 font-semibold ml-1">/ 10</span>
              </div>
              <div className="text-[12px] text-zinc-400 mt-0.5">
                {state.studio.name}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setModal('upgrade')}
              aria-label="Upgrade Studio"
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-extrabold flex items-center gap-1.5 snap-transition"
            >
              <span>UPGRADE</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* STUDIO MODALS */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-3">
          <div className="w-full max-w-md bg-[#14161c] border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07] bg-[#0e1015]">
              <h3 className="font-display text-base font-extrabold text-white uppercase">
                {modal === 'songs' && 'Unreleased Vault & Recording'}
                {modal === 'record_song' && 'Record New Song'}
                {modal === 'albums' && 'Create Album / EP / Mixtape'}
                {modal === 'videos' && 'Shoot Music Video'}
                {modal === 'collab' && 'Joint Collab Album'}
                {modal === 'upgrade' && 'Studio Equipment Upgrade'}
              </h3>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto slim-scroll space-y-3 text-sm">
              {modal === 'songs' && (
                <>
                  <button
                    type="button"
                    onClick={() => setModal('record_song')}
                    className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-extrabold flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" /> Record New Track (-5 ⚡)
                  </button>

                  {unreleasedSongs.length === 0 ? (
                    <p className="text-xs text-zinc-400 text-center py-4">
                      Vault is empty. Record a new song to release as a single or save for an album.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {unreleasedSongs.map((s) => (
                        <div
                          key={s.id}
                          className="p-3 rounded-xl bg-[#1a1d26] flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={s.coverUrl}
                              alt={s.title}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-white truncate">{s.title}</div>
                              <div className="text-xs text-zinc-400">
                                {s.genre} · Quality {s.quality}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              onReleaseSong(s.id);
                              setModal(null);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-xs font-extrabold text-zinc-950 shrink-0"
                          >
                            Drop Single
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {modal === 'record_song' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">Song Title</label>
                    <input
                      type="text"
                      value={songTitle}
                      onChange={(e) => setSongTitle(e.target.value)}
                      placeholder="e.g. Midnight Skyline"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1d26] border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1">Genre</label>
                      <select
                        value={songGenre}
                        onChange={(e) => setSongGenre(e.target.value as MusicGenre)}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#1a1d26] border border-white/10 text-white text-xs"
                      >
                        {GENRES.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 mb-1">Mood</label>
                      <select
                        value={songMood}
                        onChange={(e) => setSongMood(e.target.value as SongMood)}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#1a1d26] border border-white/10 text-white text-xs"
                      >
                        {MOODS.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-zinc-400 mb-1">
                      <span>Tempo</span>
                      <span className="font-mono-num font-bold text-white tabular-nums">{songBpm} BPM</span>
                    </div>
                    <input
                      type="range"
                      min={78}
                      max={164}
                      value={songBpm}
                      onChange={(e) => setSongBpm(Number(e.target.value))}
                      className="w-full accent-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">
                      Feature Artist (Optional)
                    </label>
                    <select
                      value={featId}
                      onChange={(e) => setFeatId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#1a1d26] border border-white/10 text-white text-xs"
                    >
                      <option value="">Solo Track ($0)</option>
                      {state.npcs.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.name} ({n.genre}) — {formatMoney(n.relationship === 'friend' ? Math.round(n.featFee * 0.4) : n.featFee)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1.5">Cover Art</label>
                    <div className="grid grid-cols-4 gap-2">
                      {COVER_ARTS.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSongCover(c.url)}
                          className={`rounded-xl overflow-hidden border-2 ${
                            songCover === c.url ? 'border-amber-400' : 'border-transparent opacity-65'
                          }`}
                        >
                          <img src={c.url} alt={c.label} className="w-full aspect-square object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      disabled={state.energy < 5 || state.cash < featFee || !songTitle.trim()}
                      onClick={() => {
                        onRecordSong({
                          title: songTitle.trim(),
                          genre: songGenre,
                          mood: songMood,
                          bpm: songBpm,
                          coverUrl: songCover,
                          featuredArtistId: featId || undefined,
                          releaseImmediately: false,
                        });
                        setSongTitle('');
                        setModal('songs');
                      }}
                      className="py-2.5 rounded-xl bg-[#1e222d] hover:bg-[#272c3a] disabled:opacity-40 text-xs font-bold text-white"
                    >
                      Save to Vault
                    </button>
                    <button
                      type="button"
                      disabled={state.energy < 5 || state.cash < featFee || !songTitle.trim()}
                      onClick={() => {
                        onRecordSong({
                          title: songTitle.trim(),
                          genre: songGenre,
                          mood: songMood,
                          bpm: songBpm,
                          coverUrl: songCover,
                          featuredArtistId: featId || undefined,
                          releaseImmediately: true,
                        });
                        setSongTitle('');
                        setModal(null);
                      }}
                      className="py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-xs font-extrabold text-zinc-950"
                    >
                      Record & Drop Now
                    </button>
                  </div>
                </div>
              )}

              {modal === 'albums' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">Project Title</label>
                    <input
                      type="text"
                      value={albumTitle}
                      onChange={(e) => setAlbumTitle(e.target.value)}
                      placeholder="e.g. After Midnight"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1d26] border border-white/10 text-white text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['ALBUM', 'EP', 'MIXTAPE'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setAlbumType(t)}
                        className={`py-2 rounded-xl text-xs font-extrabold ${
                          albumType === t ? 'bg-amber-400 text-zinc-950' : 'bg-[#1a1d26] text-zinc-300'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {COVER_ARTS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setAlbumCover(c.url)}
                        className={`rounded-xl overflow-hidden border-2 ${
                          albumCover === c.url ? 'border-amber-400' : 'border-transparent opacity-65'
                        }`}
                      >
                        <img src={c.url} alt={c.label} className="w-full aspect-square object-cover" />
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-1">
                      Select Tracks ({selectedTrackIds.length} chosen · min 2)
                    </label>
                    <div className="max-h-36 overflow-y-auto slim-scroll space-y-1.5">
                      {state.songs.map((s) => {
                        const checked = selectedTrackIds.includes(s.id);
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() =>
                              setSelectedTrackIds((prev) =>
                                checked ? prev.filter((id) => id !== s.id) : [...prev, s.id]
                              )
                            }
                            className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-xs ${
                              checked
                                ? 'bg-amber-400/15 border border-amber-400/40 text-white'
                                : 'bg-[#1a1d26] text-zinc-300'
                            }`}
                          >
                            <span className="truncate font-semibold">{s.title}</span>
                            <span>{checked ? 'Selected' : `Q${s.quality}`}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={!albumTitle.trim() || selectedTrackIds.length < 2}
                    onClick={() => {
                      onReleaseAlbum({
                        title: albumTitle.trim(),
                        type: albumType,
                        coverUrl: albumCover,
                        songIds: selectedTrackIds,
                      });
                      setAlbumTitle('');
                      setSelectedTrackIds([]);
                      setModal(null);
                    }}
                    className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-zinc-950 font-extrabold"
                  >
                    Release Project
                  </button>
                </div>
              )}

              {modal === 'videos' && (
                <div className="space-y-2.5">
                  {songsNeedingVideo.length === 0 ? (
                    <p className="text-xs text-zinc-400 text-center py-4">
                      All your released songs already have music videos (or release a single first)!
                    </p>
                  ) : (
                    songsNeedingVideo.map((s) => (
                      <div key={s.id} className="p-3 rounded-xl bg-[#1a1d26] space-y-2">
                        <div className="font-bold text-white">{s.title}</div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {(
                            [
                              { tier: 'DIY', cost: 1500 },
                              { tier: 'Indie', cost: 15000 },
                              { tier: 'Cinematic', cost: 65000 },
                              { tier: 'Blockbuster', cost: 250000 },
                            ] as const
                          ).map((opt) => (
                            <button
                              key={opt.tier}
                              type="button"
                              disabled={state.cash < opt.cost || state.energy < 4}
                              onClick={() => {
                                onShootVideo({ songId: s.id, tier: opt.tier, cost: opt.cost });
                                setModal(null);
                              }}
                              className="px-2.5 py-2 rounded-xl bg-[#222632] hover:bg-[#2a2f3d] disabled:opacity-40 text-left text-xs"
                            >
                              <div className="font-bold text-white">{opt.tier} Shoot</div>
                              <div className="font-mono-num text-emerald-400 tabular-nums">{formatMoney(opt.cost)}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {modal === 'collab' && (
                <div className="space-y-3">
                  <p className="text-xs text-zinc-400">
                    Launch a joint collab project with a major artist. Requires $25,000 studio budget and 2+ tracks.
                  </p>
                  <select
                    value={collabArtistId}
                    onChange={(e) => setCollabArtistId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#1a1d26] border border-white/10 text-white text-xs"
                  >
                    {state.npcs.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.name} ({n.genre} · Fame {n.fame})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={albumTitle}
                    onChange={(e) => setAlbumTitle(e.target.value)}
                    placeholder="Collab Tape Title"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1d26] border border-white/10 text-white text-sm"
                  />
                  <button
                    type="button"
                    disabled={!albumTitle.trim() || state.cash < 25000 || state.songs.length < 2}
                    onClick={() => {
                      onReleaseAlbum({
                        title: albumTitle.trim(),
                        type: 'COLLAB',
                        coverUrl: COVER_ARTS[1].url,
                        songIds: state.songs.slice(0, 3).map((s) => s.id),
                        collabArtistId,
                      });
                      setAlbumTitle('');
                      setModal(null);
                    }}
                    className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-zinc-950 font-extrabold"
                  >
                    Drop Joint Album ($25K)
                  </button>
                </div>
              )}

              {modal === 'upgrade' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-[#1a1d26]">
                    <div className="text-xs text-zinc-400">Current Studio</div>
                    <div className="font-bold text-white text-base">
                      {state.studio.name} (Rating {state.studio.rating.toFixed(1)})
                    </div>
                  </div>
                  {nextStudio ? (
                    <>
                      <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/25">
                        <div className="text-xs text-amber-300 font-bold">Next Tier: {nextStudio.name}</div>
                        <div className="text-xs text-zinc-300 mt-1">
                          Raises Studio Rating to {nextStudio.rating.toFixed(1)}, significantly increasing song quality & chart potential.
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={state.cash < state.studio.upgradeCost}
                        onClick={() => {
                          onUpgradeStudio();
                          setModal(null);
                        }}
                        className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-zinc-950 font-extrabold"
                      >
                        Upgrade for {formatMoney(state.studio.upgradeCost)}
                      </button>
                    </>
                  ) : (
                    <div className="text-center text-emerald-400 font-bold py-4">
                      Maximum Hollywood Studio Unlocked!
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
