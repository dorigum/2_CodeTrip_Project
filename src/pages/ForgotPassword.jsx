import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authApi from '../api/authApi';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      return setMessage({ type: 'error', text: '새 비밀번호가 일치하지 않습니다.' });
    }

    try {
      setIsLoading(true);
      const response = await authApi.forgotPassword({ email, name, newPassword });
      setMessage({ type: 'success', text: response.message });
      
      // 3초 후 로그인 페이지로 이동
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || '비밀번호 재설정에 실패했습니다.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md glass-panel p-10 rounded-3xl shadow-2xl border border-white/50">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-2xl mb-4">
            <span className="material-symbols-outlined text-4xl">lock_reset</span>
          </div>
          <h2 className="text-3xl font-headline font-bold text-on-background">Reset Password</h2>
          <p className="text-on-secondary-container mt-2 font-label text-sm uppercase tracking-widest">// Security Recovery</p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 border-l-4 ${message.type === 'success' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-red-50 border-red-500 text-red-700'} text-xs font-bold rounded flex items-center gap-2 animate-in fade-in`}>
            <span className="material-symbols-outlined text-sm">{message.type === 'success' ? 'check_circle' : 'error'}</span>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-primary ml-1 uppercase tracking-tighter">Registered Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
              placeholder="example@codetrip.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-primary ml-1 uppercase tracking-tighter">Your Name (Nickname)</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
              placeholder="가입 시 입력한 이름"
            />
          </div>

          <div className="border-t border-outline-variant/10 pt-5 space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-primary ml-1 uppercase tracking-tighter">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="최소 6자 이상"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-primary ml-1 uppercase tracking-tighter">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="다시 한번 입력"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-primary text-white font-headline font-bold rounded-2xl shadow-lg hover:brightness-110 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? (
              <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <span className="material-symbols-outlined text-xl">published_with_changes</span>
            )}
            RESET_PASSWORD_NOW
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <Link to="/login" className="text-primary font-bold hover:underline flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
