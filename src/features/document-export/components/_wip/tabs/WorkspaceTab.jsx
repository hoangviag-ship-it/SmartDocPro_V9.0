import React, { useState } from 'react';
import { getBaseTag, sanitizePath } from '../../../utils/helpers';
import { useAppStore } from '../../../../../shared/store/useAppStore';
import MappingTable from '../../Tabs/MappingTable';
import ExcelDataTab from '../../Tabs/ExcelDataTab';
import ExportTab from '../../Tabs/ExportTab';
import DictionaryTab from '../../Tabs/DictionaryTab';
import ExportHistoryTab from '../tabs/ExportHistoryTab';
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
    projects,
    SDE_UID
  } = props;

  const [isWbsOpen, setIsWbsOpen] = useState(() => {
    try { return localStorage.getItem('sde_wbs_open') !== 'false'; } catch { return true; }
  });
  const [isPreviewOpen, setIsPreviewOpen] = useState(() => {
    try { return localStorage.getItem('sde_preview_open') !== 'false'; } catch { return true; }
  });
  const toggleWbs = () => {
    const next = !isWbsOpen;
    setIsWbsOpen(next);
    try { localStorage.setItem('sde_wbs_open', String(next)); } catch {}
  };
  const togglePreview = () => {
    const next = !isPreviewOpen;
    setIsPreviewOpen(next);
    try { localStorage.setItem('sde_preview_open', String(next)); } catch {}
  };

  return (
    <div className="h-full flex flex-col">
            <div className="w-full pt-2 px-3 pb-2 animate-fade-in flex-1 flex flex-col min-h-0">
              {/* MASHTER-DETAIL WBS SPLIT LAYOUT */}
              <div className="flex flex-col xl:flex-row gap-3 xl:gap-4 items-stretch w-full flex-1 min-h-0 pb-2">
                {/* LEFT WBS DIRECTORY PANE — collapsible */}
                <div
                  className="shrink-0 overflow-hidden transition-all duration-300 hidden xl:flex"
                  style={{ width: isWbsOpen ? '320px' : '40px', minWidth: '40px' }}
                >
                  {/* Collapsed strip */}
                  {!isWbsOpen && (
                    <button
                      onClick={toggleWbs}
                      className="w-10 flex flex-col items-center justify-center gap-2 h-full bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl text-slate-600 hover:text-indigo-400 hover:border-indigo-700 transition-all group"
                      title="Mở CÂY WBS"
                    >
                      <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500 group-hover:text-indigo-400 transition-colors" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>CÂY WBS</span>
                      <span className="text-slate-600 group-hover:text-indigo-400 text-xs transition-colors">▶</span>
                    </button>
                  )}
                  {/* Expanded content */}
                  {isWbsOpen && (
                  <div className="w-full bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg rounded-2xl flex flex-col overflow-hidden">
                  <div className="bg-[#0A0D14]/40 backdrop-blur-xl border-b border-slate-700/50 p-3 flex flex-col gap-2 shrink-0">
                    <div className="flex justify-between items-center">
                      <h2 className="text-[12px] font-bold text-slate-300 flex items-center gap-1.5 tracking-wide uppercase">
                        <span>🗂️</span> CÂY WBS
                      </h2>
                      <div className="flex gap-1.5">
                        <button
                          onClick={toggleWbs}
                          className="px-2 py-0.5 border border-slate-700 rounded text-[11px] text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-all"
                          title="Thu gọn WBS"
                        >◀</button>
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
                            "px-2 py-1 border rounded text-[12px] font-bold transition-all " +
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
                          className="px-2 py-1 bg-fuchsia-900/30 text-fuchsia-400 hover:bg-fuchsia-900/60 border border-fuchsia-900 rounded text-[12px] font-bold transition-all"
                          title="Tổ chức quy trình/Thư mục dự án"
                        >
                          ⚙️
                        </button>
                      </div>
                    </div>
                    {activeProjectTemplates.length > 0 && (
                      <div className="flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 whitespace-nowrap shrink-0">
                          <span className="text-white font-bold">{activeProjectTemplates.length}</span> mẫu
                          {selectedTemplateIds.length > 0 && <span className="text-indigo-400 bg-indigo-950/60 px-1 rounded border border-indigo-900/50">{selectedTemplateIds.length} chọn</span>}
                        </span>
                        <span className="w-px h-3 bg-slate-700 shrink-0" />
                        <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap shrink-0">
                          <span className="text-indigo-400 font-bold">{tags.length}</span> biến
                        </span>
                        <span className="w-px h-3 bg-slate-700 shrink-0" />
                        <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap shrink-0">
                          <span className="text-emerald-400 font-bold">{tags.filter(function(t){ return formData[t] && String(formData[t]).trim() !== ''; }).length}</span>/{tags.length} form
                        </span>
                        <span className="w-px h-3 bg-slate-700 shrink-0" />
                        <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap shrink-0">
                          <span className="text-purple-400 font-bold">{tags.filter(function(t){ var m=columnMapping[t]; return m&&((m.type==='excel'&&m.value)||(m.type==='manual'&&m.value)); }).length}</span>/{tags.length} map
                        </span>
                      </div>
                    )}
                    {activeProjectTemplates.length > 0 && (
                      <div className="flex items-center gap-2">
                        <select
                          value={wbsStageFilter}
                          onChange={(e) => setWbsStageFilter(e.target.value)}
                          className="w-full bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 text-[12px] text-slate-300 rounded px-2 py-1 outline-none focus:border-indigo-500 transition-all font-semibold"
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
                                <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase truncate">
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
                                          <span className="text-[10px] font-bold">✓</span>
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
                                              "font-semibold truncate cursor-pointer text-[12px] leading-tight " +
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
                                            className="p-1 text-[12px] hover:bg-indigo-600 text-slate-400 hover:text-white rounded transition-all"
                                            title="Sửa Tệp & Quản lý Thẻ"
                                          >
                                            ✏️
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDuplicateTemplate(t.id);
                                            }}
                                            className="p-1 text-[12px] hover:bg-emerald-600 text-slate-400 hover:text-white rounded transition-all"
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
                                            className="p-1 text-[12px] hover:bg-red-600 text-slate-400 hover:text-white rounded transition-all"
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
                  )}
                </div>

                {/* WBS pane — mobile always visible */}
                <div className="block xl:hidden w-full bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shrink-0">
                  <div className="p-3 border-b border-slate-700/50">
                    <h2 className="text-[12px] font-bold text-white flex items-center gap-2 uppercase">🗂️ CÂY WBS</h2>
                  </div>
                  <div className="p-3 text-[11px] text-slate-500 text-center">Xem trên màn hình lớn để dùng WBS</div>
                </div>

                <div
                  className={`flex flex-col h-full min-w-0 transition-all duration-300 flex-1`}
                >
                  <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                    <div
                      className={`h-full animate-fade-in ${activeMainTab === "workspace" ? "flex gap-3 xl:gap-4" : "hidden"}`}
                    >
                      <div className={`w-full ${activeMainTab === "workspace" ? "flex-1 h-full overflow-y-auto custom-scrollbar pr-2 space-y-3 xl:space-y-4" : ""}`}>
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

                    {/* LIVE PREVIEW PANE — collapsible */}
                    {activeMainTab === "workspace" && (
                      <div
                        className="hidden xl:flex shrink-0 overflow-hidden transition-all duration-300"
                        style={{ width: isPreviewOpen ? '45%' : '40px', minWidth: '40px' }}
                      >
                        {/* Collapsed strip */}
                        {!isPreviewOpen && (
                          <button
                            onClick={togglePreview}
                            className="w-10 flex flex-col items-center justify-center gap-2 h-full bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl text-slate-600 hover:text-indigo-400 hover:border-indigo-700 transition-all group"
                            title="Mở Preview"
                          >
                            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500 group-hover:text-indigo-400 transition-colors" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>PREVIEW</span>
                            <span className="text-slate-600 group-hover:text-indigo-400 text-xs transition-colors">▶</span>
                          </button>
                        )}
                        {/* Expanded content */}
                        {isPreviewOpen && (
                          <div className="flex flex-col bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg rounded-2xl overflow-hidden relative h-full w-full">
                            <div className="flex justify-between items-center px-3 py-2 bg-[#0A0D14]/40 backdrop-blur-xl border-b border-slate-700/50 print-hide shrink-0 z-10">
                              <span className="text-[12px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                                <span>👀</span> PREVIEW LIVE
                              </span>
                              <div className="flex items-center gap-2">
                                <button onClick={togglePreview} className="px-2 py-1 bg-slate-800/60 rounded hover:bg-slate-700 text-slate-400 hover:text-white font-bold text-xs transition-all" title="Thu preview">◀</button>
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
                    {/* HISTORY TAB CONTENT */}
                    <div
                      className={`h-full flex flex-col space-y-4 xl:space-y-6 animate-fade-in ${activeMainTab === "history" ? "block" : "hidden"}`}
                    >
                      <ExportHistoryTab SDE_UID={SDE_UID} />
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
