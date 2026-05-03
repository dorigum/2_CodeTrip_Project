import { create } from 'zustand';
import { firebaseAuth } from '../firebase';

const getStoredUser = () => {
  try {
    const rawUser = localStorage.getItem('trip_user');
    if (!rawUser || rawUser === 'undefined') return null;
    return JSON.parse(rawUser);
  } catch {
    localStorage.removeItem('trip_user');
    return null;
  }
};

const persistUser = (userData) => {
  if (!userData) {
    localStorage.removeItem('trip_user');
    return null;
  }

  localStorage.setItem('trip_user', JSON.stringify(userData));
  return userData;
};

const storedUser = getStoredUser();

const useAuthStore = create((set) => ({
  user: storedUser,
  isLoggedIn: !!storedUser,
  isLoading: false,

  login: (userData) => {
    const user = persistUser(userData);
    set({ user, isLoggedIn: !!user });
  },

  logout: () => {
    firebaseAuth.signOut().catch(() => {});
    localStorage.removeItem('trip_user');
    localStorage.removeItem('trip_token');
    set({ user: null, isLoggedIn: false });
  },

  setUser: (userData) => {
    const user = persistUser(userData);
    set({ user, isLoggedIn: !!user });
  },

  // 프로필 정보 업데이트 (기존 유저 정보와 병합)
  updateUser: (updatedData) => {
    set((state) => {
      const newUser = { ...state.user, ...updatedData };
      persistUser(newUser);
      return { user: newUser };
    });
  }
}));

export default useAuthStore;
