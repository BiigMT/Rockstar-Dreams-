import React, { useState } from 'react';
import {
  Bell,
  ChevronLeft,
  Home,
  Image as ImageIcon,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Newspaper,
  Plus,
  Search,
  Share2,
  Star,
  Store,
  ThumbsUp,
  Tv,
  Users,
  X,
} from 'lucide-react';
import { GameState } from '../../../types/game';
import { formatCompactNumber } from '../../../engine/simulation';

interface FakebookAppProps {
  state: GameState;
  onBackHome: () => void;
  onCreatePost: (platform: 'fakebook', content: string) => void;
  onLikePost: (postId: string) => void;
  onBefriendNpc: (npcId: string) => void;
}

export const FakebookApp: React.FC<FakebookAppProps> = ({
  state,
  onBackHome,
  onCreatePost,
  onLikePost,
  onBefriendNpc,
}) => {
  const [fbTab, setFbTab] = useState<'home' | 'video' | 'friends' | 'notifs'>('home');
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState('');

  const initials =
    state.artistName
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'BM';

  const feedPosts = state.posts.filter((p) => p.platform === 'fakebook');

  return (
    <div className="h-full bg-[#f0f2f5] text-[#050505] flex flex-col">
      {/* Top Fakebook Header matching Screenshot 4ee1900d */}
      <div className="bg-white px-3 pt-2.5 pb-2 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackHome}
            className="text-slate-800 hover:text-black"
            aria-label="Back to Phone"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-[22px] font-extrabold tracking-tight text-[#1877f2]">
            fakebook
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setComposing(true)}
            className="w-8 h-8 rounded-full bg-[#e4e6eb] flex items-center justify-center text-slate-900"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
          <button
            type="button"
            onClick={() => setFbTab('friends')}
            className="w-8 h-8 rounded-full bg-[#e4e6eb] flex items-center justify-center text-slate-900"
          >
            <Search className="w-4 h-4 stroke-[2.5]" />
          </button>
          <button
            type="button"
            onClick={() => setFbTab('notifs')}
            className="w-8 h-8 rounded-full bg-[#e4e6eb] flex items-center justify-center text-slate-900"
          >
            <MessageCircle className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto slim-scroll space-y-2 pb-2">
        {fbTab === 'home' && (
          <>
            {/* Composer Bar */}
            <div className="bg-white px-3 py-2.5 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#6d28d9] text-white font-bold text-xs flex items-center justify-center shrink-0">
                {initials}
              </div>
              <button
                type="button"
                onClick={() => setComposing(true)}
                className="flex-1 text-left px-3.5 py-2 rounded-full border border-slate-300 text-[13px] text-slate-600 hover:bg-slate-50"
              >
                What's on your mind?
              </button>
              <button
                type="button"
                onClick={() => setComposing(true)}
                className="text-emerald-600 p-1"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
            </div>

            {composing && (
              <div className="bg-white px-3 py-3 border-y border-slate-200 space-y-2">
                <textarea
                  rows={2}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={`Share an update with ${formatCompactNumber(state.socialFollowers.fakebook)} followers...`}
                  className="w-full p-2.5 rounded-xl bg-slate-100 text-sm text-slate-900 focus:outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setComposing(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!draft.trim()}
                    onClick={() => {
                      onCreatePost('fakebook', draft.trim());
                      setDraft('');
                      setComposing(false);
                    }}
                    className="px-4 py-1.5 rounded-lg bg-[#1877f2] disabled:opacity-40 text-white text-xs font-bold"
                  >
                    Post
                  </button>
                </div>
              </div>
            )}

            {/* Stories Carousel */}
            <div className="bg-white px-3 py-2.5 flex gap-2 overflow-x-auto slim-scroll">
              <button
                type="button"
                onClick={() => setComposing(true)}
                className="w-24 h-36 rounded-xl overflow-hidden border border-slate-200 shrink-0 flex flex-col bg-white"
              >
                <div className="h-24 bg-gradient-to-b from-[#6d28d9] to-[#4c1d95]" />
                <div className="flex-1 relative flex items-end justify-center pb-1.5">
                  <div className="w-7 h-7 rounded-full bg-[#1877f2] border-2 border-white text-white flex items-center justify-center absolute -top-3.5">
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">Create story</span>
                </div>
              </button>

              <div className="w-24 h-36 rounded-xl overflow-hidden shrink-0 relative bg-gradient-to-b from-[#ec4899] to-[#be185d] p-2 flex flex-col justify-between text-white">
                <div className="w-7 h-7 rounded-full bg-[#a855f7] border-2 border-[#1877f2] text-[10px] font-bold flex items-center justify-center">
                  MD
                </div>
                <Star className="w-7 h-7 mx-auto opacity-80" />
                <span className="text-[11px] font-bold leading-tight">Music Daily</span>
              </div>

              {state.npcs.slice(0, 3).map((npc) => (
                <div
                  key={npc.id}
                  className="w-24 h-36 rounded-xl overflow-hidden shrink-0 relative bg-gradient-to-b from-slate-600 to-slate-800 p-2 flex flex-col justify-between text-white"
                >
                  <div
                    className="w-7 h-7 rounded-full border-2 border-[#1877f2] text-[10px] font-bold flex items-center justify-center"
                    style={{ backgroundColor: npc.avatarColor }}
                  >
                    {npc.initials}
                  </div>
                  <span className="text-[11px] font-bold leading-tight">{npc.name}</span>
                </div>
              ))}
            </div>

            {/* Feed Posts */}
            {feedPosts.map((post) => (
              <div key={post.id} className="bg-white pt-3 pb-2 space-y-2">
                <div className="px-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-full text-white text-xs font-bold flex items-center justify-center"
                      style={{ backgroundColor: post.authorColor }}
                    >
                      {post.authorInitials}
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-slate-900">{post.authorName}</div>
                      <div className="text-[11px] text-slate-500">{post.timeAgo} · Global</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <MoreHorizontal className="w-4 h-4" />
                    <X className="w-4 h-4" />
                  </div>
                </div>

                <p className="px-3 text-[13.5px] text-slate-900 leading-snug">{post.content}</p>

                {post.isNews && (
                  <div className="bg-slate-100 border-y border-slate-200">
                    <div className="h-36 bg-gradient-to-b from-[#0a84ff] to-[#005bb5] flex items-center justify-center text-white">
                      <Newspaper className="w-14 h-14 opacity-90" />
                    </div>
                    <div className="px-3 py-2 bg-[#f0f2f5]">
                      <div className="text-[10px] font-bold text-slate-500 uppercase">
                        {post.linkDomain || 'ROLLINGROCK.COM'}
                      </div>
                      <div className="text-[12.5px] font-bold text-slate-900 truncate">
                        {post.headline}
                      </div>
                    </div>
                  </div>
                )}

                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt="Post"
                    referrerPolicy="no-referrer"
                    className="w-full max-h-52 object-cover"
                  />
                )}

                <div className="px-3 pt-1 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onLikePost(post.id)}
                    className={`flex items-center gap-1.5 py-1 font-semibold ${
                      post.likedByPlayer ? 'text-[#1877f2]' : 'text-slate-600'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" /> {formatCompactNumber(post.likes)}
                  </button>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" /> {post.comments}
                  </span>
                  <span className="flex items-center gap-1">
                    <Share2 className="w-4 h-4" /> {post.shares}
                  </span>
                </div>
              </div>
            ))}
          </>
        )}

        {fbTab === 'friends' && (
          <div className="bg-white p-3 space-y-2.5">
            <div className="font-bold text-sm text-slate-900">Industry Connections</div>
            {state.npcs.map((npc) => (
              <div
                key={npc.id}
                className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-full text-white text-xs font-bold flex items-center justify-center"
                    style={{ backgroundColor: npc.avatarColor }}
                  >
                    {npc.initials}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{npc.name}</div>
                    <div className="text-[11px] text-slate-500">{npc.genre} · {npc.relationship}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onBefriendNpc(npc.id)}
                  className="px-3 py-1 rounded-lg bg-[#1877f2] text-white text-xs font-bold"
                >
                  Connect
                </button>
              </div>
            ))}
          </div>
        )}

        {(fbTab === 'video' || fbTab === 'notifs') && (
          <div className="bg-white p-4 space-y-2.5">
            <div className="font-bold text-sm text-slate-900">
              {fbTab === 'video' ? 'Artist Clips & Releases' : 'Recent Notifications'}
            </div>
            {state.notifications.slice(0, 6).map((n) => (
              <div key={n.id} className="p-2.5 rounded-xl bg-slate-100 text-xs">
                <div className="font-bold text-slate-900">{n.title}</div>
                <div className="text-slate-600">{n.detail}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Fakebook Tab Bar */}
      <div className="bg-white border-t border-slate-200 px-2 py-1.5 grid grid-cols-6 text-[10px]">
        <button
          type="button"
          onClick={() => setFbTab('home')}
          className={`flex flex-col items-center gap-0.5 ${fbTab === 'home' ? 'text-[#1877f2] font-bold' : 'text-slate-500'}`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>
        <button
          type="button"
          onClick={() => setFbTab('video')}
          className={`flex flex-col items-center gap-0.5 ${fbTab === 'video' ? 'text-[#1877f2] font-bold' : 'text-slate-500'}`}
        >
          <Tv className="w-4 h-4" />
          <span>Video</span>
        </button>
        <button
          type="button"
          onClick={() => setFbTab('friends')}
          className={`relative flex flex-col items-center gap-0.5 ${fbTab === 'friends' ? 'text-[#1877f2] font-bold' : 'text-slate-500'}`}
        >
          <Users className="w-4 h-4" />
          <span className="absolute -top-1 right-2 px-1 rounded-full bg-red-600 text-white text-[8px] font-bold">
            74
          </span>
          <span>Friends</span>
        </button>
        <button
          type="button"
          onClick={() => setFbTab('home')}
          className="flex flex-col items-center gap-0.5 text-slate-500"
        >
          <Store className="w-4 h-4" />
          <span>Market</span>
        </button>
        <button
          type="button"
          onClick={() => setFbTab('notifs')}
          className={`relative flex flex-col items-center gap-0.5 ${fbTab === 'notifs' ? 'text-[#1877f2] font-bold' : 'text-slate-500'}`}
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 right-2 px-1 rounded-full bg-red-600 text-white text-[8px] font-bold">
            4
          </span>
          <span>Alerts</span>
        </button>
        <button
          type="button"
          onClick={onBackHome}
          className="flex flex-col items-center gap-0.5 text-slate-500"
        >
          <Menu className="w-4 h-4" />
          <span>Exit</span>
        </button>
      </div>
    </div>
  );
};
