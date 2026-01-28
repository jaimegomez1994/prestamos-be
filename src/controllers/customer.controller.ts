import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { CustomerService } from '../services/customer.service';
import type { CustomerDTO, CustomerFilters } from '../types/customer.types';

export class CustomerController {
  static async getAll(req: Request, res: Response) {
    try {
      const filters: CustomerFilters = {
        search: req.query.search as string | undefined,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 20,
      };

      const result = await CustomerService.getAll(filters);
      res.json(result);
    } catch (error) {
      console.error('Get customers error:', error);
      res.status(500).json({
        error: { code: 'SERVER_ERROR', message: 'Error al obtener clientes' },
      });
    }
  }

  static async getById(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      const result = await CustomerService.getById(id);
      res.json(result);
    } catch (error) {
      console.error('Get customer error:', error);
      const message = error instanceof Error ? error.message : 'Error del servidor';
      const statusCode = message.includes('no encontrado') ? 404 : 500;

      res.status(statusCode).json({
        error: { code: statusCode === 404 ? 'NOT_FOUND' : 'SERVER_ERROR', message },
      });
    }
  }

  static async getByIdWithLoans(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      const result = await CustomerService.getByIdWithLoans(id);
      res.json(result);
    } catch (error) {
      console.error('Get customer with loans error:', error);
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
          error: { code: 'VALIDATION_ERROR', message: 'Datos inválidos', details: errors.array() },
        });
      }

      const data: CustomerDTO = req.body;
      const result = await CustomerService.create(data);

      res.status(201).json(result);
    } catch (error) {
      console.error('Create customer error:', error);
      res.status(500).json({
        error: { code: 'SERVER_ERROR', message: 'Error al crear cliente' },
      });
    }
  }

  static async update(req: Request<{ id: string }>, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: { code: 'VALIDATION_ERROR', message: 'Datos inválidos', details: errors.array() },
        });
      }

      const { id } = req.params;
      const data: Partial<CustomerDTO> = req.body;
      const result = await CustomerService.update(id, data);

      res.json(result);
    } catch (error) {
      console.error('Update customer error:', error);
      const message = error instanceof Error ? error.message : 'Error del servidor';
      const statusCode = message.includes('no encontrado') ? 404 : 500;

      res.status(statusCode).json({
        error: { code: statusCode === 404 ? 'NOT_FOUND' : 'SERVER_ERROR', message },
      });
    }
  }

  static async deactivate(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      const result = await CustomerService.deactivate(id);
      res.json(result);
    } catch (error) {
      console.error('Deactivate customer error:', error);
      const message = error instanceof Error ? error.message : 'Error del servidor';
      const statusCode = message.includes('no encontrado') ? 404 : 500;

      res.status(statusCode).json({
        error: { code: statusCode === 404 ? 'NOT_FOUND' : 'SERVER_ERROR', message },
      });
    }
  }

  static async activate(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      const result = await CustomerService.activate(id);
      res.json(result);
    } catch (error) {
      console.error('Activate customer error:', error);
      const message = error instanceof Error ? error.message : 'Error del servidor';
      const statusCode = message.includes('no encontrado') ? 404 : 500;

      res.status(statusCode).json({
        error: { code: statusCode === 404 ? 'NOT_FOUND' : 'SERVER_ERROR', message },
      });
    }
  }
}
