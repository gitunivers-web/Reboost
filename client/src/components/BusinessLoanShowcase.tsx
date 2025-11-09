import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';
import { getBusinessLoans } from '@/lib/loan-catalog';

export default function BusinessLoanShowcase() {
  const t = useTranslations();
  const businessLoans = getBusinessLoans(t);

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-14 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {t.businessLoans.title}
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground">
            {t.businessLoans.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {businessLoans.map((loan, index) => {
            const Icon = loan.icon;
            const features = loan.featuresKey ? (t.businessLoans as any)[loan.featuresKey] : [];
            
            return (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                data-testid={`card-business-loan-${index}`}
              >
                <div className={`${loan.bgColor} p-3 rounded-lg w-fit mb-4`}>
                  <Icon className={`w-8 h-8 ${loan.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-2">{loan.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {loan.description}
                </p>
                
                <div className="space-y-2 mb-4 text-sm pb-4 border-b">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.businessLoans.amount}:</span>
                    <span className="font-semibold">{loan.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.businessLoans.rate}:</span>
                    <span className="font-semibold">{loan.rate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.businessLoans.duration}:</span>
                    <span className="font-semibold">{loan.duration}</span>
                  </div>
                </div>

                {features && features.length > 0 && (
                  <ul className="space-y-2 mb-6">
                    {features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-center text-xs text-muted-foreground">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}

                <Button className="w-full gap-2" asChild>
                  <Link href="/loan-request">
                    {t.businessLoans.learnMore}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 sm:mt-14 md:mt-16 max-w-4xl mx-auto">
          <Card className="p-6 sm:p-8 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-4">{t.businessLoans.advantagesTitle}</h3>
                <ul className="space-y-3 text-sm">
                  {t.businessLoans.advantages.map((advantage: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2"></span>
                      <span>{advantage}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-4">{t.businessLoans.eligibilityTitle}</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {t.businessLoans.eligibility.map((criterion: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full mt-2"></span>
                      <span>{criterion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground mb-4">
            {t.businessLoans.rateDisclaimer}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/loan-request" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto" data-testid="button-simulate-business-loan">
                {t.businessLoans.simulateLoan}
              </Button>
            </Link>
            <Link href="/contact" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto" data-testid="button-contact-advisor">
                {t.businessLoans.contactAdvisor}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
