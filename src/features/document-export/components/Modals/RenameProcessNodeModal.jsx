import React from "react";

const RenameProcessNodeModal = ({
  editingProcessNode,
  setEditingProcessNode,
  handleSaveEditProcessNode
}) => {
  if (!editingProcessNode) return null;
  return (
    <>
      {editingProcessNode && (
                <div className="fixed inset-0 z-[165] flex items-center justify-center p-4 bg-[#0A0D14]/40 backdrop-blur-xl/90 backdrop-blur-sm animate-fade-in">
                  <div className="bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg rounded-2xl w-full max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-700 flex flex-col">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-slate-700/50 shadow-lg bg-[#0A0D14]/40 backdrop-blur-xl rounded-t-2xl shrink-0">
                      <h3 className="text-sm font-black text-indigo-400 uppercase tracking-wide flex items-center gap-2">
                        <span>✏️</span> CHỈNH SỬA TÊN
                      </h3>
                      <button
                        onClick={() => setEditingProcessNode(null)}
                        className="w-8 h-8 bg-white/[0.03] backdrop-blur-md hover:bg-white/[0.06] backdrop-blur-lg text-slate-400 rounded-lg flex items-center justify-center text-sm transition-all focus:outline-none"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="p-6 flex flex-col gap-6 bg-[#0A0D14]/40 backdrop-blur-xl overflow-y-auto">
                      <div className="flex flex-col gap-2">
                        <label className="text-[13px] leading-relaxed font-bold text-slate-400">
                          Tên mới:
                        </label>
                        <input
                          type="text"
                          value={editingProcessNode.newName}
                          onChange={(e) =>
                            setEditingProcessNode({
                              ...editingProcessNode,
                              newName: e.target.value,
                            })
                          }
                          placeholder="Nhập tên..."
                          className="w-full bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700 text-white px-3 py-2.5 rounded-xl outline-none focus:border-indigo-500 transition-all font-bold text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-700/50 shadow-lg shrink-0 bg-[#0A0D14]/40 backdrop-blur-xl rounded-b-2xl">
                      <button
                        onClick={() => setEditingProcessNode(null)}
                        className="px-5 py-2.5 bg-white/[0.03] backdrop-blur-md hover:bg-white/[0.06] backdrop-blur-lg text-slate-300 rounded-xl text-[13px] leading-relaxed font-bold transition-all border border-slate-700"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={() => handleSaveEditProcessNode()}
                        disabled={!editingProcessNode.newName.trim()}
                        className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] backdrop-blur-sm border border-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.2)] text-white rounded-xl text-[13px] leading-relaxed font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span>💾</span> Lưu Thay Đổi
                      </button>
                    </div>
                  </div>
                </div>
              )}
    </>
  );
};

export default RenameProcessNodeModal;
