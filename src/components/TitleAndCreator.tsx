import React, { useState } from 'react';
import { ArrowRight, Disc3, Play, Sparkles, UserPlus } from 'lucide-react';
import { STUDIO_BACKDROP_URL } from '../data/gameCatalog';
import { AvatarConfig, MusicGenre } from '../types/game';
import { ArtistAvatar } from './ArtistAvatar';

interface TitleAndCreatorProps {
  hasSavedCareer: boolean;
  savedArtistSummary?: string;
  onContinueSaved: () => void;
  onLoadBiigMtPreset: () => void;
  onCreateNewCareer: (params: {
    artistName: string;
    handle: string;
    genre: MusicGenre;
    hometown: string;
    avatar: AvatarConfig;
  }) => void;
}

const SKIN_TONES = ['#f2cbb2', '#d9a484', '#c69072', '#9c6644', '#6d442b', '#46291a'];
const AURA_COLORS = ['#2d4a35', '#78350f', '#1e3a5f', '#7f1d1d', '#27272a'];
const HAIR_STYLES: AvatarConfig['hairStyle'][] = [
  'bald',
  'buzz',
  'waves',
  'dreads',
  'curly',
  'afro',
  'spiky',
  'long',
];
const GENRES: MusicGenre[] = ['Hip-Hop', 'R&B', 'Pop', 'Trap', 'Indie', 'Rock'];

