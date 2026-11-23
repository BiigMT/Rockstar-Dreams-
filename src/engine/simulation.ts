import {
  CLOTHES_CATALOG,
  FACTORIES_CATALOG,
  JEWELRY_CATALOG,
  MONTH_NAMES,
  REAL_ESTATE_CATALOG,
  VEHICLES_CATALOG,
} from '../data/gameCatalog';
import {
  EmailMessage,
  GameDate,
  GameState,
  NotificationItem,
  SocialPost,
  Song,
} from '../types/game';

export function formatMoney(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}m`;
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

  return Math.round(state.cash + assetsValue + catalogValue);
}

export function getHot100Songs(state: GameState): ChartEntry[] {
  const playerEntries: ChartEntry[] = state.songs
    .filter((s) => s.released)
    .map((s) => ({
      rank: 0,
      songId: s.id,
      title: s.title,
      artistLine: s.featuredArtistName
        ? `${state.artistName}, ${s.featuredArtistName}`
        : state.artistName,
      coverUrl: s.coverUrl,
      weeklyStreams: s.weeklyStreams,
      totalStreams: s.totalStreams,
      peak: s.peakChartPos || 100,
      weeksOnChart: s.weeksOnChart,
      isPlayer: true,
    }));

  const npcEntries: ChartEntry[] = state.npcSongs.map((ns) => ({
    rank: 0,
    songId: ns.id,
    title: ns.title,
    artistLine: ns.artistName,
    coverUrl: ns.coverUrl,
    weeklyStreams: ns.weeklyStreams,
    totalStreams: ns.totalStreams,
    peak: ns.peak,
    weeksOnChart: ns.weeksOnChart,
    isPlayer: false,
  }));

  const combined = [...playerEntries, ...npcEntries].sort(
    (a, b) => b.weeklyStreams - a.weeklyStreams
  );

  return combined.slice(0, 100).map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
  }));
}

export interface ChartEntry {
  rank: number;
  songId: string;
  title: string;
  artistLine: string;
  coverUrl: string;
  weeklyStreams: number;
  totalStreams: number;
  peak: number;
  weeksOnChart: number;
  isPlayer: boolean;
}

export function getHot200Albums(state: GameState): Array<{
  rank: number;
  albumId: string;
  title: string;
  artistLine: string;
  coverUrl: string;
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
      weeklyStreams: a.weeklyStreams,
      totalStreams: a.totalStreams,
      isPlayer: true,
    }));

  const npcAlbums = state.npcs.slice(0, 5).map((npc, i) => ({
    rank: 0,
    albumId: `npc_alb_${npc.id}`,
    title: `${npc.signatureHit} (LP)`,
    artistLine: npc.name,
    coverUrl: state.npcSongs[i % state.npcSongs.length]?.coverUrl || '',
    weeklyStreams: Math.round(npc.monthlyListeners * 0.62),
    totalStreams: Math.round(npc.monthlyListeners * 4.5),
    isPlayer: false,
  }));

  return [...playerAlbums, ...npcAlbums]
    .sort((a, b) => b.weeklyStreams - a.weeklyStreams)
    .map((a, idx) => ({ ...a, rank: idx + 1 }));
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

  let cash = state.cash;
  let energy = Math.min(state.maxEnergy, state.energy + (step === 'day' ? 6 : step === 'week' ? 20 : 25));
  let popularity = state.popularity;
  let fameLevel = state.fameLevel;
  let inJailDays = Math.max(0, state.inJailDays - days);
  let heatLevel = Math.max(0, state.heatLevel - (step === 'day' ? 1 : step === 'week' ? 5 : 15));

  const newNotifications: NotificationItem[] = [];
  const newEmails: EmailMessage[] = [];
  const newPosts: SocialPost[] = [];

  // 1. Song streaming simulation
  const promoMult = state.contract ? state.contract.promoBonus : 1.0;
  let totalPeriodStreams = 0;
  let highestWeekly = state.careerStats.highestWeeklyStreams;

  const updatedSongs: Song[] = state.songs.map((song) => {
    if (!song.released) return song;
    const ageWeeks = Math.max(1, (nextDate.totalDays - (song.releaseDate?.totalDays || 1)) / 7);
    const decay = Math.max(0.12, Math.pow(0.91, ageWeeks - 1));
    const qualityFactor = Math.pow(song.quality / 55, 2.2);
    const fameFactor = 1 + fameLevel * 0.45 + popularity * 0.04;
    const boostFactor =
      1 +
      song.viralScore * 0.025 +
      song.playlistReach * 0.015 +
      song.radioPush * 0.012 +
      (song.hasVideo ? 0.35 : 0);

    const baseDaily = Math.round(
      (2800 * qualityFactor * fameFactor * boostFactor * promoMult * decay) *
        (0.88 + Math.random() * 0.24)
    );
    const periodStreams = baseDaily * days;
    totalPeriodStreams += periodStreams;

    const nextWeekly = step === 'day'
      ? Math.round(song.weeklyStreams * 0.88 + baseDaily)
      : Math.round(baseDaily * 7);

    if (nextWeekly > highestWeekly) highestWeekly = nextWeekly;

    return {
      ...song,
      dailyStreams: baseDaily,
      weeklyStreams: nextWeekly,
      totalStreams: song.totalStreams + periodStreams,
      viralScore: Math.max(0, Math.round(song.viralScore * (step === 'day' ? 0.96 : 0.85))),
      videoViews: song.hasVideo
        ? song.videoViews + Math.round(periodStreams * 0.28)
        : song.videoViews,
    };
  });

  // 2. NPC chart drift
  const updatedNpcSongs = state.npcSongs.map((ns) => {
    const jitter = 0.92 + Math.random() * 0.16;
    const weeklyStreams = Math.max(1200000, Math.round(ns.weeklyStreams * jitter));
    return {
      ...ns,
      weeklyStreams,
      totalStreams: ns.totalStreams + Math.round((weeklyStreams / 7) * days),
      weeksOnChart: ns.weeksOnChart + weeksPassed,
    };
  });

  // 3. Royalty payout ($0.0038 per stream * royalty split)
  const royaltyRate = state.contract ? state.contract.royaltyPercent / 100 : 1.0;
  const streamRevenue = Math.round(totalPeriodStreams * 0.0034 * royaltyRate);
  cash += streamRevenue;

  // 4. Weekly upkeep, factories, properties, love connections
  if (weeksPassed > 0) {
    const allAssets = [...VEHICLES_CATALOG, ...REAL_ESTATE_CATALOG];
    const ownedAssetSet = new Set([...state.ownedVehicles, ...state.ownedRealEstate]);
    const assetUpkeep = allAssets
      .filter((a) => ownedAssetSet.has(a.id))
      .reduce((acc, a) => acc + a.weeklyCost, 0) * weeksPassed;

    const factoryNet = FACTORIES_CATALOG
      .filter((f) => state.ownedFactories.includes(f.id))
      .reduce((acc, f) => acc + ((f.weeklyIncome || 0) - f.weeklyCost), 0) * weeksPassed;

    const lovePartnerCost = state.connections
      .filter((c) => c.isPartner)
      .reduce((acc, c) => acc + c.weeklyCost, 0) * weeksPassed;
    const loveConnCost = state.connections
      .filter((c) => !c.isPartner)
      .reduce((acc, c) => acc + c.weeklyCost, 0) * weeksPassed;
    const totalLoveCost = lovePartnerCost + loveConnCost;

    cash = cash + factoryNet - assetUpkeep - totalLoveCost;

    if (totalLoveCost > 0) {
      newNotifications.push({
        id: `notif_love_${Date.now()}_${Math.random()}`,
        title: `Love cost you $${totalLoveCost.toLocaleString()} this week`,
        detail: `partner $${lovePartnerCost.toLocaleString()}, connections $${loveConnCost.toLocaleString()}.`,
        deltaText: '+3',
        dateStr,
        unread: true,
      });
    }

    if (factoryNet > 0) {
      newNotifications.push({
        id: `notif_fac_${Date.now()}_${Math.random()}`,
        title: 'Business Empire Payout',
        detail: `Factories netted +${formatMoney(factoryNet)} after operating costs.`,
        dateStr,
        unread: true,
      });
    }
  }

  // 5. Tour progress if active
  let activeTour = state.activeTour;
  let toursCompleted = state.careerStats.toursCompleted;
  if (activeTour && activeTour.active) {
    const showsDone = Math.min(
      activeTour.citiesTotal - activeTour.citiesCompleted,
      step === 'day' ? 1 : step === 'week' ? 3 : 6
    );
    if (showsDone > 0) {
      const showRev = Math.round(
        showsDone * activeTour.ticketPrice * (400 + fameLevel * 850 + popularity * 25)
      );
      cash += showRev;
      const newCompleted = activeTour.citiesCompleted + showsDone;
      const finished = newCompleted >= activeTour.citiesTotal;
      if (finished) {
        toursCompleted += 1;
        newNotifications.push({
          id: `notif_tour_${Date.now()}`,
          title: `${activeTour.name} Wrapped!`,
          detail: `Sold out ${activeTour.citiesTotal} cities for ${formatMoney(activeTour.revenueEarned + showRev)} total.`,
          dateStr,
          unread: true,
        });
        activeTour = null;
      } else {
        activeTour = {
          ...activeTour,
          citiesCompleted: newCompleted,
          revenueEarned: activeTour.revenueEarned + showRev,
        };
      }
      popularity = Math.min(150, +(popularity + showsDone * 0.6).toFixed(1));
    }
  }

  // 6. Chart rankings & Number 1 checks
  const tempState: GameState = {
    ...state,
    songs: updatedSongs,
    npcSongs: updatedNpcSongs,
  };
  const hot100 = getHot100Songs(tempState);
  let numberOneHits = state.careerStats.numberOneHits;
  let hot100Entries = state.careerStats.hot100Entries;

  const finalSongs = updatedSongs.map((s) => {
    if (!s.released) return s;
    const chartRow = hot100.find((c) => c.songId === s.id);
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
        detail: `Your single hit #1 on the Billboard Hot 100!`,
        deltaText: '#1',
        dateStr,
        unread: true,
      });
    }
    return {
      ...s,
      currentChartPos: rank,
      peakChartPos: rank !== null ? (s.peakChartPos ? Math.min(s.peakChartPos, rank) : rank) : s.peakChartPos,
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
      weeksOnChart: alb.weeksOnChart + weeksPassed,
    };
  });

  // 8. Popularity & Fame growth
  const streamBoost = totalPeriodStreams > 0 ? Math.min(3.5, Math.log10(totalPeriodStreams + 10) * 0.28) : -0.15;
  popularity = Math.max(1, Math.min(150, +(popularity + (step === 'day' ? streamBoost * 0.25 : streamBoost)).toFixed(1)));
  const totalCareerStreams = state.careerStats.totalStreams + totalPeriodStreams;
  const computedFame = Math.min(
    15,
    Math.max(1, Math.floor(1 + Math.log10(Math.max(10, totalCareerStreams / 5000 + popularity * 15))))
  );
  fameLevel = Math.max(fameLevel, computedFame);

  // 9. Follower growth across apps
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

  // 10. Dynamic fan mail or industry offers occasionally on week/month ticks
  if ((step === 'week' || step === 'month') && Math.random() < 0.68) {
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

  // Occasional NPC news post
  if (step === 'month' || (step === 'week' && Math.random() < 0.45)) {
    const npc = state.npcs[Math.floor(Math.random() * state.npcs.length)];
    const titles = ['Nightfall', 'Golden Hour', 'Chrome Hearts', 'After Dark', 'Zero Gravity', 'City Lights'];
    const t = titles[Math.floor(Math.random() * titles.length)];
    newPosts.push({
      id: `post_auto_${Date.now()}_${Math.random()}`,
      platform: 'fakebook',
      authorName: 'Music Daily',
      authorHandle: '@musicdaily',
      authorInitials: 'MD',
      authorColor: '#9333ea',
      isVerified: true,
      isNews: true,
      linkDomain: 'ROLLINGROCK.COM',
      headline: `${npc.name} (${npc.genre}) teases upcoming single "${t}" after studio session.`,
      content: `${npc.name} (${npc.genre}) teases upcoming single "${t}" after late-night studio session.`,
      likes: 1200 + Math.floor(Math.random() * 5000),
      comments: 95 + Math.floor(Math.random() * 350),
      shares: 180 + Math.floor(Math.random() * 600),
      timeAgo: '2h',
      commentsList: [],
    });
  }

  const nextState: GameState = {
    ...state,
    date: nextDate,
    cash,
    energy,
    popularity,
    fameLevel,
    heatLevel,
    inJailDays,
    activeTour,
    songs: finalSongs,
    albums: updatedAlbums,
    npcSongs: updatedNpcSongs,
    socialFollowers,
    emails: [...newEmails, ...state.emails].slice(0, 40),
    posts: [...newPosts, ...state.posts].slice(0, 60),
    notifications: [...newNotifications, ...state.notifications].slice(0, 25),
    careerStats: {
      ...state.careerStats,
      totalStreams: totalCareerStreams,
      hot100Entries,
      numberOneHits,
      toursCompleted,
      highestWeeklyStreams: highestWeekly,
    },
  };

  nextState.netWorth = computeNetWorth(nextState);
  return nextState;
}
