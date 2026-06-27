import { create } from 'zustand';

export const useAppStore = create((set) => ({
  // Core UI States
  activeMainTab: 'workspace', // workspace, templates, variables, settings
  setActiveMainTab: (tab) => set({ activeMainTab: tab }),

  // Data States
  excelData: [],
  setExcelData: (data) => set({ excelData: data }),
  
  excelHeaders: [],
  setExcelHeaders: (headers) => set({ excelHeaders: headers }),

  selectedExcelRows: [],
  setSelectedExcelRows: (rows) => set({ selectedExcelRows: rows }),

  // Templates
  activeProjectTemplates: [],
  setActiveProjectTemplates: (templates) => set({ activeProjectTemplates: templates }),

  // Export Configuration States
  exportProjectName: '',
  setExportProjectName: (name) => set({ exportProjectName: name }),

  exportSubFolderPattern: 'DONG_EXCEL_{index}',
  setExportSubFolderPattern: (pattern) => set({ exportSubFolderPattern: pattern }),

  exportMode: 'zip', // 'zip' | 'local'
  setExportMode: (mode) => set({ exportMode: mode }),


  enableHighlight: true,
  setEnableHighlight: (enable) => set({ enableHighlight: enable }),

  cleanUnusedTags: true,
  setCleanUnusedTags: (clean) => set({ cleanUnusedTags: clean }),

  // Global Dictionary
  globalDictionary: {},
  setGlobalDictionary: (dict) => set({ globalDictionary: dict }),

  // Layout Options
  isFullScreen: typeof localStorage !== 'undefined' ? (localStorage.getItem('sde_layout_fullscreen') === 'true') : false,
  setIsFullScreen: (val) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('sde_layout_fullscreen', val);
    }
    set({ isFullScreen: val });
  },
  screenResolution: typeof localStorage !== 'undefined' ? (localStorage.getItem('sde_layout_resolution') || '1080p') : '1080p',
  setScreenResolution: (val) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('sde_layout_resolution', val);
    }
    set({ screenResolution: val });
  },

  // Sidebar
  isSidebarOpen: typeof localStorage !== 'undefined' ? (localStorage.getItem('sde_sidebar_open') !== 'false') : true,
  toggleSidebar: () => set((state) => {
    const next = !state.isSidebarOpen;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('sde_sidebar_open', String(next));
    }
    return { isSidebarOpen: next };
  }),

  // Dark Mode
  isDarkMode: typeof localStorage !== 'undefined' ? (localStorage.getItem('sde_dark_mode') !== 'false') : true,
  toggleDarkMode: () => set((state) => {
    const next = !state.isDarkMode;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('sde_dark_mode', String(next));
    }
    return { isDarkMode: next };
  }),

  // Global Action Triggers
  appActionTrigger: null,
  triggerAppAction: (action) => set({ appActionTrigger: { action, timestamp: Date.now() } }),
}));
