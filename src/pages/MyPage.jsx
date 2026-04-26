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
    initWishlist, toggleWishlist, createFolder, updateFolder, deleteFolder, moveItem,
    initialized: wishlistInitialized
  } = useWishlistStore();

  const [sortBy, setSortBy] = useState('CREATED');
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderStart, setNewFolderStart] = useState('');
  const [newFolderEnd, setNewFolderEnd] = useState('');
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [editFolderName, setEditFolderName] = useState('');
  const [editFolderStart, setEditFolderStart] = useState('');
  const [editFolderEnd, setEditFolderEnd] = useState('');
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

  const openEditModal = (folder) => {
    setEditingFolder(folder);
    setEditFolderName(folder.name);
    setEditFolderStart(folder.start_date ? String(folder.start_date).slice(0, 10) : '');
    setEditFolderEnd(folder.end_date ? String(folder.end_date).slice(0, 10) : '');
  };

  const closeEditModal = () => {
    setEditingFolder(null);
    setEditFolderName('');
    setEditFolderStart('');
    setEditFolderEnd('');
  };

  const handleUpdateFolder = async (e) => {
    e.preventDefault();
    if (!editFolderName.trim()) return;
    await updateFolder(editingFolder.id, editFolderName.trim(), editFolderStart || null, editFolderEnd || null);
    closeEditModal();
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    await createFolder(
      newFolderName.trim(),
      newFolderStart || null,
      newFolderEnd || null
    );
    setNewFolderName('');
    setNewFolderStart('');
    setNewFolderEnd('');
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

  // 날짜 형식화 함수
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  const DAYS_KO = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

  // "YYYY-MM-DD" 또는 MySQL ISO 문자열("YYYY-MM-DDT...Z") → 로컬 기준 Date
  const parseLocalDate = (str) => {
    const dateOnly = String(str).slice(0, 10); // "2026-04-25T00:00:00.000Z" → "2026-04-25"
    const [y, m, d] = dateOnly.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  // 사이드바 폴더 버튼용 짧은 일정 문자열
  const formatScheduleShort = (startStr, endStr) => {
    if (!startStr) return null;
    const s = parseLocalDate(startStr);
    const sm = String(s.getMonth() + 1).padStart(2, '0');
    const sd = String(s.getDate()).padStart(2, '0');
    const startLabel = `${sm}.${sd}(${DAYS_KO[s.getDay()]})`;
    if (!endStr) return startLabel;
    const e = parseLocalDate(endStr);
    const em = String(e.getMonth() + 1).padStart(2, '0');
    const ed = String(e.getDate()).padStart(2, '0');
    const endLabel = `${em}.${ed}(${DAYS_KO[e.getDay()]})`;
    const nights = Math.round((e - s) / 86400000);
    const duration = nights === 0 ? '당일치기' : `${nights}박 ${nights + 1}일`;
    return `${startLabel} ~ ${endLabel} : ${duration}`;
  };

  // FOLDER_METADATA 패널용 전체 일정 문자열
  const formatScheduleFull = (startStr, endStr) => {
    if (!startStr) return null;
    const s = parseLocalDate(startStr);
    const sy = s.getFullYear();
    const sm = String(s.getMonth() + 1).padStart(2, '0');
    const sd = String(s.getDate()).padStart(2, '0');
    const startLabel = `${sy}.${sm}.${sd}(${DAYS_KO[s.getDay()]})`;
    if (!endStr) return startLabel;
    const e = parseLocalDate(endStr);
    const ey = e.getFullYear();
    const em = String(e.getMonth() + 1).padStart(2, '0');
    const ed = String(e.getDate()).padStart(2, '0');
    const endLabel = `${ey}.${em}.${ed}(${DAYS_KO[e.getDay()]})`;
    const nights = Math.round((e - s) / 86400000);
    const duration = nights === 0 ? '당일치기' : `${nights}박 ${nights + 1}일`;
    return `${startLabel}\n~ ${endLabel}\n: ${duration}`;
  };

  const selectedFolder = selectedFolderId ? folders.find(f => Number(f.id) === Number(selectedFolderId)) : null;

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
            <form onSubmit={handleCreateFolder} className="p-6 flex flex-col gap-5">
              {/* 폴더 이름 */}
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">folder_name</label>
                <input
                  autoFocus
                  type="text"
                  placeholder="예: 부산 1박 2일 맛집투어"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary transition-all"
                />
              </div>

              {/* 여행 일정 */}
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  travel_schedule <span className="text-slate-300 normal-case">(선택)</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={newFolderStart}
                    onChange={(e) => {
                      setNewFolderStart(e.target.value);
                      if (newFolderEnd && e.target.value > newFolderEnd) setNewFolderEnd('');
                    }}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-mono outline-none focus:border-primary transition-all"
                  />
                  <span className="text-slate-400 font-mono text-xs shrink-0">~</span>
                  <input
                    type="date"
                    value={newFolderEnd}
                    min={newFolderStart || undefined}
                    onChange={(e) => setNewFolderEnd(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-mono outline-none focus:border-primary transition-all"
                  />
                </div>
                {/* 미리보기 */}
                {newFolderStart && (
                  <p className="text-[10px] font-mono text-primary mt-2 leading-relaxed">
                    {formatScheduleShort(newFolderStart, newFolderEnd)}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowFolderModal(false); setNewFolderName(''); setNewFolderStart(''); setNewFolderEnd(''); }}
                  className="flex-1 py-3 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  CANCEL
                </button>
                <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-xl text-xs font-bold">
                  CREATE_FOLDER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Folder Edit Modal */}
      {editingFolder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-outline-variant/20 animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest">edit_folder.sh</span>
              <button onClick={closeEditModal} className="material-symbols-outlined text-slate-400 hover:text-on-surface transition-colors">close</button>
            </div>
            <form onSubmit={handleUpdateFolder} className="p-6 flex flex-col gap-5">
              {/* 폴더 이름 */}
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">folder_name</label>
                <input
                  autoFocus
                  type="text"
                  placeholder="폴더 이름"
                  value={editFolderName}
                  onChange={(e) => setEditFolderName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary transition-all"
                />
              </div>

              {/* 여행 일정 */}
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  travel_schedule <span className="text-slate-300 normal-case">(선택)</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={editFolderStart}
                    onChange={(e) => {
                      setEditFolderStart(e.target.value);
                      if (editFolderEnd && e.target.value > editFolderEnd) setEditFolderEnd('');
                    }}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-mono outline-none focus:border-primary transition-all"
                  />
                  <span className="text-slate-400 font-mono text-xs shrink-0">~</span>
                  <input
                    type="date"
                    value={editFolderEnd}
                    min={editFolderStart || undefined}
                    onChange={(e) => setEditFolderEnd(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-mono outline-none focus:border-primary transition-all"
                  />
                </div>
                {editFolderStart && (
                  <p className="text-[10px] font-mono text-primary mt-2 leading-relaxed">
                    {formatScheduleShort(editFolderStart, editFolderEnd)}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 py-3 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  CANCEL
                </button>
                <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-xl text-xs font-bold">
                  SAVE_CHANGES
                </button>
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
                <button key={folder.id} onClick={() => setSelectedFolderId(folder.id)} className={`flex justify-between items-start px-3 py-3 rounded-lg text-[13px] font-body font-bold tracking-tight group transition-all ${selectedFolderId === folder.id ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <div className="flex-1 min-w-0 text-left">
                    <span className="block truncate uppercase">{folder.name}</span>
                    {folder.start_date && (
                      <span className={`block text-[10px] font-mono font-normal mt-0.5 truncate ${selectedFolderId === folder.id ? 'text-white/70' : 'text-slate-400'}`}>
                        {formatScheduleShort(folder.start_date, folder.end_date)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[11px] shrink-0 ml-2 mt-0.5">
                    <span className="opacity-60">{wishlistItems.filter(i => Number(i.folder_id) === Number(folder.id)).length}</span>
                    <span onClick={(e) => { e.stopPropagation(); openEditModal(folder); }} className={`material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity ${selectedFolderId === folder.id ? 'hover:text-white/80' : 'hover:text-primary'}`}>edit</span>
                    <span onClick={(e) => { e.stopPropagation(); deleteFolder(folder.id); }} className={`material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity ${selectedFolderId === folder.id ? 'hover:text-red-300' : 'hover:text-red-500'}`}>delete</span>
                  </div>
                </button>
              ))}
            </nav>
          </section>

          {/* FOLDER_METADATA 복구 */}
          {selectedFolder && (
            <section className="bg-inverse-surface text-inverse-on-surface p-5 rounded-xl font-mono text-[10px] leading-relaxed shadow-lg animate-in slide-in-from-left-4 duration-300">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
                <span className="material-symbols-outlined text-primary-container text-sm">info</span>
                <span className="uppercase opacity-60 tracking-widest">Folder_Metadata</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="opacity-40">CREATED_AT:</span>
                  <span className="text-emerald-400 font-bold">{formatDate(selectedFolder.created_at)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="opacity-40">LAST_UPDATED:</span>
                  <span className="text-emerald-400 font-bold">{formatDate(selectedFolder.updated_at || selectedFolder.created_at)}</span>
                </div>
                {selectedFolder.start_date && (
                  <div className="flex flex-col gap-1.5 border-t border-white/5 pt-2 mt-2">
                    <span className="opacity-40">TRAVEL_DATE:</span>
                    <span className="text-cyan-400 font-bold text-[10px] leading-relaxed whitespace-pre-line">
                      {formatScheduleFull(selectedFolder.start_date, selectedFolder.end_date)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center border-t border-white/5 pt-2 mt-2">
                  <span className="opacity-40">NODE_COUNT:</span>
                  <span className="text-primary-container font-bold">{wishlistItems.filter(i => Number(i.folder_id) === Number(selectedFolderId)).length}</span>
                </div>
              </div>
            </section>
          )}

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
            <div>
              <h3 className="font-headline text-xl font-bold">
                {selectedFolderId === 'UNCATEGORIZED' ? '미분류' : selectedFolderId ? folders.find(f => f.id === selectedFolderId)?.name : '전체 위시리스트'}
              </h3>
              {selectedFolder?.start_date && (
                <p className="text-[11px] font-mono text-primary mt-1">
                  {formatScheduleShort(selectedFolder.start_date, selectedFolder.end_date)}
                </p>
              )}
            </div>
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
