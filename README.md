# 🚀 Xây dựng Hệ thống Website Thảo luận (Discussion Platform)

Dự án là một hệ thống quản lý thảo luận đa tầng, cho phép kết nối giữa Quản trị viên (Admin), Công ty và Người dùng để giải quyết các vấn đề kỹ thuật và nghiệp vụ.

## 📌 Tổng quan dự án
* **Mục tiêu:** Xây dựng hệ thống hỗ trợ quản lý người dùng, bài viết, công ty, chủ đề và tag.
* **Tính năng cốt lõi:** * Hệ thống Authentication & Phân quyền chặt chẽ.
    * Dashboard quản trị trực quan cho Administrator và Company Account.
    * Luồng nghiệp vụ: Admin tạo Công ty -> Chỉ định Member làm Company Account -> Company Account tạo Member để đăng bài thảo luận.
* **Giá trị thực tiễn:** Tiếp cận quy trình phát triển phần mềm chuẩn từ thiết kế Database đến triển khai với Docker.

---

## 📸 Giao diện ứng dụng
| Dashboard Quản trị | Chi tiết Bài viết |
|---|---|


---

## 💻 Công nghệ sử dụng

### 🎨 Frontend
***Framework:** Next.js (App Router).
* **UI Library:** Tailwind CSS & Shadcn/UI.
***Chức năng:** Quản lý User, Company, Post, Topic, Tag qua các trang CRUD (Thêm/Sửa/Xóa) và Dashboard.

### ⚙️ Backend
***Framework:** NestJS.
***Tính năng:** * Xây dựng RESTful APIs chuẩn chỉnh cho hệ thống.
    * Xử lý Authentication, Upload hình ảnh và Gửi email thông báo.

### 🗄️ Database & DevOps
***Database:** PostgreSQL (Thiết kế chuẩn hóa, quan hệ chặt chẽ giữa User - Post - Tag - Topic - Company).
* **Triển khai:** Docker & Docker Compose - Giúp đóng gói toàn bộ Frontend, Backend, Database vào container, triển khai chỉ với 1 lệnh.

---

## 🛠 Hướng dẫn cài đặt nhanh

Dự án đã được cấu hình Docker, bạn có thể chạy toàn bộ hệ thống bằng lệnh:

```bash
docker-compose up --build
