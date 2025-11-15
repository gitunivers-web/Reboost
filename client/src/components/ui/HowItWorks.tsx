import { motion } from "framer-motion";
import { ClipboardList, CheckCircle, Pencil, Sparkles } from "lucide-react";

const steps = [
  { icon: <Pencil />, title: "1 — Soumission", desc: "Remplissez votre dossier en quelques minutes." },
  { icon: <ClipboardList />, title: "2 — Analyse", desc: "Vérification KYC & évaluation rapide." },
  { icon: <CheckCircle />, title: "3 — Signature", desc: "Signature électronique sécurisée." },
  { icon: <Sparkles />, title: "4 — Déblocage", desc: "Mise à disposition sous 24h ouvrées." }
];

export default function HowItWorks() {
  return (
    <section className="pt-12">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-semibold text-gray-900">Comment ça marche</h2>
        <p className="mt-2 text-gray-600">Un processus simple, transparent et sécurisé.</p>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, duration: 0.5 }}
            className="p-6 text-center rounded-2xl bg-white shadow-soft-2025 border border-gray-100"
            data-testid={`card-step-${i}`}
          >
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              {s.icon}
            </div>
            <h3 className="mt-4 font-semibold text-gray-900">{s.title}</h3>
            <p className="mt-2 text-gray-600">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
