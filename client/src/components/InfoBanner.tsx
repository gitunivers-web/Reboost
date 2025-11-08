import { Shield, TrendingUp, Lock, CheckCircle, Clock } from 'lucide-react';

export default function InfoBanner() {
  const infoItems = [
    {
      icon: Shield,
      text: "Vos données sont protégées par un cryptage bancaire de niveau militaire",
    },
    {
      icon: TrendingUp,
      text: "Taux compétitifs à partir de 2.9% - Économisez sur vos emprunts",
    },
    {
      icon: CheckCircle,
      text: "Approbation rapide - Réponse en 24h pour la plupart des demandes",
    },
    {
      icon: Lock,
      text: "Établissement régulé et supervisé par l'Autorité Bancaire Européenne",
    },
    {
      icon: Clock,
      text: "Support client disponible 24/7 pour vous accompagner",
    },
  ];

  return (
    <div className="bg-primary dark:bg-primary/90 border-b border-primary/20 overflow-hidden">
      <div className="flex overflow-x-hidden">
        <div className="py-2 animate-marquee whitespace-nowrap flex items-center gap-8 pr-8">
          {infoItems.concat(infoItems).map((item, index) => (
            <div key={`scroll-${index}`} className="flex items-center gap-2 text-primary-foreground text-xs">
              <item.icon className="w-3 h-3 flex-shrink-0" />
              <span className="font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
