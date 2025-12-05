import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const reviews = [
  { text: "Service rapide et pro. Désormais je conseille Solventis.", author: "M. Dupont" },
  { text: "Excellent accompagnement pour mon entreprise.", author: "S. Martin" },
  { text: "Contrat signé en ligne, fonds disponibles rapidement.", author: "A. Renaud" }
];

export default function Testimonials() {
  return (
    <section className="pt-12">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-semibold text-gray-900">Ils nous font confiance</h2>
        <p className="mt-2 text-gray-600">Avis vérifiés de clients accompagnés par Solventis.</p>
      </div>

      <div className="mt-8 max-w-2xl mx-auto">
        <Swiper spaceBetween={20} slidesPerView={1} loop>
          {reviews.map((r, i) => (
            <SwiperSlide key={i}>
              <div className="p-6 rounded-2xl bg-white shadow-soft-2025 border border-gray-100" data-testid={`card-testimonial-${i}`}>
                <p className="text-gray-800">"{r.text}"</p>
                <p className="mt-4 font-semibold text-indigo-600">— {r.author}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
