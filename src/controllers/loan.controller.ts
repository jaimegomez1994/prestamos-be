import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { LoanService } from '../services/loan.service';
import type { CreateLoanDTO, UpdateLoanDTO, LoanFilters } from '../types/loan.types';

export class LoanController {
  static async getAll(req: Request, res: Response) {
    try {
      const filters: LoanFilters = {
        search: req.query.search as string | undefined,
        customerId: req.query.customerId as string | undefined,
        investorId: req.query.investorId as string | undefined,
        isSettled: req.query.isSettled === 'true' ? true : req.query.isSettled === 'false' ? false : undefined,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 20,
      };

      const result = await LoanService.getAll(filters);
      res.json(result);
    } catch (error) {
      console.error('Get loans error:', error);
      res.status(500).json({
        error: { code: 'SERVER_ERROR', message: 'Error al obtener prestamos' },
      });
    }
  }

  static async getById(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      const result = await LoanService.getById(id);
      res.json(result);
    } catch (error) {
      console.error('Get loan error:', error);
      const message = error instanceof Error ? error.message : 'Error del servidor';
      const statusCode = message.includes('no encontrado') ? 404 : 500;

      res.status(statusCode).json({
        error: { code: statusCode === 404 ? 'NOT_FOUND' : 'SERVER_ERROR', message },
      });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: { code: 'VALIDATION_ERROR', message: 'Datos invalidos', details: errors.array() },
        });
      }

      const data: CreateLoanDTO = req.body;
      const userId = req.user?.userId;
      const result = await LoanService.create(data, userId);

      res.status(201).json(result);
    } catch (error) {
      console.error('Create loan error:', error);
      const message = error instanceof Error ? error.message : 'Error del servidor';
      const statusCode = message.includes('no encontrado') ? 400 : 500;

      res.status(statusCode).json({
        error: { code: statusCode === 400 ? 'BAD_REQUEST' : 'SERVER_ERROR', message },
      });
    }
  }

  static async update(req: Request<{ id: string }>, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: { code: 'VALIDATION_ERROR', message: 'Datos invalidos', details: errors.array() },
        });
      }

      const { id } = req.params;
      const data: UpdateLoanDTO = req.body;
      const result = await LoanService.update(id, data);

      res.json(result);
    } catch (error) {
      console.error('Update loan error:', error);
      const message = error instanceof Error ? error.message : 'Error del servidor';
      const statusCode = message.includes('no encontrado') ? 404 : 500;

      res.status(statusCode).json({
        error: { code: statusCode === 404 ? 'NOT_FOUND' : 'SERVER_ERROR', message },
      });
    }
  }

  static async settle(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      const result = await LoanService.settle(id);
      res.json(result);
    } catch (error) {
      console.error('Settle loan error:', error);
      const message = error instanceof Error ? error.message : 'Error del servidor';
      const statusCode = message.includes('no encontrado') ? 404 : message.includes('ya esta') ? 400 : 500;

      res.status(statusCode).json({
        error: { code: statusCode === 404 ? 'NOT_FOUND' : statusCode === 400 ? 'BAD_REQUEST' : 'SERVER_ERROR', message },
      });
    }
  }

  static async reopen(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      const result = await LoanService.reopen(id);
      res.json(result);
    } catch (error) {
      console.error('Reopen loan error:', error);
      const message = error instanceof Error ? error.message : 'Error del servidor';
      const statusCode = message.includes('no encontrado') ? 404 : message.includes('no esta') ? 400 : 500;

      res.status(statusCode).json({
        error: { code: statusCode === 404 ? 'NOT_FOUND' : statusCode === 400 ? 'BAD_REQUEST' : 'SERVER_ERROR', message },
      });
    }
  }
}
