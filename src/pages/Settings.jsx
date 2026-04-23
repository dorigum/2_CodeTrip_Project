import React, { useState, useRef } from 'react';
import useAuthStore from '../store/useAuthStore';
import authApi from '../api/authApi';

const Settings = () => {
  const { user, updateUser } = useAuthStore();
  const fileInputRef = useRef(null);
  
  // Profile Form State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileImg, setProfileImg] = useState(user?.profileImg || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMessage, setPwdMessage] = useState({ type: '', text: '' });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage({ type: '', text: '' });

    try {
      await authApi.updateProfile({ name: profileName, profileImg });
      updateUser({ name: profileName, profileImg });
      setProfileMessage({ type: 'success', text: '프로필 정보가 업데이트되었습니다.' });
    } catch (err) {
      setProfileMessage({ type: 'error', text: err.message || '업데이트에 실패했습니다.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate File Type
    if (!file.type.startsWith('image/')) {
      return setProfileMessage({ type: 'error', text: '이미지 파일만 업로드 가능합니다.' });
    }

    setProfileLoading(true);
    setProfileMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      const response = await authApi.uploadImage(formData);
      setProfileImg(response.url); // 서버에서 받은 URL로 상태 업데이트
      setProfileMessage({ type: 'success', text: '이미지가 업로드되었습니다. 저장 버튼을 눌러 확정하세요.' });
    } catch (err) {
      setProfileMessage({ type: 'error', text: '이미지 업로드에 실패했습니다.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setPwdMessage({ type: 'error', text: '새 비밀번호가 일치하지 않습니다.' });
    }

    setPwdLoading(true);
    setPwdMessage({ type: '', text: '' });

    try {
      await authApi.updatePassword({ currentPassword, newPassword });
      setPwdMessage({ type: 'success', text: '비밀번호가 성공적으로 변경되었습니다.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwdMessage({ type: 'error', text: err.message || '현재 비밀번호가 틀렸거나 변경에 실패했습니다.' });
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-background overflow-y-auto custom-scrollbar p-10">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Page Title */}
        <header className="border-b border-outline-variant/15 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary text-xl">settings_account_box</span>
            <span className="font-label text-[0.6875rem] uppercase tracking-widest text-secondary font-bold">Account_Security_Manager</span>
          </div>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface">계정 설정 <span className="text-primary">.</span></h1>
        </header>

        {/* SECTION 1: PROFILE UPDATE (Photo + Name) */}
        <section className="bg-surface-container-low rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-outline-variant/10 bg-surface-container-lowest flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">person</span>
              <h2 className="font-headline font-bold text-on-surface">프로필 수정</h2>
            </div>
            <span className="text-[10px] font-mono text-outline uppercase tracking-widest">// update_public_info</span>
          </div>
          
          <form onSubmit={handleUpdateProfile} className="p-8 space-y-8">
            <div className="flex flex-col md:flex-row gap-10">
              {/* Profile Image Column */}
              <div className="flex flex-col items-center gap-4">
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => fileInputRef.current.click()}
                >
                  <img 
                    src={profileImg || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} 
                    alt="Preview" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-background shadow-xl transition-all group-hover:scale-105 group-hover:brightness-90"
                    onError={(e) => e.target.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                  />
                  <div className="absolute inset-0 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="material-symbols-outlined text-white text-3xl drop-shadow-md">upload_file</span>
                  </div>
                  {/* Hidden File Input */}
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                </div>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="text-[10px] font-mono bg-surface-container-highest px-3 py-1 rounded-full text-primary hover:bg-primary hover:text-white transition-all uppercase tracking-tighter"
                >
                  Change_Photo
                </button>
              </div>

              {/* Inputs Column */}
              <div className="flex-1 space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-label text-secondary uppercase font-bold tracking-wider ml-1">Profile_Image_URL (Short URLs only)</label>
                  <input 
                    type="text" 
                    value={profileImg}
                    onChange={(e) => setProfileImg(e.target.value)}
                    placeholder="https://example.com/avatar.png (255자 이내)"
                    className="w-full bg-background border border-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all font-mono text-on-surface"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-label text-secondary uppercase font-bold tracking-wider ml-1">Display_Name</label>
                  <input 
                    type="text" 
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="닉네임"
                    className="w-full bg-background border border-outline-variant/20 rounded-xl px-4 py-3 text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all font-headline text-on-surface"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Profile Action Button Area */}
            <div className="pt-4 border-t border-outline-variant/10 flex items-center justify-between">
              <div>
                {profileMessage.text && (
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold ${profileMessage.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'} animate-in fade-in slide-in-from-left-2`}>
                    <span className="material-symbols-outlined text-xs">{profileMessage.type === 'success' ? 'check_circle' : 'warning'}</span>
                    {profileMessage.text}
                  </div>
                )}
              </div>
              <button 
                type="submit" 
                disabled={profileLoading}
                className="bg-primary text-white px-8 py-3 rounded-xl font-label text-xs font-bold tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
              >
                {profileLoading ? (
                  <span className="animate-spin w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full" />
                ) : (
                  <span className="material-symbols-outlined text-sm">save</span>
                )}
                SAVE_PROFILE_CHANGES
              </button>
            </div>
          </form>
        </section>

        {/* SECTION 2: PASSWORD UPDATE */}
        <section className="bg-surface-container-low rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-outline-variant/10 bg-surface-container-lowest flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">lock</span>
              <h2 className="font-headline font-bold text-on-surface">비밀번호 변경</h2>
            </div>
            <span className="text-[10px] font-mono text-outline uppercase tracking-widest">// security_credentials</span>
          </div>

          <form onSubmit={handleUpdatePassword} className="p-8 space-y-6">
            <div className="space-y-1.5 max-w-md">
              <label className="text-[11px] font-label text-secondary uppercase font-bold tracking-wider ml-1">Current_Password</label>
              <input 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="현재 비밀번호 확인"
                className="w-full bg-background border border-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-label text-secondary uppercase font-bold tracking-wider ml-1">New_Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="최소 6자 이상"
                  className="w-full bg-background border border-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-label text-secondary uppercase font-bold tracking-wider ml-1">Confirm_New_Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="다시 한번 입력"
                  className="w-full bg-background border border-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/10 flex items-center justify-between">
              <div>
                {pwdMessage.text && (
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold ${pwdMessage.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'} animate-in fade-in`}>
                    <span className="material-symbols-outlined text-xs">{pwdMessage.type === 'success' ? 'verified' : 'error'}</span>
                    {pwdMessage.text}
                  </div>
                )}
              </div>
              <button 
                type="submit" 
                disabled={pwdLoading}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-label text-xs font-bold tracking-widest hover:bg-slate-800 active:scale-95 transition-all shadow-lg flex items-center gap-2"
              >
                {pwdLoading ? (
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <span className="material-symbols-outlined text-sm">vpn_key</span>
                )}
                CHANGE_PASSWORD_NOW
              </button>
            </div>
          </form>
        </section>

      </div>
    </div>
  );
};

export default Settings;
