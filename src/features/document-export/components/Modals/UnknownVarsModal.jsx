import React from "react";

const UnknownVarsModal = ({ unknownTags, onClose, onGoToDictionary }) => {
  if (!unknownTags || unknownTags.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-[#0A0D14] w-full max-w-lg rounded-2xl border border-rose-500/30 shadow-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-rose-500/20 flex items-center justify-between bg-rose-950/20">
          <h3 className="text-rose-400 font-bold text-lg flex items-center gap-2">
            <span>⚠️</span> Phát Hiện Biến Lạ
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          <p className="text-sm text-slate-300 mb-4 leading-relaxed">
            Hệ thống vừa phát hiện <strong className="text-white">{unknownTags.length}</strong> biến chưa từng có trong Thư viện. Bạn có muốn đi tới bảng quản lý Từ điển biến để chuẩn hóa hoặc kiểm tra lại không?
          </p>
          
          <div className="bg-black/40 border border-slate-800 rounded-lg p-3 max-h-48 overflow-y-auto">
            <div className="flex flex-wrap gap-2">
              {unknownTags.map(tag => (
                <span key={tag} className="text-[12px] bg-rose-950/50 text-rose-300 border border-rose-900/50 px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-slate-800/80 bg-black/20 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={() => {
              onGoToDictionary();
              onClose();
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/20 transition-all"
          >
            Đi tới Từ điển biến
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnknownVarsModal;
