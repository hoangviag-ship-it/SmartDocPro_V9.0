import { useCallback } from 'react';
import { 
  getCleanTextFromZip, sanitizePath, safeDeepClone, base64ToBuffer, safeFormatNumber, 
  soThanhChu, removeVietnameseTones, normalizeKey, levenshtein, calculateVietnameseMatchScore, 
  stripXmlTags, escapeXml, buildWordTableXml, extractAllTags, getBaseTag, calculateFinalValueForTag, 
  escapeXmlText, unescapeXmlText, splitXmlAndTexts, joinPartsToXml, replaceTagsInXml 
} from '../utils/helpers';

export const useExportHandlers = ({
  excelColumns,
  excelData,
  tags,
  columnMapping,
  setColumnMapping,
  activeProjectTemplates,
  selectedTemplateIds,
  activeExcelRowIndex,
  selectedExcelRows,
  formData,
  setFormData,
  autoFillKey,
  showToast,
  setConfirmModal,
  confirmModal,
  setIsProcessing,
  projectProfiles,
  currentProjectId,
  SDE_UID,
  setLastExportedData,
  enableHighlight,
  cleanUnusedTags,
  globalDictionary,
  addLiveLog,
  exportProjectName,
  exportSubFolderPattern,
  setBatchProgress,
  setLiveLogs,
  batchStartTimeRef,
  setBatchETA,
  exportMode,
  projects
}) => {

  const getBoundRow = useCallback((template, currentRow, silent) => {
    if (!template || !template.bindSheetKey) return currentRow;
    var sheetRows = excelData.filter(
      (r) =>
        r["__Nguon_Tep"] + "|||" + r["__Nguon_Sheet"] === template.bindSheetKey,
    );
    var relativeIdx = 0;
    if (autoFillKey && currentRow[autoFillKey]) {
      var found = sheetRows.find(
        (r) => r[autoFillKey] === currentRow[autoFillKey],
      );
      if (found) return found;
    } else {
      var currentSheetRows = excelData.filter(
        (r) =>
          r["__Nguon_Tep"] === currentRow["__Nguon_Tep"] &&
          r["__Nguon_Sheet"] === currentRow["__Nguon_Sheet"],
      );
      relativeIdx = currentSheetRows.indexOf(currentRow);
      if (sheetRows[relativeIdx]) return sheetRows[relativeIdx];
    }
    if (!silent) {
      addLiveLog(
        '[CẢNH BÁO] Template "' +
          (template.customName || template.originalName) +
          '" — Sheet bind thiếu dòng tương ứng (cần dòng ' +
          (relativeIdx + 1) +
          " nhưng chỉ có " +
          sheetRows.length +
          " dòng). Biến từ sheet này sẽ để trống.",
        "warn",
      );
    }
    return {};
  }, [excelData, autoFillKey, addLiveLog]);

  const safeGetExcelValue = useCallback((colName, currentRow, boundRow) => {
    if (boundRow && boundRow[colName] !== undefined) return boundRow[colName];
    if (currentRow && currentRow[colName] !== undefined)
      return currentRow[colName];
    if (excelData && excelData.length > 0) {
      var sheetWithCol = excelData.find(function (r) {
        return r[colName] !== undefined;
      });
      if (sheetWithCol) {
        var bindKey =
          sheetWithCol["__Nguon_Tep"] + "|||" + sheetWithCol["__Nguon_Sheet"];
        var sheetRows = excelData.filter(function (r) {
          return r["__Nguon_Tep"] + "|||" + r["__Nguon_Sheet"] === bindKey;
        });
        var found = null;
        if (autoFillKey && currentRow[autoFillKey]) {
          found = sheetRows.find(function (r) {
            return r[autoFillKey] === currentRow[autoFillKey];
          });
        } else {
          var currentSheetRows = excelData.filter(function (r) {
            return (
              r["__Nguon_Tep"] === currentRow["__Nguon_Tep"] &&
              r["__Nguon_Sheet"] === currentRow["__Nguon_Sheet"]
            );
          });
          var relativeIdx = currentSheetRows.indexOf(currentRow);
          if (relativeIdx >= 0 && sheetRows[relativeIdx])
            found = sheetRows[relativeIdx];
        }
        if (found && found[colName] !== undefined) return found[colName];
      }
    }
    return "";
  }, [excelData, autoFillKey]);

  const handleAutoMap = useCallback(() => {
    if (excelColumns.length === 0 || tags.length === 0) return;
    setColumnMapping((prev) => {
      var newMapping = Object.assign({}, prev);
      var mappedCount = 0;
      var colUsedMap = {};
      Object.keys(newMapping).forEach(function (k) {
        if (
          newMapping[k] &&
          newMapping[k].type === "excel" &&
          newMapping[k].value
        ) {
          if (!colUsedMap[newMapping[k].value])
            colUsedMap[newMapping[k].value] = [];
          colUsedMap[newMapping[k].value].push(k);
        }
      });

      tags.forEach(function (tag) {
        if (
          !newMapping[tag] ||
          newMapping[tag].value === "" ||
          newMapping[tag].type === "manual"
        ) {
          var bestCol = null;
          var bestScore = 0;
          excelColumns.forEach(function (col) {
            var score = calculateVietnameseMatchScore(tag, col);
            if (score > bestScore) {
              bestScore = score;
              bestCol = col;
            }
          });

          if (bestCol && bestScore >= 0.5) {
            newMapping[tag] = { type: "excel", value: bestCol };
            mappedCount++;
            colUsedMap[bestCol] = [tag];
          } else if (!newMapping[tag]) {
            newMapping[tag] = { type: "manual", value: "" };
          }
        }
      });

      if (mappedCount > 0)
        showToast(
          "Đã tự động ghép nối thành công " +
            mappedCount +
            " biến nhờ thuật toán đối soát!",
        );
      return newMapping;
    });
  }, [excelColumns, tags, setColumnMapping, showToast]);

  const handleAutofillFromExcelRow = useCallback((rowIndex) => {
    if (rowIndex === null || rowIndex === undefined || rowIndex < 0) return;
    var row = excelData[rowIndex];
    if (!row) return;

    setFormData((prev) => {
      var next = Object.assign({}, prev);
      tags.forEach(function (tag) {
        var mapping = columnMapping[tag] || { type: "manual", value: "" };
        var rawVal = "";
        if (mapping.type === "excel") {
          var templateForTag = activeProjectTemplates.find(function (t) {
            return t.tags && t.tags.indexOf(tag) !== -1;
          });
          var boundRow = getBoundRow(templateForTag, row, true);
          rawVal = safeGetExcelValue(mapping.value, row, boundRow);
        } else {
          rawVal = mapping.value;
        }
        if (rawVal !== undefined && rawVal !== null) {
          next[tag] = String(rawVal);
        }
      });
      return next;
    });
    showToast(`Đã tự động điền form bằng Dòng ${rowIndex + 1}`);
  }, [excelData, tags, columnMapping, activeProjectTemplates, getBoundRow, safeGetExcelValue, setFormData, showToast]);

  const getMissingTags = useCallback(() => {
    var missing = [];
    tags.forEach(function (tag) {
      var mapping = columnMapping[tag] || { type: "manual", value: "" };
      var isMapped =
        (mapping.type === "excel" && mapping.value) ||
        (mapping.type === "manual" && formData[tag] && formData[tag].trim() !== "");
      if (!isMapped) missing.push(tag);
    });
    return missing;
  }, [tags, columnMapping, formData]);

  const checkMissingBuffers = useCallback((templates) => {
    let missingList = [];
    templates.forEach((t) => {
      if (!t.fileBuffer) {
        missingList.push(t.originalName);
      }
    });
    if (missingList.length > 0) {
      showToast(
        "Lỗi nghiêm trọng: Có " +
          missingList.length +
          " file mẫu bị lỗi mất dữ liệu gốc. Vui lòng xóa mẫu và tải lên lại.",
        "error",
        15000,
      );
      addLiveLog("Mất buffer gốc cho: " + missingList.join(", "), "error");
      return true;
    }
    return false;
  }, [showToast, addLiveLog]);

  const checkEmptyVars = useCallback((mode = "single") => {
    let missing = [];
    tags.forEach((tag) => {
      let mapping = columnMapping[tag] || { type: "manual", value: "" };
      if (
        !mapping.value &&
        (!formData[tag] || String(formData[tag]).trim() === "")
      ) {
        missing.push(tag);
      }
    });
    return missing;
  }, [tags, columnMapping, formData]);

  const generateDoc = useCallback(async () => {
    var templatesToExport = activeProjectTemplates.filter(function (t) {
      return selectedTemplateIds.indexOf(t.id) !== -1;
    });
    if (templatesToExport.length === 0) {
      showToast("Chọn ít nhất 1 mẫu để xuất!", "error");
      return;
    }
    if (checkMissingBuffers(templatesToExport)) return;

    setIsProcessing(true);
    try {
      var PizZip = window.PizZip;
      var saveAs = window.saveAs;
      var JSZip = window.JSZip;
      var valMap = {};
      var profile = projectProfiles[currentProjectId];
      if (profile && profile.fields) {
        profile.fields.forEach(function (f) {
          if (f.v && f.v.trim() !== "") {
            valMap[f.k] = f.v;
          }
        });
      }
      if (profile && profile.stakeholders) {
        profile.stakeholders.forEach((st) => {
          if (st.prefix) {
            if (st.companyName) valMap[`${st.prefix}_Tên_CQ`] = st.companyName;
            if (st.representative)
              valMap[`${st.prefix}_Đại_Diện`] = st.representative;
            if (st.position) valMap[`${st.prefix}_Chức_Vụ`] = st.position;
            if (st.customFields)
              st.customFields.forEach((cf) => {
                if (cf.key && cf.value)
                  valMap[`${st.prefix}_${cf.key}`] = cf.value;
              });
          }
        });
      }

      tags.forEach(function (tag) {
        let rawVal = "";
        let mapping = columnMapping[tag];
        if (mapping) {
          if (mapping.type === "excel" && excelData.length > 0) {
            let rowIndex = activeExcelRowIndex !== null ? activeExcelRowIndex : (selectedExcelRows.length > 0 ? selectedExcelRows[0] : 0);
            let row = excelData[rowIndex];
            if (row) {
              rawVal = safeGetExcelValue(mapping.value, row, null);
            }
          } else if (mapping.type === "manual") {
            rawVal = mapping.value;
          }
        }
        
        if (!rawVal && formData[tag]) {
          rawVal = formData[tag];
        }
        
        if (rawVal !== undefined && rawVal !== "") {
          valMap[tag] = rawVal;
        }
      });

      localStorage.setItem(
        `sde_${SDE_UID}_last_exported_data_` + currentProjectId,
        JSON.stringify(valMap),
      );
      setLastExportedData(valMap);

      if (templatesToExport.length === 1) {
        const template = templatesToExport[0];
        var currentValMap = { ...valMap };
        Object.keys(template.tagMapping || {}).forEach(function (oldTag) {
          var mappedTag = template.tagMapping[oldTag];
          if (currentValMap[mappedTag] !== undefined) {
            currentValMap[oldTag] = currentValMap[mappedTag];
          }
        });

        const currentZip = new PizZip(new Uint8Array(template.fileBuffer));
        let missed = await replaceTagsInXml(
          currentZip,
          currentValMap,
          enableHighlight,
          template.rawTags,
          cleanUnusedTags,
          globalDictionary,
        );
        if (missed.length > 0) {
          showToast("⚠️ Còn " + missed.length + " thẻ chưa thay thế", "warn");
          addLiveLog("Thẻ còn sót: " + missed.join(", "), "warn");
        }
        var out = currentZip.generate({ type: "blob" });
        const fileExt = template.originalName.toLowerCase().endsWith(".xlsx")
          ? ".xlsx"
          : ".docx";
        var singleFileName = template.customName || "HoSo_Xuat";
        singleFileName = sanitizePath(
          singleFileName
            .replace(/<<STT>>/g, "1")
            .replace(/\{\{([^{}]+)\}\}/g, function (match, colName) {
              var cleanCol = colName.trim();
              return valMap[cleanCol] !== undefined && valMap[cleanCol] !== null
                ? String(valMap[cleanCol])
                : match;
            })
            .trim(),
        );
        saveAs(out, singleFileName + fileExt);
        showToast("Đã xuất File Đơn Lẻ thành công!");
      } else {
        var zipArchive = new JSZip();
        let allMissed = new Set();
        for (let i = 0; i < templatesToExport.length; i++) {
          const template = templatesToExport[i];
          const fileExt = template.originalName.toLowerCase().endsWith(".xlsx")
            ? ".xlsx"
            : ".docx";

          currentValMap = { ...valMap };
          Object.keys(template.tagMapping || {}).forEach(function (oldTag) {
            var mappedTag = template.tagMapping[oldTag];
            if (currentValMap[mappedTag] !== undefined) {
              currentValMap[oldTag] = currentValMap[mappedTag];
            }
          });

          const currentZip = new PizZip(new Uint8Array(template.fileBuffer));
          let missed = await replaceTagsInXml(
            currentZip,
            currentValMap,
            enableHighlight,
            template.rawTags,
            cleanUnusedTags,
            globalDictionary,
          );
          missed.forEach((m) => allMissed.add(m));
          var outBuffer = currentZip.generate({ type: "arraybuffer" });
          var zipFileName =
            template.customName ||
            template.originalName.replace(/\.(docx|xlsx)$/i, "_Xuat");
          zipFileName = sanitizePath(
            zipFileName
              .replace(/<<STT>>/g, i + 1)
              .replace(/\{\{([^{}]+)\}\}/g, function (match, colName) {
                var cleanCol = colName.trim();
                return valMap[cleanCol] !== undefined &&
                  valMap[cleanCol] !== null
                  ? String(valMap[cleanCol])
                  : match;
              })
              .trim(),
          );
          zipArchive.file(zipFileName + fileExt, outBuffer);
        }
        if (allMissed.size > 0) {
          showToast("⚠️ Còn " + allMissed.size + " thẻ chưa thay thế", "warn");
          addLiveLog(
            "Thẻ còn sót: " + Array.from(allMissed).join(", "),
            "warn",
          );
        }
        var content = await zipArchive.generateAsync({ type: "blob" });
        const pName =
          projects.find((p) => p.id === currentProjectId)?.name || "Tong_Hop";
        let defaultZipName = `${pName}.zip`;
        let finalZipName = window.prompt(
          "Vui lòng nhập tên file ZIP tải về:",
          defaultZipName,
        );
        if (!finalZipName) finalZipName = defaultZipName;
        if (!finalZipName.toLowerCase().endsWith(".zip"))
          finalZipName += ".zip";

        saveAs(content, finalZipName);
        showToast("Đã tải xuống bộ ZIP!");
      }
    } catch (e) {
      showToast("Lỗi cấu trúc tệp. Chi tiết: " + e.message, "error");
    } finally {
      setIsProcessing(false);
    }
  }, [
    activeProjectTemplates, selectedTemplateIds, checkMissingBuffers, setIsProcessing, projectProfiles, currentProjectId,
    tags, columnMapping, excelData, activeExcelRowIndex, selectedExcelRows, safeGetExcelValue, formData, SDE_UID,
    setLastExportedData, enableHighlight, cleanUnusedTags, globalDictionary, addLiveLog, projects, showToast
  ]);

  const generateBatch = useCallback(async (isTest = false) => {
    var templatesToExport = activeProjectTemplates.filter(function (t) {
      return selectedTemplateIds.indexOf(t.id) !== -1;
    });
    if (templatesToExport.length === 0) {
      showToast("Vui lòng tick chọn file mẫu cần xuất", "error");
      return;
    }
    if (checkMissingBuffers(templatesToExport)) return;
    if (excelData.length === 0 || selectedExcelRows.length === 0) {
      showToast("Vui lòng chọn dữ liệu Excel", "error");
      return;
    }

    var localDirHandle = null;
    if (!isTest && exportMode === "local") {
      if (!window.showDirectoryPicker) {
        showToast(
          "Trình duyệt không hỗ trợ File System API. Đang tự động chuyển về xuất ZIP.",
          "warn",
        );
      } else {
        try {
          localDirHandle = await window.showDirectoryPicker({
            mode: "readwrite",
          });
        } catch (err) {
          showToast("Đã hủy chọn thư mục đầu ra", "error");
          return;
        }
      }
    }

    setIsProcessing(true);
    setLiveLogs([]);
    batchStartTimeRef.current = Date.now();
    setBatchETA("");
    addLiveLog(
      localDirHandle
        ? "Bắt đầu xuất hàng loạt ra thư mục Local..."
        : "Bắt đầu xử lý nén ZIP hàng loạt...",
      "info",
    );

    var missingRowsReport = [];
    let batchMissedTagsTotal = 0;
    try {
      var PizZip = window.PizZip;
      var JSZip = window.JSZip;
      var saveAs = window.saveAs;
      var zipArchive = new JSZip();

      var rowsToProcess = isTest ? [activeExcelRowIndex !== null ? activeExcelRowIndex : selectedExcelRows[0]] : selectedExcelRows;
      setBatchProgress({ current: 0, total: rowsToProcess.length });

      for (let i = 0; i < rowsToProcess.length; i++) {
        var index = rowsToProcess[i];
        var row = excelData[index];
        var missingInRow = [];

        var rootFolder = exportProjectName.trim()
          ? sanitizePath(exportProjectName)
          : "";
        var rawSubFolder =
          exportSubFolderPattern.trim() || "DONG_EXCEL_{index}";
        var subFolder = rawSubFolder.replace(
          /\{\{([^{}]+)\}\}/g,
          function (match, colName) {
            var cleanCol = colName.trim();
            return row[cleanCol] !== undefined && row[cleanCol] !== null
              ? String(row[cleanCol])
              : match;
          },
        );
        subFolder = sanitizePath(subFolder.replace(/\{index\}/g, index + 1));
        var folderPath = rootFolder ? rootFolder + "/" + subFolder : subFolder;

        for (let j = 0; j < templatesToExport.length; j++) {
          const template = templatesToExport[j];
          const currentZip = new PizZip(new Uint8Array(template.fileBuffer));

          let boundRow = getBoundRow(template, row);
          var valMapForTemplate = {};
          var profile = projectProfiles[currentProjectId];
          if (profile && profile.fields) {
            profile.fields.forEach(function (f) {
              if (f.v && f.v.trim() !== "") {
                valMapForTemplate[f.k] = f.v;
              }
            });
          }
          if (profile && profile.stakeholders) {
            profile.stakeholders.forEach((st) => {
              if (st.prefix) {
                if (st.companyName)
                  valMapForTemplate[`${st.prefix}_Tên_CQ`] = st.companyName;
                if (st.representative)
                  valMapForTemplate[`${st.prefix}_Đại_Diện`] =
                    st.representative;
                if (st.position)
                  valMapForTemplate[`${st.prefix}_Chức_Vụ`] = st.position;
                if (st.customFields)
                  st.customFields.forEach((cf) => {
                    if (cf.key && cf.value)
                      valMapForTemplate[`${st.prefix}_${cf.key}`] = cf.value;
                  });
              }
            });
          }

          template.tags.forEach(function (tag) {
            if (tag.toUpperCase() === "STT") {
              valMapForTemplate[tag] = index + 1;
            } else {
              var mapping = columnMapping[tag] || { type: "manual", value: "" };
              var rawVal =
                mapping.type === "excel"
                  ? safeGetExcelValue(mapping.value, row, boundRow)
                  : mapping.value;

              if (rawVal !== undefined && String(rawVal).trim() !== "") {
                valMapForTemplate[tag] = rawVal;
              }

              if (
                !valMapForTemplate[tag] ||
                String(valMapForTemplate[tag]).trim() === ""
              ) {
                if (missingInRow.indexOf(tag) === -1) missingInRow.push(tag);
              }
            }
          });

          Object.keys(template.tagMapping || {}).forEach(function (oldTag) {
            var mappedTag = template.tagMapping[oldTag];
            if (valMapForTemplate[mappedTag] !== undefined) {
              valMapForTemplate[oldTag] = valMapForTemplate[mappedTag];
            }
          });

          let missed = await replaceTagsInXml(
            currentZip,
            valMapForTemplate,
            enableHighlight,
            template.rawTags,
            cleanUnusedTags,
            globalDictionary,
          );
          if (missed.length > 0) {
            addLiveLog(
              `[THẺ SÓT] Dòng ${index + 1} - ${template.originalName}: ${missed.join(", ")}`,
              "warn",
            );
            batchMissedTagsTotal += missed.length;
          }

          if (isTest && templatesToExport.length === 1) {
            const fileExt = template.originalName
              .toLowerCase()
              .endsWith(".xlsx")
              ? ".xlsx"
              : ".docx";
            var outSingle = currentZip.generate({ type: "blob" });
            var baseSingleName =
              template.customName ||
              template.originalName.replace(/\.(docx|xlsx)$/i, "");
            baseSingleName = sanitizePath(
              baseSingleName
                .replace(/<<STT>>/g, index + 1)
                .replace(/\{\{([^{}]+)\}\}/g, function (match, colName) {
                  var cleanCol = colName.trim();
                  if (
                    valMapForTemplate[cleanCol] !== undefined &&
                    valMapForTemplate[cleanCol] !== null
                  )
                    return String(valMapForTemplate[cleanCol]);
                  if (row[cleanCol] !== undefined && row[cleanCol] !== null)
                    return String(row[cleanCol]);
                  return match;
                })
                .trim(),
            );
            saveAs(
              outSingle,
              `TEST_Dong${index + 1}_${baseSingleName}${fileExt}`,
            );
            addLiveLog(`Đã xuất trực tiếp file Test${fileExt}!`, "success");
          } else {
            const fileExt = template.originalName
              .toLowerCase()
              .endsWith(".xlsx")
              ? ".xlsx"
              : ".docx";
            var outBuffer = currentZip.generate({ 
              type: "arraybuffer",
              compression: "DEFLATE",
              compressionOptions: { level: 1 }
            });
            var baseTemplateName =
              template.customName ||
              template.originalName.replace(/\.(docx|xlsx)$/i, "_Xuat");
            baseTemplateName = sanitizePath(
              baseTemplateName
                .replace(/<<STT>>/g, index + 1)
                .replace(/\{\{([^{}]+)\}\}/g, function (match, colName) {
                  var cleanCol = colName.trim();
                  if (
                    valMapForTemplate[cleanCol] !== undefined &&
                    valMapForTemplate[cleanCol] !== null
                  )
                    return String(valMapForTemplate[cleanCol]);
                  if (row[cleanCol] !== undefined && row[cleanCol] !== null)
                    return String(row[cleanCol]);
                  return match;
                })
                .trim(),
            );
            var fileName = isTest
              ? `TEST_Dong${index + 1}_${baseTemplateName}${fileExt}`
              : baseTemplateName + fileExt;

            if (localDirHandle) {
              try {
                let currentDir = localDirHandle;
                if (folderPath) {
                  let pathParts = folderPath.split("/").filter((p) => p.trim());
                  for (let part of pathParts) {
                    currentDir = await currentDir.getDirectoryHandle(part, {
                      create: true,
                    });
                  }
                }
                const fileHandle = await currentDir.getFileHandle(fileName, {
                  create: true,
                });
                const writable = await fileHandle.createWritable();
                await writable.write(new Uint8Array(outBuffer));
                await writable.close();
              } catch (err) {
                addLiveLog(`Lỗi ghi file ${fileName}: ${err.message}`, "error");
              }
            } else {
              var zipFileName = isTest ? fileName : folderPath + "/" + fileName;
              zipArchive.file(zipFileName, outBuffer);
            }
          }
          
          if (j % 3 === 0) {
            await new Promise((resolve) => setTimeout(resolve, 0));
          }
        }

        if (missingInRow.length > 0) {
          missingRowsReport.push({
            row: index + 1,
            missing: missingInRow.length,
          });
          addLiveLog(
            `[CẢNH BÁO] Dòng ${index + 1} thiếu ${missingInRow.length} biến!`,
            "warn",
          );
        }

        setBatchProgress(function (prev) {
          const newCurrent = prev.current + 1;
          const T = prev.total;
          if (T > 0) {
            const elapsed =
              Date.now() - (batchStartTimeRef.current || Date.now());
            const progressRatio = newCurrent / T;
            if (progressRatio > 0.05 && elapsed > 500) {
              const totalEstMs = elapsed / progressRatio;
              const remainMs = totalEstMs - elapsed;
              const remainSec = Math.ceil(remainMs / 1000);
              setBatchETA(
                remainSec > 60
                  ? "còn ~" + Math.ceil(remainSec / 60) + " phút"
                  : "còn ~" + remainSec + " giây",
              );
            }
          }
          return { current: newCurrent, total: T };
        });
        if (!isTest || templatesToExport.length > 1) {
          addLiveLog(
            `Đã render xong hồ sơ cho dòng ${index + 1}: ${subFolder}`,
            "success",
          );
        }

        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      if (!localDirHandle) {
        if (!isTest || templatesToExport.length > 1) {
          addLiveLog("Bắt đầu nén toàn bộ thành file ZIP...", "info");
          var content = await zipArchive.generateAsync(
            { 
              type: "blob",
              compression: "DEFLATE",
              compressionOptions: { level: 1 }
            },
            (metadata) => {
              if (metadata.percent % 10 === 0) {
                addLiveLog(
                  `Tiến độ nén ZIP: ${metadata.percent.toFixed(0)}%`,
                  "info",
                );
              }
            },
          );
          var finalZipName = `HoSoXuat_${Date.now()}.zip`;
          saveAs(content, finalZipName);
          addLiveLog("Đã nén xong và tải ZIP!", "success");
        }
      } else {
        addLiveLog("Đã hoàn tất xuất thư mục Local!", "success");
      }

      if (missingRowsReport.length > 0)
        setConfirmModal({
          show: true,
          title: "Báo cáo thiếu dữ liệu hàng loạt",
          desc:
            "Quá trình xuất hoàn tất nhưng có " +
            missingRowsReport.length +
            " dòng bị thiếu dữ liệu ở một số thẻ. Xem chi tiết trong Logs.",
          btnConfirm: "Đóng",
          action: function () {
            setConfirmModal({
              show: false,
              action: null,
              title: "",
              desc: "",
            });
          },
        });
      if (batchMissedTagsTotal > 0) {
        showToast(
          "⚠️ Còn " + batchMissedTagsTotal + " thẻ chưa thay thế",
          "warn",
        );
      }
      showToast(
        isTest
          ? "Đã xuất Test 1 dòng thành công!"
          : "Đã xuất thành công " + rowsToProcess.length + " bộ hồ sơ!",
      );
    } catch (e) {
      showToast("Lỗi xử lý hàng loạt: " + e.message, "error");
      addLiveLog("❌ LỖI FATAL: " + e.message, "error");
    } finally {
      setIsProcessing(false);
      setBatchProgress({ current: 0, total: 0 });
    }
  }, [
    activeProjectTemplates, selectedTemplateIds, checkMissingBuffers, excelData, selectedExcelRows, exportMode,
    setIsProcessing, setLiveLogs, batchStartTimeRef, setBatchETA, addLiveLog, exportProjectName, exportSubFolderPattern,
    getBoundRow, projectProfiles, currentProjectId, tags, columnMapping, safeGetExcelValue, enableHighlight,
    cleanUnusedTags, globalDictionary, activeExcelRowIndex, setBatchProgress, showToast, setConfirmModal
  ]);

  const validateAndGenerateDoc = useCallback(() => {
    var templatesToExport = activeProjectTemplates.filter(function (t) {
      return selectedTemplateIds.indexOf(t.id) !== -1;
    });
    var singleCriticalMissing = [];
    templatesToExport.forEach((template) => {
      if (template.requiredTags) {
        template.requiredTags.forEach((tag) => {
          let rawVal = "";
          let mapping = columnMapping[tag];
          if (mapping) {
            if (mapping.type === "excel" && excelData.length > 0) {
              let rowIndex = activeExcelRowIndex !== null ? activeExcelRowIndex : (selectedExcelRows.length > 0 ? selectedExcelRows[0] : 0);
              let row = excelData[rowIndex];
              if (row) {
                rawVal = safeGetExcelValue(mapping.value, row, null);
              }
            } else if (mapping.type === "manual") {
              rawVal = mapping.value;
            }
          }
          if (!rawVal && formData[tag]) {
            rawVal = formData[tag];
          }
          if (!rawVal || String(rawVal).trim() === "") {
            singleCriticalMissing.push(
              `- {{${tag}}} (Mẫu: ${template.originalName})`,
            );
          }
        });
      }
    });

    if (singleCriticalMissing.length > 0) {
      showToast("❌ LỖI: Thiếu trường dữ liệu bắt buộc!", "error", 10000);
      var crdesc =
        "Không thể xuất File vì các thông tin BẮT BUỘC sau bị trống:\n\n" +
        singleCriticalMissing.slice(0, 10).join("\n");
      if (singleCriticalMissing.length > 10)
        crdesc += `\n... và ${singleCriticalMissing.length - 10} trường bắt buộc khác.`;

      setConfirmModal({
        show: true,
        title: "⚠️ Thiếu thông tin Bắt Buộc",
        desc: crdesc,
        btnConfirm: "Đã hiểu",
        action: function () {
          setConfirmModal({ show: false, action: null, title: "", desc: "" });
        },
      });
      return;
    }

    const missing = getMissingTags();
    if (missing.length > 0) {
      setConfirmModal({
        show: true,
        title: "⚠️ Còn " + missing.length + " tag chưa điền",
        desc:
          "Các tag sau sẽ để trống trong văn bản xuất ra:\n\n" +
          missing
            .slice(0, 10)
            .map((t) => "• {{" + t + "}}")
            .join("\n") +
          (missing.length > 10
            ? "\n... và " + (missing.length - 10) + " tag khác"
            : "") +
          "\n\nBạn có muốn tiếp tục xuất không?",
        btnConfirm: "Xuất ngay",
        action: function () {
          setConfirmModal({ show: false, action: null, title: "", desc: "" });
          setTimeout(() => generateDoc(), 100);
        },
      });
    } else {
      generateDoc();
    }
  }, [activeProjectTemplates, selectedTemplateIds, columnMapping, excelData, activeExcelRowIndex, selectedExcelRows, safeGetExcelValue, formData, showToast, setConfirmModal, getMissingTags, generateDoc]);

  const validateAndGenerateBatch = useCallback((isTest = false) => {
    var templatesToExport = activeProjectTemplates.filter(function (t) {
      return selectedTemplateIds.indexOf(t.id) !== -1;
    });
    var batchCriticalMissing = [];
    var rowsToProcess = isTest ? [activeExcelRowIndex !== null ? activeExcelRowIndex : selectedExcelRows[0]] : selectedExcelRows;

    if (rowsToProcess && rowsToProcess.length > 0) {
      for (let i = 0; i < rowsToProcess.length; i++) {
        var index = rowsToProcess[i];
        var row = excelData[index];
        if (!row) continue;
        for (let j = 0; j < templatesToExport.length; j++) {
          const template = templatesToExport[j];
          if (template.requiredTags && template.requiredTags.length > 0) {
            let boundRow = getBoundRow(template, row);
            template.requiredTags.forEach((tag) => {
              if (tag.toUpperCase() === "STT") return;
              var mapping = columnMapping[tag] || { type: "manual", value: "" };
              var rawVal =
                mapping.type === "excel"
                  ? safeGetExcelValue(mapping.value, row, boundRow)
                  : mapping.value;
              if (!rawVal || String(rawVal).trim() === "") {
                batchCriticalMissing.push(
                  `Dòng ${index + 1}: {{${tag}}} (Mẫu: ${template.originalName})`,
                );
              }
            });
          }
        }
      }
    }

    if (batchCriticalMissing.length > 0) {
      showToast("❌ LỖI: Thiếu trường dữ liệu bắt buộc!", "error", 10000);
      var crdesc =
        "PHÁT HIỆN LỖI NGHIÊM TRỌNG:\n\nCác thông tin BẤT BUỘC chưa được điền đủ:\n\n" +
        batchCriticalMissing
          .slice(0, 10)
          .map((t) => "- " + t)
          .join("\n");
      if (batchCriticalMissing.length > 10)
        crdesc += `\n... và ${batchCriticalMissing.length - 10} lỗi khác.`;
      crdesc += "\n\nVui lòng điền đủ dữ liệu trước khi tiếp tục xuất!";

      setConfirmModal({
        show: true,
        title: "⚠️ Dữ liệu Bắt Buộc Bị Thiếu",
        desc: crdesc,
        btnConfirm: "Đã hiểu",
        action: function () {
          setConfirmModal({ show: false, action: null, title: "", desc: "" });
        },
      });
      return;
    }

    var emptyVars = checkEmptyVars("batch");
    if (emptyVars.length > 0) {
      setConfirmModal({
        show: true,
        title: "Cảnh báo chưa Map biến",
        desc: `Có ${emptyVars.length} biến chưa được nối với Excel hoặc nhập tay. Gói thầu xuất ra sẽ bị trống chỗ này. Bạn có muốn tiếp tục?`,
        btnConfirm: "Tiếp tục xuất",
        action: function () {
          setConfirmModal(prev => ({ ...prev, show: false }));
          generateBatch(isTest);
        },
      });
    } else generateBatch(isTest);
  }, [activeProjectTemplates, selectedTemplateIds, activeExcelRowIndex, selectedExcelRows, excelData, getBoundRow, columnMapping, safeGetExcelValue, showToast, setConfirmModal, checkEmptyVars, generateBatch]);

  return {
    getBoundRow,
    safeGetExcelValue,
    handleAutoMap,
    handleAutofillFromExcelRow,
    getMissingTags,
    checkMissingBuffers,
    checkEmptyVars,
    generateDoc,
    generateBatch,
    validateAndGenerateDoc,
    validateAndGenerateBatch
  };
};
