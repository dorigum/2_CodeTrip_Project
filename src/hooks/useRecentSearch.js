import { useState, useCallback } from 'react';

const KEY = 'codetrip_recent_searches';
const MAX = 5;

const getStored = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
};

const useRecentSearch = () => {
  const [recents, setRecents] = useState(getStored);

  const addSearch = useCallback((keyword) => {
    if (!keyword?.trim()) return;
    setRecents(prev => {
      const next = [keyword, ...prev.filter(k => k !== keyword)].slice(0, MAX);
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeSearch = useCallback((keyword) => {
    setRecents(prev => {
      const next = prev.filter(k => k !== keyword);
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    localStorage.removeItem(KEY);
    setRecents([]);
  }, []);

  return { recents, addSearch, removeSearch, clearAll };
};

export default useRecentSearch;
