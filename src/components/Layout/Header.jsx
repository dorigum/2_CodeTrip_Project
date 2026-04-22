import React from 'react';

const Header = () => {
  return (
    <header className="flex items-center justify-between px-6 w-full h-16 sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-outline-variant/10">
      <div className="flex items-center gap-8">
        <div className="text-xl font-bold text-on-surface font-headline tracking-tight">Code Trip</div>
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
  );
};

export default Header;
