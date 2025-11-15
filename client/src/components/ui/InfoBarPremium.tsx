import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Zap, FileText, Users } from "lucide-react";

const MESSAGES = [
  { icon: Lock, text: "Authentification renforcée – Vos données sont protégées." },
  { icon: Zap, text: "Demandes traitées en 24h ouvrées (sous conditions)." },
  { icon: FileText, text: "Contrat numérique : signature sécurisée et traçable." },
  { icon: Users, text: "Conseillers dédiés — accompagnement personnalisé." }
];

export default function InfoBarPremium() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % MESSAGES.length), 3800);
    return () => clearInterval(t);
  }, []);

  const CurrentIcon = MESSAGES[idx].icon;
  
  return (
    <div className="w-full bg-gradient-to-r from-[#5b21b6] via-[#6366f1] to-[#3b82f6] text-white">
      <div className="max-w-[1200px] mx-auto px-4 py-2 text-center text-sm">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-2"
        >
          <CurrentIcon className="h-4 w-4" />
          <span>{MESSAGES[idx].text}</span>
        </motion.div>
      </div>
    </div>
  );
}
