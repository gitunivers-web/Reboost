import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { FileText, Search, CheckCircle, Banknote, Clock } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';

export default function ProcessTimeline() {
  const t = useTranslations();

  const steps = [
    {
      icon: FileText,
      title: t.processTimeline.step1Title,
      duration: t.processTimeline.step1Duration,
      description: t.processTimeline.step1Description,
      documents: t.processTimeline.step1Docs
    },
    {
      icon: Search,
      title: t.processTimeline.step2Title,
      duration: t.processTimeline.step2Duration,
      description: t.processTimeline.step2Description,
      documents: t.processTimeline.step2Docs
    },
    {
      icon: CheckCircle,
      title: t.processTimeline.step3Title,
      duration: t.processTimeline.step3Duration,
      description: t.processTimeline.step3Description,
      documents: t.processTimeline.step3Docs
    },
    {
      icon: Banknote,
      title: t.processTimeline.step4Title,
      duration: t.processTimeline.step4Duration,
      description: t.processTimeline.step4Description,
      documents: t.processTimeline.step4Docs
    }
  ];

  const requiredDocuments = {
    creation: t.processTimeline.creationDocs,
    reprise: t.processTimeline.repriseDocs,
    developpement: t.processTimeline.developmentDocs
  };

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-14 md:mb-16">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 mb-4">
            <Clock className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {t.processTimeline.title}
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground">
            {t.processTimeline.subtitle}
          </p>
        </div>

        <div className="max-w-6xl mx-auto mb-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={index} className="p-6 relative" data-testid={`card-process-${index}`}>
                  <div className="absolute -top-3 left-6 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="mb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-3">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg">{step.title}</h3>
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                        {step.duration}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{step.description}</p>
                  </div>
                  <ul className="space-y-2">
                    {step.documents.map((doc, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="w-1 h-1 bg-primary rounded-full mt-1.5 flex-shrink-0"></span>
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">{t.processTimeline.documentsTitle}</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <h4 className="text-lg sm:text-xl font-bold mb-4 text-primary">{t.processTimeline.creationTitle}</h4>
              <ul className="space-y-3">
                {requiredDocuments.creation.map((doc, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-6">
              <h4 className="text-lg sm:text-xl font-bold mb-4 text-primary">{t.processTimeline.repriseTitle}</h4>
              <ul className="space-y-3">
                {requiredDocuments.reprise.map((doc, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-6">
              <h4 className="text-lg sm:text-xl font-bold mb-4 text-primary">{t.processTimeline.developmentTitle}</h4>
              <ul className="space-y-3">
                {requiredDocuments.developpement.map((doc, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-transparent rounded-lg border border-primary/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-lg mb-2">{t.processTimeline.incompleteTitle}</h4>
                <p className="text-sm text-muted-foreground">
                  {t.processTimeline.incompleteDescription}
                </p>
              </div>
              <Link href="/contact">
                <Button size="lg" className="whitespace-nowrap" data-testid="button-help-documents">
                  {t.processTimeline.needHelp}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            <strong>{t.processTimeline.averageTime}</strong> {t.processTimeline.averageTimeValue}
          </p>
          <Link href="/loan-request">
            <Button size="lg" data-testid="button-start-application">
              {t.processTimeline.startApplication}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
