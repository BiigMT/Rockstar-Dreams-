import React, { useState } from 'react';
import {
  ArrowRight,
  Building2,
  Car,
  ChevronRight,
  Crown,
  Factory,
  Gem,
  Shirt,
  X,
  Check,
} from 'lucide-react';
import {
  CLOTHES_CATALOG,
  FACTORIES_CATALOG,
  JEWELRY_CATALOG,
  REAL_ESTATE_CATALOG,
  RECORD_LABELS,
  VEHICLES_CATALOG,
} from '../../data/gameCatalog';
import { CatalogItem, GameState } from '../../types/game';
import { formatMoney } from '../../engine/simulation';

interface WorldTabProps {
  state: GameState;
  onBuyCatalogItem: (item: CatalogItem) => void;
  onEquipClothing: (itemId: string) => void;
  onToggleJewelry: (itemId: string) => void;
  onSignLabel: (labelId: string) => void;
  onWorkJob: (jobTitle: string, pay: number, energyCost: number) => void;
  onStartTour: (tourName: string, venueTier: string, cities: number, ticketPrice: number, upfrontCost: number) => void;
}

type WorldModal =
  | null
  | 'vehicle'
  | 'realestate'
  | 'clothes'
  | 'jewelry'
  | 'factory'
  | 'labels'
  | 'job'
  | 'tours';

