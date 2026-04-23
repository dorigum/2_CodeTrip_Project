import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import { getTravelInfo, getRegions } from '../api/travelInfoApi';

const NUM_OF_ROWS = 10;
const CONTENT_TYPE_MAP = {
  '12': '관광지', '14': '문화시설', '15': '축제공연행사', '25': '여행코스', 
  '28': '레포츠', '32': '숙박', '38': '쇼핑', '39': '음식점'
};
const THEME_LIST = [
  { code: '', name: '전체' },
  ...Object.entries(CONTENT_TYPE_MAP).map(([code, name]) => ({ code, name })),
];
const STORAGE_KEY = 'explore_state';
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop';

const Explore = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [restoredState] = useState(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(restoredState?.currentPage ?? 1);
  const [totalCount, setTotalCount] = useState(0);
  const [regions, setRegions] = useState([{ code: '', name: '전국' }]);
  const [regionOpen, setRegionOpen] = useState(true);
  const [themeOpen, setThemeOpen] = useState(true);
  
  // UI상에서 선택된 상태
  const [selectedRegions, setSelectedRegions] = useState(() => new Set(restoredState?.selectedRegions ?? ['']));
  const [selectedThemes, setSelectedThemes] = useState(() => new Set(restoredState?.selectedThemes ?? ['']));
  
  // 실제 API 호출에 적용된 필터 (RUN_FILTER 클릭 시 갱신)
  const [appliedRegions, setAppliedRegions] = useState(restoredState?.appliedRegions ?? ['']);
  const [appliedThemes, setAppliedThemes] = useState(restoredState?.appliedThemes ?? ['']);

  const totalPages = Math.ceil(totalCount / NUM_OF_ROWS);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      
      // 가장 최근에 선택된 필터값 하나씩만 우선 적용 (공공데이터 API 안정성 위함)
      const targetRegion = appliedRegions[appliedRegions.length - 1] || undefined;
      const targetTheme = appliedThemes[appliedThemes.length - 1] || undefined;

      const result = await getTravelInfo({
        pageNo: currentPage,
        numOfRows: NUM_OF_ROWS,
        contentTypeId: targetTheme === '' ? undefined : targetTheme,
        areaCode: targetRegion === '' ? undefined : targetRegion,
      });

      setPosts(result.items || []);
      setTotalCount(result.totalCount || 0);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, appliedRegions, appliedThemes]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  useEffect(() => {
    const fetchRegions = async () => {
      const items = await getRegions();
      const mapped = items.map((item) => ({
        code: String(item.code || ''),
        name: item.name || '',
      }));
      setRegions([{ code: '', name: '전국' }, ...mapped]);
    };
    fetchRegions();
  }, []);

  const toggleRegion = (code) => {
    const sCode = String(code);
    setSelectedRegions((prev) => {
      if (sCode === '') return new Set(['']);
      const next = new Set(prev);
      next.delete('');
      if (next.has(sCode)) { next.delete(sCode); if (next.size === 0) next.add(''); } 
      else { next.add(sCode); }
      return next;
    });
  };

  const toggleTheme = (code) => {
    const sCode = String(code);
    setSelectedThemes((prev) => {
      if (sCode === '') return new Set(['']);
      const next = new Set(prev);
      next.delete('');
      if (next.has(sCode)) { next.delete(sCode); if (next.size === 0) next.add(''); } 
      else { next.add(sCode); }
      return next;
    });
  };

  const handleRunFilter = () => {
    setAppliedRegions(Array.from(selectedRegions));
    setAppliedThemes(Array.from(selectedThemes));
    setCurrentPage(1); // 필터 변경 시 첫 페이지로
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const WINDOW = 2;
    const start = Math.max(1, currentPage - WINDOW);
    const end = Math.min(totalPages, currentPage + WINDOW);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const filteredPosts = posts.filter(post => 
    post.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface font-headline">여행지 탐색 <span className="text-primary">.</span></h1>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* Sidebar Filters */}
        <aside className="col-span-12 lg:col-span-3 xl:col-span-2">
          <div className="bg-surface-container-low rounded-xl p-6 font-mono text-sm sticky top-8 border border-outline-variant/10 shadow-sm">
            <div className="flex items-center gap-2 mb-6 border-b border-outline-variant/20 pb-4">
              <span className="material-symbols-outlined text-primary text-lg">settings_ethernet</span>
              <span className="font-bold text-on-surface font-headline text-sm">filters.config</span>
            </div>
            <div className="space-y-6">
              {/* Region */}
              <section>
                <div className="flex items-center justify-between mb-2 cursor-pointer select-none" onClick={() => setRegionOpen(!regionOpen)}>
                  <span className="syntax-keyword text-sm">Region</span>
                  <span className={`material-symbols-outlined text-xs text-outline transition-transform ${regionOpen ? 'rotate-90' : ''}`}>expand_more</span>
                </div>
                {regionOpen && (
                  <ul className="ml-4 space-y-2 border-l border-outline-variant/30 pl-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {regions.map((r) => (
                      <li key={r.code} className="flex items-center gap-2 cursor-pointer group" onClick={() => toggleRegion(r.code)}>
                        <span className={`w-1.5 h-1.5 transition-colors flex-shrink-0 ${r.code === '' ? 'rounded-sm' : 'rounded-full'} ${selectedRegions.has(String(r.code)) ? 'bg-primary' : 'bg-outline-variant group-hover:bg-primary'}`} />
                        <span className={`text-xs transition-colors ${selectedRegions.has(String(r.code)) ? 'text-primary font-medium' : 'text-on-secondary-container group-hover:text-primary'}`}>#{r.name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Theme */}
              <section>
                <div className="flex items-center justify-between mb-2 cursor-pointer select-none" onClick={() => setThemeOpen(!themeOpen)}>
                  <span className="syntax-keyword text-sm">Theme</span>
                  <span className={`material-symbols-outlined text-xs text-outline transition-transform ${themeOpen ? 'rotate-90' : ''}`}>expand_more</span>
                </div>
                {themeOpen && (
                  <ul className="ml-4 space-y-2 border-l border-outline-variant/30 pl-4">
                    {THEME_LIST.map((t) => (
                      <li key={t.code} className="flex items-center gap-2 cursor-pointer group" onClick={() => toggleTheme(t.code)}>
                        <span className={`w-1.5 h-1.5 transition-colors flex-shrink-0 ${t.code === '' ? 'rounded-sm' : 'rounded-full'} ${selectedThemes.has(String(t.code)) ? 'bg-primary' : 'bg-outline-variant group-hover:bg-primary'}`} />
                        <span className={`text-xs transition-colors ${selectedThemes.has(String(t.code)) ? 'text-primary font-medium' : 'text-on-secondary-container group-hover:text-primary'}`}>#{t.name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <button onClick={handleRunFilter} className="w-full py-2 bg-primary text-on-primary rounded-lg font-label text-xs font-bold hover:brightness-110 transition-all shadow-md">RUN_FILTER.SH</button>
            </div>
          </div>
        </aside>

        {/* Content */}
        <div className="col-span-12 lg:col-span-9 xl:col-span-7">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
              <p className="text-xs font-mono text-outline animate-pulse">// fetching_data...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-on-secondary-container">
              <span className="material-symbols-outlined text-5xl mb-4 opacity-30">search_off</span>
              <p className="font-label text-sm syntax-comment">// no results found.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredPosts.map((post) => (
                  <article key={post.contentid} className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-outline-variant/10">
                    <div className="relative h-64 overflow-hidden bg-surface-container-low">
                      <img src={post.firstimage || FALLBACK_IMAGE} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onError={(e) => { e.target.src = FALLBACK_IMAGE; }} />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-on-surface mb-1 truncate font-headline">{post.title}</h3>
                      <div className="flex items-center gap-1 text-outline text-xs font-mono mb-4">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        <span className="truncate">{post.addr1}</span>
                      </div>
                      <div className="mt-6 flex justify-end">
                        <Link to={`/explore/${post.contentid}`} state={{ firstimage: post.firstimage }} className="px-4 py-2 bg-primary text-on-primary rounded-full text-xs font-bold font-label hover:brightness-110 transition-all">상세보기</Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Numbered Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-1 font-mono">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg text-on-secondary-container hover:bg-surface-container-high disabled:opacity-30 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>

                  {getPageNumbers()[0] > 1 && (
                    <>
                      <button onClick={() => handlePageChange(1)} className="w-9 h-9 rounded-lg text-xs hover:bg-surface-container-high transition-colors">1</button>
                      {getPageNumbers()[0] > 2 && <span className="w-9 h-9 flex items-center justify-center text-xs text-outline">..</span>}
                    </>
                  )}

                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                        page === currentPage ? 'bg-primary text-on-primary shadow-md scale-110' : 'text-on-secondary-container hover:bg-surface-container-high'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  {getPageNumbers().at(-1) < totalPages && (
                    <>
                      {getPageNumbers().at(-1) < totalPages - 1 && <span className="w-9 h-9 flex items-center justify-center text-xs text-outline">..</span>}
                      <button onClick={() => handlePageChange(totalPages)} className="w-9 h-9 rounded-lg text-xs hover:bg-surface-container-high transition-colors">{totalPages}</button>
                    </>
                  )}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg text-on-secondary-container hover:bg-surface-container-high disabled:opacity-30 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Explore;
