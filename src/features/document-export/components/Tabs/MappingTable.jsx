import React, { useMemo } from "react";
import { calculateVietnameseMatchScore } from "../../utils/helpers";
// Import any needed icons or helpers if necessary

const MappingTable = ({
  batchTagFilterMode, setBatchTagFilterMode,
  viewStageFilter, setViewStageFilter,
  projectStages, currentProjectId,
  activeMappingTab, setActiveMappingTab,
  setActivePreviewId, visibleProjectTemplates,
  setConfirmModal, setColumnMapping, showToast,
  handleAutoMap, selectedProfileName, handleProfileSelect,
  savedProfiles, handleSaveProfile,
  mappingSearchQuery, setMappingSearchQuery,
  tags, columnMapping, excelColumns, excelData,
  activeExcelRowIndex, selectedExcelRows,
  activeProjectTemplates, getBoundRow, safeGetExcelValue,
  tagsToDisplayInMapping, globalDictionary, getBaseTag,
  handleCopyTag, focusedTag, setFocusedTag,
  copiedTag, excelColumnsGrouped
}) => {
  return (
    <>
    <div className="w-full space-y-6">
    
                                <div className="bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg rounded-2xl p-5 shadow-xl">
                                <div className="flex items-center gap-3 mb-4 relative z-20 overflow-x-auto pb-2 scrollbar-hide">
                                  {/* Filter Toggle */}
                                  <div className="flex items-center border border-transparent hover:bg-white/[0.02] rounded-lg transition-colors duration-200 overflow-hidden bg-[#0A0D14]/40 backdrop-blur-xl shrink-0 shadow-sm h-[32px]">
                                    <button
                                      onClick={() => setBatchTagFilterMode("all")}
                                      className={`px-3 py-0 h-full text-[12px] font-medium tracking-wide font-bold transition-all ${batchTagFilterMode === "all" ? "bg-white/[0.06] backdrop-blur-lg text-white" : "text-slate-400 hover:bg-white/[0.03] backdrop-blur-md"}`}
                                    >
                                      Tất cả
                                    </button>
                                    <div className="w-px bg-white/[0.06] backdrop-blur-lg self-stretch"></div>
                                    <button
                                      onClick={() =>
                                        setBatchTagFilterMode("filled")
                                      }
                                      className={`px-3 py-0 h-full text-[12px] font-medium tracking-wide font-bold transition-all ${batchTagFilterMode === "filled" ? "bg-emerald-900/50 text-emerald-400" : "text-slate-400 hover:bg-white/[0.03] backdrop-blur-md"}`}
                                    >
                                      Đã map
                                    </button>
                                    <div className="w-px bg-white/[0.06] backdrop-blur-lg self-stretch"></div>
                                    <button
                                      onClick={() => setBatchTagFilterMode("empty")}
                                      className={`px-3 py-0 h-full text-[12px] font-medium tracking-wide font-bold transition-all ${batchTagFilterMode === "empty" ? "bg-amber-900/50 text-amber-400" : "text-slate-400 hover:bg-white/[0.03] backdrop-blur-md"}`}
                                    >
                                      Còn trống
                                    </button>
                                    <div className="w-px bg-white/[0.06] backdrop-blur-lg self-stretch"></div>
                                    <button
                                      onClick={() => setBatchTagFilterMode("error")}
                                      className={`px-3 py-0 h-full text-[12px] font-medium tracking-wide font-bold transition-all ${batchTagFilterMode === "error" ? "bg-red-900/50 text-red-400" : "text-slate-400 hover:bg-white/[0.03] backdrop-blur-md"}`}
                                    >
                                      Lỗi cột
                                    </button>
                                  </div>
    
                                  {/* Stage Filter */}
                                  <div className="relative shrink-0 h-[32px]">
                                    <select
                                      value={viewStageFilter}
                                      onChange={(e) =>
                                        setViewStageFilter(e.target.value)
                                      }
                                      className="h-full bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700 text-[12px] font-medium tracking-wide text-slate-300 hover:text-white pl-3 pr-8 rounded-xl outline-none font-bold focus:border-indigo-500 transition-all appearance-none shadow-sm cursor-pointer"
                                    >
                                      <option value="Tất cả">🌐 GĐ: Tất cả</option>
                                      {(projectStages[currentProjectId] || []).map(
                                        (st) => (
                                          <option key={st.name} value={st.name}>
                                            📁 {st.name}
                                          </option>
                                        ),
                                      )}
                                      <option value="Chưa phân loại">
                                        📁 Chưa PL
                                      </option>
                                    </select>
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-medium tracking-wide font-medium tracking-wide text-slate-500 pointer-events-none">
                                      ▼
                                    </span>
                                  </div>
    
                                  {/* Template Filter (Moved here) */}
                                  <div className="relative shrink-0 h-[32px]">
                                    <select
                                      value={activeMappingTab}
                                      onChange={function (e) {
                                        var val = e.target.value;
                                        setActiveMappingTab(val);
                                        if (val !== "all") setActivePreviewId(val);
                                      }}
                                      className="h-full bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700 text-[12px] font-medium tracking-wide text-slate-300 hover:text-white pl-3 pr-8 rounded-xl outline-none font-bold focus:border-indigo-500 transition-all appearance-none shadow-sm cursor-pointer"
                                    >
                                      <option value="all">
                                        🌐 Tất cả mẫu (
                                        {visibleProjectTemplates.length})
                                      </option>
                                      {visibleProjectTemplates.map(
                                        function (t, idx) {
                                          return (
                                            <option key={t.id} value={t.id}>
                                              📄 {idx + 1}.{" "}
                                              {t.customName || t.originalName}
                                            </option>
                                          );
                                        },
                                      )}
                                    </select>
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-medium tracking-wide font-medium tracking-wide text-slate-500 pointer-events-none">
                                      ▼
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-start gap-3 relative z-20 overflow-x-auto pb-2 scrollbar-hide">
    
                                  {/* Actions */}
                                  <div className="flex items-center gap-2 shrink-0">
                                    <button
                                      onClick={() => {
                                        const fileInput = document.getElementById("global-excel-upload");
                                        if (fileInput) fileInput.click();
                                      }}
                                      className="px-3 h-[32px] bg-[#0A0D14]/40 backdrop-blur-xl hover:bg-emerald-900 text-slate-300 hover:text-emerald-400 text-[12px] font-medium tracking-wide font-bold rounded-xl border border-slate-700 hover:border-emerald-800 transition-all flex items-center gap-1.5 shadow-sm"
                                      title="Tải lên dữ liệu nguồn (Excel)"
                                    >
                                      📊 Nguồn Excel
                                    </button>
                                    <button
                                      onClick={() => {
                                        setConfirmModal({
                                          show: true,
                                          title: "Xóa cấu hình Map",
                                          desc: "Xóa sạch toàn bộ cấu hình map hiện tại?",
                                          btnConfirm: "Xóa ngay",
                                          action: () => {
                                            setColumnMapping({});
                                            showToast("Đã làm sạch bảng Mapping!");
                                            setConfirmModal({
                                              show: false,
                                              action: null,
                                              title: "",
                                              desc: "",
                                            });
                                          },
                                        });
                                      }}
                                      className="px-3 h-[32px] bg-[#0A0D14]/40 backdrop-blur-xl hover:bg-red-900 text-slate-300 hover:text-white text-[12px] font-medium tracking-wide font-bold rounded-xl border border-slate-700 hover:border-red-800 transition-all flex items-center gap-1.5 shadow-sm"
                                    >
                                      🧹 Xóa map
                                    </button>
                                    <button
                                      onClick={handleAutoMap}
                                      className="px-3 h-[32px] bg-[#0A0D14]/40 backdrop-blur-xl hover:bg-purple-900 text-slate-300 hover:text-white text-[12px] font-medium tracking-wide font-bold rounded-xl border border-slate-700 hover:border-purple-800 transition-all flex items-center gap-1.5 shadow-sm"
                                    >
                                      ✨ Map tự động
                                    </button>
    
                                    {/* Profiles */}
                                    <div className="flex relative items-stretch group shadow-sm rounded-xl h-[32px]">
                                      <select
                                        value={selectedProfileName}
                                        onChange={handleProfileSelect}
                                        className="bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700 text-[12px] font-medium tracking-wide text-slate-300 hover:text-white px-3 py-0 rounded-l-xl outline-none font-bold cursor-pointer appearance-none pl-3 pr-8 min-w-[120px]"
                                      >
                                        <option value="">💾 Hồ sơ Map...</option>
                                        {Object.keys(savedProfiles).map(
                                          function (pName) {
                                            return (
                                              <option key={pName} value={pName}>
                                                {pName}
                                              </option>
                                            );
                                          },
                                        )}
                                      </select>
                                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] text-slate-500 pointer-events-none">
                                        ▼
                                      </span>
                                      {selectedProfileName ? (
                                        <button
                                          onClick={handleSaveProfile}
                                          className="px-3 py-0 h-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] backdrop-blur-sm border border-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.2)] text-white text-[12px] font-medium tracking-wide font-bold rounded-r-xl border-y border-r border-indigo-600 shadow-md transition-all shrink-0"
                                        >
                                          Lưu đè
                                        </button>
                                      ) : (
                                        <button
                                          onClick={handleSaveProfile}
                                          className="px-3 py-0 h-full bg-white/[0.03] backdrop-blur-md hover:bg-white/[0.06] backdrop-blur-lg text-slate-300 text-[12px] font-medium tracking-wide font-bold rounded-r-xl border-y border-r border-slate-700 transition-all shrink-0"
                                        >
                                          Tạo mới
                                        </button>
                                      )}
                                    </div>
    
                                    {/* Search input inline */}
                                    <div className="flex items-center gap-2 bg-[#0A0D14]/40 backdrop-blur-xl border border-transparent hover:bg-white/[0.02] rounded-lg transition-colors duration-200 px-3 h-[32px] w-48 relative transition-all focus-within:border-indigo-500 focus-within:w-64 shadow-sm">
                                      <span className="text-slate-500 text-[12px] font-medium tracking-wide font-medium tracking-wide">
                                        🔍
                                      </span>
                                      <input
                                        type="text"
                                        placeholder="Tìm biến..."
                                        value={mappingSearchQuery}
                                        onChange={function (e) {
                                          setMappingSearchQuery(e.target.value);
                                        }}
                                        className="flex-1 bg-transparent text-[12px] font-medium tracking-wide text-white focus:outline-none placeholder-slate-600 min-w-0"
                                      />
                                      {mappingSearchQuery && (
                                        <button
                                          onClick={function () {
                                            setMappingSearchQuery("");
                                          }}
                                          className="text-slate-500 hover:text-white text-[12px] font-medium tracking-wide font-medium tracking-wide"
                                        >
                                          ✕
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
    
                                <div className="flex items-center gap-4 mb-3 px-2">
                                  {(() => {
                                    let fCount = 0,
                                      eCount = 0,
                                      mCount = 0,
                                      tCount = tags.length;
                                    tags.forEach((tag) => {
                                      var mapping = columnMapping[tag] || {
                                        type: "excel",
                                        value: "",
                                      };
                                      var isMapped =
                                        (mapping.type === "excel" &&
                                          mapping.value !== "") ||
                                        (mapping.type === "manual" &&
                                          mapping.value !== "");
                                      var isError =
                                        mapping.type === "excel" &&
                                        mapping.value &&
                                        excelColumns.indexOf(mapping.value) === -1;
                                      if (isError) eCount++;
                                      else if (isMapped) fCount++;
                                      else mCount++;
                                    });
                                    return (
                                      <React.Fragment>
                                        <div className="flex items-center gap-1.5 text-[12px] font-medium tracking-wide font-bold text-slate-400">
                                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>{" "}
                                          Đã map:{" "}
                                          <span className="text-white ml-0.5">
                                            {fCount}/{tCount}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[12px] font-medium tracking-wide font-bold text-slate-400">
                                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>{" "}
                                          Còn trống:{" "}
                                          <span className="text-white ml-0.5">
                                            {mCount}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[12px] font-medium tracking-wide font-bold text-slate-400">
                                          <span className="w-2 h-2 rounded-full bg-red-500"></span>{" "}
                                          Lỗi cột:{" "}
                                          <span className="text-white ml-0.5">
                                            {eCount}
                                          </span>
                                        </div>
                                      </React.Fragment>
                                    );
                                  })()}
                                </div>
    
                                {/* The Table View */}
                                <div className="flex flex-col border border-slate-700/50 shadow-lg rounded-xl overflow-hidden bg-[#0A0D14]/40 backdrop-blur-xl shadow-xl max-h-[600px] font-sans">
                                  <div className="flex items-center px-4 py-3 border-b border-slate-700/50 shadow-lg bg-[#0A0D14]/40 backdrop-blur-xl/80 text-[12px] font-medium tracking-wide font-medium tracking-wide font-black text-slate-500 uppercase tracking-widest sticky top-0 z-10 w-full min-w-[760px]">
                                    <div className="w-[15%] shrink-0 pr-2">
                                      Tên biến
                                    </div>
                                    <div className="w-[11%] shrink-0 pr-2">
                                      Trạng thái
                                    </div>
                                    <div className="flex-1 shrink-0 gap-2">
                                      Gán dữ liệu
                                    </div>
                                  </div>
    
                                  <div className="overflow-x-auto min-h-[150px]">
                                    <div className="min-w-[760px] flex flex-col p-2 space-y-1.5">
                                      {tagsToDisplayInMapping.length === 0 ? (
                                        <div className="text-center py-8 text-[12px] font-medium tracking-wide text-slate-500 italic">
                                          Không tìm thấy thẻ nào phù hợp.
                                        </div>
                                      ) : (
                                        (() => {
                                          const groups = {};
                                          tagsToDisplayInMapping.forEach((tag) => {
                                            const parts = tag.split("_");
                                            const prefix =
                                              parts.length > 1 ? parts[0] : "KHÁC";
                                            if (!groups[prefix])
                                              groups[prefix] = [];
                                            groups[prefix].push(tag);
                                          });
    
                                          const mergedGroups = {};
                                          mergedGroups["KHÁC"] =
                                            groups["KHÁC"] || [];
                                          Object.keys(groups).forEach((k) => {
                                            if (k === "KHÁC") return;
                                            if (groups[k].length === 1)
                                              mergedGroups["KHÁC"].push(
                                                groups[k][0],
                                              );
                                            else mergedGroups[k] = groups[k];
                                          });
                                          if (mergedGroups["KHÁC"].length === 0)
                                            delete mergedGroups["KHÁC"];
    
                                          return Object.keys(mergedGroups).map(
                                            (groupKey) => (
                                              <div
                                                key={groupKey}
                                                className="flex flex-col mb-4 bg-transparent rounded-xl border border-slate-700/50 shadow-lg/60 overflow-hidden"
                                              >
                                                <div className="flex items-center gap-3 px-3 py-2 bg-[#0A0D14]/40 backdrop-blur-xl/50 border-b border-slate-700/50 shadow-lg/80">
                                                  <span className="text-[12px] font-medium tracking-wide uppercase font-black text-slate-300 tracking-wider">
                                                    {groupKey === "KHÁC"
                                                      ? "THẺ LẺ (KHÔNG PHÂN NHÓM)"
                                                      : "NHÓM: " + groupKey}
                                                  </span>
                                                  <div className="h-px bg-white/[0.03] backdrop-blur-md/90 flex-1" />
                                                  <span className="text-[12px] font-medium tracking-wide font-medium tracking-wide text-slate-500 font-medium bg-[#0A0D14]/40 backdrop-blur-xl px-2 py-0.5 rounded-full border border-slate-700/50 shadow-lg">
                                                    {mergedGroups[groupKey].length}{" "}
                                                    thẻ
                                                  </span>
                                                </div>
                                                <div className="flex flex-col p-1.5 space-y-1.5">
                                                  {mergedGroups[groupKey].map(
                                                    function (tag) {
                                                      var mapping = columnMapping[
                                                        tag
                                                      ] || {
                                                        type: "excel",
                                                        value: "",
                                                      };
                                                      var isMapped =
                                                        (mapping.type === "excel" &&
                                                          mapping.value !== "") ||
                                                        (mapping.type ===
                                                          "manual" &&
                                                          mapping.value !== "");
                                                      var isError =
                                                        mapping.type === "excel" &&
                                                        mapping.value &&
                                                        excelColumns.indexOf(
                                                          mapping.value,
                                                        ) === -1;
                                                      var isTable =
                                                        tag
                                                          .toLowerCase()
                                                          .endsWith("_table") ||
                                                        tag
                                                          .toLowerCase()
                                                          .endsWith(
                                                            "_table_striped",
                                                          ) ||
                                                        globalDictionary?.[tag]
                                                          ?.type === "table" ||
                                                        globalDictionary?.[
                                                          getBaseTag(tag)
                                                        ]?.type === "table";
    
                                                      var previewValue = "";
                                                      if (
                                                        mapping.type === "excel" &&
                                                        mapping.value &&
                                                        excelData &&
                                                        excelData.length > 0
                                                      ) {
                                                        var rowIndex =
                                                          activeExcelRowIndex !==
                                                          null
                                                            ? activeExcelRowIndex
                                                            : selectedExcelRows.length >
                                                                0
                                                              ? selectedExcelRows[0]
                                                              : 0;
                                                        var templateForTag = null;
                                                        if (
                                                          activeMappingTab !== "all"
                                                        ) {
                                                          templateForTag =
                                                            activeProjectTemplates.find(
                                                              (t) =>
                                                                t.id ===
                                                                activeMappingTab,
                                                            );
                                                        } else {
                                                          templateForTag =
                                                            activeProjectTemplates.find(
                                                              function (t) {
                                                                return (
                                                                  t.tags &&
                                                                  t.tags.indexOf(
                                                                    tag,
                                                                  ) !== -1 &&
                                                                  t.bindSheetKey
                                                                );
                                                              },
                                                            );
                                                        }
                                                        var boundRow =
                                                          templateForTag
                                                            ? getBoundRow(
                                                                templateForTag,
                                                                excelData[rowIndex],
                                                                true,
                                                              )
                                                            : excelData[rowIndex];
                                                        previewValue =
                                                          safeGetExcelValue(
                                                            mapping.value,
                                                            excelData[rowIndex],
                                                            boundRow,
                                                          );
                                                      } else if (
                                                        mapping.type === "manual"
                                                      ) {
                                                        previewValue =
                                                          mapping.value || "";
                                                      }
    
                                                      return (
                                                        <div
                                                           key={tag}
                                                           className={`group flex flex-col gap-2.5 px-3 py-2.5 rounded-lg border-l-[3px] border-y border-r border-y-slate-800/60 border-r-slate-800/60 bg-[#0A0D14]/40 backdrop-blur-xl/40 hover:bg-[#0A0D14]/40 backdrop-blur-xl transition-all ${isError ? "border-l-red-500" : isMapped ? "border-l-emerald-500" : "border-l-amber-500"}`}
                                                         >
                                                           {/* 1. TÊN BIẾN */}
                                                           <div className="flex flex-col justify-center w-full relative"> 
                                                            <div className="flex items-center">
                                                              <span
                                                                className={`text-[13px] font-bold ${!isMapped ? "text-amber-500" : "text-slate-200"} whitespace-normal break-words font-mono`}
                                                                title={tag}
                                                              >
                                                                {tag}
                                                              </span>
                                                              <button
                                                                onClick={function (
                                                                  e,
                                                                ) {
                                                                  e.stopPropagation();
                                                                  handleCopyTag(
                                                                    tag,
                                                                  );
                                                                }}
                                                                title={
                                                                  "Copy {{" +
                                                                  tag +
                                                                  "}}"
                                                                }
                                                                className={
                                                                  "ml-2 shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold transition-all " +
                                                                  (copiedTag === tag
                                                                    ? "bg-emerald-700 text-emerald-100"
                                                                    : "bg-white/[0.03] backdrop-blur-md text-slate-500 opacity-0 group-hover:opacity-100 hover:bg-white/[0.06] backdrop-blur-lg hover:text-slate-300")
                                                                }
                                                              >
                                                                {copiedTag === tag
                                                                  ? "✓"
                                                                  : "⎘"}
                                                              </button>
                                                            </div>
                                                            {globalDictionary?.[tag]
                                                              ?.description && (
                                                              <span
                                                                className="text-[10px] text-slate-400 whitespace-normal break-words block mt-0.5"
                                                                title={
                                                                  globalDictionary[
                                                                    tag
                                                                  ].description
                                                                }
                                                              >
                                                                {
                                                                  globalDictionary[
                                                                    tag
                                                                  ].description
                                                                }
                                                              </span>
                                                            )}
                                                            {isTable && (
                                                              <span className="mt-1 text-[8px] font-black px-1.5 py-0.5 bg-indigo-900/50 text-indigo-400 rounded-full border border-indigo-800 whitespace-nowrap shrink-0 w-max">
                                                                BẢNG
                                                              </span>
                                                            )}
                                                          </div>
    
                                                          {/* HÀNG 2 */}
                                                          <div className="flex items-center w-full gap-3">
                                                          {/* 2. TRẠNG THÁI */}
                                                          <div className="w-[100px] flex items-center shrink-0">
                                                            {isError ? (
                                                              <span className="flex items-center gap-1.5 text-[12px] font-medium tracking-wide font-medium tracking-wide font-bold text-red-500 bg-red-950/30 px-2 py-0.5 rounded-full border border-red-900/50 truncate">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>{" "}
                                                                <span className="truncate">
                                                                  Lỗi cột
                                                                </span>
                                                              </span>
                                                            ) : isMapped ? (
                                                              <span className="flex items-center gap-1.5 text-[12px] font-medium tracking-wide font-medium tracking-wide font-bold text-emerald-500 bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-900/50 truncate">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>{" "}
                                                                <span className="truncate">
                                                                  Đã map
                                                                </span>
                                                              </span>
                                                            ) : (
                                                              <span className="flex items-center gap-1.5 text-[12px] font-medium tracking-wide font-medium tracking-wide font-bold text-amber-500 bg-amber-950/30 px-2 py-0.5 rounded-full border border-amber-900/50 truncate">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>{" "}
                                                                <span className="truncate">
                                                                  Còn trống
                                                                </span>
                                                              </span>
                                                            )}
                                                          </div>
    
                                                          {/* 3. GÁN DỮ LIỆU */}
                                                          <div className="flex-1 flex items-center gap-2 shrink-0">
                                                            <div className="flex border border-slate-700 rounded-lg overflow-hidden shrink-0 h-[32px]">
                                                              {excelData.length > 0 && (
                                                              <button
                                                                onClick={() =>
                                                                  setColumnMapping(
                                                                    (prev) => ({
                                                                      ...prev,
                                                                      [tag]: {
                                                                        type: "excel",
                                                                        value:
                                                                          prev[tag]
                                                                            ?.value ||
                                                                          "",
                                                                      },
                                                                    }),
                                                                  )
                                                                }
                                                                className={`px-3 text-[12px] font-medium tracking-wide font-medium tracking-wide font-bold transition-all ${mapping.type === "excel" ? "bg-white/[0.06] backdrop-blur-lg text-white" : "bg-[#0A0D14]/40 backdrop-blur-xl text-slate-400 hover:bg-white/[0.03] backdrop-blur-md"}`}
                                                              >
                                                                Cột Excel
                                                              </button>
                                                              )}
                                                              <button
                                                                onClick={() =>
                                                                  setColumnMapping(
                                                                    (prev) => ({
                                                                      ...prev,
                                                                      [tag]: {
                                                                        type: "manual",
                                                                        value:
                                                                          prev[tag]
                                                                            ?.value ||
                                                                          "",
                                                                      },
                                                                    }),
                                                                  )
                                                                }
                                                                className={`px-3 text-[12px] font-medium tracking-wide font-medium tracking-wide font-bold transition-all ${excelData.length === 0 ? "bg-indigo-600/80 text-white" : (mapping.type === "manual" ? "bg-white/[0.06] backdrop-blur-lg text-white" : "bg-[#0A0D14]/40 backdrop-blur-xl text-slate-400 hover:bg-white/[0.03] backdrop-blur-md")}`}
                                                              >
                                                                Nhập tay
                                                              </button>
                                                            </div>
    
                                                            <div className="flex-1 min-w-0 relative">
                                                              {mapping.type ===
                                                              "excel" ? (
                                                                <React.Fragment>
                                                                  <div className="relative">
                                                                    <select
                                                                      value={
                                                                        mapping.value ||
                                                                        ""
                                                                      }
                                                                      onFocus={function () {
                                                                        setFocusedTag(
                                                                          tag,
                                                                        );
                                                                      }}
                                                                      onBlur={function () {
                                                                        setFocusedTag(
                                                                          null,
                                                                        );
                                                                      }}
                                                                      onChange={function (
                                                                        e,
                                                                      ) {
                                                                        var val =
                                                                          e.target
                                                                            .value;
                                                                        setColumnMapping(
                                                                          function (
                                                                            prev,
                                                                          ) {
                                                                            return Object.assign(
                                                                              {},
                                                                              prev,
                                                                              {
                                                                                [tag]:
                                                                                  {
                                                                                    type: "excel",
                                                                                    value:
                                                                                      val,
                                                                                  },
                                                                              },
                                                                            );
                                                                          },
                                                                        );
                                                                      }}
                                                                      className={`w-full bg-transparent border rounded-lg pl-2 pr-6 h-[32px] text-[12px] font-medium tracking-wide font-bold focus:outline-none appearance-none ${isError ? "border-red-800 text-red-500 bg-red-950/20 hover:border-red-600" : "border-slate-700 text-indigo-300 hover:border-slate-500 focus:border-indigo-500 bg-[#0A0D14]/40 backdrop-blur-xl"}`}
                                                                    >
                                                                      <option
                                                                        value=""
                                                                        className="text-slate-500 font-normal"
                                                                      >
                                                                        -- Chọn{" "}
                                                                        {isTable
                                                                          ? "dl bảng"
                                                                          : "cột Excel"}{" "}
                                                                        --
                                                                      </option>
                                                                      {isError && (
                                                                        <option
                                                                          value={
                                                                            mapping.value
                                                                          }
                                                                          className="text-red-400"
                                                                        >
                                                                          ⚠️{" "}
                                                                          {
                                                                            mapping.value
                                                                          }
                                                                        </option>
                                                                      )}
                                                                      {excelColumnsGrouped.map(
                                                                        function (
                                                                          group,
                                                                          gIdx,
                                                                        ) {
                                                                          return (
                                                                            <optgroup
                                                                              key={
                                                                                gIdx
                                                                              }
                                                                              label={
                                                                                group.label
                                                                              }
                                                                              className="bg-[#0A0D14]/40 backdrop-blur-xl text-slate-400 font-black"
                                                                            >
                                                                              {group.options.map(
                                                                                function (
                                                                                  col,
                                                                                ) {
                                                                                  return (
                                                                                    <option
                                                                                      key={
                                                                                        group.label +
                                                                                        "_" +
                                                                                        col
                                                                                      }
                                                                                      value={
                                                                                        col
                                                                                      }
                                                                                      className={`bg-[#0A0D14]/40 backdrop-blur-xl font-medium ${String(col).startsWith("__") ? "text-indigo-400" : "text-slate-200"}`}
                                                                                    >
                                                                                      {
                                                                                        col
                                                                                      }
                                                                                    </option>
                                                                                  );
                                                                                },
                                                                              )}
                                                                            </optgroup>
                                                                          );
                                                                        },
                                                                      )}
                                                                    </select>
                                                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[12px] font-medium tracking-wide font-medium tracking-wide text-slate-500 pointer-events-none">
                                                                      ▼
                                                                    </span>
                                                                  </div>
    
                                                                  {/* 💡 Auto-Match suggestions */}
                                                                  {(() => {
                                                                    if (
                                                                      mapping.type !==
                                                                      "excel"
                                                                    )
                                                                      return null;
                                                                    var suggestions =
                                                                      excelColumns
                                                                        .map(
                                                                          function (
                                                                            col,
                                                                          ) {
                                                                            return {
                                                                              col: col,
                                                                              score:
                                                                                calculateVietnameseMatchScore(
                                                                                  tag,
                                                                                  col,
                                                                                ),
                                                                            };
                                                                          },
                                                                        )
                                                                        .filter(
                                                                          function (
                                                                            item,
                                                                          ) {
                                                                            return (
                                                                              item.score >=
                                                                                0.4 &&
                                                                              item.col !==
                                                                                mapping.value
                                                                            );
                                                                          },
                                                                        )
                                                                        .sort(
                                                                          function (
                                                                            a,
                                                                            b,
                                                                          ) {
                                                                            return (
                                                                              b.score -
                                                                              a.score
                                                                            );
                                                                          },
                                                                        )
                                                                        .slice(
                                                                          0,
                                                                          2,
                                                                        );
    
                                                                    if (
                                                                      suggestions.length ===
                                                                      0
                                                                    )
                                                                      return null;
    
                                                                    return (
                                                                      <div className="flex flex-wrap gap-1 mt-1.5 items-center">
                                                                        <span className="text-[9px] text-indigo-400 font-black uppercase tracking-tight flex items-center gap-0.5 select-none">
                                                                          <span>
                                                                            💡
                                                                          </span>{" "}
                                                                          Gợi ý:
                                                                        </span>
                                                                        {suggestions.map(
                                                                          function (
                                                                            sugg,
                                                                            idx,
                                                                          ) {
                                                                            var pct =
                                                                              Math.round(
                                                                                sugg.score *
                                                                                  100,
                                                                              );
                                                                            var badgeColor =
                                                                              pct >=
                                                                              90
                                                                                ? "bg-emerald-950/60 text-emerald-400 border border-emerald-900/40 hover:bg-emerald-900 hover:text-white"
                                                                                : pct >=
                                                                                    70
                                                                                  ? "bg-indigo-950/60 text-indigo-300 border border-indigo-900/40 hover:bg-indigo-900 hover:text-white"
                                                                                  : "bg-[#0A0D14]/40 backdrop-blur-xl text-slate-400 border border-slate-850 hover:bg-white/[0.03] backdrop-blur-md hover:text-white";
    
                                                                            return (
                                                                              <button
                                                                                key={
                                                                                  idx
                                                                                }
                                                                                type="button"
                                                                                onClick={function () {
                                                                                  setColumnMapping(
                                                                                    function (
                                                                                      prev,
                                                                                    ) {
                                                                                      return Object.assign(
                                                                                        {},
                                                                                        prev,
                                                                                        {
                                                                                          [tag]:
                                                                                            {
                                                                                              type: "excel",
                                                                                              value:
                                                                                                sugg.col,
                                                                                            },
                                                                                        },
                                                                                      );
                                                                                    },
                                                                                  );
                                                                                  showToast(
                                                                                    "Đã đối soát biến " +
                                                                                      tag +
                                                                                      " -> " +
                                                                                      sugg.col,
                                                                                  );
                                                                                }}
                                                                                className={
                                                                                  `px-1.5 py-0.5 rounded text-[9px] font-bold transition-all shadow-sm flex items-center gap-0.5 cursor-pointer ` +
                                                                                  badgeColor
                                                                                }
                                                                                title={
                                                                                  "Khớp " +
                                                                                  pct +
                                                                                  "% với từ khóa [" +
                                                                                  sugg.col +
                                                                                  "]"
                                                                                }
                                                                              >
                                                                                <span>
                                                                                  {
                                                                                    sugg.col
                                                                                  }
                                                                                </span>
                                                                                <span className="opacity-70 font-mono text-[8px]">
                                                                                  {
                                                                                    pct
                                                                                  }
                                                                                  %
                                                                                </span>
                                                                              </button>
                                                                            );
                                                                          },
                                                                        )}
                                                                      </div>
                                                                    );
                                                                  })()}
                                                                </React.Fragment>
                                                              ) : (
                                                                <textarea
                                                                  value={
                                                                    mapping.value ||
                                                                    ""
                                                                  }
                                                                  onFocus={function () {
                                                                    setFocusedTag(
                                                                      tag,
                                                                    );
                                                                  }}
                                                                  onBlur={function () {
                                                                    setFocusedTag(
                                                                      null,
                                                                    );
                                                                  }}
                                                                  placeholder={
                                                                    globalDictionary?.[
                                                                      tag
                                                                    ]
                                                                      ?.description ||
                                                                    (isTable
                                                                      ? "Dán dl bảng (Hỗ trợ nhiều dòng, tự động giữ cấu trúc)..."
                                                                      : "Nhập tay giá trị (Hỗ trợ nhiều dòng)...")
                                                                  }
                                                                  onChange={function (
                                                                    e,
                                                                  ) {
                                                                    var val =
                                                                      e.target
                                                                        .value;
                                                                    setColumnMapping(
                                                                      function (
                                                                        prev,
                                                                      ) {
                                                                        return Object.assign(
                                                                          {},
                                                                          prev,
                                                                          {
                                                                            [tag]: {
                                                                              type: "manual",
                                                                              value:
                                                                                val,
                                                                            },
                                                                          },
                                                                        );
                                                                      },
                                                                    );
                                                                  }}
                                                                  className={`w-full bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700 hover:border-slate-500 rounded-lg px-2 py-1.5 min-h-[32px] sm:min-h-[50px] text-[12px] font-medium tracking-wide text-slate-200 focus:outline-none focus:border-indigo-500 transition-all resize-y`}
                                                                />
                                                              )}
                                                            </div>
                                                          </div>
                                                          </div>
    
                                                          {/* 5. XEM TRƯỚC REMOVED */}
                                                        </div>
                                                      );
                                                    },
                                                  )}
                                                </div>
                                              </div>
                                            ),
                                          );
                                        })()
                                      )}
                                    </div>
                                  </div>
    
                                </div>
                              </div>
                        </div>{" "}
                        
    </>
  );
};

export default MappingTable;
