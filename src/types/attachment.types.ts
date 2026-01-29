export interface AttachmentResponse {
  id: string;
  entityType: string;
  entityId: string;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string | null;
  createdAt: string;
  url?: string;
}
