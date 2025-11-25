import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PdfViewerProps {
  storagePath: string;
  fileName: string;
}

export function PdfViewer({ storagePath, fileName }: PdfViewerProps) {
  return (
    <div className="relative group">
      <div className="w-96 h-full max-h-96 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-900 border flex items-center justify-center">
        <iframe
          src={storagePath}
          title={fileName}
          className="w-full h-full"
          data-testid="pdf-preview-iframe"
        />
      </div>

      {/* Download button on hover */}
      <Button
        size="sm"
        variant="ghost"
        asChild
        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background"
        data-testid="btn-download-pdf-viewer"
      >
        <a href={storagePath} download={fileName}>
          <Download className="h-4 w-4" />
        </a>
      </Button>
    </div>
  );
}
