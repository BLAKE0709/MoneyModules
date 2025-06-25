import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, PenTool, Target, CheckCircle2, AlertCircle, Bot } from "lucide-react";
import { Link } from "wouter";

export default function AgentStatusWidget() {
  const { data: agentStatus, isLoading } = useQuery({
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
    refetchInterval: false, // Disable automatic polling
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            AI Agents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const agentHealth = agentStatus?.data?.agentHealth || {};
  const recentActivity = agentStatus?.data?.recentAgentActivity || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            AI Agents Status
          </span>
          <Button asChild variant="outline" size="sm">
            <Link href="/agents">View Dashboard</Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Agent Health Status */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-1">
              <Brain className="w-3 h-3" />
              {agentHealth.personaLearning ? (
                <CheckCircle2 className="w-3 h-3 text-green-500" />
              ) : (
                <AlertCircle className="w-3 h-3 text-red-500" />
              )}
              <span className="text-xs">Persona</span>
            </div>
            
            <div className="flex items-center gap-1">
              <PenTool className="w-3 h-3" />
              {agentHealth.essayPolish ? (
                <CheckCircle2 className="w-3 h-3 text-green-500" />
              ) : (
                <AlertCircle className="w-3 h-3 text-red-500" />
              )}
              <span className="text-xs">Polish</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              {agentHealth.scholarshipScout ? (
                <CheckCircle2 className="w-3 h-3 text-green-500" />
              ) : (
                <AlertCircle className="w-3 h-3 text-red-500" />
              )}
              <span className="text-xs">Scout</span>
            </div>
          </div>

          {/* Recent Activity */}
          {recentActivity.length > 0 && (
            <div className="border-t pt-3">
              <h4 className="text-xs font-medium mb-2">Recent Activity</h4>
              <div className="space-y-1">
                {recentActivity.slice(0, 2).map((activity: any) => (
                  <div key={activity.id} className="flex items-center justify-between text-xs">
                    <span className="truncate">{activity.description}</span>
                    <Badge variant="outline" className="text-xs">
                      {activity.agentType?.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}