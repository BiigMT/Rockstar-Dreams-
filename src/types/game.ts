export type GamePhase = 'TITLE' | 'CREATOR' | 'PLAYING' | 'GAME_OVER';

export type DifficultyMode = 'Casual' | 'Realistic' | 'Hardcore';

export type MainTab =
  | 'advance'
  | 'studio'
  | 'brand'
  | 'label'
  | 'charts'
  | 'trophies'
  | 'system';

export type PhoneAppId =
  | 'home'
  | 'chirper'
  | 'mail'
  | 'linkup'
  | 'soundify'
  | 'pearmusic'
  | 'amazone'
  | 'streaming'
  | 'fakebook'
  | 'goggle'
  | 'phone_settings'
  | 'youtube'
  | 'instaglam'
  | 'x'
  | 'tictok';

export type MusicGenre =
  | 'Hip-Hop'
  | 'Trap'
  | 'Melodic Rap'
  | 'R&B'
  | 'Pop'
  | 'Drill'
  | 'Afrobeats'
  | 'Rock'
  | 'Alternative'
  | 'Indie'
  | 'Reggaeton'
  | 'Electronic'
  | 'Soul'
  | 'Country'
  | 'K-Pop'
  | 'Lo-Fi'
  | 'House'
  | 'Techno'
  | 'Amapiano'
  | 'Dancehall'
  | 'Jazz'
  | 'Funk'
  | 'Punk'
  | 'Metal'
  | 'Latin Trap'
  | 'Synthpop'
  | 'Grime'
  | 'Gospel'
  | 'Boom Bap'
  | 'Folk'
  | 'Disco'
  | 'Hyperpop';

export type SongMood = 'Dark' | 'Hype' | 'Melodic' | 'Emotional' | 'Flex' | 'Chill' | 'Diss';

export type ChartRegion = 'Global' | 'North America' | 'Europe' | 'UK';

export interface CustomCoverConfig {
  mode: 'photo' | 'custom';
  bgColor: string;
  accentColor: string;
  pattern: 'vinyl' | 'waves' | 'grid' | 'radial' | 'minimal';
  badge: 'NONE' | 'EXPLICIT' | 'DELUXE' | 'LIVE' | 'TOUR';
  subtitle?: string;
}

export interface OriginStory {
  id: string;
  title: string;
  tagline: string;
  startingCash: number;
  startingPop: number;
  startingFame: number;
  bonusFollowers: number;
  heatStart: number;
  skillBoosts: Partial<ArtistSkills>;
  perkSummary: string;
}

export interface ArtistSkills {
  songwriting: number; // Lyrics (1-100)
  vocals: number; // Flow / Vocals (1-100)
  production: number; // Production (1-100)
  stagePresence: number; // Charisma (1-100)
  marketing: number; // Promo / Hype (1-100)
}

export interface MerchItem {
  id: string;
  name: string;
  type: 'Hoodie' | 'Tour Tee' | 'Vinyl LP' | 'Cap' | 'Collector Box';
  eraAlbumTitle?: string;
  price: number;
  costToProduce: number;
  unitsSold: number;
  weeklyRevenue: number;
  active: boolean;
}

export interface AwardRecord {
  id: string;
  year: number;
  showName: string;
  category: string;
  nomineeTitle: string;
  won: boolean;
}

export type PlaqueTier = 'Gold' | 'Platinum' | 'Multi-Platinum' | 'Diamond';

export interface PlaqueRecord {
  id: string;
  targetId: string;
  title: string;
  type: 'Single' | 'Album';
  tier: PlaqueTier;
  units: number;
  dateStr: string;
  coverUrl: string;
  customCover?: CustomCoverConfig;
}

export interface AchievementDef {
  id: string;
  title: string;
  desc: string;
  perkLabel: string;
  perkType: 'streams' | 'energy' | 'fees' | 'tour' | 'merch' | 'viral';
  perkValue: number;
}

export interface AvatarConfig {
  skinTone: string;
  hairStyle: 'bald' | 'buzz' | 'dreads' | 'afro' | 'waves' | 'curly' | 'spiky' | 'long';
  hairColor: string;
  facialHair: 'none' | 'stubble' | 'goatee' | 'beard';
  eyewear: 'none' | 'shades' | 'round' | 'designer';
  outfitId: string;
  jewelryIds: string[];
  auraColor: string;
}

