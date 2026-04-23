import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const NAV_ITEMS = [
  { icon: 'home', label: 'Home', path: '/' },
  { icon: 'explore', label: 'Explore', path: '/explore' },
  { icon: 'bookmark', label: 'Wishlist', path: '/mypage' },
  { icon: 'settings', label: 'Settings', path: '/settings' },
];

const SideBar = ({ isCollapsed, toggleSidebar }) => {
  const { pathname } = useLocation();
  const { user, logout } = useAuthStore();

  const isActive = (path) => (path === '/' ? pathname === '/' : pathname.startsWith(path));

  return (
    <>
      <aside 
        className={`fixed left-0 top-0 h-full bg-white border-r border-outline-variant/30 z-[55] flex flex-col overflow-hidden transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        } hidden md:flex`}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center px-6 shrink-0 border-b border-outline-variant/10">
          <span className={`text-xl font-bold tracking-tighter text-slate-900 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
            Code Trip
          </span>
          <button onClick={toggleSidebar} className={`material-symbols-outlined text-primary hover:bg-primary/5 p-1 rounded-lg transition-all ${isCollapsed ? 'mx-auto' : 'ml-auto'}`}>
            {isCollapsed ? 'menu_open' : 'menu'}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-8 flex flex-col gap-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-4 px-6 py-3 transition-all duration-300 group ${
                isActive(item.path)
                  ? 'text-primary bg-primary/5 border-r-4 border-primary font-semibold'
                  : 'text-slate-600 hover:text-primary hover:bg-slate-50'
              }`}
            >
              <span className={`material-symbols-outlined ${isActive(item.path) ? 'fill-1' : ''}`}>
                {item.icon}
              </span>
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
                <button onClick={logout} className="w-full py-2 bg-red-50 text-red-600 text-[10px] font-bold rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">logout</span>
                  LOGOUT_SYSTEM
                </button>
              )}
            </div>
          ) : (
            <Link to="/login" className={`flex items-center gap-4 transition-all ${isCollapsed ? 'justify-center' : 'px-2'}`}>
              <span className="material-symbols-outlined text-primary">account_circle</span>
              {!isCollapsed && <span className="text-sm font-bold uppercase text-primary">Sign In</span>}
            </Link>
          )}
        </div>
      </aside>
    </>
  );
};

export default SideBar;
