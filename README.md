1. Giới thiệu dự án
Tên dự án: Xây dựng trang web thảo luận
Mục tiêu: Xây dựng một hệ thống web hỗ trợ quản lý người dùng, bài viết, công ty,
chủ để, tag, đồng thời cung cấp tính năng đăng nhập, quản trị và hiển thị dữ liệu qua
Dashboard. Cho phép người dùng đăng tải các thắc mắc, vấn đề để thảo luận và giải
quyết. Administrator sẽ tạo ra các công ty và assign 1 member làm company_account.
Company_account có thể tạo ra các member để đăng tải vấn đề.
Quy ước về khái niệm
Ý nghĩa: Dự án giúp sinh viên tiếp cận quy trình phát triển phần mềm thực tế, từ khâu
setup môi trường, thiết kế database, lập trình frontend–backend đến triển khai trên
Docker.
2. Kiến trúc hệ thống
Frontend:
• Framework: NextJs
• UI Library: Tailwind CSS, Shadcn/UI
• Chức năng: Giao diện đăng nhập, trang dashboard, trang quản lý người dùng,
công ty, bài viết, chủ để, tag, công ty, cài đặt, tài khoản, các trang thêm và sửa,
xem chi tiết bài viết.
Backend:
• Framework: NestJs
• Chức năng: Xây dựng RESTful APIs cho user, post, company, topic, tag,
authentication, xử lý upload ảnh, gửi email.
Database:
• PostgreSQL (thiết kế theo chuẩn hóa, có quan hệ giữa User – Post – Tag –
Topic – Company).
Triển khai:
• Docker & Docker Compose: đóng gói backend, frontend, database trong
container; dễ dàng build và run toàn hệ thống chỉ với 1 lệnh

