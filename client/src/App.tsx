import { Switch, Route } from 'wouter';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import PageLoader from '@/components/PageLoader';
import NotFound from '@/pages/not-found';
import Home from '@/pages/Home';
import Dashboard from '@/pages/Dashboard';
import About from '@/pages/About';
import HowItWorks from '@/pages/HowItWorks';
import Products from '@/pages/Products';
import Contact from '@/pages/Contact';
import Resources from '@/pages/Resources';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';
import Auth from '@/pages/Auth';
import Verify from '@/pages/Verify';
import VerifyOtp from '@/pages/VerifyOtp';
import TwoFactorSetup from '@/pages/TwoFactorSetup';
import VerifyTwoFactor from '@/pages/VerifyTwoFactor';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminUsers from '@/pages/AdminUsers';
import AdminLoans from '@/pages/AdminLoans';
import AdminTransfers from '@/pages/AdminTransfers';
import AdminSettings from '@/pages/AdminSettings';
import AdminReports from '@/pages/AdminReports';
import AdminDocuments from '@/pages/AdminDocuments';
import IndividualLoans from '@/pages/IndividualLoans';
import LoanRequest from '@/pages/LoanRequest';
import TransferFlow from '@/pages/TransferFlow';
import Transfers from '@/pages/Transfers';
import BankAccounts from '@/pages/BankAccounts';
import History from '@/pages/History';
import Settings from '@/pages/Settings';
import AppSidebar from '@/components/AppSidebar';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';
import NotificationBanner from '@/components/NotificationBanner';
import UserProfileHeader from '@/components/UserProfileHeader';
import NotificationBell from '@/components/NotificationBell';
import SessionMonitor from '@/components/SessionMonitor';

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/products" component={Products} />
      <Route path="/contact" component={Contact} />
      <Route path="/resources" component={Resources} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/loans" component={IndividualLoans} />
      <Route path="/transfer/new" component={TransferFlow} />
      <Route path="/transfer/:id" component={TransferFlow} />
      <Route path="/transfers" component={Transfers} />
      <Route path="/accounts" component={BankAccounts} />
      <Route path="/history" component={History} />
      <Route path="/settings" component={Settings} />
      <Route path="/security/2fa" component={TwoFactorSetup} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/loans" component={AdminLoans} />
      <Route path="/admin/transfers" component={AdminTransfers} />
      <Route path="/admin/documents" component={AdminDocuments} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/reports" component={AdminReports} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = {
    '--sidebar-width': '16rem',
  };

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SessionMonitor />
          <PageLoader />
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/about" component={About} />
            <Route path="/how-it-works" component={HowItWorks} />
            <Route path="/products" component={Products} />
            <Route path="/contact" component={Contact} />
            <Route path="/resources" component={Resources} />
            <Route path="/terms" component={Terms} />
            <Route path="/privacy" component={Privacy} />
            <Route path="/auth" component={Auth} />
            <Route path="/login" component={Auth} />
            <Route path="/signup" component={Auth} />
            <Route path="/verify/:token" component={Verify} />
            <Route path="/verify-otp/:userId" component={VerifyOtp} />
            <Route path="/verify-2fa" component={VerifyTwoFactor} />
            <Route path="/forgot-password" component={ForgotPassword} />
            <Route path="/reset-password/:token" component={ResetPassword} />
            <Route path="/loan-request" component={LoanRequest} />
            <Route>
              <SidebarProvider style={style as React.CSSProperties}>
                <div className="flex h-screen w-full">
                  <AppSidebar />
                  <div className="flex flex-col flex-1">
                    <header className="flex items-center justify-between p-4 border-b bg-white dark:bg-slate-900 sticky top-0 z-50">
                      <SidebarTrigger data-testid="button-sidebar-toggle" />
                      <div className="flex items-center gap-3">
                        <LanguageSwitcher />
                        <ThemeToggle />
                        <NotificationBell />
                        <UserProfileHeader />
                      </div>
                    </header>
                    <div className="px-4 pt-4">
                      <NotificationBanner />
                    </div>
                    <main className="flex-1 overflow-auto">
                      <Router />
                    </main>
                  </div>
                </div>
              </SidebarProvider>
            </Route>
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
