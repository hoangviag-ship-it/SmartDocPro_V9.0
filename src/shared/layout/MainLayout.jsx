import React from 'react';
import Sidebar from './Sidebar';

const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-[#050505] text-slate-300 font-sans overflow-hidden">
      {/* Sidebar wrapper — always 56px wide; Sidebar itself overlays on hover */}
      <div className="relative w-14 shrink-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 min-h-0 overflow-hidden relative z-10">
        <div className="h-full w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
