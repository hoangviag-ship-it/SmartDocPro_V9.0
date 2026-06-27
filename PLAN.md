# PLAN.md — Kế hoạch dọn nhẹ SmartDocPro

**Vai trò:** đây là plan từ "sếp" (Claude) cho "nhân viên" (Gemini CLI) thực hiện.
Làm đúng thứ tự A → B → C → D. Sau mỗi phần phải build/lint pass mới chuyển phần tiếp.

## Nguyên tắc chung — đọc trước khi bắt đầu

- Sau MỖI phần: chạy `npm run build && npm run lint`. Build phải 0 lỗi. Lint không được
  tăng số lỗi so với hiện tại (baseline: 27 errors, đều thuộc rule "React Compiler
  readiness" — không cần sửa, chỉ cần KHÔNG TĂNG thêm).
- KHÔNG xóa file nào nếu plan không nói rõ.
- Gặp lỗi không chắc cách sửa → DỪNG, ghi lại lỗi nguyên văn, KHÔNG tự đoán sửa liều,
  báo lại sếp.

---

## PHẦN A — Giảm tải trang lúc mở app (rủi ro thấp, làm trước)

**File:** `index.html`

Các thư viện ngoài (jszip, pizzip, xlsx, file-saver, docx-preview, mammoth, html-docx-js,
pako) đang load bằng `<script src="...">` KHÔNG có `defer` — trình duyệt phải tải + chạy
xong hết (xlsx đặc biệt nặng) TRƯỚC KHI app React được phép chạy. Đây là nguyên nhân
chính khiến mở app chậm, không phải do code React.

**Bước 1 — kiểm tra an toàn trước khi sửa:**

```
grep -rn "window.JSZip\|window.PizZip\|window.saveAs\|window.XLSX\|window.mammoth\|window.htmlDocx\|window.pako" src/
```

Với MỖI kết quả: xác nhận nó nằm BÊN TRONG 1 hàm (function/async function — ví dụ trong
1 handler xử lý khi user bấm nút), KHÔNG nằm thẳng trong thân component (chạy ngay lúc
render/mount). Nếu thấy có chỗ nằm ngoài hàm (chạy ngay lúc mount) — DỪNG, không thêm
`defer` cho thư viện đó, ghi lại vị trí, báo sếp.

**Bước 2 — nếu bước 1 an toàn, sửa `index.html`:**

Thêm `defer` vào các dòng sau (KHÔNG đụng dòng Google Sign-In, nó đã có `async defer`):
- `pako`
- `jszip`
- `pizzip`
- `xlsx`
- `file-saver`
- `docx-preview`
- `mammoth`
- `html-docx-js`

Ví dụ sửa:
```html
<!-- trước -->
<script src="https://unpkg.com/jszip@3.10.1/dist/jszip.min.js"></script>
<!-- sau -->
<script src="https://unpkg.com/jszip@3.10.1/dist/jszip.min.js" defer></script>
```

**Done khi:** `npm run dev`, mở app — load bình thường. Test TAY (không chỉ build pass):
thử xuất 1 file Word và 1 file Excel bất kỳ — phải ra file đúng, không lỗi console.

---

## PHẦN B — Code-split các Modal (rủi ro trung bình, làm sau khi A pass)

Mục tiêu: giảm bundle JS chính (hiện ~643KB, Vite đang cảnh báo) bằng cách lazy-load
Modal — Modal chỉ cần tải code khi user thực sự mở nó.

**File:** `src/features/document-export/AppLegacy.jsx`

**Bước 1:** Tìm các dòng import modal (đầu file, dạng):
```js
import LibraryModal from "./components/Modals/LibraryModal";
```

Đổi 12 modal sau (CHỈ đúng 12 cái này — không đụng modal nào trong `_wip/`):
`WordEditorModal, UnknownVarsModal, VariablesLibraryModal, ProcessModal,
ApprovalHistoryModal, RenameProcessNodeModal, AddStageModal, ProjectModal,
SettingsModal, AuthorModal, ConfirmModal, LibraryModal, PreviewModal`

Thành dạng:
```js
const LibraryModal = React.lazy(() => import("./components/Modals/LibraryModal"));
```

**Bước 2:** Tìm chỗ JSX return chính của component (cuối file, nơi render tất cả các
modal trên bằng `<LibraryModal ... />`, `<SettingsModal ... />`...). Bọc TOÀN BỘ khối
đó (1 lần duy nhất, không bọc riêng từng modal) bằng:
```jsx
<Suspense fallback={null}>
  {/* toàn bộ các modal render ở đây, giữ nguyên không đổi */}
</Suspense>
```
`Suspense` import từ `'react'` (đã có `React` import sẵn ở đầu file, dùng
`React.Suspense` nếu không muốn thêm import riêng).

**Done khi:**
- `npm run build` — xem log, phải thấy xuất hiện file `.js` riêng cho từng modal trong
  `dist/assets/` (tên dạng `LibraryModal-xxxx.js`) — dấu hiệu code-split hoạt động.
- `npm run dev`, test TAY: mở từng modal 1 lần (ít nhất Library, Settings, Project,
  Preview) — phải hiện đúng, không trắng màn hình, không lỗi console.

---

## PHẦN C — Báo cáo 10 file `_wip/` (CHỈ ĐIỀU TRA — không sửa/xóa)

Thư mục: `src/features/document-export/components/_wip/` (10 file, 3 thư mục con:
`tabs/`, `layout/`, `modals/`).

Với MỖI file, tạo 1 mục trong file mới `_wip-report.md` (tạo ở gốc project):

```
## TenFile.jsx
- Làm gì: (đọc JSX, tóm tắt 1 câu)
- Có JSX/logic tương tự trong AppLegacy.jsx không: Có / Không / Không chắc
- Nếu có: nằm khoảng dòng nào trong AppLegacy.jsx (dùng grep tìm từ khoá đặc trưng,
  ví dụ tên label/field xuất hiện trong file _wip đó)
- Đề xuất: Hoàn thiện gắn vào | Xóa (không còn cần) | Cần sếp xem kỹ hơn
```

**KHÔNG xóa, KHÔNG sửa bất kỳ file nào trong `_wip/`.** Làm xong báo cáo thì DỪNG, đợi
sếp duyệt `_wip-report.md` trước khi làm gì tiếp với các file này.

---

## PHẦN D — Dọn metadata (rủi ro thấp)

1. `package.json`: đổi `"name": "react-example"` → `"name": "smartdocpro"`.
2. `README.md`: xóa nội dung template AI Studio cũ. Viết lại ngắn gọn (không cần dài):
   tên app, app làm gì (1-2 câu), lệnh `npm install` / `npm run dev` / `npm run build`.

**Done khi:** `npm run build` vẫn pass.

---

## Báo cáo lại sếp (sau khi xong A, B, D)

Gửi lại:
1. Log cuối của `npm run build`
2. Log cuối của `npm run lint`
3. File `_wip-report.md` (từ phần C) — chưa hành động gì, chỉ để sếp duyệt
