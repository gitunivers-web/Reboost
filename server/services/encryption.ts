import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

/**
 * Service de chiffrement/déchiffrement pour les secrets sensibles (TOTP, etc.)
 * Utilise AES-256-GCM avec une clé dérivée via scrypt
 */

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const SALT_LENGTH = 16;
const IV_LENGTH = 12; // GCM recommend 12 bytes
const TAG_LENGTH = 16;

/**
 * Dérive une clé stable à partir de la master secret (permet de retrouver la même clé)
 */
function deriveKey(masterSecret: string, salt: Buffer): Buffer {
  return scryptSync(masterSecret, salt, KEY_LENGTH);
}

/**
 * Chiffre une valeur sensible
 */
export function encryptSecret(plaintext: string): string {
  const masterSecret = process.env.ENCRYPTION_KEY;
  if (!masterSecret) {
    throw new Error('ENCRYPTION_KEY environment variable not set');
  }

  // Génère un salt aléatoire
  const salt = randomBytes(SALT_LENGTH);
  const key = deriveKey(masterSecret, salt);
  
  // Génère un IV aléatoire
  const iv = randomBytes(IV_LENGTH);
  
  // Crée le cipher
  const cipher = createCipheriv(ALGORITHM, key, iv);
  
  // Chiffre le texte
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Récupère le tag d'authentification
  const tag = cipher.getAuthTag();
  
  // Retourne: salt + iv + tag + ciphertext (tous en hex, séparés par ':')
  return `${salt.toString('hex')}:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

/**
 * Déchiffre une valeur sensible
 */
export function decryptSecret(ciphertext: string): string {
  const masterSecret = process.env.ENCRYPTION_KEY;
  if (!masterSecret) {
    throw new Error('ENCRYPTION_KEY environment variable not set');
  }

  try {
    // Parse le format: salt:iv:tag:encrypted
    const parts = ciphertext.split(':');
    if (parts.length !== 4) {
      throw new Error('Invalid ciphertext format');
    }

    const salt = Buffer.from(parts[0], 'hex');
    const iv = Buffer.from(parts[1], 'hex');
    const tag = Buffer.from(parts[2], 'hex');
    const encrypted = parts[3];

    const key = deriveKey(masterSecret, salt);
    
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(`Failed to decrypt secret: ${(error as Error).message}`);
  }
}

/**
 * Vérifie si une chaîne est déjà chiffrée (format salt:iv:tag:encrypted)
 */
export function isEncrypted(value: string): boolean {
  const parts = value.split(':');
  return parts.length === 4 && parts.every(part => /^[a-f0-9]+$/.test(part));
}
