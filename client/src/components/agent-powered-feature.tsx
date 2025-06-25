import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, PenTool, Target, CheckCircle2, Zap } from "lucide-react";

interface AgentPoweredFeatureProps {
  agentType: 'persona' | 'essay' | 'scholarship';
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

export default function AgentPoweredFeature({ 
  agentType, 
  title, 
  description, 
  children, 
  className = "" 
}: AgentPoweredFeatureProps) {
  const agentConfig = {
    persona: { 
      name: 'PersonaLearning', 
      icon: Brain, 
      gradient: 'from-purple-600 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50'
    },
    essay: { 
      name: 'EssayPolish Pro', 
      icon: PenTool, 
      gradient: 'from-blue-600 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-50'
    },
    scholarship: { 
      name: 'ScholarshipScout', 
      icon: Target, 
      gradient: 'from-green-600 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50'
    }
  };

  const config = agentConfig[agentType];
  const IconComponent = config.icon;

  return (
    <Card className={`bg-gradient-to-br ${config.bgGradient} border-0 shadow-lg ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${config.gradient} text-white`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-white border-gray-200">
            <Zap className="w-3 h-3 mr-1" />
            {config.name}
            <CheckCircle2 className="w-3 h-3 ml-1 text-green-600" />
          </Badge>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}