import { Helmet } from 'react-helmet-async';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import AdminHeader from './AdminHeader';

interface AdminLayoutProps {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ id: string; label: string; href?: string }>;
  actions?: React.ReactNode;
  secondaryActions?: React.ReactNode;
  children: React.ReactNode;
}

export default function AdminLayout({
  title,
  description,
  breadcrumbs,
  actions,
  secondaryActions,
  children,
}: AdminLayoutProps) {
  return (
    <>
      <Helmet>
        <title>{title} | Altus Admin Portal</title>
      </Helmet>
      <main className="flex-1 overflow-y-auto" data-testid="layout-admin">
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
    </>
  );
}
