import { prisma } from '../lib/prisma';
import type { User } from '@prisma/client';

export class UserRepository {
  static async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  static async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  static async create(data: {
    email: string;
    password: string;
    name: string;
    role: 'admin' | 'operator' | 'collector' | 'customer';
    phone?: string;
  }): Promise<User> {
    return prisma.user.create({ data });
  }

  static async updateLastLogin(userId: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { updatedAt: new Date() },
    });
  }
}
