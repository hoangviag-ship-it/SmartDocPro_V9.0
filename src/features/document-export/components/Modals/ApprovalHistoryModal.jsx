import React from "react";

const ApprovalHistoryModal = ({
  isApprovalHistoryModalOpen,
  setIsApprovalHistoryModalOpen,
  approvalHistory,
  setApprovalHistory,
  setConfirmModal
}) => {
  if (!isApprovalHistoryModalOpen) return null;
  return (
    <>
      {isApprovalHistoryModalOpen && (
                <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-[#0A0D14]/40 backdrop-blur-xl/90 backdrop-blur-sm animate-fade-in">
                  <div className="bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg rounded-2xl w-full max-w-4xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-700 flex flex-col max-h-[90vh]">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-slate-700/50 shadow-lg bg-[#0A0D14]/40 backdrop-blur-xl rounded-t-2xl shrink-0">
                      <div>
                        <h3 className="text-sm font-black text-amber-400 uppercase tracking-wide flex items-center gap-2">
                          <span>✍️</span> LỊCH SỬ KÝ DUYỆT VĂN BẢN
                        </h3>
                        <p className="text-[12px] font-medium tracking-wide font-medium tracking-wide text-slate-400 mt-1">
                          Lưu vết tự động khi văn bản chuyển trạng thái &quot;Đã Ký&quot;.
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setConfirmModal({
                              show: true,
                              title: "Xóa lịch sử",
                              desc: "Bạn có chắc chắn muốn xóa toàn bộ lịch sử ký duyệt?",
                              btnConfirm: "Xóa",
                              action: () => {
                                setApprovalHistory([]);
                                setConfirmModal({
                                  show: false,
                                  action: null,
                                  title: "",
                                  desc: "",
                                });
                              },
                            });
                          }}
                          className="px-3 py-1.5 bg-red-950/50 hover:bg-red-900 text-red-500 rounded-lg text-[13px] leading-relaxed font-bold border border-red-900/50"
                        >
                          🧹 Xóa Lịch sử
                        </button>
                        <button
                          onClick={() => setIsApprovalHistoryModalOpen(false)}
                          className="w-8 h-8 bg-white/[0.03] backdrop-blur-md hover:bg-white/[0.06] backdrop-blur-lg text-slate-400 rounded-lg flex items-center justify-center text-sm transition-all"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-0 flex flex-col custom-scrollbar bg-[#0A0D14]/40 backdrop-blur-xl">
                      {approvalHistory.length === 0 ? (
                        <div className="p-10 text-center text-slate-500 flex flex-col items-center">
                          <span className="text-3xl mb-2 opacity-50">📭</span>
                          <p className="text-sm">
                            Chưa có lịch sử ký duyệt nào.
                          </p>
                        </div>
                      ) : (
                        <table className="w-full text-left text-[13px] leading-relaxed border-collapse">
                          <thead className="bg-[#0A0D14]/40 backdrop-blur-xl sticky top-0 z-10 shadow-md">
                            <tr>
                              <th className="px-4 py-3 font-bold text-slate-400 border-b border-slate-700/50 shadow-lg">
                                Thời gian
                              </th>
                              <th className="px-4 py-3 font-bold text-slate-400 border-b border-slate-700/50 shadow-lg">
                                Dự án
                              </th>
                              <th className="px-4 py-3 font-bold text-slate-400 border-b border-slate-700/50 shadow-lg">
                                Văn bản hoàn thành
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {approvalHistory.map((item, idx) => (
                              <tr
                                key={item.id || idx}
                                className="hover:bg-white/[0.03] backdrop-blur-md/50 border-b border-slate-700/50 shadow-lg/50 transition-all"
                              >
                                <td className="px-4 py-3 font-mono text-slate-300 w-40 whitespace-nowrap">
                                  {item.time}
                                </td>
                                <td
                                  className="px-4 py-3 font-bold text-sky-300 max-w-[200px] truncate"
                                  title={item.projectName}
                                >
                                  {item.projectName}
                                </td>
                                <td className="px-4 py-3 font-medium text-emerald-300">
                                  {item.docName}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              )}
    </>
  );
};

export default ApprovalHistoryModal;
