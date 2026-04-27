import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFestivalList } from '../api/travelApi';

const Festivals = () => {
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState('default'); // 'default', 'date_asc', 'date_desc'
  const [totalPages, setTotalPages] = useState(0);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    const fetchFestivals = async () => {
      setLoading(true);
      const data = await getFestivalList(page, ITEMS_PER_PAGE, sortOrder);
      let items = data.items || [];

      setFestivals(items);
      setTotalPages(data.totalPages || 0);
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    fetchFestivals();
  }, [page, sortOrder]);

  return (
    <div className="p-6 lg:p-10 space-y-8 flex-1 flex flex-col bg-background">
      {/* Header 섹션 */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/20 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-primary font-bold">
            <span className="material-symbols-outlined">celebration</span>
            <p className="text-[11px] uppercase tracking-[0.2em] font-label">SYSTEM_EVENTS.EXE</p>
          </div>
          <h2 className="text-3xl font-headline font-bold text-slate-900">전국 축제 및 행사 정보</h2>
          <p className="text-slate-500 font-body text-sm">대한민국 곳곳에서 열리는 활기찬 축제 데이터를 탐색하세요.</p>
        </div>

        {/* 정렬 드롭다운 (위시리스트 디자인 적용) */}
        <div className="flex items-center gap-3 shrink-0">
          <select 
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value);
              setPage(1); // 정렬 변경 시 1페이지로 리셋
            }}
            className="bg-surface-container-low text-[10px] font-mono px-3 py-1.5 rounded-lg outline-none border border-outline-variant/10 cursor-pointer uppercase font-bold tracking-tighter"
          >
            <option value="default">DEFAULT_NODES</option>
            <option value="date_asc">DATE_ASCENDING</option>
            <option value="date_desc">DATE_DESCENDING</option>
          </select>
        </div>
      </div>

      {/* 리스트 섹션 */}
      <div className="flex-1 min-h-[600px]">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4 opacity-50">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-mono uppercase animate-pulse">loading_node_data...</p>
          </div>
        ) : festivals.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2 grayscale opacity-30">
            <span className="material-symbols-outlined text-6xl">inventory_2</span>
            <p className="font-mono text-sm">// no_festivals_found_in_cache</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {festivals.map((fest) => (
              <Link 
                key={fest.contentid} 
                to={`/explore/${fest.contentid}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group border border-outline-variant/10 flex flex-col"
              >
                <div className="aspect-[4/3] overflow-hidden relative bg-slate-100">
                  <img 
                    src={fest.firstimage || 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070'} 
                    alt={fest.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070'; }}
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-slate-200/50 uppercase font-mono tracking-tight flex items-center gap-1.5 shadow-lg z-10">
                    <span className="material-symbols-outlined text-[12px] text-primary">calendar_today</span>
                    <span>
                      {fest.eventstartdate && String(fest.eventstartdate).length >= 8 ? (
                        `${String(fest.eventstartdate).slice(4, 6)}.${String(fest.eventstartdate).slice(6, 8)} - ${
                          fest.eventenddate && String(fest.eventenddate).length >= 8
                            ? `${String(fest.eventenddate).slice(4, 6)}.${String(fest.eventenddate).slice(6, 8)}`
                            : '진행중'
                        }`
                      ) : '날짜정보없음'}
                    </span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <h3 className="font-headline font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">{fest.title}</h3>
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      <p className="truncate font-body">{fest.addr1 || '전국 각지'}</p>
                    </div>
                  </div>
                  <div className="pt-2 flex items-center justify-between border-t border-slate-50">
                    <span className="text-[10px] text-slate-300 font-mono uppercase tracking-tighter">type: 15_fest</span>
                    <div className="flex items-center gap-1 text-primary group-hover:gap-2 transition-all">
                      <span className="text-[10px] font-bold tracking-widest font-label uppercase">Explore</span>
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 페이지네이션 UI */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-10 pb-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-outline-variant/20 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <span className="material-symbols-outlined text-lg">chevron_left</span>
          </button>
          
          <div className="flex items-center gap-1">
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              // 현재 페이지 주변의 번호들을 보여주는 로직 (간소화)
              let pageNum = page <= 3 ? i + 1 : page + i - 2;
              if (pageNum > totalPages) pageNum = totalPages - (4 - i);
              if (pageNum <= 0) return null;

              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 rounded-lg font-mono text-sm transition-all ${
                    page === pageNum 
                      ? 'bg-primary text-white font-bold shadow-lg shadow-primary/20' 
                      : 'hover:bg-slate-50 text-slate-500'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-outline-variant/20 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Festivals;
