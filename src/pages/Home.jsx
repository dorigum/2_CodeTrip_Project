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
      locName = locData.city; locProv = locData.state;
    } catch (e) {}

    setProvince(locProv);
    const weatherData = await getWeather(lat, lon);
    setWeather({ ...weatherData, location: locName });

    const delay = (ms) => new Promise(r => setTimeout(r, ms));
    const tops = await getPhotoList(null, 15);
    if (tops.length > 0) setTopImgList(tops);
    await delay(300);

    const near = await getCityBasedPlaces(locProv);
    if (near.length > 0) setNearbyPlaces(near);
    setLoading(prev => ({ ...prev, nearby: false }));
    await delay(300);

    const recs = await getPhotoList(weatherData.keywords, 1);
    if (recs.length > 0) setWeatherRec(recs[0]);
    setLoading(prev => ({ ...prev, weather: false }));
    await delay(300);

    const fests = await getFestivalList();
    const festItems = (fests || []).slice(0, 6).map(f => ({
      type: 'festival', icon: 'celebration', title: f.title, 
      subtitle: `${f.eventstartdate?.slice(4,6)}/${f.eventstartdate?.slice(6,8)}`,
      location: f.addr1?.split(' ')[0], image: f.firstimage
    }));
    setTrendingItems(festItems);
    setLoading(prev => ({ ...prev, trending: false }));
  }, []);

  useEffect(() => { init(); }, [init]);

  const handleSlotSpin = async () => {
    if (isSlotSpinning) return;
    setIsSlotSpinning(true);
    const candidates = await getPhotoList(weather.keywords, 10);
    if (candidates.length > 0) {
      for(let i=0; i<candidates.length * 1.5; i++) {
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
    <div className="p-6 lg:p-8 space-y-4 flex-1 flex flex-col bg-slate-50/30">
      
      {/* 1. 상단 파노라마 이미지 (모서리 각지게 조정) */}
      <section className="relative w-full h-[25vh] min-h-[200px] rounded-2xl overflow-hidden shadow-xl bg-surface-container-high shrink-0">
        <img src={currentTop.galWebImageUrl} key={currentTop.galContentId} className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000" alt="bg" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-transparent flex items-center px-12">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center px-3 py-1 bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 w-fit text-white text-[10px] font-bold tracking-widest uppercase">
              system.log: live_feed_active
            </div>
            <h1 className="text-4xl lg:text-5xl font-headline font-bold text-white leading-tight drop-shadow-lg">
              Build your next <span className="text-primary-fixed">Adventure.</span>
            </h1>
            <p className="text-white/80 text-base font-body max-w-lg leading-relaxed">대한민국 곳곳의 숨겨진 장소들을 탐험하세요.</p>
            <div className="pt-1"><Link to="/explore" className="bg-gradient-to-r from-primary to-primary-container text-white px-6 py-2.5 rounded-full font-semibold hover:opacity-90 transition-all flex items-center gap-2 w-fit text-sm shadow-lg"><span>GET STARTED</span><span className="material-symbols-outlined text-sm">arrow_right_alt</span></Link></div>
          </div>
          <div className="absolute bottom-6 right-8 bg-white/70 backdrop-blur-2xl p-4 rounded-xl shadow-xl border border-white/30 text-slate-900">
            <p className="text-slate-500 text-[9px] uppercase mb-0.5 font-bold tracking-widest">{province} {weather.location}</p>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-headline font-bold text-primary">{weather.temp}°C</span>
              <span className="material-symbols-outlined text-2xl text-primary" style={{fontVariationSettings: "'FILL' 1"}}>{weather.icon}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 카드 그리드 (모서리 둥글기 rounded-2xl로 축소) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Regional (텍스트 복구) */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 relative overflow-hidden flex flex-col group">
            {loading.nearby && <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}
            <div className="flex-1 flex flex-col space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-primary font-bold">
                    <span className="material-symbols-outlined text-xs">location_on</span>
                    <p className="text-[10px] uppercase tracking-widest">현재 위치: {province} {weather.location}</p>
                  </div>
                  <h3 className="font-headline text-2xl font-bold text-slate-900">지역 기반 추천: {province}</h3>
                </div>
                <button onClick={() => setNearbyIndex(i => (i+1) % nearbyPlaces.length)} className="p-2 flex items-center justify-center bg-slate-50 text-slate-900 rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm"><span className="material-symbols-outlined text-lg">navigate_next</span></button>
              </div>
              <div className="h-48 w-full rounded-xl overflow-hidden bg-slate-100"><img src={nearbyPlaces[nearbyIndex]?.firstimage || MOCK_HERO[0].galWebImageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="n" /></div>
              <div>
                <h4 className="font-bold text-lg text-slate-900 truncate">
                  {nearbyPlaces[nearbyIndex] ? `${nearbyPlaces[nearbyIndex].title}${nearbyPlaces[nearbyIndex].addr1 ? `, ${nearbyPlaces[nearbyIndex].addr1}` : ''}` : ''}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  <span className="text-primary">//</span> {province} 내 인기 명소를 추천합니다.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Slot Machine */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 relative overflow-hidden flex flex-col group">
            <div className="flex-1 flex flex-col space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-primary font-bold"><span className="material-symbols-outlined text-xs">casino</span><p className="text-[9px] uppercase tracking-widest">RANDOM PICK</p></div>
                  <h3 className="font-headline text-2xl font-bold text-slate-900">날씨 맞춤형 Pick</h3>
                </div>
                <button onClick={handleSlotSpin} disabled={isSlotSpinning} className={`p-2 flex items-center justify-center rounded-lg transition-all shadow-sm ${isSlotSpinning ? 'bg-primary text-white animate-pulse' : 'bg-slate-50 text-slate-900 hover:bg-primary hover:text-white'}`}><span className={`material-symbols-outlined text-lg ${isSlotSpinning ? 'animate-bounce' : ''}`}>casino</span></button>
              </div>
              <div className={`h-48 w-full rounded-xl overflow-hidden bg-slate-100 relative ${isSlotSpinning ? 'scale-[1.02]' : ''}`}>
                <img src={weatherRec?.galWebImageUrl || MOCK_HERO[1].galWebImageUrl} className={`w-full h-full object-cover transition-all duration-700 ${isSlotSpinning ? 'blur-sm brightness-75' : 'group-hover:scale-110'}`} alt="w" />
                {isSlotSpinning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{animationDelay: `${i * 0.1}s`}}></div>)}
                    </div>
                    <div className="font-bold text-sm tracking-tight drop-shadow-md animate-pulse">여행지 뽑는 중...</div>
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-900 truncate">
                  {weatherRec ? `${weatherRec.galTitle}${weatherRec.galPhotographyLocation ? `, ${weatherRec.galPhotographyLocation}` : ''}` : 'READY TO SPIN'}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  <span className="text-primary">//</span> 현재 날씨와 어울리는 여행지를 뽑아보세요.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Trending */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-lg border border-slate-100 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between mb-5 shrink-0">
            <h3 className="font-headline text-xl font-bold text-slate-900 flex items-center gap-3"><div className="w-1.5 h-6 bg-primary rounded-full"></div>행사 & 테마</h3>
            <Link to="/explore" className="text-[10px] font-bold text-primary hover:underline uppercase">View All</Link>
          </div>
          <div className="space-y-3 overflow-y-auto pr-1 flex-1 custom-scrollbar">
            {trendingItems.map((item, i) => (
              <div key={i} className="flex rounded-xl overflow-hidden bg-slate-50 group cursor-pointer hover:bg-slate-100 transition-all p-2 border border-transparent hover:border-slate-200 shrink-0">
                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 shadow-sm"><img src={item.image || MOCK_HERO[0].galWebImageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="t" /></div>
                <div className="flex-1 p-2 min-w-0 flex flex-col justify-center">
                  <span className={`text-[7px] font-bold uppercase px-1.5 py-0.5 rounded-full w-fit mb-1 ${item.type === 'festival' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{item.type === 'festival' ? '행사' : '테마'}</span>
                  <h4 className="font-bold text-xs truncate text-slate-900">{item.title}</h4>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{item.location}</p>
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
