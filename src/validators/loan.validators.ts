import { body } from 'express-validator';

export const createLoanValidation = [
  body('customerId')
    .notEmpty()
    .withMessage('Cliente requerido')
    .isUUID()
    .withMessage('ID de cliente invalido'),
  body('investorId')
    .notEmpty()
    .withMessage('Inversor requerido')
    .isUUID()
    .withMessage('ID de inversor invalido'),
  body('originalAmount')
    .notEmpty()
    .withMessage('Monto requerido')
    .isFloat({ min: 1 })
    .withMessage('Monto debe ser mayor a 0'),
  body('loanDate')
    .notEmpty()
    .withMessage('Fecha requerida')
    .isISO8601()
    .withMessage('Fecha invalida'),
  body('paymentMethod')
    .optional()
    .isIn(['TJ', 'TM', 'T', 'EFECTIVO'])
    .withMessage('Metodo de pago invalido'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notas no pueden exceder 500 caracteres'),
];

export const updateLoanValidation = [
  body('paymentMethod')
    .optional()
    .isIn(['TJ', 'TM', 'T', 'EFECTIVO'])
    .withMessage('Metodo de pago invalido'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notas no pueden exceder 500 caracteres'),
];
