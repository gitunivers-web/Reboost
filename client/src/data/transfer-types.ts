export type TransferNetwork = 'SEPA' | 'SWIFT' | 'LOCAL' | 'ACH' | 'WIRE' | 'FASTER_PAYMENTS' | 'INTERAC';

export interface TransferType {
  network: TransferNetwork;
  name: string;
  description: string;
  processingTime: string;
  fees: {
    type: 'fixed' | 'percentage' | 'both';
    fixedAmount?: number;
    percentage?: number;
    minFee?: number;
    maxFee?: number;
    currency: string;
  };
  limits: {
    minAmount: number;
    maxAmount: number;
    currency: string;
  };
  requiredFields: string[];
  supportedCurrencies: string[];
}

export interface CountryBankingInfo {
  countryCode: string;
  countryName: string;
  region: 'SEPA' | 'SWIFT_ONLY' | 'US_DOMESTIC' | 'UK_DOMESTIC' | 'APAC' | 'LATAM' | 'MENA' | 'AFRICA';
  primaryCurrency: string;
  supportedNetworks: TransferNetwork[];
  usesIBAN: boolean;
  ibanFormat?: string;
  ibanLength?: number;
  localAccountFormat?: {
    name: string;
    format: string;
    description: string;
  };
  swiftRequired: boolean;
  additionalInfo?: string;
}

export const SEPA_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 
  'DE', 'GR', 'HU', 'IS', 'IE', 'IT', 'LV', 'LI', 'LT', 'LU',
  'MT', 'MC', 'NL', 'NO', 'PL', 'PT', 'RO', 'SM', 'SK', 'SI',
  'ES', 'SE', 'CH', 'GB', 'VA', 'AD', 'GI', 'JE', 'GG', 'IM'
];

export const IBAN_COUNTRIES = [
  ...SEPA_COUNTRIES,
  'AE', 'SA', 'QA', 'KW', 'BH', 'JO', 'LB', 'IL', 'TR',
  'TN', 'MA', 'MU', 'GA', 'CI', 'SN', 'MG', 'CM',
  'BR', 'CR', 'GT', 'DO', 'TL', 'PS', 'IQ', 'KZ', 'AZ', 'GE', 'MD', 'UA', 'BY'
];

