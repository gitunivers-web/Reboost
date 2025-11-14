import { motion } from "framer-motion";
import { useTranslations } from "@/lib/i18n";

export default function CircularTransferProgress({ percent }: { percent: number }) {
  const t = useTranslations();
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const progress = (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4 p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 w-full max-w-md mx-auto">
      
      {/* Cercle */}
      <div className="relative">
        <svg width="160" height="160" className="transform -rotate-90">
          {/* Cercle gris */}
          <circle
            cx="80"
            cy="80"
            r={r}
            stroke="#E5E7EB"
            strokeWidth="10"
            fill="none"
          />

          {/* Cercle animé */}
          <motion.circle
            cx="80"
            cy="80"
            r={r}
            stroke="url(#gradient)"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          />

          {/* Dégradé premium */}
          <defs>
            <linearGradient id="gradient" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
        </svg>

        {/* Pourcentage centré */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-gray-800 dark:text-gray-100">{Math.round(percent)}%</span>
        </div>
      </div>

      {/* Texte premium */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {t.transferFlow.progress.circularProgressTitle}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t.transferFlow.progress.circularProgressSubtitle}
        </p>
      </div>
    </div>
  );
}
