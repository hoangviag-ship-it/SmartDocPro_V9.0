import React from 'react';
import MainLayout from './shared/layout/MainLayout';
import AppLegacy from './features/document-export/AppLegacy';
import { useAppStore } from './shared/store/useAppStore';

function App() {
  const isFullScreen = useAppStore((state) => state.isFullScreen);

  return (
    <MainLayout>
      {/* 
        Tạm thời bọc toàn bộ logic cũ (11.000 dòng) vào đây.
        Bên trong AppLegacy, mình sẽ dùng CSS ẩn đi Sidebar cũ để nó hiển thị mượt mà bên trong MainLayout mới.
      */}
      <div className={`${isFullScreen ? "h-[100vh] w-full" : "h-[calc(100vh-80px)] w-full rounded-2xl overflow-hidden border border-slate-800/50 shadow-2xl"} relative`}>
        <AppLegacy isEmbedded={true} />
      </div>
    </MainLayout>
  );
}

export default App;
