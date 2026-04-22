import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import './App.css';

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

const App = () => {
  return (
    <div className="flex min-h-screen bg-background text-on-surface font-body">
      {/* Side Navigation */}
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

      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <header className="flex items-center justify-between px-6 w-full h-16 sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-outline-variant/10">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-bold text-on-surface font-headline tracking-tight">Code Trip</Link>
            <nav className="hidden lg:flex gap-6">
              {['Docs', 'API', 'Changelog'].map((text) => (
                <a key={text} href="#" className="text-on-secondary-container hover:text-primary-container transition-colors font-label text-sm">
                  {text}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-outline text-sm">search</span>
              </div>
              <input
                className="bg-surface-container-high border-none rounded-lg py-2 pl-10 pr-4 text-sm w-64 focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-all outline-none"
                placeholder="Search destinations..."
                type="text"
              />
            </div>
            <button className="p-2 text-on-secondary-container hover:bg-surface-container-high rounded-full transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="p-2 text-on-secondary-container hover:bg-surface-container-high rounded-full transition-colors">
              <span className="material-symbols-outlined">account_circle</span>
            </button>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <Outlet />

        {/* Footer */}
        <footer className="flex justify-between px-10 w-full mt-auto py-4 bg-background border-t border-outline-variant/15">
          <div className="font-label text-xs uppercase tracking-widest text-on-secondary-container opacity-70">
            /* © 2026 Code Trip - System Status: Optimal */
          </div>
          <div className="flex gap-6">
            {['Privacy', 'Security', 'Terms'].map((link) => (
              <a
                key={link}
                className="font-label text-xs uppercase tracking-widest text-on-secondary-container opacity-70 hover:opacity-100 hover:underline"
                href="#"
              >
                {link}
              </a>
            ))}
          </div>
        </footer>
      </main>

      {/* Mobile Bottom Navigation */}
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
    </div>
  );
};

export default App;
