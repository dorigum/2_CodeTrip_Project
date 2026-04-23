import { create } from 'zustand';
import { getTravelInfo, getTravelInfoByKeyword, getRegions } from '../api/travelInfoApi';

const NUM_OF_ROWS = 10;

const useExploreStore = create((set, get) => ({
  regions: [{ code: '', name: '전국' }],

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
    const callApi = keyword
      ? (params) => getTravelInfoByKeyword({ keyword, ...params })
      : (params) => getTravelInfo(params);
    try {
      set({ loading: true });
      const combinations = appliedRegions.flatMap((region) =>
        appliedThemes.map((theme) => ({ region, theme }))
      );
      const results = await Promise.all(
        combinations.map(({ region, theme }) =>
          callApi({
            pageNo: currentPage,
            numOfRows: NUM_OF_ROWS,
            contentTypeId: theme === '' ? undefined : theme,
            lDongRegnCd: region === '' ? undefined : region,
          })
        )
      );
      const items = results.flatMap((r) => r.items);
      const totalCount = results.reduce((sum, r) => sum + r.totalCount, 0);
      set({ posts: items, totalCount, initialized: true });
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
