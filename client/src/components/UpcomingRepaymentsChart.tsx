import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from '@/lib/i18n';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface UpcomingRepaymentsChartProps {
  data: Array<{
    month: string;
    loan1: number;
    loan2: number;
    loan3: number;
  }>;
}

export default function UpcomingRepaymentsChart({ data }: UpcomingRepaymentsChartProps) {
  const t = useTranslations();

  return (
    <Card className="shadow-sm border bg-white dark:bg-slate-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{t.dashboard.upcomingRepayments}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="month"
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number) =>
                  new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  }).format(value)
                }
              />
              <Bar dataKey="loan1" stackId="a" fill="hsl(var(--chart-1))" name="Prêt #1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="loan2" stackId="a" fill="hsl(var(--chart-2))" name="Prêt #2" />
              <Bar dataKey="loan3" stackId="a" fill="hsl(var(--chart-3))" name="Prêt #3" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
