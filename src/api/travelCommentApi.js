import axios from 'axios';

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('trip_token')}`,
});

export const getTravelComments = async (contentId) => {
  const token = localStorage.getItem('trip_token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const { data } = await axios.get(`/api/travel-comments/${contentId}`, { headers });
  return data;
};

export const toggleTravelCommentLike = async (commentId) => {
  const { data } = await axios.post(
    `/api/travel-comments/${commentId}/like`,
    {},
    { headers: authHeader() }
  );
  return data;
};

export const postTravelComment = async ({ contentId, nickname, body }) => {
  const { data } = await axios.post(
    '/api/travel-comments',
    { content_id: contentId, nickname, body },
    { headers: authHeader() }
  );
  return data;
};

export const updateTravelComment = async (id, body) => {
  const { data } = await axios.put(
    `/api/travel-comments/${id}`,
    { body },
    { headers: authHeader() }
  );
  return data;
};

export const deleteTravelComment = async (id) => {
  await axios.delete(`/api/travel-comments/${id}`, { headers: authHeader() });
};
