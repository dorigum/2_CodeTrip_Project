import React, { useState, useEffect } from 'react';
import useWishlistStore from '../store/useWishlistStore';

const WishlistModal = ({ isOpen, onClose, travelData }) => {
  const { folders, fetchFolders, createFolder, toggleWishlist } = useWishlistStore();
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchFolders();
    }
  }, [isOpen, fetchFolders]);

  if (!isOpen) return null;

  const handleSelectFolder = async (folderId) => {
    await toggleWishlist(travelData, folderId);
    onClose();
  };

  const handleCreateAndSave = async () => {
    if (!newFolderName.trim()) return;
    const newFolder = await createFolder(newFolderName);
    if (newFolder) {
      await handleSelectFolder(newFolder.id);
    }
    setNewFolderName('');
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-pink-500">folder_heart</span>
            위시리스트 폴더 선택
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 max-h-[400px] overflow-y-auto custom-scrollbar">
          <div className="grid gap-3">
            {/* 기본 미분류 폴더 */}
            <button
              onClick={() => handleSelectFolder(null)}
              className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-pink-500/50 hover:bg-slate-800 transition-all group"
            >
              <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                <span className="material-symbols-outlined text-slate-400 group-hover:text-pink-500">inventory_2</span>
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">미분류</div>
                <div className="text-xs text-slate-500">기본 저장소</div>
              </div>
            </button>

            {/* 사용자 정의 폴더 목록 */}
            {folders.map(folder => (
              <button
                key={folder.id}
                onClick={() => handleSelectFolder(folder.id)}
                className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 hover:bg-slate-800 transition-all group"
              >
                <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-500">folder</span>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-white">{folder.name}</div>
                  <div className="text-xs text-slate-500">{new Date(folder.created_at).toLocaleDateString()} 생성</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 bg-slate-800/30 border-t border-slate-800">
          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-3 flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 transition-all"
            >
              <span className="material-symbols-outlined">add_circle</span>
              새 폴더 만들기
            </button>
          ) : (
            <div className="flex gap-2 animate-in slide-in-from-bottom-2 duration-200">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="폴더 이름 입력..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-pink-500 transition-colors"
                autoFocus
              />
              <button
                onClick={handleCreateAndSave}
                className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-xl font-bold transition-colors"
              >
                생성
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl transition-colors"
              >
                취소
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistModal;
