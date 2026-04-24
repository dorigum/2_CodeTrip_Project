import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useWishlistStore from '../store/useWishlistStore';
import { fetchWishlistDetails } from '../api/wishlistApi';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop';

const MyPage = () => {
  const { user, isLoggedIn } = useAuthStore();
  const { 
    wishlistIds, initWishlist, toggleWishlist, 
    folders, createFolder, deleteFolder, moveItem,
    initialized: wishlistInitialized 
  } = useWishlistStore();
  const navigate = useNavigate();

  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('CREATED'); // CREATED, TITLE
  const [selectedFolderId, setSelectedFolderId] = useState(null); // null: 전체, 'UNCATEGORIZED': 미분류
  const [newFolderName, setNewFolderName] = useState('');
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [movingItemId, setMovingItemId] = useState(null);

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

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      await createFolder(newFolderName.trim());
      setNewFolderName('');
      setShowFolderModal(false);
    } catch (e) {
      alert('폴더 생성에 실패했습니다.');
    }
  };

  const handleDeleteFolder = async (e, folderId) => {
    e.stopPropagation();
    if (!window.confirm('폴더를 삭제하시겠습니까? (안의 여행지는 삭제되지 않습니다)')) return;
    try {
      await deleteFolder(folderId);
      if (selectedFolderId === folderId) setSelectedFolderId(null);
      // 로컬 위시리스트의 folder_id 업데이트
      setWishlistItems(prev => prev.map(item => 
        item.folder_id === folderId ? { ...item, folder_id: null } : item
      ));
    } catch (e) {
      alert('폴더 삭제에 실패했습니다.');
    }
  };

  const handleMoveItem = async (contentId, folderId) => {
    try {
      await moveItem(contentId, folderId);
      setWishlistItems(prev => prev.map(item => 
        String(item.contentid) === String(contentId) ? { ...item, folder_id: folderId } : item
      ));
      setMovingItemId(null);
      alert('이동되었습니다.');
    } catch (e) {
      alert('이동에 실패했습니다.');
    }
  };

  const filteredItems = useMemo(() => {
    let items = wishlistItems;
    if (selectedFolderId === 'UNCATEGORIZED') {
      items = items.filter(item => !item.folder_id);
    } else if (selectedFolderId) {
      items = items.filter(item => item.folder_id === selectedFolderId);
    }
    return items;
  }, [wishlistItems, selectedFolderId]);

  const sortedWishList = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      if (sortBy === 'TITLE') {
        return (a.title || '').localeCompare(b.title || '');
      } else if (sortBy === 'TITLE_DESC') {
        return (b.title || '').localeCompare(a.title || '');
      } else {
        return String(b.contentid).localeCompare(String(a.contentid));
      }
    });
  }, [filteredItems, sortBy]);

  if (!isLoggedIn) return null;

  return (
    <div className="flex-1 bg-background overflow-y-auto custom-scrollbar">
      {/* Folder Creation Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-outline-variant/20 animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest">mkdir_new_folder.sh</span>
              <button onClick={() => setShowFolderModal(false)} className="material-symbols-outlined text-slate-400 hover:text-on-surface transition-colors">close</button>
            </div>
            <form onSubmit={handleCreateFolder} className="p-8">
              <div className="flex flex-col gap-1.5 mb-6">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter ml-1">Folder_Name</label>
                <input 
                  autoFocus
                  type="text"
                  placeholder="예: 부산 1박 2일 맛집투어"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowFolderModal(false)} className="flex-1 py-3 text-xs font-bold font-label text-slate-500 hover:bg-slate-100 rounded-xl transition-all">CANCEL</button>
                <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-xl text-xs font-bold font-label hover:brightness-110 shadow-lg shadow-primary/20 transition-all">CREATE_FOLDER</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="p-10 flex flex-col lg:flex-row gap-8 max-w-[1600px] mx-auto">
        
        {/* Left Gutter: Meta & Folders */}
        <aside className="w-full lg:w-72 flex flex-col gap-6 flex-shrink-0">
          <div className="flex flex-col gap-1">
            <span className="font-label text-[0.6875rem] uppercase tracking-widest text-secondary font-bold">Workspace</span>
            <h2 className="font-headline text-2xl font-bold tracking-tight">{user?.name || 'Guest'}.wishlist</h2>
          </div>

          {/* FOLDER_SYSTEM */}
          <section className="bg-surface-container-low p-5 rounded-xl flex flex-col gap-4 border border-outline-variant/10 shadow-sm">
            <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">folder_open</span>
                <span className="font-label text-xs font-bold uppercase tracking-wider">FOLDERS</span>
              </div>
              <button 
                onClick={() => setShowFolderModal(true)}
                className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all"
              >
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
            </div>
            
            <nav className="flex flex-col gap-1">
              <button 
                onClick={() => setSelectedFolderId(null)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-mono transition-all ${!selectedFolderId ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">all_inbox</span>
                  <span>ALL_NODES</span>
                </div>
                <span className="opacity-60 text-[10px]">{wishlistItems.length}</span>
              </button>

              <button 
                onClick={() => setSelectedFolderId('UNCATEGORIZED')}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-mono transition-all ${selectedFolderId === 'UNCATEGORIZED' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">inventory_2</span>
                  <span>UNCATEGORIZED</span>
                </div>
                <span className="opacity-60 text-[10px]">{wishlistItems.filter(i => !i.folder_id).length}</span>
              </button>

              <div className="h-2" />
              
              {folders.map(folder => (
                <div key={folder.id} className="flex flex-col gap-1">
                  <button 
                    onClick={() => setSelectedFolderId(folder.id)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-mono group transition-all ${selectedFolderId === folder.id ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="material-symbols-outlined text-base">folder</span>
                      <span className="truncate">{folder.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="opacity-60 text-[10px]">{wishlistItems.filter(i => i.folder_id === folder.id).length}</span>
                      <span 
                        onClick={(e) => handleDeleteFolder(e, folder.id)}
                        className="material-symbols-outlined text-xs opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                      >
                        delete
                      </span>
                    </div>
                  </button>
                  {selectedFolderId === folder.id && (
                    <div className="px-3 py-1 flex flex-col gap-0.5 border-l-2 border-primary/20 ml-2 animate-in slide-in-from-left-1 duration-200">
                      <p className="text-[9px] font-mono text-slate-400">CREATED: {new Date(folder.created_at).toLocaleDateString()}</p>
                      <p className="text-[9px] font-mono text-slate-400">UPDATED: {new Date(folder.updated_at).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </section>

          {/* Sync Status Card */}
          <div className="bg-white p-5 rounded-xl border border-outline-variant/10 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-label text-xs font-medium uppercase tracking-tight text-on-surface">Live_Sync_Active</span>
            </div>
            <p className="text-[11px] text-secondary leading-relaxed mb-4 font-mono">// storage_v2_active.log</p>
            <code className="block bg-surface-container-low p-2 rounded text-[10px] font-mono text-primary overflow-hidden whitespace-nowrap">
              {selectedFolderId ? `F_ID: ${selectedFolderId}` : 'VIEW: ALL_NODES'}
            </code>
          </div>
        </aside>

        {/* Primary Stage: Wishlist Items */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div className="flex items-baseline gap-3">
              <h3 className="font-headline text-xl font-bold">
                {selectedFolderId === 'UNCATEGORIZED' ? '미분류' : selectedFolderId ? folders.find(f => f.id === selectedFolderId)?.name : '전체 위시리스트'}
              </h3>
              <span className="text-xs font-mono text-slate-400">total_{sortedWishList.length}_nodes</span>
            </div>
            <div className="flex items-center gap-3">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-surface-container-low text-on-surface font-bold uppercase text-[10px] font-mono px-3 py-1.5 rounded-lg outline-none cursor-pointer border border-outline-variant/10 hover:border-primary/30 transition-all"
              >
                <option value="CREATED">NEWEST</option>
                <option value="TITLE">TITLE A-Z</option>
                <option value="TITLE_DESC">TITLE Z-A</option>
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
                <h3 className="font-headline font-bold text-on-surface-variant text-lg tracking-tight">EMPTY_DATA_NODE</h3>
                <p className="text-xs text-secondary font-label mt-2 max-w-[200px] mx-auto leading-relaxed">이 폴더에 담긴 장소가 없습니다.</p>
                <button className="mt-6 text-primary font-label text-xs font-bold flex items-center gap-1.5 hover:underline pr-2">
                  EXPLORE_WIZARD_START()
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-10">
              {sortedWishList.map((item) => (
                <div key={item.contentid} className="group bg-white rounded-xl overflow-hidden border border-outline-variant/10 hover:border-primary/30 transition-all shadow-sm hover:shadow-md relative">
                  
                  {/* Folder Move Menu Overlay */}
                  {movingItemId === item.contentid && (
                    <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm p-6 flex flex-col animate-in fade-in duration-200">
                      <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <span className="text-[10px] font-bold font-mono text-primary uppercase">Move_To_Folder</span>
                        <button onClick={() => setMovingItemId(null)} className="material-symbols-outlined text-xs">close</button>
                      </div>
                      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-1">
                        <button 
                          onClick={() => handleMoveItem(item.contentid, null)}
                          className="w-full text-left px-3 py-2 text-xs font-mono hover:bg-slate-50 rounded-lg flex justify-between items-center"
                        >
                          <span>// [ROOT] UNCATEGORIZED</span>
                          {!item.folder_id && <span className="material-symbols-outlined text-xs text-emerald-500 font-bold">check</span>}
                        </button>
                        {folders.map(f => (
                          <button 
                            key={f.id}
                            onClick={() => handleMoveItem(item.contentid, f.id)}
                            className="w-full text-left px-3 py-2 text-xs font-mono hover:bg-slate-50 rounded-lg flex justify-between items-center"
                          >
                            <span>// {f.name}</span>
                            {item.folder_id === f.id && <span className="material-symbols-outlined text-xs text-emerald-500 font-bold">check</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="relative h-48">
                    <img src={item.firstimage || FALLBACK_IMAGE} alt={item.title} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" />
                    <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1.5 border border-white/20 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span className="font-mono text-[9px] font-bold uppercase tracking-tight">verified_node</span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      <button 
                        onClick={(e) => handleRemoveWish(e, item.contentid)}
                        className="w-8 h-8 bg-white/90 hover:bg-red-500 hover:text-white text-red-500 rounded-lg flex items-center justify-center shadow-lg transition-all z-10"
                        title="위시리스트에서 삭제"
                      >
                        <span className="material-symbols-outlined text-lg fill-1">favorite</span>
                      </button>
                      <button 
                        onClick={() => setMovingItemId(item.contentid)}
                        className="w-8 h-8 bg-white/90 hover:bg-primary hover:text-white text-slate-500 rounded-lg flex items-center justify-center shadow-lg transition-all z-10"
                        title="폴더 이동"
                      >
                        <span className="material-symbols-outlined text-lg">folder_shared</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="min-w-0 pr-2">
                        <h3 className="font-headline text-base font-bold text-on-surface truncate">{item.title}</h3>
                        <p className="text-[11px] text-secondary font-mono mt-0.5 truncate tracking-tight pr-4">LOC: {item.addr1 || 'Unknown'}</p>
                      </div>
                      <span className="text-primary font-mono text-[9px] font-bold shrink-0">#ID_{item.contentid}</span>
                    </div>

                    <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-300 text-sm">folder</span>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">
                          {item.folder_id ? folders.find(f => f.id === item.folder_id)?.name : 'UNCATEGORIZED'}
                        </span>
                      </div>
                      <Link to={`/explore/${item.contentid}`} className="bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg font-label text-[10px] font-bold hover:bg-primary hover:text-white transition-all border border-slate-100 flex items-center gap-1.5">
                        VIEW_DATA
                        <span className="material-symbols-outlined text-xs">arrow_forward</span>
                      </Link>
                    </div>
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
