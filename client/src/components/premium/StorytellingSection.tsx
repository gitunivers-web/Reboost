import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import VideoTemoignage from "@/components/VideoTemoignage";
import { useTranslations } from "@/lib/i18n";

export default function StorytellingSection() {
  const t = useTranslations();
  
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-5"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-indigo-100 mb-6">
              <span className="text-sm font-semibold text-indigo-600">{t.premium.storytelling.badge}</span>
            </div>
            
            <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {t.premium.storytelling.title}
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {t.premium.storytelling.paragraph1}
            </p>
            
            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              {t.premium.storytelling.paragraph2}
            </p>
            
            <Link href="/about">
              <button className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5" data-testid="button-discover-more">
                {t.premium.storytelling.ctaButton}
                <ArrowRight className="h-5 w-5" />
              </button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{ minHeight: '500px' }}>
              <VideoTemoignage />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
