import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import useWishlistStore from '../../store/useWishlistStore';

const NAV_ITEMS = [
// ... (omitting for brevity in this thought but I will provide full replace)
  { icon: 'home', label: 'Home', path: '/', animation: 'group-hover:-translate-y-1' },
  { icon: 'explore', label: 'Explore', path: '/explore', animation: 'group-hover:rotate-45' },
  { 
    icon: 'favorite', 
    label: 'Wishlist', 
    path: '/mypage', 
    animation: 'group-hover:text-red-500',
    extra: (
      <>
        <span className="material-symbols-outlined heart-bubble heart-bubble-1 fill-1">favorite</span>
        <span className="material-symbols-outlined heart-bubble heart-bubble-2 fill-1">favorite</span>
        <span className="material-symbols-outlined heart-bubble heart-bubble-3 fill-1">favorite</span>
      </>
    )
  },
  { icon: 'manage_accounts', label: 'UserInfo Edit', path: '/settings', animation: 'group-hover:scale-110 group-hover:-translate-y-0.5' },
];

const SideBar = ({ isCollapsed, toggleSidebar }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout, isLoggedIn } = useAuthStore();
  const { clearWishlist } = useWishlistStore();

  const isActive = (path) => (path === '/' ? pathname === '/' : pathname.startsWith(path));

  const handleNavClick = (e, item) => {
    // 보호된 경로 설정
    const protectedPaths = ['/mypage', '/settings'];
    
    if (protectedPaths.includes(item.path) && !isLoggedIn) {
      e.preventDefault();
      alert('회원만 이용 가능한 서비스입니다.');
      navigate('/login');
      return;
    }
  };

  return (
    <>
      <aside 
        className={`fixed left-0 top-0 h-full bg-white border-r border-outline-variant/30 z-[55] flex flex-col overflow-hidden transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        } hidden md:flex`}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center px-6 shrink-0 border-b border-outline-variant/10">
          {!isCollapsed ? (
            <Link 
              to="/" 
              className="text-xl font-bold tracking-tighter text-slate-900 transition-opacity duration-300 hover:text-primary opacity-100"
            >
              Code Trip
            </Link>
          ) : (
            <div className="w-0 overflow-hidden opacity-0">Code Trip</div>
          )}
          
          <button 
            onClick={toggleSidebar} 
            className={`material-symbols-outlined text-primary hover:bg-primary/5 p-1 rounded-lg transition-all ${isCollapsed ? 'mx-auto' : 'ml-auto'}`}
          >
            {isCollapsed ? 'menu_open' : 'menu'}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-8 flex flex-col gap-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              onClick={(e) => handleNavClick(e, item)}
              className={`flex items-center gap-4 px-6 py-3 transition-all duration-300 group ${
                isActive(item.path)
                  ? 'text-primary bg-primary/5 border-r-4 border-primary font-semibold'
                  : 'text-slate-600 hover:text-primary hover:bg-slate-50'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <span className={`material-symbols-outlined ${isActive(item.path) ? 'fill-1' : ''} transition-all duration-300 ${item.animation}`}>
                  {item.icon}
                </span>
                {item.extra}
              </div>
              <span className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* User Profile Area */}
        <div className="p-4 border-t border-outline-variant/10 mt-auto">
          {user ? (
            <div className={`flex flex-col gap-4 ${isCollapsed ? 'items-center' : ''}`}>
              <div className="flex items-center gap-4 overflow-hidden">
                <img 
                  src={user.profileImg || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} 
                  alt="User" 
                  className="w-10 h-10 rounded-full border border-outline-variant/15 shrink-0 object-cover" 
                  onError={(e) => {
                    e.target.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
                  }}
                />
                <div className={`transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                  <p className="text-sm font-bold truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest truncate">Premium Core</p>
                </div>
              </div>
              {!isCollapsed && (
                <button 
                  onClick={() => { logout(); clearWishlist(); }} 
                  className="w-full py-2 bg-red-50 text-red-600 text-[10px] font-bold rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2 group/logout"
                >
                  <span className="material-symbols-outlined text-sm transition-transform duration-300 group-hover/logout:-translate-x-1">logout</span>
                  LOGOUT_SYSTEM
                </button>
              )}
            </div>
          ) : (
            <Link to="/login" className={`flex items-center gap-4 transition-all group ${isCollapsed ? 'justify-center' : 'px-2'}`}>
              <span className="material-symbols-outlined text-primary transition-transform duration-300 group-hover:scale-110">account_circle</span>
              {!isCollapsed && <span className="text-sm font-bold uppercase text-primary">Sign In</span>}
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-outline-variant/30 z-[55] flex md:hidden items-center justify-around h-16 px-2">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            onClick={(e) => handleNavClick(e, item)}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all group ${
              isActive(item.path) ? 'text-primary' : 'text-slate-400'
            }`}
          >
            <span className={`material-symbols-outlined text-2xl ${isActive(item.path) ? 'fill-1' : ''} transition-all duration-300 ${item.animation}`}>
              {item.icon}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">
              {item.label === 'UserInfo Edit' ? 'Settings' : item.label}
            </span>
          </Link>
        ))}
      </nav>
    </>
  );
};

export default SideBar;
