import React from 'react';
import { Link } from 'react-router-dom';

const NAV_ITEMS = [
  { icon: 'home', label: '// home', path: '/', active: true },
  { icon: 'explore', label: '// explore', path: '/explore' },
  { icon: 'bookmark', label: '// bookmarks', path: '#' },
  { icon: 'settings', label: '// settings', path: '#' },
];

const MOBILE_NAV = [
  { icon: 'home', label: 'Home', active: true },
  { icon: 'explore', label: 'Explore' },
  { icon: 'bookmark', label: 'Saves' },
  { icon: 'settings', label: 'Setup' },
];

const SideBar = () => {
  return (
    <>
      <aside className="hidden md:flex flex-col py-8 gap-2 min-h-screen sticky top-0 left-0 w-64 bg-surface-container-low transition-all duration-200 shrink-0">
        <div className="px-6 mb-8">
          <div className="text-lg font-bold text-on-surface font-headline">The Solar Compiler</div>
          <div className="text-[10px] uppercase tracking-widest text-on-secondary-container font-label opacity-60">v1.0.4-stable</div>
        </div>
        <nav className="flex flex-col gap-1 pr-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3 px-6 py-3 font-label text-sm transition-all duration-200 rounded-r-lg ${
                item.active
                  ? 'text-primary font-bold bg-surface-container-lowest'
                  : 'text-on-secondary-container hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-container-lowest glass-panel flex items-center justify-around z-50">
        {MOBILE_NAV.map((item) => (
          <button
            key={item.label}
            className={`flex flex-col items-center gap-1 ${item.active ? 'text-primary' : 'text-on-secondary-container'}`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className={`text-[10px] font-label uppercase ${item.active ? 'font-bold' : ''}`}>{item.label}</span>
          </button>
        ))}
      </div>
    </>
  );
};

export default SideBar;