export const WorldTab: React.FC<WorldTabProps> = ({
  state,
  onBuyCatalogItem,
  onEquipClothing,
  onToggleJewelry,
  onSignLabel,
  onWorkJob,
  onStartTour,
}) => {
  const [modal, setModal] = useState<WorldModal>(null);

  const factoryWeeklySpending = FACTORIES_CATALOG
    .filter((f) => state.ownedFactories.includes(f.id))
    .reduce((acc, f) => acc + f.weeklyCost, 0);

  const getCatalogList = (): CatalogItem[] => {
    switch (modal) {
      case 'vehicle':
        return VEHICLES_CATALOG;
      case 'realestate':
        return REAL_ESTATE_CATALOG;
      case 'clothes':
        return CLOTHES_CATALOG;
      case 'jewelry':
        return JEWELRY_CATALOG;
      case 'factory':
        return FACTORIES_CATALOG;
      default:
        return [];
    }
  };

  const isOwned = (item: CatalogItem): boolean => {
    switch (item.category) {
      case 'vehicle':
        return state.ownedVehicles.includes(item.id);
      case 'realestate':
        return state.ownedRealEstate.includes(item.id);
      case 'clothes':
        return state.ownedClothes.includes(item.id);
      case 'jewelry':
        return state.ownedJewelry.includes(item.id);
      case 'factory':
        return state.ownedFactories.includes(item.id);
    }
  };

  const statusPct = Math.min(100, (state.statusPoints / Math.max(1, state.statusTarget)) * 100);

  return (
    <div className="flex-1 overflow-y-auto slim-scroll px-3.5 py-3 space-y-3">
      {/* Crown Status Bar */}
      <div className="pad-card rounded-2xl px-4 py-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Crown className="w-5 h-5 text-amber-400 fill-amber-400/20 shrink-0" />
            <span className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
              MOGUL STATUS
            </span>
          </div>
          <div className="font-mono-num text-[14px] font-extrabold text-white tabular-nums">
            {state.statusPoints.toLocaleString()}{' '}
            <span className="text-zinc-500 text-xs">/ {state.statusTarget.toLocaleString()}</span>
          </div>
        </div>
        <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-amber-400 snap-transition"
            style={{ width: `${Math.max(2, statusPct)}%` }}
          />
        </div>
      </div>

      {/* 2x2 Lifestyle Grid */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setModal('vehicle')}
          className="pad-card pad-card-hover rounded-xl p-3 text-left snap-transition"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/25 flex items-center justify-center text-rose-400">
              <Car className="w-4 h-4" />
            </div>
            <span className="text-[12px] font-extrabold text-white tracking-wider">
              VEHICLES
            </span>
          </div>
          <div className="font-mono-num text-[13px] font-bold text-zinc-400 tabular-nums">
            {state.ownedVehicles.length} / 47
          </div>
        </button>

        <button
          type="button"
          onClick={() => setModal('realestate')}
          className="pad-card pad-card-hover rounded-xl p-3 text-left snap-transition"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="text-[12px] font-extrabold text-white tracking-wider">
              REAL ESTATE
            </span>
          </div>
          <div className="font-mono-num text-[13px] font-bold text-zinc-400 tabular-nums">
            {state.ownedRealEstate.length} / 50
          </div>
        </button>

        <button
          type="button"
          onClick={() => setModal('clothes')}
          className="pad-card pad-card-hover rounded-xl p-3 text-left snap-transition"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400/15 border border-amber-400/25 flex items-center justify-center text-amber-400">
              <Shirt className="w-4 h-4" />
            </div>
            <span className="text-[12px] font-extrabold text-white tracking-wider">
              CLOTHES
            </span>
          </div>
          <div className="font-mono-num text-[13px] font-bold text-zinc-400 tabular-nums">
            {state.ownedClothes.length} / 57
          </div>
        </button>

        <button
          type="button"
          onClick={() => setModal('jewelry')}
          className="pad-card pad-card-hover rounded-xl p-3 text-left snap-transition"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/25 flex items-center justify-center text-sky-400">
              <Gem className="w-4 h-4" />
            </div>
            <span className="text-[12px] font-extrabold text-white tracking-wider">
              JEWELRY
            </span>
          </div>
          <div className="font-mono-num text-[13px] font-bold text-zinc-400 tabular-nums">
            {state.ownedJewelry.length} / 15
          </div>
        </button>
      </div>

      {/* FACTORIES */}
      <button
        type="button"
        onClick={() => setModal('factory')}
        className="w-full pad-card pad-card-hover rounded-xl px-3.5 py-3 flex items-center justify-between text-left snap-transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-400/15 border border-amber-400/25 flex items-center justify-center text-amber-400">
            <Factory className="w-5 h-5" />
          </div>
          <div>
            <div className="font-mono-num text-[14px] font-extrabold text-white tracking-wide tabular-nums">
              FACTORIES: {state.ownedFactories.length} / 12
            </div>
            <div className="text-[11px] text-zinc-400 tabular-nums">
              Spending: ${factoryWeeklySpending.toLocaleString()} / week
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-zinc-500" />
      </button>

      {/* RECORD LABEL */}
      <div>
        <div className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase px-1 mb-1.5">
          RECORD LABEL CONTRACT
        </div>
        <button
          type="button"
          onClick={() => setModal('labels')}
          className="w-full pad-card pad-card-hover rounded-2xl px-4 py-3.5 flex items-center justify-between text-left snap-transition"
        >
          <div>
            <div className="text-[16px] font-extrabold text-amber-300 tracking-wide">
              {state.contract ? state.contract.labelName.toUpperCase() : 'INDEPENDENT'}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              {state.contract
                ? `${state.contract.royaltyPercent}% split · ${state.contract.albumsDelivered}/${state.contract.albumsRequired} albums`
                : 'Click Here To see all Contracts!'}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300">
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* JOB & TOURS */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase px-1 mb-1.5">
            JOB
          </div>
          <button
            type="button"
            onClick={() => setModal('job')}
            className="w-full pad-card pad-card-hover rounded-xl px-3.5 py-3 flex items-center justify-between text-left snap-transition"
          >
            <span className="text-[13px] font-extrabold text-white">WORK</span>
            <div className="w-6 h-6 rounded-md bg-white/[0.06] flex items-center justify-center text-zinc-300">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>

        <div>
          <div className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase px-1 mb-1.5">
            TOURS
          </div>
          <button
            type="button"
            onClick={() => setModal('tours')}
            className="w-full pad-card pad-card-hover rounded-xl px-3.5 py-3 flex items-center justify-between text-left snap-transition"
          >
            <span className="text-[13px] font-extrabold text-white truncate">
              {state.activeTour ? `${state.activeTour.citiesCompleted}/${state.activeTour.citiesTotal}` : 'START'}
            </span>
            <div className="w-6 h-6 rounded-md bg-white/[0.06] flex items-center justify-center text-zinc-300 shrink-0">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      </div>

      {/* WORLD MODALS */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-3">
          <div className="w-full max-w-md bg-[#14161c] border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-[84vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07] bg-[#0e1015]">
              <h3 className="font-display text-base font-extrabold text-white uppercase">
                {modal === 'vehicle' && `Vehicles (${state.ownedVehicles.length}/47)`}
                {modal === 'realestate' && `Real Estate (${state.ownedRealEstate.length}/50)`}
                {modal === 'clothes' && `Wardrobe (${state.ownedClothes.length}/57)`}
                {modal === 'jewelry' && `Jewelry Vault (${state.ownedJewelry.length}/15)`}
                {modal === 'factory' && `Factories (${state.ownedFactories.length}/12)`}
                {modal === 'labels' && 'Record Label Contracts'}
                {modal === 'job' && 'Part-Time & Studio Jobs'}
                {modal === 'tours' && 'World Tours & Live Shows'}
              </h3>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 overflow-y-auto slim-scroll space-y-2 text-sm">
              {(modal === 'vehicle' ||
                modal === 'realestate' ||
                modal === 'clothes' ||
                modal === 'jewelry' ||
                modal === 'factory') &&
                getCatalogList().map((item) => {
                  const owned = isOwned(item);
                  const equippedCloth = item.category === 'clothes' && state.avatar.outfitId === item.id;
                  const equippedJewel = item.category === 'jewelry' && state.avatar.jewelryIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-[#1a1d26] border border-white/[0.05] flex items-center justify-between gap-2.5"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-white text-sm truncate">{item.name}</div>
                        <div className="text-[11px] text-zinc-400">
                          {item.tierLabel} · +{item.statusGain.toLocaleString()} Status
                          {item.weeklyIncome ? ` · +${formatMoney(item.weeklyIncome)}/wk` : ''}
                        </div>
                      </div>
                      {owned ? (
                        item.category === 'clothes' ? (
                          <button
                            type="button"
                            onClick={() => onEquipClothing(item.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold shrink-0 ${
                              equippedCloth
                                ? 'bg-amber-400 text-zinc-950'
                                : 'bg-white/10 hover:bg-white/20 text-white'
                            }`}
                          >
                            {equippedCloth ? 'Wearing' : 'Wear'}
                          </button>
                        ) : item.category === 'jewelry' ? (
                          <button
                            type="button"
                            onClick={() => onToggleJewelry(item.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold shrink-0 ${
                              equippedJewel
                                ? 'bg-amber-400 text-zinc-950'
                                : 'bg-white/10 hover:bg-white/20 text-white'
                            }`}
                          >
                            {equippedJewel ? 'Equipped' : 'Equip'}
                          </button>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-bold flex items-center gap-1 shrink-0">
                            <Check className="w-3 h-3" /> Owned
                          </span>
                        )
                      ) : (
                        <button
                          type="button"
                          disabled={state.cash < item.price}
                          onClick={() => onBuyCatalogItem(item)}
                          className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 disabled:opacity-35 text-zinc-950 font-mono-num text-xs font-extrabold tabular-nums shrink-0"
                        >
                          {formatMoney(item.price)}
                        </button>
                      )}
                    </div>
                  );
                })}

              {modal === 'labels' && (
                <div className="space-y-2.5">
                  {RECORD_LABELS.map((label) => {
                    const isCurrent =
                      (!state.contract && label.id === 'independent') ||
                      state.contract?.labelId === label.id;
                    const eligible = state.fameLevel >= label.minFame;
                    return (
                      <div
                        key={label.id}
                        className="p-3.5 rounded-xl bg-[#1a1d26] border border-white/[0.06] space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-extrabold text-white">{label.name}</div>
                            <div className="text-[11px] text-zinc-400">
                              {label.tier} · Requires Fame {label.minFame}
                            </div>
                          </div>
                          {label.advance > 0 && (
                            <div className="text-right">
                              <div className="font-mono-num font-bold text-emerald-400 tabular-nums">
                                +{formatMoney(label.advance)}
                              </div>
                              <div className="text-[10px] text-zinc-400">Advance</div>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-zinc-300">{label.description}</p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs text-zinc-400">
                            Royalty: <strong className="text-white">{label.royaltyPercent}%</strong> · Promo{' '}
                            <strong className="text-amber-400">{label.promoBonus}x</strong>
                          </span>
                          <button
                            type="button"
                            disabled={isCurrent || !eligible}
                            onClick={() => {
                              onSignLabel(label.id);
                              setModal(null);
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-zinc-950 text-xs font-extrabold"
                          >
                            {isCurrent ? 'Current' : eligible ? 'Sign Deal' : `Need Fame ${label.minFame}`}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {modal === 'job' && (
                <div className="space-y-2">
                  {[
                    { title: 'Coffee Shop Barista', pay: 220, energy: 4 },
                    { title: 'Audio Engineer Assistant', pay: 680, energy: 6 },
                    { title: 'Ghostwrite Commercial Jingle', pay: 1900, energy: 8 },
                  ].map((j) => (
                    <button
                      key={j.title}
                      type="button"
                      disabled={state.energy < j.energy}
                      onClick={() => {
                        onWorkJob(j.title, j.pay, j.energy);
                        setModal(null);
                      }}
                      className="w-full p-3 rounded-xl bg-[#1a1d26] hover:bg-[#222632] disabled:opacity-40 flex items-center justify-between text-left"
                    >
                      <div>
                        <div className="font-bold text-white">{j.title}</div>
                        <div className="text-xs text-amber-400">-{j.energy} ⚡</div>
                      </div>
                      <div className="font-mono-num font-bold text-emerald-400 tabular-nums">
                        +{formatMoney(j.pay)}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {modal === 'tours' && (
                <div className="space-y-2.5">
                  {state.activeTour ? (
                    <div className="p-4 rounded-xl bg-[#1a1d26] space-y-2">
                      <div className="font-extrabold text-white text-base">{state.activeTour.name}</div>
                      <div className="text-xs text-zinc-300">
                        {state.activeTour.venueTier} · {state.activeTour.citiesCompleted} /{' '}
                        {state.activeTour.citiesTotal} cities completed
                      </div>
                      <div className="font-mono-num text-sm font-bold text-emerald-400 tabular-nums">
                        Gross Earned: {formatMoney(state.activeTour.revenueEarned)}
                      </div>
                      <p className="text-xs text-zinc-400">
                        Advance Days or Weeks on the Home tab to complete tour stops!
                      </p>
                    </div>
                  ) : (
                    [
                      { name: 'Underground Club Run', tier: 'Clubs', cities: 6, ticket: 35, upfront: 4000, minFame: 1 },
                      { name: 'Theater & Hall Tour', tier: 'Theaters', cities: 12, ticket: 75, upfront: 28000, minFame: 4 },
                      { name: 'World Arena Tour', tier: 'Arenas', cities: 20, ticket: 145, upfront: 180000, minFame: 8 },
                    ].map((t) => (
                      <div key={t.name} className="p-3 rounded-xl bg-[#1a1d26] space-y-2">
                        <div className="flex justify-between">
                          <div>
                            <div className="font-bold text-white">{t.name}</div>
                            <div className="text-xs text-zinc-400">
                              {t.cities} Cities · ${t.ticket} avg ticket · Min Fame {t.minFame}
                            </div>
                          </div>
                          <span className="font-mono-num text-xs font-bold text-rose-400 tabular-nums">
                            {formatMoney(t.upfront)} setup
                          </span>
                        </div>
                        <button
                          type="button"
                          disabled={state.cash < t.upfront || state.fameLevel < t.minFame}
                          onClick={() => {
                            onStartTour(t.name, t.tier, t.cities, t.ticket, t.upfront);
                            setModal(null);
                          }}
                          className="w-full py-2 rounded-lg bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-zinc-950 text-xs font-extrabold"
                        >
                          Book & Launch Tour
                        </button>
                      </div>
                    ))
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
