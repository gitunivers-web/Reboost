import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import VideoTemoignage from "@/components/VideoTemoignage";

export default function StorytellingSection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-indigo-100 mb-6">
              <span className="text-sm font-semibold text-indigo-600">Notre Mission</span>
            </div>
            
            <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Financer l'excellence, propulser la croissance
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Depuis notre création, nous accompagnons les entreprises et les particuliers dans leurs projets les plus ambitieux. Notre expertise en financement professionnel et notre approche personnalisée font de nous le partenaire de confiance pour vos investissements stratégiques.
            </p>
            
            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              Chaque dossier est unique. C'est pourquoi nous mettons à votre disposition des conseillers dédiés, des processus digitaux sécurisés et des solutions de financement sur mesure qui s'adaptent à vos besoins réels.
            </p>
            
            <Link href="/about">
              <button className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5" data-testid="button-discover-more">
                Découvrir notre histoire
                <ArrowRight className="h-5 w-5" />
              </button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <VideoTemoignage />
            </div>
            
            {/* Floating card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Certification</div>
                  <div className="text-lg font-bold text-gray-900">ISO 27001</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
