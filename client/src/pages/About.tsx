import Header from '@/components/Header';
import FooterPremium from '@/components/premium/FooterPremium';
import SEO from '@/components/SEO';
import { useTranslations } from '@/lib/i18n';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { organizationSchema, breadcrumbSchema } from '@/lib/seo-data';
import { getOfficialStats } from '@/lib/constants';
import { Shield, Target, Heart, Zap, Award, CheckCircle2 } from 'lucide-react';

export default function About() {
  const t = useTranslations();

  const aboutBreadcrumb = breadcrumbSchema([
    { name: t.nav.home, path: '/' },
    { name: t.nav.about, path: '/about' }
  ]);

  const values = [
    {
      icon: Shield,
      title: t.about.values.items.value1Title,
      description: t.about.values.items.value1Desc,
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: Target,
      title: t.about.values.items.value2Title,
      description: t.about.values.items.value2Desc,
      color: "from-indigo-500 to-purple-600"
    },
    {
      icon: Heart,
      title: t.about.values.items.value3Title,
      description: t.about.values.items.value3Desc,
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: Zap,
      title: t.about.values.items.value4Title,
      description: t.about.values.items.value4Desc,
      color: "from-pink-500 to-rose-600"
    }
  ];

  const achievements = [
    { label: t.about.achievements.item1Label, status: t.about.achievements.item1Status },
    { label: t.about.achievements.item2Label, status: t.about.achievements.item2Status },
    { label: t.about.achievements.item3Label, status: t.about.achievements.item3Status },
    { label: t.about.achievements.item4Label, status: t.about.achievements.item4Status }
  ];

  return (
    <div className="min-h-screen">
      <SEO
        title={t.seo.about.title}
        description={t.seo.about.description}
        keywords="about Solventis Group, Solventis Group mission, financing company values, professional loan experience, reliable business financing"
        path="/about"
        structuredData={[organizationSchema, aboutBreadcrumb]}
      />
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-4 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
        
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-48 -left-48 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl animate-pulse" />
          <div className="absolute -bottom-48 -right-48 h-96 w-96 rounded-full bg-purple-200/30 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-indigo-100 mb-6">
              <Award className="w-4 h-4 text-indigo-600 mr-2" />
              <span className="text-sm font-semibold text-indigo-600">{t.about.badge}</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 bg-clip-text text-transparent">
              {t.about.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
              {t.about.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t.about.statsSection.title}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t.about.statsSection.subtitle}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {getOfficialStats(t).map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group"
                >
                  <Card className="p-8 text-center bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-visible">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${stat.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-4xl md:text-5xl font-bold mb-2 text-gray-900">{stat.value}</div>
                    <div className="text-sm font-medium text-gray-600">{stat.label}</div>
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-4xl font-bold mb-6 text-gray-900">{t.about.mission}</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                {t.about.missionText}
              </p>
              <ul className="space-y-4">
                {achievements.map((achievement, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-gray-900">{achievement.label}</div>
                      <div className="text-sm text-gray-600">{achievement.status}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <div className="aspect-[4/3] bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white/90">
                      <div className="text-7xl font-bold mb-4">Solventis</div>
                      <div className="text-2xl">Finance Group</div>
                      <div className="text-sm mt-4 opacity-75">Since 2013</div>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t.about.values.title}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t.about.values.subtitle}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group"
                >
                  <Card className="relative h-full p-8 bg-white border border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-visible">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${value.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900">{value.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t.about.cta.title}
            </h2>
            <p className="text-xl text-white/90 mb-10">
              {t.about.cta.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/loans/new" className="inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors" data-testid="link-loan-request">
                {t.about.cta.button1}
              </a>
              <a href="/contact" className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-colors" data-testid="link-contact">
                {t.about.cta.button2}
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <FooterPremium />
    </div>
  );
}
