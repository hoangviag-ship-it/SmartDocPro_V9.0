# PLAN-E.md — Gắn `WorkspaceTab.jsx` vào AppLegacy.jsx (việc lớn, làm cẩn thận)

**Đọc kỹ trước khi làm:** đây không phải 1 modal nhỏ. `WorkspaceTab.jsx` (728 dòng) là bản
viết lại của gần 700 dòng lõi trong `AppLegacy.jsx` (khoảng dòng 5081-5776) — khu vực
chính người dùng nhìn thấy nhiều nhất (tab Điền biến/Excel/Quản lý biến/Xuất hàng loạt,
cây WBS, bảng mapping, live preview). Sai ở đây = hỏng cả màn hình chính.

## ⚠️ Rủi ro đặc biệt cần biết trước

`WorkspaceTab.jsx` nhận props kiểu `(props) => {...}` (1 object chung), KHÔNG destructure
tên từng prop như `LibraryModal`/`SettingsModal` đã sửa trước đó. Nghĩa là:
- ESLint `no-undef` sẽ **KHÔNG bắt được** lỗi thiếu prop ở đây (vì `props.tenBienKhongTonTai`
  không gây lỗi cú pháp, chỉ lặng lẽ trả về `undefined`).
- Phải tự dò bằng tay/bằng mắt, không trông chờ build/lint báo lỗi như các phần trước.

## Bước 1 — Làm trên nhánh git riêng, KHÔNG làm trên `main`

```
git checkout -b Phan-E-workspace-tab
```

## Bước 2 — So sánh kỹ trước khi đụng vào AppLegacy.jsx

1. Mở `WorkspaceTab.jsx`, liệt kê HẾT các `props.xxx` được dùng trong file (
   `grep -n "props\." src/features/document-export/components/_wip/tabs/WorkspaceTab.jsx`).
2. Với MỖI `props.xxx`, tìm trong đoạn JSX cũ (dòng 5081-5776 của `AppLegacy.jsx`) xem
   biến/hàm tương ứng tên là gì (có thể tên khác do file `_wip` viết ở thời điểm cũ hơn).
3. Ghi ra danh sách map: `props.xxx` (trong WorkspaceTab) ↔ tên biến thật (trong
   AppLegacy.jsx hiện tại). Nếu có `props.xxx` nào KHÔNG tìm thấy biến tương ứng nào hợp
   lý — DỪNG, báo lại, đừng tự đoán.

## Bước 3 — Gắn vào, nhưng KHÔNG xóa code cũ ngay

1. Import `WorkspaceTab` vào `AppLegacy.jsx` (lazy-load như Phần B đã làm với modal):
   ```js
   const WorkspaceTab = React.lazy(() => import("./components/_wip/tabs/WorkspaceTab"));
   ```
2. Tại vị trí dòng ~5081-5776, **comment lại** (không xóa) toàn bộ JSX cũ bằng
   `{/* ... */}`, rồi thêm vào ngay bên cạnh:
   ```jsx
   <Suspense fallback={null}>
     <WorkspaceTab
       // truyền đúng theo bảng map ở Bước 2, ví dụ:
       // tenBienTrongProps={tenBienThatTrongAppLegacy}
     />
   </Suspense>
   ```
3. `npm run build && npm run lint` — build phải pass.

## Bước 4 — Test tay TOÀN DIỆN (bắt buộc, không bỏ bước nào)

Đây là khu vực chính của app — test kỹ hơn các phần trước nhiều:

- [ ] Mở app, vào đúng tab Workspace — có hiện ra không, không trắng màn hình
- [ ] Chuyển qua đủ 4 tab nhỏ: Điền biến / Excel / Quản lý biến / Xuất hàng loạt
- [ ] Cây WBS bên trái: chọn file, nhân bản, sửa tên, xóa — đều thử
- [ ] Bảng mapping ở giữa: map 1 cột Excel vào 1 biến, gỡ map — thử cả 2
- [ ] Live Preview bên phải: có cập nhật theo dữ liệu vừa map không
- [ ] Xuất thử 1 file Word + 1 file Excel từ chính tab này (giống test Phần A/B đã làm)
- [ ] Mở Console (F12) suốt quá trình test — không có dòng đỏ nào

## Bước 5 — Chỉ sau khi Bước 4 pass HẾT

- Báo lại kết quả test (theo checklist Bước 4) cho sếp duyệt.
- **CHƯA xóa code cũ đã comment** — để vài ngày dùng thử thật rồi mới xóa hẳn, phòng
  trường hợp phát hiện thiếu sót muộn.
- KHÔNG merge nhánh `Phan-E-workspace-tab` vào `main` khi chưa có xác nhận từ sếp.

## Nếu Bước 2 hoặc Bước 4 phát hiện vấn đề

DỪNG ngay, không tự sửa liều ở khu vực này (rủi ro cao hơn các phần trước). Ghi lại cụ
thể vấn đề gặp phải, báo lại sếp trước khi tiếp tục.
