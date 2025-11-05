import sgMail from '@sendgrid/mail';

let connectionSettings: any;

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=sendgrid',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key || !connectionSettings.settings.from_email)) {
    throw new Error('SendGrid not connected');
  }
  return { apiKey: connectionSettings.settings.api_key, email: connectionSettings.settings.from_email };
}

async function getUncachableSendGridClient() {
  const { apiKey, email } = await getCredentials();
  sgMail.setApiKey(apiKey);
  return {
    client: sgMail,
    fromEmail: email
  };
}

function getBaseUrl(): string {
  return process.env.REPLIT_DEV_DOMAIN 
    ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
    : 'http://localhost:5000';
}

export async function sendVerificationEmail(toEmail: string, fullName: string, token: string, accountType: string, language: string = 'fr') {
  try {
    const { client, fromEmail } = await getUncachableSendGridClient();
    const { getEmailTemplate } = await import('./emailTemplates');
    
    const verificationUrl = `${getBaseUrl()}/verify/${token}`;
    const accountTypeText = accountType === 'personal' ? 'personal' : 'business';
    
    const template = getEmailTemplate('verification', language as any, {
      fullName,
      verificationUrl,
      accountTypeText,
    });
    
    const msg = {
      to: toEmail,
      from: fromEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    await client.send(msg);
    console.log(`Verification email sent to ${toEmail} in ${language}`);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
}

export async function sendWelcomeEmail(toEmail: string, fullName: string, accountType: string, language: string = 'fr') {
  try {
    const { client, fromEmail } = await getUncachableSendGridClient();
    const { getEmailTemplate } = await import('./emailTemplates');
    
    const accountTypeText = accountType === 'personal' ? 'personal' : 'business';
    const loginUrl = `${getBaseUrl()}/login`;
    
    const template = getEmailTemplate('welcome', language as any, {
      fullName,
      accountTypeText,
      loginUrl,
    });
    
    const msg = {
      to: toEmail,
      from: fromEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    await client.send(msg);
    console.log(`Welcome email sent to ${toEmail} in ${language}`);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
}

export async function sendContractEmail(toEmail: string, fullName: string, loanId: string, amount: string, contractUrl: string, language: string = 'fr') {
  try {
    const { client, fromEmail } = await getUncachableSendGridClient();
    const { getEmailTemplate } = await import('./emailTemplates');
    
    const fullContractUrl = `${getBaseUrl()}${contractUrl}`;
    
    const template = getEmailTemplate('contract', language as any, {
      fullName,
      amount,
      loanId,
      contractUrl: fullContractUrl,
      fromEmail,
    });
    
    const msg = {
      to: toEmail,
      from: fromEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    await client.send(msg);
    console.log(`Contract email sent to ${toEmail} in ${language}`);
    return true;
  } catch (error) {
    console.error('Error sending contract email:', error);
    throw error;
  }
}
