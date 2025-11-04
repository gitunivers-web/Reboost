import { Link } from 'wouter';
import { Button } from './ui/button';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
      scrolled 
        ? 'bg-white dark:bg-slate-900 shadow-md' 
        : 'bg-blue-600 dark:bg-blue-800'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className={`text-2xl font-bold hover:opacity-90 transition-all ${
              scrolled ? 'text-primary' : 'text-white dark:text-white'
            }`}>
              ProLoan
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className={`text-sm font-medium transition-colors ${
              scrolled ? 'hover:text-primary' : 'text-white/90 hover:text-white dark:text-white/90 dark:hover:text-white'
            }`}>
              {t.nav.home}
            </Link>
            
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className={`text-sm font-medium ${
                    scrolled ? '' : 'text-white dark:text-white'
                  }`}>
                    {t.nav.products}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link href="/products" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">{t.products.title}</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {t.products.subtitle}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <Link href="/how-it-works" className={`text-sm font-medium transition-colors ${
              scrolled ? 'hover:text-primary' : 'text-white/90 hover:text-white dark:text-white/90 dark:hover:text-white'
            }`}>
              {t.nav.howItWorks}
            </Link>
            <Link href="/resources" className={`text-sm font-medium transition-colors ${
              scrolled ? 'hover:text-primary' : 'text-white/90 hover:text-white dark:text-white/90 dark:hover:text-white'
            }`}>
              {t.nav.resources}
            </Link>
            <Link href="/about" className={`text-sm font-medium transition-colors ${
              scrolled ? 'hover:text-primary' : 'text-white/90 hover:text-white dark:text-white/90 dark:hover:text-white'
            }`}>
              {t.nav.about}
            </Link>
            <Link href="/contact" className={`text-sm font-medium transition-colors ${
              scrolled ? 'hover:text-primary' : 'text-white/90 hover:text-white dark:text-white/90 dark:hover:text-white'
            }`}>
              {t.nav.contact}
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link href="/dashboard">
              <Button variant={scrolled ? "default" : "secondary"}>{t.hero.cta2}</Button>
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-md transition-colors ${
              scrolled ? 'hover:bg-accent' : 'hover:bg-white/10'
            }`}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X size={24} className={scrolled ? '' : 'text-white'} /> : <Menu size={24} className={scrolled ? '' : 'text-white'} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className={`md:hidden py-4 border-t ${scrolled ? 'border-border' : 'border-white/20'}`}>
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className={`text-sm font-medium transition-colors ${
                  scrolled ? 'hover:text-primary' : 'text-white/90 hover:text-white'
                }`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid="link-home-mobile"
              >
                {t.nav.home}
              </Link>
              <Link 
                href="/products" 
                className={`text-sm font-medium transition-colors ${
                  scrolled ? 'hover:text-primary' : 'text-white/90 hover:text-white'
                }`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid="link-products-mobile"
              >
                {t.nav.products}
              </Link>
              <Link 
                href="/how-it-works" 
                className={`text-sm font-medium transition-colors ${
                  scrolled ? 'hover:text-primary' : 'text-white/90 hover:text-white'
                }`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid="link-how-it-works-mobile"
              >
                {t.nav.howItWorks}
              </Link>
              <Link 
                href="/resources" 
                className={`text-sm font-medium transition-colors ${
                  scrolled ? 'hover:text-primary' : 'text-white/90 hover:text-white'
                }`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid="link-resources-mobile"
              >
                {t.nav.resources}
              </Link>
              <Link 
                href="/about" 
                className={`text-sm font-medium transition-colors ${
                  scrolled ? 'hover:text-primary' : 'text-white/90 hover:text-white'
                }`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid="link-about-mobile"
              >
                {t.nav.about}
              </Link>
              <Link 
                href="/contact" 
                className={`text-sm font-medium transition-colors ${
                  scrolled ? 'hover:text-primary' : 'text-white/90 hover:text-white'
                }`}
                onClick={() => setMobileMenuOpen(false)}
                data-testid="link-contact-mobile"
              >
                {t.nav.contact}
              </Link>
              <div className="flex items-center gap-2 pt-2">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
              <Link 
                href="/dashboard" 
                onClick={() => setMobileMenuOpen(false)}
                data-testid="link-dashboard-mobile"
              >
                <Button className="w-full" variant={scrolled ? "default" : "secondary"}>{t.hero.cta2}</Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
