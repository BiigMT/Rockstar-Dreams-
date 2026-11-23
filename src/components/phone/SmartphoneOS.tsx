import React from 'react';
import {
  Bell,
  ChevronLeft,
  Link2,
  Mail,
  Megaphone,
  Music2,
  Play,
  Settings,
  Zap,
} from 'lucide-react';
import { MONTH_NAMES } from '../../data/gameCatalog';
import { formatCompactNumber, formatMoney } from '../../engine/simulation';
import { EmailMessage, GameState, PhoneAppId } from '../../types/game';
import { FakebookApp } from './apps/FakebookApp';
import { MailApp } from './apps/MailApp';
import { MusicApps } from './apps/MusicApps';
import { SocialApps } from './apps/SocialApps';

interface SmartphoneOSProps {
  state: GameState;
  activeApp: PhoneAppId;
  onSelectApp: (app: PhoneAppId) => void;
  onClosePhone?: () => void;
  showTopHeader?: boolean;
  onPlaySong: (songId: string) => void;
  onPromoteSong: (songId: string, channel: 'playlist' | 'radio' | 'viral', cost: number) => void;
  onBuyAmazonePerk: (title: string, cost: number, energyBoost: number, popBoost: number) => void;
  onReadEmail: (emailId: string) => void;
  onEmailAction: (
    email: EmailMessage,
    customTerms?: { royaltyPercent?: number; advance?: number }
  ) => void;
  onCreatePost: (
    platform: 'fakebook' | 'x' | 'instaglam' | 'tictok' | 'youtube',
    content: string,
    extra?: { imageUrl?: string; songId?: string; headline?: string }
  ) => void;
  onLikePost: (postId: string) => void;
  onBefriendNpc: (npcId: string) => void;
  onStartBeef: (npcId: string) => void;
  onMatchLinkup: (profileId: string, accepted: boolean) => void;
  onChangePhoneSettings: (wallpaper: GameState['phoneWallpaper']) => void;
}

