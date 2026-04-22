import axios from 'axios';

// 서버 URL 설정 (Express 서버 포트 8080 가정)
const API_URL = 'http://localhost:8080/api';

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
