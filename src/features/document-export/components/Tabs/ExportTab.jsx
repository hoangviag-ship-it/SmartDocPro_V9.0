import React from "react";

const ExportTab = ({
  exportMode,
  setExportMode,
  exportSubFolderPattern,
  setExportSubFolderPattern,
  cleanUnusedTags,
  setCleanUnusedTags,
  enableHighlight,
  setEnableHighlight,
  excelData,
  excelColumns,
  activeProjectTemplates,
  selectedTemplateIds,
  exportProjectName,
  selectedExcelRows,
  activeExcelRowIndex,
  setActiveExcelRowIndex,
  handleAutofillFromExcelRow,
  validateAndGenerateDoc,
  validateAndGenerateBatch,
  isProcessing,
  sanitizePath,
  getBoundRow,
}) => {
  return (
    <div className="bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg rounded-2xl p-6 shadow-xl flex flex-col h-full overflow-y-auto custom-scrollbar">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6 shrink-0 border-b border-slate-700/50 pb-4">
        <div>
          <h3 className="text-lg font-black text-indigo-400 flex items-center gap-2 uppercase tracking-wide">
            <span>💾</span> Cài Đặt Xuất Hồ Sơ
          </h3>
          <p className="text-[12px] font-medium tracking-wide text-slate-500 mt-1 font-medium">
            Cấu hình định dạng, thư mục con, xử lý biến trống và xem trước cấu trúc thư mục trước khi xuất.
          </p>
        </div>
      </div>
      
      <div className="flex flex-col gap-6">
        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Định dạng */}
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <span>📦</span> Định dạng xuất
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setExportMode('zip')}
                className={`flex-1 py-2 rounded-lg text-[12px] font-bold transition-all border ${
                  exportMode === 'zip'
                    ? 'bg-indigo-900/50 border-indigo-500/60 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                    : 'bg-slate-800/40 border-slate-700/50 text-slate-500 hover:text-slate-300 hover:border-slate-600'
                }`}
              >
                ZIP
              </button>
              <button
                onClick={() => setExportMode('local')}
                title="Chỉ hỗ trợ Chrome/Edge"
                className={`flex-1 py-2 rounded-lg text-[12px] font-bold transition-all border ${
                  exportMode === 'local'
                    ? 'bg-emerald-900/50 border-emerald-500/60 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                    : 'bg-slate-800/40 border-slate-700/50 text-slate-500 hover:text-slate-300 hover:border-slate-600'
                }`}
              >
                Thư mục
              </button>
            </div>
          </div>

          {/* Thư mục con */}
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <span>📂</span> Tên thư mục con
            </p>
            <input
              type="text"
              value={exportSubFolderPattern}
              onChange={(e) => setExportSubFolderPattern(e.target.value)}
              placeholder="VD: HoSo_{{Mã NV}}"
              className="w-full bg-slate-800/60 border border-slate-700/60 text-slate-300 text-[12px] rounded-lg px-3 py-2 outline-none focus:border-indigo-500/70 font-mono placeholder-slate-600 transition-colors"
            />
            <p className="text-[10px] text-slate-500 mt-1.5 italic">Dùng {'{{Tên_Cột}}'} hoặc {'{index}'}</p>
          </div>

          {/* Biến trống */}
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <span>📝</span> Biến chưa điền
            </p>
            <div className="relative flex bg-slate-800/60 p-1 rounded-lg border border-slate-700/60 h-[38px] items-center select-none">
              <div
                className="absolute top-1 bottom-1 left-1 rounded-md transition-all duration-300 ease-out bg-indigo-600/30 border border-indigo-500/40"
                style={{
                  width: 'calc(50% - 4px)',
                  transform: cleanUnusedTags ? 'translateX(0%)' : 'translateX(100%)',
                }}
              />
              <button
                onClick={() => setCleanUnusedTags(true)}
                title="Xóa trắng biến chưa điền khi xuất"
                className={`relative z-10 flex-1 text-center text-[11px] font-black transition-all h-full flex items-center justify-center ${cleanUnusedTags ? 'text-indigo-300' : 'text-slate-500 hover:text-slate-300'}`}
              >
                🧹 Xóa trắng
              </button>
              <button
                onClick={() => setCleanUnusedTags(false)}
                title="Giữ nguyên {{biến}} để soát lỗi"
                className={`relative z-10 flex-1 text-center text-[11px] font-black transition-all h-full flex items-center justify-center ${!cleanUnusedTags ? 'text-indigo-300' : 'text-slate-500 hover:text-slate-300'}`}
              >
                🔍 Giữ nguyên
              </button>
            </div>
          </div>

          {/* Highlight */}
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 flex flex-col justify-center">
            <label className="flex items-center gap-3 cursor-pointer group select-none">
              <input
                type="checkbox"
                checked={enableHighlight}
                onChange={(e) => setEnableHighlight(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 border-slate-600 focus:ring-indigo-500"
              />
              <span className="text-[12px] font-bold text-slate-400 group-hover:text-slate-300 transition-colors">
                💡 Highlight câu vừa điền
              </span>
            </label>
          </div>
        </div>

        {/* Preview Tree */}
        {excelData.length > 0 && (
          <div className="mt-2">
            {(() => {
              const activeTemplates =
                activeProjectTemplates.filter((t) =>
                  selectedTemplateIds.includes(t.id),
                );

              if (
                selectedExcelRows.length === 0 ||
                activeTemplates.length === 0
              )
                return null;

              const root = exportProjectName?.trim()
                ? sanitizePath(exportProjectName)
                : "";
              const isZip = exportMode === "zip";

              const samples = selectedExcelRows
                .slice(0, 2)
                .map((rowIndex) => {
                  const row = excelData[rowIndex];
                  const rawSubFolder =
                    exportSubFolderPattern.trim() ||
                    "DONG_EXCEL_{index}";
                  const sub = rawSubFolder
                    .replace(
                      /\{\{([^{}]+)\}\}/g,
                      (match, colName) => {
                        const cleanCol = colName.trim();
                        return row[cleanCol] !==
                          undefined &&
                          row[cleanCol] !== null
                          ? String(row[cleanCol])
                          : match;
                      },
                    )
                    .replace(/\{index\}/g, rowIndex + 1);

                  const files = activeTemplates.map((t) => {
                    let fileName =
                      t.customName ||
                      t.originalName.replace(
                        ".docx",
                        "_Xuat",
                      );

                    const boundRow =
                      typeof getBoundRow !== "undefined"
                        ? getBoundRow(t, row)
                        : row;

                    fileName =
                      sanitizePath(
                        fileName
                          .replace(/<<STT>>/g, rowIndex + 1)
                          .replace(
                            /\{\{([^{}]+)\}\}/g,
                            (m, col) => {
                              const cleanCol = col.trim();
                              if (
                                boundRow[cleanCol] !==
                                  undefined &&
                                boundRow[cleanCol] !== null
                              )
                                return String(
                                  boundRow[cleanCol],
                                );
                              return m;
                            },
                          )
                          .trim(),
                      ) + ".docx";
                    return fileName;
                  });

                  return {
                    folder: sanitizePath(sub),
                    files,
                  };
                });

              return (
                <div className="bg-[#0A0D14]/40 backdrop-blur-xl p-3 lg:p-4 rounded-xl border border-slate-700/50 shadow-lg text-[12px] font-medium tracking-wide text-slate-400 font-mono overflow-y-auto max-h-[300px] custom-scrollbar shadow-inner select-none mb-1">
                  <div className="mb-3 font-black text-emerald-400 uppercase tracking-widest text-[12px] font-medium tracking-wide flex justify-between items-center bg-emerald-900/10 p-2 rounded-lg border border-emerald-900/30">
                    <span className="flex items-center gap-1.5">
                      <span className="text-sm">👀</span>{" "}
                      XEM TRƯỚC CẤU TRÚC XUẤT
                    </span>
                    <span className="text-emerald-500/70 lowercase font-medium italic hidden sm:block text-[9px]">
                      (Tối đa 2 dòng dữ liệu)
                    </span>
                  </div>
                  <div className="text-[13px] leading-relaxed ml-1">
                    {isZip && (
                      <div className="text-amber-400 font-bold mb-1.5 shadow-sm inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-900/20 border border-amber-900/30 rounded-md">
                        <span>📦</span> {root || "Archive"}
                        .zip
                      </div>
                    )}
                    {!isZip && root && (
                      <div className="text-indigo-400 font-bold mb-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 bg-indigo-900/20 border border-indigo-900/30 rounded-md">
                        <span>📂</span> {root}
                      </div>
                    )}

                    <div
                      className={
                        isZip || root
                          ? "pl-4 sm:pl-6 border-l-2 border-slate-700/50 shadow-lg/80 ml-2"
                          : ""
                      }
                    >
                      {samples.map((s, i) => (
                        <div
                          key={i}
                          className="mb-3 last:mb-1"
                        >
                          <div className="text-indigo-300 font-bold flex items-center gap-1.5">
                            <span>📁</span> {s.folder}
                          </div>
                          <div className="pl-4 sm:pl-6 border-l-2 border-slate-700/50 shadow-lg/80 ml-2 mt-1.5 flex flex-col gap-1.5">
                            {s.files.map((f, j) => (
                              <div
                                key={j}
                                className="text-slate-300 flex items-center gap-2 group cursor-default"
                              >
                                <span className="opacity-40 text-[12px] font-medium tracking-wide">
                                  📄
                                </span>
                                <span className="group-hover:text-white transition-colors">
                                  {f}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      {selectedExcelRows.length > 2 && (
                        <div className="text-slate-500 italic pl-1.5 mt-2 flex items-center gap-2">
                          <span className="opacity-50">
                            ⋮
                          </span>
                          ... và{" "}
                          {selectedExcelRows.length - 2} thư
                          mục nữa
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="mt-4 pt-6 border-t border-slate-700/50 flex justify-end gap-3 flex-wrap items-center">
          {excelData.length > 0 && (
            <div className="flex items-center gap-3 mr-auto bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2">
              <span className="text-[12px] font-bold text-slate-400">Xuất thử dòng:</span>
              <select
                value={activeExcelRowIndex !== null ? activeExcelRowIndex : ""}
                onChange={(e) => {
                  const idx = e.target.value === "" ? null : Number(e.target.value);
                  setActiveExcelRowIndex(idx);
                  if (idx !== null) handleAutofillFromExcelRow(idx);
                }}
                className="bg-[#0A0D14] border border-slate-700 hover:border-indigo-500 text-[12px] text-indigo-300 font-bold outline-none cursor-pointer rounded-lg px-3 py-1.5 transition-all shadow-sm max-w-[200px] truncate"
              >
                <option value="" className="text-slate-500">-- Mặc định: Dòng 1 --</option>
                {excelData.map((row, index) => (
                  <option key={index} value={index} className="text-slate-200">
                    Dòng {index + 1} {row[excelColumns[0]] ? `(${String(row[excelColumns[0]]).slice(0, 15)})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {excelData.length === 0 ? (
            <button
              onClick={validateAndGenerateDoc}
              disabled={isProcessing || selectedTemplateIds.length === 0}
              className="px-6 py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-[13px] font-black shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isProcessing ? "⏳ Đang kết xuất..." : "🚀 XUẤT 1 BỘ HỒ SƠ (DỮ LIỆU NHẬP TAY)"}
            </button>
          ) : (
            <React.Fragment>
              <button
                onClick={() => { validateAndGenerateBatch(true); }}
                disabled={isProcessing || selectedTemplateIds.length === 0 || selectedExcelRows.length === 0}
                className="px-6 py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-[13px] font-black shadow-md transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? "⏳ Đang kết xuất..." : `🚀 XUẤT 1 BỘ HỒ SƠ (DÒNG ${activeExcelRowIndex !== null ? activeExcelRowIndex + 1 : (selectedExcelRows[0] !== undefined ? selectedExcelRows[0] + 1 : 1)})`}
              </button>
              <button
                onClick={() => validateAndGenerateBatch(false)}
                disabled={isProcessing || selectedTemplateIds.length === 0 || selectedExcelRows.length === 0}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl text-[13px] font-black shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? "⏳ Đang kết xuất hàng loạt..." : exportMode === "local" ? "🚀 BẮT ĐẦU KẾT XUẤT LƯU THƯ MỤC" : "🚀 XUẤT TẤT CẢ RA FILE ZIP"}
              </button>
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportTab;
