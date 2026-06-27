import React from 'react';
import Sidebar from './Sidebar';
import { useAppStore } from '../store/useAppStore';

const MainLayout = ({ children }) => {
  const isFullScreen = useAppStore((state) => state.isFullScreen);
  const screenResolution = useAppStore((state) => state.screenResolution);

  return (
    <div className="flex h-screen bg-[#050505] text-slate-300 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[#0A0D14]/50">
        
        {/* Main Content Area */}
        <main className={`flex-1 overflow-y-auto ${isFullScreen ? 'p-0' : 'p-6'} relative z-10`}>
          <div className={`${screenResolution === '2k' ? 'max-w-none' : 'max-w-7xl'} mx-auto h-full`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
