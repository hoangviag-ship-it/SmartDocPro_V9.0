import React from 'react';
import { getBaseTag, sanitizePath } from '../../../utils/helpers';
import { useAppStore } from '../../../../../shared/store/useAppStore';
import MappingTable from '../../Tabs/MappingTable';
import ExcelDataTab from '../../Tabs/ExcelDataTab';
import ExportTab from '../../Tabs/ExportTab';
import DictionaryTab from '../../Tabs/DictionaryTab';
import AddStageModal from "../../Modals/AddStageModal";
import RenameProcessNodeModal from "../../Modals/RenameProcessNodeModal";
import ApprovalHistoryModal from "../../Modals/ApprovalHistoryModal";
import ProcessModal from "../../Modals/ProcessModal";

const WorkspaceTab = (props) => {
  const { 
    appRoute,
    activeProjectTemplates,
    selectedTemplateIds,
    tags,
    formData,
    columnMapping,
    excelData,
    setSelectedTemplateIds,
    wbsStageFilter,
    setIsProcessModalOpen,
    setWbsStageFilter,
    setActiveMainTab,
    setActivePreviewId,
    setActiveMappingTab,
    setActiveSingleMappingTab,
    setEditingTemplate,
    handleDuplicateTemplate,
    handleDeleteTemplate,
    activeMainTab,
    viewStageFilter,
    setViewStageFilter,
    projectStages,
    currentProjectId,
    activeMappingTab,
    visibleProjectTemplates,
    setConfirmModal,
    setColumnMapping,
    showToast,
    handleAutoMap,
    selectedProfileName,
    handleProfileSelect,
    savedProfiles,
    handleSaveProfile,
    mappingSearchQuery,
    setMappingSearchQuery,
    excelColumns,
    activeExcelRowIndex,
    selectedExcelRows,
    getBoundRow,
    safeGetExcelValue,
    tagsToDisplayInMapping,
    globalDictionary,
    handleCopyTag,
    copiedTag,
    focusedTag,
    setFocusedTag,
    excelColumnsGrouped,
    batchTagFilterMode,
    setBatchTagFilterMode,
    setZoomLevel,
    zoomLevel,
    isRenderingPreview,
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
    setSelectedExcelRows,
    displayExcelColumns,
    excelColFilters,
    setExcelColFilters,
    paginatedExcelData,
    setActiveExcelRowIndex,
    editingExcelCell,
    setEditingExcelCell,
    handleExcelCellEdit,
    totalExcelPages,
    exportMode,
    setExportMode,
    exportSubFolderPattern,
    setExportSubFolderPattern,
    cleanUnusedTags,
    setCleanUnusedTags,
    enableHighlight,
    setEnableHighlight,
    exportProjectName,
    handleAutofillFromExcelRow,
    validateAndGenerateDoc,
    validateAndGenerateBatch,
    isProcessing,
    setGlobalDictionary,
    standardPrefixes,
    setStandardPrefixes,
    exportDictionaryTemplate,
    setLoadedTemplates,
    setFormData,
    isAddStageModalOpen,
    setIsAddStageModalOpen,
    newStageInput,
    setNewStageInput,
    handleAddProcessStage,
    FIXED_STAGES_SUGGESTIONS,
    editingProcessNode,
    setEditingProcessNode,
    handleSaveEditProcessNode,
    isApprovalHistoryModalOpen,
    setIsApprovalHistoryModalOpen,
    approvalHistory,
    setApprovalHistory,
    isProcessModalOpen,
    processModalStageFilter,
    setProcessModalStageFilter,
    isCompactView,
    setIsCompactView,
    handleDeleteProcessNode,
    setProjectStages,
    handleAddProcessDoc,
    loadedTemplates,
    activePreviewId,
    handleBindSheetChange,
    projects
  } = props;

  return (
    <div className={appRoute === "legal" ? "block" : "hidden"}>
            <div className="w-full max-w-[100%] xl:max-w-[100%] 2xl:max-w-[1800px] mx-auto pt-4 px-2 sm:px-4 pb-20 animate-fade-in">
              {activeProjectTemplates.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left mb-4">
                  <div className="bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg rounded-lg px-3 py-2 flex justify-between items-center shadow-sm">
                    <div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                        📄 File mẫu
                      </div>
                      <div className="text-base font-black text-white leading-none">
                        {activeProjectTemplates.length}
                      </div>
                    </div>
                    <div className="text-[9px] text-indigo-400 bg-indigo-950/50 px-1.5 py-0.5 rounded font-bold border border-indigo-900/50">
                      {selectedTemplateIds.length} chọn
                    </div>
                  </div>
                  <div className="bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg rounded-lg px-3 py-2 flex justify-between items-center shadow-sm">
                    <div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                        🏷️ Biến phát hiện
                      </div>
                      <div className="text-base font-black text-indigo-400 leading-none">
                        {tags.length}
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg rounded-lg px-3 py-2 flex justify-between items-center shadow-sm">
                    <div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                        ✏️ Đã điền (Form)
                      </div>
                      <div className="text-base font-black text-emerald-400 leading-none">
                        {
                          tags.filter(function (t) {
                            return (
                              formData[t] && String(formData[t]).trim() !== ""
                            );
                          }).length
                        }
                        <span className="text-[12px] font-medium tracking-wide font-medium tracking-wide text-slate-500 font-normal">
                          /{tags.length}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg rounded-lg px-3 py-2 flex justify-between items-center shadow-sm">
                    <div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                        🔗 Đã Map (Batch)
                      </div>
                      <div className="text-base font-black text-purple-400 leading-none">
                        {
                          tags.filter(function (t) {
                            var m = columnMapping[t];
                            return (
                              m &&
                              ((m.type === "excel" && m.value) ||
                                (m.type === "manual" && m.value))
                            );
                          }).length
                        }
                        <span className="text-[12px] font-medium tracking-wide font-medium tracking-wide text-slate-500 font-normal">
                          /{tags.length}
                        </span>
                      </div>
                    </div>
                    <div className="text-[9px] text-purple-400 bg-purple-950/50 px-1.5 py-0.5 rounded font-bold border border-purple-900/50">
                      {excelData.length} dòng XL
                    </div>
                  </div>
                </div>
              )}

              {/* MAIN APP TABS OUTSIDE */}
              <div className="flex bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg rounded-xl overflow-x-auto shrink-0 shadow-sm relative z-10 mb-4 xl:mb-6 custom-scrollbar flex-nowrap">
                <button
                  onClick={() => setActiveMainTab("workspace")}
                  className={`px-4 py-3 text-[13px] leading-relaxed font-bold transition-all border-b-2 flex items-center justify-center gap-2 whitespace-nowrap min-w-max ${
                    activeMainTab === "workspace"
                      ? "bg-[#0A0D14]/40 backdrop-blur-xl border-indigo-500 text-indigo-400"
                      : "border-transparent text-slate-500 hover:text-slate-400 hover:bg-[#0A0D14]/40 backdrop-blur-xl/50"
                  }`}
                >
                  <span>📋</span> KHUNG TRỘN & ĐIỀN BIẾN
                </button>
                <button
                  onClick={() => setActiveMainTab("excel")}
                  className={`px-4 py-3 text-[13px] leading-relaxed font-bold transition-all border-b-2 flex items-center justify-center gap-2 whitespace-nowrap min-w-max ${
                    activeMainTab === "excel"
                      ? "bg-[#0A0D14]/40 backdrop-blur-xl border-emerald-500 text-emerald-400"
                      : "border-transparent text-slate-500 hover:text-slate-400 hover:bg-[#0A0D14]/40 backdrop-blur-xl/50"
                  }`}
                >
                  <span>📊</span> DỮ LIỆU EXCEL ({excelData ? excelData.length : 0})
                </button>

                <button
                  onClick={() => setActiveMainTab("variables")}
                  className={`px-4 py-3 text-[13px] leading-relaxed font-bold transition-all border-b-2 flex items-center justify-center gap-2 whitespace-nowrap min-w-max ${
                    activeMainTab === "variables"
                      ? "bg-[#0A0D14]/40 backdrop-blur-xl border-amber-500 text-amber-400"
                      : "border-transparent text-slate-500 hover:text-slate-400 hover:bg-[#0A0D14]/40 backdrop-blur-xl/50"
                  }`}
                >
                  <span>📚</span> QUẢN LÝ BIẾN
                </button>

                <button
                  onClick={() => setActiveMainTab("export")}
                  className={`px-4 py-3 text-[13px] leading-relaxed font-bold transition-all border-b-2 flex items-center justify-center gap-2 whitespace-nowrap min-w-max ${
                    activeMainTab === "export"
                      ? "bg-[#0A0D14]/40 backdrop-blur-xl border-rose-500 text-rose-400"
                      : "border-transparent text-slate-500 hover:text-slate-400 hover:bg-[#0A0D14]/40 backdrop-blur-xl/50"
                  }`}
                >
                  <span>🚀</span> XUẤT FILE HÀNG LOẠT
                </button>
              </div>

              {/* MASHTER-DETAIL WBS SPLIT LAYOUT */}
              <div className="flex flex-col xl:flex-row gap-4 xl:gap-6 items-stretch w-full h-[calc(100vh-140px)] min-h-[600px] pb-4">
                {/* LEFT WBS DIRECTORY PANE */}
                <div className="w-full xl:w-[320px] 2xl:w-[380px] bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg rounded-2xl shrink-0 flex flex-col shadow-sm overflow-hidden">
                  <div className="bg-[#0A0D14]/40 backdrop-blur-xl border-b border-slate-700/50 shadow-lg p-4 flex flex-col gap-3 shrink-0">
                    <div className="flex justify-between items-center">
                      <h2 className="text-[13px] leading-relaxed font-black text-white flex items-center gap-2 tracking-wide uppercase">
                        <span>🗂️</span> CÂY THƯ MỤC WBS
                      </h2>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (selectedTemplateIds.length > 0) {
                              setSelectedTemplateIds([]);
                            } else {
                              const filteredTpls =
                                activeProjectTemplates.filter(
                                  (t) =>
                                    wbsStageFilter === "all" ||
                                    (t.stage || "Chưa phân loại") ===
                                      wbsStageFilter,
                                );
                              setSelectedTemplateIds(
                                filteredTpls.map((t) => t.id),
                              );
                            }
                          }}
                          className={
                            "px-2 py-1 border rounded text-[12px] font-medium tracking-wide font-medium tracking-wide font-bold transition-all " +
                            (selectedTemplateIds.length > 0
                              ? "bg-white/[0.03] backdrop-blur-md text-slate-300 border-slate-700 hover:bg-white/[0.06] backdrop-blur-lg"
                              : "bg-indigo-900/30 text-indigo-400 border-indigo-900/50 hover:bg-indigo-900/60")
                          }
                          title={
                            selectedTemplateIds.length > 0
                              ? "Bỏ chọn tất cả"
                              : "Chọn tất cả"
                          }
                        >
                          {selectedTemplateIds.length > 0
                            ? "Bỏ chọn (" + selectedTemplateIds.length + ")"
                            : "Chọn tất cả"}
                        </button>
                        <button
                          onClick={() => setIsProcessModalOpen(true)}
                          className="px-2 py-1 bg-fuchsia-900/30 text-fuchsia-400 hover:bg-fuchsia-900/60 border border-fuchsia-900 rounded text-[12px] font-medium tracking-wide font-medium tracking-wide font-bold transition-all"
                          title="Tổ chức quy trình/Thư mục dự án"
                        >
                          ⚙️
                        </button>
                      </div>
                    </div>
                    {activeProjectTemplates.length > 0 && (
                      <div className="flex items-center gap-2">
                        <select
                          value={wbsStageFilter}
                          onChange={(e) => setWbsStageFilter(e.target.value)}
                          className="w-full bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg text-[13px] leading-relaxed text-slate-300 rounded px-2 py-1 outline-none focus:border-indigo-500 transition-all font-bold"
                        >
                          <option value="all">Tất cả giai đoạn</option>
                          {Array.from(
                            new Set(
                              activeProjectTemplates.map(
                                (t) => t.stage || "Chưa phân loại",
                              ),
                            ),
                          ).map((stage) => (
                            <option key={stage} value={stage}>
                              {stage}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                    {activeProjectTemplates.length === 0 ? (
                      <div className="text-center py-10 opacity-70">
                        <div className="text-4xl mb-3 opacity-50">📂</div>
                        <p className="text-slate-400 text-[13px] leading-relaxed font-bold mb-3">
                          Chưa có tệp nào
                        </p>
                        <button
                          onClick={() => {
                            setActiveMainTab("workspace");
                            setTimeout(() => {
                              // We use a broader query selector down because accept could vary. Let's just lookup by name or id if possible. But there's no id.
                              // Wait, we can fetch all and get the first that supports docx
                              const els =
                                document.querySelectorAll('input[type="file"]');
                              let foundEl = null;
                              els.forEach(function (el) {
                                if (
                                  el.accept &&
                                  el.accept.indexOf(".docx") !== -1 &&
                                  el.accept.indexOf(".xlsx") !== -1
                                )
                                  foundEl = el;
                              });
                              if (foundEl) foundEl.click();
                              else {
                                const fallback = document.querySelector(
                                  'input[type="file"][accept=".docx, .xlsx"]',
                                );
                                if (fallback) fallback.click();
                              }
                            }, 100);
                          }}
                          className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] backdrop-blur-sm border border-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.2)] text-white rounded text-[13px] leading-relaxed font-bold transition-all shadow-md"
                        >
                          Tải mẫu lên
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {Object.entries(
                          activeProjectTemplates
                            .filter(
                              (t) =>
                                wbsStageFilter === "all" ||
                                (t.stage || "Chưa phân loại") ===
                                  wbsStageFilter,
                            )
                            .reduce((acc, t) => {
                              const stage = t.stage || "Chưa phân loại";
                              if (!acc[stage]) acc[stage] = [];
                              acc[stage].push(t);
                              return acc;
                            }, {}),
                        ).map(([stageName, stageTemplates]) => {
                          return (
                            <div key={stageName} className="mb-2">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-[12px] font-medium tracking-wide font-medium tracking-wide font-black text-slate-400 uppercase tracking-widest truncate">
                                  📁 {stageName}
                                </span>
                                <div className="h-px bg-white/[0.03] backdrop-blur-md flex-1 mt-0.5"></div>
                              </div>
                              <div className="pl-3 border-l border-slate-700/50 shadow-lg/50 space-y-2 relative before:content-[''] before:absolute before:left-[-1px] before:top-[-10px] before:w-[2px] before:h-2 before:bg-white/[0.03] backdrop-blur-md/50">
                                {stageTemplates.map((t) => {
                                  var isChecked =
                                    selectedTemplateIds.indexOf(t.id) !== -1;
                                  return (
                                    <div
                                      key={t.id}
                                      className={
                                        "flex flex-col relative before:content-[''] before:absolute before:w-2 before:h-px before:left-[-11px] before:top-[12px] group transition-all bg-[#0A0D14]/40 backdrop-blur-xl border hover:border-slate-700 " +
                                        (isChecked
                                          ? "border-slate-700 before:bg-slate-500 shadow-sm"
                                          : "border-slate-700/50 shadow-lg before:bg-white/[0.03] backdrop-blur-md/50") +
                                        " p-2 rounded-lg text-sm"
                                      }
                                    >
                                      <div className="flex items-start gap-2">
                                        <button
                                          onClick={() =>
                                            setSelectedTemplateIds((prev) =>
                                              prev.indexOf(t.id) !== -1
                                                ? prev.filter(
                                                    (id) => id !== t.id,
                                                  )
                                                : [...prev, t.id],
                                            )
                                          }
                                          className={
                                            "flex-shrink-0 rounded w-4 h-4 flex items-center justify-center border transition-all mt-0.5 " +
                                            (isChecked
                                              ? "bg-slate-600 border-slate-500 text-white"
                                              : "bg-[#0A0D14]/40 backdrop-blur-xl border-slate-700 text-transparent hover:border-slate-500")
                                          }
                                        >
                                          <span className="text-[8px] font-black">
                                            ✓
                                          </span>
                                        </button>
                                        <div
                                          className="flex-1 min-w-0"
                                          onClick={() => {
                                            setActivePreviewId(t.id);
                                            setActiveMappingTab(t.id);
                                            setActiveSingleMappingTab(t.id);
                                          }}
                                        >
                                          <div
                                            className={
                                              "font-bold truncate cursor-pointer text-[12px] font-medium tracking-wide leading-tight " +
                                              (isChecked
                                                ? "text-white"
                                                : "text-slate-400")
                                            }
                                          >
                                            📄 {t.customName || t.originalName}
                                          </div>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 absolute right-2 top-1.5 bg-[#0A0D14]/80 backdrop-blur-md p-0.5 rounded shadow-lg border border-slate-700/50">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEditingTemplate({
                                                ...t,
                                                tags: [...t.tags],
                                                rawTags: t.rawTags
                                                  ? [...t.rawTags]
                                                  : [],
                                                stage: t.stage || "",
                                              });
                                            }}
                                            className="p-1 text-[12px] font-medium tracking-wide font-medium tracking-wide hover:bg-indigo-600 text-slate-400 hover:text-white rounded transition-all"
                                            title="Sửa Tệp & Quản lý Thẻ"
                                          >
                                            ✏️
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDuplicateTemplate(t.id);
                                            }}
                                            className="p-1 text-[12px] font-medium tracking-wide font-medium tracking-wide hover:bg-emerald-600 text-slate-400 hover:text-white rounded transition-all"
                                            title="Nhân bản file"
                                          >
                                            📄
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (window.confirm("Bạn có chắc chắn muốn xóa tệp này không?")) {
                                                handleDeleteTemplate(t.id);
                                              }
                                            }}
                                            className="p-1 text-[12px] font-medium tracking-wide font-medium tracking-wide hover:bg-red-600 text-slate-400 hover:text-white rounded transition-all"
                                            title="Xóa file"
                                          >
                                            🗑️
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className={`flex flex-col h-full min-w-0 transition-all duration-300 flex-1`}
                >
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div
                      className={`h-full animate-fade-in ${activeMainTab === "workspace" ? "flex gap-4 xl:gap-6" : "hidden"}`}
                    >
                      <div className={`w-full ${activeMainTab === "workspace" ? "flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4 xl:space-y-6" : ""}`}>
                      {/* COMPACT UPLOAD REMOVED */}

                      <MappingTable
  batchTagFilterMode={batchTagFilterMode}
  setBatchTagFilterMode={setBatchTagFilterMode}
  viewStageFilter={viewStageFilter}
  setViewStageFilter={setViewStageFilter}
  projectStages={projectStages}
  currentProjectId={currentProjectId}
  activeMappingTab={activeMappingTab}
  setActiveMappingTab={setActiveMappingTab}
  setActivePreviewId={setActivePreviewId}
  visibleProjectTemplates={visibleProjectTemplates}
  setConfirmModal={setConfirmModal}
  setColumnMapping={setColumnMapping}
  showToast={showToast}
  handleAutoMap={handleAutoMap}
  selectedProfileName={selectedProfileName}
  handleProfileSelect={handleProfileSelect}
  savedProfiles={savedProfiles}
  handleSaveProfile={handleSaveProfile}
  mappingSearchQuery={mappingSearchQuery}
  setMappingSearchQuery={setMappingSearchQuery}
  tags={tags}
  columnMapping={columnMapping}
  excelColumns={excelColumns}
  excelData={excelData}
  activeExcelRowIndex={activeExcelRowIndex}
  selectedExcelRows={selectedExcelRows}
  activeProjectTemplates={activeProjectTemplates}
  getBoundRow={getBoundRow}
  safeGetExcelValue={safeGetExcelValue}
  tagsToDisplayInMapping={tagsToDisplayInMapping}
  globalDictionary={globalDictionary}
  getBaseTag={getBaseTag}
  handleCopyTag={handleCopyTag}
  copiedTag={copiedTag}
  focusedTag={focusedTag}
  setFocusedTag={setFocusedTag}
  excelColumnsGrouped={excelColumnsGrouped}
/>
                      </div> {/* END OF MAPPING INNER CONTENT */}

                    {/* LIVE PREVIEW PANE (ONLY IN FORM TAB) */}
                    {activeMainTab === "workspace" && (
                      <div className="w-[45%] hidden xl:flex flex-col bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg rounded-2xl overflow-hidden relative h-full">
                        <div className="flex justify-between items-center px-4 py-3 bg-[#0A0D14]/40 backdrop-blur-xl border-b border-slate-700/50 shadow-lg print-hide shrink-0 z-10">
                          <span className="text-[12px] font-medium tracking-wide font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                            <span>👀</span> PREVIEW LIVE
                          </span>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setZoomLevel(z => Math.max(0.3, z - 0.1))} className="px-2 py-1 bg-slate-800 rounded hover:bg-slate-700 text-white font-bold text-xs">➖</button>
                            <span className="text-white text-xs font-bold w-10 text-center">{Math.round(zoomLevel * 100)}%</span>
                            <button onClick={() => setZoomLevel(z => Math.min(2, z + 0.1))} className="px-2 py-1 bg-slate-800 rounded hover:bg-slate-700 text-white font-bold text-xs">➕</button>
                          </div>
                        </div>
                        <div className="flex-1 overflow-auto bg-slate-900/50 custom-scrollbar p-6 flex justify-center relative">
                          {isRenderingPreview && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm z-50">
                              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                          <div id="docx-preview-inline-container" className="bg-white shadow-2xl origin-top transition-transform duration-200" style={{ transform: `scale(${zoomLevel})` }}></div>
                        </div>
                      </div>
                    )}
                  </div> {/* END OF FORM AND FILES TAB OUTER WRAPPER */}
                    {/* TAB DỮ LIỆU EXCEL */}
                    <div
                      className={`space-y-4 xl:space-y-6 animate-fade-in ${activeMainTab === "excel" ? "block" : "hidden"}`}
                    >
                      <ExcelDataTab
                        excelData={excelData}
                        uploadedWorkbooks={uploadedWorkbooks}
                        handleRemoveWorkbook={handleRemoveWorkbook}
                        selectedSheetKeys={selectedSheetKeys}
                        setSelectedSheetKeys={setSelectedSheetKeys}
                        filteredExcelData={filteredExcelData}
                        excelSearchQuery={excelSearchQuery}
                        setExcelSearchQuery={setExcelSearchQuery}
                        hideEmptyColumns={hideEmptyColumns}
                        setHideEmptyColumns={setHideEmptyColumns}
                        excelRowsPerPage={excelRowsPerPage}
                        setExcelRowsPerPage={setExcelRowsPerPage}
                        excelPage={excelPage}
                        setExcelPage={setExcelPage}
                        selectedExcelRows={selectedExcelRows}
                        setSelectedExcelRows={setSelectedExcelRows}
                        displayExcelColumns={displayExcelColumns}
                        excelColFilters={excelColFilters}
                        setExcelColFilters={setExcelColFilters}
                        paginatedExcelData={paginatedExcelData}
                        activeExcelRowIndex={activeExcelRowIndex}
                        setActiveExcelRowIndex={setActiveExcelRowIndex}
                        editingExcelCell={editingExcelCell}
                        setEditingExcelCell={setEditingExcelCell}
                        handleExcelCellEdit={handleExcelCellEdit}
                        totalExcelPages={totalExcelPages}
                      />
                    </div>{" "}
                    {/* END OF EXCEL TAB */}
                    {/* EXPORT TAB CONTENT */}
                    <div
                      className={`h-full flex flex-col space-y-4 xl:space-y-6 animate-fade-in ${activeMainTab === "export" ? "block" : "hidden"}`}
                    >
                      <ExportTab
                        exportMode={exportMode}
                        setExportMode={setExportMode}
                        exportSubFolderPattern={exportSubFolderPattern}
                        setExportSubFolderPattern={setExportSubFolderPattern}
                        cleanUnusedTags={cleanUnusedTags}
                        setCleanUnusedTags={setCleanUnusedTags}
                        enableHighlight={enableHighlight}
                        setEnableHighlight={setEnableHighlight}
                        excelData={excelData}
                        excelColumns={excelColumns}
                        activeProjectTemplates={activeProjectTemplates}
                        selectedTemplateIds={selectedTemplateIds}
                        exportProjectName={exportProjectName}
                        selectedExcelRows={selectedExcelRows}
                        activeExcelRowIndex={activeExcelRowIndex}
                        setActiveExcelRowIndex={setActiveExcelRowIndex}
                        handleAutofillFromExcelRow={handleAutofillFromExcelRow}
                        validateAndGenerateDoc={validateAndGenerateDoc}
                        validateAndGenerateBatch={validateAndGenerateBatch}
                        isProcessing={isProcessing}
                        sanitizePath={sanitizePath}
                        getBoundRow={getBoundRow}
                      />
                    </div>
                    {/* DICTIONARY TAB CONTENT */}
                    <div
                      className={`h-full flex flex-col space-y-4 xl:space-y-6 animate-fade-in ${activeMainTab === "variables" ? "block" : "hidden"}`}
                    >
                      <DictionaryTab 
                        globalDictionary={globalDictionary}
                        setGlobalDictionary={setGlobalDictionary}
                        standardPrefixes={standardPrefixes}
                        setStandardPrefixes={setStandardPrefixes}
                        exportDictionaryTemplate={exportDictionaryTemplate}
                        setConfirmModal={setConfirmModal}
                        showToast={showToast}
                        setLoadedTemplates={setLoadedTemplates}
                        setColumnMapping={setColumnMapping}
                        setFormData={setFormData}
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* MODAL 1: THÊM GIAI ĐOẠN/NHÓM BÊN TRONG MASTER */}
<AddStageModal
                isAddStageModalOpen={isAddStageModalOpen}
                setIsAddStageModalOpen={setIsAddStageModalOpen}
                newStageInput={newStageInput}
                setNewStageInput={setNewStageInput}
                handleAddProcessStage={handleAddProcessStage}
                FIXED_STAGES_SUGGESTIONS={FIXED_STAGES_SUGGESTIONS}
                projectStages={projectStages}
                currentProjectId={currentProjectId}
              />

<RenameProcessNodeModal
                editingProcessNode={editingProcessNode}
                setEditingProcessNode={setEditingProcessNode}
                handleSaveEditProcessNode={handleSaveEditProcessNode}
              />

              {/* MODAL 3: LỊCH SỬ KÝ DUYỆT */}
<ApprovalHistoryModal
                isApprovalHistoryModalOpen={isApprovalHistoryModalOpen}
                setIsApprovalHistoryModalOpen={setIsApprovalHistoryModalOpen}
                approvalHistory={approvalHistory}
                setApprovalHistory={setApprovalHistory}
                setConfirmModal={setConfirmModal}
              />

              {/* SYSTEM MODALS GIAO DIỆN PHỤ */}

              <ProcessModal
                isProcessModalOpen={isProcessModalOpen}
                setIsProcessModalOpen={setIsProcessModalOpen}
                projectStages={projectStages}
                currentProjectId={currentProjectId}
                processModalStageFilter={processModalStageFilter}
                setProcessModalStageFilter={setProcessModalStageFilter}
                isCompactView={isCompactView}
                setIsCompactView={setIsCompactView}
                activeProjectTemplates={activeProjectTemplates}
                selectedTemplateIds={selectedTemplateIds}
                setSelectedTemplateIds={setSelectedTemplateIds}
                setNewStageInput={setNewStageInput}
                setIsAddStageModalOpen={setIsAddStageModalOpen}
                setEditingProcessNode={setEditingProcessNode}
                handleDeleteProcessNode={handleDeleteProcessNode}
                setConfirmModal={setConfirmModal}
                uploadedWorkbooks={uploadedWorkbooks}
                setProjectStages={setProjectStages}
                setEditingTemplate={setEditingTemplate}
                handleDeleteTemplate={handleDeleteTemplate}
                handleAddProcessDoc={handleAddProcessDoc}
                loadedTemplates={loadedTemplates}
                setActivePreviewId={setActivePreviewId}
                setActiveMappingTab={setActiveMappingTab}
                activePreviewId={activePreviewId}
                handleBindSheetChange={handleBindSheetChange}
                selectedSheetKeys={selectedSheetKeys}
                showToast={showToast}
                projects={projects}
                setLoadedTemplates={setLoadedTemplates}
                setApprovalHistory={setApprovalHistory}
                setActiveSingleMappingTab={setActiveSingleMappingTab}
              />
            </div>
          </div>
  );
};

export default WorkspaceTab;
