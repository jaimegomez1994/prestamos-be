import type { Request, Response } from 'express';
import { AttachmentService } from '../services/attachment.service';
import { log } from 'console';

export class AttachmentController {
  static async upload(req: Request<{ entityType: string; entityId: string }>, res: Response) {
    try {
      const { entityType, entityId } = req.params;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No se enviaron archivos' });
      }

      const userId = req.user?.userId;
      const attachments = await AttachmentService.upload(entityType, entityId, files, userId);
      res.status(201).json({ attachments });
    } catch (error) {
      log("error", error);
      if (error instanceof Error) {
        if (error.message.includes('Tipo de entidad')) {
          return res.status(400).json({ error: error.message });
        }
        if (error.message.includes('Error al subir')) {
          return res.status(500).json({ error: error.message });
        }
      }
      res.status(500).json({ error: 'Error al subir archivos' });
    }
  }

  static async list(req: Request<{ entityType: string; entityId: string }>, res: Response) {
    try {
      const { entityType, entityId } = req.params;
      const attachments = await AttachmentService.listByEntity(entityType, entityId);
      res.json({ attachments });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Tipo de entidad')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Error al obtener archivos' });
    }
  }

  static async download(req: Request<{ id: string }>, res: Response) {
    try {
      const result = await AttachmentService.getDownloadUrl(req.params.id);
      res.json(result);
    } catch (error) {
      if (error instanceof Error && error.message === 'Archivo no encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Error al obtener archivo' });
    }
  }

  static async delete(req: Request<{ id: string }>, res: Response) {
    try {
      await AttachmentService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'Archivo no encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Error al eliminar archivo' });
    }
  }
}
