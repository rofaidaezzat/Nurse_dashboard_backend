import { Router } from 'express';
import * as staffController from '../controllers/staff.controller';
import protect from '../middlewares/auth.middleware';
import { uploadStaffDocuments } from '../middlewares/upload.middleware';

const router = Router();

// All routes require authentication
router.use(protect);

router
  .route('/')
  .get(staffController.getAllStaff)
  .post(uploadStaffDocuments, staffController.createStaff);

router.get('/dashboard/overview', staffController.getDashboardOverview);

router
  .route('/:id')
  .get(staffController.getStaffById)
  .put(uploadStaffDocuments, staffController.updateStaff)
  .delete(staffController.deleteStaff);

export default router;
