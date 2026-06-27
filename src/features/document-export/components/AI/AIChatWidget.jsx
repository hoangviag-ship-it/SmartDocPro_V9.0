import React, { useState } from 'react';
import { fetchGeminiWithBackoff } from '../../utils/helpers';

export default function AIChatWidget(props) {
  const {
    tags,
    excelData,
    activeTabMainApp,
    formData,
    columnMapping,
    handleAiExtract,
    handleConfirmAiData,
    aiLoading,
    aiExtractedData,
    aiSelectedFields,
    setAiSelectedFields,
    aiText,
    setAiText,
    aiImage,
    handleImageChange,
    setAiExtractedData,
  } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("chat");
  const [apiKey, setApiKey] = useState(() => {
    const k = localStorage.getItem("sde_gemini_key_v2");
    return k ? window.atob(k) : "";
  });
  const [aiModel, setAiModel] = useState(() => {
    return localStorage.getItem("sde_gemini_model") || "gemini-2.5-flash";
  });
  const [showSettings, setShowSettings] = useState(
    !localStorage.getItem("sde_gemini_key_v2"),
  );
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isReadingFile, setIsReadingFile] = useState(false);

  const handleSaveKey = () => {
    localStorage.setItem("sde_gemini_key_v2", window.btoa(apiKey.trim()));
    localStorage.setItem("sde_gemini_model", aiModel);
    setShowSettings(false);
  };

  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileAttach({ target: { files: e.dataTransfer.files } });
    }
  };

  const handleFileAttach = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setIsReadingFile(true);
    const results = [];
    for (const file of files) {
      const ext = file.name.split(".").pop().toLowerCase();
      try {
        if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext)) {
          // Ảnh → base64 inlineData
          const b64 = await new Promise((res, rej) => {
            const r = new FileReader();
            r.onload = (ev) => res(ev.target.result.split(",")[1]);
            r.onerror = rej;
            r.readAsDataURL(file);
          });
          results.push({
            name: file.name,
            type: "image",
            mimeType: file.type,
            b64,
          });
        } else if (["txt", "md", "csv", "json", "xml", "html"].includes(ext)) {
          // Text thuần → đọc thẳng
          const text = await new Promise((res, rej) => {
            const r = new FileReader();
            r.onload = (ev) => res(ev.target.result);
            r.onerror = rej;
            r.readAsText(file, "UTF-8");
          });
          results.push({
            name: file.name,
            type: "text",
            content: text.slice(0, 8000),
          });
        } else if (["xlsx", "xls"].includes(ext)) {
          // Excel → dùng window.XLSX đã có sẵn trong app
          const buf = await new Promise((res, rej) => {
            const r = new FileReader();
            r.onload = (ev) => res(ev.target.result);
            r.onerror = rej;
            r.readAsArrayBuffer(file);
          });
          const wb = window.XLSX.read(new Uint8Array(buf), { type: "array" });
          let text = "";
          wb.SheetNames.forEach((sn) => {
            const csv = window.XLSX.utils.sheet_to_csv(wb.Sheets[sn]);
            text +=
              `
--- Sheet: ${sn} ---
` + csv.slice(0, 3000);
          });
          results.push({
            name: file.name,
            type: "text",
            content: text.slice(0, 8000),
          });
        } else if (["docx", "doc"].includes(ext)) {
          // Word → dùng window.mammoth đã có sẵn trong app
          const buf = await new Promise((res, rej) => {
            const r = new FileReader();
            r.onload = (ev) => res(ev.target.result);
            r.onerror = rej;
            r.readAsArrayBuffer(file);
          });
          const result = await window.mammoth.extractRawText({
            arrayBuffer: buf,
          });
          results.push({
            name: file.name,
            type: "text",
            content: result.value.slice(0, 8000),
          });
        } else if (ext === "pdf") {
          // PDF → base64 gửi lên Gemini đọc trực tiếp (model hỗ trợ)
          const b64 = await new Promise((res, rej) => {
            const r = new FileReader();
            r.onload = (ev) => res(ev.target.result.split(",")[1]);
            r.onerror = rej;
            r.readAsDataURL(file);
          });
          results.push({
            name: file.name,
            type: "pdf",
            mimeType: "application/pdf",
            b64,
          });
        } else {
          // Fallback: thử đọc text
          const text = await new Promise((res, rej) => {
            const r = new FileReader();
            r.onload = (ev) => res(ev.target.result);
            r.onerror = rej;
            r.readAsText(file, "UTF-8");
          });
          results.push({
            name: file.name,
            type: "text",
            content: text.slice(0, 8000),
          });
        }
      } catch (err) {
        results.push({
          name: file.name,
          type: "error",
          content: `Không đọc được file: ${err.message}`,
        });
      }
    }
    setAttachedFiles((prev) => [...prev, ...results]);
    setIsReadingFile(false);
    e.target.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!input.trim() && attachedFiles.length === 0) || !apiKey) return;

    const userText = input.trim();
    const userParts = [];
    attachedFiles.forEach((f) => {
      if (f.type === "image") {
        userParts.push({ inlineData: { mimeType: f.mimeType, data: f.b64 } });
      } else if (f.type === "pdf") {
        userParts.push({
          inlineData: { mimeType: "application/pdf", data: f.b64 },
        });
      } else if (f.type === "text") {
        userParts.push({
          text: `
[File: ${f.name}]
${f.content}`,
        });
      } else if (f.type === "error") {
        userParts.push({
          text: `
[Lỗi đọc file ${f.name} trên trình duyệt]:
${f.content}`,
        });
      }
    });
    if (userText) userParts.push({ text: userText });

    const newHistory = [
      ...history,
      {
        role: "user",
        parts: userParts,
        fileNames: attachedFiles.map((f) => f.name),
      },
    ];
    setHistory(newHistory);
    setInput("");
    setAttachedFiles([]);
    setIsTyping(true);

    const dataSample = excelData ? excelData.slice(0, 2) : [];
    const systemInstruction =
      `Bạn là Trợ lý AI chuyên về Quản lý Dự án Đầu tư Xây dựng tại Việt Nam, tích hợp trong phần mềm SmartDoc Pro của đơn vị tư vấn QLDA.

NGUYÊN TẮC TRẢ LỜI:
- Ngắn gọn, súc tích — ưu tiên bullet points, không viết dài dòng thừa
- Chính xác pháp lý — chỉ trích dẫn văn bản còn hiệu lực, ghi rõ số hiệu
- Thực tiễn — trả lời theo góc độ người làm tư vấn QLDA, không học thuật
- Nếu không chắc chắn về hiệu lực văn bản → nói rõ "cần kiểm tra lại tại thuvienphapluat.vn"
- Không lặp lại câu hỏi, không nói "Dạ", không mở đầu bằng "Chào bạn" sau tin nhắn đầu tiên
- Không kết thúc bằng câu hỏi ngược lại trừ khi thực sự cần làm rõ thông tin

CHUYÊN MÔN ƯU TIÊN:
1. Căn cứ pháp lý: Luật XD 50/2014, Luật sửa đổi 62/2020, Luật Đấu thầu 22/2023, NĐ 15/2021, NĐ 24/2024, NĐ 37/2015, TT 79/2025/TT-BTC (thay TT 22/2024/TT-BKHĐT từ 04/8/2025)
2. Soạn thảo văn bản: tờ trình, quyết định, hợp đồng, biên bản, báo cáo QLDA
3. Quy trình đấu thầu qua mạng đấu thầu quốc gia (Bộ Tài chính quản lý từ 2025)
4. Điền biến SmartDoc: gợi ý nội dung cho các biến trong file Word đang mở

CONTEXT HIỆN TẠI:
- Biến trong file Word: ` +
      (tags && tags.length > 0 ? tags.join(", ") : "Chưa nạp file Word") +
      `
- Dữ liệu Excel mẫu: ` +
      (dataSample && dataSample.length > 0
        ? JSON.stringify(dataSample).slice(0, 800)
        : "Chưa nạp Excel") +
      `

Khi được hỏi về nội dung điền vào biến cụ thể → gợi ý nội dung mẫu phù hợp ngữ cảnh QLDA xây dựng VN.`;

    try {
      const data = await fetchGeminiWithBackoff(
        {
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: newHistory.map((h) => ({ role: h.role, parts: h.parts })),
        },
        apiKey.trim(),
        aiModel,
      );

      const aiResultText =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Không có phản hồi từ AI.";
      setHistory((prev) => [
        ...prev,
        { role: "model", parts: [{ text: aiResultText }] },
      ]);
    } catch (err) {
      setHistory((prev) => [
        ...prev,
        { role: "model", parts: [{ text: "❌ " + err.message }] },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const onConfirmExtract = () => {
    if (handleConfirmAiData) handleConfirmAiData();
    setHistory((prev) => [
      ...prev,
      {
        role: "model",
        parts: [{ text: "✅ Đã nạp thành công dữ liệu bóc tách vào form!" }],
      },
    ]);
    setMode("chat");
  };

  const formatText = (text) => {
    return text
      .replace(/\n\n/g, "<br/><br/>")
      .replace(/\n/g, "<br/>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end animate-fade-in">
      {isOpen && (
        <div
          className="relative mb-4 w-[400px] h-[580px] bg-[#0A0D14]/40 backdrop-blur-xl border border-indigo-500/50 rounded-2xl shadow-[0_0_40px_rgba(79,70,229,0.3)] flex flex-col overflow-hidden animate-fade-in ring-1 ring-white/10"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDraggingOver && (
            <div className="absolute inset-0 bg-indigo-900/90 z-[200] flex items-center justify-center border-2 border-dashed border-indigo-400 m-2 rounded-xl pointer-events-none transition-all">
              <span className="text-white font-bold text-lg pointer-events-none">
                Thả file vào đây để đính kèm
              </span>
            </div>
          )}
          <div className="bg-indigo-950/80 p-3 flex justify-between items-center border-b border-indigo-900/50 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="text-xl">✨</span>
              <div>
                <h3 className="text-[13px] leading-relaxed font-black text-indigo-300 uppercase tracking-wider">
                  Trợ lý AI SmartDoc
                </h3>
                <p className="text-[12px] font-medium tracking-wide font-medium tracking-wide text-indigo-200/60 font-medium">
                  Model:{" "}
                  {aiModel === "gemini-2.5-flash"
                    ? "Gemini 2.5 Flash"
                    : aiModel === "gemini-2.0-flash"
                      ? "Gemini 2.0 Flash"
                      : aiModel === "gemini-1.5-flash-001"
                        ? "Gemini 1.5 Flash"
                        : "Gemini 1.5 Pro"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                title="Cài đặt API Key"
              >
                ⚙️
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                title="Đóng cửa sổ"
              >
                ✖
              </button>
            </div>
          </div>

          {!showSettings && (
            <div className="flex p-1 bg-[#0A0D14]/40 backdrop-blur-xl border-b border-slate-700/50 shadow-lg shrink-0">
              <button
                onClick={() => setMode("chat")}
                className={`flex-1 py-1.5 text-[13px] leading-relaxed font-bold rounded-lg transition-all ${mode === "chat" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
              >
                💬 Hỏi đáp
              </button>
              <button
                onClick={() => setMode("extract")}
                className={`flex-1 py-1.5 text-[13px] leading-relaxed font-bold rounded-lg transition-all ${mode === "extract" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
              >
                📋 Bóc tách
              </button>
            </div>
          )}

          <div
            className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-[#0A0D14]/40 backdrop-blur-xl/50"
            style={{ scrollBehavior: "smooth" }}
          >
            {showSettings ? (
              <div className="bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg p-4 rounded-xl">
                <h4 className="text-sm font-bold text-white mb-2">
                  Cấu hình Trợ lý AI
                </h4>
                <p className="text-[12px] font-medium tracking-wide text-slate-400 mb-4 leading-relaxed">
                  Vui lòng nhập{" "}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    className="text-indigo-400 hover:underline"
                  >
                    Google Gemini API Key
                  </a>{" "}
                  của bạn.
                </p>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Nhập API Key bắt đầu bằng AIza..."
                  className="w-full bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700 text-[13px] leading-relaxed text-white px-3 py-2 rounded-lg outline-none focus:border-indigo-500 mb-3"
                />

                <label className="text-[12px] font-medium tracking-wide font-medium tracking-wide font-bold text-slate-400 block mb-1">
                  Chọn Mô hình:
                </label>
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700 text-[13px] leading-relaxed text-white px-3 py-2 rounded-lg outline-none focus:border-indigo-500 mb-4 cursor-pointer"
                >
                  <option value="gemini-2.5-flash">
                    Gemini 2.5 Flash (Mới nhất - khuyên dùng)
                  </option>
                  <option value="gemini-2.0-flash">
                    Gemini 2.0 Flash (Ổn định, ít lỗi quota)
                  </option>
                  <option value="gemini-1.5-flash-001">
                    Gemini 1.5 Flash (Tiết kiệm quota - 1500 req/ngày)
                  </option>
                  <option value="gemini-1.5-pro-001">
                    Gemini 1.5 Pro (Lập luận sâu - 50 req/ngày)
                  </option>
                </select>

                <button
                  onClick={handleSaveKey}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] backdrop-blur-sm border border-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.2)] text-white text-[12px] font-medium tracking-wide font-bold py-2 rounded-lg transition-all"
                >
                  Lưu cấu hình
                </button>
              </div>
            ) : mode === "chat" ? (
              <>
                {history.length === 0 && (
                  <div className="bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg p-3 rounded-xl rounded-tl-sm self-start max-w-[85%] text-[13px] leading-relaxed text-slate-300 leading-relaxed">
                    Xin chào! Tôi là Trợ lý AI pháp lý. Nếu gặp lỗi đầy bộ nhớ
                    (quota), bạn vui lòng ấn vào ⚙️ Cài đặt để đổi sang model
                    khác nhé!
                  </div>
                )}
                {history.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl text-[12px] font-medium tracking-wide leading-relaxed max-w-[85%] break-words ${msg.role === "user" ? "bg-indigo-600 text-white self-end rounded-tr-sm" : "bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg text-slate-300 self-start rounded-tl-sm"}`}
                  >
                    {msg.role === "user" &&
                      msg.fileNames &&
                      msg.fileNames.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1.5">
                          {msg.fileNames.map((fn, i) => (
                            <span
                              key={i}
                              className="bg-indigo-800/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/30"
                            >
                              📎 {fn.length > 20 ? fn.slice(0, 18) + "..." : fn}
                            </span>
                          ))}
                        </div>
                      )}
                    {msg.parts.map((p, pIdx) => {
                      if (p.text && !p.text.startsWith("\n[File:"))
                        return (
                          <div
                            key={pIdx}
                            dangerouslySetInnerHTML={{
                              __html: formatText(p.text),
                            }}
                          />
                        );
                      if (msg.role !== "user" && p.inlineData)
                        return (
                          <img
                            key={pIdx}
                            src={`data:${p.inlineData.mimeType};base64,${p.inlineData.data}`}
                            className="mt-2 rounded-lg max-h-32 object-contain"
                          />
                        );
                      return null;
                    })}
                  </div>
                ))}
                {isTyping && (
                  <div className="bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700/50 shadow-lg p-3 rounded-xl rounded-tl-sm self-start max-w-[85%] text-[12px] font-medium tracking-wide text-slate-400 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col h-full gap-3">
                <p className="text-[12px] font-medium tracking-wide font-medium tracking-wide text-slate-400 font-bold border-b border-slate-700/50 shadow-lg pb-2 shrink-0">
                  {activeTabMainApp === "batch"
                    ? "AI bóc tách điền vào các biến MÀ EXCEL KHÔNG CÓ."
                    : "Bóc tách tất cả biến đang có trước khi nạp vào Form chính."}
                </p>
                <textarea
                  value={aiText}
                  onChange={(e) => setAiText(e.target.value)}
                  placeholder="Dán văn bản cần bóc tách..."
                  className="w-full h-24 p-2 bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700 text-[13px] leading-relaxed text-white rounded-lg resize-none focus:outline-none focus:border-indigo-500 shrink-0"
                />
                <div className="flex items-center gap-2 shrink-0">
                  <label className="flex-1 flex items-center justify-center gap-2 bg-white/[0.03] backdrop-blur-md hover:bg-white/[0.06] backdrop-blur-lg px-3 py-2 rounded-xl cursor-pointer text-[13px] leading-relaxed font-bold text-slate-300 transition-all">
                    <span>📸</span>
                    <span className="truncate max-w-[150px]">
                      {aiImage ? aiImage.name : "Tải ảnh tài liệu (QĐ, HĐ...)"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <button
                  onClick={handleAiExtract}
                  disabled={aiLoading}
                  className="w-full shrink-0 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] backdrop-blur-sm border border-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.2)] text-white text-[12px] font-medium tracking-wide font-bold rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.4)] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 transition-all"
                >
                  {aiLoading ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>{" "}
                      Đang quét dữ liệu...
                    </>
                  ) : (
                    <>✨ Kích hoạt AI Bóc tách</>
                  )}
                </button>

                {aiExtractedData && (
                  <div className="flex-1 overflow-y-auto mt-2 border border-slate-700/50 shadow-lg rounded-xl bg-[#0A0D14]/40 backdrop-blur-xl flex flex-col shrink-0 min-h-[200px]">
                    <div className="p-2 border-b border-slate-700/50 shadow-lg bg-white/[0.03] backdrop-blur-md/80 text-[12px] font-medium tracking-wide font-medium tracking-wide font-bold text-indigo-300 flex justify-between items-center sticky top-0 z-10 backdrop-blur-sm">
                      <span>KIỂM DUYỆT TRƯỚC KHI NẠP</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            var all = {};
                            Object.keys(aiExtractedData).forEach(
                              (k) => (all[k] = true),
                            );
                            setAiSelectedFields(all);
                          }}
                          className="px-1.5 py-0.5 bg-white/[0.06] backdrop-blur-lg rounded hover:bg-slate-600 text-[9px] text-white"
                        >
                          Chọn tất
                        </button>
                        <button
                          onClick={() => setAiSelectedFields({})}
                          className="px-1.5 py-0.5 bg-white/[0.06] backdrop-blur-lg rounded hover:bg-slate-600 text-[9px] text-white"
                        >
                          Bỏ chọn
                        </button>
                      </div>
                    </div>
                    <div className="p-2 flex flex-col gap-2">
                      {Object.keys(aiExtractedData).map((key) => {
                        var aiVal = aiExtractedData[key];
                        var currentVal =
                          activeTabMainApp === "batch"
                            ? columnMapping && columnMapping[key]
                              ? columnMapping[key].value
                              : ""
                            : formData && formData[key]
                              ? formData[key]
                              : "";
                        var isSelected =
                          (aiSelectedFields && aiSelectedFields[key]) || false;
                        var hasChange = String(aiVal) !== String(currentVal);
                        return (
                          <div
                            key={key}
                            className={`border border-slate-700/50 shadow-lg p-2 rounded-lg transition-all ${isSelected ? "bg-indigo-950/30 border-indigo-500/50" : "opacity-60"}`}
                          >
                            <div className="flex items-center gap-2 mb-1.5">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() =>
                                  setAiSelectedFields((prev) => ({
                                    ...prev,
                                    [key]: !prev[key],
                                  }))
                                }
                                className="w-3.5 h-3.5 cursor-pointer accent-indigo-500"
                              />
                              <span className="font-mono font-bold text-[12px] font-medium tracking-wide text-indigo-300 break-all leading-tight">
                                {key}
                              </span>
                            </div>
                            <input
                              type="text"
                              value={aiVal}
                              onChange={(e) => {
                                var val = e.target.value;
                                setAiExtractedData((prev) => ({
                                  ...prev,
                                  [key]: val,
                                }));
                              }}
                              className={`w-full px-2 py-1 border rounded-md text-[12px] font-medium tracking-wide bg-[#0A0D14]/40 backdrop-blur-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 ${hasChange ? "border-emerald-800/80 text-emerald-400" : "border-slate-700/50 shadow-lg text-slate-400"}`}
                            />
                          </div>
                        );
                      })}
                    </div>
                    <div className="p-2 border-t border-slate-700/50 shadow-lg bg-[#0A0D14]/40 backdrop-blur-xl sticky bottom-0 z-10">
                      <button
                        onClick={onConfirmExtract}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[12px] font-medium tracking-wide font-bold rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] active:scale-95 transition-all text-center"
                      >
                        ✅ NẠP DỮ LIỆU ĐÃ CHỌN VÀO FORM
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {!showSettings && mode === "chat" && (
            <form
              onSubmit={handleSubmit}
              className="bg-[#0A0D14]/40 backdrop-blur-xl border-t border-slate-700/50 shadow-lg/80 flex flex-col pt-1"
            >
              <div className="px-3 pt-2 flex flex-col gap-1.5">
                {attachedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {attachedFiles.map((f, i) => (
                      <span
                        key={i}
                        className={`flex items-center gap-1 bg-indigo-950 border text-[9px] font-bold px-2 py-0.5 rounded-full ${f.type === "error" ? "border-red-800 text-red-300" : "border-indigo-800 text-indigo-300"}`}
                      >
                        {f.type === "image"
                          ? "🖼️"
                          : f.type === "pdf"
                            ? "📄"
                            : f.type === "error"
                              ? "⚠️"
                              : "📎"}{" "}
                        {f.name.length > 20
                          ? f.name.slice(0, 18) + "..."
                          : f.name}
                        <button
                          type="button"
                          onClick={() =>
                            setAttachedFiles((prev) =>
                              prev.filter((_, j) => j !== i),
                            )
                          }
                          className="ml-0.5 text-indigo-400 hover:text-red-400"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {isReadingFile && (
                  <p className="text-[9px] text-indigo-400 italic">
                    Đang đọc file...
                  </p>
                )}
              </div>
              <div className="flex gap-2 items-center p-2">
                <label
                  className="shrink-0 cursor-pointer p-2 hover:bg-white/[0.03] backdrop-blur-md rounded-xl transition-all text-slate-400 hover:text-indigo-400"
                  title="Đính kèm file"
                >
                  {isReadingFile ? (
                    <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>📎</span>
                  )}
                  <input
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.md,.json"
                    onChange={handleFileAttach}
                    className="hidden"
                    disabled={isReadingFile}
                  />
                </label>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Hỏi đáp hoặc thêm yêu cầu..."
                  className="flex-1 bg-[#0A0D14]/40 backdrop-blur-xl border border-slate-700 text-[13px] leading-relaxed text-white px-3 py-2 rounded-xl outline-none focus:border-indigo-500 transition-all placeholder-slate-500"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={
                    (!input.trim() && attachedFiles.length === 0) || isTyping
                  }
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] backdrop-blur-sm border border-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.2)] text-white p-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all transform hover:scale-105 active:scale-95 ${isOpen ? "bg-white/[0.03] backdrop-blur-md text-indigo-400 border border-indigo-500/30 ring-2 ring-indigo-500/20" : "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"}`}
      >
        {isOpen ? (
          <span className="text-xl">✖</span>
        ) : (
          <span className="text-xl">✨</span>
        )}
      </button>
    </div>
  );
}