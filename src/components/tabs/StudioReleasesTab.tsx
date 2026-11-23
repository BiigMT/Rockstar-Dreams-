import React, { useState } from 'react';
import {
  Disc3,
  Film,
  Flame,
  Layers,
  Mic2,
  Palette,
  Pause,
  Play,
  Radio,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  ALL_GENRES,
  COVER_ARTS,
  DIFFICULTY_CONFIGS,
  STUDIO_LEVELS,
} from '../../data/gameCatalog';
import {
  formatCompactNumber,
  formatMoney,
  getAchievementPerks,
  getCertificationLabel,
} from '../../engine/simulation';
import {
  CustomCoverConfig,
  GameState,
  MusicGenre,
  SongMood,
} from '../../types/game';
import { CoverArtView } from '../CoverArtView';

interface StudioReleasesTabProps {
  state: GameState;
  onRecordSong: (payload: {
    title: string;
    genre: MusicGenre;
    mood: SongMood;
    bpm: number;
    coverUrl: string;
    customCover?: CustomCoverConfig;
    featuredArtistId?: string;
    dissTargetId?: string;
    producerName?: string;
    marketingBudget?: number;
    releaseImmediately: boolean;
  }) => void;
  onReleaseSong: (songId: string) => void;
  onReleaseAlbum: (payload: {
    title: string;
    type: 'ALBUM' | 'EP' | 'MIXTAPE' | 'COLLAB';
    coverUrl: string;
    customCover?: CustomCoverConfig;
    songIds: string[];
    collabArtistId?: string;
  }) => void;
  onShootVideo: (payload: {
    songId: string;
    tier: 'DIY' | 'Indie' | 'Cinematic' | 'Blockbuster';
    cost: number;
  }) => void;
  onUpgradeStudio: () => void;
  onPlaySong: (songId: string) => void;
  onPromoteSong: (songId: string, channel: 'playlist' | 'radio' | 'viral', cost: number) => void;
}

const MOODS: SongMood[] = ['Hype', 'Dark', 'Melodic', 'Emotional', 'Flex', 'Chill', 'Diss'];
const PRODUCERS = [
  { name: 'Self-Produced', bonus: 0, fee: 0 },
  { name: 'Metro Ghost', bonus: 4, fee: 8500 },
  { name: 'London On Da Track', bonus: 6, fee: 18000 },
  { name: 'Pharrell Apex', bonus: 9, fee: 45000 },
];
const BG_SWATCHES = ['#0f172a', '#7f1d1d', '#14532d', '#312e81', '#581c87', '#78350f'];
const ACCENT_SWATCHES = ['#38bdf8', '#facc15', '#f43f5e', '#10b981', '#e879f9', '#f97316'];

