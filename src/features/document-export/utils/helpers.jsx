import React, { useState } from 'react';
import { validateTagName } from "./tagUtils";

export const DB_NAME = "SmartDocEngineDB_V3";
export const STORE_NAME = "TemplateBuffers";
const memoryFallbackDB = new Map();

export function sanitizePath(str) {
  if (!str) return "";
  return String(str)
    .replace(/[/:*?"<>|\\[\]]/g, "_")
    .trim();
}

export function getCleanTextFromZip(zip) {
  let text = "";
  var docXml = zip.file("word/document.xml");
  if (docXml) {
    text += docXml.asText() + "\n";
  }
  var sharedStrings = zip.file("xl/sharedStrings.xml");
  if (sharedStrings) {
    text += sharedStrings.asText() + "\n";
  }
  let i = 1;
  while (true) {
    let sheet = zip.file("xl/worksheets/sheet" + i + ".xml");
    if (!sheet) break;
    text += sheet.asText() + "\n";
    i++;
  }
  return text;
}

export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveBufferToDB(id, buffer) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(buffer, id);
      transaction.oncomplete = () => { db.close(); resolve(); };
      transaction.onerror = () => { db.close(); reject(transaction.error); };
    });
  } catch (err) {
    console.warn("IndexedDB save failed, using fallback:", err);
    memoryFallbackDB.set(id, buffer);
    return Promise.resolve();
  }
}

export async function getBufferFromDB(id) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);
      let result = null;
      request.onsuccess = () => { result = request.result; };
      transaction.oncomplete = () => { db.close(); resolve(result); };
      transaction.onerror = () => { db.close(); reject(transaction.error); };
    });
  } catch (err) {
    console.warn("IndexedDB get failed, using fallback:", err);
    return Promise.resolve(memoryFallbackDB.get(id));
  }
}

export async function deleteBufferFromDB(id) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      transaction.oncomplete = () => { db.close(); resolve(); };
      transaction.onerror = () => { db.close(); reject(transaction.error); };
    });
  } catch (err) {
    console.warn("IndexedDB delete failed, using fallback:", err);
    memoryFallbackDB.delete(id);
    return Promise.resolve();
  }
}

export async function clearAllBuffersFromDB() {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();
      transaction.oncomplete = () => { db.close(); resolve(); };
      transaction.onerror = () => { db.close(); reject(transaction.error); };
    });
  } catch (e) {
    memoryFallbackDB.clear();
    return Promise.resolve();
  }
}


export function safeDeepClone(obj) {
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(obj);
    } catch (e) {
      console.warn("structuredClone failed, falling back to manual deep clone", e);
    }
  }
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof ArrayBuffer) return obj.slice(0);
  if (Array.isArray(obj)) return obj.map(safeDeepClone);
  const cloned = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = safeDeepClone(obj[key]);
    }
  }
  return cloned;
}

export function base64ToBuffer(base64) {
  var binary_string = window.atob(base64);
  var bytes = new Uint8Array(binary_string.length);
  for (var i = 0; i < binary_string.length; i++)
    bytes[i] = binary_string.charCodeAt(i);
  return bytes.buffer;
}

export function safeFormatNumber(val, isForce = false) {
  if (val === undefined || val === null) return "";
  var strVal = String(val).trim();
  if (strVal === "") return strVal;

  if (!isForce) {
    if (strVal.includes("\t") || strVal.includes("\n")) return strVal;
    if (/[a-zA-ZÀ-ỹ]/.test(strVal)) return strVal;
    if (/^0/.test(strVal) && strVal.length > 1 && !strVal.startsWith("0."))
      return strVal;
    if (/^(19|20)\d{2}$/.test(strVal)) return strVal;
    if (
      strVal.includes("/") ||
      (strVal.includes("-") && strVal.indexOf("-") > 0)
    )
      return strVal;
  }

  var isNegative = strVal.startsWith("-");
  var cleanNum = strVal.replace(/[-,.\s]/g, "");
  if (/^\d+$/.test(cleanNum)) {
    try {
      var formatted = BigInt(cleanNum).toLocaleString("vi-VN");
      return isNegative ? "-" + formatted : formatted;
    } catch (e) { console.warn("Lỗi format số:", e); }
  }
  return strVal;
}

export function soThanhChu(soInput) {
  var str = String(soInput).trim();
  var isNegative = str.startsWith("-");
  var n = str.replace(/[-,.\s]/g, "").trim();
  if (!/^\d+$/.test(n)) return soInput;

  var num;
  try {
    num = BigInt(n);
  } catch (e) {
    return soInput;
  }
  if (num === 0n) return "Không đồng";

  var dv = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
  var hang = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ", "tỷ tỷ"];

  function docNhom(g, fullZero) {
    var h = Math.floor(g / 100),
      ch = Math.floor((g % 100) / 10),
      dvi = g % 10;
    var s = "";
    if (h > 0) s += dv[h] + " trăm ";
    else if (fullZero) s += "không trăm ";

    if (ch === 0 && dvi > 0 && (h > 0 || fullZero)) s += "lẻ ";
    else if (ch === 1) s += "mười ";
    else if (ch > 1) s += dv[ch] + " mươi ";

    if (dvi === 1 && ch > 1) s += "mốt ";
    else if (dvi === 5 && ch > 0) s += "lăm ";
    else if (dvi > 0) s += dv[dvi] + " ";
    return s.trim();
  }

  var groups = [];
  var tmp = num;
  while (tmp > 0n) {
    groups.unshift(Number(tmp % 1000n));
    tmp = tmp / 1000n;
  }

  var result = "";
  var hasRead = false;
  for (var i = 0; i < groups.length; i++) {
    var g = groups[i];
    var suffix = hang[groups.length - 1 - i] || "";

    if (g > 0) {
      var needsZeroPrefix = hasRead;
      result +=
        docNhom(g, needsZeroPrefix) + (suffix ? " " + suffix : "") + " ";
      hasRead = true;
    } else if (suffix === "tỷ" && hasRead) {
      result += suffix + " ";
    }
  }

  var prefix = isNegative ? "Âm " : "";
  var finalStr = result.trim().replace(/\s+/g, " ");
  if (!finalStr) return "Không đồng";
  if (isNegative) {
    finalStr = finalStr.charAt(0).toLowerCase() + finalStr.slice(1);
  } else {
    finalStr = finalStr.charAt(0).toUpperCase() + finalStr.slice(1);
  }
  return prefix + finalStr + " đồng";
}

