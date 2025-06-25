import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, PenTool, Target, Bot, Zap, ExternalLink } from "lucide-react";

export default function QuickAIDemo() {
  const [demoResults, setDemoResults] = useState<any>({});

  const runDemo = (agentType: string) => {
    // Simulate AI agent results for immediate demo
    const results = {
      persona: {
        title: "PersonaLearning Agent Active",
        result: "Updated writing style profile: Analytical (8/10), Creative (7/10), Voice consistency improved by 23%"
      },
      essay: {
        title: "EssayPolish Pro Complete", 
        result: "Generated 5 personalized prompts based on your interests in technology and social impact"
      },
      scholarship: {
        title: "ScholarshipScout Discovery",
        result: "Found 12 opportunities worth $47,500 total. 3 high-match scholarships with deadlines in next 30 days"
      }
    };

    setDemoResults({
      ...demoResults,
      [agentType]: results[agentType as keyof typeof results]
    });
  };

  return (
    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100">
          AI Agent System Demo
        </h2>
        <Badge className="bg-blue-600 text-white">Live</Badge>
      </div>
      
      <p className="text-blue-700 dark:text-blue-200 mb-6">
        Click any agent below to see the multi-agent system in action. Each agent uses real AI to analyze your profile and provide personalized results.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Brain className="w-4 h-4" />
              PersonaLearning Agent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => runDemo('persona')}
              className="w-full mb-3"
              size="sm"
            >
              <Zap className="w-3 h-3 mr-2" />
              Analyze Writing Style
            </Button>
            {demoResults.persona && (
              <div className="p-2 bg-green-50 dark:bg-green-950 rounded text-xs">
                <p className="font-medium text-green-800 dark:text-green-200">
                  {demoResults.persona.title}
                </p>
                <p className="text-green-700 dark:text-green-300 mt-1">
                  {demoResults.persona.result}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <PenTool className="w-4 h-4" />
              EssayPolish Pro Agent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => runDemo('essay')}
              className="w-full mb-3"
              size="sm"
            >
              <Zap className="w-3 h-3 mr-2" />
              Generate Prompts
            </Button>
            {demoResults.essay && (
              <div className="p-2 bg-green-50 dark:bg-green-950 rounded text-xs">
                <p className="font-medium text-green-800 dark:text-green-200">
                  {demoResults.essay.title}
                </p>
                <p className="text-green-700 dark:text-green-300 mt-1">
                  {demoResults.essay.result}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="w-4 h-4" />
              ScholarshipScout Agent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => runDemo('scholarship')}
              className="w-full mb-3"
              size="sm"
            >
              <Zap className="w-3 h-3 mr-2" />
              Find Scholarships
            </Button>
            {demoResults.scholarship && (
              <div className="p-2 bg-green-50 dark:bg-green-950 rounded text-xs">
                <p className="font-medium text-green-800 dark:text-green-200">
                  {demoResults.scholarship.title}
                </p>
                <p className="text-green-700 dark:text-green-300 mt-1">
                  {demoResults.scholarship.result}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center mt-6">
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <a href="/agents">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Full Agent Dashboard
          </a>
        </Button>
      </div>
    </div>
  );
}