import React, { useEffect, useState, useCallback, useRef, createContext } from 'react';
import { onAuthChange, signInWithGoogle, signOutUser } from './firebase';
import {
  uidFromEmail, pullInitial, startAutoPush, subscribe, pushNow, collectState,
} from './syncEngine';
import { backupToDrive, restoreFromDrive } from './googleDrive';
import { loadTheme, saveTheme, applyTheme, FONT_OPTIONS, DEFAULT_THEME } from '../theme/theme';

const PROJECT_ID = 'smartdoc-sync';

// Context để mọi component (kể cả SettingsModal trong feature) đọc được
// trạng thái tài khoản / đồng bộ / theme mà không cần truyền props xuyên tầng.
export const SyncContext = createContext(null);

export default function SyncProvider({ children }) {
  const [phase, setPhase] = useState('checking'); // checking | signin | ready
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | syncing | synced | offline
  const [theme, setTheme] = useState(loadTheme());
  const [toast, setToast] = useState(null);
  const [signinErr, setSigninErr] = useState('');
  const [showSplash, setShowSplash] = useState(false);
  const cleanupRef = useRef([]);
  const fileRef = useRef(null);

  // Delay splash 400ms — phiên đã cache resolve trước đó, user không thấy flash
  useEffect(() => {
    const t = setTimeout(() => setShowSplash(true), 400);
    return () => clearTimeout(t);
  }, []);

  // Áp theme ngay khi mở app
  useEffect(() => { applyTheme(theme); }, []); // eslint-disable-line

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }, []);

  const softReloadOnRemote = useCallback(() => {
    setStatus('syncing');
    showToast('Đã nhận dữ liệu mới từ thiết bị khác — đang cập nhật…');
    const el = document.activeElement;
    const editing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
    if (editing) {
      const onBlur = () => { el.removeEventListener('blur', onBlur); setTimeout(() => window.location.reload(), 400); };
      el.addEventListener('blur', onBlur);
    } else {
      setTimeout(() => window.location.reload(), 700);
    }
  }, [showToast]);

  // Theo dõi trạng thái đăng nhập
  useEffect(() => {
    const unsub = onAuthChange(async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setPhase('signin');
        return;
      }
      const email = (fbUser.email || '').toLowerCase();
      const SDE_UID = uidFromEmail(email);
      const profile = {
        uid: fbUser.uid, email, SDE_UID,
        name: fbUser.displayName || email, picture: fbUser.photoURL || '',
      };

      // Bắc cầu cho AppLegacy: set sde_auth_v2 để app cũ tự qua cổng đăng nhập
      try {
        localStorage.setItem('sde_auth_v2', JSON.stringify({
          email: fbUser.email, name: profile.name, picture: profile.picture,
          exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
        }));
      } catch { /* bỏ qua */ }

      setUser(profile);
      setStatus('syncing');

      // Tải dữ liệu cloud TRƯỚC khi render app (thiết bị mới sẽ có ngay dữ liệu)
      await pullInitial(fbUser.uid, SDE_UID);
      setTheme(loadTheme());
      applyTheme(loadTheme());

      // Bật tự đẩy + lắng nghe real-time
      const stopPush = startAutoPush(fbUser.uid, SDE_UID);
      const stopSub = subscribe(fbUser.uid, SDE_UID, () => softReloadOnRemote());
      cleanupRef.current = [stopPush, stopSub];

      setStatus('synced');
      setPhase('ready');
    });
    return () => {
      unsub && unsub();
      cleanupRef.current.forEach((fn) => fn && fn());
    };
  }, [softReloadOnRemote]);

  const handleSignIn = async () => {
    setSigninErr('');
    try { await signInWithGoogle(); }
    catch (e) { setSigninErr(e?.message || 'Đăng nhập thất bại. Thử lại.'); }
  };

  const handleSignOut = async () => {
    cleanupRef.current.forEach((fn) => fn && fn());
    cleanupRef.current = [];
    try { localStorage.removeItem('sde_auth_v2'); } catch { /* bỏ qua */ }
    await signOutUser();
    window.location.reload();
  };

  const handleManualSync = async () => {
    if (!user) return;
    setStatus('syncing');
    const ok = await pushNow(user.uid, user.SDE_UID);
    setStatus(ok ? 'synced' : 'offline');
    showToast(ok ? 'Đã đồng bộ lên cloud ✓' : 'Không kết nối được — sẽ tự đồng bộ khi có mạng');
  };

  const handleBackup = () => {
    if (!user) return;
    const payload = { _meta: { app: 'SmartDocPro', email: user.email, at: new Date().toISOString() }, data: collectState(user.SDE_UID) };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `smartdocpro-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('Đã tải file backup ✓');
  };

  const handleRestore = (e) => {
    const f = e.target.files?.[0];
    if (!f || !user) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(reader.result);
        const data = parsed.data || parsed;
        Object.keys(data).forEach((k) => { if (k.startsWith('sde_')) localStorage.setItem(k, data[k]); });
        await pushNow(user.uid, user.SDE_UID);
        showToast('Đã phục hồi backup — đang tải lại…');
        setTimeout(() => window.location.reload(), 800);
      } catch { showToast('File backup không hợp lệ'); }
    };
    reader.readAsText(f);
  };

  const handleDriveBackup = async () => {
    if (!user) return;
    try {
      setStatus('syncing');
      showToast('Đang mở Google Drive của bạn…');
      const payload = { _meta: { app: 'SmartDocPro', email: user.email, at: new Date().toISOString() }, data: collectState(user.SDE_UID) };
      await backupToDrive(JSON.stringify(payload));
      setStatus('synced');
      showToast('Đã sao lưu vào Google Drive của bạn ✓');
    } catch (e) {
      setStatus('idle');
      showToast('Lỗi sao lưu Drive: ' + (e?.message || e));
    }
  };

  const handleDriveRestore = async () => {
    if (!user) return;
    try {
      showToast('Đang đọc bản sao lưu từ Google Drive…');
      const text = await restoreFromDrive();
      if (!text) { showToast('Chưa có bản sao lưu nào trên Drive của bạn'); return; }
      const parsed = JSON.parse(text);
      const data = parsed.data || parsed;
      Object.keys(data).forEach((k) => { if (k.startsWith('sde_')) localStorage.setItem(k, data[k]); });
      await pushNow(user.uid, user.SDE_UID);
      showToast('Đã phục hồi từ Drive — đang tải lại…');
      setTimeout(() => window.location.reload(), 800);
    } catch (e) {
      showToast('Lỗi phục hồi Drive: ' + (e?.message || e));
    }
  };

  const updateTheme = (patch) => {
    const next = { ...theme, ...patch };
    setTheme(next);
    applyTheme(next);
    saveTheme(next); // -> kích hoạt sync (key sde_theme_v1)
  };

  // ----- Render -----
  if (phase === 'checking') {
    if (!showSplash) return null;
    return <CenterCard><div className="text-slate-300 text-sm animate-pulse">Đang kết nối tài khoản…</div></CenterCard>;
  }

  if (phase === 'signin') {
    return (
      <CenterCard>
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 rotate-3">
          <span className="text-3xl">🚀</span>
        </div>
        <h1 className="text-2xl font-black text-white text-center">SmartDoc PRO</h1>
        <p className="text-[13px] text-slate-400 text-center mt-2 mb-7">Đăng nhập để đồng bộ trên mọi thiết bị</p>
        <button
          onClick={handleSignIn}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-800 font-semibold py-2.5 rounded-xl transition"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-5 h-5" />
          Tiếp tục với Google
        </button>
        <p className="text-[11px] text-slate-500 text-center mt-4">Tự động tạo tài khoản ở lần đăng nhập đầu tiên.</p>
        {signinErr && <p className="text-[12px] text-red-400 text-center mt-3">{signinErr}</p>}
      </CenterCard>
    );
  }

  // phase === 'ready' — không còn panel nổi; mọi UI cài đặt gom vào SettingsModal
  // (đọc qua SyncContext). Ở đây chỉ cung cấp context + toast + input ẩn cho restore.
  const syncApi = {
    user,
    status,
    PROJECT_ID,
    theme,
    FONT_OPTIONS,
    updateTheme,
    resetTheme: () => { setTheme(DEFAULT_THEME); applyTheme(DEFAULT_THEME); saveTheme(DEFAULT_THEME); },
    handleManualSync,
    handleBackup,
    openJsonRestore: () => fileRef.current?.click(),
    handleDriveBackup,
    handleDriveRestore,
    handleSignOut,
  };

  return (
    <SyncContext.Provider value={syncApi}>
      {children}

      {/* Input ẩn cho phục hồi backup .json (mở từ SettingsModal qua openJsonRestore) */}
      <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleRestore} />

      {toast && (
        <div className="fixed bottom-4 right-4 z-[9999] px-4 py-2 rounded-xl bg-slate-900 border border-slate-600 text-slate-100 text-[13px] shadow-xl max-w-[80vw]">
          {toast}
        </div>
      )}
    </SyncContext.Provider>
  );
}

function CenterCard({ children }) {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="bg-[#0A0D14] p-8 rounded-3xl border border-slate-700 flex flex-col items-center max-w-sm w-full relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
        {children}
      </div>
    </div>
  );
}

