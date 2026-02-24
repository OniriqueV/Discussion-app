# 🚀 Xây dựng Hệ thống Website Thảo luận (Discussion Platform)

[cite_start]Dự án là một hệ thống quản lý thảo luận đa tầng, cho phép kết nối giữa Quản trị viên (Admin), Công ty và Người dùng để giải quyết các vấn đề kỹ thuật và nghiệp vụ[cite: 29].

## 📌 Tổng quan dự án
* [cite_start]**Mục tiêu:** Xây dựng hệ thống hỗ trợ quản lý người dùng, bài viết, công ty, chủ đề và tag[cite: 29].
* [cite_start]**Tính năng cốt lõi:** * Hệ thống Authentication & Phân quyền chặt chẽ[cite: 29].
    * [cite_start]Dashboard quản trị trực quan cho Administrator và Company Account[cite: 29].
    * [cite_start]Luồng nghiệp vụ: Admin tạo Công ty -> Chỉ định Member làm Company Account -> Company Account tạo Member để đăng bài thảo luận[cite: 29].
* [cite_start]**Giá trị thực tiễn:** Tiếp cận quy trình phát triển phần mềm chuẩn từ thiết kế Database đến triển khai với Docker[cite: 29].

---

## 📸 Giao diện ứng dụng
| Dashboard Quản trị | Chi tiết Bài viết |
|---|---|
| ![Dashboard](đường-dẫn-ảnh-1.png) | ![Post Detail](đường-dẫn-ảnh-2.png) |

---

## 💻 Công nghệ sử dụng

### 🎨 Frontend
* [cite_start]**Framework:** Next.js (App Router)[cite: 29].
* [cite_start]**UI Library:** Tailwind CSS & Shadcn/UI[cite: 29].
* [cite_start]**Chức năng:** Quản lý User, Company, Post, Topic, Tag qua các trang CRUD (Thêm/Sửa/Xóa) và Dashboard[cite: 29].

### ⚙️ Backend
* [cite_start]**Framework:** NestJS[cite: 29].
* [cite_start]**Tính năng:** * Xây dựng RESTful APIs chuẩn chỉnh cho hệ thống[cite: 29].
    * [cite_start]Xử lý Authentication, Upload hình ảnh và Gửi email thông báo[cite: 29].

### 🗄️ Database & DevOps
* [cite_start]**Database:** PostgreSQL (Thiết kế chuẩn hóa, quan hệ chặt chẽ giữa User - Post - Tag - Topic - Company)[cite: 29].
* [cite_start]**Triển khai:** Docker & Docker Compose - Giúp đóng gói toàn bộ Frontend, Backend, Database vào container, triển khai chỉ với 1 lệnh[cite: 29].

---

## 🛠 Hướng dẫn cài đặt nhanh

Dự án đã được cấu hình Docker, bạn có thể chạy toàn bộ hệ thống bằng lệnh:

```bash
docker-compose up --build
