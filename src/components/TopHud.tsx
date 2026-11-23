import React from 'react';
import {
  Award,
  BarChart3,
  Building2,
  CalendarClock,
  Disc3,
  Mic2,
  Settings,
  Smartphone,
  Sparkles,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { DIFFICULTY_CONFIGS } from '../data/gameCatalog';
import { formatCompactNumber, formatDateDot, formatMoney } from '../engine/simulation';
import { GameState, MainTab } from '../types/game';

interface TopHudProps {
  state: GameState;
  activeTab: MainTab;
  unreadNotifications: number;
  onSelectTab: (tab: MainTab) => void;
  onOpenPhone: () => void;
  onToggleMute: () => void;
}

const NAV_TABS: Array<{ id: MainTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'advance', label: 'Advance Time', icon: CalendarClock },
  { id: 'studio', label: 'Studio & Releases', icon: Mic2 },
  { id: 'brand', label: 'Artist Brand', icon: Sparkles },
  { id: 'label', label: 'Label Head Office', icon: Building2 },
  { id: 'charts', label: 'Charts & Global Data', icon: BarChart3 },
  { id: 'trophies', label: 'Trophy & Certifications', icon: Award },
  { id: 'system', label: 'System', icon: Settings },
];

export const TopHud: React.FC<TopHudProps> = ({
  state,
  activeTab,
  unreadNotifications,
  onSelectTab,
  onOpenPhone,
  onToggleMute,
}) => {
  const diff = DIFFICULTY_CONFIGS[state.difficulty || 'Realistic'];
  const energyPct = Math.max(0, Math.min(100, Math.round((state.energy / state.maxEnergy) * 100)));

  return (
    <header className="shrink-0 select-none">
      {/* Top Metallic Sports-Broadcast Bar */}
      <div className="header-slate-bar px-3 sm:px-4 py-1.5 flex items-center justify-between gap-2 relative">
        {/* Left: Gold Disc + Artist Name + Date */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#fde047] via-[#d97706] to-[#78350f] p-0.5 shadow-md shrink-0">
            <div className="w-full h-full rounded-full bg-[#0b1324] border border-amber-300/60 flex items-center justify-center">
              <Disc3 className="w-4 h-4 text-amber-300" />
            </div>
          </div>
          <div className="min-w-0 leading-tight">
            <div className="flex items-center gap-2">
              <span className="font-display text-base sm:text-lg font-black tracking-wide text-white uppercase truncate">
                {state.artistName}
              </span>
              <span
                className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider text-white"
                style={{ backgroundColor: diff.badgeColor }}
              >
                {diff.subtitle}
              </span>
            </div>
            <div className="text-[11px] font-mono-num font-semibold text-sky-200/80">
              {formatDateDot(state.date)} · {state.genre}
            </div>
          </div>
        </div>

        {/* Center Crimson Angled Ribbon: GLOBAL MUSIC MEDIA CENTRE */}
        <div className="hidden lg:flex items-center justify-center pointer-events-none">
          <div
            className="crimson-ribbon px-9 py-1.5 text-center border-x border-b border-red-300/35"
            style={{ clipPath: 'polygon(0 0, 100% 0, 96% 100%, 4% 100%)' }}
          >
            <span className="font-display text-xs xl:text-sm font-black tracking-[0.14em] text-white uppercase">
              GLOBAL MUSIC MEDIA CENTRE
            </span>
          </div>
        </div>

        {/* Right: Phone Notification Button, Stamina/Energy Bar, Cash & Net Worth */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Phone Notification Icon with Red Unread Badge */}
          <button
            type="button"
            onClick={onOpenPhone}
            title="Open Smartphone (Chirper, Mail, Streaming Apps)"
            className="relative flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0d1f3d] hover:bg-[#173361] border border-sky-400/35 text-white snap-transition shadow-inner"
          >
            <Smartphone className="w-4 h-4 text-sky-300" />
            <span className="hidden md:inline text-[11px] font-extrabold tracking-wide">Phone</span>
            {unreadNotifications > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#ef4444] text-[10px] font-black text-white flex items-center justify-center tabular-nums shadow">
                {unreadNotifications > 99 ? '99+' : unreadNotifications}
              </span>
            )}
          </button>

          {/* Energy / Stamina Bar */}
          <div className="bg-[#091529] border border-slate-500/30 rounded-md px-2 py-1 min-w-[92px] sm:min-w-[110px]">
            <div className="flex items-center justify-between text-[10px] font-extrabold leading-none mb-1">
              <span className="text-sky-300 flex items-center gap-0.5">
                <Zap className="w-3 h-3 fill-current" /> Energy
              </span>
              <span className="font-mono-num text-white">
                {state.energy}/{state.maxEnergy}
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  energyPct > 50 ? 'bg-emerald-400' : energyPct > 25 ? 'bg-amber-400' : 'bg-rose-500'
                }`}
                style={{ width: `${energyPct}%` }}
              />
            </div>
          </div>

          {/* Cash & Net Worth Box */}
          <div className="bg-[#091529] border border-slate-500/30 rounded-md px-2.5 py-1 text-[10px] sm:text-[11px] leading-tight hidden sm:block">
            <div className="flex items-center justify-between gap-2">
              <span className="text-emerald-300 font-bold">Cash:</span>
              <span className="font-mono-num font-black text-emerald-400">
                {formatMoney(state.cash)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-amber-200/80 font-bold">Net Worth:</span>
              <span className="font-mono-num font-black text-amber-300">
                {formatMoney(state.netWorth)}
              </span>
            </div>
          </div>

          {/* Compact Cash on tiny screens */}
          <div className="sm:hidden bg-[#091529] border border-emerald-500/30 rounded-md px-2 py-1 text-[11px] font-mono-num font-black text-emerald-400">
            {formatMoney(state.cash)}
          </div>

          {/* Career Streams Mini Counter */}
          <div className="hidden xl:flex flex-col items-end bg-[#091529] border border-slate-500/30 rounded-md px-2.5 py-1 text-[10px] leading-tight">
            <span className="text-slate-400 font-bold uppercase">Streams</span>
            <span className="font-mono-num font-black text-sky-300">
              {formatCompactNumber(state.careerStats.totalStreams)}
            </span>
          </div>

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={state.muted ? 'Unmute audio' : 'Mute audio'}
            className="w-8 h-8 rounded-md bg-[#091529] border border-slate-500/30 flex items-center justify-center text-slate-300 hover:text-white"
          >
            {state.muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-sky-300" />}
          </button>
        </div>
      </div>

      {/* Horizontal PES/FIFA Navigation Strip */}
      <nav className="bg-[#091529] border-b border-slate-700/60 px-2 sm:px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto slim-scroll">
        {NAV_TABS.map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`px-3 py-1.5 rounded border text-xs font-extrabold tracking-wide flex items-center gap-1.5 whitespace-nowrap snap-transition shrink-0 ${
                active ? 'royal-active-tab' : 'silver-nav-tab'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};
