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
import DashboardWrapper from '@/pages/DashboardWrapper';
import About from '@/pages/About';
import HowItWorks from '@/pages/HowItWorks';
import Products from '@/pages/Products';
import Contact from '@/pages/Contact';
import Resources from '@/pages/Resources';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';
import LoanDetail from '@/pages/LoanDetail';
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
import LoanRequestDashboard from '@/pages/LoanRequestDashboard';
import TransferFlow from '@/pages/TransferFlow';
import Transfers from '@/pages/Transfers';
import BankAccounts from '@/pages/BankAccounts';
import History from '@/pages/History';
import Settings from '@/pages/Settings';
import Contracts from '@/pages/Contracts';
import AppSidebar from '@/components/AppSidebar';
import TopBar from '@/components/TopBar';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';
import NotificationBanner from '@/components/NotificationBanner';
import UserProfileHeader from '@/components/UserProfileHeader';
import NotificationBell from '@/components/NotificationBell';
import SessionMonitor from '@/components/SessionMonitor';
import MobileBottomNav from '@/components/MobileBottomNav';
import ContractNotificationManager from '@/components/ContractNotificationManager';
import UserSessionTracker from '@/components/UserSessionTracker';
import { LoanDialogProvider } from '@/contexts/LoanDialogContext';
import { ScrollingInfoBanner } from '@/components/fintech';

function App() {
  const style = {
    '--sidebar-width': '16rem',
  };

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SessionMonitor />
          <UserSessionTracker />
          <ContractNotificationManager />
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
            <Route path="/loans/:slug" component={LoanDetail} />
            <Route>
              <LoanDialogProvider>
                <TopBar />
                <SidebarProvider style={style as React.CSSProperties}>
                  <div className="flex min-h-screen w-full mt-[37px] overflow-hidden">
                    <AppSidebar />
                    <div className="flex flex-col flex-1">
                      {/* Fintech Premium Header */}
                      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl shadow-sm">
                        <div className="flex items-center justify-between px-6 py-4">
                          <SidebarTrigger data-testid="button-sidebar-toggle" className="hover:bg-muted rounded-xl transition-colors" />
                          <div className="flex items-center gap-3">
                            <LanguageSwitcher />
                            <ThemeToggle />
                            <NotificationBell />
                            <UserProfileHeader />
                          </div>
                        </div>
                        {/* Scrolling Info Banner */}
                        <div className="px-6 pb-4">
                          <ScrollingInfoBanner />
                        </div>
                      </header>
                      
                      {/* Legacy Notification Banner (if needed) */}
                      <div className="hidden">
                        <NotificationBanner />
                      </div>
                      
                      <main className="flex-1 overflow-auto pb-20 md:pb-0 bg-background">
                        <Switch>
                          <Route path="/dashboard" component={DashboardWrapper} />
                          <Route path="/loans" component={IndividualLoans} />
                          <Route path="/loans/new" component={LoanRequestDashboard} />
                          <Route path="/contracts" component={Contracts} />
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
                          <Route path="/admin/settings" component={AdminSettings} />
                          <Route path="/admin/reports" component={AdminReports} />
                          <Route component={NotFound} />
                        </Switch>
                      </main>
                      <MobileBottomNav />
                    </div>
                  </div>
                </SidebarProvider>
              </LoanDialogProvider>
            </Route>
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
