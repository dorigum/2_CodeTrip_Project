import React from 'react';
import { Outlet } from 'react-router-dom';
import './App.css';
import SideBar from './components/Layout/SideBar';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';

const App = () => {
  return (
    <div className="flex min-h-screen bg-background text-on-surface font-body">
      <SideBar />

      <main className="flex-1 flex flex-col min-w-0">
        <Header />

        {/* Dynamic Content Area */}
        <Outlet />

        <Footer />
      </main>

    </div>
  );
};

export default App;
