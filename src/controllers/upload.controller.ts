import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';

// ─── POST /api/v1/upload/image ───────────────────────────────────────────────
// Accepts a multipart image and uploads directly to Cloudinary
export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No image file provided' });
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Image uploaded successfully',
    data: {
      url:      req.file.path,
      publicId: req.file.filename,
    },
  });
};

// ─── DELETE /api/v1/upload/image/:publicId ───────────────────────────────────
export const deleteImage = async (req: Request, res: Response): Promise<void> => {
  const { publicId } = req.params;

  if (!publicId) {
    res.status(400).json({ success: false, message: 'Public ID is required' });
    return;
  }

  const result = await cloudinary.uploader.destroy(publicId as string);

  if (result.result !== 'ok') {
    res.status(404).json({ success: false, message: 'Image not found or already deleted' });
    return;
  }

  res.status(200).json({ success: true, message: 'Image deleted successfully' });
};
