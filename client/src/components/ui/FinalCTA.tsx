export default function FinalCTA() {
  return (
    <section className="pt-12 pb-20">
      <div className="max-w-4xl mx-auto text-center">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-white to-white border border-gray-100 shadow-soft-2025">
          <h2 className="text-3xl font-semibold text-gray-900">Prêt à concrétiser vos projets ?</h2>
          <p className="mt-2 text-gray-600">Un conseiller dédié vous accompagne de A à Z. Ouvrez votre dossier dès maintenant.</p>
          <div className="mt-6 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4">
            <a 
              href="/loan-request" 
              className="px-6 py-3 rounded-lg bg-[#6366f1] text-white font-semibold shadow-md hover-elevate"
              data-testid="button-open-dossier"
            >
              Ouvrir mon dossier
            </a>
            <a 
              href="/contact" 
              className="px-6 py-3 rounded-lg border border-gray-200 text-gray-700 hover-elevate"
              data-testid="button-contact-adviser"
            >
              Parler à un conseiller
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
