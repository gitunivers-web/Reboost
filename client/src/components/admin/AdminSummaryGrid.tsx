import { Link } from 'wouter';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownRight, Minus, type LucideIcon } from 'lucide-react';

export interface AdminSummaryMetric {
  id: string;
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  description?: string;
  trend?: { direction: 'up' | 'down' | 'neutral'; label: string };
  onClick?: () => void;
  href?: string;
}

interface AdminSummaryGridProps {
  metrics: AdminSummaryMetric[];
  columns?: { base?: 1 | 2; md?: 2 | 3; xl?: 3 | 4; max?: number };
}

export default function AdminSummaryGrid({ metrics, columns }: AdminSummaryGridProps) {
  const gridCols = {
    base: columns?.base || 1,
    md: columns?.md || 2,
    xl: columns?.xl || 4,
  };

  const gridClass = [
    'grid gap-4',
    gridCols.base === 1 ? 'grid-cols-1' : 'grid-cols-2',
    gridCols.md === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3',
    gridCols.xl === 3 ? 'xl:grid-cols-3' : 'xl:grid-cols-4',
  ].join(' ');

  return (
    <section className={gridClass} data-testid="grid-admin-summary" role="list">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const CardWrapper = metric.href ? Link : 'div';
        const wrapperProps = metric.href ? { href: metric.href } : {};

        return (
          <CardWrapper key={metric.id} {...wrapperProps}>
            <Card
              className={metric.onClick || metric.href ? 'cursor-pointer hover-elevate' : ''}
              onClick={metric.onClick}
              data-testid={`card-summary-${metric.id}`}
            >
              <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
                <div className="text-sm font-medium text-muted-foreground">
                  {metric.label}
                </div>
                {Icon && (
                  <div
                    className="rounded-lg bg-secondary/40 p-2 text-secondary-foreground"
                    aria-hidden="true"
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid={`text-summary-value-${metric.id}`}>
                  {metric.value}
                </div>
                {metric.description && (
                  <p className="text-xs text-muted-foreground mt-1" data-testid={`text-summary-description-${metric.id}`}>
                    {metric.description}
                  </p>
                )}
                {metric.trend && (
                  <div className="flex items-center gap-1 mt-2">
                    {metric.trend.direction === 'up' && (
                      <ArrowUpRight className="h-3 w-3 text-green-600 dark:text-green-400" />
                    )}
                    {metric.trend.direction === 'down' && (
                      <ArrowDownRight className="h-3 w-3 text-red-600 dark:text-red-400" />
                    )}
                    {metric.trend.direction === 'neutral' && (
                      <Minus className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span
                      className={`text-xs ${
                        metric.trend.direction === 'up'
                          ? 'text-green-600 dark:text-green-400'
                          : metric.trend.direction === 'down'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-muted-foreground'
                      }`}
                      data-testid={`text-summary-trend-${metric.id}`}
                    >
                      {metric.trend.label}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </CardWrapper>
        );
      })}
    </section>
  );
}
