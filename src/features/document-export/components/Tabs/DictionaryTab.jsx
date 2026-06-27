import React, { useState } from 'react';

const DictionaryTab = ({
  globalDictionary,
  setGlobalDictionary,
  standardPrefixes,
  setStandardPrefixes,
  exportDictionaryTemplate,
  setConfirmModal,
  showToast,
  setLoadedTemplates,
  setColumnMapping,
  setFormData
}) => {
  const [dictSearchTerm, setDictSearchTerm] = useState("");
  const [editingPrefixIndex, setEditingPrefixIndex] = useState(null);
  const [newPrefix, setNewPrefix] = useState("");
  const [newPrefixDesc, setNewPrefixDesc] = useState("");

  const [newDictKey, setNewDictKey] = useState("");
  const [newDictDesc, setNewDictDesc] = useState("");
  const [newDictType, setNewDictType] = useState("text");

  const [editingDictKey, setEditingDictKey] = useState(null);
  const [editingDictNewName, setEditingDictNewName] = useState("");

  return (
    <div className="bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg rounded-xl p-6 shadow-sm flex flex-col h-full min-h-[400px]">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6 shrink-0">
        <div>
          <h3 className="text-lg font-black text-amber-400 flex items-center gap-2 uppercase tracking-wide">
            <span>📚</span> Từ Điển Biến Toàn Cục
          </h3>
          <p className="text-[12px] font-medium tracking-wide text-slate-500 mt-1 font-medium">
            Tự động học các biến từ mẫu Word/Excel của bạn, quản lý và tái sử dụng cho mọi dự án. (Đồng bộ theo trình duyệt, xuất Backup .sde để sao lưu)
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full xl:w-auto">
          <input
            type="text"
            placeholder="🔍 Tìm biến..."
            value={dictSearchTerm}
            onChange={(e) => setDictSearchTerm(e.target.value)}
            className="px-3 py-2 bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 rounded-xl text-[13px] leading-relaxed text-white outline-none w-48 focus:border-amber-500/50"
          />
          <button
            onClick={() => exportDictionaryTemplate("word")}
            className="px-4 py-2 bg-indigo-900/40 text-indigo-400 hover:bg-indigo-900 border border-indigo-900/50 rounded-xl text-[13px] leading-relaxed font-bold transition-all shrink-0"
          >
            📥 File Tra Cứu (Word)
          </button>
          <button
            onClick={() => exportDictionaryTemplate("excel")}
            className="px-4 py-2 bg-emerald-900/40 text-emerald-400 hover:bg-emerald-900 border border-emerald-900/50 rounded-xl text-[13px] leading-relaxed font-bold transition-all shrink-0"
          >
            📥 Mẫu Map Nhanh (Excel)
          </button>
          <button
            onClick={() => {
              setConfirmModal({
                show: true,
                title: "Xóa toàn bộ Từ Điển?",
                desc: "Bạn có chắc chắn muốn xóa toàn bộ thư viện biến không? Hành động này không thể hoàn tác.",
                btnConfirm: "Xóa",
                action: () => {
                  setGlobalDictionary({});
                  setConfirmModal({
                    show: false,
                    action: null,
                    title: "",
                    desc: "",
                  });
                  showToast("Đã xóa thư viện biến", "success");
                },
              });
            }}
            className="px-4 py-2 bg-red-950/40 text-red-400 hover:bg-red-900 border border-red-900/50 rounded-xl text-[13px] leading-relaxed font-bold transition-all shrink-0"
          >
            Xóa Bỏ Từ Điển
          </button>
        </div>
      </div>

      {/* Tiền Tố Chuẩn Section */}
      <div className="bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 p-4 rounded-xl mb-4">
        <h4 className="text-[13px] leading-relaxed font-bold text-amber-500 uppercase flex items-center gap-2 mb-3">
          <span>🏷️</span> Quản Lý Tiền Tố Chuẩn (Prefixes)
        </h4>
        <p className="text-[12px] font-medium tracking-wide text-slate-400 mb-4">
          Định nghĩa các tiền tố chuẩn cho biểu mẫu. Ví dụ: tiền tố <code className="bg-white/[0.03] backdrop-blur-md px-1 py-0.5 rounded text-amber-200">DA_</code> đại diện cho nhóm Dự Án. Hệ thống sẽ kết hợp cùng Thư viện biến dùng chung để kiểm soát chuẩn hóa biểu mẫu khi tải lên.
        </p>
        <div className="flex flex-col gap-2 mb-4">
          {standardPrefixes.map((p, idx) => (
            <div key={idx} className="bg-white/[0.03] backdrop-blur-md/50 border border-slate-700 flex items-center justify-between px-3 py-2 rounded-lg text-[13px] leading-relaxed">
              {editingPrefixIndex === idx ? (
                <div className="flex gap-2 flex-1 items-center">
                  <input
                    type="text"
                    value={newPrefix}
                    onChange={(e) => setNewPrefix(e.target.value.toUpperCase())}
                    className="flex-shrink-0 px-2 py-1.5 bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-600 rounded text-amber-300 font-mono focus:border-amber-500/50 outline-none w-24"
                    placeholder="Prefix (VD: DA_)"
                  />
                  <input
                    type="text"
                    value={newPrefixDesc}
                    onChange={(e) => setNewPrefixDesc(e.target.value)}
                    className="flex-1 px-2 py-1.5 bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-600 rounded text-slate-300 focus:border-amber-500/50 outline-none"
                    placeholder="Mô tả nhóm công trình / chủ đầu tư..."
                  />
                  <button
                    onClick={() => {
                      if (newPrefix.trim()) {
                        var updated = [...standardPrefixes];
                        updated[idx] = { prefix: newPrefix.trim(), desc: newPrefixDesc.trim() };
                        setStandardPrefixes(updated);
                        setEditingPrefixIndex(null);
                        setNewPrefix("");
                        setNewPrefixDesc("");
                        showToast(`Đã cập nhật tiền tố ${newPrefix.trim()}`, "success");
                      }
                    }}
                    className="px-3 py-1.5 bg-emerald-600/30 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded transition-colors text-[13px] leading-relaxed font-bold"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={() => {
                      setEditingPrefixIndex(null);
                      setNewPrefix("");
                      setNewPrefixDesc("");
                    }}
                    className="px-3 py-1.5 bg-white/[0.06] backdrop-blur-lg text-slate-300 hover:text-white rounded transition-colors text-[13px] leading-relaxed font-bold"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-amber-300 font-bold bg-amber-500/10 px-2 py-1 rounded">{p.prefix}</span>
                    <span className="text-slate-400">{p.desc || "Không có mô tả"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingPrefixIndex(idx);
                        setNewPrefix(p.prefix);
                        setNewPrefixDesc(p.desc || "");
                      }}
                      className="text-slate-500 hover:text-indigo-400 text-[12px] font-medium tracking-wide uppercase font-bold"
                    >
                      Sửa
                    </button>
                    <span className="text-slate-700">|</span>
                    <button
                      onClick={() => {
                        setStandardPrefixes(prev => prev.filter((_, i) => i !== idx));
                        showToast(`Đã xóa tiền tố ${p.prefix}`, "info");
                      }}
                      className="text-slate-500 hover:text-red-400 text-[12px] font-medium tracking-wide uppercase font-bold"
                    >
                      Xóa
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          {standardPrefixes.length === 0 && (
            <div className="text-[12px] font-medium tracking-wide text-slate-500 italic p-3 text-center border border-dashed border-slate-700 rounded-lg">Bạn chưa thiết lập tiền tố quản lý nào.</div>
          )}
        </div>
        
        {editingPrefixIndex === null && (
          <div className="flex gap-2 items-center bg-[#0A0D14]/40 backdrop-blur-xl p-1.5 rounded-lg border border-slate-700">
            <input
              type="text"
              placeholder="Tiền tố (VD: BMA_)"
              value={newPrefix}
              onChange={(e) => setNewPrefix(e.target.value.toUpperCase())}
              className="px-3 py-2 bg-transparent text-[13px] leading-relaxed text-white outline-none w-32 font-mono border-r border-slate-700/50 shadow-lg"
            />
            <input
              type="text"
              placeholder="Thuộc nhóm công trình/chủ đầu tư (VD: Nhóm Dự án 2)"
              value={newPrefixDesc}
              onChange={(e) => setNewPrefixDesc(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (newPrefix.trim()) {
                    var prefixVal = newPrefix.trim();
                    if (standardPrefixes.some(p => p.prefix === prefixVal)) {
                        return showToast("Tiền tố này đã tồn tại", "error");
                    }
                    setStandardPrefixes(prev => [...prev, { prefix: prefixVal, desc: newPrefixDesc.trim() }]);
                    setNewPrefix("");
                    setNewPrefixDesc("");
                    showToast(`Đã thêm tiền tố ${prefixVal}`, "success");
                  }
                }
              }}
              className="flex-1 px-3 py-2 bg-transparent text-[13px] leading-relaxed text-white outline-none placeholder:text-slate-600"
            />
            <button
              onClick={() => {
                if (newPrefix.trim()) {
                  var prefixVal = newPrefix.trim();
                  if (standardPrefixes.some(p => p.prefix === prefixVal)) {
                      return showToast("Tiền tố này đã tồn tại", "error");
                  }
                  setStandardPrefixes(prev => [...prev, { prefix: prefixVal, desc: newPrefixDesc.trim() }]);
                  setNewPrefix("");
                  setNewPrefixDesc("");
                  showToast(`Đã thêm tiền tố ${prefixVal}`, "success");
                }
              }}
              className="px-4 py-2 bg-amber-500 text-white hover:bg-amber-600 shadow border border-amber-500/50 rounded-md text-[12px] font-medium tracking-wide uppercase tracking-wider font-bold transition-all whitespace-nowrap"
            >
              <span>➕</span> Thêm Mới
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
        <div className="bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 p-4 rounded-xl flex items-end gap-3 mb-4">
          <div className="flex-1">
            <label className="text-[12px] font-medium tracking-wide font-bold text-slate-400 mb-1 block">
              TÊN BIẾN MỚI
            </label>
            <input
              type="text"
              value={newDictKey}
              onChange={(e) =>
                setNewDictKey(e.target.value.toUpperCase().replace(/\s+/g, "_"))
              }
              placeholder="Vd: TEN_DU_AN"
              className="w-full bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg text-[13px] leading-relaxed text-white px-3 py-2 rounded outline-none focus:border-amber-500/50"
            />
          </div>
          <div className="flex-[2]">
            <label className="text-[12px] font-medium tracking-wide font-bold text-slate-400 mb-1 block">
              MÔ TẢ Ý NGHĨA
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newDictDesc}
                onChange={(e) => setNewDictDesc(e.target.value)}
                placeholder="Nhập mô tả cho biến này..."
                className="w-full bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg text-[13px] leading-relaxed text-white px-3 py-2 rounded outline-none focus:border-amber-500/50"
              />
              <select
                value={newDictType}
                onChange={(e) => setNewDictType(e.target.value)}
                className="bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg text-[13px] leading-relaxed text-slate-300 px-2 py-2 rounded outline-none focus:border-amber-500/50 shrink-0"
              >
                <option value="text">Chữ</option>
                <option value="table">Bảng</option>
                <option value="condition">Điều Kiện</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => {
              if (!newDictKey.trim()) return showToast("Vui lòng nhập tên biến", "error");
              if (globalDictionary[newDictKey]) return showToast("Biến này đã tồn tại", "error");
              setGlobalDictionary((prev) => ({
                ...prev,
                [newDictKey]: {
                  description: newDictDesc,
                  type: newDictType,
                  count: 1,
                  defaultValue: "",
                },
              }));
              setNewDictKey("");
              setNewDictDesc("");
              setNewDictType("text");
              showToast("Đã thêm biến thành công", "success");
            }}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-[13px] leading-relaxed rounded transition-colors shrink-0 h-[34px]"
          >
            Thêm Biến
          </button>
        </div>

        {Object.keys(globalDictionary || {}).length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500 italic text-sm mt-8 border-dashed border border-slate-700/50 rounded-xl">
            <span className="text-4xl mb-4 opacity-50 grayscale">📚</span>
            Từ điển trống. Hãy nạp file Word hoặc Excel để ứng dụng tự học biến!
          </div>
        ) : (
          <div>
            {(() => {
              const filteredDict = Object.entries(globalDictionary || {})
                .filter(
                  ([k, v]) =>
                    k.toLowerCase().includes(dictSearchTerm.toLowerCase()) ||
                    v.description?.toLowerCase().includes(dictSearchTerm.toLowerCase()),
                )
                .sort((a, b) => b[1].count - a[1].count);

              const groups = {};
              filteredDict.forEach(([key, val]) => {
                const parts = key.split("_");
                let prefix = "KHÁC";
                if (parts.length > 1 && parts[0].length >= 2) {
                  prefix = parts[0].toUpperCase();
                } else {
                  if (key.toUpperCase().startsWith("TEN_") || key.toUpperCase().startsWith("DIA_K")) {
                    prefix = parts[0].toUpperCase();
                  }
                }
                if (!groups[prefix]) groups[prefix] = [];
                groups[prefix].push([key, val]);
              });

              const mergedGroups = {};
              mergedGroups["KHÁC"] = groups["KHÁC"] || [];
              Object.keys(groups).forEach((k) => {
                if (k === "KHÁC") return;
                if (groups[k].length === 1) {
                  mergedGroups["KHÁC"].push(groups[k][0]);
                } else {
                  mergedGroups[k] = groups[k];
                }
              });

              const keys = Object.keys(mergedGroups).sort((a, b) => {
                if (a === "KHÁC") return 1;
                if (b === "KHÁC") return -1;
                return a.localeCompare(b);
              });

              return keys.map((group) => {
                const groupItems = mergedGroups[group];
                if (groupItems.length === 0) return null;
                return (
                  <div
                    key={group}
                    className="mb-6 bg-[#0A0D14]/40 backdrop-blur-xl/40 p-4 border border-slate-700/50 shadow-lg/80 rounded-xl relative"
                  >
                    <div className="absolute -top-3 left-4 px-3 py-1 bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 text-indigo-400 font-bold text-[12px] font-medium tracking-wide rounded-full uppercase tracking-widest flex items-center gap-2 shadow-sm">
                      <span>
                        BIẾN THEO NHÓM: {group === "KHÁC" ? "KHÁC (LẺ TẺ)" : group}
                      </span>
                      <span className="bg-indigo-500/20 text-indigo-300 w-5 h-5 flex items-center justify-center rounded-full">
                        {groupItems.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-3">
                      {groupItems.map(([key, val]) => (
                        <div
                          key={key}
                          className="bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg p-3 rounded-xl flex gap-3 hover:border-amber-900/50 transition-colors group relative"
                        >
                          <div className="w-10 h-10 rounded-lg bg-amber-950 flex flex-col items-center justify-center border border-amber-900/50 text-amber-400 font-bold shrink-0">
                            <span className="text-[13px] leading-relaxed">
                              #{val.count}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2">
                                {editingDictKey === key ? (
                                  <input
                                    type="text"
                                    value={editingDictNewName}
                                    onChange={(e) => setEditingDictNewName(e.target.value.toUpperCase().replace(/\s+/g, "_"))}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        if (!editingDictNewName.trim()) {
                                          showToast("Tên biến không được để trống", "error");
                                          return;
                                        }
                                        if (editingDictNewName !== key && globalDictionary[editingDictNewName]) {
                                          showToast("Biến này đã tồn tại", "error");
                                          return;
                                        }
                                        const oldKey = key;
                                        const newKey = editingDictNewName;
                                        if (oldKey !== newKey) {
                                          setGlobalDictionary(prev => {
                                            const next = { ...prev };
                                            next[newKey] = { ...next[oldKey] };
                                            delete next[oldKey];
                                            return next;
                                          });
                                          setLoadedTemplates(prev => prev.map(tmpl => {
                                            const updatedTags = tmpl.tags.map(t => t === oldKey ? newKey : t);
                                            const updatedRawTags = (tmpl.rawTags || []).map(rt => {
                                              const suffixMatch = rt.match(/(_UPPER|_LOWER|_TABLE_STRIPED|_TABLE|_VIET|_VI\u1ec6T|_VI\u00caT|_MONEY)[\s\u200B-\u200D\uFEFF]*$/i);
                                              const base = suffixMatch ? rt.slice(0, rt.length - suffixMatch[0].length) : rt;
                                              const suffix = suffixMatch ? suffixMatch[0] : "";
                                              if (base === oldKey || base === `CHECK_X_${oldKey}` || base === `CHECK_O_${oldKey}`) {
                                                return base.replace(oldKey, newKey) + suffix;
                                              }
                                              return rt;
                                            });
                                            const updatedTagMapping = { ...(tmpl.tagMapping || {}) };
                                            Object.keys(updatedTagMapping).forEach(k => {
                                              if (updatedTagMapping[k] === oldKey) updatedTagMapping[k] = newKey;
                                            });
                                            if (updatedTagMapping[oldKey] !== undefined) {
                                              updatedTagMapping[newKey] = updatedTagMapping[oldKey];
                                              delete updatedTagMapping[oldKey];
                                            }
                                            return { ...tmpl, tags: updatedTags, rawTags: updatedRawTags, tagMapping: updatedTagMapping };
                                          }));
                                          setColumnMapping(prev => {
                                            const next = { ...prev };
                                            if (next[oldKey] !== undefined) {
                                              next[newKey] = next[oldKey];
                                              delete next[oldKey];
                                            }
                                            return next;
                                          });
                                          setFormData(prev => {
                                            const next = { ...prev };
                                            if (next[oldKey] !== undefined) {
                                              next[newKey] = next[oldKey];
                                              delete next[oldKey];
                                            }
                                            return next;
                                          });
                                          showToast(`✅ Đổi "${oldKey}" → "${newKey}" trên toàn bộ hệ thống`, "success");
                                        } else {
                                          showToast("Tên biến không thay đổi", "info");
                                        }
                                        setEditingDictKey(null);
                                      } else if (e.key === "Escape") {
                                        setEditingDictKey(null);
                                      }
                                    }}
                                    autoFocus
                                    onBlur={() => setTimeout(() => setEditingDictKey(null), 150)}
                                    className="bg-[#0A0D14]/40 backdrop-blur-xl border border-amber-500/50 text-[13px] text-white px-2 py-0.5 rounded outline-none w-[200px]"
                                  />
                                ) : (
                                  <span
                                    className="font-bold text-[13px] text-white truncate max-w-[200px] cursor-pointer hover:text-amber-400 transition-colors"
                                    title={key + " (Click để sửa tên)"}
                                    onClick={() => {
                                      setEditingDictKey(key);
                                      setEditingDictNewName(key);
                                    }}
                                  >
                                    {key} <span className="opacity-0 group-hover:opacity-100 text-[10px] ml-1">✏️</span>
                                  </span>
                                )}
                                <select
                                  value={val.type || "text"}
                                  onChange={(e) => {
                                    setGlobalDictionary((prev) => ({
                                      ...prev,
                                      [key]: {
                                        ...prev[key],
                                        type: e.target.value,
                                      },
                                    }));
                                  }}
                                  className="text-[9px] bg-white/[0.03] backdrop-blur-md text-slate-300 px-1 py-0.5 rounded border border-slate-700 outline-none"
                                >
                                  <option value="text">Chữ</option>
                                  <option value="table">Bảng</option>
                                  <option value="condition">Điều Kiện</option>
                                </select>
                              </div>
                              <button
                                onClick={() => {
                                  setConfirmModal({
                                    show: true,
                                    title: `Xóa biến ${key}?`,
                                    desc: `Bạn có chắc muốn xóa biến ${key} khỏi từ điển?`,
                                    btnConfirm: "Xóa",
                                    action: () => {
                                      setGlobalDictionary((prev) => {
                                        const next = { ...prev };
                                        delete next[key];
                                        return next;
                                      });
                                      setConfirmModal({
                                        show: false,
                                        action: null,
                                        title: "",
                                        desc: "",
                                      });
                                      showToast(`Đã xóa biến ${key}`, "success");
                                    },
                                  });
                                }}
                                title="Xóa biến này"
                                className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:bg-red-950 rounded transition-all"
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  className="w-4 h-4"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M3 6h18"></path>
                                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                </svg>
                              </button>
                            </div>
                            <input
                              type="text"
                              value={val.description || ""}
                              onChange={(e) => {
                                setGlobalDictionary((prev) => ({
                                  ...prev,
                                  [key]: {
                                    ...prev[key],
                                    description: e.target.value,
                                  },
                                }));
                              }}
                              className="w-full bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg text-[12px] font-medium tracking-wide text-slate-300 px-2 py-1.5 rounded outline-none focus:border-amber-500/50"
                              placeholder="Mô tả ý nghĩa biến này..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default DictionaryTab;
