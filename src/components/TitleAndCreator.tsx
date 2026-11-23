import React, { useState } from 'react';
import { ArrowRight, Disc3, Play, Shield, Sparkles, UserPlus } from 'lucide-react';
import {
  ALL_GENRES,
  DIFFICULTY_CONFIGS,
  ORIGIN_STORIES,
  STUDIO_BACKDROP_URL,
} from '../data/gameCatalog';
import { AvatarConfig, DifficultyMode, MusicGenre, OriginStory } from '../types/game';
import { ArtistAvatar } from './ArtistAvatar';

interface TitleAndCreatorProps {
  hasSavedCareer: boolean;
  savedArtistSummary?: string;
  onContinueSaved: () => void;
  onLoadBiigMtPreset: (difficulty: DifficultyMode) => void;
  onCreateNewCareer: (params: {
    artistName: string;
    handle: string;
    genre: MusicGenre;
    hometown: string;
    difficulty: DifficultyMode;
    originStory: OriginStory;
    avatar: AvatarConfig;
  }) => void;
}

const SKIN_TONES = ['#f2cbb2', '#d9a484', '#c69072', '#9c6644', '#6d442b', '#46291a'];
const AURA_COLORS = ['#2d4a35', '#1b2e4b', '#432559', '#6e2030', '#1e293b'];
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
const DIFFICULTIES: DifficultyMode[] = ['Casual', 'Realistic', 'Hardcore'];

