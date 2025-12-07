import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, ChevronDown, Globe, Sparkles, ChevronRight, Home, FileText, HelpCircle, Info, Shield, Lock } from 'lucide-react';
import { useTranslations, useLanguage, type Language } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'fr', name: 'FR', flag: '🇫🇷' },
  { code: 'en', name: 'EN', flag: '🇬🇧' },
  { code: 'de', name: 'DE', flag: '🇩🇪' },
  { code: 'es', name: 'ES', flag: '🇪🇸' },
  { code: 'nl', name: 'NL', flag: '🇳🇱' },
  { code: 'it', name: 'IT', flag: '🇮🇹' },
  { code: 'pt', name: 'PT', flag: '🇵🇹' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [mobileLangOpen, setMobileLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const t = useTranslations();
  const { language, setLanguage } = useLanguage();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (moreMenuOpen) setMoreMenuOpen(false);
        if (langMenuOpen) setLangMenuOpen(false);
        if (mobileMenuOpen) setMobileMenuOpen(false);
      }
    };

    if (moreMenuOpen || langMenuOpen || mobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [moreMenuOpen, langMenuOpen, mobileMenuOpen]);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileMoreOpen(false);
  };

  const currentLang = languages.find(lang => lang.code === language) || languages[0];

  return (
    <>
      <header className={`fixed top-[85px] left-0 w-full z-[9999] transition-all duration-500 ${
        scrolled 
          ? 'h-[68px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-700/50' 
          : 'h-[80px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800'
      }`}>
        <div className="max-w-7xl mx-auto h-full px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/">
            <div className={`flex items-center gap-2 cursor-pointer group transition-all duration-300 ${
              scrolled ? 'scale-95' : 'scale-100'
            }`}>
              <div className="relative flex-shrink-0">
                <img 
                  src="/logo-cropped.png" 
                  alt="Altus Finances Group" 
                  className={`transition-all duration-300 object-contain ${
                    scrolled ? 'h-10' : 'h-12'
                  }`} 
                />
              </div>
              <div className="hidden lg:block">
                <span className="font-bold text-lg bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent group-hover:from-primary group-hover:via-primary/80 group-hover:to-primary transition-all duration-300">
                  Altus Finances Group
                </span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground/70 font-medium">
                  <Sparkles className="w-3 h-3" />
                  <span>{t.nav.tagline}</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <a 
              href="/"
              onClick={(e) => { e.preventDefault(); setLocation('/'); }} 
              className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-primary rounded-lg hover:bg-primary/5 transition-all duration-300 group relative" 
              data-testid="link-home-desktop"
            >
              {t.nav.home}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent group-hover:w-full transition-all duration-300" />
            </a>

            <a 
              href="/products"
              onClick={(e) => { e.preventDefault(); setLocation('/products'); }} 
              className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-primary rounded-lg hover:bg-primary/5 transition-all duration-300 group relative" 
              data-testid="link-loans-desktop"
            >
              {t.nav.products}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent group-hover:w-full transition-all duration-300" />
            </a>

            <a 
              href="/how-it-works"
              onClick={(e) => { e.preventDefault(); setLocation('/how-it-works'); }} 
              className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-primary rounded-lg hover:bg-primary/5 transition-all duration-300 group relative" 
              data-testid="link-how-it-works-desktop"
            >
              {t.nav.howItWorks}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent group-hover:w-full transition-all duration-300" />
            </a>

            <a 
              href="/contact"
              onClick={(e) => { e.preventDefault(); setLocation('/contact'); }} 
              className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-primary rounded-lg hover:bg-primary/5 transition-all duration-300 group relative" 
              data-testid="link-contact-desktop"
            >
              {t.nav.contact}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent group-hover:w-full transition-all duration-300" />
            </a>

            <div className="relative" ref={moreMenuRef}>
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-primary rounded-lg hover:bg-primary/5 transition-all duration-300 group relative"
                data-testid="button-more-menu"
              >
                {t.nav.more}
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${moreMenuOpen ? 'rotate-180' : ''}`} />
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent group-hover:w-full transition-all duration-300" />
              </button>

              {moreMenuOpen && (
                <div className="absolute top-full right-0 mt-3 w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 py-2 animate-in fade-in slide-in-from-top-2 duration-300 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
                  <a
                    href="/resources"
                    onClick={(e) => { e.preventDefault(); setLocation('/resources'); setMoreMenuOpen(false); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLocation('/resources'); setMoreMenuOpen(false); } }}
                    className="relative block px-5 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-all duration-300 group"
                    data-testid="link-faq-dropdown"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      {t.nav.faq}
                    </span>
                  </a>
                  <a
                    href="/about"
                    onClick={(e) => { e.preventDefault(); setLocation('/about'); setMoreMenuOpen(false); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLocation('/about'); setMoreMenuOpen(false); } }}
                    className="relative block px-5 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-all duration-300 group"
                    data-testid="link-about-dropdown"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      {t.nav.about}
                    </span>
                  </a>
                  <a
                    href="/terms"
                    onClick={(e) => { e.preventDefault(); setLocation('/terms'); setMoreMenuOpen(false); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLocation('/terms'); setMoreMenuOpen(false); } }}
                    className="relative block px-5 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-all duration-300 group"
                    data-testid="link-terms-dropdown"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      {t.footer.legalLinks.terms}
                    </span>
                  </a>
                  <a
                    href="/privacy"
                    onClick={(e) => { e.preventDefault(); setLocation('/privacy'); setMoreMenuOpen(false); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLocation('/privacy'); setMoreMenuOpen(false); } }}
                    className="relative block px-5 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-all duration-300 group"
                    data-testid="link-privacy-dropdown"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      {t.footer.legalLinks.privacy}
                    </span>
                  </a>
                </div>
              )}
            </div>
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-primary/5 rounded-lg transition-all duration-300 group"
                data-testid="button-language-selector"
              >
                <Globe className="w-4 h-4 group-hover:text-primary transition-colors" />
                <span className="text-lg">{currentLang.flag}</span>
                <span className="group-hover:text-primary transition-colors">{currentLang.name}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${langMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {langMenuOpen && (
                <div className="absolute top-full right-0 mt-3 w-52 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 py-2 animate-in fade-in slide-in-from-top-2 duration-300 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangMenuOpen(false);
                      }}
                      className={`relative w-full flex items-center gap-3 px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                        language === lang.code
                          ? 'bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary'
                      }`}
                      data-testid={`button-language-${lang.code}`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span>{lang.name}</span>
                      {language === lang.code && (
                        <span className="ml-auto w-2 h-2 rounded-full bg-white" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link href="/login">
              <Button 
                size="lg"
                className="px-6 h-11 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
                data-testid="button-mon-espace-desktop"
              >
                <span className="relative z-10">{t.hero.cta2}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden text-gray-800 dark:text-gray-200 hover:text-[#005DFF] transition-colors"
            data-testid="button-mobile-menu"
            aria-label="Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Premium Mobile Drawer - Fintech 2025 Style */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop with blur */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99998] animate-in fade-in duration-300 lg:hidden"
            onClick={closeMobileMenu}
          />
          
          {/* Premium Drawer */}
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-[380px] z-[99999] animate-in slide-in-from-right duration-400 ease-out lg:hidden">
            <div className="h-full w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-l-3xl flex flex-col">
              
              {/* Header with title and close button */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 bg-gradient-to-b from-white/95 to-white/80 dark:from-slate-900/95 dark:to-slate-900/80 backdrop-blur-xl border-b border-gray-200/30 dark:border-gray-700/30">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">Menu</h2>
                <button
                  onClick={closeMobileMenu}
                  className="p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-slate-800/80 hover:text-[#005DFF] transition-all duration-200"
                  data-testid="button-close-menu"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content area with generous spacing */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <nav className="space-y-2">
                  {/* Home */}
                  <Link href="/" onClick={closeMobileMenu}>
                    <div className="flex items-center gap-3 px-4 py-3.5 text-base font-semibold text-gray-900 dark:text-white hover:bg-gradient-to-r hover:from-[#005DFF]/10 hover:to-transparent rounded-xl transition-all duration-300 cursor-pointer group" data-testid="link-home-mobile">
                      <Home className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-[#005DFF] transition-colors" />
                      <span>{t.nav.home}</span>
                    </div>
                  </Link>

                  {/* Products */}
                  <Link href="/products" onClick={closeMobileMenu}>
                    <div className="flex items-center gap-3 px-4 py-3.5 text-base font-semibold text-gray-900 dark:text-white hover:bg-gradient-to-r hover:from-[#005DFF]/10 hover:to-transparent rounded-xl transition-all duration-300 cursor-pointer group" data-testid="link-loans-mobile">
                      <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-[#005DFF] transition-colors" />
                      <span>{t.nav.products}</span>
                    </div>
                  </Link>

                  {/* How it works */}
                  <Link href="/how-it-works" onClick={closeMobileMenu}>
                    <div className="flex items-center gap-3 px-4 py-3.5 text-base font-semibold text-gray-900 dark:text-white hover:bg-gradient-to-r hover:from-[#005DFF]/10 hover:to-transparent rounded-xl transition-all duration-300 cursor-pointer group" data-testid="link-how-it-works-mobile">
                      <HelpCircle className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-[#005DFF] transition-colors" />
                      <span>{t.nav.howItWorks}</span>
                    </div>
                  </Link>

                  {/* Contact */}
                  <Link href="/contact" onClick={closeMobileMenu}>
                    <div className="flex items-center gap-3 px-4 py-3.5 text-base font-semibold text-gray-900 dark:text-white hover:bg-gradient-to-r hover:from-[#005DFF]/10 hover:to-transparent rounded-xl transition-all duration-300 cursor-pointer group" data-testid="link-contact-mobile">
                      <Info className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-[#005DFF] transition-colors" />
                      <span>{t.nav.contact}</span>
                    </div>
                  </Link>

                  {/* More dropdown */}
                  <div className="pt-2 mt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                    <Collapsible open={mobileMoreOpen} onOpenChange={setMobileMoreOpen}>
                      <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-[#005DFF]/10 hover:to-transparent rounded-xl transition-all duration-300 group" data-testid="button-more-mobile">
                        <span className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-[#005DFF] transition-colors" />
                          <span>{t.nav.moreInfo}</span>
                        </span>
                        <ChevronRight className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${mobileMoreOpen ? 'rotate-90' : ''}`} />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2 ml-12 space-y-1.5">
                        <Link href="/resources" onClick={closeMobileMenu}>
                          <div className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-400 hover:text-[#005DFF] dark:hover:text-[#005DFF] hover:bg-gray-100/50 dark:hover:bg-slate-800/50 rounded-lg transition-colors cursor-pointer" data-testid="link-faq-mobile">
                            {t.nav.faq}
                          </div>
                        </Link>
                        <Link href="/about" onClick={closeMobileMenu}>
                          <div className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-400 hover:text-[#005DFF] dark:hover:text-[#005DFF] hover:bg-gray-100/50 dark:hover:bg-slate-800/50 rounded-lg transition-colors cursor-pointer" data-testid="link-about-mobile">
                            {t.nav.about}
                          </div>
                        </Link>
                        <Link href="/terms" onClick={closeMobileMenu}>
                          <div className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-400 hover:text-[#005DFF] dark:hover:text-[#005DFF] hover:bg-gray-100/50 dark:hover:bg-slate-800/50 rounded-lg transition-colors cursor-pointer" data-testid="link-terms-mobile">
                            {t.footer.legalLinks.terms}
                          </div>
                        </Link>
                        <Link href="/privacy" onClick={closeMobileMenu}>
                          <div className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-400 hover:text-[#005DFF] dark:hover:text-[#005DFF] hover:bg-gray-100/50 dark:hover:bg-slate-800/50 rounded-lg transition-colors cursor-pointer" data-testid="link-privacy-mobile">
                            {t.footer.legalLinks.privacy}
                          </div>
                        </Link>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>

                  {/* Horizontal Language Selector - Mobile */}
                  <div className="pt-4 mt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-2 mb-3">
                        <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">{t.nav.language}</span>
                      </div>
                      
                      {/* Horizontal scroll language buttons */}
                      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hidden pb-2">
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => setLanguage(lang.code)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex-shrink-0 ${
                              language === lang.code
                                ? 'bg-[#005DFF] text-white shadow-lg scale-105'
                                : 'bg-gray-100/80 dark:bg-slate-800/80 text-gray-700 dark:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-slate-700/80'
                            }`}
                            data-testid={`button-language-${lang.code}-mobile`}
                          >
                            <span className="text-base">{lang.flag}</span>
                            <span>{lang.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </nav>
              </div>

              {/* Footer with CTA button */}
              <div className="sticky bottom-0 px-6 py-5 bg-gradient-to-t from-white/95 to-white/80 dark:from-slate-900/95 dark:to-slate-900/80 backdrop-blur-xl border-t border-gray-200/30 dark:border-gray-700/30">
                <Link href="/login" onClick={closeMobileMenu}>
                  <button className="w-full px-6 py-4 bg-gradient-to-r from-[#005DFF] to-[#0044FF] hover:from-[#0044FF] hover:to-[#0033DD] text-white font-bold text-base rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]" data-testid="button-mon-espace-mobile">
                    {t.hero.cta2}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
