import React, { useEffect, useState } from 'react';
import { Pause, Play, Radio, X } from 'lucide-react';
import { synthAudio } from './audio/synthEngine';
import { ArtistAvatar } from './components/ArtistAvatar';
import { BottomDock } from './components/BottomDock';
import { SmartphoneOS } from './components/phone/SmartphoneOS';
import { HomeTab } from './components/tabs/HomeTab';
import { LoveTab } from './components/tabs/LoveTab';
import { MusicTab } from './components/tabs/MusicTab';
import { PhoneHubTab } from './components/tabs/PhoneHubTab';
import { SettingsTab } from './components/tabs/SettingsTab';
import { StudioTab } from './components/tabs/StudioTab';
import { WorldTab } from './components/tabs/WorldTab';
import { TitleAndCreator } from './components/TitleAndCreator';
import { TopHud } from './components/TopHud';
import {
  COVER_ARTS,
  RECORD_LABELS,
  STUDIO_LEVELS,
  createBiigMtPresetState,
  createRookieCareerState,
} from './data/gameCatalog';
import {
  advanceGameTime,
  computeNetWorth,
  formatCompactNumber,
  formatDateDot,
  formatMoney,
} from './engine/simulation';
import {
  Album,
  AvatarConfig,
  CatalogItem,
  EmailMessage,
  GameState,
  MainTab,
  MusicGenre,
  PhoneAppId,
  SocialPost,
  Song,
  SongMood,
} from './types/game';

const AUTOSAVE_KEY = 'rockstar_autosave_v1';

