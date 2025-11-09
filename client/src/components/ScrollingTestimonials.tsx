import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';

export default function ScrollingTestimonials() {
  const t = useTranslations();
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const scrollContent = scroller.querySelector('.scroll-content') as HTMLElement;
    if (!scrollContent) return;

    // Clean up any existing clones
    const existingClones = scroller.querySelectorAll('.scroll-content:not(:first-child)');
    existingClones.forEach(clone => clone.remove());

    // Create new clone with updated content
    const clone = scrollContent.cloneNode(true) as HTMLElement;
    scroller.appendChild(clone);

    let scrollPosition = 0;
    const scrollSpeed = 0.5;
    let animationFrame: number;

    const animate = () => {
      scrollPosition += scrollSpeed;
      const maxScroll = scrollContent.scrollWidth;

      if (scrollPosition >= maxScroll) {
        scrollPosition = 0;
      }

      scroller.scrollLeft = scrollPosition;
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
      // Clean up clones when component unmounts or dependencies change
      const clones = scroller.querySelectorAll('.scroll-content:not(:first-child)');
      clones.forEach(clone => clone.remove());
    };
  }, [t.testimonials.reviews]);

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-background to-muted/30 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-10 md:mb-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            {t.testimonials.title}
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground">
            {t.testimonials.subtitle}
          </p>
        </div>
      </div>

      <div 
        ref={scrollerRef}
        className="relative overflow-hidden hide-scrollbar"
        style={{ whiteSpace: 'nowrap' }}
      >
        <div className="scroll-content inline-flex gap-4 sm:gap-6 pr-4 sm:pr-6">
          {t.testimonials.reviews.map((review, index) => (
            <Card 
              key={index} 
              className="inline-block w-[280px] sm:w-[320px] md:w-[350px] p-4 sm:p-6 align-top bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-shadow"
              style={{ whiteSpace: 'normal' }}
              data-testid={`card-review-${index}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-semibold text-white text-lg">
                  {review.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{review.name}</h4>
                  <p className="text-sm text-muted-foreground">{review.role}</p>
                  <p className="text-xs text-muted-foreground">{review.company}</p>
                </div>
              </div>

              <div className="flex gap-1 mb-3">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {review.text}
              </p>
            </Card>
          ))}
        </div>
      </div>

      <style>{`
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
