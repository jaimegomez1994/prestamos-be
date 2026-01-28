import { ReportRepository } from '../repositories/report.repository';
import type {
  InvestorReportResponse,
  InvestorReportItem,
  PaymentSummaryResponse,
  PaymentSummaryItem,
  PortfolioSummaryResponse,
  ReportFilters,
} from '../types/report.types';

export class ReportService {
  static async getInvestorReport(filters: ReportFilters): Promise<InvestorReportResponse> {
    const investors = await ReportRepository.getInvestorStats(filters);

    const investorItems: InvestorReportItem[] = investors.map((investor) => {
      const activeLoans = investor.loans.filter((l) => !l.isSettled);
      const settledLoans = investor.loans.filter((l) => l.isSettled);

      const totalInvested = activeLoans.reduce(
        (sum, loan) => sum + Number(loan.originalAmount),
        0
      );

      const totalInterestEarned = investor.loans.reduce(
        (sum, loan) =>
          sum +
          loan.payments.reduce((pSum, p) => pSum + Number(p.interestPaid), 0),
        0
      );

      const totalCapitalReturned = investor.loans.reduce(
        (sum, loan) =>
          sum +
          loan.payments.reduce((pSum, p) => pSum + Number(p.capitalPaid), 0),
        0
      );

      const profitPercentage = Number(investor.profitPercentage);
      const investorProfit = totalInterestEarned * (profitPercentage / 100);
      const businessProfit = totalInterestEarned * ((100 - profitPercentage) / 100);

      return {
        investorId: investor.id,
        investorName: investor.name,
        profitPercentage,
        activeLoans: activeLoans.length,
        settledLoans: settledLoans.length,
        totalInvested,
        totalInterestEarned,
        totalCapitalReturned,
        investorProfit,
        businessProfit,
      };
    });

    const totals = investorItems.reduce(
      (acc, item) => ({
        totalInvested: acc.totalInvested + item.totalInvested,
        totalInterestEarned: acc.totalInterestEarned + item.totalInterestEarned,
        totalCapitalReturned: acc.totalCapitalReturned + item.totalCapitalReturned,
        totalInvestorProfit: acc.totalInvestorProfit + item.investorProfit,
        totalBusinessProfit: acc.totalBusinessProfit + item.businessProfit,
      }),
      {
        totalInvested: 0,
        totalInterestEarned: 0,
        totalCapitalReturned: 0,
        totalInvestorProfit: 0,
        totalBusinessProfit: 0,
      }
    );

    return { investors: investorItems, totals };
  }

  static async getPaymentSummary(
    filters: ReportFilters,
    groupBy: 'month' | 'week' = 'month'
  ): Promise<PaymentSummaryResponse> {
    const payments = await ReportRepository.getPaymentsByPeriod(filters, groupBy);

    // Group payments by period
    const grouped = new Map<string, PaymentSummaryItem>();

    for (const payment of payments) {
      const date = new Date(payment.paymentDate);
      let period: string;

      if (groupBy === 'month') {
        period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else {
        // Get ISO week
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const days = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000);
        const week = Math.ceil((days + startOfYear.getDay() + 1) / 7);
        period = `${date.getFullYear()}-W${String(week).padStart(2, '0')}`;
      }

      const existing = grouped.get(period) || {
        period,
        interestPaid: 0,
        capitalPaid: 0,
        totalPaid: 0,
        paymentCount: 0,
      };

      existing.interestPaid += Number(payment.interestPaid);
      existing.capitalPaid += Number(payment.capitalPaid);
      existing.totalPaid += Number(payment.interestPaid) + Number(payment.capitalPaid);
      existing.paymentCount += 1;

      grouped.set(period, existing);
    }

    const paymentItems = Array.from(grouped.values()).sort((a, b) =>
      b.period.localeCompare(a.period)
    );

    const totals = paymentItems.reduce(
      (acc, item) => ({
        totalInterest: acc.totalInterest + item.interestPaid,
        totalCapital: acc.totalCapital + item.capitalPaid,
        totalAmount: acc.totalAmount + item.totalPaid,
        totalPayments: acc.totalPayments + item.paymentCount,
      }),
      {
        totalInterest: 0,
        totalCapital: 0,
        totalAmount: 0,
        totalPayments: 0,
      }
    );

    return { payments: paymentItems, totals };
  }

  static async getPortfolioSummary(): Promise<PortfolioSummaryResponse> {
    const stats = await ReportRepository.getPortfolioStats();

    const activeCustomers = stats.customers.find((c) => c.isActive)?._count ?? 0;
    const inactiveCustomers = stats.customers.find((c) => !c.isActive)?._count ?? 0;

    const activeInvestors = stats.investors.find((i) => i.isActive)?._count ?? 0;
    const inactiveInvestors = stats.investors.find((i) => !i.isActive)?._count ?? 0;

    return {
      activeLoans: {
        count: stats.activeLoans._count,
        totalAmount: Number(stats.activeLoans._sum.originalAmount ?? 0),
      },
      settledLoans: {
        count: stats.settledLoans._count,
        totalAmount: Number(stats.settledLoans._sum.originalAmount ?? 0),
      },
      payments: {
        totalInterest: Number(stats.payments._sum.interestPaid ?? 0),
        totalCapital: Number(stats.payments._sum.capitalPaid ?? 0),
        totalAmount:
          Number(stats.payments._sum.interestPaid ?? 0) +
          Number(stats.payments._sum.capitalPaid ?? 0),
      },
      customers: {
        total: activeCustomers + inactiveCustomers,
        active: activeCustomers,
      },
      investors: {
        total: activeInvestors + inactiveInvestors,
        active: activeInvestors,
      },
    };
  }
}
