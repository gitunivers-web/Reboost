import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import type { Loan, User } from '@shared/schema';

interface ContractData {
  user: User;
  loan: Loan;
  contractDate: string;
  language?: string;
}

type ContractLanguage = 'fr' | 'en' | 'de' | 'pt' | 'es' | 'it' | 'nl';

interface ContractTranslations {
  contractTitle: string;
  contractNumber: string;
  borrowerInfo: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  siret: string;
  loanDetails: string;
  loanType: string;
  amountBorrowed: string;
  annualInterestRate: string;
  loanDuration: string;
  contractDate: string;
  months: string;
  loanConditions: string;
  article1Title: string;
  article1Content: (userName: string, amount: string, rate: string, duration: number) => string;
  article2Title: string;
  article2Content: (duration: number, rate: string, monthly: string) => string;
  article3Title: string;
  article3Content: (rate: string, totalInterest: string, totalRepayment: string) => string;
  article4Title: string;
  article4Content: string;
  article5Title: string;
  article5Content: string;
  article6Title: string;
  article6Content: string;
  article7Title: string;
  article7Content: string;
  article8Title: string;
  article8Content: string;
  article9Title: string;
  article9Content: string;
  signatureSection: string;
  madeInDuplicates: string;
  inLuxembourg: string;
  forSolventis: string;
  lender: string;
  borrower: string;
  preSigned: string;
  management: string;
  solventisStamp: string;
  luxembourg: string;
  electronicSignature: string;
  date: string;
  signatureInstructions: string;
  instruction1: string;
  instruction2: string;
  instruction3: string;
  instruction4: string;
  signatureLine: string;
  readAndApproved: string;
  confidentialNotice: string;
  shareCapital: string;
  headquarters: string;
  tel: string;
  loanTypes: Record<string, string>;
}

