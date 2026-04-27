import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { getMyBoardPosts, getMyBoardComments, getMyTravelComments, deleteBoardPost, deleteBoardComment } from '../api/boardApi';
import { deleteTravelComment } from '../api/travelCommentApi';

const TABS = [
  { key: 'posts',          label: 'Board Posts',      icon: 'article' },
  { key: 'boardComments',  label: 'Board Comments',   icon: 'comment' },
  { key: 'travelComments', label: 'Travel Comments',  icon: 'chat' },
];

const formatDate = (str) => {
  const d = new Date(str);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-24 gap-3">
    <span className="material-symbols-outlined text-5xl text-slate-200">inbox</span>
    <p className="text-xs font-mono text-slate-400">{message}</p>
  </div>
);

const VALID_TABS = new Set(TABS.map(t => t.key));

const MyActivity = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isLoggedIn } = useAuthStore();

  const activeTab = VALID_TABS.has(searchParams.get('tab')) ? searchParams.get('tab') : 'posts';
  const setActiveTab = (key) => setSearchParams({ tab: key }, { replace: true });
  const [posts, setPosts] = useState([]);
  const [boardComments, setBoardComments] = useState([]);
  const [travelComments, setTravelComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return; }
    const load = async () => {
      setLoading(true);
      const [p, bc, tc] = await Promise.all([
        getMyBoardPosts(),
        getMyBoardComments(),
        getMyTravelComments(),
      ]);
      setPosts(p);
      setBoardComments(bc);
      setTravelComments(tc);
      setLoading(false);
    };
    load();
  }, [isLoggedIn, navigate]);

  const handleDeletePost = async (id) => {
    if (!window.confirm('게시글을 삭제하시겠습니까?')) return;
    await deleteBoardPost(id);
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const handleDeleteBoardComment = async (id) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    await deleteBoardComment(id);
    setBoardComments(prev => prev.filter(c => c.id !== id));
  };

  const handleDeleteTravelComment = async (id) => {
    if (!window.confirm('코멘트를 삭제하시겠습니까?')) return;
    await deleteTravelComment(id);
    setTravelComments(prev => prev.filter(c => c.id !== id));
  };

  const counts = { posts: posts.length, boardComments: boardComments.length, travelComments: travelComments.length };

  return (
    <div className="p-8 max-w-[1000px] mx-auto min-h-screen">
      <header className="mb-8">
        <p className="text-[10px] font-mono text-primary uppercase tracking-widest mb-1">// my_activity.log</p>
        <h1 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface">
          내 활동 <span className="text-primary">.</span>
        </h1>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-surface-container-low p-1 rounded-xl border border-outline-variant/10 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-tighter transition-all ${
              activeTab === tab.key
                ? 'bg-white text-primary shadow-sm border border-outline-variant/10'
                : 'text-slate-400 hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{tab.icon}</span>
            {tab.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
              activeTab === tab.key ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'
            }`}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          <p className="text-xs font-mono text-outline animate-pulse">// loading_activity...</p>
        </div>
      ) : (
        <>
          {/* Board Posts */}
          {activeTab === 'posts' && (
            <div className="space-y-3">
              {posts.length === 0 ? <EmptyState message="// no_posts_found" /> : posts.map(post => (
                <div key={post.id} className="bg-white rounded-xl border border-outline-variant/10 shadow-sm hover:border-primary/20 transition-all group">
                  <div className="flex items-start gap-4 p-5">
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/board/${post.id}`}
                        className="block font-headline font-bold text-on-surface hover:text-primary transition-colors truncate mb-1.5"
                      >
                        {post.title}
                      </Link>
                      <p className="text-xs text-slate-400 line-clamp-1 font-body mb-3">
                        {post.content?.replace(/<[^>]+>/g, '') || ''}
                      </p>
                      <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">visibility</span>
                          {post.view_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">comment</span>
                          {post.comment_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">schedule</span>
                          {formatDate(post.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        to={`/board/write`}
                        state={{ editPost: post }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </Link>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Board Comments */}
          {activeTab === 'boardComments' && (
            <div className="space-y-3">
              {boardComments.length === 0 ? <EmptyState message="// no_comments_found" /> : boardComments.map(comment => (
                <div key={comment.id} className="bg-white rounded-xl border border-outline-variant/10 shadow-sm hover:border-primary/20 transition-all group">
                  <div className="flex items-start gap-4 p-5">
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/board/${comment.post_id}`}
                        className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 hover:text-primary transition-colors mb-2 w-fit"
                      >
                        <span className="material-symbols-outlined text-xs">article</span>
                        <span className="truncate max-w-xs">{comment.post_title}</span>
                        <span className="material-symbols-outlined text-xs">open_in_new</span>
                      </Link>
                      <p className="text-sm text-slate-700 font-body leading-relaxed">
                        <span className="text-outline font-mono">"</span>
                        {comment.body}
                        <span className="text-outline font-mono">"</span>
                      </p>
                      <span className="flex items-center gap-1 text-[10px] font-mono text-slate-400 mt-2">
                        <span className="material-symbols-outlined text-xs">schedule</span>
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteBoardComment(comment.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0 opacity-0 group-hover:opacity-100"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Travel Comments */}
          {activeTab === 'travelComments' && (
            <div className="space-y-3">
              {travelComments.length === 0 ? <EmptyState message="// no_travel_comments_found" /> : travelComments.map(comment => (
                <div key={comment.id} className="bg-white rounded-xl border border-outline-variant/10 shadow-sm hover:border-primary/20 transition-all group">
                  <div className="flex items-start gap-4 p-5">
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/explore/${comment.content_id}`}
                        className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 hover:text-primary transition-colors mb-2 w-fit"
                      >
                        <span className="material-symbols-outlined text-xs">location_on</span>
                        <span className="truncate max-w-xs">{comment.title || comment.content_id}</span>
                        <span className="material-symbols-outlined text-xs">open_in_new</span>
                      </Link>
                      <p className="text-sm text-slate-700 font-body leading-relaxed">
                        <span className="text-outline font-mono">"</span>
                        {comment.body}
                        <span className="text-outline font-mono">"</span>
                      </p>
                      <span className="flex items-center gap-1 text-[10px] font-mono text-slate-400 mt-2">
                        <span className="material-symbols-outlined text-xs">schedule</span>
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteTravelComment(comment.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0 opacity-0 group-hover:opacity-100"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyActivity;
