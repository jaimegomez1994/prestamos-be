import { prisma } from '../lib/prisma';
import type { Loan, Prisma } from '@prisma/client';
import type { LoanFilters } from '../types/loan.types';

export class LoanRepository {
  static async findAll(filters: LoanFilters = {}): Promise<{ loans: Loan[]; total: number }> {
    const { search, customerId, investorId, isSettled, page = 1, pageSize = 20 } = filters;
    const skip = (page - 1) * pageSize;

    const where: Prisma.LoanWhereInput = {};

    if (search) {
      where.customer = {
        name: { contains: search, mode: 'insensitive' },
      };
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (investorId) {
      where.investorId = investorId;
    }

    if (isSettled !== undefined) {
      where.isSettled = isSettled;
    }

    const [loans, total] = await Promise.all([
      prisma.loan.findMany({
        where,
        include: {
          customer: { select: { name: true } },
          investor: { select: { name: true } },
          payments: { select: { interestPaid: true, capitalPaid: true } },
        },
        orderBy: { loanDate: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.loan.count({ where }),
    ]);

    return { loans, total };
  }

  static async findById(id: string) {
    return prisma.loan.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        investor: { select: { id: true, name: true } },
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
      },
    });
  }

  static async create(data: {
    customerId: string;
    investorId: string;
    originalAmount: number;
    loanDate: Date;
    paymentMethod?: 'EFECTIVO' | 'TRANSFERENCIA';
    notes?: string;
    createdBy?: string;
  }): Promise<Loan> {
    return prisma.loan.create({
      data: {
        customerId: data.customerId,
        investorId: data.investorId,
        originalAmount: data.originalAmount,
        loanDate: data.loanDate,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        createdBy: data.createdBy,
      },
    });
  }

  static async update(id: string, data: {
    customerId?: string;
    investorId?: string;
    originalAmount?: number;
    loanDate?: Date;
    paymentMethod?: 'EFECTIVO' | 'TRANSFERENCIA';
    notes?: string;
  }): Promise<Loan> {
    return prisma.loan.update({ where: { id }, data });
  }

  static async settle(id: string): Promise<Loan> {
    return prisma.loan.update({
      where: { id },
      data: {
        isSettled: true,
        settledAt: new Date(),
      },
    });
  }

  static async reopen(id: string): Promise<Loan> {
    return prisma.loan.update({
      where: { id },
      data: {
        isSettled: false,
        settledAt: null,
      },
    });
  }

  static async getLoanWithPayments(id: string) {
    return prisma.loan.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true } },
        investor: { select: { id: true, name: true } },
        payments: true,
      },
    });
  }
}