export const SmartphoneOS: React.FC<SmartphoneOSProps> = ({
  state,
  activeApp,
  onSelectApp,
  onClosePhone,
  showTopHeader = false,
  onPlaySong,
  onPromoteSong,
  onBuyAmazonePerk,
  onReadEmail,
  onEmailAction,
  onCreatePost,
  onLikePost,
  onBefriendNpc,
  onStartBeef,
  onMatchLinkup,
  onChangePhoneSettings,
}) => {
  const unreadMailCount = state.emails.filter((e) => !e.read).length;
  const monthLabel = MONTH_NAMES[(state.date.month - 1) % 12];
  const monthTitle = monthLabel.charAt(0) + monthLabel.slice(1).toLowerCase();

  const wallpaperClass =
    state.phoneWallpaper === 'ocean'
      ? 'bg-[radial-gradient(circle_at_30%_25%,#2d6a67_0%,#153b42_48%,#0b1f27_100%)]'
      : state.phoneWallpaper === 'midnight'
      ? 'bg-[radial-gradient(circle_at_50%_20%,#312e81_0%,#171738_55%,#090a16_100%)]'
      : state.phoneWallpaper === 'emerald'
      ? 'bg-[radial-gradient(circle_at_40%_25%,#065f46_0%,#062c25_55%,#041311_100%)]'
      : 'bg-[radial-gradient(circle_at_50%_20%,#27272a_0%,#121215_60%,#070709_100%)]';

  return (
    <div className="flex flex-col h-full w-full">
      {showTopHeader && (
        <div className="flex items-center justify-between px-3.5 pt-3 pb-2 shrink-0">
          <button
            type="button"
            onClick={onClosePhone}
            className="flex items-center gap-1 text-left group"
          >
            <ChevronLeft className="w-6 h-6 text-sky-400" />
            <div className="leading-tight">
              <div className="font-display text-base font-extrabold text-white tracking-wide">
                SMARTPHONE
              </div>
              <div className="text-[11px] text-slate-400">
                {monthTitle} {state.date.year}
              </div>
            </div>
          </button>

          <div className="flex items-center gap-2 text-xs font-extrabold tabular-nums">
            <span className="text-emerald-400">{formatMoney(state.cash)}</span>
            <span className="text-sky-400 flex items-center gap-0.5">
              <Zap className="w-3.5 h-3.5 fill-current" />
              {state.energy}
            </span>
          </div>
        </div>
      )}

      {/* Titanium Phone Bezel */}
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <div className="w-full h-full max-w-[360px] max-h-[670px] rounded-[36px] border-[4px] border-[#4b5169] bg-black overflow-hidden shadow-2xl flex flex-col relative">
          {activeApp === 'home' ? (
            <div className={`flex-1 flex flex-col justify-between p-3 relative ${wallpaperClass}`}>
              <div className="relative z-10 space-y-2.5">
                {/* Chirper Notification Banner */}
                <button
                  type="button"
                  onClick={() => onSelectApp('chirper')}
                  className="w-full rounded-[18px] bg-black/75 backdrop-blur-md px-3 py-2 flex items-center gap-2.5 text-left border border-white/10"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4 text-white fill-white/80" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-white">Chirper</span>
                      <span className="text-[10px] text-zinc-400">now</span>
                    </div>
                    <div className="text-[11px] text-zinc-200 truncate">
                      {state.posts.filter((p) => p.platform === 'x').length} timeline updates · Start beef or promo
                    </div>
                  </div>
                </button>

                {/* Live Follower Stats Glass Widget */}
                <div className="rounded-[18px] bg-black/45 backdrop-blur-md border border-white/10 px-3.5 py-2.5 space-y-1 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-semibold text-white">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      YouTube
                    </span>
                    <span className="text-zinc-200 tabular-nums font-semibold">
                      {formatCompactNumber(state.socialFollowers.youtube)} subs
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-semibold text-white">
                      <span className="w-2 h-2 rounded-full bg-pink-500" />
                      Instaglam
                    </span>
                    <span className="text-zinc-200 tabular-nums font-semibold">
                      {formatCompactNumber(state.socialFollowers.instaglam)} followers
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-semibold text-white">
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                      Chirper ({state.handle})
                    </span>
                    <span className="text-zinc-200 tabular-nums font-semibold">
                      {formatCompactNumber(state.socialFollowers.x)} followers
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-semibold text-white">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      TicTok
                    </span>
                    <span className="text-zinc-200 tabular-nums font-semibold">
                      {formatCompactNumber(state.socialFollowers.tictok)} followers
                    </span>
                  </div>
                </div>

                {/* App Grid */}
                <div className="grid grid-cols-4 gap-y-3 gap-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onSelectApp('soundify')}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="w-12 h-12 rounded-[14px] bg-[#1ed760] flex items-center justify-center shadow-lg">
                      <Music2 className="w-6 h-6 text-black" />
                    </div>
                    <span className="text-[10px] font-medium text-white">Soundify</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectApp('amazone')}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="w-12 h-12 rounded-[14px] bg-[#38bdf8] flex items-center justify-center shadow-lg">
                      <Zap className="w-6 h-6 text-[#0c4a6e]" />
                    </div>
                    <span className="text-[10px] font-medium text-white">Amazone</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectApp('pearmusic')}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="w-12 h-12 rounded-[14px] bg-gradient-to-b from-[#fb7185] to-[#e11d48] flex items-center justify-center shadow-lg">
                      <Music2 className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[10px] font-medium text-white">Pear Music</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectApp('streaming')}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="w-12 h-12 rounded-[14px] bg-gradient-to-b from-[#14b8a6] to-[#0f766e] flex items-center justify-center shadow-lg">
                      <Megaphone className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[10px] font-medium text-white">Streaming</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectApp('fakebook')}
                    className="relative flex flex-col items-center gap-1"
                  >
                    <div className="w-12 h-12 rounded-[14px] bg-[#1877f2] flex items-end justify-center overflow-hidden shadow-lg">
                      <span className="text-[38px] font-extrabold text-white leading-[0.82]">f</span>
                    </div>
                    <span className="text-[10px] font-medium text-white">Fakebook</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectApp('goggle')}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="w-12 h-12 rounded-[14px] bg-white flex items-center justify-center shadow-lg">
                      <span className="text-xl font-extrabold text-[#16a34a]">G</span>
                    </div>
                    <span className="text-[10px] font-medium text-white">Goggle</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectApp('mail')}
                    className="relative flex flex-col items-center gap-1"
                  >
                    {unreadMailCount > 0 && (
                      <span className="absolute -top-1 right-1 z-10 min-w-[18px] h-[18px] px-1 rounded-full bg-[#ff3b30] text-[9px] font-bold text-white flex items-center justify-center">
                        {unreadMailCount}
                      </span>
                    )}
                    <div className="w-12 h-12 rounded-[14px] bg-gradient-to-b from-[#38bdf8] to-[#0284c7] flex items-center justify-center shadow-lg">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[10px] font-medium text-white">Messages</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectApp('linkup')}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="w-12 h-12 rounded-[14px] bg-[#061812] border border-emerald-500/30 flex items-center justify-center shadow-lg">
                      <Link2 className="w-6 h-6 text-[#22c55e] -rotate-45" />
                    </div>
                    <span className="text-[10px] font-medium text-white">Linkup</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectApp('phone_settings')}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="w-12 h-12 rounded-[14px] bg-gradient-to-b from-zinc-400 to-zinc-600 flex items-center justify-center shadow-lg">
                      <Settings className="w-6 h-6 text-zinc-900" />
                    </div>
                    <span className="text-[10px] font-medium text-white">Settings</span>
                  </button>
                </div>
              </div>

              {/* Bottom Dock */}
              <div className="relative z-10 space-y-2">
                <div className="rounded-[22px] bg-black/35 backdrop-blur-xl border border-white/10 px-3 py-2 grid grid-cols-4 gap-2">
                  <button type="button" onClick={() => onSelectApp('youtube')} className="flex justify-center">
                    <div className="w-11 h-11 rounded-[12px] bg-[#ff0000] flex items-center justify-center shadow-md">
                      <Play className="w-5 h-5 text-white fill-white" />
                    </div>
                  </button>
                  <button type="button" onClick={() => onSelectApp('instaglam')} className="flex justify-center">
                    <div className="w-11 h-11 rounded-[12px] bg-gradient-to-tr from-[#f59e0b] via-[#ec4899] to-[#8b5cf6] flex items-center justify-center shadow-md">
                      <div className="w-6 h-6 rounded-md border-[2px] border-white" />
                    </div>
                  </button>
                  <button type="button" onClick={() => onSelectApp('chirper')} className="flex justify-center">
                    <div className="w-11 h-11 rounded-[12px] bg-sky-500 flex items-center justify-center shadow-md">
                      <span className="text-base font-black text-white">CH</span>
                    </div>
                  </button>
                  <button type="button" onClick={() => onSelectApp('tictok')} className="flex justify-center">
                    <div className="w-11 h-11 rounded-[12px] bg-black border border-white/15 flex items-center justify-center shadow-md">
                      <span className="text-lg font-black text-[#25f4ee]">♪</span>
                    </div>
                  </button>
                </div>
                <div className="w-24 h-1 rounded-full bg-white/80 mx-auto" />
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="flex-1 min-h-0">
                {activeApp === 'mail' && (
                  <MailApp
                    state={state}
                    onBackHome={() => onSelectApp('home')}
                    onReadEmail={onReadEmail}
                    onEmailAction={onEmailAction}
                  />
                )}
                {activeApp === 'fakebook' && (
                  <FakebookApp
                    state={state}
                    onBackHome={() => onSelectApp('home')}
                    onCreatePost={(p, content) => onCreatePost(p, content)}
                    onLikePost={onLikePost}
                    onBefriendNpc={onBefriendNpc}
                  />
                )}
                {(activeApp === 'soundify' ||
                  activeApp === 'pearmusic' ||
                  activeApp === 'amazone' ||
                  activeApp === 'streaming') && (
                  <MusicApps
                    appId={activeApp}
                    state={state}
                    onBackHome={() => onSelectApp('home')}
                    onPlaySong={onPlaySong}
                    onPromoteSong={onPromoteSong}
                    onBuyAmazonePerk={onBuyAmazonePerk}
                  />
                )}
                {(activeApp === 'chirper' ||
                  activeApp === 'x' ||
                  activeApp === 'instaglam' ||
                  activeApp === 'tictok' ||
                  activeApp === 'youtube' ||
                  activeApp === 'goggle' ||
                  activeApp === 'linkup' ||
                  activeApp === 'phone_settings') && (
                  <SocialApps
                    appId={activeApp}
                    state={state}
                    onBackHome={() => onSelectApp('home')}
                    onCreatePost={onCreatePost}
                    onLikePost={onLikePost}
                    onBefriendNpc={onBefriendNpc}
                    onStartBeef={onStartBeef}
                    onMatchLinkup={onMatchLinkup}
                    onChangePhoneSettings={onChangePhoneSettings}
                    onPlaySong={onPlaySong}
                  />
                )}
              </div>

              <button
                type="button"
                onClick={() => onSelectApp('home')}
                aria-label="Phone Home"
                className="w-full py-2 bg-black flex items-center justify-center shrink-0 hover:bg-zinc-900"
              >
                <span className="w-24 h-1 rounded-full bg-white/75" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
