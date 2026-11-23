import React, { useEffect, useState } from 'react';
import { synthAudio } from './audio/synthEngine';
import { BottomNewsTicker } from './components/BottomNewsTicker';
import { PhoneOverlay } from './components/phone/PhoneOverlay';
import { AdvanceTimeHub } from './components/tabs/AdvanceTimeHub';
import { ArtistBrandTab } from './components/tabs/ArtistBrandTab';
import { ChartsDataTab } from './components/tabs/ChartsDataTab';
import { LabelOfficeTab } from './components/tabs/LabelOfficeTab';
import { StudioReleasesTab } from './components/tabs/StudioReleasesTab';
import { SystemTab } from './components/tabs/SystemTab';
import { TrophyRoomTab } from './components/tabs/TrophyRoomTab';
import { TitleAndCreator } from './components/TitleAndCreator';
import { TopHud } from './components/TopHud';
import {
  COVER_ARTS,
  DIFFICULTY_CONFIGS,
  INITIAL_NPCS,
  STUDIO_LEVELS,
  createBiigMtPresetState,
  createRookieCareerState,
} from './data/gameCatalog';
import {
  advanceGameTime,
  computeNetWorth,
  computeReputation,
  evaluateAchievements,
  evaluatePlaquesAndCertifications,
  formatCompactNumber,
  formatDateDot,
  formatMoney,
  getAchievementPerks,
} from './engine/simulation';
import {
  Album,
  AvatarConfig,
  CatalogItem,
  CustomCoverConfig,
  DifficultyMode,
  EmailMessage,
  GameState,
  MainTab,
  MerchItem,
  MusicGenre,
  PhoneAppId,
  RecordLabel,
  SocialPost,
  Song,
  SongMood,
} from './types/game';

const AUTOSAVE_KEY = 'rockstar_autosave_v1';

const PRODUCER_BONUS_MAP: Record<string, { bonus: number; fee: number }> = {
  'Self-Produced': { bonus: 0, fee: 0 },
  'Metro Ghost': { bonus: 4, fee: 8500 },
  'London On Da Track': { bonus: 6, fee: 18000 },
  'Pharrell Apex': { bonus: 9, fee: 45000 },
};

const MERCH_COST_MAP: Record<MerchItem['type'], number> = {
  Hoodie: 28,
  'Tour Tee': 14,
  'Vinyl LP': 18,
  Cap: 10,
  'Collector Box': 35,
};

function hydrateLoadedState(raw: GameState): GameState {
  const existingNpcIds = new Set((raw.npcs || []).map((n) => n.id));
  const mergedNpcs = [
    ...(raw.npcs || []),
    ...INITIAL_NPCS.filter((n) => !existingNpcIds.has(n.id)),
  ];

  const unlockedAchievements = raw.unlockedAchievements || [];
  const perks = getAchievementPerks(unlockedAchievements);
  const maxEnergy = 100 + perks.maxEnergyBonus;

  return {
    ...raw,
    difficulty: raw.difficulty || 'Realistic',
    hype: raw.hype ?? 50,
    reputation:
      raw.reputation ||
      computeReputation(raw.fameLevel || 1, raw.popularity || 10, raw.careerStats?.grammyAwards || 0),
    maxEnergy,
    energy: Math.min(maxEnergy, raw.energy ?? 100),
    skills: raw.skills || {
      songwriting: 40,
      vocals: 40,
      production: 40,
      stagePresence: 40,
      marketing: 40,
    },
    merchStoreLevel: raw.merchStoreLevel || 1,
    merchItems: raw.merchItems || [],
    awardsHistory: raw.awardsHistory || [],
    plaques: raw.plaques || [],
    unlockedAchievements,
    playerLabel: raw.playerLabel ?? null,
    npcs: mergedNpcs,
    lastAwardYearProcessed: raw.lastAwardYearProcessed ?? (raw.date?.year || 2026) - 1,
    careerStats: {
      totalStreams: raw.careerStats?.totalStreams || 0,
      hot100Entries: raw.careerStats?.hot100Entries || 0,
      numberOneHits: raw.careerStats?.numberOneHits || 0,
      grammyAwards: raw.careerStats?.grammyAwards || 0,
      toursCompleted: raw.careerStats?.toursCompleted || 0,
      songsReleased: raw.careerStats?.songsReleased || 0,
      videosShot: raw.careerStats?.videosShot || 0,
      highestWeeklyStreams: raw.careerStats?.highestWeeklyStreams || 0,
      soldOutArenas: raw.careerStats?.soldOutArenas || 0,
    },
  };
}

function finalizeState(candidate: GameState): GameState {
  const dateStr = formatDateDot(candidate.date);
  const plaqueEval = evaluatePlaquesAndCertifications(
    candidate.songs,
    candidate.albums,
    candidate.plaques || [],
    dateStr
  );

  const plaqueNotifs = plaqueEval.newlyAwarded.map((plq) => ({
    id: `notif_plq_${plq.id}`,
    title: `RIAA ${plq.tier} Plaque Awarded!`,
    detail: `"${plq.title}" (${plq.type}) certified ${plq.tier} (${formatCompactNumber(plq.units)} units).`,
    deltaText: plq.tier.toUpperCase(),
    dateStr,
    unread: true,
  }));

  const withPlaques: GameState = {
    ...candidate,
    plaques: plaqueEval.plaques,
    reputation: computeReputation(
      candidate.fameLevel,
      candidate.popularity,
      candidate.careerStats.grammyAwards
    ),
    notifications: [...plaqueNotifs, ...candidate.notifications].slice(0, 35),
  };

  withPlaques.netWorth = computeNetWorth(withPlaques);

  const achEval = evaluateAchievements(withPlaques, dateStr);
  const nextPerks = getAchievementPerks(achEval.unlockedAchievements);
  const nextMaxEnergy = 100 + nextPerks.maxEnergyBonus;

  return {
    ...withPlaques,
    unlockedAchievements: achEval.unlockedAchievements,
    maxEnergy: nextMaxEnergy,
    energy: Math.min(nextMaxEnergy, withPlaques.energy),
    notifications: [...achEval.notifications, ...withPlaques.notifications].slice(0, 35),
  };
}

