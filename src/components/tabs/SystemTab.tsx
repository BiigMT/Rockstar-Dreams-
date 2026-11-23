import React, { useState } from 'react';
import {
  Download,
  RotateCcw,
  Save,
  Shield,
  Upload,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { DIFFICULTY_CONFIGS } from '../../data/gameCatalog';
import { formatDateDot, formatMoney } from '../../engine/simulation';
import { GameState } from '../../types/game';

interface SystemTabProps {
  state: GameState;
  onToggleMute: () => void;
  onResetCareer: () => void;
  onImportState: (next: GameState) => void;
  onNotify: (msg: string) => void;
}

const SLOT_KEYS = ['rockstar_slot_1', 'rockstar_slot_2', 'rockstar_slot_3'];

export const SystemTab: React.FC<SystemTabProps> = ({
  state,
  onToggleMute,
  onResetCareer,
  onImportState,
  onNotify,
}) => {
  const [slotTick, setSlotTick] = useState(0);
  const [confirmReset, setConfirmReset] = useState(false);

  const diff = DIFFICULTY_CONFIGS[state.difficulty || 'Realistic'];

  const readSlotSummary = (key: string) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as GameState;
      return `${parsed.artistName} · ${formatDateDot(parsed.date)} · ${formatMoney(parsed.cash)}`;
    } catch {
      return null;
    }
  };

  const handleSaveSlot = (key: string, num: number) => {
    localStorage.setItem(key, JSON.stringify(state));
    setSlotTick((t) => t + 1);
    onNotify(`Saved career to Slot ${num}`);
  };

  const handleLoadSlot = (key: string, num: number) => {
    const raw = localStorage.getItem(key);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as GameState;
      onImportState(parsed);
      onNotify(`Loaded Save Slot ${num}`);
    } catch {
      onNotify('Save slot data corrupted.');
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.artistName.toLowerCase().replace(/\s+/g, '_')}_career.json`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify('Exported career JSON save!');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as GameState;
        if (parsed && parsed.artistName && parsed.date) {
          onImportState(parsed);
          onNotify(`Imported "${parsed.artistName}" career!`);
        }
      } catch {
        onNotify('Invalid JSON save file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 min-h-0 p-2 sm:p-2.5 grid grid-cols-1 lg:grid-cols-2 gap-2.5 overflow-y-auto">
      {/* Save Slots & Backup */}
      <div className="career-panel rounded-xl p-4 space-y-3" data-tick={slotTick}>
        <div className="text-xs font-black uppercase tracking-wider text-sky-300 border-b border-slate-600/35 pb-2">
          Save Management (Auto-Saved Continuously)
        </div>

        <div className="space-y-2">
          {SLOT_KEYS.map((key, idx) => {
            const summary = readSlotSummary(key);
            return (
              <div
                key={key}
                className="career-inset rounded-lg p-2.5 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="text-xs font-black text-white">Save Slot {idx + 1}</div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {summary || 'Empty Slot'}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSaveSlot(key, idx + 1)}
                    className="px-2.5 py-1 rounded royal-active-tab text-xs font-bold flex items-center gap-1"
                  >
                    <Save className="w-3 h-3" /> Save
                  </button>
                  {summary && (
                    <button
                      type="button"
                      onClick={() => handleLoadSlot(key, idx + 1)}
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                    >
                      Load
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onClick={handleExport}
            className="py-2 rounded-lg bg-[#091529] hover:bg-[#102446] border border-slate-600 text-xs font-bold text-white flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" /> Export JSON Backup
          </button>

          <label className="py-2 rounded-lg bg-[#091529] hover:bg-[#102446] border border-slate-600 text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-emerald-400" /> Import JSON Save
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>
        </div>
      </div>

      {/* Career Rules, Audio & Reset */}
      <div className="career-panel rounded-xl p-4 space-y-3">
        <div className="text-xs font-black uppercase tracking-wider text-sky-300 border-b border-slate-600/35 pb-2">
          System Preferences & Career Status
        </div>

        <div className="career-inset rounded-lg p-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-sky-400" /> Active Difficulty
            </span>
            <span
              className="px-2 py-0.5 rounded text-[10px] font-black text-white uppercase"
              style={{ backgroundColor: diff.badgeColor }}
            >
              {diff.label}
            </span>
          </div>
          <p className="text-xs text-slate-300">{diff.description}</p>
        </div>

        <button
          type="button"
          onClick={onToggleMute}
          className="w-full p-3 career-inset hover:border-sky-400/50 rounded-lg flex items-center justify-between text-xs font-bold text-white"
        >
          <span className="flex items-center gap-2">
            {state.muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            Web Audio Synth Engine
          </span>
          <span className={state.muted ? 'text-rose-400' : 'text-emerald-400'}>
            {state.muted ? 'Muted' : 'Active'}
          </span>
        </button>

        {!confirmReset ? (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="w-full py-2.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/40 text-xs font-black text-rose-200 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Return to Title Screen / New Career
          </button>
        ) : (
          <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/50 space-y-2">
            <div className="text-xs font-bold text-rose-200">
              Return to Title Screen? (Make sure you saved to a slot if you want to keep this run)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="py-1.5 rounded bg-slate-800 text-xs font-bold text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onResetCareer}
                className="py-1.5 rounded bg-rose-600 text-xs font-black text-white"
              >
                Confirm Exit to Title
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