export const COUNTRY_BANKING_INFO: CountryBankingInfo[] = [
  { countryCode: 'FR', countryName: 'France', region: 'SEPA', primaryCurrency: 'EUR', supportedNetworks: ['SEPA', 'SWIFT'], usesIBAN: true, ibanFormat: 'FR\\d{25}', ibanLength: 27, swiftRequired: false },
  { countryCode: 'DE', countryName: 'République fédérale d\'Allemagne', region: 'SEPA', primaryCurrency: 'EUR', supportedNetworks: ['SEPA', 'SWIFT'], usesIBAN: true, ibanFormat: 'DE\\d{20}', ibanLength: 22, swiftRequired: false },
  { countryCode: 'ES', countryName: 'Royaume d\'Espagne', region: 'SEPA', primaryCurrency: 'EUR', supportedNetworks: ['SEPA', 'SWIFT'], usesIBAN: true, ibanFormat: 'ES\\d{22}', ibanLength: 24, swiftRequired: false },
  { countryCode: 'IT', countryName: 'République italienne', region: 'SEPA', primaryCurrency: 'EUR', supportedNetworks: ['SEPA', 'SWIFT'], usesIBAN: true, ibanFormat: 'IT\\d{25}', ibanLength: 27, swiftRequired: false },
  { countryCode: 'BE', countryName: 'Royaume de Belgique', region: 'SEPA', primaryCurrency: 'EUR', supportedNetworks: ['SEPA', 'SWIFT'], usesIBAN: true, ibanFormat: 'BE\\d{14}', ibanLength: 16, swiftRequired: false },
  { countryCode: 'NL', countryName: 'Royaume des Pays-Bas', region: 'SEPA', primaryCurrency: 'EUR', supportedNetworks: ['SEPA', 'SWIFT'], usesIBAN: true, ibanFormat: 'NL\\d{16}', ibanLength: 18, swiftRequired: false },
  { countryCode: 'LU', countryName: 'Luxembourg', region: 'SEPA', primaryCurrency: 'EUR', supportedNetworks: ['SEPA', 'SWIFT'], usesIBAN: true, ibanFormat: 'LU\\d{18}', ibanLength: 20, swiftRequired: false },
  { countryCode: 'AT', countryName: 'République d\'Autriche', region: 'SEPA', primaryCurrency: 'EUR', supportedNetworks: ['SEPA', 'SWIFT'], usesIBAN: true, ibanFormat: 'AT\\d{18}', ibanLength: 20, swiftRequired: false },
  { countryCode: 'PT', countryName: 'Portugal', region: 'SEPA', primaryCurrency: 'EUR', supportedNetworks: ['SEPA', 'SWIFT'], usesIBAN: true, ibanFormat: 'PT\\d{23}', ibanLength: 25, swiftRequired: false },
  { countryCode: 'GR', countryName: 'République hellénique', region: 'SEPA', primaryCurrency: 'EUR', supportedNetworks: ['SEPA', 'SWIFT'], usesIBAN: true, ibanFormat: 'GR\\d{25}', ibanLength: 27, swiftRequired: false },
  { countryCode: 'IE', countryName: 'République d\'Irlande', region: 'SEPA', primaryCurrency: 'EUR', supportedNetworks: ['SEPA', 'SWIFT'], usesIBAN: true, ibanFormat: 'IE\\d{20}', ibanLength: 22, swiftRequired: false },
  { countryCode: 'FI', countryName: 'République de Finlande', region: 'SEPA', primaryCurrency: 'EUR', supportedNetworks: ['SEPA', 'SWIFT'], usesIBAN: true, ibanFormat: 'FI\\d{16}', ibanLength: 18, swiftRequired: false },
  { countryCode: 'SK', countryName: 'République slovaque', region: 'SEPA', primaryCurrency: 'EUR', supportedNetworks: ['SEPA', 'SWIFT'], usesIBAN: true, ibanFormat: 'SK\\d{22}', ibanLength: 24, swiftRequired: false },
  { countryCode: 'SI', countryName: 'République de Slovénie', region: 'SEPA', primaryCurrency: 'EUR', supportedNetworks: ['SEPA', 'SWIFT'], usesIBAN: true, ibanFormat: 'SI\\d{17}', ibanLength: 19, swiftRequired: false },
  { countryCode: 'EE', countryName: 'République d\'Estonie', region: 'SEPA', primaryCurrency: 'EUR', supportedNetworks: ['SEPA', 'SWIFT'], usesIBAN: true, ibanFormat: 'EE\\d{18}', ibanLength: 20, swiftRequired: false },
  { countryCode: 'LV', countryName: 'République de Lettonie', region: 'SEPA', primaryCurrency: 'EUR', supportedNetworks: ['SEPA', 'SWIFT'], usesIBAN: true, ibanFormat: 'LV\\d{19}', ibanLength: 21, swiftRequired: false },
  { countryCode: 'LT', countryName: 'République de Lituanie', region: 'SEPA', primaryCurrency: 'EUR', supportedNetworks: ['SEPA', 'SWIFT'], usesIBAN: true, ibanFormat: 'LT\\d{18}', ibanLength: 20, swiftRequired: false },
  { countryCode: 'MT', countryName: 'République de Malte', region: 'SEPA', primaryCurrency: 'EUR', supportedNetworks: ['SEPA', 'SWIFT'], usesIBAN: true, ibanFormat: 'MT\\d{29}', ibanLength: 31, swiftRequired: false },
  { countryCode: 'CY', countryName: 'République de Chypre', region: 'SEPA', primaryCurrency: 'EUR', supportedNetworks: ['SEPA', 'SWIFT'], usesIBAN: true, ibanFormat: 'CY\\d{26}', ibanLength: 28, swiftRequired: false },
  { countryCode: 'MC', countryName: 'Principauté de Monaco', region: 'SEPA', primaryCurrency: 'EUR', supportedNetworks: ['SEPA', 'SWIFT'], usesIBAN: true, ibanFormat: 'MC\\d{25}', ibanLength: 27, swiftRequired: false },
  { countryCode: 'SM', countryName: 'République de Saint-Marin', region: 'SEPA', primaryCurrency: 'EUR', supportedNetworks: ['SEPA', 'SWIFT'], usesIBAN: true, ibanFormat: 'SM\\d{25}', ibanLength: 27, swiftRequired: false },
  { countryCode: 'VA', countryName: 'État de la Cité du Vatican', region: 'SEPA', primaryCurrency: 'EUR', supportedNetworks: ['SEPA', 'SWIFT'], usesIBAN: true, ibanFormat: 'VA\\d{20}', ibanLength: 22, swiftRequired: false },
  { countryCode: 'AD', countryName: 'Principauté d\'Andorre', region: 'SEPA', primaryCurrency: 'EUR', supportedNetworks: ['SEPA', 'SWIFT'], usesIBAN: true, ibanFormat: 'AD\\d{22}', ibanLength: 24, swiftRequired: false },
  
  { countryCode: 'CH', countryName: 'Confédération suisse', region: 'SEPA', primaryCurrency: 'CHF', supportedNetworks: ['SEPA', 'SWIFT'], usesIBAN: true, ibanFormat: 'CH\\d{19}', ibanLength: 21, swiftRequired: false },
  { countryCode: 'LI', countryName: 'Principauté de Liechtenstein', region: 'SEPA', primaryCurrency: 'CHF', supportedNetworks: ['SEPA', 'SWIFT'], usesIBAN: true, ibanFormat: 'LI\\d{19}', ibanLength: 21, swiftRequired: false },
  { countryCode: 'GB', countryName: 'Royaume-Uni de Grande-Bretagne', region: 'UK_DOMESTIC', primaryCurrency: 'GBP', supportedNetworks: ['SEPA', 'SWIFT', 'FASTER_PAYMENTS'], usesIBAN: true, ibanFormat: 'GB\\d{20}', ibanLength: 22, swiftRequired: false, localAccountFormat: { name: 'Sort Code + Account', format: '\\d{6}-\\d{8}', description: 'Code guichet (6 chiffres) + Numero de compte (8 chiffres)' } },
  { countryCode: 'SE', countryName: 'Royaume de Suède', region: 'SEPA', primaryCurrency: 'SEK', supportedNetworks: ['SEPA', 'SWIFT'], usesIBAN: true, ibanFormat: 'SE\\d{22}', ibanLength: 24, swiftRequired: false },
  { countryCode: 'DK', countryName: 'Royaume du Danemark', region: 'SEPA', primaryCurrency: 'DKK', supportedNetworks: ['SEPA', 'SWIFT'], usesIBAN: true, ibanFormat: 'DK\\d{16}', ibanLength: 18, swiftRequired: false },
  { countryCode: 'NO', countryName: 'Royaume de Norvège', region: 'SEPA', primaryCurrency: 'NOK', supportedNetworks: ['SEPA', 'SWIFT'], usesIBAN: true, ibanFormat: 'NO\\d{13}', ibanLength: 15, swiftRequired: false },
  { countryCode: 'IS', countryName: 'République d\'Islande', region: 'SEPA', primaryCurrency: 'ISK', supportedNetworks: ['SEPA', 'SWIFT'], usesIBAN: true, ibanFormat: 'IS\\d{24}', ibanLength: 26, swiftRequired: false },
  
  { countryCode: 'PL', countryName: 'République de Pologne', region: 'SEPA', primaryCurrency: 'PLN', supportedNetworks: ['SEPA', 'SWIFT'], usesIBAN: true, ibanFormat: 'PL\\d{26}', ibanLength: 28, swiftRequired: false },
  { countryCode: 'CZ', countryName: 'République tchèque', region: 'SEPA', primaryCurrency: 'CZK', supportedNetworks: ['SEPA', 'SWIFT'], usesIBAN: true, ibanFormat: 'CZ\\d{22}', ibanLength: 24, swiftRequired: false },
  { countryCode: 'HU', countryName: 'Hongrie', region: 'SEPA', primaryCurrency: 'HUF', supportedNetworks: ['SEPA', 'SWIFT'], usesIBAN: true, ibanFormat: 'HU\\d{26}', ibanLength: 28, swiftRequired: false },
  { countryCode: 'RO', countryName: 'Roumanie', region: 'SEPA', primaryCurrency: 'RON', supportedNetworks: ['SEPA', 'SWIFT'], usesIBAN: true, ibanFormat: 'RO\\d{22}', ibanLength: 24, swiftRequired: false },
  { countryCode: 'BG', countryName: 'République de Bulgarie', region: 'SEPA', primaryCurrency: 'BGN', supportedNetworks: ['SEPA', 'SWIFT'], usesIBAN: true, ibanFormat: 'BG\\d{20}', ibanLength: 22, swiftRequired: false },
  { countryCode: 'HR', countryName: 'République de Croatie', region: 'SEPA', primaryCurrency: 'EUR', supportedNetworks: ['SEPA', 'SWIFT'], usesIBAN: true, ibanFormat: 'HR\\d{19}', ibanLength: 21, swiftRequired: false },
  
  { countryCode: 'US', countryName: 'États-Unis d\'Amérique', region: 'US_DOMESTIC', primaryCurrency: 'USD', supportedNetworks: ['SWIFT', 'ACH', 'WIRE'], usesIBAN: false, swiftRequired: true, localAccountFormat: { name: 'Routing + Account', format: '\\d{9}-\\d{10,17}', description: 'ABA Routing Number (9 chiffres) + Numero de compte (10-17 chiffres)' }, additionalInfo: 'Les transferts domestiques utilisent ACH (lent) ou Wire (rapide). International via SWIFT.' },
  { countryCode: 'PR', countryName: 'Porto Rico', region: 'US_DOMESTIC', primaryCurrency: 'USD', supportedNetworks: ['SWIFT', 'ACH', 'WIRE'], usesIBAN: false, swiftRequired: true, localAccountFormat: { name: 'Routing + Account', format: '\\d{9}-\\d{10,17}', description: 'ABA Routing Number (9 chiffres) + Numero de compte (10-17 chiffres)' }, additionalInfo: 'Territoire americain - utilise le systeme bancaire US (ACH/Fedwire).' },
  { countryCode: 'VI', countryName: 'Iles Vierges americaines', region: 'US_DOMESTIC', primaryCurrency: 'USD', supportedNetworks: ['SWIFT', 'ACH', 'WIRE'], usesIBAN: false, swiftRequired: true, localAccountFormat: { name: 'Routing + Account', format: '\\d{9}-\\d{10,17}', description: 'ABA Routing Number (9 chiffres) + Numero de compte' } },
  { countryCode: 'GU', countryName: 'Guam', region: 'US_DOMESTIC', primaryCurrency: 'USD', supportedNetworks: ['SWIFT', 'ACH', 'WIRE'], usesIBAN: false, swiftRequired: true, localAccountFormat: { name: 'Routing + Account', format: '\\d{9}-\\d{10,17}', description: 'ABA Routing Number + Numero de compte' } },
  { countryCode: 'AS', countryName: 'Samoa americaines', region: 'US_DOMESTIC', primaryCurrency: 'USD', supportedNetworks: ['SWIFT', 'ACH', 'WIRE'], usesIBAN: false, swiftRequired: true },
  
  { countryCode: 'CA', countryName: 'Canada', region: 'SWIFT_ONLY', primaryCurrency: 'CAD', supportedNetworks: ['SWIFT', 'INTERAC'], usesIBAN: false, swiftRequired: true, localAccountFormat: { name: 'Transit + Account', format: '\\d{5}-\\d{3}-\\d{7,12}', description: 'Transit Number (5 chiffres) + Institution (3 chiffres) + Compte (7-12 chiffres)' } },
  
  { countryCode: 'JP', countryName: 'Japon', region: 'APAC', primaryCurrency: 'JPY', supportedNetworks: ['SWIFT'], usesIBAN: false, swiftRequired: true, localAccountFormat: { name: 'Zengin', format: '\\d{4}-\\d{3}-\\d{7}', description: 'Code banque (4 chiffres) + Agence (3 chiffres) + Compte (7 chiffres)' } },
  { countryCode: 'CN', countryName: 'République populaire de Chine', region: 'APAC', primaryCurrency: 'CNY', supportedNetworks: ['SWIFT'], usesIBAN: false, swiftRequired: true, additionalInfo: 'CNAPS code requis pour les transferts domestiques.' },
  { countryCode: 'HK', countryName: 'Région administrative spéciale de Hong Kong', region: 'APAC', primaryCurrency: 'HKD', supportedNetworks: ['SWIFT'], usesIBAN: false, swiftRequired: true },
  { countryCode: 'SG', countryName: 'République de Singapour', region: 'APAC', primaryCurrency: 'SGD', supportedNetworks: ['SWIFT'], usesIBAN: false, swiftRequired: true },
  { countryCode: 'AU', countryName: 'Commonwealth d\'Australie', region: 'APAC', primaryCurrency: 'AUD', supportedNetworks: ['SWIFT'], usesIBAN: false, swiftRequired: true, localAccountFormat: { name: 'BSB + Account', format: '\\d{6}-\\d{6,10}', description: 'BSB (6 chiffres) + Numero de compte (6-10 chiffres)' } },
  { countryCode: 'NZ', countryName: 'Nouvelle-Zélande', region: 'APAC', primaryCurrency: 'NZD', supportedNetworks: ['SWIFT'], usesIBAN: false, swiftRequired: true },
  { countryCode: 'KR', countryName: 'Coree du Sud', region: 'APAC', primaryCurrency: 'KRW', supportedNetworks: ['SWIFT'], usesIBAN: false, swiftRequired: true },
  { countryCode: 'IN', countryName: 'République de l\'Inde', region: 'APAC', primaryCurrency: 'INR', supportedNetworks: ['SWIFT'], usesIBAN: false, swiftRequired: true, localAccountFormat: { name: 'IFSC + Account', format: '[A-Z]{4}0[A-Z0-9]{6}-\\d{9,18}', description: 'Code IFSC (11 caracteres) + Numero de compte' } },
  { countryCode: 'TH', countryName: 'Thailande', region: 'APAC', primaryCurrency: 'THB', supportedNetworks: ['SWIFT'], usesIBAN: false, swiftRequired: true },
  { countryCode: 'MY', countryName: 'Malaisie', region: 'APAC', primaryCurrency: 'MYR', supportedNetworks: ['SWIFT'], usesIBAN: false, swiftRequired: true },
  { countryCode: 'ID', countryName: 'Indonesie', region: 'APAC', primaryCurrency: 'IDR', supportedNetworks: ['SWIFT'], usesIBAN: false, swiftRequired: true },
  { countryCode: 'PH', countryName: 'Philippines', region: 'APAC', primaryCurrency: 'PHP', supportedNetworks: ['SWIFT'], usesIBAN: false, swiftRequired: true },
  { countryCode: 'VN', countryName: 'Vietnam', region: 'APAC', primaryCurrency: 'VND', supportedNetworks: ['SWIFT'], usesIBAN: false, swiftRequired: true },
  { countryCode: 'TW', countryName: 'Taiwan', region: 'APAC', primaryCurrency: 'TWD', supportedNetworks: ['SWIFT'], usesIBAN: false, swiftRequired: true },
  
  { countryCode: 'MX', countryName: 'États-Unis mexicains', region: 'LATAM', primaryCurrency: 'MXN', supportedNetworks: ['SWIFT'], usesIBAN: false, swiftRequired: true, localAccountFormat: { name: 'CLABE', format: '\\d{18}', description: 'CLABE (18 chiffres) - Clave Bancaria Estandarizada' } },
  { countryCode: 'BR', countryName: 'République fédérative du Brésil', region: 'LATAM', primaryCurrency: 'BRL', supportedNetworks: ['SWIFT'], usesIBAN: false, swiftRequired: true, additionalInfo: 'CPF/CNPJ requis pour les beneficiaires.' },
  { countryCode: 'AR', countryName: 'République argentine', region: 'LATAM', primaryCurrency: 'ARS', supportedNetworks: ['SWIFT'], usesIBAN: false, swiftRequired: true, localAccountFormat: { name: 'CBU', format: '\\d{22}', description: 'CBU (22 chiffres) - Clave Bancaria Uniforme' } },
  { countryCode: 'CL', countryName: 'République du Chili', region: 'LATAM', primaryCurrency: 'CLP', supportedNetworks: ['SWIFT'], usesIBAN: false, swiftRequired: true },
  { countryCode: 'CO', countryName: 'République de Colombie', region: 'LATAM', primaryCurrency: 'COP', supportedNetworks: ['SWIFT'], usesIBAN: false, swiftRequired: true },
  { countryCode: 'PE', countryName: 'République du Pérou', region: 'LATAM', primaryCurrency: 'PEN', supportedNetworks: ['SWIFT'], usesIBAN: false, swiftRequired: true },
  { countryCode: 'CR', countryName: 'Costa Rica', region: 'LATAM', primaryCurrency: 'CRC', supportedNetworks: ['SWIFT'], usesIBAN: true, ibanFormat: 'CR\\d{20}', ibanLength: 22, swiftRequired: true },
  { countryCode: 'PA', countryName: 'Panama', region: 'LATAM', primaryCurrency: 'USD', supportedNetworks: ['SWIFT'], usesIBAN: false, swiftRequired: true },
  { countryCode: 'DO', countryName: 'Republique Dominicaine', region: 'LATAM', primaryCurrency: 'DOP', supportedNetworks: ['SWIFT'], usesIBAN: false, swiftRequired: true },
  { countryCode: 'GT', countryName: 'Guatemala', region: 'LATAM', primaryCurrency: 'GTQ', supportedNetworks: ['SWIFT'], usesIBAN: true, ibanFormat: 'GT\\d{26}', ibanLength: 28, swiftRequired: true },
  { countryCode: 'UY', countryName: 'Uruguay', region: 'LATAM', primaryCurrency: 'UYU', supportedNetworks: ['SWIFT'], usesIBAN: false, swiftRequired: true },
  { countryCode: 'EC', countryName: 'Equateur', region: 'LATAM', primaryCurrency: 'USD', supportedNetworks: ['SWIFT'], usesIBAN: false, swiftRequired: true },
  { countryCode: 'VE', countryName: 'Venezuela', region: 'LATAM', primaryCurrency: 'VES', supportedNetworks: ['SWIFT'], usesIBAN: false, swiftRequired: true, additionalInfo: 'Restrictions possibles sur les transferts internationaux.' },
  { countryCode: 'BO', countryName: 'Bolivie', region: 'LATAM', primaryCurrency: 'BOB', supportedNetworks: ['SWIFT'], usesIBAN: false, swiftRequired: true },
  { countryCode: 'PY', countryName: 'Paraguay', region: 'LATAM', primaryCurrency: 'PYG', supportedNetworks: ['SWIFT'], usesIBAN: false, swiftRequired: true },
  
  { countryCode: 'AE', countryName: 'Émirats arabes unis', region: 'MENA', primaryCurrency: 'AED', supportedNetworks: ['SWIFT'], usesIBAN: true, ibanFormat: 'AE\\d{21}', ibanLength: 23, swiftRequired: true },
  { countryCode: 'SA', countryName: 'Royaume d\'Arabie saoudite', region: 'MENA', primaryCurrency: 'SAR', supportedNetworks: ['SWIFT'], usesIBAN: true, ibanFormat: 'SA\\d{22}', ibanLength: 24, swiftRequired: true },
  { countryCode: 'QA', countryName: 'État du Qatar', region: 'MENA', primaryCurrency: 'QAR', supportedNetworks: ['SWIFT'], usesIBAN: true, ibanFormat: 'QA\\d{27}', ibanLength: 29, swiftRequired: true },
  { countryCode: 'KW', countryName: 'État du Koweït', region: 'MENA', primaryCurrency: 'KWD', supportedNetworks: ['SWIFT'], usesIBAN: true, ibanFormat: 'KW\\d{28}', ibanLength: 30, swiftRequired: true },
  { countryCode: 'BH', countryName: 'Royaume de Bahreïn', region: 'MENA', primaryCurrency: 'BHD', supportedNetworks: ['SWIFT'], usesIBAN: true, ibanFormat: 'BH\\d{20}', ibanLength: 22, swiftRequired: true },
  { countryCode: 'OM', countryName: 'Oman', region: 'MENA', primaryCurrency: 'OMR', supportedNetworks: ['SWIFT'], usesIBAN: true, ibanFormat: 'OM\\d{21}', ibanLength: 23, swiftRequired: true },
  { countryCode: 'JO', countryName: 'Jordanie', region: 'MENA', primaryCurrency: 'JOD', supportedNetworks: ['SWIFT'], usesIBAN: true, ibanFormat: 'JO\\d{28}', ibanLength: 30, swiftRequired: true },
  { countryCode: 'LB', countryName: 'Liban', region: 'MENA', primaryCurrency: 'LBP', supportedNetworks: ['SWIFT'], usesIBAN: true, ibanFormat: 'LB\\d{26}', ibanLength: 28, swiftRequired: true },
  { countryCode: 'IL', countryName: 'État d\'Israël', region: 'MENA', primaryCurrency: 'ILS', supportedNetworks: ['SWIFT'], usesIBAN: true, ibanFormat: 'IL\\d{21}', ibanLength: 23, swiftRequired: true },
  { countryCode: 'TR', countryName: 'République de Turquie', region: 'MENA', primaryCurrency: 'TRY', supportedNetworks: ['SWIFT'], usesIBAN: true, ibanFormat: 'TR\\d{24}', ibanLength: 26, swiftRequired: true },
  { countryCode: 'EG', countryName: 'République arabe d\'Égypte', region: 'MENA', primaryCurrency: 'EGP', supportedNetworks: ['SWIFT'], usesIBAN: true, ibanFormat: 'EG\\d{27}', ibanLength: 29, swiftRequired: true },
  
  { countryCode: 'ZA', countryName: 'République d\'Afrique du Sud', region: 'AFRICA', primaryCurrency: 'ZAR', supportedNetworks: ['SWIFT'], usesIBAN: false, swiftRequired: true },
  { countryCode: 'NG', countryName: 'République fédérale du Nigeria', region: 'AFRICA', primaryCurrency: 'NGN', supportedNetworks: ['SWIFT'], usesIBAN: false, swiftRequired: true },
  { countryCode: 'KE', countryName: 'République du Kenya', region: 'AFRICA', primaryCurrency: 'KES', supportedNetworks: ['SWIFT'], usesIBAN: false, swiftRequired: true },
  { countryCode: 'GH', countryName: 'République du Ghana', region: 'AFRICA', primaryCurrency: 'GHS', supportedNetworks: ['SWIFT'], usesIBAN: false, swiftRequired: true },
  { countryCode: 'TZ', countryName: 'République-Unie de Tanzanie', region: 'AFRICA', primaryCurrency: 'TZS', supportedNetworks: ['SWIFT'], usesIBAN: false, swiftRequired: true },
  { countryCode: 'UG', countryName: 'République de l\'Ouganda', region: 'AFRICA', primaryCurrency: 'UGX', supportedNetworks: ['SWIFT'], usesIBAN: false, swiftRequired: true },
  { countryCode: 'MA', countryName: 'Royaume du Maroc', region: 'AFRICA', primaryCurrency: 'MAD', supportedNetworks: ['SWIFT'], usesIBAN: true, ibanFormat: 'MA\\d{26}', ibanLength: 28, swiftRequired: true },
  { countryCode: 'TN', countryName: 'République tunisienne', region: 'AFRICA', primaryCurrency: 'TND', supportedNetworks: ['SWIFT'], usesIBAN: true, ibanFormat: 'TN\\d{22}', ibanLength: 24, swiftRequired: true },
  { countryCode: 'SN', countryName: 'République du Sénégal', region: 'AFRICA', primaryCurrency: 'XOF', supportedNetworks: ['SWIFT'], usesIBAN: true, ibanFormat: 'SN\\d{26}', ibanLength: 28, swiftRequired: true },
  { countryCode: 'CI', countryName: 'République de Côte d\'Ivoire', region: 'AFRICA', primaryCurrency: 'XOF', supportedNetworks: ['SWIFT'], usesIBAN: true, ibanFormat: 'CI\\d{26}', ibanLength: 28, swiftRequired: true },
  { countryCode: 'CM', countryName: 'République du Cameroun', region: 'AFRICA', primaryCurrency: 'XAF', supportedNetworks: ['SWIFT'], usesIBAN: true, ibanFormat: 'CM\\d{25}', ibanLength: 27, swiftRequired: true },
  { countryCode: 'MU', countryName: 'République de Maurice', region: 'AFRICA', primaryCurrency: 'MUR', supportedNetworks: ['SWIFT'], usesIBAN: true, ibanFormat: 'MU\\d{28}', ibanLength: 30, swiftRequired: true },
  { countryCode: 'MG', countryName: 'République de Madagascar', region: 'AFRICA', primaryCurrency: 'MGA', supportedNetworks: ['SWIFT'], usesIBAN: true, ibanFormat: 'MG\\d{25}', ibanLength: 27, swiftRequired: true },
];

