import { useState, useEffect } from "react";

export function useProjectData(SDE_UID) {
  const [projects, setProjects] = useState(() => {
    const data = localStorage.getItem(`sde_${SDE_UID}_projects_v8`);
    const defaultVal = [
      {
        id: "proj_default",
        name: "Dự án Mặc định",
        description: "Không gian làm việc mặc định",
      },
    ];
    try {
      return data ? JSON.parse(data) : defaultVal;
    } catch (e) {
      return defaultVal;
    }
  });

  const [currentProjectId, setCurrentProjectId] = useState(() => {
    return localStorage.getItem(`sde_${SDE_UID}_active_project_id_v1`) || "";
  });

  // Alias for legacy support
  const setCurrentProcessProjectId = setCurrentProjectId;

  const [projectProfiles, setProjectProfiles] = useState(() => {
    const data2 = localStorage.getItem(`sde_${SDE_UID}_project_profiles_v2`);
    if (data2) {
      try {
        return JSON.parse(data2);
      } catch (e) { console.warn("Lỗi parse JSON project profiles:", e); }
    }
    const data1 = localStorage.getItem(`sde_${SDE_UID}_project_profiles_v1`); // Try migrate
    if (data1) {
      try {
        const old = JSON.parse(data1);
        const newer = {};
        for (const id in old) {
          const p = old[id];
          newer[id] = {
            id: p.id,
            fields: [
              { id: Math.random().toString(), k: "Ma_Du_An", n: "Mã Dự án", v: p.maDA || "" },
              { id: Math.random().toString(), k: "Ten_Du_An", n: "Tên Dự án", v: p.tenDA || "" },
              { id: Math.random().toString(), k: "Cap_QDDT", n: "Cấp Quyết định Đầu tư", v: p.capQDDT || "" },
              { id: Math.random().toString(), k: "Chu_Dau_Tu", n: "Chủ Đầu tư", v: p.chuDauTu || "" },
              { id: Math.random().toString(), k: "Phong_Ban_Chuyen_Mon", n: "Phòng ban Chuyên môn", v: p.phongKinhTe || "" },
              { id: Math.random().toString(), k: "Tong_Muc_Dau_Tu", n: "Tổng Mức Đầu tư", v: p.tongMucDauTu || "" },
              { id: Math.random().toString(), k: "Nguon_Von", n: "Nguồn Vốn", v: p.nguonVon || "" },
              { id: Math.random().toString(), k: "Nha_Thau_Khao_Sat", n: "Nhà thầu Khảo sát", v: p.tvKhaoSat || "" },
              { id: Math.random().toString(), k: "Nha_Thau_Thiet_Ke", n: "Nhà thầu Thiết kế", v: p.tvThietKe || "" },
              { id: Math.random().toString(), k: "Nha_Thau_Tham_Tra", n: "Nhà thầu Thẩm tra", v: p.tvThamTra || "" },
              { id: Math.random().toString(), k: "Nha_Thau_Dau_Thau", n: "Nhà thầu Đấu thầu", v: p.tvDauThau || "" },
              { id: Math.random().toString(), k: "Nha_Thau_Thi_Cong", n: "Nhà thầu Thi công", v: p.tvThiCong || "" },
              { id: Math.random().toString(), k: "Nha_Thau_Giam_Sat", n: "Nhà thầu Giám sát", v: p.tvGiamSat || "" },
            ],
          };
        }
        return newer;
      } catch (e) {
        return {};
      }
    }
    return {};
  });

  const [projectStages, setProjectStages] = useState(() => {
    const data = localStorage.getItem(`sde_${SDE_UID}_project_stages_v1`);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        return {};
      }
    }
    return {};
  });

  const [approvalHistory, setApprovalHistory] = useState(() => {
    const data = localStorage.getItem(`sde_${SDE_UID}_approval_history_v1`);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Effects to auto-save to localStorage
  useEffect(() => {
    localStorage.setItem(`sde_${SDE_UID}_projects_v8`, JSON.stringify(projects));
  }, [projects, SDE_UID]);

  useEffect(() => {
    localStorage.setItem(`sde_${SDE_UID}_active_project_id_v1`, currentProjectId);
  }, [currentProjectId, SDE_UID]);

  useEffect(() => {
    localStorage.setItem(`sde_${SDE_UID}_project_profiles_v2`, JSON.stringify(projectProfiles));
  }, [projectProfiles, SDE_UID]);

  useEffect(() => {
    localStorage.setItem(`sde_${SDE_UID}_project_stages_v1`, JSON.stringify(projectStages));
  }, [projectStages, SDE_UID]);

  useEffect(() => {
    localStorage.setItem(`sde_${SDE_UID}_approval_history_v1`, JSON.stringify(approvalHistory));
  }, [approvalHistory, SDE_UID]);

  return {
    projects, setProjects,
    currentProjectId, setCurrentProjectId, setCurrentProcessProjectId,
    projectProfiles, setProjectProfiles,
    projectStages, setProjectStages,
    approvalHistory, setApprovalHistory
  };
}