export interface GameDate {
  day: number;
  month: number; // 1-12
  year: number;
  totalDays: number;
  totalWeeks: number;
}

export interface Song {
  id: string;
  title: string;
  genre: MusicGenre;
  mood: SongMood;
  bpm: number;
  coverUrl: string;
  customCover?: CustomCoverConfig;
  quality: number; // 1 - 100
  featuredArtistId?: string;
  featuredArtistName?: string;
  dissTargetId?: string;
  dissTargetName?: string;
  producerName: string;
  marketingBudget?: number;
  released: boolean;
  releaseDate?: GameDate;
  releaseYear?: number;
  isSingle: boolean;
  albumId?: string;
  totalStreams: number;
  weeklyStreams: number;
  dailyStreams: number;
  unitsSold?: number;
  peakChartPos: number | null;
  currentChartPos: number | null;
  regionalPeaks?: Record<ChartRegion, number | null>;
  weeksOnChart: number;
  viralScore: number; // 0 - 100
  playlistReach: number; // 0 - 100
  radioPush: number; // 0 - 100
  hasVideo: boolean;
  videoViews: number;
  videoTitle?: string;
  videoBudgetTier?: 'DIY' | 'Indie' | 'Cinematic' | 'Blockbuster';
  seed: number;
}

export interface Album {
  id: string;
  title: string;
  type: 'ALBUM' | 'EP' | 'MIXTAPE' | 'COLLAB';
  coverUrl: string;
  customCover?: CustomCoverConfig;
  songIds: string[];
  collabArtistId?: string;
  collabArtistName?: string;
  released: boolean;
  releaseDate?: GameDate;
  releaseYear?: number;
  totalStreams: number;
  weeklyStreams: number;
  unitsSold?: number;
  firstWeekUnits: number;
  peakChartPos: number | null;
  currentChartPos: number | null;
  weeksOnChart: number;
}

export interface NpcArtist {
  id: string;
  name: string;
  handle: string;
  genre: MusicGenre;
  tier?: 'Underground' | 'Rising' | 'Mainstream' | 'Superstar' | 'Legend';
  fame: number; // 1-12
  clout: number; // 0-100
  monthlyListeners: number;
  relationship: 'neutral' | 'friend' | 'rival' | 'beef' | 'dated';
  relationshipScore: number; // -100 to 100
  featFee: number;
  avatarColor: string;
  initials: string;
  signatureHit: string;
  signedToPlayerLabel?: boolean;
  playerLabelSplit?: number; // % kept by player label
}

export interface NpcChartSong {
  id: string;
  title: string;
  artistName: string;
  artistId: string;
  coverUrl: string;
  genre: MusicGenre;
  weeklyStreams: number;
  totalStreams: number;
  peak: number;
  weeksOnChart: number;
}

export interface EmailMessage {
  id: string;
  fromName: string;
  fromEmail: string;
  initials: string;
  avatarColor: string;
  category: 'primary' | 'deals' | 'news' | 'media';
  subject: string;
  preview: string;
  body: string;
  dateLabel: string;
  read: boolean;
  actionType?:
    | 'accept_feat'
    | 'sign_label'
    | 'accept_gig'
    | 'festival_invite'
    | 'brand_deal'
    | 'claim_royalty'
    | 'reply_fan';
  actionPayload?: Record<string, string | number>;
  actionCompleted?: boolean;
}

export interface SocialComment {
  id: string;
  author: string;
  handle?: string;
  text: string;
}

export interface SocialPost {
  id: string;
  platform: 'fakebook' | 'x' | 'instaglam' | 'tictok' | 'youtube';
  authorName: string;
  authorHandle: string;
  authorInitials: string;
  authorColor: string;
  isVerified: boolean;
  isNews?: boolean;
  linkDomain?: string;
  headline?: string;
  content: string;
  imageUrl?: string;
  songId?: string;
  songTitle?: string;
  likes: number;
  comments: number;
  shares: number;
  views?: number;
  timeAgo: string;
  likedByPlayer?: boolean;
  commentsList: SocialComment[];
}

export interface StudioState {
  level: number; // 1 - 5
  name: string;
  rating: number; // 1.0 - 10.0
  upgradeCost: number;
}

export interface CatalogItem {
  id: string;
  category: 'vehicle' | 'realestate' | 'clothes' | 'jewelry' | 'factory';
  name: string;
  price: number;
  weeklyCost: number;
  weeklyIncome?: number;
  energyBonus?: number;
  hypeBonus?: number;
  statusGain: number;
  tierLabel: string;
  visualKey?: string;
  description: string;
}

