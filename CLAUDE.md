# CLAUDE.md — Hướng dẫn cho Claude Code khi làm việc trên project này

## Project này làm gì

**SmartDocPro** — công cụ tự động điền/xuất file Word & Excel theo template, dùng
biến (tag) dạng `<<TEN_BIEN>>` / `{{TEN_BIEN}}` / `[[TEN_BIEN]]`. Bối cảnh sử dụng: quản
lý dự án xây dựng (PMU/TVTK/Nhà thầu) tại Việt Nam.

**Định hướng:** đây sẽ là 1 trong nhiều "feature" của app. Tính năng lớn tiếp theo —
**QLDA** (quản lý dự án: Đối tác, Gói thầu & Hợp đồng, Tiến độ, Thanh toán, Bảng kê văn
bản, Báo cáo tự động...) — sẽ là `src/features/qlda/`, đứng ngang hàng với
`src/features/document-export/`, dùng chung `src/shared/`.

## Stack

React 19 + Vite 6 + Zustand 5 + Tailwind 4 · Test: Vitest (`npm test`) · Lint: ESLint 9

```
npm install && npm run dev      # dev server
npm run build                   # luôn chạy để bắt lỗi import/cú pháp
npm run lint                     # luôn chạy sau khi sửa code
npm test
```

## Cấu trúc thư mục (đã dọn 27/06/2026)

```
src/
  App.jsx, main.jsx, index.css      # shell gốc, không đổi khi thêm feature mới
  shared/                           # DÙNG CHUNG cho mọi feature
    layout/MainLayout.jsx, Sidebar.jsx
    store/useAppStore.js            # Zustand — state UI chung (activeMainTab, isFullScreen...)
  features/
    document-export/                # === SmartDocPro (feature hiện tại) ===
      AppLegacy.jsx                 # vẫn chứa phần lớn state & handler chính
      components/
        Modals/, Tabs/              # đang dùng thật, nhận data qua props từ AppLegacy
        AI/AIChatWidget.jsx
        _wip/                       # ⚠️ CHƯA gắn vào app — xem mục dưới
      hooks/                        # useExportHandlers, useProjectData, useWorkspaceBackup...
      utils/                        # helpers.jsx, variableUtils.js, tagUtils.js
    qlda/                           # (chưa tạo) — chỗ dành cho tính năng QLDA tương lai
```

**Quy tắc khi thêm feature mới (vd QLDA):** tạo `src/features/<ten-feature>/` riêng,
chỉ import từ `src/shared/` khi cần dùng chung — KHÔNG import ngược từ
`shared/` vào `features/` (tránh phụ thuộc vòng), KHÔNG import trực tiếp giữa 2 feature
với nhau (nếu cần dùng chung logic, đưa lên `shared/`).

### ⚠️ Lỗi hay gặp nhất khi tách thêm component khỏi AppLegacy.jsx

Khi tách JSX trong `AppLegacy.jsx` ra file riêng, dễ quên mang theo biến/hàm mà đoạn đó
dùng (vì trong file gốc nó chỉ là closure). Hậu quả: `ReferenceError` khi component
render hoặc khi bấm vào chức năng liên quan. Quy trình tách đúng:
1. Liệt kê biến/hàm component mới dùng mà không tự khai báo bên trong nó.
2. Thêm vào danh sách destructure props của component đó.
3. Quay lại `AppLegacy.jsx`, thêm `prop={prop}` ở chỗ render component đó.
4. `npm run lint` — phải còn 0 lỗi `no-undef`.

## Thư mục `_wip/` — KHÔNG PHẢI rác

`src/features/document-export/components/_wip/` chứa 10 component đã viết nhưng
**chưa được import/render ở đâu** (tách dở dang từ trước, gom riêng 1 chỗ cho rõ ràng):

- `_wip/tabs/`: WorkspaceTab.jsx (728 dòng), ExportHistoryTab.jsx, WBSDirectoryPane.jsx
- `_wip/layout/`: Header.jsx, TopNavbar.jsx, Topbar.jsx
- `_wip/modals/`: ExcelAuditModal.jsx, WordAuditModal.jsx, ExportReportModal.jsx,
  SaveProfileModal.jsx

Trước khi sửa file nào trong `_wip/`: kiểm tra lại bằng
`grep -rn "TenComponent" src/` xem đã có ai import chưa — nếu không, file đó vẫn đang chờ
quyết định hoàn thiện gắn vào hay xóa.

## Quy ước code

- Code cũ trong `AppLegacy.jsx`/`helpers.jsx` dùng `var` nhiều — kiểm tra tên biến đã
  dùng trong hàm chưa trước khi khai báo thêm (tránh lặp lại bug 2 state cùng tên từng
  xảy ra với `currentProjectId`).
- `catch (e) {}` rỗng — nếu thêm try/catch mới, luôn log lỗi (`console.warn`).
- Import path trong feature dùng đường dẫn tương đối (`./`, `../`); chỉ vượt ra
  `shared/` khi thực sự cần (vd `useAppStore`).

## Lưu ý ESLint

~27 lỗi thuộc rule `react-hooks` nhóm "React Compiler readiness" — project **chưa dùng**
React Compiler (`babel-plugin-react-compiler` không có trong package.json) nên không gây
lỗi chạy thực tế. Không cần sửa trừ khi có yêu cầu cụ thể.
