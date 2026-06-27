import React from 'react';

export default function ExportReportModal({
  exportReportModal,
  setExportReportModal
}) {
  if (!exportReportModal.show) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#0A0D14]/40 backdrop-blur-xl/90 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg rounded-2xl w-full max-w-md p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-700 flex flex-col max-h-[85vh]">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-emerald-900/50 rounded-full flex items-center justify-center text-3xl mx-auto mb-3 border-4 border-emerald-800 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            ✅
          </div>
          <h3 className="text-lg font-black text-white uppercase tracking-wide">
            Báo Cáo Kết Xuất
          </h3>
          <p className="text-[13px] leading-relaxed text-slate-400 mt-1">
            Hoàn thành tạo file ZIP chứa{" "}
            <strong>{exportReportModal.total}</strong> bộ hồ sơ.
          </p>
        </div>

        {exportReportModal.missingRows.length > 0 ? (
          <div className="flex-1 overflow-y-auto mb-4 border border-amber-900/50 rounded-xl bg-amber-950/20 p-4">
            <h4 className="text-[13px] leading-relaxed font-black text-amber-500 uppercase flex items-center gap-1.5 mb-3">
              <span>⚠️</span> Cảnh báo: Biến trống
            </h4>
            <p className="text-[12px] font-medium tracking-wide font-medium tracking-wide text-amber-200 mb-3">
              Phát hiện {exportReportModal.missingRows.length} dòng dữ liệu
              không điền đủ biến đã Map.
            </p>
            <div className="space-y-2">
              {exportReportModal.missingRows.slice(0, 50).map((r, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center text-[12px] font-medium tracking-wide font-medium tracking-wide bg-[#0A0D14]/40 backdrop-blur-xl border border-amber-900/30 px-3 py-2 rounded"
                >
                  <span className="text-slate-300 font-bold">
                    Dòng {r.row}
                  </span>
                  <span className="text-amber-400">
                    Thiếu {r.missing} giá trị
                  </span>
                </div>
              ))}
              {exportReportModal.missingRows.length > 50 && (
                <div className="text-center text-[12px] font-medium tracking-wide font-medium tracking-wide text-amber-500 pt-2 italic">
                  ... và {exportReportModal.missingRows.length - 50} dòng
                  khác
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-emerald-950/20 border border-emerald-900/50 rounded-xl p-4 flex items-center justify-center mb-4">
            <p className="text-[13px] leading-relaxed font-bold text-emerald-400 text-center">
              🎉 Tuyệt vời! Toàn bộ biến đã được điền đầy đủ dữ liệu.
            </p>
          </div>
        )}

        <button
          onClick={function () {
            setExportReportModal({
              show: false,
              success: 0,
              missingRows: [],
              total: 0,
            });
          }}
          className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-emerald-900/30 transition-all active:scale-95"
        >
          Đóng Báo Cáo
        </button>
      </div>
    </div>
  );
}
