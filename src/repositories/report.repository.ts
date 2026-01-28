import { prisma } from '../lib/prisma';
import type { ReportFilters } from '../types/report.types';

export class ReportRepository {
  static async getInvestorStats(filters: ReportFilters) {
    const { startDate, endDate, investorId } = filters;

    const investors = await prisma.investor.findMany({
      where: investorId ? { id: investorId } : undefined,
      include: {
        loans: {
          include: {
            payments: {
              where: {
                ...(startDate || endDate
                  ? {
                      paymentDate: {
                        ...(startDate ? { gte: new Date(startDate) } : {}),
                        ...(endDate ? { lte: new Date(endDate) } : {}),
                      },
                    }
                  : {}),
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return investors;
  }

  static async getPaymentsByPeriod(filters: ReportFilters, groupBy: 'month' | 'week' = 'month') {
    const { startDate, endDate, investorId } = filters;

    const where: Record<string, unknown> = {};

    if (startDate || endDate) {
      where.paymentDate = {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDate ? { lte: new Date(endDate) } : {}),
      };
    }

    if (investorId) {
      where.loan = { investorId };
    }

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { paymentDate: 'asc' },
    });

    return payments;
  }

  static async getPortfolioStats() {
    const [
      activeLoans,
      settledLoans,
      payments,
      customers,
      investors,
    ] = await Promise.all([
      prisma.loan.aggregate({
        where: { isSettled: false },
        _count: true,
        _sum: { originalAmount: true },
      }),
      prisma.loan.aggregate({
        where: { isSettled: true },
        _count: true,
        _sum: { originalAmount: true },
      }),
      prisma.payment.aggregate({
        _sum: {
          interestPaid: true,
          capitalPaid: true,
        },
      }),
      prisma.customer.groupBy({
        by: ['isActive'],
        _count: true,
      }),
      prisma.investor.groupBy({
        by: ['isActive'],
        _count: true,
      }),
    ]);

    return {
      activeLoans,
      settledLoans,
      payments,
      customers,
      investors,
    };
  }
}
