import React, { useEffect } from 'react';
import MainLayout from './shared/layout/MainLayout';
import AppLegacy from './features/document-export/AppLegacy';
import { useAppStore } from './shared/store/useAppStore';
import SyncProvider from './shared/sync/SyncProvider';

function App() {
  const isDarkMode = useAppStore((state) => state.isDarkMode);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light-theme');
    } else {
      document.documentElement.classList.add('light-theme');
    }
  }, [isDarkMode]);

  return (
    <SyncProvider>
      <MainLayout>
        <div className="h-full w-full relative overflow-hidden">
          <AppLegacy isEmbedded={true} />
        </div>
      </MainLayout>
    </SyncProvider>
  );
}

export default App;
