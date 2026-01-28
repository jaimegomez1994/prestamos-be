import { Router } from 'express';
import { InvestorController } from '../controllers/investor.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// All investor routes require authentication
router.use(requireAuth);

// GET /api/investors - List all investors
router.get('/', InvestorController.getAll);

export { router as investorRoutes };
