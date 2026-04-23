import React, { useState, useMemo } from 'react';
import useAuthStore from '../store/useAuthStore';

const WISH_LIST = [
  {
    id: 1,
    title: 'paris_node_v12',
    location: '48.8566° N, 2.3522° E',
    tag: '#summer_2025',
    categories: ['Art', 'History', 'Gastronomy'],
    status: 'STABLE_BUILD',
    statusColor: 'bg-primary',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-03-20T14:30:00Z',
  },
  {
    id: 2,
    title: 'tokyo_core_nightly',
    location: '35.6762° N, 139.6503° E',
    tag: '#q4_2024',
    categories: ['Cyberpunk', 'High-Tech'],
    status: 'MERGE_CONFLICT',
    statusColor: 'bg-tertiary',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800',
    createdAt: '2024-11-10T09:00:00Z',
    updatedAt: '2024-11-10T09:00:00Z',
  },
  {
    id: 3,
    title: 'bali_refactor_v2',
    location: '8.3405° S, 115.0920° E',
    tag: '#wellness',
    categories: ['Tropical', 'Nature'],
    status: 'IN_REVIEW',
    statusColor: 'bg-primary-fixed-dim',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800',
    createdAt: '2025-02-05T11:20:00Z',
    updatedAt: '2025-04-10T16:45:00Z',
  }
];

const MyPage = () => {
  const { user } = useAuthStore();

  const [sortBy, setSortBy] = useState('CREATED'); // CREATED, TITLE, MODIFIED

  const sortedWishList = useMemo(() => {
    return [...WISH_LIST].sort((a, b) => {
      if (sortBy === 'TITLE') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'MODIFIED') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      } else {
        // DEFAULT: CREATED (Most Recent)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [sortBy]);

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
                <p className="font-headline text-3xl font-bold">{WISH_LIST.length}</p>
              </div>
              <div>
                <p className="font-label text-[0.6875rem] text-secondary uppercase">Active_Plans</p>
                <p className="font-headline text-xl font-medium text-primary">03</p>
              </div>
              <div className="pt-2">
                <div className="flex justify-between items-end mb-1">
                  <span className="font-label text-[0.6rem] text-secondary uppercase">Storage_Usage</span>
                  <span className="font-label text-[0.6rem] text-primary font-bold">12%</span>
                </div>
                <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[12%]"></div>
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
              <span className="text-secondary">GET</span> /wishlist <span className="text-emerald-600">200 OK</span>
            </code>
          </div>
        </aside>

        {/* Primary Stage: Deployments (Wishlist Items) */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div className="flex gap-4">
              <button className="bg-primary text-white px-4 py-2 rounded-lg font-label text-sm font-bold flex items-center gap-2 hover:brightness-110 transition-all shadow-md">
                <span className="material-symbols-outlined text-sm">add_location</span>
                ADD_NEW_DESTINATION
              </button>
              <button className="bg-white text-on-surface px-4 py-2 rounded-lg font-label text-sm font-bold border border-outline-variant/20 hover:bg-slate-50 transition-all">
                FILTER_TAGS
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-sm text-secondary">sort</span>
              <span className="text-xs font-label text-secondary uppercase tracking-wider">Sort_By:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-primary font-bold uppercase text-xs font-label outline-none cursor-pointer border-b border-primary/20 hover:border-primary transition-all pb-0.5"
              >
                <option value="CREATED">Most Recent</option>
                <option value="TITLE">Title (A-Z)</option>
                <option value="MODIFIED">Last Modified</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-10">
            {sortedWishList.map((item) => (
              <div key={item.id} className="group bg-white rounded-xl overflow-hidden border border-transparent hover:border-primary/20 transition-all shadow-sm hover:shadow-md">
                <div className="relative h-52">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
                  <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/20 shadow-sm">
                    <span className={`w-1.5 h-1.5 rounded-full ${item.statusColor}`}></span>
                    <span className="font-label text-[10px] font-bold tracking-tight uppercase">{item.status}</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-headline text-lg font-bold text-on-surface">{item.title}</h3>
                      <p className="text-xs text-secondary font-label mt-0.5 tracking-tight">LOC: {item.location}</p>
                    </div>
                    <span className="text-primary font-mono text-[10px] font-bold">{item.tag}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.categories.map((cat, idx) => (
                      <span key={idx} className="bg-surface-container-low text-on-surface-variant text-[10px] font-label px-2.5 py-0.5 rounded uppercase tracking-tighter font-bold">
                        {cat}
                      </span>
                    ))}
                  </div>

                  {/* Dates for Debugging/Verification */}
                  <div className="flex flex-col gap-1 mb-6 text-[10px] font-mono text-slate-400">
                    <div className="flex justify-between border-b border-slate-50 pb-1">
                      <span>CREATED_AT:</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>UPDATED_AT:</span>
                      <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <button className="w-full bg-gradient-to-r from-primary to-primary-container text-white py-3 rounded-lg font-label text-xs font-bold tracking-widest hover:opacity-90 active:opacity-80 transition-all flex items-center justify-center gap-2 shadow-lg">
                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                    EXECUTE_TRIP_PLAN
                  </button>
                </div>
              </div>
            ))}

            {/* Empty State Card */}
            <div className="group border-2 border-dashed border-outline-variant/30 rounded-xl flex flex-col items-center justify-center p-12 text-center hover:border-primary/40 transition-all bg-surface-container-low/30 cursor-pointer min-h-[400px]">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-outline-variant/10 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-4xl text-primary">add_location_alt</span>
              </div>
              <h3 className="font-headline font-bold text-on-surface-variant text-lg tracking-tight">INIT_NEW_DEPLOYMENT</h3>
              <p className="text-xs text-secondary font-label mt-2 max-w-[200px] mx-auto leading-relaxed">준비되셨나요? 당신의 다음 모험을 위시리스트에 추가하세요.</p>
              <button className="mt-6 text-primary font-label text-xs font-bold flex items-center gap-1.5 hover:underline">
                CLI_WIZARD_START()
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyPage;
