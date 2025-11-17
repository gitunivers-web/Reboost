import puppeteer from 'puppeteer';
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
      color: #1a1a1a;
      font-size: 11pt;
    }
    .header {
      background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
      color: white;
      padding: 35px 45px;
      margin: -2cm -2cm 30px -2cm;
      position: relative;
    }
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 30px;
      text-align: left;
      padding-bottom: 25px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }
    .logo-section {
      flex: 1;
      max-width: 50%;
    }
    .logo {
      font-size: 32pt;
      font-weight: 900;
      letter-spacing: 3px;
      margin-bottom: 6px;
      text-transform: uppercase;
      line-height: 1;
    }
    .logo-subtitle {
      font-size: 12pt;
      opacity: 0.92;
      font-weight: 300;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    .header-info {
      text-align: right;
      font-size: 9pt;
      line-height: 2;
      max-width: 45%;
    }
    .header-info strong {
      display: block;
      font-size: 10pt;
      margin-bottom: 8px;
      letter-spacing: 0.5px;
    }
    .header-info .contact-line {
      display: block;
      opacity: 0.92;
    }
    .contract-ref {
      background: rgba(255, 255, 255, 0.18);
      padding: 14px 24px;
      border-radius: 8px;
      display: inline-block;
      font-size: 11pt;
      font-weight: 700;
      letter-spacing: 1.2px;
      backdrop-filter: blur(10px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.25);
    }
    h1 {
      color: #1e3a8a;
      font-size: 20pt;
      text-align: center;
      margin: 35px 0;
      font-weight: bold;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 15px;
    }
    h2 {
      color: #1e3a8a;
      font-size: 14pt;
      margin-top: 25px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 5px;
      font-weight: 600;
    }
    .info-box {
      background-color: #f8fafc;
      padding: 20px;
      margin: 20px 0;
      border-left: 5px solid #2563eb;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin: 10px 0;
      padding: 5px 0;
    }
    .label {
      font-weight: 600;
      color: #1e3a8a;
    }
    .value {
      color: #334155;
      font-weight: 500;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 12px;
      text-align: left;
    }
    th {
      background-color: #1e3a8a;
      color: white;
      font-weight: 600;
    }
    tr:nth-child(even) {
      background-color: #f8fafc;
    }
    .article {
      margin: 25px 0;
      padding: 15px 0;
    }
    .article-title {
      font-weight: 700;
      color: #1e3a8a;
      margin-bottom: 12px;
      font-size: 12pt;
    }
    .article p {
      text-align: justify;
      margin: 10px 0;
      line-height: 1.7;
    }
    .article ul {
      margin: 10px 0 10px 20px;
      line-height: 1.8;
    }
    .article li {
      margin: 8px 0;
    }
    .signature-section {
      margin-top: 50px;
      page-break-inside: avoid;
    }
    .signature-box {
      margin-top: 40px;
      display: flex;
      justify-content: space-between;
      gap: 30px;
    }
    .signature-item {
      flex: 1;
      border: 2px solid #e5e7eb;
      padding: 20px;
      border-radius: 6px;
      background-color: #fafafa;
    }
    .signature-header {
      font-weight: 700;
      font-size: 11pt;
      color: #1e3a8a;
      margin-bottom: 5px;
    }
    .signature-role {
      font-size: 9pt;
      color: #64748b;
      margin-bottom: 15px;
    }
    .signature-line {
      border-top: 2px solid #334155;
      margin-top: 80px;
      padding-top: 8px;
      text-align: center;
      font-size: 9pt;
      color: #64748b;
      font-style: italic;
    }
    .pre-signed {
      margin-top: 20px;
      text-align: center;
    }
    .stamp-placeholder {
      display: inline-block;
      width: 120px;
      height: 120px;
      border: 3px dashed #cbd5e1;
      border-radius: 50%;
      margin: 10px auto;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9pt;
      color: #94a3b8;
      text-align: center;
      line-height: 1.4;
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(30, 58, 138, 0.08) 100%);
    }
    .footer {
      margin-top: 40px;
      padding-top: 25px;
      border-top: 3px solid #e5e7eb;
      font-size: 9pt;
      text-align: center;
      color: #64748b;
      line-height: 1.8;
    }
    .footer-bold {
      font-weight: 600;
      color: #475569;
    }
    .highlight {
      background-color: #fef3c7;
      padding: 3px 6px;
      font-weight: 700;
      border-radius: 3px;
    }
    .important-notice {
      background-color: #fef9e7;
      border-left: 5px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-top">
      <div class="logo-section">
        <div class="logo">ALTUS</div>
        <div class="logo-subtitle">Finance Group</div>
      </div>
      <div class="header-info">
        <strong>ALTUS FINANCE GROUP S.à r.l.</strong>
        <span class="contact-line">19 Rue Sigismond, L-2537 Luxembourg</span>
        <span class="contact-line">RCS Luxembourg B123456</span>
        <span class="contact-line">Tél: +352 40 63 48</span>
        <span class="contact-line">Email: contact@altusfinance.lu</span>
        <span class="contact-line">www.altusfinance.lu</span>
      </div>
    </div>
    <div style="text-align: center;">
      <div class="contract-ref">CONTRAT DE PRÊT N° ${loan.id.toUpperCase()}</div>
    </div>
  </div>

  <h1>Contrat de Prêt Professionnel</h1>

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
      Le présent contrat a pour objet l'octroi par ALTUS FINANCE GROUP (ci-après "le Prêteur") à ${user.fullName} 
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
    <div class="article-title">Article 4 – Déblocage des fonds</div>
    <p>
      Les fonds du prêt seront mis à disposition de l'Emprunteur sur le compte affilié ALTUS FINANCE GROUP ouvert au nom de l'Emprunteur au sein du réseau ALTUS. L'Emprunteur reconnaît et accepte que :
    </p>
    <ul>
      <li>le versement initial sera crédité sur ce compte affilié ;</li>
      <li>il appartient à l'Emprunteur d'initier et d'assurer le virement des fonds depuis son compte affilié ALTUS vers le compte bancaire externe de son choix ;</li>
      <li>le déblocage effectif des fonds aura lieu dans un délai maximum de 24 heures ouvrées à compter de la réception du présent contrat dûment signé et de la réalisation des conditions suspensives (notamment vérifications KYC/AML et souscription de l'assurance si requise) ;</li>
      <li>ALTUS FINANCE GROUP ne pourra être tenue responsable d'un délai de transfert externe au-delà des opérations initiées par l'Emprunteur.</li>
    </ul>
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
    <div class="article-title">Article 7 – Assurance emprunteur</div>
    <p>
      La souscription d'une assurance emprunteur couvrant au minimum le risque décès et invalidité est <strong>strictement obligatoire</strong> pour la sécurité du prêt accordé et le respect des normes en vigueur.
    </p>
    <p>
      L'Emprunteur s'engage à fournir la preuve de souscription de cette assurance avant le déblocage des fonds. À défaut, ALTUS FINANCE GROUP se réserve le droit de suspendre le versement du prêt jusqu'à réception des justificatifs requis.
    </p>
  </div>

  <div class="article">
    <div class="article-title">Article 8 - Droit de rétractation</div>
    <p>
      Conformément aux dispositions légales en vigueur, l'Emprunteur dispose d'un délai de rétractation de 14 jours 
      calendaires à compter de la signature du présent contrat. Ce droit peut être exercé par courrier recommandé avec accusé de réception 
      adressé à ALTUS FINANCE GROUP.
    </p>
  </div>

  <div class="article">
    <div class="article-title">Article 9 - Loi applicable et juridiction compétente</div>
    <p>
      Le présent contrat est régi par le droit luxembourgeois. En cas de litige, les parties s'efforceront de trouver 
      une solution amiable. À défaut, les tribunaux compétents de Luxembourg seront seuls compétents.
    </p>
  </div>

  <div class="signature-section">
    <p style="margin-bottom: 30px; text-align: center;">
      <strong style="font-size: 11pt;">Fait en deux exemplaires originaux</strong><br>
      <span style="color: #64748b;">À Luxembourg, le ${contractDate}</span>
    </p>

    <div class="signature-box">
      <div class="signature-item">
        <div class="signature-header">Pour ALTUS FINANCE GROUP</div>
        <div class="signature-role">Le Prêteur</div>
        <div class="pre-signed">
          <p style="font-style: italic; font-size: 10pt; color: #2563eb; margin-bottom: 10px;">
            ✓ Document pré-signé et validé
          </p>
          <div style="font-family: 'Brush Script MT', cursive; font-size: 18pt; color: #1e3a8a; margin: 15px 0;">
            Direction Générale
          </div>
          <div class="stamp-placeholder">
            <div style="font-weight: bold; text-transform: uppercase;">
              ALTUS<br>FINANCE<br>GROUP<br>
              <span style="font-size: 7pt;">Luxembourg</span>
            </div>
          </div>
          <p style="font-size: 8pt; color: #94a3b8; margin-top: 10px;">
            Signature électronique certifiée<br>
            Date: ${contractDate}
          </p>
        </div>
      </div>

      <div class="signature-item">
        <div class="signature-header">L'Emprunteur</div>
        <div class="signature-role">${user.fullName}</div>
        <div class="important-notice" style="font-size: 10pt; margin-bottom: 15px;">
          <strong>Instructions de signature :</strong><br>
          1. Téléchargez ce document<br>
          2. Imprimez et signez précédé de "Lu et approuvé"<br>
          3. Scannez le document signé<br>
          4. Renvoyez-le via votre espace client
        </div>
        <div class="signature-line">
          Signature précédée de<br>"Lu et approuvé"
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
    <p class="footer-bold">ALTUS FINANCE GROUP - S.à r.l.</p>
    <p style="margin: 8px 0;">
      Capital social: 1 000 000 € • RCS Luxembourg B123456<br>
      Siège social: 19 Rue Sigismond, L-2537 Luxembourg<br>
      Tél: +352 40 63 48 • Email: infos@altusfinancegroup.com<br>
      www.altusfinancegroup.com
    </p>
    <p style="margin-top: 15px; font-size: 8pt; font-style: italic;">
      Ce document est confidentiel et destiné exclusivement à son destinataire.<br>
      Toute reproduction, diffusion ou utilisation non autorisée est strictement interdite.
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
  console.log('=== DÉBUT GÉNÉRATION CONTRAT PDF ===');
  console.log(`Loan ID: ${loan.id}, User: ${user.fullName}, Amount: ${loan.amount}`);
  
  const contractDate = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  console.log('✓ Template HTML généré');

  const htmlContent = getContractTemplate({ user, loan, contractDate });

  const uploadsDir = path.join(process.cwd(), 'uploads', 'contracts');
  console.log(`Vérification répertoire: ${uploadsDir}`);
  
  if (!fs.existsSync(uploadsDir)) {
    console.log('Création du répertoire uploads/contracts...');
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✓ Répertoire créé');
  } else {
    console.log('✓ Répertoire existe déjà');
  }

  const filename = `contrat_${loan.id}_${Date.now()}.pdf`;
  const filepath = path.join(uploadsDir, filename);
  console.log(`Chemin du fichier PDF: ${filepath}`);

  console.log('Lancement de Puppeteer...');
  let browser;
  try {
    let executablePath: string | undefined = undefined;
    
    // Sur Replit (environnement Nix), utiliser le Chromium système
    // Sur Render/autre, utiliser le Chromium embarqué de Puppeteer
    const isReplit = process.env.REPL_ID !== undefined;
    
    if (isReplit) {
      const nixChromiumPath = '/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium';
      if (fs.existsSync(nixChromiumPath)) {
        executablePath = nixChromiumPath;
        console.log(`✓ [Replit] Chromium Nix: ${executablePath}`);
      }
    }
    
    // Fallback: utiliser le Chromium embarqué de Puppeteer
    if (!executablePath) {
      try {
        executablePath = puppeteer.executablePath();
        console.log(`✓ [Production] Chromium Puppeteer: ${executablePath}`);
      } catch (e) {
        console.log('⚠ Impossible de trouver Chromium');
      }
    }
    
    const launchOptions: any = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-dev-tools'
      ]
    };
    
    if (executablePath) {
      launchOptions.executablePath = executablePath;
    }
    
    browser = await puppeteer.launch(launchOptions);
    console.log('✓ Browser Puppeteer lancé avec succès');
  } catch (launchError) {
    console.error('✗ ERREUR lors du lancement de Puppeteer:');
    console.error(launchError);
    throw launchError;
  }

  try {
    console.log('Création d\'une nouvelle page...');
    const page = await browser.newPage();
    console.log('✓ Page créée');
    
    console.log('Chargement du contenu HTML...');
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    console.log('✓ Contenu HTML chargé');
    
    console.log('Génération du PDF...');
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
    console.log(`✓ PDF généré avec succès: ${filename}`);

    console.log('=== FIN GÉNÉRATION CONTRAT PDF - SUCCÈS ===');
    return `/uploads/contracts/${filename}`;
  } catch (pdfError) {
    console.error('✗ ERREUR lors de la génération du PDF:');
    console.error(pdfError);
    throw pdfError;
  } finally {
    console.log('Fermeture du browser...');
    await browser.close();
    console.log('✓ Browser fermé');
  }
}
