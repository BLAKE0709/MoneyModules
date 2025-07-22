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
import PersonaVault from "@/pages/persona-vault";
import NotFound from "@/pages/not-found";
import AgentDashboard from "@/components/agent-dashboard";
import PlatformIntegrationDashboard from "@/components/platform-integration-dashboard";
import MobileDeadlineAlert from "./components/mobile-deadline-alert";
import MobileNavigation from "./components/mobile-navigation";
import ParentDashboard from "./components/parent-dashboard";
import PrePopulatedApplications from "./components/pre-populated-applications";
import UniversityIntegrationDashboard from "./components/university-integration-dashboard";
import AIUsageDemo from "./components/ai-usage-demo";
import ScholarshipScoutDemo from "./components/scholarship-scout-demo";

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
        <Route path="/" component={isLoading || !isAuthenticated ? Landing : Home} />
        <Route path="/dashboard" component={isAuthenticated ? Dashboard : Landing} />
        <Route path="/essays" component={isAuthenticated ? Essays : Landing} />
        <Route path="/essays/new" component={isAuthenticated ? () => <Essays /> : Landing} />
        <Route path="/writing-repository" component={isAuthenticated ? WritingRepository : Landing} />
        <Route path="/agents" component={isAuthenticated ? AgentDashboard : Landing} />
        <Route path="/integrations" component={isAuthenticated ? PlatformIntegrationDashboard : Landing} />
        <Route path="/applications" component={isAuthenticated ? PrePopulatedApplications : Landing} />
        <Route path="/university-integrations" component={isAuthenticated ? UniversityIntegrationDashboard : Landing} />
        <Route path="/ai-portfolio" component={isAuthenticated ? AIUsageDemo : Landing} />
        <Route path="/scholarships" component={isAuthenticated ? ScholarshipScoutDemo : Landing} />
        <Route path="/persona" component={isAuthenticated ? Persona : Landing} />
        <Route path="/persona-vault" component={isAuthenticated ? PersonaVault : Landing} />
        <Route path="/admin" component={isAuthenticated ? Admin : Landing} />
        <Route 
          path="/parent/:studentId" 
          component={isAuthenticated ? ({ params }: any) => (
            <ParentDashboard 
              studentId={params.studentId} 
              studentName={(user as any)?.firstName || "Student"}
            />
          ) : Landing} 
        />
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
