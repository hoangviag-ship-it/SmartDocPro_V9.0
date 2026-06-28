// Google Drive (appDataFolder) — sao lưu/phục hồi vào Drive RIÊNG của user.
// Tận dụng đăng nhập Google của Firebase: xin thêm quyền drive.appdata khi cần,
// KHÔNG cần tạo OAuth Client ID riêng. File lưu trong thư mục ẩn appDataFolder
// nên user không thấy/không xóa nhầm, không chiếm dung lượng Drive nhìn thấy.
import { GoogleAuthProvider, reauthenticateWithPopup } from 'firebase/auth';
import { auth } from './firebase';

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const FILE_NAME = 'smartdocpro-backup.json';

// Cache access token theo phiên (~1h) để không phải bật popup mỗi lần bấm
let cachedToken = null;
let cachedExp = 0;

async function getToken() {
  if (cachedToken && Date.now() < cachedExp - 60000) return cachedToken;
  if (!auth.currentUser) throw new Error('Chưa đăng nhập');
  const provider = new GoogleAuthProvider();
  provider.addScope(DRIVE_SCOPE);
  const result = await reauthenticateWithPopup(auth.currentUser, provider);
  const cred = GoogleAuthProvider.credentialFromResult(result);
  if (!cred?.accessToken) throw new Error('Không lấy được quyền Google Drive');
  cachedToken = cred.accessToken;
  cachedExp = Date.now() + 55 * 60 * 1000; // ~1h, trừ hao 5 phút
  return cachedToken;
}

async function findFileId(token) {
  const q = encodeURIComponent(`name='${FILE_NAME}'`);
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&fields=files(id,name)&q=${q}`,
    { headers: { Authorization: 'Bearer ' + token } },
  );
  if (!res.ok) throw new Error('Drive (list) lỗi ' + res.status);
  const data = await res.json();
  return data.files?.[0]?.id || null;
}

// Ghi (tạo mới hoặc cập nhật) 1 file JSON duy nhất trong appDataFolder
export async function backupToDrive(jsonString) {
  const token = await getToken();
  const existingId = await findFileId(token);
  const metadata = existingId ? {} : { name: FILE_NAME, parents: ['appDataFolder'] };
  const boundary = '----sdeboundary' + Date.now();
  const body =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
    JSON.stringify(metadata) +
    `\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n` +
    jsonString +
    `\r\n--${boundary}--`;
  const url = existingId
    ? `https://www.googleapis.com/upload/drive/v3/files/${existingId}?uploadType=multipart`
    : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
  const res = await fetch(url, {
    method: existingId ? 'PATCH' : 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  });
  if (!res.ok) throw new Error('Drive (upload) lỗi ' + res.status);
  return true;
}

// Đọc nội dung bản sao lưu; trả null nếu chưa có
export async function restoreFromDrive() {
  const token = await getToken();
  const id = await findFileId(token);
  if (!id) return null;
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${id}?alt=media`,
    { headers: { Authorization: 'Bearer ' + token } },
  );
  if (!res.ok) throw new Error('Drive (download) lỗi ' + res.status);
  return res.text();
}
