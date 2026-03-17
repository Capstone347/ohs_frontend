import { api, ApiError } from '@/services/api';
import { toast } from 'sonner';

export async function downloadDocument(
  documentId: number,
  accessToken: string,
  fileName: string = 'document.docx'
): Promise<void> {
  toast.success('Starting download...');
  try {
    const blob = await api.downloadFinalDocument(documentId, accessToken);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      toast.error('Download link has expired.');
    } else {
      toast.error('Failed to download document. Please try again.');
    }
    throw error;
  }
}
