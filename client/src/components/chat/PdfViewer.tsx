import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Download, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure the PDF.js worker
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

interface PdfViewerProps {
  storagePath: string;
  fileName: string;
}

export function PdfViewer({ storagePath, fileName }: PdfViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="relative group">
      <div className="w-40 h-40 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-900 border flex items-center justify-center">
        {loading && (
          <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
        )}
        
        {error && (
          <div className="text-xs text-destructive text-center p-2">
            PDF preview unavailable
          </div>
        )}

        <Document
          file={storagePath}
          onLoadSuccess={() => setLoading(false)}
          onLoadError={() => {
            setLoading(false);
            setError('Failed to load PDF');
          }}
          className={loading ? 'hidden' : ''}
        >
          <Page 
            pageNumber={1}
            scale={0.5}
            className="w-40 h-40"
            data-testid="pdf-preview-page"
          />
        </Document>
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
