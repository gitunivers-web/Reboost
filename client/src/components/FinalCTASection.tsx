import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';
import { motion } from 'framer-motion';

export default function FinalCTASection() {
  const t = useTranslations();
  
  const benefits = [
    { key: 'benefit1' },
    { key: 'benefit2' },
    { key: 'benefit3' },
    { key: 'benefit4' }
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <span className="text-sm font-medium text-primary">
                {t.finalCTA?.badge || 'Démarrez maintenant'}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              {t.finalCTA?.title || 'Prêt à réaliser vos projets ?'}
            </h2>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              {t.finalCTA?.subtitle || 'Rejoignez des milliers de clients qui nous font confiance pour financer leurs projets'}
            </p>

            {/* Benefits grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 max-w-2xl mx-auto text-left">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">
                    {t.finalCTA?.[benefit.key] || benefit.key}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <a
                href="/auth"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold bg-primary text-primary-foreground rounded-xl hover-elevate active-elevate-2 transition-all w-full sm:w-auto"
                data-testid="button-open-account"
              >
                {t.finalCTA?.primaryButton || 'Ouvrir mon dossier'}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </a>

              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold bg-card text-foreground border-2 border-border rounded-xl hover-elevate active-elevate-2 transition-all w-full sm:w-auto"
                data-testid="button-contact-advisor"
              >
                {t.finalCTA?.secondaryButton || 'Parler à un conseiller'}
              </a>
            </motion.div>

            {/* Trust indicator */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-8 text-sm text-muted-foreground"
            >
              {t.finalCTA?.trustText || '✓ Sans engagement • Réponse sous 24h • 100% sécurisé'}
            </motion.p>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
          >
            {[
              { key: 'stat1Value', labelKey: 'stat1Label' },
              { key: 'stat2Value', labelKey: 'stat2Label' },
              { key: 'stat3Value', labelKey: 'stat3Label' },
              { key: 'stat4Value', labelKey: 'stat4Label' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {t.finalCTA?.[stat.key] || '---'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t.finalCTA?.[stat.labelKey] || stat.labelKey}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
