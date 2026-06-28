# SmartDoc PRO — Đồng bộ online + offline (Hướng dẫn cài đặt)

Lớp đồng bộ này **thêm vào** app, không sửa 5.863 dòng `AppLegacy.jsx`. Đăng nhập bằng
Firebase Auth (Google) — tự đăng ký lần đầu, dữ liệu lưu trên Firestore và đồng bộ
real-time mọi thiết bị; có offline-cache nên sống sót khi F5/mất mạng. Bản cloud còn
sống sót cả khi xoá lịch sử trình duyệt (đăng nhập lại là tải về).

## 1. File đã thêm / sửa
- `src/shared/sync/firebase.js` — khởi tạo Firebase Auth + Firestore (offline-cache).
- `src/shared/sync/syncEngine.js` — gom localStorage → cloud, kéo về, lắng nghe live.
- `src/shared/sync/SyncProvider.jsx` — cổng đăng nhập + panel (tài khoản, link lưu trữ, backup, font/cỡ chữ).
- `src/shared/theme/theme.js` — hệ thống font/cỡ chữ/giao diện (phần C).
- `src/App.jsx` — bọc app bằng `<SyncProvider>`.
- `src/index.css` — thêm biến CSS theme (xem mục 4).
- `firestore.rules` — quy tắc bảo mật.
- `package.json` — thêm `firebase`.

## 2. Cài & chạy
```bash
npm install          # đã thêm firebase vào dependencies
npm run dev
```

## 3. Bật trên Firebase Console (BẮT BUỘC) — project `smartdoc-sync`
1. **Authentication → Sign-in method → Google → Enable** (chọn email hỗ trợ, Save).
   → Đây là phần cho phép "tự động đăng ký và đăng nhập".
2. **Authentication → Settings → Authorized domains**: thêm domain deploy của bạn
   (vd `*.vercel.app` / tên miền riêng) và `localhost`.
3. **Firestore → Rules**: dán nội dung `firestore.rules` rồi **Publish**.

> Lưu ý: app cũ chặn bằng whitelist `allowedUsers`. Bản mới dùng Firebase Auth nên
> AI người dùng Google đều tự tạo tài khoản. Muốn giới hạn lại, thêm kiểm tra trong
> `SyncProvider` (sau `onAuthChange`) hoặc dùng Firebase Auth → Blocking Functions.

## 4. Đoạn CSS đã thêm vào cuối `src/index.css`
```css
:root {
  --app-font-family: ui-sans-serif, system-ui, "Segoe UI", Roboto, Arial, sans-serif;
  --app-zoom: 1;
  --app-density: 1;
}
body, .font-sans { font-family: var(--app-font-family) !important; }
#root { zoom: var(--app-zoom); }
```

## 5. Cách hoạt động (tóm tắt)
- **Đăng nhập:** `SyncProvider` gọi Google sign-in → ghi `sde_auth_v2` để app cũ tự
  qua cổng (không có 2 lần đăng nhập). `SDE_UID` tính y hệt app cũ (từ email) nên đọc
  đúng dữ liệu localStorage hiện có.
- **Đẩy lên:** mọi thay đổi localStorage (`sde_<UID>_*` + giao diện) tự đẩy lên
  `users/{uid}` sau ~1.5s (debounce).
- **Kéo về:** đăng nhập trên máy mới → tải dữ liệu cloud TRƯỚC khi app hiện ra.
- **Live:** thiết bị khác sửa → `onSnapshot` ghi xuống localStorage rồi tải lại trang
  (hoãn nếu đang gõ trong ô nhập). Chống vòng lặp bằng `deviceId` + `lastWriter`.
- **Offline:** Firestore persistent cache (IndexedDB) → vẫn dùng được khi mất mạng,
  tự đồng bộ khi online lại.

## 6. Panel (góc dưới phải)
- Tài khoản đang đăng nhập + trạng thái đồng bộ + nút "Đồng bộ ngay".
- **Link lưu trữ:** Dự án/dữ liệu (cloud), Biểu mẫu, Xuất file, **Backup .json** (tải/khôi phục).
- **Giao diện & chữ:** chọn font, cỡ chữ (zoom), độ nén — áp toàn app & đồng bộ theo tài khoản.
- Đăng xuất.

## 7. Kiểm thử đã chạy
- `npm run build` ✓  ·  `npm run test` ✓  ·  `npm run lint` (sạch lỗi) ✓
