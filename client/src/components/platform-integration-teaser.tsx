import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, Crown, Code, Brain, ExternalLink, ArrowRight } from "lucide-react";

export default function PlatformIntegrationTeaser() {
  const platforms = [
    { name: 'Chess.com', icon: Crown, category: 'Strategic Thinking', color: 'purple' },
    { name: 'Khan Academy', icon: Calculator, category: 'Math Skills', color: 'green' },
    { name: 'Codecademy', icon: Code, category: 'Programming', color: 'blue' },
    { name: 'AI Usage', icon: Brain, category: 'Ethics Portfolio', color: 'orange' }
  ];

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="w-5 h-5 text-purple-600" />
          Platform Integration Hub
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Transform your learning across platforms into powerful college application evidence
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {platforms.map((platform) => {
            const IconComponent = platform.icon;
            return (
              <div key={platform.name} className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <IconComponent className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-xs font-medium">{platform.name}</p>
                <p className="text-xs text-gray-500">{platform.category}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-sm mb-2">Example: Chess Strategic Thinking Portfolio</h4>
          <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
            <div className="flex items-center gap-2">
              <ArrowRight className="w-3 h-3 text-blue-500" />
              <span>500+ hours → "Advanced strategic planning abilities"</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="w-3 h-3 text-blue-500" />
              <span>Pattern recognition → "Complex problem analysis skills"</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="w-3 h-3 text-blue-500" />
              <span>Decision making → "Performance under pressure"</span>
            </div>
          </div>
        </div>

        <Button className="w-full bg-purple-600 hover:bg-purple-700">
          <ExternalLink className="w-4 h-4 mr-2" />
          Explore Platform Hub
        </Button>
      </CardContent>
    </Card>
  );
}