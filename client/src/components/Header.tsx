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
import logoUrl from '@assets/Logo_1762619815448.jpeg';

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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-primary/20 ${
      scrolled 
        ? 'bg-white dark:bg-[#003D6F] shadow-md' 
        : 'bg-white dark:bg-[#003D6F] shadow-sm'
    }`}>
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-90 transition-all">
              <img src={logoUrl} alt="Altus Finance Group" className="h-10 sm:h-12 lg:h-16 w-auto" />
              <span className="text-base sm:text-lg lg:text-xl font-bold text-primary whitespace-nowrap hidden sm:block">
                Altus Finance Group
              </span>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            <Link href="/" className="text-xs xl:text-sm font-medium transition-all px-2 xl:px-4 py-2 rounded-md hover:bg-primary hover:text-white whitespace-nowrap">
              {t.nav.home}
            </Link>
            
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-xs xl:text-sm font-medium hover:bg-primary hover:text-white data-[state=open]:bg-primary data-[state=open]:text-white px-2 xl:px-4 whitespace-nowrap">
                    {t.nav.products}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[350px] xl:w-[400px] gap-3 p-4">
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

            <Link href="/how-it-works" className="text-xs xl:text-sm font-medium transition-all px-2 xl:px-4 py-2 rounded-md hover:bg-primary hover:text-white whitespace-nowrap">
              {t.nav.howItWorks}
            </Link>
            <Link href="/resources" className="text-xs xl:text-sm font-medium transition-all px-2 xl:px-4 py-2 rounded-md hover:bg-primary hover:text-white whitespace-nowrap">
              {t.nav.resources}
            </Link>
            <Link href="/about" className="text-xs xl:text-sm font-medium transition-all px-2 xl:px-4 py-2 rounded-md hover:bg-primary hover:text-white whitespace-nowrap">
              {t.nav.about}
            </Link>
            <Link href="/contact" className="text-xs xl:text-sm font-medium transition-all px-2 xl:px-4 py-2 rounded-md hover:bg-primary hover:text-white whitespace-nowrap">
              {t.nav.contact}
            </Link>
          </nav>

          <div className="hidden lg:flex items-center gap-1 xl:gap-2 flex-shrink-0">
            <LanguageSwitcher scrolled={true} />
            <Link href="/login">
              <Button 
                variant="default" 
                className="text-xs xl:text-sm px-3 xl:px-4 whitespace-nowrap"
                data-testid="button-mon-espace"
              >
                {t.hero.cta2}
              </Button>
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-md transition-colors hover:bg-accent"
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-2">
              <Link 
                href="/" 
                className="text-sm font-medium transition-all px-4 py-2 rounded-md hover:bg-primary hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="link-home-mobile"
              >
                {t.nav.home}
              </Link>
              <Link 
                href="/products" 
                className="text-sm font-medium transition-all px-4 py-2 rounded-md hover:bg-primary hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="link-products-mobile"
              >
                {t.nav.products}
              </Link>
              <Link 
                href="/how-it-works" 
                className="text-sm font-medium transition-all px-4 py-2 rounded-md hover:bg-primary hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="link-how-it-works-mobile"
              >
                {t.nav.howItWorks}
              </Link>
              <Link 
                href="/resources" 
                className="text-sm font-medium transition-all px-4 py-2 rounded-md hover:bg-primary hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="link-resources-mobile"
              >
                {t.nav.resources}
              </Link>
              <Link 
                href="/about" 
                className="text-sm font-medium transition-all px-4 py-2 rounded-md hover:bg-primary hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="link-about-mobile"
              >
                {t.nav.about}
              </Link>
              <Link 
                href="/contact" 
                className="text-sm font-medium transition-all px-4 py-2 rounded-md hover:bg-primary hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="link-contact-mobile"
              >
                {t.nav.contact}
              </Link>
              <div className="flex items-center gap-2 pt-2">
                <LanguageSwitcher scrolled={true} />
              </div>
              <Link 
                href="/login" 
                onClick={() => setMobileMenuOpen(false)}
                data-testid="link-mon-espace-mobile"
              >
                <Button className="w-full" variant="default">
                  {t.hero.cta2}
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
