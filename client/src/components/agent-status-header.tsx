import { Badge } from "@/components/ui/badge";
import { Brain, PenTool, Target, CheckCircle2 } from "lucide-react";

interface AgentStatusHeaderProps {
  activeAgents?: string[];
  className?: string;
}

export default function AgentStatusHeader({ activeAgents = ['persona', 'essay', 'scholarship'], className = "" }: AgentStatusHeaderProps) {
  const agentConfig = {
    persona: { name: 'PersonaLearning', icon: Brain, color: 'purple' },
    essay: { name: 'EssayPolish Pro', icon: PenTool, color: 'blue' },
    scholarship: { name: 'ScholarshipScout', icon: Target, color: 'green' }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {activeAgents.map((agentId) => {
        const agent = agentConfig[agentId as keyof typeof agentConfig];
        if (!agent) return null;
        
        const IconComponent = agent.icon;
        
        return (
          <Badge 
            key={agentId}
            variant="outline" 
            className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-800 px-3 py-1"
          >
            <IconComponent className="w-3 h-3 mr-1" />
            {agent.name}
            <CheckCircle2 className="w-3 h-3 ml-1 text-green-600" />
          </Badge>
        );
      })}
    </div>
  );
}