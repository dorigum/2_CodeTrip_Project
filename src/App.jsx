import React from 'react';
import BoardList from './features/Board/BoardList';
import './App.css';

const NAV_ITEMS = [
  { icon: 'home', label: '// home', active: true },
  { icon: 'explore', label: '// explore' },
  { icon: 'bookmark', label: '// bookmarks' },
  { icon: 'settings', label: '// settings' },
];

const App = () => {
  return (
    <div className="flex min-h-screen font-['Inter']">
      {/* 1. Side Navigation */}
      <aside className="hidden md:flex flex-col py-8 gap-2 h-full sticky left-0 w-64 bg-[#f2f4f6] transition-all duration-200">
        <div className="px-6 mb-8">
          <div className="text-lg font-bold font-['Space_Grotesk']">The Solar Compiler</div>
          <div className="text-[10px] uppercase tracking-widest text-[#5e6369] opacity-60">v1.0.4-stable</div>
        </div>
        <nav className="flex flex-col gap-1 pr-4">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href="#"
              className={`flex items-center gap-3 px-6 py-3 text-sm font-['Space_Grotesk'] transition-all duration-200 rounded-r-lg ${
                item.active ? 'text-[#006879] font-bold bg-white' : 'text-[#5e6369] hover:bg-[#e6e8ea]'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        {/* 2. Top Navigation */}
        <header className="flex items-center justify-between px-6 w-full h-16 sticky top-0 z-50 bg-[#f8f9fb]/80 backdrop-blur-md">
          <div className="flex items-center gap-8">
            <div className="text-xl font-bold font-['Space_Grotesk'] tracking-tight">Code Trip</div>
            <nav className="hidden lg:flex gap-6">
              {['Docs', 'API', 'Changelog'].map(text => (
                <a key={text} href="#" className="text-[#5e6369] hover:text-[#00b8d4] transition-colors text-sm font-['Space_Grotesk']">{text}</a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-[#5e6369] hover:bg-[#e6e8ea] rounded-full"><span className="material-symbols-outlined">notifications</span></button>
            <button className="p-2 text-[#5e6369] hover:bg-[#e6e8ea] rounded-full"><span className="material-symbols-outlined">account_circle</span></button>
          </div>
        </header>

        {/* 3. Main Content Area */}
        <div className="p-6 lg:p-10 space-y-12">
          {/* Hero Section */}
          <section className="relative w-full aspect-[21/9] rounded-xl overflow-hidden group">
            <img 
              alt="Hero" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHaFWKTXoD7mJHtN6tIrJmnpnMFWJjFPTS9MgR8lmh91I36OqBte6ugLBWy2uxDaBZ7cziElo7-fOV4ywo5_aykN5rdTdikFJiaDfWYJGzUIbz71v1ny99j_GePWZT7Fk876GNd_Tt7_Ut-XXiURKv3_Go54hEZrpmKqdylp294PBexkkRza7YNEbxF6FJ5V_FcOsLOatcwW0PHnTV27mffa_yiHCiHOSNDJa1S9lfzBD5t9uJxwdI_-PnsvajgWdrDzYfr6R9wI-g" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#191c1e]/60 to-transparent flex items-center px-12">
              <div className="max-w-2xl space-y-4">
                <div className="inline-block px-3 py-1 bg-[#00b8d4]/20 backdrop-blur-md border border-[#00b8d4]/30 text-[#a8edff] font-['Space_Grotesk'] text-xs uppercase tracking-widest rounded-lg">
                  Status: Ready to Launch
                </div>
                <h1 className="text-5xl lg:text-7xl font-['Space_Grotesk'] font-bold text-white leading-tight">
                  Welcome to <br/><span className="text-[#00b8d4]">Terminal</span>.
                </h1>
                <div className="pt-4 flex gap-4">
                  <button className="px-6 py-3 bg-[#00b8d4] text-[#00444f] font-bold rounded-lg hover:brightness-110 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">terminal</span> INITIATE_V1
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 오픈 API 데이터 (BoardList) - 디자인 시스템에 맞춰서 출력됩니다. */}
          <BoardList />

          {/* Widgets Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white p-8 rounded-xl flex flex-col justify-between shadow-sm border border-[#bbc9cd]/10">
              <div className="space-y-6">
                <p className="font-['Space_Grotesk'] text-xs uppercase tracking-widest text-[#5e6369] opacity-60">System Context</p>
                <h3 className="font-['Space_Grotesk'] text-2xl font-bold">Local Env</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-['Space_Grotesk'] font-bold">24°</span>
                  <span className="text-xl font-['Space_Grotesk'] text-[#5e6369]">CELSIUS</span>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold font-['Space_Grotesk']">Trending <span className="text-[#006879]">Themes</span></h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['Cyberpunk Tokyo', 'Nordic Minimalist'].map((theme) => (
                  <div key={theme} className="bg-[#f2f4f6] p-6 rounded-xl hover:bg-[#e0e3e5] transition-all cursor-pointer">
                    <h4 className="font-bold text-lg">{theme}</h4>
                    <p className="text-sm text-[#5e6369] mt-1">Experimental aesthetics and synthesis of tradition.</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Footer */}
        <footer className="flex justify-between px-10 w-full mt-auto py-4 bg-[#f8f9fb] border-t border-[#bbc9cd]/15">
          <div className="text-[10px] uppercase text-[#5e6369] opacity-70">/* © 2026 Code Trip - Optimal */</div>
          <div className="flex gap-6">
            {['Privacy', 'Security', 'Terms'].map(link => (
              <a key={link} className="text-[10px] uppercase text-[#5e6369] opacity-70" href="#">{link}</a>
            ))}
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
