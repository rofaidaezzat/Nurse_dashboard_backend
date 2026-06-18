import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import protect from '../middlewares/auth.middleware';

const router = Router();

router.post('/login',    authController.login);    // POST /api/v1/auth/login
router.get('/me', protect, authController.getMe);  // GET  /api/v1/auth/me

export default router;
