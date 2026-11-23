import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  DollarSign,
  Newspaper,
  Search,
  SquarePen,
  CheckCircle2,
  Send,
} from 'lucide-react';
import { EmailMessage, GameState } from '../../../types/game';

interface MailAppProps {
  state: GameState;
  onBackHome: () => void;
  onReadEmail: (emailId: string) => void;
  onEmailAction: (email: EmailMessage) => void;
}

export const MailApp: React.FC<MailAppProps> = ({
  state,
  onBackHome,
  onReadEmail,
  onEmailAction,
}) => {
  const [filter, setFilter] = useState<'primary' | 'deals' | 'news' | 'media'>('primary');
  const [search, setSearch] = useState('');
  const [openEmailId, setOpenEmailId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const filtered = state.emails.filter((m) => {
    const matchesSearch =
      !search.trim() ||
      m.fromName.toLowerCase().includes(search.toLowerCase()) ||
      m.subject.toLowerCase().includes(search.toLowerCase()) ||
      m.preview.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'primary') return m.category === 'primary' || m.category === 'deals';
    return m.category === filter;
  });

  const openEmail = state.emails.find((e) => e.id === openEmailId) || null;

  if (openEmail) {
    return (
      <div className="h-full bg-black text-white flex flex-col">
        <div className="px-3 pt-3 pb-2 flex items-center justify-between border-b border-white/10">
          <button
            type="button"
            onClick={() => setOpenEmailId(null)}
            className="flex items-center gap-0.5 text-[#0a84ff] text-sm font-medium"
          >
            <ChevronLeft className="w-5 h-5" /> Inbox
          </button>
          <span className="text-xs text-slate-400">{openEmail.dateLabel}</span>
        </div>

        <div className="flex-1 overflow-y-auto slim-scroll p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0"
              style={{ backgroundColor: openEmail.avatarColor }}
            >
              {openEmail.initials}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-white text-sm truncate">{openEmail.fromName}</div>
              <div className="text-xs text-slate-400 truncate">{openEmail.fromEmail}</div>
            </div>
          </div>

          <h2 className="text-lg font-bold text-white leading-snug">{openEmail.subject}</h2>
          <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
            {openEmail.body}
          </p>

          {openEmail.actionType === 'accept_feat' && (
            <div className="pt-2">
              {openEmail.actionCompleted ? (
                <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Studio session locked in! Check Studio &gt; Songs.
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onEmailAction(openEmail)}
                  className="w-full py-2.5 rounded-xl bg-[#0a84ff] hover:bg-[#2492ff] text-white text-xs font-bold"
                >
                  Accept Studio Collab Session
                </button>
              )}
            </div>
          )}

          {openEmail.actionType === 'reply_fan' && (
            <div className="pt-3 border-t border-white/10 space-y-2">
              {openEmail.actionCompleted ? (
                <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Reply sent! (+0.4 Popularity)
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a quick reply..."
                    className="flex-1 px-3 py-2 rounded-xl bg-[#1c1c1e] text-xs text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onEmailAction(openEmail);
                      setReplyText('');
                    }}
                    className="px-3 py-2 rounded-xl bg-[#0a84ff] text-white text-xs font-bold flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" /> Reply
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-black text-white flex flex-col">
      {/* Top iOS Mail Navigation */}
      <div className="px-3 pt-2.5 pb-1 flex items-center justify-between text-[#0a84ff] text-[15px]">
        <button
          type="button"
          onClick={onBackHome}
          className="flex items-center -ml-1 font-normal"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Mailboxes</span>
        </button>
        <span className="font-normal">Select</span>
      </div>

      {/* Inbox Title & Search */}
      <div className="px-3.5 pt-1 pb-2 space-y-2.5">
        <h1 className="text-[28px] font-extrabold tracking-tight leading-none">Inbox</h1>
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#1c1c1e] text-sm text-white placeholder:text-zinc-500 focus:outline-none"
          />
        </div>

        {/* Category Filter Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter('primary')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 snap-transition ${
              filter === 'primary'
                ? 'bg-[#0a84ff] text-white'
                : 'bg-[#1c1c1e] text-zinc-300'
            }`}
          >
            <span>@</span>
            <span>Primary</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('deals')}
            className={`w-10 h-8 rounded-full flex items-center justify-center snap-transition ${
              filter === 'deals'
                ? 'bg-[#0a84ff] text-white'
                : 'bg-[#1c1c1e] text-zinc-300'
            }`}
          >
            <DollarSign className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setFilter('news')}
            className={`w-10 h-8 rounded-full flex items-center justify-center snap-transition ${
              filter === 'news'
                ? 'bg-[#0a84ff] text-white'
                : 'bg-[#1c1c1e] text-zinc-300'
            }`}
          >
            <Newspaper className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setFilter('media')}
            className={`w-10 h-8 rounded-full flex items-center justify-center snap-transition ${
              filter === 'media'
                ? 'bg-[#0a84ff] text-white'
                : 'bg-[#1c1c1e] text-zinc-300'
            }`}
          >
            <Clapperboard className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto slim-scroll divide-y divide-zinc-800/80 px-3">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500">
            No messages in this folder
          </div>
        ) : (
          filtered.map((mail) => (
            <button
              key={mail.id}
              type="button"
              onClick={() => {
                onReadEmail(mail.id);
                setOpenEmailId(mail.id);
              }}
              className="w-full py-2.5 flex items-start gap-3 text-left hover:bg-white/[0.03]"
            >
              <div className="relative pt-1">
                {!mail.read && (
                  <span className="w-2 h-2 rounded-full bg-[#0a84ff] absolute -left-2 top-5" />
                )}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{ backgroundColor: mail.avatarColor }}
                >
                  {mail.initials}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[15px] text-white truncate">
                    {mail.fromName}
                  </span>
                  <span className="text-[12px] text-zinc-400 flex items-center gap-0.5 shrink-0">
                    {mail.dateLabel}
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                  </span>
                </div>
                <div className="text-[13px] font-semibold text-white truncate">
                  {mail.subject}
                </div>
                <div className="text-[12.5px] text-zinc-400 line-clamp-2 leading-snug">
                  {mail.preview}
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Bottom Mail Footer */}
      <div className="px-4 py-2 border-t border-zinc-800/80 bg-[#0b0b0c] flex items-center justify-between">
        <div className="w-5" />
        <div className="text-center leading-tight">
          <div className="text-[11px] font-medium text-white">Updated Just Now</div>
          <div className="text-[10px] text-zinc-400 tabular-nums">
            {filtered.length} Messages
          </div>
        </div>
        <SquarePen className="w-4 h-4 text-[#0a84ff]" />
      </div>
    </div>
  );
};
