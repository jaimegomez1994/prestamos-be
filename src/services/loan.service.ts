import { LoanRepository } from '../repositories/loan.repository';
import { CustomerRepository } from '../repositories/customer.repository';
import type { CreateLoanDTO, UpdateLoanDTO, LoanResponse, LoanListResponse, LoanFilters } from '../types/loan.types';

export class LoanService {
  static async getAll(filters: LoanFilters): Promise<LoanListResponse> {
    const { loans, total } = await LoanRepository.findAll(filters);
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;

    const loansResponse: LoanResponse[] = loans.map((loan: any) => {
      const totalPaidInterest = loan.payments.reduce(
        (sum: number, p: any) => sum + Number(p.interestPaid),
        0
      );
      const totalPaidCapital = loan.payments.reduce(
        (sum: number, p: any) => sum + Number(p.capitalPaid),
        0
      );
      const currentBalance = Number(loan.originalAmount) - totalPaidCapital;

      return {
        id: loan.id,
        customerId: loan.customerId,
        customerName: loan.customer.name,
        investorId: loan.investorId,
        investorName: loan.investor.name,
        originalAmount: Number(loan.originalAmount),
        currentBalance,
        loanDate: loan.loanDate.toISOString().split('T')[0],
        paymentMethod: loan.paymentMethod,
        notes: loan.notes,
        isSettled: loan.isSettled,
        settledAt: loan.settledAt?.toISOString() || null,
        createdAt: loan.createdAt.toISOString(),
        totalPaidInterest,
        totalPaidCapital,
      };
    });

    return {
      loans: loansResponse,
      total,
      page,
      pageSize,
    };
  }

  static async getById(id: string): Promise<LoanResponse> {
    const loan = await LoanRepository.findById(id);
    if (!loan) {
      throw new Error('Prestamo no encontrado');
    }

    const totalPaidInterest = loan.payments.reduce(
      (sum, p) => sum + Number(p.interestPaid),
      0
    );
    const totalPaidCapital = loan.payments.reduce(
      (sum, p) => sum + Number(p.capitalPaid),
      0
    );
    const currentBalance = Number(loan.originalAmount) - totalPaidCapital;

    return {
      id: loan.id,
      customerId: loan.customerId,
      customerName: loan.customer.name,
      investorId: loan.investorId,
      investorName: loan.investor.name,
      originalAmount: Number(loan.originalAmount),
      currentBalance,
      loanDate: loan.loanDate.toISOString().split('T')[0],
      paymentMethod: loan.paymentMethod,
      notes: loan.notes,
      isSettled: loan.isSettled,
      settledAt: loan.settledAt?.toISOString() || null,
      createdAt: loan.createdAt.toISOString(),
      totalPaidInterest,
      totalPaidCapital,
    };
  }

  static async create(data: CreateLoanDTO, userId?: string): Promise<LoanResponse> {
    // Validate customer exists
    const customer = await CustomerRepository.findById(data.customerId);
    if (!customer) {
      throw new Error('Cliente no encontrado');
    }

    const loan = await LoanRepository.create({
      customerId: data.customerId,
      investorId: data.investorId,
      originalAmount: data.originalAmount,
      loanDate: new Date(data.loanDate),
      paymentMethod: data.paymentMethod,
      notes: data.notes,
      createdBy: userId,
    });

    return this.getById(loan.id);
  }

  static async update(id: string, data: UpdateLoanDTO): Promise<LoanResponse> {
    const existing = await LoanRepository.findById(id);
    if (!existing) {
      throw new Error('Prestamo no encontrado');
    }

    const updateData: any = {};
    if (data.customerId !== undefined) updateData.customerId = data.customerId;
    if (data.investorId !== undefined) updateData.investorId = data.investorId;
    if (data.originalAmount !== undefined) updateData.originalAmount = data.originalAmount;
    if (data.loanDate !== undefined) updateData.loanDate = new Date(data.loanDate);
    if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod;
    if (data.notes !== undefined) updateData.notes = data.notes;

    await LoanRepository.update(id, updateData);
    return this.getById(id);
  }

  static async settle(id: string): Promise<LoanResponse> {
    const existing = await LoanRepository.findById(id);
    if (!existing) {
      throw new Error('Prestamo no encontrado');
    }

    if (existing.isSettled) {
      throw new Error('El prestamo ya esta liquidado');
    }

    await LoanRepository.settle(id);
    return this.getById(id);
  }

  static async reopen(id: string): Promise<LoanResponse> {
    const existing = await LoanRepository.findById(id);
    if (!existing) {
      throw new Error('Prestamo no encontrado');
    }

    if (!existing.isSettled) {
      throw new Error('El prestamo no esta liquidado');
    }

    await LoanRepository.reopen(id);
    return this.getById(id);
  }
}
