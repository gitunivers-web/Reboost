import HeroCarousel from '@/components/HeroCarousel';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InfoBarPremium from '@/components/ui/InfoBarPremium';
import ExpertiseSection from '@/components/ui/ExpertiseSection';
import HowItWorks from '@/components/ui/HowItWorks';
import Testimonials from '@/components/ui/Testimonials';
import SecuritySection from '@/components/ui/SecuritySection';
import FinalCTA from '@/components/ui/FinalCTA';
import SEO from '@/components/SEO';
import { organizationSchema, websiteSchema } from '@/lib/seo-data';
import { getKeywordsByPage } from '@/lib/seo-keywords';
import { useTranslations } from '@/lib/i18n';

export default function Home() {
  const t = useTranslations();
  
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={t.seo.home.title}
        description={t.seo.home.description}
        keywords={getKeywordsByPage('home')}
        path="/"
        structuredData={[organizationSchema, websiteSchema]}
      />
      <Header />
      <HeroCarousel />
      
      {/* Nouveau design premium 2025 */}
      <InfoBarPremium />

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16 py-16">
        <ExpertiseSection />
        <HowItWorks />
        <Testimonials />
        <SecuritySection />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
