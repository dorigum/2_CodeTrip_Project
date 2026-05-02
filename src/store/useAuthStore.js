import { create } from 'zustand';
import { firebaseAuth } from '../firebase';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('trip_user')) || null,
  isLoggedIn: !!localStorage.getItem('trip_user'),
  isLoading: false,

  login: (userData) => {
    localStorage.setItem('trip_user', JSON.stringify(userData));
    set({ user: userData, isLoggedIn: true });
  },

  logout: () => {
    firebaseAuth.signOut().catch(() => {});
    localStorage.removeItem('trip_user');
    localStorage.removeItem('trip_token');
    set({ user: null, isLoggedIn: false });
  },

  setUser: (userData) => {
    localStorage.setItem('trip_user', JSON.stringify(userData));
    set({ user: userData });
  },

  // 프로필 정보 업데이트 (기존 유저 정보와 병합)
  updateUser: (updatedData) => {
    set((state) => {
      const newUser = { ...state.user, ...updatedData };
      localStorage.setItem('trip_user', JSON.stringify(newUser));
      return { user: newUser };
    });
  }
}));

export default useAuthStore;
