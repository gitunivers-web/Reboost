import * as brevo from '@getbrevo/brevo';

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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

async function sendEmail(options: {
  to: string;
  from: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
  }>;
}) {
  const { client, fromEmail } = await getBrevoClient();
  
  const sendSmtpEmail = new brevo.SendSmtpEmail();
  sendSmtpEmail.subject = options.subject;
  sendSmtpEmail.htmlContent = options.html;
  sendSmtpEmail.textContent = options.text;
  sendSmtpEmail.sender = { email: options.from, name: 'SOLVENTIS GROUP' };
  sendSmtpEmail.to = [{ email: options.to }];
  
  if (options.replyTo) {
    sendSmtpEmail.replyTo = { email: options.replyTo };
  }
  
  if (options.attachments && options.attachments.length > 0) {
    sendSmtpEmail.attachment = options.attachments.map(att => ({
      content: att.content,
      name: att.filename,
    }));
  }
  
  await client.sendTransacEmail(sendSmtpEmail);
}

function getBaseUrl(): string {
  if (process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL;
  }
  return process.env.REPLIT_DEV_DOMAIN 
    ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
    : 'http://localhost:5000';
}

export async function sendVerificationEmail(toEmail: string, fullName: string, token: string, accountType: string, language: string = 'fr') {
  try {
    const { fromEmail } = await getBrevoClient();
    const { getEmailTemplate } = await import('./emailTemplates');
    
    const verificationUrl = `${getBaseUrl()}/verify/${token}`;
    const accountTypeText = accountType === 'personal' ? 'personal' : 'business';
    
    const template = getEmailTemplate('verification', language as any, {
      fullName,
      verificationUrl,
      accountTypeText,
    });
    
    await sendEmail({
      to: toEmail,
      from: fromEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    console.log(`Verification email sent to ${toEmail} in ${language}`);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
}

export async function sendWelcomeEmail(toEmail: string, fullName: string, accountType: string, language: string = 'fr') {
  try {
    const { fromEmail } = await getBrevoClient();
    const { getEmailTemplate } = await import('./emailTemplates');
    
    const accountTypeText = accountType === 'personal' ? 'personal' : 'business';
    const loginUrl = `${getBaseUrl()}/login`;
    
    const template = getEmailTemplate('welcome', language as any, {
      fullName,
      accountTypeText,
      loginUrl,
    });
    
    await sendEmail({
      to: toEmail,
      from: fromEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    console.log(`Welcome email sent to ${toEmail} in ${language}`);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
}

export async function sendContractEmail(toEmail: string, fullName: string, loanId: string, amount: string, contractUrl: string, language: string = 'fr') {
  try {
    const { fromEmail } = await getBrevoClient();
    const { getEmailTemplate } = await import('./emailTemplates');
    
    const dashboardUrl = `${getBaseUrl()}/contracts`;
    
    const template = getEmailTemplate('contract', language as any, {
      fullName,
      amount,
      loanId,
      dashboardUrl,
      fromEmail,
    });
    
    await sendEmail({
      to: toEmail,
      from: fromEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    console.log(`Contract email sent to ${toEmail} in ${language}`);
    return true;
  } catch (error) {
    console.error('Error sending contract email:', error);
    throw error;
  }
}

export async function sendResetPasswordEmail(toEmail: string, fullName: string, token: string, language: string = 'fr') {
  try {
    const { fromEmail } = await getBrevoClient();
    
    const resetUrl = `${getBaseUrl()}/reset-password/${token}`;
    const safeName = escapeHtml(fullName);
    const logoUrl = `${getBaseUrl()}/logo.png`;
    const currentYear = new Date().getFullYear();
    
    const subject = language === 'en' 
      ? 'Reset your password - SOLVENTIS GROUP'
      : 'Réinitialisez votre mot de passe - SOLVENTIS GROUP';
    
    const html = `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>SOLVENTIS GROUP</title>
  <style type="text/css">
    body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .content-padding { padding: 20px 15px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 20px 10px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="email-container" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #c9a227 100%); padding: 30px 20px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 15px;">
                    <img src="${logoUrl}" alt="Solventis Group" width="180" height="auto" style="display: block; max-width: 180px; height: auto;" />
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #ffffff; font-family: Arial, sans-serif;">${language === 'en' ? 'Password Reset' : 'Réinitialisation du mot de passe'}</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="content-padding" style="padding: 40px 30px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">
                ${language === 'en' ? 'Hello' : 'Bonjour'} <strong>${safeName}</strong>,
              </p>
              <p style="color: #374151; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">
                ${language === 'en' 
                  ? 'We received a request to reset your password for your SOLVENTIS GROUP account.'
                  : 'Nous avons reçu une demande de réinitialisation du mot de passe pour votre compte SOLVENTIS GROUP.'}
              </p>
              <p style="color: #374151; font-size: 16px; line-height: 1.5; margin: 0 0 30px 0;">
                ${language === 'en'
                  ? 'Click the button below to reset your password:'
                  : 'Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe :'}
              </p>
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding: 0 0 30px 0;">
                    <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: bold; font-family: Arial, sans-serif;">
                      ${language === 'en' ? 'Reset Password' : 'Réinitialiser mon mot de passe'}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0 0 10px 0;">
                ${language === 'en'
                  ? 'If the button doesn\'t work, copy and paste this link into your browser:'
                  : 'Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :'}
              </p>
              <p style="color: #2563eb; font-size: 14px; line-height: 1.5; margin: 0 0 30px 0; word-break: break-all;">
                ${resetUrl}
              </p>
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #fef3c7; border-radius: 8px;">
                <tr>
                  <td style="padding: 15px; border-left: 4px solid #f59e0b;">
                    <p style="color: #92400e; font-size: 14px; line-height: 1.5; margin: 0;">
                      <strong>${language === 'en' ? 'Important' : 'Important'} :</strong><br>
                      ${language === 'en'
                        ? 'This link will expire in 1 hour. If you didn\'t request a password reset, please ignore this email.'
                        : 'Ce lien expirera dans 1 heure. Si vous n\'avez pas demandé de réinitialisation de mot de passe, veuillez ignorer cet email.'}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="background-color: #f8fafc; padding: 30px 20px; border-top: 1px solid #e2e8f0;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 15px;">
                    <img src="${logoUrl}" alt="Solventis Group" width="120" height="auto" style="display: block; max-width: 120px; height: auto; opacity: 0.8;" />
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin: 0; font-size: 12px; color: #64748b; font-family: Arial, sans-serif;">
                      &copy; ${currentYear} SOLVENTIS GROUP. ${language === 'en' ? 'All rights reserved' : 'Tous droits réservés'}.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
    
    const text = `${language === 'en' ? 'Hello' : 'Bonjour'} ${fullName},

${language === 'en' 
  ? 'We received a request to reset your password for your SOLVENTIS GROUP account.'
  : 'Nous avons reçu une demande de réinitialisation du mot de passe pour votre compte SOLVENTIS GROUP.'}

${language === 'en'
  ? 'To reset your password, visit this link:'
  : 'Pour réinitialiser votre mot de passe, visitez ce lien :'}

${resetUrl}

${language === 'en'
  ? 'This link will expire in 1 hour. If you didn\'t request a password reset, please ignore this email.'
  : 'Ce lien expirera dans 1 heure. Si vous n\'avez pas demandé de réinitialisation de mot de passe, veuillez ignorer cet email.'}

SOLVENTIS GROUP
${new Date().getFullYear()} ${language === 'en' ? 'All rights reserved' : 'Tous droits réservés'}.
    `;
    
    await sendEmail({
      to: toEmail,
      from: fromEmail,
      subject,
      html,
      text,
    });

    console.log(`Reset password email sent to ${toEmail} in ${language}`);
    return true;
  } catch (error) {
    console.error('Error sending reset password email:', error);
    throw error;
  }
}

export async function sendContactFormEmail(name: string, email: string, phone: string, message: string) {
  try {
    const { fromEmail } = await getBrevoClient();
    
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone);
    const safeMessage = escapeHtml(message);
    const logoUrl = `${getBaseUrl()}/logo.png`;
    const currentYear = new Date().getFullYear();
    
    const subject = `Nouveau message de contact - ${safeName}`;
    
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>SOLVENTIS GROUP</title>
  <style type="text/css">
    body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .content-padding { padding: 20px 15px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 20px 10px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="email-container" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #c9a227 100%); padding: 30px 20px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 15px;">
                    <img src="${logoUrl}" alt="Solventis Group" width="180" height="auto" style="display: block; max-width: 180px; height: auto;" />
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #ffffff; font-family: Arial, sans-serif;">Nouveau message de contact</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="content-padding" style="padding: 40px 30px;">
              <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 20px 0; font-family: Arial, sans-serif;">Informations du contact :</h2>
              
              <table cellpadding="10" cellspacing="0" border="0" width="100%" style="margin-bottom: 30px; background: #f8fafc; border-radius: 8px;">
                <tr>
                  <td style="color: #6b7280; font-weight: bold; width: 120px; padding: 12px 15px; border-bottom: 1px solid #e2e8f0;">Nom :</td>
                  <td style="color: #1f2937; padding: 12px 15px; border-bottom: 1px solid #e2e8f0;">${safeName}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280; font-weight: bold; padding: 12px 15px; border-bottom: 1px solid #e2e8f0;">Email :</td>
                  <td style="color: #1f2937; padding: 12px 15px; border-bottom: 1px solid #e2e8f0;"><a href="mailto:${safeEmail}" style="color: #2563eb; text-decoration: none;">${safeEmail}</a></td>
                </tr>
                <tr>
                  <td style="color: #6b7280; font-weight: bold; padding: 12px 15px;">Téléphone :</td>
                  <td style="color: #1f2937; padding: 12px 15px;">${safePhone || 'Non renseigné'}</td>
                </tr>
              </table>
              
              <h3 style="color: #1f2937; font-size: 16px; margin: 0 0 15px 0; font-family: Arial, sans-serif;">Message :</h3>
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f9fafb; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px; border-left: 4px solid #2563eb;">
                    <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${safeMessage}</p>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6b7280; font-size: 13px; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                Ce message a été envoyé depuis le formulaire de contact du site Solventis Group.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="background-color: #f8fafc; padding: 30px 20px; border-top: 1px solid #e2e8f0;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 15px;">
                    <img src="${logoUrl}" alt="Solventis Group" width="120" height="auto" style="display: block; max-width: 120px; height: auto; opacity: 0.8;" />
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin: 0; font-size: 12px; color: #64748b; font-family: Arial, sans-serif;">
                      &copy; ${currentYear} SOLVENTIS GROUP. Tous droits réservés.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
    
    const text = `Nouveau message de contact

Informations du contact :
Nom : ${name}
Email : ${email}
Téléphone : ${phone || 'Non renseigné'}

Message :
${message}

---
Ce message a été envoyé depuis le formulaire de contact du site Solventis Group.
SOLVENTIS GROUP
${new Date().getFullYear()} Tous droits réservés.
    `;
    
    await sendEmail({
      to: fromEmail,
      from: fromEmail,
      replyTo: email,
      subject,
      html,
      text,
    });

    console.log(`Contact form email sent from ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending contact form email:', error);
    throw error;
  }
}

export async function sendLoanRequestUserEmail(
  toEmail: string, 
  fullName: string, 
  loanType: string, 
  amount: string, 
  reference: string, 
  language: string = 'fr'
) {
  try {
    const { fromEmail } = await getBrevoClient();
    const { getEmailTemplate } = await import('./emailTemplates');
    
    const dashboardUrl = `${getBaseUrl()}/dashboard`;
    
    const template = getEmailTemplate('loanRequestUser', language as any, {
      fullName,
      loanType,
      amount,
      reference,
      dashboardUrl,
    });
    
    await sendEmail({
      to: toEmail,
      from: fromEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    console.log(`Loan request confirmation email sent to ${toEmail} in ${language}`);
    return true;
  } catch (error) {
    console.error('Error sending loan request confirmation email:', error);
    throw error;
  }
}

export interface DocumentInfo {
  documentType: string;
  fileUrl: string;
  fileName: string;
}

export async function sendLoanRequestAdminEmail(
  fullName: string, 
  email: string,
  phone: string | null,
  accountType: string,
  amount: string,
  duration: number,
  loanType: string, 
  reference: string, 
  userId: string,
  documents: DocumentInfo[],
  language: string = 'fr'
) {
  try {
    const { fromEmail } = await getBrevoClient();
    const { getEmailTemplate } = await import('./emailTemplates');
    const fs = await import('fs/promises');
    const path = await import('path');
    const { fileTypeFromFile } = await import('file-type');
    
    const adminEmail = process.env.ADMIN_EMAIL || fromEmail;
    const reviewUrl = `${getBaseUrl()}/admin/loans/${reference}`;
    
    const template = getEmailTemplate('loanRequestAdmin', language as any, {
      fullName,
      email,
      phone,
      accountType,
      amount,
      duration,
      loanType,
      reference,
      userId,
      reviewUrl,
      documents,
    });
    
    const attachments: Array<{
      content: string;
      filename: string;
      type: string;
    }> = [];

    for (const doc of documents) {
      try {
        const filePath = path.join(process.cwd(), doc.fileUrl);
        
        if (!(await fs.access(filePath).then(() => true).catch(() => false))) {
          console.error(`Document file not found: ${filePath}`);
          continue;
        }

        const buffer = await fs.readFile(filePath);
        
        const fileType = await fileTypeFromFile(filePath);
        const mimeType = fileType?.mime || 'application/octet-stream';
        
        const base64Content = buffer.toString('base64');
        
        attachments.push({
          content: base64Content,
          filename: doc.fileName,
          type: mimeType,
        });
        
        console.log(`Document attached: ${doc.fileName}`);
      } catch (error: any) {
        console.error(`Error processing document ${doc.fileName}:`, error.message || error);
      }
    }
    
    await sendEmail({
      to: adminEmail,
      from: fromEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    console.log(`Loan request admin notification sent to ${adminEmail} in ${language} with ${documents.length} documents (${attachments.length} attached)`);
    return true;
  } catch (error) {
    console.error('Error sending loan request admin notification:', error);
    throw error;
  }
}

export async function sendKYCUploadedAdminEmail(
  fullName: string, 
  email: string, 
  documentType: string, 
  loanType: string, 
  userId: string,
  language: string = 'fr'
) {
  try {
    const { fromEmail } = await getBrevoClient();
    const { getEmailTemplate } = await import('./emailTemplates');
    
    const adminEmail = process.env.ADMIN_EMAIL || fromEmail;
    const reviewUrl = `${getBaseUrl()}/admin/users/${userId}`;
    
    const template = getEmailTemplate('kycUploadedAdmin', language as any, {
      fullName,
      email,
      documentType,
      loanType,
      userId,
      reviewUrl,
    });
    
    await sendEmail({
      to: adminEmail,
      from: fromEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    console.log(`KYC uploaded admin notification sent to ${adminEmail} in ${language}`);
    return true;
  } catch (error) {
    console.error('Error sending KYC uploaded admin notification:', error);
    throw error;
  }
}

export async function sendLoanApprovedEmail(
  toEmail: string, 
  fullName: string, 
  loanType: string, 
  amount: string, 
  reference: string, 
  language: string = 'fr'
) {
  try {
    const { fromEmail } = await getBrevoClient();
    const { getEmailTemplate } = await import('./emailTemplates');
    
    const loginUrl = `${getBaseUrl()}/login`;
    
    const template = getEmailTemplate('loanApprovedUser', language as any, {
      fullName,
      loanType,
      amount,
      reference,
      loginUrl,
    });
    
    await sendEmail({
      to: toEmail,
      from: fromEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    console.log(`Loan approved email sent to ${toEmail} in ${language}`);
    return true;
  } catch (error) {
    console.error('Error sending loan approved email:', error);
    throw error;
  }
}

export async function sendTransferInitiatedAdminEmail(
  fullName: string, 
  email: string, 
  amount: string, 
  recipient: string, 
  transferId: string, 
  userId: string,
  language: string = 'fr'
) {
  try {
    const { fromEmail } = await getBrevoClient();
    const { getEmailTemplate } = await import('./emailTemplates');
    
    const adminEmail = process.env.ADMIN_EMAIL || fromEmail;
    const reviewUrl = `${getBaseUrl()}/admin/transfers/${transferId}`;
    
    const template = getEmailTemplate('transferInitiatedAdmin', language as any, {
      fullName,
      email,
      amount,
      recipient,
      transferId,
      userId,
      reviewUrl,
    });
    
    await sendEmail({
      to: adminEmail,
      from: fromEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    console.log(`Transfer initiated admin notification sent to ${adminEmail} in ${language}`);
    return true;
  } catch (error) {
    console.error('Error sending transfer initiated admin notification:', error);
    throw error;
  }
}

export async function sendTransferCodeEmail(
  toEmail: string, 
  fullName: string, 
  amount: string, 
  recipient: string, 
  code: string, 
  codeSequence: number, 
  totalCodes: number,
  language: string = 'fr'
) {
  try {
    const { fromEmail } = await getBrevoClient();
    const { getEmailTemplate } = await import('./emailTemplates');
    
    const template = getEmailTemplate('transferCodeUser', language as any, {
      fullName,
      amount,
      recipient,
      code,
      codeSequence: codeSequence.toString(),
      totalCodes: totalCodes.toString(),
    });
    
    await sendEmail({
      to: toEmail,
      from: fromEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    console.log(`Transfer code email (${codeSequence}/${totalCodes}) sent to ${toEmail} in ${language}`);
    return true;
  } catch (error) {
    console.error('Error sending transfer code email:', error);
    throw error;
  }
}

export async function sendTransferCompletedEmail(
  toEmail: string,
  fullName: string,
  amount: string,
  recipient: string,
  recipientIban: string,
  transferId: string,
  language: string = 'fr'
) {
  try {
    const { fromEmail } = await getBrevoClient();
    const safeName = escapeHtml(fullName);
    const safeRecipient = escapeHtml(recipient);
    
    const subject = language === 'en' 
      ? `Transfer Completed - ${amount}` 
      : `Virement effectué - ${amount}`;
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">${language === 'en' ? 'Transfer Completed' : 'Virement effectué'}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">
                ${language === 'en' ? 'Hello' : 'Bonjour'} <strong>${safeName}</strong>,
              </p>
              <p style="color: #374151; font-size: 16px; line-height: 1.5; margin: 0 0 30px 0;">
                ${language === 'en' 
                  ? 'Your transfer has been successfully completed.'
                  : 'Votre virement a été effectué avec succès.'}
              </p>
              
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <table cellpadding="8" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="color: #6b7280; font-weight: bold; width: 140px;">${language === 'en' ? 'Amount' : 'Montant'} :</td>
                    <td style="color: #059669; font-weight: bold; font-size: 18px;">${amount}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-weight: bold;">${language === 'en' ? 'Recipient' : 'Bénéficiaire'} :</td>
                    <td style="color: #1f2937;">${safeRecipient}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-weight: bold;">IBAN :</td>
                    <td style="color: #1f2937; font-family: monospace;">${recipientIban}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-weight: bold;">${language === 'en' ? 'Reference' : 'Référence'} :</td>
                    <td style="color: #1f2937; font-family: monospace;">${transferId}</td>
                  </tr>
                </table>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">
                ${language === 'en'
                  ? 'You can view this transaction in your dashboard.'
                  : 'Vous pouvez consulter cette transaction dans votre tableau de bord.'}
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                SOLVENTIS GROUP - ${language === 'en' ? 'Financing Solutions' : 'Solutions de financement'}<br>
                ${new Date().getFullYear()} ${language === 'en' ? 'All rights reserved' : 'Tous droits réservés'}.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
    
    const text = `${language === 'en' ? 'Hello' : 'Bonjour'} ${fullName},

${language === 'en' 
  ? 'Your transfer has been successfully completed.'
  : 'Votre virement a été effectué avec succès.'}

${language === 'en' ? 'Amount' : 'Montant'}: ${amount}
${language === 'en' ? 'Recipient' : 'Bénéficiaire'}: ${recipient}
IBAN: ${recipientIban}
${language === 'en' ? 'Reference' : 'Référence'}: ${transferId}

${language === 'en'
  ? 'You can view this transaction in your dashboard.'
  : 'Vous pouvez consulter cette transaction dans votre tableau de bord.'}

SOLVENTIS GROUP
${new Date().getFullYear()} ${language === 'en' ? 'All rights reserved' : 'Tous droits réservés'}.
    `;
    
    await sendEmail({
      to: toEmail,
      from: fromEmail,
      subject,
      html,
      text,
    });

    console.log(`Transfer completed email sent to ${toEmail} in ${language}`);
    return true;
  } catch (error) {
    console.error('Error sending transfer completed email:', error);
    throw error;
  }
}

export async function sendOTPEmail(
  toEmail: string,
  fullName: string,
  otpCode: string,
  language: string = 'fr'
) {
  try {
    const { fromEmail } = await getBrevoClient();
    const safeName = escapeHtml(fullName);
    
    const subject = language === 'en' 
      ? 'Your verification code - SOLVENTIS GROUP'
      : 'Votre code de vérification - SOLVENTIS GROUP';
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">${language === 'en' ? 'Verification Code' : 'Code de vérification'}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">
                ${language === 'en' ? 'Hello' : 'Bonjour'} <strong>${safeName}</strong>,
              </p>
              <p style="color: #374151; font-size: 16px; line-height: 1.5; margin: 0 0 30px 0;">
                ${language === 'en' 
                  ? 'Here is your verification code:'
                  : 'Voici votre code de vérification :'}
              </p>
              <div style="background-color: #f3f4f6; border-radius: 8px; padding: 30px; text-align: center; margin-bottom: 30px;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1f2937;">${otpCode}</span>
              </div>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0 0 20px 0;">
                ${language === 'en'
                  ? 'This code will expire in 10 minutes. Do not share it with anyone.'
                  : 'Ce code expirera dans 10 minutes. Ne le partagez avec personne.'}
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                SOLVENTIS GROUP - ${language === 'en' ? 'Financing Solutions' : 'Solutions de financement'}<br>
                ${new Date().getFullYear()} ${language === 'en' ? 'All rights reserved' : 'Tous droits réservés'}.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
    
    const text = `${language === 'en' ? 'Hello' : 'Bonjour'} ${fullName},

${language === 'en' 
  ? 'Here is your verification code:'
  : 'Voici votre code de vérification :'}

${otpCode}

${language === 'en'
  ? 'This code will expire in 10 minutes. Do not share it with anyone.'
  : 'Ce code expirera dans 10 minutes. Ne le partagez avec personne.'}

SOLVENTIS GROUP
${new Date().getFullYear()} ${language === 'en' ? 'All rights reserved' : 'Tous droits réservés'}.
    `;
    
    await sendEmail({
      to: toEmail,
      from: fromEmail,
      subject,
      html,
      text,
    });

    console.log(`OTP email sent to ${toEmail} in ${language}`);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
}

export async function sendSignedContractToAdmins(
  fullName: string,
  email: string,
  loanId: string,
  amount: string,
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  language: string = 'fr'
) {
  try {
    const { fromEmail } = await getBrevoClient();
    const adminEmail = process.env.ADMIN_EMAIL || fromEmail;
    const safeName = escapeHtml(fullName);
    const safeEmail = escapeHtml(email);
    
    const subject = language === 'en' 
      ? `Signed Contract Received - ${safeName} - Loan ${loanId.substring(0, 8)}`
      : `Contrat signé reçu - ${safeName} - Prêt ${loanId.substring(0, 8)}`;
    
    const reviewUrl = `${getBaseUrl()}/admin/loans`;
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">${language === 'en' ? 'Signed Contract Received' : 'Contrat signé reçu'}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">
                ${language === 'en' 
                  ? `A signed contract has been received and requires your review.`
                  : `Un contrat signé a été reçu et nécessite votre vérification.`}
              </p>
              
              <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <table cellpadding="8" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="color: #6b7280; font-weight: bold; width: 140px;">${language === 'en' ? 'Client' : 'Client'} :</td>
                    <td style="color: #1f2937; font-weight: bold;">${safeName}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-weight: bold;">Email :</td>
                    <td style="color: #1f2937;">${safeEmail}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-weight: bold;">${language === 'en' ? 'Loan ID' : 'Réf. Prêt'} :</td>
                    <td style="color: #1f2937; font-family: monospace;">${loanId.substring(0, 8)}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-weight: bold;">${language === 'en' ? 'Amount' : 'Montant'} :</td>
                    <td style="color: #2563eb; font-weight: bold; font-size: 18px;">${amount} EUR</td>
                  </tr>
                </table>
              </div>
              
              <div style="background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 15px; margin-bottom: 30px;">
                <p style="color: #92400e; font-size: 14px; margin: 0;">
                  <strong>${language === 'en' ? 'Action Required:' : 'Action requise :'}</strong> 
                  ${language === 'en' 
                    ? 'Please review the attached signed contract and confirm to release the funds.'
                    : 'Veuillez vérifier le contrat signé en pièce jointe et confirmer pour débloquer les fonds.'}
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${reviewUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  ${language === 'en' ? 'Review in Dashboard' : 'Vérifier dans le Dashboard'}
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                SOLVENTIS GROUP - ${language === 'en' ? 'Financing Solutions' : 'Solutions de financement'}<br>
                ${new Date().getFullYear()} ${language === 'en' ? 'All rights reserved' : 'Tous droits réservés'}.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
    
    const text = `${language === 'en' ? 'Signed Contract Received' : 'Contrat signé reçu'}

${language === 'en' ? 'Client' : 'Client'}: ${fullName}
Email: ${email}
${language === 'en' ? 'Loan ID' : 'Réf. Prêt'}: ${loanId.substring(0, 8)}
${language === 'en' ? 'Amount' : 'Montant'}: ${amount} EUR

${language === 'en' 
  ? 'Please review the attached signed contract and confirm to release the funds.'
  : 'Veuillez vérifier le contrat signé en pièce jointe et confirmer pour débloquer les fonds.'}

${language === 'en' ? 'Review in Dashboard' : 'Vérifier dans le Dashboard'}: ${reviewUrl}

SOLVENTIS GROUP
${new Date().getFullYear()} ${language === 'en' ? 'All rights reserved' : 'Tous droits réservés'}.
    `;
    
    const base64Content = fileBuffer.toString('base64');
    
    await sendEmail({
      to: adminEmail,
      from: fromEmail,
      subject,
      html,
      text,
      attachments: [{
        content: base64Content,
        filename: fileName,
        type: mimeType,
      }],
    });

    console.log(`Signed contract email sent to admin ${adminEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending signed contract email to admins:', error);
    throw error;
  }
}

export async function sendTransferCodesAdminEmail(
  userName: string,
  userEmail: string,
  loanId: string,
  loanAmount: string,
  codes: Array<{ code: string; codeContext: string; pausePercent: number; sequence: number }>,
  language: string = 'fr'
) {
  try {
    const { fromEmail } = await getBrevoClient();
    const adminEmail = process.env.ADMIN_EMAIL || fromEmail;
    const safeName = escapeHtml(userName);
    
    const subject = language === 'en' 
      ? `Transfer Codes Generated - ${safeName} - Loan ${loanId.substring(0, 8)}`
      : `Codes de transfert générés - ${safeName} - Prêt ${loanId.substring(0, 8)}`;
    
    const codesHtml = codes.map((c, idx) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${idx + 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-family: monospace; font-weight: bold; color: #2563eb;">${c.code}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${c.codeContext}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${c.pausePercent}%</td>
      </tr>
    `).join('');
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">${language === 'en' ? 'Transfer Codes Generated' : 'Codes de transfert générés'}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">
                ${language === 'en' 
                  ? `Transfer validation codes have been generated for the following loan:`
                  : `Les codes de validation de transfert ont été générés pour le prêt suivant :`}
              </p>
              
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <table cellpadding="8" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="color: #6b7280; font-weight: bold; width: 140px;">${language === 'en' ? 'Client' : 'Client'} :</td>
                    <td style="color: #1f2937; font-weight: bold;">${safeName}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-weight: bold;">Email :</td>
                    <td style="color: #1f2937;">${userEmail}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-weight: bold;">${language === 'en' ? 'Amount' : 'Montant'} :</td>
                    <td style="color: #059669; font-weight: bold; font-size: 18px;">${loanAmount} EUR</td>
                  </tr>
                </table>
              </div>
              
              <h3 style="color: #1f2937; margin: 20px 0 10px 0;">${language === 'en' ? 'Validation Codes:' : 'Codes de validation :'}</h3>
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #f9fafb;">
                    <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb;">#</th>
                    <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb;">Code</th>
                    <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb;">${language === 'en' ? 'Context' : 'Contexte'}</th>
                    <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb;">${language === 'en' ? 'Pause At' : 'Pause à'}</th>
                  </tr>
                </thead>
                <tbody>
                  ${codesHtml}
                </tbody>
              </table>
              
              <div style="background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 15px; margin-top: 30px;">
                <p style="color: #92400e; font-size: 14px; margin: 0;">
                  <strong>${language === 'en' ? 'Important:' : 'Important :'}</strong> 
                  ${language === 'en' 
                    ? 'These codes will be required at each pause percentage during the transfer. Communicate them to the client at the appropriate time.'
                    : 'Ces codes seront requis à chaque pourcentage de pause pendant le transfert. Communiquez-les au client au moment approprié.'}
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                SOLVENTIS GROUP - ${language === 'en' ? 'Financing Solutions' : 'Solutions de financement'}<br>
                ${new Date().getFullYear()} ${language === 'en' ? 'All rights reserved' : 'Tous droits réservés'}.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
    
    const codesText = codes.map((c, idx) => 
      `${idx + 1}. ${c.code} - ${c.codeContext} - Pause à ${c.pausePercent}%`
    ).join('\n');
    
    const text = `${language === 'en' ? 'Transfer Codes Generated' : 'Codes de transfert générés'}

${language === 'en' ? 'Client' : 'Client'}: ${userName}
Email: ${userEmail}
${language === 'en' ? 'Amount' : 'Montant'}: ${loanAmount} EUR

${language === 'en' ? 'Validation Codes:' : 'Codes de validation :'}
${codesText}

${language === 'en' 
  ? 'These codes will be required at each pause percentage during the transfer.'
  : 'Ces codes seront requis à chaque pourcentage de pause pendant le transfert.'}

SOLVENTIS GROUP
${new Date().getFullYear()} ${language === 'en' ? 'All rights reserved' : 'Tous droits réservés'}.
    `;
    
    await sendEmail({
      to: adminEmail,
      from: fromEmail,
      subject,
      html,
      text,
    });

    console.log(`Transfer codes email sent to admin ${adminEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending transfer codes email to admin:', error);
    throw error;
  }
}

export async function sendAdminTransferCompletionReport(
  userName: string,
  userEmail: string,
  transferId: string,
  amount: string,
  recipientName: string,
  recipientIban: string,
  loanId: string,
  language: string = 'fr'
) {
  try {
    const { fromEmail } = await getBrevoClient();
    const adminEmail = process.env.ADMIN_EMAIL || fromEmail;
    const safeName = escapeHtml(userName);
    const safeRecipient = escapeHtml(recipientName);
    
    const subject = language === 'en' 
      ? `Transfer Completed - ${safeName} - ${amount} EUR`
      : `Virement effectué - ${safeName} - ${amount} EUR`;
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">${language === 'en' ? 'Transfer Completed' : 'Virement effectué'}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.5; margin: 0 0 20px 0;">
                ${language === 'en' 
                  ? `A transfer has been successfully completed.`
                  : `Un virement a été effectué avec succès.`}
              </p>
              
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <table cellpadding="8" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="color: #6b7280; font-weight: bold; width: 140px;">${language === 'en' ? 'Client' : 'Client'} :</td>
                    <td style="color: #1f2937; font-weight: bold;">${safeName}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-weight: bold;">Email :</td>
                    <td style="color: #1f2937;">${userEmail}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-weight: bold;">${language === 'en' ? 'Amount' : 'Montant'} :</td>
                    <td style="color: #059669; font-weight: bold; font-size: 18px;">${amount} EUR</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-weight: bold;">${language === 'en' ? 'Recipient' : 'Bénéficiaire'} :</td>
                    <td style="color: #1f2937;">${safeRecipient}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-weight: bold;">IBAN :</td>
                    <td style="color: #1f2937; font-family: monospace;">${recipientIban}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-weight: bold;">${language === 'en' ? 'Transfer ID' : 'Réf. Virement'} :</td>
                    <td style="color: #1f2937; font-family: monospace;">${transferId.substring(0, 8)}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-weight: bold;">${language === 'en' ? 'Loan ID' : 'Réf. Prêt'} :</td>
                    <td style="color: #1f2937; font-family: monospace;">${loanId.substring(0, 8)}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                SOLVENTIS GROUP - ${language === 'en' ? 'Financing Solutions' : 'Solutions de financement'}<br>
                ${new Date().getFullYear()} ${language === 'en' ? 'All rights reserved' : 'Tous droits réservés'}.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
    
    const text = `${language === 'en' ? 'Transfer Completed' : 'Virement effectué'}

${language === 'en' ? 'Client' : 'Client'}: ${userName}
Email: ${userEmail}
${language === 'en' ? 'Amount' : 'Montant'}: ${amount} EUR
${language === 'en' ? 'Recipient' : 'Bénéficiaire'}: ${recipientName}
IBAN: ${recipientIban}
${language === 'en' ? 'Transfer ID' : 'Réf. Virement'}: ${transferId.substring(0, 8)}
${language === 'en' ? 'Loan ID' : 'Réf. Prêt'}: ${loanId.substring(0, 8)}

SOLVENTIS GROUP
${new Date().getFullYear()} ${language === 'en' ? 'All rights reserved' : 'Tous droits réservés'}.
    `;
    
    await sendEmail({
      to: adminEmail,
      from: fromEmail,
      subject,
      html,
      text,
    });

    console.log(`Transfer completion report sent to admin ${adminEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending transfer completion report to admin:', error);
    throw error;
  }
}
