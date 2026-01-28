import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';
import { loginValidation } from '../validators/auth.validators';

const router = Router();

router.post('/login', loginValidation, AuthController.login);
router.get('/me', requireAuth, AuthController.me);

export { router as authRoutes };
