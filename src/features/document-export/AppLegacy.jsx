import React, { useState, useEffect, useMemo, useRef } from "react";

import AIChatWidget from './components/AI/AIChatWidget.jsx';
const WordEditorModal = React.lazy(() => import("./components/Modals/WordEditorModal"));
const UnknownVarsModal = React.lazy(() => import("./components/Modals/UnknownVarsModal"));
const VariablesLibraryModal = React.lazy(() => import("./components/Modals/VariablesLibraryModal"));
import { inferVariableType, resolveSynonym, formatCurrency } from "./utils/variableUtils";
import ReactDOM from "react-dom/client";
import { validateTagName } from "./utils/tagUtils";
import { getUsableLocalDir, rememberLocalDir } from "./utils/localDir";

import {
  sanitizePath,
  getCleanTextFromZip,
  openDB,
  saveBufferToDB,
  getBufferFromDB,
  deleteBufferFromDB,
  clearAllBuffersFromDB,
  safeDeepClone,
  base64ToBuffer,
  safeFormatNumber,
  soThanhChu,
  removeVietnameseTones,
  normalizeKey,
  levenshtein,
  calculateVietnameseMatchScore,
  stripXmlTags,
  escapeXml,
  buildWordTableXml,
  extractAllTags,
  getBaseTag,
  calculateFinalValueForTag,
  escapeXmlText,
  unescapeXmlText,
  splitXmlAndTexts,
  joinPartsToXml,
  replaceTagsInXml,
  getSelectorClasses,
  getDelimiterBadge,
  HelpGuide,
  fetchGeminiWithBackoff,
  ErrorBoundary, 
  SOURCE_COLORS, 
  COLOR_CLASSES 
} from "./utils/helpers";
import { useAppStore } from '../../shared/store/useAppStore';
import { useWorkspaceBackup } from "./hooks/useWorkspaceBackup";
import { useProjectData } from "./hooks/useProjectData";
const ProcessModal = React.lazy(() => import("./components/Modals/ProcessModal"));
const ApprovalHistoryModal = React.lazy(() => import("./components/Modals/ApprovalHistoryModal"));
const RenameProcessNodeModal = React.lazy(() => import("./components/Modals/RenameProcessNodeModal"));
const AddStageModal = React.lazy(() => import("./components/Modals/AddStageModal"));
const ProjectModal = React.lazy(() => import("./components/Modals/ProjectModal"));
const SettingsModal = React.lazy(() => import("./components/Modals/SettingsModal"));
const AuthorModal = React.lazy(() => import("./components/Modals/AuthorModal"));
const ConfirmModal = React.lazy(() => import("./components/Modals/ConfirmModal"));
const LibraryModal = React.lazy(() => import("./components/Modals/LibraryModal"));
const PreviewModal = React.lazy(() => import("./components/Modals/PreviewModal"));
const WorkspaceTab = React.lazy(() => import("./components/_wip/tabs/WorkspaceTab"));
const SaveProfileModal = React.lazy(() => import("./components/_wip/modals/SaveProfileModal"));

