import React from "react";
import { safeDeepClone } from "../../../utils/helpers";

const TopNavbar = ({
  setConfirmModal,
  setActivePreviewId,
  setFormHistory,
  setHistoryIndex,
  currentProjectId,
  setCurrentProjectId,
  projects,
  formData,
  setFormData,
  setProjectStages,
  setAppRoute,
  setIsAddStageModalOpen,
  setIsSettingsModalOpen,
  projectProfiles,
  setEditingProjectProfile,
  setProjectWizardStep,
  setWizardTemplateSelection,
  setWizardSelectedCloneProjId,
  setIsProjectModalOpen,
  duplicateProject,
  triggerDeleteProject,
  activeProjectTemplates
}) => {
  return (
    <>
      {/* TOP NAVBAR STICKY - RE-STYLED FOR CONTENT AREA */}
        <div className={`flex shrink-0 bg-[#0A0D14]/60 backdrop-blur-2xl border-b border-indigo-900/40 shadow-[0_4px_30px_rgba(0,0,0,0.5)] w-full py-2.5 px-4 flex-col md:flex-row items-center justify-between gap-4 shadow-sm z-30`}>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-[#0f172a]/80 backdrop-blur-xl border border-indigo-500/30 hover:border-indigo-400/60 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] px-2 py-1 transition-all flex-shrink-0 relative focus-within:border-indigo-500">
              <span className="text-[12px] font-bold tracking-wider text-indigo-300 uppercase hidden xl:block">
                Dự án:
              </span>
              <select
                value={currentProjectId}
                onChange={function (e) {
                  var nextId = e.target.value;
                  var hasData = Object.values(formData).some(function (v) {
                    return v && v !== "";
                  });
                  if (hasData) {
                    setConfirmModal({
                      show: true,
                      title: "Chuyển dự án",
                      desc: "Bạn đang có dữ liệu trong form gốc. Chuyển dự án sẽ làm trắng form hiện tại. Tiếp tục?",
                      btnConfirm: "Chuyển",
                      action: function () {
                        setConfirmModal({
                          show: false,
                          action: null,
                          title: "",
                          desc: "",
                        });
                        setCurrentProjectId(nextId);
                        setFormData({});
                        setActivePreviewId("");
                        setFormHistory([{}]);
                        setHistoryIndex(0);
                      },
                    });
                    return;
                  }
                  setCurrentProjectId(nextId);
                  setFormData({});
                  setActivePreviewId("");
                  setFormHistory([{}]);
                  setHistoryIndex(0);
                }}
                className="bg-transparent text-[13px] leading-relaxed sm:text-sm outline-none font-bold text-white cursor-pointer w-24 sm:w-48 truncate z-10 relative appearance-none pr-6"
              >
                {projects.map(function (p) {
                  return (
                    <option key={p.id} value={p.id} className="bg-[#0A0D14]/40 backdrop-blur-xl">
                      {p.name}
                    </option>
                  );
                })}
              </select>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[12px] font-medium tracking-wide font-medium tracking-wide text-slate-500 pointer-events-none">
                ▼
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {currentProjectId !== "proj_default" && (
                <>
                  <button
                    onClick={() => {
                      const currentProj = projects.find(
                        (p) => p.id === currentProjectId,
                      );
                      let profile = projectProfiles[currentProjectId];
                      if (!profile) {
                        profile = {
                          id: currentProjectId,
                          fields: [
                            {
                              id: Math.random().toString(),
                              k: "Ma_Du_An",
                              n: "Mã Dự án",
                              v: "",
                            },
                            {
                              id: Math.random().toString(),
                              k: "Ten_Du_An",
                              n: "Tên Dự án",
                              v: currentProj?.name || "",
                            },
                            {
                              id: Math.random().toString(),
                              k: "Cap_QDDT",
                              n: "Cấp Quyết định Đầu tư",
                              v: "",
                            },
                            {
                              id: Math.random().toString(),
                              k: "Chu_Dau_Tu",
                              n: "Chủ Đầu tư",
                              v: "",
                            },
                            {
                              id: Math.random().toString(),
                              k: "Phong_Ban_Chuyen_Mon",
                              n: "Phòng ban Chuyên môn",
                              v: "",
                            },
                            {
                              id: Math.random().toString(),
                              k: "Tong_Muc_Dau_Tu",
                              n: "Tổng Mức Đầu tư",
                              v: "",
                            },
                            {
                              id: Math.random().toString(),
                              k: "Nguon_Von",
                              n: "Nguồn Vốn",
                              v: "",
                            },
                            {
                              id: Math.random().toString(),
                              k: "Nha_Thau_Khao_Sat",
                              n: "Nhà thầu Khảo sát",
                              v: "",
                            },
                            {
                              id: Math.random().toString(),
                              k: "Nha_Thau_Thiet_Ke",
                              n: "Nhà thầu Thiết kế",
                              v: "",
                            },
                            {
                              id: Math.random().toString(),
                              k: "Nha_Thau_Tham_Tra",
                              n: "Nhà thầu Thẩm tra",
                              v: "",
                            },
                            {
                              id: Math.random().toString(),
                              k: "Nha_Thau_Dau_Thau",
                              n: "Nhà thầu Đấu thầu",
                              v: "",
                            },
                            {
                              id: Math.random().toString(),
                              k: "Nha_Thau_Thi_Cong",
                              n: "Nhà thầu Thi công",
                              v: "",
                            },
                            {
                              id: Math.random().toString(),
                              k: "Nha_Thau_Giam_Sat",
                              n: "Nhà thầu Giám sát",
                              v: "",
                            },
                          ],
                        };
                      }

                      const clonedProfile = safeDeepClone(profile);
                      clonedProfile.id = currentProjectId;
                      clonedProfile.name = currentProj?.name || "";
                      clonedProfile.maDA = currentProj?.maDA || "";
                      clonedProfile.description =
                        currentProj?.description || "";
                      if (!clonedProfile.stakeholders)
                        clonedProfile.stakeholders = [];
                      if (!clonedProfile.assignedUsers)
                        clonedProfile.assignedUsers = [];

                      setEditingProjectProfile(clonedProfile);
                      setProjectWizardStep(1);
                      setWizardTemplateSelection({ type: "empty" });
                      setWizardSelectedCloneProjId("");
                      setIsProjectModalOpen(true);
                    }}
                    className="text-[13px] leading-relaxed text-slate-400 hover:text-indigo-400 p-1.5 bg-[#0A0D14]/40 backdrop-blur-xl rounded border border-slate-700"
                    title="Cấu hình Dự án (Tên, Mã DA, CĐT...)"
                  >
                    ⚙️
                  </button>
                  <button
                    onClick={() => triggerDeleteProject(currentProjectId)}
                    className="text-[13px] leading-relaxed text-slate-400 hover:text-red-400 p-1.5 bg-[#0A0D14]/40 backdrop-blur-xl rounded border border-slate-700"
                    title="Xóa Dự án"
                  >
                    🗑️
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 hide-scrollbar shrink-0 max-w-full justify-start md:justify-end">
          </div>
        </div>

        
    </>
  );
};

export default TopNavbar;
