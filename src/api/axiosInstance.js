import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 데이터 양이 많으므로 타임아웃을 10초로 늘림
});

// Request Interceptor to add Auth Token
axiosInstance.interceptors.request.use(
  (config) => {
    // 1. Check trip_token first (new standard)
    let token = localStorage.getItem('trip_token');
    
    // 2. Fallback to trip_user object (legacy support)
    if (!token) {
      const user = JSON.parse(localStorage.getItem('trip_user') || 'null');
      token = user?.token;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for cleaner error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 에러 시 (토큰 만료 등) 인증 관련 데이터 정리 제안
    if (error.response?.status === 401) {
      console.warn('Unauthorized! Access token might be expired or missing.');
      // 여기서 강제 로그아웃 처리를 할 수도 있으나, 우선 로깅만 남깁니다.
      // localStorage.removeItem('trip_user');
      // localStorage.removeItem('trip_token');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
