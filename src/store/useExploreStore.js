import { create } from 'zustand';
import { getTravelList } from '../api/travelInfoApi';

const NUM_OF_ROWS = 10;

let exploreScrollY = 0;
export const getExploreScrollY = () => exploreScrollY;
export const setExploreScrollY = (y) => { exploreScrollY = y; };

const useExploreStore = create((set, get) => ({
  selectedRegions: new Set(['']),
  selectedThemes: new Set(['']),

  appliedRegions: [''],
  appliedThemes: [''],

  keyword: '',
  currentPage: 1,
  posts: [],
  totalCount: 0,
  loading: false,
  initialized: false,

  toggleRegion: (code) => {
    const s = String(code);
    set((state) => {
      if (s === '') return { selectedRegions: new Set(['']) };
      const next = new Set(state.selectedRegions);
      next.delete('');
      if (next.has(s)) { next.delete(s); if (next.size === 0) next.add(''); }
      else { next.add(s); }
      return { selectedRegions: next };
    });
  },

  toggleTheme: (code) => {
    const s = String(code);
    set((state) => {
      if (s === '') return { selectedThemes: new Set(['']) };
      const next = new Set(state.selectedThemes);
      next.delete('');
      if (next.has(s)) { next.delete(s); if (next.size === 0) next.add(''); }
      else { next.add(s); }
      return { selectedThemes: next };
    });
  },

  setKeyword: (keyword) => {
    const { selectedRegions, selectedThemes } = get();
    set({
      keyword,
      currentPage: 1,
      appliedRegions: Array.from(selectedRegions),
      appliedThemes: Array.from(selectedThemes),
    });
    get().fetchPosts();
  },

  clearKeyword: () => {
    set({ keyword: '' });
    get().fetchPosts();
  },

  applyFilter: () => {
    const { selectedRegions, selectedThemes } = get();
    set({
      appliedRegions: Array.from(selectedRegions),
      appliedThemes: Array.from(selectedThemes),
      currentPage: 1,
    });
    get().fetchPosts();
  },

  changePage: (page) => {
    const { currentPage, totalCount } = get();
    const totalPages = Math.ceil(totalCount / NUM_OF_ROWS);
    if (page < 1 || page > totalPages || page === currentPage) return;
    set({ currentPage: page });
    get().fetchPosts();
  },

  fetchPosts: async () => {
    const { appliedRegions, appliedThemes, currentPage, keyword } = get();
    try {
      set({ loading: true });
      const { items, totalCount } = await getTravelList({
        regions: appliedRegions,
        themes: appliedThemes,
        pageNo: currentPage,
        numOfRows: NUM_OF_ROWS,
        keyword,
      });
      set({ posts: items, totalCount, initialized: true });
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      set({ loading: false });
    }
  },

}));

export { NUM_OF_ROWS };
export default useExploreStore;
