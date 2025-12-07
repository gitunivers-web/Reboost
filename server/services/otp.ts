import crypto from "crypto";
import { db } from "../db";
import { userOtps } from "@shared/schema";
import { eq, and, lt } from "drizzle-orm";
import * as brevo from '@getbrevo/brevo';

async function getCredentials() {
  const apiKey = process.env.BREVO_API_KEY;
  const email = process.env.BREVO_FROM_EMAIL;

  if (!apiKey || !email) {
    throw new Error('Brevo configuration missing: BREVO_API_KEY and BREVO_FROM_EMAIL must be set');
  }

  return { apiKey, email };
}

async function getBrevoClient() {
  const { apiKey, email } = await getCredentials();
  
  const apiInstance = new brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);
  
  return {
    client: apiInstance,
    fromEmail: email
  };
}

export async function generateAndSendOTP(userId: string, userEmail: string, fullName: string, language: string = 'fr'): Promise<void> {
  try {
    const code = crypto.randomInt(10000000, 99999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await db.insert(userOtps).values({
      userId,
      otpCode: code,
      expiresAt,
      used: false,
    });

    const { client, fromEmail } = await getBrevoClient();
    const { getOtpEmailTemplate } = await import('../emailTemplates');
    
    const template = getOtpEmailTemplate(language as any, {
      fullName,
      otpCode: code,
    });

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = template.subject;
    sendSmtpEmail.htmlContent = template.html;
    sendSmtpEmail.textContent = template.text;
    sendSmtpEmail.sender = { email: fromEmail, name: 'ALTUS FINANCES GROUP' };
    sendSmtpEmail.to = [{ email: userEmail }];

    await client.sendTransacEmail(sendSmtpEmail);
    console.log(`OTP code sent to ${userEmail} in ${language}`);
  } catch (error) {
    console.error('Error generating/sending OTP:', error);
    throw error;
  }
}

const MAX_OTP_ATTEMPTS = 3;

export async function verifyOTP(userId: string, code: string): Promise<boolean> {
  try {
    const now = new Date();
    
    const record = await db.query.userOtps.findFirst({
      where: and(
        eq(userOtps.userId, userId),
        eq(userOtps.used, false),
      ),
      orderBy: (userOtps, { desc }) => [desc(userOtps.createdAt)],
    });

    if (!record) {
      return false;
    }

    if (record.expiresAt < now) {
      return false;
    }

    if (record.attempts >= MAX_OTP_ATTEMPTS) {
      return false;
    }

    const recordCodeBuffer = Buffer.from(record.otpCode, 'utf8');
    const inputCodeBuffer = Buffer.from(code, 'utf8');
    
    const isValidCode = recordCodeBuffer.length === inputCodeBuffer.length && 
                        crypto.timingSafeEqual(recordCodeBuffer, inputCodeBuffer);
    
    if (isValidCode) {
      await db
        .update(userOtps)
        .set({ used: true })
        .where(eq(userOtps.id, record.id));
      return true;
    } else {
      await db
        .update(userOtps)
        .set({ attempts: record.attempts + 1 })
        .where(eq(userOtps.id, record.id));
      return false;
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
}

export async function cleanupExpiredOTPs(): Promise<void> {
  try {
    const now = new Date();
    await db.delete(userOtps).where(lt(userOtps.expiresAt, now));
    console.log('Expired OTPs cleaned up');
  } catch (error) {
    console.error('Error cleaning up expired OTPs:', error);
  }
}
