import { Router } from 'express';
import { InvestorController } from '../controllers/investor.controller';
import { requireAuth, requireRole } from '../middleware/auth';
import { createInvestorValidation, updateInvestorValidation } from '../validators/investor.validators';
import { validate } from '../middleware/validate';

const router = Router();

// All investor routes require authentication
router.use(requireAuth);

// GET /api/investors - List all investors
router.get('/', InvestorController.getAll);

// GET /api/investors/:id - Get investor by ID
router.get('/:id', InvestorController.getById);

// POST /api/investors - Create investor (admin only)
router.post('/', requireRole('admin'), createInvestorValidation, validate, InvestorController.create);

// PUT /api/investors/:id - Update investor (admin only)
router.put('/:id', requireRole('admin'), updateInvestorValidation, validate, InvestorController.update);

// POST /api/investors/:id/deactivate - Deactivate investor (admin only)
router.post('/:id/deactivate', requireRole('admin'), InvestorController.deactivate);

// POST /api/investors/:id/activate - Activate investor (admin only)
router.post('/:id/activate', requireRole('admin'), InvestorController.activate);

export { router as investorRoutes };
