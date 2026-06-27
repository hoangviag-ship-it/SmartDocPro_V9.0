import React from "react";

const AuthorModal = ({
  isAuthorModalOpen,
  setIsAuthorModalOpen
}) => {
  if (!isAuthorModalOpen) return null;
  return (
    <>
      {isAuthorModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#0A0D14]/40 backdrop-blur-xl/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700 rounded-2xl w-full max-w-md shadow-[0_0_60px_rgba(79,70,229,0.1)] backdrop-blur-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-6 flex flex-col items-center border-b border-slate-700/50 shadow-lg">
              <div className="w-20 h-20 bg-white/[0.03] backdrop-blur-md rounded-full flex items-center justify-center text-4xl mb-4 border-4 border-slate-900 shadow-xl">
                👷‍♂️
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-widest">
                Đặng Hoàng Vi
              </h2>
              <p className="text-[13px] leading-relaxed text-indigo-300 font-bold mt-1 uppercase tracking-wide">
                Chuyên gia Quản lý Dự án Đầu tư Xây dựng
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-[#0A0D14]/40 backdrop-blur-xl/50 p-4 rounded-xl border border-slate-700/50 shadow-lg">
                <p className="text-[12px] font-medium tracking-wide font-medium tracking-wide text-slate-500 font-bold uppercase mb-1">
                  Đơn vị chủ quản
                </p>
                <p className="text-sm text-slate-200 font-bold leading-relaxed">
                  Công ty TNHH Hữu Phúc
                </p>
              </div>

              <div className="bg-[#0A0D14]/40 backdrop-blur-xl/50 p-4 rounded-xl border border-slate-700/50 shadow-lg flex gap-3 items-start">
                <span className="text-lg">📍</span>
                <div>
                  <p className="text-[12px] font-medium tracking-wide font-medium tracking-wide text-slate-500 font-bold uppercase mb-1">
                    Trụ sở giao dịch
                  </p>
                  <p className="text-[13px] leading-relaxed text-slate-300 leading-relaxed">
                    Số 67A Phan Bội Châu, Phường Bình Đức,
                    <br />
                    Tỉnh An Giang
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0A0D14]/40 backdrop-blur-xl/50 p-4 rounded-xl border border-slate-700/50 shadow-lg flex flex-col gap-1 items-center text-center">
                  <span className="text-emerald-400 text-xl mb-1">📞</span>
                  <p className="text-[12px] font-medium tracking-wide font-medium tracking-wide text-slate-500 font-bold uppercase">
                    Điện thoại
                  </p>
                  <p className="text-[13px] leading-relaxed text-slate-300 font-bold">
                    0947 969 779
                  </p>
                </div>
                <div className="bg-[#0A0D14]/40 backdrop-blur-xl/50 p-4 rounded-xl border border-slate-700/50 shadow-lg flex flex-col gap-1 items-center text-center">
                  <span className="text-blue-400 text-xl mb-1">✉️</span>
                  <p className="text-[12px] font-medium tracking-wide font-medium tracking-wide text-slate-500 font-bold uppercase">
                    Email hỗ trợ
                  </p>
                  <p className="text-[13px] leading-relaxed text-slate-300 font-bold break-all">
                    hoangviag@gmail.com
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#0A0D14]/40 backdrop-blur-xl border-t border-slate-700/50 shadow-lg flex justify-end">
              <button
                onClick={() => setIsAuthorModalOpen(false)}
                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] backdrop-blur-sm border border-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.2)] text-white text-[13px] leading-relaxed font-bold rounded-xl transition-all shadow-md active:scale-95"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AuthorModal;
