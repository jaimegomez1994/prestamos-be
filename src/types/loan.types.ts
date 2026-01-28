export interface CreateLoanDTO {
  customerId: string;
  investorId: string;
  originalAmount: number;
  loanDate: string;
  paymentMethod?: 'EFECTIVO' | 'TRANSFERENCIA';
  notes?: string;
}

export interface UpdateLoanDTO {
  notes?: string;
  paymentMethod?: 'EFECTIVO' | 'TRANSFERENCIA';
}

export interface LoanResponse {
  id: string;
  customerId: string;
  customerName: string;
  investorId: string;
  investorName: string;
  originalAmount: number;
  currentBalance: number;
  loanDate: string;
  paymentMethod: string | null;
  notes: string | null;
  isSettled: boolean;
  settledAt: string | null;
  createdAt: string;
  totalPaidInterest: number;
  totalPaidCapital: number;
}

export interface LoanListResponse {
  loans: LoanResponse[];
  total: number;
  page: number;
  pageSize: number;
}

export interface LoanFilters {
  search?: string;
  customerId?: string;
  investorId?: string;
  isSettled?: boolean;
  page?: number;
  pageSize?: number;
}
