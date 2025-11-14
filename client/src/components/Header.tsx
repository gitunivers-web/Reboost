import { useState } from 'react';
import { Link } from 'wouter';
import { FiMenu, FiX } from 'react-icons/fi';
import { useTranslations, useLanguage, type Language } from '@/lib/i18n';

const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const t = useTranslations();
  const { language, setLanguage } = useLanguage();

  const closeMenu = () => setOpen(false);

  return (
    <>
      {/* HEADER MINIMALISTE */}
      <header className="
        fixed top-0 left-0 w-full h-20 z-[9999]
        bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-slate-700
        flex items-center justify-between px-6
      ">
        {/* LOGO */}
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition">
            <img src="/logo.png" alt="ALTUS" className="h-12" />
            <span className="font-semibold text-xl text-gray-900 dark:text-white hidden sm:block">
              Altus Finance Group
            </span>
          </div>
        </Link>

        {/* BOUTON MENU HAMBURGER */}
        <button
          onClick={() => setOpen(true)}
          className="text-3xl text-gray-800 dark:text-white hover:text-altus-blue transition-colors"
          data-testid="button-mobile-menu"
          aria-label="Menu"
        >
          <FiMenu />
        </button>
      </header>

      {/* MENU DÉPLIANT FULL-SCREEN */}
      <div
        className={`
          fixed inset-0 bg-white dark:bg-slate-900 z-[99999] 
          transform transition-all duration-500 ease-out
          ${open ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}
        `}
      >
        {/* BOUTON FERMER */}
        <div className="absolute top-6 right-6">
          <button
            onClick={closeMenu}
            className="text-4xl text-gray-700 dark:text-gray-300 hover:text-altus-blue transition-colors"
            data-testid="button-close-menu"
            aria-label="Fermer"
          >
            <FiX />
          </button>
        </div>

        {/* CONTENU DU MENU */}
        <div className="flex flex-col items-center justify-center h-full space-y-6 px-6">
          
          {/* LIENS DE NAVIGATION */}
          <Link href="/" onClick={closeMenu}>
            <span
              className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white hover:text-altus-blue transition-colors cursor-pointer"
              data-testid="link-home-mobile"
            >
              {t.nav.home}
            </span>
          </Link>

          {/* SOUS-MENU PRÊTS */}
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-gray-600 dark:text-gray-400 mb-3">
              {t.nav.loansMenu.label}
            </div>
            <div className="flex flex-col space-y-2">
              {t.nav.loansMenu.items.map((item, index) => (
                <Link key={index} href={item.href} onClick={closeMenu}>
                  <span
                    className="text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-altus-blue transition-colors cursor-pointer"
                    data-testid={`link-loan-${item.href.split('/').pop()}-mobile`}
                  >
                    {item.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <Link href="/how-it-works" onClick={closeMenu}>
            <span
              className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white hover:text-altus-blue transition-colors cursor-pointer"
              data-testid="link-how-it-works-mobile"
            >
              {t.nav.howItWorks}
            </span>
          </Link>

          <Link href="/resources" onClick={closeMenu}>
            <span
              className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white hover:text-altus-blue transition-colors cursor-pointer"
              data-testid="link-faq-mobile"
            >
              {t.nav.faq}
            </span>
          </Link>

          <Link href="/about" onClick={closeMenu}>
            <span
              className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white hover:text-altus-blue transition-colors cursor-pointer"
              data-testid="link-about-mobile"
            >
              {t.nav.about}
            </span>
          </Link>

          <Link href="/contact" onClick={closeMenu}>
            <span
              className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white hover:text-altus-blue transition-colors cursor-pointer"
              data-testid="link-contact-mobile"
            >
              {t.nav.contact}
            </span>
          </Link>

          {/* TÉLÉPHONE */}
          <a
            href={`tel:${t.nav.phone}`}
            className="text-xl font-semibold text-altus-blue hover:text-altus-purple transition-colors mt-4"
            data-testid="link-phone-mobile"
          >
            📞 {t.nav.phone}
          </a>

          {/* SÉLECTEUR DE LANGUES */}
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`
                  text-lg flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                  ${language === lang.code 
                    ? 'bg-altus-blue text-white shadow-lg' 
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                  }
                `}
                data-testid={`button-language-${lang.code}`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="font-medium hidden sm:inline">{lang.name}</span>
              </button>
            ))}
          </div>

          {/* BOUTON MON ESPACE (CTA) */}
          <Link href="/login" onClick={closeMenu}>
            <span
              className="
                mt-8 px-10 py-4 
                bg-altus-blue hover:bg-altus-purple 
                text-white rounded-xl 
                text-xl sm:text-2xl font-semibold 
                shadow-lg hover:shadow-xl 
                transition-all
                inline-block cursor-pointer
              "
              data-testid="button-mon-espace-mobile"
            >
              {t.hero.cta2}
            </span>
          </Link>
        </div>
      </div>
    </>
  );
}
