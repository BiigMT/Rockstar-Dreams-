import React from 'react';
import {
  Gift,
  Heart,
  Mail,
  MessageSquare,
  Smartphone,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';
import { EmailMessage, GameState, PhoneAppId } from '../../types/game';
import { SmartphoneOS } from './SmartphoneOS';

interface PhoneOverlayProps {
  open: boolean;
  state: GameState;
  activeApp: PhoneAppId;
  onSelectApp: (app: PhoneAppId) => void;
  onClose: () => void;
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
  onLoveAction: (
    action: 'date' | 'gift' | 'hire_publicist' | 'hire_manager' | 'remove',
    id?: string
  ) => void;
  onMarkNotificationsRead: () => void;
}

export const PhoneOverlay: React.FC<PhoneOverlayProps> = ({
  open,
  state,
  activeApp,
  onSelectApp,
  onClose,
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
  onLoveAction,
  onMarkNotificationsRead,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-5xl h-[92dvh] max-h-[700px] career-panel rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        {/* Top Modal Header */}
        <div className="header-slate-bar px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-sky-400" />
            <span className="font-display text-sm font-black tracking-wider uppercase text-white">
              Artist Smartphone · Chirper, Direct Messages & Relationships
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectApp('chirper')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 ${
                activeApp === 'chirper' || activeApp === 'x'
                  ? 'royal-active-tab'
                  : 'bg-[#091529] text-slate-300'
              }`}
            >
              <MessageSquare className="w-3 h-3" /> Chirper
            </button>
            <button
              type="button"
              onClick={() => onSelectApp('mail')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 ${
                activeApp === 'mail' ? 'royal-active-tab' : 'bg-[#091529] text-slate-300'
              }`}
            >
              <Mail className="w-3 h-3" /> Messages ({state.emails.filter((e) => !e.read).length})
            </button>
            <button
              type="button"
              onClick={() => onSelectApp('linkup')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 ${
                activeApp === 'linkup' ? 'royal-active-tab' : 'bg-[#091529] text-slate-300'
              }`}
            >
              <Heart className="w-3 h-3 text-rose-400" /> Dating
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Landscape Split Body: Smartphone Bezel Left + Relationships & Notifications Right */}
        <div className="flex-1 min-h-0 p-3 grid grid-cols-1 md:grid-cols-[380px_1fr] gap-3 overflow-y-auto md:overflow-hidden">
          <div className="h-[580px] md:h-full min-h-0 flex items-center justify-center">
            <SmartphoneOS
              state={state}
              activeApp={activeApp}
              onSelectApp={onSelectApp}
              showTopHeader={false}
              onPlaySong={onPlaySong}
              onPromoteSong={onPromoteSong}
              onBuyAmazonePerk={onBuyAmazonePerk}
              onReadEmail={onReadEmail}
              onEmailAction={onEmailAction}
              onCreatePost={onCreatePost}
              onLikePost={onLikePost}
              onBefriendNpc={onBefriendNpc}
              onStartBeef={onStartBeef}
              onMatchLinkup={onMatchLinkup}
              onChangePhoneSettings={onChangePhoneSettings}
            />
          </div>

          {/* Right Landscape Companion: Dating / Entourage + Industry Notifications */}
          <div className="flex flex-col gap-3 min-h-0 overflow-y-auto slim-scroll pr-1">
            {/* Dating & Industry Team */}
            <div className="career-inset rounded-xl p-3 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-700/70 pb-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 fill-rose-400 text-rose-400" /> Dating, Relationships & Team
                </span>
                <div className="flex items-center gap-1.5">
                  {!state.connections.some((c) => c.role === 'Publicist') && (
                    <button
                      type="button"
                      onClick={() => onLoveAction('hire_publicist')}
                      className="px-2 py-1 rounded bg-sky-600 hover:bg-sky-500 text-[10px] font-bold text-white"
                    >
                      +Publicist ($600/wk)
                    </button>
                  )}
                  {!state.connections.some((c) => c.role === 'Manager') && (
                    <button
                      type="button"
                      onClick={() => onLoveAction('hire_manager')}
                      className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-[10px] font-bold text-white"
                    >
                      +Manager ($1.4K/wk)
                    </button>
                  )}
                </div>
              </div>

              {state.connections.length === 0 ? (
                <div className="text-xs text-slate-400 py-3 text-center">
                  No active partners or entourage yet. Swipe on Linkup in your phone or hire a Publicist/Manager!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {state.connections.map((conn) => (
                    <div
                      key={conn.id}
                      className="p-2.5 rounded-lg bg-[#091529] border border-slate-700/70 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                            style={{ backgroundColor: conn.color }}
                          >
                            {conn.initials}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate">
                              {conn.name} <span className="text-[10px] text-sky-300">({conn.role})</span>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              Loyalty {conn.loyalty}% · ${conn.weeklyCost}/wk
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] text-emerald-300">{conn.perkText}</div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={state.cash < 500 || state.energy < 2}
                          onClick={() => onLoveAction('date', conn.id)}
                          className="flex-1 py-1 rounded bg-rose-600/30 hover:bg-rose-600/45 disabled:opacity-40 text-[10px] font-bold text-rose-200 flex items-center justify-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" /> Date ($500)
                        </button>
                        <button
                          type="button"
                          disabled={state.cash < 2500}
                          onClick={() => onLoveAction('gift', conn.id)}
                          className="flex-1 py-1 rounded bg-amber-600/30 hover:bg-amber-600/45 disabled:opacity-40 text-[10px] font-bold text-amber-200 flex items-center justify-center gap-1"
                        >
                          <Gift className="w-3 h-3" /> Gift ($2.5K)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Alerts Feed */}
            <div className="career-inset rounded-xl p-3 flex-1 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-700/70 pb-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" /> Career Alerts & Tabloid Feed
                </span>
                <button
                  type="button"
                  onClick={onMarkNotificationsRead}
                  className="text-[10px] font-bold text-sky-400 hover:underline"
                >
                  Mark All Read
                </button>
              </div>
              <div className="space-y-1.5 max-h-[260px] overflow-y-auto slim-scroll">
                {state.notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                      n.unread
                        ? 'bg-sky-500/10 border-sky-500/35'
                        : 'bg-[#091529] border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-white">{n.title}</div>
                      <div className="text-[10px] text-slate-300">{n.detail}</div>
                    </div>
                    <div className="text-right shrink-0">
                      {n.deltaText && (
                        <div className="text-[11px] font-black text-emerald-400">{n.deltaText}</div>
                      )}
                      <div className="text-[10px] text-slate-500 font-mono-num">{n.dateStr}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
