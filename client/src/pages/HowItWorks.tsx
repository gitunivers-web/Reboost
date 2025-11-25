import Header from '@/components/Header';
import FooterPremium from '@/components/premium/FooterPremium';
import SEO from '@/components/SEO';
import { useTranslations } from '@/lib/i18n';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Search, 
  CheckCircle, 
  Banknote, 
  Clock, 
  Users, 
  Shield,
  Briefcase,
  Building,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { getOfficialStats } from '@/lib/constants';

export default function HowItWorks() {
  const t = useTranslations();
  const [, setLocation] = useLocation();

  const steps = [
    {
      icon: FileText,
      title: t.howItWorks.step1Title || 'Inscription',
      description: t.howItWorks.step1Desc || 'Créez votre compte et complétez votre profil en quelques minutes',
      duration: t.howItWorks.step1Duration || '3 min',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      icon: Search,
      title: t.howItWorks.step2Title || 'Analyse',
      description: t.howItWorks.step2Desc || 'Notre équipe analyse votre dossier avec expertise',
      duration: t.howItWorks.step2Duration || '< 24h',
      color: 'from-indigo-500 to-purple-600',
    },
    {
      icon: CheckCircle,
      title: t.howItWorks.step3Title || 'Validation',
      description: t.howItWorks.step3Desc || 'Recevez votre offre personnalisée et signez en ligne',
      duration: t.howItWorks.step3Duration || '< 48h',
      color: 'from-purple-500 to-pink-600',
    },
    {
      icon: Banknote,
      title: t.howItWorks.step4Title || 'Déblocage',
      description: t.howItWorks.step4Desc || 'Fonds disponibles sur votre compte sécurisé',
      duration: t.howItWorks.step4Duration || 'Immédiat',
      color: 'from-pink-500 to-rose-600',
    },
  ];

  const securityFeatures = t.howItWorks.securityFeatures.map((feature, index) => ({
    icon: [Shield, CheckCircle2, Users, Shield][index],
    title: feature.title,
    description: feature.description
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <SEO
        title={t.seo.howItWorks.title}
        description={t.seo.howItWorks.description}
        keywords="how to get professional loan, business credit process, business loan documents, eligibility criteria, financing timeline, loan application steps"
        path="/how-it-works"
      />
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
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
            className="text-center"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-indigo-100 mb-6">
              <Sparkles className="w-4 h-4 text-indigo-600 mr-2" />
              <span className="text-sm font-semibold text-indigo-600">{t.howItWorks.digitalProcess}</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 bg-clip-text text-transparent">
              {t.howItWorks.title || 'Comment Ça Marche ?'}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t.howItWorks.subtitle || 'Un processus simple, transparent et sécurisé'}
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto"
          >
            {getOfficialStats(t).map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${stat.color} mb-3`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs md:text-sm text-gray-600 mt-1">{stat.label}</div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t.howItWorks.stepsSimpleTitle}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t.howItWorks.stepsSimpleSubtitle}
            </p>
          </motion.div>

          <div className="relative">
            {/* Connection line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 -translate-y-1/2 z-0" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group"
                    data-testid={`card-step-${index}`}
                  >
                    <Card className="relative h-full p-8 bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-visible">
                      <div className={`absolute -top-6 -left-6 bg-gradient-to-br ${step.color} text-white w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        {index + 1}
                      </div>
                      
                      <div className="mt-4">
                        <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${step.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-gray-900">{step.title}</h3>
                        <p className="text-gray-600 mb-6 leading-relaxed">{step.description}</p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 text-gray-700 font-semibold text-sm">
                          <Clock className="w-4 h-4 text-indigo-600" />
                          {step.duration}
                        </div>
                      </div>
                      
                      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-green-100 border border-green-200">
              <Clock className="w-5 h-5 text-green-600" />
              <p className="text-sm font-semibold text-green-900">
                {t.howItWorks.averageTimePrefix} <span className="text-green-600">{t.howItWorks.averageTimeValue}</span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Documents Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t.howItWorks.requiredDocumentsTitle}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t.howItWorks.requiredDocumentsSubtitle}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="group"
            >
              <Card className="h-full p-10 bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-visible">
                <div className="flex items-center gap-4 mb-8">
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">{t.howItWorks.personalLoanTitle}</h3>
                </div>
                <ul className="space-y-4">
                  {t.howItWorks.documents.personal.map((doc, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700 leading-relaxed">{doc}</span>
                    </li>
                  ))}
                </ul>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="group"
            >
              <Card className="h-full p-10 bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-visible">
                <div className="flex items-center gap-4 mb-8">
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600">
                    <Briefcase className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">{t.howItWorks.businessLoanTitle}</h3>
                </div>
                <ul className="space-y-4">
                  {t.howItWorks.documents.professional.map((doc, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700 leading-relaxed">{doc}</span>
                    </li>
                  ))}
                </ul>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100"
          >
            <p className="text-center text-gray-700">
              💡 <strong>{t.howItWorks.tipTitle}</strong> {t.howItWorks.tipMessage}
              <Link href="/contact" className="text-indigo-600 font-semibold ml-2 hover:underline">
                {t.howItWorks.tipContactCta}
              </Link>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t.howItWorks.securityTitle}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t.howItWorks.securitySubtitle}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {securityFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group"
                >
                  <Card className="p-8 text-center bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                    <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold mb-3 text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
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
              {t.howItWorks.ctaTitle}
            </h2>
            <p className="text-xl text-white/90 mb-10">
              {t.howItWorks.ctaSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => setLocation('/login')}
                className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold min-w-[220px]"
                data-testid="button-apply-now"
              >
                {t.howItWorks.ctaRequestButton}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold min-w-[220px]">
                  {t.howItWorks.ctaContactButton}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <FooterPremium />
    </div>
  );
}
