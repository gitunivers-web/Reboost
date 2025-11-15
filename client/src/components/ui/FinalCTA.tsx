import { Link } from "wouter";
import { useTranslations } from "@/lib/i18n";

export default function FinalCTA() {
  const t = useTranslations();
  
  return (
    <section className="pt-12 pb-20">
      <div className="max-w-4xl mx-auto text-center">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-white to-white border border-gray-100 shadow-soft-2025">
          <h2 className="text-3xl font-semibold text-gray-900">{t.premium.finalCTA.title}</h2>
          <p className="mt-2 text-gray-600">{t.premium.finalCTA.subtitle}</p>
          <div className="mt-6 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4">
            <Link 
              href="/loan-request" 
              className="px-6 py-3 rounded-lg bg-[#6366f1] text-white font-semibold shadow-md hover-elevate"
              data-testid="button-open-dossier"
            >
              {t.premium.finalCTA.primaryButton}
            </Link>
            <Link 
              href="/contact" 
              className="px-6 py-3 rounded-lg border border-gray-200 text-gray-700 hover-elevate"
              data-testid="button-contact-adviser"
            >
              {t.premium.finalCTA.secondaryButton}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
