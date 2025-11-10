import { useTranslations } from '@/lib/i18n';
import { TrendingUp, Award, Users, Building2 } from 'lucide-react';
import bnpParibasLogo from '@assets/bank_logos/bnp-paribas.svg';
import hsbcLogo from '@assets/bank_logos/hsbc.svg';
import santanderLogo from '@assets/bank_logos/santander.svg';
import sgLogo from '@assets/stock_images/société_générale_ban_1d3e336c.jpg';
import caLogo from '@assets/stock_images/crédit_agricole_bank_4465334a.jpg';
import ingLogo from '@assets/stock_images/ing_bank_official_lo_ebb97638.jpg';
import dbLogo from '@assets/stock_images/deutsche_bank_offici_74c8fc1e.jpg';
import csLogo from '@assets/stock_images/credit_suisse_bank_o_47993df2.jpg';

export default function PartnersSection() {
  const t = useTranslations();

  const partnerLogos = [
    { name: 'BNP Paribas', logo: bnpParibasLogo },
    { name: 'Société Générale', logo: sgLogo },
    { name: 'Crédit Agricole', logo: caLogo },
    { name: 'HSBC', logo: hsbcLogo },
    { name: 'ING', logo: ingLogo },
    { name: 'Deutsche Bank', logo: dbLogo },
    { name: 'Santander', logo: santanderLogo },
    { name: 'Credit Suisse', logo: csLogo },
  ];

  const trustIndicators = [
    {
      icon: Building2,
      value: '50+',
      label: t.partners.banksNetwork,
    },
    {
      icon: TrendingUp,
      value: '€2.5B+',
      label: t.partners.loansFunded,
    },
    {
      icon: Award,
      value: '25+',
      label: t.partners.yearsExperience,
    },
    {
      icon: Users,
      value: '98%',
      label: t.partners.satisfactionRate,
    },
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4" data-testid="text-partners-title">
            {t.partners.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-partners-subtitle">
            {t.partners.subtitle}
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {trustIndicators.map((indicator, index) => (
            <div
              key={index}
              className="text-center p-6 bg-card rounded-md"
              data-testid={`card-indicator-${index}`}
            >
              <indicator.icon className="w-10 h-10 mx-auto mb-3 text-primary" />
              <div className="text-3xl font-bold mb-1" data-testid={`text-indicator-value-${index}`}>
                {indicator.value}
              </div>
              <div className="text-sm text-muted-foreground" data-testid={`text-indicator-label-${index}`}>
                {indicator.label}
              </div>
            </div>
          ))}
        </div>

        {/* Partner Logos Grid */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-center mb-8" data-testid="text-partners-network">
            {t.partners.networkTitle}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {partnerLogos.map((partner, index) => (
              <div
                key={index}
                className="flex items-center justify-center p-6 bg-white dark:bg-card rounded-md hover-elevate active-elevate-2 transition-all border border-border"
                data-testid={`card-partner-${index}`}
              >
                <img 
                  src={partner.logo} 
                  alt={partner.name}
                  className="w-full h-12 object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                  data-testid={`img-partner-logo-${index}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Key Benefits */}
        <div className="grid md:grid-cols-3 gap-6">
          {t.partners.benefits.map((benefit: string, index: number) => (
            <div
              key={index}
              className="p-6 bg-card rounded-md text-center"
              data-testid={`card-benefit-${index}`}
            >
              <p className="text-sm" data-testid={`text-benefit-${index}`}>
                {benefit}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
