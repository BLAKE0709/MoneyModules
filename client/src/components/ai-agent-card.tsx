import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, PenTool, Target, Bot, Zap, CheckCircle2 } from "lucide-react";

interface AIAgentCardProps {
  agentType: 'persona' | 'essay' | 'scholarship';
  title: string;
  description: string;
  actionText: string;
  className?: string;
}

export default function AIAgentCard({ agentType, title, description, actionText, className = "" }: AIAgentCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [lastResult, setLastResult] = useState<any>(null);

  const getIcon = () => {
    switch (agentType) {
      case 'persona': return <Brain className="w-5 h-5" />;
      case 'essay': return <PenTool className="w-5 h-5" />;
      case 'scholarship': return <Target className="w-5 h-5" />;
    }
  };

  const runAgent = useMutation({
    mutationFn: async () => {
      switch (agentType) {
        case 'persona':
          return await apiRequest('/api/agents/persona/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              activity: {
                type: 'manual_analysis',
                description: 'User-triggered persona analysis',
                metadata: { timestamp: new Date().toISOString() }
              }
            }),
          });
        case 'essay':
          return await apiRequest('/api/agents/essay/prompts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ essayType: 'personal_statement' }),
          });
        case 'scholarship':
          return await apiRequest('/api/agents/scholarships/discover');
      }
    },
    onSuccess: (data) => {
      setLastResult(data);
      queryClient.invalidateQueries({ queryKey: ['/api/agents/dashboard'] });
      
      if (agentType === 'persona') {
        toast({
          title: "PersonaLearning Agent Complete",
          description: "Your AI persona has been updated with latest insights",
        });
      } else if (agentType === 'essay') {
        toast({
          title: "EssayPolish Pro Ready",
          description: `Generated ${data.data?.length || 0} personalized prompts`,
        });
      } else if (agentType === 'scholarship') {
        toast({
          title: "ScholarshipScout Complete",
          description: `Found ${data.data?.opportunities?.length || 0} opportunities worth $${data.data?.totalValue?.toLocaleString() || 0}`,
        });
      }
    },
    onError: () => {
      toast({
        title: "Agent Error",
        description: "Failed to run agent. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <Card className={`${className} transition-all hover:shadow-lg`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            {getIcon()}
            {title}
          </span>
          <Badge variant="outline" className="text-xs">
            <Bot className="w-3 h-3 mr-1" />
            AI Agent
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {description}
        </p>
        
        {lastResult && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                Agent Active
              </span>
            </div>
            <p className="text-xs text-green-700 dark:text-green-300">
              {agentType === 'persona' && "Persona learning updated with new patterns"}
              {agentType === 'essay' && `${lastResult.data?.length || 0} personalized prompts ready`}
              {agentType === 'scholarship' && `${lastResult.data?.opportunities?.length || 0} scholarships discovered`}
            </p>
          </div>
        )}

        <Button
          onClick={() => runAgent.mutate()}
          disabled={runAgent.isPending}
          className="w-full"
          variant={lastResult ? "outline" : "default"}
        >
          <Zap className="w-4 h-4 mr-2" />
          {runAgent.isPending ? "Running..." : actionText}
        </Button>
      </CardContent>
    </Card>
  );
}