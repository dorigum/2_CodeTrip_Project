import React from 'react';
import { Link } from 'react-router-dom';
import './App.css';
import SideBar from './components/Layout/SideBar';
import Header from './components/Layout/Header';

const TRENDING_THEMES = [
  { icon: 'coffee', title: 'Cyberpunk Tokyo', desc: 'High-contrast neon nights and synthesis of tradition.' },
  { icon: 'forest', title: 'Nordic Minimalist', desc: 'Clean lines, white space, and glacial stillness.' },
  { icon: 'landscape', title: 'High Sierra Mono', desc: 'Rugged landscapes with a monochromatic aesthetic.' },
  { icon: 'architecture', title: 'Brutalist Berlin', desc: 'Raw textures, bold geometry, and heavy history.' },
];

const HERO_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHaFWKTXoD7mJHtN6tIrJmnpnMFWJjFPTS9MgR8lmh91I36OqBte6ugLBWy2uxDaBZ7cziElo7-fOV4ywo5_aykN5rdTdikFJiaDfWYJGzUIbz71v1ny99j_GePWZT7Fk876GNd_Tt7_Ut-XXiURKv3_Go54hEZrpmKqdylp294PBexkkRza7YNEbxF6FJ5V_FcOsLOatcwW0PHnTV27mffa_yiHCiHOSNDJa1S9lfzBD5t9uJxwdI_-PnsvajgWdrDzYfr6R9wI-g';

const App = () => {
  return (
    <div className="flex min-h-screen bg-background text-on-surface font-body">
      <SideBar />

      <main className="flex-1 flex flex-col min-w-0">
        <Header />

        <div className="p-6 lg:p-10 space-y-12 pb-20 md:pb-12">
          {/* Hero Section */}
          <section className="relative w-full aspect-[21/9] rounded-xl overflow-hidden group">
            <img
              alt="Destination Hero"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              src={HERO_IMG}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-on-background/60 to-transparent flex items-center px-12">
              <div className="max-w-2xl space-y-4">
                <div className="inline-block px-3 py-1 bg-primary-container/20 backdrop-blur-md border border-primary-container/30 text-primary-fixed font-label text-xs uppercase tracking-widest rounded-lg">
                  Status: Ready to Launch
                </div>
                <h1 className="text-5xl lg:text-7xl font-headline font-bold text-surface-container-lowest leading-tight">
                  Welcome to <br />
                  <span className="text-primary-container">Terminal</span>.
                </h1>
                <p className="text-surface-container-highest text-lg max-w-md font-body leading-relaxed opacity-90">
                  Your journey is the ultimate algorithm. Compile your next adventure with precision and logic.
                </p>
                <div className="pt-4 flex gap-4">
                  <Link
                    to="/explore"
                    className="px-6 py-3 bg-primary-container text-on-primary-container font-headline font-bold rounded-lg hover:brightness-110 transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">terminal</span>
                    INITIATE_V1
                  </Link>
                  <button className="px-6 py-3 bg-surface-container-lowest/10 backdrop-blur-md border border-surface-container-lowest/20 text-surface-container-lowest font-headline font-bold rounded-lg hover:bg-surface-container-lowest/20 transition-all">
                    VIEW_DOCS
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weather Widget */}
            <div className="lg:col-span-1 bg-surface-container-lowest p-8 rounded-xl flex flex-col justify-between group shadow-[0_20px_40px_rgba(25,28,30,0.03)] border border-outline-variant/10">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="font-label text-xs uppercase tracking-widest text-on-secondary-container opacity-60">System Context</p>
                    <h3 className="font-headline text-2xl font-bold">Local Env</h3>
                  </div>
                  <div className="w-12 h-12 bg-primary-container/10 flex items-center justify-center rounded-lg text-primary">
                    <span className="material-symbols-outlined text-3xl">partly_cloudy_day</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-headline font-bold text-on-surface">24°</span>
                  <span className="text-xl font-label text-on-secondary-container">CELSIUS</span>
                </div>
                <div className="p-4 bg-surface-container-low rounded-lg border-l-4 border-primary">
                  <p className="text-xs font-label syntax-comment mb-2">// Recommendation Logic</p>
                  <p className="text-sm font-body text-on-surface leading-relaxed">
                    Optimal conditions for{' '}
                    <span className="text-primary font-bold">Outdoor Sessions</span> detected in Tokyo, JP.
                  </p>
                </div>
              </div>
              <Link
                to="/explore"
                className="mt-8 w-full py-4 bg-on-background text-surface-container-lowest font-label text-sm font-bold rounded-lg flex items-center justify-center gap-3 hover:bg-primary transition-colors group-hover:shadow-lg"
              >
                <span className="material-symbols-outlined text-lg">explore</span>
                Explore Destinations
              </Link>
            </div>

            {/* Trending Themes */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-headline text-2xl font-bold">
                  Trending <span className="text-primary">Themes</span>
                </h2>
                <Link to="/explore" className="text-sm font-label text-primary hover:underline underline-offset-4">
                  VIEW_ALL
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TRENDING_THEMES.map((theme) => (
                  <div
                    key={theme.title}
                    className="bg-surface-container-low p-6 rounded-xl hover:bg-surface-container-highest transition-all cursor-pointer group"
                  >
                    <div className="flex gap-4 items-start">
                      <div className="p-3 bg-surface-container-lowest rounded-lg group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">
                        <span className="material-symbols-outlined">{theme.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-headline font-bold text-lg">{theme.title}</h4>
                        <p className="text-sm text-on-secondary-container font-body mt-1">{theme.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

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

    </div>
  );
};

export default App;
