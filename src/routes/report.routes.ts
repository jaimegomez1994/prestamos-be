import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// All report routes require authentication
router.use(requireAuth);

// GET /api/reports/investors - Get investor report
router.get('/investors', ReportController.getInvestorReport);

// GET /api/reports/payments - Get payment summary
router.get('/payments', ReportController.getPaymentSummary);

// GET /api/reports/portfolio - Get portfolio summary
router.get('/portfolio', ReportController.getPortfolioSummary);

export { router as reportRoutes };
