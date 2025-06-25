import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Edit, 
  Eye,
  Zap,
  Calendar,
  DollarSign,
  Target,
  Users
} from "lucide-react";
import { format } from "date-fns";

interface ScholarshipApplication {
  id: string;
  scholarshipId: string;
  scholarshipTitle: string;
  status: 'draft' | 'review_needed' | 'ready_to_submit' | 'submitted';
  completionPercentage: number;
  estimatedTimeToComplete: number;
  deadline: Date;
  lastUpdated: Date;
  missingFieldsCount: number;
}

interface ApplicationDetails {
  id: string;
  scholarshipTitle: string;
  completionPercentage: number;
  preFilledSections: {
    personalInfo: any;
    academicInfo: any;
    essays: any[];
    recommendations: any[];
    activities: any[];
    financialInfo: any;
  };
  missingFields: any[];
  estimatedTimeToComplete: number;
  deadline: Date;
  applicationUrl: string;
  submissionInstructions: string[];
}

export default function PrePopulatedApplications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);

  // Get all applications for the user
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['/api/scholarship-applications'],
    enabled: !!(user as any)?.id,
    retry: false,
  });

  // Get detailed view of selected application
  const { data: applicationDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ['/api/scholarship-applications', selectedApplication],
    enabled: !!selectedApplication,
    retry: false,
  });

  // Generate application mutation
  const generateApplication = useMutation({
    mutationFn: async (scholarshipId: string) => {
      return await apiRequest('POST', `/api/scholarships/${scholarshipId}/generate-application`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scholarship-applications'] });
      toast({
        title: "Application Generated",
        description: "Pre-populated scholarship application is ready for review!",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate application. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update field mutation
  const updateField = useMutation({
    mutationFn: async ({ applicationId, field, value, section }: any) => {
      return await apiRequest('PATCH', `/api/scholarship-applications/${applicationId}`, {
        field,
        value,
        section
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scholarship-applications', selectedApplication] });
      setEditingField(null);
      toast({
        title: "Field Updated",
        description: "Application updated successfully",
      });
    },
  });

  // Submit application mutation
  const submitApplication = useMutation({
    mutationFn: async (applicationId: string) => {
      return await apiRequest('POST', `/api/scholarship-applications/${applicationId}/submit`);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/scholarship-applications'] });
      toast({
        title: "Application Submitted!",
        description: `Confirmation: ${data.data.confirmationNumber}`,
      });
    },
  });

  // Bulk generate applications for multiple scholarships
  const bulkGenerate = useMutation({
    mutationFn: async (scholarshipIds: string[]) => {
      return await apiRequest('POST', '/api/scholarships/bulk-generate-applications', {
        scholarshipIds
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/scholarship-applications'] });
      toast({
        title: "Bulk Generation Complete",
        description: `Generated ${data.data.summary.totalApplications} applications in ${data.data.summary.totalTimeRequired} minutes`,
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready_to_submit': return 'bg-green-500 text-white';
      case 'review_needed': return 'bg-yellow-500 text-white';
      case 'submitted': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready_to_submit': return <CheckCircle2 className="w-4 h-4" />;
      case 'review_needed': return <AlertCircle className="w-4 h-4" />;
      case 'submitted': return <Send className="w-4 h-4" />;
      default: return <Edit className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
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

  if (selectedApplication && applicationDetails?.data) {
    const details = applicationDetails.data as ApplicationDetails;
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button 
              variant="outline" 
              onClick={() => setSelectedApplication(null)}
              className="mb-2"
            >
              ← Back to Applications
            </Button>
            <h1 className="text-2xl font-bold">{details.scholarshipTitle}</h1>
            <p className="text-gray-600">
              {details.completionPercentage}% complete • {details.estimatedTimeToComplete} minutes remaining
            </p>
          </div>
          
          <div className="flex gap-3">
            {details.completionPercentage >= 95 ? (
              <Button 
                onClick={() => submitApplication.mutate(details.id)}
                disabled={submitApplication.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Application
              </Button>
            ) : (
              <Button variant="outline" disabled>
                Complete {details.missingFields.length} missing fields to submit
              </Button>
            )}
          </div>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">Completion Progress</span>
              <span className="text-2xl font-bold text-green-600">
                {details.completionPercentage}%
              </span>
            </div>
            <Progress value={details.completionPercentage} className="mb-4" />
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>Due: {format(new Date(details.deadline), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <span>{details.estimatedTimeToComplete}m to complete</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span>{details.missingFields.length} fields missing</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Missing Fields */}
        {details.missingFields.length > 0 && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                Missing Required Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {details.missingFields.map((field: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <p className="font-medium text-red-900">{field.description}</p>
                      <p className="text-sm text-red-700">{field.section} • ~{field.estimatedTimeMinutes} minutes</p>
                    </div>
                    <Button size="sm" variant="outline" className="border-red-200">
                      Add Info
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pre-filled Sections */}
        <div className="grid gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <p className="text-sm text-gray-600">Pre-filled from your profile</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <p className="mt-1">{details.preFilledSections.personalInfo.fullName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="mt-1">{details.preFilledSections.personalInfo.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <p className="mt-1">{details.preFilledSections.personalInfo.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Date of Birth</label>
                  <p className="mt-1">{details.preFilledSections.personalInfo.dateOfBirth || 'Not provided'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
              <p className="text-sm text-gray-600">Pre-filled from your academic profile</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Current School</label>
                  <p className="mt-1">{details.preFilledSections.academicInfo.currentSchool}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">GPA</label>
                  <p className="mt-1">{details.preFilledSections.academicInfo.gpa || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Intended Major</label>
                  <p className="mt-1">{details.preFilledSections.academicInfo.intendedMajor}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Career Goals</label>
                  <p className="mt-1">{details.preFilledSections.academicInfo.careerGoals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Essays */}
          <Card>
            <CardHeader>
              <CardTitle>Essays</CardTitle>
              <p className="text-sm text-gray-600">AI-generated using your authentic writing voice</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {details.preFilledSections.essays.map((essay: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{essay.prompt}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {essay.wordCount} words
                        </Badge>
                        <Badge className={essay.confidence >= 80 ? 'bg-green-500' : 'bg-yellow-500'}>
                          {essay.confidence}% confidence
                        </Badge>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm whitespace-pre-wrap">{essay.response}</p>
                    </div>
                    {essay.needsReview && (
                      <p className="text-xs text-orange-600 mt-2">
                        ⚠️ This essay may need review for length or content
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submission Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Submission Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              {details.submissionInstructions.map((instruction: string, index: number) => (
                <li key={index} className="text-sm">{instruction}</li>
              ))}
            </ol>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Application URL:</strong>{' '}
                <a href={details.applicationUrl} target="_blank" rel="noopener noreferrer" className="underline">
                  {details.applicationUrl}
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pre-Populated Applications</h1>
          <p className="text-gray-600 mt-2">
            AI-generated scholarship applications using your profile data
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={() => bulkGenerate.mutate(['sch_001', 'sch_002', 'sch_003'])}
            disabled={bulkGenerate.isPending}
            variant="outline"
          >
            <Zap className="w-4 h-4 mr-2" />
            Bulk Generate
          </Button>
          <Button 
            onClick={() => generateApplication.mutate('new_scholarship')}
            disabled={generateApplication.isPending}
          >
            <Target className="w-4 h-4 mr-2" />
            Generate New Application
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{applications.length}</p>
                <p className="text-sm text-gray-600">Total Applications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {applications.filter((app: ScholarshipApplication) => app.status === 'ready_to_submit').length}
                </p>
                <p className="text-sm text-gray-600">Ready to Submit</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {applications.reduce((sum: number, app: ScholarshipApplication) => sum + app.estimatedTimeToComplete, 0)}m
                </p>
                <p className="text-sm text-gray-600">Total Time Saved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">$47.5K</p>
                <p className="text-sm text-gray-600">Potential Awards</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {applications.map((application: ScholarshipApplication) => (
          <Card key={application.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{application.scholarshipTitle}</h3>
                    <Badge className={getStatusColor(application.status)}>
                      {getStatusIcon(application.status)}
                      <span className="ml-1 capitalize">{application.status.replace('_', ' ')}</span>
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Due: {format(new Date(application.deadline), 'MMM d, yyyy')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {application.estimatedTimeToComplete}m remaining
                    </span>
                    {application.missingFieldsCount > 0 && (
                      <span className="flex items-center gap-1 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        {application.missingFieldsCount} fields missing
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Progress value={application.completionPercentage} className="flex-1 max-w-xs" />
                    <span className="text-sm font-medium">{application.completionPercentage}%</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedApplication(application.id)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                  
                  {application.status === 'ready_to_submit' && (
                    <Button 
                      size="sm" 
                      onClick={() => submitApplication.mutate(application.id)}
                      disabled={submitApplication.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Submit
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {applications.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
            <p className="text-gray-600 mb-4">
              Generate your first pre-populated scholarship application to get started
            </p>
            <Button onClick={() => generateApplication.mutate('demo_scholarship')}>
              <Target className="w-4 h-4 mr-2" />
              Generate First Application
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}