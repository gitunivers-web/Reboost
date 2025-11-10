import { useUser } from '@/hooks/use-user';
import { useTranslations } from '@/lib/i18n';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogOut, User, Settings, Home, ArrowLeftRight, History as HistoryIcon } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import logoUrl from '@assets/generated_images/Altus_Finance_transparent_logo_ba91b44e.png';

export default function MobileSidebar() {
  const { data: user } = useUser();
  const t = useTranslations();
  const [location] = useLocation();

  const navItems = [
    {
      label: t.nav.home,
      icon: Home,
      href: '/dashboard',
    },
    {
      label: t.nav.transfers,
      icon: ArrowLeftRight,
      href: '/transfers',
    },
    {
      label: t.nav.history,
      icon: HistoryIcon,
      href: '/history',
    },
    {
      label: t.nav.settings,
      icon: Settings,
      href: '/settings',
    },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location === '/dashboard';
    }
    return location.startsWith(href);
  };

  const getInitials = () => {
    if (!user?.fullName) return 'U';
    const names = user.fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          data-testid="button-menu-toggle"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="w-80 p-0 bg-gradient-to-b from-primary/5 via-background to-background"
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border/50">
            <div className="flex flex-col items-center text-center mb-6">
              <img 
                src={logoUrl} 
                alt="Altus Finance" 
                className="h-20 w-20 mb-4"
                data-testid="img-sidebar-logo"
              />
              <p className="text-xs text-muted-foreground italic">
                Votre partenaire financier de confiance
              </p>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/50">
              <Avatar className="w-12 h-12 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" data-testid="text-sidebar-username">
                  {user?.fullName || 'Utilisateur'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start gap-3 ${
                      active 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'text-muted-foreground'
                    }`}
                    data-testid={`nav-${item.href.replace('/', '')}`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border/50">
            <Link href="/auth">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 text-destructive hover:text-destructive"
                data-testid="button-logout"
              >
                <LogOut className="w-5 h-5" />
                Déconnexion
              </Button>
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
