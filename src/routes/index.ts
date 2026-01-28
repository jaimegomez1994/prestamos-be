import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { customerRoutes } from './customer.routes';
import { loanRoutes } from './loan.routes';
import { investorRoutes } from './investor.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/loans', loanRoutes);
router.use('/investors', investorRoutes);

export { router as apiRoutes };
