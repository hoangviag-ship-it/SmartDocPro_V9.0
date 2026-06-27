import React from "react";

const ConfirmModal = ({
  confirmModal,
  setConfirmModal
}) => {
  if (!confirmModal.show) return null;
  return (
    <>
      {confirmModal.show && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#0A0D14]/40 backdrop-blur-xl/80 backdrop-blur-sm">
          <div className="bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg rounded-2xl w-full max-w-sm p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-700">
            <h3 className="text-[13px] leading-relaxed font-black text-white uppercase mb-2">
              {confirmModal.title}
            </h3>
            <p className="text-slate-400 text-[13px] leading-relaxed mb-4 leading-relaxed">
              {confirmModal.desc}
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() =>
                  setConfirmModal({
                    show: false,
                    action: null,
                    title: "",
                    desc: "",
                    btnConfirm: "Đồng ý",
                  })
                }
                className="px-4 py-2 bg-white/[0.03] backdrop-blur-md text-slate-300 text-[13px] leading-relaxed font-bold rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={confirmModal.action}
                className="px-4 py-2 bg-indigo-600 text-white text-[13px] leading-relaxed font-bold rounded-xl"
              >
                {confirmModal.btnConfirm || "Đồng ý"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConfirmModal;
