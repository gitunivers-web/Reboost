import React from "react";
import ButtonPremium from "./ButtonPremium";
import { useTranslations } from "@/lib/i18n";

type Props = {
  onMenuClick?: () => void;
  rightNode?: React.ReactNode;
};

export default function TopbarPremium({ onMenuClick, rightNode }: Props) {
  const t = useTranslations();
  
  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-[1300px] mx-auto flex items-center justify-between py-3 px-4 md:px-6">

        <div className="flex items-center gap-4">
          {onMenuClick && (
            <button 
              onClick={onMenuClick} 
              className="p-2 rounded-md hover:bg-gray-100 md:hidden"
              data-testid="button-menu-toggle"
              aria-label="Toggle menu"
            >
              <svg width="22" height="22" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="#0f172a" strokeWidth="1.6"/></svg>
            </button>
          )}

          <div className="flex items-center gap-3">
            <img src="/logo-cropped.png" className="h-8" alt="Altus Finances Group" data-testid="img-logo" />
            <span className="font-semibold text-lg text-altusfinances-ink hidden md:inline" data-testid="text-brand-name">
              Altus Finances Group
            </span>
          </div>
        </div>

        <nav className="hidden md:flex gap-6 text-sm text-altusfinances-muted">
          <a href="/" className="hover:text-altusfinances-royal" data-testid="link-home">{t.nav.home}</a>
          <a href="/products" className="hover:text-altusfinances-royal" data-testid="link-products">{t.nav.products}</a>
          <a href="/how" className="hover:text-altusfinances-royal" data-testid="link-how">{t.nav.howItWorks}</a>
          <a href="/faq" className="hover:text-altusfinances-royal" data-testid="link-faq">{t.nav.faq}</a>
        </nav>

        <div>
          {rightNode ?? <ButtonPremium size="sm" data-testid="button-my-space">{t.hero.cta2}</ButtonPremium>}
        </div>

      </div>
    </header>
  );
}
