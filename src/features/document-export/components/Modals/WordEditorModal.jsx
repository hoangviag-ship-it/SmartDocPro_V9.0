import React, { useEffect, useRef, useState, useCallback } from "react";

/* ─────────────────────────────────────────────────────────────
   Kiến trúc MỚI: Chỉnh sửa trực tiếp XML bên trong .docx
   - Load .docx bằng PizZip (đã có sẵn)
   - Phân tích word/document.xml để lấy danh sách đoạn văn
   - Hiển thị nội dung có thể chỉnh sửa (text only)
   - Khi lưu: ghi lại chỉ phần text vào XML gốc, repack ZIP
   - Kết quả: GIỮ NGUYÊN 100% định dạng gốc (font, màu, bảng,
     header/footer, hình ảnh, v.v.)
───────────────────────────────────────────────────────────────*/

/* ── Trích xuất các "run" text từ XML (w:t elements) ── */
function parseDocxXml(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  const body = xmlDoc.querySelector("body");
  if (!body) return [];

  const paragraphs = [];
  const paraNodes = body.querySelectorAll("p");

  paraNodes.forEach((para, pIdx) => {
    const runs = [];
    const runNodes = para.querySelectorAll("r");
    runNodes.forEach((run, rIdx) => {
      const tNodes = run.querySelectorAll("t");
      let text = "";
      tNodes.forEach((t) => { text += t.textContent; });
      if (text || runs.length === 0) {
        // Check formatting
        const rPr = run.querySelector("rPr");
        runs.push({
          id: `p${pIdx}_r${rIdx}`,
          text,
          bold: !!rPr?.querySelector("b"),
          italic: !!rPr?.querySelector("i"),
          underline: !!rPr?.querySelector("u"),
        });
      }
    });

    // Para style
    const pPr = para.querySelector("pPr");
    const pStyle = pPr?.querySelector("pStyle")?.getAttribute("w:val") || "";
    const jc = pPr?.querySelector("jc")?.getAttribute("w:val") || "left";

    paragraphs.push({
      id: `p${pIdx}`,
      style: pStyle,
      align: jc,
      runs,
      rawNode: para,
    });
  });

  return paragraphs;
}

/* ── Ghi lại text đã chỉnh sửa vào XML gốc ── */
function applyEditsToXml(originalXml, edits) {
  // edits = { "p0_r1": "new text", ... }
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(originalXml, "text/xml");
  const body = xmlDoc.querySelector("body");
  if (!body) return originalXml;

  const paraNodes = body.querySelectorAll("p");
  paraNodes.forEach((para, pIdx) => {
    const runNodes = para.querySelectorAll("r");
    runNodes.forEach((run, rIdx) => {
      const key = `p${pIdx}_r${rIdx}`;
      if (edits[key] !== undefined) {
        const tNodes = run.querySelectorAll("t");
        if (tNodes.length > 0) {
          // Set text to first t node, remove extras
          tNodes[0].textContent = edits[key];
          // Preserve xml:space="preserve" if text has leading/trailing spaces
          if (edits[key].match(/^\s|\s$/)) {
            tNodes[0].setAttribute("xml:space", "preserve");
          }
          for (let i = 1; i < tNodes.length; i++) {
            tNodes[i].parentNode?.removeChild(tNodes[i]);
          }
        }
      }
    });
  });

  const serializer = new XMLSerializer();
  return serializer.serializeToString(xmlDoc);
}

