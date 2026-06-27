import React, { useState, useEffect } from "react";

export function validateTagName(newTag, existingTags = [], ignoreIndex = -1) {
  if (!newTag || !newTag.trim()) return "Tên biến không được để trống.";
  if (/\s/.test(newTag))
    return "Tên biến không được chứa dấu cách (khoảng trắng).";

  const diacriticsRegex =
    /[áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđ]/i;
  if (diacriticsRegex.test(newTag))
    return "Tên biến không được chứa dấu tiếng Việt.";

  const validFormat = /^[A-Z0-9_-]+$/i;
  if (!validFormat.test(newTag))
    return "Tên biến chỉ được chứa chữ cái, số, gạch dưới (_) và gạch ngang (-).";

  const formattedTag = newTag.trim().toUpperCase();

  // Check for duplicates
  const duplicateIndex = existingTags.findIndex((t, idx) => {
    if (idx === ignoreIndex) return false; // skip itself
    return t.trim().toUpperCase() === formattedTag;
  });

  if (duplicateIndex !== -1) {
    return "Tên biến này đã tồn tại.";
  }

  return "";
}
