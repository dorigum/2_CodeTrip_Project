import { create } from 'zustand';

const KEY = 'codetrip_recently_viewed';
const MAX = 10;

const getStored = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
};

const useRecentlyViewedStore = create((set) => ({
  items: getStored(),

  addItem: (item) => {
    if (!item?.contentid) return;
    set(state => {
      const filtered = state.items.filter(i => String(i.contentid) !== String(item.contentid));
      const next = [item, ...filtered].slice(0, MAX);
      localStorage.setItem(KEY, JSON.stringify(next));
      return { items: next };
    });
  },

  clearAll: () => {
    localStorage.removeItem(KEY);
    set({ items: [] });
  },
}));

export default useRecentlyViewedStore;
