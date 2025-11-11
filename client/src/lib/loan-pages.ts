import { Language } from './i18n';

export type LoanSlug = 'personal-credit' | 'loan-refinancing' | 'lease-refinancing' | 'credit-card-refinancing';

export interface LoanContent {
  slug: LoanSlug;
  hero: {
    title: string;
    subtitle: string;
    cta: string;
    features: string[];
  };
  benefits: {
    title: string;
    items: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  };
  process: {
    title: string;
    steps: Array<{
      number: number;
      title: string;
      description: string;
    }>;
  };
  faq: {
    title: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  };
  cta: {
    title: string;
    description: string;
    button: string;
  };
}

export const loanPages: Record<Language, Record<LoanSlug, LoanContent>> = {
  fr: {
    'personal-credit': {
      slug: 'personal-credit',
      hero: {
        title: 'Crédit Personnel',
        subtitle: 'Financez vos projets personnels avec des taux avantageux et une réponse rapide',
        cta: 'Demander un crédit',
        features: [
          'Taux à partir de 4.9%',
          'Remboursement flexible',
          'Réponse rapide',
          'Fonds immédiatement disponibles'
        ]
      },
      benefits: {
        title: 'Pourquoi choisir notre crédit personnel ?',
        items: [
          {
            icon: 'Percent',
            title: 'Taux compétitifs',
            description: 'Profitez de taux d\'intérêt parmi les plus bas du marché suisse'
          },
          {
            icon: 'Clock',
            title: 'Réponse ultra-rapide',
            description: 'Obtenez une réponse en quelques minutes à 24 heures maximum'
          },
          {
            icon: 'Shield',
            title: 'Sécurité garantie',
            description: 'Vos données sont protégées selon les normes suisses les plus strictes'
          },
          {
            icon: 'Calendar',
            title: 'Remboursement flexible',
            description: 'Choisissez la durée qui correspond le mieux à votre situation'
          }
        ]
      },
      process: {
        title: 'Un processus 100% digital ultra-rapide',
        steps: [
          {
            number: 1,
            title: 'Demande en ligne',
            description: 'Remplissez notre formulaire en ligne en quelques minutes'
          },
          {
            number: 2,
            title: 'Réponse rapide',
            description: 'Nous analysons votre dossier et vous répondons en quelques minutes à 24h'
          },
          {
            number: 3,
            title: 'Signature électronique',
            description: 'Si votre demande est acceptée, signez votre contrat en ligne de manière sécurisée'
          },
          {
            number: 4,
            title: 'Fonds immédiatement disponibles',
            description: 'Dès la signature du contrat, l\'argent est versé immédiatement sur votre compte'
          }
        ]
      },
      faq: {
        title: 'Questions fréquentes',
        items: [
          {
            question: 'Quels sont les critères d\'éligibilité ?',
            answer: 'Pour être éligible, vous devez être majeur, résider en Suisse, avoir un revenu régulier et ne pas être en poursuite.'
          },
          {
            question: 'Combien puis-je emprunter ?',
            answer: 'Le montant que vous pouvez emprunter dépend de votre capacité de remboursement et sera déterminé après analyse de votre dossier.'
          },
          {
            question: 'Quelle est la durée de remboursement ?',
            answer: 'La durée de remboursement varie de 12 à 120 mois selon le montant emprunté.'
          },
          {
            question: 'Y a-t-il des frais de dossier ?',
            answer: 'Nos frais de dossier sont transparents et compétitifs. Ils vous seront communiqués dans votre offre personnalisée.'
          }
        ]
      },
      cta: {
        title: 'Prêt à concrétiser votre projet ?',
        description: 'Faites votre demande en ligne, recevez une réponse rapide, et si acceptée, vos fonds sont immédiatement disponibles après signature',
        button: 'Demander mon crédit'
      }
    },
    'loan-refinancing': {
      slug: 'loan-refinancing',
      hero: {
        title: 'Rachat de Crédit',
        subtitle: 'Regroupez vos crédits et réduisez vos mensualités jusqu\'à 40%',
        cta: 'Simuler mon rachat',
        features: [
          'Réduction des mensualités',
          'Taux unique avantageux',
          'Un seul interlocuteur',
          'Solution sur mesure'
        ]
      },
      benefits: {
        title: 'Les avantages du rachat de crédit',
        items: [
          {
            icon: 'TrendingDown',
            title: 'Réduisez vos mensualités',
            description: 'Diminuez vos charges mensuelles jusqu\'à 40% en regroupant vos crédits'
          },
          {
            icon: 'FileCheck',
            title: 'Simplifiez votre gestion',
            description: 'Un seul crédit, une seule mensualité, un seul interlocuteur'
          },
          {
            icon: 'Calculator',
            title: 'Optimisez votre budget',
            description: 'Retrouvez de la trésorerie pour vos projets'
          },
          {
            icon: 'Target',
            title: 'Solution personnalisée',
            description: 'Une offre adaptée à votre situation financière'
          }
        ]
      },
      process: {
        title: 'Le processus de rachat',
        steps: [
          {
            number: 1,
            title: 'Analysez votre situation',
            description: 'Listez tous vos crédits en cours et calculez vos mensualités totales'
          },
          {
            number: 2,
            title: 'Recevez une simulation',
            description: 'Nous étudions votre dossier et vous proposons la meilleure solution'
          },
          {
            number: 3,
            title: 'Validez votre offre',
            description: 'Acceptez les nouvelles conditions de votre crédit regroupé'
          },
          {
            number: 4,
            title: 'Remboursement automatique',
            description: 'Nous remboursons vos anciens crédits et vous ne payez qu\'une seule mensualité'
          }
        ]
      },
      faq: {
        title: 'Questions fréquentes',
        items: [
          {
            question: 'Quels crédits puis-je regrouper ?',
            answer: 'Vous pouvez regrouper tous types de crédits : prêts personnels, crédits auto, cartes de crédit, découverts bancaires, etc.'
          },
          {
            question: 'Est-ce que je peux emprunter plus ?',
            answer: 'Oui, vous pouvez ajouter une trésorerie supplémentaire à votre rachat de crédit.'
          },
          {
            question: 'Combien de temps dure l\'opération ?',
            answer: 'Le processus complet prend généralement entre 2 et 4 semaines.'
          },
          {
            question: 'Y a-t-il des pénalités de remboursement anticipé ?',
            answer: 'Cela dépend de vos contrats actuels. Nous analysons cet aspect dans notre étude.'
          }
        ]
      },
      cta: {
        title: 'Simplifiez vos remboursements',
        description: 'Découvrez combien vous pourriez économiser chaque mois',
        button: 'Faire une simulation'
      }
    },
    'lease-refinancing': {
      slug: 'lease-refinancing',
      hero: {
        title: 'Rachat de Leasing',
        subtitle: 'Devenez propriétaire de votre véhicule et économisez sur vos mensualités',
        cta: 'Racheter mon leasing',
        features: [
          'Devenez propriétaire',
          'Mensualités réduites',
          'Taux avantageux',
          'Processus simplifié'
        ]
      },
      benefits: {
        title: 'Pourquoi racheter votre leasing ?',
        items: [
          {
            icon: 'Car',
            title: 'Propriété immédiate',
            description: 'Devenez propriétaire de votre véhicule et profitez-en pleinement'
          },
          {
            icon: 'Banknote',
            title: 'Économies substantielles',
            description: 'Réduisez vos mensualités et le coût total de votre financement'
          },
          {
            icon: 'Key',
            title: 'Plus de flexibilité',
            description: 'Plus de restrictions kilométriques ou de contraintes d\'utilisation'
          },
          {
            icon: 'Award',
            title: 'Valeur préservée',
            description: 'Conservez la valeur de revente de votre véhicule'
          }
        ]
      },
      process: {
        title: 'Les étapes du rachat',
        steps: [
          {
            number: 1,
            title: 'Estimation du leasing',
            description: 'Nous évaluons le montant restant dû sur votre contrat de leasing'
          },
          {
            number: 2,
            title: 'Proposition de crédit',
            description: 'Nous vous proposons un crédit pour racheter votre leasing'
          },
          {
            number: 3,
            title: 'Validation',
            description: 'Vous acceptez les conditions et signez votre nouveau contrat'
          },
          {
            number: 4,
            title: 'Transfert de propriété',
            description: 'Nous rachetons le leasing et vous devenez propriétaire du véhicule'
          }
        ]
      },
      faq: {
        title: 'Questions fréquentes',
        items: [
          {
            question: 'Quand puis-je racheter mon leasing ?',
            answer: 'Vous pouvez racheter votre leasing à tout moment, même avant la fin du contrat.'
          },
          {
            question: 'Le rachat affecte-t-il ma cote de crédit ?',
            answer: 'Non, au contraire, cela peut améliorer votre profil de crédit car vous devenez propriétaire.'
          },
          {
            question: 'Puis-je racheter un leasing professionnel ?',
            answer: 'Oui, nous proposons des solutions pour les leasings professionnels et privés.'
          },
          {
            question: 'Que se passe-t-il avec l\'assurance ?',
            answer: 'Vous devrez adapter votre assurance pour correspondre à votre nouveau statut de propriétaire.'
          }
        ]
      },
      cta: {
        title: 'Devenez propriétaire de votre véhicule',
        description: 'Calculez le montant nécessaire pour racheter votre leasing',
        button: 'Faire une estimation'
      }
    },
    'credit-card-refinancing': {
      slug: 'credit-card-refinancing',
      hero: {
        title: 'Rachat Carte de Crédit',
        subtitle: 'Réduisez drastiquement vos taux d\'intérêt et remboursez plus rapidement',
        cta: 'Regrouper mes dettes',
        features: [
          'Taux réduits jusqu\'à 70%',
          'Remboursement accéléré',
          'Une seule mensualité',
          'Fin des frais cachés'
        ]
      },
      benefits: {
        title: 'Les avantages du rachat de carte de crédit',
        items: [
          {
            icon: 'Percent',
            title: 'Taux ultra-compétitifs',
            description: 'Passez de taux de 12-15% à des taux à partir de 4.9%'
          },
          {
            icon: 'LineChart',
            title: 'Remboursement rapide',
            description: 'Sortez de l\'endettement grâce à un plan de remboursement structuré'
          },
          {
            icon: 'CheckCircle',
            title: 'Simplification',
            description: 'Regroupez toutes vos cartes de crédit en un seul crédit'
          },
          {
            icon: 'ShieldCheck',
            title: 'Transparence totale',
            description: 'Aucun frais caché, vous savez exactement ce que vous payez'
          }
        ]
      },
      process: {
        title: 'Comment procéder ?',
        steps: [
          {
            number: 1,
            title: 'Évaluez vos dettes',
            description: 'Listez toutes vos cartes de crédit et leurs soldes actuels'
          },
          {
            number: 2,
            title: 'Recevez une offre',
            description: 'Nous calculons le montant total et vous proposons un taux avantageux'
          },
          {
            number: 3,
            title: 'Consolidez vos dettes',
            description: 'Nous remboursons toutes vos cartes de crédit'
          },
          {
            number: 4,
            title: 'Payez une seule mensualité',
            description: 'Remboursez votre nouveau crédit avec des intérêts réduits'
          }
        ]
      },
      faq: {
        title: 'Questions fréquentes',
        items: [
          {
            question: 'Combien puis-je économiser ?',
            answer: 'En moyenne, nos clients économisent entre 60% et 70% sur leurs intérêts en passant d\'un taux de carte de crédit à notre taux de crédit personnel.'
          },
          {
            question: 'Que se passe-t-il avec mes cartes ?',
            answer: 'Après le rachat, vos cartes sont soldées. Vous pouvez choisir de les fermer ou de les conserver sans solde.'
          },
          {
            question: 'Puis-je inclure plusieurs cartes ?',
            answer: 'Oui, vous pouvez regrouper autant de cartes de crédit que nécessaire.'
          },
          {
            question: 'Y a-t-il un montant minimum ?',
            answer: 'Le montant minimum est généralement de 5\'000 CHF pour un rachat de cartes de crédit.'
          }
        ]
      },
      cta: {
        title: 'Libérez-vous des taux élevés',
        description: 'Calculez vos économies potentielles en regroupant vos cartes de crédit',
        button: 'Calculer mes économies'
      }
    }
  },
  en: {
    'personal-credit': {
      slug: 'personal-credit',
      hero: {
        title: 'Personal Credit',
        subtitle: 'Finance your personal projects with competitive rates and a quick response',
        cta: 'Apply for credit',
        features: [
          'Rates from 4.9%',
          'Flexible repayment',
          'Quick response',
          'Funds immediately available'
        ]
      },
      benefits: {
        title: 'Why choose our personal credit?',
        items: [
          {
            icon: 'Percent',
            title: 'Competitive rates',
            description: 'Benefit from some of the lowest interest rates in the Swiss market'
          },
          {
            icon: 'Clock',
            title: 'Ultra-fast response',
            description: 'Get a response in minutes to 24 hours maximum'
          },
          {
            icon: 'Shield',
            title: 'Guaranteed security',
            description: 'Your data is protected according to the strictest Swiss standards'
          },
          {
            icon: 'Calendar',
            title: 'Flexible repayment',
            description: 'Choose the duration that best suits your situation'
          }
        ]
      },
      process: {
        title: '100% digital ultra-fast process',
        steps: [
          {
            number: 1,
            title: 'Online application',
            description: 'Fill out our online form in just a few minutes'
          },
          {
            number: 2,
            title: 'Quick response',
            description: 'We analyze your file and respond in minutes to 24h'
          },
          {
            number: 3,
            title: 'Electronic signature',
            description: 'If your application is accepted, sign your contract online securely'
          },
          {
            number: 4,
            title: 'Funds immediately available',
            description: 'Once the contract is signed, the money is immediately transferred to your account'
          }
        ]
      },
      faq: {
        title: 'Frequently asked questions',
        items: [
          {
            question: 'What are the eligibility criteria?',
            answer: 'To be eligible, you must be of legal age, reside in Switzerland, have a regular income, and not be under debt collection.'
          },
          {
            question: 'How much can I borrow?',
            answer: 'The amount you can borrow depends on your repayment capacity and will be determined after analyzing your file.'
          },
          {
            question: 'What is the repayment period?',
            answer: 'The repayment period ranges from 12 to 120 months depending on the amount borrowed.'
          },
          {
            question: 'Are there any processing fees?',
            answer: 'Our processing fees are transparent and competitive. They will be communicated to you in your personalized offer.'
          }
        ]
      },
      cta: {
        title: 'Ready to realize your project?',
        description: 'Submit your application online, receive a quick response, and if accepted, your funds are immediately available after signing',
        button: 'Apply for credit'
      }
    },
    'loan-refinancing': {
      slug: 'loan-refinancing',
      hero: {
        title: 'Loan Refinancing',
        subtitle: 'Consolidate your loans and reduce your monthly payments by up to 40%',
        cta: 'Simulate my refinancing',
        features: [
          'Reduced monthly payments',
          'Single advantageous rate',
          'One contact person',
          'Tailor-made solution'
        ]
      },
      benefits: {
        title: 'The benefits of loan refinancing',
        items: [
          {
            icon: 'TrendingDown',
            title: 'Reduce your payments',
            description: 'Decrease your monthly charges by up to 40% by consolidating your loans'
          },
          {
            icon: 'FileCheck',
            title: 'Simplify your management',
            description: 'One loan, one payment, one contact person'
          },
          {
            icon: 'Calculator',
            title: 'Optimize your budget',
            description: 'Regain cash flow for your projects'
          },
          {
            icon: 'Target',
            title: 'Personalized solution',
            description: 'An offer tailored to your financial situation'
          }
        ]
      },
      process: {
        title: 'The refinancing process',
        steps: [
          {
            number: 1,
            title: 'Analyze your situation',
            description: 'List all your current loans and calculate your total monthly payments'
          },
          {
            number: 2,
            title: 'Receive a simulation',
            description: 'We study your file and propose the best solution'
          },
          {
            number: 3,
            title: 'Validate your offer',
            description: 'Accept the new conditions of your consolidated loan'
          },
          {
            number: 4,
            title: 'Automatic repayment',
            description: 'We repay your old loans and you only pay one monthly payment'
          }
        ]
      },
      faq: {
        title: 'Frequently asked questions',
        items: [
          {
            question: 'Which loans can I consolidate?',
            answer: 'You can consolidate all types of loans: personal loans, car loans, credit cards, bank overdrafts, etc.'
          },
          {
            question: 'Can I borrow more?',
            answer: 'Yes, you can add additional cash to your loan refinancing.'
          },
          {
            question: 'How long does the operation take?',
            answer: 'The complete process typically takes between 2 and 4 weeks.'
          },
          {
            question: 'Are there early repayment penalties?',
            answer: 'It depends on your current contracts. We analyze this aspect in our study.'
          }
        ]
      },
      cta: {
        title: 'Simplify your repayments',
        description: 'Discover how much you could save each month',
        button: 'Get a simulation'
      }
    },
    'lease-refinancing': {
      slug: 'lease-refinancing',
      hero: {
        title: 'Lease Refinancing',
        subtitle: 'Become the owner of your vehicle and save on your monthly payments',
        cta: 'Refinance my lease',
        features: [
          'Become the owner',
          'Reduced payments',
          'Competitive rates',
          'Simplified process'
        ]
      },
      benefits: {
        title: 'Why refinance your lease?',
        items: [
          {
            icon: 'Car',
            title: 'Immediate ownership',
            description: 'Become the owner of your vehicle and enjoy it fully'
          },
          {
            icon: 'Banknote',
            title: 'Substantial savings',
            description: 'Reduce your monthly payments and the total cost of your financing'
          },
          {
            icon: 'Key',
            title: 'More flexibility',
            description: 'No more mileage restrictions or usage constraints'
          },
          {
            icon: 'Award',
            title: 'Preserved value',
            description: 'Keep the resale value of your vehicle'
          }
        ]
      },
      process: {
        title: 'The refinancing steps',
        steps: [
          {
            number: 1,
            title: 'Lease evaluation',
            description: 'We assess the remaining amount due on your lease contract'
          },
          {
            number: 2,
            title: 'Credit proposal',
            description: 'We offer you a loan to refinance your lease'
          },
          {
            number: 3,
            title: 'Validation',
            description: 'You accept the terms and sign your new contract'
          },
          {
            number: 4,
            title: 'Ownership transfer',
            description: 'We refinance the lease and you become the vehicle owner'
          }
        ]
      },
      faq: {
        title: 'Frequently asked questions',
        items: [
          {
            question: 'When can I refinance my lease?',
            answer: 'You can refinance your lease at any time, even before the contract ends.'
          },
          {
            question: 'Does refinancing affect my credit score?',
            answer: 'No, on the contrary, it can improve your credit profile as you become an owner.'
          },
          {
            question: 'Can I refinance a business lease?',
            answer: 'Yes, we offer solutions for both business and private leases.'
          },
          {
            question: 'What happens with insurance?',
            answer: 'You will need to adapt your insurance to match your new owner status.'
          }
        ]
      },
      cta: {
        title: 'Become the owner of your vehicle',
        description: 'Calculate the amount needed to refinance your lease',
        button: 'Get an estimate'
      }
    },
    'credit-card-refinancing': {
      slug: 'credit-card-refinancing',
      hero: {
        title: 'Credit Card Refinancing',
        subtitle: 'Drastically reduce your interest rates and repay faster',
        cta: 'Consolidate my debts',
        features: [
          'Rates reduced up to 70%',
          'Accelerated repayment',
          'Single monthly payment',
          'No hidden fees'
        ]
      },
      benefits: {
        title: 'The benefits of credit card refinancing',
        items: [
          {
            icon: 'Percent',
            title: 'Ultra-competitive rates',
            description: 'Go from rates of 12-15% to rates starting at 4.9%'
          },
          {
            icon: 'LineChart',
            title: 'Fast repayment',
            description: 'Get out of debt thanks to a structured repayment plan'
          },
          {
            icon: 'CheckCircle',
            title: 'Simplification',
            description: 'Consolidate all your credit cards into one single loan'
          },
          {
            icon: 'ShieldCheck',
            title: 'Total transparency',
            description: 'No hidden fees, you know exactly what you\'re paying'
          }
        ]
      },
      process: {
        title: 'How to proceed?',
        steps: [
          {
            number: 1,
            title: 'Evaluate your debts',
            description: 'List all your credit cards and their current balances'
          },
          {
            number: 2,
            title: 'Receive an offer',
            description: 'We calculate the total amount and offer you a competitive rate'
          },
          {
            number: 3,
            title: 'Consolidate your debts',
            description: 'We pay off all your credit cards'
          },
          {
            number: 4,
            title: 'Pay a single payment',
            description: 'Repay your new loan with reduced interest'
          }
        ]
      },
      faq: {
        title: 'Frequently asked questions',
        items: [
          {
            question: 'How much can I save?',
            answer: 'On average, our clients save between 60% and 70% on their interest by switching from a credit card rate to our personal loan rate.'
          },
          {
            question: 'What happens with my cards?',
            answer: 'After refinancing, your cards are paid off. You can choose to close them or keep them with zero balance.'
          },
          {
            question: 'Can I include multiple cards?',
            answer: 'Yes, you can consolidate as many credit cards as needed.'
          },
          {
            question: 'Is there a minimum amount?',
            answer: 'The minimum amount is generally CHF 5,000 for credit card refinancing.'
          }
        ]
      },
      cta: {
        title: 'Free yourself from high rates',
        description: 'Calculate your potential savings by consolidating your credit cards',
        button: 'Calculate my savings'
      }
    }
  },
  es: {
    'personal-credit': {
      slug: 'personal-credit',
      hero: {
        title: 'Crédito Personal',
        subtitle: 'Financie sus proyectos personales con tasas competitivas y respuesta rápida en 24h',
        cta: 'Solicitar crédito',
        features: [
          'Tasas desde 4.9%',
          'Fondos inmediatamente disponibles',
          'Reembolso flexible',
          'Respuesta en 24h'
        ]
      },
      benefits: {
        title: '¿Por qué elegir nuestro crédito personal?',
        items: [
          {
            icon: 'Percent',
            title: 'Tasas competitivas',
            description: 'Benefíciese de las tasas de interés más bajas del mercado suizo'
          },
          {
            icon: 'Clock',
            title: 'Respuesta rápida',
            description: 'Obtenga una decisión en principio en menos de 24 horas'
          },
          {
            icon: 'Shield',
            title: 'Seguridad garantizada',
            description: 'Sus datos están protegidos según las normas suizas más estrictas'
          },
          {
            icon: 'Calendar',
            title: 'Reembolso flexible',
            description: 'Elija la duración que mejor se adapte a su situación'
          }
        ]
      },
      process: {
        title: '¿Cómo funciona?',
        steps: [
          {
            number: 1,
            title: 'Haga su solicitud',
            description: 'Complete nuestro formulario en línea en pocos minutos'
          },
          {
            number: 2,
            title: 'Reciba una oferta',
            description: 'Analizamos su expediente y le proponemos las mejores condiciones'
          },
          {
            number: 3,
            title: 'Firme su contrato',
            description: 'Valide su oferta en línea de manera segura'
          },
          {
            number: 4,
            title: 'Reciba sus fondos',
            description: 'El dinero se transfiere a su cuenta lo antes posible'
          }
        ]
      },
      faq: {
        title: 'Preguntas frecuentes',
        items: [
          {
            question: '¿Cuáles son los criterios de elegibilidad?',
            answer: 'Para ser elegible, debe ser mayor de edad, residir en Suiza, tener ingresos regulares y no estar en cobro de deudas.'
          },
          {
            question: '¿Cuánto puedo pedir prestado?',
            answer: 'El monto que puede pedir prestado depende de su capacidad de reembolso y se determinará después del análisis de su expediente.'
          },
          {
            question: '¿Cuál es el período de reembolso?',
            answer: 'El período de reembolso varía de 12 a 120 meses según el monto prestado.'
          },
          {
            question: '¿Hay gastos de gestión?',
            answer: 'Nuestros gastos de gestión son transparentes y competitivos. Se le comunicarán en su oferta personalizada.'
          }
        ]
      },
      cta: {
        title: '¿Listo para realizar su proyecto?',
        description: 'Presente su solicitud en línea y reciba una respuesta en 24 horas',
        button: 'Solicitar mi crédito'
      }
    },
    'loan-refinancing': {
      slug: 'loan-refinancing',
      hero: {
        title: 'Refinanciación de Préstamos',
        subtitle: 'Agrupe sus préstamos y reduzca sus pagos mensuales hasta un 40%',
        cta: 'Simular mi refinanciación',
        features: [
          'Pagos reducidos',
          'Tasa única ventajosa',
          'Un solo contacto',
          'Solución a medida'
        ]
      },
      benefits: {
        title: 'Los beneficios de la refinanciación',
        items: [
          {
            icon: 'TrendingDown',
            title: 'Reduzca sus pagos',
            description: 'Disminuya sus cargos mensuales hasta un 40% agrupando sus préstamos'
          },
          {
            icon: 'FileCheck',
            title: 'Simplifique su gestión',
            description: 'Un préstamo, un pago, un contacto'
          },
          {
            icon: 'Calculator',
            title: 'Optimice su presupuesto',
            description: 'Recupere flujo de caja para sus proyectos'
          },
          {
            icon: 'Target',
            title: 'Solución personalizada',
            description: 'Una oferta adaptada a su situación financiera'
          }
        ]
      },
      process: {
        title: 'El proceso de refinanciación',
        steps: [
          {
            number: 1,
            title: 'Analice su situación',
            description: 'Liste todos sus préstamos actuales y calcule sus pagos totales'
          },
          {
            number: 2,
            title: 'Reciba una simulación',
            description: 'Estudiamos su expediente y proponemos la mejor solución'
          },
          {
            number: 3,
            title: 'Valide su oferta',
            description: 'Acepte las nuevas condiciones de su préstamo consolidado'
          },
          {
            number: 4,
            title: 'Reembolso automático',
            description: 'Reembolsamos sus préstamos antiguos y solo paga un pago mensual'
          }
        ]
      },
      faq: {
        title: 'Preguntas frecuentes',
        items: [
          {
            question: '¿Qué préstamos puedo consolidar?',
            answer: 'Puede consolidar todos los tipos de préstamos: préstamos personales, préstamos para automóviles, tarjetas de crédito, sobregiros bancarios, etc.'
          },
          {
            question: '¿Puedo pedir prestado más?',
            answer: 'Sí, puede agregar efectivo adicional a su refinanciación de préstamos.'
          },
          {
            question: '¿Cuánto tiempo tarda la operación?',
            answer: 'El proceso completo suele tardar entre 2 y 4 semanas.'
          },
          {
            question: '¿Hay penalizaciones por pago anticipado?',
            answer: 'Depende de sus contratos actuales. Analizamos este aspecto en nuestro estudio.'
          }
        ]
      },
      cta: {
        title: 'Simplifique sus reembolsos',
        description: 'Descubra cuánto podría ahorrar cada mes',
        button: 'Obtener una simulación'
      }
    },
    'lease-refinancing': {
      slug: 'lease-refinancing',
      hero: {
        title: 'Refinanciación de Leasing',
        subtitle: 'Conviértase en propietario de su vehículo y ahorre en sus pagos mensuales',
        cta: 'Refinanciar mi leasing',
        features: [
          'Conviértase en propietario',
          'Pagos reducidos',
          'Tasas ventajosas',
          'Proceso simplificado'
        ]
      },
      benefits: {
        title: '¿Por qué refinanciar su leasing?',
        items: [
          {
            icon: 'Car',
            title: 'Propiedad inmediata',
            description: 'Conviértase en propietario de su vehículo y disfrútelo plenamente'
          },
          {
            icon: 'Banknote',
            title: 'Ahorros sustanciales',
            description: 'Reduzca sus pagos mensuales y el costo total de su financiamiento'
          },
          {
            icon: 'Key',
            title: 'Más flexibilidad',
            description: 'No más restricciones de kilometraje o limitaciones de uso'
          },
          {
            icon: 'Award',
            title: 'Valor preservado',
            description: 'Conserve el valor de reventa de su vehículo'
          }
        ]
      },
      process: {
        title: 'Los pasos de la refinanciación',
        steps: [
          {
            number: 1,
            title: 'Evaluación del leasing',
            description: 'Evaluamos el monto restante en su contrato de leasing'
          },
          {
            number: 2,
            title: 'Propuesta de crédito',
            description: 'Le ofrecemos un préstamo para refinanciar su leasing'
          },
          {
            number: 3,
            title: 'Validación',
            description: 'Acepta los términos y firma su nuevo contrato'
          },
          {
            number: 4,
            title: 'Transferencia de propiedad',
            description: 'Refinanciamos el leasing y usted se convierte en propietario del vehículo'
          }
        ]
      },
      faq: {
        title: 'Preguntas frecuentes',
        items: [
          {
            question: '¿Cuándo puedo refinanciar mi leasing?',
            answer: 'Puede refinanciar su leasing en cualquier momento, incluso antes de que termine el contrato.'
          },
          {
            question: '¿La refinanciación afecta mi puntaje crediticio?',
            answer: 'No, al contrario, puede mejorar su perfil crediticio al convertirse en propietario.'
          },
          {
            question: '¿Puedo refinanciar un leasing profesional?',
            answer: 'Sí, ofrecemos soluciones tanto para leasings profesionales como privados.'
          },
          {
            question: '¿Qué pasa con el seguro?',
            answer: 'Deberá adaptar su seguro para que coincida con su nuevo estado de propietario.'
          }
        ]
      },
      cta: {
        title: 'Conviértase en propietario de su vehículo',
        description: 'Calcule el monto necesario para refinanciar su leasing',
        button: 'Obtener una estimación'
      }
    },
    'credit-card-refinancing': {
      slug: 'credit-card-refinancing',
      hero: {
        title: 'Refinanciación de Tarjeta de Crédito',
        subtitle: 'Reduzca drásticamente sus tasas de interés y reembolse más rápido',
        cta: 'Consolidar mis deudas',
        features: [
          'Tasas reducidas hasta 70%',
          'Reembolso acelerado',
          'Un solo pago mensual',
          'Sin cargos ocultos'
        ]
      },
      benefits: {
        title: 'Los beneficios de la refinanciación de tarjetas',
        items: [
          {
            icon: 'Percent',
            title: 'Tasas ultra-competitivas',
            description: 'Pase de tasas del 12-15% a tasas desde 4.9%'
          },
          {
            icon: 'LineChart',
            title: 'Reembolso rápido',
            description: 'Salga de las deudas gracias a un plan de reembolso estructurado'
          },
          {
            icon: 'CheckCircle',
            title: 'Simplificación',
            description: 'Consolide todas sus tarjetas de crédito en un solo préstamo'
          },
          {
            icon: 'ShieldCheck',
            title: 'Transparencia total',
            description: 'Sin cargos ocultos, sabe exactamente qué está pagando'
          }
        ]
      },
      process: {
        title: '¿Cómo proceder?',
        steps: [
          {
            number: 1,
            title: 'Evalúe sus deudas',
            description: 'Liste todas sus tarjetas de crédito y sus saldos actuales'
          },
          {
            number: 2,
            title: 'Reciba una oferta',
            description: 'Calculamos el monto total y le ofrecemos una tasa competitiva'
          },
          {
            number: 3,
            title: 'Consolide sus deudas',
            description: 'Pagamos todas sus tarjetas de crédito'
          },
          {
            number: 4,
            title: 'Pague un solo pago',
            description: 'Reembolse su nuevo préstamo con intereses reducidos'
          }
        ]
      },
      faq: {
        title: 'Preguntas frecuentes',
        items: [
          {
            question: '¿Cuánto puedo ahorrar?',
            answer: 'En promedio, nuestros clientes ahorran entre 60% y 70% en intereses al cambiar de una tasa de tarjeta de crédito a nuestra tasa de préstamo personal.'
          },
          {
            question: '¿Qué pasa con mis tarjetas?',
            answer: 'Después de la refinanciación, sus tarjetas están saldadas. Puede elegir cerrarlas o conservarlas sin saldo.'
          },
          {
            question: '¿Puedo incluir varias tarjetas?',
            answer: 'Sí, puede consolidar tantas tarjetas de crédito como sea necesario.'
          },
          {
            question: '¿Hay un monto mínimo?',
            answer: 'El monto mínimo es generalmente de 5,000 CHF para la refinanciación de tarjetas de crédito.'
          }
        ]
      },
      cta: {
        title: 'Libérese de las tasas altas',
        description: 'Calcule sus ahorros potenciales consolidando sus tarjetas de crédito',
        button: 'Calcular mis ahorros'
      }
    }
  },
  // Continue for other languages (pt, it, de, nl) - Due to space, showing pattern for one more language
  pt: {
    'personal-credit': {
      slug: 'personal-credit',
      hero: {
        title: 'Crédito Pessoal',
        subtitle: 'Financie seus projetos pessoais com taxas competitivas e resposta rápida em 24h',
        cta: 'Solicitar crédito',
        features: [
          'Taxas a partir de 4.9%',
          'Fundos imediatamente disponíveis',
          'Reembolso flexível',
          'Resposta em 24h'
        ]
      },
      benefits: {
        title: 'Por que escolher nosso crédito pessoal?',
        items: [
          {
            icon: 'Percent',
            title: 'Taxas competitivas',
            description: 'Beneficie-se de algumas das taxas de juros mais baixas do mercado suíço'
          },
          {
            icon: 'Clock',
            title: 'Resposta rápida',
            description: 'Obtenha uma decisão em princípio em menos de 24 horas'
          },
          {
            icon: 'Shield',
            title: 'Segurança garantida',
            description: 'Seus dados são protegidos de acordo com os padrões suíços mais rigorosos'
          },
          {
            icon: 'Calendar',
            title: 'Reembolso flexível',
            description: 'Escolha a duração que melhor se adapta à sua situação'
          }
        ]
      },
      process: {
        title: 'Como funciona?',
        steps: [
          {
            number: 1,
            title: 'Faça sua solicitação',
            description: 'Preencha nosso formulário online em poucos minutos'
          },
          {
            number: 2,
            title: 'Receba uma oferta',
            description: 'Analisamos seu arquivo e oferecemos as melhores condições'
          },
          {
            number: 3,
            title: 'Assine seu contrato',
            description: 'Valide sua oferta online de forma segura'
          },
          {
            number: 4,
            title: 'Receba seus fundos',
            description: 'O dinheiro é transferido para sua conta o mais rápido possível'
          }
        ]
      },
      faq: {
        title: 'Perguntas frequentes',
        items: [
          {
            question: 'Quais são os critérios de elegibilidade?',
            answer: 'Para ser elegível, você deve ser maior de idade, residir na Suíça, ter renda regular e não estar em cobrança de dívidas.'
          },
          {
            question: 'Quanto posso pedir emprestado?',
            answer: 'O valor que você pode pedir emprestado depende de sua capacidade de reembolso e será determinado após a análise de seu dossiê.'
          },
          {
            question: 'Qual é o período de reembolso?',
            answer: 'O período de reembolso varia de 12 a 120 meses dependendo do valor emprestado.'
          },
          {
            question: 'Há taxas de processamento?',
            answer: 'Nossas taxas de processamento são transparentes e competitivas. Elas serão comunicadas em sua oferta personalizada.'
          }
        ]
      },
      cta: {
        title: 'Pronto para realizar seu projeto?',
        description: 'Envie sua solicitação online e receba uma resposta em 24 horas',
        button: 'Solicitar meu crédito'
      }
    },
    // Additional loan types for PT would follow same pattern...
    'loan-refinancing': {
      slug: 'loan-refinancing',
      hero: {
        title: 'Refinanciamento de Empréstimos',
        subtitle: 'Consolide seus empréstimos e reduza seus pagamentos mensais em até 40%',
        cta: 'Simular meu refinanciamento',
        features: [
          'Pagamentos reduzidos',
          'Taxa única vantajosa',
          'Um único contato',
          'Solução sob medida'
        ]
      },
      benefits: {
        title: 'Os benefícios do refinanciamento',
        items: [
          {
            icon: 'TrendingDown',
            title: 'Reduza seus pagamentos',
            description: 'Diminua seus encargos mensais em até 40% consolidando seus empréstimos'
          },
          {
            icon: 'FileCheck',
            title: 'Simplifique sua gestão',
            description: 'Um empréstimo, um pagamento, um contato'
          },
          {
            icon: 'Calculator',
            title: 'Otimize seu orçamento',
            description: 'Recupere fluxo de caixa para seus projetos'
          },
          {
            icon: 'Target',
            title: 'Solução personalizada',
            description: 'Uma oferta adaptada à sua situação financeira'
          }
        ]
      },
      process: {
        title: 'O processo de refinanciamento',
        steps: [
          {
            number: 1,
            title: 'Analise sua situação',
            description: 'Liste todos os seus empréstimos atuais e calcule seus pagamentos totais'
          },
          {
            number: 2,
            title: 'Receba uma simulação',
            description: 'Estudamos seu arquivo e propomos a melhor solução'
          },
          {
            number: 3,
            title: 'Valide sua oferta',
            description: 'Aceite as novas condições do seu empréstimo consolidado'
          },
          {
            number: 4,
            title: 'Reembolso automático',
            description: 'Reembolsamos seus empréstimos antigos e você paga apenas um pagamento mensal'
          }
        ]
      },
      faq: {
        title: 'Perguntas frequentes',
        items: [
          {
            question: 'Quais empréstimos posso consolidar?',
            answer: 'Você pode consolidar todos os tipos de empréstimos: empréstimos pessoais, empréstimos para automóveis, cartões de crédito, descobertos bancários, etc.'
          },
          {
            question: 'Posso pedir emprestado mais?',
            answer: 'Sim, você pode adicionar dinheiro adicional ao seu refinanciamento de empréstimos.'
          },
          {
            question: 'Quanto tempo leva a operação?',
            answer: 'O processo completo normalmente leva entre 2 e 4 semanas.'
          },
          {
            question: 'Há penalidades por pagamento antecipado?',
            answer: 'Depende dos seus contratos atuais. Analisamos este aspecto em nosso estudo.'
          }
        ]
      },
      cta: {
        title: 'Simplifique seus reembolsos',
        description: 'Descubra quanto você poderia economizar a cada mês',
        button: 'Obter uma simulação'
      }
    },
    'lease-refinancing': {
      slug: 'lease-refinancing',
      hero: {
        title: 'Refinanciamento de Leasing',
        subtitle: 'Torne-se proprietário do seu veículo e economize nos pagamentos mensais',
        cta: 'Refinanciar meu leasing',
        features: [
          'Torne-se proprietário',
          'Pagamentos reduzidos',
          'Taxas vantajosas',
          'Processo simplificado'
        ]
      },
      benefits: {
        title: 'Por que refinanciar seu leasing?',
        items: [
          {
            icon: 'Car',
            title: 'Propriedade imediata',
            description: 'Torne-se proprietário do seu veículo e aproveite-o plenamente'
          },
          {
            icon: 'Banknote',
            title: 'Economias substanciais',
            description: 'Reduza seus pagamentos mensais e o custo total do seu financiamento'
          },
          {
            icon: 'Key',
            title: 'Mais flexibilidade',
            description: 'Sem mais restrições de quilometragem ou limitações de uso'
          },
          {
            icon: 'Award',
            title: 'Valor preservado',
            description: 'Mantenha o valor de revenda do seu veículo'
          }
        ]
      },
      process: {
        title: 'As etapas do refinanciamento',
        steps: [
          {
            number: 1,
            title: 'Avaliação do leasing',
            description: 'Avaliamos o valor restante no seu contrato de leasing'
          },
          {
            number: 2,
            title: 'Proposta de crédito',
            description: 'Oferecemos um empréstimo para refinanciar seu leasing'
          },
          {
            number: 3,
            title: 'Validação',
            description: 'Você aceita os termos e assina seu novo contrato'
          },
          {
            number: 4,
            title: 'Transferência de propriedade',
            description: 'Refinanciamos o leasing e você se torna proprietário do veículo'
          }
        ]
      },
      faq: {
        title: 'Perguntas frequentes',
        items: [
          {
            question: 'Quando posso refinanciar meu leasing?',
            answer: 'Você pode refinanciar seu leasing a qualquer momento, mesmo antes do término do contrato.'
          },
          {
            question: 'O refinanciamento afeta minha pontuação de crédito?',
            answer: 'Não, pelo contrário, pode melhorar seu perfil de crédito ao se tornar proprietário.'
          },
          {
            question: 'Posso refinanciar um leasing profissional?',
            answer: 'Sim, oferecemos soluções tanto para leasings profissionais quanto privados.'
          },
          {
            question: 'O que acontece com o seguro?',
            answer: 'Você precisará adaptar seu seguro para corresponder ao seu novo status de proprietário.'
          }
        ]
      },
      cta: {
        title: 'Torne-se proprietário do seu veículo',
        description: 'Calcule o valor necessário para refinanciar seu leasing',
        button: 'Obter uma estimativa'
      }
    },
    'credit-card-refinancing': {
      slug: 'credit-card-refinancing',
      hero: {
        title: 'Refinanciamento de Cartão de Crédito',
        subtitle: 'Reduza drasticamente suas taxas de juros e reembolse mais rápido',
        cta: 'Consolidar minhas dívidas',
        features: [
          'Taxas reduzidas em até 70%',
          'Reembolso acelerado',
          'Um único pagamento mensal',
          'Sem taxas ocultas'
        ]
      },
      benefits: {
        title: 'Os benefícios do refinanciamento de cartões',
        items: [
          {
            icon: 'Percent',
            title: 'Taxas ultra-competitivas',
            description: 'Passe de taxas de 12-15% para taxas a partir de 4.9%'
          },
          {
            icon: 'LineChart',
            title: 'Reembolso rápido',
            description: 'Saia das dívidas graças a um plano de reembolso estruturado'
          },
          {
            icon: 'CheckCircle',
            title: 'Simplificação',
            description: 'Consolide todos os seus cartões de crédito em um único empréstimo'
          },
          {
            icon: 'ShieldCheck',
            title: 'Transparência total',
            description: 'Sem taxas ocultas, você sabe exatamente o que está pagando'
          }
        ]
      },
      process: {
        title: 'Como proceder?',
        steps: [
          {
            number: 1,
            title: 'Avalie suas dívidas',
            description: 'Liste todos os seus cartões de crédito e seus saldos atuais'
          },
          {
            number: 2,
            title: 'Receba uma oferta',
            description: 'Calculamos o valor total e oferecemos uma taxa competitiva'
          },
          {
            number: 3,
            title: 'Consolide suas dívidas',
            description: 'Pagamos todos os seus cartões de crédito'
          },
          {
            number: 4,
            title: 'Pague um único pagamento',
            description: 'Reembolse seu novo empréstimo com juros reduzidos'
          }
        ]
      },
      faq: {
        title: 'Perguntas frequentes',
        items: [
          {
            question: 'Quanto posso economizar?',
            answer: 'Em média, nossos clientes economizam entre 60% e 70% em juros ao mudar de uma taxa de cartão de crédito para nossa taxa de empréstimo pessoal.'
          },
          {
            question: 'O que acontece com meus cartões?',
            answer: 'Após o refinanciamento, seus cartões estão quitados. Você pode optar por fechá-los ou mantê-los sem saldo.'
          },
          {
            question: 'Posso incluir vários cartões?',
            answer: 'Sim, você pode consolidar quantos cartões de crédito forem necessários.'
          },
          {
            question: 'Há um valor mínimo?',
            answer: 'O valor mínimo é geralmente de CHF 5,000 para o refinanciamento de cartões de crédito.'
          }
        ]
      },
      cta: {
        title: 'Liberte-se das taxas altas',
        description: 'Calcule suas economias potenciais consolidando seus cartões de crédito',
        button: 'Calcular minhas economias'
      }
    }
  },
  // Italian, German, and Dutch would follow the same comprehensive pattern
  it: {
    'personal-credit': {
      slug: 'personal-credit',
      hero: { title: 'Credito Personale', subtitle: 'Finanzia i tuoi progetti personali con tassi competitivi e risposta rapida in 24h', cta: 'Richiedere credito', features: ['Tassi dal 4.9%', 'Fondi immediatamente disponibili', 'Rimborso flessibile', 'Risposta in 24h'] },
      benefits: { title: 'Perché scegliere il nostro credito personale?', items: [{ icon: 'Percent', title: 'Tassi competitivi', description: 'Beneficia di alcuni dei tassi di interesse più bassi del mercato svizzero' }, { icon: 'Clock', title: 'Risposta rapida', description: 'Ottieni una decisione di principio in meno di 24 ore' }, { icon: 'Shield', title: 'Sicurezza garantita', description: 'I tuoi dati sono protetti secondo gli standard svizzeri più rigorosi' }, { icon: 'Calendar', title: 'Rimborso flessibile', description: 'Scegli la durata che meglio si adatta alla tua situazione' }] },
      process: { title: 'Come funziona?', steps: [{ number: 1, title: 'Fai la tua richiesta', description: 'Compila il nostro modulo online in pochi minuti' }, { number: 2, title: 'Ricevi un\'offerta', description: 'Analizziamo il tuo file e ti proponiamo le migliori condizioni' }, { number: 3, title: 'Firma il tuo contratto', description: 'Convalida la tua offerta online in modo sicuro' }, { number: 4, title: 'Ricevi i tuoi fondi', description: 'Il denaro viene trasferito sul tuo conto il prima possibile' }] },
      faq: { title: 'Domande frequenti', items: [{ question: 'Quali sono i criteri di eleggibilità?', answer: 'Per essere eleggibile, devi essere maggiorenne, risiedere in Svizzera, avere un reddito regolare e non essere in riscossione crediti.' }, { question: 'Quanto posso prendere in prestito?', answer: 'L\'importo che puoi prendere in prestito dipende dalla tua capacità di rimborso e sarà determinato dopo l\'analisi del tuo dossier.' }, { question: 'Qual è il periodo di rimborso?', answer: 'Il periodo di rimborso varia da 12 a 120 mesi a seconda dell\'importo preso in prestito.' }, { question: 'Ci sono commissioni di gestione?', answer: 'Le nostre commissioni di gestione sono trasparenti e competitive. Ti saranno comunicate nella tua offerta personalizzata.' }] },
      cta: { title: 'Pronto a realizzare il tuo progetto?', description: 'Invia la tua richiesta online e ricevi una risposta entro 24 ore', button: 'Richiedere il mio credito' }
    },
    'loan-refinancing': {
      slug: 'loan-refinancing',
      hero: { title: 'Rifinanziamento Prestiti', subtitle: 'Consolida i tuoi prestiti e riduci i pagamenti mensili fino al 40%', cta: 'Simulare il mio rifinanziamento', features: ['Pagamenti ridotti', 'Tasso unico vantaggioso', 'Un solo contatto', 'Soluzione su misura'] },
      benefits: { title: 'I vantaggi del rifinanziamento', items: [{ icon: 'TrendingDown', title: 'Riduci i tuoi pagamenti', description: 'Diminuisci i tuoi oneri mensili fino al 40% consolidando i tuoi prestiti' }, { icon: 'FileCheck', title: 'Semplifica la tua gestione', description: 'Un prestito, un pagamento, un contatto' }, { icon: 'Calculator', title: 'Ottimizza il tuo budget', description: 'Recupera flusso di cassa per i tuoi progetti' }, { icon: 'Target', title: 'Soluzione personalizzata', description: 'Un\'offerta adattata alla tua situazione finanziaria' }] },
      process: { title: 'Il processo di rifinanziamento', steps: [{ number: 1, title: 'Analizza la tua situazione', description: 'Elenca tutti i tuoi prestiti attuali e calcola i tuoi pagamenti totali' }, { number: 2, title: 'Ricevi una simulazione', description: 'Studiamo il tuo file e proponiamo la soluzione migliore' }, { number: 3, title: 'Convalida la tua offerta', description: 'Accetta le nuove condizioni del tuo prestito consolidato' }, { number: 4, title: 'Rimborso automatico', description: 'Rimbors iamo i tuoi vecchi prestiti e paghi solo un pagamento mensile' }] },
      faq: { title: 'Domande frequenti', items: [{ question: 'Quali prestiti posso consolidare?', answer: 'Puoi consolidare tutti i tipi di prestiti: prestiti personali, prestiti auto, carte di credito, scoperti bancari, ecc.' }, { question: 'Posso prendere in prestito di più?', answer: 'Sì, puoi aggiungere denaro aggiuntivo al tuo rifinanziamento dei prestiti.' }, { question: 'Quanto tempo impiega l\'operazione?', answer: 'Il processo completo di solito richiede tra 2 e 4 settimane.' }, { question: 'Ci sono penalità per il pagamento anticipato?', answer: 'Dipende dai tuoi contratti attuali. Analizziamo questo aspetto nel nostro studio.' }] },
      cta: { title: 'Semplifica i tuoi rimborsi', description: 'Scopri quanto potresti risparmiare ogni mese', button: 'Ottenere una simulazione' }
    },
    'lease-refinancing': {
      slug: 'lease-refinancing',
      hero: { title: 'Rifinanziamento Leasing', subtitle: 'Diventa proprietario del tuo veicolo e risparmia sui pagamenti mensili', cta: 'Rifinanziare il mio leasing', features: ['Diventa proprietario', 'Pagamenti ridotti', 'Tassi vantaggiosi', 'Processo semplificato'] },
      benefits: { title: 'Perché rifinanziare il tuo leasing?', items: [{ icon: 'Car', title: 'Proprietà immediata', description: 'Diventa proprietario del tuo veicolo e godilo pienamente' }, { icon: 'Banknote', title: 'Risparmi sostanziali', description: 'Riduci i tuoi pagamenti mensili e il costo totale del tuo finanziamento' }, { icon: 'Key', title: 'Più flessibilità', description: 'Niente più restrizioni di chilometraggio o limitazioni d\'uso' }, { icon: 'Award', title: 'Valore preservato', description: 'Mantieni il valore di rivendita del tuo veicolo' }] },
      process: { title: 'Le fasi del rifinanziamento', steps: [{ number: 1, title: 'Valutazione del leasing', description: 'Valutiamo l\'importo restante sul tuo contratto di leasing' }, { number: 2, title: 'Proposta di credito', description: 'Ti offriamo un prestito per rifinanziare il tuo leasing' }, { number: 3, title: 'Convalida', description: 'Accetti i termini e firmi il tuo nuovo contratto' }, { number: 4, title: 'Trasferimento di proprietà', description: 'Rifinanziamo il leasing e diventi proprietario del veicolo' }] },
      faq: { title: 'Domande frequenti', items: [{ question: 'Quando posso rifinanziare il mio leasing?', answer: 'Puoi rifinanziare il tuo leasing in qualsiasi momento, anche prima della fine del contratto.' }, { question: 'Il rifinanziamento influisce sul mio punteggio di credito?', answer: 'No, al contrario, può migliorare il tuo profilo di credito diventando proprietario.' }, { question: 'Posso rifinanziare un leasing professionale?', answer: 'Sì, offriamo soluzioni sia per leasing professionali che privati.' }, { question: 'Cosa succede con l\'assicurazione?', answer: 'Dovrai adattare la tua assicurazione per corrispondere al tuo nuovo stato di proprietario.' }] },
      cta: { title: 'Diventa proprietario del tuo veicolo', description: 'Calcola l\'importo necessario per rifinanziare il tuo leasing', button: 'Ottenere una stima' }
    },
    'credit-card-refinancing': {
      slug: 'credit-card-refinancing',
      hero: { title: 'Rifinanziamento Carta di Credito', subtitle: 'Riduci drasticamente i tuoi tassi di interesse e rimborsa più velocemente', cta: 'Consolidare i miei debiti', features: ['Tassi ridotti fino al 70%', 'Rimborso accelerato', 'Un solo pagamento mensile', 'Nessun costo nascosto'] },
      benefits: { title: 'I vantaggi del rifinanziamento delle carte', items: [{ icon: 'Percent', title: 'Tassi ultra-competitivi', description: 'Passa da tassi del 12-15% a tassi a partire dal 4.9%' }, { icon: 'LineChart', title: 'Rimborso rapido', description: 'Esci dai debiti grazie a un piano di rimborso strutturato' }, { icon: 'CheckCircle', title: 'Semplificazione', description: 'Consolida tutte le tue carte di credito in un unico prestito' }, { icon: 'ShieldCheck', title: 'Trasparenza totale', description: 'Nessun costo nascosto, sai esattamente cosa stai pagando' }] },
      process: { title: 'Come procedere?', steps: [{ number: 1, title: 'Valuta i tuoi debiti', description: 'Elenca tutte le tue carte di credito e i loro saldi attuali' }, { number: 2, title: 'Ricevi un\'offerta', description: 'Calcoliamo l\'importo totale e ti offriamo un tasso competitivo' }, { number: 3, title: 'Consolida i tuoi debiti', description: 'Paghiamo tutte le tue carte di credito' }, { number: 4, title: 'Paga un solo pagamento', description: 'Rimborsa il tuo nuovo prestito con interessi ridotti' }] },
      faq: { title: 'Domande frequenti', items: [{ question: 'Quanto posso risparmiare?', answer: 'In media, i nostri clienti risparmiano tra il 60% e il 70% sugli interessi passando da un tasso di carta di credito al nostro tasso di prestito personale.' }, { question: 'Cosa succede con le mie carte?', answer: 'Dopo il rifinanziamento, le tue carte sono saldate. Puoi scegliere di chiuderle o di conservarle senza saldo.' }, { question: 'Posso includere più carte?', answer: 'Sì, puoi consolidare quante carte di credito necessarie.' }, { question: 'C\'è un importo minimo?', answer: 'L\'importo minimo è generalmente di CHF 5,000 per il rifinanziamento delle carte di credito.' }] },
      cta: { title: 'Liberati dai tassi elevati', description: 'Calcola i tuoi risparmi potenziali consolidando le tue carte di credito', button: 'Calcolare i miei risparmi' }
    }
  },
  de: {
    'personal-credit': {
      slug: 'personal-credit',
      hero: { title: 'Privatkredit', subtitle: 'Finanzieren Sie Ihre persönlichen Projekte mit günstigen Zinsen und schneller Antwort in 24h', cta: 'Kredit beantragen', features: ['Zinsen ab 4.9%', 'Sofortige Auszahlung', 'Flexible Rückzahlung', 'Antwort in 24h'] },
      benefits: { title: 'Warum unseren Privatkredit wählen?', items: [{ icon: 'Percent', title: 'Wettbewerbsfähige Zinsen', description: 'Profitieren Sie von einigen der niedrigsten Zinssätze auf dem Schweizer Markt' }, { icon: 'Clock', title: 'Schnelle Antwort', description: 'Erhalten Sie eine Entscheidung im Prinzip in weniger als 24 Stunden' }, { icon: 'Shield', title: 'Garantierte Sicherheit', description: 'Ihre Daten sind nach den strengsten Schweizer Standards geschützt' }, { icon: 'Calendar', title: 'Flexible Rückzahlung', description: 'Wählen Sie die Laufzeit, die am besten zu Ihrer Situation passt' }] },
      process: { title: 'Wie funktioniert es?', steps: [{ number: 1, title: 'Stellen Sie Ihren Antrag', description: 'Füllen Sie unser Online-Formular in wenigen Minuten aus' }, { number: 2, title: 'Erhalten Sie ein Angebot', description: 'Wir analysieren Ihr Dossier und bieten Ihnen die besten Konditionen' }, { number: 3, title: 'Unterschreiben Sie Ihren Vertrag', description: 'Bestätigen Sie Ihr Angebot online sicher' }, { number: 4, title: 'Erhalten Sie Ihre Mittel', description: 'Das Geld wird so schnell wie möglich auf Ihr Konto überwiesen' }] },
      faq: { title: 'Häufig gestellte Fragen', items: [{ question: 'Was sind die Zulassungskriterien?', answer: 'Um berechtigt zu sein, müssen Sie volljährig sein, in der Schweiz wohnen, ein regelmäßiges Einkommen haben und nicht in Schuldeneintreibung sein.' }, { question: 'Wie viel kann ich leihen?', answer: 'Der Betrag, den Sie leihen können, hängt von Ihrer Rückzahlungsfähigkeit ab und wird nach Analyse Ihres Dossiers festgelegt.' }, { question: 'Was ist die Rückzahlungsdauer?', answer: 'Die Rückzahlungsdauer variiert von 12 bis 120 Monaten je nach geliehenem Betrag.' }, { question: 'Gibt es Bearbeitungsgebühren?', answer: 'Unsere Bearbeitungsgebühren sind transparent und wettbewerbsfähig. Sie werden Ihnen in Ihrem personalisierten Angebot mitgeteilt.' }] },
      cta: { title: 'Bereit, Ihr Projekt zu verwirklichen?', description: 'Senden Sie Ihren Antrag online und erhalten Sie eine Antwort innerhalb von 24 Stunden', button: 'Meinen Kredit beantragen' }
    },
    'loan-refinancing': {
      slug: 'loan-refinancing',
      hero: { title: 'Kreditumschuldung', subtitle: 'Bündeln Sie Ihre Kredite und reduzieren Sie Ihre monatlichen Zahlungen um bis zu 40%', cta: 'Meine Umschuldung simulieren', features: ['Reduzierte Zahlungen', 'Einziger vorteilhafter Zinssatz', 'Ein Ansprechpartner', 'Maßgeschneiderte Lösung'] },
      benefits: { title: 'Die Vorteile der Umschuldung', items: [{ icon: 'TrendingDown', title: 'Reduzieren Sie Ihre Zahlungen', description: 'Verringern Sie Ihre monatlichen Belastungen um bis zu 40%, indem Sie Ihre Kredite bündeln' }, { icon: 'FileCheck', title: 'Vereinfachen Sie Ihre Verwaltung', description: 'Ein Kredit, eine Zahlung, ein Ansprechpartner' }, { icon: 'Calculator', title: 'Optimieren Sie Ihr Budget', description: 'Gewinnen Sie Cashflow für Ihre Projekte zurück' }, { icon: 'Target', title: 'Personalisierte Lösung', description: 'Ein Angebot, das auf Ihre finanzielle Situation zugeschnitten ist' }] },
      process: { title: 'Der Umschuldungsprozess', steps: [{ number: 1, title: 'Analysieren Sie Ihre Situation', description: 'Listen Sie alle Ihre aktuellen Kredite auf und berechnen Sie Ihre Gesamtzahlungen' }, { number: 2, title: 'Erhalten Sie eine Simulation', description: 'Wir studieren Ihr Dossier und schlagen die beste Lösung vor' }, { number: 3, title: 'Bestätigen Sie Ihr Angebot', description: 'Akzeptieren Sie die neuen Bedingungen Ihres konsolidierten Kredits' }, { number: 4, title: 'Automatische Rückzahlung', description: 'Wir zahlen Ihre alten Kredite zurück und Sie zahlen nur eine monatliche Zahlung' }] },
      faq: { title: 'Häufig gestellte Fragen', items: [{ question: 'Welche Kredite kann ich konsolidieren?', answer: 'Sie können alle Arten von Krediten konsolidieren: Privatkredite, Autokredite, Kreditkarten, Bankkontokorrentkredite usw.' }, { question: 'Kann ich mehr leihen?', answer: 'Ja, Sie können zusätzliches Geld zu Ihrer Kreditumschuldung hinzufügen.' }, { question: 'Wie lange dauert die Operation?', answer: 'Der vollständige Prozess dauert in der Regel zwischen 2 und 4 Wochen.' }, { question: 'Gibt es Strafen für vorzeitige Rückzahlung?', answer: 'Das hängt von Ihren aktuellen Verträgen ab. Wir analysieren diesen Aspekt in unserer Studie.' }] },
      cta: { title: 'Vereinfachen Sie Ihre Rückzahlungen', description: 'Entdecken Sie, wie viel Sie jeden Monat sparen könnten', button: 'Eine Simulation erhalten' }
    },
    'lease-refinancing': {
      slug: 'lease-refinancing',
      hero: { title: 'Leasing-Umschuldung', subtitle: 'Werden Sie Eigentümer Ihres Fahrzeugs und sparen Sie bei den monatlichen Zahlungen', cta: 'Mein Leasing umschulden', features: ['Werden Sie Eigentümer', 'Reduzierte Zahlungen', 'Vorteilhafte Zinsen', 'Vereinfachter Prozess'] },
      benefits: { title: 'Warum Ihr Leasing umschulden?', items: [{ icon: 'Car', title: 'Sofortiges Eigentum', description: 'Werden Sie Eigentümer Ihres Fahrzeugs und genießen Sie es vollständig' }, { icon: 'Banknote', title: 'Erhebliche Einsparungen', description: 'Reduzieren Sie Ihre monatlichen Zahlungen und die Gesamtkosten Ihrer Finanzierung' }, { icon: 'Key', title: 'Mehr Flexibilität', description: 'Keine Kilometerbeschränkungen oder Nutzungsbeschränkungen mehr' }, { icon: 'Award', title: 'Bewahrter Wert', description: 'Behalten Sie den Wiederverkaufswert Ihres Fahrzeugs' }] },
      process: { title: 'Die Umschuldungsschritte', steps: [{ number: 1, title: 'Leasing-Bewertung', description: 'Wir bewerten den verbleibenden Betrag auf Ihrem Leasingvertrag' }, { number: 2, title: 'Kreditvorschlag', description: 'Wir bieten Ihnen einen Kredit zur Umschuldung Ihres Leasings' }, { number: 3, title: 'Bestätigung', description: 'Sie akzeptieren die Bedingungen und unterschreiben Ihren neuen Vertrag' }, { number: 4, title: 'Eigentumsübertragung', description: 'Wir schulden das Leasing um und Sie werden Eigentümer des Fahrzeugs' }] },
      faq: { title: 'Häufig gestellte Fragen', items: [{ question: 'Wann kann ich mein Leasing umschulden?', answer: 'Sie können Ihr Leasing jederzeit umschulden, auch vor Ende des Vertrags.' }, { question: 'Beeinflusst die Umschuldung meine Kreditwürdigkeit?', answer: 'Nein, im Gegenteil, sie kann Ihr Kreditprofil verbessern, da Sie Eigentümer werden.' }, { question: 'Kann ich ein professionelles Leasing umschulden?', answer: 'Ja, wir bieten Lösungen sowohl für professionelle als auch private Leasings.' }, { question: 'Was passiert mit der Versicherung?', answer: 'Sie müssen Ihre Versicherung an Ihren neuen Eigentümerstatus anpassen.' }] },
      cta: { title: 'Werden Sie Eigentümer Ihres Fahrzeugs', description: 'Berechnen Sie den Betrag, der zur Umschuldung Ihres Leasings erforderlich ist', button: 'Eine Schätzung erhalten' }
    },
    'credit-card-refinancing': {
      slug: 'credit-card-refinancing',
      hero: { title: 'Kreditkarten-Umschuldung', subtitle: 'Reduzieren Sie Ihre Zinssätze drastisch und zahlen Sie schneller zurück', cta: 'Meine Schulden konsolidieren', features: ['Zinsen um bis zu 70% reduziert', 'Beschleunigte Rückzahlung', 'Eine einzige monatliche Zahlung', 'Keine versteckten Gebühren'] },
      benefits: { title: 'Die Vorteile der Kreditkartenumschuldung', items: [{ icon: 'Percent', title: 'Ultra-wettbewerbsfähige Zinsen', description: 'Wechseln Sie von Zinssätzen von 12-15% zu Zinssätzen ab 4.9%' }, { icon: 'LineChart', title: 'Schnelle Rückzahlung', description: 'Kommen Sie aus der Verschuldung dank eines strukturierten Rückzahlungsplans' }, { icon: 'CheckCircle', title: 'Vereinfachung', description: 'Konsolidieren Sie alle Ihre Kreditkarten in einem einzigen Kredit' }, { icon: 'ShieldCheck', title: 'Totale Transparenz', description: 'Keine versteckten Gebühren, Sie wissen genau, was Sie zahlen' }] },
      process: { title: 'Wie vorgehen?', steps: [{ number: 1, title: 'Bewerten Sie Ihre Schulden', description: 'Listen Sie alle Ihre Kreditkarten und ihre aktuellen Salden auf' }, { number: 2, title: 'Erhalten Sie ein Angebot', description: 'Wir berechnen den Gesamtbetrag und bieten Ihnen einen wettbewerbsfähigen Zinssatz' }, { number: 3, title: 'Konsolidieren Sie Ihre Schulden', description: 'Wir zahlen alle Ihre Kreditkarten ab' }, { number: 4, title: 'Zahlen Sie eine einzige Zahlung', description: 'Zahlen Sie Ihren neuen Kredit mit reduzierten Zinsen zurück' }] },
      faq: { title: 'Häufig gestellte Fragen', items: [{ question: 'Wie viel kann ich sparen?', answer: 'Im Durchschnitt sparen unsere Kunden zwischen 60% und 70% an Zinsen, indem sie von einem Kreditkartenzinssatz zu unserem Privatkreditzinssatz wechseln.' }, { question: 'Was passiert mit meinen Karten?', answer: 'Nach der Umschuldung sind Ihre Karten ausgeglichen. Sie können wählen, sie zu schließen oder sie ohne Saldo zu behalten.' }, { question: 'Kann ich mehrere Karten einschließen?', answer: 'Ja, Sie können so viele Kreditkarten wie nötig konsolidieren.' }, { question: 'Gibt es einen Mindestbetrag?', answer: 'Der Mindestbetrag beträgt in der Regel CHF 5,000 für die Kreditkartenumschuldung.' }] },
      cta: { title: 'Befreien Sie sich von hohen Zinssätzen', description: 'Berechnen Sie Ihre potenziellen Einsparungen durch die Konsolidierung Ihrer Kreditkarten', button: 'Meine Einsparungen berechnen' }
    }
  },
  nl: {
    'personal-credit': {
      slug: 'personal-credit',
      hero: { title: 'Persoonlijk Krediet', subtitle: 'Financier uw persoonlijke projecten met concurrerende tarieven en snelle reactie binnen 24u', cta: 'Krediet aanvragen', features: ['Tarieven vanaf 4.9%', 'Onmiddellijk beschikbaar', 'Flexibele terugbetaling', 'Reactie binnen 24u'] },
      benefits: { title: 'Waarom ons persoonlijk krediet kiezen?', items: [{ icon: 'Percent', title: 'Concurrerende tarieven', description: 'Profiteer van enkele van de laagste rentetarieven op de Zwitserse markt' }, { icon: 'Clock', title: 'Snelle reactie', description: 'Krijg in principe een beslissing in minder dan 24 uur' }, { icon: 'Shield', title: 'Gegarandeerde veiligheid', description: 'Uw gegevens zijn beschermd volgens de strengste Zwitserse normen' }, { icon: 'Calendar', title: 'Flexibele terugbetaling', description: 'Kies de looptijd die het beste bij uw situatie past' }] },
      process: { title: 'Hoe werkt het?', steps: [{ number: 1, title: 'Doe uw aanvraag', description: 'Vul ons online formulier in een paar minuten in' }, { number: 2, title: 'Ontvang een aanbieding', description: 'We analyseren uw dossier en bieden u de beste voorwaarden' }, { number: 3, title: 'Onderteken uw contract', description: 'Valideer uw aanbieding online veilig' }, { number: 4, title: 'Ontvang uw fondsen', description: 'Het geld wordt zo snel mogelijk naar uw rekening overgemaakt' }] },
      faq: { title: 'Veelgestelde vragen', items: [{ question: 'Wat zijn de toelatingscriteria?', answer: 'Om in aanmerking te komen, moet u meerderjarig zijn, in Zwitserland wonen, een regelmatig inkomen hebben en niet in schuldinvordering zijn.' }, { question: 'Hoeveel kan ik lenen?', answer: 'Het bedrag dat u kunt lenen hangt af van uw terugbetalingscapaciteit en wordt bepaald na analyse van uw dossier.' }, { question: 'Wat is de terugbetalingsperiode?', answer: 'De terugbetalingsperiode varieert van 12 tot 120 maanden afhankelijk van het geleende bedrag.' }, { question: 'Zijn er verwerkingskosten?', answer: 'Onze verwerkingskosten zijn transparant en concurrerend. Ze zullen u in uw gepersonaliseerde aanbieding worden meegedeeld.' }] },
      cta: { title: 'Klaar om uw project te realiseren?', description: 'Dien uw aanvraag online in en ontvang binnen 24 uur een reactie', button: 'Mijn krediet aanvragen' }
    },
    'loan-refinancing': {
      slug: 'loan-refinancing',
      hero: { title: 'Lening Herfinanciering', subtitle: 'Consolideer uw leningen en verlaag uw maandelijkse betalingen met maximaal 40%', cta: 'Mijn herfinanciering simuleren', features: ['Verlaagde betalingen', 'Enkele voordelige rente', 'Eén contactpersoon', 'Op maat gemaakte oplossing'] },
      benefits: { title: 'De voordelen van herfinanciering', items: [{ icon: 'TrendingDown', title: 'Verlaag uw betalingen', description: 'Verminder uw maandelijkse lasten met maximaal 40% door uw leningen te consolideren' }, { icon: 'FileCheck', title: 'Vereenvoudig uw beheer', description: 'Eén lening, één betaling, één contactpersoon' }, { icon: 'Calculator', title: 'Optimaliseer uw budget', description: 'Krijg cashflow terug voor uw projecten' }, { icon: 'Target', title: 'Gepersonaliseerde oplossing', description: 'Een aanbieding aangepast aan uw financiële situatie' }] },
      process: { title: 'Het herfinancieringsproces', steps: [{ number: 1, title: 'Analyseer uw situatie', description: 'Lijst al uw huidige leningen op en bereken uw totale betalingen' }, { number: 2, title: 'Ontvang een simulatie', description: 'We bestuderen uw dossier en stellen de beste oplossing voor' }, { number: 3, title: 'Valideer uw aanbieding', description: 'Accepteer de nieuwe voorwaarden van uw geconsolideerde lening' }, { number: 4, title: 'Automatische terugbetaling', description: 'We betalen uw oude leningen terug en u betaalt slechts één maandelijkse betaling' }] },
      faq: { title: 'Veelgestelde vragen', items: [{ question: 'Welke leningen kan ik consolideren?', answer: 'U kunt alle soorten leningen consolideren: persoonlijke leningen, autoleningen, creditcards, bankovertrekken, enz.' }, { question: 'Kan ik meer lenen?', answer: 'Ja, u kunt extra geld toevoegen aan uw leningherfinanciering.' }, { question: 'Hoe lang duurt de operatie?', answer: 'Het volledige proces duurt doorgaans tussen 2 en 4 weken.' }, { question: 'Zijn er boetes voor vervroegde terugbetaling?', answer: 'Dat hangt af van uw huidige contracten. We analyseren dit aspect in onze studie.' }] },
      cta: { title: 'Vereenvoudig uw terugbetalingen', description: 'Ontdek hoeveel u elke maand zou kunnen besparen', button: 'Een simulatie krijgen' }
    },
    'lease-refinancing': {
      slug: 'lease-refinancing',
      hero: { title: 'Leasing Herfinanciering', subtitle: 'Word eigenaar van uw voertuig en bespaar op uw maandelijkse betalingen', cta: 'Mijn leasing herfinancieren', features: ['Word eigenaar', 'Verlaagde betalingen', 'Voordelige tarieven', 'Vereenvoudigd proces'] },
      benefits: { title: 'Waarom uw leasing herfinancieren?', items: [{ icon: 'Car', title: 'Onmiddellijk eigendom', description: 'Word eigenaar van uw voertuig en geniet er volledig van' }, { icon: 'Banknote', title: 'Aanzienlijke besparingen', description: 'Verlaag uw maandelijkse betalingen en de totale kosten van uw financiering' }, { icon: 'Key', title: 'Meer flexibiliteit', description: 'Geen kilometerbeperkingen of gebruiksbeperkingen meer' }, { icon: 'Award', title: 'Behouden waarde', description: 'Behoud de verkoopwaarde van uw voertuig' }] },
      process: { title: 'De herfinancieringsstappen', steps: [{ number: 1, title: 'Leasing evaluatie', description: 'We evalueren het resterende bedrag op uw leasingcontract' }, { number: 2, title: 'Kredietvoorstel', description: 'We bieden u een lening om uw leasing te herfinancieren' }, { number: 3, title: 'Validatie', description: 'U accepteert de voorwaarden en ondertekent uw nieuwe contract' }, { number: 4, title: 'Eigendomsoverdracht', description: 'We herfinancieren de leasing en u wordt eigenaar van het voertuig' }] },
      faq: { title: 'Veelgestelde vragen', items: [{ question: 'Wanneer kan ik mijn leasing herfinancieren?', answer: 'U kunt uw leasing op elk moment herfinancieren, zelfs voor het einde van het contract.' }, { question: 'Beïnvloedt herfinanciering mijn kredietscore?', answer: 'Nee, integendeel, het kan uw kredietprofiel verbeteren omdat u eigenaar wordt.' }, { question: 'Kan ik een professionele leasing herfinancieren?', answer: 'Ja, we bieden oplossingen voor zowel professionele als particuliere leasings.' }, { question: 'Wat gebeurt er met de verzekering?', answer: 'U moet uw verzekering aanpassen aan uw nieuwe eigenaarsstatus.' }] },
      cta: { title: 'Word eigenaar van uw voertuig', description: 'Bereken het bedrag dat nodig is om uw leasing te herfinancieren', button: 'Een schatting krijgen' }
    },
    'credit-card-refinancing': {
      slug: 'credit-card-refinancing',
      hero: { title: 'Creditcard Herfinanciering', subtitle: 'Verlaag uw rentetarieven drastisch en betaal sneller terug', cta: 'Mijn schulden consolideren', features: ['Tarieven verlaagd tot 70%', 'Versnelde terugbetaling', 'Eén maandelijkse betaling', 'Geen verborgen kosten'] },
      benefits: { title: 'De voordelen van creditcardherfinanciering', items: [{ icon: 'Percent', title: 'Ultra-concurrerende tarieven', description: 'Ga van tarieven van 12-15% naar tarieven vanaf 4.9%' }, { icon: 'LineChart', title: 'Snelle terugbetaling', description: 'Kom uit de schulden dankzij een gestructureerd terugbetalingsplan' }, { icon: 'CheckCircle', title: 'Vereenvoudiging', description: 'Consolideer al uw creditcards in één enkele lening' }, { icon: 'ShieldCheck', title: 'Totale transparantie', description: 'Geen verborgen kosten, u weet precies wat u betaalt' }] },
      process: { title: 'Hoe te werk gaan?', steps: [{ number: 1, title: 'Evalueer uw schulden', description: 'Lijst al uw creditcards en hun huidige saldi op' }, { number: 2, title: 'Ontvang een aanbieding', description: 'We berekenen het totale bedrag en bieden u een concurrerend tarief' }, { number: 3, title: 'Consolideer uw schulden', description: 'We betalen al uw creditcards af' }, { number: 4, title: 'Betaal één enkele betaling', description: 'Betaal uw nieuwe lening terug met verlaagde rente' }] },
      faq: { title: 'Veelgestelde vragen', items: [{ question: 'Hoeveel kan ik besparen?', answer: 'Gemiddeld besparen onze klanten tussen 60% en 70% op rente door over te stappen van een creditcardtarief naar ons persoonlijk leningtarief.' }, { question: 'Wat gebeurt er met mijn kaarten?', answer: 'Na herfinanciering zijn uw kaarten betaald. U kunt kiezen om ze te sluiten of ze zonder saldo te behouden.' }, { question: 'Kan ik meerdere kaarten opnemen?', answer: 'Ja, u kunt zoveel creditcards als nodig consolideren.' }, { question: 'Is er een minimumbedrag?', answer: 'Het minimumbedrag is over het algemeen CHF 5,000 voor creditcardherfinanciering.' }] },
      cta: { title: 'Bevrijd uzelf van hoge tarieven', description: 'Bereken uw potentiële besparingen door uw creditcards te consolideren', button: 'Mijn besparingen bereknen' }
    }
  }
};

export function getLoanContent(lang: Language, slug: LoanSlug): LoanContent | null {
  return loanPages[lang][slug] || null;
}

export function getAllLoanSlugs(): LoanSlug[] {
  return ['personal-credit', 'loan-refinancing', 'lease-refinancing', 'credit-card-refinancing'];
}
