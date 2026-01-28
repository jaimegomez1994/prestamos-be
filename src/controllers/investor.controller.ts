import { Request, Response } from 'express';
import { InvestorService } from '../services/investor.service';
import type { InvestorFilters } from '../types/investor.types';

export class InvestorController {
  static async getAll(req: Request, res: Response) {
    try {
      const filters: InvestorFilters = {
        search: req.query.search as string | undefined,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : 50,
      };

      const result = await InvestorService.getAll(filters);
      res.json(result);
    } catch (error) {
      console.error('Get investors error:', error);
      res.status(500).json({
        error: { code: 'SERVER_ERROR', message: 'Error al obtener inversores' },
      });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const investor = await InvestorService.getById(id);
      res.json(investor);
    } catch (error) {
      console.error('Get investor error:', error);
      if (error instanceof Error && error.message === 'Inversor no encontrado') {
        return res.status(404).json({
          error: { code: 'NOT_FOUND', message: error.message },
        });
      }
      res.status(500).json({
        error: { code: 'SERVER_ERROR', message: 'Error al obtener inversor' },
      });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const investor = await InvestorService.create(req.body);
      res.status(201).json(investor);
    } catch (error) {
      console.error('Create investor error:', error);
      res.status(500).json({
        error: { code: 'SERVER_ERROR', message: 'Error al crear inversor' },
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const investor = await InvestorService.update(id, req.body);
      res.json(investor);
    } catch (error) {
      console.error('Update investor error:', error);
      if (error instanceof Error && error.message === 'Inversor no encontrado') {
        return res.status(404).json({
          error: { code: 'NOT_FOUND', message: error.message },
        });
      }
      res.status(500).json({
        error: { code: 'SERVER_ERROR', message: 'Error al actualizar inversor' },
      });
    }
  }

  static async deactivate(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const investor = await InvestorService.deactivate(id);
      res.json(investor);
    } catch (error) {
      console.error('Deactivate investor error:', error);
      if (error instanceof Error && error.message === 'Inversor no encontrado') {
        return res.status(404).json({
          error: { code: 'NOT_FOUND', message: error.message },
        });
      }
      res.status(500).json({
        error: { code: 'SERVER_ERROR', message: 'Error al desactivar inversor' },
      });
    }
  }

  static async activate(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const investor = await InvestorService.activate(id);
      res.json(investor);
    } catch (error) {
      console.error('Activate investor error:', error);
      if (error instanceof Error && error.message === 'Inversor no encontrado') {
        return res.status(404).json({
          error: { code: 'NOT_FOUND', message: error.message },
        });
      }
      res.status(500).json({
        error: { code: 'SERVER_ERROR', message: 'Error al activar inversor' },
      });
    }
  }
}
