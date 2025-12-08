import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Award, Lock } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { translations } from '@/lib/i18n';

const icons = [Shield, Award, Lock];

export function TrustInfoBar() {
  const { language } = useLanguage();
  const t = translations[language];
  const [currentIndex, setCurrentIndex] = useState(0);

  const badges = [
    {
      icon: Shield,
      title: t.trustBar.badge1Title,
      desc: t.trustBar.badge1Desc,
    },
    {
      icon: Award,
      title: t.trustBar.badge2Title,
      desc: t.trustBar.badge2Desc,
    },
    {
      icon: Lock,
      title: t.trustBar.badge3Title,
      desc: t.trustBar.badge3Desc,
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % badges.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [badges.length]);

  const currentBadge = badges[currentIndex];
  const Icon = currentBadge.icon;

  return (
    <div className="fixed top-[40px] left-0 right-0 w-full bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 overflow-hidden z-[10000]" data-testid="trust-info-bar">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Left side: Rotating badge info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-3"
                data-testid={`badge-${currentIndex}`}
              >
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                  <Icon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {currentBadge.title}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate hidden sm:block">
                    {currentBadge.desc}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Progress dots */}
            <div className="hidden md:flex items-center gap-1.5 ml-4">
              {badges.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'w-6 bg-slate-800 dark:bg-white'
                      : 'w-1.5 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
                  }`}
                  data-testid={`dot-${index}`}
                  aria-label={`View badge ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right side: Protection value */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-2 bg-emerald-500 rounded-full px-4 py-1.5"
            data-testid="protection-badge"
          >
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <div className="text-xs text-white hidden sm:block">
              {t.trustBar.protectionLabel}:
            </div>
            <div className="text-sm font-bold text-white">
              {t.trustBar.protectionValue}
            </div>
          </motion.div>
        </div>
      </div>

    </div>
  );
}
