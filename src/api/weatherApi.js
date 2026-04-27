import axios from 'axios';

const WEATHER_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export const getWeather = async (lat = 37.5665, lon = 126.9780) => {
  try {
    const response = await axios.get(WEATHER_BASE_URL, {
      params: { latitude: lat, longitude: lon, current_weather: true, timezone: 'Asia/Seoul' },
    });
    const weather = response.data.current_weather;
    return {
      temp: Math.round(weather.temperature),
      ...parseWeatherCode(weather.weathercode),
      keywords: [parseWeatherCode(weather.weathercode).keyword]
    };
  } catch (error) {
    return { temp: 24, label: 'Sunny', icon: 'sunny', keywords: ['여행'], location: '서울' };
  }
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
  } catch (error) {
    return { city: '서울', state: '서울' };
  }
};

const parseWeatherCode = (code) => {
  // WMO Weather interpretation codes (WW)
  if (code === 0) return { label: 'Sunny', icon: 'sunny', keyword: '풍경' };
  if (code === 1 || code === 2) return { label: 'Partly Cloudy', icon: 'partly_cloudy_day', keyword: '산책' };
  if (code === 3) return { label: 'Cloudy', icon: 'cloud', keyword: '카페' };
  if (code === 45 || code === 48) return { label: 'Foggy', icon: 'foggy', keyword: '드라이브' };
  if (code >= 51 && code <= 67) return { label: 'Rainy', icon: 'rainy', keyword: '미술관' };
  if (code >= 71 && code <= 77) return { label: 'Snowy', icon: 'ac_unit', keyword: '설경' };
  if (code >= 80 && code <= 99) return { label: 'Stormy', icon: 'thunderstorm', keyword: '실내놀이터' };
  
  return { label: 'Clear', icon: 'sunny', keyword: '여행' };
};
