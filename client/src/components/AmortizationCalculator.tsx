import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Calculator, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';

interface PaymentSchedule {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

interface AmortizationData {
  loanAmount: number;
  interestRate: number;
  loanTermMonths: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  schedule: PaymentSchedule[];
}

function calculateAmortization(
  principal: number,
  annualRate: number,
  years: number
): AmortizationData {
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;
  
  const monthlyPayment =
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  const schedule: PaymentSchedule[] = [];
  let balance = principal;

  for (let month = 1; month <= numberOfPayments; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance -= principalPayment;

    schedule.push({
      month,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: Math.max(0, balance),
    });
  }

  const totalPayment = monthlyPayment * numberOfPayments;
  const totalInterest = totalPayment - principal;

  return {
    loanAmount: principal,
    interestRate: annualRate,
    loanTermMonths: numberOfPayments,
    monthlyPayment,
    totalPayment,
    totalInterest,
    schedule,
  };
}

export default function AmortizationCalculator() {
  const [loanAmount, setLoanAmount] = useState(100000);
  const [interestRate, setInterestRate] = useState(4.5);
  const [loanTerm, setLoanTerm] = useState(20);
  const [amortization, setAmortization] = useState<AmortizationData | null>(null);

  const handleCalculate = () => {
    const result = calculateAmortization(loanAmount, interestRate, loanTerm);
    setAmortization(result);
  };

  const chartData = amortization?.schedule.filter((_, index) => index % 6 === 0 || index === amortization.schedule.length - 1) || [];

  const pieData = amortization
    ? [
        { name: 'Principal', value: amortization.loanAmount, color: '#3b82f6' },
        { name: 'Intérêts', value: amortization.totalInterest, color: '#ef4444' },
      ]
    : [];

  return (
    <div className="space-y-6" data-testid="amortization-calculator">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculateur d'Amortissement Interactif
          </CardTitle>
          <CardDescription>
            Simulez votre plan de remboursement et visualisez l'évolution de votre prêt
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="loan-amount">Montant du prêt (€)</Label>
              <Input
                id="loan-amount"
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                min="1000"
                step="1000"
                data-testid="input-loan-amount"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interest-rate">Taux d'intérêt annuel (%)</Label>
              <Input
                id="interest-rate"
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                min="0.1"
                max="20"
                step="0.1"
                data-testid="input-interest-rate"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loan-term">Durée (années)</Label>
              <Input
                id="loan-term"
                type="number"
                value={loanTerm}
                onChange={(e) => setLoanTerm(Number(e.target.value))}
                min="1"
                max="30"
                step="1"
                data-testid="input-loan-term"
              />
            </div>
          </div>

          <Button onClick={handleCalculate} className="w-full md:w-auto" data-testid="button-calculate">
            Calculer le plan d'amortissement
          </Button>

          {amortization && (
            <div className="space-y-6 pt-6 border-t">
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground">Mensualité</div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-monthly-payment">
                      {amortization.monthlyPayment.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground">Paiement total</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-total-payment">
                      {amortization.totalPayment.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground">Total des intérêts</div>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400" data-testid="text-total-interest">
                      {amortization.totalInterest.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="chart" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="chart" data-testid="tab-chart">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Graphique
                  </TabsTrigger>
                  <TabsTrigger value="breakdown" data-testid="tab-breakdown">
                    <PieChartIcon className="h-4 w-4 mr-2" />
                    Répartition
                  </TabsTrigger>
                  <TabsTrigger value="schedule" data-testid="tab-schedule">
                    Tableau
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="chart" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Évolution du solde et des paiements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="month"
                            label={{ value: 'Mois', position: 'insideBottom', offset: -5 }}
                          />
                          <YAxis label={{ value: 'Montant (€)', angle: -90, position: 'insideLeft' }} />
                          <Tooltip
                            formatter={(value: number) =>
                              value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
                            }
                          />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="principal"
                            stackId="1"
                            stroke="#3b82f6"
                            fill="#3b82f6"
                            name="Principal"
                          />
                          <Area
                            type="monotone"
                            dataKey="interest"
                            stackId="1"
                            stroke="#ef4444"
                            fill="#ef4444"
                            name="Intérêts"
                          />
                          <Line
                            type="monotone"
                            dataKey="balance"
                            stroke="#10b981"
                            strokeWidth={2}
                            name="Solde restant"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="breakdown" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Répartition Principal vs Intérêts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) =>
                              value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
                            }
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="schedule" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Plan de remboursement mensuel</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-[400px] overflow-auto">
                        <table className="w-full text-sm" data-testid="table-schedule">
                          <thead className="sticky top-0 bg-background border-b">
                            <tr>
                              <th className="text-left p-2">Mois</th>
                              <th className="text-right p-2">Paiement</th>
                              <th className="text-right p-2">Principal</th>
                              <th className="text-right p-2">Intérêts</th>
                              <th className="text-right p-2">Solde</th>
                            </tr>
                          </thead>
                          <tbody>
                            {amortization.schedule.map((item) => (
                              <tr key={item.month} className="border-b hover:bg-muted/50" data-testid={`row-month-${item.month}`}>
                                <td className="p-2">{item.month}</td>
                                <td className="text-right p-2">
                                  {item.payment.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                </td>
                                <td className="text-right p-2 text-blue-600 dark:text-blue-400">
                                  {item.principal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                </td>
                                <td className="text-right p-2 text-red-600 dark:text-red-400">
                                  {item.interest.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                </td>
                                <td className="text-right p-2 font-medium">
                                  {item.balance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
