import axios from 'axios';

// API 키가 필요 없는 Open-Meteo 사용
const WEATHER_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export const getWeather = async (lat = 37.5665, lon = 126.9780) => {
  try {
    const response = await axios.get(WEATHER_BASE_URL, {
      params: {
        latitude: lat,
        longitude: lon,
        current_weather: true,
        timezone: 'Asia/Seoul',
      },
    });
    
    const weather = response.data.current_weather;
    return {
      temp: Math.round(weather.temperature),
      code: weather.weathercode,
      // 날씨 코드에 따른 상태 텍스트 및 아이콘 매핑
      ...parseWeatherCode(weather.weathercode)
    };
  } catch (error) {
    console.error('Weather API Error:', error);
    return null;
  }
};

export const getLocationName = async (lat, lon) => {
  try {
    // Nominatim 오픈 API 사용 (무료 역지오코딩)
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat,
        lon,
        format: 'json',
        addressdetails: 1,
      },
      headers: {
        'Accept-Language': 'ko-KR', // 한국어로 지역명 가져오기
      }
    });
    
    const addr = response.data.address;
    // 도시명 또는 구 단위 정보 추출
    const city = addr.city || addr.town || addr.village || addr.city_district || 'Unknown';
    const country = addr.country || '';
    return `${city}, ${country}`;
  } catch (error) {
    console.error('Geocoding Error:', error);
    return 'Current Location';
  }
};

const parseWeatherCode = (code) => {
  if (code <= 3) return { label: 'Sunny', icon: 'sunny', keywords: ['풍경', '바다', '야경', '카페'] };
  if (code <= 48) return { label: 'Cloudy', icon: 'cloud', keywords: ['산책', '카페'] };
  if (code <= 67) return { label: 'Rainy', icon: 'rainy', keywords: ['박물관', '카페', '실내'] };
  if (code <= 77) return { label: 'Snowy', icon: 'ac_unit', keywords: ['설경', '카페'] };
  if (code <= 82) return { label: 'Heavy Rain', icon: 'thunderstorm', keywords: ['박물관', '카페', '실내'] };
  return { label: 'Clear', icon: 'sunny', keywords: ['여행', '카페'] };
};
