import axios from 'axios';

export const getWeather = async (lat = 37.5665, lon = 126.9780) => {
  try {
    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: { latitude: lat, longitude: lon, current_weather: true, timezone: 'Asia/Seoul' },
    });
    const weather = response.data.current_weather;
    return {
      temp: Math.round(weather.temperature),
      code: weather.weathercode,
      ...parseWeatherCode(weather.weathercode)
    };
  } catch (error) {
    return { temp: 20, code: 0, label: 'Clear', icon: 'sunny', keywords: ['여행', '카페'], location: '서울' };
  }
};

export const getLocationName = async (lat, lon) => {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: { lat, lon, format: 'json' },
      headers: { 'Accept-Language': 'ko-KR' }
    });
    const addr = response.data.address;
    // 도시/구 이름 (name) - 예: 성남시, 강남구
    const city = addr.city || addr.town || addr.village || addr.city_district || addr.county || '서울';
    // 광역지자체 (state) - 예: 경기도, 서울특별시
    const state = addr.province || addr.city || '서울특별시'; 
    
    return { 
      fullLocation: `${state} ${city}`, // 전체 주소 조합
      city, 
      state 
    };
  } catch (error) {
    return { fullLocation: '서울특별시 종로구', city: '종로구', state: '서울특별시' };
  }
};

const parseWeatherCode = (code) => {
  if (code <= 3) return { label: 'Sunny', icon: 'sunny', keywords: ['풍경', '바다', '야경', '카페'] };
  if (code <= 48) return { label: 'Cloudy', icon: 'cloud', keywords: ['산책', '카페'] };
  return { label: 'Rainy', icon: 'rainy', keywords: ['박물관', '카페', '실내'] };
};
