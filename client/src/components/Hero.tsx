import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { ArrowRight, Calculator, Clock, Shield, CheckCircle2 } from 'lucide-react';
import { useTranslations } from '@/lib/i18n';
import heroImage from '@assets/stock_images/professional_busines_f5be1226.jpg';
import { Link } from 'wouter';

export default function Hero() {
  const t = useTranslations();
  const [loanAmount, setLoanAmount] = useState('50000');
  const [loanDuration, setLoanDuration] = useState('48');

  const calculateMonthlyPayment = () => {
    const amount = parseInt(loanAmount);
    const months = parseInt(loanDuration);
    const interestRate = 0.045;
    const monthlyRate = interestRate / 12;
    const payment = (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                   (Math.pow(1 + monthlyRate, months) - 1);
    return payment.toFixed(2);
  };

  const trustBadges = [
    { icon: Clock, text: t.hero.trustBadges?.response24h || '24h Response Time' },
    { icon: Shield, text: t.hero.trustBadges?.swissSecurity || 'Swiss Bank Security' },
    { icon: CheckCircle2, text: t.hero.trustBadges?.fastApproval || 'Fast Approval' },
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/90">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="text-white space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">{t.hero.trustIndicator}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
              {t.hero.title || 'Finance Your Project with Confidence'}
            </h1>
            
            <p className="text-lg sm:text-xl lg:text-2xl text-white/90 font-light max-w-2xl">
              {t.hero.subtitle || 'Personal loans from £3,000 to £400,000. Quick decision in 3-5 working days.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              {trustBadges.map((badge, index) => (
                <div key={index} className="flex items-center gap-3 text-white/90">
                  <badge.icon className="h-5 w-5 text-accent flex-shrink-0" />
                  <span className="text-sm font-medium">{badge.text}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/loan-request" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="bg-accent text-accent-foreground hover-elevate active-elevate-2 w-full sm:w-auto text-base px-8 py-6 shadow-xl font-semibold"
                  data-testid="button-request-loan"
                >
                  {t.hero.cta1 || 'Apply Online'}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link href="/about" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="backdrop-blur-sm bg-white/10 text-white border-white/30 hover:bg-white/20 w-full sm:w-auto text-base px-8 py-6 font-semibold"
                  data-testid="button-learn-more"
                >
                  {t.hero.learnMore || 'Learn More'}
                </Button>
              </Link>
            </div>
          </div>

          <Card className="bg-white/95 backdrop-blur-md shadow-2xl border-0 p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  {t.hero.calculator?.title || 'Calculate Your Budget'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t.hero.calculator?.subtitle || 'Get an instant estimate'}
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="loan-amount" className="text-sm font-semibold text-foreground">
                  {t.hero.calculator?.loanAmount || 'Loan Amount'}
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">£</span>
                  <Input
                    id="loan-amount"
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    className="pl-8 h-12 text-base font-semibold"
                    min="3000"
                    max="400000"
                    step="1000"
                    data-testid="input-loan-amount"
                  />
                </div>
                <input
                  type="range"
                  min="3000"
                  max="400000"
                  step="1000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  data-testid="slider-loan-amount"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>£3,000</span>
                  <span>£400,000</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="loan-duration" className="text-sm font-semibold text-foreground">
                  {t.hero.calculator?.duration || 'Duration (months)'}
                </Label>
                <Select value={loanDuration} onValueChange={setLoanDuration}>
                  <SelectTrigger className="h-12" data-testid="select-loan-duration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12 months</SelectItem>
                    <SelectItem value="24">24 months</SelectItem>
                    <SelectItem value="36">36 months</SelectItem>
                    <SelectItem value="48">48 months</SelectItem>
                    <SelectItem value="60">60 months</SelectItem>
                    <SelectItem value="72">72 months</SelectItem>
                    <SelectItem value="84">84 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-5 border border-primary/10">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground font-medium">
                    {t.hero.calculator?.monthlyPayment || 'Monthly Payment'}
                  </span>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">
                      £{calculateMonthlyPayment()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t.hero.calculator?.perMonth || 'per month'}
                    </div>
                  </div>
                </div>
              </div>

              <Link href="/loan-request" className="block">
                <Button
                  size="lg"
                  className="w-full bg-primary text-primary-foreground hover-elevate active-elevate-2 h-12 text-base font-semibold"
                  data-testid="button-apply-now"
                >
                  {t.hero.calculator?.applyNow || 'Apply Now'}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>

              <p className="text-xs text-center text-muted-foreground">
                {t.hero.calculator?.disclaimer || 'Free application - No commitment - Confidential process'}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
