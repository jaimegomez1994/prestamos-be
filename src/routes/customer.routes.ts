import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { requireAuth, requireRole } from '../middleware/auth';
import { createCustomerValidation, updateCustomerValidation } from '../validators/customer.validators';

const router = Router();

// All customer routes require authentication
router.use(requireAuth);

// GET /api/customers - List all customers
router.get('/', CustomerController.getAll);

// GET /api/customers/:id - Get customer by ID
router.get('/:id', CustomerController.getById);

// GET /api/customers/:id/loans - Get customer with loans
router.get('/:id/loans', CustomerController.getByIdWithLoans);

// POST /api/customers - Create customer (admin, operator only)
router.post(
  '/',
  requireRole('admin', 'operator'),
  createCustomerValidation,
  CustomerController.create
);

// PUT /api/customers/:id - Update customer (admin, operator only)
router.put(
  '/:id',
  requireRole('admin', 'operator'),
  updateCustomerValidation,
  CustomerController.update
);

// POST /api/customers/:id/deactivate - Deactivate customer (admin only)
router.post(
  '/:id/deactivate',
  requireRole('admin'),
  CustomerController.deactivate
);

// POST /api/customers/:id/activate - Activate customer (admin only)
router.post(
  '/:id/activate',
  requireRole('admin'),
  CustomerController.activate
);

export { router as customerRoutes };
