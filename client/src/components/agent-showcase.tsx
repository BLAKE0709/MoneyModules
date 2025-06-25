import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, PenTool, Target, Bot, Zap, CheckCircle2, ArrowRight } from "lucide-react";

export default function AgentShowcase() {
  const [activeAgent, setActiveAgent] = useState<string | null>(null);

  const agents = [
    {
      id: 'persona',
      name: 'PersonaLearning Agent',
      description: 'Continuously learns your writing style and academic preferences',
      icon: Brain,
      color: 'blue',
      demo: {
        title: 'Persona Analysis Complete',
        insights: [
          'Writing complexity level: Advanced (8.2/10)',
          'Preferred feedback style: Detailed with examples',
          'Learning velocity: Fast adaptor to new concepts',
          'Voice authenticity score: 94% maintained'
        ]
      }
    },
    {
      id: 'essay',
      name: 'EssayPolish Pro Agent',
      description: 'Voice-preserving essay analysis and improvement',
      icon: PenTool,
      color: 'green',
      demo: {
        title: 'Essay Enhancement Ready',
        insights: [
          'Generated 5 personalized essay prompts',
          'Identified 3 areas for clarity improvement',
          'Maintained authentic voice in all suggestions',
          'Estimated 25% improvement in impact score'
        ]
      }
    },
    {
      id: 'scholarship',
      name: 'ScholarshipScout Agent',
      description: 'AI-powered scholarship discovery and tracking',
      icon: Target,
      color: 'purple',
      demo: {
        title: 'Scholarship Opportunities Found',
        insights: [
          'Discovered 12 matching scholarships',
          'Total value: $47,500 in opportunities',
          '3 high-match applications due in 30 days',
          'Application success probability: 73%'
        ]
      }
    }
  ];

  const runAgentDemo = (agentId: string) => {
    setActiveAgent(agentId);
    // Simulate processing time
    setTimeout(() => {
      // Agent is now "active" with results
    }, 500);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 dark:from-blue-950 dark:via-purple-950 dark:to-green-950 rounded-xl p-8 mb-8 border border-blue-200 dark:border-blue-800">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Bot className="w-8 h-8 text-blue-600" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Multi-Agent AI System
          </h2>
          <Badge className="bg-green-600 text-white">Live & Active</Badge>
        </div>
        <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
          Three specialized AI agents working together to maximize your college success. 
          Each agent learns from your interactions to provide increasingly personalized guidance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {agents.map((agent) => {
          const IconComponent = agent.icon;
          const isActive = activeAgent === agent.id;
          
          return (
            <Card 
              key={agent.id} 
              className={`transition-all duration-300 hover:shadow-xl cursor-pointer ${
                isActive 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-lg' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => runAgentDemo(agent.id)}
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                    <IconComponent className="w-5 h-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {agent.description}
                </p>
              </CardHeader>
              <CardContent>
                <Button 
                  className={`w-full mb-4 ${
                    isActive 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : ''
                  }`}
                  size="sm"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {isActive ? 'Agent Active' : 'Run Agent'}
                </Button>

                {isActive && (
                  <div className="space-y-3 animate-in slide-in-from-top duration-300">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="font-medium text-sm">{agent.demo.title}</span>
                    </div>
                    <div className="space-y-1">
                      {agent.demo.insights.map((insight, index) => (
                        <div key={index} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <ArrowRight className="w-3 h-3 mt-0.5 text-blue-500 flex-shrink-0" />
                          <span>{insight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          This is the live multi-agent system. Each interaction trains your personal AI to become more effective.
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" size="sm">
            View Agent Dashboard
          </Button>
          <Button variant="outline" size="sm">
            Platform Integration Hub
          </Button>
        </div>
      </div>
    </div>
  );
}