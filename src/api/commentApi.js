import axios from 'axios';

export const getComments = async (contentId) => {
  const { data } = await axios.get(`/api/comments/${contentId}`);
  return data;
};

export const postComment = async ({ contentId, nickname, body }) => {
  const { data } = await axios.post('/api/comments', {
    content_id: contentId,
    nickname,
    body,
  });
  return data;
};