/* ── Detect {{VAR}} tag spans ── */
function renderRunText(text) {
  const parts = text.split(/(\{\{[^}]+\}\})/g);
  return parts.map((part, i) => {
    const match = part.match(/^\{\{([^}]+)\}\}$/);
    if (match) {
      return (
        <span
          key={i}
          style={{
            background: "rgba(251,191,36,0.2)",
            color: "#d97706",
            border: "1px solid rgba(251,191,36,0.5)",
            borderRadius: "3px",
            padding: "0 4px",
            fontFamily: "monospace",
            fontSize: "0.85em",
          }}
        >
          {part}
        </span>
      );
    }
    return part;
  });
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
const WordEditorModal = ({ template, onClose, onSaveToApp, showToast }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [originalXml, setOriginalXml] = useState("");
  const [paragraphs, setParagraphs] = useState([]);
  const [edits, setEdits] = useState({}); // { "p0_r1": "text" }
  const [editingRunId, setEditingRunId] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [zipRef, setZipRef] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [replaceQuery, setReplaceQuery] = useState("");
  const [showFindReplace, setShowFindReplace] = useState(false);
  const inputRef = useRef(null);

  /* ── Load .docx → extract XML ── */
  useEffect(() => {
    if (!template?.fileBuffer) {
      setLoadError("Không có dữ liệu file.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const load = async () => {
      try {
        const PizZip = window.PizZip;
        if (!PizZip) throw new Error("PizZip chưa tải.");
        const uint8 = new Uint8Array(template.fileBuffer);
        const zip = new PizZip(uint8);
        setZipRef(zip);

        const xmlFile = zip.file("word/document.xml");
        if (!xmlFile) throw new Error("Không tìm thấy word/document.xml.");
        const xml = xmlFile.asText();
        setOriginalXml(xml);
        const parsed = parseDocxXml(xml);
        setParagraphs(parsed);
      } catch (err) {
        setLoadError("Lỗi tải file: " + err.message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [template]);

  /* ── Focus input when editing ── */
  useEffect(() => {
    if (editingRunId && inputRef.current) {
      inputRef.current.focus();
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, [editingRunId]);

  /* ── Get current text for a run (edited or original) ── */
  const getText = useCallback((runId, originalText) => {
    return edits[runId] !== undefined ? edits[runId] : originalText;
  }, [edits]);

  /* ── Save edit for a run ── */
  const commitEdit = useCallback(() => {
    if (editingRunId !== null) {
      setEdits(prev => ({ ...prev, [editingRunId]: editingValue }));
      setEditingRunId(null);
    }
  }, [editingRunId, editingValue]);

  /* ── Find & Replace ── */
  const handleFindReplace = useCallback(() => {
    if (!searchQuery.trim()) return;
    const newEdits = { ...edits };
    let count = 0;
    paragraphs.forEach(para => {
      para.runs.forEach(run => {
        const cur = newEdits[run.id] !== undefined ? newEdits[run.id] : run.text;
        if (cur.includes(searchQuery)) {
          newEdits[run.id] = cur.split(searchQuery).join(replaceQuery);
          count++;
        }
      });
    });
    setEdits(newEdits);
    showToast(`✅ Đã thay thế ${count} chỗ`, "success");
  }, [searchQuery, replaceQuery, edits, paragraphs, showToast]);

  /* ── Build final .docx buffer ── */
  const buildBuffer = useCallback(() => {
    if (!zipRef || !originalXml) throw new Error("Chưa tải file xong.");
    const newXml = applyEditsToXml(originalXml, edits);
    zipRef.file("word/document.xml", newXml);
    const out = zipRef.generate({ type: "uint8array", compression: "DEFLATE" });
    return Array.from(out);
  }, [zipRef, originalXml, edits]);

  /* ── Lưu vào App ── */
  const handleSaveToApp = async () => {
    setIsSaving(true);
    try {
      const buffer = buildBuffer();
      await onSaveToApp(buffer);
      showToast("✅ Đã lưu vào App — định dạng giữ nguyên!", "success");
    } catch (err) {
      showToast("Lỗi: " + err.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  /* ── Lưu & Tải về ── */
  const handleSaveAndDownload = async () => {
    setIsSaving(true);
    try {
      const buffer = buildBuffer();
      await onSaveToApp(buffer);
      const blob = new Blob([new Uint8Array(buffer)], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const fileName = (template.customName || template.originalName || "template")
        .replace(/\.(docx|xlsx)$/i, "") + "_edited.docx";
      if (window.saveAs) {
        window.saveAs(blob, fileName);
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = fileName; a.click();
        URL.revokeObjectURL(url);
      }
      showToast("✅ Đã lưu & tải về — định dạng giữ nguyên 100%!", "success");
    } catch (err) {
      showToast("Lỗi: " + err.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const editedCount = Object.keys(edits).length;
  const totalRuns = paragraphs.reduce((s, p) => s + p.runs.length, 0);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-[#080B12]" style={{ fontFamily: "Inter, sans-serif" }}>

      {/* ══ TOP BAR ══ */}
      <div className="shrink-0 flex items-center justify-between px-5 py-3 bg-[#0D1117] border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-lg">📝</div>
          <div>
            <div className="text-white font-bold text-[13px]">
              {template?.customName || template?.originalName || "Tệp mẫu"}
            </div>
            <div className="text-slate-500 text-[11px]">
              {editedCount > 0
                ? <span className="text-amber-400">{editedCount} chỗ đã sửa</span>
                : "Chưa có thay đổi"
              }
              {" · "}{totalRuns} đoạn text
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFindReplace(p => !p)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all border ${showFindReplace ? "bg-amber-600 border-amber-500 text-white" : "border-slate-700 text-slate-400 hover:text-white hover:border-slate-600"}`}
          >
            🔍 Tìm & Thay
          </button>
          <button
            onClick={handleSaveToApp}
            disabled={isSaving || isLoading}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-all"
          >
            {isSaving ? "⏳" : "💾"} Lưu vào App
          </button>
          <button
            onClick={handleSaveAndDownload}
            disabled={isSaving || isLoading}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 transition-all"
          >
            {isSaving ? "⏳" : "⬇️"} Lưu & Tải về
          </button>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all">✕</button>
        </div>
      </div>

      {/* ══ FIND & REPLACE BAR ══ */}
      {showFindReplace && (
        <div className="shrink-0 flex items-center gap-3 px-5 py-2.5 bg-amber-950/20 border-b border-amber-900/30">
          <span className="text-amber-400 text-[12px] font-bold shrink-0">🔍 Tìm & Thay thế:</span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm..."
            className="flex-1 bg-black/40 border border-slate-700 text-white text-[12px] px-3 py-1.5 rounded-lg outline-none focus:border-amber-500/60"
          />
          <span className="text-slate-500 text-[12px]">→</span>
          <input
            type="text"
            value={replaceQuery}
            onChange={e => setReplaceQuery(e.target.value)}
            placeholder="Thay bằng..."
            onKeyDown={e => e.key === "Enter" && handleFindReplace()}
            className="flex-1 bg-black/40 border border-slate-700 text-white text-[12px] px-3 py-1.5 rounded-lg outline-none focus:border-emerald-500/60"
          />
          <button
            onClick={handleFindReplace}
            className="px-4 py-1.5 rounded-lg text-[12px] font-bold bg-amber-600 hover:bg-amber-500 text-white transition-all"
          >
            Thay tất cả
          </button>
        </div>
      )}

      {/* ══ INFO BAR ══ */}
      <div className="shrink-0 flex items-center gap-4 px-5 py-2 bg-[#0A0D14] border-b border-slate-800/60 text-[11px] text-slate-500">
        <span>✅ Định dạng gốc được <strong className="text-emerald-400">bảo toàn 100%</strong> — chỉ nội dung text thay đổi</span>
        <span className="ml-auto">Click vào đoạn text bất kỳ để chỉnh sửa</span>
      </div>

      {/* ══ EDITOR BODY ══ */}
      <div className="flex-1 overflow-y-auto bg-[#080B12] py-8">
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            <span className="text-slate-400 text-sm">Đang tải nội dung file Word...</span>
          </div>
        )}
        {loadError && (
          <div className="flex items-center justify-center h-full">
            <div className="text-rose-400 text-center">
              <div className="text-4xl mb-3">⚠️</div>
              <div className="font-bold">{loadError}</div>
            </div>
          </div>
        )}
        {!isLoading && !loadError && (
          <div className="max-w-[860px] mx-auto bg-white rounded-lg shadow-2xl overflow-hidden">
            {paragraphs.length === 0 ? (
              <div className="p-12 text-center text-slate-400">Tài liệu trống hoặc không có nội dung text</div>
            ) : (
              <div className="p-12">
                {paragraphs.map((para) => {
                  const isHeading = para.style?.toLowerCase().includes("heading") || para.style === "1" || para.style === "2";
                  const align = para.align === "center" ? "center" : para.align === "right" ? "right" : "left";

                  return (
                    <div
                      key={para.id}
                      className="mb-2 group relative"
                      style={{ textAlign: align }}
                    >
                      {para.runs.map((run) => {
                        const currentText = getText(run.id, run.text);
                        const isEditing = editingRunId === run.id;
                        const isModified = edits[run.id] !== undefined && edits[run.id] !== run.text;

                        if (isEditing) {
                          return (
                            <textarea
                              key={run.id}
                              ref={inputRef}
                              value={editingValue}
                              onChange={e => setEditingValue(e.target.value)}
                              onBlur={commitEdit}
                              onKeyDown={e => {
                                if (e.key === "Escape") { setEditingRunId(null); }
                                if (e.key === "Enter" && e.shiftKey) { commitEdit(); }
                              }}
                              rows={Math.max(1, editingValue.split("\n").length)}
                              style={{
                                fontWeight: run.bold || isHeading ? "bold" : "normal",
                                fontStyle: run.italic ? "italic" : "normal",
                                textDecoration: run.underline ? "underline" : "none",
                                fontSize: isHeading ? "1.3em" : "1em",
                                fontFamily: "'Times New Roman', Georgia, serif",
                                display: "inline",
                                width: "100%",
                                background: "rgba(99,102,241,0.08)",
                                border: "2px solid rgba(99,102,241,0.6)",
                                borderRadius: "4px",
                                outline: "none",
                                padding: "2px 4px",
                                resize: "none",
                                lineHeight: "1.7",
                                color: "#111",
                              }}
                            />
                          );
                        }

                        return (
                          <span
                            key={run.id}
                            onClick={() => {
                              commitEdit();
                              setEditingRunId(run.id);
                              setEditingValue(currentText);
                            }}
                            title="Click để chỉnh sửa"
                            style={{
                              fontWeight: run.bold || isHeading ? "bold" : "normal",
                              fontStyle: run.italic ? "italic" : "normal",
                              textDecoration: run.underline ? "underline" : "none",
                              fontSize: isHeading ? "1.3em" : "1em",
                              fontFamily: "'Times New Roman', Georgia, serif",
                              cursor: "text",
                              display: "inline",
                              lineHeight: "1.7",
                              color: "#111",
                              borderRadius: "2px",
                              padding: "0 1px",
                              background: isModified ? "rgba(251,191,36,0.12)" : "transparent",
                              borderBottom: isModified ? "1.5px dashed #d97706" : "none",
                              transition: "background 0.15s",
                            }}
                            className="hover:bg-indigo-50 hover:outline hover:outline-1 hover:outline-indigo-300"
                          >
                            {currentText ? renderRunText(currentText) : <span style={{ opacity: 0.2, fontSize: "0.8em" }}>[trống]</span>}
                          </span>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══ STATUS BAR ══ */}
      <div className="shrink-0 flex items-center justify-between px-5 py-1.5 bg-[#0D1117] border-t border-slate-800 text-[11px] text-slate-500">
        <span>Click vào đoạn text để sửa • Shift+Enter để lưu đoạn đang sửa</span>
        <span className={editedCount > 0 ? "text-amber-400 font-bold" : ""}>
          {editedCount > 0 ? `⚠ ${editedCount} thay đổi chưa lưu` : "Chưa có thay đổi"}
        </span>
      </div>
    </div>
  );
};

export default WordEditorModal;
