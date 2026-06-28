import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  LayoutDashboard,
  Settings,
  History,
  FileCode2,
  Database,
  User,
  FolderPlus,
  GitMerge,
  FileUp,
  TableProperties,
  Printer,
  FileDown,
  Sun,
  Moon,
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const activeMainTab = useAppStore((state) => state.activeMainTab);
  const setActiveMainTab = useAppStore((state) => state.setActiveMainTab);
  const triggerAppAction = useAppStore((state) => state.triggerAppAction);
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const toggleDarkMode = useAppStore((state) => state.toggleDarkMode);

  const [isExpanded, setIsExpanded] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [storagePercent, setStoragePercent] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('sde_auth_v2');
      if (raw) {
        const data = JSON.parse(raw);
        if (data.exp && data.exp > Date.now()) setAuthUser(data);
      }
    } catch { /* skip */ }

    try {
      let total = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        total += key.length + (localStorage.getItem(key) || '').length;
      }
      setStoragePercent(Math.min(100, Math.round((total / (5 * 1024 * 1024)) * 100)));
    } catch { /* skip */ }
  }, []);

  const menuItems = [
    { id: 'workspace', label: 'Bảng làm việc', icon: LayoutDashboard },
    { id: 'excel',     label: 'Dữ liệu Excel',  icon: TableProperties },
    { id: 'export',    label: 'Xuất hồ sơ',     icon: FileDown },
    { id: 'variables', label: 'Thư viện Biến',  icon: FileCode2 },
    { id: 'history',   label: 'Lịch sử xuất',   icon: History },
    { id: 'settings',  label: 'Cài đặt chung',  icon: Settings },
  ];

  const actionItems = [
    { action: 'NEW_PROJECT',  label: 'Dự án Mới',    icon: FolderPlus,     accent: true },
    { action: 'PROCESS',      label: 'Quy trình',    icon: GitMerge,       accent: false },
    { action: 'UPLOAD_WORD',  label: 'Nạp File Mẫu', icon: FileUp,         accent: false },
    { action: 'UPLOAD_EXCEL', label: 'Nạp DL Excel', icon: TableProperties, accent: false },
  ];

  return (
    <div
      className={`absolute left-0 top-0 h-full z-50 bg-[#0A0D14] border-r border-slate-800 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'w-56 shadow-2xl shadow-black/60' : 'w-14'}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Background glow */}
      <div className="absolute top-[-50px] left-[-50px] w-40 h-40 bg-purple-600/20 rounded-full blur-[60px] pointer-events-none" />

      {/* Logo */}
      <div className="px-3 py-3.5 flex items-center gap-3 border-b border-slate-800/50 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
          <Database className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-white font-bold tracking-wide text-base leading-tight whitespace-nowrap">SmartDoc</span>
          <span className="text-[10px] text-indigo-400 font-semibold tracking-widest whitespace-nowrap">PRO v9.0</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-2 px-2 flex flex-col gap-0.5 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {/* Action buttons */}
        {actionItems.map(({ action, label, icon: Icon, accent }) => (
          <button
            key={action}
            onClick={() => triggerAppAction(action)}
            title={!isExpanded ? label : undefined}
            className={`relative flex items-center gap-3 px-2.5 py-2 rounded-xl transition-all duration-200 text-left w-full
              ${accent
                ? 'bg-gradient-to-r from-indigo-500/20 to-purple-600/20 hover:from-indigo-500/40 hover:to-purple-600/40 border border-indigo-500/30 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
          >
            <Icon className={`w-5 h-5 shrink-0 ${accent ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-400'}`} />
            <span className="text-sm font-medium whitespace-nowrap overflow-hidden">{label}</span>
          </button>
        ))}

        <div className="h-px bg-white/[0.04] my-1.5 mx-1" />

        {/* Main menu */}
        {menuItems.map((item) => {
          const isActive = activeMainTab === item.id && item.id !== 'settings' && item.id !== 'history';
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              title={!isExpanded ? item.label : undefined}
              onClick={() => {
                if (item.id === 'settings') triggerAppAction('SETTINGS');
                else if (item.id === 'history') triggerAppAction('HISTORY');
                else setActiveMainTab(item.id);
              }}
              className={`relative flex items-center gap-3 px-2.5 py-2 rounded-xl transition-all duration-200 text-left w-full
                ${isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-indigo-500/10 border border-indigo-500/20 rounded-xl"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 shrink-0 relative z-10 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
              <span className="text-sm font-medium whitespace-nowrap overflow-hidden relative z-10">{item.label}</span>
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full" />
              )}
            </button>
          );
        })}

        <div className="h-px bg-white/[0.04] my-1.5 mx-1" />

        <button
          onClick={() => triggerAppAction('PRINT')}
          title={!isExpanded ? 'Bản in Full' : undefined}
          className="relative flex items-center gap-3 px-2.5 py-2 rounded-xl transition-all duration-200 text-left text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/30 w-full"
        >
          <Printer className="w-5 h-5 shrink-0 text-emerald-500" />
          <span className="text-sm font-medium whitespace-nowrap overflow-hidden">Bản in Full</span>
        </button>
      </div>

      {/* Bottom user area */}
      <div className="px-2 pb-2 pt-3 border-t border-slate-800/50 shrink-0">
        <div className="flex items-center gap-2 px-1">
          {/* Account → mở trung tâm Cài đặt hệ thống */}
          <button
            onClick={() => triggerAppAction('SETTINGS')}
            title="Mở Cài đặt & Tài khoản"
            className="flex items-center gap-3 flex-1 min-w-0 rounded-lg px-1 py-1 hover:bg-slate-800/60 transition-colors text-left"
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center shrink-0 overflow-hidden">
              {authUser?.picture
                ? <img src={authUser.picture} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                : <User className="w-4 h-4 text-white" />
              }
            </div>
            {/* User info */}
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-sm font-semibold text-slate-200 whitespace-nowrap truncate">
                {authUser?.name || 'Chưa đăng nhập'}
              </span>
              <span className={`text-[10px] whitespace-nowrap ${authUser ? 'text-emerald-500' : 'text-slate-500'}`}>
                {authUser ? '● Đã đồng bộ cloud' : '○ Chưa đăng nhập'}
              </span>
            </div>
          </button>
          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors shrink-0"
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Storage bar — only when expanded */}
        {isExpanded && (
          <div className="mt-2 px-1">
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-slate-500 font-medium">LocalStorage</span>
                <span className="text-[10px] text-slate-400">{storagePercent}% / 5MB</span>
              </div>
              <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${storagePercent > 80 ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                  style={{ width: `${storagePercent || 1}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