const contractTranslations: Record<ContractLanguage, ContractTranslations> = {
  fr: {
    contractTitle: 'Contrat de Prêt Professionnel',
    contractNumber: 'CONTRAT DE PRÊT N°',
    borrowerInfo: "Informations sur l'emprunteur",
    fullName: 'Nom complet',
    email: 'Email',
    phone: 'Téléphone',
    company: 'Société',
    siret: 'SIRET',
    loanDetails: 'Détails du prêt',
    loanType: 'Type de prêt',
    amountBorrowed: 'Montant emprunté',
    annualInterestRate: "Taux d'intérêt annuel",
    loanDuration: 'Durée du prêt',
    contractDate: 'Date du contrat',
    months: 'mois',
    loanConditions: 'Conditions du prêt',
    article1Title: 'Article 1 - Objet du contrat',
    article1Content: (userName, amount, rate, duration) => 
      `Le présent contrat a pour objet l'octroi par SOLVENTUS GROUP (ci-après "le Prêteur") à ${userName} (ci-après "l'Emprunteur") d'un prêt d'un montant de <strong>${amount} €</strong> au taux d'intérêt annuel de <strong>${rate}%</strong> pour une durée de <strong>${duration} mois</strong>.`,
    article2Title: 'Article 2 - Modalités de remboursement',
    article2Content: (duration, rate, monthly) =>
      `L'Emprunteur s'engage à rembourser le prêt selon un échéancier mensuel sur ${duration} mois. Chaque mensualité comprendra une part du capital emprunté ainsi que les intérêts calculés au taux annuel de ${rate}%. Le montant estimé de la mensualité est de <strong>${monthly} €</strong>.`,
    article3Title: 'Article 3 - Taux d\'intérêt et coût total du crédit',
    article3Content: (rate, totalInterest, totalRepayment) =>
      `Le taux d'intérêt appliqué est fixe et s'élève à ${rate}% par an. Le coût total du crédit, incluant les intérêts, est estimé à <strong>${totalInterest} €</strong>. Le montant total à rembourser s'élève donc à <strong>${totalRepayment} €</strong>.`,
    article4Title: 'Article 4 – Déblocage des fonds',
    article4Content: `Les fonds du prêt seront mis à disposition de l'Emprunteur sur le compte affilié SOLVENTUS GROUP ouvert au nom de l'Emprunteur au sein du réseau SOLVENTUS. L'Emprunteur reconnaît et accepte que le versement initial sera crédité sur ce compte affilié, qu'il lui appartient d'initier le virement vers son compte bancaire externe, et que le déblocage effectif des fonds aura lieu dans un délai maximum de 24 heures ouvrées à compter de la réception du présent contrat dûment signé.`,
    article5Title: 'Article 5 - Remboursement anticipé',
    article5Content: "L'Emprunteur a la possibilité de procéder à un remboursement anticipé, total ou partiel, du capital restant dû sans pénalités. Toute demande de remboursement anticipé doit être formulée par écrit au moins 30 jours avant la date souhaitée.",
    article6Title: 'Article 6 - Défaut de paiement',
    article6Content: "En cas de défaut de paiement d'une mensualité, des pénalités de retard de 5% par an seront appliquées sur les sommes restant dues. Après deux mensualités impayées consécutives, le Prêteur se réserve le droit d'exiger le remboursement immédiat du capital restant dû.",
    article7Title: 'Article 7 – Assurance emprunteur',
    article7Content: "La souscription d'une assurance emprunteur demeure facultative, mais une couverture incluant au minimum les risques décès et invalidité présente des avantages significatifs pour l'emprunteur. SOLVENTUS GROUP en recommande l'adhésion, tout en laissant à chaque emprunteur la liberté de sa décision.",
    article8Title: 'Article 8 - Droit de rétractation',
    article8Content: "Conformément aux dispositions légales en vigueur, l'Emprunteur dispose d'un délai de rétractation de 14 jours calendaires à compter de la signature du présent contrat.",
    article9Title: 'Article 9 - Loi applicable et juridiction compétente',
    article9Content: "Le présent contrat est régi par le droit luxembourgeois. En cas de litige, les parties s'efforceront de trouver une solution amiable. À défaut, les tribunaux compétents de Luxembourg seront seuls compétents.",
    signatureSection: 'Signatures',
    madeInDuplicates: 'Fait en deux exemplaires originaux',
    inLuxembourg: 'À Luxembourg, le',
    forSolventis: 'Pour SOLVENTUS GROUP',
    lender: 'Le Prêteur',
    borrower: "L'Emprunteur",
    preSigned: '✓ Document pré-signé et validé',
    management: 'Direction Générale',
    solventisStamp: 'SOLVENTUS\nGROUP',
    luxembourg: 'Luxembourg',
    electronicSignature: 'Signature électronique certifiée',
    date: 'Date',
    signatureInstructions: 'Instructions de signature :',
    instruction1: '1. Téléchargez ce document',
    instruction2: '2. Imprimez et signez précédé de "Lu et approuvé"',
    instruction3: '3. Scannez le document signé',
    instruction4: '4. Renvoyez-le via votre espace client',
    signatureLine: 'Signature précédée de',
    readAndApproved: '"Lu et approuvé"',
    confidentialNotice: 'Ce document est confidentiel et destiné exclusivement à son destinataire. Toute reproduction, diffusion ou utilisation non autorisée est strictement interdite.',
    shareCapital: 'Capital social',
    headquarters: 'Siège social',
    tel: 'Tél',
    loanTypes: {
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
    }
  },
  en: {
    contractTitle: 'Professional Loan Agreement',
    contractNumber: 'LOAN AGREEMENT N°',
    borrowerInfo: 'Borrower Information',
    fullName: 'Full Name',
    email: 'Email',
    phone: 'Phone',
    company: 'Company',
    siret: 'Company ID',
    loanDetails: 'Loan Details',
    loanType: 'Loan Type',
    amountBorrowed: 'Loan Amount',
    annualInterestRate: 'Annual Interest Rate',
    loanDuration: 'Loan Duration',
    contractDate: 'Contract Date',
    months: 'months',
    loanConditions: 'Loan Terms',
    article1Title: 'Article 1 - Purpose of Contract',
    article1Content: (userName, amount, rate, duration) =>
      `This contract is for the granting by SOLVENTUS GROUP (hereinafter "the Lender") to ${userName} (hereinafter "the Borrower") of a loan in the amount of <strong>€${amount}</strong> at an annual interest rate of <strong>${rate}%</strong> for a duration of <strong>${duration} months</strong>.`,
    article2Title: 'Article 2 - Repayment Terms',
    article2Content: (duration, rate, monthly) =>
      `The Borrower commits to repay the loan on a monthly schedule over ${duration} months. Each monthly payment will include a portion of the borrowed capital and interest calculated at the annual rate of ${rate}%. The estimated monthly payment is <strong>€${monthly}</strong>.`,
    article3Title: 'Article 3 - Interest Rate and Total Credit Cost',
    article3Content: (rate, totalInterest, totalRepayment) =>
      `The applied interest rate is fixed at ${rate}% per year. The total cost of credit, including interest, is estimated at <strong>€${totalInterest}</strong>. The total amount to be repaid is therefore <strong>€${totalRepayment}</strong>.`,
    article4Title: 'Article 4 – Fund Disbursement',
    article4Content: 'The loan funds will be made available to the Borrower in the SOLVENTUS GROUP affiliated account opened in the Borrower\'s name within the SOLVENTUS network. The Borrower acknowledges and accepts that the initial payment will be credited to this affiliated account, that it is their responsibility to initiate the transfer to their external bank account, and that the effective disbursement of funds will occur within a maximum of 24 business hours from receipt of this duly signed contract.',
    article5Title: 'Article 5 - Early Repayment',
    article5Content: 'The Borrower has the option to make early repayment, total or partial, of the remaining capital without penalties. Any request for early repayment must be submitted in writing at least 30 days before the desired date.',
    article6Title: 'Article 6 - Default of Payment',
    article6Content: 'In case of default on a monthly payment, late payment penalties of 5% per year will be applied to the remaining amounts due. After two consecutive unpaid installments, the Lender reserves the right to demand immediate repayment of the remaining capital.',
    article7Title: 'Article 7 – Borrower Insurance',
    article7Content: 'Borrower insurance remains optional, but coverage including at least death and disability risks presents significant advantages for the borrower. SOLVENTUS GROUP recommends its subscription, while leaving each borrower the freedom of their decision.',
    article8Title: 'Article 8 - Right of Withdrawal',
    article8Content: 'In accordance with applicable legal provisions, the Borrower has a withdrawal period of 14 calendar days from the signing of this contract.',
    article9Title: 'Article 9 - Applicable Law and Jurisdiction',
    article9Content: 'This contract is governed by Luxembourg law. In case of dispute, the parties will endeavor to find an amicable solution. Failing that, the competent courts of Luxembourg shall have sole jurisdiction.',
    signatureSection: 'Signatures',
    madeInDuplicates: 'Made in two original copies',
    inLuxembourg: 'In Luxembourg, on',
    forSolventis: 'For SOLVENTUS GROUP',
    lender: 'The Lender',
    borrower: 'The Borrower',
    preSigned: '✓ Pre-signed and validated document',
    management: 'General Management',
    solventisStamp: 'SOLVENTUS\nGROUP',
    luxembourg: 'Luxembourg',
    electronicSignature: 'Certified electronic signature',
    date: 'Date',
    signatureInstructions: 'Signature instructions:',
    instruction1: '1. Download this document',
    instruction2: '2. Print and sign with "Read and approved"',
    instruction3: '3. Scan the signed document',
    instruction4: '4. Return it via your customer area',
    signatureLine: 'Signature preceded by',
    readAndApproved: '"Read and approved"',
    confidentialNotice: 'This document is confidential and intended exclusively for its recipient. Any reproduction, distribution or unauthorized use is strictly prohibited.',
    shareCapital: 'Share Capital',
    headquarters: 'Headquarters',
    tel: 'Tel',
    loanTypes: {
      'auto': 'Auto Loan',
      'mortgage': 'Mortgage Loan',
      'green': 'Green Loan',
      'renovation': 'Renovation Loan',
      'student': 'Student Loan',
      'business': 'Business Loan',
      'personal': 'Personal Loan',
      'cashFlow': 'Cash Flow Loan',
      'equipment': 'Equipment Loan',
      'vehicleFleet': 'Vehicle Fleet Loan',
      'lineOfCredit': 'Line of Credit',
      'commercialProperty': 'Commercial Property Loan',
    }
  },
  de: {
    contractTitle: 'Gewerblicher Darlehensvertrag',
    contractNumber: 'DARLEHENSVERTRAG NR.',
    borrowerInfo: 'Angaben zum Darlehensnehmer',
    fullName: 'Vollständiger Name',
    email: 'E-Mail',
    phone: 'Telefon',
    company: 'Unternehmen',
    siret: 'Firmen-ID',
    loanDetails: 'Darlehensdetails',
    loanType: 'Darlehensart',
    amountBorrowed: 'Darlehensbetrag',
    annualInterestRate: 'Jahreszinssatz',
    loanDuration: 'Darlehensdauer',
    contractDate: 'Vertragsdatum',
    months: 'Monate',
    loanConditions: 'Darlehensbedingungen',
    article1Title: 'Artikel 1 - Vertragszweck',
    article1Content: (userName, amount, rate, duration) =>
      `Dieser Vertrag regelt die Gewährung eines Darlehens durch SOLVENTUS GROUP (nachfolgend "Darlehensgeber") an ${userName} (nachfolgend "Darlehensnehmer") in Höhe von <strong>${amount} €</strong> zu einem jährlichen Zinssatz von <strong>${rate}%</strong> für eine Laufzeit von <strong>${duration} Monaten</strong>.`,
    article2Title: 'Artikel 2 - Rückzahlungsmodalitäten',
    article2Content: (duration, rate, monthly) =>
      `Der Darlehensnehmer verpflichtet sich, das Darlehen gemäß einem monatlichen Tilgungsplan über ${duration} Monate zurückzuzahlen. Jede monatliche Rate umfasst einen Teil des geliehenen Kapitals sowie Zinsen, die zum jährlichen Satz von ${rate}% berechnet werden. Die geschätzte monatliche Rate beträgt <strong>${monthly} €</strong>.`,
    article3Title: 'Artikel 3 - Zinssatz und Gesamtkreditkosten',
    article3Content: (rate, totalInterest, totalRepayment) =>
      `Der angewandte Zinssatz ist fest und beträgt ${rate}% pro Jahr. Die Gesamtkreditkosten einschließlich Zinsen werden auf <strong>${totalInterest} €</strong> geschätzt. Der gesamte zurückzuzahlende Betrag beläuft sich somit auf <strong>${totalRepayment} €</strong>.`,
    article4Title: 'Artikel 4 – Auszahlung der Mittel',
    article4Content: 'Die Darlehensmittel werden dem Darlehensnehmer auf dem SOLVENTUS GROUP-Partnerkonto zur Verfügung gestellt, das im Namen des Darlehensnehmers im SOLVENTUS-Netzwerk eröffnet wurde. Der Darlehensnehmer erkennt an und akzeptiert, dass die anfängliche Zahlung auf diesem Partnerkonto gutgeschrieben wird, dass es in seiner Verantwortung liegt, die Überweisung auf sein externes Bankkonto zu veranlassen, und dass die effektive Auszahlung der Mittel innerhalb von maximal 24 Werktagen nach Erhalt dieses ordnungsgemäß unterzeichneten Vertrags erfolgt.',
    article5Title: 'Artikel 5 - Vorzeitige Rückzahlung',
    article5Content: 'Der Darlehensnehmer hat die Möglichkeit, das verbleibende Kapital ganz oder teilweise vorzeitig und ohne Strafen zurückzuzahlen. Jeder Antrag auf vorzeitige Rückzahlung muss mindestens 30 Tage vor dem gewünschten Datum schriftlich gestellt werden.',
    article6Title: 'Artikel 6 - Zahlungsverzug',
    article6Content: 'Im Falle des Zahlungsverzugs einer monatlichen Rate werden Verzugszinsen von 5% pro Jahr auf die verbleibenden Beträge erhoben. Nach zwei aufeinanderfolgenden unbezahlten Raten behält sich der Darlehensgeber das Recht vor, die sofortige Rückzahlung des verbleibenden Kapitals zu verlangen.',
    article7Title: 'Artikel 7 – Darlehensversicherung',
    article7Content: 'Eine Darlehensversicherung bleibt fakultativ, aber eine Deckung, die mindestens die Risiken Tod und Invalidität umfasst, bietet erhebliche Vorteile für den Darlehensnehmer. SOLVENTUS GROUP empfiehlt deren Abschluss und überlässt jedem Darlehensnehmer die Freiheit seiner Entscheidung.',
    article8Title: 'Artikel 8 - Widerrufsrecht',
    article8Content: 'Gemäß den geltenden gesetzlichen Bestimmungen hat der Darlehensnehmer eine Widerrufsfrist von 14 Kalendertagen ab Unterzeichnung dieses Vertrags.',
    article9Title: 'Artikel 9 - Anwendbares Recht und zuständige Gerichte',
    article9Content: 'Dieser Vertrag unterliegt luxemburgischem Recht. Im Streitfall werden sich die Parteien bemühen, eine gütliche Lösung zu finden. Andernfalls sind ausschließlich die zuständigen Gerichte in Luxemburg zuständig.',
    signatureSection: 'Unterschriften',
    madeInDuplicates: 'In zwei Originalexemplaren erstellt',
    inLuxembourg: 'In Luxemburg, am',
    forSolventis: 'Für SOLVENTUS GROUP',
    lender: 'Der Darlehensgeber',
    borrower: 'Der Darlehensnehmer',
    preSigned: '✓ Vorab unterzeichnetes und validiertes Dokument',
    management: 'Geschäftsführung',
    solventisStamp: 'SOLVENTUS\nGROUP',
    luxembourg: 'Luxemburg',
    electronicSignature: 'Zertifizierte elektronische Signatur',
    date: 'Datum',
    signatureInstructions: 'Unterschriftsanweisungen:',
    instruction1: '1. Laden Sie dieses Dokument herunter',
    instruction2: '2. Drucken und unterschreiben Sie mit "Gelesen und genehmigt"',
    instruction3: '3. Scannen Sie das unterschriebene Dokument',
    instruction4: '4. Senden Sie es über Ihren Kundenbereich zurück',
    signatureLine: 'Unterschrift vorangestellt von',
    readAndApproved: '"Gelesen und genehmigt"',
    confidentialNotice: 'Dieses Dokument ist vertraulich und ausschließlich für seinen Empfänger bestimmt. Jede Vervielfältigung, Verbreitung oder unbefugte Nutzung ist strengstens untersagt.',
    shareCapital: 'Stammkapital',
    headquarters: 'Hauptsitz',
    tel: 'Tel',
    loanTypes: {
      'auto': 'Autokredit',
      'mortgage': 'Hypothekendarlehen',
      'green': 'Grünes Darlehen',
      'renovation': 'Renovierungsdarlehen',
      'student': 'Studentendarlehen',
      'business': 'Geschäftsdarlehen',
      'personal': 'Privatdarlehen',
      'cashFlow': 'Liquiditätsdarlehen',
      'equipment': 'Ausstattungsdarlehen',
      'vehicleFleet': 'Fuhrparkdarlehen',
      'lineOfCredit': 'Kreditlinie',
      'commercialProperty': 'Gewerbeimmobiliendarlehen',
    }
  },
  pt: {
    contractTitle: 'Contrato de Empréstimo Profissional',
    contractNumber: 'CONTRATO DE EMPRÉSTIMO N°',
    borrowerInfo: 'Informações do Mutuário',
    fullName: 'Nome Completo',
    email: 'E-mail',
    phone: 'Telefone',
    company: 'Empresa',
    siret: 'ID da Empresa',
    loanDetails: 'Detalhes do Empréstimo',
    loanType: 'Tipo de Empréstimo',
    amountBorrowed: 'Montante Emprestado',
    annualInterestRate: 'Taxa de Juros Anual',
    loanDuration: 'Duração do Empréstimo',
    contractDate: 'Data do Contrato',
    months: 'meses',
    loanConditions: 'Condições do Empréstimo',
    article1Title: 'Artigo 1 - Objeto do Contrato',
    article1Content: (userName, amount, rate, duration) =>
      `Este contrato tem como objeto a concessão pela SOLVENTUS GROUP (doravante "o Mutuante") a ${userName} (doravante "o Mutuário") de um empréstimo no valor de <strong>${amount} €</strong> à taxa de juros anual de <strong>${rate}%</strong> por uma duração de <strong>${duration} meses</strong>.`,
    article2Title: 'Artigo 2 - Modalidades de Reembolso',
    article2Content: (duration, rate, monthly) =>
      `O Mutuário compromete-se a reembolsar o empréstimo segundo um cronograma mensal ao longo de ${duration} meses. Cada mensalidade incluirá uma parte do capital emprestado, bem como os juros calculados à taxa anual de ${rate}%. O valor estimado da mensalidade é de <strong>${monthly} €</strong>.`,
    article3Title: 'Artigo 3 - Taxa de Juros e Custo Total do Crédito',
    article3Content: (rate, totalInterest, totalRepayment) =>
      `A taxa de juros aplicada é fixa e corresponde a ${rate}% ao ano. O custo total do crédito, incluindo juros, é estimado em <strong>${totalInterest} €</strong>. O montante total a reembolsar ascende portanto a <strong>${totalRepayment} €</strong>.`,
    article4Title: 'Artigo 4 – Desembolso dos Fundos',
    article4Content: 'Os fundos do empréstimo serão disponibilizados ao Mutuário na conta afiliada SOLVENTUS GROUP aberta em nome do Mutuário dentro da rede SOLVENTUS. O Mutuário reconhece e aceita que o pagamento inicial será creditado nesta conta afiliada, que é sua responsabilidade iniciar a transferência para sua conta bancária externa, e que o desembolso efetivo dos fundos ocorrerá dentro de um máximo de 24 horas úteis a partir do recebimento deste contrato devidamente assinado.',
    article5Title: 'Artigo 5 - Reembolso Antecipado',
    article5Content: 'O Mutuário tem a opção de proceder ao reembolso antecipado, total ou parcial, do capital remanescente sem penalidades. Qualquer pedido de reembolso antecipado deve ser formulado por escrito pelo menos 30 dias antes da data desejada.',
    article6Title: 'Artigo 6 - Inadimplência',
    article6Content: 'Em caso de inadimplência de uma mensalidade, serão aplicadas penalidades de atraso de 5% ao ano sobre os valores remanescentes devidos. Após duas mensalidades consecutivas não pagas, o Mutuante reserva-se o direito de exigir o reembolso imediato do capital remanescente.',
    article7Title: 'Artigo 7 – Seguro do Mutuário',
    article7Content: 'A subscrição de um seguro do mutuário permanece facultativa, mas uma cobertura incluindo pelo menos os riscos de morte e invalidez apresenta vantagens significativas para o mutuário. SOLVENTUS GROUP recomenda a sua adesão, deixando a cada mutuário a liberdade da sua decisão.',
    article8Title: 'Artigo 8 - Direito de Retratação',
    article8Content: 'Em conformidade com as disposições legais em vigor, o Mutuário dispõe de um prazo de retratação de 14 dias corridos a contar da assinatura deste contrato.',
    article9Title: 'Artigo 9 - Lei Aplicável e Jurisdição Competente',
    article9Content: 'Este contrato é regido pelo direito luxemburguês. Em caso de litígio, as partes esforçar-se-ão por encontrar uma solução amigável. Na sua falta, apenas os tribunais competentes do Luxemburgo terão jurisdição.',
    signatureSection: 'Assinaturas',
    madeInDuplicates: 'Feito em dois originais',
    inLuxembourg: 'No Luxemburgo, em',
    forSolventis: 'Por SOLVENTUS GROUP',
    lender: 'O Mutuante',
    borrower: 'O Mutuário',
    preSigned: '✓ Documento pré-assinado e validado',
    management: 'Direção Geral',
    solventisStamp: 'SOLVENTUS\nGROUP',
    luxembourg: 'Luxemburgo',
    electronicSignature: 'Assinatura eletrónica certificada',
    date: 'Data',
    signatureInstructions: 'Instruções de assinatura:',
    instruction1: '1. Descarregue este documento',
    instruction2: '2. Imprima e assine com "Lido e aprovado"',
    instruction3: '3. Digitalize o documento assinado',
    instruction4: '4. Envie-o através da sua área de cliente',
    signatureLine: 'Assinatura precedida de',
    readAndApproved: '"Lido e aprovado"',
    confidentialNotice: 'Este documento é confidencial e destinado exclusivamente ao seu destinatário. Qualquer reprodução, distribuição ou utilização não autorizada é estritamente proibida.',
    shareCapital: 'Capital Social',
    headquarters: 'Sede Social',
    tel: 'Tel',
    loanTypes: {
      'auto': 'Empréstimo Automóvel',
      'mortgage': 'Empréstimo Hipotecário',
      'green': 'Empréstimo Verde',
      'renovation': 'Empréstimo para Obras',
      'student': 'Empréstimo Estudantil',
      'business': 'Empréstimo Profissional',
      'personal': 'Empréstimo Pessoal',
      'cashFlow': 'Empréstimo de Tesouraria',
      'equipment': 'Empréstimo de Equipamento',
      'vehicleFleet': 'Empréstimo de Frota de Veículos',
      'lineOfCredit': 'Linha de Crédito',
      'commercialProperty': 'Empréstimo Imobiliário Comercial',
    }
  },
  es: {
    contractTitle: 'Contrato de Préstamo Profesional',
    contractNumber: 'CONTRATO DE PRÉSTAMO N°',
    borrowerInfo: 'Información del Prestatario',
    fullName: 'Nombre Completo',
    email: 'Correo Electrónico',
    phone: 'Teléfono',
    company: 'Empresa',
    siret: 'ID de la Empresa',
    loanDetails: 'Detalles del Préstamo',
    loanType: 'Tipo de Préstamo',
    amountBorrowed: 'Monto Prestado',
    annualInterestRate: 'Tasa de Interés Anual',
    loanDuration: 'Duración del Préstamo',
    contractDate: 'Fecha del Contrato',
    months: 'meses',
    loanConditions: 'Condiciones del Préstamo',
    article1Title: 'Artículo 1 - Objeto del Contrato',
    article1Content: (userName, amount, rate, duration) =>
      `Este contrato tiene por objeto el otorgamiento por SOLVENTUS GROUP (en adelante "el Prestamista") a ${userName} (en adelante "el Prestatario") de un préstamo por un monto de <strong>${amount} €</strong> a una tasa de interés anual de <strong>${rate}%</strong> por una duración de <strong>${duration} meses</strong>.`,
    article2Title: 'Artículo 2 - Modalidades de Reembolso',
    article2Content: (duration, rate, monthly) =>
      `El Prestatario se compromete a reembolsar el préstamo según un calendario mensual durante ${duration} meses. Cada mensualidad incluirá una parte del capital prestado así como los intereses calculados a la tasa anual de ${rate}%. El monto estimado de la mensualidad es de <strong>${monthly} €</strong>.`,
    article3Title: 'Artículo 3 - Tasa de Interés y Costo Total del Crédito',
    article3Content: (rate, totalInterest, totalRepayment) =>
      `La tasa de interés aplicada es fija y asciende a ${rate}% por año. El costo total del crédito, incluyendo intereses, se estima en <strong>${totalInterest} €</strong>. El monto total a reembolsar asciende por lo tanto a <strong>${totalRepayment} €</strong>.`,
    article4Title: 'Artículo 4 – Desembolso de los Fondos',
    article4Content: 'Los fondos del préstamo se pondrán a disposición del Prestatario en la cuenta afiliada SOLVENTUS GROUP abierta a nombre del Prestatario dentro de la red SOLVENTUS. El Prestatario reconoce y acepta que el pago inicial se acreditará en esta cuenta afiliada, que es su responsabilidad iniciar la transferencia a su cuenta bancaria externa, y que el desembolso efectivo de los fondos se realizará dentro de un máximo de 24 horas hábiles desde la recepción de este contrato debidamente firmado.',
    article5Title: 'Artículo 5 - Reembolso Anticipado',
    article5Content: 'El Prestatario tiene la opción de proceder al reembolso anticipado, total o parcial, del capital restante sin penalidades. Cualquier solicitud de reembolso anticipado debe formularse por escrito al menos 30 días antes de la fecha deseada.',
    article6Title: 'Artículo 6 - Incumplimiento de Pago',
    article6Content: 'En caso de incumplimiento de pago de una mensualidad, se aplicarán penalidades por demora del 5% anual sobre los montos restantes adeudados. Después de dos mensualidades consecutivas impagadas, el Prestamista se reserva el derecho de exigir el reembolso inmediato del capital restante.',
    article7Title: 'Artículo 7 – Seguro del Prestatario',
    article7Content: 'La suscripción de un seguro del prestatario sigue siendo opcional, pero una cobertura que incluya al menos los riesgos de muerte e invalidez presenta ventajas significativas para el prestatario. SOLVENTUS GROUP recomienda su adhesión, dejando a cada prestatario la libertad de su decisión.',
    article8Title: 'Artículo 8 - Derecho de Retractación',
    article8Content: 'De conformidad con las disposiciones legales vigentes, el Prestatario dispone de un plazo de retractación de 14 días calendario a partir de la firma de este contrato.',
    article9Title: 'Artículo 9 - Ley Aplicable y Jurisdicción Competente',
    article9Content: 'Este contrato se rige por la ley luxemburguesa. En caso de litigio, las partes se esforzarán por encontrar una solución amistosa. En su defecto, solo los tribunales competentes de Luxemburgo tendrán jurisdicción.',
    signatureSection: 'Firmas',
    madeInDuplicates: 'Hecho en dos originales',
    inLuxembourg: 'En Luxemburgo, el',
    forSolventis: 'Por SOLVENTUS GROUP',
    lender: 'El Prestamista',
    borrower: 'El Prestatario',
    preSigned: '✓ Documento pre-firmado y validado',
    management: 'Dirección General',
    solventisStamp: 'SOLVENTUS\nGROUP',
    luxembourg: 'Luxemburgo',
    electronicSignature: 'Firma electrónica certificada',
    date: 'Fecha',
    signatureInstructions: 'Instrucciones de firma:',
    instruction1: '1. Descargue este documento',
    instruction2: '2. Imprima y firme con "Leído y aprobado"',
    instruction3: '3. Escanee el documento firmado',
    instruction4: '4. Devuélvalo a través de su área de cliente',
    signatureLine: 'Firma precedida de',
    readAndApproved: '"Leído y aprobado"',
    confidentialNotice: 'Este documento es confidencial y está destinado exclusivamente a su destinatario. Cualquier reproducción, distribución o uso no autorizado está estrictamente prohibido.',
    shareCapital: 'Capital Social',
    headquarters: 'Sede Social',
    tel: 'Tel',
    loanTypes: {
      'auto': 'Préstamo Automóvil',
      'mortgage': 'Préstamo Hipotecario',
      'green': 'Préstamo Ecológico',
      'renovation': 'Préstamo para Obras',
      'student': 'Préstamo Estudiantil',
      'business': 'Préstamo Profesional',
      'personal': 'Préstamo Personal',
      'cashFlow': 'Préstamo de Tesorería',
      'equipment': 'Préstamo de Equipamiento',
      'vehicleFleet': 'Préstamo de Flota de Vehículos',
      'lineOfCredit': 'Línea de Crédito',
      'commercialProperty': 'Préstamo Inmobiliario Comercial',
    }
  },
  it: {
    contractTitle: 'Contratto di Prestito Professionale',
    contractNumber: 'CONTRATTO DI PRESTITO N°',
    borrowerInfo: 'Informazioni sul Mutuatario',
    fullName: 'Nome Completo',
    email: 'Email',
    phone: 'Telefono',
    company: 'Società',
    siret: 'P.IVA',
    loanDetails: 'Dettagli del Prestito',
    loanType: 'Tipo di Prestito',
    amountBorrowed: 'Importo Prestato',
    annualInterestRate: 'Tasso di Interesse Annuo',
    loanDuration: 'Durata del Prestito',
    contractDate: 'Data del Contratto',
    months: 'mesi',
    loanConditions: 'Condizioni del Prestito',
    article1Title: 'Articolo 1 - Oggetto del Contratto',
    article1Content: (userName, amount, rate, duration) =>
      `Il presente contratto ha per oggetto la concessione da parte di SOLVENTUS GROUP (di seguito "il Prestatore") a ${userName} (di seguito "il Mutuatario") di un prestito dell'importo di <strong>${amount} €</strong> al tasso di interesse annuo di <strong>${rate}%</strong> per una durata di <strong>${duration} mesi</strong>.`,
    article2Title: 'Articolo 2 - Modalità di Rimborso',
    article2Content: (duration, rate, monthly) =>
      `Il Mutuatario si impegna a rimborsare il prestito secondo un piano mensile di ${duration} mesi. Ogni rata mensile comprenderà una parte del capitale preso in prestito e gli interessi calcolati al tasso annuo del ${rate}%. L'importo stimato della rata mensile è di <strong>${monthly} €</strong>.`,
    article3Title: 'Articolo 3 - Tasso di Interesse e Costo Totale del Credito',
    article3Content: (rate, totalInterest, totalRepayment) =>
      `Il tasso di interesse applicato è fisso e ammonta al ${rate}% annuo. Il costo totale del credito, compresi gli interessi, è stimato in <strong>${totalInterest} €</strong>. L'importo totale da rimborsare ammonta quindi a <strong>${totalRepayment} €</strong>.`,
    article4Title: 'Articolo 4 – Erogazione dei Fondi',
    article4Content: 'I fondi del prestito saranno messi a disposizione del Mutuatario sul conto affiliato SOLVENTUS GROUP aperto a nome del Mutuatario all\'interno della rete SOLVENTUS. Il Mutuatario riconosce e accetta che il pagamento iniziale sarà accreditato su questo conto affiliato, che è sua responsabilità avviare il trasferimento verso il suo conto bancario esterno, e che l\'erogazione effettiva dei fondi avverrà entro un massimo di 24 ore lavorative dalla ricezione del presente contratto debitamente firmato.',
    article5Title: 'Articolo 5 - Rimborso Anticipato',
    article5Content: 'Il Mutuatario ha la possibilità di procedere al rimborso anticipato, totale o parziale, del capitale residuo senza penalità. Qualsiasi richiesta di rimborso anticipato deve essere formulata per iscritto almeno 30 giorni prima della data desiderata.',
    article6Title: 'Articolo 6 - Inadempienza di Pagamento',
    article6Content: 'In caso di inadempienza di pagamento di una rata mensile, saranno applicate penalità di mora del 5% annuo sugli importi residui dovuti. Dopo due rate mensili consecutive non pagate, il Prestatore si riserva il diritto di esigere il rimborso immediato del capitale residuo.',
    article7Title: 'Articolo 7 – Assicurazione del Mutuatario',
    article7Content: 'La sottoscrizione di un\'assicurazione del mutuatario rimane facoltativa, ma una copertura che includa almeno i rischi di morte e invalidità presenta vantaggi significativi per il mutuatario. SOLVENTUS GROUP ne raccomanda l\'adesione, lasciando a ciascun mutuatario la libertà della propria decisione.',
    article8Title: 'Articolo 8 - Diritto di Recesso',
    article8Content: 'In conformità con le disposizioni legali in vigore, il Mutuatario dispone di un periodo di recesso di 14 giorni di calendario dalla firma del presente contratto.',
    article9Title: 'Articolo 9 - Legge Applicabile e Giurisdizione Competente',
    article9Content: 'Il presente contratto è regolato dalla legge lussemburghese. In caso di controversia, le parti si sforzeranno di trovare una soluzione amichevole. In mancanza, solo i tribunali competenti del Lussemburgo avranno giurisdizione.',
    signatureSection: 'Firme',
    madeInDuplicates: 'Fatto in due originali',
    inLuxembourg: 'A Lussemburgo, il',
    forSolventis: 'Per SOLVENTUS GROUP',
    lender: 'Il Prestatore',
    borrower: 'Il Mutuatario',
    preSigned: '✓ Documento pre-firmato e convalidato',
    management: 'Direzione Generale',
    solventisStamp: 'SOLVENTUS\nGROUP',
    luxembourg: 'Lussemburgo',
    electronicSignature: 'Firma elettronica certificata',
    date: 'Data',
    signatureInstructions: 'Istruzioni per la firma:',
    instruction1: '1. Scarica questo documento',
    instruction2: '2. Stampa e firma con "Letto e approvato"',
    instruction3: '3. Scansiona il documento firmato',
    instruction4: '4. Rinvialo tramite la tua area clienti',
    signatureLine: 'Firma preceduta da',
    readAndApproved: '"Letto e approvato"',
    confidentialNotice: 'Questo documento è confidenziale e destinato esclusivamente al destinatario. Qualsiasi riproduzione, distribuzione o uso non autorizzato è severamente vietato.',
    shareCapital: 'Capitale Sociale',
    headquarters: 'Sede Sociale',
    tel: 'Tel',
    loanTypes: {
      'auto': 'Prestito Auto',
      'mortgage': 'Prestito Ipotecario',
      'green': 'Prestito Ecologico',
      'renovation': 'Prestito Ristrutturazione',
      'student': 'Prestito Studentesco',
      'business': 'Prestito Professionale',
      'personal': 'Prestito Personale',
      'cashFlow': 'Prestito di Tesoreria',
      'equipment': 'Prestito Attrezzatura',
      'vehicleFleet': 'Prestito Flotta Veicoli',
      'lineOfCredit': 'Linea di Credito',
      'commercialProperty': 'Prestito Immobiliare Commerciale',
    }
  },
  nl: {
    contractTitle: 'Professionele Leningsovereenkomst',
    contractNumber: 'LENINGSOVEREENKOMST NR',
    borrowerInfo: 'Informatie over de Lener',
    fullName: 'Volledige Naam',
    email: 'E-mail',
    phone: 'Telefoon',
    company: 'Bedrijf',
    siret: 'Bedrijfs-ID',
    loanDetails: 'Leningsdetails',
    loanType: 'Type Lening',
    amountBorrowed: 'Geleend Bedrag',
    annualInterestRate: 'Jaarlijks Rentepercentage',
    loanDuration: 'Looptijd van de Lening',
    contractDate: 'Contractdatum',
    months: 'maanden',
    loanConditions: 'Leningsvoorwaarden',
    article1Title: 'Artikel 1 - Doel van het Contract',
    article1Content: (userName, amount, rate, duration) =>
      `Dit contract heeft tot doel de toekenning door SOLVENTUS GROUP (hierna "de Kredietgever") aan ${userName} (hierna "de Lener") van een lening van <strong>${amount} €</strong> tegen een jaarlijks rentepercentage van <strong>${rate}%</strong> voor een looptijd van <strong>${duration} maanden</strong>.`,
    article2Title: 'Artikel 2 - Terugbetalingsvoorwaarden',
    article2Content: (duration, rate, monthly) =>
      `De Lener verbindt zich ertoe de lening terug te betalen volgens een maandelijks schema gedurende ${duration} maanden. Elke maandelijkse betaling omvat een deel van het geleende kapitaal en rente berekend tegen het jaarlijkse tarief van ${rate}%. Het geschatte maandelijkse bedrag bedraagt <strong>${monthly} €</strong>.`,
    article3Title: 'Artikel 3 - Rentepercentage en Totale Kosten van het Krediet',
    article3Content: (rate, totalInterest, totalRepayment) =>
      `Het toegepaste rentepercentage is vast en bedraagt ${rate}% per jaar. De totale kosten van het krediet, inclusief rente, worden geschat op <strong>${totalInterest} €</strong>. Het totaal terug te betalen bedrag bedraagt dus <strong>${totalRepayment} €</strong>.`,
    article4Title: 'Artikel 4 – Uitbetaling van de Fondsen',
    article4Content: 'De leningsfondsen worden ter beschikking gesteld van de Lener op de SOLVENTUS GROUP-gelieerde rekening geopend op naam van de Lener binnen het SOLVENTUS-netwerk. De Lener erkent en accepteert dat de initiële betaling wordt gecrediteerd op deze gelieerde rekening, dat het zijn verantwoordelijkheid is om de overboeking naar zijn externe bankrekening te starten, en dat de effectieve uitbetaling van de fondsen zal plaatsvinden binnen maximaal 24 werkuren na ontvangst van dit naar behoren ondertekende contract.',
    article5Title: 'Artikel 5 - Vervroegde Terugbetaling',
    article5Content: 'De Lener heeft de mogelijkheid om vervroegd, geheel of gedeeltelijk, het resterende kapitaal terug te betalen zonder boetes. Elk verzoek tot vervroegde terugbetaling moet minstens 30 dagen voor de gewenste datum schriftelijk worden ingediend.',
    article6Title: 'Artikel 6 - Wanbetaling',
    article6Content: 'In geval van wanbetaling van een maandelijkse betaling worden vertragingsboetes van 5% per jaar toegepast op de resterende verschuldigde bedragen. Na twee opeenvolgende onbetaalde termijnen behoudt de Kredietgever zich het recht voor om onmiddellijke terugbetaling van het resterende kapitaal te eisen.',
    article7Title: 'Artikel 7 – Verzekering van de Lener',
    article7Content: 'Het afsluiten van een lenerverzekering blijft optioneel, maar een dekking die ten minste de risico\'s van overlijden en invaliditeit omvat, biedt aanzienlijke voordelen voor de lener. SOLVENTUS GROUP beveelt het afsluiten ervan aan, terwijl elke lener de vrijheid van zijn beslissing behoudt.',
    article8Title: 'Artikel 8 - Herroepingsrecht',
    article8Content: 'In overeenstemming met de geldende wettelijke bepalingen heeft de Lener een herroepingsperiode van 14 kalenderdagen vanaf de ondertekening van dit contract.',
    article9Title: 'Artikel 9 - Toepasselijk Recht en Bevoegde Rechtbank',
    article9Content: 'Dit contract wordt beheerst door het Luxemburgse recht. In geval van geschil zullen de partijen streven naar een minnelijke oplossing. Bij gebrek daaraan zijn alleen de bevoegde rechtbanken van Luxemburg bevoegd.',
    signatureSection: 'Handtekeningen',
    madeInDuplicates: 'Opgesteld in twee originelen',
    inLuxembourg: 'In Luxemburg, op',
    forSolventis: 'Voor SOLVENTUS GROUP',
    lender: 'De Kredietgever',
    borrower: 'De Lener',
    preSigned: '✓ Vooraf ondertekend en gevalideerd document',
    management: 'Algemeen Bestuur',
    solventisStamp: 'SOLVENTUS\nGROUP',
    luxembourg: 'Luxemburg',
    electronicSignature: 'Gecertificeerde elektronische handtekening',
    date: 'Datum',
    signatureInstructions: 'Instructies voor handtekening:',
    instruction1: '1. Download dit document',
    instruction2: '2. Print en onderteken met "Gelezen en goedgekeurd"',
    instruction3: '3. Scan het ondertekende document',
    instruction4: '4. Stuur het terug via uw klantenzone',
    signatureLine: 'Handtekening voorafgegaan door',
    readAndApproved: '"Gelezen en goedgekeurd"',
    confidentialNotice: 'Dit document is vertrouwelijk en uitsluitend bestemd voor de ontvanger. Elke reproductie, verspreiding of ongeautoriseerd gebruik is ten strengste verboden.',
    shareCapital: 'Maatschappelijk Kapitaal',
    headquarters: 'Maatschappelijke Zetel',
    tel: 'Tel',
    loanTypes: {
      'auto': 'Autolening',
      'mortgage': 'Hypothecaire Lening',
      'green': 'Groene Lening',
      'renovation': 'Renovatielening',
      'student': 'Studentenlening',
      'business': 'Zakelijke Lening',
      'personal': 'Persoonlijke Lening',
      'cashFlow': 'Kasstroom Lening',
      'equipment': 'Uitrustinglening',
      'vehicleFleet': 'Wagenparkle ning',
      'lineOfCredit': 'Kredietlijn',
      'commercialProperty': 'Commercieel Vastgoed Lening',
    }
  }
};

