import { prisma } from '../lib/prisma';
import type { ReportFilters } from '../types/report.types';

export class ReportRepository {
  static async getInvestorStats(filters: ReportFilters) {
    const { startDate, endDate, investorId } = filters;
    const hasDateFilter = !!(startDate || endDate);

    const dateWhere = hasDateFilter
      ? {
          paymentDate: {
            ...(startDate ? { gte: new Date(startDate) } : {}),
            ...(endDate ? { lte: new Date(endDate) } : {}),
          },
        }
      : {};

    const investors = await prisma.investor.findMany({
      where: investorId ? { id: investorId } : undefined,
      include: {
        loans: {
          include: {
            payments: {
              where: dateWhere,
            },
            // Include all payments count for balance calculation
            _count: {
              select: { payments: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // If date filter is active, also fetch all payments for balance calculation
    if (hasDateFilter) {
      const investorsWithAllPayments = await prisma.investor.findMany({
        where: investorId ? { id: investorId } : undefined,
        include: {
          loans: {
            where: { isSettled: false },
            include: {
              payments: {
                select: { capitalPaid: true },
              },
            },
          },
        },
      });

      // Attach balance data
      const balanceMap = new Map<string, number>();
      for (const inv of investorsWithAllPayments) {
        let balance = 0;
        for (const loan of inv.loans) {
          const paidCapital = loan.payments.reduce((s, p) => s + Number(p.capitalPaid), 0);
          balance += Number(loan.originalAmount) - paidCapital;
        }
        balanceMap.set(inv.id, balance);
      }

      return investors.map((inv) => ({
        ...inv,
        _currentOutstandingBalance: balanceMap.get(inv.id) ?? 0,
      }));
    }

    return investors.map((inv) => ({
      ...inv,
      _currentOutstandingBalance: undefined as number | undefined,
    }));
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
