import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const Header = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="flex items-center justify-between px-6 w-full h-16 sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-outline-variant/10 font-['Plus_Jakarta_Sans']">
      <div className="flex items-center flex-1">
        {/* 검색창 영역 - 왼쪽 정렬 */}
        <div className="relative hidden sm:block w-full max-w-md lg:max-w-xl">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-outline text-sm">search</span>
          </div>
          <input
            className="bg-surface-container-high border-none rounded-lg py-2.5 pl-10 pr-4 text-sm w-full focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-all outline-none"
            placeholder="Search destinations, festivals, themes..."
            type="text"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4 shrink-0 ml-4">
        {user ? (
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block leading-tight">
              <p className="text-[10px] font-bold text-primary uppercase tracking-tighter mb-0.5">Authenticated</p>
              <p className="text-sm font-bold text-on-surface">{user.name}</p>
            </div>
            
            <div className="flex items-center gap-1 bg-surface-container-low rounded-xl p-1 pr-1 border border-outline-variant/10">
              <Link to="/mypage" className="p-1 relative group cursor-pointer">
                <img 
                  src={user.profileImg || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-lg border border-outline-variant/30 group-hover:border-primary transition-colors object-cover"
                  onError={(e) => {
                    e.target.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
                  }}
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-background rounded-full"></span>
              </Link>

              {/* 로그아웃 버튼 */}
              <button 
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all group/logout"
                title="Sign Out"
              >
                <span className="material-symbols-outlined text-lg group-hover/logout:translate-x-0.5 transition-transform">logout</span>
                <span className="text-[10px] font-bold uppercase tracking-widest hidden lg:inline">Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <Link 
            to="/login"
            className="px-5 py-2 bg-primary text-white font-headline font-bold rounded-lg hover:brightness-110 transition-all text-sm flex items-center gap-2 shadow-md"
          >
            <span className="material-symbols-outlined text-base font-normal">login</span>
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
