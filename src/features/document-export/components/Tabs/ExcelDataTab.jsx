import React from "react";

const ExcelDataTab = ({
  excelData,
  uploadedWorkbooks,
  handleRemoveWorkbook,
  selectedSheetKeys,
  setSelectedSheetKeys,
  filteredExcelData,
  excelSearchQuery,
  setExcelSearchQuery,
  hideEmptyColumns,
  setHideEmptyColumns,
  excelRowsPerPage,
  setExcelRowsPerPage,
  excelPage,
  setExcelPage,
  selectedExcelRows,
  setSelectedExcelRows,
  displayExcelColumns,
  excelColFilters,
  setExcelColFilters,
  paginatedExcelData,
  activeExcelRowIndex,
  setActiveExcelRowIndex,
  editingExcelCell,
  setEditingExcelCell,
  handleExcelCellEdit,
  totalExcelPages
}) => {
  return (
    <>
      {excelData.length === 0 && uploadedWorkbooks.length === 0 ? (
        <div className="bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg rounded-2xl p-10 flex flex-col items-center justify-center shadow-xl text-center">
          <div className="text-4xl mb-4 opacity-50">📊</div>
          <h3 className="text-slate-300 font-bold mb-2">Chưa có dữ liệu Excel</h3>
          <p className="text-slate-500 text-[12px] font-medium tracking-wide max-w-sm mb-4">
            Bạn có thể tải lên tệp dữ liệu Excel trực tiếp tại đây để bắt đầu.
          </p>
          <button
            onClick={() => {
              const fileInput = document.getElementById("global-excel-upload");
              if (fileInput) fileInput.click();
            }}
            className="px-5 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 font-bold text-[13px] leading-relaxed rounded-xl transition-all border border-emerald-500/50 mt-2 flex items-center gap-2"
          >
            <span>📁</span> Tải lên File Excel ngay
          </button>
        </div>
      ) : (
        <div className="bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg rounded-2xl p-5 shadow-xl">
          {uploadedWorkbooks.length > 0 && (
            <div className="flex flex-col bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg rounded-xl p-4 max-h-64 overflow-y-auto mb-4 custom-scrollbar">
              <div className="flex justify-between items-center mb-3">
                <label className="text-[12px] font-medium tracking-wide font-black uppercase text-slate-500 tracking-wider block mb-0">
                  QUẢN LÝ NGUỒN DỮ LIỆU ĐA TỆP (MULTI-SHEET):
                </label>
                <button
                  onClick={() => {
                    const fileInput = document.getElementById("global-excel-upload");
                    if (fileInput) fileInput.click();
                  }}
                  className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 font-bold text-[11px] leading-relaxed rounded-lg transition-all border border-emerald-500/50 flex items-center gap-1.5"
                >
                  <span>➕</span> Tải thêm Excel
                </button>
              </div>
              {uploadedWorkbooks.map(function (wb) {
                return (
                  <div
                    key={wb.fileName}
                    className="mb-4 last:mb-0 border-b border-slate-700/50 shadow-lg/50 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[12px] font-medium tracking-wide font-bold text-indigo-400">
                        📄 {wb.fileName}
                      </span>
                      <button
                        onClick={function () {
                          handleRemoveWorkbook(wb.fileName);
                        }}
                        className="text-[9px] text-red-400 hover:text-red-300 hover:bg-red-950/30 px-2 py-1 rounded transition-all"
                      >
                        ✕ Xóa tệp
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {wb.sheetNames.map(function (sName) {
                        var key = wb.fileName + "|||" + sName;
                        var isSel = selectedSheetKeys.indexOf(key) !== -1;
                        return (
                          <button
                            key={key}
                            onClick={function () {
                              setSelectedSheetKeys(function (prev) {
                                if (prev.indexOf(key) !== -1)
                                  return prev.filter(function (k) {
                                    return k !== key;
                                  });
                                return prev.concat(key);
                              });
                            }}
                            className={
                              "px-3 py-1.5 rounded-lg text-[12px] font-medium tracking-wide font-bold border transition-all " +
                              (isSel
                                ? "bg-indigo-900/40 border-indigo-500 text-indigo-300"
                                : "bg-[#0A0D14]/40 backdrop-blur-xl border-slate-700 text-slate-500 hover:text-white hover:border-slate-500")
                            }
                          >
                            {isSel ? "✓ " : ""}
                            {sName}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {excelData.length > 0 && (
            <div className="flex flex-col bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg rounded-xl p-4 mb-4">
              <label className="text-[12px] font-medium tracking-wide font-black uppercase text-slate-500 mb-3 tracking-wider block">
                BẢNG DỮ LIỆU EXCEL ĐÃ NẠP ({filteredExcelData.length} DÒNG):
              </label>
              <div className="flex gap-2 mb-3 items-center justify-between">
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Tìm kiếm nhanh..."
                    value={excelSearchQuery}
                    onChange={(e) => setExcelSearchQuery(e.target.value)}
                    className="w-[200px] h-8 bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg text-slate-300 text-[12px] font-medium tracking-wide rounded-lg px-3 outline-none focus:border-indigo-500"
                  />
                  <label className="flex items-center gap-2 text-slate-400 text-[12px] font-medium tracking-wide font-bold select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hideEmptyColumns}
                      onChange={(e) => setHideEmptyColumns(e.target.checked)}
                      className="accent-indigo-500"
                    />
                    Ẩn các cột trống
                  </label>
                </div>
                <div className="flex items-center gap-2 text-[12px] font-medium tracking-wide text-slate-400 font-bold">
                  Hiển thị:
                  <select
                    className="bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg rounded px-2 py-1 outline-none focus:border-indigo-500"
                    value={excelRowsPerPage}
                    onChange={(e) => {
                      setExcelRowsPerPage(Number(e.target.value));
                      setExcelPage(1);
                    }}
                  >
                    <option value={10}>10 dòng</option>
                    <option value={20}>20 dòng</option>
                    <option value={50}>50 dòng</option>
                    <option value={100}>100 dòng</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto overflow-y-auto max-h-[450px] custom-scrollbar border border-slate-700/50 shadow-lg/50 rounded-lg bg-[#0A0D14]/40 backdrop-blur-xl relative">
                <table className="w-full text-left text-[13px] leading-relaxed whitespace-nowrap border-collapse">
                  <thead className="bg-[#0f172a] sticky top-0 z-20 shadow-md">
                    <tr>
                      <th className="px-3 py-2 border-b border-slate-700 text-slate-400 font-bold w-[40px] text-center bg-[#131c35] sticky left-0 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">
                        <input
                          type="checkbox"
                          checked={
                            selectedExcelRows.length === filteredExcelData.length &&
                            filteredExcelData.length > 0
                          }
                          onChange={(e) => {
                            if (e.target.checked)
                              setSelectedExcelRows(
                                filteredExcelData.map((r) => r.originalIndex)
                              );
                            else setSelectedExcelRows([]);
                          }}
                          className="accent-indigo-500"
                        />
                      </th>
                      <th className="px-3 py-2 border-b border-r border-slate-700 text-slate-400 font-bold w-[50px] text-center bg-[#131c35] sticky left-[40px] z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">
                        STT
                      </th>
                      {displayExcelColumns.map((col) => (
                        <th
                          key={col}
                          className="px-4 py-2 border-b border-slate-700/50 shadow-lg text-slate-400 font-bold bg-[#0f172a] min-w-[120px]"
                        >
                          <div className="flex flex-col gap-1.5">
                            <span>{col}</span>
                            <input
                              type="text"
                              placeholder={`Lọc ${col}...`}
                              value={excelColFilters[col] || ""}
                              onChange={(e) => {
                                setExcelColFilters((prev) => ({
                                  ...prev,
                                  [col]: e.target.value,
                                }));
                                setExcelPage(1);
                              }}
                              className="w-full text-[9px] px-1.5 py-1 font-normal bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700 rounded outline-none focus:border-indigo-500 text-slate-300 placeholder-slate-600"
                            />
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedExcelData.length === 0 ? (
                      <tr>
                        <td
                          colSpan="100%"
                          className="text-center py-4 text-slate-500 italic"
                        >
                          Không có dữ liệu hiển thị
                        </td>
                      </tr>
                    ) : (
                      paginatedExcelData.map((item, idx) => {
                        const isSel =
                          selectedExcelRows.indexOf(item.originalIndex) !== -1;
                        return (
                          <tr
                            key={item.originalIndex}
                            onClick={() =>
                              setActiveExcelRowIndex(item.originalIndex)
                            }
                            className={`border-b border-slate-700/50 shadow-lg/50 hover:bg-white/[0.03] backdrop-blur-md/80 cursor-default transition-colors ${
                              isSel ? "bg-indigo-900/30" : ""
                            } ${
                              activeExcelRowIndex === item.originalIndex
                                ? "ring-1 ring-inset ring-indigo-500"
                                : ""
                            }`}
                          >
                            <td className="px-3 py-2 text-center border-r border-slate-700/50 shadow-lg/50 bg-[#0f172a] sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">
                              <input
                                type="checkbox"
                                checked={isSel}
                                onChange={() => {
                                  setSelectedExcelRows((prev) =>
                                    prev.indexOf(item.originalIndex) !== -1
                                      ? prev.filter((i) => i !== item.originalIndex)
                                      : [...prev, item.originalIndex]
                                  );
                                }}
                                className="accent-indigo-500"
                              />
                            </td>
                            <td className="px-3 py-2 text-center text-slate-500 border-r border-slate-700/50 shadow-lg/50 font-bold bg-[#0f172a] sticky left-[40px] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">
                              {item.originalIndex + 1}
                            </td>
                            {displayExcelColumns.map((col) => {
                              const val = item.row[col];
                              const isEditing =
                                editingExcelCell?.rowIdx === item.originalIndex &&
                                editingExcelCell?.colName === col;
                              return (
                                <td
                                  key={col}
                                  onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    setEditingExcelCell({
                                      rowIdx: item.originalIndex,
                                      colName: col,
                                    });
                                  }}
                                  className="px-4 py-2 text-slate-300 border-r border-slate-700/50 shadow-lg/50 min-w-[120px]"
                                >
                                  {isEditing ? (
                                    <input
                                      autoFocus
                                      defaultValue={String(val || "")}
                                      onBlur={(e) => {
                                        const newVal = e.target.value;
                                        if (newVal !== String(val || "")) {
                                          handleExcelCellEdit(
                                            item.originalIndex,
                                            col,
                                            newVal
                                          );
                                        }
                                        setEditingExcelCell(null);
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.target.blur();
                                        } else if (e.key === "Escape") {
                                          setEditingExcelCell(null);
                                        }
                                      }}
                                      className="w-full bg-[#0A0D14]/40 backdrop-blur-xl text-white text-[12px] font-medium tracking-wide px-1 py-0.5 border border-indigo-500 outline-none rounded"
                                    />
                                  ) : (
                                    <div
                                      className="truncate max-w-[250px] cursor-text"
                                      title={val ? String(val) : ""}
                                    >
                                      {val !== undefined && val !== null
                                        ? String(val)
                                        : ""}
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination control */}
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-700/50 shadow-lg">
                <span className="text-[12px] font-medium tracking-wide text-slate-400 font-bold">
                  📄 Đã chọn:{" "}
                  <span className="text-indigo-400">
                    {selectedExcelRows.length}
                  </span>{" "}
                  / {filteredExcelData.length} | Trang {excelPage} /{" "}
                  {totalExcelPages || 1}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setExcelPage((p) => Math.max(1, p - 1))}
                    disabled={excelPage === 1}
                    className="px-3 py-1.5 bg-white/[0.03] backdrop-blur-md text-slate-300 rounded hover:bg-white/[0.06] backdrop-blur-lg disabled:opacity-30 text-[12px] font-medium tracking-wide font-bold transition-all"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() =>
                      setExcelPage((p) => Math.min(totalExcelPages, p + 1))
                    }
                    disabled={excelPage === totalExcelPages}
                    className="px-3 py-1.5 bg-white/[0.03] backdrop-blur-md text-slate-300 rounded hover:bg-white/[0.06] backdrop-blur-lg disabled:opacity-30 text-[12px] font-medium tracking-wide font-bold transition-all"
                  >
                    Tiếp
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ExcelDataTab;