export const TitleAndCreator: React.FC<TitleAndCreatorProps> = ({
  hasSavedCareer,
  savedArtistSummary,
  onContinueSaved,
  onLoadBiigMtPreset,
  onCreateNewCareer,
}) => {
  const [step, setStep] = useState<'title' | 'creator'>('title');
  const [artistName, setArtistName] = useState('Nova Vance');
  const [handle, setHandle] = useState('@novavance');
  const [genre, setGenre] = useState<MusicGenre>('Hip-Hop');
  const [hometown, setHometown] = useState('Atlanta, GA');
  const [avatar, setAvatar] = useState<AvatarConfig>({
    skinTone: '#c69072',
    hairStyle: 'dreads',
    hairColor: '#1e1b18',
    facialHair: 'stubble',
    eyewear: 'none',
    outfitId: 'cloth_1',
    jewelryIds: [],
    auraColor: '#2d4a35',
  });

  if (step === 'creator') {
    return (
      <div className="min-h-dvh console-surface text-white flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-[#14161c] border border-white/10 rounded-2xl p-5 sm:p-7 shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div>
              <h2 className="font-display text-2xl font-extrabold tracking-tight">
                Create Your Artist
              </h2>
              <p className="text-xs text-zinc-400">
                Customize your debut persona, look, and genre before entering the booth.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStep('title')}
              className="text-xs font-bold text-zinc-400 hover:text-white"
            >
              Back
            </button>
          </div>

          <div className="grid sm:grid-cols-[200px_1fr] gap-5 items-center">
            <div className="bg-[#0e1015] border border-white/[0.06] rounded-2xl p-3 flex flex-col items-center">
              <ArtistAvatar avatar={avatar} size={156} />
              <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                {SKIN_TONES.map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setAvatar((a) => ({ ...a, skinTone: tone }))}
                    className={`w-5 h-5 rounded-full border-2 ${
                      avatar.skinTone === tone ? 'border-amber-400 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: tone }}
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-center gap-1.5">
                {AURA_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setAvatar((a) => ({ ...a, auraColor: c }))}
                    className={`w-4 h-4 rounded-full border ${
                      avatar.auraColor === c ? 'border-amber-400' : 'border-white/20'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                    Stage Name
                  </label>
                  <input
                    type="text"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0e1015] border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                    Social Handle
                  </label>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0e1015] border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                    Primary Genre
                  </label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value as MusicGenre)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0e1015] border border-white/10 text-sm text-white"
                  >
                    {GENRES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                    Hometown
                  </label>
                  <input
                    type="text"
                    value={hometown}
                    onChange={(e) => setHometown(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0e1015] border border-white/10 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                  Hairstyle
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {HAIR_STYLES.map((hs) => (
                    <button
                      key={hs}
                      type="button"
                      onClick={() => setAvatar((a) => ({ ...a, hairStyle: hs }))}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${
                        avatar.hairStyle === hs
                          ? 'bg-amber-400 text-zinc-950 font-bold'
                          : 'bg-[#0e1015] border border-white/10 text-zinc-300'
                      }`}
                    >
                      {hs}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                    Facial Hair
                  </label>
                  <select
                    value={avatar.facialHair}
                    onChange={(e) =>
                      setAvatar((a) => ({
                        ...a,
                        facialHair: e.target.value as AvatarConfig['facialHair'],
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#0e1015] border border-white/10 text-xs text-white"
                  >
                    <option value="none">Clean Shaven</option>
                    <option value="stubble">Stubble</option>
                    <option value="goatee">Goatee</option>
                    <option value="beard">Full Beard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                    Eyewear
                  </label>
                  <select
                    value={avatar.eyewear}
                    onChange={(e) =>
                      setAvatar((a) => ({
                        ...a,
                        eyewear: e.target.value as AvatarConfig['eyewear'],
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#0e1015] border border-white/10 text-xs text-white"
                  >
                    <option value="none">None</option>
                    <option value="shades">Dark Shades</option>
                    <option value="round">Gold Round Frames</option>
                    <option value="designer">Designer Squares</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={!artistName.trim()}
            onClick={() =>
              onCreateNewCareer({
                artistName: artistName.trim(),
                handle: handle.trim() || '@artist',
                genre,
                hometown: hometown.trim() || 'Los Angeles, CA',
                avatar,
              })
            }
            className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-zinc-950 font-extrabold text-sm flex items-center justify-center gap-2 snap-transition"
          >
            Launch Career <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh w-full overflow-hidden flex items-center justify-center p-5 bg-[#090a0d]">
      <img
        src={STUDIO_BACKDROP_URL}
        alt="Recording studio control room"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover opacity-50"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#090a0d] via-[#090a0d]/80 to-[#090a0d]/45" />

      <div className="relative z-10 w-full max-w-lg space-y-7 text-center">
        <div className="flex flex-col items-center space-y-3">
          <svg
            viewBox="0 0 380 86"
            className="w-72 sm:w-88 h-auto drop-shadow-[0_12px_32px_rgba(0,0,0,0.8)]"
            aria-label="ROCKSTAR"
          >
            <defs>
              <linearGradient id="rockstarGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="55%" stopColor="#fde68a" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            <rect x="12" y="14" width="356" height="58" rx="12" fill="rgba(14,16,21,0.82)" stroke="rgba(245,158,11,0.35)" strokeWidth="1.5" />
            <text
              x="190"
              y="56"
              textAnchor="middle"
              fill="url(#rockstarGold)"
              fontFamily="Outfit, Plus Jakarta Sans, sans-serif"
              fontWeight="800"
              fontSize="42"
              letterSpacing="6"
            >
              ROCKSTAR
            </text>
          </svg>
          <p className="text-sm sm:text-base text-zinc-300 max-w-md mx-auto">
            From a bedroom laptop to #1 on the Hot 100 — record tracks, drop videos, run your own social apps, and build a global empire.
          </p>
        </div>

        <div className="space-y-2.5 max-w-sm mx-auto">
          {hasSavedCareer && (
            <button
              type="button"
              onClick={onContinueSaved}
              className="w-full py-3.5 px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-extrabold text-sm flex items-center justify-between shadow-lg snap-transition"
            >
              <span className="flex items-center gap-2">
                <Play className="w-4 h-4 fill-current" /> Continue Saved Career
              </span>
              <span className="font-mono-num text-xs font-bold opacity-80">{savedArtistSummary}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setStep('creator')}
            className={`w-full py-3.5 px-5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 snap-transition ${
              hasSavedCareer
                ? 'bg-[#14161c] hover:bg-[#1c1f27] text-white border border-white/10'
                : 'bg-amber-400 hover:bg-amber-300 text-zinc-950 shadow-lg'
            }`}
          >
            <UserPlus className="w-4 h-4" /> Start Fresh Artist Career
          </button>

          <button
            type="button"
            onClick={onLoadBiigMtPreset}
            className="w-full py-3 px-5 rounded-xl bg-[#14161c]/95 hover:bg-[#1c1f27] border border-white/10 text-zinc-200 font-bold text-xs flex items-center justify-center gap-2 snap-transition"
          >
            <Sparkles className="w-4 h-4 text-amber-400" /> Jump into "Biig MT" (2027 · $4.1M · #1 Hit)
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
          <Disc3 className="w-3.5 h-3.5 text-amber-400" />
          <span>13 Working Phone Apps · Live Hot 100 Charts · Procedural Synth Audio · Local Save</span>
        </div>
      </div>
    </div>
  );
};
