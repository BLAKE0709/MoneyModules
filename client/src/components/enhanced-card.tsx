import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, PenTool, Target, Zap, CheckCircle2 } from "lucide-react";

interface EnhancedCardProps {
  title: string;
  description?: string;
  agentType?: 'persona' | 'essay' | 'scholarship';
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
}

export default function EnhancedCard({ 
  title, 
  description, 
  agentType, 
  children, 
  className = "",
  headerActions 
}: EnhancedCardProps) {
  const agentConfig = {
    persona: { name: 'PersonaLearning', icon: Brain, color: 'purple' },
    essay: { name: 'EssayPolish Pro', icon: PenTool, color: 'blue' },
    scholarship: { name: 'ScholarshipScout', icon: Target, color: 'green' }
  };

  const agent = agentType ? agentConfig[agentType] : null;
  const AgentIcon = agent?.icon;

  return (
    <Card className={`shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {title}
              {agent && (
                <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200">
                  <Zap className="w-3 h-3 mr-1" />
                  {agent.name}
                  <CheckCircle2 className="w-3 h-3 ml-1 text-green-600" />
                </Badge>
              )}
            </CardTitle>
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {description}
              </p>
            )}
          </div>
          {headerActions && (
            <div className="flex items-center gap-2">
              {headerActions}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}