import { Link, useLocation } from 'wouter';
import { Home, CreditCard, History, Settings, ArrowLeftRight } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';
import { motion } from 'framer-motion';

export default function MobileBottomNav() {
  const [location] = useLocation();
  const t = useTranslations();

  const navItems = [
    {
      label: t.nav.home,
      icon: Home,
      href: '/dashboard',
      testId: 'nav-home',
    },
    {
      label: t.nav.transfers,
      icon: ArrowLeftRight,
      href: '/transfers',
      testId: 'nav-transfers',
    },
    {
      label: t.nav.history,
      icon: History,
      href: '/history',
      testId: 'nav-history',
    },
    {
      label: t.nav.settings,
      icon: Settings,
      href: '/settings',
      testId: 'nav-settings',
    },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location === '/dashboard';
    }
    return location.startsWith(href);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-card/95 backdrop-blur-lg border-t border-border/50 z-50 safe-area-inset-bottom shadow-lg">
      <div className="flex items-center justify-around h-14 px-2">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              data-testid={item.testId}
            >
              <motion.div
                className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all ${
                  active
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground bg-transparent'
                }`}
                whileTap={{ scale: 0.9 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 17
                }}
              >
                <motion.div
                  animate={{
                    scale: active ? 1.1 : 1,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 10
                  }}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
                <span className={`text-xs font-medium mt-1 ${active ? 'opacity-100' : 'opacity-70'}`}>
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
