import React, { useState } from 'react';
import {
  Building2,
  Car,
  Crown,
  Dumbbell,
  Factory,
  Gem,
  Home,
  Plane,
  Shirt,
  ShoppingBag,
  Sparkles,
  Ticket,
  User,
} from 'lucide-react';
import {
  CLOTHES_CATALOG,
  FACTORIES_CATALOG,
  JEWELRY_CATALOG,
  REAL_ESTATE_CATALOG,
  VEHICLES_CATALOG,
} from '../../data/gameCatalog';
import { formatCompactNumber, formatMoney, getLifestyleBonuses } from '../../engine/simulation';
import { AvatarConfig, CatalogItem, GameState, MerchItem } from '../../types/game';
import { ArtistAvatar } from '../ArtistAvatar';

interface ArtistBrandTabProps {
  state: GameState;
  onBuyCatalogItem: (item: CatalogItem) => void;
  onEquipClothing: (itemId: string) => void;
  onToggleJewelry: (itemId: string) => void;
  onUpdateAvatar: (patch: Partial<AvatarConfig>) => void;
  onStartTour: (
    name: string,
    venueTier: string,
    citiesTotal: number,
    ticketPrice: number,
    upfront: number,
    estimatedSellout: number
  ) => void;
  onLaunchMerch: (
    name: string,
    type: MerchItem['type'],
    price: number,
    eraAlbumTitle?: string
  ) => void;
  onUpgradeMerchStore: () => void;
  onQuickAction: (action: string) => void;
}

const TOUR_TIERS = [
  { tier: 'Local Clubs', cities: 6, upfront: 4000, minFame: 1, idealPrice: 40, capacity: 650 },
  { tier: 'Theaters', cities: 12, upfront: 28000, minFame: 3, idealPrice: 90, capacity: 3800 },
  { tier: 'Arenas', cities: 20, upfront: 165000, minFame: 6, idealPrice: 165, capacity: 16000 },
  { tier: 'World Stadiums', cities: 28, upfront: 650000, minFame: 9, idealPrice: 240, capacity: 42000 },
];

