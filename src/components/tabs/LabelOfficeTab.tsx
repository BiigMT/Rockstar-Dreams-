import React, { useState } from 'react';
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Crown,
  Handshake,
  Sparkles,
  TrendingUp,
  UserPlus,
} from 'lucide-react';
import { RECORD_LABELS } from '../../data/gameCatalog';
import { formatCompactNumber, formatMoney } from '../../engine/simulation';
import { GameState, RecordLabel } from '../../types/game';

interface LabelOfficeTabProps {
  state: GameState;
  onNegotiateLabel: (
    label: RecordLabel,
    requestedRoyalty: number,
    requestedAdvance: number
  ) => void;
  onGoIndependent: () => void;
  onFoundPlayerLabel: (name: string) => void;
  onSignNpcToPlayerLabel: (npcId: string, labelSplitPercent: number, signingBonus: number) => void;
  onBoostLabelArtist: (npcId: string, budget: number) => void;
}

export const LabelOfficeTab: React.FC<LabelOfficeTabProps> = ({
  state,
  onNegotiateLabel,
  onGoIndependent,
  onFoundPlayerLabel,
  onSignNpcToPlayerLabel,
  onBoostLabelArtist,
}) => {
  const [selectedLabelId, setSelectedLabelId] = useState(RECORD_LABELS[2].id);
  const activeOffer =
    RECORD_LABELS.find((l) => l.id === selectedLabelId) || RECORD_LABELS[1];

  const [reqRoyalty, setReqRoyalty] = useState(activeOffer.royaltyPercent);
  const [reqAdvance, setReqAdvance] = useState(activeOffer.advance);

  const [newLabelName, setNewLabelName] = useState(`${state.artistName.split(' ')[0]} Records`);
  const [scoutFilter, setScoutFilter] = useState('');
  const [labelSplit, setLabelSplit] = useState(40);

  const selectLabel = (l: RecordLabel) => {
    setSelectedLabelId(l.id);
    setReqRoyalty(l.royaltyPercent);
    setReqAdvance(l.advance);
  };

  const canFoundLabel = state.cash >= 500000 && (state.netWorth >= 1500000 || state.fameLevel >= 7);

  const signedArtists = state.playerLabel
    ? state.npcs.filter((n) => state.playerLabel!.rosterIds.includes(n.id))
    : [];

  const scoutPool = state.npcs
    .filter((n) => !n.signedToPlayerLabel)
    .filter(
      (n) =>
        !scoutFilter.trim() ||
        n.name.toLowerCase().includes(scoutFilter.toLowerCase()) ||
        n.genre.toLowerCase().includes(scoutFilter.toLowerCase())
    )
    .slice(0, 18);

  return (
    <div className="flex-1 min-h-0 p-2 sm:p-2.5 grid grid-cols-1 lg:grid-cols-2 gap-2.5 overflow-y-auto lg:overflow-hidden">
      {/* LEFT PANEL: ARTIST CONTRACT & LABEL NEGOTIATIONS */}
      <div className="career-panel rounded-xl p-3 flex flex-col gap-3 lg:overflow-y-auto slim-scroll">
        <div className="flex items-center justify-between border-b border-slate-600/35 pb-2">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-black uppercase tracking-wider text-white">
              Artist Recording Contracts
            </span>
          </div>
          {state.contract && (
            <button
              type="button"
              onClick={onGoIndependent}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[10px] font-bold text-slate-200"
            >
              Buy Out / Go Independent
            </button>
          )}
        </div>

        {/* Current Contract Banner */}
        <div className="career-inset rounded-xl p-3 space-y-1.5 border-sky-500/35">
          <div className="text-[10px] font-black uppercase tracking-wider text-sky-300">
            Current Distribution Status
          </div>
          {state.contract ? (
            <>
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-black text-white">
                  {state.contract.labelName}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-black">
                  {state.contract.royaltyPercent}% Masters Split
                </span>
              </div>
              <div className="text-xs text-slate-300 flex items-center justify-between">
                <span>
                  Albums Delivered: {state.contract.albumsDelivered} / {state.contract.albumsRequired}
                </span>
                <span>Promo Multiplier: {state.contract.promoBonus}x</span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-black text-emerald-300">INDEPENDENT ARTIST</span>
              <span className="text-xs font-bold text-slate-300">100% Masters & Royalties</span>
            </div>
          )}
        </div>

        {/* Major Label Offers & Negotiation Slider */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase text-slate-400">
            Label Partners (Select to Negotiate Terms)
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {RECORD_LABELS.filter((l) => l.id !== 'independent').map((l) => {
              const locked = state.fameLevel < l.minFame;
              const selected = selectedLabelId === l.id;
              return (
                <button
                  key={l.id}
                  type="button"
                  disabled={locked}
                  onClick={() => selectLabel(l)}
                  className={`p-2.5 rounded-lg border text-left disabled:opacity-40 snap-transition ${
                    selected ? 'royal-active-tab' : 'bg-[#091529] border-slate-700 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black truncate">{l.name}</span>
                    <span className="text-[9px] font-bold opacity-85">Fame {l.minFame}+</span>
                  </div>
                  <div className="text-[10px] opacity-85 mt-0.5">
                    {formatMoney(l.advance)} · {l.royaltyPercent}% Split · {l.promoBonus}x Promo
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Negotiation Table */}
        <div className="career-inset rounded-xl p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-white flex items-center gap-1.5">
              <Handshake className="w-4 h-4 text-amber-400" /> Negotiate with {activeOffer.name}
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {activeOffer.albumsRequired} Album Commitment
            </span>
          </div>

          <p className="text-[11px] text-slate-300">{activeOffer.description}</p>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-semibold">Your Royalty Share:</span>
              <span className="font-mono-num font-black text-emerald-400">{reqRoyalty}%</span>
            </div>
            <input
              type="range"
              min={Math.max(20, activeOffer.royaltyPercent - 15)}
              max={Math.min(85, activeOffer.royaltyPercent + 22)}
              value={reqRoyalty}
              onChange={(e) => setReqRoyalty(Number(e.target.value))}
              className="w-full accent-emerald-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-semibold">Requested Signing Advance:</span>
              <span className="font-mono-num font-black text-amber-300">{formatMoney(reqAdvance)}</span>
            </div>
            <input
              type="range"
              min={Math.round(activeOffer.advance * 0.6)}
              max={Math.round(activeOffer.advance * 1.65)}
              step={Math.max(5000, Math.round(activeOffer.advance * 0.05))}
              value={reqAdvance}
              onChange={(e) => setReqAdvance(Number(e.target.value))}
              className="w-full accent-amber-400"
            />
          </div>

          <button
            type="button"
            disabled={state.fameLevel < activeOffer.minFame}
            onClick={() => onNegotiateLabel(activeOffer, reqRoyalty, reqAdvance)}
            className="w-full py-2.5 rounded-lg royal-active-tab disabled:opacity-40 text-xs font-black"
          >
            Submit Counter-Offer & Sign ({reqRoyalty}% Split · {formatMoney(reqAdvance)})
          </button>
        </div>
      </div>

      {/* RIGHT PANEL: FOUND RECORD LABEL & ROSTER MANAGEMENT EMPIRE */}
      <div className="career-panel rounded-xl p-3 flex flex-col gap-3 min-h-0">
        <div className="flex items-center justify-between border-b border-slate-600/35 pb-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black uppercase tracking-wider text-white">
              Executive Record Label HQ
            </span>
          </div>
          {state.playerLabel && (
            <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[10px] font-black">
              Revenue: {formatMoney(state.playerLabel.totalRevenue)}
            </span>
          )}
        </div>

        {!state.playerLabel ? (
          <div className="flex-1 flex flex-col justify-center career-inset rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                <Crown className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <h3 className="font-display text-lg font-black text-white">Found Your Own Record Label</h3>
                <p className="text-xs text-slate-300">
                  Scout & sign any of the {state.npcs.length} active AI artists, collect weekly royalty cuts, and build a music conglomerate.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded bg-[#091529] border border-slate-700">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Requirement</div>
                <div className="font-bold text-white mt-0.5">Fame Lv.7+ OR $1.5M Worth</div>
              </div>
              <div className="p-2.5 rounded bg-[#091529] border border-slate-700">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Startup Capital</div>
                <div className="font-mono-num font-black text-emerald-400 mt-0.5">$500,000</div>
              </div>
            </div>

            <input
              type="text"
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              placeholder="Imprint Name (e.g. Black Crown Music)"
              className="w-full px-3 py-2 rounded-lg bg-[#091529] border border-slate-700 text-xs font-bold text-white"
            />

            <button
              type="button"
              disabled={!canFoundLabel || !newLabelName.trim()}
              onClick={() => onFoundPlayerLabel(newLabelName.trim())}
              className="w-full py-3 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black text-xs"
            >
              {canFoundLabel
                ? `Incorporate "${newLabelName.trim()}" (-$500K)`
                : `Need Fame 7+ (or $1.5M Net Worth) & $500K Cash`}
            </button>
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col gap-2.5">
            {/* Active Signed Roster */}
            <div className="career-inset rounded-lg p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-300 uppercase">
                  {state.playerLabel.name} Roster ({signedArtists.length} Signed)
                </span>
                <span className="text-[10px] text-slate-400">Pays weekly royalties automatically</span>
              </div>

              {signedArtists.length === 0 ? (
                <div className="text-xs text-slate-400 py-2">
                  No artists signed yet. Scout talent below to start collecting roster royalties!
                </div>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto slim-scroll">
                  {signedArtists.map((art) => (
                    <div
                      key={art.id}
                      className="p-2 rounded bg-[#091529] border border-emerald-500/30 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0"
                          style={{ backgroundColor: art.avatarColor }}
                        >
                          {art.initials}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-white truncate">{art.name}</div>
                          <div className="text-[10px] text-slate-400">
                            {art.genre} · {formatCompactNumber(art.monthlyListeners)}/mo ·{' '}
                            <span className="text-emerald-300">{art.playerLabelSplit || 40}% Label Cut</span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={state.cash < 25000}
                        onClick={() => onBoostLabelArtist(art.id, 25000)}
                        className="px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-[10px] font-black text-white flex items-center gap-1 shrink-0"
                      >
                        <TrendingUp className="w-3 h-3" /> Promo ($25K)
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* A&R Scouting Pool */}
            <div className="flex items-center justify-between gap-2">
              <input
                type="text"
                value={scoutFilter}
                onChange={(e) => setScoutFilter(e.target.value)}
                placeholder="Scout NPC artists by name or genre..."
                className="flex-1 px-2.5 py-1.5 rounded bg-[#091529] border border-slate-700 text-xs text-white"
              />
              <div className="flex items-center gap-1.5 text-[11px] shrink-0">
                <span className="text-slate-400 font-bold">Cut:</span>
                <select
                  value={labelSplit}
                  onChange={(e) => setLabelSplit(Number(e.target.value))}
                  className="px-2 py-1.5 rounded bg-[#091529] border border-slate-700 text-xs font-bold text-emerald-300"
                >
                  <option value={30}>30% Label</option>
                  <option value={45}>45% Label</option>
                  <option value={60}>60% Label</option>
                </select>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto slim-scroll space-y-1.5 pr-1">
              {scoutPool.map((npc) => {
                const signingBonus = Math.round(npc.featFee * 2.5);
                return (
                  <div
                    key={npc.id}
                    className="career-inset rounded-lg p-2 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0"
                        style={{ backgroundColor: npc.avatarColor }}
                      >
                        {npc.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-white truncate">
                          {npc.name}{' '}
                          <span className="text-[10px] text-sky-300 font-semibold">
                            [{npc.tier || `Fame ${npc.fame}`}]
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {npc.genre} · {formatCompactNumber(npc.monthlyListeners)} listeners
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={state.cash < signingBonus}
                      onClick={() => onSignNpcToPlayerLabel(npc.id, labelSplit, signingBonus)}
                      className="px-2.5 py-1.5 rounded royal-active-tab disabled:opacity-40 text-[10px] font-black flex items-center gap-1 shrink-0"
                    >
                      <UserPlus className="w-3 h-3" /> Sign ({formatMoney(signingBonus)})
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
