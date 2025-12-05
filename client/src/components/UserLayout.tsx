import { Helmet } from "react-helmet-async";

interface UserLayoutProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  secondaryActions?: React.ReactNode;
  customHeader?: React.ReactNode;
  maxWidth?: string;
  children: React.ReactNode;
}

export function UserLayout({
  title,
  description,
  actions,
  secondaryActions,
  customHeader,
  maxWidth = "7xl",
  children,
}: UserLayoutProps) {
  return (
    <>
      <Helmet>
        <title>{title} - Solventis Group</title>
        {description && <meta name="description" content={description} />}
      </Helmet>

      <div className="p-6 md:p-8">
        <div className={`mx-auto max-w-${maxWidth} space-y-6`}>
          {customHeader ? (
            customHeader
          ) : (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-semibold mb-2" data-testid="text-page-title">
                  {title}
                </h1>
                {description && (
                  <p className="text-muted-foreground" data-testid="text-page-description">
                    {description}
                  </p>
                )}
              </div>
              {(actions || secondaryActions) && (
                <div className="flex items-center gap-2 flex-wrap">
                  {secondaryActions}
                  {actions}
                </div>
              )}
            </div>
          )}

          {children}
        </div>
      </div>
    </>
  );
}
