import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';
import { getIndividualLoans } from '@/lib/loan-catalog';

export default function IndividualLoanShowcase() {
  const t = useTranslations();
  const individualLoans = getIndividualLoans(t);

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-14 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {t.individualLoans.title}
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground">
            {t.individualLoans.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {individualLoans.map((loan, index) => {
            const Icon = loan.icon;
            return (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className={`${loan.bgColor} p-3 rounded-lg w-fit mb-4`}>
                  <Icon className={`w-8 h-8 ${loan.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-2">{loan.title}</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  {loan.description}
                </p>
                <div className="space-y-2 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t.individualLoans.amount}:
                    </span>
                    <span className="font-semibold">{loan.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t.individualLoans.rate}:
                    </span>
                    <span className="font-semibold">{loan.rate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t.individualLoans.duration}:
                    </span>
                    <span className="font-semibold">{loan.duration}</span>
                  </div>
                </div>
                <Button className="w-full gap-2" asChild>
                  <Link href="/loan-request">
                    {t.hero.cta1}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground mb-4">
            {t.individualLoans.rateDisclaimer}
          </p>
          <Button variant="outline" size="lg" asChild>
            <Link href="/products">
              {t.individualLoans.compareLoans}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