export const TRANSFER_TYPES: Record<TransferNetwork, TransferType> = {
  SEPA: {
    network: 'SEPA',
    name: 'SEPA Credit Transfer',
    description: 'Transfert interbancaire au sein de l\'espace SEPA européen',
    processingTime: '1 à 2 jours ouvrés',
    fees: { type: 'fixed', fixedAmount: 0, currency: 'EUR' },
    limits: { minAmount: 0.01, maxAmount: 999999999, currency: 'EUR' },
    requiredFields: ['iban', 'bic'],
    supportedCurrencies: ['EUR'],
  },
  SWIFT: {
    network: 'SWIFT',
    name: 'Transfert SWIFT International',
    description: 'Opération internationale par le réseau bancaire mondial SWIFT',
    processingTime: '2 à 5 jours ouvrés',
    fees: { type: 'both', fixedAmount: 15, percentage: 0.5, minFee: 15, maxFee: 50, currency: 'EUR' },
    limits: { minAmount: 10, maxAmount: 500000, currency: 'EUR' },
    requiredFields: ['swift_bic', 'account_number'],
    supportedCurrencies: ['EUR', 'USD', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD', 'NZD', 'SGD', 'HKD'],
  },
  ACH: {
    network: 'ACH',
    name: 'ACH Transfer',
    description: 'Transfert domestique aux États-Unis via le système de compensation automatisé',
    processingTime: '2 à 3 jours ouvrés',
    fees: { type: 'fixed', fixedAmount: 3, currency: 'USD' },
    limits: { minAmount: 1, maxAmount: 25000, currency: 'USD' },
    requiredFields: ['routing_number', 'account_number'],
    supportedCurrencies: ['USD'],
  },
  WIRE: {
    network: 'WIRE',
    name: 'Wire Transfer',
    description: 'Transfert électronique immédiat via le système Fedwire',
    processingTime: 'Jour même',
    fees: { type: 'fixed', fixedAmount: 25, currency: 'USD' },
    limits: { minAmount: 1, maxAmount: 10000000, currency: 'USD' },
    requiredFields: ['routing_number', 'account_number'],
    supportedCurrencies: ['USD'],
  },
  FASTER_PAYMENTS: {
    network: 'FASTER_PAYMENTS',
    name: 'Faster Payments',
    description: 'Virement instantane au Royaume-Uni',
    processingTime: 'Quelques secondes',
    fees: { type: 'fixed', fixedAmount: 0, currency: 'GBP' },
    limits: { minAmount: 0.01, maxAmount: 250000, currency: 'GBP' },
    requiredFields: ['sort_code', 'account_number'],
    supportedCurrencies: ['GBP'],
  },
  INTERAC: {
    network: 'INTERAC',
    name: 'Interac e-Transfer',
    description: 'Virement electronique canadien',
    processingTime: 'Quelques minutes',
    fees: { type: 'fixed', fixedAmount: 1.5, currency: 'CAD' },
    limits: { minAmount: 0.01, maxAmount: 10000, currency: 'CAD' },
    requiredFields: ['email_or_phone'],
    supportedCurrencies: ['CAD'],
  },
  LOCAL: {
    network: 'LOCAL',
    name: 'Virement Local',
    description: 'Virement domestique selon le pays',
    processingTime: 'Variable selon le pays',
    fees: { type: 'fixed', fixedAmount: 5, currency: 'EUR' },
    limits: { minAmount: 1, maxAmount: 100000, currency: 'EUR' },
    requiredFields: ['local_account_details'],
    supportedCurrencies: ['EUR', 'USD', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD'],
  },
};

export function getCountryInfo(countryCode: string): CountryBankingInfo | undefined {
  return COUNTRY_BANKING_INFO.find(c => c.countryCode === countryCode.toUpperCase());
}

export function isSEPACountry(countryCode: string): boolean {
  return SEPA_COUNTRIES.includes(countryCode.toUpperCase());
}

export function getRecommendedTransferNetwork(
  sourceCountry: string,
  destinationCountry: string,
  amount: number
): TransferNetwork {
  const source = getCountryInfo(sourceCountry);
  const destination = getCountryInfo(destinationCountry);
  
  if (!source || !destination) {
    return 'SWIFT';
  }
  
  if (source.region === 'SEPA' && destination.region === 'SEPA') {
    return 'SEPA';
  }
  
  if (source.countryCode === 'US' && destination.countryCode === 'US') {
    return amount > 10000 ? 'WIRE' : 'ACH';
  }
  
  if (source.countryCode === 'GB' && destination.countryCode === 'GB') {
    return 'FASTER_PAYMENTS';
  }
  
  if (source.countryCode === 'CA' && destination.countryCode === 'CA') {
    return 'INTERAC';
  }
  
  return 'SWIFT';
}

export function getTransferTypeInfo(network: TransferNetwork): TransferType {
  return TRANSFER_TYPES[network];
}

export function calculateTransferFees(network: TransferNetwork, amount: number): number {
  const transferType = TRANSFER_TYPES[network];
  const { fees } = transferType;
  
  let calculatedFee = 0;
  
  if (fees.type === 'fixed' && fees.fixedAmount) {
    calculatedFee = fees.fixedAmount;
  } else if (fees.type === 'percentage' && fees.percentage) {
    calculatedFee = amount * (fees.percentage / 100);
  } else if (fees.type === 'both') {
    calculatedFee = (fees.fixedAmount || 0) + (amount * ((fees.percentage || 0) / 100));
  }
  
  if (fees.minFee && calculatedFee < fees.minFee) {
    calculatedFee = fees.minFee;
  }
  if (fees.maxFee && calculatedFee > fees.maxFee) {
    calculatedFee = fees.maxFee;
  }
  
  return Math.round(calculatedFee * 100) / 100;
}

export function getRequiredFieldsForTransfer(network: TransferNetwork, countryCode: string): string[] {
  const baseFields = TRANSFER_TYPES[network].requiredFields;
  const countryInfo = getCountryInfo(countryCode);
  
  if (!countryInfo) return baseFields;
  
  if (countryInfo.usesIBAN) {
    return ['iban', 'bic', 'beneficiary_name', 'beneficiary_address'];
  }
  
  if (countryInfo.localAccountFormat) {
    return ['swift_bic', 'local_account', 'beneficiary_name', 'beneficiary_address'];
  }
  
  return [...baseFields, 'beneficiary_name', 'beneficiary_address'];
}

export function formatAccountNumber(value: string, countryCode: string): string {
  const countryInfo = getCountryInfo(countryCode);
  
  if (countryInfo?.usesIBAN) {
    const clean = value.replace(/\s+/g, '').toUpperCase();
    return clean.replace(/(.{4})/g, '$1 ').trim();
  }
  
  if (countryCode === 'US' || countryCode === 'PR') {
    const clean = value.replace(/[^0-9]/g, '');
    if (clean.length > 9) {
      return clean.slice(0, 9) + '-' + clean.slice(9);
    }
    return clean;
  }
  
  if (countryCode === 'AU') {
    const clean = value.replace(/[^0-9]/g, '');
    if (clean.length > 6) {
      return clean.slice(0, 6) + '-' + clean.slice(6);
    }
    return clean;
  }
  
  if (countryCode === 'GB') {
    const clean = value.replace(/[^0-9]/g, '');
    if (clean.length > 6) {
      return clean.slice(0, 2) + '-' + clean.slice(2, 4) + '-' + clean.slice(4, 6) + ' ' + clean.slice(6);
    }
    return clean;
  }
  
  return value.toUpperCase();
}

export function getCountriesByRegion(region: CountryBankingInfo['region']): CountryBankingInfo[] {
  return COUNTRY_BANKING_INFO.filter(c => c.region === region);
}

export function getAllCountries(): CountryBankingInfo[] {
  return COUNTRY_BANKING_INFO.sort((a, b) => a.countryName.localeCompare(b.countryName, 'fr'));
}
