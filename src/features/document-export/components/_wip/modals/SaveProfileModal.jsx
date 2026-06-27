import React from 'react';

export default function SaveProfileModal({
  isSaveProfileModalOpen,
  setIsSaveProfileModalOpen,
  profileNameInput,
  setProfileNameInput,
  savedProfiles,
  columnMapping,
  setSavedProfiles,
  setSelectedProfileName,
  showToast,
  SDE_UID
}) {
  if (!isSaveProfileModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#0A0D14]/40 backdrop-blur-xl/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg rounded-2xl w-full max-w-sm p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-700">
        <h3 className="text-[13px] leading-relaxed font-black text-white uppercase mb-4 flex items-center gap-1.5">
          <span>💾</span> Lưu Profile Cấu Hình
        </h3>
        <p className="text-[12px] font-medium tracking-wide text-slate-400 mb-3">
          Đặt tên cho cấu hình đấu nối để áp dụng nhanh cho các lần làm việc
          tiếp theo.
        </p>
        <input
          value={profileNameInput}
          onChange={function (e) {
            setProfileNameInput(e.target.value);
          }}
          placeholder="Ví dụ: Cấu hình Dự án Xây dựng..."
          className="w-full px-3 py-2.5 mb-4 bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg rounded-xl text-[13px] leading-relaxed text-white outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={function () {
              setIsSaveProfileModalOpen(false);
            }}
            className="px-4 py-2 bg-white/[0.03] backdrop-blur-md hover:bg-white/[0.06] backdrop-blur-lg text-slate-300 text-[13px] leading-relaxed font-bold rounded-xl"
          >
            Hủy
          </button>
          <button
            onClick={function () {
              if (!profileNameInput.trim()) {
                showToast("Vui lòng nhập tên profile", "error");
                return;
              }
              var pName = profileNameInput.trim();
              var updatedProfiles = Object.assign({}, savedProfiles);
              updatedProfiles[pName] = columnMapping;
              setSavedProfiles(updatedProfiles);
              localStorage.setItem(
                `sde_${SDE_UID}_profiles_v8`,
                JSON.stringify(updatedProfiles),
              );
              setSelectedProfileName(pName);
              setIsSaveProfileModalOpen(false);
              showToast("Đã lưu profile cấu hình đấu nối: " + pName);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] leading-relaxed font-bold rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
          >
            Lưu cấu hình
          </button>
        </div>
      </div>
    </div>
  );
}
