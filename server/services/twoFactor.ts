import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { decryptSecret } from './encryption';

export function generateTwoFactorSecret(email: string): { secret: string; otpauthUrl: string } {
  const secret = speakeasy.generateSecret({
    name: `Altus Finances Group (${email})`,
    issuer: 'Altus Finances Group',
    length: 32,
  });

  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url || '',
  };
}

export async function generateQRCode(otpauthUrl: string): Promise<string> {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(otpauthUrl);
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Erreur lors de la génération du QR code');
  }
}

/**
 * Vérifie un token TOTP - déchiffre automatiquement le secret s'il est chiffré
 */
export function verifyTwoFactorToken(encryptedOrPlainSecret: string, token: string): boolean {
  let secret = encryptedOrPlainSecret;
  
  // Tente de déchiffrer si le secret semble chiffré (format salt:iv:tag:encrypted)
  if (encryptedOrPlainSecret.includes(':') && encryptedOrPlainSecret.split(':').length === 4) {
    try {
      secret = decryptSecret(encryptedOrPlainSecret);
    } catch (error) {
      console.error('Failed to decrypt TOTP secret, trying as plaintext:', error);
      // Continue avec le secret en clair en cas d'erreur
    }
  }
  
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1,
  });
}
