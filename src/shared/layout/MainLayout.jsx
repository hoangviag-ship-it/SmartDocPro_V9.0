import React from 'react';
import Sidebar from './Sidebar';
import { useAppStore } from '../store/useAppStore';
import { PanelLeftOpen } from 'lucide-react';

const MainLayout = ({ children }) => {
  const isFullScreen = useAppStore((state) => state.isFullScreen);
  const screenResolution = useAppStore((state) => state.screenResolution);
  const isSidebarOpen = useAppStore((state) => state.isSidebarOpen);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);

  return (
    <div className="flex h-screen bg-[#050505] text-slate-300 font-sans overflow-hidden">
      {/* Sidebar với slide transition */}
      <div
        className="shrink-0 overflow-hidden transition-all duration-300 ease-in-out"
        style={{ width: isSidebarOpen ? '224px' : '0px' }}
      >
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col relative overflow-hidden bg-[#0A0D14]/50 min-w-0">
        {/* Nút mở sidebar khi đang ẩn */}
        {!isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="absolute top-3 left-3 z-50 p-2 bg-slate-800/90 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700/50 shadow-lg transition-all"
            title="Mở menu"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}

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
