interface AdminHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  secondaryActions?: React.ReactNode;
}

export default function AdminHeader({
  title,
  description,
  actions,
  secondaryActions,
}: AdminHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6 flex-wrap">
      <div className="flex-1">
        <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-admin-title">
          {title}
        </h1>
        {description && (
          <p className="text-base text-muted-foreground mt-2" data-testid="text-admin-description">
            {description}
          </p>
        )}
      </div>
      {(secondaryActions || actions) && (
        <div className="flex flex-wrap gap-3" data-testid="group-admin-actions">
          {secondaryActions}
          {actions}
        </div>
      )}
    </div>
  );
}
