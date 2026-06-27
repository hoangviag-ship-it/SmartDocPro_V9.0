// src/utils/variableUtils.js

// Function to infer variable type based on its name
export const inferVariableType = (tagName) => {
  const lowerTag = tagName.toLowerCase();
  
  if (lowerTag.includes("ngay") || lowerTag.includes("date") || lowerTag.includes("thang") || lowerTag.includes("nam")) {
    return "date";
  }
  if (lowerTag.includes("tien") || lowerTag.includes("gia") || lowerTag.includes("currency") || lowerTag.includes("phi") || lowerTag.includes("luong")) {
    return "currency";
  }
  if (lowerTag.includes("email")) {
    return "email";
  }
  if (lowerTag.includes("sdt") || lowerTag.includes("phone") || lowerTag.includes("dien_thoai")) {
    return "phone";
  }
  if (lowerTag.includes("so_") || lowerTag.includes("number") || lowerTag.includes("soluong")) {
    return "number";
  }
  
  return "text"; // Default fallback
};

// Function to find the canonical variable name from synonyms
// globalDictionary is the object containing all registered variables
export const resolveSynonym = (tagName, globalDictionary) => {
  if (!globalDictionary) return tagName;

  // Exact match
  if (globalDictionary[tagName]) return tagName;

  // Search through synonyms
  for (const [key, config] of Object.entries(globalDictionary)) {
    if (config.synonyms && Array.isArray(config.synonyms)) {
      if (config.synonyms.some(syn => syn.toLowerCase() === tagName.toLowerCase())) {
        return key; // Return the canonical name
      }
    }
  }

  return tagName; // Not found, keep original
};

export const formatCurrency = (value) => {
  if (!value) return "";
  const num = typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;
  if (isNaN(num)) return value;
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(num);
};

export const parseCurrency = (formattedValue) => {
  if (!formattedValue) return "";
  return formattedValue.toString().replace(/\./g, "").replace(/,/g, "");
};
