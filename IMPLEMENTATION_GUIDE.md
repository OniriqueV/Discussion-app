# Implementation Guide - Post API với Upload Ảnh và WYSIWYG

## 🎯 Tổng quan

Đã implement đầy đủ các yêu cầu cho API Post với khả năng upload ảnh và tích hợp WYSIWYG editor.

## ✅ Các tính năng đã implement

### 1. **Backend API**
- ✅ Quyền chỉnh sửa/xóa post (chỉ author hoặc admin/ca_user)
- ✅ Gửi email khi xóa post
- ✅ Relationship đầy đủ giữa Post, User, Company, Topic, Tag, Comment
- ✅ Service pattern
- ✅ Upload ảnh cho post (max 10 ảnh, 10MB mỗi ảnh)
- ✅ Xóa ảnh từ post
- ✅ Soft delete cho post

### 2. **Frontend**
- ✅ WYSIWYG Editor (TinyMCE) với khả năng upload ảnh
- ✅ API service cho post
- ✅ Form tạo/chỉnh sửa post với WYSIWYG
- ✅ Upload ảnh trực tiếp từ editor

### 3. **Database**
- ✅ Field `images` trong Post model (String array)
- ✅ Migration script sẵn sàng

## 🚀 Cách sử dụng

### 1. **Chạy Migration**
```bash
cd backend
npx prisma migrate dev --name add_images_to_post
```

### 2. **Uncomment code sau migration**
Sau khi chạy migration thành công, uncomment các dòng có comment `// Uncomment after running migration` trong:
- `backend/src/posts/posts.service.ts`
- `backend/src/posts/posts.controller.ts`

### 3. **Cài đặt dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 4. **Chạy ứng dụng**
```bash
# Backend
cd backend
npm run start:dev

# Frontend
cd frontend
npm run dev
```

## 📁 Cấu trúc file đã thêm/sửa

### Backend
```
backend/
├── prisma/
│   └── schema.prisma (thêm field images)
├── src/
│   ├── posts/
│   │   ├── posts.controller.ts (thêm API upload ảnh)
│   │   ├── posts.service.ts (thêm method upload/delete ảnh)
│   │   └── dto/
│   │       ├── create-post.dto.ts (thêm field images)
│   │       └── update-post.dto.ts (thêm field images)
│   ├── common/
│   │   ├── config/
│   │   │   └── multer-config.ts (thêm config cho post images)
│   │   └── middleware/
│   │       └── file-upload.middleware.ts (thêm middleware cho post images)
│   └── main.ts (đã có static file serving)
├── uploads/
│   └── post-images/ (thư mục mới)
└── migration-commands.md (hướng dẫn migration)
```

### Frontend
```
frontend/
├── src/
│   ├── components/
│   │   ├── WYSIWYGEditor.tsx (component mới)
│   │   └── PostForm.tsx (cập nhật để dùng WYSIWYG)
│   └── api/
│       └── postApi.ts (API service mới)
└── package.json (thêm @tinymce/tinymce-react)
```

## 🔧 API Endpoints

### Post Management
```
GET    /posts                    # Lấy danh sách post
GET    /posts/:id               # Lấy chi tiết post
POST   /posts                   # Tạo post mới
PATCH  /posts/:id               # Cập nhật post
DELETE /posts/:id               # Xóa post
GET    /posts/my-posts          # Lấy post của user hiện tại
```

### Image Upload
```
POST   /posts/:id/upload-images # Upload ảnh cho post
DELETE /posts/:id/images/:index # Xóa ảnh từ post
```

### Admin/CA User
```
PATCH  /posts/:id/status        # Cập nhật status (admin/ca_user)
PATCH  /posts/:id/toggle-pin    # Pin/unpin post (admin/ca_user)
```

## 🎨 WYSIWYG Editor Features

- **Rich text editing**: Bold, italic, lists, alignment
- **Image upload**: Drag & drop hoặc click để upload
- **Auto-save**: Tự động lưu khi thay đổi
- **Responsive**: Hoạt động tốt trên mobile
- **Customizable**: Có thể tùy chỉnh toolbar và plugins

## 🔒 Security & Permissions

- **Post creation**: Ai cũng có thể tạo
- **Post editing**: Chỉ author mới được sửa
- **Post deletion**: Author hoặc admin/ca_user
- **Image upload**: Chỉ author mới được upload ảnh
- **File validation**: Chỉ cho phép image files (JPEG, PNG, GIF, WebP)
- **File size limit**: 10MB mỗi ảnh, tối đa 10 ảnh

## 📧 Email Notifications

- **Post deleted**: Gửi email cho author khi post bị xóa bởi admin/ca_user
- **Status changed**: Gửi email khi status thay đổi
- **Comment marked as solution**: Gửi email cho commenter

## 🎯 Next Steps

1. **Chạy migration** để cập nhật database
2. **Test API** với Postman hoặc curl
3. **Test frontend** với WYSIWYG editor
4. **Customize** editor theo nhu cầu
5. **Add more features** như image gallery, video upload, etc.

## 🐛 Troubleshooting

### Lỗi thường gặp:
1. **Migration failed**: Kiểm tra database connection
2. **Upload failed**: Kiểm tra thư mục uploads có quyền write
3. **Editor not loading**: Kiểm tra TinyMCE license (free version có watermark)
4. **CORS error**: Kiểm tra CORS config trong main.ts

### Debug:
```bash
# Backend logs
cd backend && npm run start:dev

# Frontend logs
cd frontend && npm run dev

# Database
cd backend && npx prisma studio
``` 