import { useLocation } from "wouter";
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { useTranslations } from "@/lib/i18n";

export default function FooterPremium() {
  const [, setLocation] = useLocation();
  const t = useTranslations();
  
  const footerLinks = {
    solutions: [
      { label: t.footer.products.business, href: "/products" },
      { label: t.footer.products.personal, href: "/products" },
      { label: t.footer.products.mortgage, href: "/products" },
      { label: t.footer.products.auto, href: "/products" }
    ],
    company: [
      { label: t.nav.about, href: "/about" },
      { label: t.nav.howItWorks, href: "/how-it-works" },
      { label: t.nav.contact, href: "/contact" },
      { label: t.nav.resources, href: "/resources" }
    ],
    legal: [
      { label: t.footer.legalLinks.terms, href: "/terms" },
      { label: t.footer.legalLinks.privacy, href: "/privacy" }
    ]
  };
  
  return (
    <footer className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white">
      {/* Subtle top border accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
              Altus Finances Group
            </div>
            <p className="text-slate-400 mb-6 leading-relaxed max-w-md">
              {t.footer.description}
            </p>
            
            {/* Contact info */}
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-blue-400" />
                <a href="mailto:infos@altusfinancesgroup.com" className="hover:text-white transition-colors" data-testid="link-footer-email">
                  infos@altusfinancesgroup.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-blue-400" />
                <a href="tel:+35240634" className="hover:text-white transition-colors" data-testid="link-footer-phone">
                  +352 40 63 48
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-blue-400 mt-0.5" />
                <span>19 Rue Sigismond<br />L-2537 Luxembourg</span>
              </div>
            </div>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-300 mb-5">{t.footer.productsTitle}</h3>
            <ul className="space-y-3">
              {footerLinks.solutions.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    onClick={(e) => { e.preventDefault(); setLocation(link.href); }} 
                    className="text-slate-400 hover:text-blue-400 transition-colors text-sm" 
                    data-testid={`link-footer-solution-${index}`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-300 mb-5">{t.footer.companyTitle}</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    onClick={(e) => { e.preventDefault(); setLocation(link.href); }} 
                    className="text-slate-400 hover:text-blue-400 transition-colors text-sm" 
                    data-testid={`link-footer-company-${index}`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-300 mb-5">{t.footer.legalTitle || 'Légal'}</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    onClick={(e) => { e.preventDefault(); setLocation(link.href); }} 
                    className="text-slate-400 hover:text-blue-400 transition-colors text-sm" 
                    data-testid={`link-footer-legal-nav-${index}`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 my-8" />

        {/* Bottom footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-slate-500">
            {t.footer.copyright}
          </div>

          {/* Social links */}
          <div className="flex items-center gap-3">
            <a href="#" className="p-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 transition-all duration-200" aria-label="Facebook" data-testid="link-facebook">
              <Facebook className="h-4 w-4 text-slate-400 hover:text-blue-400 transition-colors" />
            </a>
            <a href="#" className="p-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 transition-all duration-200" aria-label="Twitter" data-testid="link-twitter">
              <Twitter className="h-4 w-4 text-slate-400 hover:text-blue-400 transition-colors" />
            </a>
            <a href="#" className="p-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 transition-all duration-200" aria-label="LinkedIn" data-testid="link-linkedin">
              <Linkedin className="h-4 w-4 text-slate-400 hover:text-blue-400 transition-colors" />
            </a>
            <a href="#" className="p-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 transition-all duration-200" aria-label="Instagram" data-testid="link-instagram">
              <Instagram className="h-4 w-4 text-slate-400 hover:text-blue-400 transition-colors" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
