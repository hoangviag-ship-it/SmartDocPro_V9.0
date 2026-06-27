import React from "react";

const PreviewModal = ({
  isPreviewModalOpen,
  setIsPreviewModalOpen,
  isRenderingPreview,
  zoomLevel,
  setZoomLevel,
  previewContainerRef,
  previewMode,
  setPreviewMode,
  activeExcelRowIndex,
  excelData,
  activeProjectTemplates,
  setActivePreviewId,
  activePreviewId,
  scrollContainerRef,
  startDrag,
  stopDrag,
  onDrag,
  activePreviewTemplate,
  activeTab,
  setActiveMappingTab,
  setActiveSingleMappingTab
}) => {
  if (!isPreviewModalOpen) return null;
  return (
    <>
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-[120] flex flex-col bg-[#0A0D14]/40 backdrop-blur-xl/95 backdrop-blur-sm animate-fade-in print-modal-container">
          <div className="flex justify-between items-center px-4 py-3 bg-[#0A0D14]/40 backdrop-blur-xl border-b border-slate-700/50 shadow-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] print-hide">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <span className="text-[12px] font-medium tracking-wide font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                <span>🖨️</span> XEM TRƯỚC BẢN IN ({Math.round(zoomLevel * 100)}
                %)
              </span>
              <div className="flex bg-[#0A0D14]/40 backdrop-blur-xl rounded-lg border border-slate-700 overflow-hidden">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.3, z - 0.1))}
                  className="px-3 py-1 hover:bg-white/[0.03] backdrop-blur-md text-slate-300 font-bold text-[13px] leading-relaxed"
                  title="Thu nhỏ"
                >
                  -
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="px-3 py-1 hover:bg-white/[0.03] backdrop-blur-md text-slate-300 font-bold border-x border-slate-700 text-[12px] font-medium tracking-wide font-medium tracking-wide"
                >
                  Mặc định
                </button>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(3, z + 0.1))}
                  className="px-3 py-1 hover:bg-white/[0.03] backdrop-blur-md text-slate-300 font-bold text-[13px] leading-relaxed"
                  title="Phóng to"
                >
                  +
                </button>
              </div>
              <div className="flex bg-[#0A0D14]/40 backdrop-blur-xl p-0.5 rounded-lg border border-slate-700/50 shadow-lg ml-0 sm:ml-2">
                <button
                  onClick={() => setPreviewMode("final")}
                  className={
                    "px-2.5 py-1 rounded-md text-[9px] font-bold transition-all " +
                    (previewMode === "final"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-400")
                  }
                >
                  Bản hoàn thiện
                </button>
                <button
                  onClick={() => setPreviewMode("markup")}
                  className={
                    "px-2.5 py-1 rounded-md text-[9px] font-bold transition-all " +
                    (previewMode === "markup"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-400")
                  }
                >
                  Bản thảo (Thẻ gốc)
                </button>
              </div>
              {activeProjectTemplates.length > 0 && (
                <select
                  value={activePreviewId}
                  onChange={(e) => {
                    setActivePreviewId(e.target.value);
                    setActiveMappingTab(e.target.value);
                    setActiveSingleMappingTab(e.target.value);
                  }}
                  className="bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700 text-[12px] font-medium tracking-wide font-medium tracking-wide text-white px-2 py-1 rounded-lg outline-none font-bold ml-0 sm:ml-2"
                >
                  {activeProjectTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      📄 {t.customName || t.originalName}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex gap-2 print-hide">
              <button
                onClick={function () {
                  window.print();
                }}
                className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-[13px] leading-relaxed font-bold rounded-lg shadow-md transition-all active:scale-95"
              >
                🖨️ In
              </button>
              <button
                onClick={function () {
                  setIsPreviewModalOpen(false);
                }}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-[13px] leading-relaxed font-bold rounded-lg shadow-md transition-all active:scale-95"
              >
                Đóng (Esc)
              </button>
            </div>
          </div>

          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-auto preview-scroll-area relative"
            onMouseDown={startDrag}
            onMouseMove={onDrag}
            onMouseUp={stopDrag}
            onMouseLeave={stopDrag}
          >
            {!activePreviewTemplate && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-[13px] leading-relaxed italic">
                Hãy nạp mẫu văn bản Word để xem trực tiếp tại đây
              </div>
            )}

            {activeTab === "batch" && excelData.length > 0 && (
              <div className="fixed top-20 left-6 z-[130] bg-indigo-900/90 text-indigo-200 text-[12px] font-medium tracking-wide font-medium tracking-wide px-3 py-1.5 rounded-lg font-bold border border-indigo-500/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md pointer-events-none">
                📊 Đấu nối xem trước dòng số: #
                {(activeExcelRowIndex !== null ? activeExcelRowIndex : 0) + 1}
              </div>
            )}

            {isRenderingPreview && (
              <div className="absolute inset-0 bg-[#0A0D14]/40 backdrop-blur-xl/50 backdrop-blur-sm z-20 flex flex-col items-center justify-center pointer-events-none">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <div className="text-[13px] leading-relaxed font-bold text-white shadow-sm bg-indigo-900 px-3 py-1 rounded-full">
                  Đang Render tài liệu...
                </div>
              </div>
            )}

            <div
              className={`text-black transition-transform duration-100 ease-out flex justify-center items-start min-h-full pb-16`}
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: "top center",
              }}
            >
              <div ref={previewContainerRef}></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PreviewModal;
