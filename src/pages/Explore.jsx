import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

const REGIONS = ['East Asia', 'Korea, South', 'Western Europe', 'North America'];

const THEMES = [
  { id: 'heritage', label: '#heritage', defaultChecked: true },
  { id: 'minimalist', label: '#minimalist', defaultChecked: false },
  { id: 'high_tech', label: '#high_tech', defaultChecked: true },
  { id: 'nature_debug', label: '#nature_debug', defaultChecked: false },
];

const NEARBY_ATTRACTIONS = [
  {
    id: 1,
    name: '광안대교 야경',
    tags: '#ocean #night_view',
    dist: '5.2km',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBmP72R-kDouWGWrVSVmeaW0lk-9EozvLInOmx2yn5TVsSyY05Ee6v_i28x89VQKdMBrDuRMB4hQmJIzQBQyHfQF4spu9-iBHbONzhLE7b8FdO6m3hqakUb8F6UCBeoOfyhiVJKBcxI6BLmCE2EDVXY-YRVMhUvq1p2J5Zinn6aCrgU-EX9lkJXgyaHoy5NlNEo6TLXh0AAze10GbIc3JsjAsjdMZV4sW9vuqAVMlUlD6QMjzzGF0WgUbT0BTrLJrt72grke2pXe69',
  },
  {
    id: 2,
    name: '경주 대릉원',
    tags: '#history #nature',
    dist: '12.8km',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3b-GE3MdCzpHIbfVUxuHPae0SYn68GLvlaCuyWz9WwU72DmBdUIdFDZ-qG8lSKZtZKLVGuvhBEyQuV2XhBN37u29EPP8b5x1ZeHKt3_FTwm5X2oS5Eq_AwLgy7cI4Dxt0nbys0oTPulG_WlGWKddDzH5u8WDnZuKS2-8TJ5ZGU1ERcK66Uba-LgaCtNcuoJltxbS7ZDE92jTjGhF9L1iTqaYauu1lfJiS987KNlag23UtemLGYkeUslMAO1Xb1rBJHKnnFmAXtckj',
  },
  {
    id: 3,
    name: '한라산 국립공원',
    tags: '#hiking #peak',
    dist: '22.0km',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAw6I8ALPZ_TM9kFBZ4s0C-qe1TtebAnyjLtVv2WDGN4voSNs28omcpz35MDTsFpu2omBjcvMPcejyZil2qoFa6iGo8L96dXdptzpGC3W9FzsDHVDGTLWOvo0WMGm8GfAsvFs3P2I8-ZIkDMbMydZBfm0P_RinsdG5usU-B1oaQByMzQjvKeAOBSpAJ-KLJv-b_QMY1_-tfD9074TV6vv7hx-_6InrrHnhlWhycaiuOl8Wr-kfb80IdZT6fTYqi1KYYlgKGd0bU1YHc',
  },
];

