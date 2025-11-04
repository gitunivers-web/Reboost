import { Switch, Route } from 'wouter';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
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
import AdminDashboard from '@/pages/AdminDashboard';
import AdminUsers from '@/pages/AdminUsers';
import AdminTransfers from '@/pages/AdminTransfers';
import AdminSettings from '@/pages/AdminSettings';
import AdminReports from '@/pages/AdminReports';
import IndividualLoans from '@/pages/IndividualLoans';
import AppSidebar from '@/components/AppSidebar';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';
import NotificationBanner from '@/components/NotificationBanner';

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
      <Route path="/transfers" component={Dashboard} />
      <Route path="/history" component={Dashboard} />
      <Route path="/settings" component={Dashboard} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/transfers" component={AdminTransfers} />
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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/how-it-works" component={HowItWorks} />
          <Route path="/products" component={Products} />
          <Route path="/contact" component={Contact} />
          <Route path="/resources" component={Resources} />
          <Route path="/terms" component={Terms} />
          <Route path="/privacy" component={Privacy} />
          <Route>
            <SidebarProvider style={style as React.CSSProperties}>
              <div className="flex h-screen w-full">
                <AppSidebar />
                <div className="flex flex-col flex-1">
                  <header className="flex items-center justify-between p-4 border-b">
                    <SidebarTrigger data-testid="button-sidebar-toggle" />
                    <div className="flex gap-2">
                      <LanguageSwitcher />
                      <ThemeToggle />
                    </div>
                  </header>
                  <div className="p-4">
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
  );
}

export default App;
