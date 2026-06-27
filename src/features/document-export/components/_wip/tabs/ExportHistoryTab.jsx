import React, { useState, useEffect } from 'react';
import { History, Download, Trash2, Calendar } from 'lucide-react';

const ExportHistoryTab = ({ SDE_UID }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const loadedHistory = [];
    const prefix = `sde_${SDE_UID}_export_history_`;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (Array.isArray(data)) {
            data.forEach(item => {
              loadedHistory.push({...item, key});
            });
          } else if (data && typeof data === 'object') {
            loadedHistory.push({...data, key});
          }
        } catch (e) {
          console.error("Error parsing history for key", key, e);
        }
      }
    }
    
    // Sort by date descending
    loadedHistory.sort((a, b) => {
      return new Date(b.date || 0) - new Date(a.date || 0);
    });
    
    setHistory(loadedHistory);
  };

  const clearHistory = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử xuất?')) {
      const prefix = `sde_${SDE_UID}_export_history_`;
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      setHistory([]);
    }
  };

  return (
    <div className="bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg rounded-xl p-6 min-h-[500px] flex flex-col">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-400" />
          LỊCH SỬ XUẤT FILE
        </h2>
        {history.length > 0 && (
          <button 
            onClick={clearHistory}
            className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 flex items-center gap-2 text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Xóa lịch sử
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12">
            <History className="w-16 h-16 mb-4 opacity-20" />
            <p>Chưa có lịch sử xuất file nào.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => (
              <div key={index} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <Download className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-200 mb-1">{item.projectName || 'Dự án / Tệp xuất'}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {item.date ? new Date(item.date).toLocaleString('vi-VN') : 'Không rõ thời gian'}
                      </span>
                      <span>•</span>
                      <span>Đã xuất: <strong className="text-emerald-400">{item.count || item.totalFiles || 0}</strong> file</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportHistoryTab;
