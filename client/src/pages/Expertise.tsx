import { useTranslations } from '@/lib/i18n';
import Header from '@/components/Header';
import TopBar from '@/components/TopBar';
import FooterPremium from '@/components/premium/FooterPremium';
import SEO from '@/components/SEO';
import { Building2, User, RefreshCw, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const expertiseIcons = [Building2, User, RefreshCw, Sparkles];
const expertiseColors = [
  'from-blue-500 to-indigo-600',
  'from-indigo-500 to-purple-600',
  'from-purple-500 to-pink-600',
  'from-pink-500 to-rose-600'
];

export default function Expertise() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <SEO
        title={`${t.premium.expertises.title} | Solventis Group`}
        description={t.premium.expertises.subtitle}
        path="/expertise"
      />
      
      <TopBar />
      <Header />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t.premium.expertises.title}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t.premium.expertises.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Expertise Cards - Detailed View */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {t.premium.expertises.items.map((expertise, index) => {
              const Icon = expertiseIcons[index];
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center"
                >
                  {/* Text Content */}
                  <div className={isEven ? 'md:order-1' : 'md:order-2'}>
                    <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${expertiseColors[index]} mb-6`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                      {expertise.title}
                    </h2>

                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                      {expertise.description}
                    </p>

                    {/* Features List */}
                    <div className="space-y-3 mb-8">
                      {expertise.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                          <span className="text-gray-700 font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <a
                      href="/contact"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all duration-300 hover:gap-3 group"
                      data-testid={`button-contact-${index}`}
                    >
                      Nous contacter
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>

                  {/* Icon Visual */}
                  <div className={`hidden md:block ${isEven ? 'md:order-2' : 'md:order-1'}`}>
                    <div className={`relative h-80 rounded-3xl bg-gradient-to-br ${expertiseColors[index]} opacity-10`} />
                    <div className={`absolute inset-0 flex items-center justify-center rounded-3xl hidden md:flex`}>
                      <Icon className="h-40 w-40 text-gray-300" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir Solventis ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une approche personnalisée, des experts à votre écoute, et des solutions adaptées à vos besoins
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '⚡', title: 'Rapidité', desc: 'Réponse en 24h, financement en 3-5 jours' },
              { icon: '🎯', title: 'Transparence', desc: 'Sans frais cachés, conditions claires' },
              { icon: '👥', title: 'Expertise', desc: '20+ ans d\'expérience dans le financement' },
              { icon: '🔒', title: 'Sécurité', desc: 'Données protégées, chiffrement AES-256' },
              { icon: '📊', title: 'Personnalisé', desc: 'Solutions adaptées à votre profil' },
              { icon: '🌍', title: '7 Langues', desc: 'Support multilingue 24/7' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 text-center"
                data-testid={`card-why-choose-${idx}`}
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-gradient-to-r from-indigo-600 to-indigo-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Prêt à démarrer votre projet ?
            </h2>
            <p className="text-lg text-indigo-100 mb-8">
              Nos experts sont là pour vous accompagner
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-300 hover:gap-3 group text-lg"
              data-testid="button-cta-contact"
            >
              Contactez-nous
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </div>
      </section>

      <FooterPremium />
    </div>
  );
}
