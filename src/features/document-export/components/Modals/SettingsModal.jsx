import React, { useContext, useState } from "react";
import {
  Cloud, CloudOff, Check, RefreshCw, LogOut, FolderGit2, FileDown,
  DatabaseBackup, Download, Upload, Type, ZoomIn, Palette, Settings, UserCircle,
} from "lucide-react";
import { SyncContext } from "../../../../shared/sync/SyncProvider";

const TABS = [
  { id: "account", label: "Tài khoản & Đồng bộ", icon: UserCircle },
  { id: "appearance", label: "Giao diện & chữ", icon: Palette },
  { id: "system", label: "Hệ thống", icon: Settings },
];

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
  storeExportSubFolderPattern,
  setStoreExportSubFolderPattern,
  storeEnableHighlight,
  setStoreEnableHighlight,
  storeCleanUnusedTags,
  setStoreCleanUnusedTags,
  SDE_UID,
  showToast,
}) => {
  const sync = useContext(SyncContext) || {};
  const [activeTab, setActiveTab] = useState("account");

  if (!isSettingsModalOpen) return null;

  const user = sync.user;
  const status = sync.status;
  const theme = sync.theme;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#0A0D14]/40 backdrop-blur-xl/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0A0D14]/95 backdrop-blur-xl border border-slate-700/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
          <h3 className="text-sm font-black text-white uppercase flex items-center gap-2">
            <span>⚙️</span> Cài đặt hệ thống
          </h3>
          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="text-slate-400 hover:text-white text-xl leading-none px-2"
            title="Đóng"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-3 border-b border-slate-700/50">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-[13px] font-bold transition-all border-b-2 ${
                activeTab === id
                  ? "text-indigo-300 border-indigo-500 bg-indigo-500/10"
                  : "text-slate-400 border-transparent hover:text-slate-200"
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* ============ TAB: TÀI KHOẢN & ĐỒNG BỘ ============ */}
          {activeTab === "account" && (
            <div className="space-y-4 max-w-xl">
              {/* Tài khoản */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                {user?.picture ? (
                  <img src={user.picture} alt="" className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <span className="w-10 h-10 rounded-full bg-indigo-500 grid place-items-center text-white">
                    {(user?.name || "?")[0]}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-white text-sm font-semibold truncate">{user?.name || "Chưa đăng nhập"}</div>
                  <div className="text-slate-400 text-[12px] truncate">{user?.email || ""}</div>
                </div>
              </div>

              {/* Trạng thái sync */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-2 text-sm">
                  {status === "offline" ? (
                    <><CloudOff size={16} className="text-amber-400" /><span className="text-amber-300">Offline (sẽ tự đồng bộ lại)</span></>
                  ) : (
                    <><Check size={16} className="text-emerald-400" /><span className="text-emerald-300">Đã đồng bộ mọi thiết bị</span></>
                  )}
                </div>
                <button onClick={sync.handleManualSync} className="text-slate-300 hover:text-white" title="Đồng bộ ngay">
                  <RefreshCw size={16} className={status === "syncing" ? "animate-spin" : ""} />
                </button>
              </div>

              {/* Nơi lưu trữ */}
              <div>
                <div className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-2">Nơi lưu trữ dữ liệu</div>
                <div className="space-y-2">
                  <a
                    href={`https://console.firebase.google.com/project/${sync.PROJECT_ID}/firestore/data/~2Fusers~2F${user?.uid}`}
                    target="_blank" rel="noreferrer"
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-200 text-sm hover:bg-slate-700/50"
                  >
                    <FolderGit2 size={16} className="text-indigo-400" />
                    <span className="flex-1 min-w-0">
                      <span className="block">Dự án & dữ liệu (cloud)</span>
                      <span className="block text-[11px] text-slate-500 truncate">users/{user?.uid}</span>
                    </span>
                  </a>
                  <div className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-200 text-sm">
                    <FileDown size={16} className="text-indigo-400" />
                    <span className="flex-1 min-w-0">
                      <span className="block">Xuất file (Word/ZIP)</span>
                      <span className="block text-[11px] text-slate-500 truncate">Tải trực tiếp về máy khi bấm Xuất</span>
                    </span>
                  </div>
                  <button onClick={sync.handleBackup} className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-200 text-sm hover:bg-slate-700/50">
                    <DatabaseBackup size={16} className="text-indigo-400" />
                    <span className="flex-1 text-left">Backup nhanh (.json)</span>
                    <Download size={15} className="text-slate-400" />
                  </button>
                  <button onClick={sync.openJsonRestore} className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-200 text-sm hover:bg-slate-700/50">
                    <Upload size={16} className="text-indigo-400" />
                    <span className="flex-1 text-left">Phục hồi từ backup (.json)</span>
                  </button>
                </div>
              </div>

              {/* Google Drive */}
              <div>
                <div className="text-[11px] uppercase tracking-wide text-slate-500 font-semibold mb-2">Google Drive của tôi</div>
                <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
                  Lưu một bản sao vào thư mục ẩn trong Drive của chính bạn — dữ liệu nằm trong tài khoản của bạn, không chiếm dung lượng nhìn thấy.
                </p>
                <div className="space-y-2">
                  <button onClick={sync.handleDriveBackup} className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-200 text-sm hover:bg-slate-700/50">
                    <Upload size={16} className="text-sky-400" />
                    <span className="flex-1 text-left">Sao lưu vào Google Drive</span>
                    <Cloud size={15} className="text-slate-400" />
                  </button>
                  <button onClick={sync.handleDriveRestore} className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-200 text-sm hover:bg-slate-700/50">
                    <Download size={16} className="text-sky-400" />
                    <span className="flex-1 text-left">Phục hồi từ Google Drive</span>
                  </button>
                </div>
              </div>

              <button
                onClick={sync.handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-900/40 border border-red-700/50 text-red-300 text-sm hover:bg-red-900/60"
              >
                <LogOut size={16} /> Đăng xuất
              </button>
            </div>
          )}

          {/* ============ TAB: GIAO DIỆN & CHỮ ============ */}
          {activeTab === "appearance" && (
            <div className="space-y-4 max-w-xl">
              {theme && (
                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700 space-y-3">
                  <label className="block">
                    <span className="flex items-center gap-2 text-[12px] text-slate-400 mb-1"><Type size={13} /> Font chữ</span>
                    <select
                      value={theme.fontId}
                      onChange={(e) => sync.updateTheme?.({ fontId: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-2 py-1.5 text-sm text-slate-100"
                    >
                      {(sync.FONT_OPTIONS || []).map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="flex items-center gap-2 text-[12px] text-slate-400 mb-1">
                      <ZoomIn size={13} /> Cỡ chữ / giao diện: {Math.round((theme.fontScale || 1) * 100)}%
                    </span>
                    <input
                      type="range" min="0.85" max="1.3" step="0.05" value={theme.fontScale}
                      onChange={(e) => sync.updateTheme?.({ fontScale: parseFloat(e.target.value) })}
                      className="w-full accent-indigo-500"
                    />
                  </label>
                  <div>
                    <span className="text-[12px] text-slate-400 mb-1 block">Độ nén</span>
                    <div className="flex gap-2">
                      {["compact", "normal", "comfortable"].map((d) => (
                        <button
                          key={d} onClick={() => sync.updateTheme?.({ density: d })}
                          className={`flex-1 py-1.5 rounded-lg text-[12px] border ${
                            theme.density === d ? "bg-indigo-600 border-indigo-500 text-white" : "bg-slate-900 border-slate-600 text-slate-300"
                          }`}
                        >
                          {d === "compact" ? "Gọn" : d === "comfortable" ? "Thoáng" : "Vừa"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={sync.resetTheme} className="text-[12px] text-slate-400 hover:text-white">
                    Khôi phục mặc định
                  </button>
                </div>
              )}

              {/* Bố cục màn hình (từ AppLegacy props) */}
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700 space-y-3">
                <span className="text-[12px] font-bold text-slate-400 block">🖥️ Bố cục màn hình</span>
                <label className="flex items-center gap-3 cursor-pointer group bg-[#0A0D14]/40 border border-slate-700/50 rounded-xl px-3 py-2 transition-all hover:bg-slate-800/50">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={isFullScreen} onChange={(e) => setIsFullScreen(e.target.checked)} />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${isFullScreen ? "bg-indigo-500" : "bg-slate-700"}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isFullScreen ? "transform translate-x-4" : ""}`}></div>
                  </div>
                  <span className="text-[12px] text-slate-300 font-bold group-hover:text-white transition-colors">
                    Mở rộng Full Màn hình (Không viền)
                  </span>
                </label>
                <div className="flex items-center gap-2 bg-[#0A0D14]/40 border border-slate-700/50 rounded-xl px-3 py-2">
                  <span className="text-[12px] text-slate-300 font-bold whitespace-nowrap">Độ phân giải hiển thị:</span>
                  <select
                    value={screenResolution}
                    onChange={(e) => setScreenResolution(e.target.value)}
                    className="flex-1 bg-[#0A0D14]/40 border border-slate-700 text-white text-[12px] font-bold rounded-lg px-2 py-1 outline-none"
                  >
                    <option value="1080p">Chuẩn 1080p (Thu gọn)</option>
                    <option value="2k">Màn hình Rộng 2K/4K (Trải dài)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ============ TAB: HỆ THỐNG ============ */}
          {activeTab === "system" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-5">
                {/* Gemini API Key */}
                <div className="pb-5 border-b border-slate-700/50">
                  <label className="text-[12px] font-bold text-slate-400 block mb-1">Gemini API Key (Tích hợp AI):</label>
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => {
                      setGeminiApiKey(e.target.value);
                      localStorage.setItem("sde_gemini_key_v2", window.btoa(e.target.value));
                    }}
                    placeholder="Dán mã API Key tại đây..."
                    className="w-full px-3 py-2.5 mb-2 bg-[#0A0D14]/40 border border-slate-700/50 rounded-xl text-[13px] text-white outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {geminiApiKey && (
                    <button
                      onClick={clearGeminiKey}
                      className="w-full mb-3 py-1.5 bg-red-950/40 border border-red-900/50 text-red-400 text-[12px] font-bold rounded-lg hover:bg-red-900/50 transition-all flex items-center justify-center gap-1.5"
                    >
                      🗑️ Xóa API Key khỏi trình duyệt
                    </button>
                  )}
                  <div className="bg-amber-950/20 border border-amber-900/40 rounded-lg p-3">
                    <p className="text-[12px] text-amber-400 font-bold leading-relaxed">⚠️ API Key được lưu an toàn tại thiết bị.</p>
                  </div>
                </div>

                {/* Nhắc nhở sao lưu định kỳ */}
                <div>
                  <label className="text-sm font-black text-sky-400 flex items-center gap-2 mb-2">
                    <DatabaseBackup size={15} /> Sao lưu định kỳ
                  </label>
                  <p className="text-[12px] text-slate-400 mb-3 leading-relaxed">
                    Nơi xuất file (ZIP / thư mục Local PC) được chọn ngay trong thẻ <b>Kết xuất</b> khi xuất tài liệu.
                    Tại đây bạn chỉ cần đặt lịch nhắc nhở sao lưu dữ liệu.
                  </p>
                  <div className="flex items-center gap-2 bg-[#0A0D14]/40 border border-slate-700/50 rounded-xl px-3 py-2">
                    <span className="text-[12px] text-slate-300 font-bold whitespace-nowrap">⏳ Nhắc nhở sao lưu:</span>
                    <select
                      value={backupReminderInterval}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setBackupReminderInterval(val);
                        localStorage.setItem(`sde_${SDE_UID}_backup_reminder`, val.toString());
                        showToast("Đã lưu thiết lập nhắc nhở Backup");
                      }}
                      className="flex-1 bg-[#0A0D14]/40 border border-slate-700 text-white text-[12px] font-bold rounded-lg px-2 py-1 outline-none"
                    >
                      <option value={0}>Tắt nhắc nhở</option>
                      <option value={1}>Mỗi 1 ngày</option>
                      <option value={3}>Mỗi 3 ngày</option>
                      <option value={7}>Mỗi 7 ngày</option>
                      <option value={14}>Mỗi 14 ngày</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Thông tin tác giả */}
              <div>
                <div className="border border-slate-700/50 rounded-xl bg-[#0A0D14]/40 p-4">
                  <h3 className="text-[12px] font-black text-indigo-400 uppercase mb-3 flex items-center gap-2">
                    <span>👨‍💻</span> Thông tin Tác giả & Liên hệ
                  </h3>
                  <div className="space-y-2 text-[12px] text-slate-300">
                    <p className="flex justify-between border-b border-slate-700/50 pb-2">
                      <span className="text-slate-500 font-medium">Tác giả:</span>
                      <strong className="text-white">Đặng Hoàng Vi - Công ty TNHH Hữu Phúc</strong>
                    </p>
                    <p className="flex justify-between border-b border-slate-700/50 pb-2">
                      <span className="text-slate-500 font-medium">Zalo / Hỗ trợ:</span>
                      <span className="text-indigo-400">0947969779</span>
                    </p>
                    <p className="flex justify-between pb-1">
                      <span className="text-slate-500 font-medium">Phiên bản Bản quyền:</span>
                      <span className="text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded">SmartDocPro - V9.0 - 2026</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-3 border-t border-slate-700/50">
          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold rounded-xl active:scale-95 transition-all"
          >
            Đóng Cài đặt
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
