import { useTranslations } from '@/lib/i18n';

export default function TopBar() {
  const t = useTranslations();
  
  const items = [
    t.topbar.encryption,
    t.topbar.sepaTransfers,
    t.topbar.processing24h,
    t.topbar.systemStatus,
  ];

  return (
    <div className="fixed top-0 left-0 right-0 w-full bg-[#1e293b] text-white overflow-hidden z-[10001] h-10" data-testid="top-bar">
      <div className="container mx-auto px-4 h-full">
        <div className="flex items-center justify-center md:justify-between py-1.5 text-xs md:text-sm h-full">
          <div className="hidden md:flex items-center justify-center gap-8 w-full">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 whitespace-nowrap text-white/90"
                data-testid={`topbar-item-${index}`}
              >
                <span>{item}</span>
              </div>
            ))}
          </div>
          
          <div className="flex md:hidden animate-scroll w-full justify-start">
            <div className="flex items-center gap-8">
              {items.concat(items).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 whitespace-nowrap text-white/90"
                >
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
