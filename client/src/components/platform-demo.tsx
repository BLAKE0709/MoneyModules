import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  Crown, 
  Code, 
  Globe, 
  Brain,
  ExternalLink,
  Download,
  Trophy,
  Zap
} from "lucide-react";

export default function PlatformDemo() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const platforms = [
    {
      id: 'chess',
      name: 'Chess.com',
      icon: Crown,
      color: 'purple',
      demo: {
        title: 'Strategic Thinking Portfolio Generated',
        insights: [
          'Analyzed 500+ games showing advanced pattern recognition',
          'Documented strategic planning in complex positions',
          'Demonstrated decision-making under time pressure'
        ],
        applicationValue: 'Perfect for business school applications - shows analytical thinking and strategic planning abilities'
      }
    },
    {
      id: 'khan',
      name: 'Khan Academy',
      icon: Calculator,
      color: 'green',
      demo: {
        title: 'Mathematical Problem-Solving Evidence',
        insights: [
          'Systematic approach to complex mathematical concepts',
          'Strong performance in algebra and statistics',
          'Consistent learning velocity and retention'
        ],
        applicationValue: 'Demonstrates STEM readiness and analytical problem-solving skills'
      }
    },
    {
      id: 'code',
      name: 'Codecademy',
      icon: Code,
      color: 'blue',
      demo: {
        title: 'Programming Skills Documentation',
        insights: [
          'Proficiency in Python and JavaScript',
          'Completed 12 projects with code reviews',
          'Shows logical thinking and debugging skills'
        ],
        applicationValue: 'Computer Science programs value documented coding experience'
      }
    },
    {
      id: 'ai',
      name: 'AI Interaction',
      icon: Brain,
      color: 'orange',
      demo: {
        title: 'AI Collaboration Portfolio',
        insights: [
          'Ethical AI usage with transparent documentation',
          'Maintains authentic voice while leveraging AI assistance',
          'Innovative applications in academic work'
        ],
        applicationValue: 'Demonstrates future-ready skills and responsible technology use'
      }
    }
  ];

  const runPlatformDemo = (platformId: string) => {
    setActiveDemo(platformId);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Platform Integration Hub
        </h2>
        <p className="text-gray-600">
          Transform your learning across platforms into powerful college application evidence
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {platforms.map((platform) => {
          const IconComponent = platform.icon;
          const isActive = activeDemo === platform.id;
          
          return (
            <Card 
              key={platform.id} 
              className={`transition-all hover:shadow-lg cursor-pointer ${
                isActive ? `border-${platform.color}-500 bg-${platform.color}-50` : ''
              }`}
              onClick={() => runPlatformDemo(platform.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <IconComponent className="w-5 h-5" />
                  <CardTitle className="text-sm">{platform.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Button size="sm" className="w-full">
                  <Zap className="w-3 h-3 mr-2" />
                  Generate Portfolio
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {activeDemo && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-blue-600" />
                {platforms.find(p => p.id === activeDemo)?.demo.title}
              </CardTitle>
              <Badge className="bg-green-600 text-white">Generated</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Key Insights Extracted:</h4>
                <ul className="space-y-1">
                  {platforms.find(p => p.id === activeDemo)?.demo.insights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-green-600">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                <h4 className="font-medium text-sm mb-1">Application Value:</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {platforms.find(p => p.id === activeDemo)?.demo.applicationValue}
                </p>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Download className="w-3 h-3 mr-2" />
                  Download Portfolio
                </Button>
                <Button size="sm" variant="outline">
                  <ExternalLink className="w-3 h-3 mr-2" />
                  View Full Analysis
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-center mt-8">
        <p className="text-gray-600 mb-4">
          This is just the beginning. Connect real platforms to build your comprehensive digital persona.
        </p>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <a href="/integrations">
            <ExternalLink className="w-4 h-4 mr-2" />
            Explore Full Integration Hub
          </a>
        </Button>
      </div>
    </div>
  );
}