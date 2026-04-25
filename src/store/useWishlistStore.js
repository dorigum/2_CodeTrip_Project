import { create } from 'zustand';
import wishlistApi from '../api/wishlistApi';

const useWishlistStore = create((set, get) => ({
  wishlistIds: new Set(),
  wishlistItems: [], // 모든 위시리스트 아이템 데이터 (중앙 집중 관리)
  folders: [],
  initialized: false,
  loading: false,

  // 서버에서 전체 상태(아이템 + 폴더)를 동기화하는 핵심 함수
  syncWithServer: async () => {
    set({ loading: true });
    try {
      const [wishRes, folderRes] = await Promise.all([
        wishlistApi.fetchWishlistDetails(),
        wishlistApi.getFolders()
      ]);
      
      const items = Array.isArray(wishRes.data) ? wishRes.data : [];
      const folders = Array.isArray(folderRes.data) ? folderRes.data : [];
      
      // 모든 형태의 ID 필드를 지원하도록 Set 구성
      const ids = new Set(items.map(item => String(item.contentid || item.content_id || item.contentId)));
      
      set({ 
        wishlistItems: items, 
        wishlistIds: ids,
        folders: folders,
        initialized: true,
        loading: false
      });
      return { items, folders };
    } catch (error) {
      console.error('Wishlist sync failed:', error);
      set({ loading: false });
      return { items: [], folders: [] };
    }
  },

  // 호환성용 별칭 추가
  fetchFolders: async () => {
    return await get().syncWithServer();
  },

  // 페이지 진입 시 최초 1회만 호출
  initWishlist: async () => {
    if (get().initialized) return;
    await get().syncWithServer();
  },

  // 위시리스트 토글 (추가/삭제)
  toggleWishlist: async (travelData, folderId = null) => {
    const rawId = travelData.contentid || travelData.content_id || travelData.contentId;
    const contentId = String(rawId);
    
    if (!contentId || contentId === 'undefined') return;

    const isAdding = !get().wishlistIds.has(contentId);

    try {
      await wishlistApi.toggleWishlist(travelData, folderId);
      
      // 토글 성공 후 즉시 서버와 데이터 동기화 (가장 확실함)
      await get().syncWithServer();
      
      if (isAdding) {
        alert('위시리스트에 추가되었습니다!');
      } else {
        alert('위시리스트에서 삭제되었습니다.');
      }
    } catch (error) {
      console.error('Toggle failed:', error);
      alert('요청을 처리하는 중 오류가 발생했습니다.');
    }
  },

  // 폴더 CRUD 액션
  createFolder: async (name) => {
    try {
      await wishlistApi.createFolder(name);
      await get().syncWithServer();
    } catch (e) { console.error(e); }
  },

  deleteFolder: async (folderId) => {
    try {
      await wishlistApi.deleteFolder(folderId);
      await get().syncWithServer();
    } catch (e) { console.error(e); }
  },

  moveItem: async (contentId, folderId) => {
    try {
      await wishlistApi.moveWishlistItem(contentId, folderId);
      await get().syncWithServer();
    } catch (e) { console.error(e); }
  },

  clearWishlist: () => {
    set({ wishlistIds: new Set(), wishlistItems: [], folders: [], initialized: false });
  }
}));

export default useWishlistStore;
