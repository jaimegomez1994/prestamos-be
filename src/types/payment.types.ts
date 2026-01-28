export interface CreatePaymentDTO {
  loanId: string;
  paymentDate: string;
  interestPaid: number;
  capitalPaid: number;
  paymentMethod: 'EFECTIVO' | 'TRANSFERENCIA';
  notes?: string;
}

export interface UpdatePaymentDTO {
  paymentDate?: string;
  interestPaid?: number;
  capitalPaid?: number;
  paymentMethod?: 'EFECTIVO' | 'TRANSFERENCIA';
  notes?: string;
}

export interface PaymentResponse {
  id: string;
  loanId: string;
  customerName: string;
  investorName: string;
  paymentDate: string;
  interestPaid: number;
  capitalPaid: number;
  totalPaid: number;
  paymentMethod: string | null;
  notes: string | null;
  createdAt: string;
}

export interface PaymentListResponse {
  payments: PaymentResponse[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PaymentFilters {
  search?: string;
  loanId?: string;
  customerId?: string;
  investorId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}
