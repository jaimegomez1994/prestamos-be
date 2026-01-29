import { PaymentRepository } from '../repositories/payment.repository';
import { LoanRepository } from '../repositories/loan.repository';
import { CustomerRepository } from '../repositories/customer.repository';
import type {
  CreatePaymentDTO,
  UpdatePaymentDTO,
  PaymentResponse,
  PaymentListResponse,
  PaymentFilters,
} from '../types/payment.types';
import type { PaymentMethod } from '@prisma/client';

export class PaymentService {
  static formatPayment(payment: any): PaymentResponse {
    return {
      id: payment.id,
      loanId: payment.loanId,
      customerName: payment.loan.customer.name,
      investorName: payment.loan.investor.name,
      paymentDate: payment.paymentDate.toISOString().split('T')[0],
      interestPaid: Number(payment.interestPaid),
      capitalPaid: Number(payment.capitalPaid),
      totalPaid: Number(payment.interestPaid) + Number(payment.capitalPaid),
      paymentMethod: payment.paymentMethod,
      notes: payment.notes,
      createdAt: payment.createdAt.toISOString(),
    };
  }

  static async getAll(filters: PaymentFilters): Promise<PaymentListResponse> {
    const { payments, total } = await PaymentRepository.findAll(filters);
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;

    return {
      payments: payments.map(this.formatPayment),
      total,
      page,
      pageSize,
    };
  }

  static async getById(id: string): Promise<PaymentResponse> {
    const payment = await PaymentRepository.findById(id);
    if (!payment) {
      throw new Error('Pago no encontrado');
    }
    return this.formatPayment(payment);
  }

  static async getByLoanId(loanId: string): Promise<PaymentResponse[]> {
    const payments = await PaymentRepository.findByLoanId(loanId);
    return payments.map(this.formatPayment);
  }

  static async create(data: CreatePaymentDTO, userId?: string): Promise<PaymentResponse[]> {
    // Validate customer exists
    const customer = await CustomerRepository.findById(data.customerId);
    if (!customer) {
      throw new Error('Cliente no encontrado');
    }

    // Fetch all active loans for this customer
    const activeLoans = await LoanRepository.findActiveByCustomerId(data.customerId);
    if (activeLoans.length === 0) {
      throw new Error('El cliente no tiene prestamos activos');
    }

    // Validate amounts
    if (data.interestPaid < 0 || data.capitalPaid < 0) {
      throw new Error('Los montos no pueden ser negativos');
    }

    if (data.interestPaid === 0 && data.capitalPaid === 0) {
      throw new Error('Debe ingresar al menos un monto de interes o capital');
    }

    // Calculate each loan's current balance
    const loansWithBalance = activeLoans.map((loan) => {
      const totalPaidCapital = loan.payments.reduce(
        (sum, p) => sum + Number(p.capitalPaid),
        0
      );
      const currentBalance = Number(loan.originalAmount) - totalPaidCapital;
      return { loan, currentBalance };
    });

    const totalBalance = loansWithBalance.reduce((sum, l) => sum + l.currentBalance, 0);

    // Validate capital doesn't exceed total combined balance
    if (data.capitalPaid > totalBalance) {
      throw new Error(
        `El pago de capital ($${data.capitalPaid}) excede el saldo total ($${totalBalance})`
      );
    }

    // Distribute capital — sort by currentBalance ASC (smallest first)
    const sortedByBalance = [...loansWithBalance].sort(
      (a, b) => a.currentBalance - b.currentBalance
    );

    const capitalDistribution = new Map<string, number>();
    let remainingCapital = data.capitalPaid;

    for (const { loan, currentBalance } of sortedByBalance) {
      if (remainingCapital <= 0) break;
      const capitalForLoan = Math.min(remainingCapital, currentBalance);
      if (capitalForLoan > 0) {
        capitalDistribution.set(loan.id, capitalForLoan);
        remainingCapital -= capitalForLoan;
      }
    }

    // Distribute interest — proportional to each loan's balance
    const interestDistribution = new Map<string, number>();
    if (data.interestPaid > 0 && totalBalance > 0) {
      let interestAssigned = 0;
      const loansToDistribute = loansWithBalance.filter((l) => l.currentBalance > 0);

      for (let i = 0; i < loansToDistribute.length; i++) {
        const { loan, currentBalance } = loansToDistribute[i];
        if (i === loansToDistribute.length - 1) {
          // Last loan gets the remainder to avoid rounding issues
          interestDistribution.set(loan.id, Math.round((data.interestPaid - interestAssigned) * 100) / 100);
        } else {
          const interestForLoan = Math.round(data.interestPaid * (currentBalance / totalBalance) * 100) / 100;
          interestDistribution.set(loan.id, interestForLoan);
          interestAssigned += interestForLoan;
        }
      }
    }

    // Collect all loan IDs that receive any money
    const allLoanIds = new Set<string>();
    for (const [id] of capitalDistribution) allLoanIds.add(id);
    for (const [id] of interestDistribution) allLoanIds.add(id);

    // Create one payment record per loan
    const createdPayments: PaymentResponse[] = [];

    for (const loanId of allLoanIds) {
      const capitalForLoan = capitalDistribution.get(loanId) ?? 0;
      const interestForLoan = interestDistribution.get(loanId) ?? 0;

      const payment = await PaymentRepository.create({
        loanId,
        paymentDate: new Date(data.paymentDate),
        interestPaid: interestForLoan,
        capitalPaid: capitalForLoan,
        paymentMethod: data.paymentMethod as PaymentMethod | undefined,
        notes: data.notes,
        createdBy: userId,
      });

      createdPayments.push(this.formatPayment(payment));

      // Auto-settle if balance reaches zero
      const loanData = loansWithBalance.find((l) => l.loan.id === loanId);
      if (loanData && loanData.currentBalance - capitalForLoan <= 0) {
        await LoanRepository.settle(loanId);
      }
    }

    return createdPayments;
  }

