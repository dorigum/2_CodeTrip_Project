import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './components/Layout/Header';
import SideBar from './components/Layout/SideBar';
import Footer from './components/Layout/Footer';
import './App.css';

const App = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex min-h-screen bg-background text-on-surface font-body selection:bg-primary-fixed overflow-hidden">
      {/* Side Navigation */}
      <SideBar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />

      {/* Main Wrapper */}
      <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'} h-screen`}>
        <Header toggleSidebar={toggleSidebar} />
        
        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-16 md:pb-0">
          <Outlet />
          
          {/* 푸터 복구 */}
          <Footer />
        </div>
      </main>
    </div>
  );
};

export default App;
