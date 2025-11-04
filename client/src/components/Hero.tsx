import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';
import heroImage1 from '@assets/generated_images/Professional_business_handshake_hero_a876f666.png';
import heroImage2 from '@assets/stock_images/professional_busines_f5be1226.jpg';
import heroImage3 from '@assets/stock_images/modern_office_team_c_5fe4ebf4.jpg';
import heroImage4 from '@assets/stock_images/professional_busines_02179932.jpg';
import heroImage5 from '@assets/stock_images/modern_office_team_c_c1f316eb.jpg';
import { Link } from 'wouter';

const heroImages = [heroImage1, heroImage2, heroImage3, heroImage4, heroImage5];

export default function Hero() {
  const t = useTranslations();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = useMemo(
    () =>
      t.hero.slides.map((slide, index) => ({
        ...slide,
        image: heroImages[index],
      })),
    [t.hero.slides]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url(${slide.image})` }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/50" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-8 text-center">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 transition-all duration-700">
          {slides[currentSlide].title}
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto transition-all duration-700">
          {slides[currentSlide].subtitle}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link href="/dashboard">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover-elevate active-elevate-2 gap-2"
              data-testid="button-request-loan"
            >
              {t.hero.cta1}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button
              size="lg"
              variant="outline"
              className="backdrop-blur-md bg-white/20 text-white border-white/30 hover:bg-white/30"
              data-testid="button-my-account"
            >
              {t.hero.cta2}
            </Button>
          </Link>
        </div>

        <div className="flex gap-2 justify-center mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-white w-8'
                  : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Aller à la diapositive ${index + 1}`}
              data-testid={`slide-indicator-${index}`}
            />
          ))}
        </div>

        <div className="text-white/80 text-sm">
          {t.hero.trustIndicator}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-8 w-8 text-white/60" />
      </div>
    </section>
  );
}