export default function MainApp({ isEmbedded }) {
  var [authUser, setAuthUser] = useState(null);
  var [isAuthChecking, setIsAuthChecking] = useState(true);
  var [isWhitelistChecking, setIsWhitelistChecking] = useState(false);

  useEffect(() => {
    try {
      const authData = localStorage.getItem("sde_auth_v2");
      if (authData) {
        const parsed = JSON.parse(authData);
        if (parsed.exp > Date.now()) {
          setAuthUser(parsed);
        } else {
          localStorage.removeItem("sde_auth_v2");
        }
      }
    } catch (e) { console.warn("Lỗi kiểm tra đăng nhập:", e); }
    setIsAuthChecking(false);
  }, []);

  useEffect(() => {
    if (!isAuthChecking && !authUser) {
      const initGoogle = () => {
        if (!window.google || !window.google.accounts) return;
        window.google.accounts.id.initialize({
          client_id:
            "339257160851-sbju48fplsmmkusoh0g0hif6btt5060t.apps.googleusercontent.com",
          use_fedcm_for_prompt: true,
          callback: async (response) => {
            try {
              const base64Url = response.credential.split(".")[1];
              const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
              const jsonPayload = decodeURIComponent(
                atob(base64)
                  .split("")
                  .map(function (c) {
                    return (
                      "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
                    );
                  })
                  .join(""),
              );
              const payload = JSON.parse(jsonPayload);
              const email = payload.email.toLowerCase();

              setIsWhitelistChecking(true);

              // Kiểm tra Firestore whitelist
              const showAuthError = (msg) => {
                setIsWhitelistChecking(false);
                const errDiv = document.createElement("div");
                errDiv.style.cssText =
                  "position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#7f1d1d;color:#fca5a5;padding:12px 20px;border-radius:12px;font-size:13px;font-weight:bold;z-index:9999;border:1px solid #ef4444;box-shadow:0 4px 20px rgba(0,0,0,0.5);max-width:90vw;text-align:center;";
                errDiv.textContent = msg;
                document.body.appendChild(errDiv);
                setTimeout(() => errDiv.remove(), 4000);
              };

              try {
                const db = window.__sdeFirestore;
                const docRef = window.__sdeFirestoreDoc(
                  db,
                  "allowedUsers",
                  email,
                );
                const docSnap = await window.__sdeFirestoreGetDoc(docRef);

                if (!docSnap.exists()) {
                  showAuthError(
                    "⛔ Tài khoản " +
                      payload.email +
                      " chưa được cấp quyền truy cập.",
                  );
                  return;
                }

                const userDoc = docSnap.data();
                if (userDoc.disabled === true) {
                  showAuthError(
                    "🔒 Tài khoản " + payload.email + " đã bị vô hiệu hóa.",
                  );
                  return;
                }
              } catch (firestoreErr) {
                console.error(
                  "Firestore whitelist check failed:",
                  firestoreErr,
                );
                showAuthError(
                  "⚠️ Không thể xác minh quyền truy cập. Vui lòng thử lại.",
                );
                return;
              }

              setIsWhitelistChecking(false);
              const userData = {
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
                exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
              };
              localStorage.setItem("sde_auth_v2", JSON.stringify(userData));
              setAuthUser(userData);
            } catch (err) {
              console.error("Auth error", err);
              setIsWhitelistChecking(false);
              const errDiv = document.createElement("div");
              errDiv.style.cssText =
                "position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#7f1d1d;color:#fca5a5;padding:12px 20px;border-radius:12px;font-size:13px;font-weight:bold;z-index:9999;border:1px solid #ef4444;";
              errDiv.textContent = "Lỗi xác thực. Vui lòng thử lại.";
              document.body.appendChild(errDiv);
              setTimeout(() => errDiv.remove(), 4000);
            }
          },
        });
        window.google.accounts.id.renderButton(
          document.getElementById("google-btn"),
          {
            theme: "filled_dark",
            size: "large",
            text: "signin_with_google",
            locale: "vi",
          },
        );
      };

      if (window.google && window.google.accounts) {
        initGoogle();
      } else {
        const interval = setInterval(() => {
          if (window.google && window.google.accounts) {
            clearInterval(interval);
            initGoogle();
          }
        }, 100);
        return () => clearInterval(interval);
      }
    }
  }, [isAuthChecking, authUser]);

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#0A0D14]/40 backdrop-blur-xl flex items-center justify-center font-sans text-white text-[13px] leading-relaxed">
        Đang kiểm tra bảo mật...
      </div>
    );
  }

  if (isWhitelistChecking) {
    return (
      <div className="min-h-screen bg-[#0A0D14]/40 backdrop-blur-xl flex items-center justify-center font-sans text-white text-[13px] leading-relaxed">
        🔍 Đang xác minh quyền truy cập...
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="min-h-screen bg-[#0A0D14]/40 backdrop-blur-xl flex items-center justify-center font-sans text-slate-100 p-4">
        <div className="bg-[#0A0D14]/40 backdrop-blur-xl p-8 rounded-3xl border border-slate-700/50 shadow-lg shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-700 flex flex-col items-center max-w-sm w-full animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] mb-6 transform rotate-3 hover:rotate-6 transition-all duration-300">
            <span className="text-3xl">🚀</span>
          </div>
          <h1 className="text-2xl font-black text-white text-center tracking-tight leading-tight">
            SmartDocPro
            <br />
            <span className="text-indigo-400">V9.0</span>
          </h1>
          <p className="text-[13px] leading-relaxed text-slate-400 text-center mt-2 mb-8 font-medium">
            Hệ thống xử lý văn bản AI tự động
          </p>

          <div
            id="google-btn"
            className="w-full flex justify-center h-[40px] mb-6 min-h-[40px]"
                    ></div>
          <button
            onClick={() => {
              const dummyUser = { email: "dev@local", name: "Dev Mode", exp: Date.now() + 86400000 };
              localStorage.setItem("sde_auth_v2", JSON.stringify(dummyUser));
              setAuthUser(dummyUser);
            }}
            className="w-full bg-white/[0.03] backdrop-blur-md hover:bg-white/[0.06] backdrop-blur-lg text-slate-300 text-[13px] leading-relaxed font-bold py-2 rounded-xl mt-2 transition-all"
          >
            Bypass L?i Google (Dev Mode)
          </button>

          <div className="w-full bg-[#0A0D14]/40 backdrop-blur-xl/50 p-3 rounded-xl border border-slate-700/50 shadow-lg/50 mt-6">
            <p className="text-[12px] font-medium tracking-wide text-slate-400 text-center font-medium">
              ⚠️ Hệ thống nhóm. Sử dụng Google để xác thực danh tính.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <AppContent authUser={authUser} setAuthUser={setAuthUser} isEmbedded={isEmbedded} />;
}
const FormTextarea = React.memo(
  ({
    tag,
    initialVal,
    isTable,
    isChanged,
    handleFormBlur,
    setFocusedTag,
    setFormData,
    placeholderHint,
    inputType = "text",
  }) => {
    const [localVal, setLocalVal] = React.useState(initialVal || "");

    React.useEffect(() => {
      setLocalVal(initialVal || "");
    }, [initialVal]);

    const handleChange = (e) => {
      const newVal = e.target.value;
      setLocalVal(newVal);
    };

    const handleBlur = (e) => {
      setFormData((prev) => {
        const next = { ...prev };
        next[e.target.name] = e.target.value;
        return next;
      });
      handleFormBlur(e);
    };
    const isSingleLine = ["date", "email", "phone", "number", "currency"].includes(inputType);
    const commonProps = {
        name: tag,
        value: localVal,
        onChange: handleChange,
        onFocus: () => setFocusedTag(tag),
        onBlur: handleBlur,
        placeholder: placeholderHint || (isTable ? "Dán dữ liệu bảng từ Excel/Word vào đây..." : "Điền giá trị..."),
        className: `w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-1 text-sm text-white border transition-all duration-300 ${isChanged ? "bg-amber-950/20 border-amber-500/50 focus:ring-amber-500 focus:border-amber-500/80" : "bg-[#0A0D14]/40 backdrop-blur-xl border-slate-700/50 shadow-lg focus:ring-indigo-500"} ${!isSingleLine && (isTable ? "min-h-[80px] resize-y" : "min-h-[40px] resize-y")}`
    };

    if (isSingleLine) {
        let hT = "text";
        if (inputType === "date") hT = "date";
        if (inputType === "number" || inputType === "currency") hT = "text"; // Keep text for currency format handling
        if (inputType === "email") hT = "email";
        return <input type={hT} {...commonProps} />;
    }

    return <textarea {...commonProps} />;
  
  },
);
FormTextarea.displayName = "FormTextarea";

function AppContent({ authUser, setAuthUser, isEmbedded }) {
  const SDE_UID = authUser
    ? window
        .btoa(encodeURIComponent(authUser.email))
        .replace(/=/g, "")
        .substring(0, 10)
    : "guest";

  const FIXED_STAGES_SUGGESTIONS = [
    "1. Giai đoạn Chuẩn bị Đầu tư",
    "2. Giai đoạn Xin cấp phép",
    "3. Giai đoạn Thiết kế Cơ sở",
    "4. Giai đoạn Thiết kế Bản vẽ Thi công",
    "5. Giai đoạn Mời thầu & Chọn thầu",
    "6. Giai đoạn Khởi công xây dựng",
    "7. Giai đoạn Thi công",
    "8. Giai đoạn Giám sát thi công",
    "9. Giai đoạn Nghiệm thu khối lượng",
    "10. Giai đoạn Bàn giao đưa vào sử dụng",
    "11. Giai đoạn Quyết toán công trình",
    "12. Giai đoạn Bảo hành công trình",
    "13. Giai đoạn Thẩm tra thiết kế",
    "14. Giai đoạn Kiểm toán",
    "15. Giai đoạn Vận hành & Khai thác",
  ];

  useEffect(() => {
    if (SDE_UID === "aG9hbmd2aW" || SDE_UID === "guest") {
      const mKeys = [
        "projects_v8",
        "profiles_v8",
        "templates_v8",
        "project_profiles_v2",
        "project_stages_v1",
        "approval_history_v1",
        "active_project_id_v1",
        "active_tab",
        "last_sync_time",
        "last_drive_sync_time",
      ];
      mKeys.forEach((k) => {
        if (
          localStorage.getItem("sde_" + k) !== null &&
          localStorage.getItem(`sde_${SDE_UID}_${k}`) === null
        ) {
          localStorage.setItem(
            `sde_${SDE_UID}_${k}`,
            localStorage.getItem("sde_" + k),
          );
        }
      });
      for (let i = 0; i < localStorage.length; i++) {
        const lk = localStorage.key(i);
        if (
          lk &&
          (lk.startsWith("sde_form_data_v1.9_") ||
            lk.startsWith("sde_export_history_"))
        ) {
          if (!lk.startsWith(`sde_${SDE_UID}_`)) {
            const newK = lk.replace("sde_", `sde_${SDE_UID}_`);
            if (localStorage.getItem(newK) === null) {
              localStorage.setItem(newK, localStorage.getItem(lk));
            }
          }
        }
      }
    }
  }, [SDE_UID]);

  var [isAppReady, setIsAppReady] = useState(false);
  // --- NEW STATES FOR PROJECT & PROCESS MANAGEMENT ---
  var [projectProfiles, setProjectProfiles] = useState(function () {
    var data2 = localStorage.getItem(`sde_${SDE_UID}_project_profiles_v2`);
    if (data2) {
      try {
        return JSON.parse(data2);
      } catch (e) { console.warn("Lỗi parse JSON cache:", e); }
    }
    var data1 = localStorage.getItem(`sde_${SDE_UID}_project_profiles_v1`); // Try migrate
    if (data1) {
      try {
        var old = JSON.parse(data1);
        var newer = {};
        for (var id in old) {
          var p = old[id];
          newer[id] = {
            id: p.id,
            fields: [
              {
                id: Math.random().toString(),
                k: "Ma_Du_An",
                n: "Mã Dự án",
                v: p.maDA || "",
              },
              {
                id: Math.random().toString(),
                k: "Ten_Du_An",
                n: "Tên Dự án",
                v: p.tenDA || "",
              },
              {
                id: Math.random().toString(),
                k: "Cap_QDDT",
                n: "Cấp Quyết định Đầu tư",
                v: p.capQDDT || "",
              },
              {
                id: Math.random().toString(),
                k: "Chu_Dau_Tu",
                n: "Chủ Đầu tư",
                v: p.chuDauTu || "",
              },
              {
                id: Math.random().toString(),
                k: "Phong_Ban_Chuyen_Mon",
                n: "Phòng ban Chuyên môn",
                v: p.phongKinhTe || "",
              },
              {
                id: Math.random().toString(),
                k: "Tong_Muc_Dau_Tu",
                n: "Tổng Mức Đầu tư",
                v: p.tongMucDauTu || "",
              },
              {
                id: Math.random().toString(),
                k: "Nguon_Von",
                n: "Nguồn Vốn",
                v: p.nguonVon || "",
              },
              {
                id: Math.random().toString(),
                k: "Nha_Thau_Khao_Sat",
                n: "Nhà thầu Khảo sát",
                v: p.tvKhaoSat || "",
              },
              {
                id: Math.random().toString(),
                k: "Nha_Thau_Thiet_Ke",
                n: "Nhà thầu Thiết kế",
                v: p.tvThietKe || "",
              },
              {
                id: Math.random().toString(),
                k: "Nha_Thau_Tham_Tra",
                n: "Nhà thầu Thẩm tra",
                v: p.tvThamTra || "",
              },
              {
                id: Math.random().toString(),
                k: "Nha_Thau_Dau_Thau",
                n: "Nhà thầu Đấu thầu",
                v: p.tvDauThau || "",
              },
              {
                id: Math.random().toString(),
                k: "Nha_Thau_Thi_Cong",
                n: "Nhà thầu Thi công",
                v: p.tvThiCong || "",
              },
              {
                id: Math.random().toString(),
                k: "Nha_Thau_Giam_Sat",
                n: "Nhà thầu Giám sát",
                v: p.tvGiamSat || "",
              },
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

  var [projectStages, setProjectStages] = useState(function () {
    var data = localStorage.getItem(`sde_${SDE_UID}_project_stages_v1`);
    return data
      ? (function () {
          try {
            return JSON.parse(data);
          } catch (e) {
            return {};
          }
        })()
      : {};
  });

  var [approvalHistory, setApprovalHistory] = useState(function () {
    var data = localStorage.getItem(`sde_${SDE_UID}_approval_history_v1`);
    return data
      ? (function () {
          try {
            return JSON.parse(data);
          } catch (e) {
            return [];
          }
        })()
      : [];
  });

  var [editingProjectProfile, setEditingProjectProfile] = useState(null);

  var [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  var [isAddStageModalOpen, setIsAddStageModalOpen] = useState(false);
  var [newStageInput, setNewStageInput] = useState("");
  var [isCompactView, setIsCompactView] = useState(function () {
    return localStorage.getItem("sde_compact_view") === "true";
  });
  useEffect(
    function () {
      localStorage.setItem("sde_compact_view", isCompactView);
    },
    [isCompactView],
  );
  var [isApprovalHistoryModalOpen, setIsApprovalHistoryModalOpen] =
    useState(false);

  var [processDragInfo, setProcessDragInfo] = useState(null);
  var [processDragOverInfo, setProcessDragOverInfo] = useState(null);
  var [editingProcessNode, setEditingProcessNode] = useState(null); // { type: 'stage'|'doc', stageIndex, docIndex, oldName, newName }
  var [processModalStageFilter, setProcessModalStageFilter] = useState("all");
  var [wbsStageFilter, setWbsStageFilter] = useState("all");
  var [appZoomScale, setAppZoomScale] = useState(function () {
    return Number(localStorage.getItem("sde_app_zoom") || "100");
  });
  useEffect(
    function () {
      localStorage.setItem("sde_app_zoom", appZoomScale);
    },
    [appZoomScale],
  );
  // ----------------------------------------------------

  var [projects, setProjects] = useState(function () {
    var data = localStorage.getItem(`sde_${SDE_UID}_projects_v8`);
    var defaultVal = [
      {
        id: "proj_default",
        name: "Dự án Mặc định",
        description: "Không gian làm việc mặc định",
      },
    ];
    return data
      ? (function () {
          try {
            return JSON.parse(data);
          } catch (e) {
            return defaultVal;
          }
        })()
      : defaultVal;
  });

  var [geminiApiKey, setGeminiApiKey] = useState(function () {
    var val = localStorage.getItem("sde_gemini_key_v2");
    return val ? window.atob(val) : "";
  });

    var [unknownTagsAlert, setUnknownTagsAlert] = useState([]);
  var [wordEditorTemplate, setWordEditorTemplate] = useState(null);
  
  var [globalDictionary, setGlobalDictionary] = useState(() => {
    try {
      const saved = localStorage.getItem(`sde_${SDE_UID}_dict_v1`);
      if (saved) return JSON.parse(saved);
    } catch (e) { console.warn("Lỗi đọc từ điển từ localStorage:", e); }
    return {}; // format: { TAG_NAME: { description, type, count, defaultValue } }
  });

  var [standardPrefixes, setStandardPrefixes] = useState(() => {
    try {
      const saved = localStorage.getItem(`sde_${SDE_UID}_dict_prefixes`);
      if (saved) {
        var parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map(p => typeof p === 'string' ? { prefix: p, desc: "" } : p);
        }
      }
    } catch (e) { console.warn("Lỗi đọc prefix từ localStorage:", e); }
    return []; // e.g. [{ prefix: "DA_", desc: "Dự án A" }]
  });

  useEffect(() => {
    if (globalDictionary) {
      localStorage.setItem(
        `sde_${SDE_UID}_dict_v1`,
        JSON.stringify(globalDictionary),
      );
    }
  }, [globalDictionary, SDE_UID]);

  useEffect(() => {
    if (standardPrefixes) {
      localStorage.setItem(
        `sde_${SDE_UID}_dict_prefixes`,
        JSON.stringify(standardPrefixes),
      );
    }
  }, [standardPrefixes, SDE_UID]);

  var clearGeminiKey = function () {
    setGeminiApiKey("");
    localStorage.removeItem("sde_gemini_key_v2");
    showToast("Đã xóa API Key khỏi bộ nhớ!", "info");
  };

  var [backupReminderInterval, setBackupReminderInterval] = useState(
    function () {
      return parseInt(
        localStorage.getItem(`sde_${SDE_UID}_backup_reminder`) || "3",
      ); // default 3 days
    },
  );

  useEffect(() => {
    if (backupReminderInterval > 0) {
      const lastBackup = localStorage.getItem(
        `sde_${SDE_UID}_last_backup_time`,
      );
      const now = Date.now();
      if (!lastBackup) {
        // First time setup, don't show immediately but set the timer
        localStorage.setItem(`sde_${SDE_UID}_last_backup_time`, now.toString());
      } else {
        const daysSince = (now - parseInt(lastBackup)) / (1000 * 60 * 60 * 24);
        if (daysSince >= backupReminderInterval) {
          showToast(
            `Đã ${Math.floor(daysSince)} ngày bạn chưa tải bản sao lưu (Backup) mới! Vui lòng vào Cài đặt để Xuất tính năng Backup an toàn.`,
            "warning",
          );
        }
      }
    }
  }, [backupReminderInterval, SDE_UID]);

  async function getTemplateBase64(template) {
    let b64 = template.fileBufferB64 || null;
    if (!b64) {
      try {
        const buf = await getBufferFromDB(template.id);
        if (buf) {
          b64 = await new Promise((resolve, reject) => {
            const blob = new Blob([buf]);
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(",")[1]);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(blob);
          });
        }
      } catch (e) {
        console.warn("Không thể encode template:", template.id, e);
      }
    }
    return b64;
  }

  var [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  var [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  var [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  var [singleTagFilterMode, setSingleTagFilterMode] = useState("all");
  var [batchTagFilterMode, setBatchTagFilterMode] = useState("all");
  var [focusedTag, setFocusedTag] = useState(null);

  var [loadedTemplates, setLoadedTemplates] = useState([]);
  var [selectedTemplateIds, setSelectedTemplateIds] = useState([]);
  var [activeMappingTab, setActiveMappingTab] = useState("all");
  var [activeSingleMappingTab, setActiveSingleMappingTab] = useState("all");

  var PROJECT_STAGES_FILTER_OPTIONS = useMemo(
    function () {
      var targetProjId = currentProjectId || "proj_default";
      var currentStages =
        typeof projectStages !== "undefined" && projectStages[targetProjId]
          ? projectStages[targetProjId]
          : [];

      var processItemNames = [];
      currentStages.forEach(function (s) {
        if (s.name) processItemNames.push(s.name);
      });

      var activeStages = loadedTemplates
        .filter(function (t) {
          return t.projectId === currentProjectId;
        })
        .map(function (t) {
          return t.stage;
        })
        .filter(Boolean);

      var defaultProcessStages = [
        "1. Giai đoạn Chuẩn bị Đầu tư",
        "2. Giai đoạn Khảo sát & Thiết kế",
        "3. Giai đoạn Lựa chọn Nhà thầu",
        "4. Giai đoạn Thi công Xây lắp",
        "5. Giai đoạn Nghiệm thu & Thanh Quyết toán",
        "6. Bàn giao & Bảo hành",
        "7. Hợp đồng QLDA",
        "8. Hợp đồng thiết kế",
        "9. Hợp đồng thẩm tra",
        "10. Hợp đồng giám sát",
        "11. Hợp đồng thi công",
        "12. Hợp đồng bảo hiểm",
        "13. Hợp đồng kiểm tra công tác nghiệm thu",
        "14. Hợp đồng khác",
        "15. Văn bản các loại khác",
      ];

      var stagesToUse = defaultProcessStages;

      var allStages = Array.from(
        new Set(stagesToUse.concat(processItemNames, activeStages)),
      ).filter(function (x) {
        return x !== "Tất cả" && x !== "Chưa phân loại" && x !== "Khác";
      });

      return ["Tất cả", "Chưa phân loại"].concat(allStages).concat(["Khác"]);
    },
    [currentProjectId, projectStages, loadedTemplates],
  );
  var [viewStageFilter, setViewStageFilter] = useState("Tất cả");

  var [libsLoaded, setLibsLoaded] = useState(false);
  var [loadingStatus, setLoadingStatus] = useState(
    "Đang khởi tạo hệ thống (V4.0.0)...",
  );

  var [currentProjectId, setCurrentProjectId] = useState(function () {
    return (
      localStorage.getItem(`sde_${SDE_UID}_active_project_id_v1`) ||
      "proj_default"
    );
  });
  useEffect(
    function () {
      setViewStageFilter("Tất cả");
    },
    [currentProjectId],
  );
  var [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  var [projectWizardStep, setProjectWizardStep] = useState(1);
  var [wizardTemplateSelection, setWizardTemplateSelection] = useState({
    type: "empty",
  });
  var [wizardSelectedCloneProjId, setWizardSelectedCloneProjId] = useState("");
  var [newMemberName, setNewMemberName] = useState("");
  var [newMemberRole, setNewMemberRole] = useState("Kỹ sư QA/QC");
  var [newMemberEmail, setNewMemberEmail] = useState("");
  var [newMemberPhone, setNewMemberPhone] = useState("");
  var [newMemberPerms, setNewMemberPerms] = useState("Xem & Ký");
  var [appRoute, setAppRoute] = useState("legal");
  var [isProjectRenameOpen, setIsProjectRenameOpen] = useState(false);
  var [newProjectName, setNewProjectName] = useState("");
  var [newProjectDesc, setNewProjectDesc] = useState("");

  var [toast, setToast] = useState({ show: false, msg: "", type: "info" });
  const globalActiveMainTab = useAppStore(state => state.activeMainTab);
  const setGlobalActiveMainTab = useAppStore(state => state.setActiveMainTab);
  const isFullScreen = useAppStore(state => state.isFullScreen);
  const setIsFullScreen = useAppStore(state => state.setIsFullScreen);
  const screenResolution = useAppStore(state => state.screenResolution);
  const setScreenResolution = useAppStore(state => state.setScreenResolution);
  const exportMode = useAppStore(state => state.exportMode);
  const setExportMode = useAppStore(state => state.setExportMode);
  const storeExportSubFolderPattern = useAppStore(state => state.exportSubFolderPattern);
  const setStoreExportSubFolderPattern = useAppStore(state => state.setExportSubFolderPattern);
  const storeEnableHighlight = useAppStore(state => state.enableHighlight);
  const setStoreEnableHighlight = useAppStore(state => state.setEnableHighlight);
  const storeCleanUnusedTags = useAppStore(state => state.cleanUnusedTags);
  const setStoreCleanUnusedTags = useAppStore(state => state.setCleanUnusedTags);
  var [localActiveMainTab, setLocalActiveMainTab] = useState("workspace");
  const storeActiveMainTab = useAppStore(state => state.activeMainTab);
  const setStoreActiveMainTab = useAppStore(state => state.setActiveMainTab);
  
  const activeMainTab = isEmbedded ? storeActiveMainTab : localActiveMainTab;

  const setActiveMainTab = (newTab) => {
    if (isEmbedded) {
      setStoreActiveMainTab(newTab);
    } else {
      setLocalActiveMainTab(newTab);
    }
  };
  var [activeTab, setActiveTab] = useState(function () {
    return localStorage.getItem(`sde_${SDE_UID}_active_tab`) || "single";
  });

  var [previewMode, setPreviewMode] = useState("final");
  var [zoomLevel, setZoomLevel] = useState(1);
  var previewContainerRef = useRef(null);
  var scrollContainerRef = useRef(null);
  var [isRenderingPreview, setIsRenderingPreview] = useState(false);

  var updateStakeholder = function (id, field, value) {
    setProjectProfiles((prev) => {
      var currentProfile = prev[currentProjectId] || {};
      var currentStakeholders = currentProfile.stakeholders || [];
      return {
        ...prev,
        [currentProjectId]: {
          ...currentProfile,
          stakeholders: currentStakeholders.map((st) =>
            st.id === id ? { ...st, [field]: value } : st,
          ),
        },
      };
    });
  };

  var removeStakeholder = function (id) {
    setProjectProfiles((prev) => {
      var currentProfile = prev[currentProjectId] || {};
      var currentStakeholders = currentProfile.stakeholders || [];
      return {
        ...prev,
        [currentProjectId]: {
          ...currentProfile,
          stakeholders: currentStakeholders.filter((st) => st.id !== id),
        },
      };
    });
  };

  var addStakeholderCustomField = function (stakeholderId) {
    setProjectProfiles((prev) => {
      var currentProfile = prev[currentProjectId] || {};
      var currentStakeholders = currentProfile.stakeholders || [];
      return {
        ...prev,
        [currentProjectId]: {
          ...currentProfile,
          stakeholders: currentStakeholders.map((st) =>
            st.id === stakeholderId
              ? {
                  ...st,
                  customFields: [
                    ...(st.customFields || []),
                    { id: Math.random().toString(), key: "", value: "" },
                  ],
                }
              : st,
          ),
        },
      };
    });
  };

  var updateStakeholderCustomField = function (
    stakeholderId,
    fieldId,
    keyOrValue,
    newVal,
  ) {
    setProjectProfiles((prev) => {
      var currentProfile = prev[currentProjectId] || {};
      var currentStakeholders = currentProfile.stakeholders || [];
      return {
        ...prev,
        [currentProjectId]: {
          ...currentProfile,
          stakeholders: currentStakeholders.map((st) =>
            st.id === stakeholderId
              ? {
                  ...st,
                  customFields: (st.customFields || []).map((cf) =>
                    cf.id === fieldId ? { ...cf, [keyOrValue]: newVal } : cf,
                  ),
                }
              : st,
          ),
        },
      };
    });
  };

  var removeStakeholderCustomField = function (stakeholderId, fieldId) {
    setProjectProfiles((prev) => {
      var currentProfile = prev[currentProjectId] || {};
      var currentStakeholders = currentProfile.stakeholders || [];
      return {
        ...prev,
        [currentProjectId]: {
          ...currentProfile,
          stakeholders: currentStakeholders.map((st) =>
            st.id === stakeholderId
              ? {
                  ...st,
                  customFields: (st.customFields || []).filter(
                    (cf) => cf.id !== fieldId,
                  ),
                }
              : st,
          ),
        },
      };
    });
  };

  var [formData, setFormData] = useState(function () {
    var savedProjId =
      localStorage.getItem(`sde_${SDE_UID}_active_project_id_v1`) ||
      "proj_default";
    var data = localStorage.getItem(
      `sde_${SDE_UID}_form_data_v1.9_` + savedProjId,
    );
    try {
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  });
  var [lastExportedData, setLastExportedData] = useState(function () {
    var savedProjId =
      localStorage.getItem(`sde_${SDE_UID}_active_project_id_v1`) ||
      "proj_default";
    var data = localStorage.getItem(
      `sde_${SDE_UID}_last_exported_data_` + savedProjId,
    );
    try {
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  });
  var [formHistory, setFormHistory] = useState([{}]);
  var [historyIndex, setHistoryIndex] = useState(0);
  var formHistoryRef = useRef([{}]);
  var historyIndexRef = useRef(0);

  useEffect(
    function () {
      var saved = localStorage.getItem(
        `sde_${SDE_UID}_form_data_v1.9_` + currentProjectId,
      );
      if (saved) {
        try {
          setFormData(JSON.parse(saved));
        } catch (e) {
          setFormData({});
        }
      } else {
        setFormData({});
      }

      var savedMap = localStorage.getItem(
        `sde_${SDE_UID}_column_mapping_v1_` + currentProjectId,
      );
      if (savedMap) {
        try {
          setColumnMapping(JSON.parse(savedMap));
        } catch (e) {
          setColumnMapping({});
        }
      } else {
        setColumnMapping({});
      }

      setFormHistory([{}]);
      setHistoryIndex(0);
      formHistoryRef.current = [{}];
      historyIndexRef.current = 0;

      var lastExport = localStorage.getItem(
        `sde_${SDE_UID}_last_exported_data_` + currentProjectId,
      );
      setLastExportedData(
        lastExport
          ? (function () {
              try {
                return JSON.parse(lastExport);
              } catch (e) {
                return null;
              }
            })()
          : null,
      );
    },
    [currentProjectId],
  );

  useEffect(
    function () {
      localStorage.setItem(
        `sde_${SDE_UID}_column_mapping_v1_` + currentProjectId,
        JSON.stringify(columnMapping),
      );
    },
    [columnMapping, currentProjectId],
  );

  var [activePreviewId, setActivePreviewId] = useState("");
  var [isProcessing, setIsProcessing] = useState(false);
  var [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  var batchStartTimeRef = useRef(null);
  var [batchETA, setBatchETA] = useState("");
  var [liveLogs, setLiveLogs] = useState([]);
  var [showHelp, setShowHelp] = useState(false);

  var [exportProjectName, setExportProjectName] = useState("");
  // exportSubFolderPattern, enableHighlight, cleanUnusedTags now from useAppStore
  var exportSubFolderPattern = storeExportSubFolderPattern;
  var setExportSubFolderPattern = setStoreExportSubFolderPattern;
  var enableHighlight = storeEnableHighlight;
  var setEnableHighlight = setStoreEnableHighlight;
  var cleanUnusedTags = storeCleanUnusedTags;
  var setCleanUnusedTags = setStoreCleanUnusedTags;
  const appActionTrigger = useAppStore((state) => state.appActionTrigger);

  useEffect(() => {
    if (appActionTrigger) {
      if (appActionTrigger.action === 'NEW_PROJECT') {
        setProjectWizardStep(1);
        setEditingProjectProfile({ id: '', name: '', maDA: '', description: '', fields: [], stakeholders: [], assignedUsers: [] });
        setWizardTemplateSelection({ type: 'empty' });
        setWizardSelectedCloneProjId('');
        setIsProjectModalOpen(true);
      } else if (appActionTrigger.action === 'PROCESS') {
        setIsProcessModalOpen(true);
      } else if (appActionTrigger.action === 'UPLOAD_WORD') {
        const fileInput = document.getElementById('global-word-upload');
        if (fileInput) fileInput.click();
      } else if (appActionTrigger.action === 'UPLOAD_EXCEL') {
        const fileInput = document.getElementById('global-excel-upload');
        if (fileInput) fileInput.click();
      } else if (appActionTrigger.action === 'PRINT') {
        setIsPreviewModalOpen(true);
      } else if (appActionTrigger.action === 'SETTINGS') {
        setIsSettingsModalOpen(true);
      } else if (appActionTrigger.action === 'HISTORY') {
        setIsApprovalHistoryModalOpen(true);
      }
    }
  }, [appActionTrigger]);
  var [editingTemplate, setEditingTemplate] = useState(null);
  var [activeEditMethod, setActiveEditMethod] = useState("offline");
  var [docxXmlParts, setDocxXmlParts] = useState([]);
  var [docxSegmentSearch, setDocxSegmentSearch] = useState("");

  useEffect(() => {
    if (editingTemplate) {
      setActiveEditMethod("offline");
      setDocxSegmentSearch("");
      if (editingTemplate.fileBuffer) {
        try {
          var PizZip = window.PizZip;
          var zip = new PizZip(new Uint8Array(editingTemplate.fileBuffer));
          var xmlText = zip.file("word/document.xml").asText();
          var parts = splitXmlAndTexts(xmlText);
          setDocxXmlParts(parts);
        } catch (e) {
          console.error("Lỗi giải nén xml mẫu:", e);
          setDocxXmlParts([]);
        }
      } else {
        setDocxXmlParts([]);
      }
    } else {
      setDocxXmlParts([]);
    }
  }, [editingTemplate?.id]);
  var [newTagInput, setNewTagInput] = useState("");
  // exportMode is now from useAppStore (see store selectors above)

  var [uploadedWorkbooks, setUploadedWorkbooks] = useState([]);
  var [selectedSheetKeys, setSelectedSheetKeys] = useState([]);
  var [wordAuditModal, setWordAuditModal] = useState({
    show: false,
    templatesBatch: [],
    templateIdsBatch: [],
    unknownTags: [],
  });
  var [excelAuditModal, setExcelAuditModal] = useState({
    show: false,
    unknownTags: [],
    newWbs: [],
    newKeys: [],
  });

  var [excelData, setExcelData] = useState([]);
  useEffect(() => {
    if (excelData && excelData.length > 0) {
      setActiveTab("batch");
    }
  }, [excelData]);

  var [selectedExcelRows, setSelectedExcelRows] = useState([]);
  var [activeExcelRowIndex, setActiveExcelRowIndex] = useState(null);
  var [excelSearchQuery, setExcelSearchQuery] = useState("");
  var [excelPage, setExcelPage] = useState(1);
  var [excelRowsPerPage, setExcelRowsPerPage] = useState(10);
  var [editingExcelCell, setEditingExcelCell] = useState(null);
  var [hideEmptyColumns, setHideEmptyColumns] = useState(false);
  var [excelColFilters, setExcelColFilters] = useState({});

  var [autoFillKey, setAutoFillKey] = useState("");
  var [masterSheetKey, setMasterSheetKey] = useState("");
  var prevAggregatedLengthRef = useRef(-1);

  var [columnMapping, setColumnMapping] = useState(function () {
    var savedProjId =
      localStorage.getItem(`sde_${SDE_UID}_active_project_id_v1`) ||
      "proj_default";
    var data = localStorage.getItem(
      `sde_${SDE_UID}_column_mapping_v1_` + savedProjId,
    );
    return data ? JSON.parse(data) : {};
  });
  var [savedProfiles, setSavedProfiles] = useState(function () {
    var data = localStorage.getItem(`sde_${SDE_UID}_profiles_v8`);
    return data
      ? (function () {
          try {
            return JSON.parse(data);
          } catch (e) {
            return {};
          }
        })()
      : {};
  });
  var [selectedProfileName, setSelectedProfileName] = useState("");
  var [profileNameInput, setProfileNameInput] = useState("");
  var [isSaveProfileModalOpen, setIsSaveProfileModalOpen] = useState(false);

  var [aiText, setAiText] = useState("");
  var [aiImage, setAiImage] = useState(null);
  var [aiImageBase64, setAiImageBase64] = useState("");
  var [aiLoading, setAiLoading] = useState(false);
  var [aiExtractedData, setAiExtractedData] = useState(null);
  var [aiSelectedFields, setAiSelectedFields] = useState({});
  var [confirmModal, setConfirmModal] = useState({
    show: false,
    action: null,
    title: "",
    desc: "",
    btnConfirm: "Đồng ý",
  });
  var [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  var [isVariableLibraryOpen, setIsVariableLibraryOpen] = useState(false);

  var handleSaveToLibrary = async function (id) {
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
  };

  var handleExtractFromLibrary = async function (e, id) {
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
  };

  var handleDeleteFromLibrary = async function (e, id) {
    e.stopPropagation();
    await deleteBufferFromDB(id);
    setLoadedTemplates((prev) => prev.filter((t) => t.id !== id));
    showToast("Đã xóa khỏi Thư viện!");
  };

  var [exportReportModal, setExportReportModal] = useState({
    show: false,
    success: 0,
    missingRows: [],
    total: 0,
  });
  var [copiedTag, setCopiedTag] = useState("");

  const handleCopyTag = (tag) => {
    const textToCopy = "{{" + tag + "}}";
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          setCopiedTag(tag);
          setTimeout(() => setCopiedTag(""), 1500);
          showToast("Đã copy: " + textToCopy, "success");
        })
        .catch(() => {
          showToast("Không thể copy", "error");
        });
    }
  };

  var [tagSearchQuery, setTagSearchQuery] = useState("");
  var [mappingSearchQuery, setMappingSearchQuery] = useState("");

  var [isDragWord, setIsDragWord] = useState(false);
  var [isDragExcel, setIsDragExcel] = useState(false);
  var [draggedTemplateIndex, setDraggedTemplateIndex] = useState(null);
  var [dragOverTemplateIndex, setDragOverTemplateIndex] = useState(null);

  const isDown = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const scrollLeft = useRef(0);
  const scrollTop = useRef(0);

  const startDrag = (e) => {
    isDown.current = true;
    var clientX = e.touches ? e.touches[0].pageX : e.pageX;
    var clientY = e.touches ? e.touches[0].pageY : e.pageY;
    startX.current = clientX - scrollContainerRef.current.offsetLeft;
    startY.current = clientY - scrollContainerRef.current.offsetTop;
    scrollLeft.current = scrollContainerRef.current.scrollLeft;
    scrollTop.current = scrollContainerRef.current.scrollTop;
  };
  const stopDrag = () => {
    isDown.current = false;
  };
  const onDrag = (e) => {
    if (!isDown.current || !scrollContainerRef.current) return;
    e.preventDefault();
    var clientX = e.touches ? e.touches[0].pageX : e.pageX;
    var clientY = e.touches ? e.touches[0].pageY : e.pageY;
    const x = clientX - scrollContainerRef.current.offsetLeft;
    const y = clientY - scrollContainerRef.current.offsetTop;
    const walkX = (x - startX.current) * 1.5;
    const walkY = (y - startY.current) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeft.current - walkX;
    scrollContainerRef.current.scrollTop = scrollTop.current - walkY;
  };

  var getBoundRow = function (template, currentRow, silent) {
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
  };

  var safeGetExcelValue = function (colName, currentRow, boundRow) {
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
  };

  useEffect(function () {
    var loadData = async function () {
      try {
        setLibsLoaded(true);
        setLoadingStatus("Đang truy xuất Database...");
        var metaDataStr = localStorage.getItem(`sde_${SDE_UID}_templates_v8`);
        var parsedTemplates = [];
        if (metaDataStr) {
          var metaData = JSON.parse(metaDataStr);
          for (let meta of metaData) {
            try {
              var dbBuffer = await getBufferFromDB(meta.id);
              if (dbBuffer) meta.fileBuffer = dbBuffer;
              else if (meta.fileBufferB64) {
                meta.fileBuffer = base64ToBuffer(meta.fileBufferB64);
                await saveBufferToDB(meta.id, meta.fileBuffer);
              }

              if (meta.fileBuffer) {
                try {
                  var PizZip = window.PizZip;
                  var zip = new PizZip(new Uint8Array(meta.fileBuffer));
                  var rawCleanText = getCleanTextFromZip(zip);
                  var parsed = extractAllTags(rawCleanText);
                  meta.tags = parsed.uniqueTagNames;
                  meta.rawTags = parsed.uniqueRawTags;
                  meta.tagTypes = parsed.tagToTypeMap;
                  meta.activeConfigs = parsed.detectedConfigs;
                } catch(e) {
                  // ignore
                }
              }

              parsedTemplates.push({
                ...meta,
                bindSheetKey: meta.bindSheetKey || "",
                isHiddenFromMainList: meta.isHiddenFromMainList || false,
              });
            } catch (err) {
              console.error("Lỗi nạp template", meta.id, err);
              parsedTemplates.push({
                ...meta,
                fileBuffer: null,
                bindSheetKey: meta.bindSheetKey || "",
                isHiddenFromMainList: meta.isHiddenFromMainList || false,
              });
            }
          }
        }
        setLoadedTemplates(parsedTemplates);
        setIsAppReady(true);
      } catch (err) {
        setLoadingStatus("❌ Lỗi khởi tạo: " + err.message);
      }
    };
    loadData();
  }, []);

  useEffect(
    function () {
      if (isAppReady) {
        var metaOnly = loadedTemplates.map((t) => ({
          id: t.id,
          projectId: t.projectId,
          originalName: t.originalName,
          customName: t.customName,
          tags: t.tags,
          rawTags: t.rawTags,
          tagTypes: t.tagTypes,
          activeConfigs: t.activeConfigs,
          bindSheetKey: t.bindSheetKey || "",
          isHiddenFromMainList: t.isHiddenFromMainList || false,
        }));
        localStorage.setItem(
          `sde_${SDE_UID}_templates_v8`,
          JSON.stringify(metaOnly),
        );
      }
    },
    [loadedTemplates, isAppReady],
  );

  var activeProjectTemplates = useMemo(
    function () {
      var stages = projectStages[currentProjectId] || [];
      var stageMap = {};
      stages.forEach(function (stage) {
        if (stage.docs) {
          stage.docs.forEach(function (doc) {
            if (doc.templateId) {
              stageMap[doc.templateId] = {
                stageName: stage.name,
                docName: doc.name,
              };
            }
          });
        }
      });

      return loadedTemplates
        .filter(function (t) {
          return t.projectId === currentProjectId && !t.isHiddenFromMainList;
        })
        .map(function (t) {
          var mapped = stageMap[t.id];
          if (mapped) {
            return Object.assign({}, t, {
              stage: mapped.stageName,
              customName: mapped.docName,
            });
          }
          return Object.assign({}, t, { stage: "Chưa phân loại" });
        });
    },
    [loadedTemplates, currentProjectId, projectStages],
  );

  var visibleProjectTemplates = useMemo(
    function () {
      return activeProjectTemplates.filter(function (t) {
        if (viewStageFilter === "Tất cả") return true;
        if (
          viewStageFilter === "Chưa phân loại" &&
          (!t.stage || t.stage === "Chưa phân loại")
        )
          return true;
        return t.stage === viewStageFilter;
      });
    },
    [activeProjectTemplates, viewStageFilter],
  );

  useEffect(
    function () {
      if (!isAppReady) return;
      var savedUI = localStorage.getItem(
        `sde_${SDE_UID}_ui_state_${currentProjectId}`,
      );
      if (savedUI) {
        try {
          var parsed = JSON.parse(savedUI);
          if (parsed.selectedTemplateIds)
            setSelectedTemplateIds(parsed.selectedTemplateIds);
          else
            setSelectedTemplateIds(
              activeProjectTemplates.map(function (t) {
                return t.id;
              }),
            );
          if (parsed.activeMappingTab)
            setActiveMappingTab(parsed.activeMappingTab);
          if (parsed.activeSingleMappingTab)
            setActiveSingleMappingTab(parsed.activeSingleMappingTab);
          if (parsed.activePreviewId)
            setActivePreviewId(parsed.activePreviewId);
        } catch (e) { console.warn("Lỗi khôi phục activePreviewId:", e); }
      } else {
        setSelectedTemplateIds(
          activeProjectTemplates.map(function (t) {
            return t.id;
          }),
        );
        setActiveMappingTab("all");
        setActiveSingleMappingTab("all");
      }
    },
    [currentProjectId, isAppReady],
  ); // Wait until loadedTemplates resolves metadata completely!

  useEffect(() => {
    if (activeProjectTemplates.length > 0) {
      if (
        activeMappingTab !== "all" &&
        !activeProjectTemplates.find((t) => t.id === activeMappingTab)
      ) {
        setActiveMappingTab("all");
      }
      if (
        activeSingleMappingTab !== "all" &&
        !activeProjectTemplates.find((t) => t.id === activeSingleMappingTab)
      ) {
        setActiveSingleMappingTab("all");
      }
    }
  }, [activeMappingTab, activeSingleMappingTab, activeProjectTemplates]);

  useEffect(
    function () {
      if (!isAppReady) return;
      var uiState = {
        selectedTemplateIds: selectedTemplateIds,
        activeMappingTab: activeMappingTab,
        activeSingleMappingTab: activeSingleMappingTab,
        activePreviewId: activePreviewId,
      };
      localStorage.setItem(
        `sde_${SDE_UID}_ui_state_${currentProjectId}`,
        JSON.stringify(uiState),
      );
    },
    [
      currentProjectId,
      selectedTemplateIds,
      activeMappingTab,
      activeSingleMappingTab,
      activePreviewId,
      isAppReady,
    ],
  );

  var tags = useMemo(
    function () {
      var tagsArr = [];
      visibleProjectTemplates.forEach(function (t) {
        if (selectedTemplateIds.indexOf(t.id) !== -1) {
          if (t.tags && Array.isArray(t.tags)) {
            t.tags.forEach(function (tag) {
              if (tagsArr.indexOf(tag) === -1) tagsArr.push(tag);
            });
          }
        }
      });
      return tagsArr;
    },
    [visibleProjectTemplates, selectedTemplateIds],
  );

  var aggregatedTagTypes = useMemo(
    function () {
      var typesObj = {};
      visibleProjectTemplates.forEach(function (t) {
        if (t.tagTypes) {
          Object.keys(t.tagTypes).forEach(function (key) {
            if (!typesObj[key]) typesObj[key] = t.tagTypes[key];
          });
        }
      });
      return typesObj;
    },
    [visibleProjectTemplates],
  );

  var activePreviewTemplate = useMemo(
    function () {
      return (
        activeProjectTemplates.find(function (t) {
          return t.id === activePreviewId;
        }) ||
        (activeProjectTemplates.length > 0 ? activeProjectTemplates[0] : null)
      );
    },
    [activeProjectTemplates, activePreviewId],
  );

  var showToast = function (msg, type = "info") {
    setToast({ show: true, msg: msg, type: type });
    setTimeout(function () {
      setToast({ show: false, msg: "", type: "info" });
    }, 4000);
  };

  const { handleExportBackup, handleImportBackup } = useWorkspaceBackup({
    SDE_UID,
    loadedTemplates,
    projects,
    currentProjectId,
    showToast
  });

  var addLiveLog = (msg, type = "info") => {
    setLiveLogs((prev) => {
      const newLogs = [
        ...prev,
        { time: new Date().toLocaleTimeString("vi-VN"), msg, type },
      ];
      return newLogs.length > 50 ? newLogs.slice(newLogs.length - 50) : newLogs;
    });
  };

  useEffect(
    function () {
      localStorage.setItem(
        `sde_${SDE_UID}_projects_v8`,
        JSON.stringify(projects),
      );
    },
    [projects],
  );
  useEffect(
    function () {
      localStorage.setItem(`sde_${SDE_UID}_active_tab`, activeTab);
      setAiText("");
      setAiImage(null);
      setAiImageBase64("");
      setAiExtractedData(null);
    },
    [activeTab],
  );
  useEffect(
    function () {
      localStorage.setItem(
        `sde_${SDE_UID}_active_project_id_v1`,
        currentProjectId,
      );
    },
    [currentProjectId],
  );

  useEffect(
    function () {
      var handleKeyDown = function (e) {
        const tag = document.activeElement?.tagName?.toLowerCase();
        const isHandlingInput =
          tag === "input" || tag === "textarea" || tag === "select";
        if (e.key === "Escape") {
          if (isPreviewModalOpen) setIsPreviewModalOpen(false);
          if (confirmModal.show)
            setConfirmModal({ show: false, action: null, title: "", desc: "" });
        }
        if (
          (e.ctrlKey || e.metaKey) &&
          e.key === "Enter" &&
          !isProcessing &&
          !confirmModal.show &&
          !isPreviewModalOpen
        ) {
          e.preventDefault();
          if (activeTab === "single") {
            validateAndGenerateDoc();
          } else if (
            activeTab === "batch" &&
            excelData.length > 0 &&
            selectedExcelRows.length > 0
          ) {
            validateAndGenerateBatch(false);
          }
        }

        if (
          (e.ctrlKey || e.metaKey) &&
          e.key === "p" &&
          !isPreviewModalOpen &&
          !confirmModal.show
        ) {
          e.preventDefault();
          setIsPreviewModalOpen(true);
        }

        if (isHandlingInput) return; // Prevent Undo/Redo overriding native input behavior

        if (
          (e.ctrlKey || e.metaKey) &&
          e.key === "z" &&
          !e.shiftKey &&
          !isPreviewModalOpen &&
          !confirmModal.show
        ) {
          e.preventDefault();
          if (activeTab === "single" && historyIndexRef.current > 0) {
            var prevIdx = historyIndexRef.current - 1;
            historyIndexRef.current = prevIdx;
            setHistoryIndex(prevIdx);
            setFormData(formHistoryRef.current[prevIdx]);
            showToast("Đã hoàn tác (Undo)", "info");
          }
        }
        if (
          ((e.ctrlKey || e.metaKey) && e.key === "y") ||
          ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z")
        ) {
          if (!isPreviewModalOpen && !confirmModal.show) {
            e.preventDefault();
            if (
              activeTab === "single" &&
              historyIndexRef.current < formHistoryRef.current.length - 1
            ) {
              var nextIdx = historyIndexRef.current + 1;
              historyIndexRef.current = nextIdx;
              setHistoryIndex(nextIdx);
              setFormData(formHistoryRef.current[nextIdx]);
              showToast("Đã làm lại (Redo)", "info");
            }
          }
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return function () {
        window.removeEventListener("keydown", handleKeyDown);
      };
    },
    [
      activeTab,
      isProcessing,
      excelData,
      selectedExcelRows,
      confirmModal.show,
      isPreviewModalOpen,
    ],
  );

  useEffect(
    function () {
      localStorage.setItem(
        `sde_${SDE_UID}_project_profiles_v2`,
        JSON.stringify(projectProfiles),
      );
    },
    [projectProfiles],
  );
  useEffect(
    function () {
      localStorage.setItem(
        `sde_${SDE_UID}_project_stages_v1`,
        JSON.stringify(projectStages),
      );
    },
    [projectStages],
  );
  useEffect(
    function () {
      localStorage.setItem(
        `sde_${SDE_UID}_approval_history_v1`,
        JSON.stringify(approvalHistory),
      );
    },
    [approvalHistory],
  );

  useEffect(
    function () {
      setExcelPage(1);
    },
    [excelSearchQuery],
  );

  useEffect(
    function () {
      setFormData(function (prev) {
        var nextForm = Object.assign({}, prev);
        tags.forEach(function (tag) {
          if (nextForm[tag] === undefined) nextForm[tag] = "";
        });
        return nextForm;
      });
      if (activeProjectTemplates.length > 0 && !activePreviewId)
        setActivePreviewId(activeProjectTemplates[0].id);
    },
    [currentProjectId, loadedTemplates, tags],
  );

  /* MODAL PREVIEW LỚN VÀ LIVE PREVIEW */
  useEffect(() => {
    const isLivePreview = activeMainTab === "workspace";
    if (libsLoaded && (isPreviewModalOpen || isLivePreview)) {
      if (!activePreviewTemplate || !activePreviewTemplate.fileBuffer) {
        setIsRenderingPreview(false);
        const blankMsg = `<div class="flex items-center justify-center p-12 text-center flex-col gap-4 bg-slate-100 rounded-xl m-8 border-2 border-dashed border-slate-300">
          <span class="text-5xl opacity-50">📄</span>
          <div>
            <div class="font-black text-xl mb-2 text-slate-700 uppercase tracking-widest">Biểu Mẫu Ảo</div>
            <div class="text-[13px] leading-relaxed text-slate-500 font-medium">Bản mẫu này chỉ là ảo (ví dụ), chưa có file mẫu đính kèm.</div>
            <div class="text-[13px] leading-relaxed text-slate-500 font-medium mt-1">Vui lòng bấm nút <b class="text-indigo-600">Nạp lại File (.docx, .xlsx)</b> ở màn hình Quản lý Biểu mẫu để sử dụng.</div>
          </div>
        </div>`;
        if (isPreviewModalOpen && previewContainerRef.current)
          previewContainerRef.current.innerHTML = blankMsg;
        else if (isLivePreview) {
          const inlineContainer = document.getElementById("docx-preview-inline-container");
          if (inlineContainer) inlineContainer.innerHTML = blankMsg;
        }
        return;
      }
      const targetContainer = isPreviewModalOpen ? previewContainerRef.current : document.getElementById("docx-preview-inline-container");
      if (window.docx && targetContainer) {
        const timer = setTimeout(async () => {
          setIsRenderingPreview(true);
          try {
            const PizZip = window.PizZip;

            // Regular render (original logic)
            const zip = new PizZip(
              new Uint8Array(activePreviewTemplate.fileBuffer),
            );

            let valMap = {};
            if (previewMode === "final") {
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
                    if (st.companyName)
                      valMap[`${st.prefix}_Tên_CQ`] = st.companyName;
                    if (st.representative)
                      valMap[`${st.prefix}_Đại_Diện`] = st.representative;
                    if (st.position)
                      valMap[`${st.prefix}_Chức_Vụ`] = st.position;
                    if (st.customFields)
                      st.customFields.forEach((cf) => {
                        if (cf.key && cf.value)
                          valMap[`${st.prefix}_${cf.key}`] = cf.value;
                      });
                  }
                });
              }

              (activePreviewTemplate.tags || []).forEach((tag) => {
                let rawVal = "";
                let effectiveTab = activeTab;
                if (activeMainTab === "excel") {
                  effectiveTab = "batch";
                }

                if (tag.toUpperCase() === "STT") {
                  if (effectiveTab === "batch") {
                    rawVal =
                      (activeExcelRowIndex !== null
                        ? activeExcelRowIndex
                        : selectedExcelRows.length > 0
                          ? selectedExcelRows[0]
                          : 0) + 1;
                  }
                } else {
                  let mapping = columnMapping[tag] || { type: "manual", value: "" };
                  if (mapping.type === "excel" && excelData.length > 0) {
                    let rowIndex =
                      activeExcelRowIndex !== null
                        ? activeExcelRowIndex
                        : selectedExcelRows.length > 0
                          ? selectedExcelRows[0]
                          : 0;
                    let row = excelData[rowIndex];
                    if (row) {
                      let boundRow = getBoundRow(
                        activePreviewTemplate,
                        row,
                        true,
                      );
                      rawVal = safeGetExcelValue(mapping.value, row, boundRow);
                    }
                  } else if (mapping.type === "manual") {
                    rawVal = mapping.value;
                  }

                  if (!rawVal && formData[tag]) {
                    rawVal = formData[tag];
                  }
                }
                if (rawVal !== "" || valMap[tag] === undefined) {
                  valMap[tag] = rawVal;
                }
              });
              await replaceTagsInXml(
                zip,
                valMap,
                enableHighlight,
                activePreviewTemplate.rawTags,
                cleanUnusedTags,
                globalDictionary,
              );
            }

            const isExcel =
              activePreviewTemplate &&
              activePreviewTemplate.originalName &&
              activePreviewTemplate.originalName
                .toLowerCase()
                .match(/\.(xlsx|xls)$/i);

            if (isExcel) {
              const u8 = zip.generate({ type: "uint8array" });
              if (window.XLSX) {
                const wb = window.XLSX.read(u8, { type: "array" });
                const sheetName = wb.SheetNames[0];
                const htmlStr = window.XLSX.utils.sheet_to_html(
                  wb.Sheets[sheetName],
                  {
                    header: "",
                    footer: "",
                  },
                );
                targetContainer.innerHTML = `
                  <div class="p-8 overflow-auto max-w-[850px] bg-white excel-preview-wrapper shadow-xl" style="font-family: Inter, Arial, sans-serif; min-height: 50vh;">
                     <style>
                       .excel-preview-wrapper table { border-collapse: collapse; width: 100%; border: 1px solid #e2e8f0; }
                       .excel-preview-wrapper td, .excel-preview-wrapper th { border: 1px solid #e2e8f0; padding: 6px 10px; font-size: 12px; white-space: pre-wrap; word-wrap: break-word; color: #1e293b; }
                       .excel-preview-wrapper tr:nth-child(even) { background-color: #f8fafc; }
                     </style>
                     ${htmlStr}
                  </div>
                `;
              }
            } else {
              const blob = zip.generate({
                type: "blob",
                mimeType:
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              });

              targetContainer.innerHTML = "";
              await window.docx.renderAsync(
                blob,
                targetContainer,
                null,
                {
                  className: "docx",
                  inWrapper: true,
                  ignoreWidth: false,
                  ignoreHeight: false,
                  ignoreFonts: false,
                  breakPages: true,
                  trimXmlDeclaration: true,
                  debug: false,
                },
              );
            }
          } catch (err) {
            console.error("Preview render err:", err);
          } finally {
            setIsRenderingPreview(false);
          }
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [
    libsLoaded,
    isPreviewModalOpen,
    activePreviewTemplate,
    previewMode,
    formData,
    activeExcelRowIndex,
    selectedExcelRows,
    excelData,
    columnMapping,
    enableHighlight,
    activeTab,
    cleanUnusedTags,
    tags,
    currentProjectId,
    projectProfiles,
    activeMainTab,
  ]);

  useEffect(
    function () {
      if (!window.XLSX || uploadedWorkbooks.length === 0) {
        setExcelData([]);
        setSelectedExcelRows([]);
        setActiveExcelRowIndex(null);
        setAutoFillKey("");
        setMasterSheetKey("");
        prevAggregatedLengthRef.current = -1;
        return;
      }
      var rawAggregated = [];
      uploadedWorkbooks.forEach(function (wb) {
        wb.sheetNames.forEach(function (sName) {
          var key = wb.fileName + "|||" + sName;
          if (selectedSheetKeys.indexOf(key) !== -1) {
            var worksheet = wb.workbook.Sheets[sName];
            var json = window.XLSX.utils.sheet_to_json(worksheet, {
              raw: false,
              defval: "",
            });
            json.forEach(function (row) {
              var mappedRow = Object.assign({}, row);
              mappedRow["__Nguon_Tep"] = wb.fileName;
              mappedRow["__Nguon_Sheet"] = sName;
              rawAggregated.push(mappedRow);
            });
          }
        });
      });

      var newAggregatedLength = rawAggregated.length;
      var shouldResetSelection =
        prevAggregatedLengthRef.current !== newAggregatedLength;

      var finalData = [];
      if (autoFillKey && masterSheetKey) {
        var masterMap = {};
        var duplicateKeys = [];
        rawAggregated.forEach(function (row) {
          var rowSheetKey = row["__Nguon_Tep"] + "|||" + row["__Nguon_Sheet"];
          if (rowSheetKey === masterSheetKey) {
            var keyVal = row[autoFillKey];
            if (keyVal) {
              if (masterMap[keyVal]) {
                if (duplicateKeys.indexOf(keyVal) === -1)
                  duplicateKeys.push(keyVal);
              }
              if (!masterMap[keyVal]) masterMap[keyVal] = {};
              Object.keys(row).forEach(function (k) {
                if (
                  row[k] !== "" &&
                  row[k] !== undefined &&
                  !String(k).startsWith("__")
                )
                  masterMap[keyVal][k] = row[k];
              });
            }
          }
        });

        if (duplicateKeys.length > 0) {
          showToast(
            "⚠️ Sheet Master có " +
              duplicateKeys.length +
              " giá trị trùng khóa: " +
              duplicateKeys.slice(0, 3).join(", ") +
              (duplicateKeys.length > 3 ? "..." : "") +
              ". Chỉ dữ liệu dòng cuối được dùng.",
            "error",
          );
        }

        finalData = rawAggregated.map(function (row) {
          var rowSheetKey = row["__Nguon_Tep"] + "|||" + row["__Nguon_Sheet"];
          var keyVal = row[autoFillKey];
          if (rowSheetKey !== masterSheetKey && keyVal && masterMap[keyVal]) {
            var newRow = Object.assign({}, row);
            Object.keys(masterMap[keyVal]).forEach(function (k) {
              if (newRow[k] === undefined || newRow[k] === "")
                newRow[k] = masterMap[keyVal][k];
            });
            return newRow;
          }
          return row;
        });
      } else {
        finalData = rawAggregated;
      }

      setExcelData(finalData);

      // Variable insertion is now handled explicitly by excelAuditModal when user uploads file.
      if (shouldResetSelection) {
        setSelectedExcelRows(
          finalData.map(function (_, i) {
            return i;
          }),
        );
        setActiveExcelRowIndex(finalData.length > 0 ? 0 : null);
        setExcelPage(1);
      }
      prevAggregatedLengthRef.current = newAggregatedLength;
    },
    [uploadedWorkbooks, selectedSheetKeys, autoFillKey, masterSheetKey],
  );

  // Auto-reset mapping type to "manual" when excel data is cleared
  React.useEffect(function () {
    if (excelData.length === 0) {
      setColumnMapping(function (prev) {
        var hasExcel = Object.values(prev).some(function(v) { return v && v.type === "excel"; });
        if (!hasExcel) return prev;
        var next = Object.assign({}, prev);
        Object.keys(next).forEach(function (tag) {
          if (next[tag] && next[tag].type === "excel") {
            next[tag] = { type: "manual", value: next[tag].value || "" };
          }
        });
        return next;
      });
    }
  }, [excelData.length]);

  var excelColumns = useMemo(
    function () {
      if (excelData.length === 0) return [];
      var allKeys = [];
      excelData.forEach(function (row) {
        Object.keys(row).forEach(function (k) {
          if (allKeys.indexOf(k) === -1) allKeys.push(k);
        });
      });
      return allKeys;
    },
    [excelData],
  );

  var excelColumnsGrouped = useMemo(
    function () {
      if (excelData.length === 0) return [];
      var groupsMap = {};
      excelData.forEach(function (row) {
        var file = row["__Nguon_Tep"] || "Unknown File";
        var sheet = row["__Nguon_Sheet"] || "Unknown Sheet";
        var groupName = "📊 " + sheet + " 📁 (" + file + ")";

        if (!groupsMap[groupName]) groupsMap[groupName] = [];
        Object.keys(row).forEach(function (k) {
          if (groupsMap[groupName].indexOf(k) === -1) {
            groupsMap[groupName].push(k);
          }
        });
      });
      return Object.keys(groupsMap).map(function (k) {
        return { label: k, options: groupsMap[k] };
      });
    },
    [excelData],
  );

  useEffect(
    function () {
      if (
        excelColumns.length > 0 &&
        !autoFillKey &&
        selectedSheetKeys.length > 1
      ) {
        var detect = excelColumns.find(function (c) {
          if (String(c).startsWith("__")) return false;
          var norm = removeVietnameseTones(String(c)).toLowerCase();
          return (
            norm.indexOf("ma du an") !== -1 ||
            norm.indexOf("ma") === 0 ||
            norm.indexOf("id") === 0
          );
        });
        if (detect) setAutoFillKey(detect);
      }
    },
    [excelColumns, autoFillKey, selectedSheetKeys.length],
  );

  useEffect(
    function () {
      if (selectedSheetKeys.length > 1 && !masterSheetKey) {
        var detect = selectedSheetKeys.find(function (k) {
          var sName = String(k.split("|||")[1]).toLowerCase();
          var norm = removeVietnameseTones(sName);
          return (
            norm.indexOf("chung") !== -1 ||
            norm.indexOf("master") !== -1 ||
            norm.indexOf("tong") !== -1
          );
        });
        if (detect) setMasterSheetKey(detect);
      }
    },
    [selectedSheetKeys, masterSheetKey],
  );

  var handleAutoMap = function () {
    if (excelColumns.length === 0 || tags.length === 0) return;
    setColumnMapping(function (prev) {
      var newMapping = Object.assign({}, prev);
      var mappedCount = 0;
      var keptManual = []; // biến người dùng đã NHẬP TAY (có giá trị) bị trùng cột Excel
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
        var existing = newMapping[tag];
        // Biến đã nhập tay và CÓ giá trị -> dữ liệu do người dùng tự gõ, cần bảo vệ.
        var isFilledManual =
          existing && existing.type === "manual" && existing.value !== "";
        if (
          !existing ||
          existing.value === "" ||
          existing.type === "manual"
        ) {
          // Try Vietnamese-aware match first
          var bestCol = null;
          var bestScore = 0;
          excelColumns.forEach(function (col) {
            var score = calculateVietnameseMatchScore(tag, col);
            if (score > bestScore) {
              bestScore = score;
              bestCol = col;
            }
          });

          // If we found a match with confidence >= 0.5
          if (bestCol && bestScore >= 0.5) {
            if (isFilledManual) {
              // KHÔNG ghi đè giá trị nhập tay — chỉ ghi nhận để thông báo cho người dùng.
              keptManual.push(tag);
            } else {
              newMapping[tag] = { type: "excel", value: bestCol };
              mappedCount++;
              colUsedMap[bestCol] = [tag];
            }
          } else if (!existing) {
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
      if (keptManual.length > 0)
        showToast(
          "⚠️ Giữ nguyên " +
            keptManual.length +
            " biến bạn đã NHẬP TAY (không ghi đè bằng cột Excel trùng tên): " +
            keptManual.join(", ") +
            ". Vào ô tương ứng chọn cột Excel nếu muốn dùng dữ liệu mới.",
          "warning",
        );
      return newMapping;
    });
  };

  var handleAutofillFromExcelRow = function (rowIndex) {
    if (rowIndex === null || rowIndex === undefined || rowIndex < 0) return;
    var row = excelData[rowIndex];
    if (!row) return;

    setFormData(function (prev) {
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
    showToast("Đã điền dữ liệu dòng " + (rowIndex + 1) + " vào Form!");
  };

  useEffect(
    function () {
      handleAutoMap();
    },
    [excelColumns, tags],
  );

  var handleCreateProject = async function () {
    if (!editingProjectProfile?.name?.trim()) {
      showToast("Vui lòng nhập tên dự án", "error");
      return;
    }

    var isEdit = !!editingProjectProfile.id;
    var targetId = editingProjectProfile.id
      ? editingProjectProfile.id
      : "proj_" + Date.now();

    // 1. Save Project listing
    if (isEdit) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === targetId
            ? {
                ...p,
                name: editingProjectProfile.name,
                maDA: editingProjectProfile.maDA,
                description: editingProjectProfile.description,
              }
            : p,
        ),
      );
    } else {
      var newProj = {
        id: targetId,
        name: editingProjectProfile.name.trim(),
        maDA: editingProjectProfile.maDA || "",
        description: editingProjectProfile.description || "",
        timestamp: new Date().toISOString(),
      };
      setProjects((prev) => prev.concat([newProj]));
    }

    // 2. Save Project profile (including fields, stakeholders, assignedUsers)
    var finalProfile = {
      ...editingProjectProfile,
      id: targetId,
      stakeholders: editingProjectProfile.stakeholders || [],
      assignedUsers: editingProjectProfile.assignedUsers || [],
    };

    setProjectProfiles((prev) => ({
      ...prev,
      [targetId]: finalProfile,
    }));

    // 3. Handle Template Loading / Copy / Extraction for Step 2
    if (wizardTemplateSelection.type === "iso") {
      // Load standard quality control and ISO templates under Decree 175/2024/ND-CP
      const standardISOTemplates = [
        {
          id: "tpl_iso_1_" + Date.now() + "_1",
          originalName: "Bien_Ban_Nghiem_Thu_Cong_Viec_ND175.docx",
          customName: "Biên bản nghiệm thu công việc xây dựng (NĐ 175/2024)",
          tags: [
            "Ten_Du_An",
            "Ma_Du_An",
            "Chu_Dau_Tu_Tên_CQ",
            "Chu_Dau_Tu_Đại_Diện",
            "Chu_Dau_Tu_Chức_Vụ",
            "Nha_Thau_Tên_CQ",
            "Nha_Thau_Đại_Diện",
            "Nha_Thau_Chức_Vụ",
            "Ngay_Nghiem_Thu",
            "Dia_Diem_Nghiem_Thu",
            "Ket_Luan_Nghiem_Thu",
          ],
          rawTags: [
            "Ten_Du_An",
            "Ma_Du_An",
            "Chu_Dau_Tu_Tên_CQ",
            "Chu_Dau_Tu_Đại_Diện",
            "Chu_Dau_Tu_Chức_Vụ",
            "Nha_Thau_Tên_CQ",
            "Nha_Thau_Đại_Diện",
            "Nha_Thau_Chức_Vụ",
            "Ngay_Nghiem_Thu",
            "Dia_Diem_Nghiem_Thu",
            "Ket_Luan_Nghiem_Thu",
          ],
          tagTypes: {},
          activeConfigs: {},
          bindSheetKey: "",
          projectId: targetId,
        },
        {
          id: "tpl_iso_2_" + Date.now() + "_2",
          originalName: "Phieu_Yeu_Cau_Nghiem_Thu_ND175.docx",
          customName: "Phiếu yêu cầu nghiệm thu kỹ thuật (NĐ 175/2024)",
          tags: [
            "Ten_Du_An",
            "Ma_Du_An",
            "Chu_Dau_Tu_Tên_CQ",
            "Nha_Thau_Tên_CQ",
            "Ngay_Yeu_Cau",
            "Noi_Dung_Kiem_Tra",
          ],
          rawTags: [
            "Ten_Du_An",
            "Ma_Du_An",
            "Chu_Dau_Tu_Tên_CQ",
            "Nha_Thau_Tên_CQ",
            "Ngay_Yeu_Cau",
            "Noi_Dung_Kiem_Tra",
          ],
          tagTypes: {},
          activeConfigs: {},
          bindSheetKey: "",
          projectId: targetId,
        },
        {
          id: "tpl_iso_3_" + Date.now() + "_3",
          originalName: "Nhat_Ky_Thi_Cong_Ngay_ISO.docx",
          customName: "Nhật ký thi công công trình (Tiêu chuẩn ISO)",
          tags: [
            "Ten_Du_An",
            "Ngay_Ghi",
            "Thoi_Tiet",
            "Nhan_Luc_Hien_Truong",
            "Noi_Dung_Cong_Viec",
            "Dai_Dien_Nha_Thau",
          ],
          rawTags: [
            "Ten_Du_An",
            "Ngay_Ghi",
            "Thoi_Tiet",
            "Nhan_Luc_Hien_Truong",
            "Noi_Dung_Cong_Viec",
            "Dai_Dien_Nha_Thau",
          ],
          tagTypes: {},
          activeConfigs: {},
          bindSheetKey: "",
          projectId: targetId,
        },
        {
          id: "tpl_iso_4_" + Date.now() + "_4",
          originalName: "Bien_Ban_Kiem_Tra_Ho_So_Thiet_Ke.docx",
          customName: "Biên bản kiểm tra hồ sơ thiết kế bản vẽ thi công",
          tags: [
            "Ten_Du_An",
            "Don_Vi_Thiet_Ke_Tên_CQ",
            "Don_Vi_Thiet_Ke_Đại_Diện",
            "Chu_Dau_Tu_Tên_CQ",
            "Ngay_Kiem_Tra",
            "Ket_Luan_Phu_Hop",
          ],
          rawTags: [
            "Ten_Du_An",
            "Don_Vi_Thiet_Ke_Tên_CQ",
            "Don_Vi_Thiet_Ke_Đại_Diện",
            "Chu_Dau_Tu_Tên_CQ",
            "Ngay_Kiem_Tra",
            "Ket_Luan_Phu_Hop",
          ],
          tagTypes: {},
          activeConfigs: {},
          bindSheetKey: "",
          projectId: targetId,
        },
        {
          id: "tpl_iso_5_" + Date.now() + "_5",
          originalName: "Bien_Ban_Ban_Giao_dua_vao_su_dung_ISO.docx",
          customName: "Biên bản bàn giao công trình đưa vào sử dụng",
          tags: [
            "Ten_Du_An",
            "Chu_Dau_Tu_Tên_CQ",
            "Chu_Dau_Tu_Đại_Diện",
            "Nha_Thau_Tên_CQ",
            "Nha_Thau_Đại_Diện",
            "Ban_Giao_Moc_Thoi_Gian",
            "Noi_Dung_Ban_Giao",
          ],
          rawTags: [
            "Ten_Du_An",
            "Chu_Dau_Tu_Tên_CQ",
            "Chu_Dau_Tu_Đại_Diện",
            "Nha_Thau_Tên_CQ",
            "Nha_Thau_Đại_Diện",
            "Ban_Giao_Moc_Thoi_Gian",
            "Noi_Dung_Ban_Giao",
          ],
          tagTypes: {},
          activeConfigs: {},
          bindSheetKey: "",
          projectId: targetId,
        },
      ];

      setLoadedTemplates((prev) => prev.concat(standardISOTemplates));
      showToast(
        `Đã nạp thành công 5 tài liệu Quy chuẩn ISO & NĐ 175/2024 vào dự án!`,
        "success",
      );
    } else if (
      wizardTemplateSelection.type === "clone" &&
      wizardSelectedCloneProjId
    ) {
      // Clone all templates of target project to the new project!
      var templatesToClone = loadedTemplates.filter(
        (t) => t.projectId === wizardSelectedCloneProjId,
      );
      var clonedList = [];
      for (let t of templatesToClone) {
        var newTplId =
          "tpl_" + Date.now() + "_" + Math.floor(Math.random() * 100000);
        var clonedTpl = safeDeepClone(t);
        clonedTpl.id = newTplId;
        clonedTpl.projectId = targetId;

        // Clone the file buffer if any
        if (t.fileBuffer) {
          clonedTpl.fileBuffer = t.fileBuffer.slice(0); // Duplicate array buffer
          try {
            await saveBufferToDB(newTplId, clonedTpl.fileBuffer);
          } catch (dbErr) {
            console.error("Failed to copy template buffer to db:", dbErr);
          }
        }
        clonedList.push(clonedTpl);
      }

      if (clonedList.length > 0) {
        setLoadedTemplates((prev) => prev.concat(clonedList));
        showToast(
          `Đã sao chép thành công ${clonedList.length} tài liệu từ dự án nguồn!`,
          "success",
        );
      } else {
        showToast("Dự án nguồn chưa có file mẫu nào để sao chép.", "info");
      }
    }

    if (!isEdit) {
      setCurrentProjectId(targetId);
      showToast("Đã tạo dự án mới thành công!");
    } else {
      showToast("Đã cập nhật dự án thành công!", "success");
    }

    setIsProjectModalOpen(false);
  };

  var duplicateProject = async function (id) {
    if (id === "proj_default") {
      showToast("Không thể copy Dự án Mặc định", "error");
      return;
    }
    var currentProj = projects.find((p) => p.id === id);
    if (!currentProj) return;

    var newId = "proj_" + Date.now();
    var newProj = {
      id: newId,
      name: currentProj.name + " (Copy)",
      desc: currentProj.desc,
    };

    setProjects((prev) => prev.concat([newProj]));

    // Copy profile
    var profile = projectProfiles[id];
    if (profile) {
      var copiedProfile = safeDeepClone(profile);
      copiedProfile.id = newId;
      var nameField = copiedProfile.fields?.find(
        (f) => f.k === "Ten_Du_An" || f.k === "tenDA",
      );
      if (nameField) nameField.v = newProj.name;
      setProjectProfiles((prev) => ({ ...prev, [newId]: copiedProfile }));
    }

    var savedData = localStorage.getItem(`sde_${SDE_UID}_form_data_v1.9_` + id);
    if (savedData) {
      localStorage.setItem(`sde_${SDE_UID}_form_data_v1.9_` + newId, savedData);
    }

    var savedExportHist = localStorage.getItem(
      `sde_${SDE_UID}_export_history_` + id,
    );
    if (savedExportHist) {
      localStorage.setItem(
        `sde_${SDE_UID}_export_history_` + newId,
        savedExportHist,
      );
    }

    // Copy templates and update process stage references
    var templatesToCopy = loadedTemplates.filter((t) => t.projectId === id);
    var templateIdMap = {};
    var newTemplates = [];

    for (let t of templatesToCopy) {
      var newTid =
        "tpl_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
      templateIdMap[t.id] = newTid;

      var clonedT = safeDeepClone(t);
      clonedT.id = newTid;
      clonedT.projectId = newId;

      if (t.fileBuffer) {
        clonedT.fileBuffer = t.fileBuffer.slice(0); // clone ArrayBuffer
        try {
          await saveBufferToDB(newTid, clonedT.fileBuffer);
        } catch (e) { console.warn("Lỗi lưu file buffer khi clone template:", e); }
      }
      newTemplates.push(clonedT);
    }

    if (newTemplates.length > 0) {
      setLoadedTemplates((prev) => prev.concat(newTemplates));
    }

    var currentStages = projectStages[id];
    if (currentStages) {
      var copiedStages = safeDeepClone(currentStages);
      copiedStages.forEach((stage) => {
        if (stage.docs) {
          stage.docs.forEach((doc) => {
            if (doc.templateId && templateIdMap[doc.templateId]) {
              doc.templateId = templateIdMap[doc.templateId];
            }
          });
        }
      });
      setProjectStages((prev) => ({ ...prev, [newId]: copiedStages }));
    }

    setCurrentProjectId(newId);
    setFormData(savedData ? JSON.parse(savedData) : {});
    setFormHistory([{}]);
    setHistoryIndex(0);
    showToast("Đã nhân bản dự án cùng quy trình!");
  };

  var triggerDeleteProject = function (id) {
    if (id === "proj_default") {
      showToast("Không thể xóa Dự án Mặc định", "error");
      return;
    }
    var target = projects.find(function (p) {
      return p.id === id;
    });
    setConfirmModal({
      show: true,
      title: "Xác nhận xóa dự án",
      desc: `Xóa dự án "${target ? target.name : ""}" cùng toàn bộ mẫu văn bản?`,
      btnConfirm: "Xóa dự án",
      action: async function () {
        var templatesToDelete = loadedTemplates.filter(
          (t) => t.projectId === id,
        );
        for (let t of templatesToDelete) {
          await deleteBufferFromDB(t.id);
        }

        setProjects(function (prev) {
          return prev.filter(function (p) {
            return p.id !== id;
          });
        });
        setLoadedTemplates(function (prev) {
          return prev.filter(function (t) {
            return t.projectId !== id;
          });
        });
        setCurrentProjectId("proj_default");
        setConfirmModal({ show: false, action: null, title: "", desc: "" });
        showToast("Đã xóa dự án thành công!");
      },
    });
  };

  var exportDictionaryTemplate = function (type) {
    if (!globalDictionary || Object.keys(globalDictionary).length === 0) {
      showToast(
        "Từ điển hiện tại đang trống. Vui lòng thêm biến hoặc dùng tính năng tự động hút thẻ.",
        "warning",
      );
      return;
    }

    var keys = Object.keys(globalDictionary);

    if (type === "excel") {
      var wsData = [];
      wsData.push(keys);
      var sampleRow = keys.map(function (k) {
        return "Dữ liệu mẫu cho " + k;
      });
      wsData.push(sampleRow);
      var ws = window.XLSX ? window.XLSX.utils.aoa_to_sheet(wsData) : null;
      if (!ws) {
        showToast("Lỗi: Không tìm thấy thư viện XLSX", "error");
        return;
      }
      var wb = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(wb, ws, "Standard_Map_Data");
      window.XLSX.writeFile(wb, "Data_Map_Template.xlsx");
      showToast("Đã tải File mẫu Excel Map Dữ liệu", "success");
    } else if (type === "word") {
      // Basic HTML that MS Word can open natively as a table
      var html =
        '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">' +
        '<head><meta charset="utf-8"><title>Danh Sach Bien</title></head><body>' +
        "<h2>TỪ ĐIỂN BIẾN TOÀN CỤC (SmartDocPro Template)</h2>" +
        "<p>Bảng dưới đây liệt kê các biến đã có trong Hệ thống. Bạn có thể chép (Copy) các thẻ theo cú pháp {Tên Biến} dán vào thiết kế File mẫu Word của bạn:</p>" +
        '<table border="1" style="border-collapse: collapse; width: 100%; border: 1px solid black;">' +
        '<tr style="background-color: #f2f2f2;"><th>Mã Biến (Tag)</th><th>Mô tả / Ý nghĩa</th><th>Cú pháp trong Word</th></tr>';

      keys.forEach(function (k) {
        var desc =
          globalDictionary[k] && globalDictionary[k].desc
            ? globalDictionary[k].desc
            : "";
        html +=
          "<tr>" +
          '<td style="padding: 5px;">' +
          k +
          "</td>" +
          '<td style="padding: 5px;">' +
          desc +
          "</td>" +
          '<td style="padding: 5px;"><b>{' +
          k +
          "}</b></td>" +
          "</tr>";
      });

      html += "</table></body></html>";

      var saveAs = window.saveAs;
      var blob = new Blob(["\ufeff", html], { type: "application/msword" });
      saveAs(blob, "Word_Variables_Cheatsheet.doc");
      showToast("Đã tải Mẫu tra cứu Word", "success");
    }
  };

  var handleWordUpload = async function (e) {
    var files = e.target && e.target.files ? e.target.files : e;
    if (!files || files.length === 0) return;
    var fileArray = Array.from(files);

    var currentUploadedNames = new Set(
      loadedTemplates
        .filter(
          (t) => t.projectId === currentProjectId && !t.isHiddenFromMainList,
        )
        .map((t) => t.originalName),
    );
    var newValidFiles = [];
    for (let file of fileArray) {
      if (
        file.name.indexOf(".docx") === -1 &&
        file.name.indexOf(".xlsx") === -1
      ) {
        showToast("Chỉ hỗ trợ .docx hoặc .xlsx: " + file.name, "error");
        continue;
      }
      if (currentUploadedNames.has(file.name)) {
        showToast("Tệp trùng tên được thêm mới: " + file.name, "info");
      }
      currentUploadedNames.add(file.name);
      newValidFiles.push(file);
    }
    if (newValidFiles.length === 0) {
      if (e.target && e.target.value) e.target.value = "";
      return;
    }

    setLoadingStatus("Đang nạp file vào hệ thống...");

    var newTemplatesBatch = [];
    var newTemplateIdsBatch = [];

    for (let file of newValidFiles) {
      try {
        const buffer = await new Promise((res, rej) => {
          const reader = new FileReader();
          reader.onload = (e) => res(e.target.result);
          reader.onerror = rej;
          reader.readAsArrayBuffer(file);
        });

        var PizZip = window.PizZip;
        var zip = new PizZip(new Uint8Array(buffer));
        var rawCleanText = getCleanTextFromZip(zip);
        var parsed = extractAllTags(rawCleanText);
        var baseName = file.name.substring(0, file.name.lastIndexOf("."));

        var newId =
          "tpl_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);

        await saveBufferToDB(newId, buffer);

        var newTemplate = {
          id: newId,
          projectId: currentProjectId,
          originalName: file.name,
          customName: baseName + "_HoanThanh",
          fileBuffer: buffer,
          tags: parsed.uniqueTagNames,
          rawTags: parsed.uniqueRawTags,
          tagTypes: parsed.tagToTypeMap,
          activeConfigs: parsed.detectedConfigs,
          bindSheetKey: "",
        };

        newTemplatesBatch.push(newTemplate);
        newTemplateIdsBatch.push(newId);
      } catch (err) {
        console.error("UPLOAD ERROR DETAILS:", err);
        showToast("Lỗi phân tích: " + file.name, "error");
      }
    }

    if (newTemplatesBatch.length > 0) {
      var collectedTags = new Set();
      newTemplatesBatch.forEach((t) =>
        t.tags.forEach((tg) => collectedTags.add(tg)),
      );
      var dictKeysCount = Object.keys(globalDictionary || {}).length;
      var unknownTags = Array.from(collectedTags).filter(t => {
        let canonical = resolveSynonym(t, globalDictionary);
        let inDict = !!(globalDictionary || {})[canonical];
        let hasValidPrefix = true;
        if (standardPrefixes && standardPrefixes.length > 0) {
          hasValidPrefix = standardPrefixes.some(p => t.startsWith(p.prefix));
        }
        return !inDict || !hasValidPrefix;
      });

      // Nếu có biến lạ quy định của APP
      if (unknownTags.length > 0) {
        setWordAuditModal({
          show: true,
          templatesBatch: newTemplatesBatch,
          templateIdsBatch: newTemplateIdsBatch,
          unknownTags: unknownTags,
        });
        setLoadingStatus(null);
        return;
      }

      finalizeWordUpload(newTemplatesBatch, newTemplateIdsBatch, e.target);
    } else {
      setLoadingStatus(null);
      if (e.target && e.target.value) e.target.value = "";
    }
  };

  var handleConfirmAudit = function (mode) {
    var templatesBatch = [...wordAuditModal.templatesBatch];
    var targetEl = document.getElementById("global-word-upload");

    setWordAuditModal((prev) => ({ ...prev, show: false }));

    if (mode === "KEEP") {
      finalizeWordUpload(templatesBatch, wordAuditModal.templateIdsBatch, targetEl, true);
    } else if (mode === "IMPORT_AND_EDIT") {
      finalizeWordUpload(templatesBatch, wordAuditModal.templateIdsBatch, targetEl, false);
      if (templatesBatch.length > 0) {
        setTimeout(() => {
          setActiveMainTab("workspace");
          var t = templatesBatch[0];
          setEditingTemplate({
            ...t,
            tags: [...t.tags],
            rawTags: t.rawTags ? [...t.rawTags] : [],
          });
        }, 300);
      }
    } else if (mode === "CANCEL") {
      if (targetEl && targetEl.value) targetEl.value = "";
      setLoadingStatus(null);
      showToast("Đã hủy tải lên tệp.");
    }
  };

  var finalizeWordUpload = function (
    templatesBatch,
    templateIdsBatch,
    targetEl,
    skipDictionaryInsert = false
  ) {
    if (!skipDictionaryInsert) {
      setGlobalDictionary((prevDict) => {
        const nextDict = { ...prevDict };
        let newVars = [];
        templatesBatch.forEach((tmpl) => {
          tmpl.tags.forEach((tag) => {
            if (!nextDict[tag]) {
              const canonical = resolveSynonym(tag, nextDict);
              if (canonical === tag) {
                newVars.push(tag);
              }
              nextDict[tag] = {
                description: `Tạo từ: ${tmpl.originalName}`,
                type: tmpl.tagTypes?.[tag] || inferVariableType(tag),
                count: 1,
                defaultValue: "",
              };
            } else {
              nextDict[tag].count = (nextDict[tag].count || 1) + 1;
            }
          });
        });
        if (newVars.length > 0) {
            setTimeout(() => {
              setUnknownTagsAlert(prev => {
                const combined = new Set([...prev, ...newVars]);
                return Array.from(combined);
              });
            }, 100);
        }
        return nextDict;
      });
    }

    setLoadedTemplates((prev) => [...prev, ...templatesBatch]);
    setSelectedTemplateIds((prev) => [...prev, ...templateIdsBatch]);
    setLoadingStatus(null);
    showToast("Hoàn tất nạp file mẫu!");
    if (targetEl && targetEl.value !== undefined) targetEl.value = "";
  };

  var handleTemplateDragStart = function (e, index) {
    setDraggedTemplateIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Tránh giật lag trên một số trình duyệt bằng cách lưu chỉ mục vào dataTransfer
    e.dataTransfer.setData("text/plain", index);
  };

  var handleTemplateDragOver = function (e, index) {
    e.preventDefault();
    if (dragOverTemplateIndex !== index) {
      setDragOverTemplateIndex(index);
    }
  };

  var handleTemplateDrop = function (e, targetIndex) {
    e.preventDefault();
    if (draggedTemplateIndex === null || draggedTemplateIndex === targetIndex) {
      setDraggedTemplateIndex(null);
      setDragOverTemplateIndex(null);
      return;
    }

    // Lấy danh sách mẫu hiện tại của dự án
    var currentTemplates = [...activeProjectTemplates];
    var draggedItem = currentTemplates[draggedTemplateIndex];

    // Tiến hành di chuyển vị trí phần tử trong mảng
    currentTemplates.splice(draggedTemplateIndex, 1);
    currentTemplates.splice(targetIndex, 0, draggedItem);

    // Khối phục loadedTemplates bằng cách điền mảng đã đổi thứ tự cho dự án hiện tại
    var reorderedList = [];
    var activeIdx = 0;
    for (var i = 0; i < loadedTemplates.length; i++) {
      var item = loadedTemplates[i];
      if (item.projectId === currentProjectId && !item.isHiddenFromMainList) {
        reorderedList.push(currentTemplates[activeIdx++]);
      } else {
        reorderedList.push(item);
      }
    }

    setLoadedTemplates(reorderedList);
    showToast("Đã sắp xếp lại thứ tự tài liệu mẫu!", "success");
    setDraggedTemplateIndex(null);
    setDragOverTemplateIndex(null);
  };

  var handleTemplateDragEnd = function () {
    setDraggedTemplateIndex(null);
    setDragOverTemplateIndex(null);
  };

  var handleDeleteTemplate = async function (id, isFromProcess = false) {
    let usageCount = 0;
    Object.values(projectStages).forEach((stages) => {
      stages.forEach((stage) => {
        if (stage.docs) {
          stage.docs.forEach((doc) => {
            if (doc.templateId === id) usageCount++;
          });
        }
      });
    });

    const targetTemplate = loadedTemplates.find((t) => t.id === id);
    const isCurrentlyHidden = targetTemplate
      ? targetTemplate.isHiddenFromMainList
      : false;

    if (isFromProcess) {
      if (usageCount <= 1) {
        if (isCurrentlyHidden) {
          await deleteBufferFromDB(id);
          setLoadedTemplates((prev) => prev.filter((t) => t.id !== id));
          setSelectedTemplateIds((prev) => prev.filter((tId) => tId !== id));
          if (activePreviewId === id) setActivePreviewId("");
          if (activeMappingTab === id) setActiveMappingTab("all");
          if (activeSingleMappingTab === id) setActiveSingleMappingTab("all");
          showToast(
            "Tệp mẫu đã gỡ hoàn toàn do không còn được hệ thống sử dụng.",
          );
        } else {
          setLoadedTemplates((prev) =>
            prev.map((t) =>
              t.id === id ? { ...t, stage: "Chưa phân loại" } : t,
            ),
          );
          showToast("Đã gỡ tệp mẫu khỏi quy trình.");
        }
      } else {
        showToast(
          "Đã gỡ tệp mẫu (Vẫn đang được dùng ở văn bản quy trình khác).",
        );
      }
    } else {
      if (usageCount > 0) {
        setLoadedTemplates((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, isHiddenFromMainList: true } : t,
          ),
        );
        setSelectedTemplateIds((prev) => prev.filter((tId) => tId !== id));
        if (activePreviewId === id) setActivePreviewId("");
        if (activeMappingTab === id) setActiveMappingTab("all");
        if (activeSingleMappingTab === id) setActiveSingleMappingTab("all");
        showToast(
          "Đã ẩn tệp mẫu khỏi cấu hình chung (vẫn giữ trong Quy trình).",
        );
      } else {
        await deleteBufferFromDB(id);
        setLoadedTemplates((prev) => prev.filter((t) => t.id !== id));
        setSelectedTemplateIds((prev) => prev.filter((tId) => tId !== id));
        if (activePreviewId === id) setActivePreviewId("");
        if (activeMappingTab === id) setActiveMappingTab("all");
        if (activeSingleMappingTab === id) setActiveSingleMappingTab("all");
        showToast("Đã gỡ tệp mẫu và xóa khỏi bộ nhớ.");
      }
    }
  };

  var handleDuplicateTemplate = async function (id) {
    var target = loadedTemplates.find((t) => t.id === id);
    if (target && target.fileBuffer) {
      var newId =
        "tpl_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
      await saveBufferToDB(newId, target.fileBuffer);
      var duplicate = {
        ...target,
        id: newId,
        customName: target.customName + "_Copy",
      };
      setLoadedTemplates((prev) => [...prev, duplicate]);
      setSelectedTemplateIds((prev) => [...prev, newId]);
      showToast("Đã nhân bản mẫu!");
    } else {
      showToast("Lỗi: Không tìm thấy file gốc", "error");
    }
  };

  var handleReplaceTemplateFileBuffer = async function (file) {
    if (
      file.name.indexOf(".docx") === -1 &&
      file.name.indexOf(".xlsx") === -1
    ) {
      showToast("Chỉ hỗ trợ .docx và .xlsx: " + file.name, "error");
      return;
    }
    try {
      const buffer = await new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = (e) => res(e.target.result);
        reader.onerror = rej;
        reader.readAsArrayBuffer(file);
      });

      var PizZip = window.PizZip;
      var zip = new PizZip(new Uint8Array(buffer));
      var rawCleanText = getCleanTextFromZip(zip);
      var parsed = extractAllTags(rawCleanText);

      setEditingTemplate((prev) => ({
        ...prev,
        originalName: file.name,
        fileBuffer: buffer,
        tags: parsed.uniqueTagNames,
        rawTags: parsed.uniqueRawTags,
        tagTypes: parsed.tagToTypeMap,
        activeConfigs: parsed.detectedConfigs,
        hasNewBuffer: true,
      }));
      try {
        setDocxXmlParts(splitXmlAndTexts(rawCleanText));
      } catch (e) {
        console.warn("Lỗi đồng bộ XML của file tải lên:", e);
      }
      showToast("Đã phân tích và nạp tệp mới thành công!", "success");
    } catch (err) {
      showToast("Lỗi phân tích tệp: " + err.message, "error");
    }
  };

  var handleUpdateXmlPart = function (fullIndex, newText) {
    setDocxXmlParts((prevParts) => {
      var nextParts = prevParts.map((p, idx) => {
        if (idx === fullIndex) {
          return { ...p, content: newText };
        }
        return p;
      });

      try {
        var PizZip = window.PizZip;
        var zip = new PizZip(new Uint8Array(editingTemplate.fileBuffer));
        var nextXml = joinPartsToXml(nextParts);
        zip.file("word/document.xml", nextXml);

        var newBuffer = zip.generate({ type: "arraybuffer" });

        var rawCleanText = getCleanTextFromZip(zip);
        var parsed = extractAllTags(rawCleanText);

        setEditingTemplate((prev) => ({
          ...prev,
          fileBuffer: newBuffer,
          tags: parsed.uniqueTagNames,
          rawTags: parsed.uniqueRawTags,
          tagTypes: parsed.tagToTypeMap,
          activeConfigs: parsed.detectedConfigs,
          hasNewBuffer: true,
        }));
      } catch (err) {
        console.error("Lỗi cập nhật XML trực tiếp:", err);
      }

      return nextParts;
    });
  };

  var handleRenameTagInEditor = function (oldTag, newTag, index = -1) {
    if (!newTag || !newTag.trim()) return;
    newTag = newTag.trim().toUpperCase().replace(/\s+/g, "");

    setEditingTemplate((prev) => {
      var updatedTags = prev.tags.map((t, idx) => {
        if (index !== -1) {
          return idx === index ? newTag : t;
        }
        return t === oldTag ? newTag : t;
      });
      // Raw tags map logic needs improvement if there are duplicates, but rawTags are just matched by base string.
      // Since we don't have exactly mapped indexes for rawTags (one tag -> multiple rawTags), we still replace by oldTag match.
      // Wait! If they rename ONE of the duplicate tags, the rawTags for that tag should also change. But if they have duplicate tags, rawTags would match oldTag anyway.
      // We will just do a global replace in rawTags based on oldTag, which is fine since they shouldn't have duplicate tags mapping anyway.
      var updatedRawTags = prev.rawTags.map((rt) => {
        var base = rt.replace(
          /(_UPPER|_LOWER|_TABLE_STRIPED|_TABLE|_VIET|_VIỆT|_VIÊT|_MONEY)[\s\u200B-\u200D\uFEFF]*$/gi,
          "",
        );
        var modifier = rt.substring(base.length);
        var checkPrefix = "";
        if (base.toUpperCase().startsWith("CHECK_X_")) {
          checkPrefix = base.substring(0, 8);
          base = base.substring(8);
        } else if (base.toUpperCase().startsWith("CHECK_O_")) {
          checkPrefix = base.substring(0, 8);
          base = base.substring(8);
        }

        if (base === oldTag) {
          return checkPrefix + newTag + modifier;
        }
        return rt;
      });

      var updatedTagMapping = { ...(prev.tagMapping || {}) };
      var madeMappingChange = false;
      Object.keys(updatedTagMapping).forEach(oldT => {
         if (updatedTagMapping[oldT] === oldTag) {
            updatedTagMapping[oldT] = newTag;
            madeMappingChange = true;
         }
      });
      if (!madeMappingChange && oldTag !== newTag) {
         updatedTagMapping[oldTag] = newTag;
         madeMappingChange = true;
      }

      return {
        ...prev,
        tags: updatedTags,
        rawTags: updatedRawTags,
        tagMapping: updatedTagMapping,
      };
    });
  };

  var handleAddTagInEditor = function (newTag) {
    if (!newTag || !newTag.trim()) return;
    var error = validateTagName(newTag, editingTemplate.tags);
    if (error) {
      showToast(error, "error");
      return;
    }
    var finalTag = newTag.trim().toUpperCase();
    setEditingTemplate((prev) => ({
      ...prev,
      tags: [...prev.tags, finalTag],
      rawTags: [...prev.rawTags, finalTag],
    }));
  };

  var handleDeleteTagInEditor = function (tagToDelete, index = -1) {
    setEditingTemplate((prev) => {
      var updatedTags = prev.tags.filter((t, idx) => {
        if (index !== -1) return idx !== index;
        return t !== tagToDelete;
      });
      // Raw tags map: same logic, we just remove the matches.
      var updatedRawTags = prev.rawTags.filter((rt) => {
        var base = rt.replace(
          /(_UPPER|_LOWER|_TABLE_STRIPED|_TABLE|_VIET|_VIỆT|_VIÊT|_MONEY)[\s\u200B-\u200D\uFEFF]*$/gi,
          "",
        );
        if (
          base.toUpperCase().startsWith("CHECK_X_") ||
          base.toUpperCase().startsWith("CHECK_O_")
        ) {
          base = base.substring(8);
        }
        return base !== tagToDelete;
      });
      return {
        ...prev,
        tags: updatedTags,
        rawTags: updatedRawTags,
      };
    });
  };

  var handleSaveEditedTemplate = async function () {
    if (!editingTemplate) return;
    if (editingTemplate.hasNewBuffer) {
      await saveBufferToDB(editingTemplate.id, editingTemplate.fileBuffer);
    }
    setLoadedTemplates((prev) =>
      prev.map((t) => {
        if (t.id === editingTemplate.id) {
          var updated = { ...editingTemplate };
          delete updated.hasNewBuffer;
          return updated;
        }
        return t;
      }),
    );
    showToast("Đã lưu các thay đổi của tệp mẫu!", "success");
    setEditingTemplate(null);
  };

  var handleDownloadWordFileInEditor = function () {
    if (editingTemplate && editingTemplate.fileBuffer) {
      const isXlsx =
        editingTemplate.originalName &&
        editingTemplate.originalName.toLowerCase().endsWith(".xlsx");
      const mimeType = isXlsx
        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      var blob = new Blob([new Uint8Array(editingTemplate.fileBuffer)], {
        type: mimeType,
      });
      var name = editingTemplate.originalName || "template.docx";
      if (!name.match(/\.(docx|xlsx)$/i)) name += ".docx";
      window.saveAs(blob, name);
      showToast("Đã tải tệp phôi offline!", "success");
    } else {
      showToast("Chưa có tệp phôi phù hợp!", "error");
    }
  };

  var handleDownloadConfigJsonInEditor = function () {
    if (editingTemplate) {
      var configData = {
        originalName: editingTemplate.originalName,
        customName: editingTemplate.customName,
        tags: editingTemplate.tags,
        rawTags: editingTemplate.rawTags,
        tagTypes: editingTemplate.tagTypes,
        activeConfigs: editingTemplate.activeConfigs,
        bindSheetKey: editingTemplate.bindSheetKey,
      };
      var blob = new Blob([JSON.stringify(configData, null, 2)], {
        type: "application/json",
      });
      var name = (editingTemplate.customName || "config") + "_tags.json";
      window.saveAs(blob, name);
      showToast("Đã xuất cấu hình biến offline!", "success");
    }
  };

  var handleCustomNameChange = function (id, val) {
    setLoadedTemplates(function (prev) {
      return prev.map(function (t) {
        return t.id === id ? Object.assign({}, t, { customName: val }) : t;
      });
    });
  };
  var handleStageChange = function (id, val) {
    setLoadedTemplates(function (prev) {
      return prev.map(function (t) {
        return t.id === id ? Object.assign({}, t, { stage: val }) : t;
      });
    });
    setProjectStages(function (prev) {
      var next = safeDeepClone(prev);
      var modified = false;
      Object.keys(next).forEach(function (projId) {
        if (!next[projId]) return;
        next[projId].forEach(function (stage) {
          if (stage.docs) {
            stage.docs.forEach(function (doc) {
              if (doc.templateId === id && stage.name !== val) {
                delete doc.templateId;
                modified = true;
              }
            });
          }
        });
      });
      return modified ? next : prev;
    });
  };

  var handleBindSheetChange = function (id, val) {
    setLoadedTemplates(function (prev) {
      return prev.map(function (t) {
        return t.id === id ? Object.assign({}, t, { bindSheetKey: val }) : t;
      });
    });
  };

  var handleFormChange = function (e) {
    var next = Object.assign({}, formData);
    next[e.target.name] = e.target.value;
    setFormData(next);
  };

  var handleFormBlur = function (e) {
    setFocusedTag(null);
    var name = e.target.name;
    var val = e.target.value;
    setFormData(function (prev) {
      var formattedVal = safeFormatNumber(val, false);
      if (prev[name] === formattedVal && String(prev[name]) === String(val)) {
        // No actual change, don't push to history, but format if needed
        return prev;
      }
      var next = Object.assign({}, prev);
      next[name] = formattedVal;
      localStorage.setItem(
        `sde_${SDE_UID}_form_data_v1.9_` + currentProjectId,
        JSON.stringify(next),
      );

      var newHist = formHistoryRef.current.slice(
        0,
        historyIndexRef.current + 1,
      );
      // Avoid pushing duplicate state at the tip
      var lastState = newHist[newHist.length - 1] || {};
      if (lastState[name] !== formattedVal) {
        newHist.push(next);
        var MAX_HISTORY = 50;
        if (newHist.length > MAX_HISTORY)
          newHist = newHist.slice(newHist.length - MAX_HISTORY);
        formHistoryRef.current = newHist;
        historyIndexRef.current = newHist.length - 1;
        setFormHistory(newHist);
        setHistoryIndex(newHist.length - 1);
      }
      return next;
    });
  };

  var tagsToDisplayInSingle = useMemo(
    function () {
      var sourceList =
        activeSingleMappingTab === "all"
          ? tags
          : activeProjectTemplates.find(function (t) {
              return t.id === activeSingleMappingTab;
            })?.tags || [];

      return sourceList.filter(function (tag) {
        if (tag === focusedTag) return true;
        if (
          tagSearchQuery &&
          tag.toLowerCase().indexOf(tagSearchQuery.toLowerCase()) === -1
        )
          return false;
        var val = formData[tag];
        var isFilled = val && String(val).trim() !== "";
        if (singleTagFilterMode === "filled") return isFilled;
        if (singleTagFilterMode === "empty") return !isFilled;
        return true;
      });
    },
    [
      tags,
      tagSearchQuery,
      formData,
      singleTagFilterMode,
      focusedTag,
      activeSingleMappingTab,
      activeProjectTemplates,
    ],
  );

  var quickStats = useMemo(
    function () {
      var totalTags = tags.length;
      var totalTemplates = activeProjectTemplates.length;
      var filledTags = tags.filter(function (tag) {
        return formData[tag] && String(formData[tag]).trim() !== "";
      }).length;
      var fillRate =
        totalTags > 0 ? Math.round((filledTags / totalTags) * 100) : 0;
      var totalExports = 0;
      return { totalTags, totalTemplates, fillRate, filledTags, totalExports };
    },
    [tags, activeProjectTemplates, formData],
  );

  var tagsToDisplayInMapping = useMemo(
    function () {
      var list =
        activeMappingTab === "all"
          ? tags
          : activeProjectTemplates.find(function (t) {
              return t.id === activeMappingTab;
            })?.tags || [];
      if (mappingSearchQuery.trim()) {
        var q = mappingSearchQuery.toLowerCase().trim();
        list = list.filter(function (t) {
          return t.toLowerCase().indexOf(q) !== -1;
        });
      }
      return list.filter(function (tag) {
        if (tag === focusedTag) return true;

        var mapping = columnMapping[tag];
        var isMapped =
          mapping &&
          ((mapping.type === "excel" && mapping.value) ||
            (mapping.type === "manual" && mapping.value));
        var isError =
          mapping &&
          mapping.type === "excel" &&
          mapping.value &&
          excelColumns.indexOf(mapping.value) === -1;

        if (batchTagFilterMode === "filled") return isMapped && !isError;
        if (batchTagFilterMode === "empty") return !isMapped;
        if (batchTagFilterMode === "error") return isError;
        return true;
      });
    },
    [
      activeMappingTab,
      tags,
      activeProjectTemplates,
      mappingSearchQuery,
      columnMapping,
      batchTagFilterMode,
      excelColumns,
      focusedTag,
    ],
  );

  function getTagSourceBadges(tag) {
    var badges = [];
    activeProjectTemplates.forEach(function (t, index) {
      if (
        selectedTemplateIds.indexOf(t.id) !== -1 &&
        t.tags &&
        t.tags.indexOf(tag) !== -1
      ) {
        var colorName = SOURCE_COLORS[index % SOURCE_COLORS.length];
        var cls = COLOR_CLASSES[colorName];
        badges.push(
          <span
            key={t.id}
            className={
              "text-[9px] font-bold px-1.5 py-0.5 border rounded-md truncate max-w-[120px] flex-shrink-0 " +
              cls
            }
            title={t.customName || t.originalName}
          >
            {(t.customName || t.originalName).replace(".docx", "")}
          </span>,
        );
      }
    });
    return badges;
  }

  function getTagHint(tag) {
    for (let i = 0; i < activeProjectTemplates.length; i++) {
      if (
        activeProjectTemplates[i].tagHints &&
        activeProjectTemplates[i].tagHints[tag]
      ) {
        return activeProjectTemplates[i].tagHints[tag];
      }
    }
    return null;
  }

  var checkMissingBuffers = function (templates) {
    var missing = templates.find(function (t) {
      return !t.fileBuffer;
    });
    if (missing) {
      showToast(
        "⚠️ CÓ LỖI TỆP TRỐNG! Hệ thống không tìm thấy file Word gốc trong Database.",
        "error",
      );
      return true;
    }
    return false;
  };

  const getMissingTags = () => {
    if (activeTab !== "single") return [];
    return tags.filter(function (tag) {
      var val = formData[tag];
      return !val || String(val).trim() === "";
    });
  };

  var checkEmptyVars = function (mode) {
    var empty = [];
    if (mode === "single") {
      tags.forEach(function (t) {
        if (t.toUpperCase() === "STT") return;
        if (!formData[t] || String(formData[t]).trim() === "") empty.push(t);
      });
    } else {
      tags.forEach(function (t) {
        if (t.toUpperCase() === "STT") return;
        var m = columnMapping[t];
        if (
          !m ||
          (m.type === "manual" && !m.value) ||
          (m.type === "excel" && !m.value)
        )
          empty.push(t);
      });
    }
    return empty;
  };

  var validateAndGenerateDoc = function () {
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
  };

  var validateAndGenerateBatch = function (isTest = false) {
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
          setConfirmModal({ ...confirmModal, show: false });
          generateBatch(isTest);
        },
      });
    } else generateBatch(isTest);
  };

  var generateDoc = async function () {
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
              // Approximate fallback without boundRow
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

        // Map valMap for audited templates
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
  };

  var generateBatch = async function (isTest = false) {
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
          // Ưu tiên thư mục đã ghi nhớ (Cài đặt → Hệ thống); nếu chưa có/từ chối
          // quyền thì mở hộp chọn và ghi nhớ lại cho lần sau.
          localDirHandle = await getUsableLocalDir();
          if (!localDirHandle) {
            localDirHandle = await window.showDirectoryPicker({
              mode: "readwrite",
            });
            await rememberLocalDir(localDirHandle);
          }
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
          
          // Yield to event loop to keep UI responsive when processing many templates per row
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

          let finalZipName = isTest
            ? "TEST_HoSo_1Dong.zip"
            : "SmartDoc_Excel_Mapping_ZIP.zip";
          if (!isTest) {
            const pName =
              projects.find((p) => p.id === currentProjectId)?.name ||
              "SmartDoc_Export";
            let sheetInfo =
              selectedSheetKeys.length === 1
                ? "_" + selectedSheetKeys[0].split("|||")[1]
                : "";
            let defaultZipName = `${pName}${sheetInfo}.zip`;
            let userZipName = window.prompt(
              "Vui lòng nhập tên file ZIP tải về:",
              defaultZipName,
            );
            if (userZipName) {
              finalZipName = userZipName;
              if (!finalZipName.toLowerCase().endsWith(".zip"))
                finalZipName += ".zip";
            } else {
              finalZipName = defaultZipName;
            }
          }

          saveAs(content, finalZipName);
          addLiveLog("✅ Hoàn tất xuất ZIP!", "success");
        }
      } else {
        addLiveLog("✅ Hoàn tất lưu dữ liệu ra thư mục Local!", "success");
      }
      if (!isTest)
        setExportReportModal({
          show: true,
          success: rowsToProcess.length,
          total: rowsToProcess.length,
          missingRows: missingRowsReport,
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
  };

  var downloadExcelTemplate = function () {
    if (!window.XLSX) {
      showToast("Thư viện Excel chưa sẵn sàng!", "error");
      return;
    }
    const STANDARD_TAGS = [
      "MA_DU_AN",
      "TEN_GOI_THAU",
      "CHU_DAU_TU",
      "NHA_THAU_THI_CONG",
      "GIA_TRI_HOP_DONG",
      "THOI_GIAN_THI_CONG",
    ];
    const headerRow = [...new Set([...STANDARD_TAGS, ...tags])];
    const ws = window.XLSX.utils.aoa_to_sheet([headerRow]);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Template_Goi_Thau");
    window.XLSX.writeFile(wb, "SmartDoc_Excel_Template.xlsx");
    showToast("Đã tải File Excel Mẫu (Template)!");
  };

  var finalizeExcelUpload = function (newWbs, newKeys, targetEl, skipDictionaryInsert) {
    if (!skipDictionaryInsert) {
      // Read current state of unknownTags from the modal before clearing
      setExcelAuditModal(function (prev) {
        if (prev.unknownTags && prev.unknownTags.length > 0) {
          setGlobalDictionary(function (prevDict) {
            var nextDict = Object.assign({}, prevDict);
            prev.unknownTags.forEach(function (tag) {
              nextDict[tag] = {
                description: "C\u1ed9t l\u1ea5y t\u1eeb Excel/Ngu\u1ed3n D\u1eef Li\u1ec7u",
                type: inferVariableType(tag),
                count: 1,
                defaultValue: "",
              };
            });
            return nextDict;
          });
        }
        return prev;
      });
    }
    setUploadedWorkbooks(function (prev) { return prev.concat(newWbs); });
    setSelectedSheetKeys(function (prev) {
      var combined = prev.concat(newKeys);
      return combined.filter(function (item, pos) { return combined.indexOf(item) === pos; });
    });
    showToast("\u0110\u00e3 n\u1ea1p th\u00e0nh c\u00f4ng " + newWbs.length + " t\u1ec7p Excel!");
    if (targetEl && targetEl.value) targetEl.value = "";
  };

  var handleConfirmExcelAudit = function (mode) {
    var savedWbs = excelAuditModal.newWbs;
    var savedKeys = excelAuditModal.newKeys;
    var savedTarget = document.getElementById("global-excel-upload");
    setExcelAuditModal(function (prev) { return Object.assign({}, prev, { show: false }); });
    if (mode === "KEEP") {
      finalizeExcelUpload(savedWbs, savedKeys, savedTarget, true);
    } else if (mode === "IMPORT") {
      finalizeExcelUpload(savedWbs, savedKeys, savedTarget, false);
      setTimeout(function () { setActiveMainTab("dictionary"); }, 200);
    }
  };

  var handleExcelUpload = async function (e) {
    var files = e.target && e.target.files ? e.target.files : e;
    if (!files || files.length === 0) return;
    var XLSX = window.XLSX;
    if (!XLSX) {
      showToast("H\u1ec7 th\u1ed1ng \u0111ang n\u1ea1p th\u01b0 vi\u1ec7n Excel. M\u1eddi th\u1eed l\u1ea1i.", "error");
      return;
    }
    try {
      var newWbs = [];
      var newKeys = [];
      var allHeaders = new Set();
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var buffer = await new Promise(function (resolve, reject) {
          var reader = new FileReader();
          reader.onload = function (ev) { resolve(ev.target.result); };
          reader.onerror = reject;
          reader.readAsArrayBuffer(file);
        });
        var workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });
        newWbs.push({ fileName: file.name, workbook: workbook, sheetNames: workbook.SheetNames });
        workbook.SheetNames.forEach(function (sName) {
          newKeys.push(file.name + "|||" + sName);
          var worksheet = workbook.Sheets[sName];
          var json = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: "" });
          if (json.length > 0) {
            Object.keys(json[0]).forEach(function (k) {
              if (k !== "___source_file" && k !== "___source_sheet" && !String(k).startsWith("__")) {
                allHeaders.add(k);
              }
            });
          }
        });
      }
      var newVars = [];
      allHeaders.forEach(function (tag) {
        if (!globalDictionary[tag]) {
          var canonical = resolveSynonym(tag, globalDictionary);
          if (canonical === tag) { newVars.push(tag); }
        }
      });
      if (newVars.length > 0) {
        setExcelAuditModal({
          show: true,
          unknownTags: newVars,
          newWbs: newWbs,
          newKeys: newKeys,
        });
      } else {
        finalizeExcelUpload(newWbs, newKeys, e.target, true);
      }
    } catch (err) {
      showToast("L\u1ed7i c\u1ea5u tr\u00fac t\u1ec7p Excel", "error");
      if (e.target && e.target.value) e.target.value = "";
    }
  };

  var handleRemoveWorkbook = function (fileName) {
    setUploadedWorkbooks(function (prev) {
      return prev.filter(function (wb) {
        return wb.fileName !== fileName;
      });
    });
    setSelectedSheetKeys(function (prev) {
      return prev.filter(function (key) {
        return key.indexOf(fileName + "|||") !== 0;
      });
    });
    showToast("Đã gỡ tệp: " + fileName);
  };

  var handleToggleSheet = function (fileName, sheetName) {
    var key = fileName + "|||" + sheetName;
    setSelectedSheetKeys(function (prev) {
      if (prev.indexOf(key) !== -1)
        return prev.filter(function (k) {
          return k !== key;
        });
      return prev.concat([key]);
    });
  };

  var handleSaveProfile = function () {
    setProfileNameInput("Cấu hình Mới");
    setIsSaveProfileModalOpen(true);
  };

  var handleProfileSelect = function (e) {
    var name = e.target.value;
    setSelectedProfileName(name);
    if (name && savedProfiles[name]) {
      setColumnMapping(savedProfiles[name]);
      showToast("Đã kích hoạt profile!");
    }
  };

  var handleImageChange = function (e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    setAiImage(file);
    var reader = new FileReader();
    reader.onload = function (event) {
      var base64 = event.target.result;
      setAiImageBase64(base64.substring(base64.indexOf(",") + 1));
      showToast("Đã nạp ảnh tài liệu thành công!");
    };
    reader.readAsDataURL(file);
  };

  var handleAiExtract = async function () {
    if (!geminiApiKey.trim()) {
      showToast("Vui lòng nhập Gemini API Key trong Cài đặt ⚙️", "error");
      return;
    }
    if (!aiText.trim() && !aiImageBase64) {
      showToast("Vui lòng dán văn bản hoặc tải ảnh tài liệu", "error");
      return;
    }
    if (tags.length === 0) {
      showToast("Hãy nạp mẫu Word trước để AI định dạng", "error");
      return;
    }

    var pendingTags = [];
    if (activeTab === "batch") {
      tags.forEach(function (t) {
        var m = columnMapping[t];
        if (!m || !m.value || (m.type !== "excel" && !m.value.trim()))
          pendingTags.push(t);
      });
      if (pendingTags.length === 0) {
        showToast("Tất cả các biến đã được Map với Excel!", "info");
        return;
      }
    } else {
      pendingTags = tags;
    }

    setAiLoading(true);
    try {
      var systemPrompt =
        "Bạn là trợ lý AI chuyên nghiệp phân tích tài liệu xây dựng, pháp lý tại Việt Nam. Bóc tách các thông số chính xác vào ĐÚNG TÊN BIẾN sau (không được đổi tên, không viết hoa thêm, không viết thường, giữ nguyên ký tự gạch dưới): " +
        JSON.stringify(pendingTags) +
        '. Chỉ trả về JSON thuần túy. Ví dụ đúng: {"TEN_NHA_THAU": "Công ty ABC"}. Ví dụ sai: {"Ten_Nha_Thau": "..."} hoặc {"ten nha thau": "..."}. Bỏ qua biến nào không tìm thấy thông tin.';
      var userPrompt =
        'Hãy bóc tách thông tin từ dữ liệu dưới đây. Trả về kết quả JSON thuần dạng: {"Tên_Biến_Gốc": "Giá_Trị"}. Chỉ trả về duy nhất JSON, không giải thích thêm.';
      var parts = [{ text: userPrompt }];
      if (aiText.trim()) parts.push({ text: aiText.trim() });
      if (aiImageBase64)
        parts.push({
          inlineData: {
            mimeType: aiImage ? aiImage.type : "image/png",
            data: aiImageBase64,
          },
        });
      var payload = {
        contents: [{ role: "user", parts: parts }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { responseMimeType: "application/json" },
      };

      var currentModel =
        localStorage.getItem("sde_gemini_model") || "gemini-2.0-flash";
      var result = await fetchGeminiWithBackoff(
        payload,
        geminiApiKey,
        currentModel,
      );
      var textResponse = result.candidates[0].content.parts[0].text;

      if (textResponse) {
        textResponse = textResponse
          .replace(/```json\s*/gi, "")
          .replace(/```\s*/g, "")
          .trim();
        var jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) textResponse = jsonMatch[0];
      }

      var parsedData = JSON.parse(textResponse);
      setAiExtractedData(parsedData);

      var fieldsSelected = {};
      Object.keys(parsedData).forEach(function (key) {
        if (parsedData[key] !== "") fieldsSelected[key] = true;
      });
      setAiSelectedFields(fieldsSelected);
    } catch (err) {
      let msg = "Lỗi bóc tách AI: ";
      if (err.message.includes("JSON"))
        msg += "AI trả về dữ liệu không đúng định dạng. Thử lại lần nữa.";
      else if (err.message.includes("401") || err.message.includes("API key"))
        msg += "API Key không hợp lệ. Vào Cài đặt ⚙️ kiểm tra lại.";
      else if (err.message.includes("429") || err.message.includes("quota"))
        msg += "Đã hết quota hôm nay. Đổi model hoặc thử lại ngày mai.";
      else if (
        err.message.includes("503") ||
        err.message.includes("high demand")
      )
        msg += "Gemini đang quá tải. Vui lòng thử lại sau ít phút.";
      else msg += err.message;
      showToast(msg, "error");
    } finally {
      setAiLoading(false);
    }
  };

  var handleConfirmAiData = function () {
    if (!aiExtractedData) return;

    var tagLookup = {};
    tags.forEach(function (t) {
      tagLookup[t.toUpperCase()] = t;
    });

    if (activeTab === "single") {
      var finalApplied = Object.assign({}, formData);
      Object.keys(aiExtractedData).forEach(function (key) {
        var realKey = tagLookup[key.toUpperCase()] || key;
        if (aiSelectedFields[key]) finalApplied[realKey] = aiExtractedData[key];
      });
      setFormData(finalApplied);
      var newHist = formHistoryRef.current.slice(
        0,
        historyIndexRef.current + 1,
      );
      newHist.push(finalApplied);
      var MAX_HISTORY = 50;
      if (newHist.length > MAX_HISTORY)
        newHist = newHist.slice(newHist.length - MAX_HISTORY);
      formHistoryRef.current = newHist;
      historyIndexRef.current = newHist.length - 1;
      setFormHistory(newHist);
      setHistoryIndex(newHist.length - 1);
    } else if (activeTab === "batch") {
      setColumnMapping(function (prev) {
        var newMapping = Object.assign({}, prev);
        Object.keys(aiExtractedData).forEach(function (key) {
          var realKey = tagLookup[key.toUpperCase()] || key;
          if (aiSelectedFields[key])
            newMapping[realKey] = {
              type: "manual",
              value: aiExtractedData[key],
            };
        });
        return newMapping;
      });
    }

    setAiText("");
    setAiImage(null);
    setAiImageBase64("");
    setAiExtractedData(null);
    showToast(
      "Đã nạp dữ liệu AI vào " +
        (activeTab === "batch" ? "bảng Cấu hình Mapping!" : "Master Form!"),
    );
  };

  var displayExcelColumns = useMemo(() => {
    if (excelData.length === 0) return [];
    var cols = Object.keys(excelData[0] || {});
    if (hideEmptyColumns) {
      cols = cols.filter((col) => {
        return excelData.some((row) => row[col] !== undefined && row[col] !== null && String(row[col]).trim() !== "");
      });
    }
    return cols;
  }, [excelData, hideEmptyColumns]);

  var handleExcelCellEdit = (originalIndex, colName, newValue) => {
    var newData = [...excelData];
    newData[originalIndex] = { ...newData[originalIndex], [colName]: newValue };
    setExcelData(newData);
  };

  var filteredExcelData = useMemo(
    function () {
      var base = excelData.map(function (row, index) {
        return { row: row, originalIndex: index };
      });

      // Filter by column filters
      Object.keys(excelColFilters).forEach((col) => {
        const filterVal = excelColFilters[col];
        if (filterVal) {
           const query = filterVal.toLowerCase().trim();
           base = base.filter((item) => {
             const cellVal = item.row[col];
             return cellVal !== undefined && cellVal !== null && String(cellVal).toLowerCase().includes(query);
           });
        }
      });

      if (!excelSearchQuery.trim()) return base;
      var query = excelSearchQuery.toLowerCase().trim();
      return base.filter(function (item) {
        return Object.values(item.row).some(function (val) {
          return String(val).toLowerCase().indexOf(query) !== -1;
        });
      });
    },
    [excelData, excelSearchQuery, excelColFilters],
  );

  var paginatedExcelData = useMemo(
    function () {
      var startIndex = (excelPage - 1) * excelRowsPerPage;
      return filteredExcelData.slice(startIndex, startIndex + excelRowsPerPage);
    },
    [filteredExcelData, excelPage],
  );
  var totalExcelPages =
    Math.ceil(filteredExcelData.length / excelRowsPerPage) || 1;

  var selectedNamesText =
    selectedTemplateIds.length === 0
      ? "⚠️ Chọn ít nhất 1 mẫu Word để xem biến"
      : "Đang xem: " +
        activeProjectTemplates
          .filter(function (t) {
            return selectedTemplateIds.indexOf(t.id) !== -1;
          })
          .map(function (t) {
            return (t.customName || t.originalName).replace(".docx", "");
          })
          .join(", ") +
        " (" +
        selectedTemplateIds.length +
        " file)";

  var handleStageDragStart = function (e, stageIndex) {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = "move";
    setProcessDragInfo({ type: "stage", sourceStageIdx: stageIndex });
  };
  var handleDocDragStart = function (e, stageIndex, docIndex) {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = "move";
    setProcessDragInfo({
      type: "doc",
      sourceStageIdx: stageIndex,
      sourceDocIdx: docIndex,
    });
  };
  var handleProcessDragOver = function (
    e,
    type,
    targetStageIdx,
    targetDocIdx = null,
  ) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    if (processDragInfo && processDragInfo.type === type) {
      setProcessDragOverInfo({ type, targetStageIdx, targetDocIdx });
    }
  };
  var handleProcessDragLeave = function (e) {
    e.preventDefault();
    setProcessDragOverInfo(null);
  };
  var handleProcessDrop = function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (processDragInfo && processDragOverInfo) {
      setProjectStages(function (prev) {
        const next = safeDeepClone(prev);
        const stages = next[currentProjectId] || [];

        if (
          processDragInfo.type === "stage" &&
          processDragOverInfo.type === "stage"
        ) {
          const from = processDragInfo.sourceStageIdx;
          const to = processDragOverInfo.targetStageIdx;
          if (
            from !== to &&
            from >= 0 &&
            to >= 0 &&
            from < stages.length &&
            to < stages.length
          ) {
            const moved = stages.splice(from, 1)[0];
            stages.splice(to, 0, moved);
          }
        } else if (
          processDragInfo.type === "doc" &&
          processDragOverInfo.type === "doc"
        ) {
          const sStage = processDragInfo.sourceStageIdx;
          const sDoc = processDragInfo.sourceDocIdx;
          const tStage = processDragOverInfo.targetStageIdx;
          let tDoc = processDragOverInfo.targetDocIdx;

          if (
            sStage >= 0 &&
            tStage >= 0 &&
            sStage < stages.length &&
            tStage < stages.length
          ) {
            const sDocs = stages[sStage].docs;
            const tDocs = stages[tStage].docs;
            if (sDoc >= 0 && sDoc < sDocs.length) {
              const movedDoc = sDocs.splice(sDoc, 1)[0];
              if (tDoc === null || tDoc < 0) tDoc = tDocs.length;

              if (sStage === tStage && sDoc < tDoc) {
                tDoc -= 1;
              }

              tDocs.splice(tDoc, 0, movedDoc);
            }
          }
        }
        return next;
      });
    }
    setProcessDragInfo(null);
    setProcessDragOverInfo(null);
  };

  var handleSaveEditProcessNode = function () {
    if (!editingProcessNode) return;

    if (editingProcessNode.type === "stage") {
      const oldStageName = editingProcessNode.oldName;
      const newStageName = editingProcessNode.newName;

      if (viewStageFilter === oldStageName) {
        setViewStageFilter(newStageName);
      }

      setLoadedTemplates((prev) =>
        prev.map((t) => {
          if (t.projectId === currentProjectId && t.stage === oldStageName) {
            return { ...t, stage: newStageName };
          }
          return t;
        }),
      );
    } else if (editingProcessNode.type === "doc") {
      const currentDoc =
        projectStages[currentProjectId]?.[editingProcessNode.stageIndex]
          ?.docs?.[editingProcessNode.docIndex];
      if (currentDoc && currentDoc.templateId) {
        setLoadedTemplates((prev) =>
          prev.map((t) => {
            if (t.id === currentDoc.templateId) {
              return { ...t, customName: editingProcessNode.newName };
            }
            return t;
          }),
        );
      }
    }

    setProjectStages((prev) => {
      const next = safeDeepClone(prev);
      if (!next[currentProjectId]) return next;
      if (editingProcessNode.type === "stage") {
        next[currentProjectId][editingProcessNode.stageIndex].name =
          editingProcessNode.newName;
      } else if (editingProcessNode.type === "doc") {
        next[currentProjectId][editingProcessNode.stageIndex].docs[
          editingProcessNode.docIndex
        ].name = editingProcessNode.newName;
      }
      return next;
    });
    setEditingProcessNode(null);
  };

  var handleAddProcessStage = function (stageName) {
    if (!stageName || !stageName.trim()) {
      showToast("Tên giai đoạn không được để trống!", "error");
      return;
    }
    const currentStages = projectStages[currentProjectId] || [];
    if (
      currentStages.some(
        (s) => s.name.toLowerCase() === stageName.trim().toLowerCase(),
      )
    ) {
      showToast("Cảnh báo: Giai đoạn này đã tồn tại trong quy trình!", "error");
      return;
    }

    setProjectStages((prev) => {
      const next = safeDeepClone(prev);
      if (!next[currentProjectId]) next[currentProjectId] = [];
      const newIdx = next[currentProjectId].length;
      next[currentProjectId].push({
        id: "s_" + Date.now(),
        name: stageName.trim(),
        docs: [],
      });
      return next;
    });
    setIsAddStageModalOpen(false);
    setNewStageInput("");
    showToast("Đã thêm giai đoạn: " + stageName.trim());
  };

  var handleAddProcessDoc = function (stageIndex) {
    setProjectStages((prev) => {
      const next = safeDeepClone(prev);
      const newIdx = next[currentProjectId][stageIndex].docs.length;
      const stageName = next[currentProjectId][stageIndex].name || "";
      const isContractType = /Hợp đồng|Văn bản các loại khác/i.test(stageName);
      const defaultDocName = isContractType
        ? "<<STT>>. Phụ lục mới"
        : "Tài liệu mới";
      next[currentProjectId][stageIndex].docs.push({
        id: "d_" + Date.now(),
        name: defaultDocName,
        status: "Chưa soạn",
      });
      setTimeout(
        () =>
          setEditingProcessNode({
            type: "doc",
            stageIndex: stageIndex,
            docIndex: newIdx,
            oldName: defaultDocName,
            newName: defaultDocName,
          }),
        50,
      );
      return next;
    });
  };

  var handleDeleteProcessNode = function (stageIndex, docIndex) {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa " +
          (docIndex === null ? "nhóm/giai đoạn" : "tài liệu") +
          " này không?",
      )
    )
      return;

    var templatesToRemove = [];
    if (projectStages[currentProjectId]) {
      if (docIndex === null) {
        var stage = projectStages[currentProjectId][stageIndex];
        if (stage && stage.docs)
          stage.docs.forEach((d) => {
            if (d.templateId) templatesToRemove.push(d.templateId);
          });
      } else {
        var doc = projectStages[currentProjectId][stageIndex]?.docs[docIndex];
        if (doc && doc.templateId) templatesToRemove.push(doc.templateId);
      }
    }

    if (templatesToRemove.length > 0) {
      setLoadedTemplates((prev) =>
        prev.filter((t) => templatesToRemove.indexOf(t.id) === -1),
      );
      setSelectedTemplateIds((prev) =>
        prev.filter((id) => templatesToRemove.indexOf(id) === -1),
      );
      if (templatesToRemove.indexOf(activePreviewId) !== -1)
        setActivePreviewId("");
    }

    setProjectStages((prev) => {
      const next = safeDeepClone(prev);
      if (!next[currentProjectId]) return next;
      if (docIndex === null) {
        next[currentProjectId].splice(stageIndex, 1);
      } else {
        next[currentProjectId][stageIndex].docs.splice(docIndex, 1);
      }
      return next;
    });
  };

  if (!isAppReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0D14]/40 backdrop-blur-xl">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-white font-bold">{loadingStatus}</div>
      </div>
    );
  }

  return (
    <div
      className={`flex ${isEmbedded ? 'h-full' : 'h-screen'} bg-[#0A0D14]/40 backdrop-blur-xl text-slate-100 font-sans relative overflow-hidden`}
      style={{ zoom: `${appZoomScale}%` }}
    >
      <input type="file" id="global-word-upload" accept=".docx, .xlsx" multiple className="hidden" onChange={handleWordUpload} />
      <input type="file" id="global-excel-upload" accept=".xlsx, .xls" className="hidden" onChange={handleExcelUpload} />
      {toast.show && (
        <div
          className={
            "fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full text-[13px] leading-relaxed font-bold text-white shadow-xl animate-fade-in flex items-center gap-2 " +
            (toast.type === "error"
              ? "bg-red-600"
              : toast.type === "warn"
                ? "bg-amber-600"
                : "bg-emerald-600")
          }
        >
          <span>
            {toast.type === "error"
              ? "❌"
              : toast.type === "warn"
                ? "⚠️"
                : "✅"}
          </span>{" "}
          {toast.msg}
        </div>
      )}

      {/* ENTERPRISE SIDEBAR NAVIGATION */}
      <div className={`${isEmbedded ? 'hidden' : 'flex'} w-16 xl:w-56 bg-[#0A0D14]/40 backdrop-blur-xl border-r border-slate-700/50 shadow-lg flex-col h-full shrink-0 z-40 transition-all duration-300`}>
        <div className="h-14 border-b border-slate-700/50 shadow-lg flex items-center justify-center xl:justify-start px-0 xl:px-4 shrink-0 bg-[#0A0D14]/40 backdrop-blur-xl/50">
          <h1 className="text-sm font-black text-white tracking-tight leading-none hidden xl:block">
            SmartDoc<span className="text-indigo-500">PRO</span>
            <span className="ml-2 bg-indigo-600 rounded px-1.5 py-0.5 text-[8px] font-bold text-white uppercase tracking-wider relative -top-0.5">
              V9.0
            </span>
          </h1>
          <h1 className="text-sm font-black text-white tracking-tight leading-none xl:hidden block">
            S<span className="text-indigo-500">D</span>
          </h1>
        </div>

        <div className="flex-1 py-4 flex flex-col gap-2 px-2 overflow-y-auto custom-scrollbar">
          <button
            onClick={() => setAppRoute("legal")}
            className={`w-full flex items-center gap-3 px-2 xl:px-3 py-2.5 rounded-xl transition-all ${
              appRoute === "legal"
                ? "bg-indigo-600 border border-indigo-500 text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
                : "text-slate-400 hover:bg-[#0A0D14]/40 backdrop-blur-xl hover:text-slate-200 border border-transparent"
            }`}
            title="Hồ sơ Pháp lý & Trộn File"
          >
            <span className="text-lg flex-shrink-0 flex items-center justify-center w-6">
              📂
            </span>
            <span className="text-[13px] leading-relaxed font-bold hidden xl:block whitespace-nowrap">
              Hồ sơ Pháp lý
            </span>
          </button>

          <div className="h-px bg-white/[0.03] backdrop-blur-md/50 my-2 mx-2"></div>

          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className={`w-full flex items-center gap-3 px-2 xl:px-3 py-2.5 rounded-xl transition-all text-slate-400 hover:bg-[#0A0D14]/40 backdrop-blur-xl hover:text-slate-200 border border-transparent`}
            title="Cài đặt Hệ thống"
          >
            <span className="text-lg flex-shrink-0 flex items-center justify-center w-6">
              ⚙️
            </span>
            <span className="text-[13px] leading-relaxed font-bold hidden xl:block whitespace-nowrap">
              Cài đặt Hệ thống
            </span>
          </button>
        </div>

        <div className="p-3 border-t border-slate-700/50 shadow-lg bg-[#0A0D14]/40 backdrop-blur-xl/30">
          <div className="flex flex-col xl:flex-row items-center gap-2 justify-center xl:justify-start">
            <div className="w-8 h-8 rounded-full border border-slate-600 bg-indigo-900/50 flex flex-col items-center justify-center shrink-0">
              <span className="text-[13px] leading-relaxed text-indigo-200">👤</span>
            </div>
            <div className="hidden xl:flex flex-col min-w-0">
              <span className="text-[12px] font-medium tracking-wide font-bold text-white leading-tight truncate">
                Admin
              </span>
              <button
                onClick={() => {
                  localStorage.removeItem("sde_auth_v2");
                  window.location.reload();
                }}
                className="text-[9px] text-red-400 hover:text-red-300 font-bold bg-red-950/30 px-1.5 py-0.5 rounded transition-colors w-min mt-0.5"
                title="Đăng xuất"
              >
                Thoát
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* TOP NAVBAR STICKY */}
        <div className="flex shrink-0 items-center justify-between gap-2 bg-[#0A0D14]/80 backdrop-blur-md border-b border-slate-800/80 w-full h-10 px-3 z-30">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 rounded-lg px-2 h-7 transition-all flex-shrink-0 relative focus-within:border-indigo-500">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide hidden xl:block">
                Dự án:
              </span>
              <select
                value={currentProjectId}
                onChange={function (e) {
                  var nextId = e.target.value;
                  var hasData = Object.values(formData).some(function (v) {
                    return v && v !== "";
                  });
                  if (hasData) {
                    setConfirmModal({
                      show: true,
                      title: "Chuyển dự án",
                      desc: "Bạn đang có dữ liệu trong form gốc. Chuyển dự án sẽ làm trắng form hiện tại. Tiếp tục?",
                      btnConfirm: "Chuyển",
                      action: function () {
                        setConfirmModal({
                          show: false,
                          action: null,
                          title: "",
                          desc: "",
                        });
                        setCurrentProjectId(nextId);
                        setFormData({});
                        setActivePreviewId("");
                        setFormHistory([{}]);
                        setHistoryIndex(0);
                      },
                    });
                    return;
                  }
                  setCurrentProjectId(nextId);
                  setFormData({});
                  setActivePreviewId("");
                  setFormHistory([{}]);
                  setHistoryIndex(0);
                }}
                className="bg-transparent text-[13px] leading-relaxed sm:text-sm outline-none font-bold text-white cursor-pointer w-24 sm:w-48 truncate z-10 relative appearance-none pr-6"
              >
                {projects.map(function (p) {
                  return (
                    <option key={p.id} value={p.id} className="bg-[#0A0D14]/40 backdrop-blur-xl">
                      {p.name}
                    </option>
                  );
                })}
              </select>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[12px] font-medium tracking-wide text-slate-500 pointer-events-none">
                ▼
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {currentProjectId !== "proj_default" && (
                <>
                  <button
                    onClick={() => {
                      const currentProj = projects.find(
                        (p) => p.id === currentProjectId,
                      );
                      let profile = projectProfiles[currentProjectId];
                      if (!profile) {
                        profile = {
                          id: currentProjectId,
                          fields: [
                            {
                              id: Math.random().toString(),
                              k: "Ma_Du_An",
                              n: "Mã Dự án",
                              v: "",
                            },
                            {
                              id: Math.random().toString(),
                              k: "Ten_Du_An",
                              n: "Tên Dự án",
                              v: currentProj?.name || "",
                            },
                            {
                              id: Math.random().toString(),
                              k: "Cap_QDDT",
                              n: "Cấp Quyết định Đầu tư",
                              v: "",
                            },
                            {
                              id: Math.random().toString(),
                              k: "Chu_Dau_Tu",
                              n: "Chủ Đầu tư",
                              v: "",
                            },
                            {
                              id: Math.random().toString(),
                              k: "Phong_Ban_Chuyen_Mon",
                              n: "Phòng ban Chuyên môn",
                              v: "",
                            },
                            {
                              id: Math.random().toString(),
                              k: "Tong_Muc_Dau_Tu",
                              n: "Tổng Mức Đầu tư",
                              v: "",
                            },
                            {
                              id: Math.random().toString(),
                              k: "Nguon_Von",
                              n: "Nguồn Vốn",
                              v: "",
                            },
                            {
                              id: Math.random().toString(),
                              k: "Nha_Thau_Khao_Sat",
                              n: "Nhà thầu Khảo sát",
                              v: "",
                            },
                            {
                              id: Math.random().toString(),
                              k: "Nha_Thau_Thiet_Ke",
                              n: "Nhà thầu Thiết kế",
                              v: "",
                            },
                            {
                              id: Math.random().toString(),
                              k: "Nha_Thau_Tham_Tra",
                              n: "Nhà thầu Thẩm tra",
                              v: "",
                            },
                            {
                              id: Math.random().toString(),
                              k: "Nha_Thau_Dau_Thau",
                              n: "Nhà thầu Đấu thầu",
                              v: "",
                            },
                            {
                              id: Math.random().toString(),
                              k: "Nha_Thau_Thi_Cong",
                              n: "Nhà thầu Thi công",
                              v: "",
                            },
                            {
                              id: Math.random().toString(),
                              k: "Nha_Thau_Giam_Sat",
                              n: "Nhà thầu Giám sát",
                              v: "",
                            },
                          ],
                        };
                      }

                      const clonedProfile = safeDeepClone(profile);
                      clonedProfile.id = currentProjectId;
                      clonedProfile.name = currentProj?.name || "";
                      clonedProfile.maDA = currentProj?.maDA || "";
                      clonedProfile.description =
                        currentProj?.description || "";
                      if (!clonedProfile.stakeholders)
                        clonedProfile.stakeholders = [];
                      if (!clonedProfile.assignedUsers)
                        clonedProfile.assignedUsers = [];

                      setEditingProjectProfile(clonedProfile);
                      setProjectWizardStep(1);
                      setWizardTemplateSelection({ type: "empty" });
                      setWizardSelectedCloneProjId("");
                      setIsProjectModalOpen(true);
                    }}
                    className="text-[13px] leading-relaxed text-slate-400 hover:text-indigo-400 p-1.5 bg-[#0A0D14]/40 backdrop-blur-xl rounded border border-slate-700"
                    title="Cấu hình Dự án (Tên, Mã DA, CĐT...)"
                  >
                    ⚙️
                  </button>
                  <button
                    onClick={() => triggerDeleteProject(currentProjectId)}
                    className="text-[13px] leading-relaxed text-slate-400 hover:text-red-400 p-1.5 bg-[#0A0D14]/40 backdrop-blur-xl rounded border border-slate-700"
                    title="Xóa Dự án"
                  >
                    🗑️
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
          </div>
        </div>

        {/* WORKSPACE CONTENT AREA (Scrollable) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          <React.Suspense fallback={null}>
            <WorkspaceTab
              appRoute={appRoute}
              activeProjectTemplates={activeProjectTemplates}
              selectedTemplateIds={selectedTemplateIds}
              tags={tags}
              formData={formData}
              columnMapping={columnMapping}
              excelData={excelData}
              setSelectedTemplateIds={setSelectedTemplateIds}
              wbsStageFilter={wbsStageFilter}
              setIsProcessModalOpen={setIsProcessModalOpen}
              setWbsStageFilter={setWbsStageFilter}
              setActiveMainTab={setActiveMainTab}
              setActivePreviewId={setActivePreviewId}
              setActiveMappingTab={setActiveMappingTab}
              setActiveSingleMappingTab={setActiveSingleMappingTab}
              setEditingTemplate={setEditingTemplate}
              handleDuplicateTemplate={handleDuplicateTemplate}
              handleDeleteTemplate={handleDeleteTemplate}
              activeMainTab={activeMainTab}
              viewStageFilter={viewStageFilter}
              setViewStageFilter={setViewStageFilter}
              projectStages={projectStages}
              currentProjectId={currentProjectId}
              activeMappingTab={activeMappingTab}
              visibleProjectTemplates={visibleProjectTemplates}
              setConfirmModal={setConfirmModal}
              setColumnMapping={setColumnMapping}
              showToast={showToast}
              handleAutoMap={handleAutoMap}
              selectedProfileName={selectedProfileName}
              handleProfileSelect={handleProfileSelect}
              savedProfiles={savedProfiles}
              handleSaveProfile={handleSaveProfile}
              mappingSearchQuery={mappingSearchQuery}
              setMappingSearchQuery={setMappingSearchQuery}
              excelColumns={excelColumns}
              activeExcelRowIndex={activeExcelRowIndex}
              selectedExcelRows={selectedExcelRows}
              getBoundRow={getBoundRow}
              safeGetExcelValue={safeGetExcelValue}
              tagsToDisplayInMapping={tagsToDisplayInMapping}
              globalDictionary={globalDictionary}
              handleCopyTag={handleCopyTag}
              copiedTag={copiedTag}
              focusedTag={focusedTag}
              setFocusedTag={setFocusedTag}
              excelColumnsGrouped={excelColumnsGrouped}
              batchTagFilterMode={batchTagFilterMode}
              setBatchTagFilterMode={setBatchTagFilterMode}
              setZoomLevel={setZoomLevel}
              zoomLevel={zoomLevel}
              isRenderingPreview={isRenderingPreview}
              uploadedWorkbooks={uploadedWorkbooks}
              handleRemoveWorkbook={handleRemoveWorkbook}
              selectedSheetKeys={selectedSheetKeys}
              setSelectedSheetKeys={setSelectedSheetKeys}
              filteredExcelData={filteredExcelData}
              excelSearchQuery={excelSearchQuery}
              setExcelSearchQuery={setExcelSearchQuery}
              hideEmptyColumns={hideEmptyColumns}
              setHideEmptyColumns={setHideEmptyColumns}
              excelRowsPerPage={excelRowsPerPage}
              setExcelRowsPerPage={setExcelRowsPerPage}
              excelPage={excelPage}
              setExcelPage={setExcelPage}
              setSelectedExcelRows={setSelectedExcelRows}
              displayExcelColumns={displayExcelColumns}
              excelColFilters={excelColFilters}
              setExcelColFilters={setExcelColFilters}
              paginatedExcelData={paginatedExcelData}
              setActiveExcelRowIndex={setActiveExcelRowIndex}
              editingExcelCell={editingExcelCell}
              setEditingExcelCell={setEditingExcelCell}
              handleExcelCellEdit={handleExcelCellEdit}
              totalExcelPages={totalExcelPages}
              exportMode={exportMode}
              setExportMode={setExportMode}
              exportSubFolderPattern={exportSubFolderPattern}
              setExportSubFolderPattern={setExportSubFolderPattern}
              cleanUnusedTags={cleanUnusedTags}
              setCleanUnusedTags={setCleanUnusedTags}
              enableHighlight={enableHighlight}
              setEnableHighlight={setEnableHighlight}
              exportProjectName={exportProjectName}
              handleAutofillFromExcelRow={handleAutofillFromExcelRow}
              validateAndGenerateDoc={validateAndGenerateDoc}
              validateAndGenerateBatch={validateAndGenerateBatch}
              isProcessing={isProcessing}
              setGlobalDictionary={setGlobalDictionary}
              standardPrefixes={standardPrefixes}
              setStandardPrefixes={setStandardPrefixes}
              exportDictionaryTemplate={exportDictionaryTemplate}
              setLoadedTemplates={setLoadedTemplates}
              setFormData={setFormData}
              isAddStageModalOpen={isAddStageModalOpen}
              setIsAddStageModalOpen={setIsAddStageModalOpen}
              newStageInput={newStageInput}
              setNewStageInput={setNewStageInput}
              handleAddProcessStage={handleAddProcessStage}
              FIXED_STAGES_SUGGESTIONS={FIXED_STAGES_SUGGESTIONS}
              editingProcessNode={editingProcessNode}
              setEditingProcessNode={setEditingProcessNode}
              handleSaveEditProcessNode={handleSaveEditProcessNode}
              isApprovalHistoryModalOpen={isApprovalHistoryModalOpen}
              setIsApprovalHistoryModalOpen={setIsApprovalHistoryModalOpen}
              approvalHistory={approvalHistory}
              setApprovalHistory={setApprovalHistory}
              isProcessModalOpen={isProcessModalOpen}
              processModalStageFilter={processModalStageFilter}
              setProcessModalStageFilter={setProcessModalStageFilter}
              isCompactView={isCompactView}
              setIsCompactView={setIsCompactView}
              handleDeleteProcessNode={handleDeleteProcessNode}
              setProjectStages={setProjectStages}
              handleAddProcessDoc={handleAddProcessDoc}
              loadedTemplates={loadedTemplates}
              activePreviewId={activePreviewId}
              handleBindSheetChange={handleBindSheetChange}
              projects={projects}
              SDE_UID={SDE_UID}
            />
          </React.Suspense>
        </div>
      </div>
      {/* END MAIN CONTENT AREA */}
      <React.Suspense fallback={null}>
      <ProjectModal
        isProjectModalOpen={isProjectModalOpen}
        setIsProjectModalOpen={setIsProjectModalOpen}
        editingProjectProfile={editingProjectProfile}
        setEditingProjectProfile={setEditingProjectProfile}
        handleCreateProject={handleCreateProject}
        projectWizardStep={projectWizardStep}
        setProjectWizardStep={setProjectWizardStep}
        wizardTemplateSelection={wizardTemplateSelection}
        setWizardTemplateSelection={setWizardTemplateSelection}
        wizardSelectedCloneProjId={wizardSelectedCloneProjId}
        setWizardSelectedCloneProjId={setWizardSelectedCloneProjId}
        projects={projects}
        newMemberName={newMemberName}
        setNewMemberName={setNewMemberName}
        newMemberRole={newMemberRole}
        setNewMemberRole={setNewMemberRole}
        newMemberEmail={newMemberEmail}
        setNewMemberEmail={setNewMemberEmail}
        newMemberPhone={newMemberPhone}
        setNewMemberPhone={setNewMemberPhone}
        newMemberPerms={newMemberPerms}
        setNewMemberPerms={setNewMemberPerms}
        showToast={showToast}
      />

      <SettingsModal
        isSettingsModalOpen={isSettingsModalOpen}
        setIsSettingsModalOpen={setIsSettingsModalOpen}
        geminiApiKey={geminiApiKey}
        setGeminiApiKey={setGeminiApiKey}
        clearGeminiKey={clearGeminiKey}
        handleExportBackup={handleExportBackup}
        handleImportBackup={handleImportBackup}
        backupReminderInterval={backupReminderInterval}
        setBackupReminderInterval={setBackupReminderInterval}
        isFullScreen={isFullScreen}
        setIsFullScreen={setIsFullScreen}
        screenResolution={screenResolution}
        setScreenResolution={setScreenResolution}
        storeExportSubFolderPattern={storeExportSubFolderPattern}
        setStoreExportSubFolderPattern={setStoreExportSubFolderPattern}
        storeEnableHighlight={storeEnableHighlight}
        setStoreEnableHighlight={setStoreEnableHighlight}
        storeCleanUnusedTags={storeCleanUnusedTags}
        setStoreCleanUnusedTags={setStoreCleanUnusedTags}
        SDE_UID={SDE_UID}
        showToast={showToast}
      />

      {exportReportModal.show && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#0A0D14]/40 backdrop-blur-xl/90 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg rounded-2xl w-full max-w-md p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-700 flex flex-col max-h-[85vh]">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-emerald-900/50 rounded-full flex items-center justify-center text-3xl mx-auto mb-3 border-4 border-emerald-800 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                ✅
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-wide">
                Báo Cáo Kết Xuất
              </h3>
              <p className="text-[13px] leading-relaxed text-slate-400 mt-1">
                Hoàn thành tạo file ZIP chứa{" "}
                <strong>{exportReportModal.total}</strong> bộ hồ sơ.
              </p>
            </div>

            {exportReportModal.missingRows.length > 0 ? (
              <div className="flex-1 overflow-y-auto mb-4 border border-amber-900/50 rounded-xl bg-amber-950/20 p-4">
                <h4 className="text-[13px] leading-relaxed font-black text-amber-500 uppercase flex items-center gap-1.5 mb-3">
                  <span>⚠️</span> Cảnh báo: Biến trống
                </h4>
                <p className="text-[12px] font-medium tracking-wide text-amber-200 mb-3">
                  Phát hiện {exportReportModal.missingRows.length} dòng dữ liệu
                  không điền đủ biến đã Map.
                </p>
                <div className="space-y-2">
                  {exportReportModal.missingRows.slice(0, 50).map((r, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-[12px] font-medium tracking-wide bg-[#0A0D14]/40 backdrop-blur-xl border border-amber-900/30 px-3 py-2 rounded"
                    >
                      <span className="text-slate-300 font-bold">
                        Dòng {r.row}
                      </span>
                      <span className="text-amber-400">
                        Thiếu {r.missing} giá trị
                      </span>
                    </div>
                  ))}
                  {exportReportModal.missingRows.length > 50 && (
                    <div className="text-center text-[12px] font-medium tracking-wide text-amber-500 pt-2 italic">
                      ...và {exportReportModal.missingRows.length - 50} dòng
                      khác.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 bg-emerald-950/20 border border-emerald-900/50 rounded-xl p-4 flex items-center justify-center mb-4">
                <span className="text-[13px] leading-relaxed font-bold text-emerald-400 text-center">
                  🎉 Tuyệt vời! 100% dòng dữ liệu đều được điền đầy đủ. Không có
                  biến rác.
                </span>
              </div>
            )}

            <button
              onClick={() =>
                setExportReportModal({
                  show: false,
                  success: 0,
                  missingRows: [],
                  total: 0,
                })
              }
              className="w-full px-5 py-3 bg-white/[0.03] backdrop-blur-md hover:bg-white/[0.06] backdrop-blur-lg text-white text-[13px] leading-relaxed font-bold rounded-xl transition-all shadow-md active:scale-95"
            >
              Đóng Báo Cáo
            </button>
          </div>
        </div>
      )}

      {editingTemplate && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#0A0D14]/40 backdrop-blur-xl/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg rounded-2xl w-full max-w-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-700 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center pb-4 border-b border-slate-700/50 shadow-lg">
              <h3 className="text-[13px] leading-relaxed font-black text-white uppercase flex items-center gap-1.5">
                <span>✏️</span> CHỈNH SỬA TỆP MẪU & QUẢN LÝ BIẾN
              </h3>
              <button
                onClick={function () {
                  setEditingTemplate(null);
                }}
                className="w-7 h-7 bg-white/[0.03] backdrop-blur-md hover:bg-white/[0.06] backdrop-blur-lg text-slate-400 rounded-lg flex items-center justify-center text-[13px] leading-relaxed transition-all"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium tracking-wide font-black text-slate-400 uppercase tracking-wider mb-1.5">
                    Tên Mẫu Gốc:
                  </label>
                  <input
                    type="text"
                    value={editingTemplate.originalName}
                    onChange={function (e) {
                      var val = e.target.value;
                      setEditingTemplate((prev) => ({
                        ...prev,
                        originalName: val,
                      }));
                    }}
                    className="w-full px-3 py-2 bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg rounded-xl text-[13px] leading-relaxed text-white outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium tracking-wide font-black text-slate-400 uppercase tracking-wider mb-1.5">
                    Tên Tệp Xuất Định Dạng:
                  </label>
                  <div className="flex items-center gap-1.5 bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg rounded-xl px-3 py-1.5 text-[13px] leading-relaxed">
                    <input
                      type="text"
                      value={editingTemplate.customName || ""}
                      onChange={function (e) {
                        var val = e.target.value;
                        setEditingTemplate((prev) => ({
                          ...prev,
                          customName: val,
                        }));
                      }}
                      className="flex-1 bg-transparent py-1 text-white font-bold outline-none focus:ring-0"
                      placeholder="Tên_HoanThanh"
                    />
                    <span className="text-slate-500 font-mono text-[12px] font-medium tracking-wide select-none">
                      (Đuôi: docx, xlsx)
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg rounded-xl p-3">
                <label className="block text-[12px] font-medium tracking-wide font-black text-sky-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span>💾</span> TẢI VỀ MÁY / SAO LƯU OFFLINE:
                </label>

                {/* ── OPEN EDITOR BUTTON ── */}
                <button
                  onClick={() => {
                    setWordEditorTemplate(editingTemplate);
                  }}
                  className="w-full mb-3 px-4 py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all active:scale-95 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-900/30"
                >
                  <span>📝</span> Mở Trình Soạn Thảo Toàn Màn Hình
                </button>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleDownloadWordFileInEditor}
                    className="flex-grow px-3 py-2 bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg hover:border-slate-700 hover:bg-slate-850 text-white rounded-lg text-[12px] font-medium tracking-wide font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    title="Tải tệp Word .docx gốc của mẫu này"
                  >
                    <span>📥</span> Tải tệp phôi (.docx)
                  </button>

                  <button
                    onClick={handleDownloadConfigJsonInEditor}
                    className="flex-grow px-3 py-2 bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg hover:border-slate-700 hover:bg-slate-850 text-white rounded-lg text-[12px] font-medium tracking-wide font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    title="Tải cấu hình ánh xạ biến dưới dạng file cấu hình .json"
                  >
                    <span>📂</span> Xuất cấu hình biến (.json)
                  </button>
                </div>
                <p className="text-[9px] text-slate-500 mt-1.5 italic leading-relaxed">
                  Bạn có thể tải tệp phôi Word (.docx) và cấu hình ánh xạ biến
                  (.json) để lưu trữ ngoại tuyến hoặc khôi phục bất cứ lúc nào.
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-3 border-t border-slate-700/50 shadow-lg justify-end flex-shrink-0">
              <button
                onClick={function () {
                  setEditingTemplate(null);
                }}
                className="px-4 py-2 bg-white/[0.03] backdrop-blur-md hover:bg-white/[0.06] backdrop-blur-lg text-slate-300 text-[13px] leading-relaxed font-bold rounded-xl"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSaveEditedTemplate}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] leading-relaxed font-bold rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-indigo-950/50 flex items-center gap-1"
              >
                <span>💾</span> Lưu tệp mẫu
              </button>
            </div>
          </div>
        </div>
      )}

      <React.Suspense fallback={null}>
        <SaveProfileModal
          isSaveProfileModalOpen={isSaveProfileModalOpen}
          setIsSaveProfileModalOpen={setIsSaveProfileModalOpen}
          profileNameInput={profileNameInput}
          setProfileNameInput={setProfileNameInput}
          savedProfiles={savedProfiles}
          columnMapping={columnMapping}
          setSavedProfiles={setSavedProfiles}
          setSelectedProfileName={setSelectedProfileName}
          showToast={showToast}
          SDE_UID={SDE_UID}
        />
      </React.Suspense>
      {wordEditorTemplate && (
      <WordEditorModal
        key={wordEditorTemplate?.id}
        template={wordEditorTemplate}
        onClose={() => setWordEditorTemplate(null)}
        showToast={showToast}
        onSaveToApp={async (newBuffer) => {
          await saveBufferToDB(wordEditorTemplate.id, newBuffer);
          setLoadedTemplates(prev => prev.map(t =>
            t.id === wordEditorTemplate.id
              ? { ...t, fileBuffer: newBuffer }
              : t
          ));
          setWordEditorTemplate(prev => prev ? { ...prev, fileBuffer: newBuffer } : null);
        }}
      />
      )}
      <UnknownVarsModal
        unknownTags={unknownTagsAlert}
        onClose={() => setUnknownTagsAlert([])}
        onGoToDictionary={() => { setActiveMainTab("variables"); }}
      />
      <VariablesLibraryModal
        isOpen={isVariableLibraryOpen}
        onClose={() => setIsVariableLibraryOpen(false)}
        globalDictionary={globalDictionary}
        setGlobalDictionary={setGlobalDictionary}
        showToast={showToast}
      />

      <LibraryModal
        isLibraryModalOpen={isLibraryModalOpen}
        setIsLibraryModalOpen={setIsLibraryModalOpen}
        globalDictionary={globalDictionary}
        setGlobalDictionary={setGlobalDictionary}
        loadedTemplates={loadedTemplates}
        handleDeleteFromLibrary={handleDeleteFromLibrary}
        handleExtractFromLibrary={handleExtractFromLibrary}
      />

      {excelAuditModal.show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0A0D14]/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0A0D14]/90 border border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.2)] rounded-2xl w-full max-w-xl overflow-hidden animate-slide-up">
            <div className="p-6 bg-gradient-to-b from-amber-950/40 to-transparent border-b border-amber-900/30">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30 shrink-0">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-amber-400 uppercase tracking-wide">Phát hiện Biến mới từ Excel</h3>
                  <p className="text-[13px] font-medium tracking-wide text-amber-200/70 mt-1">
                    File nạp chứa <b className="text-white">{excelAuditModal.unknownTags.length}</b> tiêu đề cột chưa có trong thư viện biến.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-[#0A0D14]/40">
              <div className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-4 mb-6">
                <p className="text-[13px] font-medium tracking-wide text-amber-200/90 leading-relaxed mb-3">
                  Hệ thống tìm thấy các cột mới trong file Excel vừa nạp:
                </p>
                <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto custom-scrollbar pr-2">
                  {excelAuditModal.unknownTags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 bg-[#0A0D14]/60 border border-amber-700/50 text-amber-300 rounded text-[11px] font-medium tracking-wide font-black">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleConfirmExcelAudit("KEEP")}
                  className="w-full relative group overflow-hidden rounded-xl p-4 bg-[#0A0D14]/40 border border-slate-700 hover:border-emerald-500/50 transition-all text-left flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-800 group-hover:bg-emerald-500/20 flex items-center justify-center shrink-0 transition-colors">
                    <span className="text-xl">📊</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-200 group-hover:text-emerald-400 transition-colors">Chỉ nạp Data (Không lưu biến)</h4>
                    <p className="text-[12px] font-medium tracking-wide text-slate-500 group-hover:text-emerald-500/70 mt-1">Chỉ sử dụng file Excel này để trộn dữ liệu một lần, không lưu các cột này vào thư viện biến gốc.</p>
                  </div>
                </button>

                <button
                  onClick={() => handleConfirmExcelAudit("IMPORT")}
                  className="w-full relative group overflow-hidden rounded-xl p-4 bg-[#0A0D14]/40 border border-slate-700 hover:border-amber-500/50 transition-all text-left flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-800 group-hover:bg-amber-500/20 flex items-center justify-center shrink-0 transition-colors">
                    <span className="text-xl">📚</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-200 group-hover:text-amber-400 transition-colors">Lưu vào Từ điển Biến</h4>
                    <p className="text-[12px] font-medium tracking-wide text-slate-500 group-hover:text-amber-500/70 mt-1">Cập nhật danh sách các cột này vào thư viện Biến để quản lý tập trung và tái sử dụng cho các Form khác.</p>
                  </div>
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-[#0A0D14] border-t border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  setExcelAuditModal(prev => ({ ...prev, show: false }));
                  const excelInput = document.getElementById("global-excel-upload");
                  if (excelInput && excelInput.value) {
                    excelInput.value = "";
                  }
                }}
                className="px-5 py-2.5 text-[13px] font-medium tracking-wide font-black text-slate-400 hover:text-white transition-colors"
              >
                Hủy bỏ (Không nạp)
              </button>
            </div>
          </div>
        </div>
      )}

      {wordAuditModal.show && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-[#0A0D14]/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0A0D14]/90 border border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.2)] rounded-2xl w-full max-w-xl overflow-hidden animate-slide-up">
            <div className="p-6 bg-gradient-to-b from-amber-950/40 to-transparent border-b border-amber-900/30">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30 shrink-0">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-amber-400 uppercase tracking-wide">Phát hiện Biến mới từ Word</h3>
                  <p className="text-[13px] font-medium tracking-wide text-amber-200/70 mt-1">
                    File upload có <b className="text-white">{wordAuditModal.unknownTags.length}</b> biến không thuộc thư viện{standardPrefixes.length > 0 ? ` hoặc không có tiền tố chuẩn (VD: ${standardPrefixes.map(p => p.prefix).slice(0, 3).join(", ")})` : ""}.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-[#0A0D14]/40">
              <div className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-4 mb-6">
                <p className="text-[13px] font-medium tracking-wide text-amber-200/90 leading-relaxed mb-3">
                  Hệ thống tìm thấy các biến mới trong file Word vừa nạp:
                </p>
                <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto custom-scrollbar pr-2">
                  {wordAuditModal.unknownTags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 bg-[#0A0D14]/60 border border-amber-700/50 text-amber-300 rounded text-[11px] font-bold uppercase tracking-wide">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleConfirmAudit("KEEP")}
                  className="w-full relative group overflow-hidden rounded-xl p-4 bg-[#0A0D14]/40 border border-slate-700 hover:border-emerald-500/50 transition-all text-left flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-800 group-hover:bg-emerald-500/20 flex items-center justify-center shrink-0 transition-colors">
                    <span className="text-xl">💾</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-200 group-hover:text-emerald-400 transition-colors">Chỉ tải tệp (Không nhập biến)</h4>
                    <p className="text-[12px] font-medium tracking-wide text-slate-500 group-hover:text-emerald-500/70 mt-1">Tải file mẫu lên bình thường, không thêm các biến lạ này vào thư viện biến gốc.</p>
                  </div>
                </button>

                <button
                  onClick={() => handleConfirmAudit("IMPORT_AND_EDIT")}
                  className="w-full relative group overflow-hidden rounded-xl p-4 bg-[#0A0D14]/40 border border-slate-700 hover:border-amber-500/50 transition-all text-left flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-800 group-hover:bg-amber-500/20 flex items-center justify-center shrink-0 transition-colors">
                    <span className="text-xl">✨</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-200 group-hover:text-amber-400 transition-colors">Nhập biến &amp; Sửa</h4>
                    <p className="text-[12px] font-medium tracking-wide text-slate-500 group-hover:text-amber-500/70 mt-1">Nhập các biến mới vào thư viện và mở trình chỉnh sửa để chuẩn hóa tên biến.</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="p-4 bg-[#0A0D14] border-t border-slate-800 flex justify-end">
              <button
                onClick={() => handleConfirmAudit("CANCEL")}
                className="px-5 py-2.5 text-[13px] font-black text-slate-400 hover:text-white transition-colors"
              >
                Hủy tải lên
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        confirmModal={confirmModal}
        setConfirmModal={setConfirmModal}
      />

      <AuthorModal
        isAuthorModalOpen={isAuthorModalOpen}
        setIsAuthorModalOpen={setIsAuthorModalOpen}
      />

      <PreviewModal
        isPreviewModalOpen={isPreviewModalOpen}
        setIsPreviewModalOpen={setIsPreviewModalOpen}
        isRenderingPreview={isRenderingPreview}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        previewContainerRef={previewContainerRef}
        previewMode={previewMode}
        setPreviewMode={setPreviewMode}
        activeExcelRowIndex={activeExcelRowIndex}
        excelData={excelData}
        activeProjectTemplates={activeProjectTemplates}
        setActivePreviewId={setActivePreviewId}
        activePreviewId={activePreviewId}
        scrollContainerRef={scrollContainerRef}
        startDrag={startDrag}
        stopDrag={stopDrag}
        onDrag={onDrag}
        activePreviewTemplate={activePreviewTemplate}
        activeTab={activeTab}
        setActiveMappingTab={setActiveMappingTab}
        setActiveSingleMappingTab={setActiveSingleMappingTab}
      />
      </React.Suspense>

      <HelpGuide
        open={showHelp}
        onClose={function () {
          setShowHelp(false);
        }}
      />
      <AIChatWidget
        tags={tags}
        excelData={excelData}
        activeTabMainApp={activeTab}
        formData={formData}
        columnMapping={columnMapping}
        handleAiExtract={handleAiExtract}
        handleConfirmAiData={handleConfirmAiData}
        aiLoading={aiLoading}
        aiExtractedData={aiExtractedData}
        aiSelectedFields={aiSelectedFields}
        setAiSelectedFields={setAiSelectedFields}
        aiText={aiText}
        setAiText={setAiText}
        aiImage={aiImage}
        handleImageChange={handleImageChange}
        setAiExtractedData={setAiExtractedData}
      />
    </div>
  );
}
