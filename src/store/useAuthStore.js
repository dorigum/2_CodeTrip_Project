import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('trip_user')) || null,
  isLoggedIn: !!localStorage.getItem('trip_user'),
  isLoading: false,

  login: (userData) => {
    localStorage.setItem('trip_user', JSON.stringify(userData));
    set({ user: userData, isLoggedIn: true });
  },

  logout: () => {
    localStorage.removeItem('trip_user');
    set({ user: null, isLoggedIn: false });
  },

  setUser: (userData) => set({ user: userData }),
}));

export default useAuthStore;
