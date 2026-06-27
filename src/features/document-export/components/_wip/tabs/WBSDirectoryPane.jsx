import React from "react";

const WBSDirectoryPane = ({
  activeProjectTemplates,
  selectedTemplateIds,
  setSelectedTemplateIds,
  wbsStageFilter,
  setWbsStageFilter,
  setIsProcessModalOpen,
  setEditingTemplate,
  handleDuplicateTemplate,
  handleDeleteTemplate,
  setActivePreviewId,
  setActiveMappingTab,
  setActiveSingleMappingTab,
  setActiveMainTab,
  projectStages,
  currentProjectId
}) => {
  return (
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
    
                    
  );
};

export default WBSDirectoryPane;
