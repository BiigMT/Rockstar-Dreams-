export type GamePhase = 'TITLE' | 'CREATOR' | 'PLAYING' | 'GAME_OVER';

export type MainTab = 'home' | 'music' | 'studio' | 'world' | 'phone' | 'settings' | 'love';

export type PhoneAppId =
  | 'home'
  | 'soundify'
  | 'amazone'
  | 'pearmusic'
  | 'streaming'
  | 'fakebook'
  | 'goggle'
  | 'mail'
  | 'phone_settings'
  | 'linkup'
  | 'youtube'
  | 'instaglam'
  | 'x'
  | 'tictok';

export type MusicGenre = 'Hip-Hop' | 'R&B' | 'Pop' | 'Trap' | 'Indie' | 'Rock';

export type SongMood = 'Dark' | 'Hype' | 'Melodic' | 'Emotional' | 'Flex' | 'Chill';

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
  quality: number; // 1 - 100
  featuredArtistId?: string;
  featuredArtistName?: string;
  producerName: string;
  released: boolean;
  releaseDate?: GameDate;
  releaseYear?: number;
  isSingle: boolean;
  albumId?: string;
  totalStreams: number;
  weeklyStreams: number;
  dailyStreams: number;
  peakChartPos: number | null;
  currentChartPos: number | null;
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
  songIds: string[];
  collabArtistId?: string;
  collabArtistName?: string;
  released: boolean;
  releaseDate?: GameDate;
  releaseYear?: number;
  totalStreams: number;
  weeklyStreams: number;
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
  fame: number; // 1-12
  clout: number; // 0-100
  monthlyListeners: number;
  relationship: 'neutral' | 'friend' | 'rival' | 'beef' | 'dated';
  relationshipScore: number; // -100 to 100
  featFee: number;
  avatarColor: string;
  initials: string;
  signatureHit: string;
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
  actionType?: 'accept_feat' | 'sign_label' | 'accept_gig' | 'claim_royalty' | 'reply_fan';
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
  revenueEarned: number;
}

export interface GameState {
  phase: GamePhase;
  artistName: string;
  handle: string;
  genre: MusicGenre;
  hometown: string;
  avatar: AvatarConfig;
  date: GameDate;
  fameLevel: number;
  popularity: number; // 0 - 150
  energy: number; // 0 - 100
  maxEnergy: number;
  cash: number;
  netWorth: number;
  statusPoints: number;
  statusTarget: number;

  // Side careers
  producerRank: string;
  producerDelivered: number;
  actorRank: string;
  actorCredits: number;
  heatLevel: number; // Crime risk 0 - 100
  inJailDays: number;

  // Label & Studio
  contract: ActiveContract | null;
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
  };

  // UI / Audio
  muted: boolean;
  nowPlayingSongId: string | null;
  isAudioPlaying: boolean;
  lastPlayedAt: number;
}
