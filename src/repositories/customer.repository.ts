import { prisma } from '../lib/prisma';
import type { Customer, Prisma } from '@prisma/client';
import type { CustomerFilters } from '../types/customer.types';

export class CustomerRepository {
  static async findAll(filters: CustomerFilters = {}): Promise<{ customers: Customer[]; total: number }> {
    const { search, isActive, page = 1, pageSize = 20 } = filters;
    const skip = (page - 1) * pageSize;

    const where: Prisma.CustomerWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: pageSize,
      }),
      prisma.customer.count({ where }),
    ]);

    return { customers, total };
  }

  static async findById(id: string): Promise<Customer | null> {
    return prisma.customer.findUnique({ where: { id } });
  }

  static async findByIdWithLoans(id: string) {
    return prisma.customer.findUnique({
      where: { id },
      include: {
        loans: {
          where: { isSettled: false },
          include: {
            investor: { select: { name: true } },
            payments: { orderBy: { paymentDate: 'desc' } },
          },
          orderBy: { loanDate: 'desc' },
        },
      },
    });
  }

  static async create(data: { name: string; phone?: string; notes?: string }): Promise<Customer> {
    return prisma.customer.create({ data });
  }

  static async update(id: string, data: { name?: string; phone?: string; notes?: string }): Promise<Customer> {
    return prisma.customer.update({ where: { id }, data });
  }

  static async deactivate(id: string): Promise<Customer> {
    return prisma.customer.update({
      where: { id },
      data: { isActive: false },
    });
  }

  static async activate(id: string): Promise<Customer> {
    return prisma.customer.update({
      where: { id },
      data: { isActive: true },
    });
  }

  static async getCustomerStats(id: string): Promise<{ activeLoansCount: number; totalOwed: number }> {
    const loans = await prisma.loan.findMany({
      where: { customerId: id, isSettled: false },
      include: { payments: true },
    });

    let totalOwed = 0;
    for (const loan of loans) {
      const totalPaidCapital = loan.payments.reduce(
        (sum, p) => sum + Number(p.capitalPaid),
        0
      );
      totalOwed += Number(loan.originalAmount) - totalPaidCapital;
    }

    return {
      activeLoansCount: loans.length,
      totalOwed,
    };
  }
}
