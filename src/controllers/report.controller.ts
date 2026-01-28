import { Request, Response } from 'express';
import { ReportService } from '../services/report.service';
import type { ReportFilters } from '../types/report.types';

export class ReportController {
  static async getInvestorReport(req: Request, res: Response) {
    try {
      const filters: ReportFilters = {
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        investorId: req.query.investorId as string | undefined,
      };

      const result = await ReportService.getInvestorReport(filters);
      res.json(result);
    } catch (error) {
      console.error('Get investor report error:', error);
      res.status(500).json({
        error: { code: 'SERVER_ERROR', message: 'Error al generar reporte de inversores' },
      });
    }
  }

  static async getPaymentSummary(req: Request, res: Response) {
    try {
      const filters: ReportFilters = {
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        investorId: req.query.investorId as string | undefined,
      };

      const groupBy = (req.query.groupBy as 'month' | 'week') || 'month';

      const result = await ReportService.getPaymentSummary(filters, groupBy);
      res.json(result);
    } catch (error) {
      console.error('Get payment summary error:', error);
      res.status(500).json({
        error: { code: 'SERVER_ERROR', message: 'Error al generar resumen de pagos' },
      });
    }
  }

  static async getPortfolioSummary(req: Request, res: Response) {
    try {
      const result = await ReportService.getPortfolioSummary();
      res.json(result);
    } catch (error) {
      console.error('Get portfolio summary error:', error);
      res.status(500).json({
        error: { code: 'SERVER_ERROR', message: 'Error al generar resumen de cartera' },
      });
    }
  }
}
