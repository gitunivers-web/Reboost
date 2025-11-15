import { Building2, User, Briefcase, RefreshCcw, TrendingUp, Home } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';
import { motion } from 'framer-motion';

export default function ExpertiseSection() {
  const t = useTranslations();
  
  const expertiseAreas = [
    {
      icon: Home,
      titleKey: 'realEstate',
      descKey: 'realEstateDesc',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      icon: User,
      titleKey: 'personal',
      descKey: 'personalDesc',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      icon: Briefcase,
      titleKey: 'professional',
      descKey: 'professionalDesc',
      gradient: 'from-indigo-500 to-indigo-600'
    },
    {
      icon: RefreshCcw,
      titleKey: 'consolidation',
      descKey: 'consolidationDesc',
      gradient: 'from-cyan-500 to-cyan-600'
    },
    {
      icon: Building2,
      titleKey: 'business',
      descKey: 'businessDesc',
      gradient: 'from-violet-500 to-violet-600'
    },
    {
      icon: TrendingUp,
      titleKey: 'investment',
      descKey: 'investmentDesc',
      gradient: 'from-pink-500 to-pink-600'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t.expertise?.title || 'Nos Domaines d\'Expertise'}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t.expertise?.subtitle || 'Des solutions financières sur mesure pour tous vos projets'}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {expertiseAreas.map((area, index) => {
            const Icon = area.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group"
                data-testid={`card-expertise-${index}`}
              >
                <div className="relative h-full bg-card rounded-xl p-6 md:p-8 hover-elevate active-elevate-2 overflow-visible transition-all duration-300">
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${area.gradient} mb-6 transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <h3 className="text-xl md:text-2xl font-semibold mb-3">
                    {t.expertise?.[area.titleKey] || area.titleKey}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {t.expertise?.[area.descKey] || area.descKey}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
