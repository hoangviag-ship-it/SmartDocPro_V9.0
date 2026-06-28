// Lớp đồng bộ: gom dữ liệu localStorage của user → Firestore và ngược lại (real-time)
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

// ---- ID thiết bị (để chống vòng lặp echo khi chính mình ghi) ----
function getDeviceId() {
  let id = localStorage.getItem('sde_device_id');
  if (!id) {
    id = 'dev_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('sde_device_id', id);
  }
  return id;
}
export const DEVICE_ID = getDeviceId();

// Tính SDE_UID y hệt AppLegacy (namespace localStorage theo email)
export function uidFromEmail(email) {
  return btoa(encodeURIComponent(email)).replace(/=/g, '').substring(0, 10);
}

// Các key toàn cục (không gắn user) cũng nên đồng bộ: giao diện, layout, theme
const GLOBAL_KEYS = [
  'sde_dark_mode',
  'sde_sidebar_open',
  'sde_layout_fullscreen',
  'sde_layout_resolution',
  'sde_compact_view',
  'sde_theme_v1', // font / cỡ chữ / giao diện (phần C)
];

// Không bao giờ đẩy lên cloud (nhạy cảm / cục bộ)
const NEVER_SYNC = new Set(['sde_device_id', 'sde_auth_v2', 'sde_gemini_key_v2']);

function isUserKey(key, SDE_UID) {
  return key.startsWith(`sde_${SDE_UID}_`);
}

// Gom toàn bộ state của user thành 1 object { key: value }
export function collectState(SDE_UID) {
  const out = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k || NEVER_SYNC.has(k)) continue;
    if (isUserKey(k, SDE_UID) || GLOBAL_KEYS.includes(k)) {
      out[k] = localStorage.getItem(k);
    }
  }
  return out;
}

// Bản gốc của setItem để ghi mà KHÔNG kích hoạt vòng đẩy lại
const rawSetItem = localStorage.setItem.bind(localStorage);
let applyingRemote = false;

// Áp dữ liệu cloud xuống localStorage
function applyState(data) {
  if (!data) return;
  applyingRemote = true;
  try {
    Object.keys(data).forEach((k) => {
      if (NEVER_SYNC.has(k)) return;
      rawSetItem(k, data[k]);
    });
  } finally {
    applyingRemote = false;
  }
}

// ---- Đẩy lên cloud (debounce) ----
let pushTimer = null;
export function schedulePush(uid, SDE_UID, delay = 1500) {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => pushNow(uid, SDE_UID), delay);
}

export async function pushNow(uid, SDE_UID) {
  try {
    const ref = doc(db, 'users', uid);
    await setDoc(
      ref,
      {
        data: collectState(SDE_UID),
        updatedAt: Date.now(),
        lastWriter: DEVICE_ID,
        sdeUid: SDE_UID,
      },
      { merge: true }
    );
    return true;
  } catch (e) {
    console.warn('[sync] push lỗi:', e?.message || e);
    return false;
  }
}

// ---- Tải lần đầu (trước khi app mount) ----
// cloud rỗng -> đẩy local lên; cloud có data -> áp xuống local
export async function pullInitial(uid, SDE_UID) {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists() && snap.data()?.data) {
      applyState(snap.data().data);
      return { applied: true };
    }
    await pushNow(uid, SDE_UID);
    return { applied: false };
  } catch (e) {
    console.warn('[sync] pullInitial lỗi:', e?.message || e);
    return { applied: false, error: e };
  }
}

// ---- Lắng nghe real-time từ thiết bị khác ----
export function subscribe(uid, SDE_UID, onRemoteApplied) {
  const ref = doc(db, 'users', uid);
  return onSnapshot(
    ref,
    { includeMetadataChanges: false },
    (snap) => {
      if (!snap.exists()) return;
      if (snap.metadata.hasPendingWrites) return; // ghi cục bộ chưa lên server
      const d = snap.data();
      if (!d?.data) return;
      if (d.lastWriter === DEVICE_ID) return; // chính mình vừa ghi -> bỏ qua
      applyState(d.data);
      if (typeof onRemoteApplied === 'function') onRemoteApplied(d);
    },
    (err) => console.warn('[sync] onSnapshot lỗi:', err?.message || err)
  );
}

// ---- Theo dõi mọi thay đổi localStorage để tự đẩy lên ----
export function startAutoPush(uid, SDE_UID) {
  const orig = localStorage.setItem.bind(localStorage);
  const origRemove = localStorage.removeItem.bind(localStorage);

  localStorage.setItem = function (k, v) {
    orig(k, v);
    if (applyingRemote) return;
    if (NEVER_SYNC.has(k)) return;
    if (isUserKey(k, SDE_UID) || GLOBAL_KEYS.includes(k)) schedulePush(uid, SDE_UID);
  };
  localStorage.removeItem = function (k) {
    origRemove(k);
    if (applyingRemote) return;
    if (isUserKey(k, SDE_UID) || GLOBAL_KEYS.includes(k)) schedulePush(uid, SDE_UID);
  };

  // Đồng bộ giữa các tab cùng máy
  const onStorage = (e) => {
    if (!e.key) return;
    if (isUserKey(e.key, SDE_UID) || GLOBAL_KEYS.includes(e.key)) schedulePush(uid, SDE_UID);
  };
  window.addEventListener('storage', onStorage);

  // hàm dọn dẹp
  return () => {
    localStorage.setItem = orig;
    localStorage.removeItem = origRemove;
    window.removeEventListener('storage', onStorage);
  };
}
