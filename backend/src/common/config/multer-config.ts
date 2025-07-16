import * as multer from 'multer';
import * as path from 'path';
import { Request } from 'express'; // vẫn giữ

export const multerCompanyLogoConfig: multer.Options = {
  storage: multer.diskStorage({
    destination: './uploads/company-logos',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `company-logo-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  }),
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback, // ✅ dùng kiểu đúng của Multer
  ) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
};
