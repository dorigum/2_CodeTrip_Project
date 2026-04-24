import axiosInstance from './axiosInstance';

// 위시리스트 토글
export const toggleWishlist = async (contentId) => {
  try {
    const response = await axiosInstance.post('/wishlist/toggle', { contentId });
    return response.data;
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    throw error;
  }
};

// 위시리스트 ID 목록 조회
export const fetchWishlistIds = async () => {
  try {
    const response = await axiosInstance.get('/wishlist');
    return response.data;
  } catch (error) {
    console.error('Error fetching wishlist ids:', error);
    throw error;
  }
};

// 위시리스트 상세 목록 조회
export const fetchWishlistDetails = async () => {
  try {
    const response = await axiosInstance.get('/wishlist/details');
    return response.data;
  } catch (error) {
    console.error('Error fetching wishlist details:', error);
    throw error;
  }
};
