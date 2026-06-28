// Quản lý "Thư mục lưu Local PC" được ghi nhớ qua File System Access API.
// FileSystemDirectoryHandle KHÔNG serialize thành chuỗi path được (bảo mật trình
// duyệt) nhưng structured-cloneable → lưu thẳng trong IndexedDB sẵn có của app.
import { saveBufferToDB, getBufferFromDB, deleteBufferFromDB } from "./helpers";

const DIR_KEY = "__local_export_dir__";

export function isLocalDirSupported() {
  return typeof window !== "undefined" && !!window.showDirectoryPicker;
}

// Đọc TÊN thư mục đã ghi nhớ (không xin quyền — chỉ để hiển thị).
export async function getRememberedDirName() {
  try {
    const handle = await getBufferFromDB(DIR_KEY);
    return handle?.name || null;
  } catch (e) {
    console.warn("getRememberedDirName failed:", e);
    return null;
  }
}

// Xóa thư mục đã ghi nhớ.
export async function clearLocalDir() {
  try {
    await deleteBufferFromDB(DIR_KEY);
  } catch (e) {
    console.warn("clearLocalDir failed:", e);
  }
}

// Chọn thư mục mới và ghi nhớ; trả về handle.
export async function pickAndRememberLocalDir() {
  if (!isLocalDirSupported()) {
    throw new Error("Trình duyệt không hỗ trợ chọn thư mục (cần Chrome/Edge).");
  }
  const handle = await window.showDirectoryPicker({ mode: "readwrite" });
  await saveBufferToDB(DIR_KEY, handle);
  return handle;
}

// Trả về handle dùng được (đã có quyền readwrite) hoặc null nếu chưa ghi nhớ/từ chối.
// Gọi trong luồng xuất (có user gesture) nên requestPermission hợp lệ.
export async function getUsableLocalDir() {
  let handle;
  try {
    handle = await getBufferFromDB(DIR_KEY);
  } catch (e) {
    console.warn("getUsableLocalDir read failed:", e);
    return null;
  }
  if (!handle) return null;
  try {
    const opts = { mode: "readwrite" };
    let perm = await handle.queryPermission(opts);
    if (perm !== "granted") perm = await handle.requestPermission(opts);
    return perm === "granted" ? handle : null;
  } catch (e) {
    console.warn("getUsableLocalDir permission failed:", e);
    return null;
  }
}

// Ghi nhớ một handle vừa được chọn ở luồng khác (vd picker trong export).
export async function rememberLocalDir(handle) {
  try {
    await saveBufferToDB(DIR_KEY, handle);
  } catch (e) {
    console.warn("rememberLocalDir failed:", e);
  }
}
