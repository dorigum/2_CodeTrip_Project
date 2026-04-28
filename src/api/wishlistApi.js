import axiosInstance from './axiosInstance';

export const getWishlistDetails = async () => {
  const response = await axiosInstance.get('/wishlist/details');
  return response.data;
};

export const toggleWishlist = async (contentId, title, imageUrl, folderId = null) => {
  const response = await axiosInstance.post('/wishlist/toggle', {
    contentId,
    title,
    imageUrl,
    folderId
  });
  return response.data;
};

export const getFolders = async () => {
  const response = await axiosInstance.get('/wishlist/folders');
  return response.data;
};

export const createFolder = async (name, startDate, endDate) => {
  const response = await axiosInstance.post('/wishlist/folders', {
    name,
    startDate,
    endDate
  });
  return response.data;
};

export const updateFolder = async (folderId, name, startDate, endDate) => {
  const response = await axiosInstance.put(`/wishlist/folders/${folderId}`, {
    name,
    startDate,
    endDate
  });
  return response.data;
};

export const deleteFolder = async (folderId) => {
  const response = await axiosInstance.delete(`/wishlist/folders/${folderId}`);
  return response.data;
};

export const moveItem = async (contentId, folderId) => {
  const response = await axiosInstance.put('/wishlist/move', {
    contentId,
    folderId
  });
  return response.data;
};

// --- Notes API ---
export const getFolderNotes = async (folderId) => {
  const response = await axiosInstance.get(`/wishlist/folders/${folderId}/notes`);
  return response.data;
};

export const createNote = async (folderId, content, type = 'CHECKLIST') => {
  const response = await axiosInstance.post(`/wishlist/folders/${folderId}/notes`, {
    content,
    type
  });
  return response.data;
};

export const toggleNote = async (noteId) => {
  const response = await axiosInstance.put(`/wishlist/notes/${noteId}/toggle`);
  return response.data;
};

export const deleteNote = async (noteId) => {
  const response = await axiosInstance.delete(`/wishlist/notes/${noteId}`);
  return response.data;
};
