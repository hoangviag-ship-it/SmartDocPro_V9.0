import React from "react";
import { saveBufferToDB, extractAllTags, getCleanTextFromZip } from "../../utils/helpers";

const ProcessModal = ({
  isProcessModalOpen,
  setIsProcessModalOpen,
  projectStages,
  currentProjectId,
  processModalStageFilter,
  setProcessModalStageFilter,
  isCompactView,
  setIsCompactView,
  activeProjectTemplates,
  selectedTemplateIds,
  setSelectedTemplateIds,
  setNewStageInput,
  setIsAddStageModalOpen,
  setEditingProcessNode,
  handleDeleteProcessNode,
  setConfirmModal,
  uploadedWorkbooks,
  setProjectStages,
  setEditingTemplate,
  handleDeleteTemplate,
  handleAddProcessDoc,
  loadedTemplates,
  setActivePreviewId,
  setActiveMappingTab,
  activePreviewId,
  handleBindSheetChange,
  selectedSheetKeys,
  showToast,
  projects,
  setLoadedTemplates,
  setApprovalHistory,
  setActiveSingleMappingTab
}) => {
  return (
    <>
      {isProcessModalOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#0A0D14]/40 backdrop-blur-xl/80 backdrop-blur-sm animate-fade-in">
                  <div className="bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg rounded-2xl w-full max-w-6xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-700 relative max-h-[95vh] overflow-hidden flex flex-col">
                    <div className="absolute top-4 right-4 z-50">
                      <button
                        onClick={() => setIsProcessModalOpen(false)}
                        className="px-3 py-1.5 bg-red-900/40 hover:bg-red-800 text-red-100 rounded-lg text-[13px] leading-relaxed font-bold transition-all shadow-md"
                      >
                        Đóng (Esc)
                      </button>
                    </div>
                    <div className="bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg rounded-2xl p-5 mb-6 shadow-xl animate-fade-in relative z-10 block">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                        <div>
                          <h3 className="text-[13px] leading-relaxed font-black tracking-wide text-fuchsia-400 uppercase flex items-center gap-2">
                            <span className="text-lg">📈</span> QUẢN LÝ QUY
                            TRÌNH HỒ SƠ TỆP THÔNG MINH
                          </h3>
                          <p className="text-[12px] font-medium tracking-wide font-medium tracking-wide text-slate-400 mt-1">
                            Quản lý Cấu hình và Tệp File Gốc theo Quy trình Dự
                            án.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                          <div className="relative shrink-0 h-[28px]">
                            <select
                              value={processModalStageFilter}
                              onChange={(e) =>
                                setProcessModalStageFilter(e.target.value)
                              }
                              className="h-full bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700 text-[12px] font-medium tracking-wide font-medium tracking-wide text-slate-300 hover:text-white pl-3 pr-7 rounded outline-none font-bold focus:border-indigo-500 transition-all appearance-none shadow-sm cursor-pointer"
                            >
                              <option value="all">🌐 Tất cả G/Đ</option>
                              {(projectStages[currentProjectId] || []).map(
                                (st) => (
                                  <option key={st.name} value={st.name}>
                                    📁 {st.name}
                                  </option>
                                ),
                              )}
                            </select>
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-500 pointer-events-none">
                              ▼
                            </span>
                          </div>
                          <button
                            onClick={() => setIsCompactView(!isCompactView)}
                            className={
                              "text-[12px] font-medium tracking-wide font-medium tracking-wide px-3 py-1.5 rounded font-bold transition-all shadow-sm border " +
                              (isCompactView
                                ? "bg-indigo-900/50 border-indigo-700 text-indigo-300"
                                : "bg-white/[0.03] backdrop-blur-md border-slate-700 text-slate-300 hover:bg-white/[0.06] backdrop-blur-lg")
                            }
                          >
                            {isCompactView ? "🏢 Mở rộng" : "⛺ Thu gọn"}
                          </button>
                          <button
                            onClick={function () {
                              setSelectedTemplateIds((prev) =>
                                Array.from(
                                  new Set([
                                    ...prev,
                                    ...activeProjectTemplates.map((t) => t.id),
                                  ]),
                                ),
                              );
                            }}
                            className="text-[12px] font-medium tracking-wide font-medium tracking-wide px-3 py-1.5 bg-white/[0.03] backdrop-blur-md text-slate-300 rounded hover:bg-white/[0.06] backdrop-blur-lg font-bold transition-all shadow-sm flex items-center gap-1.5"
                          >
                            <span>✓</span> Chọn tất cả
                          </button>
                          <button
                            onClick={function () {
                              setSelectedTemplateIds((prev) =>
                                prev.filter(
                                  (id) =>
                                    !activeProjectTemplates.find(
                                      (t) => t.id === id,
                                    ),
                                ),
                              );
                            }}
                            className="text-[12px] font-medium tracking-wide font-medium tracking-wide px-3 py-1.5 bg-white/[0.03] backdrop-blur-md text-slate-300 rounded hover:bg-white/[0.06] backdrop-blur-lg font-bold transition-all shadow-sm flex items-center gap-1.5"
                          >
                            <span>✕</span> Bỏ chọn
                          </button>
                          <button
                            onClick={() => {
                              setNewStageInput("");
                              setIsAddStageModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-700/50 text-emerald-400 hover:text-white rounded text-[12px] font-medium tracking-wide font-medium tracking-wide font-bold transition-all shadow-sm flex items-center gap-1.5"
                          >
                            <span>➕</span> Thêm Nhóm / G/Đ
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4 max-h-[650px] overflow-y-auto pr-2 custom-scrollbar">
                        {(projectStages[currentProjectId] || []).map(
                          (stage, stageIndex) => {
                            if (
                              processModalStageFilter !== "all" &&
                              stage.name !== processModalStageFilter
                            )
                              return null;
                            const boundTemplateIdsInStage = new Set();
                            const hasDocs = stage.docs && stage.docs.length > 0;

                            return (
                              <div
                                key={stage.id}
                                className="border border-slate-700/50 shadow-lg/80 rounded-xl bg-[#0A0D14]/40 backdrop-blur-xl/50 pb-2 overflow-hidden shadow-sm"
                              >
                                <div className="bg-[#0A0D14]/40 backdrop-blur-xl px-4 py-2 flex justify-between items-center border-b border-slate-700/50 shadow-lg/80 group shrink-0">
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[12px] font-medium tracking-wide font-medium tracking-wide font-black text-indigo-400 uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] sm:max-w-xs">
                                      {stage.name}
                                    </span>
                                    <button
                                      onClick={() =>
                                        setEditingProcessNode({
                                          type: "stage",
                                          stageIndex,
                                          docIndex: null,
                                          oldName: stage.name,
                                          newName: stage.name,
                                        })
                                      }
                                      className="text-[12px] font-medium tracking-wide font-medium tracking-wide text-slate-500 hover:text-indigo-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteProcessNode(
                                          stageIndex,
                                          null,
                                        )
                                      }
                                      className="text-[12px] font-medium tracking-wide font-medium tracking-wide text-slate-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                  <button
                                    onClick={() =>
                                      handleAddProcessDoc(stageIndex)
                                    }
                                    className="text-[12px] font-medium tracking-wide font-medium tracking-wide px-2 py-1 bg-white/[0.03] backdrop-blur-md hover:bg-white/[0.06] backdrop-blur-lg text-slate-300 rounded border border-slate-700 font-bold transition-all flex items-center gap-1 whitespace-nowrap"
                                  >
                                    <span>+</span> Mục Mới
                                  </button>
                                </div>

                                <div className="p-2 flex flex-col gap-2 relative">
                                  {hasDocs ? (
                                    stage.docs.map((doc, docIndex) => {
                                      const linkedTemplate = doc.templateId
                                        ? loadedTemplates.find(
                                            (t) => t.id === doc.templateId,
                                          )
                                        : null;
                                      if (linkedTemplate)
                                        boundTemplateIdsInStage.add(
                                          linkedTemplate.id,
                                        );

                                      return (
                                        <div
                                          key={doc.id}
                                          className={
                                            "flex flex-col xl:flex-row xl:items-center justify-between transition-all bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg hover:border-slate-700 " +
                                            (isCompactView
                                              ? "gap-2 p-1.5 rounded-lg text-[13px] leading-relaxed"
                                              : "gap-3 p-3 rounded-xl text-sm")
                                          }
                                        >
                                          <div className="flex items-start xl:items-center gap-2 flex-1 min-w-0 shrink-0">
                                            {linkedTemplate && (
                                              <button
                                                onClick={() =>
                                                  setSelectedTemplateIds(
                                                    (prev) =>
                                                      prev.indexOf(
                                                        linkedTemplate.id,
                                                      ) !== -1
                                                        ? prev.filter(
                                                            (id) =>
                                                              id !==
                                                              linkedTemplate.id,
                                                          )
                                                        : [
                                                            ...prev,
                                                            linkedTemplate.id,
                                                          ],
                                                  )
                                                }
                                                className={
                                                  "mt-0.5 xl:mt-0 flex-shrink-0 rounded-md flex items-center justify-center border transition-all " +
                                                  (isCompactView
                                                    ? "w-4 h-4"
                                                    : "w-5 h-5") +
                                                  " " +
                                                  (selectedTemplateIds.indexOf(
                                                    linkedTemplate.id,
                                                  ) !== -1
                                                    ? "bg-fuchsia-600 border-fuchsia-500 text-white"
                                                    : "bg-[#0A0D14]/40 backdrop-blur-xl border-slate-700 text-transparent hover:border-slate-500")
                                                }
                                              >
                                                <span className="text-[12px] font-medium tracking-wide font-medium tracking-wide font-black">
                                                  ✓
                                                </span>
                                              </button>
                                            )}
                                            {!linkedTemplate && (
                                              <div
                                                className={
                                                  "mt-0.5 xl:mt-0 flex-shrink-0 flex items-center justify-center text-slate-600 " +
                                                  (isCompactView
                                                    ? "w-4 h-4"
                                                    : "w-5 h-5")
                                                }
                                              >
                                                •
                                              </div>
                                            )}

                                            <div className="flex-1 min-w-0 flex flex-col justify-center shrink-0">
                                              <div className="flex items-center gap-2 group shrink-0 relative">
                                                <div
                                                  className={
                                                    "font-bold truncate flex items-center gap-1 cursor-pointer transition-all " +
                                                    (isCompactView
                                                      ? "text-[12px] font-medium tracking-wide"
                                                      : "text-[12px]") +
                                                    " " +
                                                    (linkedTemplate
                                                      ? "text-white"
                                                      : "text-slate-400")
                                                  }
                                                  onClick={() => {
                                                    if (linkedTemplate) {
                                                      setActivePreviewId(
                                                        linkedTemplate.id,
                                                      );
                                                      setActiveMappingTab(
                                                        linkedTemplate.id,
                                                      );
                                                    } else {
                                                      setEditingProcessNode({
                                                        type: "doc",
                                                        stageIndex,
                                                        docIndex,
                                                        oldName: doc.name,
                                                        newName: doc.name,
                                                      });
                                                    }
                                                  }}
                                                >
                                                  {linkedTemplate ? "📄" : "🗎"}{" "}
                                                  {doc.name}
                                                  {linkedTemplate &&
                                                    activePreviewId ===
                                                      linkedTemplate.id && (
                                                      <span className="text-[9px] px-1.5 py-0.5 bg-indigo-600 rounded text-white font-bold ml-1">
                                                        Đang xem
                                                      </span>
                                                    )}
                                                  {!doc.templateId && (
                                                    <span className="text-[9px] text-fuchsia-400/60 font-medium ml-1">
                                                      Trống File Word
                                                    </span>
                                                  )}
                                                  {linkedTemplate &&
                                                    !linkedTemplate.fileBuffer && (
                                                      <span className="text-[9px] text-red-400 font-bold ml-1 px-1 border border-red-900 rounded bg-red-950/50">
                                                        Lỗi mất file!
                                                      </span>
                                                    )}
                                                </div>
                                                <button
                                                  onClick={() =>
                                                    setEditingProcessNode({
                                                      type: "doc",
                                                      stageIndex,
                                                      docIndex,
                                                      oldName: doc.name,
                                                      newName: doc.name,
                                                    })
                                                  }
                                                  className="text-[12px] font-medium tracking-wide font-medium tracking-wide text-slate-500 hover:text-indigo-400 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                  ✏️
                                                </button>
                                                <button
                                                  onClick={() =>
                                                    handleDeleteProcessNode(
                                                      stageIndex,
                                                      docIndex,
                                                    )
                                                  }
                                                  className="text-[12px] font-medium tracking-wide font-medium tracking-wide text-slate-500 hover:text-red-400 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                  ✕
                                                </button>
                                              </div>
                                            </div>
                                          </div>

                                          <div className="flex flex-wrap items-center gap-1.5 pl-6 xl:pl-0 shrink-0 relative z-20">
                                            {linkedTemplate &&
                                              uploadedWorkbooks.length > 0 &&
                                              !isCompactView && (
                                                <div className="flex items-center border rounded border-slate-700/50 shadow-lg bg-[#0A0D14]/40 backdrop-blur-xl/50 px-1.5 py-1 box-border">
                                                  <select
                                                    value={
                                                      linkedTemplate.bindSheetKey ||
                                                      ""
                                                    }
                                                    onChange={(e) =>
                                                      handleBindSheetChange(
                                                        linkedTemplate.id,
                                                        e.target.value,
                                                      )
                                                    }
                                                    className="w-[85px] sm:w-[100px] text-[12px] font-medium tracking-wide font-medium tracking-wide font-bold outline-none cursor-pointer truncate bg-transparent text-slate-400 hover:text-white"
                                                  >
                                                    <option value="">
                                                      -- Dùng Sheet gốc --
                                                    </option>
                                                    {uploadedWorkbooks.map(
                                                      (wb) =>
                                                        wb.sheetNames.map(
                                                          (sName) => {
                                                            var key =
                                                              wb.fileName +
                                                              "|||" +
                                                              sName;
                                                            if (
                                                              selectedSheetKeys.indexOf(
                                                                key,
                                                              ) === -1
                                                            )
                                                              return null;
                                                            return (
                                                              <option
                                                                key={key}
                                                                value={key}
                                                                className="bg-[#0A0D14]/40 backdrop-blur-xl text-white"
                                                              >
                                                                {sName}
                                                              </option>
                                                            );
                                                          },
                                                        ),
                                                    )}
                                                  </select>
                                                </div>
                                              )}

                                            {!linkedTemplate && (
                                              <label
                                                className="bg-fuchsia-900/40 hover:bg-fuchsia-800 text-fuchsia-300 font-bold cursor-pointer transition-all flex items-center justify-center shrink-0 border border-fuchsia-800 text-[12px] font-medium tracking-wide font-medium tracking-wide px-2 py-1.5 rounded shadow-sm"
                                                title="Upload mẫu cho văn bản này"
                                                onClick={(e) =>
                                                  e.stopPropagation()
                                                }
                                              >
                                                📤 Gắn mẫu
                                                <input
                                                  type="file"
                                                  accept=".docx, .xlsx"
                                                  className="hidden"
                                                  onChange={(e) => {
                                                    const file =
                                                      e.target.files[0];
                                                    if (!file) return;
                                                    const existingTemplate =
                                                      loadedTemplates.find(
                                                        (t) =>
                                                          t.projectId ===
                                                            currentProjectId &&
                                                          t.originalName ===
                                                            file.name,
                                                      );
                                                    if (existingTemplate) {
                                                      setProjectStages(
                                                        (prev) => {
                                                          const next =
                                                            JSON.parse(
                                                              JSON.stringify(
                                                                prev,
                                                              ),
                                                            );
                                                          next[
                                                            currentProjectId
                                                          ][stageIndex].docs[
                                                            docIndex
                                                          ].templateId =
                                                            existingTemplate.id;
                                                          return next;
                                                        },
                                                      );
                                                      setSelectedTemplateIds(
                                                        (prev) =>
                                                          Array.from(
                                                            new Set([
                                                              ...prev,
                                                              existingTemplate.id,
                                                            ]),
                                                          ),
                                                      );
                                                      if (
                                                        existingTemplate.id &&
                                                        !activePreviewId
                                                      )
                                                        setActivePreviewId(
                                                          existingTemplate.id,
                                                        );
                                                      return;
                                                    }
                                                    // Upload flow
                                                    try {
                                                      var reader =
                                                        new FileReader();
                                                      reader.onload =
                                                        async function (evt) {
                                                          var buffer =
                                                            evt.target.result;
                                                          var PizZip =
                                                            window.PizZip;
                                                          var zip = new PizZip(
                                                            new Uint8Array(
                                                              buffer,
                                                            ),
                                                          );
                                                          var rawCleanText =
                                                            getCleanTextFromZip(
                                                              zip,
                                                            );
                                                          var parsed =
                                                            extractAllTags(
                                                              rawCleanText,
                                                            );
                                                          var newId =
                                                            "tpl_" +
                                                            Date.now() +
                                                            "_" +
                                                            Math.random()
                                                              .toString(36)
                                                              .substr(2, 5);
                                                          await saveBufferToDB(
                                                            newId,
                                                            buffer,
                                                          );
                                                          var newTemplate = {
                                                            id: newId,
                                                            projectId:
                                                              currentProjectId,
                                                            originalName:
                                                              file.name,
                                                            customName:
                                                              doc.name,
                                                            fileBuffer: buffer,
                                                            tags: parsed.uniqueTagNames,
                                                            rawTags:
                                                              parsed.uniqueRawTags,
                                                            tagTypes:
                                                              parsed.tagToTypeMap,
                                                            activeConfigs:
                                                              parsed.detectedConfigs,
                                                            bindSheetKey: "",
                                                            stage: stage.name,
                                                          };
                                                          setLoadedTemplates(
                                                            (prev) => [
                                                              ...prev,
                                                              newTemplate,
                                                            ],
                                                          );
                                                          setSelectedTemplateIds(
                                                            (prev) => [
                                                              ...prev,
                                                              newId,
                                                            ],
                                                          );
                                                          if (!activePreviewId)
                                                            setActivePreviewId(
                                                              newId,
                                                            );
                                                          setProjectStages(
                                                            (prev) => {
                                                              const next =
                                                                JSON.parse(
                                                                  JSON.stringify(
                                                                    prev,
                                                                  ),
                                                                );
                                                              next[
                                                                currentProjectId
                                                              ][
                                                                stageIndex
                                                              ].docs[
                                                                docIndex
                                                              ].templateId =
                                                                newId;
                                                              return next;
                                                            },
                                                          );
                                                          showToast(
                                                            "Đã tải lên và gắn tệp: " +
                                                              doc.name,
                                                          );
                                                        };
                                                      reader.readAsArrayBuffer(
                                                        file,
                                                      );
                                                    } catch (err) {
                                                      showToast(
                                                        "Lỗi upload: " +
                                                          err.message,
                                                        "error",
                                                      );
                                                    }
                                                    e.target.value = "";
                                                  }}
                                                />
                                              </label>
                                            )}

                                            {linkedTemplate && (
                                              <div className="flex gap-1 shrink-0">
                                                <button
                                                  onClick={() =>
                                                    setEditingTemplate({
                                                      ...linkedTemplate,
                                                      tags: [
                                                        ...linkedTemplate.tags,
                                                      ],
                                                      rawTags:
                                                        linkedTemplate.rawTags
                                                          ? [
                                                              ...linkedTemplate.rawTags,
                                                            ]
                                                          : [],
                                                    })
                                                  }
                                                  className={
                                                    "border rounded bg-white/[0.03] backdrop-blur-md border-slate-700 text-slate-300 hover:text-white " +
                                                    (isCompactView
                                                      ? "text-[9px] px-1.5 py-0.5"
                                                      : "text-[12px] font-medium tracking-wide font-medium tracking-wide px-2 py-1")
                                                  }
                                                  title="Cấu hình thẻ biến"
                                                >
                                                  ✏{" "}
                                                  {isCompactView
                                                    ? "Biến"
                                                    : "Thẻ biến"}
                                                </button>
                                                <button
                                                  onClick={() => {
                                                    setConfirmModal({
                                                      show: true,
                                                      title: "Gỡ tệp",
                                                      desc: "Bạn có chắc muốn gỡ tệp mẫu khỏi Mục văn bản này không?",
                                                      btnConfirm: "Gỡ",
                                                      action: () => {
                                                        setProjectStages(
                                                          (prev) => {
                                                            const next =
                                                              JSON.parse(
                                                                JSON.stringify(
                                                                  prev,
                                                                ),
                                                              );
                                                            delete next[
                                                              currentProjectId
                                                            ][stageIndex].docs[
                                                              docIndex
                                                            ].templateId;
                                                            return next;
                                                          },
                                                        );
                                                        setConfirmModal({
                                                          show: false,
                                                          action: null,
                                                          title: "",
                                                          desc: "",
                                                        });
                                                      },
                                                    });
                                                  }}
                                                  className={
                                                    "border rounded bg-white/[0.03] backdrop-blur-md border-slate-700 text-slate-500 hover:text-red-400 " +
                                                    (isCompactView
                                                      ? "text-[9px] px-1 py-0.5"
                                                      : "text-[12px] font-medium tracking-wide font-medium tracking-wide px-1.5 py-1")
                                                  }
                                                  title="Gỡ file đính kèm"
                                                >
                                                  ✕
                                                </button>
                                              </div>
                                            )}

                                            <select
                                              value={doc.status}
                                              onChange={(e) => {
                                                const newStatus =
                                                  e.target.value;
                                                setProjectStages((prev) => {
                                                  const next = JSON.parse(
                                                    JSON.stringify(prev),
                                                  );
                                                  next[currentProjectId][
                                                    stageIndex
                                                  ].docs[docIndex].status =
                                                    newStatus;
                                                  return next;
                                                });
                                                if (newStatus === "Đã ký") {
                                                  const pName =
                                                    projects.find(
                                                      (p) =>
                                                        p.id ===
                                                        currentProjectId,
                                                    )?.name || "Dự án";
                                                  setApprovalHistory((prev) => [
                                                    {
                                                      id: Math.random().toString(),
                                                      time: new Date().toLocaleString(
                                                        "vi-VN",
                                                      ),
                                                      projectName: pName,
                                                      docName: doc.name,
                                                    },
                                                    ...prev,
                                                  ]);
                                                  showToast(
                                                    "Đã lưu lịch sử: Ký duyệt " +
                                                      doc.name,
                                                  );
                                                }
                                              }}
                                              className={
                                                "font-bold outline-none border cursor-pointer shrink-0 " +
                                                (isCompactView
                                                  ? "text-[9px] px-1 py-0.5 rounded"
                                                  : "text-[12px] font-medium tracking-wide font-medium tracking-wide px-1.5 py-1 rounded-md") +
                                                " " +
                                                (doc.status === "Đã ký"
                                                  ? "bg-emerald-900/40 text-emerald-400 border-emerald-800"
                                                  : doc.status === "Đang soạn"
                                                    ? "bg-amber-900/40 text-amber-500 border-amber-800"
                                                    : "bg-[#0A0D14]/40 backdrop-blur-xl text-slate-400 border-slate-700/50 shadow-lg")
                                              }
                                            >
                                              <option value="Chưa soạn">
                                                Chưa soạn
                                              </option>
                                              <option value="Đang soạn">
                                                Đang soạn
                                              </option>
                                              <option value="Đã ký">
                                                Đã ký
                                              </option>
                                            </select>
                                          </div>
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <div className="text-center py-3 text-[12px] font-medium tracking-wide font-medium tracking-wide text-slate-500 italic block">
                                      Giai đoạn này chưa có mục văn bản nào.
                                      Nhấn &quot;+ Mục Mới&quot; để thêm.
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          },
                        )}

                        {(function () {
                          const boundTemplateIds = new Set();
                          (projectStages[currentProjectId] || []).forEach(
                            (st) =>
                              st.docs?.forEach((d) => {
                                if (d.templateId)
                                  boundTemplateIds.add(d.templateId);
                              }),
                          );
                          const uncategorized = activeProjectTemplates.filter(
                            (t) => !boundTemplateIds.has(t.id),
                          );

                          if (uncategorized.length === 0) return null;

                          return (
                            <div className="border border-slate-700/50 shadow-lg/80 rounded-xl bg-[#0A0D14]/40 backdrop-blur-xl/20 pb-2 overflow-hidden shadow-sm mt-4">
                              <div className="bg-[#0A0D14]/40 backdrop-blur-xl/50 px-4 py-2 flex justify-between items-center border-b border-slate-700/50 shadow-lg/80 opacity-70">
                                <span className="text-[12px] font-medium tracking-wide font-medium tracking-wide font-black text-slate-400 uppercase tracking-wider">
                                  🗂️ TỆP ĐÃ TẢI LÊN CHƯA PHÂN VÀO CÂY QUY TRÌNH
                                  ({uncategorized.length})
                                </span>
                              </div>
                              <div className="p-2 flex flex-col gap-2 relative">
                                {uncategorized.map((t, tIndex) => {
                                  var isChecked =
                                    selectedTemplateIds.indexOf(t.id) !== -1;
                                  return (
                                    <div
                                      key={t.id}
                                      className={
                                        "flex flex-col xl:flex-row xl:items-center justify-between transition-all bg-[#0A0D14]/40 backdrop-blur-xl border hover:border-slate-700 " +
                                        (isChecked
                                          ? "border-slate-700 shadow-sm"
                                          : "border-slate-700/50 shadow-lg") +
                                        " " +
                                        (isCompactView
                                          ? "gap-2 p-1.5 rounded-lg text-[13px] leading-relaxed"
                                          : "gap-3 p-3 rounded-xl text-sm")
                                      }
                                    >
                                      <div className="flex items-start xl:items-center gap-2 flex-1 min-w-0 shrink-0">
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
                                            "mt-0.5 xl:mt-0 flex-shrink-0 rounded-md flex items-center justify-center border transition-all " +
                                            (isCompactView
                                              ? "w-4 h-4"
                                              : "w-5 h-5") +
                                            " " +
                                            (isChecked
                                              ? "bg-slate-600 border-slate-500 text-white"
                                              : "bg-[#0A0D14]/40 backdrop-blur-xl border-slate-700 text-transparent hover:border-slate-500")
                                          }
                                        >
                                          <span className="text-[12px] font-medium tracking-wide font-medium tracking-wide font-black">
                                            ✓
                                          </span>
                                        </button>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center shrink-0">
                                          <div
                                            className={
                                              "font-bold truncate cursor-pointer transition-all " +
                                              (isCompactView
                                                ? "text-[12px] font-medium tracking-wide"
                                                : "text-[12px]") +
                                              " " +
                                              (isChecked
                                                ? "text-white"
                                                : "text-slate-400")
                                            }
                                            onClick={() => {
                                              setActivePreviewId(t.id);
                                              setActiveMappingTab(t.id);
                                              setActiveSingleMappingTab(t.id);
                                            }}
                                          >
                                            📄 {t.customName || t.originalName}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex flex-wrap items-center gap-1.5 pl-6 xl:pl-0 shrink-0 relative z-20">
                                        {uploadedWorkbooks.length > 0 &&
                                          !isCompactView && (
                                            <div className="flex items-center border rounded border-slate-700/50 shadow-lg bg-[#0A0D14]/40 backdrop-blur-xl/50 px-1.5 py-1 box-border">
                                              <select
                                                value={t.bindSheetKey || ""}
                                                onChange={(e) =>
                                                  handleBindSheetChange(
                                                    t.id,
                                                    e.target.value,
                                                  )
                                                }
                                                className="w-[85px] sm:w-[100px] text-[12px] font-medium tracking-wide font-medium tracking-wide font-bold outline-none cursor-pointer truncate bg-transparent text-slate-400 hover:text-white"
                                              >
                                                <option value="">
                                                  -- Dùng Sheet gốc --
                                                </option>
                                                {uploadedWorkbooks.map((wb) =>
                                                  wb.sheetNames.map((sName) => {
                                                    var key =
                                                      wb.fileName +
                                                      "|||" +
                                                      sName;
                                                    if (
                                                      selectedSheetKeys.indexOf(
                                                        key,
                                                      ) === -1
                                                    )
                                                      return null;
                                                    return (
                                                      <option
                                                        key={key}
                                                        value={key}
                                                        className="bg-[#0A0D14]/40 backdrop-blur-xl text-white"
                                                      >
                                                        {sName}
                                                      </option>
                                                    );
                                                  }),
                                                )}
                                              </select>
                                            </div>
                                          )}
                                        <div className="flex gap-1 shrink-0">
                                          <button
                                            onClick={() =>
                                              setEditingTemplate({
                                                ...t,
                                                tags: [...t.tags],
                                                rawTags: t.rawTags
                                                  ? [...t.rawTags]
                                                  : [],
                                              })
                                            }
                                            className={
                                              "border rounded bg-white/[0.03] backdrop-blur-md border-slate-700 text-slate-300 hover:text-white " +
                                              (isCompactView
                                                ? "text-[9px] px-1.5 py-0.5"
                                                : "text-[12px] font-medium tracking-wide font-medium tracking-wide px-2 py-1")
                                            }
                                            title="Cấu hình thẻ biến"
                                          >
                                            ✏{" "}
                                            {isCompactView
                                              ? "Biến"
                                              : "Thẻ biến"}
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleDeleteTemplate(t.id)
                                            }
                                            className={
                                              "border rounded bg-white/[0.03] backdrop-blur-md border-slate-700 text-slate-500 hover:text-red-400 " +
                                              (isCompactView
                                                ? "text-[9px] px-1 py-0.5"
                                                : "text-[12px] font-medium tracking-wide font-medium tracking-wide px-1.5 py-1")
                                            }
                                            title="Xóa file tải lên"
                                          >
                                            ✕
                                          </button>
                                        </div>
                                        {/* Menu gắn vào quy trình */}
                                        <div className="border border-fuchsia-900/50 rounded flex items-center bg-fuchsia-950/30 px-1 py-1 shrink-0">
                                          <select
                                            onChange={(e) => {
                                              if (!e.target.value) return;
                                              const sIdx = parseInt(e.target.value);
                                              const docName = t.customName || t.originalName || "Tài liệu mới";
                                              setProjectStages((prev) => {
                                                const next = JSON.parse(JSON.stringify(prev));
                                                next[currentProjectId][sIdx].docs.push({
                                                  id: "d_" + Date.now(),
                                                  name: docName,
                                                  status: "Chưa soạn",
                                                  templateId: t.id,
                                                });
                                                return next;
                                              });
                                              e.target.value = "";
                                            }}
                                            className="text-[9px] font-bold text-fuchsia-300 outline-none bg-transparent cursor-pointer w-[90px] sm:w-[110px] truncate"
                                          >
                                            <option value="" className="bg-slate-800 text-slate-200">
                                              👉 Gắn vào mục...
                                            </option>
                                            {(projectStages[currentProjectId] || []).map((st, sid) => (
                                              <option
                                                key={st.id}
                                                value={sid}
                                                className="bg-slate-800 text-slate-200"
                                              >
                                                {st.name}
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
    </>
  );
};

export default ProcessModal;
