import { body } from 'express-validator';

export const createCustomerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Nombre requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nombre debe tener entre 2 y 100 caracteres'),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Telefono no puede exceder 20 caracteres'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notas no pueden exceder 500 caracteres'),
];

export const updateCustomerValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nombre debe tener entre 2 y 100 caracteres'),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Telefono no puede exceder 20 caracteres'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notas no pueden exceder 500 caracteres'),
];
