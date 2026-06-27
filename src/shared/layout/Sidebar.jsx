import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  LayoutDashboard,
  Settings,
  History,
  FileCode2,
  Database,
  Bell,
  User,
  FolderPlus,
  GitMerge,
  FileUp,
  TableProperties,
  Printer,
  ChevronDown,
  ChevronUp,
  FileDown,
  Sun,
  Moon,
  PanelLeftClose
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const activeMainTab = useAppStore((state) => state.activeMainTab);
  const setActiveMainTab = useAppStore((state) => state.setActiveMainTab);
  const triggerAppAction = useAppStore((state) => state.triggerAppAction);
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const toggleDarkMode = useAppStore((state) => state.toggleDarkMode);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);

  // Export settings from store (global, shared with AppContent)
  const exportMode = useAppStore((state) => state.exportMode);
  const setExportMode = useAppStore((state) => state.setExportMode);
  const exportSubFolderPattern = useAppStore((state) => state.exportSubFolderPattern);
  const setExportSubFolderPattern = useAppStore((state) => state.setExportSubFolderPattern);
  const enableHighlight = useAppStore((state) => state.enableHighlight);
  const setEnableHighlight = useAppStore((state) => state.setEnableHighlight);
  const cleanUnusedTags = useAppStore((state) => state.cleanUnusedTags);
  const setCleanUnusedTags = useAppStore((state) => state.setCleanUnusedTags);

  const [exportPanelOpen, setExportPanelOpen] = useState(true);

  const menuItems = [
    { id: 'workspace', label: 'Bảng làm việc', icon: LayoutDashboard },
    { id: 'excel', label: 'Dữ liệu Excel', icon: TableProperties },
    { id: 'export', label: 'Xuất hồ sơ', icon: FileDown },
    { id: 'variables', label: 'Thư viện Biến', icon: FileCode2 },
    { id: 'history', label: 'Lịch sử xuất', icon: History },
    { id: 'settings', label: 'Cài đặt chung', icon: Settings },
  ];

  return (
    <div className="w-56 h-screen bg-[#0A0D14] border-r border-slate-800 flex flex-col flex-shrink-0 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[-50px] left-[-50px] w-40 h-40 bg-purple-600/20 rounded-full blur-[60px] pointer-events-none"></div>

      {/* Logo Area */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-slate-800/50">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
          <Database className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-white font-bold tracking-wide text-lg leading-tight">SmartDoc</span>
          <span className="text-xs text-indigo-400 font-medium tracking-widest">PRO v8.0</span>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors shrink-0"
          title="Ẩn menu"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation (scrollable) */}
      <div className="flex-1 py-2 px-3 flex flex-col gap-0.5 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <button
          onClick={() => triggerAppAction('NEW_PROJECT')}
          className="relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group text-left bg-gradient-to-r from-indigo-500/20 to-purple-600/20 hover:from-indigo-500/40 hover:to-purple-600/40 border border-indigo-500/30 text-white shadow-sm"
        >
          <FolderPlus className="w-5 h-5 relative z-10 text-indigo-400" />
          <span className="text-sm font-bold relative z-10">Dự án Mới</span>
        </button>

        <button
          onClick={() => triggerAppAction('PROCESS')}
          className="relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group text-left text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
        >
          <GitMerge className="w-5 h-5 relative z-10 text-slate-500 group-hover:text-slate-400" />
          <span className="text-sm font-medium relative z-10">Quy trình</span>
        </button>

        <button
          onClick={() => triggerAppAction('UPLOAD_WORD')}
          className="relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group text-left text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
        >
          <FileUp className="w-5 h-5 relative z-10 text-slate-500 group-hover:text-slate-400" />
          <span className="text-sm font-medium relative z-10">Nạp File Mẫu</span>
        </button>

        <button
          onClick={() => triggerAppAction('UPLOAD_EXCEL')}
          className="relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group text-left text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
        >
          <TableProperties className="w-5 h-5 relative z-10 text-slate-500 group-hover:text-slate-400" />
          <span className="text-sm font-medium relative z-10">Nạp DL Excel</span>
        </button>

        <div className="h-px bg-white/[0.03] my-2 mx-2"></div>

        {menuItems.map((item) => {
          const isActive = activeMainTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'settings') {
                  triggerAppAction('SETTINGS');
                } else if (item.id === 'history') {
                  triggerAppAction('HISTORY');
                } else {
                  setActiveMainTab(item.id);
                }
              }}
              className={`relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group text-left
                ${isActive && item.id !== 'settings' && item.id !== 'history'
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
            >
              {isActive && item.id !== 'settings' && item.id !== 'history' && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-indigo-500/10 border border-indigo-500/20 rounded-xl"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 relative z-10 transition-colors ${isActive && item.id !== 'settings' && item.id !== 'history' ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-400'}`} />
              <span className="text-sm font-medium relative z-10">{item.label}</span>
              {isActive && item.id !== 'settings' && item.id !== 'history' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full" />
              )}
            </button>
          );
        })}

        <div className="h-px bg-white/[0.03] my-2 mx-2"></div>

        {/* Bản in Full */}
        <button
          onClick={() => triggerAppAction('PRINT')}
          className="relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group text-left text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/30"
        >
          <Printer className="w-5 h-5 relative z-10 text-emerald-500 group-hover:text-emerald-400" />
          <span className="text-sm font-medium relative z-10">Bản in Full</span>
        </button>



      </div>

      {/* Admin and Notification Area */}
      <div className="px-4 pb-2 pt-4 border-t border-slate-800/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 cursor-pointer group flex-1 overflow-hidden">
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center p-0.5 shrink-0">
            <div className="w-full h-full rounded-full bg-[#0A0D14] flex items-center justify-center overflow-hidden">
              <User className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div className="flex flex-col truncate">
            <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors truncate">Admin</span>
            <span className="text-[10px] text-slate-500 truncate">Hoạt động offline</span>
          </div>
        </div>
        <button
          onClick={toggleDarkMode}
          className="p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800 shrink-0"
          title={isDarkMode ? 'Chuyển sang Light Mode' : 'Chuyển sang Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800 shrink-0">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full border-2 border-[#0A0D14]"></span>
        </button>
      </div>

      {/* Footer Area */}
      <div className="p-4 pt-2 shrink-0">
        <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 relative overflow-hidden group cursor-pointer hover:border-indigo-500/30 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-[20px] group-hover:bg-indigo-500/20 transition-colors"></div>
          <p className="text-xs text-slate-400 mb-1 relative z-10">Dung lượng</p>
          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden relative z-10">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 w-1/3 h-full rounded-full"></div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 text-right relative z-10">Local Storage</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
