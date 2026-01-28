import { Request, Response } from 'express';
import { InvestorService } from '../services/investor.service';

export class InvestorController {
  static async getAll(req: Request, res: Response) {
    try {
      const activeOnly = req.query.activeOnly !== 'false';
      const result = await InvestorService.getAll(activeOnly);
      res.json(result);
    } catch (error) {
      console.error('Get investors error:', error);
      res.status(500).json({
        error: { code: 'SERVER_ERROR', message: 'Error al obtener inversores' },
      });
    }
  }
}
