import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import type { Loan, User } from '@shared/schema';

interface ContractData {
  user: User;
  loan: Loan;
  contractDate: string;
}

const getContractTemplate = (data: ContractData): string => {
  const { user, loan, contractDate } = data;
  
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      font-size: 11pt;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #2563eb;
    }
    .logo {
      font-size: 24pt;
      font-weight: bold;
      color: #2563eb;
      margin-bottom: 10px;
    }
    h1 {
      color: #2563eb;
      font-size: 18pt;
      text-align: center;
      margin: 30px 0;
    }
    h2 {
      color: #1e40af;
      font-size: 14pt;
      margin-top: 25px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 5px;
    }
    .info-box {
      background-color: #f3f4f6;
      padding: 15px;
      margin: 20px 0;
      border-left: 4px solid #2563eb;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin: 8px 0;
    }
    .label {
      font-weight: bold;
      color: #1f2937;
    }
    .value {
      color: #374151;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #d1d5db;
      padding: 12px;
      text-align: left;
    }
    th {
      background-color: #2563eb;
      color: white;
      font-weight: bold;
    }
    tr:nth-child(even) {
      background-color: #f9fafb;
    }
    .article {
      margin: 20px 0;
    }
    .article-title {
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 10px;
    }
    .signature-section {
      margin-top: 50px;
      page-break-inside: avoid;
    }
    .signature-box {
      margin-top: 40px;
      display: flex;
      justify-content: space-between;
    }
    .signature-item {
      width: 45%;
    }
    .signature-line {
      border-top: 1px solid #000;
      margin-top: 60px;
      padding-top: 5px;
      text-align: center;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      font-size: 9pt;
      text-align: center;
      color: #6b7280;
    }
    .highlight {
      background-color: #fef3c7;
      padding: 2px 4px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">ALTUS GROUP</div>
    <div>Solutions de financement professionnelles</div>
    <div style="font-size: 9pt; color: #6b7280;">123 Avenue des Champs-Élysées, 75008 Paris • Tél: +33 1 23 45 67 89</div>
  </div>

  <h1>CONTRAT DE PRÊT N° ${loan.id}</h1>

  <div class="info-box">
    <h2 style="margin-top: 0;">Informations sur l'emprunteur</h2>
    <div class="info-row">
      <span class="label">Nom complet:</span>
      <span class="value">${user.fullName}</span>
    </div>
    <div class="info-row">
      <span class="label">Email:</span>
      <span class="value">${user.email}</span>
    </div>
    ${user.phone ? `
    <div class="info-row">
      <span class="label">Téléphone:</span>
      <span class="value">${user.phone}</span>
    </div>
    ` : ''}
    ${user.companyName ? `
    <div class="info-row">
      <span class="label">Société:</span>
      <span class="value">${user.companyName}</span>
    </div>
    ` : ''}
    ${user.siret ? `
    <div class="info-row">
      <span class="label">SIRET:</span>
      <span class="value">${user.siret}</span>
    </div>
    ` : ''}
  </div>

  <div class="info-box">
    <h2 style="margin-top: 0;">Détails du prêt</h2>
    <div class="info-row">
      <span class="label">Type de prêt:</span>
      <span class="value">${getLoanTypeName(loan.loanType)}</span>
    </div>
    <div class="info-row">
      <span class="label">Montant emprunté:</span>
      <span class="value highlight">${parseFloat(loan.amount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
    </div>
    <div class="info-row">
      <span class="label">Taux d'intérêt annuel:</span>
      <span class="value highlight">${parseFloat(loan.interestRate).toFixed(2)} %</span>
    </div>
    <div class="info-row">
      <span class="label">Durée du prêt:</span>
      <span class="value">${loan.duration} mois</span>
    </div>
    <div class="info-row">
      <span class="label">Date du contrat:</span>
      <span class="value">${contractDate}</span>
    </div>
  </div>

  <h2>Conditions du prêt</h2>

  <div class="article">
    <div class="article-title">Article 1 - Objet du contrat</div>
    <p>
      Le présent contrat a pour objet l'octroi par ALTUS GROUP (ci-après "le Prêteur") à ${user.fullName} 
      (ci-après "l'Emprunteur") d'un prêt d'un montant de <strong>${parseFloat(loan.amount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</strong> 
      au taux d'intérêt annuel de <strong>${parseFloat(loan.interestRate).toFixed(2)}%</strong> pour une durée de <strong>${loan.duration} mois</strong>.
    </p>
  </div>

  <div class="article">
    <div class="article-title">Article 2 - Modalités de remboursement</div>
    <p>
      L'Emprunteur s'engage à rembourser le prêt selon un échéancier mensuel sur ${loan.duration} mois. 
      Chaque mensualité comprendra une part du capital emprunté ainsi que les intérêts calculés au taux annuel de ${parseFloat(loan.interestRate).toFixed(2)}%.
    </p>
    <p>
      Le montant estimé de la mensualité est de <strong>${calculateMonthlyPayment(parseFloat(loan.amount), parseFloat(loan.interestRate), loan.duration).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</strong>.
    </p>
  </div>

  <div class="article">
    <div class="article-title">Article 3 - Taux d'intérêt et coût total du crédit</div>
    <p>
      Le taux d'intérêt appliqué est fixe et s'élève à ${parseFloat(loan.interestRate).toFixed(2)}% par an. 
      Le coût total du crédit, incluant les intérêts, est estimé à <strong>${calculateTotalInterest(parseFloat(loan.amount), parseFloat(loan.interestRate), loan.duration).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</strong>.
    </p>
    <p>
      Le montant total à rembourser s'élève donc à <strong>${calculateTotalRepayment(parseFloat(loan.amount), parseFloat(loan.interestRate), loan.duration).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</strong>.
    </p>
  </div>

  <div class="article">
    <div class="article-title">Article 4 - Déblocage des fonds</div>
    <p>
      Les fonds seront mis à disposition de l'Emprunteur sur le compte bancaire renseigné, 
      dans un délai allant de quelques minutes à 24 heures maximum suivant la réception du présent contrat dûment signé.
    </p>
  </div>

  <div class="article">
    <div class="article-title">Article 5 - Remboursement anticipé</div>
    <p>
      L'Emprunteur a la possibilité de procéder à un remboursement anticipé, total ou partiel, 
      du capital restant dû sans pénalités. Toute demande de remboursement anticipé doit être formulée 
      par écrit au moins 30 jours avant la date souhaitée.
    </p>
  </div>

  <div class="article">
    <div class="article-title">Article 6 - Défaut de paiement</div>
    <p>
      En cas de défaut de paiement d'une mensualité, des pénalités de retard de 5% par an seront appliquées 
      sur les sommes restant dues. Après deux mensualités impayées consécutives, le Prêteur se réserve le droit 
      d'exiger le remboursement immédiat du capital restant dû.
    </p>
  </div>

  <div class="article">
    <div class="article-title">Article 7 - Assurance</div>
    <p>
      L'Emprunteur est libre de souscrire ou non une assurance emprunteur. Toutefois, le Prêteur recommande 
      vivement la souscription d'une assurance décès-invalidité pour garantir le remboursement du prêt en cas d'événements imprévus.
    </p>
  </div>

  <div class="article">
    <div class="article-title">Article 8 - Droit de rétractation</div>
    <p>
      Conformément aux dispositions légales en vigueur, l'Emprunteur dispose d'un délai de rétractation de 14 jours 
      calendaires à compter de la signature du présent contrat. Ce droit peut être exercé par courrier recommandé avec accusé de réception 
      adressé à ALTUS GROUP.
    </p>
  </div>

  <div class="article">
    <div class="article-title">Article 9 - Loi applicable et juridiction compétente</div>
    <p>
      Le présent contrat est régi par le droit français. En cas de litige, les parties s'efforceront de trouver 
      une solution amiable. À défaut, les tribunaux compétents de Paris seront seuls compétents.
    </p>
  </div>

  <div class="signature-section">
    <p style="margin-bottom: 30px;">
      <strong>Fait en deux exemplaires originaux,</strong><br>
      À Paris, le ${contractDate}
    </p>

    <div class="signature-box">
      <div class="signature-item">
        <p><strong>Pour ALTUS GROUP</strong></p>
        <p style="font-size: 10pt; color: #6b7280;">Le Prêteur</p>
        <div class="signature-line">
          Signature et cachet
        </div>
      </div>

      <div class="signature-item">
        <p><strong>L'Emprunteur</strong></p>
        <p style="font-size: 10pt; color: #6b7280;">${user.fullName}</p>
        <div class="signature-line">
          Signature précédée de<br>"Lu et approuvé"
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>
      ALTUS GROUP - SAS au capital de 1 000 000 € - RCS Paris 123 456 789<br>
      Siège social: 123 Avenue des Champs-Élysées, 75008 Paris, France<br>
      www.altus-group.fr - contact@altus-group.fr
    </p>
  </div>
</body>
</html>
  `;
};

function getLoanTypeName(type: string): string {
  const types: Record<string, string> = {
    'auto': 'Prêt automobile',
    'mortgage': 'Prêt immobilier',
    'green': 'Prêt écologique',
    'renovation': 'Prêt travaux',
    'student': 'Prêt étudiant',
    'business': 'Prêt professionnel',
    'personal': 'Prêt personnel',
    'cashFlow': 'Prêt de trésorerie',
    'equipment': 'Prêt matériel',
    'vehicleFleet': 'Prêt flotte véhicules',
    'lineOfCredit': 'Ligne de crédit',
    'commercialProperty': 'Prêt immobilier commercial',
  };
  return types[type] || type;
}

function calculateMonthlyPayment(principal: number, annualRate: number, months: number): number {
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / months;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
}

function calculateTotalInterest(principal: number, annualRate: number, months: number): number {
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, months);
  return (monthlyPayment * months) - principal;
}

function calculateTotalRepayment(principal: number, annualRate: number, months: number): number {
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, months);
  return monthlyPayment * months;
}

export async function generateContractPDF(user: User, loan: Loan): Promise<string> {
  const contractDate = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const htmlContent = getContractTemplate({ user, loan, contractDate });

  const uploadsDir = path.join(process.cwd(), 'uploads', 'contracts');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filename = `contrat_${loan.id}_${Date.now()}.pdf`;
  const filepath = path.join(uploadsDir, filename);

  let chromiumPath = '/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium';
  
  try {
    const whichResult = execSync('which chromium || which chromium-browser || which google-chrome', { encoding: 'utf-8' }).trim();
    if (whichResult) {
      chromiumPath = whichResult;
    }
  } catch (e) {
  }

  const browser = await puppeteer.launch({
    executablePath: chromiumPath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--disable-dev-tools'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    await page.pdf({
      path: filepath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0'
      }
    });

    return `/uploads/contracts/${filename}`;
  } finally {
    await browser.close();
  }
}
