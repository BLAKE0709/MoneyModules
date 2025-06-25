import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Settings,
  Download
} from "lucide-react";

interface ParentDashboardProps {
  studentId: string;
  studentName: string;
}

export default function ParentDashboard({ studentId, studentName }: ParentDashboardProps) {
  const [timeFrame, setTimeFrame] = useState<'week' | 'month' | 'all'>('week');
  
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: [`/api/parent/dashboard/${studentId}`, timeFrame],
    retry: false,
  });

  const { data: integrityReport } = useQuery({
    queryKey: [`/api/parent/integrity-report/${studentId}`],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Student Dashboard Not Available
          </h2>
          <p className="text-gray-600">
            Unable to load dashboard data for this student. Please check your access permissions.
          </p>
        </div>
      </div>
    );
  }

  const { scholarships, essays, aiAssistance, skillDevelopment, recentActivities, academicIntegrity } = dashboardData || {};

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {studentName}'s Progress Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Academic integrity and learning insights
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={timeFrame} 
            onChange={(e) => setTimeFrame(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
          
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Academic Integrity Score - Prominent Display */}
      <Card className="parent-metric-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Academic Integrity Score</h3>
                <p className="text-sm text-gray-600">AI assistance used responsibly</p>
              </div>
            </div>
            <div className="text-right">
              <div className="integrity-score">{academicIntegrity.academicIntegrityScore}%</div>
              <div className="text-sm text-gray-600">Excellent</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  ${(scholarships?.potentialValue || 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Scholarship Value</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {essays?.totalAnalyzed || 0}
                </div>
                <div className="text-sm text-gray-600">Essays Improved</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {skillDevelopment?.aiCollaborationSkill || 0}%
                </div>
                <div className="text-sm text-gray-600">AI Skills</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {aiAssistance?.voicePreservationRate || 0}%
                </div>
                <div className="text-sm text-gray-600">Voice Preserved</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="integrity">AI Integrity</TabsTrigger>
          <TabsTrigger value="progress">Skill Progress</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Scholarship Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Scholarship Discovery
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Found</span>
                  <Badge variant="secondary">{scholarships?.totalFound || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">High Matches (80%+)</span>
                  <Badge variant="default">{scholarships?.highMatches || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Applications Started</span>
                  <Badge variant="outline">{scholarships?.applicationsStarted || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Upcoming Deadlines</span>
                  <Badge variant={(scholarships?.deadlinesUpcoming || 0) > 0 ? "destructive" : "secondary"}>
                    {scholarships?.deadlinesUpcoming || 0}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Essay Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Essay Development
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Score</span>
                  <div className="text-2xl font-bold text-green-600">
                    {essays?.avgImprovementScore || 0}/10
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Voice Authenticity</span>
                    <span>{essays?.voiceAuthenticityScore || 0}%</span>
                  </div>
                  <Progress value={essays?.voiceAuthenticityScore || 0} className="h-2" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed Essays</span>
                  <Badge variant="default">{essays?.completedEssays || 0}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integrity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                AI Assistance Transparency
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {academicIntegrity?.totalAIInteractions || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total AI Interactions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {academicIntegrity?.voicePreservationInstances || 0}
                  </div>
                  <div className="text-sm text-gray-600">Voice Preserved</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {academicIntegrity?.originalContentPercentage || 0}%
                  </div>
                  <div className="text-sm text-gray-600">Original Content</div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">AI Assistance vs Content Generation</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Assistance & Coaching</span>
                    <span>{academicIntegrity?.assistanceVsReplacement?.assistance || 0}%</span>
                  </div>
                  <Progress value={academicIntegrity?.assistanceVsReplacement?.assistance || 0} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span>Content Replacement</span>
                    <span>{academicIntegrity?.assistanceVsReplacement?.replacement || 0}%</span>
                  </div>
                  <Progress value={academicIntegrity?.assistanceVsReplacement?.replacement || 0} className="h-2" />
                </div>
              </div>

              {(academicIntegrity?.flaggedInteractions || 0) === 0 && (
                <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium text-green-900">No Integrity Concerns</div>
                    <div className="text-sm text-green-700">All AI interactions maintain academic standards</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Skill Development</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(skillDevelopment || {}).map(([skill, score]) => (
                  <div key={skill} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{skill.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span>{score as number}%</span>
                    </div>
                    <Progress value={score as number} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Learning Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-900">Strong AI Collaboration</div>
                      <div className="text-sm text-blue-700">
                        {studentName} effectively uses AI for learning assistance while maintaining originality
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-green-900">Voice Preservation</div>
                      <div className="text-sm text-green-700">
                        Writing maintains authentic voice with AI enhancement
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(recentActivities || []).map((activity: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{activity.title}</div>
                      <div className="text-sm text-gray-600">{activity.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Parental Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Parental Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Oversight & Transparency</div>
              <div className="text-sm text-gray-600">
                Full visibility into AI assistance and academic integrity
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">Active</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}