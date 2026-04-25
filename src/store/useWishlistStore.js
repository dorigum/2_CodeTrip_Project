import { create } from 'zustand';
import wishlistApi from '../api/wishlistApi';

const useWishlistStore = create((set, get) => ({
  wishlistIds: new Set(),
  wishlistItems: [],
  folders: [],
  initialized: false,
  loading: false,

  // 초기화: 명칭을 MyPage.jsx에 맞춰 initWishlist로 변경
  initWishlist: async () => {
    if (get().initialized) return;
    set({ loading: true });
    try {
      const [wishResponse, folderResponse] = await Promise.all([
        wishlistApi.fetchWishlistDetails(),
        wishlistApi.getFolders()
      ]);
      
      const items = wishResponse.data;
      const ids = new Set(items.map(item => String(item.content_id)));
      
      set({ 
        wishlistItems: items, 
        wishlistIds: ids,
        folders: folderResponse.data,
        initialized: true 
      });
    } catch (error) {
      console.error('Failed to initialize wishlist:', error);
    } finally {
      set({ loading: false });
    }
  },

  // 폴더 목록 새로고침
  fetchFolders: async () => {
    try {
      const response = await wishlistApi.getFolders();
      set({ folders: response.data });
    } catch (error) {
      console.error('Failed to fetch folders:', error);
    }
  },

  // 새 폴더 생성
  createFolder: async (name) => {
    try {
      const response = await wishlistApi.createFolder(name);
      const newFolder = response.data;
      set(state => ({ folders: [...state.folders, newFolder] }));
      return newFolder;
    } catch (error) {
      console.error('Failed to create folder:', error);
      return null;
    }
  },

  // 폴더 삭제
  deleteFolder: async (folderId) => {
    try {
      await wishlistApi.deleteFolder(folderId);
      set(state => ({
        folders: state.folders.filter(f => f.id !== folderId),
        wishlistItems: state.wishlistItems.map(item => 
          item.folder_id === folderId ? { ...item, folder_id: null } : item
        )
      }));
    } catch (error) {
      console.error('Failed to delete folder:', error);
    }
  },

  // 아이템 폴더 이동 (MyPage.jsx 명칭 moveItem에 맞춤)
  moveItem: async (contentId, folderId) => {
    try {
      await wishlistApi.moveWishlistItem(contentId, folderId);
      set(state => ({
        wishlistItems: state.wishlistItems.map(item => 
          String(item.contentid) === String(contentId) ? { ...item, folder_id: folderId } : item
        )
      }));
    } catch (error) {
      console.error('Failed to move item:', error);
    }
  },

  // 위시리스트 토글
  toggleWishlist: async (travelData, folderId = null) => {
    const contentId = String(travelData.contentid);
    const isAdding = !get().wishlistIds.has(contentId);

    try {
      await wishlistApi.toggleWishlist(travelData, folderId);
      
      // 즉각적인 데이터 갱신을 위해 API 재호출
      const response = await wishlistApi.fetchWishlistDetails();
      const items = response.data;
      const ids = new Set(items.map(item => String(item.content_id)));
      
      set({ wishlistItems: items, wishlistIds: ids });
      
      if (isAdding) {
        alert('위시리스트에 추가되었습니다!');
      } else {
        alert('위시리스트에서 삭제되었습니다.');
      }
    } catch (error) {
      console.error('Toggle wishlist failed:', error);
      alert('요청을 처리하는 중 오류가 발생했습니다.');
    }
  },

  clearWishlist: () => {
    set({ 
      wishlistIds: new Set(), 
      wishlistItems: [], 
      folders: [],
      initialized: false 
    });
  }
}));

export default useWishlistStore;
