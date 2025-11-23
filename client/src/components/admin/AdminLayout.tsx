import { type CSSProperties } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebarAdmin } from './AppSidebarAdmin';
import AdminHeader from './AdminHeader';
import AdminNotificationBell from './AdminNotificationBell';
import AdminProfileMenu from './AdminProfileMenu';

interface AdminLayoutProps {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ id: string; label: string; href?: string }>;
  actions?: React.ReactNode;
  secondaryActions?: React.ReactNode;
  children: React.ReactNode;
}

export function AdminLayout({
  title,
  description,
  breadcrumbs,
  actions,
  secondaryActions,
  children,
}: AdminLayoutProps) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <>
      <Helmet>
        <title>{title} | Altus Admin Portal</title>
      </Helmet>
      <SidebarProvider style={style as CSSProperties}>
        <div className="flex h-screen w-full">
          <AppSidebarAdmin />
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Premium Glassmorphism TopBar */}
            <header className="h-16 backdrop-blur bg-white/70 border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
              <div className="flex items-center gap-3">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <h1 className="text-xl font-semibold text-gray-800 hidden md:block" data-testid="text-page-title-header">
                  {title}
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <AdminNotificationBell />
                <AdminProfileMenu />
              </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-gray-50" data-testid="layout-admin">
              <div className="max-w-7xl mx-auto px-6 py-6 lg:px-8 lg:py-8 space-y-8">
                {breadcrumbs && breadcrumbs.length > 0 && (
                  <Breadcrumb data-testid="breadcrumbs-admin">
                    <BreadcrumbList>
                      {breadcrumbs.map((breadcrumb, index) => {
                        const isLast = index === breadcrumbs.length - 1;
                        return (
                          <BreadcrumbItem key={breadcrumb.id}>
                            {!isLast && breadcrumb.href ? (
                              <>
                                <BreadcrumbLink href={breadcrumb.href}>
                                  {breadcrumb.label}
                                </BreadcrumbLink>
                                <BreadcrumbSeparator />
                              </>
                            ) : (
                              <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                            )}
                          </BreadcrumbItem>
                        );
                      })}
                    </BreadcrumbList>
                  </Breadcrumb>
                )}
                
                <AdminHeader
                  title={title}
                  description={description}
                  actions={actions}
                  secondaryActions={secondaryActions}
                />
                
                <section data-testid="section-content" className="space-y-6">
                  {children}
                </section>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
}

export default AdminLayout;
