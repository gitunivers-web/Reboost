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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Home, CreditCard, ArrowRightLeft, History, Settings, LogOut, ShieldCheck, Users, FileText, BarChart, Building2 } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';
import { useLocation } from 'wouter';
import { useUser, getUserInitials, getAccountTypeLabel } from '@/hooks/use-user';
import { Skeleton } from '@/components/ui/skeleton';

export default function AppSidebar() {
  const t = useTranslations();
  const [location, setLocation] = useLocation();
  const { data: user, isLoading: isUserLoading } = useUser();

  const isAdminPath = location.startsWith('/admin');

  const handleLogout = () => {
    setLocation('/');
  };

  const menuItems = [
    { title: t.nav.dashboard, url: '/dashboard', icon: Home, hoverClass: 'hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-indigo-500/10 hover:border-l-4 hover:border-blue-500' },
    { title: t.nav.loans, url: '/loans', icon: CreditCard, hoverClass: 'hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-teal-500/10 hover:border-l-4 hover:border-emerald-500' },
    { title: t.nav.transfers, url: '/transfers', icon: ArrowRightLeft, hoverClass: 'hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-sky-500/10 hover:border-l-4 hover:border-cyan-500' },
    { title: 'Comptes bancaires', url: '/accounts', icon: Building2, hoverClass: 'hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-violet-500/10 hover:border-l-4 hover:border-purple-500' },
    { title: t.nav.history, url: '/history', icon: History, hoverClass: 'hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-orange-500/10 hover:border-l-4 hover:border-amber-500' },
    { title: t.nav.settings, url: '/settings', icon: Settings, hoverClass: 'hover:bg-gradient-to-r hover:from-slate-500/10 hover:to-gray-500/10 hover:border-l-4 hover:border-slate-500' },
  ];

  const adminMenuItems = [
    { title: 'Tableau de Bord', url: '/admin', icon: ShieldCheck, hoverClass: 'hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-indigo-500/10 hover:border-l-4 hover:border-blue-500' },
    { title: 'Utilisateurs', url: '/admin/users', icon: Users, hoverClass: 'hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-violet-500/10 hover:border-l-4 hover:border-purple-500' },
    { title: 'Prêts', url: '/admin/loans', icon: CreditCard, hoverClass: 'hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-teal-500/10 hover:border-l-4 hover:border-emerald-500' },
    { title: 'Transferts', url: '/admin/transfers', icon: ArrowRightLeft, hoverClass: 'hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-sky-500/10 hover:border-l-4 hover:border-cyan-500' },
    { title: 'Documents KYC', url: '/admin/documents', icon: FileText, hoverClass: 'hover:bg-gradient-to-r hover:from-rose-500/10 hover:to-pink-500/10 hover:border-l-4 hover:border-rose-500' },
    { title: 'Paramètres', url: '/admin/settings', icon: Settings, hoverClass: 'hover:bg-gradient-to-r hover:from-slate-500/10 hover:to-gray-500/10 hover:border-l-4 hover:border-slate-500' },
    { title: 'Rapports', url: '/admin/reports', icon: BarChart, hoverClass: 'hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-orange-500/10 hover:border-l-4 hover:border-amber-500' },
  ];

  const currentMenuItems = isAdminPath ? adminMenuItems : menuItems;

  return (
    <Sidebar className="border-r-2 border-blue-100 dark:border-blue-900 bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
      <SidebarContent>
        <SidebarGroup>
          <div className="px-4 py-4 mb-2 flex items-center gap-3" data-testid="sidebar-logo">
            <img 
              src="/logo.png" 
              alt="Altus Logo" 
              className="w-12 h-12 object-contain"
            />
            <div>
              <div className="text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                ALTUS
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                FINANCE GROUP
              </div>
            </div>
          </div>
          <SidebarGroupLabel className="text-sm font-semibold px-4 py-2 text-blue-700 dark:text-blue-300">
            {isAdminPath ? 'Admin Console' : 'Tableau de bord'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {currentMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    onClick={() => setLocation(item.url)}
                    className={`transition-all duration-200 rounded-lg mx-2 ${item.hoverClass || ''}`}
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
              <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 rounded-lg mx-2 border-2 border-blue-200 dark:border-blue-800">
                <Avatar className="bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500">
                  <AvatarFallback className="bg-transparent text-white font-bold" data-testid="text-user-initials">{getUserInitials(user.fullName)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-300 dark:to-indigo-300 bg-clip-text text-transparent" data-testid="text-user-name">{user.fullName}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate" data-testid="text-user-account-type">
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
