import { Link } from 'wouter';
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';

export default function Footer() {
  const t = useTranslations();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    products: [
      { name: t.footer.products.personal, href: '/products' },
      { name: t.footer.products.business, href: '/products' },
      { name: t.footer.products.mortgage, href: '/products' },
      { name: t.footer.products.auto, href: '/products' },
      { name: t.footer.products.renovation, href: '/products' },
    ],
    company: [
      { name: t.nav.about, href: '/about' },
      { name: t.nav.howItWorks, href: '/how-it-works' },
      { name: t.nav.resources, href: '/resources' },
      { name: t.nav.contact, href: '/contact' },
      { name: t.footer.careers, href: '/contact' },
    ],
    legal: [
      { name: t.footer.legalLinks.terms, href: '/terms' },
      { name: t.footer.legalLinks.privacy, href: '/privacy' },
      { name: t.footer.legalLinks.cgu, href: '/terms' },
      { name: t.footer.legalLinks.cookies, href: '/privacy' },
      { name: t.footer.legalLinks.gdpr, href: '/privacy' },
    ],
    help: [
      { name: t.footer.helpLinks.faq, href: '/resources' },
      { name: t.footer.helpLinks.userGuide, href: '/how-it-works' },
      { name: t.footer.helpLinks.support, href: '/contact' },
      { name: t.footer.helpLinks.simulator, href: '/dashboard' },
      { name: t.footer.helpLinks.contactUs, href: '/contact' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Instagram, href: '#', label: 'Instagram' },
  ];

  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Brand and Contact */}
          <div className="sm:col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="text-xl sm:text-2xl font-bold text-primary hover:opacity-90 transition-opacity inline-block mb-3 sm:mb-4">
              Altus Finance Group
            </Link>
            <p className="text-sm text-muted-foreground mb-3 sm:mb-4">
              {t.footer.description}
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{t.footer.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{t.footer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{t.footer.address}</span>
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold mb-4">{t.footer.productsTitle}</h3>
            <ul className="space-y-2 text-sm">
              {footerLinks.products.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">{t.footer.companyTitle}</h3>
            <ul className="space-y-2 text-sm">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">{t.footer.legalTitle}</h3>
            <ul className="space-y-2 text-sm">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-semibold mb-4">{t.footer.helpTitle}</h3>
            <ul className="space-y-2 text-sm">
              {footerLinks.help.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-6 sm:pt-8 border-t gap-4">
          <div className="text-sm text-muted-foreground text-center md:text-left">
            <p>© {currentYear} {t.footer.copyright}</p>
            <p className="text-xs mt-1">
              {t.footer.regulatory}
            </p>
          </div>

          <div className="flex gap-3 sm:gap-4">
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                  data-testid={`link-social-${social.label.toLowerCase()}`}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Regulatory Information */}
        <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t">
          <p className="text-xs text-muted-foreground text-center max-w-4xl mx-auto">
            {t.footer.disclaimer}
          </p>
        </div>
      </div>
    </footer>
  );
}
