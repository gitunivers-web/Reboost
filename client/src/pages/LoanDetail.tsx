import { useParams, useLocation } from 'wouter';
import { useLanguage } from '@/lib/i18n';
import { getLoanContent, LoanSlug, getAllLoanSlugs } from '@/lib/loan-pages';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Helmet } from 'react-helmet-async';
import * as LucideIcons from 'lucide-react';
import Header from '@/components/Header';
import FooterPremium from '@/components/premium/FooterPremium';
import { ChevronRight, Check } from 'lucide-react';

export default function LoanDetail() {
  const params = useParams();
  const slug = params.slug as LoanSlug;
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  
  // Validate slug
  const validSlugs = getAllLoanSlugs();
  if (!slug || !validSlugs.includes(slug)) {
    // Redirect to 404 or products page
    setLocation('/products');
    return null;
  }

  const loanContent = getLoanContent(language, slug);
  
  if (!loanContent) {
    setLocation('/products');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{loanContent.hero.title} - Altus Finances Group</title>
        <meta name="description" content={loanContent.hero.subtitle} />
      </Helmet>
      
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="text-loan-title">
              {loanContent.hero.title}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto" data-testid="text-loan-subtitle">
              {loanContent.hero.subtitle}
            </p>
            
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {loanContent.hero.features.map((feature, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-2 bg-card px-4 py-2 rounded-md"
                  data-testid={`badge-feature-${index}`}
                >
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>
            
            <Button 
              size="lg" 
              onClick={() => setLocation('/loans/new')}
              data-testid="button-apply-hero"
            >
              {loanContent.hero.cta}
              <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" data-testid="text-benefits-title">
            {loanContent.benefits.title}
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {loanContent.benefits.items.map((benefit, index) => {
              const IconComponent = (LucideIcons as any)[benefit.icon] || LucideIcons.Star;
              
              return (
                <Card key={index} className="text-center" data-testid={`card-benefit-${index}`}>
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{benefit.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" data-testid="text-process-title">
            {loanContent.process.title}
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-8 md:gap-12">
              {loanContent.process.steps.map((step, index) => (
                <div 
                  key={index} 
                  className="flex gap-6"
                  data-testid={`step-process-${index}`}
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" data-testid="text-faq-title">
            {loanContent.faq.title}
          </h2>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {loanContent.faq.items.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`faq-${index}`}
                  className="bg-card rounded-md px-6"
                  data-testid={`accordion-faq-${index}`}
                >
                  <AccordionTrigger className="text-left hover:no-underline">
                    <span className="font-medium">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-primary to-primary/80 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-cta-title">
              {loanContent.cta.title}
            </h2>
            <p className="text-lg md:text-xl mb-8 text-primary-foreground/90" data-testid="text-cta-description">
              {loanContent.cta.description}
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => setLocation('/loans/new')}
              data-testid="button-apply-cta"
            >
              {loanContent.cta.button}
              <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>
      
      <FooterPremium />
    </div>
  );
}
