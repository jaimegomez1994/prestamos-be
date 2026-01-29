import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { AttachmentController } from '../controllers/attachment.controller';
import { requireAuth, requireRole } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

function handleUpload(req: Request, res: Response, next: NextFunction) {
  upload.array('files', 5)(req, res, (err: any) => {
    if (err) {
      const message =
        err.code === 'LIMIT_FILE_SIZE'
          ? 'Archivo muy grande. Maximo 10MB'
          : err.code === 'LIMIT_FILE_COUNT'
            ? 'Maximo 5 archivos'
            : err.message || 'Error al procesar archivos';
      return res.status(400).json({ error: message });
    }
    next();
  });
}

router.post(
  '/:entityType/:entityId',
  requireAuth,
  requireRole('admin', 'operator'),
  handleUpload,
  AttachmentController.upload
);

router.get(
  '/:entityType/:entityId',
  requireAuth,
  AttachmentController.list
);

router.get(
  '/:id/download',
  requireAuth,
  AttachmentController.download
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('admin', 'operator'),
  AttachmentController.delete
);

export { router as attachmentRoutes };
