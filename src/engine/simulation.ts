import {
  ACHIEVEMENTS_CATALOG,
  CLOTHES_CATALOG,
  COVER_ARTS,
  DIFFICULTY_CONFIGS,
  FACTORIES_CATALOG,
  JEWELRY_CATALOG,
  MONTH_NAMES,
  REAL_ESTATE_CATALOG,
  RECORD_LABELS,
  VEHICLES_CATALOG,
} from '../data/gameCatalog';
import {
  AwardRecord,
  ChartRegion,
  CustomCoverConfig,
  EmailMessage,
  GameDate,
  GameState,
  MusicGenre,
  NotificationItem,
  PlaqueRecord,
  PlaqueTier,
  SocialPost,
  Song,
} from '../types/game';

export interface ChartEntry {
  rank: number;
  songId: string;
  title: string;
  artistLine: string;
  coverUrl: string;
  customCover?: CustomCoverConfig;
  weeklyStreams: number;
  totalStreams: number;
  peak: number;
  weeksOnChart: number;
  isPlayer: boolean;
  genre?: MusicGenre;
}

export interface CertificationBadge {
  label: PlaqueTier;
  shortLabel: string;
  units: number;
  colorClass: string;
}

export interface AchievementPerksSummary {
  streamMult: number;
  maxEnergyBonus: number;
  feeDiscount: number;
  tourMult: number;
  merchMult: number;
  viralMult: number;
}

export function getAchievementPerks(unlockedIds: string[]): AchievementPerksSummary {
  const unlocked = new Set(unlockedIds);
  let streamMult = 1.0;
  let maxEnergyBonus = 0;
  let feeDiscount = 0;
  let tourMult = 1.0;
  let merchMult = 1.0;
  let viralMult = 1.0;

  for (const ach of ACHIEVEMENTS_CATALOG) {
    if (!unlocked.has(ach.id)) continue;
    if (ach.perkType === 'streams') streamMult += ach.perkValue;
    if (ach.perkType === 'energy') maxEnergyBonus += ach.perkValue;
    if (ach.perkType === 'fees') feeDiscount += ach.perkValue;
    if (ach.perkType === 'tour') tourMult += ach.perkValue;
    if (ach.perkType === 'merch') merchMult += ach.perkValue;
    if (ach.perkType === 'viral') viralMult += ach.perkValue;
  }

  return {
    streamMult: +streamMult.toFixed(2),
    maxEnergyBonus,
    feeDiscount: Math.min(0.4, +feeDiscount.toFixed(2)),
    tourMult: +tourMult.toFixed(2),
    merchMult: +merchMult.toFixed(2),
    viralMult: +viralMult.toFixed(2),
  };
}

export function getLifestyleBonuses(state: GameState): {
  energyPerDay: number;
  hypePerWeek: number;
} {
  const ownedSet = new Set([...state.ownedRealEstate, ...state.ownedVehicles]);
  const allLifestyle = [...REAL_ESTATE_CATALOG, ...VEHICLES_CATALOG];
  let energyPerDay = 0;
  let hypePerWeek = 0;
  for (const item of allLifestyle) {
    if (ownedSet.has(item.id)) {
      energyPerDay += item.energyBonus || 0;
      hypePerWeek += item.hypeBonus || 0;
    }
  }
  const hasPartner = state.connections.some((c) => c.isPartner);
  if (hasPartner) energyPerDay += 2;
  return {
    energyPerDay: Math.min(35, energyPerDay),
    hypePerWeek: Math.min(25, hypePerWeek),
  };
}

export function getEffectiveMaxEnergy(state: GameState): number {
  const perks = getAchievementPerks(state.unlockedAchievements || []);
  return 100 + perks.maxEnergyBonus;
}

export function formatMoney(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 10_000) return `${sign}$${Math.round(abs / 1000)}K`;
  return `${sign}$${Math.round(abs).toLocaleString()}`;
}

