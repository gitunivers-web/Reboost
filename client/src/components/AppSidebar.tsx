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
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Home, CreditCard, ArrowRightLeft, History, Settings, LogOut, ShieldCheck, Users, FileText, BarChart, Building2 } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';
import { useLocation } from 'wouter';
import { useUser, getUserInitials, getAccountTypeLabel, useUserProfilePhotoUrl } from '@/hooks/use-user';
import { Skeleton } from '@/components/ui/skeleton';
import logoUrl from '@assets/Logo_1762606366224.png';

export default function AppSidebar() {
  const t = useTranslations();
  const [location, setLocation] = useLocation();
  const { data: user, isLoading: isUserLoading } = useUser();
  const profilePhotoUrl = useUserProfilePhotoUrl();

  const isAdminPath = location.startsWith('/admin');

  const handleLogout = () => {
    setLocation('/');
  };

  const menuItems = [
    { title: t.nav.dashboard, url: '/dashboard', icon: Home },
    { title: t.nav.loans, url: '/loans', icon: CreditCard },
    { title: t.nav.transfers, url: '/transfers', icon: ArrowRightLeft },
    { title: t.bankAccounts.title, url: '/accounts', icon: Building2 },
    { title: t.nav.history, url: '/history', icon: History },
    { title: t.nav.settings, url: '/settings', icon: Settings },
  ];

  const adminMenuItems = [
    { title: t.nav.dashboard, url: '/admin', icon: ShieldCheck },
    { title: t.nav.users, url: '/admin/users', icon: Users },
    { title: t.nav.loans, url: '/admin/loans', icon: CreditCard },
    { title: t.nav.transfers, url: '/admin/transfers', icon: ArrowRightLeft },
    { title: t.nav.documents, url: '/admin/documents', icon: FileText },
    { title: t.nav.settings, url: '/admin/settings', icon: Settings },
    { title: t.nav.reports, url: '/admin/reports', icon: BarChart },
  ];

  const currentMenuItems = isAdminPath ? adminMenuItems : menuItems;

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="px-4 py-4 mb-2 flex items-center justify-center" data-testid="sidebar-logo">
            <img 
              src={logoUrl} 
              alt="Altus Finance Group Logo" 
              className="w-32 h-auto object-contain"
            />
          </div>
          <SidebarGroupLabel className="text-sm font-semibold px-4 py-2">
            {t.nav.dashboard}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {currentMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    onClick={() => setLocation(item.url)}
                    className="transition-all duration-200 mx-2"
                  >
                    <a href={item.url} data-testid={`link-${item.url.slice(1)}`}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {isUserLoading ? (
              <div className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ) : user ? (
              <div className="flex items-center gap-3 px-4 py-3 bg-sidebar-accent rounded-md mx-2">
                <Avatar className="bg-accent">
                  {profilePhotoUrl ? (
                    <AvatarImage 
                      src={profilePhotoUrl} 
                      alt={user.fullName} 
                    />
                  ) : null}
                  <AvatarFallback className="bg-transparent text-white font-bold" data-testid="text-user-initials">{getUserInitials(user.fullName)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" data-testid="text-user-name">{user.fullName}</p>
                  <p className="text-xs text-sidebar-foreground/80 truncate" data-testid="text-user-account-type">
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
              className="hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 hover:text-white transition-all duration-200 mx-2 rounded-lg"
            >
              <LogOut />
              <span>{t.nav.logout}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