  static async update(id: string, data: UpdatePaymentDTO): Promise<PaymentResponse> {
    const existing = await PaymentRepository.findById(id);
    if (!existing) {
      throw new Error('Pago no encontrado');
    }

    // If updating capital, validate it doesn't exceed balance
    if (data.capitalPaid !== undefined) {
      const loan = await LoanRepository.findById(existing.loanId);
      if (loan) {
        const totalPaidCapitalExcludingThis = loan.payments
          .filter((p) => p.id !== id)
          .reduce((sum, p) => sum + Number(p.capitalPaid), 0);
        const currentBalance = Number(loan.originalAmount) - totalPaidCapitalExcludingThis;

        if (data.capitalPaid > currentBalance) {
          throw new Error(
            `El pago de capital ($${data.capitalPaid}) excede el saldo actual ($${currentBalance})`
          );
        }
      }
    }

    const updateData: any = {};
    if (data.paymentDate) updateData.paymentDate = new Date(data.paymentDate);
    if (data.interestPaid !== undefined) updateData.interestPaid = data.interestPaid;
    if (data.capitalPaid !== undefined) updateData.capitalPaid = data.capitalPaid;
    if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const payment = await PaymentRepository.update(id, updateData);

    // Recalculate balance and auto-settle/reopen
    const loanAfterUpdate = await LoanRepository.findById(existing.loanId);
    if (loanAfterUpdate) {
      const totalCapitalAfterUpdate = loanAfterUpdate.payments.reduce(
        (sum, p) => sum + Number(p.capitalPaid),
        0
      );
      const balanceAfterUpdate = Number(loanAfterUpdate.originalAmount) - totalCapitalAfterUpdate;

      if (balanceAfterUpdate <= 0 && !loanAfterUpdate.isSettled) {
        await LoanRepository.settle(existing.loanId);
      } else if (balanceAfterUpdate > 0 && loanAfterUpdate.isSettled) {
        await LoanRepository.reopen(existing.loanId);
      }
    }

    return this.formatPayment(payment);
  }

  static async delete(id: string): Promise<void> {
    const existing = await PaymentRepository.findById(id);
    if (!existing) {
      throw new Error('Pago no encontrado');
    }

    const loanId = existing.loanId;
    await PaymentRepository.delete(id);

    // Recalculate balance and auto-reopen if needed
    const loan = await LoanRepository.findById(loanId);
    if (loan && loan.isSettled) {
      const totalCapitalAfterDelete = loan.payments.reduce(
        (sum, p) => sum + Number(p.capitalPaid),
        0
      );
      const balanceAfterDelete = Number(loan.originalAmount) - totalCapitalAfterDelete;

      if (balanceAfterDelete > 0) {
        await LoanRepository.reopen(loanId);
      }
    }
  }
}
