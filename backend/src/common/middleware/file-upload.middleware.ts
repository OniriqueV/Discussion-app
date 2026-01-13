import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as multer from 'multer';
import * as path from 'path';

@Injectable()
export class FileUploadMiddleware implements NestMiddleware {
  private upload = multer({
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
        cb: (error: Error | null, acceptFile: boolean) => void
        ) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false); // ✅ không lỗi nữa
        }
        }
,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  });

  use(req: Request, res: Response, next: NextFunction) {
    this.upload.single('logo')(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            throw new BadRequestException('File size too large (max 5MB)');
          }
        }

        // Custom error thrown from fileFilter
        if (err.message === 'Only image files are allowed') {
          throw new BadRequestException(err.message);
        }

        throw new BadRequestException('File upload error');
      }
      next();
    });
  }
}

@Injectable()
export class PostImagesUploadMiddleware implements NestMiddleware {
  private upload = multer({
    storage: multer.diskStorage({
      destination: './uploads/post-images',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `post-image-${uniqueSuffix}${path.extname(file.originalname)}`);
      },
    }),
    fileFilter: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, acceptFile: boolean) => void
    ) => {
      const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'), false);
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB per image
    },
  });

  use(req: Request, res: Response, next: NextFunction) {
    this.upload.array('images', 10)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            throw new BadRequestException('File size too large (max 10MB per image)');
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            throw new BadRequestException('Too many files (max 10 images)');
          }
        }

        if (err.message === 'Only image files are allowed') {
          throw new BadRequestException(err.message);
        }

        throw new BadRequestException('File upload error');
      }
      next();
    });
  }
}
