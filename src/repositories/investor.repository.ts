import { prisma } from '../lib/prisma';
import type { Investor, Prisma } from '@prisma/client';
import type { InvestorFilters, CreateInvestorDTO, UpdateInvestorDTO } from '../types/investor.types';

export class InvestorRepository {
  static async findAll(
    filters: InvestorFilters
  ): Promise<{ investors: Investor[]; total: number }> {
    const { search, isActive, page = 1, pageSize = 50 } = filters;

    const where: Prisma.InvestorWhereInput = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [investors, total] = await Promise.all([
      prisma.investor.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.investor.count({ where }),
    ]);

    return { investors, total };
  }

  static async findById(id: string): Promise<Investor | null> {
    return prisma.investor.findUnique({ where: { id } });
  }

  static async findByIdWithStats(id: string) {
    return prisma.investor.findUnique({
      where: { id },
      include: {
        _count: {
          select: { loans: true },
        },
        loans: {
          select: {
            originalAmount: true,
            isSettled: true,
          },
        },
      },
    });
  }

  static async findAllWithStats(filters: InvestorFilters) {
    const { search, isActive, page = 1, pageSize = 50 } = filters;

    const where: Prisma.InvestorWhereInput = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [investors, total] = await Promise.all([
      prisma.investor.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          _count: {
            select: { loans: true },
          },
          loans: {
            where: { isSettled: false },
            select: {
              originalAmount: true,
              isSettled: true,
            },
          },
        },
      }),
      prisma.investor.count({ where }),
    ]);

    return { investors, total };
  }

  static async create(data: CreateInvestorDTO): Promise<Investor> {
    return prisma.investor.create({
      data: {
        name: data.name,
        profitPercentage: data.profitPercentage ?? 70,
      },
    });
  }

  static async update(id: string, data: UpdateInvestorDTO): Promise<Investor> {
    return prisma.investor.update({
      where: { id },
      data,
    });
  }

  static async deactivate(id: string): Promise<Investor> {
    return prisma.investor.update({
      where: { id },
      data: { isActive: false },
    });
  }

  static async activate(id: string): Promise<Investor> {
    return prisma.investor.update({
      where: { id },
      data: { isActive: true },
    });
  }
}
