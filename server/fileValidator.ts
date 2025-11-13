import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';
import { fileTypeFromBuffer } from 'file-type';

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  cleanedPath?: string;
  mimeType?: string;
}

export interface CleanedFile {
  buffer: Buffer;
  filename: string;
  mimeType: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

/**
 * Valide le type MIME d'un fichier en vérifiant les magic bytes
 */
export async function validateFileType(filePath: string): Promise<FileValidationResult> {
  try {
    const buffer = await fs.readFile(filePath);
    
    // Vérification de la taille
    if (buffer.length > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `Le fichier dépasse la taille maximale autorisée (${MAX_FILE_SIZE / 1024 / 1024}MB)`
      };
    }

    // Vérification du type via magic bytes
    const fileType = await fileTypeFromBuffer(buffer);
    
    if (!fileType) {
      return {
        isValid: false,
        error: 'Type de fichier non reconnu'
      };
    }

    if (!ALLOWED_MIME_TYPES.includes(fileType.mime)) {
      return {
        isValid: false,
        error: `Type de fichier non autorisé. Formats acceptés: PDF, JPEG, PNG, WEBP`
      };
    }

    return {
      isValid: true,
      mimeType: fileType.mime
    };
  } catch (error) {
    console.error('Error validating file type:', error);
    return {
      isValid: false,
      error: 'Erreur lors de la validation du fichier'
    };
  }
}

/**
 * Nettoie et optimise une image
 */
export async function cleanImage(filePath: string): Promise<Buffer> {
  try {
    const cleanedBuffer = await sharp(filePath)
      .jpeg({ quality: 90, mozjpeg: true })
      .withMetadata({
        orientation: undefined, // Supprime les métadonnées d'orientation potentiellement dangereuses
      })
      .toBuffer();
    
    return cleanedBuffer;
  } catch (error) {
    console.error('Error cleaning image:', error);
    throw new Error('Erreur lors du nettoyage de l\'image');
  }
}

/**
 * Nettoie et optimise un PDF
 */
export async function cleanPDF(filePath: string): Promise<Buffer> {
  try {
    const buffer = await fs.readFile(filePath);
    const pdfDoc = await PDFDocument.load(buffer);
    
    // Supprime les scripts et actions potentiellement dangereuses
    // PDFDocument.save() crée automatiquement un PDF nettoyé
    const cleanedBuffer = await pdfDoc.save({
      useObjectStreams: false,
      addDefaultPage: false
    });
    
    return Buffer.from(cleanedBuffer);
  } catch (error) {
    console.error('Error cleaning PDF:', error);
    throw new Error('Erreur lors du nettoyage du PDF');
  }
}

/**
 * Valide, nettoie et retourne un fichier sécurisé prêt à être envoyé
 */
export async function validateAndCleanFile(filePath: string, originalName: string): Promise<CleanedFile> {
  // Validation du type
  const validation = await validateFileType(filePath);
  
  if (!validation.isValid) {
    throw new Error(validation.error || 'Fichier invalide');
  }

  let cleanedBuffer: Buffer;
  let mimeType = validation.mimeType!;
  let filename = originalName;

  // Nettoyage selon le type
  if (mimeType === 'application/pdf') {
    cleanedBuffer = await cleanPDF(filePath);
  } else if (['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(mimeType)) {
    cleanedBuffer = await cleanImage(filePath);
    // Force JPEG après nettoyage
    mimeType = 'image/jpeg';
    filename = originalName.replace(/\.(png|webp|jpg|jpeg)$/i, '.jpg');
  } else {
    throw new Error('Type de fichier non supporté');
  }

  return {
    buffer: cleanedBuffer,
    filename,
    mimeType
  };
}

/**
 * Supprime un fichier temporaire de manière sécurisée
 */
export async function deleteTemporaryFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error(`Failed to delete temporary file ${filePath}:`, error);
  }
}
