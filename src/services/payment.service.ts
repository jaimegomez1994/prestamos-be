import { PaymentRepository } from '../repositories/payment.repository';
import { LoanRepository } from '../repositories/loan.repository';
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

  static async create(data: CreatePaymentDTO, userId?: string): Promise<PaymentResponse> {
    // Validate loan exists and is not settled
    const loan = await LoanRepository.findById(data.loanId);
    if (!loan) {
      throw new Error('Prestamo no encontrado');
    }

    if (loan.isSettled) {
      throw new Error('No se puede registrar pago en un prestamo liquidado');
    }

    // Validate amounts
    if (data.interestPaid < 0 || data.capitalPaid < 0) {
      throw new Error('Los montos no pueden ser negativos');
    }

    if (data.interestPaid === 0 && data.capitalPaid === 0) {
      throw new Error('Debe ingresar al menos un monto de interes o capital');
    }

    // Calculate current balance
    const totalPaidCapital = loan.payments.reduce(
      (sum, p) => sum + Number(p.capitalPaid),
      0
    );
    const currentBalance = Number(loan.originalAmount) - totalPaidCapital;

    // Validate capital payment doesn't exceed balance
    if (data.capitalPaid > currentBalance) {
      throw new Error(
        `El pago de capital ($${data.capitalPaid}) excede el saldo actual ($${currentBalance})`
      );
    }

    const payment = await PaymentRepository.create({
      loanId: data.loanId,
      paymentDate: new Date(data.paymentDate),
      interestPaid: data.interestPaid,
      capitalPaid: data.capitalPaid,
      paymentMethod: data.paymentMethod as PaymentMethod | undefined,
      notes: data.notes,
      createdBy: userId,
    });

    return this.formatPayment(payment);
  }

  static async update(id: string, data: UpdatePaymentDTO): Promise<PaymentResponse> {
    const existing = await PaymentRepository.findById(id);
    if (!existing) {
      throw new Error('Pago no encontrado');
    }

    if (existing.loan.isSettled) {
      throw new Error('No se puede modificar pago de un prestamo liquidado');
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
    return this.formatPayment(payment);
  }

  static async delete(id: string): Promise<void> {
    const existing = await PaymentRepository.findById(id);
    if (!existing) {
      throw new Error('Pago no encontrado');
    }

    if (existing.loan.isSettled) {
      throw new Error('No se puede eliminar pago de un prestamo liquidado');
    }

    await PaymentRepository.delete(id);
  }
}
