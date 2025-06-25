import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bot, 
  Brain, 
  PenTool, 
  Target, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  Activity,
  DollarSign
} from "lucide-react";

interface AgentDashboardData {
  personaInsights: any;
  scholarshipReminders: any[];
  recentAgentActivity: any[];
  agentHealth: {
    personaLearning: boolean;
    scholarshipScout: boolean;
    essayPolish: boolean;
  };
}

export default function AgentDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeAgent, setActiveAgent] = useState<string>("overview");

  const { data: dashboardData, isLoading } = useQuery<AgentDashboardData>({
    queryKey: ["/api/agents/dashboard"],
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const runPersonaAnalysis = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/agents/persona/analyze', {
        activity: {
          type: 'manual_analysis',
          description: 'User requested persona analysis',
          metadata: { timestamp: new Date().toISOString() }
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agents/dashboard'] });
      toast({
        title: "Persona Analysis Complete",
        description: "Your AI persona has been updated with latest insights",
      });
    },
  });

  const discoverScholarships = useMutation({
    mutationFn: async () => {
      return await apiRequest('GET', '/api/agents/scholarships/discover');
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/agents/dashboard'] });
      toast({
        title: "Scholarship Discovery Complete",
        description: `Found ${data?.data?.opportunities?.length || 0} personalized opportunities`,
      });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI Agent Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Your personal AI agents working together to maximize your success
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            onClick={() => runPersonaAnalysis.mutate()}
            disabled={runPersonaAnalysis.isPending}
            variant="outline"
          >
            <Brain className="w-4 h-4 mr-2" />
            Update Persona
          </Button>
          <Button
            onClick={() => discoverScholarships.mutate()}
            disabled={discoverScholarships.isPending}
          >
            <Target className="w-4 h-4 mr-2" />
            Find Scholarships
          </Button>
        </div>
      </div>

      {/* Agent Health Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Persona Learning</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {dashboardData?.agentHealth.personaLearning ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">
                {dashboardData?.agentHealth.personaLearning ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Learning from your interactions to improve AI responses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Essay Polish</CardTitle>
            <PenTool className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {dashboardData?.agentHealth.essayPolish ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">
                {dashboardData?.agentHealth.essayPolish ? "Ready" : "Offline"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Voice-preserving essay analysis and improvement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scholarship Scout</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {dashboardData?.agentHealth.scholarshipScout ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">
                {dashboardData?.agentHealth.scholarshipScout ? "Scanning" : "Paused"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Automated scholarship discovery and application tracking
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeAgent} onValueChange={setActiveAgent} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="persona">Persona</TabsTrigger>
          <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Persona Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Writing Voice Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData?.personaInsights?.writingStyle ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Complexity Level</span>
                      <span className="text-sm font-medium">
                        {dashboardData.personaInsights.writingStyle.complexity || 'N/A'}/10
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Vocabulary Sophistication</span>
                      <span className="text-sm font-medium">
                        {dashboardData.personaInsights.writingStyle.vocabulary || 'N/A'}/10
                      </span>
                    </div>
                    <div className="mt-4">
                      <p className="text-xs text-muted-foreground">
                        Total Interactions: {dashboardData.personaInsights.totalInteractions || 0}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Upload writing samples to begin voice analysis
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Scholarship Opportunities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Scholarship Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData?.scholarshipReminders && dashboardData.scholarshipReminders.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.scholarshipReminders.slice(0, 3).map((reminder: any) => (
                      <div key={reminder.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div>
                          <p className="text-sm font-medium">{reminder.title}</p>
                          <p className="text-xs text-muted-foreground">{reminder.description}</p>
                        </div>
                        <Badge variant={reminder.priority === 'high' ? 'destructive' : 'secondary'}>
                          {reminder.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No urgent scholarship deadlines. Run discovery to find new opportunities.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="persona" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Persona Learning Status</CardTitle>
              <CardDescription>
                How well your AI understands your unique style and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData?.personaInsights ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Writing Style Profile</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground">Tone</label>
                        <p className="font-medium">
                          {dashboardData.personaInsights.writingStyle?.tone || 'Analyzing...'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Complexity</label>
                        <p className="font-medium">
                          {dashboardData.personaInsights.writingStyle?.complexity || 'N/A'}/10
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Learning Progress</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Voice Recognition</span>
                        <span>85%</span>
                      </div>
                      <Progress value={85} />
                      <div className="flex justify-between text-sm">
                        <span>Style Consistency</span>
                        <span>72%</span>
                      </div>
                      <Progress value={72} />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Complete your persona setup to see detailed insights
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scholarships" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scholarship Discovery & Tracking</CardTitle>
              <CardDescription>
                AI-powered scholarship matching based on your complete profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={() => discoverScholarships.mutate()}
                  disabled={discoverScholarships.isPending}
                  className="w-full"
                >
                  <Target className="w-4 h-4 mr-2" />
                  {discoverScholarships.isPending ? "Discovering..." : "Discover New Scholarships"}
                </Button>
                
                {dashboardData?.scholarshipReminders && dashboardData.scholarshipReminders.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Upcoming Deadlines</h4>
                    <div className="space-y-2">
                      {dashboardData.scholarshipReminders.map((reminder: any) => (
                        <div key={reminder.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">{reminder.title}</p>
                            <p className="text-sm text-muted-foreground">{reminder.description}</p>
                            <p className="text-xs text-green-600">{reminder.estimatedImpact}</p>
                          </div>
                          <Badge variant={reminder.priority === 'high' ? 'destructive' : 'secondary'}>
                            {reminder.priority}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Agent Activity</CardTitle>
              <CardDescription>
                Track what your AI agents have been working on
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData?.recentAgentActivity && dashboardData.recentAgentActivity.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.recentAgentActivity.map((activity: any) => (
                    <div key={activity.id} className="flex items-center space-x-3 p-3 border rounded">
                      <div className="flex-shrink-0">
                        {activity.agentType === 'persona_learning' && <Brain className="w-4 h-4" />}
                        {activity.agentType === 'essay_polish' && <PenTool className="w-4 h-4" />}
                        {activity.agentType === 'scholarship_scout' && <Target className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {activity.agentType?.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No recent agent activity. Start using the AI features to see activity here.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}