export function formatCompactNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 100_000 ? 0 : 1)}K`;
  return n.toLocaleString();
}

export function formatDateDot(d: GameDate): string {
  return `${d.day}.${d.month}.${d.year}`;
}

export function formatDateMonthYear(d: GameDate): { month: string; year: number } {
  return {
    month: MONTH_NAMES[(d.month - 1) % 12],
    year: d.year,
  };
}

/**
 * 12 streams = 1 equivalent sales unit for crisp career pacing:
 * Gold = 500,000 units (6M streams)
 * Platinum = 1,000,000 units (12M streams)
 * Multi-Platinum = 2,000,000+ units (24M+ streams)
 * Diamond = 10,000,000 units (120M streams)
 */
export function computeUnitsSold(totalStreams: number): number {
  return Math.floor(totalStreams / 12);
}

export function getCertificationLabel(totalStreams: number): CertificationBadge | null {
  const units = computeUnitsSold(totalStreams);
  if (units >= 10_000_000) {
    return {
      label: 'Diamond',
      shortLabel: 'DIAMOND',
      units,
      colorClass: 'bg-cyan-400/20 text-cyan-200 border-cyan-400/50',
    };
  }
  if (units >= 2_000_000) {
    const mult = Math.floor(units / 1_000_000);
    return {
      label: 'Multi-Platinum',
      shortLabel: `${mult}x PLAT`,
      units,
      colorClass: 'bg-slate-200/20 text-white border-slate-300/45',
    };
  }
  if (units >= 1_000_000) {
    return {
      label: 'Platinum',
      shortLabel: 'PLATINUM',
      units,
      colorClass: 'bg-zinc-200/20 text-zinc-100 border-zinc-300/40',
    };
  }
  if (units >= 500_000) {
    return {
      label: 'Gold',
      shortLabel: 'GOLD',
      units,
      colorClass: 'bg-amber-400/20 text-amber-300 border-amber-400/50',
    };
  }
  return null;
}

export function computeReputation(
  fameLevel: number,
  popularity: number,
  awardsCount: number
): GameState['reputation'] {
  const score = fameLevel * 8 + popularity * 0.4 + awardsCount * 10;
  if (score >= 135) return 'Icon';
  if (score >= 105) return 'Elite';
  if (score >= 75) return 'Star';
  if (score >= 50) return 'Respected';
  if (score >= 28) return 'Rising';
  return 'Underground';
}

export function computeNetWorth(state: GameState): number {
  const allItems = [
    ...VEHICLES_CATALOG,
    ...REAL_ESTATE_CATALOG,
    ...CLOTHES_CATALOG,
    ...JEWELRY_CATALOG,
    ...FACTORIES_CATALOG,
  ];
  const ownedIds = new Set([
    ...state.ownedVehicles,
    ...state.ownedRealEstate,
    ...state.ownedClothes,
    ...state.ownedJewelry,
    ...state.ownedFactories,
  ]);
  const assetsValue = allItems
    .filter((item) => ownedIds.has(item.id))
    .reduce((acc, item) => acc + item.price * 0.8, 0);

  const catalogValue = state.songs
    .filter((s) => s.released)
    .reduce((acc, s) => acc + s.weeklyStreams * 0.02, 0);

  const labelValuation = state.playerLabel
    ? 600000 + state.playerLabel.rosterIds.length * 450000
    : 0;

  return Math.round(state.cash + assetsValue + catalogValue + labelValuation);
}

const REGION_GENRE_AFFINITY: Record<ChartRegion, Partial<Record<MusicGenre, number>>> = {
  Global: {},
  'North America': {
    'Hip-Hop': 1.24,
    Trap: 1.26,
    'Melodic Rap': 1.22,
    Country: 1.4,
    'R&B': 1.18,
    Pop: 1.06,
    'Latin Trap': 1.18,
    Electronic: 0.85,
  },
  UK: {
    Drill: 1.42,
    Grime: 1.38,
    Afrobeats: 1.32,
    Amapiano: 1.24,
    Indie: 1.22,
    Electronic: 1.24,
    Pop: 1.12,
    'Hip-Hop': 1.04,
    Country: 0.62,
  },
  Europe: {
    Electronic: 1.4,
    House: 1.36,
    Techno: 1.38,
    Pop: 1.25,
    'K-Pop': 1.22,
    Reggaeton: 1.28,
    Rock: 1.16,
    Indie: 1.15,
    Country: 0.58,
  },
};

export function getRegionalHot100Songs(
  state: GameState,
  region: ChartRegion = 'Global'
): ChartEntry[] {
  const affinity = REGION_GENRE_AFFINITY[region] || {};

  const playerEntries: ChartEntry[] = state.songs
    .filter((s) => s.released)
    .map((s) => {
      const mult = affinity[s.genre] ?? 1.0;
      const regionalStreams = Math.round(s.weeklyStreams * mult);
      return {
        rank: 0,
        songId: s.id,
        title: s.title,
        artistLine: s.featuredArtistName
          ? `${state.artistName}, ${s.featuredArtistName}`
          : state.artistName,
        coverUrl: s.coverUrl,
        customCover: s.customCover,
        weeklyStreams: regionalStreams,
        totalStreams: s.totalStreams,
        peak: s.regionalPeaks?.[region] || s.peakChartPos || 100,
        weeksOnChart: s.weeksOnChart,
        isPlayer: true,
        genre: s.genre,
      };
    });

  const npcEntries: ChartEntry[] = state.npcSongs.map((ns, idx) => {
    const baseMult = affinity[ns.genre] ?? 1.0;
    const regionVariance =
      region === 'Global' ? 1.0 : 0.86 + ((idx * 17 + region.length * 13) % 28) / 100;
    return {
      rank: 0,
      songId: ns.id,
      title: ns.title,
      artistLine: ns.artistName,
      coverUrl: ns.coverUrl,
      weeklyStreams: Math.round(ns.weeklyStreams * baseMult * regionVariance),
      totalStreams: ns.totalStreams,
      peak: ns.peak,
      weeksOnChart: ns.weeksOnChart,
      isPlayer: false,
      genre: ns.genre,
    };
  });

  const combined = [...playerEntries, ...npcEntries].sort(
    (a, b) => b.weeklyStreams - a.weeklyStreams
  );

  return combined.slice(0, 100).map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
  }));
}

export function getHot100Songs(state: GameState): ChartEntry[] {
  return getRegionalHot100Songs(state, 'Global');
}

export function getHot200Albums(state: GameState): Array<{
  rank: number;
  albumId: string;
  title: string;
  artistLine: string;
  coverUrl: string;
  customCover?: CustomCoverConfig;
  weeklyStreams: number;
  totalStreams: number;
  isPlayer: boolean;
}> {
  const playerAlbums = state.albums
    .filter((a) => a.released)
    .map((a) => ({
      rank: 0,
      albumId: a.id,
      title: a.title,
      artistLine: a.collabArtistName
        ? `${state.artistName} & ${a.collabArtistName}`
        : state.artistName,
      coverUrl: a.coverUrl,
      customCover: a.customCover,
      weeklyStreams: a.weeklyStreams,
      totalStreams: a.totalStreams,
      isPlayer: true,
    }));

  const npcAlbums = state.npcs.slice(0, 8).map((npc, i) => ({
    rank: 0,
    albumId: `npc_alb_${npc.id}`,
    title: `${npc.signatureHit} (LP)`,
    artistLine: npc.name,
    coverUrl: state.npcSongs[i % state.npcSongs.length]?.coverUrl || COVER_ARTS[0].url,
    weeklyStreams: Math.round(npc.monthlyListeners * 0.62),
    totalStreams: Math.round(npc.monthlyListeners * 4.5),
    isPlayer: false,
  }));

  return [...playerAlbums, ...npcAlbums]
    .sort((a, b) => b.weeklyStreams - a.weeklyStreams)
    .map((a, idx) => ({ ...a, rank: idx + 1 }));
}

export function evaluatePlaquesAndCertifications(
  songs: Song[],
  albums: GameState['albums'],
  existingPlaques: PlaqueRecord[],
  dateStr: string
): { plaques: PlaqueRecord[]; newlyAwarded: PlaqueRecord[] } {
  const tiersOrder: PlaqueTier[] = ['Gold', 'Platinum', 'Multi-Platinum', 'Diamond'];
  const plaques = [...existingPlaques];
  const newlyAwarded: PlaqueRecord[] = [];

  const checkItem = (
    targetId: string,
    title: string,
    type: 'Single' | 'Album',
    totalStreams: number,
    coverUrl: string,
    customCover?: CustomCoverConfig
  ) => {
    const cert = getCertificationLabel(totalStreams);
    if (!cert) return;
    const targetTierIdx = tiersOrder.indexOf(cert.label);

    for (let i = 0; i <= targetTierIdx; i++) {
      const tier = tiersOrder[i];
      const alreadyHas = plaques.some((p) => p.targetId === targetId && p.tier === tier);
      if (!alreadyHas) {
        const plaque: PlaqueRecord = {
          id: `plq_${targetId}_${tier}_${Date.now()}`,
          targetId,
          title,
          type,
          tier,
          units: cert.units,
          dateStr,
          coverUrl,
          customCover,
        };
        plaques.unshift(plaque);
        newlyAwarded.push(plaque);
      }
    }
  };

  for (const s of songs) {
    if (s.released) {
      checkItem(s.id, s.title, 'Single', s.totalStreams, s.coverUrl, s.customCover);
    }
  }
  for (const a of albums) {
    if (a.released) {
      checkItem(a.id, a.title, 'Album', a.totalStreams, a.coverUrl, a.customCover);
    }
  }

  return { plaques, newlyAwarded };
}

export function evaluateAchievements(
  state: GameState,
  dateStr: string
): { unlockedAchievements: string[]; newlyUnlocked: string[]; notifications: NotificationItem[] } {
  const unlocked = new Set(state.unlockedAchievements || []);
  const newlyUnlocked: string[] = [];
  const notifications: NotificationItem[] = [];

  const totalMerchUnits = (state.merchItems || []).reduce((acc, m) => acc + m.unitsSold, 0);

  const checks: Array<[string, boolean]> = [
    ['ach_first_drop', state.careerStats.songsReleased >= 1 || state.songs.some((s) => s.released)],
    ['ach_hot100', state.careerStats.hot100Entries >= 1],
    ['ach_no1_hit', state.careerStats.numberOneHits >= 1],
    ['ach_gold_plaque', (state.plaques || []).some((p) => p.tier === 'Gold')],
    ['ach_platinum_plaque', (state.plaques || []).some((p) => p.tier === 'Platinum' || p.tier === 'Multi-Platinum')],
    ['ach_diamond_plaque', (state.plaques || []).some((p) => p.tier === 'Diamond')],
    ['ach_viral_wave', state.songs.some((s) => s.totalStreams >= 5_000_000)],
    ['ach_sold_out_arena', (state.careerStats.soldOutArenas || 0) >= 1],
    ['ach_merch_mogul', totalMerchUnits >= 10_000],
    ['ach_label_founder', Boolean(state.playerLabel)],
    ['ach_award_winner', state.careerStats.grammyAwards >= 1],
    ['ach_10m_worth', state.netWorth >= 10_000_000],
  ];

  for (const [id, met] of checks) {
    if (met && !unlocked.has(id)) {
      unlocked.add(id);
      newlyUnlocked.push(id);
      const def = ACHIEVEMENTS_CATALOG.find((a) => a.id === id);
      if (def) {
        notifications.push({
          id: `notif_ach_${id}_${Date.now()}`,
          title: `Achievement Unlocked: ${def.title}`,
          detail: `Permanent Perk Active: ${def.perkLabel}`,
          deltaText: 'PERK',
          dateStr,
          unread: true,
        });
      }
    }
  }

  return {
    unlockedAchievements: Array.from(unlocked),
    newlyUnlocked,
    notifications,
  };
}

function advanceCalendar(date: GameDate, days: number): { nextDate: GameDate; weeksPassed: number } {
  let { day, month, year, totalDays, totalWeeks } = date;
  const oldWeek = Math.floor((totalDays - 1) / 7);
  totalDays += days;
  const newWeek = Math.floor((totalDays - 1) / 7);
  const weeksPassed = newWeek - oldWeek;
  totalWeeks += weeksPassed;

  day += days;
  while (day > 30) {
    day -= 30;
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  return {
    nextDate: { day, month, year, totalDays, totalWeeks },
    weeksPassed,
  };
}

export function advanceGameTime(state: GameState, step: 'day' | 'week' | 'month'): GameState {
  const days = step === 'day' ? 1 : step === 'week' ? 7 : 30;
  const { nextDate, weeksPassed } = advanceCalendar(state.date, days);
  const dateStr = formatDateDot(nextDate);

  const difficulty = state.difficulty || 'Realistic';
  const diffCfg = DIFFICULTY_CONFIGS[difficulty];
  const perks = getAchievementPerks(state.unlockedAchievements || []);
  const lifestyle = getLifestyleBonuses(state);
  const effectiveMaxEnergy = 100 + perks.maxEnergyBonus;

  const skills = state.skills || {
    songwriting: 40,
    vocals: 40,
    production: 40,
    stagePresence: 40,
    marketing: 40,
  };
  const merchItems = state.merchItems || [];
  const awardsHistory = state.awardsHistory || [];
  const lastAwardYearProcessed = state.lastAwardYearProcessed ?? state.date.year - 1;

  let cash = state.cash;
  const dailyEnergyRec = 14 + lifestyle.energyPerDay;
  let energy = Math.min(
    effectiveMaxEnergy,
    state.energy + (step === 'day' ? dailyEnergyRec : step === 'week' ? 65 + lifestyle.energyPerDay * 3 : effectiveMaxEnergy)
  );
  let popularity = state.popularity;
  let fameLevel = state.fameLevel;
  let hype = Math.max(
    10,
    Math.min(
      100,
      Math.round(
        (state.hype ?? 50) * (step === 'day' ? 0.985 : step === 'week' ? diffCfg.hypeRetention : Math.pow(diffCfg.hypeRetention, 3)) +
          lifestyle.hypePerWeek * (weeksPassed > 0 ? weeksPassed : 0)
      )
    )
  );
  const inJailDays = Math.max(0, state.inJailDays - days);
  const heatLevel = Math.max(0, state.heatLevel - (step === 'day' ? 1 : step === 'week' ? 5 : 15));

  const newNotifications: NotificationItem[] = [];
  const newEmails: EmailMessage[] = [];
  const newPosts: SocialPost[] = [];

  // 1. Realistic Streaming Bell Curve + Decay + Marketing + Hype + Difficulty + Perks
  const promoMult = state.contract ? state.contract.promoBonus : 1.0;
  const skillStreamMult =
    1 + ((skills.songwriting + skills.production) * 0.0028 + skills.marketing * 0.0024);
  const hypeMult = 0.65 + (hype / 100) * 0.75;
  let totalPeriodStreams = 0;
  let highestWeekly = state.careerStats.highestWeeklyStreams;

  const updatedSongs: Song[] = state.songs.map((song) => {
    if (!song.released) return song;
    const ageWeeks = Math.max(1, (nextDate.totalDays - (song.releaseDate?.totalDays || 1)) / 7);
    // Peak during weeks 1-3, then realistic decay curve
    const peakArc = ageWeeks <= 2.5 ? 1 + (ageWeeks - 1) * 0.14 : Math.max(0.08, Math.pow(0.87, ageWeeks - 2.5));
    const qualityFactor = Math.pow(song.quality / 55, 2.25);
    const fameFactor = 1 + fameLevel * 0.45 + popularity * 0.04;
    const mktBoost = song.marketingBudget ? Math.min(0.65, Math.log10(song.marketingBudget + 10) * 0.11) : 0;
    const boostFactor =
      1 +
      mktBoost +
      song.viralScore * 0.025 +
      song.playlistReach * 0.016 +
      song.radioPush * 0.014 +
      (song.hasVideo ? 0.38 : 0) +
      (song.mood === 'Diss' ? 0.35 : 0);

    const baseDaily = Math.round(
      2900 *
        qualityFactor *
        fameFactor *
        boostFactor *
        promoMult *
        skillStreamMult *
        hypeMult *
        diffCfg.streamMult *
        perks.streamMult *
        peakArc *
        (0.88 + Math.random() * 0.24)
    );
    const periodStreams = baseDaily * days;
    totalPeriodStreams += periodStreams;

    const nextWeekly =
      step === 'day' ? Math.round(song.weeklyStreams * 0.88 + baseDaily) : Math.round(baseDaily * 7);

    if (nextWeekly > highestWeekly) highestWeekly = nextWeekly;
    const nextTotal = song.totalStreams + periodStreams;

    return {
      ...song,
      dailyStreams: baseDaily,
      weeklyStreams: nextWeekly,
      totalStreams: nextTotal,
      unitsSold: computeUnitsSold(nextTotal),
      viralScore: Math.max(0, Math.round(song.viralScore * (step === 'day' ? 0.96 : 0.85))),
      videoViews: song.hasVideo
        ? song.videoViews + Math.round(periodStreams * 0.28)
        : song.videoViews,
    };
  });

  // 2. NPC chart drift & occasional live NPC releases
  let updatedNpcSongs = state.npcSongs.map((ns) => {
    const jitter = 0.89 + Math.random() * 0.2;
    const decay = ns.weeksOnChart > 12 ? 0.94 : 1.0;
    const weeklyStreams = Math.max(950_000, Math.round(ns.weeklyStreams * jitter * decay));
    return {
      ...ns,
      weeklyStreams,
      totalStreams: ns.totalStreams + Math.round((weeklyStreams / 7) * days),
      weeksOnChart: ns.weeksOnChart + weeksPassed,
    };
  });

  // 2b. Living AI Industry: Random NPC drops a fresh single onto the charts!
  if (step === 'month' || (step === 'week' && Math.random() < 0.55)) {
    const eligible = state.npcs.filter((n) => n.fame >= 4);
    const npc = eligible[Math.floor(Math.random() * eligible.length)] || state.npcs[0];
    const dropTitles = [
      'Skyline Protocol',
      'Chrome Hearts',
      'Velvet Thunder',
      'Overdrive',
      'Cold Summer',
      'Glass Crown',
      'Midnight Echo',
      'No Sleep Till Tokyo',
      'Diamond Lane',
      'City In Flames',
    ];
    const title = dropTitles[Math.floor(Math.random() * dropTitles.length)];
    const debutWeekly = Math.round((1_200_000 + npc.fame * 1_150_000) * (0.85 + Math.random() * 0.4));

    updatedNpcSongs = [
      {
        id: `npc_drop_${Date.now()}_${Math.floor(Math.random() * 999)}`,
        title,
        artistName: npc.name,
        artistId: npc.id,
        coverUrl: COVER_ARTS[Math.floor(Math.random() * COVER_ARTS.length)].url,
        genre: npc.genre,
        weeklyStreams: debutWeekly,
        totalStreams: debutWeekly,
        peak: Math.max(2, 16 - npc.fame),
        weeksOnChart: 1,
      },
      ...updatedNpcSongs,
    ].slice(0, 48);

    newPosts.push({
      id: `post_npc_drop_${Date.now()}`,
      platform: 'x',
      authorName: 'Chart Data',
      authorHandle: '@chartdata',
      authorInitials: 'CD',
      authorColor: '#0ea5e9',
      isVerified: true,
      content: `${npc.name} (${npc.genre}) just released new single "${title}" — projected Top 15 debut.`,
      likes: 8400 + npc.fame * 2100,
      comments: 420 + npc.fame * 80,
      shares: 1200 + npc.fame * 240,
      timeAgo: 'Just now',
      commentsList: [],
    });

    newPosts.push({
      id: `post_npc_news_${Date.now()}`,
      platform: 'fakebook',
      authorName: 'Music Daily',
      authorHandle: '@musicdaily',
      authorInitials: 'MD',
      authorColor: '#9333ea',
      isVerified: true,
      isNews: true,
      linkDomain: 'ROLLINGROCK.COM',
      headline: `${npc.name} shakes up the ${npc.genre} charts with surprise release "${title}".`,
      content: `${npc.name} drops "${title}" across global DSPs, fueling heavy competition atop the Hot 100.`,
      likes: 3400 + npc.fame * 900,
      comments: 210,
      shares: 480,
      timeAgo: '1h',
      commentsList: [],
    });
  }

  // 3. Royalty payout ($0.0034 per stream * contract royalty split)
  const royaltyRate = state.contract ? state.contract.royaltyPercent / 100 : 1.0;
  const streamRevenue = Math.round(totalPeriodStreams * 0.0034 * royaltyRate);
  cash += streamRevenue;

  // 4. Weekly upkeep, factories, properties, love connections, PLAYER LABEL ROSTER & MERCH STORE sales
  let updatedMerch = merchItems;
  let updatedPlayerLabel = state.playerLabel;
  let updatedNpcs = state.npcs;

  if (weeksPassed > 0) {
    const allAssets = [...VEHICLES_CATALOG, ...REAL_ESTATE_CATALOG];
    const ownedAssetSet = new Set([...state.ownedVehicles, ...state.ownedRealEstate]);
    const assetUpkeep =
      allAssets
        .filter((a) => ownedAssetSet.has(a.id))
        .reduce((acc, a) => acc + a.weeklyCost, 0) * weeksPassed;

    const factoryNet =
      FACTORIES_CATALOG.filter((f) => state.ownedFactories.includes(f.id)).reduce(
        (acc, f) => acc + ((f.weeklyIncome || 0) - f.weeklyCost),
        0
      ) * weeksPassed;

    const lovePartnerCost =
      state.connections.filter((c) => c.isPartner).reduce((acc, c) => acc + c.weeklyCost, 0) *
      weeksPassed;
    const loveConnCost =
      state.connections.filter((c) => !c.isPartner).reduce((acc, c) => acc + c.weeklyCost, 0) *
      weeksPassed;
    const totalLoveCost = lovePartnerCost + loveConnCost;

    // Player Record Label Roster royalties
    let rosterRoyalties = 0;
    if (updatedPlayerLabel && updatedPlayerLabel.rosterIds.length > 0) {
      const signedArtists = updatedNpcs.filter((n) => updatedPlayerLabel!.rosterIds.includes(n.id));
      for (const artist of signedArtists) {
        const weeklyArtistGross = artist.monthlyListeners * 0.0042;
        const cutPercent = (artist.playerLabelSplit ?? 45) / 100;
        rosterRoyalties += Math.round(weeklyArtistGross * cutPercent * weeksPassed);
      }
      if (rosterRoyalties > 0) {
        updatedPlayerLabel = {
          ...updatedPlayerLabel,
          totalRevenue: updatedPlayerLabel.totalRevenue + rosterRoyalties,
        };
        newNotifications.push({
          id: `notif_roster_${Date.now()}`,
          title: `${updatedPlayerLabel.name} Roster Payout`,
          detail: `Your ${signedArtists.length} signed artist(s) generated +${formatMoney(rosterRoyalties)} in label royalties.`,
          deltaText: `+${formatMoney(rosterRoyalties)}`,
          dateStr,
          unread: true,
        });
      }
    }

    // Merch Store weekly profit
    let merchProfitTotal = 0;
    const tourBoost = state.activeTour?.active ? 1.55 : 1.0;
    const storeMult = 1 + ((state.merchStoreLevel || 1) - 1) * 0.45;
    updatedMerch = merchItems.map((item) => {
      if (!item.active) return item;
      const demand = Math.max(
        4,
        Math.round(
          (popularity * 1.8 + fameLevel * 22 + skills.marketing * 0.8 + hype * 0.5) *
            storeMult *
            tourBoost *
            (0.85 + Math.random() * 0.3)
        )
      );
      const unitsThisPeriod = demand * weeksPassed;
      const weeklyProfit = Math.round(
        demand * Math.max(5, item.price - item.costToProduce) * perks.merchMult
      );
      merchProfitTotal += weeklyProfit * weeksPassed;
      return {
        ...item,
        unitsSold: item.unitsSold + unitsThisPeriod,
        weeklyRevenue: demand * item.price,
      };
    });

    cash = cash + factoryNet + merchProfitTotal + rosterRoyalties - assetUpkeep - totalLoveCost;

    if (merchProfitTotal > 0) {
      newNotifications.push({
        id: `notif_merch_${Date.now()}_${Math.random()}`,
        title: 'Merch Webstore Sales',
        detail: `Online store netted +${formatMoney(merchProfitTotal)} across ${merchItems.filter((m) => m.active).length} active drops.`,
        dateStr,
        unread: true,
      });
    }

    if (totalLoveCost > 0) {
      newNotifications.push({
        id: `notif_love_${Date.now()}_${Math.random()}`,
        title: `Lifestyle & Relationships`,
        detail: `Partner $${lovePartnerCost.toLocaleString()}, team $${loveConnCost.toLocaleString()}.`,
        deltaText: '+4⚡',
        dateStr,
        unread: true,
      });
    }

    if (factoryNet > 0) {
      newNotifications.push({
        id: `notif_fac_${Date.now()}_${Math.random()}`,
        title: 'Business Empire Payout',
        detail: `Companies netted +${formatMoney(factoryNet)} after operating costs.`,
        dateStr,
        unread: true,
      });
    }
  }

  // 5. Tiered Tour progress with dynamic sell-out %
  let activeTour = state.activeTour;
  let toursCompleted = state.careerStats.toursCompleted;
  let soldOutArenas = state.careerStats.soldOutArenas || 0;

  if (activeTour && activeTour.active) {
    const showsDone = Math.min(
      activeTour.citiesTotal - activeTour.citiesCompleted,
      step === 'day' ? 1 : step === 'week' ? 3 : 6
    );
    if (showsDone > 0) {
      const stageFactor = 1 + skills.stagePresence * 0.008;
      // Ticket price elasticity controls dynamic sell-out %
      const idealPrice =
        activeTour.venueTier === 'World Stadiums'
          ? 240
          : activeTour.venueTier === 'Arenas'
          ? 165
          : activeTour.venueTier === 'Theaters'
          ? 90
          : 40;
      const priceRatio = activeTour.ticketPrice / idealPrice;
      const rawSellout =
        (65 + fameLevel * 3.5 + hype * 0.2 + skills.stagePresence * 0.15) /
        Math.max(0.75, Math.pow(priceRatio, 0.85));
      const selloutPercent = Math.min(100, Math.max(28, Math.round(rawSellout)));

      const tierCap =
        activeTour.venueTier === 'World Stadiums'
          ? 42000
          : activeTour.venueTier === 'Arenas'
          ? 16000
          : activeTour.venueTier === 'Theaters'
          ? 3800
          : 650;

      const showRev = Math.round(
        showsDone *
          tierCap *
          (selloutPercent / 100) *
          activeTour.ticketPrice *
          0.38 *
          stageFactor *
          perks.tourMult
      );
      cash += showRev;
      const newCompleted = activeTour.citiesCompleted + showsDone;
      const finished = newCompleted >= activeTour.citiesTotal;

      if (finished) {
        toursCompleted += 1;
        if (
          (activeTour.venueTier === 'Arenas' || activeTour.venueTier === 'World Stadiums') &&
          selloutPercent >= 80
        ) {
          soldOutArenas += 1;
        }
        newNotifications.push({
          id: `notif_tour_${Date.now()}`,
          title: `${activeTour.name} Wrapped!`,
          detail: `${selloutPercent}% avg sell-out across ${activeTour.citiesTotal} cities (${formatMoney(activeTour.revenueEarned + showRev)} gross).`,
          dateStr,
          unread: true,
        });
        activeTour = null;
      } else {
        activeTour = {
          ...activeTour,
          citiesCompleted: newCompleted,
          selloutPercent,
          revenueEarned: activeTour.revenueEarned + showRev,
        };
      }
      popularity = Math.min(150, +(popularity + showsDone * 0.65).toFixed(1));
      hype = Math.min(100, hype + showsDone * 2);
    }
  }

  // 6. Chart rankings (Global + North America / Europe / UK)
  const tempState: GameState = {
    ...state,
    songs: updatedSongs,
    npcSongs: updatedNpcSongs,
  };
  const hotGlobal = getRegionalHot100Songs(tempState, 'Global');
  const hotNA = getRegionalHot100Songs(tempState, 'North America');
  const hotEU = getRegionalHot100Songs(tempState, 'Europe');
  const hotUK = getRegionalHot100Songs(tempState, 'UK');

  let numberOneHits = state.careerStats.numberOneHits;
  let hot100Entries = state.careerStats.hot100Entries;

  const finalSongs = updatedSongs.map((s) => {
    if (!s.released) return s;
    const chartRow = hotGlobal.find((c) => c.songId === s.id);
    const naRow = hotNA.find((c) => c.songId === s.id);
    const euRow = hotEU.find((c) => c.songId === s.id);
    const ukRow = hotUK.find((c) => c.songId === s.id);

    const rank = chartRow ? chartRow.rank : null;
    const wasOnChart = s.peakChartPos !== null;
    if (rank !== null && !wasOnChart) {
      hot100Entries += 1;
    }
    if (rank === 1 && s.peakChartPos !== 1) {
      numberOneHits += 1;
      newNotifications.push({
        id: `notif_no1_${s.id}_${Date.now()}`,
        title: `#1 on Hot 100: "${s.title}"!`,
        detail: `Your single hit #1 on the Global Billboard Hot 100!`,
        deltaText: '#1',
        dateStr,
        unread: true,
      });
    }

    const prevPeaks = s.regionalPeaks || {
      Global: s.peakChartPos,
      'North America': null,
      Europe: null,
      UK: null,
    };
    const nextPeaks: Record<ChartRegion, number | null> = {
      Global:
        rank !== null ? (prevPeaks.Global ? Math.min(prevPeaks.Global, rank) : rank) : prevPeaks.Global,
      'North America': naRow
        ? prevPeaks['North America']
          ? Math.min(prevPeaks['North America'], naRow.rank)
          : naRow.rank
        : prevPeaks['North America'],
      Europe: euRow
        ? prevPeaks.Europe
          ? Math.min(prevPeaks.Europe, euRow.rank)
          : euRow.rank
        : prevPeaks.Europe,
      UK: ukRow ? (prevPeaks.UK ? Math.min(prevPeaks.UK, ukRow.rank) : ukRow.rank) : prevPeaks.UK,
    };

    return {
      ...s,
      currentChartPos: rank,
      peakChartPos: nextPeaks.Global,
      regionalPeaks: nextPeaks,
      weeksOnChart: rank !== null ? s.weeksOnChart + weeksPassed : s.weeksOnChart,
    };
  });

  // 7. Albums stream aggregation
  const updatedAlbums = state.albums.map((alb) => {
    if (!alb.released) return alb;
    const tracks = finalSongs.filter((s) => alb.songIds.includes(s.id));
    const weeklyStreams = tracks.reduce((sum, t) => sum + t.weeklyStreams, 0);
    const totalStreams = tracks.reduce((sum, t) => sum + t.totalStreams, 0);
    return {
      ...alb,
      weeklyStreams,
      totalStreams,
      unitsSold: computeUnitsSold(totalStreams),
      weeksOnChart: alb.weeksOnChart + weeksPassed,
    };
  });

  // 8. Popularity & Fame growth
  const streamBoost =
    totalPeriodStreams > 0 ? Math.min(3.5, Math.log10(totalPeriodStreams + 10) * 0.28) : -0.15;
  popularity = Math.max(
    1,
    Math.min(150, +(popularity + (step === 'day' ? streamBoost * 0.25 : streamBoost)).toFixed(1))
  );
  const totalCareerStreams = state.careerStats.totalStreams + totalPeriodStreams;
  const computedFame = Math.min(
    15,
    Math.max(1, Math.floor(1 + Math.log10(Math.max(10, totalCareerStreams / 5000 + popularity * 15))))
  );
  fameLevel = Math.max(fameLevel, computedFame);

  // 9. Annual Music Awards Show processing (every February for prior year)
  let nextAwards = awardsHistory;
  let nextAwardYear = lastAwardYearProcessed;
  let grammyAwards = state.careerStats.grammyAwards;

  if (nextDate.year > lastAwardYearProcessed && nextDate.month >= 2) {
    const releasedForAwards = finalSongs.filter((s) => s.released);
    if (releasedForAwards.length > 0) {
      const bestSong = [...releasedForAwards].sort((a, b) => b.totalStreams - a.totalStreams)[0];
      const songWon = bestSong.quality >= 80 || (bestSong.peakChartPos !== null && bestSong.peakChartPos <= 5);
      const artistWon = fameLevel >= 6 && popularity >= 50;

      const awardsAdded: AwardRecord[] = [
        {
          id: `aw_${nextDate.year}_soty`,
          year: nextDate.year,
          showName: 'Global Music Awards',
          category: 'Song of the Year',
          nomineeTitle: bestSong.title,
          won: songWon,
        },
        {
          id: `aw_${nextDate.year}_artist`,
          year: nextDate.year,
          showName: 'Global Music Awards',
          category: 'Artist of the Year',
          nomineeTitle: state.artistName,
          won: artistWon,
        },
      ];

      const wins = awardsAdded.filter((a) => a.won).length;
      if (wins > 0) {
        grammyAwards += wins;
        popularity = Math.min(150, +(popularity + wins * 4.5).toFixed(1));
        hype = Math.min(100, hype + wins * 12);
        cash += wins * 50000;
        newNotifications.push({
          id: `notif_award_${nextDate.year}`,
          title: `Won ${wins} Music Award${wins > 1 ? 's' : ''}!`,
          detail: `${awardsAdded
            .filter((a) => a.won)
            .map((a) => `${a.category} (${a.nomineeTitle})`)
            .join(' · ')}`,
          deltaText: `+${wins} 🏆`,
          dateStr,
          unread: true,
        });
        newPosts.push({
          id: `post_award_${nextDate.year}`,
          platform: 'x',
          authorName: 'Chart Data',
          authorHandle: '@chartdata',
          authorInitials: 'CD',
          authorColor: '#0ea5e9',
          isVerified: true,
          content: `${state.artistName} takes home ${wins} troph${wins > 1 ? 'ies' : 'y'} at the ${nextDate.year} Global Music Awards!`,
          likes: 18500 + fameLevel * 3200,
          comments: 1400,
          shares: 4100,
          timeAgo: 'Just now',
          commentsList: [],
        });
      }
      nextAwards = [...awardsAdded, ...awardsHistory];
      nextAwardYear = nextDate.year;
    }
  }

  // 10. Follower growth across apps
  const followerGainBase = Math.max(12, Math.round(totalPeriodStreams * 0.0028 + popularity * 14));
  const socialFollowers = {
    youtube: state.socialFollowers.youtube + Math.round(followerGainBase * 0.35),
    instaglam: state.socialFollowers.instaglam + Math.round(followerGainBase * 0.72),
    x: state.socialFollowers.x + Math.round(followerGainBase * 0.24),
    tictok: state.socialFollowers.tictok + Math.round(followerGainBase * 0.95),
    fakebook: state.socialFollowers.fakebook + Math.round(followerGainBase * 0.4),
    soundifyMonthly: Math.max(
      state.socialFollowers.soundifyMonthly,
      Math.round(finalSongs.reduce((a, s) => a + s.weeklyStreams, 0) * 1.15)
    ),
  };

  // 11. Dynamic Mail Inbox: Fan Mail, Brand Deals, Festival Invites & Negotiable Label Offers
  if (step === 'week' || step === 'month') {
    const roll = Math.random();
    if (!state.contract && roll < 0.34 && fameLevel >= 2) {
      const eligibleLabels = RECORD_LABELS.filter((l) => l.id !== 'independent' && fameLevel >= l.minFame);
      const offeredLabel = eligibleLabels[eligibleLabels.length - 1] || RECORD_LABELS[1];
      const hasOpenOffer = state.emails.some((e) => e.actionType === 'sign_label' && !e.actionCompleted);
      if (offeredLabel && !hasOpenOffer) {
        newEmails.push({
          id: `mail_lbl_${Date.now()}`,
          fromName: offeredLabel.name,
          fromEmail: `ar@${offeredLabel.id}.music`,
          initials: offeredLabel.name.slice(0, 2).toUpperCase(),
          avatarColor: '#1d4ed8',
          category: 'deals',
          subject: `Contract Offer: ${offeredLabel.name} (${offeredLabel.albumsRequired}-Album)`,
          preview: `${formatMoney(offeredLabel.advance)} advance · Negotiable ${offeredLabel.royaltyPercent}% royalty split...`,
          body: `${state.artistName}, our A&R executives have been tracking your streaming velocity. ${offeredLabel.name} is offering a ${offeredLabel.albumsRequired}-album deal starting at ${formatMoney(offeredLabel.advance)} advance and ${offeredLabel.royaltyPercent}% royalties. Use the negotiation slider below to counter!`,
          dateLabel: dateStr,
          read: false,
          actionType: 'sign_label',
          actionPayload: {
            labelId: offeredLabel.id,
            labelName: offeredLabel.name,
            advance: offeredLabel.advance,
            royaltyPercent: offeredLabel.royaltyPercent,
            albumsRequired: offeredLabel.albumsRequired,
            promoBonus: offeredLabel.promoBonus,
          },
        });
      }
    } else if (roll < 0.62) {
      const brands = [
        { name: 'Nike Sound Lab', deal: 15000 + fameLevel * 24000, pop: 2.2 },
        { name: 'Beats Studio Campaign', deal: 22000 + fameLevel * 30000, pop: 3.1 },
        { name: 'Cactus Energy Drink', deal: 12000 + fameLevel * 18000, pop: 1.8 },
      ];
      const brand = brands[Math.floor(Math.random() * brands.length)];
      newEmails.push({
        id: `mail_brand_${Date.now()}`,
        fromName: brand.name,
        fromEmail: `partnerships@${brand.name.toLowerCase().replace(/\s+/g, '')}.com`,
        initials: brand.name.slice(0, 2).toUpperCase(),
        avatarColor: '#059669',
        category: 'deals',
        subject: `Sponsorship Deal: ${formatMoney(brand.deal)}`,
        preview: `${brand.name} wants ${state.artistName} to front our upcoming campaign...`,
        body: `Hey ${state.artistName}, our global marketing team wants you as the face of our new campaign. Shoot one promo spot for ${formatMoney(brand.deal)} cash + ${brand.pop} popularity.`,
        dateLabel: dateStr,
        read: false,
        actionType: 'brand_deal',
        actionPayload: { reward: brand.deal, energy: 8, popGain: brand.pop },
      });
    } else if (roll < 0.85) {
      const topSong = [...finalSongs].filter((s) => s.released).sort((a, b) => b.totalStreams - a.totalStreams)[0];
      if (topSong) {
        const fans = [
          { name: 'devon_w', initials: 'DW', color: '#0284c7' },
          { name: 'nina.waves', initials: 'NW', color: '#9333ea' },
          { name: 'marcus_99', initials: 'M9', color: '#059669' },
          { name: 'sara.vibe', initials: 'SV', color: '#db2777' },
        ];
        const fan = fans[Math.floor(Math.random() * fans.length)];
        newEmails.push({
          id: `mail_${Date.now()}_${Math.random()}`,
          fromName: fan.name,
          fromEmail: `${fan.name}@mail.com`,
          initials: fan.initials,
          avatarColor: fan.color,
          category: 'primary',
          subject: `"${topSong.title}"`,
          preview: `Hey ${state.artistName}! "${topSong.title}" is on heavy rotation all week...`,
          body: `Hey ${state.artistName}! "${topSong.title}" is on heavy rotation all week. Everybody in my city is playing it right now. Keep dropping heat!`,
          dateLabel: dateStr,
          read: false,
          actionType: 'reply_fan',
        });
      }
    }
  }

  // 12. Evaluate Plaques & Certifications (Gold, Platinum, Multi-Platinum, Diamond)
  const plaqueEval = evaluatePlaquesAndCertifications(
    finalSongs,
    updatedAlbums,
    state.plaques || [],
    dateStr
  );
  for (const plq of plaqueEval.newlyAwarded) {
    newNotifications.push({
      id: `notif_plq_${plq.id}`,
      title: `RIAA ${plq.tier} Plaque Awarded!`,
      detail: `"${plq.title}" (${plq.type}) certified ${plq.tier} with ${formatCompactNumber(plq.units)} units.`,
      deltaText: plq.tier.toUpperCase(),
      dateStr,
      unread: true,
    });
  }

  const nextReputation = computeReputation(fameLevel, popularity, grammyAwards);

  const preAchievementState: GameState = {
    ...state,
    date: nextDate,
    cash,
    energy: Math.min(effectiveMaxEnergy, energy),
    maxEnergy: effectiveMaxEnergy,
    popularity,
    hype,
    reputation: nextReputation,
    fameLevel,
    heatLevel,
    inJailDays,
    activeTour,
    playerLabel: updatedPlayerLabel,
    npcs: updatedNpcs,
    songs: finalSongs,
    albums: updatedAlbums,
    npcSongs: updatedNpcSongs,
    merchItems: updatedMerch,
    awardsHistory: nextAwards,
    plaques: plaqueEval.plaques,
    lastAwardYearProcessed: nextAwardYear,
    socialFollowers,
    emails: [...newEmails, ...state.emails].slice(0, 45),
    posts: [...newPosts, ...state.posts].slice(0, 65),
    notifications: [...newNotifications, ...state.notifications].slice(0, 30),
    careerStats: {
      ...state.careerStats,
      totalStreams: totalCareerStreams,
      hot100Entries,
      numberOneHits,
      grammyAwards,
      toursCompleted,
      highestWeeklyStreams: highestWeekly,
      soldOutArenas,
    },
  };

  preAchievementState.netWorth = computeNetWorth(preAchievementState);
  const achEval = evaluateAchievements(preAchievementState, dateStr);
  preAchievementState.unlockedAchievements = achEval.unlockedAchievements;
  const nextMaxEnergy = 100 + getAchievementPerks(achEval.unlockedAchievements).maxEnergyBonus;
  preAchievementState.maxEnergy = nextMaxEnergy;
  preAchievementState.energy = Math.min(nextMaxEnergy, preAchievementState.energy);
  preAchievementState.notifications = [...achEval.notifications, ...preAchievementState.notifications].slice(0, 30);

  return preAchievementState;
}
