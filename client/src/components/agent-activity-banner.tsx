import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, PenTool, Target, Bot, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function AgentActivityBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [hasShown, setHasShown] = useState(false);

  const { data: agentStatus } = useQuery({
    queryKey: ["/api/agents/dashboard"],
    refetchInterval: 30000,
  });

  const recentActivity = agentStatus?.data?.recentAgentActivity || [];
  const agentHealth = agentStatus?.data?.agentHealth || {};

  // Show banner if there's recent activity and we haven't shown it yet
  const shouldShow = isVisible && recentActivity.length > 0 && !hasShown;

  useEffect(() => {
    if (recentActivity.length > 0) {
      setHasShown(true);
    }
  }, [recentActivity.length]);

  if (!shouldShow) return null;

  const latestActivity = recentActivity[0];
  const activeAgents = Object.values(agentHealth).filter(Boolean).length;

  return (
    <Card className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  AI Agents Active
                </h3>
                <Badge variant="outline" className="text-xs bg-white">
                  {activeAgents}/3 online
                </Badge>
              </div>
              
              {latestActivity && (
                <p className="text-sm text-blue-700 dark:text-blue-200">
                  Latest: {latestActivity.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              {agentHealth.personaLearning && (
                <div className="flex items-center gap-1">
                  <Brain className="w-3 h-3 text-green-600" />
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                </div>
              )}
              {agentHealth.essayPolish && (
                <div className="flex items-center gap-1">
                  <PenTool className="w-3 h-3 text-green-600" />
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                </div>
              )}
              {agentHealth.scholarshipScout && (
                <div className="flex items-center gap-1">
                  <Target className="w-3 h-3 text-green-600" />
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                </div>
              )}
            </div>
            
            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/agents">View Dashboard</Link>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}