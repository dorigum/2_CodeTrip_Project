import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getWeather, getLocationName } from '../api/weatherApi';
import { getPhotoList, getFestivalList, getCityBasedPlaces } from '../api/travelApi';

const MOCK_HERO = [
  { galContentId: 'm1', galTitle: '감성 여행', galPhotographyLocation: '대한민국', galWebImageUrl: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?q=80&w=2070' },
  { galContentId: 'm2', galTitle: '평화로운 산책', galPhotographyLocation: '전국 팔도', galWebImageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2094' }
];

const Home = () => {
  const [weather, setWeather] = useState({ temp: 24, label: 'Sunny', icon: 'sunny', keywords: ['여행'], location: '서울' });
  const [province, setProvince] = useState('서울');
  const [topImgList, setTopImgList] = useState(MOCK_HERO);
  const [topImgIndex, setTopImgIndex] = useState(0);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [nearbyIndex, setNearbyIndex] = useState(0);
  const [weatherRec, setWeatherRec] = useState(null);
  const [trendingItems, setTrendingItems] = useState([]);
  
  const [loading, setLoading] = useState({ nearby: true, trending: true, weather: true });
  const [isSlotSpinning, setIsSlotSpinning] = useState(false);
  
  const topImgTimerRef = useRef(null);

  const init = useCallback(async () => {
    let lat = 37.5665, lon = 126.9780, locName = '서울', locProv = '서울';
    try {
      const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 }));
      const locData = await getLocationName(pos.coords.latitude, pos.coords.longitude);
      lat = pos.coords.latitude; lon = pos.coords.longitude;
      locName = locData.city || '서울'; locProv = locData.state || '서울';
    } catch (e) {}

    setProvince(locProv);
    const weatherData = await getWeather(lat, lon);
    setWeather({ ...weatherData, location: locName });

    const tops = await getPhotoList(null, 15);
    if (tops && tops.length > 0) setTopImgList(tops);

    const near = await getCityBasedPlaces(locProv);
    if (near && near.length > 0) setNearbyPlaces(near);
    setLoading(prev => ({ ...prev, nearby: false }));

    const recs = await getPhotoList(weatherData.keywords, 1);
    if (recs && recs.length > 0) setWeatherRec(recs[0]);
    setLoading(prev => ({ ...prev, weather: false }));

    const fests = await getFestivalList();
    const festItems = (fests || []).slice(0, 10).map(f => ({
      type: 'festival', icon: 'celebration', title: f.title, 
      subtitle: f.eventstartdate ? `${f.eventstartdate.slice(4,6)}/${f.eventstartdate.slice(6,8)}` : '',
      location: f.addr1?.split(' ')[0] || '전국', image: f.firstimage
    }));
    setTrendingItems(festItems);
    setLoading(prev => ({ ...prev, trending: false }));
  }, []);

  useEffect(() => { init(); }, [init]);

  const handleSlotSpin = async () => {
    if (isSlotSpinning) return;
    setIsSlotSpinning(true);
    const candidates = await getPhotoList(weather.keywords, 10);
    if (candidates && candidates.length > 0) {
      for(let i=0; i<candidates.length * 1.2; i++) {
        setWeatherRec(candidates[i % candidates.length]);
        await new Promise(r => setTimeout(r, 100));
      }
    }
    setIsSlotSpinning(false);
  };

  useEffect(() => {
    topImgTimerRef.current = setInterval(() => {
      setTopImgIndex(prev => (prev + 1) % topImgList.length);
    }, 5000);
    return () => clearInterval(topImgTimerRef.current);
  }, [topImgList]);

  const currentTop = topImgList[topImgIndex] || MOCK_HERO[0];

  return (
    <div className="p-6 lg:p-10 space-y-6 flex-1 flex flex-col bg-background overflow-hidden">
      
      {/* 1. 상단 파노라마 이미지 */}
      <section className="relative w-full h-[25vh] min-h-[200px] rounded-2xl overflow-hidden shadow-xl bg-surface-container-high shrink-0">
        <img src={currentTop.galWebImageUrl} key={currentTop.galContentId} className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000" alt="bg" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-transparent flex items-center px-12">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center px-3 py-1 bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 w-fit text-white text-[10px] font-bold tracking-widest uppercase font-label">
              system.log: live_feed_active
            </div>
            <h1 className="text-4xl lg:text-5xl font-headline font-bold text-white leading-tight drop-shadow-lg">
              Build your next <span className="text-primary-container">Adventure.</span>
            </h1>
            <p className="text-white/80 text-base font-body max-w-lg leading-relaxed">대한민국 곳곳의 숨겨진 장소들을 탐험하세요.</p>
            <div className="pt-1">
              <Link to="/explore" className="bg-white/50 backdrop-blur-md text-slate-900 px-7 py-2.5 rounded-full font-bold hover:bg-white/70 transition-all flex items-center gap-2 w-fit text-sm shadow-lg font-label border border-white/20">
                <span>GET STARTED</span>
                <span className="material-symbols-outlined text-sm font-bold">arrow_right_alt</span>
              </Link>
            </div>
          </div>
          <div className="absolute bottom-6 right-8 bg-white/70 backdrop-blur-2xl p-4 rounded-xl shadow-xl border border-white/30 text-slate-900">
            <p className="text-slate-500 text-[9px] uppercase mb-0.5 font-bold tracking-widest font-label">{province} {weather.location}</p>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-headline font-bold text-primary">{weather.temp}°C</span>
              <span className="material-symbols-outlined text-2xl text-primary" style={{fontVariationSettings: "'FILL' 1"}}>{weather.icon}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 카드 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: Regional (Near Me) */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-outline-variant/10 relative overflow-hidden flex flex-col group">
            {loading.nearby && <div className="absolute inset-0 bg-white/90 z-20 flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}
            <div className="flex-1 flex flex-col space-y-5">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    <p className="text-[10px] uppercase tracking-widest font-label">Status: Online // Near_Me</p>
                  </div>
                  <h3 className="font-headline text-2xl font-bold text-slate-900">지역 기반 추천</h3>
                </div>
                <button onClick={() => setNearbyIndex(i => (i+1) % (nearbyPlaces.length || 1))} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-900 rounded-xl hover:bg-primary hover:text-white transition-all shadow-md"><span className="material-symbols-outlined">navigate_next</span></button>
              </div>
              <div className="h-52 w-full rounded-2xl overflow-hidden bg-slate-100 shadow-inner">
                <img src={nearbyPlaces[nearbyIndex]?.firstimage || MOCK_HERO[0].galWebImageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="n" onError={(e) => e.target.src = MOCK_HERO[0].galWebImageUrl} />
              </div>
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-xl text-slate-900 truncate font-headline">{nearbyPlaces[nearbyIndex]?.title || '데이터를 불러오는 중...'}</h4>
                  {nearbyPlaces[nearbyIndex] && (
                    <Link to={`/explore/${nearbyPlaces[nearbyIndex].contentid}`} className="shrink-0 text-[10px] font-bold text-primary hover:underline uppercase tracking-tighter font-mono">View_Detail</Link>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2 text-slate-400 font-mono text-xs italic">
                  <span className="text-primary-container">#</span>
                  <p className="truncate">{nearbyPlaces[nearbyIndex]?.addr1 || '위치 정보 탐색 중...'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Slot Machine (Weather Pick) */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-outline-variant/10 relative overflow-hidden flex flex-col group">
            <div className="flex-1 flex flex-col space-y-5">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <span className="material-symbols-outlined text-sm">casino</span>
                    <p className="text-[10px] uppercase tracking-widest font-label">Mode: Random // Slot_Machine</p>
                  </div>
                  <h3 className="font-headline text-2xl font-bold text-slate-900">날씨 맞춤형 Pick</h3>
                </div>
                <button onClick={handleSlotSpin} disabled={isSlotSpinning} className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all shadow-md ${isSlotSpinning ? 'bg-primary text-white animate-pulse' : 'bg-slate-50 text-slate-900 hover:bg-primary hover:text-white'}`}><span className={`material-symbols-outlined ${isSlotSpinning ? 'animate-bounce' : ''}`}>casino</span></button>
              </div>
              <div className={`h-52 w-full rounded-2xl overflow-hidden bg-slate-100 relative shadow-inner ${isSlotSpinning ? 'scale-[1.02]' : ''}`}>
                <img src={weatherRec?.galWebImageUrl || MOCK_HERO[1].galWebImageUrl} className={`w-full h-full object-cover transition-all duration-1000 ${isSlotSpinning ? 'blur-sm brightness-75' : 'group-hover:scale-110'}`} alt="w" onError={(e) => e.target.src = MOCK_HERO[1].galWebImageUrl} />
                {isSlotSpinning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-3 bg-black/30 backdrop-blur-[2px]">
                    <div className="flex gap-2">
                      {[1, 2, 3].map(i => <div key={i} className="w-2 h-2 bg-primary-container rounded-full animate-bounce" style={{animationDelay: `${i * 0.15}s`}}></div>)}
                    </div>
                    <div className="font-bold text-xs tracking-widest font-label uppercase animate-pulse">generating_results...</div>
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-xl text-slate-900 truncate font-headline">{weatherRec?.galTitle || 'READY_TO_SPIN'}</h4>
                  {weatherRec && !isSlotSpinning && (
                    <Link to={`/explore/${weatherRec.galContentId}`} className="shrink-0 text-[10px] font-bold text-primary hover:underline uppercase tracking-tighter font-mono">View_Detail</Link>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2 text-slate-400 font-mono text-xs italic">
                  <span className="text-primary-container">//</span>
                  <p className="truncate">{weatherRec?.galPhotographyLocation || '현재 날씨와 어울리는 여행지 탐색'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Trending */}
        <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-xl border border-outline-variant/10 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between mb-6 shrink-0 border-b border-slate-50 pb-5">
            <h3 className="font-headline text-2xl font-bold text-slate-900 flex items-center gap-3"><div className="w-1.5 h-7 bg-primary rounded-full"></div>축제 및 행사</h3>
            <Link to="/explore" className="text-[10px] font-bold text-primary hover:underline uppercase font-label tracking-widest bg-primary/5 px-3 py-1 rounded-full">View_All</Link>
          </div>
          <div className="space-y-4 overflow-y-auto pr-1 flex-1 custom-scrollbar">
            {loading.trending ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 opacity-30">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-mono uppercase tracking-tighter animate-pulse">fetching_events.exe</p>
              </div>
            ) : trendingItems.map((item, i) => (
              <div key={i} className="flex rounded-2xl overflow-hidden bg-slate-50/50 group cursor-pointer hover:bg-slate-50 hover:shadow-md transition-all p-3 border border-transparent hover:border-outline-variant/20 shrink-0">
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 shadow-sm"><img src={item.image || MOCK_HERO[0].galWebImageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="t" onError={(e) => e.target.src = MOCK_HERO[0].galWebImageUrl} /></div>
                <div className="flex-1 p-3 min-w-0 flex flex-col justify-center">
                  <span className="text-[8px] font-bold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary w-fit mb-2 font-label tracking-tight">{item.subtitle}</span>
                  <h4 className="font-bold text-sm truncate text-slate-900 font-headline leading-tight">{item.title}</h4>
                  <p className="text-[10px] text-slate-400 truncate mt-1 font-mono tracking-tighter">{item.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
