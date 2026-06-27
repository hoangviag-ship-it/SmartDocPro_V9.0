import { useCallback } from 'react';
import { saveBufferToDB, deleteBufferFromDB } from '../utils/helpers';

export const useProjectHandlers = ({
  loadedTemplates,
  setLoadedTemplates,
  currentProjectId,
  setSelectedTemplateIds,
  activeMappingTab,
  setActiveMappingTab,
  activeSingleMappingTab,
  setActiveSingleMappingTab,
  showToast,
  setProfileNameInput,
  setIsSaveProfileModalOpen,
  setSelectedProfileName,
  savedProfiles,
  setColumnMapping
}) => {

  const handleSaveToLibrary = useCallback(async (id) => {
    var target = loadedTemplates.find((t) => t.id === id);
    if (target && target.fileBuffer) {
      var existing = loadedTemplates.find(
        (t) =>
          t.projectId === "GLOBAL_LIBRARY" &&
          t.originalName === target.originalName,
      );
      if (existing) {
        showToast("Mẫu này đã có trong Thư viện hệ thống!", "warning");
        return;
      }

      var newId =
        "tpl_lib_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
      await saveBufferToDB(newId, target.fileBuffer);
      var libTemplate = { ...target, id: newId, projectId: "GLOBAL_LIBRARY" };
      setLoadedTemplates((prev) => [...prev, libTemplate]);
      showToast("Đã lưu vào Thư viện hệ thống!");
    }
  }, [loadedTemplates, showToast, setLoadedTemplates]);

  const handleExtractFromLibrary = useCallback(async (e, id) => {
    e.stopPropagation();
    var target = loadedTemplates.find((t) => t.id === id);
    if (target && target.fileBuffer) {
      var existing = loadedTemplates.find(
        (t) =>
          t.projectId === currentProjectId &&
          t.originalName === target.originalName &&
          !t.isHiddenFromMainList,
      );
      if (existing) {
        showToast("Mẫu này đã được tải trong dự án hiện tại!", "warning");
        return;
      }

      var newId =
        "tpl_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
      await saveBufferToDB(newId, target.fileBuffer);
      var duplicate = { ...target, id: newId, projectId: currentProjectId };
      setLoadedTemplates((prev) => [...prev, duplicate]);
      setSelectedTemplateIds((prev) => [...prev, newId]);
      if (activeMappingTab !== "all") setActiveMappingTab("all");
      if (activeSingleMappingTab !== "all") setActiveSingleMappingTab("all");
      showToast("Đã thêm mẫu từ Thư viện!");
    }
  }, [loadedTemplates, currentProjectId, showToast, setLoadedTemplates, setSelectedTemplateIds, activeMappingTab, setActiveMappingTab, activeSingleMappingTab, setActiveSingleMappingTab]);

  const handleDeleteFromLibrary = useCallback(async (e, id) => {
    e.stopPropagation();
    await deleteBufferFromDB(id);
    setLoadedTemplates((prev) => prev.filter((t) => t.id !== id));
    showToast("Đã xóa khỏi Thư viện!");
  }, [setLoadedTemplates, showToast]);

  const handleSaveProfile = useCallback(() => {
    setProfileNameInput("Cấu hình Mới");
    setIsSaveProfileModalOpen(true);
  }, [setProfileNameInput, setIsSaveProfileModalOpen]);

  const handleProfileSelect = useCallback((e) => {
    var name = e.target.value;
    setSelectedProfileName(name);
    if (name && savedProfiles[name]) {
      setColumnMapping(savedProfiles[name]);
      showToast("Đã kích hoạt profile!");
    }
  }, [setSelectedProfileName, savedProfiles, setColumnMapping, showToast]);

  return {
    handleSaveToLibrary,
    handleExtractFromLibrary,
    handleDeleteFromLibrary,
    handleSaveProfile,
    handleProfileSelect
  };
};
