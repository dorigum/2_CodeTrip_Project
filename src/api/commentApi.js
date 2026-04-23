import axios from 'axios';

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('trip_token')}`,
});

export const getComments = async (contentId) => {
  const { data } = await axios.get(`/api/comments/${contentId}`);
  return data;
};

export const postComment = async ({ contentId, nickname, body }) => {
  const { data } = await axios.post(
    '/api/comments',
    { content_id: contentId, nickname, body },
    { headers: authHeader() }
  );
  return data;
};

export const updateComment = async (id, body) => {
  const { data } = await axios.put(
    `/api/comments/${id}`,
    { body },
    { headers: authHeader() }
  );
  return data;
};

export const deleteComment = async (id) => {
  await axios.delete(`/api/comments/${id}`, { headers: authHeader() });
};
