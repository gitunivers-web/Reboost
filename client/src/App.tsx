import { Switch, Route } from 'wouter';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import PageLoader from '@/components/PageLoader';
import NotFound from '@/pages/not-found';
import Home from '@/pages/Home';
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
import VerifyTwoFactor from '@/pages/VerifyTwoFactor';
import AdminSetup2FA from '@/pages/AdminSetup2FA';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import AdminSimple from '@/pages/AdminSimple';
import SessionMonitor from '@/components/SessionMonitor';
import ContractNotificationManager from '@/components/ContractNotificationManager';
import UserSessionTracker from '@/components/UserSessionTracker';
import DiagnosticPage from '@/pages/DiagnosticPage';
import AdminChat from '@/pages/AdminChat';
import Expertise from '@/pages/Expertise';
import ProtectedLayout from '@/components/ProtectedLayout';
import TransferDemo from '@/pages/transfer-demo';
import ProgressMock from '@/pages/ProgressMock';

function App() {
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
            <Route path="/expertise" component={Expertise} />
            <Route path="/products" component={Products} />
            <Route path="/contact" component={Contact} />
            <Route path="/resources" component={Resources} />
            <Route path="/terms" component={Terms} />
            <Route path="/privacy" component={Privacy} />
            <Route path="/diagnostic" component={DiagnosticPage} />
            <Route path="/transfer-demo" component={TransferDemo} />
            <Route path="/progress-mock" component={ProgressMock} />
            <Route path="/auth" component={Auth} />
            <Route path="/login" component={Auth} />
            <Route path="/signup" component={Auth} />
            <Route path="/verify/:token" component={Verify} />
            <Route path="/verify-otp/:userId" component={VerifyOtp} />
            <Route path="/verify-2fa" component={VerifyTwoFactor} />
            <Route path="/admin/setup-2fa" component={AdminSetup2FA} />
            <Route path="/forgot-password" component={ForgotPassword} />
            <Route path="/reset-password/:token" component={ResetPassword} />
            <Route path="/loans/:slug" component={LoanDetail} />
            <Route path="/admin/chat" component={AdminChat} />
            <Route path="/admin" component={AdminSimple} />
            <Route path="/admin/:any*" component={AdminSimple} />
            <Route component={ProtectedLayout} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
