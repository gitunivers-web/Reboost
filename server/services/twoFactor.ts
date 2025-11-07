import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export function generateTwoFactorSecret(email: string): { secret: string; otpauthUrl: string } {
  const secret = speakeasy.generateSecret({
    name: `Altus Finance Group (${email})`,
    issuer: 'Altus Finance Group',
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

export function verifyTwoFactorToken(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2,
  });
}
