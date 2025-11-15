import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const MESSAGES = [
  "🔒 Authentification renforcée – Vos données sont protégées.",
  "⚡ Demandes traitées en 24h ouvrées (sous conditions).",
  "📄 Contrat numérique : signature sécurisée et traçable.",
  "🤝 Conseillers dédiés — accompagnement personnalisé."
];

export default function InfoBarPremium() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % MESSAGES.length), 3800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="w-full bg-gradient-to-r from-[#5b21b6] via-[#6366f1] to-[#3b82f6] text-white">
      <div className="max-w-[1200px] mx-auto px-4 py-2 text-center text-sm">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.6 }}
        >
          {MESSAGES[idx]}
        </motion.div>
      </div>
    </div>
  );
}
