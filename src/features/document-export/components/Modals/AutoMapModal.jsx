import React from "react";
import { Wand2, ArrowRight, Hand } from "lucide-react";

// Bảng gợi ý ghép biến tự động khi nạp Excel.
// - proposals: [{ tag, col, score }] biến hệ thống đề xuất ghép với cột Excel.
// - keptManual: [tag] biến người dùng đã nhập tay (sẽ giữ nguyên, không ghi đè).
// Người dùng chọn "Tự động ghép" để áp dụng, hoặc "Để tôi tự map" để tự click tay.
const AutoMapModal = ({ autoMapModal, onApply, onClose }) => {
  if (!autoMapModal || !autoMapModal.show) return null;
  const proposals = autoMapModal.proposals || [];
  const keptManual = autoMapModal.keptManual || [];
  const hasProposals = proposals.length > 0;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#0A0D14]/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0A0D14]/95 border border-slate-700/60 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-700/50">
          <Wand2 size={18} className="text-indigo-400" />
          <h3 className="text-[14px] font-black text-white uppercase tracking-wide">
            Gợi ý ghép biến tự động
          </h3>
        </div>

        {/* Body */}
        <div className="px-5 py-4 overflow-y-auto custom-scrollbar flex-1">
          <p className="text-[13px] text-slate-400 mb-3 leading-relaxed">
            Hệ thống đối soát tên biến với cột Excel vừa nạp và tìm thấy{" "}
            <b className="text-indigo-300">{proposals.length}</b> biến có thể ghép
            tự động. Bạn muốn ghép tự động hay tự chọn cột bằng tay?
          </p>

          {hasProposals && (
            <div className="rounded-xl border border-slate-700/50 overflow-hidden mb-3">
              <div className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 px-3 py-2 bg-slate-800/40 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <span>Biến</span>
                <span></span>
                <span>Cột Excel</span>
                <span className="text-right">Khớp</span>
              </div>
              <div className="max-h-[40vh] overflow-y-auto custom-scrollbar divide-y divide-slate-800/60">
                {proposals.map((p) => (
                  <div
                    key={p.tag}
                    className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 px-3 py-2 items-center text-[12px]"
                  >
                    <span className="font-mono text-amber-300 truncate" title={p.tag}>
                      {p.tag}
                    </span>
                    <ArrowRight size={13} className="text-slate-600" />
                    <span className="text-slate-200 truncate" title={p.col}>
                      {p.col}
                    </span>
                    <span
                      className={`text-right font-bold ${
                        p.score >= 0.85
                          ? "text-emerald-400"
                          : p.score >= 0.65
                          ? "text-indigo-300"
                          : "text-amber-400"
                      }`}
                    >
                      {Math.round((p.score || 0) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {keptManual.length > 0 && (
            <div className="rounded-lg border border-amber-900/40 bg-amber-950/20 px-3 py-2.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wide mb-1">
                <Hand size={12} /> Giữ nguyên {keptManual.length} biến nhập tay
              </div>
              <p className="text-[12px] text-amber-200/80 leading-relaxed">
                {keptManual.join(", ")} — những biến này bạn đã tự gõ giá trị nên
                sẽ KHÔNG bị ghi đè. Muốn dùng dữ liệu Excel, hãy tự chọn cột ở ô
                tương ứng.
              </p>
            </div>
          )}

          {!hasProposals && keptManual.length === 0 && (
            <p className="text-[13px] text-slate-500">
              Không có biến nào cần ghép tự động.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-slate-700/50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 text-[13px] font-bold rounded-xl transition-all flex items-center gap-1.5"
          >
            <Hand size={14} /> Để tôi tự map
          </button>
          {hasProposals && (
            <button
              onClick={onApply}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-bold rounded-xl transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Wand2 size={14} /> Tự động ghép ({proposals.length})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutoMapModal;
