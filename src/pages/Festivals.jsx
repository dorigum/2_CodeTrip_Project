import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFestivalList } from '../api/travelApi';

const Festivals = () => {
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFestivals = async () => {
      setLoading(true);
      const data = await getFestivalList(100); // 전체 리스트를 위해 더 많이 가져옴
      setFestivals(data);
      setLoading(false);
    };
    fetchFestivals();
  }, []);

  return (
    <div className="p-6 lg:p-10 space-y-8 flex-1 flex flex-col bg-background">
      {/* Header 섹션 */}
      <div className="space-y-2 border-b border-outline-variant/20 pb-6">
        <div className="flex items-center gap-3 text-primary font-bold">
          <span className="material-symbols-outlined">celebration</span>
          <p className="text-[11px] uppercase tracking-[0.2em] font-label">SYSTEM_EVENTS.EXE</p>
        </div>
        <h2 className="text-3xl font-headline font-bold text-slate-900">전국 축제 및 행사 정보</h2>
        <p className="text-slate-500 font-body text-sm">대한민국 곳곳에서 열리는 활기찬 축제 데이터를 탐색하세요.</p>
      </div>

      {/* 리스트 섹션 */}
      <div className="flex-1">
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
                  <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white text-[9px] font-bold px-2 py-1 rounded-md border border-white/20 uppercase font-mono tracking-tighter">
                    {fest.eventstartdate || 'NOW'}
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
    </div>
  );
};

export default Festivals;
