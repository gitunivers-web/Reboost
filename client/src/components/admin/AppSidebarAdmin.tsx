import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, Landmark, MessageSquare, FileText, BarChart2, MessagesSquare, Shield } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "@/lib/i18n";

export function AppSidebarAdmin() {
  const [location] = useLocation();
  const { setOpen } = useSidebar();
  const t = useTranslations();

  const closeMenuOnMobileOnly = () => {
    // Only close menu on mobile devices (max-width: 768px)
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
      setOpen(false);
    }
  };

  // Récupérer les compteurs de notifications en temps réel
  const { data: notificationCounts } = useQuery<{
    pendingLoans: number;
    signedContracts: number;
    transfersRequiringCode: number;
    unreadMessages: number;
    total: number;
  }>({
    queryKey: ["/api/admin/notifications-count"],
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  });

  const menuItems = [
    { label: t.admin.sidebar.overview, link: "/admin", icon: LayoutDashboard, count: 0 },
    { 
      label: t.admin.sidebar.loans, 
      link: "/admin/loans", 
      icon: Landmark,
      count: (notificationCounts?.pendingLoans || 0) + (notificationCounts?.signedContracts || 0) + (notificationCounts?.transfersRequiringCode || 0)
    },
    { label: t.admin.sidebar.users, link: "/admin/users", icon: Users, count: 0 },
    { 
      label: t.admin.sidebar.chat || "Chat", 
      link: "/admin/chat", 
      icon: MessagesSquare, 
      count: notificationCounts?.unreadMessages || 0 
    },
    { label: t.admin.sidebar.contact, link: "/admin/contact", icon: MessageSquare, count: 0 },
    { label: "Sécurité", link: "/admin/security", icon: Shield, count: 0 },
  ];

  return (
    <Sidebar className="border-r border-gray-200 bg-[#F8F9FF]">
      <SidebarContent>
        <div className="p-6 font-bold text-xl tracking-tight text-indigo-600" data-testid="text-admin-logo">
          SOLVENTIS ADMIN
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="px-3 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.link || (item.link !== "/admin" && location.startsWith(item.link));
                return (
                  <SidebarMenuItem key={item.link}>
                    <SidebarMenuButton asChild data-testid={`link-admin-${item.label.toLowerCase()}`}>
                      <Link href={item.link} onClick={closeMenuOnMobileOnly}>
                        <div
                          className={`flex items-center justify-between gap-3 p-3 rounded-xl transition-all w-full ${
                            isActive
                              ? "bg-indigo-100 text-indigo-700 font-semibold"
                              : "hover:bg-indigo-50 text-gray-700"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                          </div>
                          {item.count > 0 && (
                            <Badge 
                              variant="destructive" 
                              className="ml-auto min-w-[24px] h-5 flex items-center justify-center px-2"
                              data-testid={`badge-admin-count-${item.label.toLowerCase()}`}
                            >
                              {item.count}
                            </Badge>
                          )}
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
