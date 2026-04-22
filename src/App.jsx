import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './components/Layout/Header';
import SideBar from './components/Layout/SideBar';
import Footer from './components/Layout/Footer';
import './App.css';

const App = () => {
  return (
    <div className="flex min-h-screen bg-background text-on-surface font-body">
      {/* Side Navigation (Desktop) & Bottom Navigation (Mobile) */}
      <SideBar />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <Header />

        {/* Dynamic Content Area */}
        <Outlet />

        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
};

export default App;
