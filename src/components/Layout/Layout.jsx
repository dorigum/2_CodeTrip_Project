import React from 'react';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout-root">
      <header className="main-header glass-panel">
        <div className="container">
          <div className="brand-logo">VIBE BOARD</div>
          <nav>
            <ul>
              <li><a href="/" className="nav-link">Home</a></li>
              <li><a href="/create" className="nav-link">New Post</a></li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="container main-content slide-up">
        {children}
      </main>
      <footer className="main-footer">
        <div className="container">
          <p>&copy; 2026 Vibe Board. Powered by Antigravity.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
