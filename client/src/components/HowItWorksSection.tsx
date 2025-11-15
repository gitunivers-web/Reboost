import { FileText, Search, CheckCircle, Banknote } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';
import { motion } from 'framer-motion';

export default function HowItWorksSection() {
  const t = useTranslations();
  
  const steps = [
    {
      number: 1,
      icon: FileText,
      titleKey: 'step1Title',
      descKey: 'step1Desc',
      color: 'from-blue-500 to-blue-600'
    },
    {
      number: 2,
      icon: Search,
      titleKey: 'step2Title',
      descKey: 'step2Desc',
      color: 'from-purple-500 to-purple-600'
    },
    {
      number: 3,
      icon: CheckCircle,
      titleKey: 'step3Title',
      descKey: 'step3Desc',
      color: 'from-green-500 to-green-600'
    },
    {
      number: 4,
      icon: Banknote,
      titleKey: 'step4Title',
      descKey: 'step4Desc',
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t.howItWorksSection?.title || 'Comment ça marche ?'}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t.howItWorksSection?.subtitle || 'Un processus simple et rapide en 4 étapes'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 relative">
          {/* Connecting lines (hidden on mobile) */}
          <div className="hidden lg:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" 
               style={{ width: 'calc(100% - 8rem)', left: '4rem' }} />
          
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
                data-testid={`card-step-${step.number}`}
              >
                <div className="flex flex-col items-center text-center">
                  {/* Icon circle */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`relative z-10 w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <Icon className="w-10 h-10 md:w-12 md:h-12 text-white" />
                    
                    {/* Step number badge */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center font-bold text-primary">
                      {step.number}
                    </div>
                  </motion.div>
                  
                  <h3 className="text-xl md:text-2xl font-semibold mb-3">
                    {t.howItWorksSection?.[step.titleKey] || step.titleKey}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed max-w-xs">
                    {t.howItWorksSection?.[step.descKey] || step.descKey}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12 md:mt-16"
        >
          <p className="text-lg text-muted-foreground mb-6">
            {t.howItWorksSection?.ctaText || 'Prêt à commencer votre projet ?'}
          </p>
          <a
            href="/auth"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold bg-primary text-primary-foreground rounded-xl hover-elevate active-elevate-2 transition-all"
            data-testid="button-start-application"
          >
            {t.howItWorksSection?.ctaButton || 'Commencer ma demande'}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
