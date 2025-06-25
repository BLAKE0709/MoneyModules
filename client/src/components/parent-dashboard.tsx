import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  TrendingUp, 
  Brain, 
  Eye, 
  CheckCircle2, 
  Clock, 
  DollarSign,
  BookOpen,
  Users,
  Heart
} from "lucide-react";

interface ParentDashboardProps {
  studentId: string;
  studentName: string;
}

export default function ParentDashboard({ studentId, studentName }: ParentDashboardProps) {
  const [timeFrame, setTimeFrame] = useState<'week' | 'month' | 'all'>('week');

  // Mock data - in production would come from APIs
  const studentProgress = {
    scholarships: {
      totalFound: 23,
      highMatches: 8,
      applicationsStarted: 4,
      deadlinesUpcoming: 6,
      potentialValue: 95000
    },
    essays: {
      totalAnalyzed: 7,
      avgImprovementScore: 18,
      voiceAuthenticityScore: 94,
      completedEssays: 4
    },
    aiAssistance: {
      totalInteractions: 31,
      voicePreservationRate: 96,
      originalityMaintained: 93,
      academicIntegrityScore: 98
    },
    skillDevelopment: {
      aiCollaborationSkill: 78,
      writingImprovement: 85,
      scholarshipReadiness: 71,
      collegePreparation: 82
    }
  };

  const recentActivities = [
    {
      type: "essay_analyzed",
      title: "Personal Statement Draft 2 analyzed",
      timestamp: "2 hours ago",
      voiceAuthentic: true,
      improvement: "+15% clarity score"
    },
    {
      type: "scholarship_found",
      title: "Local Community Foundation scholarship matched",
      timestamp: "1 day ago",
      matchScore: 87,
      amount: 3000
    },
    {
      type: "voice_profile_updated", 
      title: "Writing voice profile strengthened",
      timestamp: "2 days ago",
      samples: 3,
      confidence: 94
    },
    {
      type: "deadline_reminder",
      title: "Dell Scholars application reminder sent",
      timestamp: "3 days ago",
      daysLeft: 14,
      priority: "high"
    }
  ];

  const academicIntegrityReport = {
    totalAIInteractions: 31,
    voicePreservationInstances: 29,
    originalContentPercentage: 93,
    assistanceVsReplacement: {
      assistance: 89,
      replacement: 11
    },
    flaggedInteractions: 0,
    parentalOversightEnabled: true
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {studentName}'s Progress Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Transparent AI assistance with preserved authenticity
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              Academic Integrity: {academicIntegrityReport.originalContentPercentage}%
            </span>
          </div>
        </div>
      </div>

      <Tabs value={timeFrame} onValueChange={(value) => setTimeFrame(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
          <TabsTrigger value="all">All Time</TabsTrigger>
        </TabsList>

        <TabsContent value={timeFrame} className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">Scholarship Value</span>
                </div>
                <div className="text-2xl font-bold text-green-700">
                  ${studentProgress.scholarships.potentialValue.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500">
                  {studentProgress.scholarships.totalFound} opportunities found
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Essay Improvement</span>
                </div>
                <div className="text-2xl font-bold text-blue-700">
                  +{studentProgress.essays.avgImprovementScore}%
                </div>
                <p className="text-xs text-gray-500">
                  {studentProgress.essays.totalAnalyzed} essays analyzed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-600">Voice Authenticity</span>
                </div>
                <div className="text-2xl font-bold text-purple-700">
                  {studentProgress.essays.voiceAuthenticityScore}%
                </div>
                <p className="text-xs text-gray-500">
                  Sounds like {studentName}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-medium text-gray-600">AI Skill Development</span>
                </div>
                <div className="text-2xl font-bold text-indigo-700">
                  {studentProgress.skillDevelopment.aiCollaborationSkill}%
                </div>
                <p className="text-xs text-gray-500">
                  Professional AI collaboration
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Academic Integrity & Transparency */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Academic Integrity & Transparency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Voice Preservation</h4>
                  <div className="flex items-center gap-2 mb-1">
                    <Progress value={academicIntegrityReport.voicePreservationInstances / academicIntegrityReport.totalAIInteractions * 100} className="flex-1 h-2" />
                    <span className="text-sm font-medium">96%</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    AI assistance maintains {studentName}'s natural writing style
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Original Content</h4>
                  <div className="flex items-center gap-2 mb-1">
                    <Progress value={academicIntegrityReport.originalContentPercentage} className="flex-1 h-2" />
                    <span className="text-sm font-medium">{academicIntegrityReport.originalContentPercentage}%</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Content remains authentically {studentName}'s work
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Assistance vs Replacement</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Assistance (coaching)</span>
                      <span className="font-medium text-green-600">{academicIntegrityReport.assistanceVsReplacement.assistance}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Generation (flagged)</span>
                      <span className="font-medium text-orange-600">{academicIntegrityReport.assistanceVsReplacement.replacement}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-white rounded border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Complete Transparency</span>
                </div>
                <p className="text-sm text-gray-600">
                  All AI interactions are logged and available for review. {studentName}'s essays genuinely sound like they wrote them personally.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.timestamp}</p>
                      {activity.type === 'essay_analyzed' && (
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            Voice Authentic
                          </Badge>
                          <span className="text-xs text-green-600">{activity.improvement}</span>
                        </div>
                      )}
                      {activity.type === 'scholarship_found' && (
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="text-xs bg-green-100 text-green-800">
                            {activity.matchScore}% match
                          </Badge>
                          <span className="text-xs text-gray-600">${activity.amount?.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Skill Development Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Skill Development Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">AI Collaboration Skills</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>AI Collaboration</span>
                        <span className="font-medium">{studentProgress.skillDevelopment.aiCollaborationSkill}%</span>
                      </div>
                      <Progress value={studentProgress.skillDevelopment.aiCollaborationSkill} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Writing Improvement</span>
                        <span className="font-medium">{studentProgress.skillDevelopment.writingImprovement}%</span>
                      </div>
                      <Progress value={studentProgress.skillDevelopment.writingImprovement} className="h-2" />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-3">College Readiness</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Scholarship Readiness</span>
                        <span className="font-medium">{studentProgress.skillDevelopment.scholarshipReadiness}%</span>
                      </div>
                      <Progress value={studentProgress.skillDevelopment.scholarshipReadiness} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>College Preparation</span>
                        <span className="font-medium">{studentProgress.skillDevelopment.collegePreparation}%</span>
                      </div>
                      <Progress value={studentProgress.skillDevelopment.collegePreparation} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-600" />
                Parent Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="justify-start">
                  <Eye className="w-4 h-4 mr-2" />
                  View All AI Interactions
                </Button>
                <Button variant="outline" className="justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Academic Integrity Report
                </Button>
                <Button variant="outline" className="justify-start">
                  <Clock className="w-4 h-4 mr-2" />
                  Set Time Limits
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}