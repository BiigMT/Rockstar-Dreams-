import React from 'react';
import {
  Globe,
  Heart,
  Home,
  Mic,
  Music,
  Settings,
  Smartphone,
} from 'lucide-react';
import { MainTab } from '../types/game';

interface BottomDockProps {
  activeTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  unreadBadgeCount?: number;
}

const DOCK_ITEMS: Array<{
  id: MainTab;
  label: string;
  Icon: React.FC<{ className?: string }>;
}> = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'music', label: 'Catalog', Icon: Music },
  { id: 'studio', label: 'Studio', Icon: Mic },
  { id: 'world', label: 'Empire', Icon: Globe },
  { id: 'phone', label: 'Phone', Icon: Smartphone },
  { id: 'settings', label: 'System', Icon: Settings },
  { id: 'love', label: 'Love', Icon: Heart },
];

export const BottomDock: React.FC<BottomDockProps> = ({
  activeTab,
  onSelectTab,
  unreadBadgeCount = 0,
}) => {
  return (
    <nav className="px-2.5 pb-2.5 pt-1.5 bg-[#0b0c10]/95 border-t border-white/[0.06] shrink-0">
      <div className="grid grid-cols-7 gap-1">
        {DOCK_ITEMS.map(({ id, label, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectTab(id)}
              aria-label={label}
              className={`relative py-2 rounded-xl flex flex-col items-center justify-center gap-1 snap-transition ${
                active
                  ? 'bg-amber-400/12 text-amber-400 border border-amber-400/25'
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.03] border border-transparent'
              }`}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-amber-400" />
              )}
              <Icon className="w-[18px] h-[18px] stroke-[2]" />
              <span className="text-[9px] font-bold tracking-wide leading-none">
                {label}
              </span>
              {id === 'phone' && unreadBadgeCount > 0 && (
                <span className="absolute top-1 right-1.5 min-w-[14px] h-[14px] px-1 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center tabular-nums">
                  {unreadBadgeCount > 9 ? '9+' : unreadBadgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
