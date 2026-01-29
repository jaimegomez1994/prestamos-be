import { prisma } from '../lib/prisma';

export class AttachmentRepository {
  static async create(data: {
    entityType: string;
    entityId: string;
    filename: string;
    originalName: string;
    fileSize: number;
    mimeType: string;
    uploadedBy?: string;
  }) {
    return prisma.attachment.create({ data });
  }

  static async findByEntity(entityType: string, entityId: string) {
    return prisma.attachment.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async findById(id: string) {
    return prisma.attachment.findUnique({ where: { id } });
  }

  static async delete(id: string) {
    return prisma.attachment.delete({ where: { id } });
  }
}
