import React, { useEffect } from 'react';
import MainLayout from './shared/layout/MainLayout';
import AppLegacy from './features/document-export/AppLegacy';
import { useAppStore } from './shared/store/useAppStore';

function App() {
  const isFullScreen = useAppStore((state) => state.isFullScreen);
  const isDarkMode = useAppStore((state) => state.isDarkMode);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light-theme');
    } else {
      document.documentElement.classList.add('light-theme');
    }
  }, [isDarkMode]);

  return (
    <MainLayout>
      {/* 
        Tạm thời bọc toàn bộ logic cũ (11.000 dòng) vào đây.
        Bên trong AppLegacy, mình sẽ dùng CSS ẩn đi Sidebar cũ để nó hiển thị mượt mà bên trong MainLayout mới.
      */}
      <div className={`${isFullScreen ? "h-[100vh] w-full" : "h-full w-full rounded-2xl overflow-hidden border border-slate-800/50 shadow-2xl"} relative`}>
        <AppLegacy isEmbedded={true} />
      </div>
    </MainLayout>
  );
}

export default App;
