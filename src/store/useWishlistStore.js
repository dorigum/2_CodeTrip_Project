import { create } from 'zustand';
import { 
  fetchWishlistIds, 
  toggleWishlist as toggleApi, 
  fetchFolders, 
  createFolder as createFolderApi, 
  deleteFolder as deleteFolderApi,
  moveWishlistItem as moveItemApi
} from '../api/wishlistApi';

const useWishlistStore = create((set, get) => ({
  wishlistIds: new Set(),
  folders: [],
  loading: false,
  initialized: false,

  // 위시리스트 초기화
  initWishlist: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const [ids, folders] = await Promise.all([
        fetchWishlistIds(),
        fetchFolders()
      ]);
      console.log('Wishlist initialized with IDs:', ids, 'Folders:', folders);
      set({ 
        wishlistIds: new Set(ids.map(String)), 
        folders,
        initialized: true 
      });
    } catch (error) {
      console.error('Failed to init wishlist:', error);
    } finally {
      set({ loading: false });
    }
  },

  // 폴더 생성
  createFolder: async (name) => {
    try {
      const newFolder = await createFolderApi(name);
      set((state) => ({ folders: [...state.folders, newFolder] }));
      return newFolder;
    } catch (error) {
      console.error('Failed to create folder:', error);
      throw error;
    }
  },

  // 폴더 삭제
  deleteFolder: async (folderId) => {
    try {
      await deleteFolderApi(folderId);
      set((state) => ({ folders: state.folders.filter(f => f.id !== folderId) }));
    } catch (error) {
      console.error('Failed to delete folder:', error);
      throw error;
    }
  },

  // 아이템 폴더 이동
  moveItem: async (contentId, folderId) => {
    try {
      await moveItemApi(contentId, folderId);
      // 상세 데이터가 store에 없으므로 (MyPage local state 사용), 
      // 이 store에서는 전역 상태 동기화가 필요한 경우만 업데이트함
    } catch (error) {
      console.error('Failed to move item:', error);
      throw error;
    }
  },

  // 위시리스트 토글
  toggleWishlist: async (contentId) => {
// ... (기존 로직 유지)

    const idStr = String(contentId);
    console.log('Toggling wishlist for ID:', idStr);
    try {
      const result = await toggleApi(idStr);
      console.log('Toggle result from server:', result);
      
      // 서버 응답 기반으로 상태 업데이트
      set((state) => {
        const next = new Set(state.wishlistIds);
        if (result.wishlisted) {
          next.add(idStr);
        } else {
          next.delete(idStr);
        }
        return { wishlistIds: next };
      });
      return result;
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
      throw error; 
    }
  },

  // 위시리스트 여부 확인
  isWishlisted: (contentId) => {
    return get().wishlistIds.has(String(contentId));
  },

  // 위시리스트 비우기 (로그아웃 시 호출)
  clearWishlist: () => set({ wishlistIds: new Set(), initialized: false }),
}));

export default useWishlistStore;