export const StudioReleasesTab: React.FC<StudioReleasesTabProps> = ({
  state,
  onRecordSong,
  onReleaseSong,
  onReleaseAlbum,
  onShootVideo,
  onUpgradeStudio,
  onPlaySong,
  onPromoteSong,
}) => {
  const [rightMode, setRightMode] = useState<'catalog' | 'albums' | 'videos' | 'vault'>('catalog');
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState<MusicGenre>(state.genre);
  const [mood, setMood] = useState<SongMood>('Hype');
  const [bpm, setBpm] = useState(134);
  const [producerIdx, setProducerIdx] = useState(0);
  const [featId, setFeatId] = useState('');
  const [dissId, setDissId] = useState(state.npcs[4]?.id || '');
  const [marketingBudget, setMarketingBudget] = useState(0);

  // Custom Cover Art Designer state
  const [coverMode, setCoverMode] = useState<'photo' | 'custom'>('photo');
  const [photoCoverUrl, setPhotoCoverUrl] = useState(COVER_ARTS[0].url);
  const [customCover, setCustomCover] = useState<CustomCoverConfig>({
    mode: 'custom',
    bgColor: '#0f172a',
    accentColor: '#38bdf8',
    pattern: 'vinyl',
    badge: 'EXPLICIT',
    subtitle: state.artistName.toUpperCase(),
  });

  // Album builder state
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumType, setAlbumType] = useState<'ALBUM' | 'EP' | 'MIXTAPE' | 'COLLAB'>('ALBUM');
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);
  const [collabNpcId, setCollabNpcId] = useState(state.npcs[0]?.id || '');

  // Video Shoot state
  const [videoSongId, setVideoSongId] = useState(state.songs.find((s) => s.released)?.id || '');

  const perks = getAchievementPerks(state.unlockedAchievements || []);
  const diffFeeMult = DIFFICULTY_CONFIGS[state.difficulty || 'Realistic'].feeMult;
  const feeScale = Math.max(0.55, diffFeeMult * (1 - perks.feeDiscount));

  const featNpc = state.npcs.find((n) => n.id === featId);
  const featFee = featNpc
    ? Math.round((featNpc.relationship === 'friend' ? featNpc.featFee * 0.4 : featNpc.featFee) * feeScale)
    : 0;
  const prod = PRODUCERS[producerIdx];
  const prodFee = Math.round(prod.fee * feeScale);
  const totalSessionCost = featFee + prodFee + marketingBudget;

  const activeCustomCover: CustomCoverConfig | undefined =
    coverMode === 'custom' ? { ...customCover, mode: 'custom' } : undefined;

  const nextStudio = STUDIO_LEVELS.find((l) => l.level === state.studio.level + 1);
  const studioUpgradeCost = Math.round(state.studio.upgradeCost * feeScale);

  const unreleasedSongs = state.songs.filter((s) => !s.released);
  const releasedSongs = [...state.songs]
    .filter((s) => s.released)
    .sort((a, b) => b.totalStreams - a.totalStreams);

  return (
    <div className="flex-1 min-h-0 p-2 sm:p-2.5 grid grid-cols-1 lg:grid-cols-[1.05fr_1.2fr] gap-2.5 overflow-y-auto lg:overflow-hidden">
      {/* LEFT PANEL: RECORDING BOOTH & CUSTOM COVER ART DESIGNER */}
      <div className="career-panel rounded-xl p-3 flex flex-col gap-3 lg:overflow-y-auto slim-scroll">
        {/* Studio Tier Header */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-600/35 pb-2">
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-sky-300">
              Recording Booth · Tier {state.studio.level}/5
            </div>
            <div className="font-display text-base font-black text-white">
              {state.studio.name} <span className="text-emerald-400 font-mono-num">({state.studio.rating}/10)</span>
            </div>
          </div>
          {nextStudio ? (
            <button
              type="button"
              disabled={state.cash < studioUpgradeCost}
              onClick={onUpgradeStudio}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 text-xs font-black shrink-0"
            >
              Upgrade: {formatMoney(studioUpgradeCost)}
            </button>
          ) : (
            <span className="px-2.5 py-1 rounded bg-amber-400/20 text-amber-300 text-[10px] font-black">
              MAX STUDIO
            </span>
          )}
        </div>

        {/* Cover Art Live Preview + Song Title/Genre */}
        <div className="grid grid-cols-[118px_1fr] gap-3">
          <div className="space-y-1.5">
            <CoverArtView
              coverUrl={photoCoverUrl}
              customCover={activeCustomCover}
              title={title || 'Untitled Track'}
              className="w-[118px] h-[118px] rounded-xl border border-slate-500/40 shadow-lg"
            />
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setCoverMode('photo')}
                className={`py-1 rounded text-[10px] font-bold ${
                  coverMode === 'photo' ? 'royal-active-tab' : 'bg-[#091529] text-slate-300'
                }`}
              >
                Photo
              </button>
              <button
                type="button"
                onClick={() => setCoverMode('custom')}
                className={`py-1 rounded text-[10px] font-bold flex items-center justify-center gap-0.5 ${
                  coverMode === 'custom' ? 'royal-active-tab' : 'bg-[#091529] text-slate-300'
                }`}
              >
                <Palette className="w-2.5 h-2.5" /> Custom
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5">
                Track Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Midnight Protocol"
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#091529] border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-sky-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5">
                  Genre ({ALL_GENRES.length})
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value as MusicGenre)}
                  className="w-full px-2 py-1.5 rounded-lg bg-[#091529] border border-slate-700 text-xs text-white"
                >
                  {ALL_GENRES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5">
                  Mood / Vibe
                </label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value as SongMood)}
                  className="w-full px-2 py-1.5 rounded-lg bg-[#091529] border border-slate-700 text-xs text-white"
                >
                  {MOODS.map((m) => (
                    <option key={m} value={m}>
                      {m === 'Diss' ? 'Diss Track 🔥' : m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5">
                  Producer
                </label>
                <select
                  value={producerIdx}
                  onChange={(e) => setProducerIdx(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded-lg bg-[#091529] border border-slate-700 text-xs text-white"
                >
                  {PRODUCERS.map((p, idx) => (
                    <option key={p.name} value={idx}>
                      {p.name} ({p.fee === 0 ? 'Free' : formatMoney(Math.round(p.fee * feeScale))})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5">
                  BPM: <span className="text-sky-300 font-mono-num">{bpm}</span>
                </label>
                <input
                  type="range"
                  min={70}
                  max={170}
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="w-full accent-sky-400 mt-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cover Art Customizer Strip */}
        {coverMode === 'photo' ? (
          <div className="flex items-center gap-2 career-inset rounded-lg p-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Artwork:</span>
            {COVER_ARTS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setPhotoCoverUrl(c.url)}
                className={`w-10 h-10 rounded-lg overflow-hidden border-2 shrink-0 ${
                  photoCoverUrl === c.url ? 'border-sky-400' : 'border-transparent opacity-60'
                }`}
              >
                <img src={c.url} alt={c.label} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        ) : (
          <div className="career-inset rounded-lg p-2.5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400 font-bold mr-1">Base:</span>
                {BG_SWATCHES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCustomCover((prev) => ({ ...prev, bgColor: c }))}
                    className={`w-4 h-4 rounded-full border ${
                      customCover.bgColor === c ? 'border-white scale-110' : 'border-white/20'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400 font-bold mr-1">Accent:</span>
                {ACCENT_SWATCHES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCustomCover((prev) => ({ ...prev, accentColor: c }))}
                    className={`w-4 h-4 rounded-full border ${
                      customCover.accentColor === c ? 'border-white scale-110' : 'border-white/20'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <select
                value={customCover.pattern}
                onChange={(e) =>
                  setCustomCover((prev) => ({
                    ...prev,
                    pattern: e.target.value as CustomCoverConfig['pattern'],
                  }))
                }
                className="px-2 py-1 rounded bg-[#091529] border border-slate-700 text-[11px] text-white"
              >
                <option value="vinyl">Vinyl Rings</option>
                <option value="waves">Sound Waves</option>
                <option value="grid">Cyber Grid</option>
                <option value="radial">Orb Glow</option>
                <option value="minimal">Minimal Frame</option>
              </select>
              <select
                value={customCover.badge}
                onChange={(e) =>
                  setCustomCover((prev) => ({
                    ...prev,
                    badge: e.target.value as CustomCoverConfig['badge'],
                  }))
                }
                className="px-2 py-1 rounded bg-[#091529] border border-slate-700 text-[11px] text-white"
              >
                <option value="EXPLICIT">EXPLICIT</option>
                <option value="DELUXE">DELUXE</option>
                <option value="LIVE">LIVE</option>
                <option value="TOUR">TOUR EDITION</option>
                <option value="NONE">No Badge</option>
              </select>
              <input
                type="text"
                value={customCover.subtitle || ''}
                onChange={(e) =>
                  setCustomCover((prev) => ({ ...prev, subtitle: e.target.value }))
                }
                placeholder="Subtitle"
                className="px-2 py-1 rounded bg-[#091529] border border-slate-700 text-[11px] text-white"
              />
            </div>
          </div>
        )}

        {/* Feature, Diss Target & Launch Marketing Budget */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5">
              Feature Artist ({state.npcs.length} Available)
            </label>
            <select
              value={featId}
              onChange={(e) => setFeatId(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg bg-[#091529] border border-slate-700 text-xs text-white"
            >
              <option value="">Solo Track (No Feature)</option>
              {state.npcs.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name} ({n.genre} · {formatMoney(Math.round(n.featFee * feeScale))})
                </option>
              ))}
            </select>
          </div>

          {mood === 'Diss' ? (
            <div>
              <label className="block text-[10px] font-bold uppercase text-rose-400 mb-0.5">
                Diss Target
              </label>
              <select
                value={dissId}
                onChange={(e) => setDissId(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg bg-rose-950/50 border border-rose-500/40 text-xs text-white"
              >
                {state.npcs.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name} ({n.relationship})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5">
                Launch Marketing: <span className="text-emerald-400 font-mono-num">{formatMoney(marketingBudget)}</span>
              </label>
              <select
                value={marketingBudget}
                onChange={(e) => setMarketingBudget(Number(e.target.value))}
                className="w-full px-2 py-1.5 rounded-lg bg-[#091529] border border-slate-700 text-xs text-white"
              >
                <option value={0}>Organic Drop ($0)</option>
                <option value={5000}>Indie Playlist Push ($5K)</option>
                <option value={25000}>Social Blitz ($25K)</option>
                <option value={75000}>Global Billboard Takeover ($75K)</option>
                <option value={200000}>Superstar Worldwide Rollout ($200K)</option>
              </select>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-1 flex items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>
            Session Cost:{' '}
            <strong className="text-emerald-400 font-mono-num">{formatMoney(totalSessionCost)}</strong> · -5⚡
          </span>
          <span>
            Est. Skill Bonus: <strong className="text-sky-300">+{prod.bonus} Prod</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={!title.trim() || state.energy < 5 || state.cash < totalSessionCost}
            onClick={() => {
              onRecordSong({
                title: title.trim(),
                genre,
                mood,
                bpm,
                coverUrl: photoCoverUrl,
                customCover: activeCustomCover,
                featuredArtistId: featId || undefined,
                dissTargetId: mood === 'Diss' ? dissId : undefined,
                producerName: prod.name,
                marketingBudget,
                releaseImmediately: false,
              });
              setTitle('');
            }}
            className="py-2.5 rounded-lg bg-[#091529] hover:bg-[#102446] border border-slate-600/60 disabled:opacity-40 text-xs font-extrabold text-white"
          >
            Save to Vault
          </button>
          <button
            type="button"
            disabled={!title.trim() || state.energy < 5 || state.cash < totalSessionCost}
            onClick={() => {
              onRecordSong({
                title: title.trim(),
                genre,
                mood,
                bpm,
                coverUrl: photoCoverUrl,
                customCover: activeCustomCover,
                featuredArtistId: featId || undefined,
                dissTargetId: mood === 'Diss' ? dissId : undefined,
                producerName: prod.name,
                marketingBudget,
                releaseImmediately: true,
              });
              setTitle('');
            }}
            className="py-2.5 rounded-lg royal-active-tab hover:brightness-110 disabled:opacity-40 text-xs font-black flex items-center justify-center gap-1.5"
          >
            <Mic2 className="w-3.5 h-3.5" /> Record & Drop Now
          </button>
        </div>
      </div>

      {/* RIGHT PANEL: CATALOG, ALBUM/EP/MIXTAPE BUILDER, VIDEOS & VAULT */}
      <div className="career-panel rounded-xl p-3 flex flex-col gap-2.5 min-h-0">
        {/* Sub-Nav */}
        <div className="flex items-center gap-1.5 border-b border-slate-600/35 pb-2 overflow-x-auto slim-scroll">
          {[
            { id: 'catalog' as const, label: `Released (${releasedSongs.length})`, icon: Disc3 },
            { id: 'albums' as const, label: `EP / Album (${state.albums.length})`, icon: Layers },
            { id: 'videos' as const, label: `Music Videos`, icon: Film },
            { id: 'vault' as const, label: `Vault (${unreleasedSongs.length})`, icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRightMode(tab.id)}
                className={`px-3 py-1.5 rounded text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap ${
                  rightMode === tab.id ? 'royal-active-tab' : 'bg-[#091529] text-slate-300 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto slim-scroll space-y-2 pr-1">
          {rightMode === 'catalog' && (
            <>
              {releasedSongs.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No singles dropped yet. Record your debut track on the left!
                </div>
              ) : (
                releasedSongs.map((song) => {
                  const cert = getCertificationLabel(song.totalStreams);
                  const playing = state.nowPlayingSongId === song.id && state.isAudioPlaying;
                  const playlistCost = Math.round(5000 * feeScale);
                  const viralCost = Math.round(18000 * feeScale);

                  return (
                    <div
                      key={song.id}
                      className="career-inset rounded-lg p-2.5 flex items-center justify-between gap-2.5"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CoverArtView
                          coverUrl={song.coverUrl}
                          customCover={song.customCover}
                          title={song.title}
                          compact
                          className="w-12 h-12 rounded-lg"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-sm text-white truncate">{song.title}</span>
                            {cert && (
                              <span className={`px-1.5 py-0.5 rounded border text-[9px] font-black ${cert.colorClass}`}>
                                {cert.shortLabel}
                              </span>
                            )}
                            {song.currentChartPos && (
                              <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[9px] font-black">
                                #{song.currentChartPos}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {song.genre} · Qual {song.quality} ·{' '}
                            <span className="text-sky-300 font-mono-num">
                              {formatCompactNumber(song.totalStreams)} streams
                            </span>{' '}
                            ({formatCompactNumber(song.weeklyStreams)}/wk)
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          disabled={state.cash < playlistCost}
                          onClick={() => onPromoteSong(song.id, 'playlist', playlistCost)}
                          title="Playlist Push"
                          className="px-2 py-1 rounded bg-[#0d2244] hover:bg-[#163669] disabled:opacity-40 border border-sky-500/30 text-[10px] font-bold text-sky-200 flex items-center gap-1"
                        >
                          <Radio className="w-3 h-3" /> {formatMoney(playlistCost)}
                        </button>
                        <button
                          type="button"
                          disabled={state.cash < viralCost}
                          onClick={() => onPromoteSong(song.id, 'viral', viralCost)}
                          title="Viral Campaign"
                          className="px-2 py-1 rounded bg-rose-900/40 hover:bg-rose-800/50 disabled:opacity-40 border border-rose-500/35 text-[10px] font-bold text-rose-200 flex items-center gap-1"
                        >
                          <Flame className="w-3 h-3" /> {formatMoney(viralCost)}
                        </button>
                        <button
                          type="button"
                          onClick={() => onPlaySong(song.id)}
                          className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center"
                        >
                          {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

          {rightMode === 'albums' && (
            <div className="space-y-3">
              <div className="career-inset rounded-lg p-3 space-y-2.5">
                <div className="text-xs font-black uppercase tracking-wider text-sky-300">
                  Package Project (Album / EP / Mixtape / Collab)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={albumTitle}
                    onChange={(e) => setAlbumTitle(e.target.value)}
                    placeholder="Project Title (e.g. Velvet Era)"
                    className="px-2.5 py-1.5 rounded bg-[#091529] border border-slate-700 text-xs text-white"
                  />
                  <select
                    value={albumType}
                    onChange={(e) => setAlbumType(e.target.value as 'ALBUM' | 'EP' | 'MIXTAPE' | 'COLLAB')}
                    className="px-2.5 py-1.5 rounded bg-[#091529] border border-slate-700 text-xs text-white"
                  >
                    <option value="ALBUM">Studio Album (4+ tracks)</option>
                    <option value="EP">EP (2+ tracks)</option>
                    <option value="MIXTAPE">Mixtape (2+ tracks)</option>
                    <option value="COLLAB">Joint Collab Tape ($25K)</option>
                  </select>
                </div>

                {albumType === 'COLLAB' && (
                  <select
                    value={collabNpcId}
                    onChange={(e) => setCollabNpcId(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-[#091529] border border-slate-700 text-xs text-white"
                  >
                    {state.npcs.map((n) => (
                      <option key={n.id} value={n.id}>
                        Collab Partner: {n.name} ({n.genre})
                      </option>
                    ))}
                  </select>
                )}

                <div className="text-[11px] font-bold text-slate-400">
                  Select Tracks ({selectedTrackIds.length} selected):
                </div>
                <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto slim-scroll">
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
                        className={`px-2 py-1.5 rounded text-left text-[11px] font-bold border truncate ${
                          checked
                            ? 'bg-sky-500/20 border-sky-400 text-white'
                            : 'bg-[#091529] border-slate-700 text-slate-300'
                        }`}
                      >
                        {checked ? '✓ ' : ''}
                        {s.title}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  disabled={!albumTitle.trim() || selectedTrackIds.length < 2}
                  onClick={() => {
                    onReleaseAlbum({
                      title: albumTitle.trim(),
                      type: albumType,
                      coverUrl: photoCoverUrl,
                      customCover: activeCustomCover,
                      songIds: selectedTrackIds,
                      collabArtistId: albumType === 'COLLAB' ? collabNpcId : undefined,
                    });
                    setAlbumTitle('');
                    setSelectedTrackIds([]);
                  }}
                  className="w-full py-2 rounded-lg royal-active-tab disabled:opacity-40 text-xs font-black"
                >
                  Release {albumType} Globally
                </button>
              </div>

              {state.albums.map((alb) => (
                <div key={alb.id} className="career-inset rounded-lg p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CoverArtView
                      coverUrl={alb.coverUrl}
                      customCover={alb.customCover}
                      title={alb.title}
                      compact
                      className="w-11 h-11 rounded"
                    />
                    <div>
                      <div className="text-xs font-black text-white">
                        {alb.title}{' '}
                        <span className="text-[10px] text-sky-300 font-bold">[{alb.type}]</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {alb.songIds.length} tracks · {formatCompactNumber(alb.totalStreams)} streams
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono-num font-bold text-emerald-400">
                    {formatCompactNumber(alb.firstWeekUnits)} 1st-wk units
                  </span>
                </div>
              ))}
            </div>
          )}

          {rightMode === 'videos' && (
            <div className="space-y-2.5">
              <div className="career-inset rounded-lg p-3 space-y-2">
                <label className="block text-[10px] font-bold uppercase text-slate-400">
                  Select Released Song for Music Video (-4⚡)
                </label>
                <select
                  value={videoSongId || releasedSongs[0]?.id || ''}
                  onChange={(e) => setVideoSongId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-[#091529] border border-slate-700 text-xs text-white"
                >
                  {releasedSongs.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} {s.hasVideo ? '(Has Video)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { tier: 'DIY', cost: 1200, desc: '+18K views · +15% Viral' },
                    { tier: 'Indie', cost: 12000, desc: '+85K views · +25% Viral' },
                    { tier: 'Cinematic', cost: 48000, desc: '+320K views · +35% Boost' },
                    { tier: 'Blockbuster', cost: 160000, desc: '+950K views · Chart Spike' },
                  ] as const
                ).map((v) => {
                  const adjCost = Math.round(v.cost * feeScale);
                  const target = videoSongId || releasedSongs[0]?.id;
                  return (
                    <button
                      key={v.tier}
                      type="button"
                      disabled={!target || state.cash < adjCost || state.energy < 4}
                      onClick={() => target && onShootVideo({ songId: target, tier: v.tier, cost: adjCost })}
                      className="career-inset hover:border-sky-400/50 rounded-lg p-2.5 text-left disabled:opacity-40"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white">{v.tier} Shoot</span>
                        <span className="font-mono-num text-xs font-bold text-emerald-400">
                          {formatMoney(adjCost)}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{v.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {rightMode === 'vault' && (
            <>
              {unreleasedSongs.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Vault is empty. Save unreleased demos on the left to build your next album rollout!
                </div>
              ) : (
                unreleasedSongs.map((song) => (
                  <div
                    key={song.id}
                    className="career-inset rounded-lg p-2.5 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CoverArtView
                        coverUrl={song.coverUrl}
                        customCover={song.customCover}
                        title={song.title}
                        compact
                        className="w-11 h-11 rounded"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{song.title}</div>
                        <div className="text-[11px] text-slate-400">
                          {song.genre} · Quality {song.quality}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onReleaseSong(song.id)}
                      className="px-3 py-1.5 rounded royal-active-tab text-xs font-black flex items-center gap-1"
                    >
                      <TrendingUp className="w-3 h-3" /> Drop Single
                    </button>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
