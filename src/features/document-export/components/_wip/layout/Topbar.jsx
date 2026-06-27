import React from 'react';
import { Search } from 'lucide-react';

const Topbar = () => {
  return (
    <div className="h-16 bg-[#0A0D14]/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-50">
      
      {/* Search Bar - Center/Leftish */}
      <div className="flex-1 max-w-xl hidden md:flex items-center">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-800 rounded-lg bg-slate-900/50 text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm"
            placeholder="Tìm kiếm mẫu Word, biến..."
          />
        </div>
      </div>
      
      {/* We can inject the actual Google Login button later in this area if needed */}
      <div id="google-btn" className="hidden"></div>
    </div>
  );
};

export default Topbar;
