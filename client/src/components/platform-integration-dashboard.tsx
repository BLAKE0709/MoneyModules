import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Bot, 
  ExternalLink, 
  Download,
  FileText,
  Trophy,
  Brain,
  Target,
  Zap,
  Shield,
  Award,
  Code,
  Calculator,
  Crown,
  Palette,
  Music,
  Globe
} from "lucide-react";

interface PlatformConnection {
  id: string;
  name: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'connected' | 'available' | 'coming_soon';
  dataPoints: number;
  lastSync?: Date;
  color: string;
}

const AVAILABLE_PLATFORMS: PlatformConnection[] = [
  {
    id: 'chess_com',
    name: 'Chess.com',
    category: 'Strategic Thinking',
    icon: Crown,
    status: 'available',
    dataPoints: 0,
    color: 'border-purple-200 bg-purple-50'
  },
  {
    id: 'khan_academy',
    name: 'Khan Academy',
    category: 'Mathematics',
    icon: Calculator,
    status: 'available',
    dataPoints: 0,
    color: 'border-green-200 bg-green-50'
  },
  {
    id: 'codecademy',
    name: 'Codecademy',
    category: 'Programming',
    icon: Code,
    status: 'available',
    dataPoints: 0,
    color: 'border-blue-200 bg-blue-50'
  },
  {
    id: 'duolingo',
    name: 'Duolingo',
    category: 'Language Learning',
    icon: Globe,
    status: 'coming_soon',
    dataPoints: 0,
    color: 'border-yellow-200 bg-yellow-50'
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT Usage',
    category: 'AI Interaction',
    icon: Brain,
    status: 'connected',
    dataPoints: 142,
    lastSync: new Date(),
    color: 'border-orange-200 bg-orange-50'
  }
];

