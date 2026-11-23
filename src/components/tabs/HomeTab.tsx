import React, { useState } from 'react';
import {
  Bell,
  ChevronRight,
  BarChart3,
  Siren,
  Users,
  Sparkles,
  Coffee,
  Mic2,
  Clapperboard,
  Disc3,
  X,
  Check,
  Flame,
  Pencil,
} from 'lucide-react';
import { GameState } from '../../types/game';
import { formatCompactNumber, formatMoney } from '../../engine/simulation';
import { ArtistAvatar } from '../ArtistAvatar';

interface HomeTabProps {
  state: GameState;
  onAdvanceTime: (step: 'day' | 'week' | 'month') => void;
  onOpenAvatarEditor: () => void;
  onQuickAction: (action: string, payload?: Record<string, string | number>) => void;
  onOpenPhoneApp: (appId: 'mail' | 'x' | 'tictok') => void;
}

type HomeModal =
  | null
  | 'more_cash'
  | 'net_worth'
  | 'feat_requests'
  | 'notifications'
  | 'producer'
  | 'actor'
  | 'actions'
  | 'artists'
  | 'stats'
  | 'crime';

export const HomeTab: React.FC<HomeTabProps> = ({
  state,
  onAdvanceTime,
  onOpenAvatarEditor,
  onQuickAction,
}) => {
  const [modal, setModal] = useState<HomeModal>(null);

  const unreadNotifs = state.notifications.filter((n) => n.unread).length;
  const latestNotif = state.notifications[0];
  const featEmails = state.emails.filter(
    (e) => e.actionType === 'accept_feat' && !e.actionCompleted
  );
  const featCount = Math.max(featEmails.length, state.fameLevel >= 8 ? 3 : featEmails.length);

  const popBarPct = Math.min(100, Math.max(4, (state.popularity / 110) * 100));

  return (
    <div className="flex-1 overflow-y-auto slim-scroll px-3.5 py-3 space-y-2.5">
      {/* Artist Press Pass Hero Card */}
      <div className="pad-card rounded-2xl p-3 grid grid-cols-[1fr_1.08fr] gap-3 items-center relative overflow-hidden">
        {/* Subtle vinyl corner lines */}
        <div className="absolute -left-10 -top-10 w-36 h-36 rounded-full border border-white/[0.03] pointer-events-none" />

        <button
          type="button"
          onClick={onOpenAvatarEditor}
          title="Customize Artist Look"
          className="relative flex flex-col items-center justify-center rounded-xl bg-[#0e1015]/80 border border-white/[0.05] hover:border-amber-400/35 py-2 px-1 snap-transition group"
        >
          <span className="absolute top-2 right-2 w-6 h-6 rounded-md bg-white/[0.05] text-zinc-400 group-hover:text-amber-400 flex items-center justify-center">
            <Pencil className="w-3 h-3" />
          </span>
          <ArtistAvatar avatar={state.avatar} size={130} />
          <div className="mt-1 text-center">
            <div className="text-[13px] font-extrabold text-white tracking-tight truncate max-w-[130px]">
              {state.artistName}
            </div>
            <div className="text-[10px] font-semibold text-zinc-500">
              {state.genre} · {state.hometown}
            </div>
          </div>
        </button>

        <div className="space-y-2">
          {/* Fame Level Dial */}
          <div className="bg-[#0e1015] border border-white/[0.06] rounded-xl px-3 py-2 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border-2 border-amber-400 bg-amber-400/10 flex items-center justify-center font-mono-num text-[15px] font-extrabold text-amber-300 shrink-0 tabular-nums">
              {state.fameLevel}
            </div>
            <div className="leading-tight">
              <div className="text-[12px] font-extrabold text-white tracking-wider">
                FAME
              </div>
              <div className="text-[10px] font-semibold text-zinc-500 tracking-wider">
                LEVEL TIER
              </div>
            </div>
          </div>

          {/* Popularity Meter */}
          <div className="bg-[#0e1015] border border-white/[0.06] rounded-xl px-3 py-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                POPULARITY
              </span>
              <span className="font-mono-num text-[10px] text-zinc-500">/ 100</span>
            </div>
            <div className="font-display text-[23px] font-extrabold text-white leading-none tabular-nums mb-2">
              {state.popularity.toFixed(1)}
            </div>
            <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-500 snap-transition"
                style={{ width: `${popBarPct}%` }}
              />
            </div>
          </div>

          {/* MORE CASH CTA */}
          <button
            type="button"
            onClick={() => setModal('more_cash')}
            className="w-full py-2 px-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-zinc-950 text-[12px] font-extrabold tracking-wide flex items-center justify-between shadow-lg shadow-amber-500/10 snap-transition"
          >
            <span>MORE CASH?</span>
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Net Worth + Feat Requests */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setModal('net_worth')}
          className="pad-card pad-card-hover rounded-xl px-3.5 py-2.5 flex items-center justify-between text-left snap-transition"
        >
          <div>
            <div className="font-mono-num text-[18px] font-extrabold text-emerald-400 leading-tight tabular-nums">
              {formatMoney(state.netWorth).replace('m', 'M')}
            </div>
            <div className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase mt-0.5">
              NET WORTH
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
        </button>

        <button
          type="button"
          onClick={() => setModal('feat_requests')}
          className="pad-card pad-card-hover rounded-xl px-3.5 py-2.5 flex items-center justify-between text-left snap-transition"
        >
          <div>
            <div className="font-mono-num text-[18px] font-extrabold text-amber-400 leading-tight tabular-nums">
              {featCount}
            </div>
            <div className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase mt-0.5">
              FEAT REQUESTS
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
        </button>
      </div>

      {/* Notification Ticker */}
      <button
        type="button"
        onClick={() => setModal('notifications')}
        className="w-full pad-card pad-card-hover rounded-xl px-3 py-2.5 flex items-center gap-2.5 text-left snap-transition"
      >
        <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shrink-0">
          <Bell className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-bold text-white truncate">
            {latestNotif ? latestNotif.title : 'Career Feed Clear'}
          </div>
          <div className="text-[11px] text-zinc-400 truncate">
            {latestNotif ? latestNotif.detail : 'Advance time or drop a track for updates.'}
          </div>
        </div>
        {unreadNotifs > 0 && (
          <span className="font-mono-num text-[11px] font-extrabold text-amber-400 tabular-nums shrink-0">
            +{unreadNotifs}
          </span>
        )}
        <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />
      </button>

      {/* Producer & Actor Row */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setModal('producer')}
          className="pad-card pad-card-hover rounded-xl px-3 py-2.5 flex items-center justify-between text-left snap-transition"
        >
          <div className="min-w-0">
            <div className="text-[12px] font-extrabold text-white tracking-wider">
              PRODUCER
            </div>
            <div className="text-[11px] text-zinc-400 truncate mt-0.5">
              {state.producerRank} · {state.producerDelivered}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => setModal('actor')}
          className="pad-card pad-card-hover rounded-xl px-3 py-2.5 flex items-center justify-between text-left snap-transition"
        >
          <div className="min-w-0">
            <div className="text-[12px] font-extrabold text-white tracking-wider">
              ACTOR
            </div>
            <div className="text-[11px] text-zinc-400 truncate mt-0.5">
              {state.actorRank} · {state.actorCredits} credits
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />
        </button>
      </div>

      {/* 4 Hardware Pad Action Tiles */}
      <div className="grid grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() => setModal('actions')}
          className="pad-card pad-card-hover rounded-xl py-2.5 px-1 flex flex-col items-center justify-center gap-1.5 snap-transition"
        >
          <div className="w-7 h-7 rounded-lg bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300 font-mono-num text-[12px] font-extrabold tabular-nums">
            4
          </div>
          <span className="text-[10px] font-extrabold tracking-wider text-zinc-300">
            ACTIONS
          </span>
        </button>

        <button
          type="button"
          onClick={() => setModal('artists')}
          className="pad-card pad-card-hover rounded-xl py-2.5 px-1 flex flex-col items-center justify-center gap-1.5 snap-transition"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-400/10 flex items-center justify-center text-emerald-400">
            <Users className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-extrabold tracking-wider text-zinc-300">
            ARTISTS
          </span>
        </button>

        <button
          type="button"
          onClick={() => setModal('stats')}
          className="pad-card pad-card-hover rounded-xl py-2.5 px-1 flex flex-col items-center justify-center gap-1.5 snap-transition"
        >
          <div className="w-7 h-7 rounded-lg bg-sky-400/10 flex items-center justify-center text-sky-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-extrabold tracking-wider text-zinc-300">
            STATS
          </span>
        </button>

        <button
          type="button"
          onClick={() => setModal('crime')}
          className="pad-card pad-card-hover rounded-xl py-2.5 px-1 flex flex-col items-center justify-center gap-1.5 snap-transition"
        >
          <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
            <Siren className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-extrabold tracking-wider text-zinc-300">
            CRIME
          </span>
        </button>
      </div>

      {/* Console Transport Time Buttons */}
      <div className="grid grid-cols-3 gap-2 pt-0.5">
        <button
          type="button"
          onClick={() => onAdvanceTime('day')}
          className="py-3 rounded-xl bg-gradient-to-b from-rose-500 to-rose-600 hover:brightness-110 active:scale-[0.98] text-white text-[12px] font-extrabold tracking-wider shadow-lg shadow-rose-950/50 border border-rose-400/30 snap-transition"
        >
          DAY +1
        </button>
        <button
          type="button"
          onClick={() => onAdvanceTime('week')}
          className="py-3 rounded-xl pad-card pad-card-hover active:scale-[0.98] text-white text-[12px] font-extrabold tracking-wider snap-transition"
        >
          WEEK +1
        </button>
        <button
          type="button"
          onClick={() => onAdvanceTime('month')}
          className="py-3 rounded-xl pad-card pad-card-hover active:scale-[0.98] text-white text-[12px] font-extrabold tracking-wider snap-transition"
        >
          MONTH +1
        </button>
      </div>

      {/* Action Modals */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-3">
          <div className="w-full max-w-md bg-[#14161c] border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-[82vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07] bg-[#0e1015]">
              <h3 className="font-display text-[15px] font-extrabold text-white uppercase tracking-wider">
                {modal === 'more_cash' && 'Fast Cash & Brand Deals'}
                {modal === 'net_worth' && 'Net Worth Breakdown'}
                {modal === 'feat_requests' && 'Feature Requests'}
                {modal === 'notifications' && 'Activity Feed'}
                {modal === 'producer' && 'Producer Career'}
                {modal === 'actor' && 'Acting Credits & Auditions'}
                {modal === 'actions' && 'Daily Actions'}
                {modal === 'artists' && 'Industry Artists'}
                {modal === 'stats' && 'Career Statistics'}
                {modal === 'crime' && 'Underground Hustle'}
              </h3>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto slim-scroll space-y-2.5 text-sm">
              {modal === 'more_cash' && (
                <>
                  <p className="text-xs text-zinc-400">
                    Spend energy on live appearances, sponsorships, or local gigs for instant cash.
                  </p>
                  {[
                    {
                      id: 'club_appearance',
                      title: 'Club Walk-Through',
                      desc: 'Show face at a packed downtown venue (-5 ⚡)',
                      reward: 3500 + state.fameLevel * 2400,
                      cost: 5,
                    },
                    {
                      id: 'brand_sponsor',
                      title: 'Sneaker Brand Story Promo',
                      desc: 'Sponsored post on Instaglam & TicTok (-4 ⚡)',
                      reward: 6500 + state.fameLevel * 6800,
                      cost: 4,
                    },
                    {
                      id: 'festival_set',
                      title: 'Headline Pop-Up Set',
                      desc: 'High-energy live performance (-10 ⚡)',
                      reward: 12000 + state.fameLevel * 18500,
                      cost: 10,
                    },
                  ].map((gig) => (
                    <button
                      key={gig.id}
                      type="button"
                      disabled={state.energy < gig.cost}
                      onClick={() => {
                        onQuickAction('cash_gig', { reward: gig.reward, energy: gig.cost, title: gig.title });
                        setModal(null);
                      }}
                      className="w-full p-3 rounded-xl bg-[#1a1d26] hover:bg-[#222632] border border-white/[0.06] disabled:opacity-45 text-left flex items-center justify-between snap-transition"
                    >
                      <div>
                        <div className="font-bold text-white">{gig.title}</div>
                        <div className="text-xs text-zinc-400">{gig.desc}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono-num font-bold text-emerald-400 tabular-nums">
                          +{formatMoney(gig.reward)}
                        </div>
                        <div className="text-[11px] text-amber-400">-{gig.cost} ⚡</div>
                      </div>
                    </button>
                  ))}
                </>
              )}

              {modal === 'net_worth' && (
                <div className="space-y-2">
                  <div className="flex justify-between p-3 rounded-xl bg-[#1a1d26]">
                    <span className="text-zinc-300">Liquid Cash</span>
                    <span className="font-mono-num font-bold text-emerald-400 tabular-nums">
                      {formatMoney(state.cash)}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 rounded-xl bg-[#1a1d26]">
                    <span className="text-zinc-300">Vehicles ({state.ownedVehicles.length}/47)</span>
                    <span className="font-mono-num font-bold text-white tabular-nums">
                      {state.ownedVehicles.length} owned
                    </span>
                  </div>
                  <div className="flex justify-between p-3 rounded-xl bg-[#1a1d26]">
                    <span className="text-zinc-300">Real Estate ({state.ownedRealEstate.length}/50)</span>
                    <span className="font-mono-num font-bold text-white tabular-nums">
                      {state.ownedRealEstate.length} owned
                    </span>
                  </div>
                  <div className="flex justify-between p-3 rounded-xl bg-[#1a1d26]">
                    <span className="text-zinc-300">Factories ({state.ownedFactories.length}/12)</span>
                    <span className="font-mono-num font-bold text-white tabular-nums">
                      {state.ownedFactories.length} active
                    </span>
                  </div>
                  <div className="flex justify-between p-3 rounded-xl bg-amber-400/10 border border-amber-400/25">
                    <span className="font-bold text-white">Estimated Net Worth</span>
                    <span className="font-mono-num font-extrabold text-amber-400 tabular-nums">
                      {formatMoney(state.netWorth)}
                    </span>
                  </div>
                </div>
              )}

              {modal === 'feat_requests' && (
                <div className="space-y-2.5">
                  {state.npcs.slice(0, 4).map((npc) => (
                    <div
                      key={npc.id}
                      className="p-3 rounded-xl bg-[#1a1d26] border border-white/[0.06] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0"
                          style={{ backgroundColor: npc.avatarColor }}
                        >
                          {npc.initials}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-white truncate">{npc.name}</div>
                          <div className="text-xs text-zinc-400">
                            {npc.genre} · Fame {npc.fame} · Pays {formatMoney(Math.round(npc.featFee * 0.75))}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={state.energy < 4}
                        onClick={() => {
                          onQuickAction('record_guest_verse', {
                            npcId: npc.id,
                            npcName: npc.name,
                            payout: Math.round(npc.featFee * 0.75),
                          });
                          setModal(null);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-zinc-950 text-xs font-extrabold shrink-0"
                      >
                        Accept (-4 ⚡)
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {modal === 'notifications' && (
                <div className="space-y-2">
                  {state.notifications.map((n) => (
                    <div key={n.id} className="p-3 rounded-xl bg-[#1a1d26] border border-white/[0.05]">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{n.title}</span>
                        <span className="font-mono-num text-[11px] text-zinc-500 tabular-nums">{n.dateStr}</span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">{n.detail}</p>
                    </div>
                  ))}
                </div>
              )}

              {modal === 'producer' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-[#1a1d26] flex items-center gap-3">
                    <Disc3 className="w-7 h-7 text-amber-400" />
                    <div>
                      <div className="font-bold text-white">{state.producerRank}</div>
                      <div className="text-xs text-zinc-400">
                        {state.producerDelivered} beats delivered to artists
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={state.energy < 5}
                    onClick={() => {
                      onQuickAction('produce_beat');
                      setModal(null);
                    }}
                    className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 font-extrabold text-zinc-950"
                  >
                    Cook & Sell Beat Pack (-5 ⚡ · +${(1200 + state.studio.level * 1800).toLocaleString()})
                  </button>
                </div>
              )}

              {modal === 'actor' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-[#1a1d26] flex items-center gap-3">
                    <Clapperboard className="w-7 h-7 text-sky-400" />
                    <div>
                      <div className="font-bold text-white">{state.actorRank}</div>
                      <div className="text-xs text-zinc-400">
                        {state.actorCredits} film & series credits
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={state.energy < 6}
                    onClick={() => {
                      onQuickAction('act_role');
                      setModal(null);
                    }}
                    className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 font-extrabold text-zinc-950"
                  >
                    Film Guest / Lead Scene (-6 ⚡ · +{formatMoney(4500 + state.fameLevel * 7500)})
                  </button>
                </div>
              )}

              {modal === 'actions' && (
                <div className="space-y-2">
                  {[
                    {
                      key: 'rest',
                      label: 'Rest & Recover Energy',
                      sub: 'Restore full energy (+15 ⚡) · Free',
                      icon: Coffee,
                    },
                    {
                      key: 'vocal_coach',
                      label: 'Vocal & Songwriting Drill',
                      sub: 'Boost next song quality & +1.4 Popularity (-4 ⚡, $500)',
                      icon: Mic2,
                    },
                    {
                      key: 'press_run',
                      label: 'Late-Night Radio Interview',
                      sub: '+2.8 Popularity & +15K followers (-6 ⚡)',
                      icon: Sparkles,
                    },
                    {
                      key: 'gym',
                      label: 'Studio Workout & Reset',
                      sub: '+6 ⚡ & reduce street heat (-$250)',
                      icon: Flame,
                    },
                  ].map((act) => (
                    <button
                      key={act.key}
                      type="button"
                      onClick={() => {
                        onQuickAction(act.key);
                        setModal(null);
                      }}
                      className="w-full p-3 rounded-xl bg-[#1a1d26] hover:bg-[#222632] border border-white/[0.05] flex items-center gap-3 text-left"
                    >
                      <act.icon className="w-5 h-5 text-amber-400 shrink-0" />
                      <div>
                        <div className="font-bold text-white">{act.label}</div>
                        <div className="text-xs text-zinc-400">{act.sub}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {modal === 'artists' && (
                <div className="space-y-2">
                  {state.npcs.map((npc) => (
                    <div
                      key={npc.id}
                      className="p-3 rounded-xl bg-[#1a1d26] border border-white/[0.05] flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0"
                          style={{ backgroundColor: npc.avatarColor }}
                        >
                          {npc.initials}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-white truncate">{npc.name}</div>
                          <div className="text-xs text-zinc-400">
                            {npc.genre} · {formatCompactNumber(npc.monthlyListeners)} listeners ·{' '}
                            <span className="capitalize text-amber-400">{npc.relationship}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onQuickAction('befriend_npc', { npcId: npc.id })}
                        className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-bold text-white shrink-0"
                      >
                        Link Up
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {modal === 'stats' && (
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ['Total Streams', formatCompactNumber(state.careerStats.totalStreams)],
                    ['Hot 100 Entries', String(state.careerStats.hot100Entries)],
                    ['#1 Chart Hits', String(state.careerStats.numberOneHits)],
                    ['Songs Released', String(state.careerStats.songsReleased)],
                    ['Music Videos', String(state.careerStats.videosShot)],
                    ['Tours Done', String(state.careerStats.toursCompleted)],
                    ['Best Week', formatCompactNumber(state.careerStats.highestWeeklyStreams)],
                    ['Awards Won', String(state.careerStats.grammyAwards)],
                  ].map(([k, v]) => (
                    <div key={k} className="p-3 rounded-xl bg-[#1a1d26] border border-white/[0.05]">
                      <div className="text-[11px] text-zinc-400">{k}</div>
                      <div className="font-mono-num text-lg font-extrabold text-white tabular-nums mt-0.5">
                        {v}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {modal === 'crime' && (
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-rose-950/35 border border-rose-500/20 flex items-center justify-between">
                    <span className="text-xs text-rose-200 font-semibold">Current Heat Level</span>
                    <span className="font-mono-num font-bold text-rose-400 tabular-nums">{state.heatLevel}%</span>
                  </div>
                  {[
                    { id: 'bootleg', title: 'Sell Unreleased Leaks', reward: 4500, heat: 15 },
                    { id: 'crypto_promo', title: 'Shady Crypto Promo Deal', reward: 22000, heat: 28 },
                    { id: 'high_stakes', title: 'High-Stakes Underground Dice', reward: 65000, heat: 42 },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      disabled={state.energy < 4}
                      onClick={() => {
                        onQuickAction('crime_hustle', {
                          reward: c.reward,
                          heat: c.heat,
                          title: c.title,
                        });
                        setModal(null);
                      }}
                      className="w-full p-3 rounded-xl bg-[#1a1d26] hover:bg-[#261a24] border border-white/[0.05] flex items-center justify-between text-left"
                    >
                      <div>
                        <div className="font-bold text-white">{c.title}</div>
                        <div className="text-xs text-rose-400">+{c.heat}% Heat · High Risk</div>
                      </div>
                      <div className="font-mono-num font-bold text-emerald-400 tabular-nums">
                        +{formatMoney(c.reward)}
                      </div>
                    </button>
                  ))}
                  {state.heatLevel > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        onQuickAction('lay_low');
                        setModal(null);
                      }}
                      className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" /> Pay Lawyers to Clear Heat ($2,500)
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