export interface RecordLabel {
  id: string;
  name: string;
  tier: 'Independent' | 'Indie Label' | 'Major' | 'Global Titan';
  minFame: number;
  advance: number;
  royaltyPercent: number; // player keeps %
  albumsRequired: number;
  promoBonus: number;
  description: string;
}

export interface ActiveContract {
  labelId: string;
  labelName: string;
  royaltyPercent: number;
  albumsRequired: number;
  albumsDelivered: number;
  promoBonus: number;
  advancePaid: number;
}

export interface PlayerLabelState {
  name: string;
  foundedYear: number;
  rosterIds: string[];
  totalRevenue: number;
  level: number;
}

export interface ConnectionPerson {
  id: string;
  name: string;
  role: 'Partner' | 'Producer' | 'Manager' | 'Stylist' | 'Publicist' | 'Model' | 'Artist';
  initials: string;
  color: string;
  weeklyCost: number;
  loyalty: number; // 0-100
  perkText: string;
  isPartner: boolean;
}

export interface LinkupProfile {
  id: string;
  name: string;
  age: number;
  role: string;
  bio: string;
  clout: number;
  color: string;
  initials: string;
  matched: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  deltaText?: string;
  dateStr: string;
  unread: boolean;
}

export interface TourState {
  active: boolean;
  name: string;
  venueTier: string;
  citiesTotal: number;
  citiesCompleted: number;
  ticketPrice: number;
  selloutPercent: number;
  revenueEarned: number;
}

export interface GameState {
  phase: GamePhase;
  difficulty: DifficultyMode;
  artistName: string;
  handle: string;
  genre: MusicGenre;
  hometown: string;
  originStoryTitle?: string;
  avatar: AvatarConfig;
  date: GameDate;
  fameLevel: number;
  popularity: number; // 0 - 150
  hype: number; // 0 - 100
  reputation: 'Underground' | 'Rising' | 'Respected' | 'Star' | 'Elite' | 'Icon';
  energy: number; // 0 - maxEnergy
  maxEnergy: number;
  cash: number;
  netWorth: number;
  statusPoints: number;
  statusTarget: number;

  // Artist Skills (Lyrics, Flow, Production, Charisma, Marketing)
  skills: ArtistSkills;

  // Merch Webstore
  merchStoreLevel: number; // 1-4
  merchItems: MerchItem[];

  // Awards, Plaques & Achievements
  awardsHistory: AwardRecord[];
  plaques: PlaqueRecord[];
  unlockedAchievements: string[];
  lastAwardYearProcessed: number;

  // Side careers
  producerRank: string;
  producerDelivered: number;
  actorRank: string;
  actorCredits: number;
  heatLevel: number; // Crime risk 0 - 100
  inJailDays: number;

  // Label & Studio & Player Label Empire
  contract: ActiveContract | null;
  playerLabel: PlayerLabelState | null;
  studio: StudioState;
  activeTour: TourState | null;

  // Catalog ownership
  ownedVehicles: string[];
  ownedRealEstate: string[];
  ownedClothes: string[];
  ownedJewelry: string[];
  ownedFactories: string[];

  // Discography
  songs: Song[];
  albums: Album[];
  npcSongs: NpcChartSong[];
  npcs: NpcArtist[];

  // Social & Phone
  socialFollowers: {
    youtube: number;
    instaglam: number;
    x: number;
    tictok: number;
    fakebook: number;
    soundifyMonthly: number;
  };
  emails: EmailMessage[];
  posts: SocialPost[];
  notifications: NotificationItem[];
  connections: ConnectionPerson[];
  linkupPool: LinkupProfile[];
  phoneWallpaper: 'ocean' | 'midnight' | 'emerald' | 'obsidian';
  phoneDarkMode: boolean;

  // Stats & Records
  careerStats: {
    totalStreams: number;
    hot100Entries: number;
    numberOneHits: number;
    grammyAwards: number;
    toursCompleted: number;
    songsReleased: number;
    videosShot: number;
    highestWeeklyStreams: number;
    soldOutArenas: number;
  };

  // UI / Audio
  muted: boolean;
  nowPlayingSongId: string | null;
  isAudioPlaying: boolean;
  lastPlayedAt: number;
}
