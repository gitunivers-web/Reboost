import HeroCarousel from '@/components/HeroCarousel';
import Header from '@/components/Header';
import IndividualLoanShowcase from '@/components/IndividualLoanShowcase';
import BusinessLoanShowcase from '@/components/BusinessLoanShowcase';
import FeaturesSection from '@/components/FeaturesSection';
import StatsSection from '@/components/StatsSection';
import ScrollingTestimonials from '@/components/ScrollingTestimonials';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import GuaranteesSection from '@/components/GuaranteesSection';
import ProcessTimeline from '@/components/ProcessTimeline';
import PartnersSection from '@/components/PartnersSection';
import ExpertiseSection from '@/components/ExpertiseSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import PremiumTestimonials from '@/components/PremiumTestimonials';
import BankingSecuritySection from '@/components/BankingSecuritySection';
import FinalCTASection from '@/components/FinalCTASection';
import SEO from '@/components/SEO';
import { organizationSchema, websiteSchema } from '@/lib/seo-data';
import { getKeywordsByPage } from '@/lib/seo-keywords';
import { useTranslations } from '@/lib/i18n';

export default function Home() {
  const t = useTranslations();
  
  return (
    <div className="min-h-screen">
      <SEO
        title={t.seo.home.title}
        description={t.seo.home.description}
        keywords={getKeywordsByPage('home')}
        path="/"
        structuredData={[organizationSchema, websiteSchema]}
      />
      <Header />
      <HeroCarousel />
      <StatsSection />
      <IndividualLoanShowcase />
      <BusinessLoanShowcase />
      <GuaranteesSection />
      <ExpertiseSection />
      <HowItWorksSection />
      <PremiumTestimonials />
      <BankingSecuritySection />
      <ProcessTimeline />
      <FeaturesSection />
      <PartnersSection />
      <ScrollingTestimonials />
      <FAQ />
      <FinalCTASection />
      <Footer />
    </div>
  );
}
