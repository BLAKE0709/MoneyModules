import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Essays from "@/pages/essays";
import Persona from "@/pages/persona";
import Admin from "@/pages/admin";
import WritingRepository from "@/pages/writing-repository";
import NotFound from "@/pages/not-found";
import AgentDashboard from "@/components/agent-dashboard";
import PlatformIntegrationDashboard from "@/components/platform-integration-dashboard";
import MobileDeadlineAlert from "./components/mobile-deadline-alert";
import MobileNavigation from "./components/mobile-navigation";
import ParentDashboard from "./components/parent-dashboard";
import PrePopulatedApplications from "./components/pre-populated-applications";
import UniversityIntegrationDashboard from "./components/university-integration-dashboard";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  // Get deadline alerts for mobile notifications
  const { data: deadlineAlerts = [] } = useQuery({
    queryKey: ['/api/scholarships/deadline-alerts'],
    enabled: false, // Disable to stop API calls causing issues
    retry: false,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
  
  // Count upcoming deadlines for navigation badge
  const upcomingDeadlines = Array.isArray(deadlineAlerts) 
    ? deadlineAlerts.filter((alert: any) => alert.daysLeft <= 7).length 
    : 0;

  return (
    <>
      {/* Mobile deadline alerts - only show on mobile */}
      {isAuthenticated && (
        <MobileDeadlineAlert alerts={Array.isArray(deadlineAlerts) ? deadlineAlerts as any[] : []} />
      )}
      
      <Switch>
        {isLoading || !isAuthenticated ? (
          <Route path="/" component={Landing} />
        ) : (
          <>
            <Route path="/" component={Home} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/essays" component={Essays} />
            <Route path="/writing-repository" component={WritingRepository} />
            <Route path="/agents" component={AgentDashboard} />
            <Route path="/integrations" component={PlatformIntegrationDashboard} />
            <Route path="/applications" component={PrePopulatedApplications} />
            <Route path="/university-integrations" component={UniversityIntegrationDashboard} />
            <Route path="/persona" component={Persona} />
            <Route path="/admin" component={Admin} />
            <Route 
              path="/parent/:studentId" 
              component={({ params }: any) => (
                <ParentDashboard 
                  studentId={params.studentId} 
                  studentName={(user as any)?.firstName || "Student"}
                />
              )} 
            />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
      
      {/* Mobile navigation - only show when authenticated */}
      {isAuthenticated && (
        <MobileNavigation 
          upcomingDeadlines={upcomingDeadlines}
          unreadNotifications={0}
        />
      )}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
