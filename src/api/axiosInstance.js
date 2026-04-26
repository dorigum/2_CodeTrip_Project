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
    if (error.response?.status === 401) {
      // 토큰 만료 또는 무효 → 저장된 인증 정보 초기화 후 로그인 페이지로 이동
      localStorage.removeItem('trip_token');
      localStorage.removeItem('trip_user');
      alert('세션이 만료되었습니다. 다시 로그인해주세요.');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      // 후속 catch 블록에서 중복 처리를 방지하기 위해 특수 플래그를 담아 reject
      const authErr = new Error('AUTH_REQUIRED');
      authErr.isAuthError = true;
      return Promise.reject(authErr);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