export const TitleAndCreator: React.FC<TitleAndCreatorProps> = ({
  hasSavedCareer,
  savedArtistSummary,
  onContinueSaved,
  onLoadBiigMtPreset,
  onCreateNewCareer,
}) => {
  const [step, setStep] = useState<'title' | 'creator'>('title');
  const [difficulty, setDifficulty] = useState<DifficultyMode>('Realistic');
  const [artistName, setArtistName] = useState('Nova Vance');
  const [handle, setHandle] = useState('@novavance');
  const [genre, setGenre] = useState<MusicGenre>('Hip-Hop');
  const [hometown, setHometown] = useState('Atlanta, GA');
  const [originId, setOriginId] = useState<string>(ORIGIN_STORIES[0].id);
  const [avatar, setAvatar] = useState<AvatarConfig>({
    skinTone: '#c69072',
    hairStyle: 'dreads',
    hairColor: '#1e1b18',
    facialHair: 'stubble',
    eyewear: 'none',
    outfitId: 'cloth_1',
    jewelryIds: [],
    auraColor: '#1b2e4b',
  });

  const selectedOrigin = ORIGIN_STORIES.find((o) => o.id === originId) || ORIGIN_STORIES[0];

  if (step === 'creator') {
    return (
      <div className="min-h-dvh media-centre-bg text-white flex items-center justify-center p-4">
        <div className="w-full max-w-4xl career-panel rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[94dvh] overflow-y-auto slim-scroll">
          <div className="flex items-center justify-between border-b border-slate-500/25 pb-3">
            <div>
              <div className="text-[10px] font-black tracking-[0.2em] uppercase text-sky-400">
                Career Mode Setup
              </div>
              <h2 className="font-display text-2xl font-black tracking-tight">
                Create Your Artist
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setStep('title')}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600/50 text-xs font-bold text-slate-200"
            >
              Back
            </button>
          </div>

          <div className="grid md:grid-cols-[210px_1fr] gap-5 items-start">
            {/* Avatar Preview Column */}
            <div className="career-inset rounded-xl p-3.5 flex flex-col items-center">
              <ArtistAvatar avatar={avatar} size={156} />
              <div className="mt-2.5 flex flex-wrap justify-center gap-1.5">
                {SKIN_TONES.map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setAvatar((a) => ({ ...a, skinTone: tone }))}
                    className={`w-5 h-5 rounded-full border-2 ${
                      avatar.skinTone === tone ? 'border-sky-400 scale-110' : 'border-transparent'
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
                      avatar.auraColor === c ? 'border-sky-400' : 'border-white/25'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="mt-3 w-full pt-2.5 border-t border-slate-700/60 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Selected Origin Perk
                </div>
                <div className="text-[11px] font-bold text-emerald-400 mt-0.5">
                  {selectedOrigin.perkSummary}
                </div>
              </div>
            </div>

            {/* Form Controls */}
            <div className="space-y-3.5">
              {/* Difficulty Selector */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-sky-300 mb-1.5">
                  Career Difficulty Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {DIFFICULTIES.map((mode) => {
                    const cfg = DIFFICULTY_CONFIGS[mode];
                    const active = difficulty === mode;
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setDifficulty(mode)}
                        className={`p-2.5 rounded-xl text-left border snap-transition ${
                          active
                            ? 'royal-active-tab'
                            : 'bg-[#091529] border-slate-700/70 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black">{mode}</span>
                          <span className="text-[10px] font-bold opacity-85">{cfg.subtitle}</span>
                        </div>
                        <p className="text-[10px] opacity-85 mt-1 leading-snug">
                          {cfg.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Stage Name
                  </label>
                  <input
                    type="text"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#091529] border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Chirper Handle
                  </label>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#091529] border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Primary Genre ({ALL_GENRES.length} Genres)
                  </label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value as MusicGenre)}
                    className="w-full px-3 py-2 rounded-lg bg-[#091529] border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-400"
                  >
                    {ALL_GENRES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Hometown
                  </label>
                  <input
                    type="text"
                    value={hometown}
                    onChange={(e) => setHometown(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#091529] border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              {/* Origin Story Picker */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5">
                  Origin Story
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto slim-scroll pr-1">
                  {ORIGIN_STORIES.map((story) => {
                    const active = story.id === originId;
                    return (
                      <button
                        key={story.id}
                        type="button"
                        onClick={() => setOriginId(story.id)}
                        className={`p-2 rounded-lg text-left border snap-transition ${
                          active
                            ? 'bg-sky-500/20 border-sky-400 text-white'
                            : 'bg-[#091529] border-slate-700/60 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <div className="text-xs font-extrabold truncate">{story.title}</div>
                        <div className="text-[10px] text-emerald-400 font-semibold truncate mt-0.5">
                          {story.perkSummary}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Hairstyle
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {HAIR_STYLES.map((hs) => (
                    <button
                      key={hs}
                      type="button"
                      onClick={() => setAvatar((a) => ({ ...a, hairStyle: hs }))}
                      className={`px-2.5 py-1 rounded text-xs font-bold capitalize ${
                        avatar.hairStyle === hs
                          ? 'bg-sky-500 text-slate-950'
                          : 'bg-[#091529] border border-slate-700 text-slate-300'
                      }`}
                    >
                      {hs}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
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
                    className="w-full px-3 py-2 rounded-lg bg-[#091529] border border-slate-700 text-xs text-white"
                  >
                    <option value="none">Clean Shaven</option>
                    <option value="stubble">Stubble</option>
                    <option value="goatee">Goatee</option>
                    <option value="beard">Full Beard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
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
                    className="w-full px-3 py-2 rounded-lg bg-[#091529] border border-slate-700 text-xs text-white"
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
                hometown: hometown.trim() || 'Atlanta, GA',
                difficulty,
                originStory: selectedOrigin,
                avatar,
              })
            }
            className="w-full py-3 rounded-xl royal-active-tab hover:brightness-110 disabled:opacity-40 font-extrabold text-sm flex items-center justify-center gap-2 snap-transition"
          >
            Enter Global Music Media Centre <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh w-full overflow-hidden flex items-center justify-center p-5 bg-[#070f21]">
      <img
        src={STUDIO_BACKDROP_URL}
        alt="Recording studio control room"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover opacity-35"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#060d1c] via-[#0a1833]/85 to-[#10244a]/70" />

      <div className="relative z-10 w-full max-w-2xl career-panel rounded-2xl p-6 sm:p-8 space-y-6 text-center">
        <div className="space-y-3">
          <div className="inline-block crimson-ribbon px-5 py-1 rounded text-[10px] font-black tracking-[0.2em] uppercase text-white">
            MUSIC INDUSTRY CAREER SIMULATOR
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow">
            MUSIC WARS: <span className="text-sky-400">ROCKSTAR</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Manage your rise from bedroom producer to label mogul. Record across 32 genres, battle 50+ AI rival artists on Chirper, negotiate major label contracts, collect RIAA plaques, and sell out world stadium tours.
          </p>
        </div>

        {/* Difficulty Preset Pills for Quick Start */}
        <div className="max-w-lg mx-auto">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-sky-400" /> Select Difficulty Mode
          </div>
          <div className="grid grid-cols-3 gap-2">
            {DIFFICULTIES.map((mode) => {
              const cfg = DIFFICULTY_CONFIGS[mode];
              const active = difficulty === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setDifficulty(mode)}
                  className={`py-2 px-2.5 rounded-lg border text-xs font-extrabold snap-transition ${
                    active
                      ? 'royal-active-tab'
                      : 'bg-[#091529] border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div>{mode}</div>
                  <div className="text-[10px] font-medium opacity-80">{cfg.subtitle}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2.5 max-w-md mx-auto">
          {hasSavedCareer && (
            <button
              type="button"
              onClick={onContinueSaved}
              className="w-full py-3.5 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-between shadow-lg snap-transition"
            >
              <span className="flex items-center gap-2">
                <Play className="w-4 h-4 fill-current" /> Continue Saved Career
              </span>
              <span className="font-mono-num text-xs font-bold opacity-85">{savedArtistSummary}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setStep('creator')}
            className="w-full py-3.5 px-5 rounded-xl royal-active-tab hover:brightness-110 font-black text-sm flex items-center justify-center gap-2 snap-transition"
          >
            <UserPlus className="w-4 h-4" /> Start New Career ({difficulty})
          </button>

          <button
            type="button"
            onClick={() => onLoadBiigMtPreset(difficulty)}
            className="w-full py-3 px-5 rounded-xl bg-[#091529] hover:bg-[#102446] border border-amber-400/40 text-amber-200 font-bold text-xs flex items-center justify-center gap-2 snap-transition"
          >
            <Sparkles className="w-4 h-4 text-amber-400" /> Quick Career: "Biig MT" (Fame 10 · #1 Hit · $4.2M)
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400 pt-1">
          <span className="flex items-center gap-1">
            <Disc3 className="w-3.5 h-3.5 text-sky-400" /> 32 Genres
          </span>
          <span>·</span>
          <span>54 AI Rivals</span>
          <span>·</span>
          <span>RIAA Plaques & Label HQ</span>
          <span>·</span>
          <span>Working Smartphone Apps</span>
        </div>
      </div>
    </div>
  );
};
