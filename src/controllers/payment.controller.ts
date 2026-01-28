import type { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import type { PaymentFilters } from '../types/payment.types';

export class PaymentController {
  static async getAll(req: Request, res: Response) {
    try {
      const filters: PaymentFilters = {
        search: req.query.search as string,
        loanId: req.query.loanId as string,
        customerId: req.query.customerId as string,
        investorId: req.query.investorId as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : undefined,
      };

      const result = await PaymentService.getAll(filters);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener pagos' });
    }
  }

  static async getById(req: Request<{ id: string }>, res: Response) {
    try {
      const payment = await PaymentService.getById(req.params.id);
      res.json(payment);
    } catch (error) {
      if (error instanceof Error && error.message === 'Pago no encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Error al obtener pago' });
    }
  }

  static async getByLoanId(req: Request<{ loanId: string }>, res: Response) {
    try {
      const payments = await PaymentService.getByLoanId(req.params.loanId);
      res.json({ payments });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener pagos del prestamo' });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const payment = await PaymentService.create(req.body, userId);
      res.status(201).json(payment);
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message === 'Prestamo no encontrado' ||
          error.message.includes('No se puede registrar') ||
          error.message.includes('no pueden ser negativos') ||
          error.message.includes('Debe ingresar') ||
          error.message.includes('excede el saldo')
        ) {
          return res.status(400).json({ error: error.message });
        }
      }
      res.status(500).json({ error: 'Error al crear pago' });
    }
  }

  static async update(req: Request<{ id: string }>, res: Response) {
    try {
      const payment = await PaymentService.update(req.params.id, req.body);
      res.json(payment);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Pago no encontrado') {
          return res.status(404).json({ error: error.message });
        }
        if (
          error.message.includes('No se puede modificar') ||
          error.message.includes('excede el saldo')
        ) {
          return res.status(400).json({ error: error.message });
        }
      }
      res.status(500).json({ error: 'Error al actualizar pago' });
    }
  }

  static async delete(req: Request<{ id: string }>, res: Response) {
    try {
      await PaymentService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Pago no encontrado') {
          return res.status(404).json({ error: error.message });
        }
        if (error.message.includes('No se puede eliminar')) {
          return res.status(400).json({ error: error.message });
        }
      }
      res.status(500).json({ error: 'Error al eliminar pago' });
    }
  }
}
