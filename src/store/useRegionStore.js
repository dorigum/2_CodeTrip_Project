import { create } from 'zustand';
import { getRegions } from '../api/travelInfoApi';
import { DEFAULT_REGIONS } from '../constants/regions';

const useRegionStore = create((set, get) => ({
  regions: DEFAULT_REGIONS,

  fetchRegions: async () => {
    if (get().regions !== DEFAULT_REGIONS) return;
    try {
      const items = await getRegions();
      if (items.length === 0) return;
      const knownCodes = new Set(DEFAULT_REGIONS.map((r) => r.code));
      const newRegions = items
        .filter((item) => !knownCodes.has(String(item.code || '')))
        .map((item) => ({ code: String(item.code || ''), name: item.name || '' }));
      set({ regions: [...DEFAULT_REGIONS, ...newRegions] });
    } catch { /* noop */ }
  },
}));

export default useRegionStore;