const getContractTemplate = (data: ContractData): string => {
  const { user, loan, contractDate, language = 'fr' } = data;
  const lang = (language as ContractLanguage) in contractTranslations ? language as ContractLanguage : 'fr';
  const t = contractTranslations[lang];
  
  const getLocale = (l: ContractLanguage): string => {
    const localeMap: Record<ContractLanguage, string> = {
      fr: 'fr-FR',
      en: 'en-US',
      de: 'de-DE',
      pt: 'pt-PT',
      es: 'es-ES',
      it: 'it-IT',
      nl: 'nl-NL'
    };
    return localeMap[l];
  };
  
  const locale = getLocale(lang);
  const amount = parseFloat(loan.amount).toLocaleString(locale, { minimumFractionDigits: 2 });
  const rate = parseFloat(loan.interestRate).toFixed(2);
  const monthly = calculateMonthlyPayment(parseFloat(loan.amount), parseFloat(loan.interestRate), loan.duration).toLocaleString(locale, { minimumFractionDigits: 2 });
  const totalInterest = calculateTotalInterest(parseFloat(loan.amount), parseFloat(loan.interestRate), loan.duration).toLocaleString(locale, { minimumFractionDigits: 2 });
  const totalRepayment = calculateTotalRepayment(parseFloat(loan.amount), parseFloat(loan.interestRate), loan.duration).toLocaleString(locale, { minimumFractionDigits: 2 });
  const loanTypeName = t.loanTypes[loan.loanType] || loan.loanType;
  
  return `
<!DOCTYPE html>
<html lang="${lang}">
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
      background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
      color: #1a1a1a;
      padding: 25px 0 25px 0;
      margin: 0 0 35px 0;
      position: relative;
      border-bottom: 4px solid #2563eb;
      page-break-inside: avoid;
    }
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 25px;
      gap: 30px;
      padding: 0 25px;
    }
    .logo-section {
      flex: 0 0 auto;
      border-right: 2px solid #e5e7eb;
      padding-right: 30px;
    }
    .logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-icon {
      width: 55px;
      height: 55px;
      background: linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 3px 10px rgba(37, 99, 235, 0.2);
      flex-shrink: 0;
    }
    .logo-icon-text {
      font-size: 28pt;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: -1px;
      line-height: 1;
    }
    .logo-text-group {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .logo {
      font-size: 20pt;
      font-weight: 800;
      letter-spacing: 1px;
      line-height: 1;
      color: #1e3a8a;
      margin-bottom: 2px;
    }
    .logo-subtitle {
      font-size: 9pt;
      font-weight: 500;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #64748b;
    }
    .header-info {
      flex: 1;
      text-align: right;
      line-height: 1.6;
    }
    .company-name {
      font-size: 10pt;
      font-weight: 700;
      color: #1e3a8a;
      margin-bottom: 8px;
      letter-spacing: 0.3px;
    }
    .header-info .contact-line {
      display: block;
      font-size: 8pt;
      color: #475569;
      margin: 2px 0;
    }
    .contact-line strong {
      color: #1e3a8a;
      font-weight: 600;
    }
    .contract-ref {
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      padding: 12px 25px;
      border-radius: 8px;
      text-align: center;
      font-size: 10pt;
      font-weight: 700;
      letter-spacing: 0.8px;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.12);
      border: 2px solid #2563eb;
      color: #1e3a8a;
      margin: 0 auto;
      display: inline-block;
      max-width: 90%;
      word-break: break-word;
      padding: 25px;
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
        <div class="logo-container">
          <div class="logo-icon">
            <div class="logo-icon-text">S</div>
          </div>
          <div class="logo-text-group">
            <div class="logo">SOLVENTUS</div>
            <div class="logo-subtitle">GROUP</div>
          </div>
        </div>
      </div>
      <div class="header-info">
        <div class="company-name">SOLVENTUS GROUP S.à r.l.</div>
        <span class="contact-line"><strong>Siège:</strong> 19 Rue Sigismond, L-2537 Luxembourg</span>
        <span class="contact-line"><strong>RCS:</strong> Luxembourg B123456</span>
        <span class="contact-line"><strong>Tél:</strong> +352 40 63 48</span>
        <span class="contact-line"><strong>Email:</strong> contact@solventisgroup.org</span>
        <span class="contact-line"><strong>Web:</strong> www.solventisgroup.org</span>
      </div>
    </div>
    <div style="text-align: center;">
      <div class="contract-ref">${t.contractNumber} ${loan.id.toUpperCase()}</div>
    </div>
  </div>

  <h1>${t.contractTitle}</h1>

  <div class="info-box">
    <h2 style="margin-top: 0;">${t.borrowerInfo}</h2>
    <div class="info-row">
      <span class="label">${t.fullName}:</span>
      <span class="value">${user.fullName}</span>
    </div>
    <div class="info-row">
      <span class="label">${t.email}:</span>
      <span class="value">${user.email}</span>
    </div>
    ${user.phone ? `
    <div class="info-row">
      <span class="label">${t.phone}:</span>
      <span class="value">${user.phone}</span>
    </div>
    ` : ''}
    ${user.companyName ? `
    <div class="info-row">
      <span class="label">${t.company}:</span>
      <span class="value">${user.companyName}</span>
    </div>
    ` : ''}
    ${user.siret ? `
    <div class="info-row">
      <span class="label">${t.siret}:</span>
      <span class="value">${user.siret}</span>
    </div>
    ` : ''}
  </div>

  <div class="info-box">
    <h2 style="margin-top: 0;">${t.loanDetails}</h2>
    <div class="info-row">
      <span class="label">${t.loanType}:</span>
      <span class="value">${loanTypeName}</span>
    </div>
    <div class="info-row">
      <span class="label">${t.amountBorrowed}:</span>
      <span class="value highlight">${amount} €</span>
    </div>
    <div class="info-row">
      <span class="label">${t.annualInterestRate}:</span>
      <span class="value highlight">${rate} %</span>
    </div>
    <div class="info-row">
      <span class="label">${t.loanDuration}:</span>
      <span class="value">${loan.duration} ${t.months}</span>
    </div>
    <div class="info-row">
      <span class="label">${t.contractDate}:</span>
      <span class="value">${contractDate}</span>
    </div>
  </div>

  <h2>${t.loanConditions}</h2>

  <div class="article">
    <div class="article-title">${t.article1Title}</div>
    <p>${t.article1Content(user.fullName, amount, rate, loan.duration)}</p>
  </div>

  <div class="article">
    <div class="article-title">${t.article2Title}</div>
    <p>${t.article2Content(loan.duration, rate, monthly)}</p>
  </div>

  <div class="article">
    <div class="article-title">${t.article3Title}</div>
    <p>${t.article3Content(rate, totalInterest, totalRepayment)}</p>
  </div>

  <div class="article">
    <div class="article-title">${t.article4Title}</div>
    <p>${t.article4Content}</p>
  </div>

  <div class="article">
    <div class="article-title">${t.article5Title}</div>
    <p>${t.article5Content}</p>
  </div>

  <div class="article">
    <div class="article-title">${t.article6Title}</div>
    <p>${t.article6Content}</p>
  </div>

  <div class="article">
    <div class="article-title">${t.article7Title}</div>
    <p>${t.article7Content}</p>
  </div>

  <div class="article">
    <div class="article-title">${t.article8Title}</div>
    <p>${t.article8Content}</p>
  </div>

  <div class="article">
    <div class="article-title">${t.article9Title}</div>
    <p>${t.article9Content}</p>
  </div>

  <div class="signature-section">
    <p style="margin-bottom: 30px; text-align: center;">
      <strong style="font-size: 11pt;">${t.madeInDuplicates}</strong><br>
      <span style="color: #64748b;">${t.inLuxembourg} ${contractDate}</span>
    </p>

    <div class="signature-box">
      <div class="signature-item">
        <div class="signature-header">${t.forSolventis}</div>
        <div class="signature-role">${t.lender}</div>
        <div class="pre-signed">
          <p style="font-style: italic; font-size: 10pt; color: #2563eb; margin-bottom: 10px;">
            ${t.preSigned}
          </p>
          <div style="font-family: 'Brush Script MT', cursive; font-size: 18pt; color: #1e3a8a; margin: 15px 0;">
            ${t.management}
          </div>
          <svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="55" fill="none" stroke="#2563eb" stroke-width="3" stroke-dasharray="5,5"/>
            <circle cx="60" cy="60" r="50" fill="#f8fafc" opacity="0.7"/>
            <text x="60" y="52" text-anchor="middle" font-size="11" font-weight="bold" fill="#1e3a8a">SOLVENTUS</text>
            <text x="60" y="68" text-anchor="middle" font-size="11" font-weight="bold" fill="#1e3a8a">GROUP</text>
            <text x="60" y="88" text-anchor="middle" font-size="9" fill="#64748b">${t.luxembourg}</text>
          </svg>
          <p style="font-size: 8pt; color: #94a3b8; margin-top: 10px;">
            ${t.electronicSignature}<br>
            ${t.date}: ${contractDate}
          </p>
        </div>
      </div>

      <div class="signature-item">
        <div class="signature-header">${t.borrower}</div>
        <div class="signature-role">${user.fullName}</div>
        <div class="important-notice" style="font-size: 10pt; margin-bottom: 15px;">
          <strong>${t.signatureInstructions}</strong><br>
          ${t.instruction1}<br>
          ${t.instruction2}<br>
          ${t.instruction3}<br>
          ${t.instruction4}
        </div>
        <div class="signature-line">
          ${t.signatureLine}<br>${t.readAndApproved}
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
    <p class="footer-bold">SOLVENTUS GROUP - S.à r.l.</p>
    <p style="margin: 8px 0;">
      ${t.shareCapital}: 1 000 000 € • RCS Luxembourg B123456<br>
      ${t.headquarters}: 19 Rue Sigismond, L-2537 Luxembourg<br>
      ${t.tel}: +352 40 63 48 • Email: infos@solventisgroup.org<br>
      www.solventisgroup.org
    </p>
    <p style="margin-top: 15px; font-size: 8pt; font-style: italic;">
      ${t.confidentialNotice}
    </p>
  </div>
</body>
</html>
  `;
};

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

