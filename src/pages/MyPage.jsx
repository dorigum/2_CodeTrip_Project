import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useWishlistStore from '../store/useWishlistStore';
import { fetchWishlistDetails } from '../api/wishlistApi';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop';

const MyPage = () => {
  const { user, isLoggedIn } = useAuthStore();
  const { wishlistIds, initWishlist, toggleWishlist, initialized: wishlistInitialized } = useWishlistStore();
  const navigate = useNavigate();

  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('CREATED'); // CREATED, TITLE

  // Authentication Check
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // Load Wishlist Data
  useEffect(() => {
    if (!isLoggedIn) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const details = await fetchWishlistDetails();
        setWishlistItems(details);
        // ID 목록도 동기화 (전역 스토어)
        if (!wishlistInitialized) {
          await initWishlist();
        }
      } catch (error) {
        console.error('Failed to load wishlist details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isLoggedIn, wishlistInitialized]);

  const handleRemoveWish = async (e, contentId) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm('위시리스트에서 삭제하시겠습니까?')) return;

    try {
      await toggleWishlist(contentId);
      // 로컬 상태에서 즉시 제거 (낙관적 업데이트)
      setWishlistItems(prev => prev.filter(item => String(item.contentid) !== String(contentId)));
    } catch (error) {
      alert('오류가 발생했습니다.');
    }
  };

  const sortedWishList = useMemo(() => {
    return [...wishlistItems].sort((a, b) => {
      if (sortBy === 'TITLE') {
        return (a.title || '').localeCompare(b.title || '');
      } else {
        // DEFAULT: CREATED (Actually no explicit date from Open API items, using contentid as proxy)
        return String(b.contentid).localeCompare(String(a.contentid));
      }
    });
  }, [wishlistItems, sortBy]);

  if (!isLoggedIn) return null;

  return (
    <div className="flex-1 bg-background overflow-y-auto custom-scrollbar">
      <main className="p-10 flex flex-col lg:flex-row gap-8 max-w-[1600px] mx-auto">
        
        {/* Left Gutter: Meta & Stats */}
        <aside className="w-full lg:w-72 flex flex-col gap-6 flex-shrink-0">
          <div className="flex flex-col gap-1">
            <span className="font-label text-[0.6875rem] uppercase tracking-widest text-secondary font-bold">User_Profile</span>
            <h2 className="font-headline text-2xl font-bold tracking-tight">{user?.name || 'Guest'}.profile</h2>
          </div>

          {/* WISHLIST_SUMMARY */}
          <section className="bg-surface-container-low p-5 rounded-lg flex flex-col gap-4 border border-outline-variant/10">
            <div className="flex items-center gap-2 border-b border-outline-variant/15 pb-3">
              <span className="material-symbols-outlined text-primary text-sm">history</span>
              <span className="font-label text-xs font-bold uppercase tracking-wider">WISHLIST_SUMMARY</span>
            </div>
            <div className="space-y-4">
              <div>
                <p className="font-label text-[0.6875rem] text-secondary uppercase">Total_Saved_Nodes</p>
                <p className="font-headline text-3xl font-bold">{wishlistItems.length}</p>
              </div>
              <div>
                <p className="font-label text-[0.6875rem] text-secondary uppercase">Active_Plans</p>
                <p className="font-headline text-xl font-medium text-primary">{String(wishlistItems.length).padStart(2, '0')}</p>
              </div>
              <div className="pt-2">
                <div className="flex justify-between items-end mb-1">
                  <span className="font-label text-[0.6rem] text-secondary uppercase">Storage_Usage</span>
                  <span className="font-label text-[0.6rem] text-primary font-bold">{Math.min(100, wishlistItems.length * 5)}%</span>
                </div>
                <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${Math.min(100, wishlistItems.length * 5)}%` }}></div>
                </div>
              </div>
            </div>
          </section>

          {/* Sync Status Card */}
          <div className="bg-white p-5 rounded-lg border border-outline-variant/10 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-label text-xs font-medium uppercase tracking-tight text-on-surface">Live_Sync_Active</span>
            </div>
            <p className="text-xs text-secondary leading-relaxed mb-4 font-body">사용자의 위시리스트가 로컬 인스턴스와 실시간으로 동기화되고 있습니다.</p>
            <code className="block bg-surface-container-low p-2 rounded text-[10px] font-mono text-primary overflow-hidden whitespace-nowrap">
              <span className="text-secondary">GET</span> /api/wishlist/details <span className="text-emerald-600">200 OK</span>
            </code>
          </div>
        </aside>

        {/* Primary Stage: Deployments (Wishlist Items) */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div className="flex gap-4">
              <Link to="/explore" className="bg-primary text-white px-4 py-2 rounded-lg font-label text-sm font-bold flex items-center gap-2 hover:brightness-110 transition-all shadow-md">
                <span className="material-symbols-outlined text-sm">add_location</span>
                EXPLORE_MORE
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-sm text-secondary">sort</span>
              <span className="text-xs font-label text-secondary uppercase tracking-wider">Sort_By:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-primary font-bold uppercase text-xs font-label outline-none cursor-pointer border-b border-primary/20 hover:border-primary transition-all pb-0.5"
              >
                <option value="CREATED">Default</option>
                <option value="TITLE">Title (A-Z)</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
              <p className="text-xs font-mono text-outline animate-pulse">// fetching_wishlist_data...</p>
            </div>
          ) : sortedWishList.length === 0 ? (
            <div className="grid grid-cols-1 gap-6">
              <div className="group border-2 border-dashed border-outline-variant/30 rounded-xl flex flex-col items-center justify-center p-12 text-center hover:border-primary/40 transition-all bg-surface-container-low/30 cursor-pointer min-h-[400px]" onClick={() => navigate('/explore')}>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-outline-variant/10 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-4xl text-primary">add_location_alt</span>
                </div>
                <h3 className="font-headline font-bold text-on-surface-variant text-lg tracking-tight">INIT_NEW_DEPLOYMENT</h3>
                <p className="text-xs text-secondary font-label mt-2 max-w-[200px] mx-auto leading-relaxed">위시리스트가 비어 있습니다. 새로운 여행지를 추가해 보세요.</p>
                <button className="mt-6 text-primary font-label text-xs font-bold flex items-center gap-1.5 hover:underline">
                  EXPLORE_WIZARD_START()
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-10">
              {sortedWishList.map((item) => (
                <div key={item.contentid} className="group bg-white rounded-xl overflow-hidden border border-transparent hover:border-primary/20 transition-all shadow-sm hover:shadow-md">
                  <div className="relative h-52">
                    <img src={item.firstimage || FALLBACK_IMAGE} alt={item.title} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" />
                    <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/20 shadow-sm">
                      <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500`}></span>
                      <span className="font-label text-[10px] font-bold tracking-tight uppercase">STABLE_SAVE</span>
                    </div>
                    {/* 즉시 삭제 하트 버튼 */}
                    <button 
                      onClick={(e) => handleRemoveWish(e, item.contentid)}
                      className="absolute top-4 right-4 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all z-10 select-none outline-none cursor-pointer"
                      title="위시리스트에서 삭제"
                    >
                      <span className="material-symbols-outlined text-xl fill-1 select-none">favorite</span>
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-headline text-lg font-bold text-on-surface truncate max-w-[200px]">{item.title}</h3>
                        <p className="text-xs text-secondary font-label mt-0.5 tracking-tight truncate max-w-[200px]">LOC: {item.addr1 || 'Unknown'}</p>
                      </div>
                      <span className="text-primary font-mono text-[10px] font-bold">#NODE_{item.contentid}</span>
                    </div>

                    {/* Dates for Debugging/Verification */}
                    <div className="flex flex-col gap-1 mb-6 text-[10px] font-mono text-slate-400">
                      <div className="flex justify-between border-b border-slate-50 pb-1">
                        <span>CONTENT_TYPE:</span>
                        <span>{item.contenttypeid}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>DISTRICT_CODE:</span>
                        <span>{item.areacode || 'N/A'}</span>
                      </div>
                    </div>

                    <Link to={`/explore/${item.contentid}`} className="w-full bg-primary text-white py-3 rounded-lg font-label text-xs font-bold tracking-widest hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg">
                      <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>visibility</span>
                      VIEW_DETAILS
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyPage;