export function removeVietnameseTones(str) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  return str;
}

export function normalizeKey(key) {
  if (!key) return "";
  return removeVietnameseTones(String(key))
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function levenshtein(s1, s2) {
  var m = s1.length;
  var n = s2.length;
  var d = [];
  for (var i = 0; i <= m; i++) {
    d[i] = [i];
  }
  for (var j = 0; j <= n; j++) {
    d[0][j] = j;
  }
  for (i = 1; i <= m; i++) {
    for (j = 1; j <= n; j++) {
      var cost = s1.charAt(i - 1) === s2.charAt(j - 1) ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost, // substitution
      );
    }
  }
  return d[m][n];
}

export function calculateVietnameseMatchScore(tag, colName) {
  if (!tag || !colName) return 0;

  var cleanTag = String(tag)
    .trim()
    .toLowerCase()
    .replace(/^\{\{|\}\}$|^<<|>>$/g, "");
  var cleanCol = String(colName).trim().toLowerCase();

  if (cleanTag === cleanCol) return 1.0;

  var normTag = normalizeKey(cleanTag);
  var normCol = normalizeKey(cleanCol);
  if (normTag === normCol) return 0.98;

  var synonyms = {
    hoten: [
      "ho va ten",
      "ho ten",
      "ten",
      "nhan su",
      "nguoi thuc hien",
      "ho ten khach hang",
      "ho ten nv",
    ],
    hovaten: [
      "ho va ten",
      "ho ten",
      "ten",
      "nhan su",
      "nguoi thuc hien",
      "ho ten khach hang",
      "ho ten nv",
    ],
    diachi: [
      "dia chi",
      "noi o",
      "dia chi lien he",
      "dia chi thuong tru",
      "noi cu tru",
      "ho khau",
    ],
    sdt: [
      "so dien thoai",
      "dien thoai",
      "sdt",
      "so dt",
      "phone",
      "di dong",
      "so dien thoai lien he",
    ],
    dienthoai: [
      "so dien thoai",
      "dien thoai",
      "sdt",
      "so dt",
      "phone",
      "di dong",
      "so dien thoai lien he",
    ],
    didong: [
      "so dien thoai",
      "dien thoai",
      "sdt",
      "so dt",
      "phone",
      "di dong",
      "so dien thoai lien he",
    ],
    ngaysinh: ["ngay sinh", "nam sinh", "ngay thang nam sinh"],
    chucvu: ["chuc vu", "vai tro", "chuc danh", "vi tri"],
    tenduan: ["ten du an", "ma du an", "du an", "ten cong trinh"],
    sohd: ["so hop dong", "so hd", "hop dong so"],
    sohopdong: ["so hop dong", "so hd", "hop dong so"],
    mst: ["ma so thue", "mst"],
    giamdoc: [
      "giam doc",
      "chu dau tu",
      "cdt",
      "dai dien",
      "dai dien phap luat",
    ],
    nhathau: ["nha thau", "don vi thi cong", "nha thau thi cong"],
  };

  var matchingSynonymSet = null;
  for (var key in synonyms) {
    if (normTag.indexOf(key) !== -1 || key.indexOf(normTag) !== -1) {
      matchingSynonymSet = synonyms[key];
      break;
    }
  }

  if (matchingSynonymSet) {
    for (var i = 0; i < matchingSynonymSet.length; i++) {
      var syn = matchingSynonymSet[i];
      if (normCol === normalizeKey(syn)) return 0.95;
      if (normCol.indexOf(normalizeKey(syn)) !== -1) return 0.9;
    }
  }

  if (normTag.length > 2 && normCol.indexOf(normTag) !== -1) {
    return 0.85;
  }
  if (normCol.length > 2 && normTag.indexOf(normCol) !== -1) {
    return 0.8;
  }

  var wordsTag = normTag.match(/[a-z0-9]+/g) || [];
  if (wordsTag.length === 0) {
    var splitUnder = normTag.split("_");
    if (splitUnder.length > 1) wordsTag = splitUnder;
    else wordsTag = [normTag];
  }

  var tokensCol =
    removeVietnameseTones(cleanCol)
      .toLowerCase()
      .match(/[a-z0-9]+/g) || [];
  if (wordsTag.length > 0 && tokensCol.length > 0) {
    var intersect = wordsTag.filter(function (w) {
      return tokensCol.indexOf(w) !== -1;
    });
    var jaccard =
      intersect.length /
      (wordsTag.length + tokensCol.length - intersect.length);
    if (jaccard > 0.4) {
      return 0.5 + jaccard * 0.3;
    }
  }

  var s1 = normTag;
  var s2 = normCol;
  var maxLen = Math.max(s1.length, s2.length);
  if (maxLen > 0) {
    var dist = levenshtein(s1, s2);
    var levScore = 1 - dist / maxLen;
    if (levScore > 0.5) return levScore * 0.7;
  }

  return 0;
}

export function stripXmlTags(xmlText) {
  if (!xmlText) return "";
  var text = xmlText.replace(/<w:proofErr[^>]*>/gi, "");
  return text.replace(/<[^>]+>/g, "").trim();
}

