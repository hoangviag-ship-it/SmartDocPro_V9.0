# Báo cáo các file Work In Progress (_wip) — SmartDocPro

Tài liệu này liệt kê và đánh giá chi tiết 10 file React component đang nằm trong thư mục `src/features/document-export/components/_wip/` nhằm phục vụ việc tái cấu trúc và làm sạch `AppLegacy.jsx`.

---

## Header.jsx
- Làm gì: Hiển thị thanh đầu trang (Header) cho phép chọn dự án hiện tại từ danh sách, đồng thời cung cấp nút mở cấu hình dự án (⚙️) và xóa dự án (🗑️).
- Có JSX/logic tương tự trong AppLegacy.jsx không: Có
- Nếu có: Nằm khoảng dòng 5036 đến 5223 trong `AppLegacy.jsx` (khu vực thanh chọn dự án và các nút chức năng đi kèm).
- Đề xuất: Hoàn thiện gắn vào

## TopNavbar.jsx
- Làm gì: Hiển thị một dạng thanh điều hướng đầu trang (Navbar) khác với giao diện tối màu và bo góc nổi bật hơn, cũng hỗ trợ chọn dự án và cấu hình dự án.
- Có JSX/logic tương tự trong AppLegacy.jsx không: Có
- Nếu có: Nằm khoảng dòng 5036 đến 5223 trong `AppLegacy.jsx` (tương tự như `Header.jsx` nhưng sử dụng style khác).
- Đề xuất: Xóa (không còn cần) — do dự án đã dùng `Header.jsx` hoặc layout sidebar thống nhất, tránh trùng lặp dư thừa.

## Topbar.jsx
- Làm gì: Hiển thị thanh Topbar chứa ô tìm kiếm nhanh (mẫu Word, biến...) và khu vực ẩn dành cho nút đăng nhập Google.
- Có JSX/logic tương tự trong AppLegacy.jsx không: Không
- Đề xuất: Xóa (không còn cần) — các chức năng tìm kiếm đã được tích hợp trực tiếp trong các tab quản lý biến / WBS directory, không cần thanh topbar độc lập này.

## ExcelAuditModal.jsx
- Làm gì: Hiển thị hộp thoại cảnh báo khi phát hiện các cột dữ liệu mới trong file Excel tải lên chưa được lưu vào từ điển biến gốc.
- Có JSX/logic tương tự trong AppLegacy.jsx không: Có
- Nếu có: Nằm khoảng dòng 6115 đến 6191 trong `AppLegacy.jsx` (phần block JSX của `{excelAuditModal.show && ...}`).
- Đề xuất: Hoàn thiện gắn vào

## ExportReportModal.jsx
- Làm gì: Hiển thị báo cáo kết quả sau khi kết xuất hàng loạt, thống kê tổng số file được tạo và liệt kê danh sách các dòng dữ liệu Excel bị thiếu biến đã map.
- Có JSX/logic tương tự trong AppLegacy.jsx không: Có
- Nếu có: Nằm khoảng dòng 5829 đến 5900 trong `AppLegacy.jsx` (phần block JSX của `{exportReportModal.show && ...}`).
- Đề xuất: Hoàn thiện gắn vào

## SaveProfileModal.jsx
- Làm gì: Hiển thị hộp thoại cho phép đặt tên và lưu cấu hình ánh xạ cột Excel hiện tại thành một Profile trong LocalStorage để tái sử dụng.
- Có JSX/logic tương tự trong AppLegacy.jsx không: Có
- Nếu có: Nằm khoảng dòng 6022 đến 6074 trong `AppLegacy.jsx` (phần block JSX của `{isSaveProfileModalOpen && ...}`).
- Đề xuất: Hoàn thiện gắn vào

## WordAuditModal.jsx
- Làm gì: Hiển thị hộp thoại cảnh báo khi phát hiện file mẫu Word tải lên chứa các biến mới hoặc không đúng chuẩn tiền tố.
- Có JSX/logic tương tự trong AppLegacy.jsx không: Có
- Nếu có: Nằm khoảng dòng 6193 đến 6264 trong `AppLegacy.jsx` (phần block JSX của `{wordAuditModal.show && ...}`).
- Đề xuất: Hoàn thiện gắn vào

## ExportHistoryTab.jsx
- Làm gì: Hiển thị lịch sử các lần kết xuất file (đọc từ LocalStorage), hiển thị thời gian, tên dự án và số lượng file đã xuất, đồng thời cho phép xóa lịch sử.
- Có JSX/logic tương tự trong AppLegacy.jsx không: Không (trong `AppLegacy.jsx` mới chỉ ghi dữ liệu lịch sử vào LocalStorage khi xuất file mà chưa có giao diện hiển thị).
- Đề xuất: Hoàn thiện gắn vào (tích hợp thành một tab mới giúp người dùng xem lại lịch sử xuất file).

## WBSDirectoryPane.jsx
- Làm gì: Hiển thị cây thư mục WBS (phân nhóm các file mẫu Word theo từng giai đoạn dự án) ở thanh bên trái, hỗ trợ tích chọn nhanh, nhân bản, sửa và xóa file mẫu.
- Có JSX/logic tương tự trong AppLegacy.jsx không: Có
- Nếu có: Nằm khoảng dòng 5290 đến 5480 trong `AppLegacy.jsx`.
- Đề xuất: Hoàn thiện gắn vào

## WorkspaceTab.jsx
- Làm gì: Component bao quát toàn bộ Tab chính của Workspace, chứa thông tin thống kê nhanh, thanh chọn tab nhỏ (Điền biến, Excel, Quản lý biến, Xuất hàng loạt), WBSDirectoryPane bên trái, MappingTable ở giữa và khung Live Preview bên phải.
- Có JSX/logic tương tự trong AppLegacy.jsx không: Có
- Nếu có: Nằm khoảng dòng 5081 đến 5776 trong `AppLegacy.jsx`.
- Đề xuất: Hoàn thiện gắn vào
