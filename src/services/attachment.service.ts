import crypto from 'crypto';
import { getSupabase } from '../lib/supabase';
import { AttachmentRepository } from '../repositories/attachment.repository';
import type { AttachmentResponse } from '../types/attachment.types';

const BUCKET_MAP: Record<string, string> = {
  loans: 'loans',
  payments: 'payments',
};

const VALID_ENTITY_TYPES = Object.keys(BUCKET_MAP);

function getBucket(entityType: string): string {
  const bucket = BUCKET_MAP[entityType];
  if (!bucket) {
    throw new Error(`Tipo de entidad no valido: ${entityType}`);
  }
  return bucket;
}

function formatAttachment(attachment: any, url?: string): AttachmentResponse {
  return {
    id: attachment.id,
    entityType: attachment.entityType,
    entityId: attachment.entityId,
    filename: attachment.filename,
    originalName: attachment.originalName,
    fileSize: attachment.fileSize,
    mimeType: attachment.mimeType,
    uploadedBy: attachment.uploadedBy,
    createdAt: attachment.createdAt.toISOString(),
    url,
  };
}

export class AttachmentService {
  static validateEntityType(entityType: string) {
    if (!VALID_ENTITY_TYPES.includes(entityType)) {
      throw new Error(`Tipo de entidad no valido: ${entityType}. Debe ser: ${VALID_ENTITY_TYPES.join(', ')}`);
    }
  }

  static async upload(
    entityType: string,
    entityId: string,
    files: Express.Multer.File[],
    uploadedBy?: string
  ): Promise<AttachmentResponse[]> {
    this.validateEntityType(entityType);
    const bucket = getBucket(entityType);
    const results: AttachmentResponse[] = [];

    for (const file of files) {
      const ext = file.originalname.split('.').pop() || '';
      const storagePath = `${entityId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await getSupabase().storage
        .from(bucket)
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Error al subir archivo: ${uploadError.message}`);
      }

      const attachment = await AttachmentRepository.create({
        entityType,
        entityId,
        filename: storagePath,
        originalName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedBy,
      });

      results.push(formatAttachment(attachment));
    }

    return results;
  }

  static async listByEntity(entityType: string, entityId: string): Promise<AttachmentResponse[]> {
    this.validateEntityType(entityType);
    const bucket = getBucket(entityType);
    const attachments = await AttachmentRepository.findByEntity(entityType, entityId);

    const results: AttachmentResponse[] = [];
    for (const attachment of attachments) {
      const { data } = await getSupabase().storage
        .from(bucket)
        .createSignedUrl(attachment.filename, 3600);

      results.push(formatAttachment(attachment, data?.signedUrl));
    }

    return results;
  }

  static async getDownloadUrl(id: string): Promise<{ url: string; originalName: string }> {
    const attachment = await AttachmentRepository.findById(id);
    if (!attachment) {
      throw new Error('Archivo no encontrado');
    }

    const bucket = getBucket(attachment.entityType);
    const { data, error } = await getSupabase().storage
      .from(bucket)
      .createSignedUrl(attachment.filename, 3600);

    if (error || !data?.signedUrl) {
      throw new Error('Error al generar URL de descarga');
    }

    return { url: data.signedUrl, originalName: attachment.originalName };
  }

  static async delete(id: string): Promise<void> {
    const attachment = await AttachmentRepository.findById(id);
    if (!attachment) {
      throw new Error('Archivo no encontrado');
    }

    const bucket = getBucket(attachment.entityType);

    const { error } = await getSupabase().storage
      .from(bucket)
      .remove([attachment.filename]);

    if (error) {
      // File may already be removed from storage
    }

    await AttachmentRepository.delete(id);
  }
}
