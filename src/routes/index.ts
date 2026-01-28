import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { customerRoutes } from './customer.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);

export { router as apiRoutes };
