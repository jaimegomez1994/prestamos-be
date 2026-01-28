import { body } from 'express-validator';

export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Email válido requerido')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Contraseña requerida'),
];