export const ArtistBrandTab: React.FC<ArtistBrandTabProps> = ({
  state,
  onBuyCatalogItem,
  onEquipClothing,
  onToggleJewelry,
  onUpdateAvatar,
  onStartTour,
  onLaunchMerch,
  onUpgradeMerchStore,
  onQuickAction,
}) => {
  const [subTab, setSubTab] = useState<'tour_merch' | 'lifestyle' | 'look'>('tour_merch');
  const [assetCategory, setAssetCategory] = useState<'realestate' | 'vehicle' | 'factory' | 'clothes' | 'jewelry'>('realestate');

  // Tour state
  const [tourName, setTourName] = useState(`${state.artistName} World Tour`);
  const [selectedTierIdx, setSelectedTierIdx] = useState(0);
  const [ticketPrice, setTicketPrice] = useState(40);

  // Merch state
  const [merchName, setMerchName] = useState('');
  const [merchType, setMerchType] = useState<MerchItem['type']>('Hoodie');
  const [merchPrice, setMerchPrice] = useState(65);
  const [merchEra, setMerchEra] = useState(state.albums[0]?.title || state.songs[0]?.title || 'Signature Era');

  const tier = TOUR_TIERS[selectedTierIdx];
  const priceRatio = ticketPrice / tier.idealPrice;
  const estSellout = Math.min(
    100,
    Math.max(
      28,
      Math.round((65 + state.fameLevel * 3.5 + state.hype * 0.2 + state.skills.stagePresence * 0.15) / Math.max(0.75, Math.pow(priceRatio, 0.85)))
    )
  );
  const estTourGross = Math.round(tier.cities * tier.capacity * (estSellout / 100) * ticketPrice * 0.38);
  const lifestyle = getLifestyleBonuses(state);

  const catalogMap = {
    realestate: REAL_ESTATE_CATALOG,
    vehicle: VEHICLES_CATALOG,
    factory: FACTORIES_CATALOG,
    clothes: CLOTHES_CATALOG,
    jewelry: JEWELRY_CATALOG,
  };
  const ownedSet = new Set([
    ...state.ownedRealEstate,
    ...state.ownedVehicles,
    ...state.ownedFactories,
    ...state.ownedClothes,
    ...state.ownedJewelry,
  ]);

  const merchUpgradeCost = state.merchStoreLevel * 45000;

  return (
    <div className="flex-1 min-h-0 p-2 sm:p-2.5 flex flex-col gap-2.5 overflow-y-auto lg:overflow-hidden">
      {/* Sub-tab bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {[
            { id: 'tour_merch' as const, label: 'World Touring & Merch Store', icon: Ticket },
            { id: 'lifestyle' as const, label: 'Real Estate, Jets & Factories', icon: Plane },
            { id: 'look' as const, label: 'Artist Look & Training', icon: User },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSubTab(t.id)}
                className={`px-3 py-1.5 rounded text-xs font-extrabold flex items-center gap-1.5 ${
                  subTab === t.id ? 'royal-active-tab' : 'silver-nav-tab'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            );
          })}
        </div>

        <div className="text-[11px] font-bold text-emerald-300 bg-[#091529] border border-emerald-500/30 rounded px-2.5 py-1">
          Lifestyle Recovery Bonus: +{lifestyle.energyPerDay} Energy/day · +{lifestyle.hypePerWeek} Hype/wk
        </div>
      </div>

      {/* 1. TOURING & MERCH WEBSTORE */}
      {subTab === 'tour_merch' && (
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-2.5">
          {/* Tiered Touring Engine */}
          <div className="career-panel rounded-xl p-3 flex flex-col gap-3 overflow-y-auto slim-scroll">
            <div className="flex items-center justify-between border-b border-slate-600/35 pb-2">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  Tiered World Touring
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-400">
                Tours Completed: {state.careerStats.toursCompleted}
              </span>
            </div>

            {state.activeTour ? (
              <div className="career-inset rounded-xl p-4 space-y-3 border-emerald-500/40">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-black uppercase text-emerald-400">ACTIVE TOUR</div>
                    <div className="font-display text-lg font-black text-white">{state.activeTour.name}</div>
                    <div className="text-xs text-slate-300">
                      {state.activeTour.venueTier} · ${state.activeTour.ticketPrice} Avg Ticket
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-amber-300">
                      {state.activeTour.selloutPercent}% Sold Out
                    </div>
                    <div className="font-mono-num text-base font-black text-emerald-400">
                      {formatMoney(state.activeTour.revenueEarned)}
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Tour Progress</span>
                    <span className="font-mono-num font-bold">
                      {state.activeTour.citiesCompleted} / {state.activeTour.citiesTotal} Cities
                    </span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full"
                      style={{
                        width: `${Math.round(
                          (state.activeTour.citiesCompleted / state.activeTour.citiesTotal) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Advance Day/Week/Month in the Advance Time tab to perform upcoming tour stops and collect gate revenue.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={tourName}
                  onChange={(e) => setTourName(e.target.value)}
                  placeholder="Tour Name"
                  className="w-full px-3 py-2 rounded-lg bg-[#091529] border border-slate-700 text-xs font-bold text-white"
                />

                <div className="grid grid-cols-2 gap-2">
                  {TOUR_TIERS.map((t, idx) => {
                    const locked = state.fameLevel < t.minFame;
                    const active = selectedTierIdx === idx;
                    return (
                      <button
                        key={t.tier}
                        type="button"
                        disabled={locked}
                        onClick={() => {
                          setSelectedTierIdx(idx);
                          setTicketPrice(t.idealPrice);
                        }}
                        className={`p-2.5 rounded-lg border text-left disabled:opacity-40 snap-transition ${
                          active
                            ? 'royal-active-tab'
                            : 'bg-[#091529] border-slate-700 text-slate-200 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black">{t.tier}</span>
                          <span className="text-[10px] font-bold">Fame {t.minFame}+</span>
                        </div>
                        <div className="text-[10px] opacity-85 mt-0.5">
                          {t.cities} Cities · {t.capacity.toLocaleString()} cap · Upfront {formatMoney(t.upfront)}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="career-inset rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-bold">Ticket Price:</span>
                    <span className="font-mono-num font-black text-emerald-400">${ticketPrice}</span>
                  </div>
                  <input
                    type="range"
                    min={Math.max(15, Math.round(tier.idealPrice * 0.45))}
                    max={Math.round(tier.idealPrice * 1.85)}
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(Number(e.target.value))}
                    className="w-full accent-sky-400"
                  />
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">
                      Dynamic Sell-Out Projection:{' '}
                      <strong className={estSellout >= 80 ? 'text-emerald-400' : 'text-amber-300'}>
                        {estSellout}%
                      </strong>
                    </span>
                    <span className="text-slate-400">
                      Est. Total Gross:{' '}
                      <strong className="text-white font-mono-num">{formatMoney(estTourGross)}</strong>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!tourName.trim() || state.cash < tier.upfront || state.fameLevel < tier.minFame}
                  onClick={() =>
                    onStartTour(
                      tourName.trim(),
                      tier.tier,
                      tier.cities,
                      ticketPrice,
                      tier.upfront,
                      estSellout
                    )
                  }
                  className="w-full py-2.5 rounded-lg royal-active-tab disabled:opacity-40 text-xs font-black"
                >
                  Book {tier.tier} Tour (-{formatMoney(tier.upfront)} Production Cost)
                </button>
              </div>
            )}
          </div>

          {/* Merch Webstore */}
          <div className="career-panel rounded-xl p-3 flex flex-col gap-3 overflow-y-auto slim-scroll">
            <div className="flex items-center justify-between border-b border-slate-600/35 pb-2">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  Merch Webstore · Tier {state.merchStoreLevel}/4
                </span>
              </div>
              {state.merchStoreLevel < 4 && (
                <button
                  type="button"
                  disabled={state.cash < merchUpgradeCost}
                  onClick={onUpgradeMerchStore}
                  className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 text-[11px] font-black"
                >
                  Upgrade Store ({formatMoney(merchUpgradeCost)})
                </button>
              )}
            </div>

            <div className="career-inset rounded-lg p-2.5 space-y-2">
              <div className="text-[11px] font-bold text-sky-300 uppercase">Launch Album-Era Merch Drop</div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={merchName}
                  onChange={(e) => setMerchName(e.target.value)}
                  placeholder="Item Name (e.g. Heavy Tour Hoodie)"
                  className="px-2.5 py-1.5 rounded bg-[#091529] border border-slate-700 text-xs text-white"
                />
                <select
                  value={merchType}
                  onChange={(e) => setMerchType(e.target.value as MerchItem['type'])}
                  className="px-2.5 py-1.5 rounded bg-[#091529] border border-slate-700 text-xs text-white"
                >
                  <option value="Hoodie">Heavyweight Hoodie ($28 cost)</option>
                  <option value="Tour Tee">Tour Tee ($14 cost)</option>
                  <option value="Vinyl LP">Collector Vinyl LP ($18 cost)</option>
                  <option value="Cap">Embroidered Cap ($10 cost)</option>
                  <option value="Collector Box">Deluxe Box Set ($35 cost)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-0.5">
                    Retail Price: <span className="text-emerald-400 font-mono-num">${merchPrice}</span>
                  </label>
                  <input
                    type="range"
                    min={25}
                    max={220}
                    value={merchPrice}
                    onChange={(e) => setMerchPrice(Number(e.target.value))}
                    className="w-full accent-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-0.5">
                    Tied Album / Era
                  </label>
                  <input
                    type="text"
                    value={merchEra}
                    onChange={(e) => setMerchEra(e.target.value)}
                    className="w-full px-2 py-1 rounded bg-[#091529] border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={!merchName.trim() || state.cash < 1500}
                onClick={() => {
                  onLaunchMerch(merchName.trim(), merchType, merchPrice, merchEra);
                  setMerchName('');
                }}
                className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 text-xs font-black"
              >
                Launch Merch Drop ($1,500 Setup)
              </button>
            </div>

            <div className="space-y-1.5">
              {state.merchItems.map((m) => (
                <div key={m.id} className="career-inset rounded-lg p-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">
                      {m.name} <span className="text-[10px] text-sky-300">[{m.type}]</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {m.eraAlbumTitle || 'Core Collection'} · ${m.price} retail · {formatCompactNumber(m.unitsSold)} sold
                    </div>
                  </div>
                  <div className="text-right font-mono-num font-black text-emerald-400">
                    {formatMoney(m.weeklyRevenue)}/wk
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. LIFESTYLE ASSETS, PRIVATE JETS & COMPANIES */}
      {subTab === 'lifestyle' && (
        <div className="flex-1 min-h-0 career-panel rounded-xl p-3 flex flex-col gap-2.5">
          <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-600/35 pb-2">
            {[
              { id: 'realestate' as const, label: `Real Estate (${state.ownedRealEstate.length}/50)`, icon: Home },
              { id: 'vehicle' as const, label: `Vehicles & Jets (${state.ownedVehicles.length}/47)`, icon: Car },
              { id: 'factory' as const, label: `Companies (${state.ownedFactories.length}/12)`, icon: Factory },
              { id: 'clothes' as const, label: `Wardrobe (${state.ownedClothes.length}/57)`, icon: Shirt },
              { id: 'jewelry' as const, label: `Jewelry (${state.ownedJewelry.length}/15)`, icon: Gem },
            ].map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setAssetCategory(cat.id)}
                  className={`px-3 py-1.5 rounded text-xs font-extrabold flex items-center gap-1.5 ${
                    assetCategory === cat.id ? 'royal-active-tab' : 'bg-[#091529] text-slate-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /> {cat.label}
                </button>
              );
            })}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto slim-scroll grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pr-1">
            {catalogMap[assetCategory].map((item) => {
              const owned = ownedSet.has(item.id);
              const equippedCloth = item.category === 'clothes' && state.avatar.outfitId === item.id;
              const equippedJewel = item.category === 'jewelry' && state.avatar.jewelryIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  className={`career-inset rounded-lg p-2.5 flex flex-col justify-between gap-2 ${
                    owned ? 'border-emerald-500/40' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-black uppercase text-sky-300">{item.tierLabel}</span>
                      {item.energyBonus ? (
                        <span className="text-[10px] font-black text-emerald-400">
                          +{item.energyBonus}⚡/day
                        </span>
                      ) : null}
                    </div>
                    <div className="font-bold text-sm text-white mt-0.5">{item.name}</div>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{item.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-700/50">
                    <span className="font-mono-num text-xs font-black text-amber-300">
                      {item.price === 0 ? 'Starter' : formatMoney(item.price)}
                    </span>
                    {owned ? (
                      item.category === 'clothes' ? (
                        <button
                          type="button"
                          onClick={() => onEquipClothing(item.id)}
                          className={`px-2.5 py-1 rounded text-[11px] font-extrabold ${
                            equippedCloth ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-white'
                          }`}
                        >
                          {equippedCloth ? 'Equipped' : 'Wear'}
                        </button>
                      ) : item.category === 'jewelry' ? (
                        <button
                          type="button"
                          onClick={() => onToggleJewelry(item.id)}
                          className={`px-2.5 py-1 rounded text-[11px] font-extrabold ${
                            equippedJewel ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-white'
                          }`}
                        >
                          {equippedJewel ? 'Wearing' : 'Equip'}
                        </button>
                      ) : (
                        <span className="text-[11px] font-black text-emerald-400">OWNED ✓</span>
                      )
                    ) : (
                      <button
                        type="button"
                        disabled={state.cash < item.price}
                        onClick={() => onBuyCatalogItem(item)}
                        className="px-3 py-1 rounded royal-active-tab disabled:opacity-40 text-[11px] font-black"
                      >
                        Buy
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. ARTIST LOOK & TRAINING */}
      {subTab === 'look' && (
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-2.5">
          <div className="career-panel rounded-xl p-4 flex flex-col items-center justify-between">
            <div className="text-center">
              <div className="text-xs font-black uppercase tracking-wider text-sky-300 mb-2">
                Live Stage Portrait
              </div>
              <ArtistAvatar avatar={state.avatar} size={175} />
            </div>

            <div className="w-full space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Eyewear</div>
              <div className="grid grid-cols-2 gap-1.5">
                {(['none', 'shades', 'round', 'designer'] as const).map((ew) => (
                  <button
                    key={ew}
                    type="button"
                    onClick={() => onUpdateAvatar({ eyewear: ew })}
                    className={`py-1 rounded text-xs font-bold capitalize ${
                      state.avatar.eyewear === ew ? 'royal-active-tab' : 'bg-[#091529] text-slate-300'
                    }`}
                  >
                    {ew}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="career-panel rounded-xl p-3 space-y-3 overflow-y-auto slim-scroll">
            <div className="flex items-center justify-between border-b border-slate-600/35 pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400" /> Artist Skill Profile & Bootcamps
              </span>
              <span className="text-xs text-slate-400">Reputation: {state.reputation}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { label: 'Songwriting / Lyrics', val: state.skills.songwriting, color: 'bg-sky-400' },
                { label: 'Flow & Vocals', val: state.skills.vocals, color: 'bg-emerald-400' },
                { label: 'Production & Mixing', val: state.skills.production, color: 'bg-amber-400' },
                { label: 'Stage Presence / Charisma', val: state.skills.stagePresence, color: 'bg-rose-400' },
                { label: 'Marketing & Promo', val: state.skills.marketing, color: 'bg-indigo-400' },
              ].map((sk) => (
                <div key={sk.label} className="career-inset rounded-lg p-2.5 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-white">{sk.label}</span>
                    <span className="font-mono-num font-black text-sky-300">{sk.val} / 100</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${sk.color}`} style={{ width: `${sk.val}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <button
                type="button"
                disabled={state.energy < 4 || state.cash < 500}
                onClick={() => onQuickAction('vocal_coach')}
                className="career-inset hover:border-sky-400/50 rounded-lg p-2.5 text-left disabled:opacity-40"
              >
                <div className="text-xs font-extrabold text-white">Vocal Session</div>
                <div className="text-[10px] text-sky-300">$500 · -4⚡ · +4 Vocals</div>
              </button>
              <button
                type="button"
                disabled={state.energy < 4 || state.cash < 800}
                onClick={() => onQuickAction('train_production')}
                className="career-inset hover:border-emerald-400/50 rounded-lg p-2.5 text-left disabled:opacity-40"
              >
                <div className="text-xs font-extrabold text-white">Mix Workshop</div>
                <div className="text-[10px] text-emerald-300">$800 · -4⚡ · +5 Prod</div>
              </button>
              <button
                type="button"
                disabled={state.energy < 4 || state.cash < 650}
                onClick={() => onQuickAction('stage_rehearsal')}
                className="career-inset hover:border-amber-400/50 rounded-lg p-2.5 text-left disabled:opacity-40"
              >
                <div className="text-xs font-extrabold text-white">Stage Rehearsal</div>
                <div className="text-[10px] text-amber-300">$650 · -4⚡ · +6 Stage</div>
              </button>
              <button
                type="button"
                disabled={state.cash < 250}
                onClick={() => onQuickAction('gym')}
                className="career-inset hover:border-rose-400/50 rounded-lg p-2.5 text-left disabled:opacity-40"
              >
                <div className="text-xs font-extrabold text-white flex items-center gap-1">
                  <Dumbbell className="w-3.5 h-3.5 text-rose-400" /> Gym & Spa
                </div>
                <div className="text-[10px] text-rose-300">$250 · +6⚡ · -8% Heat</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
