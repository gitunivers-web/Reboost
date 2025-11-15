import { motion } from "framer-motion";
import { Shield, Lock, Server, Eye, CheckCircle2 } from "lucide-react";
import { useTranslations } from "@/lib/i18n";

const featureIcons = [Lock, Server, Eye, CheckCircle2];

export default function BankingSecurity() {
  const t = useTranslations();
  
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-48 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
            <Shield className="h-4 w-4 text-indigo-300" />
            <span className="text-sm font-semibold text-white">{t.premium.security.badge}</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t.premium.security.title}
          </h2>
          <p className="text-xl text-indigo-200 max-w-3xl mx-auto leading-relaxed">
            {t.premium.security.subtitle}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {t.premium.security.features.map((feature, index) => {
            const FeatureIcon = featureIcons[index];
            return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
              data-testid={`security-feature-${index}`}
            >
              <div className="relative h-full p-8 rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
                {/* Icon */}
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FeatureIcon className="h-8 w-8 text-indigo-300" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-indigo-200 leading-relaxed">{feature.description}</p>

                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/0 to-blue-500/0 group-hover:from-indigo-500/10 group-hover:to-blue-500/10 transition-all duration-300" />
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
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 flex flex-wrap justify-center gap-8 items-center"
        >
          <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <span className="text-white font-semibold">{t.premium.security.certifications.iso27001}</span>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <span className="text-white font-semibold">{t.premium.security.certifications.gdpr}</span>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <span className="text-white font-semibold">{t.premium.security.certifications.pciDss}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
