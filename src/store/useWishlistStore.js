import { create } from 'zustand';
import { fetchWishlistIds, toggleWishlist as toggleApi } from '../api/wishlistApi';

const useWishlistStore = create((set, get) => ({
  wishlistIds: new Set(),
  loading: false,

  // 위시리스트 초기화 (로그인 시 호출)
  initWishlist: async () => {
    set({ loading: true });
    try {
      const ids = await fetchWishlistIds();
      set({ wishlistIds: new Set(ids.map(String)) });
    } catch (error) {
      console.error('Failed to init wishlist:', error);
    } finally {
      set({ loading: false });
    }
  },

  // 위시리스트 토글
  toggleWishlist: async (contentId) => {
    const idStr = String(contentId);
    try {
      const result = await toggleApi(idStr);
      set((state) => {
        const next = new Set(state.wishlistIds);
        if (result.wishlisted) next.add(idStr);
        else next.delete(idStr);
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
  clearWishlist: () => set({ wishlistIds: new Set() }),
}));

export default useWishlistStore;
