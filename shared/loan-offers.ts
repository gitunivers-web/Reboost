import { Wallet, Home, Car, GraduationCap, Leaf, Hammer, Building2, TrendingUp, Wrench, Factory, CreditCard, Truck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type LoanOfferType = 'individual' | 'business';

export interface LoanOffer {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  amount: string;
  rate: string;
  duration: string;
  accountType: LoanOfferType;
  features?: string[];
  color: string;
  bgColor: string;
}

export const individualLoanOffers: LoanOffer[] = [
  {
    id: 'personal-loan',
    icon: Wallet,
    title: 'Prêt Personnel',
    description: 'Financement flexible pour tous vos projets personnels',
    amount: '1 000€ - 75 000€',
    rate: '0,10% - 7%',
    duration: '12 - 84 mois',
    accountType: 'individual',
    features: ['Réponse rapide', 'Sans justificatif d\'utilisation', 'Remboursement flexible'],
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
  },
  {
    id: 'mortgage-loan',
    icon: Home,
    title: 'Prêt Immobilier',
    description: 'Financez l\'achat de votre résidence principale ou secondaire',
    amount: '50 000€ - 500 000€',
    rate: '2,5% - 4,5%',
    duration: '15 - 30 ans',
    accountType: 'individual',
    features: ['Taux fixe ou variable', 'Jusqu\'à 80% du montant', 'Assurance incluse'],
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
  },
  {
    id: 'auto-loan',
    icon: Car,
    title: 'Crédit Auto',
    description: 'Achetez votre véhicule neuf ou d\'occasion',
    amount: '5 000€ - 75 000€',
    rate: '1,9% - 5,5%',
    duration: '24 - 84 mois',
    accountType: 'individual',
    features: ['Déblocage rapide', 'Possibilité de remboursement anticipé', 'Assurance optionnelle'],
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
  },
  {
    id: 'student-loan',
    icon: GraduationCap,
    title: 'Prêt Étudiant',
    description: 'Financez vos études avec des conditions avantageuses',
    amount: '1 000€ - 50 000€',
    rate: '0,9% - 3,5%',
    duration: '24 - 120 mois',
    accountType: 'individual',
    features: ['Différé de remboursement', 'Taux préférentiels', 'Sans caution parentale possible'],
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
  },
  {
    id: 'green-loan',
    icon: Leaf,
    title: 'Prêt Vert',
    description: 'Financez vos projets de rénovation énergétique',
    amount: '3 000€ - 75 000€',
    rate: '0,5% - 4,0%',
    duration: '12 - 180 mois',
    accountType: 'individual',
    features: ['Taux réduit', 'Éligible aux aides d\'État', 'Financement éco-responsable'],
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
  },
  {
    id: 'renovation-loan',
    icon: Hammer,
    title: 'Prêt Travaux',
    description: 'Rénovez et améliorez votre logement',
    amount: '3 000€ - 75 000€',
    rate: '1,5% - 6,0%',
    duration: '12 - 120 mois',
    accountType: 'individual',
    features: ['Sans hypothèque jusqu\'à 75k€', 'Déblocage progressif possible', 'Déduction fiscale possible'],
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
  },
];

export const businessLoanOffers: LoanOffer[] = [
  {
    id: 'business-loan',
    icon: Building2,
    title: 'Prêt Professionnel',
    description: 'Financement pour vos projets d\'entreprise, développement et trésorerie',
    amount: '10 000€ - 500 000€',
    rate: '3,5% - 8,5%',
    duration: '12 - 84 mois',
    accountType: 'business',
    features: ['Réponse sous 48h', 'Taux fixe', 'Remboursement flexible'],
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
  },
  {
    id: 'cash-flow-credit',
    icon: TrendingUp,
    title: 'Crédit de Trésorerie',
    description: 'Solution rapide pour gérer vos besoins en fonds de roulement',
    amount: '5 000€ - 150 000€',
    rate: '4,0% - 9,0%',
    duration: '3 - 36 mois',
    accountType: 'business',
    features: ['Déblocage rapide', 'Sans garantie jusqu\'à 50k€', 'Flexible'],
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
  },
  {
    id: 'equipment-financing',
    icon: Wrench,
    title: 'Financement Équipement',
    description: 'Achetez vos équipements professionnels et matériels',
    amount: '20 000€ - 300 000€',
    rate: '3,9% - 7,5%',
    duration: '24 - 60 mois',
    accountType: 'business',
    features: ['Jusqu\'à 100% du montant', 'Option leasing', 'Déduction fiscale'],
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
  },
  {
    id: 'commercial-property-loan',
    icon: Factory,
    title: 'Prêt Immobilier Pro',
    description: 'Acquérez vos locaux, bureaux ou entrepôts professionnels',
    amount: '50 000€ - 2 000 000€',
    rate: '2,9% - 5,5%',
    duration: '5 - 25 ans',
    accountType: 'business',
    features: ['Durée longue', 'Apport à partir de 20%', 'Taux compétitif'],
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
  },
  {
    id: 'line-of-credit',
    icon: CreditCard,
    title: 'Ligne de Crédit',
    description: 'Crédit renouvelable pour vos besoins ponctuels',
    amount: '5 000€ - 100 000€',
    rate: '5,0% - 9,5%',
    duration: 'Renouvelable',
    accountType: 'business',
    features: ['Disponible 24/7', 'Remboursement libre', 'Renouvellement auto'],
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50 dark:bg-cyan-950/20',
  },
  {
    id: 'vehicle-fleet-loan',
    icon: Truck,
    title: 'Crédit Véhicule Pro',
    description: 'Financez votre flotte automobile ou véhicules utilitaires',
    amount: '10 000€ - 200 000€',
    rate: '3,2% - 6,5%',
    duration: '24 - 72 mois',
    accountType: 'business',
    features: ['LOA ou crédit classique', 'Option rachat', 'Assurance incluse'],
    color: 'text-rose-600',
    bgColor: 'bg-rose-50 dark:bg-rose-950/20',
  },
];

export const allLoanOffers: LoanOffer[] = [...individualLoanOffers, ...businessLoanOffers];

export function getLoanOffersByAccountType(accountType: LoanOfferType): LoanOffer[] {
  return accountType === 'individual' ? individualLoanOffers : businessLoanOffers;
}

export function getLoanOfferById(id: string): LoanOffer | undefined {
  return allLoanOffers.find(offer => offer.id === id);
}
