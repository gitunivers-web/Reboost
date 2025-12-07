import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Home, CreditCard, ArrowRightLeft, History, Settings, LogOut, ShieldCheck, Users, FileText, BarChart, Building2, Mail, MessageSquare, TrendingUp } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';
import { useLocation } from 'wouter';
import { useUser, getUserInitials, getAccountTypeLabel, useUserProfilePhotoUrl } from '@/hooks/use-user';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import { useDataSocketUpdates } from '@/hooks/use-data-socket-updates';

export default function AppSidebar() {
  const t = useTranslations();
  const [location, setLocation] = useLocation();
  const { setOpenMobile } = useSidebar();
  const { data: user, isLoading: isUserLoading } = useUser();
  const profilePhotoUrl = useUserProfilePhotoUrl();

  const isAdminPath = location.startsWith('/admin');
  const isAdmin = user?.role === 'admin';

  useDataSocketUpdates();

  // Auto-close mobile menu when location changes
  useEffect(() => {
    setOpenMobile(false);
  }, [location, setOpenMobile]);

  const handleLogout = useCallback(() => {
    setOpenMobile(false);
    setLocation('/');
  }, [setLocation, setOpenMobile]);

  const handleNavigate = useCallback((url: string) => {
    setOpenMobile(false);
    setLocation(url);
  }, [setLocation, setOpenMobile]);

  const { data: loans } = useQuery<any[]>({
    queryKey: ['/api/loans'],
    enabled: !isAdminPath,
  });

  const { data: transfers } = useQuery<any[]>({
    queryKey: ['/api/transfers'],
    enabled: !isAdminPath,
  });

  // Prêts en attente = tous les prêts en cours de traitement (pas encore actifs)
  // Exclut tous les statuts terminaux
  const excludedStatuses = ['active', 'rejected', 'cancelled', 'completed', 'closed', 'repaid', 'defaulted', 'written_off'];
  const pendingLoansCount = loans?.filter(l => l.status && !excludedStatuses.includes(l.status)).length || 0;
  const inProgressTransfersCount = transfers?.filter(t => t.status === 'in-progress' || t.status === 'in_progress').length || 0;

  const loanMenuItems = [
    { 
      title: t.nav.myLoans || 'Mes prêts', 
      url: '/loans', 
      icon: CreditCard,
      badge: pendingLoansCount > 0 ? pendingLoansCount : undefined,
    },
    { title: t.nav.contracts || 'Contrats', url: '/contracts', icon: FileText },
  ];

  const generalMenuItems = [
    { title: t.nav.dashboard, url: '/dashboard', icon: Home },
    { 
      title: t.nav.transfers, 
      url: '/transfers', 
      icon: ArrowRightLeft,
      badge: inProgressTransfersCount > 0 ? inProgressTransfersCount : undefined,
    },
    { title: t.bankAccounts.title, url: '/accounts', icon: Building2 },
    { title: t.nav.history, url: '/history', icon: History },
    { title: t.nav.settings, url: '/settings', icon: Settings },
  ];

  const adminMenuItems = [
    { title: "Administration", url: '/admin', icon: ShieldCheck },
  ];

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar backdrop-blur-xl">
      <SidebarContent className="px-3 py-4">
        {/* Logo Section - Official Altus Finances Branding */}
        <div className="px-2 py-4 mb-6" data-testid="sidebar-logo">
          <div className="flex flex-col items-center gap-3">
            {/* Altus Finances Official Logo SVG - Professional Design */}
            <svg viewBox="0 0 300 320" className="w-28 h-auto drop-shadow-md hover:drop-shadow-lg transition-all duration-300" xmlns="http://www.w3.org/2000/svg">
              {/* Gold Triangle A */}
              <polygon points="150,50 240,190 200,190" fill="#D4A85A" />
              <polygon points="150,50 100,190 140,190" fill="#C49A48" />
              
              {/* Navy Blue Wave Arc */}
              <path d="M 120 160 Q 150 140 180 160" stroke="#003366" strokeWidth="24" fill="none" strokeLinecap="round" />
              
              {/* Altus Finances Text */}
              <text x="150" y="250" fontSize="52" fontWeight="bold" textAnchor="middle" fill="#003366" fontFamily="Arial, sans-serif">Altus Finances</text>
              
              {/* Finance Group Subtitle */}
              <text x="150" y="285" fontSize="20" textAnchor="middle" fill="#666666" fontFamily="Arial, sans-serif" fontWeight="500" letterSpacing="2">FINANCE GROUP</text>
            </svg>
            
            {/* Subtle divider */}
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>
        </div>

        {(isAdminPath && isAdmin) ? (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider px-3 py-2 text-muted-foreground">
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {adminMenuItems.map((item) => {
                  const isActive = location === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        isActive={isActive}
                        onClick={() => handleNavigate(item.url)}
                        data-testid={`button-${item.url.slice(1).replace(/\//g, '-')}`}
                        className={`group relative overflow-hidden rounded-xl transition-all duration-200 ${
                          isActive 
                            ? 'bg-primary text-primary-foreground shadow-md' 
                            : 'hover:bg-sidebar-accent'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.title}</span>
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-foreground rounded-r-full" />
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <>
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider px-3 py-2 text-muted-foreground">
                {t.nav.loansSection || 'Prêts'}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {loanMenuItems.map((item) => {
                    const isActive = location === item.url;
                    
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() => handleNavigate(item.url)}
                          data-testid={`button-${item.url.slice(1).replace(/\//g, '-')}`}
                          className={`group relative overflow-hidden rounded-xl transition-all duration-200 ${
                            isActive 
                              ? 'bg-primary text-primary-foreground shadow-md' 
                              : 'hover:bg-sidebar-accent'
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium flex-1">{item.title}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="ml-auto h-5 px-2 text-xs">
                              {item.badge}
                            </Badge>
                          )}
                          {isActive && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-foreground rounded-r-full" />
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider px-3 py-2 text-muted-foreground">
                {t.nav.dashboard}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {generalMenuItems.map((item) => {
                    const isActive = location === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() => handleNavigate(item.url)}
                          data-testid={`button-${item.url.slice(1)}`}
                          className={`group relative overflow-hidden rounded-xl transition-all duration-200 ${
                            isActive 
                              ? 'bg-primary text-primary-foreground shadow-md' 
                              : 'hover:bg-sidebar-accent'
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium flex-1">{item.title}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="ml-auto h-5 px-2 text-xs">
                              {item.badge}
                            </Badge>
                          )}
                          {isActive && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-foreground rounded-r-full" />
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
      
      {/* Footer - Premium fintech user profile */}
      <SidebarFooter className="px-3 pb-4 border-t border-sidebar-border bg-sidebar/50 backdrop-blur-sm">
        <SidebarMenu className="space-y-2 pt-3">
          <SidebarMenuItem>
            {isUserLoading ? (
              <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-sidebar-accent/50">
                <Skeleton className="h-11 w-11 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ) : user ? (
              <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 backdrop-blur-sm">
                <Avatar className="h-11 w-11 border-2 border-primary/20 shadow-sm">
                  {profilePhotoUrl ? (
                    <AvatarImage 
                      src={profilePhotoUrl} 
                      alt={user.fullName} 
                    />
                  ) : null}
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm" data-testid="text-user-initials">
                    {getUserInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate text-foreground" data-testid="text-user-name">
                    {user.fullName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate" data-testid="text-user-account-type">
                    {getAccountTypeLabel(user.accountType)}
                  </p>
                </div>
              </div>
            ) : null}
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              data-testid="button-logout"
              className="rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">{t.nav.logout}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
