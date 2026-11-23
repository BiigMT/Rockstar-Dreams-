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
import { EmailMessage, GameState, PhoneAppId } from '../../types/game';
import { MONTH_NAMES } from '../../data/gameCatalog';
import { formatCompactNumber, formatMoney } from '../../engine/simulation';
import { MailApp } from './apps/MailApp';
import { FakebookApp } from './apps/FakebookApp';
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
  onEmailAction: (email: EmailMessage) => void;
  onCreatePost: (
    platform: 'fakebook' | 'x' | 'instaglam' | 'tictok' | 'youtube',
    content: string,
    extra?: { imageUrl?: string; songId?: string; headline?: string }
  ) => void;
  onLikePost: (postId: string) => void;
  onBefriendNpc: (npcId: string) => void;
  onMatchLinkup: (profileId: string, accepted: boolean) => void;
  onChangePhoneSettings: (wallpaper: GameState['phoneWallpaper']) => void;
}

export const SmartphoneOS: React.FC<SmartphoneOSProps> = ({
  state,
  activeApp,
  onSelectApp,
  onClosePhone,
  showTopHeader = true,
  onPlaySong,
  onPromoteSong,
  onBuyAmazonePerk,
  onReadEmail,
  onEmailAction,
  onCreatePost,
  onLikePost,
  onBefriendNpc,
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
        <div className="flex items-center justify-between px-3.5 pt-3 pb-2 border-b border-white/[0.06] bg-[#0b0c10]/90 shrink-0">
          <button
            type="button"
            onClick={onClosePhone}
            className="flex items-center gap-1.5 text-left group"
          >
            <ChevronLeft className="w-6 h-6 text-amber-400 group-hover:-translate-x-0.5 snap-transition" />
            <div className="leading-tight">
              <div className="font-display text-[15px] font-extrabold text-white tracking-wide">
                SOCIAL MEDIA
              </div>
              <div className="text-[11px] text-zinc-400">
                {monthTitle} {state.date.year}
              </div>
            </div>
          </button>

          <div className="flex items-center gap-2 font-mono-num text-[13px] font-bold tabular-nums">
            <span className="text-emerald-400">{formatMoney(state.cash)}</span>
            <span className="text-amber-400 flex items-center gap-0.5">
              <Zap className="w-3.5 h-3.5 fill-current" />
              {state.energy}
            </span>
          </div>
        </div>
      )}

      {/* Titanium Phone Bezel Container */}
      <div className="flex-1 min-h-0 px-3 py-3 flex items-center justify-center">
        <div className="w-full h-full max-w-[385px] max-h-[760px] rounded-[40px] border-[4px] border-zinc-700/90 bg-black overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.75)] flex flex-col relative">
          {activeApp === 'home' ? (
            <div className={`flex-1 flex flex-col justify-between p-3.5 relative ${wallpaperClass}`}>
              {/* Subtle water ripple overlay for Ocean wallpaper */}
              <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.22),transparent_55%)]" />

              <div className="relative z-10 space-y-3">
                {/* Notification Banner */}
                <button
                  type="button"
                  onClick={() => onSelectApp('x')}
                  className="w-full rounded-[22px] bg-black/75 backdrop-blur-md px-3.5 py-2.5 flex items-center gap-3 text-left border border-white/10"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-700 flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4 text-white fill-white/80" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-white">X</span>
                      <span className="text-[11px] text-zinc-400">now</span>
                    </div>
                    <div className="text-xs text-zinc-200 truncate">
                      76 new notifications
                    </div>
                  </div>
                </button>

                {/* Live Follower Stats Glass Widget */}
                <div className="rounded-[22px] bg-black/45 backdrop-blur-md border border-white/10 px-4 py-3 space-y-1.5 text-[12px]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-semibold text-white">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      {state.artistName}
                    </span>
                    <span className="text-zinc-200 tabular-nums font-semibold">
                      {formatCompactNumber(state.socialFollowers.youtube)} subscribers
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-semibold text-white">
                      <span className="w-2 h-2 rounded-full bg-pink-500" />
                      {state.handle.replace('@', '')}
                    </span>
                    <span className="text-zinc-200 tabular-nums font-semibold">
                      {formatCompactNumber(state.socialFollowers.instaglam)} followers
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-semibold text-white">
                      <span className="w-2 h-2 rounded-full bg-white" />
                      {state.handle}
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

                {/* App Grid (4 columns) */}
                <div className="grid grid-cols-4 gap-y-4 gap-x-2 pt-1">
                  {/* Soundify */}
                  <button
                    type="button"
                    onClick={() => onSelectApp('soundify')}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className="w-14 h-14 rounded-[15px] bg-[#1ed760] flex items-center justify-center shadow-lg group-active:scale-95 snap-transition">
                      <svg viewBox="0 0 24 24" className="w-9 h-9 fill-black">
                        <circle cx="12" cy="12" r="10" fill="black" />
                        <path
                          d="M7.5 9.6c3.2-.9 6.6-.7 9.4.7M8.2 12.6c2.6-.7 5.3-.5 7.6.6M8.9 15.4c2-.5 4.1-.4 5.9.5"
                          stroke="#1ed760"
                          strokeWidth="1.9"
                          strokeLinecap="round"
                          fill="none"
                        />
                      </svg>
                    </div>
                    <span className="text-[11px] font-medium text-white drop-shadow">Soundify</span>
                  </button>

                  {/* Amazone */}
                  <button
                    type="button"
                    onClick={() => onSelectApp('amazone')}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className="w-14 h-14 rounded-[15px] bg-[#38bdf8] flex items-center justify-center shadow-lg group-active:scale-95 snap-transition">
                      <div className="w-9 h-9 rounded-lg bg-[#1d4ed8] flex items-center justify-center gap-0.5">
                        {[10, 18, 26, 18, 12].map((h, i) => (
                          <span
                            key={i}
                            className="w-1 rounded-full bg-white"
                            style={{ height: `${h}px` }}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-white drop-shadow">Amazone</span>
                  </button>

                  {/* Pear Music */}
                  <button
                    type="button"
                    onClick={() => onSelectApp('pearmusic')}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className="w-14 h-14 rounded-[15px] bg-gradient-to-b from-[#fb7185] to-[#e11d48] flex items-center justify-center shadow-lg group-active:scale-95 snap-transition">
                      <Music2 className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-[11px] font-medium text-white drop-shadow">Pear Music</span>
                  </button>

                  {/* Streaming */}
                  <button
                    type="button"
                    onClick={() => onSelectApp('streaming')}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className="w-14 h-14 rounded-[15px] bg-gradient-to-b from-[#14b8a6] to-[#0f766e] flex items-center justify-center shadow-lg group-active:scale-95 snap-transition">
                      <Megaphone className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-[11px] font-medium text-white drop-shadow">Streaming</span>
                  </button>

                  {/* Fakebook */}
                  <button
                    type="button"
                    onClick={() => onSelectApp('fakebook')}
                    className="relative flex flex-col items-center gap-1 group"
                  >
                    <span className="absolute -top-1.5 right-0.5 z-10 min-w-[20px] h-5 px-1 rounded-full bg-[#ff3b30] text-[10px] font-bold text-white flex items-center justify-center tabular-nums">
                      78
                    </span>
                    <div className="w-14 h-14 rounded-[15px] bg-[#1877f2] flex items-end justify-center overflow-hidden shadow-lg group-active:scale-95 snap-transition">
                      <span className="text-[46px] font-extrabold text-white leading-[0.82] select-none">
                        f
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-white drop-shadow">Fakebook</span>
                  </button>

                  {/* Goggle */}
                  <button
                    type="button"
                    onClick={() => onSelectApp('goggle')}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className="w-14 h-14 rounded-[15px] bg-white flex flex-col items-center justify-center shadow-lg group-active:scale-95 snap-transition">
                      <span className="text-2xl font-extrabold text-[#16a34a] leading-none">G</span>
                      <div className="flex gap-1 mt-1">
                        <span className="w-1 h-1 rounded-full bg-[#4285f4]" />
                        <span className="w-1 h-1 rounded-full bg-[#ea4335]" />
                        <span className="w-1 h-1 rounded-full bg-[#fbbc05]" />
                        <span className="w-1 h-1 rounded-full bg-[#34a853]" />
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-white drop-shadow">Goggle</span>
                  </button>

                  {/* Mail */}
                  <button
                    type="button"
                    onClick={() => onSelectApp('mail')}
                    className="relative flex flex-col items-center gap-1 group"
                  >
                    {unreadMailCount > 0 && (
                      <span className="absolute -top-1.5 right-0.5 z-10 min-w-[20px] h-5 px-1 rounded-full bg-[#ff3b30] text-[10px] font-bold text-white flex items-center justify-center tabular-nums">
                        {unreadMailCount}
                      </span>
                    )}
                    <div className="w-14 h-14 rounded-[15px] bg-gradient-to-b from-[#38bdf8] to-[#0284c7] flex items-center justify-center shadow-lg group-active:scale-95 snap-transition">
                      <Mail className="w-8 h-8 text-white fill-white/20" />
                    </div>
                    <span className="text-[11px] font-medium text-white drop-shadow">Mail</span>
                  </button>

                  {/* Settings */}
                  <button
                    type="button"
                    onClick={() => onSelectApp('phone_settings')}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className="w-14 h-14 rounded-[15px] bg-gradient-to-b from-zinc-400 to-zinc-600 flex items-center justify-center shadow-lg group-active:scale-95 snap-transition">
                      <Settings className="w-8 h-8 text-zinc-900" />
                    </div>
                    <span className="text-[11px] font-medium text-white drop-shadow">Settings</span>
                  </button>

                  {/* Linkup */}
                  <button
                    type="button"
                    onClick={() => onSelectApp('linkup')}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className="w-14 h-14 rounded-[15px] bg-[#061812] border border-emerald-500/20 flex items-center justify-center shadow-lg group-active:scale-95 snap-transition">
                      <Link2 className="w-7 h-7 text-[#22c55e] -rotate-45" />
                    </div>
                    <span className="text-[11px] font-medium text-white drop-shadow">Linkup</span>
                  </button>
                </div>
              </div>

              {/* Bottom Dock + Home Bar */}
              <div className="relative z-10 space-y-2.5">
                <div className="rounded-[24px] bg-black/35 backdrop-blur-xl border border-white/10 px-3 py-2.5 grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectApp('youtube')}
                    className="flex justify-center"
                    aria-label="YouTube"
                  >
                    <div className="w-12 h-12 rounded-[14px] bg-[#ff0000] flex items-center justify-center shadow-md active:scale-95 snap-transition">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectApp('instaglam')}
                    className="flex justify-center"
                    aria-label="Instaglam"
                  >
                    <div className="w-12 h-12 rounded-[14px] bg-gradient-to-tr from-[#f59e0b] via-[#ec4899] to-[#8b5cf6] flex items-center justify-center shadow-md active:scale-95 snap-transition">
                      <div className="w-7 h-7 rounded-lg border-[2.5px] border-white flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full border-[2px] border-white" />
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectApp('x')}
                    className="relative flex justify-center"
                    aria-label="X"
                  >
                    <span className="absolute -top-1.5 right-0 z-10 min-w-[20px] h-5 px-1 rounded-full bg-[#ff3b30] text-[10px] font-bold text-white flex items-center justify-center tabular-nums">
                      76
                    </span>
                    <div className="w-12 h-12 rounded-[14px] bg-white flex items-center justify-center shadow-md active:scale-95 snap-transition">
                      <span className="text-2xl font-black text-black">𝕏</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectApp('tictok')}
                    className="flex justify-center"
                    aria-label="TicTok"
                  >
                    <div className="w-12 h-12 rounded-[14px] bg-black border border-white/10 flex items-center justify-center shadow-md active:scale-95 snap-transition">
                      <span className="text-xl font-black text-[#25f4ee] drop-shadow-[2px_1px_0_#fe2c55]">
                        ♪
                      </span>
                    </div>
                  </button>
                </div>

                <div className="w-28 h-1 rounded-full bg-white/80 mx-auto" />
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
                {(activeApp === 'x' ||
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
                    onMatchLinkup={onMatchLinkup}
                    onChangePhoneSettings={onChangePhoneSettings}
                    onPlaySong={onPlaySong}
                  />
                )}
              </div>

              {/* Universal iOS Home Indicator to exit any app */}
              <button
                type="button"
                onClick={() => onSelectApp('home')}
                aria-label="Phone Home"
                className="w-full py-2 bg-black flex items-center justify-center shrink-0 hover:bg-zinc-900"
              >
                <span className="w-28 h-1 rounded-full bg-white/75" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
