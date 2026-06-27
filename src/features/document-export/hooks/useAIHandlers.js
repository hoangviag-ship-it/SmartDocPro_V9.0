import { useCallback } from 'react';
import { fetchGeminiWithBackoff } from '../utils/helpers';

export const useAIHandlers = ({
  setAiImage,
  setAiImageBase64,
  showToast,
  geminiApiKey,
  aiText,
  aiImageBase64,
  tags,
  activeTab,
  columnMapping,
  setAiLoading,
  setAiExtractedData,
  setAiSelectedFields,
  aiImage,
  aiExtractedData,
  aiSelectedFields,
  formData,
  setFormData,
  setAiImageModalOpen
}) => {

  const handleImageChange = useCallback((e) => {
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
  }, [setAiImage, setAiImageBase64, showToast]);

  const handleAiExtract = useCallback(async () => {
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
  }, [geminiApiKey, aiText, aiImageBase64, tags, activeTab, columnMapping, setAiLoading, aiImage, setAiExtractedData, setAiSelectedFields, showToast]);

  const handleConfirmAiData = useCallback(() => {
    if (!aiExtractedData) return;

    setFormData((prev) => {
      var next = { ...prev };
      Object.keys(aiExtractedData).forEach(function (key) {
        if (aiSelectedFields[key]) {
          next[key] = aiExtractedData[key];
        }
      });
      return next;
    });

    setAiImageModalOpen(false);
    showToast("Đã nhập dữ liệu AI vào Form!");
  }, [aiExtractedData, setFormData, aiSelectedFields, setAiImageModalOpen, showToast]);

  return {
    handleImageChange,
    handleAiExtract,
    handleConfirmAiData
  };
};
