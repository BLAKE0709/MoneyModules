import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, PenTool, Target, Bot, ExternalLink, CheckCircle2 } from "lucide-react";

export default function AgentPoweredBanner() {
  return (
    <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-green-50 dark:from-blue-950 dark:via-purple-950 dark:to-green-950 border-blue-200 dark:border-blue-800 mb-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Multi-Agent System Active
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                PersonaLearning, EssayPolish Pro, and ScholarshipScout working together
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <Badge variant="outline" className="bg-white border-green-200 text-green-800">
                <Brain className="w-3 h-3 mr-1" />
                PersonaLearning
                <CheckCircle2 className="w-3 h-3 ml-1" />
              </Badge>
              <Badge variant="outline" className="bg-white border-blue-200 text-blue-800">
                <PenTool className="w-3 h-3 mr-1" />
                EssayPolish Pro
                <CheckCircle2 className="w-3 h-3 ml-1" />
              </Badge>
              <Badge variant="outline" className="bg-white border-purple-200 text-purple-800">
                <Target className="w-3 h-3 mr-1" />
                ScholarshipScout
                <CheckCircle2 className="w-3 h-3 ml-1" />
              </Badge>
            </div>
            
            <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <a href="/agents">
                <ExternalLink className="w-4 h-4 mr-2" />
                Agent Dashboard
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}