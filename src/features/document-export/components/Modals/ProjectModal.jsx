import React from "react";

const ProjectModal = ({
  isProjectModalOpen,
  setIsProjectModalOpen,
  editingProjectProfile,
  setEditingProjectProfile,
  handleCreateProject,
  projectWizardStep,
  setProjectWizardStep,
  wizardTemplateSelection,
  setWizardTemplateSelection,
  wizardSelectedCloneProjId,
  setWizardSelectedCloneProjId,
  projects,
  newMemberName,
  setNewMemberName,
  newMemberRole,
  setNewMemberRole,
  newMemberEmail,
  setNewMemberEmail,
  newMemberPhone,
  setNewMemberPhone,
  newMemberPerms,
  setNewMemberPerms,
  showToast
}) => {
  if (!isProjectModalOpen) return null;
  return (
    <>
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#0A0D14]/40 backdrop-blur-xl/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg rounded-2xl w-full max-w-2xl p-0 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-700 overflow-hidden flex flex-col md:flex-row">
            {/* WIZARD SIDEBAR STEPS */}
            <div className="w-full md:w-1/3 bg-[#0A0D14]/40 backdrop-blur-xl p-6 border-b md:border-b-0 md:border-r border-slate-700/50 shadow-lg flex flex-col">
              <h3 className="text-sm font-black text-white uppercase mb-6 tracking-wider">
                Khởi tạo Dự án
              </h3>
              <div className="space-y-6">
                {[
                  {
                    step: 1,
                    title: "Thông tin pháp lý",
                    desc: "Tên & Mã dự án",
                  },
                  {
                    step: 2,
                    title: "Quy chuẩn QA/QC",
                    desc: "Nạp bộ mẫu chuẩn",
                  },
                  {
                    step: 3,
                    title: "Nhân sự & Vai trò",
                    desc: "Gán quyền tham gia",
                  },
                ].map((s) => (
                  <div key={s.step} className="flex items-start gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 transition-colors ${projectWizardStep === s.step ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]" : projectWizardStep > s.step ? "bg-emerald-600 text-white" : "bg-white/[0.03] backdrop-blur-md text-slate-500"}`}
                    >
                      {projectWizardStep > s.step ? "✓" : s.step}
                    </div>
                    <div>
                      <div
                        className={`text-[13px] leading-relaxed font-bold leading-tight ${projectWizardStep === s.step ? "text-indigo-400" : projectWizardStep > s.step ? "text-slate-300" : "text-slate-500"}`}
                      >
                        {s.title}
                      </div>
                      <div className="text-[12px] font-medium tracking-wide font-medium tracking-wide text-slate-500 mt-1">
                        {s.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WIZARD CONTENT */}
            <div className="w-full md:w-2/3 p-6 flex flex-col min-h-[320px]">
              <div className="flex-1">
                {projectWizardStep === 1 && (
                  <div className="animate-fade-in max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                    <h4 className="text-sm font-bold text-white mb-4">
                      Thông tin cơ sở dự án
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[12px] font-medium tracking-wide font-medium tracking-wide font-bold text-slate-400 block mb-1">
                          TÊN DỰ ÁN <span className="text-red-500">*</span>
                        </label>
                        <input
                          value={editingProjectProfile?.name || ""}
                          onChange={(e) =>
                            setEditingProjectProfile((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Ví dụ: Dự án Đường Cao tốc Bắc Nam..."
                          className="w-full px-3 py-2.5 bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg focus:border-indigo-500 rounded-xl text-[13px] leading-relaxed text-white outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[12px] font-medium tracking-wide font-medium tracking-wide font-bold text-slate-400 block mb-1">
                          MÃ DỰ ÁN (TUỲ CHỌN)
                        </label>
                        <input
                          value={editingProjectProfile?.maDA || ""}
                          onChange={(e) =>
                            setEditingProjectProfile((prev) => ({
                              ...prev,
                              maDA: e.target.value,
                            }))
                          }
                          placeholder="Mã số dự án (nếu có)"
                          className="w-full px-3 py-2.5 bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg focus:border-indigo-500 rounded-xl text-[13px] leading-relaxed text-white outline-none transition-all italic"
                        />
                      </div>
                      <div>
                        <label className="text-[12px] font-medium tracking-wide font-medium tracking-wide font-bold text-slate-400 block mb-1">
                          MÔ TẢ (TÙY CHỌN)
                        </label>
                        <textarea
                          value={editingProjectProfile?.description || ""}
                          onChange={(e) =>
                            setEditingProjectProfile((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Mô tả tóm tắt dự án..."
                          className="w-full px-3 py-2.5 bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg focus:border-indigo-500 rounded-xl text-[13px] leading-relaxed text-white outline-none transition-all min-h-[60px]"
                        />
                      </div>

                      <div className="mt-6 border border-slate-700/50 shadow-lg rounded-xl p-4 bg-[#0A0D14]/40 backdrop-blur-xl/50">
                        <div className="flex justify-between items-center border-b border-slate-700/50 shadow-lg pb-2 mb-4">
                          <label className="block text-[12px] font-medium tracking-wide font-bold text-slate-400 uppercase">
                            THÔNG TIN DỰ ÁN & CÁC BIẾN CỨNG
                          </label>
                          <button
                            onClick={() => {
                              const newFields = [
                                ...(editingProjectProfile?.fields || []),
                              ];
                              newFields.push({
                                id: Math.random().toString(),
                                k: "Ma_Bien_Moi",
                                n: "Tên hiển thị biến",
                                v: "",
                              });
                              setEditingProjectProfile({
                                ...editingProjectProfile,
                                fields: newFields,
                              });
                            }}
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] backdrop-blur-sm border border-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.2)] text-white text-[12px] font-medium tracking-wide font-medium tracking-wide font-bold px-2 py-1 flex items-center gap-1 transition-all rounded shadow-sm active:scale-95"
                          >
                            <span>+ Thêm thông tin</span>
                          </button>
                        </div>
                        <div className="space-y-4">
                          {editingProjectProfile?.fields?.map((f, i) => (
                            <div
                              key={f.id || i}
                              className="flex flex-col bg-[#0A0D14]/40 backdrop-blur-xl/80 p-3 rounded-xl border border-slate-700/50 shadow-inner group"
                            >
                              <div className="flex flex-wrap gap-2 mb-2 items-center">
                                <div className="flex-1 min-w-[200px] flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={f.n || ""}
                                    onChange={(e) => {
                                      const newFields = [
                                        ...(editingProjectProfile?.fields ||
                                          []),
                                      ];
                                      newFields[i].n = e.target.value;
                                      setEditingProjectProfile({
                                        ...editingProjectProfile,
                                        fields: newFields,
                                      });
                                    }}
                                    placeholder="Tên thông tin"
                                    className="w-1/2 px-2 py-1.5 bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700 rounded text-[12px] font-medium tracking-wide text-fuchsia-300 font-bold outline-none focus:border-indigo-500 transition-all placeholder:font-normal placeholder:text-slate-500"
                                  />
                                  <input
                                    type="text"
                                    value={f.k || ""}
                                    onChange={(e) => {
                                      const newFields = [
                                        ...(editingProjectProfile?.fields ||
                                          []),
                                      ];
                                      newFields[i].k = e.target.value.replace(
                                        /[\s\W]+/g,
                                        "_",
                                      );
                                      setEditingProjectProfile({
                                        ...editingProjectProfile,
                                        fields: newFields,
                                      });
                                    }}
                                    placeholder="Mã biến"
                                    className="w-1/2 px-2 py-1.5 bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700 rounded text-[12px] font-medium tracking-wide font-mono font-bold text-slate-300 outline-none focus:border-indigo-500 transition-all placeholder:font-normal placeholder:font-sans placeholder:text-slate-500"
                                  />
                                </div>
                                <button
                                  className="w-7 h-7 flex items-center justify-center shrink-0 rounded bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-50 group-hover:opacity-100"
                                  onClick={() => {
                                    const newFields = [
                                      ...(editingProjectProfile?.fields || []),
                                    ];
                                    newFields.splice(i, 1);
                                    setEditingProjectProfile({
                                      ...editingProjectProfile,
                                      fields: newFields,
                                    });
                                  }}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M18 6 6 18" />
                                    <path d="m6 6 12 12" />
                                  </svg>
                                </button>
                              </div>
                              <textarea
                                value={f.v || ""}
                                onChange={(e) => {
                                  const newFields = [
                                    ...(editingProjectProfile?.fields || []),
                                  ];
                                  newFields[i].v = e.target.value;
                                  setEditingProjectProfile({
                                    ...editingProjectProfile,
                                    fields: newFields,
                                  });
                                }}
                                placeholder={`Nhập nội dung đa dòng cho thông tin này...`}
                                className="w-full px-3 py-2 bg-[#0A0D14]/40 backdrop-blur-xl/50 border border-slate-700 rounded-lg text-[12px] font-medium tracking-wide text-indigo-50 outline-none focus:border-indigo-500 transition-all min-h-[60px] custom-scrollbar focus:bg-[#0A0D14]/40 backdrop-blur-xl"
                              />
                            </div>
                          ))}
                          {(!editingProjectProfile?.fields ||
                            editingProjectProfile.fields.length === 0) && (
                            <div className="text-[13px] leading-relaxed text-slate-500 flex flex-col items-center justify-center text-center p-6 border border-slate-700/50 shadow-lg border-dashed rounded-xl bg-[#0A0D14]/40 backdrop-blur-xl/50">
                              <span className="text-xl opacity-40 mb-2">
                                📋
                              </span>
                              Chưa có cấu hình thông tin dự án nào.
                              <br />
                              Nhấn Thêm thông tin để tự khai báo các biến dùng
                              chung.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {projectWizardStep === 2 && (
                  <div className="animate-fade-in flex flex-col h-full max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                    <h4 className="text-sm font-bold text-white mb-2 ml-1 text-left">
                      Quy chuẩn Mẫu & Biểu mẫu
                    </h4>
                    <p className="text-[12px] font-medium tracking-wide text-slate-400 mb-4 ml-1 text-left">
                      Chọn gói biểu mẫu chuẩn hoặc sao chép bộ mẫu chất lượng từ
                      dự án khác để bắt đầu nhanh chóng.
                    </p>

                    <div className="space-y-3 w-full text-left">
                      {/* OPTION CARD 1: ISO & Decree 175/2024 */}
                      <button
                        type="button"
                        onClick={() =>
                          setWizardTemplateSelection({ type: "iso" })
                        }
                        className={`w-full p-4 rounded-xl text-left border transition-all flex gap-3.5 items-start ${
                          wizardTemplateSelection.type === "iso"
                            ? "bg-indigo-950/40 border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.2)]"
                            : "bg-[#0A0D14]/40 backdrop-blur-xl/60 border-slate-700/50 shadow-lg hover:border-slate-700 hover:bg-[#0A0D14]/40 backdrop-blur-xl/40"
                        }`}
                      >
                        <span className="text-2xl pt-0.5">🏛️</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[13px] leading-relaxed font-bold ${wizardTemplateSelection.type === "iso" ? "text-indigo-400" : "text-white"}`}
                            >
                              Kho biểu mẫu Quy chuẩn ISO & Nghị định
                              175/2024/NĐ-CP
                            </span>
                            <span className="text-[9px] bg-indigo-900/80 text-indigo-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider scale-90">
                              Khuyên dùng
                            </span>
                          </div>
                          <p className="text-[12px] font-medium tracking-wide font-medium tracking-wide text-slate-400 mt-1 leading-relaxed">
                            Nạp sẵn 05 biểu mẫu chuẩn QA/QC theo đúng hướng dẫn
                            Nghị định 175/2024 (bao gồm Biên bản nghiệm thu công
                            việc, Lắp đặt thiết bị, Nhật ký thi công...).
                          </p>
                          <div className="mt-2.5 grid grid-cols-2 gap-1.5 border-t border-slate-900 pt-2.5">
                            <span className="text-[9px] text-slate-500 flex items-center gap-1">
                              ✓ Biên bản nghiệm thu CV
                            </span>
                            <span className="text-[9px] text-slate-500 flex items-center gap-1">
                              ✓ Phiếu yêu cầu NT
                            </span>
                            <span className="text-[9px] text-slate-500 flex items-center gap-1">
                              ✓ Nhật ký thi công
                            </span>
                            <span className="text-[9px] text-slate-500 flex items-center gap-1">
                              ✓ Biên bản bàn giao
                            </span>
                          </div>
                        </div>
                      </button>

                      {/* OPTION CARD 2: CLONE FROM ANOTHER PROJECT */}
                      <div
                        onClick={() => {
                          setWizardTemplateSelection({ type: "clone" });
                          const otherProjects = projects.filter(
                            (p) => p.id && p.id !== editingProjectProfile?.id,
                          );
                          if (
                            otherProjects.length > 0 &&
                            !wizardSelectedCloneProjId
                          ) {
                            setWizardSelectedCloneProjId(otherProjects[0].id);
                          }
                        }}
                        className={`w-full p-4 rounded-xl text-left border transition-all cursor-pointer flex gap-3.5 items-start ${
                          wizardTemplateSelection.type === "clone"
                            ? "bg-indigo-950/40 border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.2)]"
                            : "bg-[#0A0D14]/40 backdrop-blur-xl/60 border-slate-700/50 shadow-lg hover:border-slate-700 hover:bg-[#0A0D14]/40 backdrop-blur-xl/40"
                        }`}
                      >
                        <span className="text-2xl pt-0.5">📂</span>
                        <div className="flex-1">
                          <span
                            className={`text-[13px] leading-relaxed font-bold block ${wizardTemplateSelection.type === "clone" ? "text-indigo-400" : "text-white"}`}
                          >
                            Sao chép từ dự án hiện có
                          </span>
                          <span className="text-[12px] font-medium tracking-wide font-medium tracking-wide text-slate-400 mt-1 block leading-relaxed">
                            Thừa kế toàn bộ danh sách biểu mẫu, tag liên kết và
                            file Word template của dự án đã cấu hình trước đó.
                          </span>

                          {wizardTemplateSelection.type === "clone" && (
                            <div
                              className="mt-3"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">
                                Dự án nguồn để sao chép
                              </label>
                              {projects.filter(
                                (p) =>
                                  p.id && p.id !== editingProjectProfile?.id,
                              ).length > 0 ? (
                                <select
                                  value={wizardSelectedCloneProjId}
                                  onChange={(e) =>
                                    setWizardSelectedCloneProjId(e.target.value)
                                  }
                                  className="w-full bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg focus:border-indigo-500 text-[13px] leading-relaxed text-white px-2.5 py-1.5 rounded-lg outline-none"
                                >
                                  {projects
                                    .filter(
                                      (p) =>
                                        p.id &&
                                        p.id !== editingProjectProfile?.id,
                                    )
                                    .map((p) => (
                                      <option key={p.id} value={p.id}>
                                        {p.name}
                                      </option>
                                    ))}
                                </select>
                              ) : (
                                <div className="text-[12px] font-medium tracking-wide font-medium tracking-wide text-amber-400 italic">
                                  Bạn chưa tạo dự án nào khác ngoài dự án hiện
                                  tại.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* OPTION CARD 3: EMPTY PROJECT */}
                      <button
                        type="button"
                        onClick={() =>
                          setWizardTemplateSelection({ type: "empty" })
                        }
                        className={`w-full p-4 rounded-xl text-left border transition-all flex gap-3.5 items-start ${
                          wizardTemplateSelection.type === "empty"
                            ? "bg-indigo-950/40 border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.2)]"
                            : "bg-[#0A0D14]/40 backdrop-blur-xl/60 border-slate-700/50 shadow-lg hover:border-slate-700 hover:bg-[#0A0D14]/40 backdrop-blur-xl/40"
                        }`}
                      >
                        <span className="text-2xl pt-0.5">📄</span>
                        <div className="flex-1">
                          <span
                            className={`text-[13px] leading-relaxed font-bold ${wizardTemplateSelection.type === "empty" ? "text-indigo-400" : "text-white"}`}
                          >
                            Dự án trống
                          </span>
                          <p className="text-[12px] font-medium tracking-wide font-medium tracking-wide text-slate-400 mt-1 leading-relaxed">
                            Bắt đầu bằng một dự án hoàn toàn trống. Bạn sẽ tự
                            thiết lập quy trình và nạp File mẫu Word của mình
                            sau khi tạo xong dự án.
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {projectWizardStep === 3 && (
                  <div className="animate-fade-in flex flex-col h-full max-h-[63vh] overflow-y-auto custom-scrollbar pr-2">
                    <h4 className="text-sm font-bold text-white mb-1 ml-1 text-left">
                      Gán Nhân sự & Phân quyền
                    </h4>
                    <p className="text-[12px] font-medium tracking-wide text-slate-400 mb-4 ml-1 text-left">
                      Thiết lập các vai trò chủ chốt tham gia dự án, phân quyền
                      truy cập và ký duyệt hồ sơ điện tử.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-left">
                      {/* LEFT BOX: FORM FOR ADDING MEMBER */}
                      <div className="p-3 bg-[#0A0D14]/40 backdrop-blur-xl/60 border border-slate-700/50 shadow-lg rounded-xl space-y-3.5 h-fit">
                        <span className="text-[12px] font-medium tracking-wide font-bold text-indigo-400 uppercase tracking-wide block border-b border-slate-900 pb-1.5 mb-2">
                          Thêm nhân viên / Đối tác mới
                        </span>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">
                            Họ và Tên Nhân sự
                          </label>
                          <input
                            type="text"
                            value={newMemberName}
                            onChange={(e) => setNewMemberName(e.target.value)}
                            placeholder="Ví dụ: Nguyễn Văn Hải"
                            className="w-full bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg focus:border-indigo-500 text-[13px] leading-relaxed text-white px-2.5 py-2 rounded-lg outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">
                              Vai trò
                            </label>
                            <select
                              value={newMemberRole}
                              onChange={(e) => setNewMemberRole(e.target.value)}
                              className="w-full bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg focus:border-indigo-500 text-[12px] font-medium tracking-wide text-white px-2 py-2 rounded-lg outline-none"
                            >
                              <option value="Chủ đầu tư (CĐT)">
                                Chủ đầu tư (CĐT)
                              </option>
                              <option value="Tư vấn Giám sát (TVGS)">
                                Tư vấn Giám sát (TVGS)
                              </option>
                              <option value="Chỉ huy trưởng (CHT)">
                                Chỉ huy trưởng (CHT)
                              </option>
                              <option value="Kỹ sư QA/QC">Kỹ sư QA/QC</option>
                              <option value="Thư ký ban công trình">
                                Thư ký ban
                              </option>
                              <option value="Giám sát trưởng">
                                Giám sát trưởng
                              </option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">
                              Quyền truy cập
                            </label>
                            <select
                              value={newMemberPerms}
                              onChange={(e) =>
                                setNewMemberPerms(e.target.value)
                              }
                              className="w-full bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg focus:border-indigo-500 text-[12px] font-medium tracking-wide text-white px-2 py-2 rounded-lg outline-none"
                            >
                              <option value="Full (Đọc & Ghi)">
                                Full (Đọc & Ghi)
                              </option>
                              <option value="Xem & Ký số">Xem & Ký số</option>
                              <option value="Chỉ xem mẫu">Chỉ xem mẫu</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">
                              Email
                            </label>
                            <input
                              type="email"
                              value={newMemberEmail}
                              onChange={(e) =>
                                setNewMemberEmail(e.target.value)
                              }
                              placeholder="hai@email.com"
                              className="w-full bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg focus:border-indigo-500 text-[13px] leading-relaxed text-white px-2.5 py-2 rounded-lg outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">
                              SĐT liên hệ
                            </label>
                            <input
                              type="text"
                              value={newMemberPhone}
                              onChange={(e) =>
                                setNewMemberPhone(e.target.value)
                              }
                              placeholder="0912xxxxxx"
                              className="w-full bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg focus:border-indigo-500 text-[13px] leading-relaxed text-white px-2.5 py-2 rounded-lg outline-none"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (!newMemberName.trim()) {
                              showToast("Vui lòng nhập tên nhân sự!", "error");
                              return;
                            }
                            const updatedUsers = [
                              ...(editingProjectProfile?.assignedUsers || []),
                            ];
                            const newId = "user_" + Date.now();
                            updatedUsers.push({
                              id: newId,
                              fullName: newMemberName.trim(),
                              role: newMemberRole,
                              email: newMemberEmail.trim(),
                              phone: newMemberPhone.trim(),
                              permissions: newMemberPerms,
                            });

                            setEditingProjectProfile({
                              ...editingProjectProfile,
                              assignedUsers: updatedUsers,
                            });

                            // Reset form input
                            setNewMemberName("");
                            setNewMemberEmail("");
                            setNewMemberPhone("");
                            showToast(
                              `Đã thêm nhân sự "${newMemberName}" vào danh sách!`,
                            );
                          }}
                          className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] backdrop-blur-sm border border-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.2)] text-white rounded-lg text-[13px] leading-relaxed font-bold transition-colors shadow-sm"
                        >
                          + Thêm vào danh sách
                        </button>
                      </div>

                      {/* RIGHT BOX: CURRENT LIST OF MEMBERS */}
                      <div className="p-3 bg-[#0A0D14]/40 backdrop-blur-xl/60 border border-slate-700/50 shadow-lg rounded-xl flex flex-col min-h-[180px] h-[340px] overflow-hidden">
                        <span className="text-[12px] font-medium tracking-wide font-bold text-emerald-400 uppercase tracking-wide block border-b border-slate-900 pb-1.5 mb-2 whitespace-nowrap">
                          Danh sách nhân sự (
                          {(editingProjectProfile?.assignedUsers || []).length +
                            1}
                          )
                        </span>

                        <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar pr-1">
                          {/* Auto-fill the owner/manager details as the primary user */}
                          <div className="p-2.5 bg-[#0A0D14]/40 backdrop-blur-xl/80 border border-slate-700/50 shadow-lg/80 rounded-lg flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-indigo-900/50 border border-indigo-700/50 flex items-center justify-center font-bold text-[13px] leading-relaxed text-indigo-300 shrink-0">
                                AD
                              </div>
                              <div className="min-w-0">
                                <span className="text-[13px] leading-relaxed text-indigo-200 font-bold block truncate">
                                  Bạn (Quản trị viên)
                                </span>
                                <span className="text-[9px] text-slate-400">
                                  Giám đốc / Quản lý dự án chính
                                </span>
                              </div>
                            </div>
                            <div className="shrink-0 flex flex-col items-end gap-1">
                              <span className="text-[8px] bg-indigo-900/30 border border-indigo-500/30 text-indigo-400 px-1.5 py-0.5 rounded font-black">
                                CHỦ DỰ ÁN
                              </span>
                            </div>
                          </div>

                          {/* Dynamic assignedUsers */}
                          {(editingProjectProfile?.assignedUsers || []).map(
                            (user) => {
                              // Extract prefix initials for avatar
                              const initials = user.fullName
                                .split(" ")
                                .map((part) => part[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2);

                              return (
                                <div
                                  key={user.id}
                                  className="p-2.5 bg-[#0A0D14]/40 backdrop-blur-xl/50 border border-slate-700/50 shadow-lg/50 rounded-lg flex items-center justify-between gap-3 group"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-white/[0.03] backdrop-blur-md text-slate-300 flex items-center justify-center font-bold text-[13px] leading-relaxed shrink-0">
                                      {initials}
                                    </div>
                                    <div className="min-w-0">
                                      <span className="text-[13px] leading-relaxed text-slate-200 font-bold block truncate">
                                        {user.fullName}
                                      </span>
                                      <span className="text-[9px] text-slate-400 truncate block">
                                        {user.role}{" "}
                                        {user.email ? `• ${user.email}` : ""}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="shrink-0 flex items-center gap-2">
                                    <div className="flex flex-col items-end">
                                      <span className="text-[8px] bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg text-slate-400 px-1.5 py-0.5 rounded font-medium">
                                        {user.permissions}
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updatedUsers = (
                                          editingProjectProfile.assignedUsers ||
                                          []
                                        ).filter((u) => u.id !== user.id);
                                        setEditingProjectProfile({
                                          ...editingProjectProfile,
                                          assignedUsers: updatedUsers,
                                        });
                                        showToast(
                                          "Đã loại bỏ nhân sự khỏi dự án.",
                                        );
                                      }}
                                      className="p-1 hover:bg-white/[0.03] backdrop-blur-md hover:text-red-400 text-slate-500 rounded transition-colors"
                                      title="Xóa nhân sự"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </div>
                              );
                            },
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-slate-700/50 shadow-lg">
                <button
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2 bg-transparent text-slate-400 hover:text-white text-[13px] leading-relaxed font-bold rounded-xl transition-colors mr-auto"
                >
                  Hủy
                </button>
                {projectWizardStep > 1 && (
                  <button
                    onClick={() => setProjectWizardStep((prev) => prev - 1)}
                    className="px-4 py-2 bg-white/[0.03] backdrop-blur-md text-slate-300 hover:text-white text-[13px] leading-relaxed font-bold rounded-xl transition-colors"
                  >
                    Quay lại
                  </button>
                )}
                {projectWizardStep < 3 ? (
                  <button
                    onClick={() => {
                      if (
                        projectWizardStep === 1 &&
                        (!editingProjectProfile?.name ||
                          !editingProjectProfile.name.trim())
                      ) {
                        showToast(
                          "Vui lòng nhập tên dự án để tiếp tục!",
                          "error",
                        );
                        return;
                      }
                      setProjectWizardStep((prev) => prev + 1);
                    }}
                    className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] backdrop-blur-sm border border-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.2)] text-white text-[13px] leading-relaxed font-bold rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-colors flex items-center gap-2"
                  >
                    Tiếp tục <span>→</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleCreateProject();
                      setProjectWizardStep(1);
                    }}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[13px] leading-relaxed font-bold rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.3)] transition-colors flex items-center gap-2"
                  >
                    Hoàn tất <span>✓</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectModal;
