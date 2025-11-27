import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { Calculator, TrendingUp, PieChart as PieChartIcon, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslations } from '@/lib/i18n';

interface Loan {
  id: string;
  amount: number;
  interestRate: number;
  duration?: number;
  status: string;
}

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

interface LoanAmortizationSectionProps {
  loans: Loan[];
}

function calculateAmortization(
  principal: number,
  annualRate: number,
  years: number
): AmortizationData {
  const numberOfPayments = years * 12;
  
  if (annualRate === 0) {
    const monthlyPayment = principal / numberOfPayments;
    const schedule: PaymentSchedule[] = [];
    let balance = principal;

    for (let month = 1; month <= numberOfPayments; month++) {
      const principalPayment = monthlyPayment;
      balance -= principalPayment;

      schedule.push({
        month,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: 0,
        balance: Math.max(0, balance),
      });
    }

    return {
      loanAmount: principal,
      interestRate: annualRate,
      loanTermMonths: numberOfPayments,
      monthlyPayment,
      totalPayment: principal,
      totalInterest: 0,
      schedule,
    };
  }

  const monthlyRate = annualRate / 100 / 12;
  
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

export default function LoanAmortizationSection({ loans }: LoanAmortizationSectionProps) {
  const t = useTranslations();
  const [selectedLoanId, setSelectedLoanId] = useState<string>('');
  const [loanAmount, setLoanAmount] = useState(100000);
  const [interestRate, setInterestRate] = useState(4.5);
  const [loanTerm, setLoanTerm] = useState(20);
  const [amortization, setAmortization] = useState<AmortizationData | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const activeLoans = loans.filter(loan => loan.status === 'active');

  const handleLoanSelect = (loanId: string) => {
    setSelectedLoanId(loanId);
    const loan = activeLoans.find(l => l.id === loanId);
    if (loan) {
      setLoanAmount(loan.amount);
      setInterestRate(loan.interestRate);
      setLoanTerm(loan.duration || 20);
      setAmortization(null);
      setValidationErrors([]);
    }
  };

  const validateInputs = (): boolean => {
    const errors: string[] = [];

    if (!loanAmount || loanAmount <= 0) {
      errors.push(t.amortization.errors.amountPositive);
    }
    if (loanAmount > 10000000) {
      errors.push(t.amortization.errors.amountMax);
    }
    if (interestRate < 0) {
      errors.push(t.amortization.errors.rateNegative);
    }
    if (interestRate > 100) {
      errors.push(t.amortization.errors.rateMax);
    }
    if (!loanTerm || loanTerm <= 0) {
      errors.push(t.amortization.errors.durationPositive);
    }
    if (loanTerm > 50) {
      errors.push(t.amortization.errors.durationMax);
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleCalculate = () => {
    if (!validateInputs()) {
      return;
    }
    const data = calculateAmortization(loanAmount, interestRate, loanTerm);
    setAmortization(data);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const COLORS = ['#3b82f6', '#10b981'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            {t.amortization.interactiveTitle}
          </CardTitle>
          <CardDescription>
            {t.amortization.interactiveDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {activeLoans.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {t.amortization.noActiveLoansDesc}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="loan-select">{t.amortization.selectActiveLoan}</Label>
                <Select value={selectedLoanId} onValueChange={handleLoanSelect}>
                  <SelectTrigger id="loan-select" data-testid="select-loan">
                    <SelectValue placeholder={t.amortization.chooseLoan} />
                  </SelectTrigger>
                  <SelectContent>
                    {activeLoans.map((loan) => (
                      <SelectItem key={loan.id} value={loan.id}>
                        {t.amortization.loanOf} {formatCurrency(loan.amount)} {t.amortization.at} {loan.interestRate}%
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">{t.amortization.loanAmount}</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    min="1000"
                    step="1000"
                    data-testid="input-loan-amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rate">{t.amortization.annualInterestRate}</Label>
                  <Input
                    id="rate"
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    min="0"
                    step="0.1"
                    data-testid="input-interest-rate"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="term">{t.amortization.duration}</Label>
                  <Input
                    id="term"
                    type="number"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(Number(e.target.value))}
                    min="1"
                    max="30"
                    data-testid="input-loan-term"
                  />
                </div>
              </div>

              {validationErrors.length > 0 && (
                <Alert variant="destructive">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={handleCalculate} 
                className="w-full md:w-auto"
                data-testid="button-calculate-amortization"
              >
                <Calculator className="mr-2 h-4 w-4" />
                {t.amortization.calculateAmortization}
              </Button>

              {amortization && (
                <div className="space-y-6 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          {t.amortization.monthlyPayment}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold" data-testid="text-monthly-payment">
                          {formatCurrency(amortization.monthlyPayment)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          {t.amortization.totalPayment}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold" data-testid="text-total-payment">
                          {formatCurrency(amortization.totalPayment)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          {t.amortization.totalInterest}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-amber-600" data-testid="text-total-interest">
                          {formatCurrency(amortization.totalInterest)}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Tabs defaultValue="table" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="table" data-testid="tab-table">
                        {t.amortization.table}
                      </TabsTrigger>
                      <TabsTrigger value="line" data-testid="tab-line-chart">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        {t.amortization.evolution}
                      </TabsTrigger>
                      <TabsTrigger value="area" data-testid="tab-area-chart">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        {t.amortization.cumulative}
                      </TabsTrigger>
                      <TabsTrigger value="pie" data-testid="tab-pie-chart">
                        <PieChartIcon className="mr-2 h-4 w-4" />
                        {t.amortization.breakdown}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="table" className="space-y-4">
                      <div className="rounded-md border max-h-96 overflow-y-auto">
                        <table className="w-full">
                          <thead className="bg-muted sticky top-0">
                            <tr>
                              <th className="p-2 text-left">{t.amortization.month}</th>
                              <th className="p-2 text-right">{t.amortization.payment}</th>
                              <th className="p-2 text-right">{t.amortization.principal}</th>
                              <th className="p-2 text-right">{t.amortization.interest}</th>
                              <th className="p-2 text-right">{t.amortization.balance}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {amortization.schedule.map((row) => (
                              <tr
                                key={row.month}
                                className="border-t hover:bg-muted/50"
                                data-testid={`row-payment-${row.month}`}
                              >
                                <td className="p-2">{row.month}</td>
                                <td className="p-2 text-right font-mono">
                                  {formatCurrency(row.payment)}
                                </td>
                                <td className="p-2 text-right font-mono text-green-600">
                                  {formatCurrency(row.principal)}
                                </td>
                                <td className="p-2 text-right font-mono text-amber-600">
                                  {formatCurrency(row.interest)}
                                </td>
                                <td className="p-2 text-right font-mono">
                                  {formatCurrency(row.balance)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>

                    <TabsContent value="line">
                      <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={amortization.schedule}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="month"
                              label={{ value: t.amortization.monthLabel, position: 'insideBottom', offset: -5 }}
                            />
                            <YAxis
                              label={{ value: t.amortization.amount, angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip
                              formatter={(value: number) => formatCurrency(value)}
                              labelFormatter={(label) => `${t.amortization.month} ${label}`}
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="principal"
                              stroke="#10b981"
                              name={t.amortization.principal}
                              strokeWidth={2}
                            />
                            <Line
                              type="monotone"
                              dataKey="interest"
                              stroke="#f59e0b"
                              name={t.amortization.interest}
                              strokeWidth={2}
                            />
                            <Line
                              type="monotone"
                              dataKey="balance"
                              stroke="#3b82f6"
                              name={t.amortization.balance}
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </TabsContent>

                    <TabsContent value="area">
                      <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={amortization.schedule}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="month"
                              label={{ value: t.amortization.monthLabel, position: 'insideBottom', offset: -5 }}
                            />
                            <YAxis
                              label={{ value: t.amortization.amount, angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip
                              formatter={(value: number) => formatCurrency(value)}
                              labelFormatter={(label) => `${t.amortization.month} ${label}`}
                            />
                            <Legend />
                            <Area
                              type="monotone"
                              dataKey="principal"
                              stackId="1"
                              stroke="#10b981"
                              fill="#10b981"
                              name={t.amortization.principal}
                            />
                            <Area
                              type="monotone"
                              dataKey="interest"
                              stackId="1"
                              stroke="#f59e0b"
                              fill="#f59e0b"
                              name={t.amortization.interest}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </TabsContent>

                    <TabsContent value="pie">
                      <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: t.amortization.principal, value: amortization.loanAmount },
                                { name: t.amortization.interest, value: amortization.totalInterest },
                              ]}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, value }) =>
                                `${name}: ${formatCurrency(value)}`
                              }
                              outerRadius={120}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {COLORS.map((color, index) => (
                                <Cell key={`cell-${index}`} fill={color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
