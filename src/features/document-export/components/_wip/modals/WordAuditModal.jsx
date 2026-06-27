import React from 'react';

const WordAuditModal = ({
  wordAuditModal,
  standardPrefixes,
  tag,
  handleConfirmAudit
}) => {
  if (!wordAuditModal.show) return null;

  return (
    wordAuditModal.show && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-[#0A0D14]/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0A0D14]/90 border border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.2)] rounded-2xl w-full max-w-xl overflow-hidden animate-slide-up">
            <div className="p-6 bg-gradient-to-b from-amber-950/40 to-transparent border-b border-amber-900/30">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30 shrink-0">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-amber-400 uppercase tracking-wide">Phát hiện Biến mới từ Word</h3>
                  <p className="text-[13px] font-medium tracking-wide text-amber-200/70 mt-1">
                    File upload có <b className="text-white">{wordAuditModal.unknownTags.length}</b> biến không thuộc thư viện{(standardPrefixes && standardPrefixes.length > 0) ? ` hoặc không có tiền tố chuẩn (VD: ${standardPrefixes.map(p => p.prefix).slice(0, 3).join(", ")})` : ""}.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-[#0A0D14]/40">
              <div className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-4 mb-6">
                <p className="text-[13px] font-medium tracking-wide text-amber-200/90 leading-relaxed mb-3">
                  Hệ thống tìm thấy các biến mới trong file Word vừa nạp:
                </p>
                <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto custom-scrollbar pr-2">
                  {wordAuditModal.unknownTags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 bg-[#0A0D14]/60 border border-amber-700/50 text-amber-300 rounded text-[11px] font-bold uppercase tracking-wide">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleConfirmAudit("KEEP")}
                  className="w-full relative group overflow-hidden rounded-xl p-4 bg-[#0A0D14]/40 border border-slate-700 hover:border-emerald-500/50 transition-all text-left flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-800 group-hover:bg-emerald-500/20 flex items-center justify-center shrink-0 transition-colors">
                    <span className="text-xl">💾</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-200 group-hover:text-emerald-400 transition-colors">Chỉ tải tệp (Không nhập biến)</h4>
                    <p className="text-[12px] font-medium tracking-wide text-slate-500 group-hover:text-emerald-500/70 mt-1">Tải file mẫu lên bình thường, không thêm các biến lạ này vào thư viện biến gốc.</p>
                  </div>
                </button>

                <button
                  onClick={() => handleConfirmAudit("IMPORT_AND_EDIT")}
                  className="w-full relative group overflow-hidden rounded-xl p-4 bg-[#0A0D14]/40 border border-slate-700 hover:border-amber-500/50 transition-all text-left flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-800 group-hover:bg-amber-500/20 flex items-center justify-center shrink-0 transition-colors">
                    <span className="text-xl">✨</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-200 group-hover:text-amber-400 transition-colors">Nhập biến &amp; Sửa</h4>
                    <p className="text-[12px] font-medium tracking-wide text-slate-500 group-hover:text-amber-500/70 mt-1">Nhập các biến mới vào thư viện và mở trình chỉnh sửa để chuẩn hóa tên biến.</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="p-4 bg-[#0A0D14] border-t border-slate-800 flex justify-end">
              <button
                onClick={() => handleConfirmAudit("CANCEL")}
                className="px-5 py-2.5 text-[13px] font-black text-slate-400 hover:text-white transition-colors"
              >
                Hủy tải lên
              </button>
            </div>
          </div>
        </div>
      )
  );
};

export default WordAuditModal;