export async function generateContractPDF(user: User, loan: Loan, language: string = 'fr'): Promise<string> {
  console.log('=== DÉBUT GÉNÉRATION CONTRAT PDF ===');
  console.log(`Loan ID: ${loan.id}, User: ${user.fullName}, Amount: ${loan.amount}, Language: ${language}`);
  
  const locale = language === 'en' ? 'en-US' : language === 'de' ? 'de-DE' : language === 'pt' ? 'pt-PT' : language === 'es' ? 'es-ES' : 'fr-FR';
  const contractDate = new Date().toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  console.log('✓ Template HTML généré');

  const htmlContent = getContractTemplate({ user, loan, contractDate, language });

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
    // Déterminer l'environnement
    const isReplit = process.env.REPL_ID !== undefined;
    const isProduction = process.env.NODE_ENV === 'production' && !isReplit;
    
    let executablePath: string;
    
    if (isReplit) {
      // Sur Replit (environnement Nix), utiliser le Chromium système
      const nixChromiumPath = '/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium';
      if (fs.existsSync(nixChromiumPath)) {
        executablePath = nixChromiumPath;
        console.log(`✓ [Replit] Chromium Nix: ${executablePath}`);
      } else {
        throw new Error('Chromium Nix non trouvé sur Replit');
      }
    } else {
      // En production ou développement local, utiliser @sparticuz/chromium
      executablePath = await chromium.executablePath();
      console.log(`✓ [${isProduction ? 'Production' : 'Dev'}] @sparticuz/chromium: ${executablePath}`);
    }
    
    const launchOptions: any = {
      executablePath,
      headless: true,
      args: isReplit 
        ? [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-software-rasterizer',
            '--disable-dev-tools'
          ]
        : [
            ...chromium.args,
            '--hide-scrollbars',
            '--disable-web-security',
          ],
      defaultViewport: { width: 1920, height: 1080 },
      ignoreHTTPSErrors: true,
    };
    
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
