import { motion } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { useTranslations } from "@/lib/i18n";

export default function FinalCTASection() {
  const t = useTranslations();
  
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
      
      {/* Animated circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-48 -left-48 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl animate-pulse" />
        <div className="absolute -bottom-48 -right-48 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <div className="relative bg-white/80 backdrop-blur-xl rounded-[3rem] p-12 md:p-16 shadow-2xl border border-white/60">
            {/* Gradient overlay */}
            <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-indigo-500/5 to-purple-500/5" />

            {/* Content */}
            <div className="relative text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold mb-8 shadow-lg"
              >
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>
                {t.premium.finalCTA.badge}
              </motion.div>

              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {t.premium.finalCTA.title}
              </h2>

              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                {t.premium.finalCTA.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap">
                <Link href="/loan-request">
                  <button className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1" data-testid="button-start-dossier">
                    {t.premium.finalCTA.primaryButton}
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </Link>

                <Link href="/contact">
                  <button className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white border-2 border-gray-200 text-gray-900 font-bold text-lg shadow-lg hover:shadow-xl hover:border-indigo-300 transition-all duration-300 hover:-translate-y-1" data-testid="button-talk-adviser">
                    <MessageCircle className="h-5 w-5" />
                    {t.premium.finalCTA.secondaryButton}
                  </button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{t.premium.finalCTA.trustBadges.noCommitment}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{t.premium.finalCTA.trustBadges.response24h}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{t.premium.finalCTA.trustBadges.secure100}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
