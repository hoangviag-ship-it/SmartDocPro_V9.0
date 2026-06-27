import React from 'react';

const ExcelAuditModal = ({
  excelAuditModal,
  tag,
  handleConfirmExcelAudit,
  setExcelAuditModal,
  prev
}) => {
  if (!excelAuditModal.show) return null;

  return (
    excelAuditModal.show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0A0D14]/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0A0D14]/90 border border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.2)] rounded-2xl w-full max-w-xl overflow-hidden animate-slide-up">
            <div className="p-6 bg-gradient-to-b from-amber-950/40 to-transparent border-b border-amber-900/30">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30 shrink-0">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-amber-400 uppercase tracking-wide">Phát hiện Biến mới từ Excel</h3>
                  <p className="text-[13px] font-medium tracking-wide text-amber-200/70 mt-1">
                    File nạp chứa <b className="text-white">{excelAuditModal.unknownTags.length}</b> tiêu đề cột chưa có trong thư viện biến.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-[#0A0D14]/40">
              <div className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-4 mb-6">
                <p className="text-[13px] font-medium tracking-wide text-amber-200/90 leading-relaxed mb-3">
                  Hệ thống tìm thấy các cột mới trong file Excel vừa nạp:
                </p>
                <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto custom-scrollbar pr-2">
                  {excelAuditModal.unknownTags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 bg-[#0A0D14]/60 border border-amber-700/50 text-amber-300 rounded text-[11px] font-medium tracking-wide font-black">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleConfirmExcelAudit("KEEP")}
                  className="w-full relative group overflow-hidden rounded-xl p-4 bg-[#0A0D14]/40 border border-slate-700 hover:border-emerald-500/50 transition-all text-left flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-800 group-hover:bg-emerald-500/20 flex items-center justify-center shrink-0 transition-colors">
                    <span className="text-xl">📊</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-200 group-hover:text-emerald-400 transition-colors">Chỉ nạp Data (Không lưu biến)</h4>
                    <p className="text-[12px] font-medium tracking-wide text-slate-500 group-hover:text-emerald-500/70 mt-1">Chỉ sử dụng file Excel này để trộn dữ liệu một lần, không lưu các cột này vào thư viện biến gốc.</p>
                  </div>
                </button>

                <button
                  onClick={() => handleConfirmExcelAudit("IMPORT")}
                  className="w-full relative group overflow-hidden rounded-xl p-4 bg-[#0A0D14]/40 border border-slate-700 hover:border-amber-500/50 transition-all text-left flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-800 group-hover:bg-amber-500/20 flex items-center justify-center shrink-0 transition-colors">
                    <span className="text-xl">📚</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-200 group-hover:text-amber-400 transition-colors">Lưu vào Từ điển Biến</h4>
                    <p className="text-[12px] font-medium tracking-wide text-slate-500 group-hover:text-amber-500/70 mt-1">Cập nhật danh sách các cột này vào thư viện Biến để quản lý tập trung và tái sử dụng cho các Form khác.</p>
                  </div>
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-[#0A0D14] border-t border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  setExcelAuditModal(prev => ({ ...prev, show: false }));
                  const excelInput = document.getElementById("global-excel-upload");
                  if (excelInput && excelInput.value) {
                    excelInput.value = "";
                  }
                }}
                className="px-5 py-2.5 text-[13px] font-medium tracking-wide font-black text-slate-400 hover:text-white transition-colors"
              >
                Hủy bỏ (Không nạp)
              </button>
            </div>
          </div>
        </div>
      )
  );
};

export default ExcelAuditModal;
