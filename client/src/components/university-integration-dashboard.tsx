import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  University, 
  Network, 
  Bot, 
  Zap, 
  Shield, 
  CheckCircle2, 
  AlertTriangle,
  Globe,
  MessageSquare,
  Target,
  TrendingUp,
  Clock,
  Award
} from "lucide-react";

interface IntegrationStatus {
  totalIntegrations: number;
  activeIntegrations: number;
  avgSuccessRate: number;
  integrationsByType: Record<string, number>;
}

interface IntegrationEvolution {
  currentState: string;
  nextMilestone: string;
  timeToNextMilestone: string;
  recommendations: string[];
}

export default function UniversityIntegrationDashboard() {
  const queryClient = useQueryClient();
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);

  // Get integration status and evolution
  const { data: integrationData, isLoading } = useQuery({
    queryKey: ['/api/university-integrations'],
    retry: false,
  });

  // Test university integration
  const testIntegration = useMutation({
    mutationFn: async (universityId: string) => {
      return await apiRequest('POST', `/api/university-integrations/${universityId}/test`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/university-integrations'] });
    },
  });

  // Discover scholarships from university
  const discoverScholarships = useMutation({
    mutationFn: async (universityId: string) => {
      return await apiRequest('GET', `/api/university-integrations/${universityId}/scholarships`);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const status = integrationData?.data?.status as IntegrationStatus;
  const evolution = integrationData?.data?.evolution as IntegrationEvolution;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">University Integration Hub</h1>
          <p className="text-gray-600 mt-2">
            Agent-to-agent communication with university admissions systems
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Bot className="w-4 h-4 mr-1" />
            Patent-Pending Technology
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <University className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{status?.totalIntegrations || 0}</p>
                <p className="text-sm text-gray-600">University Partners</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Network className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{status?.activeIntegrations || 0}</p>
                <p className="text-sm text-gray-600">Active Connections</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{status?.avgSuccessRate?.toFixed(1) || 0}%</p>
                <p className="text-sm text-gray-600">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Bot className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{status?.integrationsByType?.agent || 0}</p>
                <p className="text-sm text-gray-600">Agent Protocols</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Evolution Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Integration Evolution Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Current State: {evolution?.currentState}</h3>
                <p className="text-sm text-gray-600">
                  Next milestone: {evolution?.nextMilestone} in {evolution?.timeToNextMilestone}
                </p>
              </div>
              <Badge className="bg-blue-500 text-white">Active</Badge>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Strategic Recommendations:</h4>
              <ul className="space-y-1">
                {evolution?.recommendations?.map((rec, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {rec}
                  </li>
                )) || []}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Types */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="api">API Partners</TabsTrigger>
          <TabsTrigger value="agents">Agent Network</TabsTrigger>
          <TabsTrigger value="scrapers">Web Scrapers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">API Integrations</h3>
                  <Globe className="w-5 h-5 text-blue-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Active APIs</span>
                    <span className="font-medium">{status?.integrationsByType?.api || 0}</span>
                  </div>
                  <Progress value={((status?.integrationsByType?.api || 0) / (status?.totalIntegrations || 1)) * 100} />
                  <p className="text-xs text-gray-600">Real-time data exchange</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Agent Protocols</h3>
                  <MessageSquare className="w-5 h-5 text-green-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Active Agents</span>
                    <span className="font-medium">{status?.integrationsByType?.agent || 0}</span>
                  </div>
                  <Progress value={((status?.integrationsByType?.agent || 0) / (status?.totalIntegrations || 1)) * 100} />
                  <p className="text-xs text-gray-600">Future-ready communication</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Web Scrapers</h3>
                  <Target className="w-5 h-5 text-orange-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Active Scrapers</span>
                    <span className="font-medium">{status?.integrationsByType?.scraper || 0}</span>
                  </div>
                  <Progress value={((status?.integrationsByType?.scraper || 0) / (status?.totalIntegrations || 1)) * 100} />
                  <p className="text-xs text-gray-600">Legacy system support</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <div className="grid gap-4">
            {['Stanford University', 'UC Berkeley', 'MIT'].map((university, index) => (
              <Card key={university}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <University className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{university}</h3>
                        <p className="text-sm text-gray-600">API Integration • Real-time sync</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-green-500 text-white">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => discoverScholarships.mutate(university.toLowerCase().replace(' ', '_'))}
                        disabled={discoverScholarships.isPending}
                      >
                        <Award className="w-4 h-4 mr-1" />
                        Discover Scholarships
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Bot className="w-5 h-5" />
                Agent-to-Agent Communication Protocol
                <Badge variant="outline" className="ml-2 border-purple-200 text-purple-700">
                  Patent Pending
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">StudentOS-University-Protocol-v1.0</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium mb-1">Message Types:</p>
                      <ul className="space-y-1 text-gray-600">
                        <li>• SCHOLARSHIP_DISCOVERY_REQUEST</li>
                        <li>• APPLICATION_SUBMISSION</li>
                        <li>• STATUS_UPDATE</li>
                        <li>• DEADLINE_ALERT</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Capabilities:</p>
                      <ul className="space-y-1 text-gray-600">
                        <li>• Real-time application status</li>
                        <li>• Dynamic requirement updates</li>
                        <li>• Automated document verification</li>
                        <li>• Intelligent deadline management</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  <Card className="border-purple-100">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Bot className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">MIT Admissions Agent</h4>
                            <p className="text-sm text-gray-600">WebSocket • Real-time protocol</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-600">Active</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scrapers" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Target className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Harvard University</h3>
                      <p className="text-sm text-gray-600">Web Scraper • Legacy system support</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="border-orange-200 text-orange-700">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Rate Limited
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => testIntegration.mutate('harvard')}
                      disabled={testIntegration.isPending}
                    >
                      <Zap className="w-4 h-4 mr-1" />
                      Test Connection
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Market Opportunity */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Shield className="w-5 h-5" />
            Market Leadership Position
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">First-Mover Advantage</h4>
              <p className="text-sm text-green-700">
                Patent-pending agent communication protocols position StudentOS as the infrastructure layer for university admissions.
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Network Effects</h4>
              <p className="text-sm text-blue-700">
                Each university integration increases value for students and attracts more institutional partners.
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-medium text-purple-800 mb-2">Revenue Multiplier</h4>
              <p className="text-sm text-purple-700">
                Transaction fees from successful applications create sustainable revenue as volume scales.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}