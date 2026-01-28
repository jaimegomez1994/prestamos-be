import { body } from 'express-validator';

export const createPaymentValidation = [
  body('loanId')
    .notEmpty()
    .withMessage('El ID del prestamo es requerido')
    .isUUID()
    .withMessage('ID de prestamo invalido'),
  body('paymentDate')
    .notEmpty()
    .withMessage('La fecha de pago es requerida')
    .isISO8601()
    .withMessage('Fecha invalida'),
  body('interestPaid')
    .notEmpty()
    .withMessage('El monto de interes es requerido')
    .isFloat({ min: 0 })
    .withMessage('El monto de interes debe ser mayor o igual a 0'),
  body('capitalPaid')
    .notEmpty()
    .withMessage('El monto de capital es requerido')
    .isFloat({ min: 0 })
    .withMessage('El monto de capital debe ser mayor o igual a 0'),
  body('paymentMethod')
    .notEmpty()
    .withMessage('El metodo de pago es requerido')
    .isIn(['EFECTIVO', 'TRANSFERENCIA'])
    .withMessage('Metodo de pago invalido'),
  body('notes').optional().isString().trim(),
];

export const updatePaymentValidation = [
  body('paymentDate').optional().isISO8601().withMessage('Fecha invalida'),
  body('interestPaid')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El monto de interes debe ser mayor o igual a 0'),
  body('capitalPaid')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El monto de capital debe ser mayor o igual a 0'),
  body('paymentMethod')
    .optional()
    .isIn(['EFECTIVO', 'TRANSFERENCIA'])
    .withMessage('Metodo de pago invalido'),
  body('notes').optional().isString().trim(),
];
