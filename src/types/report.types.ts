export interface InvestorReportItem {
  investorId: string;
  investorName: string;
  profitPercentage: number;
  activeLoans: number;
  settledLoans: number;
  totalInvested: number;
  totalLentHistorical: number;
  currentOutstandingBalance: number;
  newLoansAmount: number;
  totalInterestEarned: number;
  totalCapitalReturned: number;
  investorProfit: number;
  businessProfit: number;
}

export interface InvestorReportResponse {
  investors: InvestorReportItem[];
  totals: {
    totalInvested: number;
    totalLentHistorical: number;
    totalInterestEarned: number;
    totalCapitalReturned: number;
    totalInvestorProfit: number;
    totalBusinessProfit: number;
  };
}

export interface PaymentSummaryItem {
  period: string;
  interestPaid: number;
  capitalPaid: number;
  totalPaid: number;
  paymentCount: number;
}

export interface PaymentSummaryResponse {
  payments: PaymentSummaryItem[];
  totals: {
    totalInterest: number;
    totalCapital: number;
    totalAmount: number;
    totalPayments: number;
  };
}

export interface PortfolioSummaryResponse {
  activeLoans: {
    count: number;
    totalAmount: number;
  };
  settledLoans: {
    count: number;
    totalAmount: number;
  };
  payments: {
    totalInterest: number;
    totalCapital: number;
    totalAmount: number;
  };
  customers: {
    total: number;
    active: number;
  };
  investors: {
    total: number;
    active: number;
  };
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  investorId?: string;
}
