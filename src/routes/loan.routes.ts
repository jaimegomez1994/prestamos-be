import { Router } from 'express';
import { LoanController } from '../controllers/loan.controller';
import { requireAuth, requireRole } from '../middleware/auth';
import { createLoanValidation, updateLoanValidation } from '../validators/loan.validators';

const router = Router();

// All loan routes require authentication
router.use(requireAuth);

// GET /api/loans - List all loans
router.get('/', LoanController.getAll);

// GET /api/loans/:id - Get loan by ID
router.get('/:id', LoanController.getById);

// POST /api/loans - Create loan (admin, operator only)
router.post(
  '/',
  requireRole('admin', 'operator'),
  createLoanValidation,
  LoanController.create
);

// PUT /api/loans/:id - Update loan (admin, operator only)
router.put(
  '/:id',
  requireRole('admin', 'operator'),
  updateLoanValidation,
  LoanController.update
);

// POST /api/loans/:id/reopen - Reopen settled loan (admin only)
router.post(
  '/:id/reopen',
  requireRole('admin'),
  LoanController.reopen
);

export { router as loanRoutes };
