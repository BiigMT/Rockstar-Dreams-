import React from 'react';
import { Pause, Play, Radio } from 'lucide-react';
import { GameState, Song } from '../types/game';
import { formatCompactNumber, getHot100Songs } from '../engine/simulation';

interface BottomNewsTickerProps {
  state: GameState;
  nowPlayingSong: Song | null;
  onPlaySong: (songId: string) => void;
  onNextStory?: () => void;
}

export const BottomNewsTicker: React.FC<BottomNewsTickerProps> = ({
  state,
  nowPlayingSong,
  onPlaySong,
  onNextStory,
}) => {
  const hot1 = getHot100Songs(state)[0];
  const recentPosts = state.posts.slice(0, 6);
  const recentNotifs = state.notifications.slice(0, 4);

  const headlines: string[] = [
    ...recentNotifs.map((n) => `${n.title.toUpperCase()}: ${n.detail}`),
    ...recentPosts.map((p) =>
      p.headline
        ? p.headline.toUpperCase()
        : `${p.authorName.toUpperCase()}: ${p.content.slice(0, 88)}`
    ),
    hot1
      ? `BILLBOARD HOT 100 #1: "${hot1.title.toUpperCase()}" BY ${hot1.artistLine.toUpperCase()} (${formatCompactNumber(hot1.weeklyStreams)} WEEKLY STREAMS)`
      : 'GLOBAL MUSIC CHARTS UPDATED LIVE',
  ];

  const tickerText = headlines.join('   ❯❯   ');

  return (
    <footer className="shrink-0 bg-[#050a14] border-t border-slate-700/70 select-none">
      {/* Scrolling Breaking News Marquee */}
      <div className="bg-black/90 border-b border-slate-800/90 py-1 px-3 flex items-center gap-3 overflow-hidden">
        <span className="px-2 py-0.5 rounded bg-red-700 text-[10px] font-black tracking-wider text-white uppercase shrink-0">
          BREAKING MUSIC NEWS
        </span>
        <div className="flex-1 overflow-hidden relative">
          <div className="ticker-marquee text-[11px] font-bold tracking-wide text-amber-200 whitespace-nowrap">
            <span className="pr-12">{tickerText}</span>
            <span className="pr-12">{tickerText}</span>
          </div>
        </div>
      </div>

      {/* Console Footer Strip + Mini Synth Player */}
      <div className="px-3 py-1 flex items-center justify-between text-[11px] text-slate-300 gap-2">
        <div className="flex items-center gap-3 overflow-x-auto slim-scroll whitespace-nowrap">
          <span className="text-slate-400 font-semibold">
            <strong className="text-sky-300">Mode:</strong> {state.difficulty}
          </span>
          <span className="text-slate-400 font-semibold hidden sm:inline">
            <strong className="text-emerald-300">Label:</strong>{' '}
            {state.playerLabel
              ? `${state.playerLabel.name} (${state.playerLabel.rosterIds.length} Artists)`
              : state.contract
              ? state.contract.labelName
              : 'Independent (100% Masters)'}
          </span>
          {onNextStory && (
            <button
              type="button"
              onClick={onNextStory}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-200 border border-slate-600/50"
            >
              R: Cycle News Headline
            </button>
          )}
        </div>

        {/* Audio Player Indicator */}
        {nowPlayingSong ? (
          <div className="flex items-center gap-2 shrink-0 bg-[#0d1f3d] border border-sky-500/30 rounded px-2 py-0.5">
            <Radio className={`w-3 h-3 ${state.isAudioPlaying ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
            <span className="text-[10px] font-bold text-white truncate max-w-[140px]">
              {nowPlayingSong.title}
            </span>
            <button
              type="button"
              onClick={() => onPlaySong(nowPlayingSong.id)}
              className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center"
            >
              {state.isAudioPlaying ? (
                <Pause className="w-3 h-3 fill-current" />
              ) : (
                <Play className="w-3 h-3 fill-current ml-0.5" />
              )}
            </button>
          </div>
        ) : (
          <span className="text-[10px] text-slate-500 font-mono-num shrink-0">
            Fame Lv.{state.fameLevel} · {state.plaques.length} Plaques · {state.npcs.length} Active Artists
          </span>
        )}
      </div>
    </footer>
  );
};
