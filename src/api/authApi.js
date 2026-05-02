import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updatePassword as updateFirebasePassword,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth';
import { get, ref, set, update } from 'firebase/database';
import { firebaseAuth, realtimeDb } from '../firebase';
import { getCurrentUser, nowIso } from './firebaseHelpers';

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const userPayload = (authUser, profile = {}) => ({
  id: authUser.uid,
  email: authUser.email,
  name: profile.name || authUser.displayName || authUser.email,
  profileImg: profile.profileImg || authUser.photoURL || '',
});

const authApi = {
  signup: async ({ email, password, name }) => {
    try {
      const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      await updateFirebaseProfile(credential.user, { displayName: name });
      await set(ref(realtimeDb, `users/${credential.user.uid}`), {
        email,
        name,
        profileImg: '',
        favoriteRegions: [],
        created_at: nowIso(),
        updated_at: nowIso(),
      });
      await firebaseAuth.signOut();
      return { message: 'Success' };
    } catch (error) {
      throw { message: error.message || 'Signup failed' };
    }
  },

  login: async ({ email, password }) => {
    try {
      const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const token = await credential.user.getIdToken();
      const profileSnap = await get(ref(realtimeDb, `users/${credential.user.uid}`));
      const profile = profileSnap.exists() ? profileSnap.val() : {};
      const user = userPayload(credential.user, profile);

      localStorage.setItem('trip_token', token);
      return { token, user };
    } catch (error) {
      throw { message: error.message || 'Invalid email or password' };
    }
  },

  updateProfile: async ({ name, profileImg }) => {
    const user = getCurrentUser();
    await updateFirebaseProfile(firebaseAuth.currentUser, {
      displayName: name,
      photoURL: profileImg || '',
    });
    await update(ref(realtimeDb, `users/${user.id}`), {
      name,
      profileImg: profileImg || '',
      updated_at: nowIso(),
    });
    return { message: 'Profile updated successfully' };
  },

  uploadImage: async (formData) => {
    const file = formData.get('profileImage');
    if (!file) throw { message: 'No file uploaded' };
    return { url: await readFileAsDataUrl(file) };
  },

  updatePassword: async ({ currentPassword, newPassword }) => {
    const authUser = firebaseAuth.currentUser;
    if (!authUser?.email) throw { message: '로그인이 필요합니다.' };

    const credential = EmailAuthProvider.credential(authUser.email, currentPassword);
    await reauthenticateWithCredential(authUser, credential);
    await updateFirebasePassword(authUser, newPassword);
    return { message: 'Password changed successfully' };
  },

  getFavoriteRegions: async () => {
    const user = getCurrentUser();
    const profileSnap = await get(ref(realtimeDb, `users/${user.id}/favoriteRegions`));
    return profileSnap.exists() ? profileSnap.val() || [] : [];
  },

  updateFavoriteRegions: async (codes) => {
    const user = getCurrentUser();
    if (codes.length > 3) {
      throw { message: '관심 지역은 최대 3개까지 선택할 수 있습니다.' };
    }
    await update(ref(realtimeDb, `users/${user.id}`), {
      favoriteRegions: codes,
      updated_at: nowIso(),
    });
    return { message: '관심 지역이 저장되었습니다.' };
  },

  forgotPassword: async ({ email }) => {
    await sendPasswordResetEmail(firebaseAuth, email);
    return { message: '비밀번호 재설정 메일을 보냈습니다. 메일함을 확인해 주세요.' };
  },
};

export default authApi;
