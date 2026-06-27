import React from "react";
const SettingsModal = ({
  isSettingsModalOpen,
  setIsSettingsModalOpen,
  geminiApiKey,
  setGeminiApiKey,
  clearGeminiKey,
  handleExportBackup,
  handleImportBackup,
  backupReminderInterval,
  setBackupReminderInterval,
  isFullScreen,
  setIsFullScreen,
  screenResolution,
  setScreenResolution,
  exportMode,
  setExportMode,
  storeExportSubFolderPattern,
  setStoreExportSubFolderPattern,
  storeEnableHighlight,
  setStoreEnableHighlight,
  storeCleanUnusedTags,
  setStoreCleanUnusedTags,
  SDE_UID,
  showToast
}) => {
  if (!isSettingsModalOpen) return null;
  return (
    <>
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#0A0D14]/40 backdrop-blur-xl/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg rounded-2xl w-full max-w-4xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-700 max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-black text-white uppercase mb-4 flex items-center gap-2">
              <span>⚙️</span> Cài đặt hệ thống
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-5 pb-5 border-b border-slate-700/50 shadow-lg">
                  <label className="text-[12px] font-medium tracking-wide font-medium tracking-wide font-bold text-slate-400 block mb-1">
                    Gemini API Key (Tích hợp AI):
                  </label>
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => {
                      setGeminiApiKey(e.target.value);
                      localStorage.setItem(
                        "sde_gemini_key_v2",
                        window.btoa(e.target.value),
                      );
                    }}
                    placeholder="Dán mã API Key tại đây..."
                    className="w-full px-3 py-2.5 mb-2 bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg rounded-xl text-[13px] leading-relaxed text-white outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {geminiApiKey && (
                    <button
                      onClick={clearGeminiKey}
                      className="w-full mb-3 py-1.5 bg-red-950/40 border border-red-900/50 text-red-400 text-[12px] font-medium tracking-wide font-medium tracking-wide font-bold rounded-lg hover:bg-red-900/50 transition-all flex items-center justify-center gap-1.5"
                    >
                      🗑️ Xóa API Key khỏi trình duyệt
                    </button>
                  )}
                  <div className="bg-amber-950/20 border border-amber-900/40 rounded-lg p-3">
                    <p className="text-[12px] font-medium tracking-wide font-medium tracking-wide text-amber-400 font-bold leading-relaxed">
                      ⚠️ API Key được lưu an toàn tại thiết bị.
                    </p>
                  </div>
                </div>
                <div className="mb-5 pb-5 border-b border-slate-700/50 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-black text-sky-400 block">
                      💾 Đồng Bộ / Không Gian Làm Việc (.sde):
                    </label>
                  </div>
                  <p className="text-[12px] font-medium tracking-wide font-medium tracking-wide text-slate-400 mb-3 leading-relaxed">
                    Đóng gói toàn bộ dự án, form, quy trình, tệp mẫu Word/Excel
                    vào 1 file (.sde) duy nhất. Bạn có thể gửi file này sang máy
                    khác để tải lại <b>an toàn 100%</b>, không sợ rò rỉ bảo mật
                    như Google Drive/Firebase.
                  </p>
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={handleExportBackup}
                      className="flex-1 px-4 py-2 bg-sky-950/40 hover:bg-sky-900 border border-sky-900/50 text-sky-400 rounded-xl text-[12px] font-medium tracking-wide font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <span>⬇️</span> Xuất File Đồng Bộ
                    </button>
                    <label className="flex-1 px-4 py-2 bg-emerald-950/40 hover:bg-emerald-900 border border-emerald-900/50 text-emerald-400 rounded-xl text-[12px] font-medium tracking-wide font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95">
                      <span>⬆️</span> Nhập File Đồng Bộ
                      <input
                        type="file"
                        accept=".sde, .zip, .json"
                        className="hidden"
                        onChange={handleImportBackup}
                      />
                    </label>
                  </div>
                  <div className="flex items-center gap-2 bg-[#0A0D14]/40 backdrop-blur-xl/50 border border-slate-700/50 shadow-lg rounded-xl px-3 py-2">
                    <span className="text-[12px] font-medium tracking-wide text-slate-300 font-bold whitespace-nowrap">
                      ⏳ Nhắc nhở nhắc sao lưu:
                    </span>
                    <select
                      value={backupReminderInterval}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setBackupReminderInterval(val);
                        localStorage.setItem(
                          `sde_${SDE_UID}_backup_reminder`,
                          val.toString(),
                        );
                        showToast("Đã lưu thiết lập nhắc nhở Backup");
                      }}
                      className="flex-1 bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700 text-white text-[12px] font-medium tracking-wide font-bold rounded-lg px-2 py-1 outline-none"
                    >
                      <option value={0}>Tắt nhắc nhở</option>
                      <option value={1}>Mỗi 1 ngày</option>
                      <option value={3}>Mỗi 3 ngày</option>
                      <option value={7}>Mỗi 7 ngày</option>
                      <option value={14}>Mỗi 14 ngày</option>
                    </select>
                  </div>
                </div>
                <div className="mt-5 pb-5 border-b border-slate-700/50 shadow-lg">
                  <label className="text-[12px] font-medium tracking-wide font-medium tracking-wide font-bold text-slate-400 block mb-3">
                    🖥️ Tùy chỉnh Giao diện
                  </label>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-3 cursor-pointer group bg-[#0A0D14]/40 backdrop-blur-xl/50 border border-slate-700/50 shadow-lg rounded-xl px-3 py-2 transition-all hover:bg-slate-800/50">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={isFullScreen}
                          onChange={(e) => setIsFullScreen(e.target.checked)}
                        />
                        <div
                          className={`block w-10 h-6 rounded-full transition-colors ${
                            isFullScreen ? "bg-indigo-500" : "bg-slate-700"
                          }`}
                        ></div>
                        <div
                          className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                            isFullScreen ? "transform translate-x-4" : ""
                          }`}
                        ></div>
                      </div>
                      <span className="text-[12px] font-medium tracking-wide text-slate-300 font-bold group-hover:text-white transition-colors">
                        Mở rộng Full Màn hình (Không viền)
                      </span>
                    </label>
                    <div className="flex items-center gap-2 bg-[#0A0D14]/40 backdrop-blur-xl/50 border border-slate-700/50 shadow-lg rounded-xl px-3 py-2">
                      <span className="text-[12px] font-medium tracking-wide text-slate-300 font-bold whitespace-nowrap">
                        Độ phân giải hiển thị:
                      </span>
                      <select
                        value={screenResolution}
                        onChange={(e) => setScreenResolution(e.target.value)}
                        className="flex-1 bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700 text-white text-[12px] font-medium tracking-wide font-bold rounded-lg px-2 py-1 outline-none"
                      >
                        <option value="1080p">Chuẩn 1080p (Thu gọn)</option>
                        <option value="2k">Màn hình Rộng 2K/4K (Trải dài)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="mt-5 pb-2">
                  <div className="border border-slate-700/50 shadow-lg rounded-xl bg-[#0A0D14]/40 backdrop-blur-xl/50 p-4">
                    <h3 className="text-[12px] font-black text-indigo-400 uppercase mb-3 flex items-center gap-2">
                      <span>👨‍💻</span> Thông tin Tác giả & Liên hệ
                    </h3>
                    <div className="space-y-2 text-[12px] font-medium tracking-wide text-slate-300">
                      <p className="flex justify-between border-b border-slate-700/50 shadow-lg pb-2">
                        <span className="text-slate-500 font-medium">
                          Tác giả:
                        </span>
                        <strong className="text-white">
                          Đặng Hoàng Vi - Công ty TNHH Hữu Phúc
                        </strong>
                      </p>
                      <p className="flex justify-between border-b border-slate-700/50 shadow-lg pb-2">
                        <span className="text-slate-500 font-medium">
                          Zalo / Hỗ trợ:
                        </span>
                        <span className="text-indigo-400">0947969779</span>
                      </p>
                      <p className="flex justify-between pb-1">
                        <span className="text-slate-500 font-medium">
                          Phiên bản Bản quyền:
                        </span>
                        <span className="text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded">
                          SmarDoctPro - V7.0.0 - 2026
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2 mt-4 border-t border-slate-700/50 shadow-lg">
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] leading-relaxed font-bold rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] active:scale-95 transition-all"
              >
                Đóng Cài đặt
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default SettingsModal;