const Explore = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRegion, setActiveRegion] = useState('Korea, South');
  const [themes, setThemes] = useState(
    Object.fromEntries(THEMES.map((t) => [t.id, t.defaultChecked]))
  );

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://apis.data.go.kr/B551011/PhotoGalleryService1/galleryList1', {
        params: {
          serviceKey: import.meta.env.VITE_GALLERY_API_KEY,
          pageNo: 1,
          numOfRows: 10,
          MobileOS: 'ETC',
          MobileApp: 'AppTest',
          _type: 'json',
        },
      });
      const items = response.data?.response?.body?.items?.item || [];
      setPosts(items);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const filteredPosts = posts.filter(
    (post) =>
      post.galTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.galPhotographyLocation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleTheme = (id) => {
    setThemes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-background text-on-surface font-body min-h-screen">
      {/* Fixed Top Nav */}
      <header className="fixed top-0 w-full z-50 bg-surface-container-lowest/80 backdrop-blur-md shadow-sm flex justify-between items-center px-8 h-16">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold tracking-tighter text-on-surface font-headline">
            Code Trip
          </Link>
          <nav className="hidden md:flex gap-6 items-center">
            <Link to="/" className="text-on-secondary-container hover:text-primary font-label text-sm tracking-tight transition-colors">
              Home
            </Link>
            <a className="text-primary font-semibold border-b-2 border-primary font-label text-sm tracking-tight cursor-pointer">
              Explore
            </a>
            <a className="text-on-secondary-container hover:text-primary font-label text-sm tracking-tight transition-colors cursor-pointer">
              Wishlist
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden lg:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
            <input
              className="bg-surface-container-low border-none rounded-full pl-10 pr-4 py-2 text-sm w-64 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="Search Destinations..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">terminal</span>
          </button>
          <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ml-1 ring-2 ring-primary/20">
            <span className="material-symbols-outlined text-on-primary" style={{ fontSize: '18px' }}>person</span>
          </div>
        </div>
      </header>

      {/* Page Body */}
      <main className="pt-24 pb-20 px-8 max-w-[1600px] mx-auto grid grid-cols-12 gap-8">

        {/* Left Sidebar: filters.config */}
        <aside className="col-span-12 lg:col-span-3 xl:col-span-2">
          <div className="bg-surface-container-low rounded-xl p-6 font-mono text-sm sticky top-24">
            <div className="flex items-center gap-2 mb-6 border-b border-outline-variant/20 pb-4">
              <span className="material-symbols-outlined text-primary text-lg">settings_ethernet</span>
              <span className="font-bold text-on-surface font-headline text-sm">filters.config</span>
            </div>
            <div className="space-y-6">
              {/* Region */}
              <section>
                <div className="flex items-center justify-between mb-2 cursor-pointer">
                  <span className="syntax-keyword text-sm">Region</span>
                  <span className="material-symbols-outlined text-xs text-outline">chevron_right</span>
                </div>
                <ul className="ml-4 space-y-2 border-l border-outline-variant/30 pl-4">
                  {REGIONS.map((region) => (
                    <li
                      key={region}
                      className="flex items-center gap-2 cursor-pointer group"
                      onClick={() => setActiveRegion(region)}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full transition-colors flex-shrink-0 ${
                        activeRegion === region
                          ? 'bg-primary'
                          : 'bg-outline-variant group-hover:bg-primary'
                      }`} />
                      <span className={`text-xs transition-colors ${
                        activeRegion === region
                          ? 'text-primary font-medium'
                          : 'text-on-secondary-container group-hover:text-primary'
                      }`}>
                        {region}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Theme */}
              <section>
                <div className="flex items-center justify-between mb-2 cursor-pointer">
                  <span className="syntax-keyword text-sm">Theme</span>
                  <span className="material-symbols-outlined text-xs text-outline">expand_more</span>
                </div>
                <div className="ml-4 space-y-3">
                  {THEMES.map((theme) => (
                    <label key={theme.id} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={themes[theme.id]}
                        onChange={() => toggleTheme(theme.id)}
                        className="rounded border-outline-variant text-primary focus:ring-primary"
                      />
                      <span className="text-on-secondary-container group-hover:text-on-surface transition-colors text-xs">
                        {theme.label}
                      </span>
                    </label>
                  ))}
                </div>
              </section>

              <button className="w-full py-2 bg-primary text-on-primary rounded-lg font-label text-xs font-bold hover:brightness-110 transition-all">
                RUN_FILTER.SH
              </button>
            </div>
          </div>
        </aside>

        {/* Main: Destination Grid */}
        <div className="col-span-12 lg:col-span-9 xl:col-span-7">
          <header className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 bg-primary-container text-on-primary-container text-[10px] font-bold rounded uppercase tracking-wider font-label">
                Branch: main
              </span>
              <span className="text-outline text-xs font-mono">/destinations/explore</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-on-surface font-headline">
              여행지 탐색 <span className="text-primary">.</span>
            </h1>
          </header>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-on-secondary-container">
              <span className="material-symbols-outlined text-5xl mb-4 opacity-30">search_off</span>
              <p className="font-label text-sm syntax-comment">// no results found for "{searchTerm}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredPosts.map((post) => (
                <article
                  key={post.galContentId}
                  className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                >
                  {/* Card Image */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      alt={post.galTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={post.galWebImageUrl}
                    />
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="min-w-0 pr-2">
                        <h3 className="text-xl font-bold text-on-surface mb-1 font-headline truncate">
                          {post.galTitle}
                        </h3>
                        <div className="flex items-center gap-1 text-outline text-xs font-mono">
                          <span className="material-symbols-outlined text-sm">location_on</span>
                          <span className="truncate">{post.galPhotographyLocation}</span>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-outline hover:text-primary cursor-pointer transition-colors flex-shrink-0">
                        favorite
                      </span>
                    </div>

                    {/* Code Block */}
                    <div className="bg-surface-container-low rounded-lg p-4 font-mono text-[11px] space-y-1">
                      <p className="syntax-comment">// created: {post.galCreatedtime?.substring(0, 8)}</p>
                      <p>
                        <span className="syntax-keyword">photographer:</span>{' '}
                        <span className="syntax-string">"{post.galPhotographer}"</span>
                      </p>
                      <p>
                        <span className="syntax-keyword">id:</span>{' '}
                        <span className="syntax-string">"{post.galContentId}"</span>
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-end">
                      <button className="px-4 py-2 bg-primary text-on-primary rounded-full text-xs font-bold hover:shadow-lg hover:brightness-110 transition-all font-label">
                        상세보기
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <aside className="hidden xl:col-span-3 xl:block">
          <div className="space-y-8 sticky top-24">
            {/* Terminal Widget */}
            <div className="bg-inverse-surface text-inverse-on-surface p-6 rounded-xl font-mono text-[10px] leading-relaxed shadow-lg">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-tertiary" />
                <div className="w-2.5 h-2.5 rounded-full bg-secondary" />
                <div className="w-2.5 h-2.5 rounded-full bg-primary-container" />
                <span className="ml-2 opacity-50">trip_metadata.log</span>
              </div>
              <p>
                <span className="text-[#4ec9b0]">$</span> fetch weather_status --loc "Seoul"
              </p>
              <p className="text-[#9cdcfe]">&gt;&gt; Success: Clear Sky, 22°C</p>
              <p className="mt-2">
                <span className="text-[#4ec9b0]">$</span> get local_attractions --top 3
              </p>
              {NEARBY_ATTRACTIONS.map((a, i) => (
                <p key={a.id} className="text-surface-dim mt-1">
                  {i + 1}. {a.name} ({a.dist})
                </p>
              ))}
              <div className="mt-4 pt-4 border-t border-white/10 flex justify-between opacity-40">
                <span>UTF-8</span>
                <span>Line: 42</span>
              </div>
            </div>

            {/* Nearby Attractions */}
            <div className="bg-surface-container-low rounded-xl p-6">
              <h4 className="text-sm font-bold text-on-surface mb-6 flex items-center gap-2 font-headline">
                <span className="material-symbols-outlined text-primary text-lg">auto_awesome</span>
                주변 인기 명소
              </h4>
              <div className="space-y-6">
                {NEARBY_ATTRACTIONS.map((attraction) => (
                  <div key={attraction.id} className="flex gap-4 items-center group cursor-pointer">
                    <div className="w-16 h-16 rounded-lg overflow-hidden shadow-sm flex-shrink-0">
                      <img
                        alt={attraction.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        src={attraction.image}
                      />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold group-hover:text-primary transition-colors font-headline">
                        {attraction.name}
                      </h5>
                      <p className="text-[10px] text-outline mt-1">{attraction.tags}</p>
                      <span className="text-[10px] text-primary font-mono mt-1 block">
                        dist: {attraction.dist}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-outline-variant/20 bg-inverse-surface flex flex-col md:flex-row justify-between items-center px-12 py-10 gap-6">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="font-mono text-xs uppercase tracking-widest text-[#4ec9b0]">
            // STATUS: 200 OK | Built with Syntactic Voyager v1.0.4
          </div>
          <nav className="flex gap-6">
            {['Docs', 'Commit History', 'API Status', 'Privacy.sh'].map((link) => (
              <a
                key={link}
                className="font-mono text-xs uppercase tracking-widest text-on-surface-variant hover:text-[#4ec9b0] transition-all hover:underline underline-offset-4 opacity-70 hover:opacity-100"
                href="#"
              >
                {link}
              </a>
            ))}
          </nav>
        </div>
        <div className="text-outline text-[10px] font-mono opacity-60">
          © 2026 CODE_TRIP_INFRASTRUCTURE. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Explore;
