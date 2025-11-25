import { motion } from "framer-motion";
import { Building2, User, RefreshCw, Sparkles, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { useTranslations } from "@/lib/i18n";

const expertiseIcons = [Building2, User, RefreshCw, Sparkles];
const expertiseColors = [
  "from-blue-500 to-indigo-600",
  "from-indigo-500 to-purple-600",
  "from-purple-500 to-pink-600",
  "from-pink-500 to-rose-600"
];

export default function ExpertisesModern() {
  const t = useTranslations();
  const [, setLocation] = useLocation();
  
  return (
    <section className="relative py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{t.premium.expertises.title}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t.premium.expertises.subtitle}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {t.premium.expertises.items.map((expertise, index) => {
            const Icon = expertiseIcons[index];
            return (<motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
              data-testid={`expertise-card-${index}`}
            >
              <div className="relative h-full p-8 rounded-3xl bg-white border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                {/* Icon */}
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${expertiseColors[index]} mb-6`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{expertise.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{expertise.description}</p>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {expertise.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 text-sm font-medium rounded-full bg-gray-50 text-gray-700 border border-gray-200"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${expertiseColors[index]} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              </div>
            </motion.div>);
          })}
        </div>

        {/* Single CTA Button Below Cards - CENTERED */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <button
            onClick={() => setLocation('/products')}
            data-testid="button-learn-more-all-expertises"
            className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-lg rounded-lg hover:shadow-2xl active:scale-95 transition-all duration-300 hover-elevate active-elevate-2"
          >
            {t.premium.expertises.ctaButton}
            <ArrowRight className="h-5 w-5" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
