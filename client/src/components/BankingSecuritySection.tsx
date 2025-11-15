import { Shield, Lock, FileCheck, Server, Eye, Fingerprint } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';
import { motion } from 'framer-motion';

export default function BankingSecuritySection() {
  const t = useTranslations();
  
  const securityFeatures = [
    {
      icon: Shield,
      titleKey: 'aes256Title',
      descKey: 'aes256Desc',
    },
    {
      icon: Fingerprint,
      titleKey: 'mfaTitle',
      descKey: 'mfaDesc',
    },
    {
      icon: FileCheck,
      titleKey: 'kycTitle',
      descKey: 'kycDesc',
    },
    {
      icon: Server,
      titleKey: 'euHostingTitle',
      descKey: 'euHostingDesc',
    },
    {
      icon: Eye,
      titleKey: 'monitoringTitle',
      descKey: 'monitoringDesc',
    },
    {
      icon: Lock,
      titleKey: 'gdprTitle',
      descKey: 'gdprDesc',
    }
  ];

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900" />
      
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-300">
              {t.bankingSecurity?.badge || 'Sécurité Bancaire'}
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white">
            {t.bankingSecurity?.title || 'Votre sécurité, notre priorité'}
          </h2>
          <p className="text-lg md:text-xl text-blue-100/80 max-w-3xl mx-auto">
            {t.bankingSecurity?.subtitle || 'Protection maximale de vos données avec les standards bancaires les plus élevés'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {securityFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                data-testid={`card-security-${index}`}
              >
                <div className="group h-full bg-white/5 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-white/10 hover:bg-white/10 hover:border-blue-400/30 transition-all duration-300">
                  <div className="inline-flex p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-6 group-hover:bg-blue-500/20 transition-all duration-300">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  
                  <h3 className="text-xl md:text-2xl font-semibold mb-3 text-white">
                    {t.bankingSecurity?.[feature.titleKey] || feature.titleKey}
                  </h3>
                  
                  <p className="text-blue-100/70 leading-relaxed">
                    {t.bankingSecurity?.[feature.descKey] || feature.descKey}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 md:mt-16 text-center"
        >
          <div className="inline-flex flex-wrap items-center justify-center gap-6 md:gap-8 px-6 py-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-2 text-blue-200">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="font-medium">{t.bankingSecurity?.certified || 'Certifié ISO 27001'}</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-white/20" />
            <div className="flex items-center gap-2 text-blue-200">
              <Lock className="w-5 h-5 text-green-400" />
              <span className="font-medium">{t.bankingSecurity?.compliance || 'Conformité RGPD'}</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-white/20" />
            <div className="flex items-center gap-2 text-blue-200">
              <FileCheck className="w-5 h-5 text-green-400" />
              <span className="font-medium">{t.bankingSecurity?.audited || 'Audits réguliers'}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
