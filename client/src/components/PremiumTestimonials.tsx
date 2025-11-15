import { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';

export default function PremiumTestimonials() {
  const t = useTranslations();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  
  const testimonials = [
    {
      nameKey: 'testimonial1Name',
      roleKey: 'testimonial1Role',
      contentKey: 'testimonial1Content',
      rating: 5,
      avatar: 'M.D.'
    },
    {
      nameKey: 'testimonial2Name',
      roleKey: 'testimonial2Role',
      contentKey: 'testimonial2Content',
      rating: 5,
      avatar: 'S.L.'
    },
    {
      nameKey: 'testimonial3Name',
      roleKey: 'testimonial3Role',
      contentKey: 'testimonial3Content',
      rating: 5,
      avatar: 'P.R.'
    },
    {
      nameKey: 'testimonial4Name',
      roleKey: 'testimonial4Role',
      contentKey: 'testimonial4Content',
      rating: 5,
      avatar: 'A.M.'
    }
  ];

  const nextTestimonial = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Auto-rotate
  useEffect(() => {
    const interval = setInterval(() => {
      nextTestimonial();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t.premiumTestimonials?.title || 'Ils nous font confiance'}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t.premiumTestimonials?.subtitle || 'Découvrez les témoignages de nos clients satisfaits'}
          </p>
        </motion.div>

        <div className="relative max-w-5xl mx-auto">
          {/* Main testimonial card */}
          <div className="relative h-[400px] md:h-[350px] overflow-hidden">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                className="absolute w-full"
              >
                <div className="bg-card rounded-2xl p-8 md:p-12 shadow-xl border border-border/50">
                  {/* Quote icon */}
                  <div className="mb-6">
                    <Quote className="w-12 h-12 text-primary/20" />
                  </div>

                  {/* Rating */}
                  <div className="flex gap-1 mb-6">
                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-lg md:text-xl text-foreground leading-relaxed mb-8 italic">
                    "{t.premiumTestimonials?.[testimonials[currentIndex].contentKey] || testimonials[currentIndex].contentKey}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-lg">
                      {testimonials[currentIndex].avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">
                        {t.premiumTestimonials?.[testimonials[currentIndex].nameKey] || testimonials[currentIndex].nameKey}
                      </p>
                      <p className="text-muted-foreground">
                        {t.premiumTestimonials?.[testimonials[currentIndex].roleKey] || testimonials[currentIndex].roleKey}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              size="icon"
              variant="outline"
              onClick={prevTestimonial}
              className="rounded-full"
              data-testid="button-testimonial-prev"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            {/* Dots indicator */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(index > currentIndex ? 1 : -1);
                    setCurrentIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex 
                      ? 'bg-primary w-8' 
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                  data-testid={`button-testimonial-dot-${index}`}
                />
              ))}
            </div>

            <Button
              size="icon"
              variant="outline"
              onClick={nextTestimonial}
              className="rounded-full"
              data-testid="button-testimonial-next"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
