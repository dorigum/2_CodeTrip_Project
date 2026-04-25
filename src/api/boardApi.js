import axios from 'axios';

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('trip_token')}`,
});

export const getBoardPosts = async ({ pageNo = 1, numOfRows = 10, keyword = '' } = {}) => {
  const token = localStorage.getItem('trip_token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const { data } = await axios.get('/api/board/posts', {
    params: { pageNo, numOfRows, ...(keyword ? { keyword } : {}) },
    headers,
  });
  return data;
};

export const getBoardPost = async (id) => {
  const { data } = await axios.get(`/api/board/posts/${id}`);
  return data;
};

export const createBoardPost = async ({ title, content, tags }) => {
  const { data } = await axios.post(
    '/api/board/posts',
    { title, content, tags },
    { headers: authHeader() }
  );
  return data;
};

export const updateBoardPost = async (id, { title, content, tags }) => {
  const { data } = await axios.put(
    `/api/board/posts/${id}`,
    { title, content, tags },
    { headers: authHeader() }
  );
  return data;
};

export const deleteBoardPost = async (id) => {
  await axios.delete(`/api/board/posts/${id}`, { headers: authHeader() });
};

export const getBoardComments = async (postId) => {
  const token = localStorage.getItem('trip_token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const { data } = await axios.get(`/api/board/posts/${postId}/comments`, { headers });
  return data;
};

export const createBoardComment = async (postId, body) => {
  const { data } = await axios.post(
    `/api/board/posts/${postId}/comments`,
    { body },
    { headers: authHeader() }
  );
  return data;
};

export const updateBoardComment = async (id, body) => {
  const { data } = await axios.put(
    `/api/board/comments/${id}`,
    { body },
    { headers: authHeader() }
  );
  return data;
};

export const deleteBoardComment = async (id) => {
  await axios.delete(`/api/board/comments/${id}`, { headers: authHeader() });
};

export const toggleBoardCommentLike = async (id) => {
  const { data } = await axios.post(
    `/api/board/comments/${id}/like`,
    {},
    { headers: authHeader() }
  );
  return data;
};
