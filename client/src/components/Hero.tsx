import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'wouter';

const slides = [
  {
    title: 'Financement Sécurisé',
    highlights: ['Analyse Rapide', 'Offres Compétitives', 'Données Protégées'],
    description: 'Avec nos méthodes agiles, nous répondons à vos besoins avec des solutions sur mesure. Collaborez avec notre équipe dédiée pour réussir vos projets.',
    cta: 'Contactez-nous dès maintenant',
    link: '/contact'
  },
  {
    title: 'Prêts Rapides, Paiement Sécurisé',
    highlights: ['Paiement Instantané', 'Prêt Simplifié', 'Sécurité Assurée'],
    description: 'Profitez d\'un service agile pour financer vos projets. Nos approches innovantes vous offrent une vue claire et précise. Agissez en toute confiance.',
    cta: 'Faites votre demande maintenant',
    link: '/loan-request'
  },
  {
    title: 'Votre Prêt en Simplicité',
    highlights: ['Rapidité', 'Accompagnement', 'Transparence'],
    description: 'Nous allions expertise et flexibilité pour des solutions adaptées. Nos méthodes collaboratives simplifient chaque étape. Donnez vie à vos projets sans attendre.',
    cta: 'Simulez votre prêt aujourd\'hui',
    link: '/loan-request'
  }
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.3),transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.2),transparent_50%)]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`transition-all duration-700 ease-in-out ${
                index === currentSlide
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 absolute inset-0 pointer-events-none translate-x-full'
              }`}
            >
              <div className="text-center text-white space-y-8 max-w-4xl mx-auto">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  {slide.title}
                </h1>

                <div className="flex flex-wrap justify-center gap-4 sm:gap-8 pt-4">
                  {slide.highlights.map((highlight, idx) => (
                    <h2 key={idx} className="text-2xl sm:text-3xl md:text-4xl font-semibold">
                      {highlight}
                    </h2>
                  ))}
                </div>

                <p className="text-lg sm:text-xl md:text-2xl text-white/90 font-light max-w-3xl mx-auto leading-relaxed px-4">
                  {slide.description}
                </p>

                <div className="pt-8">
                  <Link href={slide.link}>
                    <Button
                      size="lg"
                      className="text-base sm:text-lg px-8 sm:px-12 py-6 sm:py-7 bg-white text-blue-600 hover:bg-white/90 shadow-2xl font-semibold text-center"
                      data-testid={`button-cta-${index}`}
                    >
                      {slide.cta}
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-12 h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            data-testid="button-prev-slide"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-12 h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            data-testid="button-next-slide"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        <div className="flex justify-center gap-3 mt-12">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'w-12 bg-white'
                  : 'w-2 bg-white/50 hover:bg-white/70'
              }`}
              data-testid={`button-slide-${index}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
