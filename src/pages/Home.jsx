import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getWeather, getLocationName } from '../api/weatherApi';
import { getWeatherRecommendations } from '../api/travelApi';

const TRENDING_THEMES = [
  { icon: 'coffee', title: 'Cyberpunk Tokyo', desc: 'High-contrast neon nights and synthesis of tradition.' },
  { icon: 'forest', title: 'Nordic Minimalist', desc: 'Clean lines, white space, and glacial stillness.' },
  { icon: 'landscape', title: 'High Sierra Mono', desc: 'Rugged landscapes with a monochromatic aesthetic.' },
  { icon: 'architecture', title: 'Brutalist Berlin', desc: 'Raw textures, bold geometry, and heavy history.' },
];

// 백업 이미지 정보 (API 실패 대비)
const BACKUP_TOP_IMAGES = [
  { galContentId: 'b1', galTitle: '푸른 바다의 전설', galPhotographyLocation: '제주도 서귀포시', galWebImageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2094&auto=format&fit=crop' },
  { galContentId: 'b2', galTitle: '고즈넉한 고궁', galPhotographyLocation: '서울특별시 종로구', galWebImageUrl: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?q=80&w=2070&auto=format&fit=crop' },
  { galContentId: 'b3', galTitle: '눈 덮인 산등성이', galPhotographyLocation: '강원도 평창군', galWebImageUrl: 'https://images.unsplash.com/photo-1621360841013-c7683c659ec6?q=80&w=1932&auto=format&fit=crop' },
  { galContentId: 'b4', galTitle: '밤이 빛나는 도시', galPhotographyLocation: '부산광역시 해운대구', galWebImageUrl: 'https://images.unsplash.com/photo-1610448721566-47369c768e70?q=80&w=2070&auto=format&fit=crop' },
  { galContentId: 'b5', galTitle: '황금빛 들판', galPhotographyLocation: '전라남도 순천시', galWebImageUrl: 'https://images.unsplash.com/photo-1582996269871-dad1e4adbbc7?q=80&w=2066&auto=format&fit=crop' }
];

const DEFAULT_TOP_IMG = BACKUP_TOP_IMAGES[0].galWebImageUrl;

const Home = () => {
  const [weather, setWeather] = useState({ 
    temp: 24, label: 'Loading...', icon: 'cloud', keywords: ['여행'], location: 'Seoul, KR' 
  });
  
  // MainTopImg 상태 관리
  const [topImgList, setTopImgList] = useState([]);
  const [topImgIndex, setTopImgIndex] = useState(0);
  const [weatherRecommendation, setWeatherRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshingWeatherRec, setRefreshingWeatherRec] = useState(false);
  
  const topImgTimerRef = useRef(null);

  // 상단 MainTopImg 이미지 묶음 가져오기
  const fetchTopImgBatch = useCallback(async () => {
    try {
      const dataList = await getWeatherRecommendations(null); 
      if (dataList && dataList.length > 0) {
        setTopImgList(dataList);
        setTopImgIndex(0);
      } else {
        setTopImgList(BACKUP_TOP_IMAGES);
      }
    } catch (e) {
      setTopImgList(BACKUP_TOP_IMAGES);
    }
  }, []);

  const fetchWeatherRecData = useCallback(async (keywords) => {
    setRefreshingWeatherRec(true);
    const data = await getWeatherRecommendations(keywords);
    if (data) setWeatherRecommendation(data);
    setRefreshingWeatherRec(false);
  }, []);

  const handleRefreshAll = useCallback(async (e) => {
    if (e) e.stopPropagation();
    setLoading(true);

    const getPosition = () => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
    };

    try {
      let lat = 37.5665;
      let lon = 126.9780;
      let locationName = 'Seoul, KR';

      try {
        const pos = await getPosition();
        lat = pos.coords.latitude;
        lon = pos.coords.longitude;
        locationName = await getLocationName(lat, lon);
      } catch (posError) {
        console.warn("Geolocation skipped.");
      }

      const weatherData = await getWeather(lat, lon);
      if (weatherData) {
        setWeather({ ...weatherData, location: locationName });
        await Promise.all([
          fetchWeatherRecData(weatherData.keywords),
          fetchTopImgBatch()
        ]);
      } else {
        await fetchTopImgBatch();
      }
    } catch (error) {
      console.error("Refresh Error:", error);
      await fetchTopImgBatch();
    } finally {
      setLoading(false);
    }
  }, [fetchTopImgBatch, fetchWeatherRecData]);

  useEffect(() => {
    handleRefreshAll();
  }, [handleRefreshAll]);

  // 자동 슬라이더 타이머 (MainTopImg용)
  useEffect(() => {
    if (topImgList.length === 0) return;
    topImgTimerRef.current = setInterval(() => {
      setTopImgIndex((prev) => {
        if (prev >= topImgList.length - 1) {
          fetchTopImgBatch(); 
          return 0;
        }
        return prev + 1;
      });
    }, 5000);
    return () => clearInterval(topImgTimerRef.current);
  }, [topImgList, fetchTopImgBatch]);

  const currentTopImg = topImgList[topImgIndex] || null;

  return (
    <div className="p-6 lg:p-10 space-y-12 pb-20 md:pb-12">
      {/* MainTopImg Section */}
      <section className="relative w-full aspect-[21/6] rounded-xl overflow-hidden shadow-lg bg-surface-container-high">
        <img
          alt={currentTopImg?.galTitle || "Inspiring Destination"}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out"
          src={currentTopImg ? `${currentTopImg.galWebImageUrl}?t=${currentTopImg.galContentId}` : DEFAULT_TOP_IMG}
          key={currentTopImg?.galContentId || 'default'}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent flex items-center px-12">
          <div className="max-w-2xl flex flex-col justify-center space-y-3">
            
            <div className="inline-block self-start px-2 py-0.5 bg-white/10 backdrop-blur-md border border-white/20 text-white font-label text-[10px] uppercase tracking-widest rounded">
              Status: {topImgList.length > 0 ? 'Live Feed' : 'Syncing...'}
            </div>

            <div>
              <h1 className="text-4xl lg:text-5xl font-headline font-bold text-white drop-shadow-md">
                Code_Trip:
              </h1>
              <p className="text-white/90 text-lg lg:text-xl font-body drop-shadow-sm font-medium">
                당신의 새로운 영감을 컴파일해보세요!
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border-l-2 border-primary py-1.5 px-3 inline-block rounded-r transition-all duration-500">
               <p className="text-[9px] font-mono text-white/60 font-bold uppercase tracking-tighter mb-0.5">// Currently Rendering</p>
               <div className="flex items-baseline gap-2">
                 <h2 className="text-sm lg:text-base font-headline font-bold text-white">
                   {currentTopImg?.galTitle || '동화 같은 풍경'}
                 </h2>
                 <span className="text-[10px] text-white/50 font-mono italic">
                   @ {currentTopImg?.galPhotographyLocation || '대한민국'}
                 </span>
               </div>
            </div>

            <div className="pt-1">
              <Link
                to="/explore"
                className="px-6 py-2.5 bg-white/15 backdrop-blur-lg border border-white/30 text-primary font-headline font-bold rounded-full hover:bg-white/25 transition-all inline-flex items-center gap-2 text-sm shadow-xl hover:scale-105 active:scale-95"
              >
                <span className="material-symbols-outlined text-base">explore</span>
                EXPLORE_NOW
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-container-lowest p-8 rounded-xl flex flex-col justify-between shadow-[0_20px_40px_rgba(25,28,30,0.03)] border border-outline-variant/10 relative overflow-hidden">
            {loading && (
              <div className="absolute inset-0 bg-surface-container-lowest/40 backdrop-blur-[2px] z-20 flex items-center justify-center">
                 <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="font-label text-xs uppercase tracking-widest text-primary font-bold">{weather.location}</p>
                  <h3 className="font-headline text-2xl font-bold">Local Env</h3>
                </div>
                <button 
                  onClick={handleRefreshAll}
                  className="w-12 h-12 bg-primary-container/10 flex items-center justify-center rounded-lg text-primary hover:bg-primary-container/20 transition-all cursor-pointer group/icon"
                >
                  <span className={`material-symbols-outlined text-3xl transition-transform duration-500 ${loading ? 'animate-spin' : 'group-hover/icon:rotate-90'}`}>
                    {weather.icon}
                  </span>
                </button>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-headline font-bold text-on-surface">{weather.temp}°</span>
                <span className="text-xl font-label text-on-secondary-container uppercase">{weather.label}</span>
              </div>
              <div className="p-4 bg-surface-container-low rounded-lg border-l-4 border-primary">
                <p className="text-xs font-label syntax-comment mb-2">// Recommendation Logic</p>
                <p className="text-sm font-body text-on-surface leading-relaxed italic">
                  "{weather.keywords?.join(', ')}" 테마의 장소를 추천합니다.
                </p>
              </div>
            </div>
          </div>

          {/* Weather Rec Card */}
          <div className="bg-surface-container-lowest rounded-xl shadow-[0_20px_40px_rgba(25,28,30,0.03)] border border-outline-variant/10 overflow-hidden flex flex-col group relative">
            {(loading || refreshingWeatherRec) && (
              <div className="absolute inset-0 bg-surface-container-lowest/40 backdrop-blur-[2px] z-20 flex items-center justify-center">
                 <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <div className="relative h-48 overflow-hidden bg-surface-container-high">
              <img 
                src={weatherRecommendation?.galWebImageUrl || BACKUP_TOP_IMAGES[1].galWebImageUrl} 
                alt={weatherRecommendation?.galTitle}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                key={weatherRecommendation?.galContentId}
              />
              <div className="absolute top-4 right-4">
                <button 
                  onClick={() => fetchWeatherRecData(weather.keywords)}
                  className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all z-30"
                >
                  <span className={`material-symbols-outlined text-sm ${refreshingWeatherRec ? 'animate-spin' : ''}`}>refresh</span>
                </button>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                   <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
                   <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">Recommended For You</span>
                </div>
                <h4 className="font-headline font-bold text-lg text-on-surface line-clamp-1">
                  {weatherRecommendation?.galTitle || 'Discovery Pending...'}
                </h4>
                <p className="text-xs text-on-secondary-container mt-1 line-clamp-1">
                  {weatherRecommendation?.galPhotographyLocation || 'Various Locations'}
                </p>
              </div>
              <button className="mt-4 w-full py-2 bg-surface-container-high hover:bg-primary hover:text-on-primary transition-all rounded-lg text-xs font-bold font-label">
                DETAILS_VIEW
              </button>
            </div>
          </div>
        </div>

        {/* Trending Themes */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="font-headline text-xl font-bold">Trending Themes</h2>
            <Link to="/explore" className="text-[10px] font-bold text-primary hover:underline">VIEW_ALL</Link>
          </div>
          <div className="space-y-3">
            {TRENDING_THEMES.slice(0, 3).map((theme) => (
              <div
                key={theme.title}
                className="bg-surface-container-low p-4 rounded-xl hover:bg-surface-container-highest transition-all cursor-pointer group flex items-center gap-4"
              >
                <div className="p-2 bg-surface-container-lowest rounded-lg group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">
                  <span className="material-symbols-outlined text-lg">{theme.icon}</span>
                </div>
                <div className="min-w-0">
                  <h4 className="font-headline font-bold text-sm truncate">{theme.title}</h4>
                  <p className="text-[10px] text-on-secondary-container font-body truncate">{theme.desc}</p>
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
