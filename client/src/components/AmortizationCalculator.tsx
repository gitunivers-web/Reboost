import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useTranslations } from '@/lib/i18n';
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
import { Calculator, TrendingUp, PieChart as PieChartIcon, Info } from 'lucide-react';

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

function calculateInterestRate(amount: number, loanType: string): number {
  if (loanType === 'business') {
    if (amount < 10000) return 4.5;
    if (amount < 50000) return 3.5;
    return 2.5;
  } else if (loanType === 'personal') {
    if (amount < 10000) return 6.5;
    if (amount < 30000) return 5.0;
    return 3.5;
  } else if (loanType === 'real_estate') {
    if (amount < 50000) return 3.5;
    if (amount < 200000) return 2.5;
    return 2.0;
  }
  return 4.5;
}

export default function AmortizationCalculator() {
  const t = useTranslations();
  const { toast } = useToast();
  const [loanAmount, setLoanAmount] = useState(100000);
  const [loanType, setLoanType] = useState<string>('personal');
  const [interestRate, setInterestRate] = useState(4.5);
  const [loanTerm, setLoanTerm] = useState(20);
  const [amortization, setAmortization] = useState<AmortizationData | null>(null);

  useEffect(() => {
    const calculatedRate = calculateInterestRate(loanAmount, loanType);
    setInterestRate(calculatedRate);
  }, [loanAmount, loanType]);

  const handleCalculate = () => {
    const result = calculateAmortization(loanAmount, interestRate, loanTerm);
    setAmortization(result);
  };

  const requestLoanMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/loans', {
        amount: loanAmount.toString(),
        duration: loanTerm * 12,
        loanType,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: t.loans.requestSubmitted,
        description: t.loans.requestSubmittedDesc,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/loans'] });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: t.common.error,
        description: t.loans.requestError,
      });
    },
  });

  const chartData = amortization?.schedule.filter((_, index) => index % 6 === 0 || index === amortization.schedule.length - 1) || [];

  const pieData = amortization
    ? [
        { name: t.amortization.principal, value: amortization.loanAmount, color: '#3b82f6' },
        { name: t.amortization.interest, value: amortization.totalInterest, color: '#ef4444' },
      ]
    : [];

  return (
    <div className="space-y-6" data-testid="amortization-calculator">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {t.amortization.calculatorTitle}
          </CardTitle>
          <CardDescription>
            {t.amortization.calculatorDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="loan-type">{t.amortization.loanType}</Label>
              <Select value={loanType} onValueChange={setLoanType}>
                <SelectTrigger data-testid="select-loan-type">
                  <SelectValue placeholder={t.amortization.selectType} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">{t.amortization.personal}</SelectItem>
                  <SelectItem value="business">{t.amortization.business}</SelectItem>
                  <SelectItem value="real_estate">{t.amortization.realEstate}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="loan-amount">{t.amortization.loanAmount}</Label>
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
              <Label htmlFor="interest-rate">{t.amortization.annualInterestRate}</Label>
              <Input
                id="interest-rate"
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                min="0.1"
                max="20"
                step="0.1"
                disabled
                className="bg-muted"
                data-testid="input-interest-rate"
              />
              <p className="text-xs text-muted-foreground">{t.amortization.automaticallyCalculated}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="loan-term">{t.amortization.duration}</Label>
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

          <Alert data-testid="alert-info">
            <Info className="h-4 w-4" />
            <AlertDescription>
              {t.amortization.rateInfo}
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button onClick={handleCalculate} className="flex-1" data-testid="button-calculate">
              {t.amortization.calculatePlan}
            </Button>
            <Button 
              onClick={() => requestLoanMutation.mutate()}
              disabled={requestLoanMutation.isPending}
              variant="default"
              className="flex-1"
              data-testid="button-request-loan"
            >
              {requestLoanMutation.isPending ? t.amortization.sending : t.amortization.requestLoan}
            </Button>
          </div>

          {amortization && (
            <div className="space-y-6 pt-6 border-t">
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground">{t.amortization.monthlyPayment}</div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-monthly-payment">
                      {amortization.monthlyPayment.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground">{t.amortization.totalPayment}</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-total-payment">
                      {amortization.totalPayment.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground">{t.amortization.totalInterest}</div>
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
                    {t.amortization.chart}
                  </TabsTrigger>
                  <TabsTrigger value="breakdown" data-testid="tab-breakdown">
                    <PieChartIcon className="h-4 w-4 mr-2" />
                    {t.amortization.breakdown}
                  </TabsTrigger>
                  <TabsTrigger value="schedule" data-testid="tab-schedule">
                    {t.amortization.table}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="chart" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t.amortization.balanceEvolution}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="month"
                            label={{ value: t.amortization.monthLabel, position: 'insideBottom', offset: -5 }}
                          />
                          <YAxis label={{ value: t.amortization.amount, angle: -90, position: 'insideLeft' }} />
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
                            name={t.amortization.principal}
                          />
                          <Area
                            type="monotone"
                            dataKey="interest"
                            stackId="1"
                            stroke="#ef4444"
                            fill="#ef4444"
                            name={t.amortization.interest}
                          />
                          <Line
                            type="monotone"
                            dataKey="balance"
                            stroke="#10b981"
                            strokeWidth={2}
                            name={t.amortization.remainingBalance}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="breakdown" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t.amortization.principalVsInterest}</CardTitle>
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
                      <CardTitle>{t.amortization.monthlyRepaymentPlan}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-[400px] overflow-auto">
                        <table className="w-full text-sm" data-testid="table-schedule">
                          <thead className="sticky top-0 bg-background border-b">
                            <tr>
                              <th className="text-left p-2">{t.amortization.month}</th>
                              <th className="text-right p-2">{t.amortization.payment}</th>
                              <th className="text-right p-2">{t.amortization.principal}</th>
                              <th className="text-right p-2">{t.amortization.interest}</th>
                              <th className="text-right p-2">{t.amortization.balance}</th>
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
