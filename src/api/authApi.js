import axios from 'axios';

// Vite Proxy 설정을 사용하여 통신 (/api로 시작하는 요청은 localhost:8080으로 전달됨)
const API_URL = '/api';

// 토큰 헤더 구성을 위한 헬퍼 함수
const getAuthHeader = () => {
  const token = localStorage.getItem('trip_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

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
      // 로그인 성공 시 토큰 저장
      if (response.data.token) {
        localStorage.setItem('trip_token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Login API Error:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  // 프로필 정보 수정 (이름, 이미지)
  updateProfile: async (profileData) => {
    try {
      const response = await axios.put(`${API_URL}/user/update`, profileData, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Update failed' };
    }
  },

  // 이미지 파일 직접 업로드
  uploadImage: async (formData) => {
    try {
      const response = await axios.post(`${API_URL}/user/upload`, formData, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data; // { url: '...' } 반환
    } catch (error) {
      throw error.response?.data || { message: 'Upload failed' };
    }
  },

  // 비밀번호 변경
  updatePassword: async (passwordData) => {
    try {
      const response = await axios.put(`${API_URL}/user/password`, passwordData, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Password change failed' };
    }
  }
};

export default authApi;