export function escapeXml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildWordTableXml(tsvData, existingRPr, isStriped) {
  // TSV parser that handles double-quoted cells containing newlines
  var rows = [];
  var currentRow = [];
  var currentCell = "";
  var inQuotes = false;
  var str = String(tsvData);

  for (var i = 0; i < str.length; i++) {
    var c = str[i];
    var nextC = str[i + 1];
    if (c === '"') {
      if (inQuotes && nextC === '"') {
        currentCell += '"'; // escaped quote
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === "\t" && !inQuotes) {
      currentRow.push(currentCell);
      currentCell = "";
    } else if (c === "\n" && !inQuotes) {
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = "";
    } else if (c === "\r" && !inQuotes) {
      // ignore \r before
    } else {
      currentCell += c;
    }
  }
  if (currentCell !== "" || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }

  // Filter out fully empty rows
  rows = rows.filter(function (r) {
    return r.some(function (c) {
      return c.trim() !== "";
    });
  });
  if (rows.length === 0) return "";

  var colCount = rows[0].length;
  var gridXml = "<w:tblGrid>";
  for (c = 0; c < colCount; c++)
    gridXml += '<w:gridCol w:w="' + Math.floor(5000 / colCount) + '"/>';
  gridXml += "</w:tblGrid>";
  var xml =
    '<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="0" w:type="auto"/><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/></w:tblBorders></w:tblPr>' +
    gridXml;

  for (i = 0; i < rows.length; i++) {
    xml += "<w:tr>";
    var cols = rows[i];
    var shdXml =
      isStriped && i > 0 && i % 2 === 0
        ? '<w:shd w:val="clear" w:color="auto" w:fill="F2F2F2"/>'
        : "";
    for (var j = 0; j < cols.length; j++) {
      // Cell text might have multiple lines due to in-cell newlines
      var rawLines = (cols[j] || "").split(/\r?\n/);
      var cellContentXml = "";
      var boldTag = i === 0 ? "<w:b/>" : "";
      var jcTag = i === 0 ? '<w:jc w:val="center"/>' : '<w:jc w:val="both"/>';
      var fillRPr = (existingRPr || "").replace(
        /<\/w:rPr>/,
        boldTag + "</w:rPr>",
      );
      if (!fillRPr && boldTag) fillRPr = "<w:rPr>" + boldTag + "</w:rPr>";

      for (var L = 0; L < rawLines.length; L++) {
        var cellText = escapeXml(rawLines[L].trim());
        if (L > 0) cellContentXml += "<w:br/>";
        cellContentXml += "<w:t>" + cellText + "</w:t>";
      }

      var tcPr =
        '<w:tcPr><w:tcW w:w="0" w:type="auto"/>' +
        shdXml +
        '<w:vAlign w:val="center"/></w:tcPr>';
      xml +=
        "<w:tc>" +
        tcPr +
        '<w:p><w:pPr><w:spacing w:before="60" w:after="60"/>' +
        jcTag +
        "</w:pPr><w:r>" +
        fillRPr +
        cellContentXml +
        "</w:r></w:p></w:tc>";
    }
    xml += "</w:tr>";
  }
  xml += "</w:tbl>";
  return xml;
}

const isSystemDateTag = function (baseTag) {
  const u = baseTag.toUpperCase();
  return (
    u.startsWith("TODAY") ||
    u === "FIRSTDAY_OF_MONTH" ||
    u === "LASTDAY_OF_MONTH"
  );
};

const processSystemDateTag = function (baseTag) {
  const u = baseTag.toUpperCase();
  let d = new Date();

  if (u.startsWith("TODAY+") || u.startsWith("TODAY-")) {
    let modifier = u.replace("TODAY", "");
    let days = parseInt(modifier);
    if (!isNaN(days)) {
      d.setDate(d.getDate() + days);
    }
  } else if (u === "FIRSTDAY_OF_MONTH") {
    d = new Date(d.getFullYear(), d.getMonth(), 1);
  } else if (u === "LASTDAY_OF_MONTH") {
    d = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  }

  return (
    "ngày " +
    String(d.getDate()).padStart(2, "0") +
    " tháng " +
    String(d.getMonth() + 1).padStart(2, "0") +
    " năm " +
    d.getFullYear()
  );
};

export function extractAllTags(rawXmlText) {
  var cleanText = stripXmlTags(rawXmlText);
  cleanText = cleanText
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
  var foundTags = [];

  var delimiterConfigs = [
    {
      type: "double_angle",
      start: "<<",
      end: ">>",
      regex: /<<([^<>\n\r]{1,80})>>/g,
    },
    {
      type: "double_curly",
      start: "{{",
      end: "}}",
      regex: /\{\{([^{}\n\r]{1,80})\}\}/g,
    },
    {
      type: "double_square",
      start: "[[",
      end: "]]",
      regex: /\[\[([^[\]\n\r]{1,80})\]\]/g,
    },
  ];

  var allMatches = [];
  delimiterConfigs.forEach(function (config) {
    var match;
    config.regex.lastIndex = 0;
    while ((match = config.regex.exec(cleanText)) !== null) {
      allMatches.push({ match, config, index: match.index });
    }
  });

  allMatches.sort((a, b) => a.index - b.index);

  allMatches.forEach(function (item) {
    var match = item.match;
    var config = item.config;
    var rawTagName = match[1].trim(); // Preserve spaces for both mapping and replacement
    var originalRawTagName = match[1].trim(); // Same here

    if (
      rawTagName === "" ||
      rawTagName.indexOf("<") !== -1 ||
      rawTagName.indexOf(">") !== -1
    )
      return;
    if (
      rawTagName.toUpperCase().startsWith("IF(") ||
      rawTagName.toUpperCase() === "ENDIF"
    )
      return;

    var isLegalText = false;
    if (config.type === "double_square") {
      if (match[1].split(/\s+/).length > 5) {
        isLegalText = true;
      }
      if (/^[a-z]/.test(rawTagName) && !/^[A-Z_0-9]/.test(rawTagName)) {
        isLegalText = true;
      }
      if (/[,;:!?]/.test(rawTagName)) {
        isLegalText = true;
      }
    }

    if (!isLegalText) {
      var baseTagName = rawTagName.replace(
        /(_UPPER|_LOWER|_TABLE_STRIPED|_TABLE|_VIET|_VIỆT|_VIÊT|_MONEY)[\s\u200B-\u200D\uFEFF]*$/gi,
        "",
      );
      if (
        baseTagName.toUpperCase().startsWith("CHECK_X_") ||
        baseTagName.toUpperCase().startsWith("CHECK_O_")
      ) {
        baseTagName = baseTagName.substring(8);
      }

      if (!isSystemDateTag(baseTagName)) {
        foundTags.push({
          name: baseTagName,
          original: originalRawTagName,
          type: config.type,
          isSystem: false,
        });
      } else {
        foundTags.push({
          name: baseTagName,
          original: originalRawTagName,
          type: config.type,
          isSystem: true,
        });
      }
    }
  });

  var uniqueBaseTags = [];
  var uniqueRawTags = [];
  var tagToTypeMap = {};
  foundTags.forEach(function (t) {
    if (!t.isSystem && uniqueBaseTags.indexOf(t.name) === -1)
      uniqueBaseTags.push(t.name);
    if (uniqueRawTags.indexOf(t.original) === -1)
      uniqueRawTags.push(t.original);
    if (!t.isSystem && !tagToTypeMap[t.name]) tagToTypeMap[t.name] = t.type;
  });
  var detectedConfigs = delimiterConfigs.filter(function (cfg) {
    return foundTags.some(function (t) {
      return t.type === cfg.type;
    });
  });
  return {
    uniqueTagNames: uniqueBaseTags,
    uniqueRawTags: uniqueRawTags,
    tagToTypeMap: tagToTypeMap,
    detectedConfigs: detectedConfigs,
  };
}

export function getBaseTag(rt) {
  if (!rt) return "";
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
  return base;
}

export function calculateFinalValueForTag(rawTag, valMap, globalDict = {}) {
  var upperTag = String(rawTag).toUpperCase();
  var baseTag = getBaseTag(rawTag);
  var cleanBaseTag = baseTag.replace(/\s+/g, "");

  var isTableTag =
    upperTag.endsWith("_TABLE") ||
    upperTag.endsWith("_TABLE_STRIPED") ||
    globalDict[cleanBaseTag]?.type === "table" ||
    globalDict[rawTag.replace(/\s+/g, "")]?.type === "table";
  var isCheckX =
    upperTag.startsWith("CHECK_X_") ||
    globalDict[cleanBaseTag]?.type === "condition" ||
    globalDict[rawTag.replace(/\s+/g, "")]?.type === "condition";
  var isCheckO = upperTag.startsWith("CHECK_O_");

  var val;
  if (isSystemDateTag(cleanBaseTag)) {
    val = processSystemDateTag(cleanBaseTag);
  } else {
    val = valMap[baseTag] !== undefined ? valMap[baseTag] : valMap[cleanBaseTag];
  }

  if (val === undefined || val === null) return { value: "", isTable: false };

  var finalVal = String(val);
  if (finalVal !== "" && !isSystemDateTag(cleanBaseTag)) {
    if (upperTag.endsWith("_UPPER")) finalVal = finalVal.toUpperCase();
    else if (upperTag.endsWith("_LOWER")) finalVal = finalVal.toLowerCase();
    else if (upperTag.match(/(_VIET|_VIỆT|_VIÊT)[\s\u200B-\u200D\uFEFF]*$/i)) finalVal = soThanhChu(finalVal);
    else if (upperTag.endsWith("_MONEY"))
      finalVal = safeFormatNumber(finalVal, true);
    else if (!isCheckX && !isCheckO && !isTableTag)
      finalVal = safeFormatNumber(finalVal);
  }

  if (isCheckX || isCheckO) {
    var isCheckedCondition = [
      "1",
      "có",
      "co",
      "yes",
      "true",
      "x",
      "x ",
    ].includes(finalVal.toLowerCase().trim());
    if (isCheckX) {
      finalVal = isCheckedCondition ? "☑" : "☐";
    } else if (isCheckO) {
      finalVal = isCheckedCondition ? "☐" : "☑";
    }
  }
  return {
    value: finalVal,
    isTable: isTableTag,
    isStriped: upperTag.endsWith("_TABLE_STRIPED"),
  };
}

export function escapeXmlText(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function unescapeXmlText(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

export function splitXmlAndTexts(xmlText) {
  var regex = /<w:t([^>]*)>([\s\S]*?)<\/w:t>/g;
  var parts = [];
  var lastIndex = 0;
  var match;
  while ((match = regex.exec(xmlText)) !== null) {
    parts.push({
      type: "static",
      content: xmlText.substring(lastIndex, match.index),
    });
    parts.push({
      type: "text",
      attr: match[1],
      content: unescapeXmlText(match[2]),
    });
    lastIndex = regex.lastIndex;
  }
  parts.push({
    type: "static",
    content: xmlText.substring(lastIndex),
  });
  return parts;
}

export function joinPartsToXml(parts) {
  return parts
    .map((p) => {
      if (p.type === "static") {
        return p.content;
      } else {
        return `<w:t${p.attr}>${escapeXmlText(p.content)}</w:t>`;
      }
    })
    .join("");
}

export async function replaceTagsInXml(
  zip,
  valMap,
  isHighlight,
  rawTagsList = [],
  cleanUnusedTags = false,
  globalDict = {},
) {
  let missingFromXml = new Set();
  var buildRegex = function (str) {
    var chars = str.split("").map(function (c) {
      return c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    });
    // LỖI CŨ: "(?:<[^>]+>|\\s|&[a-zA-Z0-9#]+;)*" gây ra Backtracking cực độ
    // GIẢI PHÁP: Chỉ cho phép các thẻ XML hoặc khoảng trắng xen giữa ký tự của biến
    return new RegExp(chars.join("(?:<[^>]+>|\\s)*"), "gi");
  };

  // Xóa <w:r> rỗng còn sót sau khi xóa text của tag không dùng.
  // Chỉ xóa run không còn nội dung thực (chỉ có rPr và/hoặc w:t rỗng).
  // Giữ lại run có drawing, fldChar, tab, br hoặc nội dung khác.
  var removeEmptyRuns = function(xml) {
    return xml.replace(/<w:r\b[^>]*>[\s\S]*?<\/w:r>/g, function(run) {
      var openTagEnd = run.indexOf('>');
      var inner = run.slice(openTagEnd + 1, run.lastIndexOf('</w:r>'));
      var stripped = inner
        .replace(/<w:rPr\b[\s\S]*?<\/w:rPr>/g, '')
        .replace(/<w:t\b[^>]*>\s*<\/w:t>/g, '')
        .replace(/<w:t\b[^>]*\/>/g, '');
      return stripped.trim() ? run : '';
    });
  };

  var paths = [];
  for (var path in zip.files) if (path.endsWith(".xml")) paths.push(path);

  for (var i = 0; i < paths.length; i++) {
    path = paths[i];
    var content = zip.file(path).asText();
    if (!content) continue;

    const ifRegex =
      /(?:<[^>]+>|\s)*(?:&lt;&lt;|\{\{|\[\[)(?:<[^>]+>|\s)*I(?:<[^>]+>|\s)*F(?:<[^>]+>|\s)*\((.*?)\)(?:<[^>]+>|\s)*(?:&gt;&gt;|\}\}|\]\])([\s\S]*?)(?:<[^>]+>|\s)*(?:&lt;&lt;|\{\{|\[\[)(?:<[^>]+>|\s)*E(?:<[^>]+>|\s)*N(?:<[^>]+>|\s)*D(?:<[^>]+>|\s)*I(?:<[^>]+>|\s)*F(?:<[^>]+>|\s)*(?:&gt;&gt;|\}\}|\]\])/gi;
    content = content.replace(
      ifRegex,
      function (match, rawCondition, innerContent) {
        var condition = stripXmlTags(rawCondition).trim();
        condition = condition.replace(/&quot;|”|“|"/g, "");
        var parts = condition.split(/(==|!=)/);
        if (parts.length === 3) {
          var varName = parts[0].trim();
          var operator = parts[1].trim();
          var targetValue = parts[2].trim();
          var actualValue = String(valMap[varName] || "").trim();

          var isTrue = false;
          if (operator === "==")
            isTrue = actualValue.toLowerCase() === targetValue.toLowerCase();
          if (operator === "!=")
            isTrue = actualValue.toLowerCase() !== targetValue.toLowerCase();

          if (isTrue) return innerContent;
          else return "";
        }
        return match;
      },
    );

    var currentPhysicalTags = [];
    try {
      var parsedCurrent = extractAllTags(content);
      currentPhysicalTags = parsedCurrent.uniqueRawTags || [];
    } catch (e) {
      console.error("Lỗi trích xuất tag tại XML", e);
    }

    // LỖI HIỆU SUẤT TRƯỚC ĐÂY: Quét toàn bộ rawTagsList kể cả tag không có trong XML 
    // => Gây lỗi "Catastrophic Backtracking" của RegExp (Treo máy 10 phút khi nén file).
    // GIẢI PHÁP: Chỉ quét các tag có TỒN TẠI VẬT LÝ trong file XML hiện tại.
    var tagsToProcess = currentPhysicalTags || [];

    var delimiters = [
      { start: "&lt;&lt;", end: "&gt;&gt;" },
      { start: "{{", end: "}}" },
      { start: "[[", end: "]]" },
    ];

    if (tagsToProcess.length === 0) {
      try {
        var parsedRemainingZero = extractAllTags(content);
        var remainingPhysicalZero = parsedRemainingZero.uniqueRawTags || [];
        if (cleanUnusedTags && remainingPhysicalZero.length > 0) {
          remainingPhysicalZero.forEach(function (tg) {
            for (const delim of delimiters) {
              const tagStr = delim.start + tg + delim.end;
              const regex = buildRegex(tagStr);
              content = content.replace(regex, function (match) {
                return (match.match(/<[^>]+>/g) || []).join("");
              });
            }
          });
        } else if (!cleanUnusedTags) {
          remainingPhysicalZero.forEach(function (tg) {
            if (!tg.includes(" ")) missingFromXml.add(tg);
          });
        }
      } catch (e) { console.warn("Lỗi xử lý nội dung file trong zip:", e); }
      content = removeEmptyRuns(content);
      zip.file(path, content);
      continue;
    }

    for (var j = 0; j < tagsToProcess.length; j++) {
      var rawTag = tagsToProcess[j];
      var calculated = calculateFinalValueForTag(rawTag, valMap, globalDict);

      var isTagDeleted = false;
      if (rawTagsList && rawTagsList.length > 0) {
        var baseOfRaw = getBaseTag(rawTag);
        var isFoundInActive = rawTagsList.some(function (activeRaw) {
          return activeRaw === rawTag || getBaseTag(activeRaw) === baseOfRaw;
        });
        if (!isFoundInActive) {
          isTagDeleted = true;
        }
      }

      if (calculated.value === "") {
        if (cleanUnusedTags || isTagDeleted) {
          for (const delim of delimiters) {
            const tagStr = delim.start + rawTag + delim.end;
            const regex = buildRegex(tagStr);
            content = content.replace(regex, function (match) {
              return (match.match(/<[^>]+>/g) || []).join("");
            });
          }
        }
        continue;
      }

      for (const delim of delimiters) {
        const tagStr = delim.start + rawTag + delim.end;
        const regex = buildRegex(tagStr);

        content = content.replace(regex, function (match, offset, fullString) {
          if (path.startsWith("xl/")) {
            let newStr = "";
            let replaced = false;
            let parts = match.split(/(<[^>]+>)/);
            for (let p of parts) {
              if (p.startsWith("<")) {
                newStr += p;
              } else if (p.length > 0) {
                if (!replaced) {
                  newStr += escapeXml(calculated.value).replace(
                    /\r?\n/g,
                    "&#10;",
                  );
                  replaced = true;
                }
              }
            }
            return newStr;
          }

          var stringBefore = fullString.substring(0, offset);
          var lastRunOpenIdx = Math.max(
            stringBefore.lastIndexOf("<w:r>"),
            stringBefore.lastIndexOf("<w:r "),
          );
          var lastRunCloseIdx = stringBefore.lastIndexOf("</w:r>");
          var existingRPr = "";

          if (lastRunOpenIdx !== -1 && lastRunOpenIdx > lastRunCloseIdx) {
            var runChunk = stringBefore.substring(
              lastRunOpenIdx,
              offset + match.length + 300,
            );
            var rPrMatch = runChunk.match(
              /<w:rPr(?:>|\s[^>]*>)[\s\S]*?<\/w:rPr>/,
            );
            if (rPrMatch) existingRPr = rPrMatch[0];
          }

          var lastPOpenIdx = Math.max(
            stringBefore.lastIndexOf("<w:p>"),
            stringBefore.lastIndexOf("<w:p "),
          );
          var lastPCloseIdx = stringBefore.lastIndexOf("</w:p>");
          var existingPPr = "";
          if (lastPOpenIdx !== -1 && lastPOpenIdx > lastPCloseIdx) {
            var pChunk = stringBefore.substring(
              lastPOpenIdx,
              offset + match.length + 500,
            );
            var pPrMatch = pChunk.match(
              /<w:pPr(?:>|\s[^>]*>)[\s\S]*?<\/w:pPr>/,
            );
            if (pPrMatch) existingPPr = pPrMatch[0];
          }

          if (calculated.isTable) {
            var tableXml = buildWordTableXml(
              calculated.value,
              existingRPr || "",
              calculated.isStriped,
            );
            var pOpen = stringBefore.lastIndexOf("<w:p>");
            var pOpen2 = stringBefore.lastIndexOf("<w:p ");
            var pStart = Math.max(pOpen, pOpen2);

            if (pStart !== -1) {
              return "</w:t></w:r></w:p>" + tableXml + "<w:p><w:r><w:t>";
            }
            return tableXml;
          }

          var hlRPr = existingRPr;
          if (isHighlight) {
            if (hlRPr) {
              if (hlRPr.includes("<w:highlight"))
                hlRPr = hlRPr.replace(
                  /<w:highlight[^>]*\/>/g,
                  '<w:highlight w:val="yellow"/>',
                );
              else
                hlRPr = hlRPr.replace(
                  /<\/w:rPr>/i,
                  '<w:highlight w:val="yellow"/></w:rPr>',
                );
            } else {
              hlRPr = '<w:rPr><w:highlight w:val="yellow"/></w:rPr>';
            }
          }

          var lines = calculated.value.split(/\r?\n/);
          if (lines.length > 1) {
            var textNodes = lines
              .map(function (line) {
                return (
                  '<w:t xml:space="preserve">' + escapeXml(line) + "</w:t>"
                );
              })
              .join(
                "</w:r></w:p><w:p>" + (existingPPr || "") + "<w:r>" + hlRPr,
              );
            return (
              "</w:t></w:r><w:r>" +
              hlRPr +
              textNodes +
              "</w:r><w:r>" +
              (existingRPr || "") +
              '<w:t xml:space="preserve">'
            );
          } else {
            return (
              "</w:t></w:r><w:r>" +
              hlRPr +
              '<w:t xml:space="preserve">' +
              escapeXml(calculated.value) +
              "</w:t></w:r><w:r>" +
              (existingRPr || "") +
              '<w:t xml:space="preserve">'
            );
          }
        });
      }
    }

    try {
      var parsedRemaining = extractAllTags(content);
      var remainingPhysical = parsedRemaining.uniqueRawTags || [];
      if (cleanUnusedTags && remainingPhysical.length > 0) {
        remainingPhysical.forEach(function (tg) {
          for (const delim of delimiters) {
            const tagStr = delim.start + tg + delim.end;
            const regex = buildRegex(tagStr);
            content = content.replace(regex, function (m) {
              return (m.match(/<[^>]+>/g) || []).join("");
            });
          }
        });
      } else if (!cleanUnusedTags) {
        remainingPhysical.forEach(function (tg) {
          if (!tg.includes(" ")) missingFromXml.add(tg);
        });
      }
    } catch (e) {
      console.error("Lỗi trích xuất tag còn sót", e);
    }

    content = removeEmptyRuns(content);
    zip.file(path, content);
  }
  return Array.from(missingFromXml);
}

export const SOURCE_COLORS = ["indigo", "emerald", "amber", "rose", "cyan", "fuchsia"];

export const COLOR_CLASSES = {
  indigo: "bg-indigo-950 border-indigo-800 text-indigo-400",
  emerald: "bg-emerald-950 border-emerald-800 text-emerald-400",
  amber: "bg-amber-950 border-amber-800 text-amber-400",
  rose: "bg-rose-950 border-rose-800 text-rose-400",
  cyan: "bg-cyan-950 border-cyan-800 text-cyan-400",
  fuchsia: "bg-fuchsia-950 border-fuchsia-800 text-fuchsia-400",
};

export function getSelectorClasses(color, isChecked) {
  if (!isChecked)
    return {
      bg: "bg-[#0A0D14] text-slate-400 border-white/5 hover:bg-white/[0.03] backdrop-blur-md",
      check: "bg-[#0A0D14] border-white/10",
      text: "text-slate-500",
    };
  switch (color) {
    case "indigo":
      return {
        bg: "bg-indigo-600 text-white border-indigo-500",
        check: "bg-white text-indigo-600 border-white",
        text: "text-indigo-200",
      };
    case "emerald":
      return {
        bg: "bg-emerald-600 text-white border-emerald-500",
        check: "bg-white text-emerald-600 border-white",
        text: "text-emerald-200",
      };
    case "amber":
      return {
        bg: "bg-amber-600 text-white border-amber-500",
        check: "bg-white text-amber-600 border-white",
        text: "text-amber-200",
      };
    case "rose":
      return {
        bg: "bg-rose-600 text-white border-rose-500",
        check: "bg-white text-rose-600 border-white",
        text: "text-rose-200",
      };
    case "cyan":
      return {
        bg: "bg-cyan-600 text-white border-cyan-500",
        check: "bg-white text-cyan-600 border-white",
        text: "text-cyan-200",
      };
    case "fuchsia":
      return {
        bg: "bg-fuchsia-600 text-white border-fuchsia-500",
        check: "bg-white text-fuchsia-600 border-white",
        text: "text-fuchsia-200",
      };
    default:
      return {
        bg: "bg-indigo-600 text-white border-indigo-500",
        check: "bg-white text-indigo-600 border-white",
        text: "text-indigo-200",
      };
  }
}

export function getDelimiterBadge(type) {
  switch (type) {
    case "double_angle":
      return (
        <span className="bg-blue-900/40 text-blue-300 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold border border-blue-800">
          {"<< >>"}
        </span>
      );
    case "double_curly":
      return (
        <span className="bg-purple-900/40 text-purple-300 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold border border-purple-800">
          {"{{ }}"}
        </span>
      );
    case "double_square":
      return (
        <span className="bg-orange-900/40 text-orange-300 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold border border-orange-800">
          {"[[ ]]"}
        </span>
      );
    default:
      return null;
  }
}

const CHAPTERS = [
  {
    id: "overview",
    icon: "🚀",
    label: "Tính năng V7.0.0",
    title: "SmarDoctPro - V7.0.0",
    color: "indigo",
    sections: [
      {
        heading: "Nhóm cột Excel thông minh (Bảng Map)",
        body: "Tính năng mới giúp tự động nhóm (grouping) các cột Excel theo từng Sheet riêng biệt trong Bảng Map Dữ Liệu thay vì hiển thị thành một danh sách dài, giúp bạn dễ dàng tìm kiếm và chọn chính xác cột cần map ngay cả khi mở nhiều Sheet một lúc.",
      },
      {
        heading: "Khóa Sheet thông minh",
        body: "Giờ đây bạn có thể chọn riêng từng mẫu Word (Vd: Hợp đồng) chỉ lấy dữ liệu từ một Sheet Excel cụ thể (Vd: Sheet HopDong) thay vì lấy chung toàn bộ.",
      },
      {
        heading: "Bản in Tiêu Chuẩn & Realtime Sidebar",
        body: "Giao diện Print Preview hiển thị khổ A4 nguyên bản của Word. Bổ sung thanh Realtime Preview bên phải hỗ trợ Force Dark Mode chống mỏi mắt.",
      },
      {
        heading: "Tìm kiếm biến đa năng",
        body: "Bạn có thể dễ dàng tìm kiếm biến ở cả Form điền lẻ và Bảng Cấu hình Đấu nối Excel, giúp tiết kiệm thời gian với các mẫu có hàng trăm thẻ.",
      },
      {
        heading: "Lưu trữ Vĩnh viễn (IndexedDB)",
        body: "Dữ liệu file Word giờ đây được lưu vào Database nội bộ của trình duyệt. Tải hàng chục file nặng không lo tràn bộ nhớ hay mất file khi tắt máy.",
      },
    ],
  },
  {
    id: "syntax",
    icon: "⌨️",
    label: "Cú pháp Thẻ",
    title: "Quy tắc Cú pháp Thẻ (Tags)",
    color: "purple",
    sections: [
      {
        heading: "Định dạng thẻ cơ bản",
        body: "Sử dụng các cặp dấu bao quanh biến: <<TEN_NHA_THAU>>, {{TEN_NHA_THAU}}. Biến không được chứa dấu cách.",
      },
      {
        heading: "Hậu tố biến đặc biệt",
        body: "_UPPER: Viết hoa.\n_LOWER: Viết thường.\n_VIET: Đọc số thành chữ.",
      },
      {
        heading: "Thẻ hệ thống (Tự động hóa)",
        body: "<<TODAY>>: Ngày hiện tại.\n<<TODAY+7>>, <<TODAY-7>>: Ngày hiện tại cộng/trừ 7 ngày.\n<<FIRSTDAY_OF_MONTH>>, <<LASTDAY_OF_MONTH>>: Ngày đầu/cuối tháng.\n<<STT>>: Tự động điền số thứ tự tự tăng (dòng 1, 2, 3...) khi Xuất hàng loạt bằng Excel, hữu ích cho phụ lục và hàng loạt biên bản.",
      },
      {
        heading: "Bảng Động & Checkbox",
        body: "Hậu tố _TABLE (vd: <<VATTU_TABLE>>) để chèn bảng thường.\nHậu tố _TABLE_STRIPED (vd: <<VATTU_TABLE_STRIPED>>) để chèn bảng có màu nền xen kẽ giữa các dòng.\nTiền tố CHECK_x_ (vd: <<CHECK_x_DK1>>): In ra ☑ nếu giá trị là Có/1/True, ngược lại là ☐.",
      },
    ],
  },
  {
    id: "logic",
    icon: "🧠",
    label: "Cấu trúc Logic (IF-ELSE)",
    title: "Cấu trúc Logic IF-ELSE thông minh",
    color: "emerald",
    sections: [
      {
        heading: "Giới thiệu",
        body: "SmarDoctPro hỗ trợ tính năng xuất đoạn văn bản có điều kiện, giúp bạn tạo MỘT mẫu Word duy nhất dùng chung cho nhiều file/chủ đầu tư khác nhau mà không cần làm nhiều file Word khác nhau.",
      },
      {
        heading: "Cách sử dụng",
        body: "Dùng cặp thẻ mở và đóng trong file Word:\n<<IF(TÊN_BIẾN == Giá Trị Yêu Cầu)>>\n...Nội dung chỉ hiện ra khi Điều Kiện Đúng...\n<<ENDIF>>\n(Hỗ trợ các cặp thẻ tương đương: {{IF(...)}} hoặc [[IF(...)]])",
      },
      {
        heading: "Ví dụ 1: Điền điều khoản tùy chỉnh theo loại Hợp đồng",
        body: "<<IF(LOAI_HOP_DONG == Tư vấn)>>\nĐiều 3: Nghĩa vụ tư vấn giám sát: ... [Nội dung chỉ hiện khi LOAI_HOP_DONG bên Excel điền là 'Tư vấn']\n<<ENDIF>>",
      },
      {
        heading: "Ví dụ 2: Header riêng cho Chủ đầu tư",
        body: "{{IF(CHU_DAU_TU == BQL Dự Án A)}}\nSỞ XÂY DỰNG TỈNH...\n{{ENDIF}}",
      },
    ],
  },
];

const CHAPTER_COLOR_MAP = {
  indigo: {
    text: "text-indigo-400",
    bg: "bg-indigo-600",
    border: "border-indigo-900/50",
  },
  purple: {
    text: "text-purple-400",
    bg: "bg-purple-600",
    border: "border-purple-900/50",
  },
  emerald: {
    text: "text-emerald-400",
    bg: "bg-emerald-600",
    border: "border-emerald-900/50",
  },
};

export function HelpGuide(props) {
  var open = props.open,
    onClose = props.onClose;
  var [activeChapter, setActiveChapter] = useState("overview");
  if (!open) return null;
  var chapter =
    CHAPTERS.find(function (c) {
      return c.id === activeChapter;
    }) || CHAPTERS[0];
  var cc = CHAPTER_COLOR_MAP[chapter.color] || CHAPTER_COLOR_MAP.indigo;

  return (
    <div className="fixed inset-0 z-[60] flex items-stretch justify-end">
      <div
        className="absolute inset-0 bg-[#0A0D14]/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 flex flex-col w-full max-w-3xl h-full bg-[#0A0D14] border-l border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 sm:flex-row">
        <div className="w-full sm:w-48 bg-[#0A0D14] border-r border-white/5 flex flex-col">
          <div className="p-4 border-b border-white/5">
            <div className="text-[13px] leading-relaxed font-black text-white uppercase">
              Cẩm nang
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {CHAPTERS.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveChapter(c.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] leading-relaxed font-bold transition-all flex items-center gap-2 ${activeChapter === c.id ? CHAPTER_COLOR_MAP[c.color].bg + " text-white shadow-md" : "text-slate-400 hover:bg-white/[0.03] backdrop-blur-md"}`}
              >
                <span>{c.icon}</span> {c.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-1 flex-col min-h-0">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-[#0A0D14]/40">
            <div className="flex items-center gap-2">
              <div>
                <div className="text-[13px] leading-relaxed font-black text-white uppercase">
                  {chapter.title}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 bg-white/[0.03] backdrop-blur-md hover:bg-white/[0.06] backdrop-blur-lg text-slate-400 rounded-lg flex items-center justify-center text-[13px] leading-relaxed"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5 bg-[#0A0D14]">
            {chapter.sections.map(function (sec, i) {
              return (
                <div key={i} className="mb-6">
                  <h4
                    className={
                      "text-[12px] font-medium tracking-wide font-black uppercase tracking-widest mb-2 " +
                      cc.text
                    }
                  >
                    {sec.heading}
                  </h4>
                  <p className="text-[13px] leading-relaxed text-slate-300 leading-relaxed mb-3 whitespace-pre-wrap">
                    {sec.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error: error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0D14] p-6 text-center">
          <h3 className="text-red-400 font-extrabold text-lg mb-2">
            Đã xảy ra sự cố Crash
          </h3>
          <code className="text-[12px] font-medium tracking-wide font-medium tracking-wide bg-[#0A0D14] p-3 rounded text-red-400 font-mono block mb-4 max-w-2xl text-left overflow-auto">
            {this.state.error && this.state.error.stack}
          </code>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-indigo-600 rounded-xl text-[13px] leading-relaxed font-bold text-white"
          >
            🔄 Tải lại trang
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export async function fetchGeminiWithBackoff(payload, apiKey, modelName) {
  const FALLBACK_CHAIN = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash-001",
  ];

  // Xác định model bắt đầu
  let startModel =
    modelName || localStorage.getItem("sde_gemini_model") || "gemini-2.0-flash";
  let startIdx = FALLBACK_CHAIN.indexOf(startModel);
  let modelsToTry =
    startIdx >= 0
      ? FALLBACK_CHAIN.slice(startIdx)
      : [startModel, ...FALLBACK_CHAIN];

  let lastError = null;
  for (const model of modelsToTry) {
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/" +
      model +
      ":generateContent?key=" +
      apiKey;
    let delay = 1000;
    for (let i = 0; i < 2; i++) {
      // 2 retry per model
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) return await response.json();
      if (response.status === 404) {
        lastError = new Error(
          'Model "' + model + '" không tồn tại. Đang thử model khác...',
        );
        break; // thử model tiếp theo ngay
      }
      if (response.status === 429) {
        if (i === 1) {
          lastError = new Error(
            "Hết quota model " + model + ". Đang thử model khác...",
          );
          break;
        }
        await new Promise((res) => setTimeout(res, delay));
        delay += 1000;
      } else if (response.status === 503) {
        if (i === 1) {
          lastError = new Error("Gemini quá tải. Thử lại sau ít phút.");
          break;
        }
        await new Promise((res) => setTimeout(res, delay));
        delay += 1000;
      } else {
        lastError = new Error(
          "Lỗi " +
            response.status +
            " - " +
            (response.status === 401
              ? "API Key không hợp lệ. Vào ⚙️ kiểm tra lại."
              : "Lỗi không xác định."),
        );
        throw lastError; // 401/400 không fallback
      }
    }
  }
  throw lastError || new Error("Tất cả model đều không phản hồi.");
}

(function migrateModel() {
  if (typeof localStorage === 'undefined') return;
  const OLD_MODELS = {
    "gemini-1.5-pro": "gemini-1.5-pro-001",
    "gemini-1.5-flash": "gemini-1.5-flash-001",
    "gemini-1.5-flash-8b": "gemini-1.5-flash-8b-001",
    "gemini-2.5-flash-preview-05-20": "gemini-2.5-flash",
    "gemini-2.5-flash-preview-04-17": "gemini-2.5-flash",
  };
  try {
    const cur = localStorage.getItem("sde_gemini_model");
    if (cur && OLD_MODELS[cur])
      localStorage.setItem("sde_gemini_model", OLD_MODELS[cur]);
  } catch (e) { console.warn("Lỗi migrate model Gemini cũ:", e); }
})();




