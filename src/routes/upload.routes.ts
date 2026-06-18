import { Router } from 'express';
import * as uploadController from '../controllers/upload.controller';
import protect from '../middlewares/auth.middleware';
import { uploadSingleImage } from '../middlewares/upload.middleware';

const router = Router();

router.use(protect);

router.post('/image', uploadSingleImage as any, uploadController.uploadImage); // POST   /api/v1/upload/image
router.delete('/image/:publicId', uploadController.deleteImage);               // DELETE /api/v1/upload/image/:publicId

export default router;
