import { useUser } from '@/hooks/use-user';
import { CreditCard } from 'lucide-react';

interface VirtualBankCardProps {
  className?: string;
}

export default function VirtualBankCard({ className = '' }: VirtualBankCardProps) {
  const { data: user } = useUser();

  const cardNumber = "1234 5679 9012 3456";
  const userName = user?.fullName.toUpperCase() || "UTILISATEUR";

  return (
    <div className={`relative w-full max-w-sm ${className}`} data-testid="card-virtual-bank">
      <div className="dashboard-card-3d relative aspect-[1.586/1] p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-2xl"></div>
        
        <div className="relative h-full flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">A</span>
                </div>
              </div>
              <div className="text-white">
                <div className="text-xs font-bold">Solventis</div>
                <div className="text-[8px] opacity-80">FINANCE GROUP</div>
              </div>
            </div>
            <CreditCard className="w-8 h-8 text-yellow-400 opacity-70" />
          </div>

          <div className="space-y-4">
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((group) => (
                <div key={group} className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                  <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                  <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                  <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                  {group < 3 && <div className="w-2"></div>}
                </div>
              ))}
            </div>

            <div>
              <div className="text-white text-lg md:text-xl font-mono tracking-wider" data-testid="text-card-number">
                {cardNumber}
              </div>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <div className="text-white/60 text-[10px] uppercase tracking-wide">Titulaire</div>
                <div className="text-white text-sm font-semibold tracking-wide" data-testid="text-card-holder">
                  {userName}
                </div>
              </div>
              <div className="text-right">
                <div className="text-white/60 text-[10px] uppercase">Expire</div>
                <div className="text-white text-sm font-mono">12/28</div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
