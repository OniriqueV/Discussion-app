// import { Injectable } from '@nestjs/common';
// import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
// import { diskStorage } from 'multer';
// import { extname, join } from 'path';
// import * as fs from 'fs';

// @Injectable()
// export class UploadService {
//   private readonly uploadsPath = join(process.cwd(), 'uploads');

//   constructor() {
//     // Ensure uploads directories exist
//     this.ensureUploadsDirectories();
//   }

//   private ensureUploadsDirectories() {
//     const directories = ['post-images', 'temp', 'avatars'];
    
//     directories.forEach(dir => {
//       const dirPath = join(this.uploadsPath, dir);
//       if (!fs.existsSync(dirPath)) {
//         fs.mkdirSync(dirPath, { recursive: true });
//       }
//     });
//   }

//   getMulterOptions(destination: string): MulterOptions {
//     return {
//       storage: diskStorage({
//         destination: (req, file, cb) => {
//           const destPath = join(this.uploadsPath, destination);
//           cb(null, destPath);
//         },
//         filename: (req, file, cb) => {
//           const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//           cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
//         },
//       }),
//       fileFilter: (req, file, cb) => {
//         if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
//           cb(null, true);
//         } else {
//           cb(new Error('Only image files are allowed!'), false);
//         }
//       },
//       limits: {
//         fileSize: 5 * 1024 * 1024, // 5MB
//       },
//     };
//   }

//   // Convert relative path to full URL
//   getFileUrl(relativePath: string): string {
//     const baseUrl = process.env.API_URL || 'http://localhost:3001';
//     return `${baseUrl}/uploads/${relativePath}`;
//   }
// }