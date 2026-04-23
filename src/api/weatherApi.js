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
  if (code <= 3) return { label: 'Sunny', icon: 'sunny', keyword: '풍경' };
  if (code <= 48) return { label: 'Cloudy', icon: 'cloud', keyword: '산책' };
  if (code <= 67) return { label: 'Rainy', icon: 'rainy', keyword: '박물관' };
  if (code <= 77) return { label: 'Snowy', icon: 'ac_unit', keyword: '설경' };
  return { label: 'Clear', icon: 'sunny', keyword: '여행' };
};
