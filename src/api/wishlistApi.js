import axiosInstance from './axiosInstance';

// 위시리스트 토글
export const toggleWishlist = async (contentId) => {
  try {
    const response = await axiosInstance.post('wishlist/toggle', { contentId });
    return response.data;
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    throw error;
  }
};

// 위시리스트 ID 목록 조회
export const fetchWishlistIds = async () => {
  try {
    const response = await axiosInstance.get('wishlist');
    return response.data;
  } catch (error) {
    console.error('Error fetching wishlist ids:', error);
    throw error;
  }
};

// 로그인한 유저의 위시리스트 상세 정보 조회
export const fetchWishlistDetails = async () => {
  try {
    const response = await axiosInstance.get('wishlist/details');
    return response.data;
  } catch (error) {
    console.error('Error fetching wishlist details:', error);
    throw error;
  }
};

// 폴더 목록 조회
export const fetchFolders = async () => {
  const response = await axiosInstance.get('wishlist/folders');
  return response.data;
};

// 폴더 생성
export const createFolder = async (name) => {
  const response = await axiosInstance.post('wishlist/folders', { name });
  return response.data;
};

// 폴더 삭제
export const deleteFolder = async (folderId) => {
  const response = await axiosInstance.delete(`wishlist/folders/${folderId}`);
  return response.data;
};

// 여행지 폴더 이동
export const moveWishlistItem = async (contentId, folderId) => {
  const response = await axiosInstance.put('wishlist/move', { contentId, folderId });
  return response.data;
};
