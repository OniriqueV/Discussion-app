# Migration Commands

Để cập nhật database schema với field images cho Post, chạy lệnh sau:

```bash
cd backend
npx prisma migrate dev --name add_images_to_post
```

Sau khi chạy migration thành công, uncomment các dòng có comment "// Uncomment after running migration" trong:
- `src/posts/posts.service.ts`
- `src/posts/posts.controller.ts`

## Các API mới được thêm:

### 1. Upload ảnh cho post
```
POST /posts/:id/upload-images
Content-Type: multipart/form-data
Body: images (array of files, max 10 files, 10MB each)
```

### 2. Xóa ảnh từ post
```
DELETE /posts/:id/images/:imageIndex
```

### 3. Cập nhật DTO để hỗ trợ ảnh
- `CreatePostDto` và `UpdatePostDto` đã có field `images?: string[]`

## Cấu trúc thư mục upload:
```
backend/uploads/
├── company-logos/     # Logo công ty
└── post-images/       # Ảnh bài post
``` 