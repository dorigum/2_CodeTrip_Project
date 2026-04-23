import axios from 'axios';

// Vite Proxy 설정을 사용하여 통신 (/api로 시작하는 요청은 localhost:8080으로 전달됨)
const API_URL = '/api';

const authApi = {
  // 회원가입
  signup: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/signup`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Signup failed' };
    }
  },

  // 로그인
  login: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/login`, credentials);
      return response.data;
    } catch (error) {
      console.error('Login API Error:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Login failed' };
    }
  }
};

export default authApi;
