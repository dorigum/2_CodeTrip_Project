import axios from 'axios';

const WEATHER_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export const getWeather = async (lat = 37.5665, lon = 126.9780) => {
  try {
    const response = await axios.get(WEATHER_BASE_URL, {
      params: {
        latitude: lat,
        longitude: lon,
        current: 'temperature_2m,weathercode,cloudcover,precipitation',
        timezone: 'Asia/Seoul',
        models: 'jma_seamless', // JMA(일본 기상청) 모델 — 한국/동아시아 고해상도
      },
    });
    const current = response.data.current;
    const effectiveCode = refineWeatherCode(current.weathercode, current.cloudcover, current.precipitation);
    return {
      temp: Math.round(current.temperature_2m),
      ...parseWeatherCode(effectiveCode),
      keywords: [parseWeatherCode(effectiveCode).keyword]
    };
  } catch {
    return { temp: 24, label: 'Sunny', icon: 'sunny', keywords: ['여행'], location: '서울' };
  }
};

// cloudcover(%)와 precipitation(mm)으로 weathercode 보정
// Open-Meteo 모델이 "Clear(0)"으로 반환해도 실제 구름이 많은 경우를 잡아냄
const refineWeatherCode = (code, cloudcover, precipitation) => {
  // 강수량이 실제로 있는데 코드가 맑음 계열이면 비(61)로 보정
  if (precipitation > 0 && code < 51) return 61;
  // 맑음(0) 또는 약간 흐림(1)인데 구름이 75% 이상 → 흐림(3)
  if ((code === 0 || code === 1) && cloudcover >= 75) return 3;
  // 맑음(0) 인데 구름이 40% 이상 → 구름 조금(2)
  if (code === 0 && cloudcover >= 40) return 2;
  return code;
};

export const getLocationName = async (lat, lon) => {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
      params: { lat, lon, format: 'json', addressdetails: 1 },
      headers: { 'Accept-Language': 'ko-KR' } // User-Agent 제거하여 브라우저 에러 해결
    });
    const addr = response.data.address;
    return {
      city: addr.city || addr.town || addr.village || addr.borough || '서울',
      state: addr.province || addr.city || addr.region || '서울'
    };
  } catch {
    return { city: '서울', state: '서울' };
  }
};

const parseWeatherCode = (code) => {
  // WMO Weather interpretation codes (WW)
  if (code === 0) return { label: 'Sunny', icon: 'sunny', keyword: '풍경' };
  if (code === 1 || code === 2) return { label: 'Partly Cloudy', icon: 'partly_cloudy_day', keyword: '산책' };
  if (code === 3) return { label: 'Cloudy', icon: 'cloud', keyword: '카페' };
  if (code === 45 || code === 48) return { label: 'Foggy', icon: 'foggy', keyword: '드라이브' };
  
  // 비 관련 코드 통합 (이슬비, 비, 소나기 포함)
  // 51, 53, 55: Drizzle
  // 61, 63, 65: Rain
  // 66, 67: Freezing Rain
  // 80, 81, 82: Rain showers
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return { label: 'Rainy', icon: 'rainy', keyword: '미술관' };
  }
  
  // 눈 관련 코드
  if (code >= 71 && code <= 77 || code === 85 || code === 86) {
    return { label: 'Snowy', icon: 'ac_unit', keyword: '설경' };
  }
  
  // 강력한 폭풍우 (뇌우)
  if (code >= 95 && code <= 99) {
    return { label: 'Stormy', icon: 'thunderstorm', keyword: '실내놀이터' };
  }
  
  return { label: 'Clear', icon: 'sunny', keyword: '여행' };
};
