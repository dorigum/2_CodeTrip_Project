import { create } from 'zustand';
import { getTravelList } from '../api/travelInfoApi';

const NUM_OF_ROWS = 10;

let exploreScrollY = 0;
export const getExploreScrollY = () => exploreScrollY;
export const setExploreScrollY = (y) => { exploreScrollY = y; };

// TourAPI areaBasedList2의 areacode 값과 일치하는 지역 목록 (ldongCode2 API 코드와 다름)
const REGIONS = [
  { code: '', name: '전국' },
  { code: '1', name: '서울' },
  { code: '2', name: '인천' },
  { code: '3', name: '대전' },
  { code: '4', name: '대구' },
  { code: '5', name: '광주' },
  { code: '6', name: '부산' },
  { code: '7', name: '울산' },
  { code: '8', name: '세종' },
  { code: '31', name: '경기' },
  { code: '32', name: '강원' },
  { code: '33', name: '충북' },
  { code: '34', name: '충남' },
  { code: '35', name: '전북' },
  { code: '36', name: '전남' },
  { code: '37', name: '경북' },
  { code: '38', name: '경남' },
  { code: '39', name: '제주' },
];

const useExploreStore = create((set, get) => ({
  regions: REGIONS,

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
