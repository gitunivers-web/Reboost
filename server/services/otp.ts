import crypto from "crypto";
import { db } from "../db";
import { userOtps } from "@shared/schema";
import { eq, and, lt } from "drizzle-orm";
import sgMail from '@sendgrid/mail';

async function getCredentials() {
  const apiKey = process.env.SENDGRID_API_KEY;
  const email = process.env.SENDGRID_FROM_EMAIL;

  if (!apiKey || !email) {
    throw new Error('SendGrid configuration missing: SENDGRID_API_KEY and SENDGRID_FROM_EMAIL must be set');
  }

  return { apiKey, email };
}

async function getSendGridClient() {
  const { apiKey, email } = await getCredentials();
  sgMail.setApiKey(apiKey);
  return {
    client: sgMail,
    fromEmail: email
  };
}

export async function generateAndSendOTP(userId: string, userEmail: string, fullName: string, language: string = 'fr'): Promise<void> {
  try {
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await db.insert(userOtps).values({
      userId,
      otpCode: code,
      expiresAt,
      used: false,
    });

    const { client, fromEmail } = await getSendGridClient();
    const { getOtpEmailTemplate } = await import('../emailTemplates');
    
    const template = getOtpEmailTemplate(language as any, {
      fullName,
      otpCode: code,
    });

    const msg = {
      to: userEmail,
      from: fromEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    await client.send(msg);
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

    const isValidCode = record.otpCode === code;
    
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
