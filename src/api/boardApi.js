import axiosInstance from './axiosInstance';

export const boardApi = {
  // 전체 조회
  getAll: (params) => axiosInstance.get('/boards', { params }),
  
  // 글번호 검색 (단건 조회)
  getById: (id) => axiosInstance.get(`/boards/${id}`),
  
  // 등록
  create: (data) => axiosInstance.post('/boards', data),
  
  // 수정
  update: (id, data) => axiosInstance.put(`/boards/${id}`, data),
  
  // 삭제
  delete: (id) => axiosInstance.delete(`/boards/${id}`),
};
