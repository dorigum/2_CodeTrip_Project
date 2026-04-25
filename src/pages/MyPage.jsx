import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useWishlistStore from '../store/useWishlistStore';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop';

const MyPage = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuthStore();
  
  // 스토어에서 모든 상태와 액션을 가져옴 (로컬 fetch 제거)
  const { 
    wishlistItems, folders, wishlistIds, loading,
    initWishlist, toggleWishlist, createFolder, deleteFolder, moveItem,
    initialized: wishlistInitialized 
  } = useWishlistStore();

  const [sortBy, setSortBy] = useState('CREATED'); 
  const [selectedFolderId, setSelectedFolderId] = useState(null); 
  const [newFolderName, setNewFolderName] = useState('');
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [movingItemId, setMovingItemId] = useState(null);

  // Authentication & Initial Data Load
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    } else {
      initWishlist(); // 스토어의 초기화 함수 호출
    }
  }, [isLoggedIn, navigate, initWishlist]);

  const handleRemoveWish = async (e, contentId) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('위시리스트에서 삭제하시겠습니까?')) {
      // toggleWishlist는 이제 내부적으로 서버 동기화까지 마침
      await toggleWishlist({ contentid: contentId });
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    await createFolder(newFolderName.trim());
    setNewFolderName('');
    setShowFolderModal(false);
  };

  // 필터링 및 정렬 로직 (스토어의 wishlistItems를 직접 사용)
  const filteredItems = useMemo(() => {
    let items = wishlistItems || [];
    if (selectedFolderId === 'UNCATEGORIZED') {
      items = items.filter(item => !item.folder_id);
    } else if (selectedFolderId) {
      items = items.filter(item => Number(item.folder_id) === Number(selectedFolderId));
    }
    return items;
  }, [wishlistItems, selectedFolderId]);

  const sortedWishList = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const titleA = a.title || '';
      const titleB = b.title || '';
      if (sortBy === 'TITLE') return titleA.localeCompare(titleB);
      if (sortBy === 'TITLE_DESC') return titleB.localeCompare(titleA);
      // 최신순 (ID 역순)
      return String(b.contentid || b.content_id).localeCompare(String(a.contentid || a.content_id));
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
              <input 
                autoFocus
                type="text"
                placeholder="예: 부산 1박 2일 맛집투어"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm mb-6 outline-none focus:border-primary transition-all"
              />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowFolderModal(false)} className="flex-1 py-3 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl">CANCEL</button>
                <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-xl text-xs font-bold">CREATE_FOLDER</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="p-10 flex flex-col lg:flex-row gap-8 max-w-[1600px] mx-auto">
        <aside className="w-full lg:w-72 flex flex-col gap-6 flex-shrink-0">
          <div className="flex flex-col gap-1">
            <span className="font-label text-[0.6875rem] uppercase tracking-widest text-secondary font-bold">Workspace</span>
            <h2 className="font-headline text-2xl font-bold tracking-tight">{user?.name}.wishlist</h2>
          </div>

          <section className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/10 shadow-sm">
            <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3 mb-4">
              <span className="font-label text-xs font-bold uppercase tracking-wider">FOLDERS</span>
              <button onClick={() => setShowFolderModal(true)} className="material-symbols-outlined text-primary text-sm bg-primary/10 w-6 h-6 rounded flex items-center justify-center">add</button>
            </div>
            
            <nav className="flex flex-col gap-1">
              <button onClick={() => setSelectedFolderId(null)} className={`flex justify-between px-3 py-3 rounded-lg text-[13px] font-body font-bold tracking-tight transition-all ${!selectedFolderId ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
                <span className="font-mono uppercase">ALL_NODES</span>
                <span className="opacity-60 font-mono text-[11px]">{wishlistItems.length}</span>
              </button>
              <button onClick={() => setSelectedFolderId('UNCATEGORIZED')} className={`flex justify-between px-3 py-3 rounded-lg text-[13px] font-body font-bold tracking-tight transition-all ${selectedFolderId === 'UNCATEGORIZED' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
                <span className="font-mono uppercase">UNCATEGORIZED</span>
                <span className="opacity-60 font-mono text-[11px]">{wishlistItems.filter(i => !i.folder_id).length}</span>
              </button>
              <div className="h-2" />
              {folders.map(folder => (
                <button key={folder.id} onClick={() => setSelectedFolderId(folder.id)} className={`flex justify-between items-center px-3 py-3 rounded-lg text-[13px] font-body font-bold tracking-tight group transition-all ${selectedFolderId === folder.id ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <span className="truncate pr-2 uppercase">{folder.name}</span>
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span className="opacity-60">{wishlistItems.filter(i => Number(i.folder_id) === Number(folder.id)).length}</span>
                    <span onClick={(e) => { e.stopPropagation(); deleteFolder(folder.id); }} className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 hover:text-red-500">delete</span>
                  </div>
                </button>
              ))}
            </nav>
          </section>

          {/* COMPACT_SYNC_STATUS */}
          <section className="mt-4 pt-6 border-t border-dashed border-outline-variant/20">
            <div className="bg-slate-50/50 rounded-xl p-4 border border-outline-variant/10 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-tighter">Sync_Active</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 font-bold bg-white px-2 py-0.5 rounded border border-emerald-100 shadow-sm">200_OK</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                  <span className="text-primary/70 font-bold">ENDPOINT:</span>
                  <span className="truncate">GET /api/wishlist/details</span>
                </div>
                <p className="text-[11px] text-slate-500 font-body leading-relaxed">
                  사용자의 데이터 노드가 원격 서버와 <br/>실시간으로 동기화되고 있습니다.
                </p>
              </div>
            </div>
          </section>
        </aside>

        <div className="flex-1">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-headline text-xl font-bold">
              {selectedFolderId === 'UNCATEGORIZED' ? '미분류' : selectedFolderId ? folders.find(f => f.id === selectedFolderId)?.name : '전체 위시리스트'}
            </h3>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-surface-container-low text-[10px] font-mono px-3 py-1.5 rounded-lg outline-none border border-outline-variant/10">
              <option value="CREATED">NEWEST</option>
              <option value="TITLE">TITLE A-Z</option>
              <option value="TITLE_DESC">TITLE Z-A</option>
            </select>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" /></div>
          ) : sortedWishList.length === 0 ? (
            <div className="border-2 border-dashed border-outline-variant/30 rounded-xl flex flex-col items-center justify-center p-20 cursor-pointer" onClick={() => navigate('/explore')}>
              <span className="material-symbols-outlined text-4xl text-primary mb-4">add_location_alt</span>
              <p className="text-xs font-mono text-slate-400">// empty_data_node</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {sortedWishList.map((item) => {
                const itemId = item.contentid || item.content_id;
                const itemTitle = item.title || '여행지';
                const itemImage = item.firstimage || item.image_url || FALLBACK_IMAGE;

                return (
                  <div key={itemId} className="group bg-white rounded-xl overflow-hidden border border-outline-variant/10 hover:border-primary/30 transition-all shadow-sm relative">
                    {movingItemId === itemId && (
                      <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm p-6 flex flex-col">
                        <div className="flex justify-between mb-4 border-b pb-2"><span className="text-[10px] font-bold font-mono text-primary">MOVE_TO_FOLDER</span><button onClick={() => setMovingItemId(null)} className="material-symbols-outlined text-xs">close</button></div>
                        <div className="flex-1 overflow-y-auto space-y-1">
                          <button onClick={() => { moveItem(itemId, null); setMovingItemId(null); }} className="w-full text-left px-3 py-2 text-xs font-mono hover:bg-slate-50 rounded-lg flex justify-between">
                            <span>// UNCATEGORIZED</span>
                            {!item.folder_id && <span className="material-symbols-outlined text-xs text-emerald-500">check</span>}
                          </button>
                          {folders.map(f => (
                            <button key={f.id} onClick={() => { moveItem(itemId, f.id); setMovingItemId(null); }} className="w-full text-left px-3 py-2 text-xs font-mono hover:bg-slate-50 rounded-lg flex justify-between">
                              <span>// {f.name}</span>
                              {Number(item.folder_id) === Number(f.id) && <span className="material-symbols-outlined text-xs text-emerald-500">check</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="relative h-48">
                      <img src={itemImage} alt={itemTitle} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                        <button onClick={(e) => handleRemoveWish(e, itemId)} className="w-8 h-8 bg-white/90 text-red-500 rounded-lg flex items-center justify-center shadow-lg transition-all"><span className="material-symbols-outlined text-lg fill-1">favorite</span></button>
                        <button onClick={() => setMovingItemId(itemId)} className="w-8 h-8 bg-white/90 text-slate-500 rounded-lg flex items-center justify-center shadow-lg transition-all"><span className="material-symbols-outlined text-lg">folder_shared</span></button>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-headline text-base font-bold truncate mb-1">{itemTitle}</h3>
                      <p className="text-[10px] text-slate-400 font-mono mb-4 truncate">{item.addr1 || '주소 정보 없음'}</p>
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">FOLDER: {item.folder_id ? (folders.find(f => Number(f.id) === Number(item.folder_id))?.name || '...') : 'UNCATEGORIZED'}</span>
                        <Link to={`/explore/${itemId}`} className="bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-primary hover:text-white transition-all border border-slate-100">VIEW_DATA</Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyPage;