export default function App() {
  const [savedState, setSavedState] = useState<GameState | null>(() => {
    try {
      const raw = localStorage.getItem(AUTOSAVE_KEY);
      return raw ? hydrateLoadedState(JSON.parse(raw) as GameState) : null;
    } catch {
      return null;
    }
  });

  const [state, setState] = useState<GameState | null>(null);
  const [activeTab, setActiveTab] = useState<MainTab>('advance');
  const [phoneOverlayOpen, setPhoneOverlayOpen] = useState(false);
  const [activePhoneApp, setActivePhoneApp] = useState<PhoneAppId>('home');
  const [headlineIdx, setHeadlineIdx] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
  };

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  // Auto-save whenever state updates in PLAYING phase
  useEffect(() => {
    if (!state || state.phase !== 'PLAYING') return;
    try {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(state));
      setSavedState(state);
    } catch {
      // Ignore storage quota errors
    }
  }, [state]);

  // Stop synth audio on unmount
  useEffect(() => {
    return () => synthAudio.stopSong();
  }, []);

  // Keyboard shortcuts: R cycles press headline, Escape closes phone overlay
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'Escape' && phoneOverlayOpen) {
        setPhoneOverlayOpen(false);
      } else if ((e.key === 'r' || e.key === 'R') && state?.phase === 'PLAYING') {
        setHeadlineIdx((i) => i + 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phoneOverlayOpen, state?.phase]);

  const updateState = (updater: (prev: GameState) => GameState) => {
    setState((prev) => (prev ? finalizeState(updater(prev)) : prev));
  };

  const handleToggleMute = () => {
    if (!state) return;
    const nextMuted = !state.muted;
    synthAudio.setMuted(nextMuted);
    updateState((prev) => ({
      ...prev,
      muted: nextMuted,
      isAudioPlaying: nextMuted ? false : prev.isAudioPlaying,
    }));
  };

  const handlePlaySong = (songId: string) => {
    if (!state) return;
    const song = state.songs.find((s) => s.id === songId);
    if (!song) return;

    if (state.nowPlayingSongId === songId && state.isAudioPlaying) {
      synthAudio.stopSong();
      setState((prev) => (prev ? { ...prev, isAudioPlaying: false } : prev));
      return;
    }

    if (state.muted) {
      synthAudio.setMuted(false);
    }

    synthAudio.startSong({
      bpm: song.bpm,
      genre: song.genre,
      mood: song.mood,
      seed: song.seed,
    });

    setState((prev) =>
      prev
        ? {
            ...prev,
            muted: false,
            nowPlayingSongId: songId,
            isAudioPlaying: true,
          }
        : prev
    );
  };

  const handleAdvanceTime = (step: 'day' | 'week' | 'month') => {
    synthAudio.playSfx('advance');
    setState((prev) => (prev ? advanceGameTime(prev, step) : prev));
  };

  const handleQuickAction = (action: string, payload?: Record<string, string | number>) => {
    if (!state) return;

    switch (action) {
      case 'cash_gig': {
        const reward = Number(payload?.reward || 2500);
        const energyCost = Number(payload?.energy || 5);
        const title = String(payload?.title || 'Live Gig');
        if (state.energy < energyCost) return;
        synthAudio.playSfx('cash');
        updateState((prev) => ({
          ...prev,
          cash: prev.cash + reward,
          energy: prev.energy - energyCost,
          hype: Math.min(100, prev.hype + 4),
          popularity: Math.min(150, +(prev.popularity + 0.8).toFixed(1)),
        }));
        showToast(`${title}: +${formatMoney(reward)}`);
        break;
      }

      case 'record_guest_verse': {
        const npcName = String(payload?.npcName || 'Artist');
        const payout = Number(payload?.payout || 5000);
        if (state.energy < 4) return;
        synthAudio.playSfx('record');
        updateState((prev) => ({
          ...prev,
          cash: prev.cash + payout,
          energy: prev.energy - 4,
          hype: Math.min(100, prev.hype + 5),
          popularity: Math.min(150, +(prev.popularity + 1.2).toFixed(1)),
        }));
        showToast(`Recorded guest verse for ${npcName} (+${formatMoney(payout)})`);
        break;
      }

      case 'produce_beat': {
        if (state.energy < 5) return;
        const pay = 1200 + state.studio.level * 1800;
        synthAudio.playSfx('cash');
        updateState((prev) => {
          const delivered = prev.producerDelivered + 1;
          const rank =
            delivered >= 25
              ? 'Executive Producer'
              : delivered >= 10
              ? 'Chart Producer'
              : delivered >= 3
              ? 'Beatmaker'
              : 'Bedroom Producer';
          return {
            ...prev,
            cash: prev.cash + pay,
            energy: prev.energy - 5,
            producerDelivered: delivered,
            producerRank: rank,
          };
        });
        showToast(`Delivered studio beat (+${formatMoney(pay)})`);
        break;
      }

      case 'act_role': {
        if (state.energy < 6) return;
        const pay = 4500 + state.fameLevel * 7500;
        synthAudio.playSfx('cash');
        updateState((prev) => {
          const credits = prev.actorCredits + 1;
          const rank = credits >= 12 ? 'Lead' : credits >= 4 ? 'Supporting' : 'Extra';
          return {
            ...prev,
            cash: prev.cash + pay,
            energy: prev.energy - 6,
            actorCredits: credits,
            actorRank: rank,
            hype: Math.min(100, prev.hype + 6),
            popularity: Math.min(150, +(prev.popularity + 1.5).toFixed(1)),
          };
        });
        showToast(`Filmed role (+${formatMoney(pay)})`);
        break;
      }

      case 'rest': {
        synthAudio.playSfx('tap');
        updateState((prev) => ({
          ...prev,
          energy: prev.maxEnergy,
        }));
        showToast('Rested! Energy restored.');
        break;
      }

      case 'vocal_coach': {
        if (state.energy < 4 || state.cash < 500) return;
        synthAudio.playSfx('record');
        updateState((prev) => ({
          ...prev,
          cash: prev.cash - 500,
          energy: prev.energy - 4,
          popularity: Math.min(150, +(prev.popularity + 1.4).toFixed(1)),
          skills: {
            ...prev.skills,
            vocals: Math.min(100, prev.skills.vocals + 4),
            songwriting: Math.min(100, prev.skills.songwriting + 3),
          },
        }));
        showToast('Vocal session complete (+4 Vocals, +3 Songwriting)');
        break;
      }

      case 'train_production': {
        if (state.energy < 4 || state.cash < 800) return;
        synthAudio.playSfx('record');
        updateState((prev) => ({
          ...prev,
          cash: prev.cash - 800,
          energy: prev.energy - 4,
          skills: {
            ...prev.skills,
            production: Math.min(100, prev.skills.production + 5),
            songwriting: Math.min(100, prev.skills.songwriting + 3),
          },
        }));
        showToast('Mixing workshop complete (+5 Production, +3 Songwriting)');
        break;
      }

      case 'stage_rehearsal': {
        if (state.energy < 4 || state.cash < 650) return;
        synthAudio.playSfx('tap');
        updateState((prev) => ({
          ...prev,
          cash: prev.cash - 650,
          energy: prev.energy - 4,
          skills: {
            ...prev.skills,
            stagePresence: Math.min(100, prev.skills.stagePresence + 6),
          },
        }));
        showToast('Arena rehearsal complete (+6 Stage Presence)');
        break;
      }

      case 'press_run': {
        if (state.energy < 6) return;
        synthAudio.playSfx('notification');
        updateState((prev) => ({
          ...prev,
          energy: prev.energy - 6,
          hype: Math.min(100, prev.hype + 12),
          popularity: Math.min(150, +(prev.popularity + 2.8).toFixed(1)),
          skills: {
            ...prev.skills,
            marketing: Math.min(100, prev.skills.marketing + 5),
          },
          socialFollowers: {
            ...prev.socialFollowers,
            youtube: prev.socialFollowers.youtube + 5500,
            instaglam: prev.socialFollowers.instaglam + 9500,
            x: prev.socialFollowers.x + 4200,
          },
        }));
        showToast('Press & radio tour aired! +12% Hype & +19K followers');
        break;
      }

      case 'gym': {
        if (state.cash < 250) return;
        synthAudio.playSfx('tap');
        updateState((prev) => ({
          ...prev,
          cash: prev.cash - 250,
          energy: Math.min(prev.maxEnergy, prev.energy + 6),
          heatLevel: Math.max(0, prev.heatLevel - 8),
        }));
        showToast('Gym & Spa session complete (+6 ⚡, -8% Heat)');
        break;
      }

      case 'befriend_npc': {
        const npcId = String(payload?.npcId || '');
        const npc = state.npcs.find((n) => n.id === npcId);
        if (!npc) break;
        synthAudio.playSfx('tap');
        updateState((prev) => ({
          ...prev,
          npcs: prev.npcs.map((n) =>
            n.id === npcId
              ? {
                  ...n,
                  relationshipScore: Math.min(100, n.relationshipScore + 25),
                  relationship: n.relationshipScore + 25 >= 45 ? 'friend' : 'neutral',
                }
              : n
          ),
        }));
        showToast(`Built alliance with ${npc.name}!`);
        break;
      }

      case 'start_beef': {
        const npcId = String(payload?.npcId || '');
        const npc = state.npcs.find((n) => n.id === npcId);
        if (!npc) break;
        synthAudio.playSfx('notification');
        updateState((prev) => ({
          ...prev,
          hype: Math.min(100, prev.hype + 10),
          popularity: Math.min(150, +(prev.popularity + 1.8).toFixed(1)),
          npcs: prev.npcs.map((n) =>
            n.id === npcId
              ? {
                  ...n,
                  relationship: 'beef',
                  relationshipScore: Math.max(-100, n.relationshipScore - 45),
                }
              : n
          ),
          posts: [
            {
              id: `post_beef_${Date.now()}`,
              platform: 'x',
              authorName: prev.artistName,
              authorHandle: prev.handle,
              authorInitials: prev.artistName.slice(0, 2).toUpperCase(),
              authorColor: '#f43f5e',
              isVerified: prev.fameLevel >= 3,
              content: `${npc.handle} keep talking in interviews... step in the booth and let's settle it.`,
              likes: 4200 + prev.fameLevel * 1900,
              comments: 620,
              shares: 1100,
              timeAgo: 'Just now',
              commentsList: [
                { id: `cb_${Date.now()}`, author: npc.name, text: 'Careful what you wish for.' },
              ],
            },
            ...prev.posts,
          ],
        }));
        showToast(`Public beef ignited with ${npc.name}! (+10% Hype)`);
        break;
      }

      case 'crime_hustle': {
        if (state.energy < 4) return;
        const reward = Number(payload?.reward || 4500);
        const heat = Number(payload?.heat || 15);
        const caught = Math.random() * 100 < state.heatLevel * 0.55;
        if (caught) {
          const fine = Math.min(state.cash, Math.round(reward * 1.5));
          synthAudio.playSfx('tap');
          updateState((prev) => ({
            ...prev,
            cash: prev.cash - fine,
            energy: prev.energy - 4,
            heatLevel: 0,
            popularity: Math.max(1, +(prev.popularity - 3.5).toFixed(1)),
          }));
          showToast(`Busted! Paid ${formatMoney(fine)} legal bail.`);
        } else {
          synthAudio.playSfx('cash');
          updateState((prev) => ({
            ...prev,
            cash: prev.cash + reward,
            energy: prev.energy - 4,
            heatLevel: Math.min(100, prev.heatLevel + heat),
          }));
          showToast(`Pulled off hustle: +${formatMoney(reward)}`);
        }
        break;
      }

      case 'lay_low': {
        if (state.cash < 2500) return;
        updateState((prev) => ({
          ...prev,
          cash: prev.cash - 2500,
          heatLevel: 0,
        }));
        showToast('Fixer cleared your street heat.');
        break;
      }
    }
  };

  const handleRecordSong = (payload: {
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
  }) => {
    if (!state || state.energy < 5) return;

    const perks = getAchievementPerks(state.unlockedAchievements || []);
    const diffCfg = DIFFICULTY_CONFIGS[state.difficulty || 'Realistic'];
    const feeScale = Math.max(0.55, diffCfg.feeMult * (1 - perks.feeDiscount));

    const featNpc = state.npcs.find((n) => n.id === payload.featuredArtistId);
    const dissNpc =
      payload.mood === 'Diss' ? state.npcs.find((n) => n.id === payload.dissTargetId) : undefined;

    const featCost = featNpc
      ? Math.round((featNpc.relationship === 'friend' ? featNpc.featFee * 0.4 : featNpc.featFee) * feeScale)
      : 0;
    const prodSpec = PRODUCER_BONUS_MAP[payload.producerName || 'Self-Produced'] || {
      bonus: 0,
      fee: 0,
    };
    const prodCost = Math.round(prodSpec.fee * feeScale);
    const marketingBudget = payload.marketingBudget || 0;
    const totalCost = featCost + prodCost + marketingBudget;

    if (state.cash < totalCost) return;

    const skillBonus =
      state.skills.songwriting * 0.14 +
      state.skills.production * 0.12 +
      state.skills.vocals * 0.1 +
      state.skills.stagePresence * 0.04;
    const baseQuality =
      40 +
      state.studio.rating * 3.1 +
      skillBonus * 0.65 +
      prodSpec.bonus +
      Math.min(10, state.fameLevel * 0.9);
    const quality = Math.min(99, Math.max(35, Math.round(baseQuality + (Math.random() * 11 - 4))));

    const dissBuzzMult = dissNpc ? 1.48 : 1.0;
    const marketingMult =
      marketingBudget > 0 ? 1 + Math.min(0.9, Math.log10(marketingBudget + 10) * 0.16) : 1.0;

    const initialStreams = payload.releaseImmediately
      ? Math.round(
          (2800 + state.fameLevel * 15000 + state.popularity * 1300) *
            (quality / 65) *
            dissBuzzMult *
            marketingMult *
            diffCfg.streamMult *
            perks.streamMult
        )
      : 0;

    const newSong: Song = {
      id: `song_${Date.now()}`,
      title: payload.title,
      genre: payload.genre,
      mood: payload.mood,
      bpm: payload.bpm,
      coverUrl: payload.coverUrl,
      customCover: payload.customCover,
      quality,
      featuredArtistId: featNpc?.id,
      featuredArtistName: featNpc?.name,
      dissTargetId: dissNpc?.id,
      dissTargetName: dissNpc?.name,
      producerName: payload.producerName || state.artistName,
      marketingBudget,
      released: payload.releaseImmediately,
      releaseDate: payload.releaseImmediately ? { ...state.date } : undefined,
      releaseYear: payload.releaseImmediately ? state.date.year : undefined,
      isSingle: true,
      totalStreams: initialStreams,
      weeklyStreams: initialStreams,
      dailyStreams: Math.round(initialStreams / 3),
      peakChartPos: null,
      currentChartPos: null,
      weeksOnChart: 0,
      viralScore: payload.releaseImmediately
        ? Math.min(95, Math.round(quality * 0.45 * perks.viralMult + (dissNpc ? 28 : 0)))
        : 0,
      playlistReach: payload.releaseImmediately
        ? Math.min(95, 20 + (marketingBudget >= 5000 ? 25 : 0) + (marketingBudget >= 75000 ? 25 : 0))
        : 0,
      radioPush: marketingBudget >= 75000 ? 45 : 0,
      hasVideo: false,
      videoViews: 0,
      seed: Math.floor(Math.random() * 200) + 1,
    };

    synthAudio.playSfx('record');

    updateState((prev) => {
      const newsPost: SocialPost[] = payload.releaseImmediately
        ? [
            {
              id: `post_rel_${Date.now()}`,
              platform: 'fakebook',
              authorName: 'Music Daily',
              authorHandle: '@musicdaily',
              authorInitials: 'MD',
              authorColor: '#9333ea',
              isVerified: true,
              isNews: true,
              linkDomain: 'ROLLINGROCK.COM',
              headline: dissNpc
                ? `${prev.artistName} fires shots at ${dissNpc.name} on explosive diss track "${payload.title}"!`
                : `${prev.artistName} (${payload.genre}) releases "${payload.title}"${
                    featNpc ? ` featuring ${featNpc.name}` : ''
                  }.`,
              content: dissNpc
                ? `Chirper timelines are erupting after ${prev.artistName} aimed directly at ${dissNpc.name} on "${payload.title}". Both artists see massive stream spikes!`
                : `${prev.artistName} (${payload.genre}) drops new single "${payload.title}"${
                    featNpc ? ` ft. ${featNpc.name}` : ''
                  }.`,
              likes: 120 + prev.fameLevel * 420 + (dissNpc ? 4500 : 0),
              comments: 24 + prev.fameLevel * 35 + (dissNpc ? 820 : 0),
              shares: 38 + prev.fameLevel * 60 + (dissNpc ? 940 : 0),
              timeAgo: 'Just now',
              commentsList: [],
            },
          ]
        : [];

      const nextNpcs =
        dissNpc && payload.releaseImmediately
          ? prev.npcs.map((n) =>
              n.id === dissNpc.id
                ? {
                    ...n,
                    relationship: 'beef' as const,
                    relationshipScore: Math.max(-100, n.relationshipScore - 50),
                    clout: Math.min(100, n.clout + 6),
                    monthlyListeners: Math.round(n.monthlyListeners * 1.08),
                  }
                : n
            )
          : prev.npcs;

      return {
        ...prev,
        cash: prev.cash - totalCost,
        energy: prev.energy - 5,
        hype: payload.releaseImmediately
          ? Math.min(100, prev.hype + (dissNpc ? 16 : 8) + (marketingBudget > 0 ? 10 : 0))
          : prev.hype,
        songs: [...prev.songs, newSong],
        npcs: nextNpcs,
        posts: [...newsPost, ...prev.posts],
        skills: {
          ...prev.skills,
          songwriting: Math.min(100, prev.skills.songwriting + 1),
          production: Math.min(100, prev.skills.production + 1),
        },
        popularity: payload.releaseImmediately
          ? Math.min(150, +(prev.popularity + (dissNpc ? 4.2 : 2.2)).toFixed(1))
          : prev.popularity,
        careerStats: {
          ...prev.careerStats,
          songsReleased: prev.careerStats.songsReleased + (payload.releaseImmediately ? 1 : 0),
          totalStreams: prev.careerStats.totalStreams + initialStreams,
        },
      };
    });

    showToast(
      payload.releaseImmediately
        ? dissNpc
          ? `Dropped diss "${payload.title}" targeting ${dissNpc.name}!`
          : `Dropped "${payload.title}" (Quality ${quality})!`
        : `Saved "${payload.title}" (Quality ${quality}) to Vault.`
    );
  };

  const handleReleaseSong = (songId: string) => {
    if (!state) return;
    const song = state.songs.find((s) => s.id === songId);
    if (!song || song.released) return;

    const perks = getAchievementPerks(state.unlockedAchievements || []);
    const diffCfg = DIFFICULTY_CONFIGS[state.difficulty || 'Realistic'];
    const debutStreams = Math.round(
      (5000 + state.fameLevel * 13500) * (song.quality / 65) * diffCfg.streamMult * perks.streamMult
    );

    synthAudio.playSfx('chart_hit');
    updateState((prev) => ({
      ...prev,
      hype: Math.min(100, prev.hype + 7),
      popularity: Math.min(150, +(prev.popularity + 1.8).toFixed(1)),
      songs: prev.songs.map((s) =>
        s.id === songId
          ? {
              ...s,
              released: true,
              releaseDate: { ...prev.date },
              releaseYear: prev.date.year,
              weeklyStreams: debutStreams,
              totalStreams: debutStreams,
              dailyStreams: Math.round(debutStreams / 3),
              viralScore: Math.min(90, Math.round(s.quality * 0.45)),
              playlistReach: 20,
            }
          : s
      ),
      careerStats: {
        ...prev.careerStats,
        songsReleased: prev.careerStats.songsReleased + 1,
        totalStreams: prev.careerStats.totalStreams + debutStreams,
      },
    }));
    showToast(`"${song.title}" released globally!`);
  };

  const handleReleaseAlbum = (payload: {
    title: string;
    type: 'ALBUM' | 'EP' | 'MIXTAPE' | 'COLLAB';
    coverUrl: string;
    customCover?: CustomCoverConfig;
    songIds: string[];
    collabArtistId?: string;
  }) => {
    if (!state) return;
    const collab = state.npcs.find((n) => n.id === payload.collabArtistId);
    const cost = payload.type === 'COLLAB' ? 25000 : 0;
    if (state.cash < cost) return;

    const albumId = `alb_${Date.now()}`;
    const updatedSongs = state.songs.map((s) =>
      payload.songIds.includes(s.id)
        ? {
            ...s,
            released: true,
            releaseDate: s.releaseDate || { ...state.date },
            releaseYear: s.releaseYear || state.date.year,
            albumId,
            weeklyStreams: Math.max(s.weeklyStreams, 9500 + state.fameLevel * 18500),
            totalStreams: Math.max(s.totalStreams, 9500 + state.fameLevel * 18500),
          }
        : s
    );

    const projectTracks = updatedSongs.filter((s) => payload.songIds.includes(s.id));
    const totalStreams = projectTracks.reduce((a, s) => a + s.totalStreams, 0);
    const weeklyStreams = projectTracks.reduce((a, s) => a + s.weeklyStreams, 0);

    const newAlbum: Album = {
      id: albumId,
      title: payload.title,
      type: payload.type,
      coverUrl: payload.coverUrl,
      customCover: payload.customCover,
      songIds: payload.songIds,
      collabArtistId: collab?.id,
      collabArtistName: collab?.name,
      released: true,
      releaseDate: { ...state.date },
      releaseYear: state.date.year,
      totalStreams,
      weeklyStreams,
      firstWeekUnits: Math.max(500, Math.round(weeklyStreams / 1200)),
      peakChartPos: null,
      currentChartPos: null,
      weeksOnChart: 1,
    };

    synthAudio.playSfx('chart_hit');

    updateState((prev) => ({
      ...prev,
      cash: prev.cash - cost,
      hype: Math.min(100, prev.hype + 16),
      songs: updatedSongs,
      albums: [...prev.albums, newAlbum],
      popularity: Math.min(150, +(prev.popularity + 5.5).toFixed(1)),
      contract: prev.contract
        ? {
            ...prev.contract,
            albumsDelivered: prev.contract.albumsDelivered + 1,
          }
        : null,
      posts: [
        {
          id: `post_alb_${Date.now()}`,
          platform: 'fakebook',
          authorName: 'Music Daily',
          authorHandle: '@musicdaily',
          authorInitials: 'MD',
          authorColor: '#9333ea',
          isVerified: true,
          isNews: true,
          linkDomain: 'BILLBOARD.COM',
          headline: `${prev.artistName} drops ${payload.type} "${payload.title}" (${payload.songIds.length} tracks)!`,
          content: `Projected ${formatCompactNumber(newAlbum.firstWeekUnits)} first-week equivalent units on the Hot 200.`,
          likes: 2800 + prev.fameLevel * 1500,
          comments: 310,
          shares: 640,
          timeAgo: 'Just now',
          commentsList: [],
        },
        ...prev.posts,
      ],
    }));

    showToast(`Released ${payload.type}: "${payload.title}"!`);
  };

  const handleShootVideo = (payload: {
    songId: string;
    tier: 'DIY' | 'Indie' | 'Cinematic' | 'Blockbuster';
    cost: number;
  }) => {
    if (!state || state.cash < payload.cost || state.energy < 4) return;
    const song = state.songs.find((s) => s.id === payload.songId);
    if (!song) return;

    const viewsGain =
      payload.tier === 'Blockbuster'
        ? 950000
        : payload.tier === 'Cinematic'
        ? 320000
        : payload.tier === 'Indie'
        ? 85000
        : 18000;

    synthAudio.playSfx('record');

    updateState((prev) => ({
      ...prev,
      cash: prev.cash - payload.cost,
      energy: prev.energy - 4,
      hype: Math.min(100, prev.hype + 10),
      popularity: Math.min(150, +(prev.popularity + 3.2).toFixed(1)),
      songs: prev.songs.map((s) =>
        s.id === payload.songId
          ? {
              ...s,
              hasVideo: true,
              videoViews: s.videoViews + viewsGain,
              videoTitle: `${s.title} (Official Video)`,
              videoBudgetTier: payload.tier,
              viralScore: Math.min(100, s.viralScore + 25),
            }
          : s
      ),
      posts: [
        {
          id: `post_yt_${Date.now()}`,
          platform: 'youtube',
          authorName: prev.artistName,
          authorHandle: prev.handle,
          authorInitials: prev.artistName.slice(0, 2).toUpperCase(),
          authorColor: '#ef4444',
          isVerified: true,
          headline: `${prev.artistName} - ${song.title} (Official ${payload.tier} Video)`,
          content: `Official music video out now!`,
          imageUrl: song.coverUrl,
          songId: song.id,
          likes: Math.round(viewsGain * 0.08),
          comments: Math.round(viewsGain * 0.005),
          shares: Math.round(viewsGain * 0.01),
          views: viewsGain,
          timeAgo: 'Just now',
          commentsList: [],
        },
        ...prev.posts,
      ],
      careerStats: {
        ...prev.careerStats,
        videosShot: prev.careerStats.videosShot + 1,
      },
    }));

    showToast(`Shot ${payload.tier} video for "${song.title}"!`);
  };

  const handleUpgradeStudio = () => {
    if (!state) return;
    const next = STUDIO_LEVELS.find((l) => l.level === state.studio.level + 1);
    if (!next) return;
    const perks = getAchievementPerks(state.unlockedAchievements || []);
    const feeScale = Math.max(
      0.55,
      DIFFICULTY_CONFIGS[state.difficulty || 'Realistic'].feeMult * (1 - perks.feeDiscount)
    );
    const cost = Math.round(state.studio.upgradeCost * feeScale);
    if (state.cash < cost) return;

    synthAudio.playSfx('cash');
    updateState((prev) => ({
      ...prev,
      cash: prev.cash - cost,
      studio: { ...next },
    }));
    showToast(`Upgraded studio to ${next.name} (${next.rating}/10)!`);
  };

  const handlePromoteSong = (
    songId: string,
    channel: 'playlist' | 'radio' | 'viral',
    cost: number
  ) => {
    if (!state || state.cash < cost) return;
    synthAudio.playSfx('cash');
    updateState((prev) => ({
      ...prev,
      cash: prev.cash - cost,
      hype: Math.min(100, prev.hype + 6),
      songs: prev.songs.map((s) =>
        s.id === songId
          ? {
              ...s,
              playlistReach: channel === 'playlist' ? Math.min(100, s.playlistReach + 22) : s.playlistReach,
              radioPush: channel === 'radio' ? Math.min(100, s.radioPush + 25) : s.radioPush,
              viralScore: channel === 'viral' ? Math.min(100, s.viralScore + 30) : s.viralScore,
              weeklyStreams: Math.round(s.weeklyStreams * 1.25 + 38000),
            }
          : s
      ),
    }));
    showToast(`Launched ${channel} promo push!`);
  };

  const handleBuyCatalogItem = (item: CatalogItem) => {
    if (!state || state.cash < item.price) return;
    synthAudio.playSfx('cash');
    updateState((prev) => ({
      ...prev,
      cash: prev.cash - item.price,
      statusPoints: prev.statusPoints + item.statusGain,
      hype: Math.min(100, prev.hype + (item.hypeBonus || 0)),
      ownedVehicles:
        item.category === 'vehicle' ? [...prev.ownedVehicles, item.id] : prev.ownedVehicles,
      ownedRealEstate:
        item.category === 'realestate' ? [...prev.ownedRealEstate, item.id] : prev.ownedRealEstate,
      ownedClothes:
        item.category === 'clothes' ? [...prev.ownedClothes, item.id] : prev.ownedClothes,
      ownedJewelry:
        item.category === 'jewelry' ? [...prev.ownedJewelry, item.id] : prev.ownedJewelry,
      ownedFactories:
        item.category === 'factory' ? [...prev.ownedFactories, item.id] : prev.ownedFactories,
      avatar:
        item.category === 'clothes'
          ? { ...prev.avatar, outfitId: item.id }
          : item.category === 'jewelry'
          ? { ...prev.avatar, jewelryIds: [...prev.avatar.jewelryIds, item.id] }
          : prev.avatar,
    }));
    showToast(`Purchased ${item.name}!`);
  };

  const handleNegotiateLabel = (
    label: RecordLabel,
    requestedRoyalty: number,
    requestedAdvance: number
  ) => {
    if (!state) return;
    const maxAcceptableRoyalty = label.royaltyPercent + state.fameLevel * 1.4 + 4;
    const maxAcceptableAdvance = label.advance * (1 + state.fameLevel * 0.04 + 0.15);

    if (requestedRoyalty > maxAcceptableRoyalty || requestedAdvance > maxAcceptableAdvance) {
      synthAudio.playSfx('tap');
      showToast(
        `${label.name} rejected terms — try <= ${Math.round(maxAcceptableRoyalty)}% split or <= ${formatMoney(
          maxAcceptableAdvance
        )}.`
      );
      return;
    }

    synthAudio.playSfx('chart_hit');
    updateState((prev) => ({
      ...prev,
      cash: prev.cash + requestedAdvance,
      hype: Math.min(100, prev.hype + 12),
      contract: {
        labelId: label.id,
        labelName: label.name,
        royaltyPercent: requestedRoyalty,
        albumsRequired: label.albumsRequired,
        albumsDelivered: 0,
        promoBonus: label.promoBonus,
        advancePaid: requestedAdvance,
      },
    }));
    showToast(
      `Signed with ${label.name} (${requestedRoyalty}% masters · +${formatMoney(requestedAdvance)})!`
    );
  };

  const handleGoIndependent = () => {
    if (!state || !state.contract) return;
    synthAudio.playSfx('tap');
    updateState((prev) => ({ ...prev, contract: null }));
    showToast('Returned to Independent status (100% Masters & Royalties).');
  };

  const handleFoundPlayerLabel = (name: string) => {
    if (!state || state.playerLabel || state.cash < 500000) return;
    synthAudio.playSfx('chart_hit');
    updateState((prev) => ({
      ...prev,
      cash: prev.cash - 500000,
      hype: Math.min(100, prev.hype + 15),
      popularity: Math.min(150, +(prev.popularity + 6).toFixed(1)),
      playerLabel: {
        name,
        foundedYear: prev.date.year,
        rosterIds: [],
        totalRevenue: 0,
        level: 1,
      },
    }));
    showToast(`Incorporated "${name}" Record Label HQ!`);
  };

  const handleSignNpcToPlayerLabel = (
    npcId: string,
    labelSplitPercent: number,
    signingBonus: number
  ) => {
    if (!state || !state.playerLabel || state.cash < signingBonus) return;
    const npc = state.npcs.find((n) => n.id === npcId);
    if (!npc || npc.signedToPlayerLabel) return;

    synthAudio.playSfx('cash');
    updateState((prev) => ({
      ...prev,
      cash: prev.cash - signingBonus,
      playerLabel: prev.playerLabel
        ? {
            ...prev.playerLabel,
            rosterIds: [...prev.playerLabel.rosterIds, npcId],
          }
        : null,
      npcs: prev.npcs.map((n) =>
        n.id === npcId
          ? {
              ...n,
              signedToPlayerLabel: true,
              playerLabelSplit: labelSplitPercent,
              relationship: 'friend',
              relationshipScore: Math.min(100, n.relationshipScore + 30),
            }
          : n
      ),
    }));
    showToast(`Signed ${npc.name} to ${state.playerLabel.name} (${labelSplitPercent}% label cut)!`);
  };

  const handleBoostLabelArtist = (npcId: string, budget: number) => {
    if (!state || !state.playerLabel || state.cash < budget) return;
    const npc = state.npcs.find((n) => n.id === npcId);
    if (!npc) return;

    synthAudio.playSfx('notification');
    updateState((prev) => ({
      ...prev,
      cash: prev.cash - budget,
      npcs: prev.npcs.map((n) =>
        n.id === npcId
          ? {
              ...n,
              monthlyListeners: Math.round(n.monthlyListeners * 1.24),
              fame: Math.min(12, n.fame + 1),
              clout: Math.min(100, n.clout + 8),
            }
          : n
      ),
    }));
    showToast(`Launched promo blitz for ${npc.name} (+24% monthly listeners)!`);
  };

  const handleStartTour = (
    name: string,
    venueTier: string,
    citiesTotal: number,
    ticketPrice: number,
    upfront: number,
    estimatedSellout: number
  ) => {
    if (!state || state.cash < upfront) return;
    synthAudio.playSfx('chart_hit');
    updateState((prev) => ({
      ...prev,
      cash: prev.cash - upfront,
      hype: Math.min(100, prev.hype + 10),
      activeTour: {
        active: true,
        name,
        venueTier,
        citiesTotal,
        citiesCompleted: 0,
        ticketPrice,
        selloutPercent: estimatedSellout,
        revenueEarned: 0,
      },
    }));
    showToast(`Booked "${name}" (${venueTier} · Est. ${estimatedSellout}% sell-out)!`);
  };

  const handleLaunchMerch = (
    name: string,
    type: MerchItem['type'],
    price: number,
    eraAlbumTitle?: string
  ) => {
    if (!state || state.cash < 1500) return;
    synthAudio.playSfx('cash');
    const newItem: MerchItem = {
      id: `merch_${Date.now()}`,
      name,
      type,
      eraAlbumTitle,
      price,
      costToProduce: MERCH_COST_MAP[type],
      unitsSold: 0,
      weeklyRevenue: Math.round((state.popularity * 1.5 + state.fameLevel * 18) * price),
      active: true,
    };
    updateState((prev) => ({
      ...prev,
      cash: prev.cash - 1500,
      merchItems: [newItem, ...prev.merchItems],
    }));
    showToast(`Launched "${name}" in Merch Webstore!`);
  };

  const handleUpgradeMerchStore = () => {
    if (!state || state.merchStoreLevel >= 4) return;
    const cost = state.merchStoreLevel * 45000;
    if (state.cash < cost) return;
    synthAudio.playSfx('cash');
    updateState((prev) => ({
      ...prev,
      cash: prev.cash - cost,
      merchStoreLevel: Math.min(4, prev.merchStoreLevel + 1),
    }));
    showToast(`Upgraded Merch Store to Tier ${state.merchStoreLevel + 1}!`);
  };

  const handleCreatePost = (
    platform: 'fakebook' | 'x' | 'instaglam' | 'tictok' | 'youtube',
    content: string,
    extra?: { imageUrl?: string; songId?: string; headline?: string }
  ) => {
    if (!state) return;
    synthAudio.playSfx('notification');

    const likes = Math.round(45 + state.fameLevel * 1800 + Math.random() * 900);
    const views = platform === 'tictok' || platform === 'youtube' ? likes * 14 : undefined;
    const song = state.songs.find((s) => s.id === extra?.songId);

    const newPost: SocialPost = {
      id: `post_${Date.now()}`,
      platform,
      authorName: state.artistName,
      authorHandle: state.handle,
      authorInitials: state.artistName.slice(0, 2).toUpperCase(),
      authorColor: '#13ca9b',
      isVerified: state.fameLevel >= 3,
      headline: extra?.headline,
      content,
      imageUrl: extra?.imageUrl,
      songId: song?.id,
      songTitle: song ? `${song.title} - ${state.artistName}` : undefined,
      likes,
      comments: Math.round(likes * 0.04),
      shares: Math.round(likes * 0.09),
      views,
      timeAgo: 'Just now',
      commentsList: [],
    };

    const followerBump = Math.round(140 + state.fameLevel * 650);

    updateState((prev) => ({
      ...prev,
      posts: [newPost, ...prev.posts],
      hype: Math.min(100, prev.hype + (song ? 6 : 3)),
      popularity: Math.min(150, +(prev.popularity + 0.5).toFixed(1)),
      songs: song
        ? prev.songs.map((s) =>
            s.id === song.id
              ? {
                  ...s,
                  viralScore: Math.min(100, s.viralScore + (platform === 'tictok' ? 14 : 9)),
                  weeklyStreams: s.weeklyStreams + Math.round(followerBump * 16),
                }
              : s
          )
        : prev.songs,
      socialFollowers: {
        ...prev.socialFollowers,
        [platform]: prev.socialFollowers[platform] + followerBump,
      },
    }));

    showToast(
      `Posted on ${platform === 'x' ? 'CHIRPER' : platform.toUpperCase()} (+${formatCompactNumber(
        followerBump
      )} reach)`
    );
  };

  const handleEmailAction = (
    email: EmailMessage,
    customTerms?: { royaltyPercent?: number; advance?: number }
  ) => {
    if (!state || email.actionCompleted) return;

    if (email.actionType === 'accept_feat') {
      const npcId = String(email.actionPayload?.npcId || '');
      const title = String(email.actionPayload?.songTitle || 'Studio Collab');
      const npc = state.npcs.find((n) => n.id === npcId);
      const newSong: Song = {
        id: `song_collab_${Date.now()}`,
        title,
        genre: npc?.genre || state.genre,
        mood: 'Hype',
        bpm: 132,
        coverUrl: COVER_ARTS[2].url,
        quality: Math.min(97, Math.round(68 + state.studio.rating * 2.5)),
        featuredArtistId: npc?.id,
        featuredArtistName: npc?.name,
        producerName: state.artistName,
        released: false,
        isSingle: true,
        totalStreams: 0,
        weeklyStreams: 0,
        dailyStreams: 0,
        peakChartPos: null,
        currentChartPos: null,
        weeksOnChart: 0,
        viralScore: 25,
        playlistReach: 0,
        radioPush: 0,
        hasVideo: false,
        videoViews: 0,
        seed: 88,
      };
      synthAudio.playSfx('record');
      updateState((prev) => ({
        ...prev,
        songs: [...prev.songs, newSong],
        emails: prev.emails.map((e) =>
          e.id === email.id ? { ...e, actionCompleted: true, read: true } : e
        ),
      }));
      showToast(`Collab "${title}" saved to Studio Vault!`);
    } else if (email.actionType === 'sign_label') {
      const baseRoyalty = Number(email.actionPayload?.royaltyPercent || 45);
      const baseAdvance = Number(email.actionPayload?.advance || 350000);
      const reqRoyalty = customTerms?.royaltyPercent ?? baseRoyalty;
      const reqAdvance = customTerms?.advance ?? baseAdvance;

      if (
        reqRoyalty > baseRoyalty + state.fameLevel * 1.2 + 5 ||
        reqAdvance > baseAdvance * (1.25 + state.fameLevel * 0.02)
      ) {
        synthAudio.playSfx('tap');
        showToast('Label countered: lower your royalty or advance demand slightly.');
        return;
      }

      synthAudio.playSfx('chart_hit');
      updateState((prev) => ({
        ...prev,
        cash: prev.cash + reqAdvance,
        hype: Math.min(100, prev.hype + 12),
        contract: {
          labelId: String(email.actionPayload?.labelId || 'horizon_global'),
          labelName: String(email.actionPayload?.labelName || email.fromName),
          royaltyPercent: reqRoyalty,
          albumsRequired: Number(email.actionPayload?.albumsRequired || 3),
          albumsDelivered: 0,
          promoBonus: Number(email.actionPayload?.promoBonus || 1.6),
          advancePaid: reqAdvance,
        },
        emails: prev.emails.map((e) =>
          e.id === email.id ? { ...e, actionCompleted: true, read: true } : e
        ),
      }));
      showToast(`Signed deal with ${email.fromName} (${reqRoyalty}% · +${formatMoney(reqAdvance)})!`);
    } else if (email.actionType === 'brand_deal' || email.actionType === 'festival_invite') {
      const reward = Number(email.actionPayload?.reward || 25000);
      const energyCost = Number(email.actionPayload?.energy || 8);
      const popGain = Number(email.actionPayload?.popGain || 2.5);
      if (state.energy < energyCost) {
        showToast(`Need ${energyCost}⚡ Energy to complete this booking.`);
        return;
      }
      synthAudio.playSfx('cash');
      updateState((prev) => ({
        ...prev,
        cash: prev.cash + reward,
        energy: prev.energy - energyCost,
        hype: Math.min(100, prev.hype + 8),
        popularity: Math.min(150, +(prev.popularity + popGain).toFixed(1)),
        emails: prev.emails.map((e) =>
          e.id === email.id ? { ...e, actionCompleted: true, read: true } : e
        ),
      }));
      showToast(
        `${email.actionType === 'festival_invite' ? 'Festival Headline Set' : 'Brand Deal'}: +${formatMoney(
          reward
        )}!`
      );
    } else if (email.actionType === 'reply_fan') {
      synthAudio.playSfx('tap');
      updateState((prev) => ({
        ...prev,
        popularity: Math.min(150, +(prev.popularity + 0.4).toFixed(1)),
        emails: prev.emails.map((e) =>
          e.id === email.id ? { ...e, actionCompleted: true, read: true } : e
        ),
      }));
      showToast('Replied to fan! (+0.4 Popularity)');
    }
  };

  const handleLoveAction = (
    action: 'date' | 'gift' | 'hire_publicist' | 'hire_manager' | 'remove',
    id?: string
  ) => {
    if (!state) return;

    if (action === 'hire_publicist') {
      updateState((prev) => ({
        ...prev,
        connections: [
          ...prev.connections,
          {
            id: `conn_${Date.now()}`,
            name: 'Marcus Cole',
            role: 'Publicist',
            initials: 'MC',
            color: '#3b82f6',
            weeklyCost: 600,
            loyalty: 80,
            perkText: 'Boosts press coverage & viral reach',
            isPartner: false,
          },
        ],
      }));
      showToast('Hired Publicist ($600/wk)');
      return;
    }

    if (action === 'hire_manager') {
      updateState((prev) => ({
        ...prev,
        connections: [
          ...prev.connections,
          {
            id: `conn_${Date.now()}`,
            name: 'Devon Mercer',
            role: 'Manager',
            initials: 'DM',
            color: '#10b981',
            weeklyCost: 1400,
            loyalty: 82,
            perkText: 'Boosts tour revenue & deal offers',
            isPartner: false,
          },
        ],
      }));
      showToast('Hired Manager ($1,400/wk)');
      return;
    }

    if (action === 'remove' && id) {
      updateState((prev) => ({
        ...prev,
        connections: prev.connections.filter((c) => c.id !== id),
      }));
      showToast('Connection ended.');
      return;
    }

    if ((action === 'date' || action === 'gift') && id) {
      const cost = action === 'date' ? 500 : 2500;
      if (state.cash < cost) return;
      synthAudio.playSfx('tap');
      updateState((prev) => ({
        ...prev,
        cash: prev.cash - cost,
        energy: action === 'date' ? Math.max(0, prev.energy - 2) : prev.energy,
        hype: Math.min(100, prev.hype + 3),
        connections: prev.connections.map((c) =>
          c.id === id ? { ...c, loyalty: Math.min(100, c.loyalty + (action === 'gift' ? 15 : 8)) } : c
        ),
      }));
      showToast(action === 'gift' ? 'Sent luxury gift! (+15 Loyalty)' : 'Great date night! (+8 Loyalty)');
    }
  };

  if (!state || state.phase !== 'PLAYING') {
    return (
      <TitleAndCreator
        hasSavedCareer={Boolean(savedState)}
        savedArtistSummary={
          savedState ? `${savedState.artistName} · ${formatDateDot(savedState.date)}` : undefined
        }
        onContinueSaved={() => {
          if (savedState) {
            setState(savedState);
            setActiveTab('advance');
          }
        }}
        onLoadBiigMtPreset={(difficulty: DifficultyMode) => {
          const preset = createBiigMtPresetState(difficulty);
          setState(preset);
          setActiveTab('advance');
        }}
        onCreateNewCareer={(params) => {
          const fresh = createRookieCareerState(params);
          setState(fresh);
          setActiveTab('advance');
        }}
      />
    );
  }

  const unreadNotifications =
    state.emails.filter((e) => !e.read).length + state.notifications.filter((n) => n.unread).length;
  const nowPlayingSong = state.songs.find((s) => s.id === state.nowPlayingSongId) || null;

  return (
    <div className="min-h-dvh lg:h-dvh w-full media-centre-bg text-slate-100 flex flex-col overflow-x-hidden lg:overflow-hidden">
      {/* Floating Career Toast */}
      {toast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[70] px-4 py-2 rounded-full bg-emerald-400 text-slate-950 text-xs font-black shadow-2xl border border-emerald-200/70">
          {toast}
        </div>
      )}

      {/* Landscape Sports-Broadcast Top Header + 7-Tab Strip */}
      <TopHud
        state={state}
        activeTab={activeTab}
        unreadNotifications={unreadNotifications}
        onSelectTab={setActiveTab}
        onOpenPhone={() => {
          setActivePhoneApp('home');
          setPhoneOverlayOpen(true);
        }}
        onToggleMute={handleToggleMute}
      />

      {/* Main Active Screen */}
      {activeTab === 'advance' && (
        <AdvanceTimeHub
          state={state}
          headlineIdx={headlineIdx}
          onCycleHeadline={() => setHeadlineIdx((i) => i + 1)}
          onAdvanceTime={handleAdvanceTime}
          onQuickAction={handleQuickAction}
          onNavigateTab={setActiveTab}
          onOpenPhoneApp={(app) => {
            setActivePhoneApp(app);
            setPhoneOverlayOpen(true);
          }}
          onPlaySong={handlePlaySong}
        />
      )}

      {activeTab === 'studio' && (
        <StudioReleasesTab
          state={state}
          onRecordSong={handleRecordSong}
          onReleaseSong={handleReleaseSong}
          onReleaseAlbum={handleReleaseAlbum}
          onShootVideo={handleShootVideo}
          onUpgradeStudio={handleUpgradeStudio}
          onPlaySong={handlePlaySong}
          onPromoteSong={handlePromoteSong}
        />
      )}

      {activeTab === 'brand' && (
        <ArtistBrandTab
          state={state}
          onBuyCatalogItem={handleBuyCatalogItem}
          onEquipClothing={(itemId) => {
            updateState((prev) => ({
              ...prev,
              avatar: { ...prev.avatar, outfitId: itemId },
            }));
            showToast('Equipped wardrobe outfit!');
          }}
          onToggleJewelry={(itemId) => {
            updateState((prev) => {
              const has = prev.avatar.jewelryIds.includes(itemId);
              return {
                ...prev,
                avatar: {
                  ...prev.avatar,
                  jewelryIds: has
                    ? prev.avatar.jewelryIds.filter((j) => j !== itemId)
                    : [...prev.avatar.jewelryIds, itemId],
                },
              };
            });
          }}
          onUpdateAvatar={(patch: Partial<AvatarConfig>) => {
            updateState((prev) => ({
              ...prev,
              avatar: { ...prev.avatar, ...patch },
            }));
          }}
          onStartTour={handleStartTour}
          onLaunchMerch={handleLaunchMerch}
          onUpgradeMerchStore={handleUpgradeMerchStore}
          onQuickAction={handleQuickAction}
        />
      )}

      {activeTab === 'label' && (
        <LabelOfficeTab
          state={state}
          onNegotiateLabel={handleNegotiateLabel}
          onGoIndependent={handleGoIndependent}
          onFoundPlayerLabel={handleFoundPlayerLabel}
          onSignNpcToPlayerLabel={handleSignNpcToPlayerLabel}
          onBoostLabelArtist={handleBoostLabelArtist}
        />
      )}

      {activeTab === 'charts' && (
        <ChartsDataTab
          state={state}
          onPlaySong={handlePlaySong}
          onBefriendNpc={(npcId) => handleQuickAction('befriend_npc', { npcId })}
          onStartBeef={(npcId) => handleQuickAction('start_beef', { npcId })}
        />
      )}

      {activeTab === 'trophies' && <TrophyRoomTab state={state} />}

      {activeTab === 'system' && (
        <SystemTab
          state={state}
          onToggleMute={handleToggleMute}
          onResetCareer={() => {
            synthAudio.stopSong();
            setState(null);
          }}
          onImportState={(next) => {
            setState(hydrateLoadedState(next));
            setActiveTab('advance');
          }}
          onNotify={showToast}
        />
      )}

      {/* Bottom Breaking News Ticker & Mini Synth Player */}
      <BottomNewsTicker
        state={state}
        nowPlayingSong={nowPlayingSong}
        onPlaySong={handlePlaySong}
        onNextStory={() => setHeadlineIdx((i) => i + 1)}
      />

      {/* Phone Overlay Sub-Menu (Chirper, Messages, Streaming, Dating & Alerts) */}
      <PhoneOverlay
        open={phoneOverlayOpen}
        state={state}
        activeApp={activePhoneApp}
        onSelectApp={setActivePhoneApp}
        onClose={() => setPhoneOverlayOpen(false)}
        onPlaySong={handlePlaySong}
        onPromoteSong={handlePromoteSong}
        onBuyAmazonePerk={(title, cost, energyBoost, popBoost) => {
          if (state.cash < cost) return;
          synthAudio.playSfx('cash');
          updateState((prev) => ({
            ...prev,
            cash: prev.cash - cost,
            energy: Math.min(prev.maxEnergy, prev.energy + energyBoost),
            popularity: Math.min(150, +(prev.popularity + popBoost).toFixed(1)),
          }));
          showToast(`Delivered ${title}!`);
        }}
        onReadEmail={(id) =>
          setState((prev) =>
            prev
              ? {
                  ...prev,
                  emails: prev.emails.map((e) => (e.id === id ? { ...e, read: true } : e)),
                }
              : prev
          )
        }
        onEmailAction={handleEmailAction}
        onCreatePost={handleCreatePost}
        onLikePost={(postId) =>
          setState((prev) =>
            prev
              ? {
                  ...prev,
                  posts: prev.posts.map((p) =>
                    p.id === postId
                      ? {
                          ...p,
                          likedByPlayer: !p.likedByPlayer,
                          likes: p.likedByPlayer ? p.likes - 1 : p.likes + 1,
                        }
                      : p
                  ),
                }
              : prev
          )
        }
        onBefriendNpc={(npcId) => handleQuickAction('befriend_npc', { npcId })}
        onStartBeef={(npcId) => handleQuickAction('start_beef', { npcId })}
        onMatchLinkup={(profileId, accepted) => {
          const prof = state.linkupPool.find((p) => p.id === profileId);
          updateState((prev) => ({
            ...prev,
            linkupPool: prev.linkupPool.map((p) =>
              p.id === profileId ? { ...p, matched: true } : p
            ),
            connections:
              accepted && prof
                ? [
                    ...prev.connections,
                    {
                      id: `conn_lu_${Date.now()}`,
                      name: prof.name,
                      role: 'Partner',
                      initials: prof.initials,
                      color: prof.color,
                      weeklyCost: 1200,
                      loyalty: 75,
                      perkText: `${prof.role} · +2 Energy/day`,
                      isPartner: true,
                    },
                  ]
                : prev.connections,
          }));
          if (accepted && prof) showToast(`Matched with ${prof.name}!`);
        }}
        onChangePhoneSettings={(wp) =>
          setState((prev) => (prev ? { ...prev, phoneWallpaper: wp } : prev))
        }
        onLoveAction={handleLoveAction}
        onMarkNotificationsRead={() =>
          setState((prev) =>
            prev
              ? {
                  ...prev,
                  notifications: prev.notifications.map((n) => ({ ...n, unread: false })),
                }
              : prev
          )
        }
      />
    </div>
  );
}