export default function App() {
  const [savedState, setSavedState] = useState<GameState | null>(() => {
    try {
      const raw = localStorage.getItem(AUTOSAVE_KEY);
      return raw ? (JSON.parse(raw) as GameState) : null;
    } catch {
      return null;
    }
  });

  const [state, setState] = useState<GameState | null>(null);
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [mobilePhoneOpen, setMobilePhoneOpen] = useState(false);
  const [activePhoneApp, setActivePhoneApp] = useState<PhoneAppId>('home');
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [beatStep, setBeatStep] = useState(0);

  const showToast = (msg: string) => {
    setToast(msg);
  };

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
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

  const updateState = (updater: (prev: GameState) => GameState) => {
    setState((prev) => (prev ? updater(prev) : prev));
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
      updateState((prev) => ({ ...prev, isAudioPlaying: false }));
      return;
    }

    if (state.muted) {
      synthAudio.setMuted(false);
    }

    synthAudio.startSong(
      { bpm: song.bpm, genre: song.genre, mood: song.mood, seed: song.seed },
      (step) => setBeatStep(step % 16)
    );

    updateState((prev) => ({
      ...prev,
      muted: false,
      nowPlayingSongId: songId,
      isAudioPlaying: true,
    }));
  };

  const handleAdvanceTime = (step: 'day' | 'week' | 'month') => {
    synthAudio.playSfx('advance');
    updateState((prev) => advanceGameTime(prev, step));
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
        updateState((prev) => {
          const next = {
            ...prev,
            cash: prev.cash + reward,
            energy: prev.energy - energyCost,
            popularity: Math.min(150, +(prev.popularity + 0.8).toFixed(1)),
          };
          next.netWorth = computeNetWorth(next);
          return next;
        });
        showToast(`${title}: +${formatMoney(reward)}`);
        break;
      }

      case 'record_guest_verse': {
        const npcName = String(payload?.npcName || 'Artist');
        const payout = Number(payload?.payout || 5000);
        if (state.energy < 4) return;
        synthAudio.playSfx('record');
        updateState((prev) => {
          const next = {
            ...prev,
            cash: prev.cash + payout,
            energy: prev.energy - 4,
            popularity: Math.min(150, +(prev.popularity + 1.2).toFixed(1)),
          };
          next.netWorth = computeNetWorth(next);
          return next;
        });
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
          const next = {
            ...prev,
            cash: prev.cash + pay,
            energy: prev.energy - 5,
            producerDelivered: delivered,
            producerRank: rank,
          };
          next.netWorth = computeNetWorth(next);
          return next;
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
          const next = {
            ...prev,
            cash: prev.cash + pay,
            energy: prev.energy - 6,
            actorCredits: credits,
            actorRank: rank,
            popularity: Math.min(150, +(prev.popularity + 1.5).toFixed(1)),
          };
          next.netWorth = computeNetWorth(next);
          return next;
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
        }));
        showToast('Vocal session complete (+1.4 Popularity)');
        break;
      }

      case 'press_run': {
        if (state.energy < 6) return;
        synthAudio.playSfx('notification');
        updateState((prev) => ({
          ...prev,
          energy: prev.energy - 6,
          popularity: Math.min(150, +(prev.popularity + 2.8).toFixed(1)),
          socialFollowers: {
            ...prev.socialFollowers,
            youtube: prev.socialFollowers.youtube + 5500,
            instaglam: prev.socialFollowers.instaglam + 9500,
            x: prev.socialFollowers.x + 4200,
          },
        }));
        showToast('Radio interview aired! +19K new followers');
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
        showToast('Workout complete (+6 ⚡)');
        break;
      }

      case 'befriend_npc': {
        const npcId = String(payload?.npcId || '');
        synthAudio.playSfx('tap');
        updateState((prev) => ({
          ...prev,
          npcs: prev.npcs.map((n) =>
            n.id === npcId
              ? {
                  ...n,
                  relationshipScore: Math.min(100, n.relationshipScore + 20),
                  relationship:
                    n.relationshipScore + 20 >= 50 ? 'friend' : n.relationship,
                }
              : n
          ),
        }));
        showToast('Built industry rapport with artist!');
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
        showToast('Legal team cleared your heat.');
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
    featuredArtistId?: string;
    releaseImmediately: boolean;
  }) => {
    if (!state || state.energy < 5) return;
    const featNpc = state.npcs.find((n) => n.id === payload.featuredArtistId);
    const featCost = featNpc
      ? featNpc.relationship === 'friend'
        ? Math.round(featNpc.featFee * 0.4)
        : featNpc.featFee
      : 0;

    if (state.cash < featCost) return;

    const baseQuality = 48 + state.studio.rating * 3.8 + Math.min(12, state.fameLevel * 1.1);
    const quality = Math.min(99, Math.max(35, Math.round(baseQuality + (Math.random() * 14 - 5))));

    const initialStreams = payload.releaseImmediately
      ? Math.round((1800 + state.fameLevel * 14000 + state.popularity * 1200) * (quality / 65))
      : 0;

    const newSong: Song = {
      id: `song_${Date.now()}`,
      title: payload.title,
      genre: payload.genre,
      mood: payload.mood,
      bpm: payload.bpm,
      coverUrl: payload.coverUrl,
      quality,
      featuredArtistId: featNpc?.id,
      featuredArtistName: featNpc?.name,
      producerName: state.artistName,
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
      viralScore: payload.releaseImmediately ? Math.min(60, Math.round(quality * 0.45)) : 0,
      playlistReach: payload.releaseImmediately ? 20 : 0,
      radioPush: 0,
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
              headline: `${prev.artistName} (${payload.genre}) releases "${payload.title}"${featNpc ? ` featuring ${featNpc.name}` : ''}.`,
              content: `${prev.artistName} (${payload.genre}) drops new single "${payload.title}"${featNpc ? ` ft. ${featNpc.name}` : ''}.`,
              likes: 120 + prev.fameLevel * 420,
              comments: 24 + prev.fameLevel * 35,
              shares: 38 + prev.fameLevel * 60,
              timeAgo: 'Just now',
              commentsList: [],
            },
          ]
        : [];

      const next: GameState = {
        ...prev,
        cash: prev.cash - featCost,
        energy: prev.energy - 5,
        songs: [...prev.songs, newSong],
        posts: [...newsPost, ...prev.posts],
        popularity: payload.releaseImmediately
          ? Math.min(150, +(prev.popularity + 2.2).toFixed(1))
          : prev.popularity,
        careerStats: {
          ...prev.careerStats,
          songsReleased: prev.careerStats.songsReleased + (payload.releaseImmediately ? 1 : 0),
          totalStreams: prev.careerStats.totalStreams + initialStreams,
        },
      };
      next.netWorth = computeNetWorth(next);
      return next;
    });

    showToast(
      payload.releaseImmediately
        ? `Dropped "${payload.title}" (Quality ${quality})!`
        : `Saved "${payload.title}" (Quality ${quality}) to Vault.`
    );
  };

  const handleReleaseSong = (songId: string) => {
    if (!state) return;
    synthAudio.playSfx('chart_hit');
    updateState((prev) => ({
      ...prev,
      songs: prev.songs.map((s) =>
        s.id === songId
          ? {
              ...s,
              released: true,
              releaseDate: { ...prev.date },
              releaseYear: prev.date.year,
              weeklyStreams: Math.round(4500 + prev.fameLevel * 12000),
              totalStreams: Math.round(4500 + prev.fameLevel * 12000),
            }
          : s
      ),
      careerStats: {
        ...prev.careerStats,
        songsReleased: prev.careerStats.songsReleased + 1,
      },
    }));
    showToast('Single released to Soundify & Pear Music!');
  };

  const handleReleaseAlbum = (payload: {
    title: string;
    type: 'ALBUM' | 'EP' | 'MIXTAPE' | 'COLLAB';
    coverUrl: string;
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
            weeklyStreams: Math.max(s.weeklyStreams, 8500 + state.fameLevel * 18000),
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
      songIds: payload.songIds,
      collabArtistId: collab?.id,
      collabArtistName: collab?.name,
      released: true,
      releaseDate: { ...state.date },
      releaseYear: state.date.year,
      totalStreams,
      weeklyStreams,
      firstWeekUnits: Math.round(weeklyStreams / 1500),
      peakChartPos: null,
      currentChartPos: null,
      weeksOnChart: 1,
    };

    synthAudio.playSfx('chart_hit');

    updateState((prev) => ({
      ...prev,
      cash: prev.cash - cost,
      songs: updatedSongs,
      albums: [...prev.albums, newAlbum],
      popularity: Math.min(150, +(prev.popularity + 5.5).toFixed(1)),
      contract: prev.contract
        ? {
            ...prev.contract,
            albumsDelivered: prev.contract.albumsDelivered + 1,
          }
        : null,
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
      popularity: Math.min(150, +(prev.popularity + 3.2).toFixed(1)),
      songs: prev.songs.map((s) =>
        s.id === payload.songId
          ? {
              ...s,
              hasVideo: true,
              videoViews: viewsGain,
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
          content: `Official video out now!`,
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
    if (!next || state.cash < state.studio.upgradeCost) return;
    synthAudio.playSfx('cash');
    updateState((prev) => ({
      ...prev,
      cash: prev.cash - prev.studio.upgradeCost,
      studio: { ...next },
    }));
    showToast(`Upgraded studio to ${next.name} (${next.rating})!`);
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
      songs: prev.songs.map((s) =>
        s.id === songId
          ? {
              ...s,
              playlistReach: channel === 'playlist' ? Math.min(100, s.playlistReach + 22) : s.playlistReach,
              radioPush: channel === 'radio' ? Math.min(100, s.radioPush + 25) : s.radioPush,
              viralScore: channel === 'viral' ? Math.min(100, s.viralScore + 30) : s.viralScore,
              weeklyStreams: Math.round(s.weeklyStreams * 1.25 + 35000),
            }
          : s
      ),
    }));
    showToast(`Launched ${channel} campaign!`);
  };

  const handleBuyCatalogItem = (item: CatalogItem) => {
    if (!state || state.cash < item.price) return;
    synthAudio.playSfx('cash');
    updateState((prev) => {
      const next: GameState = {
        ...prev,
        cash: prev.cash - item.price,
        statusPoints: prev.statusPoints + item.statusGain,
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
      };
      next.netWorth = computeNetWorth(next);
      return next;
    });
    showToast(`Purchased ${item.name}!`);
  };

  const handleSignLabel = (labelId: string) => {
    if (!state) return;
    const label = RECORD_LABELS.find((l) => l.id === labelId);
    if (!label) return;
    synthAudio.playSfx('chart_hit');

    if (label.id === 'independent') {
      updateState((prev) => ({ ...prev, contract: null }));
      showToast('Returned to Independent status (100% royalties).');
      return;
    }

    updateState((prev) => {
      const next: GameState = {
        ...prev,
        cash: prev.cash + label.advance,
        contract: {
          labelId: label.id,
          labelName: label.name,
          royaltyPercent: label.royaltyPercent,
          albumsRequired: label.albumsRequired,
          albumsDelivered: 0,
          promoBonus: label.promoBonus,
          advancePaid: label.advance,
        },
      };
      next.netWorth = computeNetWorth(next);
      return next;
    });
    showToast(`Signed with ${label.name} (+${formatMoney(label.advance)} advance)!`);
  };

  const handleCreatePost = (
    platform: 'fakebook' | 'x' | 'instaglam' | 'tictok' | 'youtube',
    content: string,
    extra?: { imageUrl?: string; songId?: string; headline?: string }
  ) => {
    if (!state) return;
    synthAudio.playSfx('notification');

    const likes = Math.round(40 + state.fameLevel * 1800 + Math.random() * 900);
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

    const followerBump = Math.round(120 + state.fameLevel * 650);

    updateState((prev) => ({
      ...prev,
      posts: [newPost, ...prev.posts],
      popularity: Math.min(150, +(prev.popularity + 0.5).toFixed(1)),
      songs:
        platform === 'tictok' && song
          ? prev.songs.map((s) =>
              s.id === song.id
                ? {
                    ...s,
                    viralScore: Math.min(100, s.viralScore + 14),
                    weeklyStreams: s.weeklyStreams + Math.round(followerBump * 18),
                  }
                : s
            )
          : prev.songs,
      socialFollowers: {
        ...prev.socialFollowers,
        [platform]: prev.socialFollowers[platform] + followerBump,
      },
    }));

    showToast(`Posted on ${platform.toUpperCase()} (+${formatCompactNumber(followerBump)} reach)`);
  };

  const handleEmailAction = (email: EmailMessage) => {
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
      showToast(`Collab "${title}" saved to Studio > Songs!`);
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
        connections: prev.connections.map((c) =>
          c.id === id ? { ...c, loyalty: Math.min(100, c.loyalty + (action === 'gift' ? 15 : 8)) } : c
        ),
      }));
      showToast(action === 'gift' ? 'Sent luxury gift! (+15 Loyalty)' : 'Great hangout! (+8 Loyalty)');
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
          if (savedState) setState(savedState);
        }}
        onLoadBiigMtPreset={() => {
          const preset = createBiigMtPresetState();
          setState(preset);
          setActiveTab('home');
        }}
        onCreateNewCareer={(params) => {
          const fresh = createRookieCareerState(params);
          setState(fresh);
          setActiveTab('home');
        }}
      />
    );
  }

  const unreadCount = state.emails.filter((e) => !e.read).length;
  const nowPlayingSong = state.songs.find((s) => s.id === state.nowPlayingSongId) || null;

  return (
    <div className="min-h-dvh w-full bg-[#090a0d] text-zinc-100 flex flex-col lg:items-center lg:justify-center lg:p-5">
      {/* Toast Feedback */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-xl bg-amber-400 text-zinc-950 text-xs font-extrabold shadow-2xl border border-amber-300">
          {toast}
        </div>
      )}

      {/* Main Responsive Stage */}
      <div className="w-full max-w-[440px] mx-auto lg:max-w-[1060px] h-dvh lg:h-[820px] lg:max-h-[92vh] grid grid-cols-1 lg:grid-cols-[430px_1fr] lg:gap-5">
        {/* LEFT COLUMN: ROCKSTAR CONSOLE */}
        <div className="h-full min-h-0 console-surface lg:rounded-[26px] lg:border lg:border-white/[0.08] lg:shadow-[0_24px_60px_rgba(0,0,0,0.75)] flex flex-col overflow-hidden">
          {mobilePhoneOpen ? (
            <div className="lg:hidden h-full flex flex-col">
              <SmartphoneOS
                state={state}
                activeApp={activePhoneApp}
                onSelectApp={setActivePhoneApp}
                onClosePhone={() => {
                  setMobilePhoneOpen(false);
                  setActivePhoneApp('home');
                }}
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
                  updateState((prev) => ({
                    ...prev,
                    emails: prev.emails.map((e) => (e.id === id ? { ...e, read: true } : e)),
                  }))
                }
                onEmailAction={handleEmailAction}
                onCreatePost={handleCreatePost}
                onLikePost={(postId) =>
                  updateState((prev) => ({
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
                  }))
                }
                onBefriendNpc={(npcId) => handleQuickAction('befriend_npc', { npcId })}
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
                              perkText: `${prof.role} · +2 Energy/wk`,
                              isPartner: true,
                            },
                          ]
                        : prev.connections,
                  }));
                  if (accepted && prof) showToast(`Matched with ${prof.name}!`);
                }}
                onChangePhoneSettings={(wp) =>
                  updateState((prev) => ({ ...prev, phoneWallpaper: wp }))
                }
              />
            </div>
          ) : null}

          <div className={`${mobilePhoneOpen ? 'hidden lg:flex' : 'flex'} flex-col h-full min-h-0`}>
            <TopHud
              date={state.date}
              energy={state.energy}
              cash={state.cash}
              activeTab={activeTab}
              muted={state.muted}
              onToggleMute={handleToggleMute}
            />

            {activeTab === 'home' && (
              <HomeTab
                state={state}
                onAdvanceTime={handleAdvanceTime}
                onOpenAvatarEditor={() => setAvatarModalOpen(true)}
                onQuickAction={handleQuickAction}
                onOpenPhoneApp={(app) => {
                  setActivePhoneApp(app);
                  setMobilePhoneOpen(true);
                }}
              />
            )}

            {activeTab === 'music' && (
              <MusicTab
                state={state}
                onPlaySong={handlePlaySong}
                onPromoteSong={handlePromoteSong}
              />
            )}

            {activeTab === 'studio' && (
              <StudioTab
                state={state}
                onRecordSong={handleRecordSong}
                onReleaseSong={handleReleaseSong}
                onReleaseAlbum={handleReleaseAlbum}
                onShootVideo={handleShootVideo}
                onUpgradeStudio={handleUpgradeStudio}
              />
            )}

            {activeTab === 'world' && (
              <WorldTab
                state={state}
                onBuyCatalogItem={handleBuyCatalogItem}
                onEquipClothing={(itemId) => {
                  updateState((prev) => ({
                    ...prev,
                    avatar: { ...prev.avatar, outfitId: itemId },
                  }));
                  showToast('Equipped outfit!');
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
                onSignLabel={handleSignLabel}
                onWorkJob={(title, pay, energy) => {
                  if (state.energy < energy) return;
                  synthAudio.playSfx('cash');
                  updateState((prev) => ({
                    ...prev,
                    cash: prev.cash + pay,
                    energy: prev.energy - energy,
                  }));
                  showToast(`${title}: +${formatMoney(pay)}`);
                }}
                onStartTour={(name, venueTier, citiesTotal, ticketPrice, upfront) => {
                  if (state.cash < upfront) return;
                  synthAudio.playSfx('chart_hit');
                  updateState((prev) => ({
                    ...prev,
                    cash: prev.cash - upfront,
                    activeTour: {
                      active: true,
                      name,
                      venueTier,
                      citiesTotal,
                      citiesCompleted: 0,
                      ticketPrice,
                      revenueEarned: 0,
                    },
                  }));
                  showToast(`Booked ${name} (${citiesTotal} cities)!`);
                }}
              />
            )}

            {activeTab === 'phone' && (
              <PhoneHubTab
                state={state}
                onOpenPhone={() => {
                  setActivePhoneApp('home');
                  setMobilePhoneOpen(true);
                }}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsTab
                state={state}
                onToggleMute={handleToggleMute}
                onSaveSlot={(slot) => {
                  localStorage.setItem(`rockstar_slot_${slot}`, JSON.stringify(state));
                }}
                onLoadSlot={(slot) => {
                  const raw = localStorage.getItem(`rockstar_slot_${slot}`);
                  if (raw) setState(JSON.parse(raw) as GameState);
                }}
                onNewCareer={() => {
                  synthAudio.stopSong();
                  setState(null);
                }}
                onLoadPreset={() => {
                  synthAudio.stopSong();
                  setState(createBiigMtPresetState());
                  setActiveTab('home');
                }}
                onImportState={(json) => {
                  try {
                    const parsed = JSON.parse(json) as GameState;
                    if (!parsed.artistName || !parsed.date) return false;
                    setState(parsed);
                    return true;
                  } catch {
                    return false;
                  }
                }}
              />
            )}

            {activeTab === 'love' && (
              <LoveTab
                state={state}
                onLoveAction={handleLoveAction}
                onOpenLinkup={() => {
                  setActivePhoneApp('linkup');
                  setMobilePhoneOpen(true);
                }}
              />
            )}

            <BottomDock
              activeTab={activeTab}
              onSelectTab={(tab) => {
                synthAudio.playSfx('tap');
                setActiveTab(tab);
              }}
              unreadBadgeCount={unreadCount}
            />
          </div>
        </div>

        {/* RIGHT COLUMN (Desktop >= 1024px): Live Smartphone + Audio Beat Deck */}
        <div className="hidden lg:flex flex-col h-full min-h-0 bg-[#0e1015] rounded-[26px] border border-white/[0.08] shadow-[0_24px_60px_rgba(0,0,0,0.75)] overflow-hidden">
          {/* Top Audio Synth Monitor */}
          <div className="px-5 py-3 border-b border-white/[0.06] bg-[#14161c] flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {nowPlayingSong ? (
                <>
                  <img
                    src={nowPlayingSong.coverUrl}
                    alt={nowPlayingSong.title}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-lg object-cover shrink-0 border border-white/10"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold text-white truncate">
                      {nowPlayingSong.title}
                    </div>
                    <div className="font-mono-num text-[11px] text-zinc-400 truncate">
                      {nowPlayingSong.genre} · {nowPlayingSong.bpm} BPM · {nowPlayingSong.mood}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Radio className="w-4 h-4 text-amber-400" />
                  <span>Select any song in Catalog or Soundify to preview beat synth</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {nowPlayingSong && (
                <>
                  {/* 8-bar beat step visualizer */}
                  <div className="flex items-end gap-0.5 h-5">
                    {Array.from({ length: 8 }, (_, i) => {
                      const active = state.isAudioPlaying && beatStep % 8 === i;
                      return (
                        <span
                          key={i}
                          className={`w-1 rounded-full snap-transition ${
                            active ? 'h-5 bg-amber-400' : state.isAudioPlaying ? 'h-2.5 bg-amber-400/40' : 'h-1.5 bg-zinc-700'
                          }`}
                        />
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePlaySong(nowPlayingSong.id)}
                    className="w-9 h-9 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 flex items-center justify-center"
                  >
                    {state.isAudioPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Live Synced Smartphone OS */}
          <div className="flex-1 min-h-0">
            <SmartphoneOS
              state={state}
              activeApp={activePhoneApp}
              onSelectApp={setActivePhoneApp}
              showTopHeader={false}
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
                updateState((prev) => ({
                  ...prev,
                  emails: prev.emails.map((e) => (e.id === id ? { ...e, read: true } : e)),
                }))
              }
              onEmailAction={handleEmailAction}
              onCreatePost={handleCreatePost}
              onLikePost={(postId) =>
                updateState((prev) => ({
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
                }))
              }
              onBefriendNpc={(npcId) => handleQuickAction('befriend_npc', { npcId })}
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
                            perkText: `${prof.role} · +2 Energy/wk`,
                            isPartner: true,
                          },
                        ]
                      : prev.connections,
                }));
                if (accepted && prof) showToast(`Matched with ${prof.name}!`);
              }}
              onChangePhoneSettings={(wp) =>
                updateState((prev) => ({ ...prev, phoneWallpaper: wp }))
              }
            />
          </div>
        </div>
      </div>

      {/* Quick Avatar Look Editor Modal */}
      {avatarModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#14161c] border border-white/10 rounded-2xl p-4 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-extrabold text-white">Customize Look</h3>
              <button
                type="button"
                onClick={() => setAvatarModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex justify-center bg-[#0e1015] border border-white/[0.06] rounded-xl py-2">
              <ArtistAvatar avatar={state.avatar} size={140} />
            </div>
            <div className="space-y-2.5 text-xs">
              <div>
                <div className="text-zinc-400 font-bold mb-1">Hairstyle</div>
                <div className="flex flex-wrap gap-1.5">
                  {(['bald', 'buzz', 'waves', 'dreads', 'curly', 'afro', 'spiky', 'long'] as const).map(
                    (hs) => (
                      <button
                        key={hs}
                        type="button"
                        onClick={() =>
                          updateState((prev) => ({
                            ...prev,
                            avatar: { ...prev.avatar, hairStyle: hs },
                          }))
                        }
                        className={`px-2.5 py-1 rounded-lg capitalize font-semibold ${
                          state.avatar.hairStyle === hs
                            ? 'bg-amber-400 text-zinc-950 font-bold'
                            : 'bg-[#1a1d26] text-zinc-300'
                        }`}
                      >
                        {hs}
                      </button>
                    )
                  )}
                </div>
              </div>
              <div>
                <div className="text-zinc-400 font-bold mb-1">Eyewear</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['none', 'shades', 'round', 'designer'] as AvatarConfig['eyewear'][]).map(
                    (ew) => (
                      <button
                        key={ew}
                        type="button"
                        onClick={() =>
                          updateState((prev) => ({
                            ...prev,
                            avatar: { ...prev.avatar, eyewear: ew },
                          }))
                        }
                        className={`py-1.5 rounded-lg capitalize font-semibold ${
                          state.avatar.eyewear === ew
                            ? 'bg-amber-400 text-zinc-950 font-bold'
                            : 'bg-[#1a1d26] text-zinc-300'
                        }`}
                      >
                        {ew}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
