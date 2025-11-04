import Hero from '@/components/Hero';
import Header from '@/components/Header';
import IndividualLoans from '@/components/IndividualLoans';
import BusinessLoans from '@/components/BusinessLoans';
import FeaturesSection from '@/components/FeaturesSection';
import StatsSection from '@/components/StatsSection';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import NotificationBanner from '@/components/NotificationBanner';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-16">
        <div className="container mx-auto px-4 py-2">
          <NotificationBanner />
        </div>
      </div>
      <Hero />
      <StatsSection />
      <IndividualLoans />
      <BusinessLoans />
      <FeaturesSection />
      <Testimonials />
      <FAQ />
      <Footer />
    </div>
  );
}
