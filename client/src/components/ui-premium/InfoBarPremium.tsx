import React, { useState, useEffect } from "react";
import { CreditCard, Shield, FileText, Briefcase } from "lucide-react";

export default function InfoBarPremium() {
  const messages = [
    { icon: CreditCard, text: "Les virements Altus Finances sont désormais traités sous 24h ouvrées." },
    { icon: Shield, text: "Vos opérations sont protégées par une authentification renforcée." },
    { icon: FileText, text: "Votre contrat numérique est disponible dans votre espace sécurisé." },
    { icon: Briefcase, text: "Altus Finances Group – Solutions professionnelles haut de gamme." }
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const currentMessage = messages[index];
  const Icon = currentMessage.icon;

  return (
    <div className="w-full bg-gradient-to-r from-altusfinances-indigo via-altusfinances-royal to-altusfinances-indigo text-white shadow-md">
      <div className="max-w-[1400px] mx-auto py-2 px-4 text-center">
        <div
          key={index}
          className="flex items-center justify-center gap-2 text-sm font-medium animate-info-fade"
          data-testid="info-bar-message"
        >
          <Icon size={16} />
          <span>{currentMessage.text}</span>
        </div>
      </div>
    </div>
  );
}
