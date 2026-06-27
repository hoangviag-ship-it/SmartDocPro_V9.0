# AGENTS.md — Quy tắc cho AI Agent (Antigravity, Claude Code, và tool tương thích)

## Project này làm gì

**SmartDocPro** — công cụ tự động điền/xuất file Word & Excel theo template, dùng
biến (tag) dạng `<<TEN_BIEN>>` / `{{TEN_BIEN}}` / `[[TEN_BIEN]]`. Bối cảnh: quản lý dự án
xây dựng (PMU/TVTK/Nhà thầu) tại Việt Nam.

**Định hướng:** đây là 1 trong nhiều "feature" của app. Tính năng lớn tiếp theo — **QLDA**
(quản lý dự án: Đối tác, Gói thầu & Hợp đồng, Tiến độ, Thanh toán, Bảng kê văn bản, Báo
cáo tự động...) — sẽ là `src/features/qlda/`, ngang hàng `src/features/document-export/`.

## Stack

React 19 + Vite 6 + Zustand 5 + Tailwind 4 · Test: Vitest (`npm test`) · Lint: ESLint 9

```
npm install && npm run dev
npm run build     # luôn chạy để bắt lỗi import/cú pháp
npm run lint       # luôn chạy sau khi sửa code
npm test
```

## Cấu trúc thư mục (đã dọn 27/06/2026)

```
src/
  App.jsx, main.jsx, index.css      # shell gốc
  shared/                           # DÙNG CHUNG cho mọi feature
    layout/MainLayout.jsx, Sidebar.jsx
    store/useAppStore.js
  features/
    document-export/                # === SmartDocPro (feature hiện tại) ===
      AppLegacy.jsx                 # vẫn chứa phần lớn state & handler chính
      components/Modals/, Tabs/, AI/
      components/_wip/               # ⚠️ CHƯA gắn vào app — xem mục dưới
      hooks/, utils/
    qlda/                           # (chưa tạo) — chỗ cho tính năng QLDA tương lai
```

**Quy tắc thêm feature mới:** tạo `src/features/<ten-feature>/` riêng; chỉ import từ
`shared/` khi cần dùng chung; KHÔNG import ngược `shared/` → `features/`; KHÔNG import
trực tiếp giữa 2 feature (cần dùng chung thì đưa logic lên `shared/`).

### ⚠️ Lỗi hay gặp nhất khi tách thêm component khỏi AppLegacy.jsx

Tách JSX ra file riêng dễ quên mang theo biến/hàm closure cũ dùng → `ReferenceError` khi
render hoặc khi bấm chức năng liên quan. Quy trình tách đúng:
1. Liệt kê biến/hàm component mới dùng mà không tự khai báo bên trong nó.
2. Thêm vào destructure props của component đó.
3. Thêm `prop={prop}` ở chỗ render trong `AppLegacy.jsx`.
4. `npm run lint` — phải còn 0 lỗi `no-undef`.

## Thư mục `_wip/` — KHÔNG PHẢI rác

`src/features/document-export/components/_wip/` chứa 10 component đã viết nhưng **chưa
được import/render ở đâu**:

- `_wip/tabs/`: WorkspaceTab.jsx (728 dòng), ExportHistoryTab.jsx, WBSDirectoryPane.jsx
- `_wip/layout/`: Header.jsx, TopNavbar.jsx, Topbar.jsx
- `_wip/modals/`: ExcelAuditModal.jsx, WordAuditModal.jsx, ExportReportModal.jsx,
  SaveProfileModal.jsx

Kiểm tra `grep -rn "TenComponent" src/` trước khi sửa — nếu chưa ai import, file đó vẫn
đang chờ quyết định hoàn thiện gắn vào hay xóa, không tự xóa khi chưa hỏi người dùng.

## Quy ước code

- Code cũ (`AppLegacy.jsx`/`helpers.jsx`) dùng `var` nhiều — kiểm tra tên biến đã dùng
  trong hàm chưa trước khi khai báo thêm (tránh bug 2 state cùng tên như
  `currentProjectId` từng gặp).
- `catch (e) {}` rỗng — luôn log lỗi (`console.warn`) khi thêm try/catch mới.

## Các bug đã fix (27/06/2026) — không lặp lại

- 2 state `currentProjectId` trùng tên do dùng `var` — đã xóa state thừa.
- 6 component thiếu props sau khi tách file (`LibraryModal`, `PreviewModal`,
  `ProjectModal`, `SettingsModal`, `WBSDirectoryPane`) — đã bổ sung đầy đủ.
- `exportDictionaryTemplate` thiếu `var saveAs = window.saveAs;` — đã thêm.
- Đã tái cấu trúc toàn bộ `src/` sang mô hình feature-based (xem cấu trúc trên).

## Lưu ý ESLint

~27 lỗi rule `react-hooks` nhóm "React Compiler readiness" — project **chưa dùng** React
Compiler nên không gây lỗi chạy thực tế. Không cần sửa trừ khi có yêu cầu cụ thể.

## An toàn

- Luôn hỏi xác nhận trước khi xóa file hoặc chạy git push/force.
- Không commit `.env`/secrets lên git.
