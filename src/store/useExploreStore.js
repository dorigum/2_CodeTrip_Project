import { create } from 'zustand';
import { getTravelInfo, getRegions } from '../api/travelInfoApi';

const NUM_OF_ROWS = 10;

const useExploreStore = create((set, get) => ({
  regions: [{ code: '', name: '전국' }],

  selectedRegions: new Set(['']),
  selectedThemes: new Set(['']),

  appliedRegions: [''],
  appliedThemes: [''],

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
    const { appliedRegions, appliedThemes, currentPage } = get();
    const targetRegion = appliedRegions[appliedRegions.length - 1] || undefined;
    const targetTheme = appliedThemes[appliedThemes.length - 1] || undefined;
    try {
      set({ loading: true });
      const result = await getTravelInfo({
        pageNo: currentPage,
        numOfRows: NUM_OF_ROWS,
        contentTypeId: targetTheme === '' ? undefined : targetTheme,
        areaCode: targetRegion === '' ? undefined : targetRegion,
      });
      set({ posts: result.items || [], totalCount: result.totalCount || 0, initialized: true });
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      set({ loading: false });
    }
  },

  fetchRegions: async () => {
    if (get().regions.length > 1) return;
    try {
      const items = await getRegions();
      const mapped = items.map((item) => ({
        code: String(item.code || ''),
        name: item.name || '',
      }));
      set({ regions: [{ code: '', name: '전국' }, ...mapped] });
    } catch {}
  },
}));

export { NUM_OF_ROWS };
export default useExploreStore;
