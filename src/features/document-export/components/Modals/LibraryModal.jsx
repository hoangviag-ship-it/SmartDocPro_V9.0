import React from "react";

const LibraryModal = ({
  isLibraryModalOpen,
  setIsLibraryModalOpen,
  globalDictionary,
  setGlobalDictionary,
  loadedTemplates,
  handleDeleteFromLibrary,
  handleExtractFromLibrary
}) => {
  if (!isLibraryModalOpen) return null;
  return (
    <>
      {isLibraryModalOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-[#0A0D14]/40 backdrop-blur-xl/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-700 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-700/50 shadow-lg bg-[#0A0D14]/40 backdrop-blur-xl/50">
              <div className="flex items-center gap-2">
                <span className="text-xl">📚</span>
                <div>
                  <h3 className="text-sm font-black text-white uppercase">
                    Kho Mẫu Hệ Thống
                  </h3>
                  <p className="text-[12px] font-medium tracking-wide font-medium tracking-wide text-slate-400 mt-0.5">
                    Biểu mẫu dùng chung cho tất cả dự án
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLibraryModalOpen(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                ✖
              </button>
            </div>
            <div className="overflow-y-auto p-4 flex-1">
              {loadedTemplates.filter((t) => t.projectId === "GLOBAL_LIBRARY")
                .length === 0 ? (
                <div className="text-center py-10 opacity-70">
                  <span className="text-4xl mb-2 block">📭</span>
                  <p className="text-slate-400 text-[13px] leading-relaxed mt-2">
                    Thư viện chưa có biểu mẫu nào.
                  </p>
                  <p className="text-slate-500 text-[12px] font-medium tracking-wide font-medium tracking-wide mt-1">
                    Lưu các mẫu thường dùng từ dự án vào đây để tái sử dụng
                    nhanh chóng.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {loadedTemplates
                    .filter((t) => t.projectId === "GLOBAL_LIBRARY")
                    .map((t) => (
                      <div
                        key={t.id}
                        className="bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg p-3 rounded-xl flex flex-col gap-2 relative group transition-all hover:border-emerald-600/50"
                      >
                        <div className="flex justify-between items-start">
                          <div
                            className="font-bold text-[13px] leading-relaxed text-white truncate max-w-[80%]"
                            title={t.customName || t.originalName}
                          >
                            📄 {t.customName || t.originalName}
                          </div>
                          <button
                            onClick={(e) => handleDeleteFromLibrary(e, t.id)}
                            className="text-[12px] font-medium tracking-wide font-medium tracking-wide text-slate-600 hover:text-red-400 bg-[#0A0D14]/40 backdrop-blur-xl rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Xóa khỏi thư viện"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="text-[12px] font-medium tracking-wide font-medium tracking-wide text-slate-500 truncate mt-1">
                          File gốc: {t.originalName}
                        </div>
                        <div className="mt-2 text-right">
                          <button
                            onClick={(e) => handleExtractFromLibrary(e, t.id)}
                            className="w-full text-[12px] font-medium tracking-wide font-medium tracking-wide bg-emerald-900/30 hover:bg-emerald-600 text-emerald-400 hover:text-white px-2 py-1.5 rounded-lg font-bold border border-emerald-900/50 transition-all"
                          >
                            ➕ Thêm vào Dự án
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LibraryModal;
