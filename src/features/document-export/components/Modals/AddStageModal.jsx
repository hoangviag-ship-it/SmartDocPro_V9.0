import React from "react";

const AddStageModal = ({
  isAddStageModalOpen,
  setIsAddStageModalOpen,
  newStageInput,
  setNewStageInput,
  handleAddProcessStage,
  FIXED_STAGES_SUGGESTIONS,
  projectStages,
  currentProjectId
}) => {
  if (!isAddStageModalOpen) return null;
  return (
    <>
      {isAddStageModalOpen && (
                <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-[#0A0D14]/40 backdrop-blur-xl/90 backdrop-blur-sm animate-fade-in">
                  <div className="bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg rounded-2xl w-full max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-700 flex flex-col">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-slate-700/50 shadow-lg bg-[#0A0D14]/40 backdrop-blur-xl rounded-t-2xl shrink-0">
                      <h3 className="text-sm font-black text-emerald-400 uppercase tracking-wide flex items-center gap-2">
                        <span>➕</span> THÊM GIAI ĐOẠN / NHÓM MỚI
                      </h3>
                      <button
                        onClick={() => setIsAddStageModalOpen(false)}
                        className="w-8 h-8 bg-white/[0.03] backdrop-blur-md hover:bg-white/[0.06] backdrop-blur-lg text-slate-400 rounded-lg flex items-center justify-center text-sm transition-all focus:outline-none"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="p-6 flex flex-col gap-6 bg-[#0A0D14]/40 backdrop-blur-xl overflow-y-auto">
                      <div className="flex flex-col gap-2">
                        <label className="text-[13px] leading-relaxed font-bold text-slate-400">
                          Tên giai đoạn / nhóm mới:
                        </label>
                        <input
                          type="text"
                          value={newStageInput}
                          onChange={(e) => setNewStageInput(e.target.value)}
                          placeholder="Nhập tên..."
                          className="w-full bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700 text-white px-3 py-2.5 rounded-xl outline-none focus:border-emerald-500 transition-all font-bold text-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-3">
                        <label className="text-[13px] leading-relaxed font-bold text-slate-400">
                          Gợi ý chọn nhanh (15 Giai đoạn chuẩn):
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                          {FIXED_STAGES_SUGGESTIONS.map((sg) => {
                            const exists = (
                              projectStages[currentProjectId] || []
                            ).some(
                              (s) => s.name.toLowerCase() === sg.toLowerCase(),
                            );
                            return (
                              <button
                                key={sg}
                                disabled={exists}
                                onClick={() => setNewStageInput(sg)}
                                className={
                                  "text-left text-[12px] font-medium tracking-wide font-bold px-3 py-2 rounded-lg border transition-all " +
                                  (exists
                                    ? "bg-[#0A0D14]/40 backdrop-blur-xl/50 border-slate-700/50 shadow-lg text-slate-600 cursor-not-allowed opacity-50"
                                    : newStageInput === sg
                                      ? "bg-emerald-900/30 border-emerald-600 text-emerald-400"
                                      : "bg-[#0A0D14]/40 backdrop-blur-xl border-slate-700/50 shadow-lg text-slate-300 hover:border-slate-600 hover:bg-white/[0.03] backdrop-blur-md")
                                }
                              >
                                {sg}
                                {exists && (
                                  <span className="ml-2 text-[9px] text-red-500 bg-red-950/50 px-1 rounded">
                                    Đã có
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-700/50 shadow-lg shrink-0 bg-[#0A0D14]/40 backdrop-blur-xl rounded-b-2xl">
                      <button
                        onClick={() => setIsAddStageModalOpen(false)}
                        className="px-5 py-2.5 bg-white/[0.03] backdrop-blur-md hover:bg-white/[0.06] backdrop-blur-lg text-slate-300 rounded-xl text-[13px] leading-relaxed font-bold transition-all border border-slate-700"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => handleAddProcessStage(newStageInput)}
                        disabled={!newStageInput.trim()}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[13px] leading-relaxed font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span>➕</span> Thêm vào Quy trình
                      </button>
                    </div>
                  </div>
                </div>
              )}
    </>
  );
};

export default AddStageModal;
