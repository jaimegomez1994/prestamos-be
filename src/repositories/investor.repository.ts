import { prisma } from '../lib/prisma';
import type { Investor } from '@prisma/client';

export class InvestorRepository {
  static async findAll(activeOnly = true): Promise<Investor[]> {
    return prisma.investor.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  static async findById(id: string): Promise<Investor | null> {
    return prisma.investor.findUnique({ where: { id } });
  }
}
