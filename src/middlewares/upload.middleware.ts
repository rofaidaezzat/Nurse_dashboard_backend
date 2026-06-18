import multer, { FileFilterCallback } from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { Request } from 'express';
import cloudinary from '../config/cloudinary';

// ─── Cloudinary Storage for Staff Documents & Profiles ──────────────────────
const staffStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'nurse_dashboard/staff',
    resource_type: 'auto',
  } as any,
});

// ─── File Filter ─────────────────────────────────────────────────────────────
const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf'
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, WEBP, GIF) and PDF are allowed!'));
  }
};

// ─── Cloudinary Storage for General Uploads ──────────────────────────────────
const generalStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'nurse_dashboard/uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  } as any,
});

// ─── Multer Instances ─────────────────────────────────────────────────────────
export const uploadStaffDocuments = multer({
  storage: staffStorage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max per file
}).fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'aclsCertificate', maxCount: 1 },
  { name: 'blsCertificate', maxCount: 1 },
  { name: 'vaccination', maxCount: 1 },
  { name: 'infectionControlCertificate', maxCount: 1 },
  { name: 'copyId', maxCount: 1 },
  { name: 'copyPassport', maxCount: 1 },
  { name: 'passportPhoto', maxCount: 1 },
  { name: 'emiratesId', maxCount: 1 },
]);

export const uploadSingleImage = multer({
  storage: generalStorage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
}).single('image');
