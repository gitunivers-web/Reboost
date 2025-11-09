import { Card } from '@/components/ui/card';
import { Shield, FileCheck, Building, Users, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';

export default function GuaranteesSection() {
  const t = useTranslations();

  const guarantees = [
    {
      icon: Shield,
      title: t.guaranteesSection.organizationalTitle,
      items: t.guaranteesSection.organizationalItems
    },
    {
      icon: Building,
      title: t.guaranteesSection.realTitle,
      items: t.guaranteesSection.realItems
    },
    {
      icon: FileCheck,
      title: t.guaranteesSection.personalTitle,
      items: t.guaranteesSection.personalItems
    },
    {
      icon: Users,
      title: t.guaranteesSection.insuranceTitle,
      items: t.guaranteesSection.insuranceItems
    }
  ];

  const taxBenefits = [
    {
      title: t.guaranteesSection.taxBenefit1Title,
      description: t.guaranteesSection.taxBenefit1Description
    },
    {
      title: t.guaranteesSection.taxBenefit2Title,
      description: t.guaranteesSection.taxBenefit2Description
    },
    {
      title: t.guaranteesSection.taxBenefit3Title,
      description: t.guaranteesSection.taxBenefit3Description
    },
    {
      title: t.guaranteesSection.taxBenefit4Title,
      description: t.guaranteesSection.taxBenefit4Description
    }
  ];

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-14 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {t.guaranteesSection.title}
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground">
            {t.guaranteesSection.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-12 sm:mb-14 md:mb-16">
          {guarantees.map((guarantee, index) => {
            const Icon = guarantee.icon;
            return (
              <Card key={index} className="p-6" data-testid={`card-guarantee-${index}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-base sm:text-lg">{guarantee.title}</h3>
                </div>
                <ul className="space-y-2">
                  {guarantee.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>

        <div className="max-w-5xl mx-auto">
          <Card className="p-6 sm:p-8 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="flex items-center gap-3 mb-5 sm:mb-6">
              <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              <h3 className="text-2xl sm:text-3xl font-bold">{t.guaranteesSection.taxBenefitsTitle}</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {taxBenefits.map((benefit, index) => (
                <div key={index} className="flex gap-4">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold mb-2">{benefit.title}</h4>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {t.guaranteesSection.taxAdvice}
              </p>
            </div>
          </Card>
        </div>

        <div className="mt-10 sm:mt-12 max-w-4xl mx-auto">
          <Card className="p-6 sm:p-8 border-2 border-primary/20">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 text-center">{t.guaranteesSection.contributionTitle}</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">{t.guaranteesSection.equipmentPercentage}</div>
                <div className="text-sm font-semibold mb-1">{t.guaranteesSection.equipmentLabel}</div>
                <div className="text-xs text-muted-foreground">{t.guaranteesSection.equipmentDescription}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">{t.guaranteesSection.creationPercentage}</div>
                <div className="text-sm font-semibold mb-1">{t.guaranteesSection.creationLabel}</div>
                <div className="text-xs text-muted-foreground">{t.guaranteesSection.creationDescription}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">{t.guaranteesSection.realEstatePercentage}</div>
                <div className="text-sm font-semibold mb-1">{t.guaranteesSection.realEstateLabel}</div>
                <div className="text-xs text-muted-foreground">{t.guaranteesSection.realEstateDescription}</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center mt-6">
              {t.guaranteesSection.contributionDisclaimer}
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