export default function PlatformIntegrationDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const { data: aiPortfolio, isLoading: portfolioLoading } = useQuery({
    queryKey: ["/api/platform/ai-portfolio"],
  });

  const generatePackage = useMutation({
    mutationFn: async (packageType: string) => {
      return await apiRequest(`/api/platform/package/${packageType}`, {
        method: 'POST',
      });
    },
    onSuccess: (data, packageType) => {
      toast({
        title: "Integration Package Created",
        description: `Your ${packageType.replace('_', ' ')} package is ready for college applications`,
      });
    },
  });

  const connectPlatform = useMutation({
    mutationFn: async (platformId: string) => {
      // In real implementation, this would initiate OAuth flow
      return await apiRequest('/api/platform/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformName: AVAILABLE_PLATFORMS.find(p => p.id === platformId)?.name,
          category: AVAILABLE_PLATFORMS.find(p => p.id === platformId)?.category.toLowerCase(),
          apiEndpoint: `https://api.${platformId}.com`,
          isActive: true,
          confidenceLevel: 0.9
        }),
      });
    },
    onSuccess: (data, platformId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/platform'] });
      toast({
        title: "Platform Connected",
        description: `${AVAILABLE_PLATFORMS.find(p => p.id === platformId)?.name} integration is now active`,
      });
    },
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Platform Integration Hub
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Connect your learning platforms to create a comprehensive digital persona
          </p>
        </div>
        
        <Button
          onClick={() => generatePackage.mutate('ai_collaboration_skills')}
          disabled={generatePackage.isPending}
        >
          <Download className="w-4 h-4 mr-2" />
          Generate AI Portfolio
        </Button>
      </div>

      <Tabs defaultValue="platforms" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="platforms">Connected Platforms</TabsTrigger>
          <TabsTrigger value="portfolio">AI Usage Portfolio</TabsTrigger>
          <TabsTrigger value="packages">Integration Packages</TabsTrigger>
          <TabsTrigger value="insights">Learning Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AVAILABLE_PLATFORMS.map((platform) => {
              const IconComponent = platform.icon;
              return (
                <Card key={platform.id} className={`${platform.color} transition-all hover:shadow-lg`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-5 h-5" />
                        <CardTitle className="text-lg">{platform.name}</CardTitle>
                      </div>
                      <Badge variant={
                        platform.status === 'connected' ? 'default' :
                        platform.status === 'available' ? 'outline' : 'secondary'
                      }>
                        {platform.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <CardDescription>{platform.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {platform.status === 'connected' && (
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Data Points</span>
                          <span className="font-medium">{platform.dataPoints}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Last Sync</span>
                          <span className="font-medium">
                            {platform.lastSync ? new Date(platform.lastSync).toLocaleDateString() : 'Never'}
                          </span>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink className="w-3 h-3 mr-2" />
                          View Integration
                        </Button>
                      </div>
                    )}
                    
                    {platform.status === 'available' && (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600">
                          Connect to enrich your digital persona with {platform.category.toLowerCase()} skills
                        </p>
                        <Button
                          onClick={() => connectPlatform.mutate(platform.id)}
                          disabled={connectPlatform.isPending}
                          className="w-full"
                        >
                          <Zap className="w-3 h-3 mr-2" />
                          Connect Platform
                        </Button>
                      </div>
                    )}
                    
                    {platform.status === 'coming_soon' && (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-500">
                          Integration coming soon - join the waitlist
                        </p>
                        <Button variant="outline" disabled className="w-full">
                          Coming Soon
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          {aiPortfolio ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    AI Usage Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {aiPortfolio.data?.summary}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Skill Demonstrations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {aiPortfolio.data?.skillDemonstrations?.map((skill: any, index: number) => (
                      <div key={index} className="border-l-2 border-blue-500 pl-3">
                        <h4 className="font-medium text-sm">{skill.skill}</h4>
                        <p className="text-xs text-gray-600">{skill.evidence}</p>
                        <p className="text-xs text-green-600">{skill.impact}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Ethical AI Use Evidence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {aiPortfolio.data?.ethicalAIUse?.map((item: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Award className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Brain className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Generate Your AI Portfolio</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Create a comprehensive portfolio showing how you use AI ethically and effectively
                </p>
                <Button
                  onClick={() => generatePackage.mutate('ai_collaboration_skills')}
                  disabled={generatePackage.isPending}
                >
                  {generatePackage.isPending ? "Generating..." : "Create AI Portfolio"}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="packages" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Strategic Thinking Package
                </CardTitle>
                <CardDescription>
                  Chess and strategic game analysis for college applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => generatePackage.mutate('chess_strategic_thinking')}
                  disabled={generatePackage.isPending}
                  className="w-full"
                >
                  Generate Chess Package
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Math Problem Solving
                </CardTitle>
                <CardDescription>
                  Mathematical reasoning and problem-solving evidence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => generatePackage.mutate('math_problem_solving')}
                  disabled={generatePackage.isPending}
                  className="w-full"
                >
                  Generate Math Package
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Collaboration Skills
                </CardTitle>
                <CardDescription>
                  Demonstrating ethical and innovative AI usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => generatePackage.mutate('ai_collaboration_skills')}
                  disabled={generatePackage.isPending}
                  className="w-full"
                >
                  Generate AI Package
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Digital Citizenship
                </CardTitle>
                <CardDescription>
                  Responsible technology use and digital ethics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => generatePackage.mutate('digital_citizenship')}
                  disabled={generatePackage.isPending}
                  className="w-full"
                >
                  Generate Citizenship Package
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cross-Platform Learning Insights</CardTitle>
              <CardDescription>
                How your learning across different platforms creates a unique profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <h4 className="font-medium mb-2">Learning Velocity</h4>
                  <div className="text-3xl font-bold text-blue-600">Fast</div>
                  <p className="text-sm text-gray-600">Across all platforms</p>
                </div>
                <div className="text-center">
                  <h4 className="font-medium mb-2">Domain Expertise</h4>
                  <div className="text-3xl font-bold text-green-600">4</div>
                  <p className="text-sm text-gray-600">Areas of strength</p>
                </div>
                <div className="text-center">
                  <h4 className="font-medium mb-2">AI Integration</h4>
                  <div className="text-3xl font-bold text-purple-600">Advanced</div>
                  <p className="text-sm text-gray-600">Ethical usage pattern</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}