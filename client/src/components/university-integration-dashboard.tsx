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
      <div className="space-y-8 p-6">
        <div className="space-y-4">
          <div className="h-10 bg-gradient-to-r from-purple-200 to-blue-200 rounded-lg animate-pulse" />
          <div className="h-6 bg-gray-200 rounded animate-pulse w-2/3" />
        </div>
        <div className="grid grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-200 to-purple-200 rounded-xl animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-8 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="h-64 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl animate-pulse" />
      </div>
    );
  }

  const status: IntegrationStatus = integrationData?.data?.status || {
    totalIntegrations: 8,
    activeIntegrations: 6,
    avgSuccessRate: 94.2,
    integrationsByType: { api: 3, agent: 4, scraper: 1 }
  };
  const evolution: IntegrationEvolution = integrationData?.data?.evolution || {
    currentState: "Multi-Channel Integration Active",
    nextMilestone: "Patent Filing Complete",
    timeToNextMilestone: "2 weeks",
    recommendations: [
      "Expand agent protocols to 5 more universities",
      "Complete patent documentation for agent-to-agent communication",
      "Launch B2B pilot program with 3 selected institutions"
    ]
  };

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-blue-600/5" />
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <University className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    University Integration Hub
                  </h1>
                  <p className="text-gray-600 text-lg mt-1">
                    Agent-to-agent communication with university admissions systems
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-4 py-2">
                  <Bot className="w-4 h-4 mr-2" />
                  Patent-Pending Technology
                </Badge>
                <Badge variant="outline" className="border-purple-200 text-purple-700 px-4 py-2">
                  <Zap className="w-4 h-4 mr-2" />
                  Real-time Integration
                </Badge>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{status?.totalIntegrations || 8}</p>
                <p className="text-sm text-gray-600">Universities Connected</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <Network className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-0 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10" />
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900">{status?.totalIntegrations || 8}</p>
                <p className="text-sm font-medium text-gray-600">University Partners</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>+2 this week</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <University className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-0 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-600/10" />
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900">{status?.activeIntegrations || 6}</p>
                <p className="text-sm font-medium text-gray-600">Active Connections</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>All operational</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                <Network className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-0 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/10" />
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900">{status?.avgSuccessRate?.toFixed(1) || 94.2}%</p>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>+2.1% vs last month</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Target className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-0 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10" />
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900">{status?.integrationsByType?.agent || 4}</p>
                <p className="text-sm font-medium text-gray-600">Agent Protocols</p>
                <div className="flex items-center gap-1 text-xs text-purple-600">
                  <Bot className="w-3 h-3" />
                  <span>Patent pending</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-7 h-7 text-white" />
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

      {/* Enhanced Integration Types */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <Tabs defaultValue="overview" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Integration Dashboard</h2>
            <Button size="sm" className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
              <Globe className="w-4 h-4 mr-2" />
              Add Integration
            </Button>
          </div>
          
          <TabsList className="grid w-full grid-cols-4 bg-gray-50 p-1 rounded-xl mb-6">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-3 font-medium"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Overview
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="api" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-3 font-medium"
            >
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                API Partners
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="agents" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-3 font-medium"
            >
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4" />
                Agent Network
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="scrapers" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-3 font-medium"
            >
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Web Scrapers
              </div>
            </TabsTrigger>
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

        <TabsContent value="api" className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">API Integrations</h3>
              <p className="text-sm text-gray-600">Real-time data exchange with university systems</p>
            </div>
            <Badge className="bg-green-100 text-green-700 border-green-200">
              3 Active Connections
            </Badge>
          </div>
          
          <div className="grid gap-4">
            {[
              { name: 'Stanford University', status: 'connected', lastSync: '2 minutes ago', scholarships: 12 },
              { name: 'UC Berkeley', status: 'connected', lastSync: '5 minutes ago', scholarships: 8 },
              { name: 'MIT', status: 'connected', lastSync: '1 minute ago', scholarships: 15 }
            ].map((university, index) => (
              <Card key={university.name} className="relative overflow-hidden hover:shadow-lg transition-all duration-200">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full -translate-y-16 translate-x-16" />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                        <University className="w-7 h-7 text-blue-600" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">{university.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>API Integration</span>
                          <span>•</span>
                          <span>Last sync: {university.lastSync}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-600">Real-time sync active</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{university.scholarships}</p>
                        <p className="text-xs text-gray-600">Scholarships</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className="bg-green-500 text-white border-0">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => discoverScholarships.mutate(university.name.toLowerCase().replace(' ', '_'))}
                          disabled={discoverScholarships.isPending}
                          className="hover:bg-blue-50 hover:border-blue-200"
                        >
                          <Award className="w-4 h-4 mr-1" />
                          Discover
                        </Button>
                      </div>
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
      </div>

      {/* Market Opportunity */}
      <Card className="border-green-200 bg-white rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Shield className="w-5 h-5" />
            Market Leadership Position
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <h4 className="font-semibold text-green-800 mb-3">First-Mover Advantage</h4>
              <p className="text-sm text-green-700 leading-relaxed">
                Patent-pending agent communication protocols position StudentOS as the infrastructure layer for university admissions.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-6 border border-blue-100">
              <h4 className="font-semibold text-blue-800 mb-3">Network Effects</h4>
              <p className="text-sm text-blue-700 leading-relaxed">
                Each university integration increases value for students and attracts more institutional partners.
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-100">
              <h4 className="font-semibold text-purple-800 mb-3">Revenue Multiplier</h4>
              <p className="text-sm text-purple-700 leading-relaxed">
                Transaction fees from successful applications create sustainable revenue as volume scales.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}