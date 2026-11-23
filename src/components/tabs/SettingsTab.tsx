import React, { useRef, useState } from 'react';
import { Download, RotateCcw, Save, Upload, UserPlus, Volume2, VolumeX } from 'lucide-react';
import { GameState } from '../../types/game';

interface SettingsTabProps {
  state: GameState;
  onToggleMute: () => void;
  onSaveSlot: (slotIndex: number) => void;
  onLoadSlot: (slotIndex: number) => void;
  onNewCareer: () => void;
  onLoadPreset: () => void;
  onImportState: (jsonText: string) => boolean;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  state,
  onToggleMute,
  onSaveSlot,
  onLoadSlot,
  onNewCareer,
  onLoadPreset,
  onImportState,
}) => {
  const [feedback, setFeedback] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rockstar_${state.artistName.toLowerCase().replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setFeedback('Exported save file.');
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const ok = onImportState(reader.result);
        setFeedback(ok ? 'Save imported successfully!' : 'Invalid save JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 overflow-y-auto slim-scroll px-3.5 py-3 space-y-3">
      <div className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase px-1">
        SYSTEM & SAVES
      </div>

      {feedback && (
        <div className="px-3.5 py-2 rounded-xl bg-amber-400/15 border border-amber-400/30 text-xs font-semibold text-amber-300">
          {feedback}
        </div>
      )}

      {/* Audio */}
      <button
        type="button"
        onClick={onToggleMute}
        className="w-full pad-card pad-card-hover rounded-xl p-3.5 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          {state.muted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-amber-400" />}
          <div className="text-left">
            <div className="font-bold text-white text-sm">Audio & Beat Synth</div>
            <div className="text-xs text-zinc-400">
              {state.muted ? 'Muted' : 'Active (Web Audio Engine)'}
            </div>
          </div>
        </div>
        <span className="font-mono-num text-xs font-extrabold text-amber-400">
          {state.muted ? 'OFF' : 'ON'}
        </span>
      </button>

      {/* Manual Save Slots */}
      <div className="pad-card rounded-2xl p-3.5 space-y-2.5">
        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
          Local Save Slots
        </div>
        {[1, 2, 3].map((slot) => {
          const raw = typeof window !== 'undefined' ? localStorage.getItem(`rockstar_slot_${slot}`) : null;
          let label = 'Empty Slot';
          if (raw) {
            try {
              const parsed = JSON.parse(raw) as GameState;
              label = `${parsed.artistName} · ${parsed.date.year}`;
            } catch {
              label = 'Saved Career';
            }
          }
          return (
            <div key={slot} className="p-2.5 rounded-xl bg-[#0e1015] border border-white/[0.05] flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs font-bold text-white">Slot {slot}</div>
                <div className="text-[11px] text-zinc-400 truncate">{label}</div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    onSaveSlot(slot);
                    setFeedback(`Saved to Slot ${slot}.`);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-400 text-zinc-950 text-xs font-extrabold flex items-center gap-1"
                >
                  <Save className="w-3 h-3" /> Save
                </button>
                {raw && (
                  <button
                    type="button"
                    onClick={() => {
                      onLoadSlot(slot);
                      setFeedback(`Loaded Slot ${slot}.`);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
                  >
                    Load
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* JSON Export / Import */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleExport}
          className="pad-card pad-card-hover rounded-xl p-3 flex items-center justify-center gap-2 text-xs font-bold text-white"
        >
          <Download className="w-4 h-4 text-amber-400" /> Export Save
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="pad-card pad-card-hover rounded-xl p-3 flex items-center justify-center gap-2 text-xs font-bold text-white"
        >
          <Upload className="w-4 h-4 text-sky-400" /> Import Save
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          onChange={handleFileImport}
          className="hidden"
        />
      </div>

      {/* Career Switchers */}
      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={onNewCareer}
          className="w-full py-3 rounded-xl pad-card pad-card-hover text-white text-xs font-extrabold flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4 text-amber-400" /> Start New Artist Career
        </button>
        <button
          type="button"
          onClick={onLoadPreset}
          className="w-full py-3 rounded-xl pad-card pad-card-hover text-zinc-300 text-xs font-bold flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4 text-rose-400" /> Reset to Biig MT (2027) Showcase
        </button>
      </div>
    </div>
  );
};
