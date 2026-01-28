import { prisma } from '../lib/prisma';
import type { PaymentFilters } from '../types/payment.types';
import type { PaymentMethod } from '@prisma/client';

export class PaymentRepository {
  static async findAll(filters: PaymentFilters) {
    const {
      search,
      loanId,
      customerId,
      investorId,
      startDate,
      endDate,
      page = 1,
      pageSize = 20,
    } = filters;

    const where: any = {};

    if (loanId) {
      where.loanId = loanId;
    }

    if (customerId) {
      where.loan = { customerId };
    }

    if (investorId) {
      where.loan = { ...where.loan, investorId };
    }

    if (search) {
      where.loan = {
        ...where.loan,
        customer: {
          name: { contains: search, mode: 'insensitive' },
        },
      };
    }

    if (startDate || endDate) {
      where.paymentDate = {};
      if (startDate) {
        where.paymentDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.paymentDate.lte = new Date(endDate);
      }
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          loan: {
            include: {
              customer: true,
              investor: true,
            },
          },
        },
        orderBy: { paymentDate: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.payment.count({ where }),
    ]);

    return { payments, total };
  }

  static async findById(id: string) {
    return prisma.payment.findUnique({
      where: { id },
      include: {
        loan: {
          include: {
            customer: true,
            investor: true,
          },
        },
      },
    });
  }

  static async findByLoanId(loanId: string) {
    return prisma.payment.findMany({
      where: { loanId },
      include: {
        loan: {
          include: {
            customer: true,
            investor: true,
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
    });
  }

  static async create(data: {
    loanId: string;
    paymentDate: Date;
    interestPaid: number;
    capitalPaid: number;
    paymentMethod?: PaymentMethod;
    notes?: string;
    createdBy?: string;
  }) {
    return prisma.payment.create({
      data: {
        loanId: data.loanId,
        paymentDate: data.paymentDate,
        interestPaid: data.interestPaid,
        capitalPaid: data.capitalPaid,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        createdBy: data.createdBy,
      },
      include: {
        loan: {
          include: {
            customer: true,
            investor: true,
          },
        },
      },
    });
  }

  static async update(
    id: string,
    data: {
      paymentDate?: Date;
      interestPaid?: number;
      capitalPaid?: number;
      paymentMethod?: PaymentMethod;
      notes?: string;
    }
  ) {
    return prisma.payment.update({
      where: { id },
      data,
      include: {
        loan: {
          include: {
            customer: true,
            investor: true,
          },
        },
      },
    });
  }

  static async delete(id: string) {
    return prisma.payment.delete({
      where: { id },
    });
  }
}
