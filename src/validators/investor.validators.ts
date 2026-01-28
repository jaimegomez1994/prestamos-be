import { body } from 'express-validator';

export const createInvestorValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Nombre requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nombre debe tener entre 2 y 100 caracteres'),
  body('profitPercentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Porcentaje de ganancia debe estar entre 0 y 100'),
];

export const updateInvestorValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nombre debe tener entre 2 y 100 caracteres'),
  body('profitPercentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Porcentaje de ganancia debe estar entre 0 y 100'),
];
