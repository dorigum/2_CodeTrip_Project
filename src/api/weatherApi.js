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
      ...parseWeatherCode(weather.weathercode),
      keywords: [parseWeatherCode(weather.weathercode).keyword]
    };
  } catch (error) {
    console.error('Weather API Error:', error);
    return { temp: 24, label: 'Sunny', icon: 'sunny', keywords: ['여행'], location: '서울' };
  }
};

// 위도/경도로 위치 이름 가져오기 (Home.jsx 대응)
export const getLocationName = async (lat, lon) => {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
      params: {
        lat,
        lon,
        format: 'json',
        addressdetails: 1,
      },
      headers: {
        'Accept-Language': 'ko-KR'
      }
    });
    const address = response.data.address;
    return {
      city: address.city || address.town || address.village || '서울',
      state: address.province || address.city || '서울'
    };
  } catch (error) {
    console.error('Location API Error:', error);
    return { city: '서울', state: '서울' };
  }
};

const parseWeatherCode = (code) => {
  if (code <= 3) return { label: 'Sunny', icon: 'sunny', keyword: '풍경' };
  if (code <= 48) return { label: 'Cloudy', icon: 'cloud', keyword: '산책' };
  if (code <= 67) return { label: 'Rainy', icon: 'rainy', keyword: '박물관' };
  if (code <= 77) return { label: 'Snowy', icon: 'ac_unit', keyword: '설경' };
  if (code <= 82) return { label: 'Heavy Rain', icon: 'thunderstorm', keyword: '실내' };
  return { label: 'Clear', icon: 'sunny', keyword: '여행' };
};
