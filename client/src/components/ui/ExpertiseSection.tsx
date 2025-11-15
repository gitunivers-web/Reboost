import { Briefcase, Banknote, PieChart } from "lucide-react";

const cards = [
  { icon: <Briefcase />, title: "Financement professionnel", text: "Solutions sur mesure pour entreprises et TPE." },
  { icon: <Banknote />, title: "Financement personnel", text: "Prêts optimisés pour projets privés." },
  { icon: <PieChart />, title: "Consolidation & trésorerie", text: "Rééquilibrage financier et affacturage." },
];

export default function ExpertiseSection() {
  return (
    <section className="pt-12">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl font-semibold text-gray-900">Nos domaines d'expertise</h2>
        <p className="mt-3 text-gray-600">Des solutions adaptées à chaque besoin — professionnel ou personnel.</p>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {cards.map((c, i) => (
          <div key={i} className="p-6 rounded-2xl bg-white shadow-soft-2025 border border-gray-100" data-testid={`card-expertise-${i}`}>
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#e9d5ff] to-[#dbeafe] flex items-center justify-center text-indigo-700">
              {c.icon}
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">{c.title}</h3>
            <p className="mt-2 text-gray-600">{c.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
