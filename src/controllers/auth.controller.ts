import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthService } from '../services/auth.service';
import type { LoginDTO } from '../types/auth.types';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: { code: 'VALIDATION_ERROR', message: 'Datos inválidos', details: errors.array() },
        });
      }

      const data: LoginDTO = req.body;
      const result = await AuthService.login(data);

      res.json(result);
    } catch (error) {
      console.error('Login error:', error);
      const message = error instanceof Error ? error.message : 'Error del servidor';
      const statusCode = message.includes('inválidas') ? 401 : 500;

      res.status(statusCode).json({
        error: { code: statusCode === 401 ? 'UNAUTHORIZED' : 'SERVER_ERROR', message },
      });
    }
  }

  static async me(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: { code: 'UNAUTHORIZED', message: 'No autenticado' },
        });
      }

      const result = await AuthService.getCurrentUser(req.user.userId);
      res.json(result);
    } catch (error) {
      console.error('Get me error:', error);
      const message = error instanceof Error ? error.message : 'Error del servidor';
      const statusCode = message.includes('no encontrado') ? 404 : 500;

      res.status(statusCode).json({
        error: { code: statusCode === 404 ? 'NOT_FOUND' : 'SERVER_ERROR', message },
      });
    }
  }
}
