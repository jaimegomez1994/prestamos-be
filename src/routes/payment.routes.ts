import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { requireAuth, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createPaymentValidation,
  updatePaymentValidation,
} from '../validators/payment.validators';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// GET /api/payments - List all payments
router.get('/', PaymentController.getAll);

// GET /api/payments/loan/:loanId - Get payments by loan
router.get('/loan/:loanId', PaymentController.getByLoanId);

// GET /api/payments/:id - Get payment by ID
router.get('/:id', PaymentController.getById);

// POST /api/payments - Create payment (admin/operator only)
router.post(
  '/',
  requireRole('admin', 'operator'),
  createPaymentValidation,
  validate,
  PaymentController.create
);

// PUT /api/payments/:id - Update payment (admin/operator only)
router.put(
  '/:id',
  requireRole('admin', 'operator'),
  updatePaymentValidation,
  validate,
  PaymentController.update
);

// DELETE /api/payments/:id - Delete payment (admin only)
router.delete('/:id', requireRole('admin'), PaymentController.delete);

export { router as paymentRoutes };
