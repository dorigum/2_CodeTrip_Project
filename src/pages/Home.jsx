import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWeather, getLocationName } from '../api/weatherApi';
import { getWeatherRecommendations } from '../api/travelApi';

const TRENDING_THEMES = [
  { icon: 'coffee', title: 'Cyberpunk Tokyo', desc: 'High-contrast neon nights and synthesis of tradition.' },
  { icon: 'forest', title: 'Nordic Minimalist', desc: 'Clean lines, white space, and glacial stillness.' },
  { icon: 'landscape', title: 'High Sierra Mono', desc: 'Rugged landscapes with a monochromatic aesthetic.' },
  { icon: 'architecture', title: 'Brutalist Berlin', desc: 'Raw textures, bold geometry, and heavy history.' },
];

const DEFAULT_HERO_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHaFWKTXoD7mJHtN6tIrJmnpnMFWJjFPTS9MgR8lmh91I36OqBte6ugLBWy2uxDaBZ7cziElo7-fOV4ywo5_aykN5rdTdikFJiaDfWYJGzUIbz71v1ny99j_GePWZT7Fk876GNd_Tt7_Ut-XXiURKv3_Go54hEZrpmKqdylp294PBexkkRza7YNEbxF6FJ5V_FcOsLOatcwW0PHnTV27mffa_yiHCiHOSNDJa1S9lfzBD5t9uJxwdI_-PnsvajgWdrDzYfr6R9wI-g';

const Home = () => {
  const [weather, setWeather] = useState({ 
    temp: 24, 
    label: 'Loading...', 
    icon: 'cloud', 
    keywords: ['여행'],
    location: 'Detecting Location...' 
  });
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTravelData = async (keywords) => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const travelData = await getWeatherRecommendations(keywords);
      if (travelData) {
        setRecommendation(travelData);
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefreshAll = async (e) => {
    if (e) e.stopPropagation();
    if (e && loading) return;
    
    setLoading(true);

    const getPosition = () => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 8000,
          enableHighAccuracy: true
        });
      });
    };

    try {
      // 기본값: 서울
      let lat = 37.5665;
      let lon = 126.9780;
      let locationName = 'Seoul, KR';

      try {
        const pos = await getPosition();
        lat = pos.coords.latitude;
        lon = pos.coords.longitude;
        // 위치 이름을 좌표 기반으로 실시간 획득
        locationName = await getLocationName(lat, lon);
      } catch (posError) {
        console.warn("Geolocation failed or denied, using default (Seoul):", posError.message);
      }

      const weatherData = await getWeather(lat, lon);
      if (weatherData) {
        setWeather({ ...weatherData, location: locationName });
        await fetchTravelData(weatherData.keywords);
      } else {
        setWeather(prev => ({ ...prev, label: 'Offline', location: locationName, keywords: ['여행'] }));
      }
    } catch (error) {
      console.error("Refresh Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRefreshAll();
  }, []);

  return (
    <div className="p-6 lg:p-10 space-y-12 pb-20 md:pb-12">
      {/* Hero Section */}
      <section className="relative w-full aspect-[21/9] rounded-xl overflow-hidden shadow-lg bg-surface-container-high">
        {recommendation ? (
          <img
            alt={recommendation.galTitle}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
            src={recommendation.galWebImageUrl}
            key={recommendation.galContentId}
          />
        ) : (
          <img
            alt="Default Hero"
            className="absolute inset-0 w-full h-full object-cover"
            src={DEFAULT_HERO_IMG}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent flex items-center px-12">
          <div className="max-w-2xl space-y-4">
            <div className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-white font-label text-xs uppercase tracking-widest rounded-lg">
              Status: {loading || refreshing ? 'Syncing...' : 'System Optimal'}
            </div>
            <h1 className="text-5xl lg:text-7xl font-headline font-bold text-white leading-tight drop-shadow-md">
              {recommendation ? recommendation.galTitle : 'Welcome to Terminal'}
              <span className="text-primary-container">.</span>
            </h1>
            <p className="text-white/90 text-lg max-w-md font-body leading-relaxed opacity-90 drop-shadow-sm">
              {recommendation 
                ? `${recommendation.galPhotographyLocation}에서 새로운 영감을 컴파일하세요.`
                : 'Your journey is the ultimate algorithm. Compile your next adventure with precision and logic.'}
            </p>
            <div className="pt-4 flex gap-4">
              <Link
                to="/explore"
                className="px-6 py-3 bg-primary-container text-on-primary-container font-headline font-bold rounded-lg hover:brightness-110 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">terminal</span>
                DETAILS_VIEW
              </Link>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  fetchTravelData(weather.keywords);
                }}
                disabled={refreshing || loading}
                className="px-6 py-3 bg-surface-container-lowest/10 backdrop-blur-md border border-surface-container-lowest/20 text-surface-container-lowest font-headline font-bold rounded-lg hover:bg-surface-container-lowest/20 transition-all flex items-center gap-2 disabled:opacity-50 z-10"
              >
                <span className={`material-symbols-outlined text-lg ${refreshing ? 'animate-spin' : ''}`}>refresh</span>
                RANDOM_PICK
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weather Widget */}
        <div className="lg:col-span-1 bg-surface-container-lowest p-8 rounded-xl flex flex-col justify-between shadow-[0_20px_40px_rgba(25,28,30,0.03)] border border-outline-variant/10 relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-surface-container-lowest/40 backdrop-blur-[2px] z-10 flex items-center justify-center">
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
                title="Refresh Weather"
              >
                <span className={`material-symbols-outlined text-3xl ${loading ? 'animate-spin' : 'group-hover/icon:rotate-90 transition-transform duration-300'}`}>
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
              <p className="text-sm font-body text-on-surface leading-relaxed">
                {weather.label === 'Rainy' || weather.label === 'Heavy Rain'
                  ? '비가 오네요. 따뜻한 카페나 실내 박물관은 어떨까요?'
                  : `${weather.keywords?.join(', ')} 테마의 여행지를 추천해 드립니다.`}
              </p>
            </div>
          </div>
          <Link
            to="/explore"
            className="mt-8 w-full py-4 bg-on-background text-surface-container-lowest font-label text-sm font-bold rounded-lg flex items-center justify-center gap-3 hover:bg-primary transition-colors group-hover:shadow-lg"
          >
            <span className="material-symbols-outlined text-lg">explore</span>
            Explore More
          </Link>
        </div>

        {/* Trending Themes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-2xl font-bold">
              Trending <span className="text-primary">Themes</span>
            </h2>
            <Link to="/explore" className="text-sm font-label text-primary hover:underline underline-offset-4">
              VIEW_ALL
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TRENDING_THEMES.map((theme) => (
              <div
                key={theme.title}
                className="bg-surface-container-low p-6 rounded-xl hover:bg-surface-container-highest transition-all cursor-pointer group"
              >
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-surface-container-lowest rounded-lg group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">
                    <span className="material-symbols-outlined">{theme.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-lg">{theme.title}</h4>
                    <p className="text-sm text-on-secondary-container font-body mt-1">{theme.desc}</p>
                  </div>
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
