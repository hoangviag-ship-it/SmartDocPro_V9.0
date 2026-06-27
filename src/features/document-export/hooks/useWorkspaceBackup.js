import { getBufferFromDB, saveBufferToDB, base64ToBuffer } from "../utils/helpers";

export function useWorkspaceBackup({
  SDE_UID,
  loadedTemplates,
  projects,
  currentProjectId,
  showToast
}) {
  const handleExportBackup = async () => {
    try {
      const JSZip = window.JSZip;
      if (!JSZip) throw new Error("Chưa tải thư viện nén ZIP.");
      const zip = new JSZip();

      const payload = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (
          k &&
          k.startsWith(`sde_${SDE_UID}_`) &&
          !k.startsWith("sde_auth") &&
          !k.startsWith("sde_act_") &&
          k !== "sde_gemini_key_v2" &&
          !k.startsWith(`sde_${SDE_UID}_export_history`)
        ) {
          payload[k] = localStorage.getItem(k);
        }
      }
      if (loadedTemplates && loadedTemplates.length > 0) {
        const fullMeta = await Promise.all(
          loadedTemplates.map(async (t) => {
            let meta = { ...t };
            delete meta.fileBuffer;
            delete meta.fileBufferB64;

            try {
              const buf = await getBufferFromDB(t.id);
              if (buf) {
                const ext = meta.originalName?.toLowerCase().endsWith(".xlsx")
                  ? "xlsx"
                  : "docx";
                zip.file(`files/${t.id}.${ext}`, buf);
                meta.hasBinaryInZip = true;
                meta.zipExt = ext;
              }
            } catch (err) { console.warn("Lỗi đọc metadata file trong zip:", err); }
            return meta;
          })
        );
        payload[`sde_${SDE_UID}_templates_v8`] = JSON.stringify(fullMeta);
      }

      zip.file("workspace_configs.json", JSON.stringify(payload));

      const content = await zip.generateAsync({ type: "blob" });
      const pName =
        projects.find((p) => p.id === currentProjectId)?.name || "All";
      const sanitizedName = pName.replace(/[^a-zA-Z0-9_\-\s]/g, "");

      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SmartDocWorkspace_${sanitizedName}_${new Date().toISOString().split("T")[0]}.sde`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      localStorage.setItem(
        `sde_${SDE_UID}_last_backup_time`,
        Date.now().toString()
      );
      showToast("Đã xuất Không Không Gian Làm Việc (.sde)", "success");
    } catch (e) {
      console.error(e);
      showToast("Lỗi xuất backup: " + e.message, "error");
    }
  };

  const processImportData = async (data, zipInstance) => {
    Object.keys(data).forEach((k) => {
      if (
        k.startsWith("sde_") &&
        !k.startsWith("sde_auth") &&
        !k.startsWith("sde_act_")
      ) {
        const newK = k.startsWith(`sde_${SDE_UID}_`)
          ? k
          : k.replace("sde_", `sde_${SDE_UID}_`);
        localStorage.setItem(newK, data[k]);
      }
    });

    // MIGRATION: Backup cũ (trước v4.1.0) dùng key chung sde_export_history
    if (
      data["sde_export_history"] &&
      !Object.keys(data).some((k) =>
        k.startsWith(`sde_${SDE_UID}_export_history_`)
      )
    ) {
      try {
        const oldHistory = JSON.parse(data["sde_export_history"]);
        const projectsInBackup = data[`sde_${SDE_UID}_projects_v8`]
          ? JSON.parse(data[`sde_${SDE_UID}_projects_v8`])
          : [{ id: "proj_default" }];
        const firstProjId = projectsInBackup[0]?.id || "proj_default";
        localStorage.setItem(
          `sde_${SDE_UID}_export_history_` + firstProjId,
          JSON.stringify(oldHistory)
        );
      } catch (e) {
        console.warn("[Import] Không thể migrate export history cũ:", e);
      }
    }

    Object.keys(data).forEach((k) => {
      if (k.startsWith(`sde_${SDE_UID}_export_history_`)) {
        localStorage.setItem(k, data[k]);
      }
    });

    if (data[`sde_${SDE_UID}_templates_v8`]) {
      const metaData = JSON.parse(data[`sde_${SDE_UID}_templates_v8`]);
      for (const meta of metaData) {
        if (meta.hasBinaryInZip && zipInstance) {
          const fileEntry = zipInstance.file(`files/${meta.id}.${meta.zipExt}`);
          if (fileEntry) {
            try {
              const arrBuffer = await fileEntry.async("arraybuffer");
              await saveBufferToDB(meta.id, arrBuffer);
            } catch (e) { console.warn("Lỗi lưu buffer từ zip vào DB:", e); }
          }
        } else if (meta.fileBufferB64) {
          try {
            const buf = base64ToBuffer(meta.fileBufferB64);
            await saveBufferToDB(meta.id, buf);
          } catch (err) { console.warn("Lỗi lưu buffer base64 vào DB:", err); }
        }
      }
    }

    showToast(
      "✅ Phục hồi Không Gian Làm Việc (.sde) thành công! Đang tải lại...",
      "success"
    );
    setTimeout(() => window.location.reload(), 1500);
  };

  const handleImportBackup = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();

    // Check if it's a ZIP (.sde) or old JSON
    if (file.name.endsWith(".sde") || file.name.endsWith(".zip")) {
      const JSZip = window.JSZip;
      reader.onload = async (e) => {
        try {
          const zip = await JSZip.loadAsync(e.target.result);
          const configStr = await zip
            .file("workspace_configs.json")
            .async("string");
          const data = JSON.parse(configStr);
          processImportData(data, zip);
        } catch (err) {
          console.error(err);
          showToast("❌ File .sde không hợp lệ hoặc bị lỗi.", "error");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          processImportData(data, null);
        } catch (err) {
          showToast("❌ File backup JSON không hợp lệ hoặc bị lỗi.", "error");
        }
      };
      reader.readAsText(file);
    }
  };

  return { handleExportBackup, handleImportBackup };
}
