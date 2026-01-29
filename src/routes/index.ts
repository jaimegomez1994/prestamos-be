import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { customerRoutes } from './customer.routes';
import { loanRoutes } from './loan.routes';
import { investorRoutes } from './investor.routes';
import { paymentRoutes } from './payment.routes';
import { reportRoutes } from './report.routes';
import { attachmentRoutes } from './attachment.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/loans', loanRoutes);
router.use('/investors', investorRoutes);
router.use('/payments', paymentRoutes);
router.use('/reports', reportRoutes);
router.use('/attachments', attachmentRoutes);

export { router as apiRoutes };
