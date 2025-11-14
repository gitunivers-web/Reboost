import { Link } from 'wouter';
import { Button } from './ui/button';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslations } from '@/lib/i18n';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const t = useTranslations();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`
      fixed top-0 left-0 right-0 z-50 transition-all duration-300
      bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl
      border-b border-gray-200 dark:border-slate-700
      ${scrolled ? 'shadow-md' : 'shadow-sm'}
    `}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 lg:h-20">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-90 transition-all flex-shrink-0">
            <img 
              src="/logo.png" 
              alt="Altus Finance Group" 
              className="h-10 sm:h-12 lg:h-14 w-auto"
            />
            <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight hidden sm:block whitespace-nowrap">
              Altus Finance Group
            </span>
          </Link>

          {/* NAVIGATION DESKTOP */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            <Link 
              href="/" 
              className="
                text-gray-700 dark:text-gray-300 font-medium text-sm relative group
                hover:text-gray-900 dark:hover:text-white transition-colors
                after:content-['']
                after:absolute after:-bottom-1 after:left-0
                after:w-0 after:h-[2px]
                after:bg-altus-blue
                after:transition-all after:duration-300
                hover:after:w-full
              "
              data-testid="link-home"
            >
              {t.nav.home}
            </Link>
            
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger 
                    className="
                      text-gray-700 dark:text-gray-300 font-medium text-sm
                      hover:text-gray-900 dark:hover:text-white
                      data-[state=open]:text-altus-blue
                    " 
                    data-testid="button-loans-menu"
                  >
                    {t.nav.loansMenu.label}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-2 p-4">
                      {t.nav.loansMenu.items.map((item, index) => (
                        <li key={index}>
                          <NavigationMenuLink asChild>
                            <Link 
                              href={item.href} 
                              className="block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                              data-testid={`link-loan-${item.href.split('/').pop()}`}
                            >
                              <div className="text-sm font-medium leading-none text-gray-900 dark:text-white">{item.title}</div>
                              <p className="line-clamp-2 text-xs leading-snug text-gray-600 dark:text-gray-400">
                                {item.description}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <Link 
              href="/how-it-works" 
              className="
                text-gray-700 dark:text-gray-300 font-medium text-sm relative
                hover:text-gray-900 dark:hover:text-white transition-colors
                after:content-['']
                after:absolute after:-bottom-1 after:left-0
                after:w-0 after:h-[2px]
                after:bg-altus-blue
                after:transition-all after:duration-300
                hover:after:w-full
              "
              data-testid="link-how-it-works"
            >
              {t.nav.howItWorks}
            </Link>
            
            <Link 
              href="/resources" 
              className="
                text-gray-700 dark:text-gray-300 font-medium text-sm relative
                hover:text-gray-900 dark:hover:text-white transition-colors
                after:content-['']
                after:absolute after:-bottom-1 after:left-0
                after:w-0 after:h-[2px]
                after:bg-altus-blue
                after:transition-all after:duration-300
                hover:after:w-full
              "
              data-testid="link-faq"
            >
              {t.nav.faq}
            </Link>
            
            <Link 
              href="/about" 
              className="
                text-gray-700 dark:text-gray-300 font-medium text-sm relative
                hover:text-gray-900 dark:hover:text-white transition-colors
                after:content-['']
                after:absolute after:-bottom-1 after:left-0
                after:w-0 after:h-[2px]
                after:bg-altus-blue
                after:transition-all after:duration-300
                hover:after:w-full
              "
              data-testid="link-about"
            >
              {t.nav.about}
            </Link>
            
            <Link 
              href="/contact" 
              className="
                text-gray-700 dark:text-gray-300 font-medium text-sm relative
                hover:text-gray-900 dark:hover:text-white transition-colors
                after:content-['']
                after:absolute after:-bottom-1 after:left-0
                after:w-0 after:h-[2px]
                after:bg-altus-blue
                after:transition-all after:duration-300
                hover:after:w-full
              "
              data-testid="link-contact"
            >
              {t.nav.contact}
            </Link>
          </nav>

          {/* RIGHT AREA */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-4 flex-shrink-0">
            {/* PHONE */}
            <a 
              href={`tel:${t.nav.phone}`} 
              className="text-sm font-semibold text-altus-blue hover:text-altus-purple transition-colors tracking-wide hidden xl:block whitespace-nowrap"
              data-testid="link-phone"
            >
              {t.nav.phone}
            </a>

            {/* LANGUAGE SELECTOR */}
            <LanguageSwitcher scrolled={true} />

            {/* CTA BUTTON */}
            <Link href="/login">
              <Button
                className="
                  px-5 py-2 text-sm font-semibold
                  bg-altus-blue hover:bg-altus-purple text-white
                  rounded-xl shadow-md
                  relative overflow-hidden
                  transition-all
                  whitespace-nowrap
                "
                data-testid="button-mon-espace"
              >
                <span className="relative z-10">{t.hero.cta2}</span>
                <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-shine" />
              </Button>
            </Link>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-slate-800 flex-shrink-0"
            data-testid="button-mobile-menu"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={24} className="text-gray-900 dark:text-white" /> : <Menu size={24} className="text-gray-900 dark:text-white" />}
          </button>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 dark:border-slate-700">
            <nav className="flex flex-col space-y-2">
              <Link 
                href="/" 
                className="text-sm font-medium transition-all px-4 py-2 rounded-lg hover:bg-altus-blue/10 dark:hover:bg-altus-blue/20 text-gray-700 dark:text-gray-300"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="link-home-mobile"
              >
                {t.nav.home}
              </Link>
              
              <div className="px-4 py-2">
                <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">{t.nav.loansMenu.label}</div>
                {t.nav.loansMenu.items.map((item, index) => (
                  <Link 
                    key={index}
                    href={item.href} 
                    className="block text-sm transition-all px-3 py-2 rounded-lg hover:bg-altus-blue/10 dark:hover:bg-altus-blue/20 text-gray-700 dark:text-gray-300"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid={`link-loan-${item.href.split('/').pop()}-mobile`}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
              
              <Link 
                href="/how-it-works" 
                className="text-sm font-medium transition-all px-4 py-2 rounded-lg hover:bg-altus-blue/10 dark:hover:bg-altus-blue/20 text-gray-700 dark:text-gray-300"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="link-how-it-works-mobile"
              >
                {t.nav.howItWorks}
              </Link>
              
              <Link 
                href="/resources" 
                className="text-sm font-medium transition-all px-4 py-2 rounded-lg hover:bg-altus-blue/10 dark:hover:bg-altus-blue/20 text-gray-700 dark:text-gray-300"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="link-faq-mobile"
              >
                {t.nav.faq}
              </Link>
              
              <Link 
                href="/about" 
                className="text-sm font-medium transition-all px-4 py-2 rounded-lg hover:bg-altus-blue/10 dark:hover:bg-altus-blue/20 text-gray-700 dark:text-gray-300"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="link-about-mobile"
              >
                {t.nav.about}
              </Link>
              
              <Link 
                href="/contact" 
                className="text-sm font-medium transition-all px-4 py-2 rounded-lg hover:bg-altus-blue/10 dark:hover:bg-altus-blue/20 text-gray-700 dark:text-gray-300"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="link-contact-mobile"
              >
                {t.nav.contact}
              </Link>
              
              <div className="flex items-center gap-2 pt-2 px-4">
                <a 
                  href={`tel:${t.nav.phone}`} 
                  className="text-sm font-semibold text-altus-blue"
                  data-testid="link-phone-mobile"
                >
                  {t.nav.phone}
                </a>
              </div>
              
              <div className="flex items-center gap-2 px-4">
                <LanguageSwitcher scrolled={true} />
              </div>
              
              <Link 
                href="/login" 
                onClick={() => setMobileMenuOpen(false)}
                data-testid="link-mon-espace-mobile"
                className="px-4"
              >
                <Button 
                  className="w-full bg-altus-blue hover:bg-altus-purple text-white font-semibold relative overflow-hidden"
                >
                  <span className="relative z-10">{t.hero.cta2}</span>
                  <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
