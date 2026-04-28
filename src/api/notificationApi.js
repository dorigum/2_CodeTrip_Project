import axios from 'axios';

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('trip_token')}`,
});

export const getNotifications = async () => {
  const { data } = await axios.get('/api/notifications', { headers: authHeader() });
  return data;
};

export const markAllRead = async () => {
  await axios.put('/api/notifications/read-all', {}, { headers: authHeader() });
};

export const markOneRead = async (id) => {
  await axios.put(`/api/notifications/${id}/read`, {}, { headers: authHeader() });
};

export const deleteNotification = async (id) => {
  await axios.delete(`/api/notifications/${id}`, { headers: authHeader() });
};
