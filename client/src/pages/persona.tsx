import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { insertStudentPersonaSchema } from "@shared/schema";
import type { StudentPersona } from "@shared/schema";

export default function Persona() {
  const [scholarshipMatches, setScholarshipMatches] = useState<any[]>([]);
  const [isGeneratingMatches, setIsGeneratingMatches] = useState(false);
  const { toast } = useToast();

  const { data: persona, isLoading: personaLoading } = useQuery({
    queryKey: ["/api/persona"],
  });

  const form = useForm({
    resolver: zodResolver(insertStudentPersonaSchema.partial()),
    defaultValues: {
      dateOfBirth: "",
      phone: "",
      highSchool: "",
      graduationYear: new Date().getFullYear() + 1,
      gpa: "",
      classRank: "",
      satScore: "",
      actScore: "",
      intendedMajors: [],
      extracurriculars: "",
      efc: "",
      incomeRange: "",
      fafsaStatus: "",
      workStudyInterest: "",
      careerGoals: "",
    },
  });

  useEffect(() => {
    if (persona) {
      form.reset({
        dateOfBirth: persona.dateOfBirth ? new Date(persona.dateOfBirth).toISOString().split('T')[0] : "",
        phone: persona.phone || "",
        highSchool: persona.highSchool || "",
        graduationYear: persona.graduationYear || new Date().getFullYear() + 1,
        gpa: persona.gpa || "",
        classRank: persona.classRank || "",
        satScore: persona.satScore || "",
        actScore: persona.actScore || "",
        intendedMajors: persona.intendedMajors || [],
        extracurriculars: persona.extracurriculars || "",
        efc: persona.efc || "",
        incomeRange: persona.incomeRange || "",
        fafsaStatus: persona.fafsaStatus || "",
        workStudyInterest: persona.workStudyInterest || "",
        careerGoals: persona.careerGoals || "",
      });
    }
  }, [persona, form]);

  const createPersonaMutation = useMutation({
    mutationFn: async (personaData: any) => {
      const response = await apiRequest("POST", "/api/persona", personaData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/persona"] });
      toast({
        title: "Profile Created",
        description: "Your student profile has been created successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updatePersonaMutation = useMutation({
    mutationFn: async (personaData: any) => {
      const response = await apiRequest("PUT", `/api/persona/${persona.id}`, personaData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/persona"] });
      toast({
        title: "Profile Updated",
        description: "Your student profile has been updated successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const findScholarshipsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/scholarships/find-matches", {});
      return response.json();
    },
    onSuccess: (matches) => {
      setScholarshipMatches(matches);
      toast({
        title: "Scholarship Matches Found",
        description: `Found ${matches.length} potential scholarship opportunities.`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to find scholarship matches. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    const cleanedData = {
      ...data,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      gpa: data.gpa ? parseFloat(data.gpa) : null,
      satScore: data.satScore ? parseInt(data.satScore) : null,
      actScore: data.actScore ? parseInt(data.actScore) : null,
      efc: data.efc ? parseInt(data.efc) : null,
      graduationYear: data.graduationYear ? parseInt(data.graduationYear) : null,
    };

    if (persona) {
      updatePersonaMutation.mutate(cleanedData);
    } else {
      createPersonaMutation.mutate(cleanedData);
    }
  };

  const calculateCompletion = () => {
    if (!form.getValues()) return 0;
    const values = form.getValues();
    const fields = [
      values.dateOfBirth,
      values.phone,
      values.highSchool,
      values.graduationYear,
      values.gpa,
      values.satScore || values.actScore,
      values.intendedMajors?.length > 0,
      values.extracurriculars,
      values.incomeRange,
      values.fafsaStatus,
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  const completionPercentage = persona?.completionPercentage || calculateCompletion();

  if (personaLoading) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* Profile Form */}
      <div className="xl:col-span-2 space-y-8">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Basic Information */}
          <Card className="shadow-material mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-neutral-800 mb-6">Student Persona Profile</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone"
                    {...form.register("phone")}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input 
                    id="dateOfBirth"
                    type="date"
                    {...form.register("dateOfBirth")}
                  />
                </div>
                <div>
                  <Label htmlFor="highSchool">High School</Label>
                  <Input 
                    id="highSchool"
                    {...form.register("highSchool")}
                    placeholder="Lincoln High School"
                  />
                </div>
                <div>
                  <Label htmlFor="graduationYear">Graduation Year</Label>
                  <Input 
                    id="graduationYear"
                    type="number"
                    {...form.register("graduationYear")}
                    placeholder="2025"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card className="shadow-material mb-8">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-neutral-800 mb-6">Academic Profile</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label htmlFor="gpa">Current GPA</Label>
                  <Input 
                    id="gpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    {...form.register("gpa")}
                    placeholder="3.85"
                  />
                </div>
                <div>
                  <Label htmlFor="classRank">Class Rank</Label>
                  <Input 
                    id="classRank"
                    {...form.register("classRank")}
                    placeholder="12 of 450"
                  />
                </div>
                <div>
                  <Label htmlFor="satScore">SAT Score</Label>
                  <Input 
                    id="satScore"
                    type="number"
                    min="400"
                    max="1600"
                    {...form.register("satScore")}
                    placeholder="1460"
                  />
                </div>
                <div>
                  <Label htmlFor="actScore">ACT Score</Label>
                  <Input 
                    id="actScore"
                    type="number"
                    min="1"
                    max="36"
                    {...form.register("actScore")}
                    placeholder="32"
                  />
                </div>
              </div>

              <div className="mb-6">
                <Label htmlFor="intendedMajors">Intended Major(s)</Label>
                <Input 
                  id="intendedMajors"
                  {...form.register("intendedMajors")}
                  placeholder="Environmental Engineering, Computer Science"
                />
                <p className="text-xs text-neutral-500 mt-1">Separate multiple majors with commas</p>
              </div>

              <div>
                <Label htmlFor="extracurriculars">Extracurricular Activities</Label>
                <Textarea 
                  id="extracurriculars"
                  {...form.register("extracurriculars")}
                  className="h-24"
                  placeholder="Robotics Team Captain, Environmental Club President, Volunteer at Local Food Bank, Math Tutor, JV Soccer Team"
                />
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card className="shadow-material mb-8">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-neutral-800 mb-6">Financial Profile</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="efc">Expected Family Contribution (EFC)</Label>
                  <Input 
                    id="efc"
                    type="number"
                    {...form.register("efc")}
                    placeholder="12500"
                  />
                </div>
                <div>
                  <Label htmlFor="incomeRange">Annual Family Income Range</Label>
                  <Select 
                    value={form.watch("incomeRange")}
                    onValueChange={(value) => form.setValue("incomeRange", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select income range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="less_than_30k">Less than $30,000</SelectItem>
                      <SelectItem value="30k_50k">$30,000 - $50,000</SelectItem>
                      <SelectItem value="50k_75k">$50,000 - $75,000</SelectItem>
                      <SelectItem value="75k_100k">$75,000 - $100,000</SelectItem>
                      <SelectItem value="100k_plus">$100,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fafsaStatus">FAFSA Status</Label>
                  <Select 
                    value={form.watch("fafsaStatus")}
                    onValueChange={(value) => form.setValue("fafsaStatus", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select FAFSA status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_started">Not Started</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="workStudyInterest">Work Study Interest</Label>
                  <Select 
                    value={form.watch("workStudyInterest")}
                    onValueChange={(value) => form.setValue("workStudyInterest", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select work study interest" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_interested">Not Interested</SelectItem>
                      <SelectItem value="somewhat_interested">Somewhat Interested</SelectItem>
                      <SelectItem value="very_interested">Very Interested</SelectItem>
                      <SelectItem value="required">Required</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Career Goals */}
          <Card className="shadow-material mb-8">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-neutral-800 mb-6">Goals & Preferences</h3>
              
              <div>
                <Label htmlFor="careerGoals">Career Goals</Label>
                <Textarea 
                  id="careerGoals"
                  {...form.register("careerGoals")}
                  className="h-24"
                  placeholder="Describe your career aspirations and long-term goals..."
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-3">
            <Button 
              type="submit" 
              disabled={createPersonaMutation.isPending || updatePersonaMutation.isPending}
              className="bg-primary hover:bg-blue-700"
            >
              {createPersonaMutation.isPending || updatePersonaMutation.isPending ? 
                "Saving..." : 
                persona ? "Update Profile" : "Create Profile"
              }
            </Button>
          </div>
        </form>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Completion Progress */}
        <Card className="shadow-material">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Profile Completion</h3>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-neutral-600">Overall Progress</span>
                <span className="font-medium">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Basic Info</span>
                <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                </svg>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Academic</span>
                {form.watch("gpa") && (form.watch("satScore") || form.watch("actScore")) ? (
                  <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-warning" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z"/>
                  </svg>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Financial</span>
                {form.watch("incomeRange") && form.watch("fafsaStatus") ? (
                  <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-warning" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z"/>
                  </svg>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        {persona && (
          <Card className="bg-gradient-primary text-white shadow-material-lg">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3L1 9v6c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V9l-11-6z"/>
                </svg>
                AI Insights
              </h3>
              <div className="space-y-4 text-sm">
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <div className="font-medium mb-1">Profile Analysis</div>
                  <div className="opacity-90">
                    Your profile shows strong academic performance. Consider highlighting your leadership experience in extracurriculars.
                  </div>
                </div>
                {completionPercentage < 100 && (
                  <div className="bg-white bg-opacity-20 rounded-lg p-3">
                    <div className="font-medium mb-1">Completion Tip</div>
                    <div className="opacity-90">
                      Complete your financial information to unlock better scholarship matching.
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="shadow-material">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button 
                variant="default"
                className="w-full bg-primary text-white hover:bg-blue-700"
                disabled={!persona || findScholarshipsMutation.isPending}
                onClick={() => findScholarshipsMutation.mutate()}
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.5,14H20.5L22,15.5V18.5L20.5,20H15.5L14,18.5V15.5L15.5,14M17,15.25A0.75,0.75 0 0,0 16.25,16A0.75,0.75 0 0,0 17,16.75A0.75,0.75 0 0,0 17.75,16A0.75,0.75 0 0,0 17,15.25M7,15H12V17H7V15M7,11H16V13H7V11M7,7H16V9H7V7M3,18V6A2,2 0 0,1 5,4H19A2,2 0 0,1 21,6V13.35C20.37,13.13 19.7,13 19,13A6,6 0 0,0 13,19A6,6 0 0,0 19,25C19.34,25 19.67,24.95 20,24.87V26A2,2 0 0,1 18,28H5A2,2 0 0,1 3,26V18Z"/>
                </svg>
                {findScholarshipsMutation.isPending ? "Finding..." : "Find Scholarship Matches"}
              </Button>
              <Button 
                variant="outline"
                className="w-full"
                disabled={!persona}
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
                Export Profile Report
              </Button>
              <Button 
                variant="outline"
                className="w-full"
                disabled={!persona}
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18,16.08C17.24,16.08 16.56,16.38 16.04,16.85L8.91,12.7C8.96,12.47 9,12.24 9,12C9,11.76 8.96,11.53 8.91,11.3L15.96,7.19C16.5,7.69 17.21,8 18,8A3,3 0 0,0 21,5A3,3 0 0,0 18,2A3,3 0 0,0 15,5C15,5.24 15.04,5.47 15.09,5.7L8.04,9.81C7.5,9.31 6.79,9 6,9A3,3 0 0,0 3,12A3,3 0 0,0 6,15C6.79,15 7.5,14.69 8.04,14.19L15.16,18.34C15.11,18.55 15.08,18.77 15.08,19C15.08,20.61 16.39,21.91 18,21.91C19.61,21.91 20.92,20.61 20.92,19A2.92,2.92 0 0,0 18,16.08Z"/>
                </svg>
                Share with Counselor
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Scholarship Matches */}
        {scholarshipMatches.length > 0 && (
          <Card className="shadow-material">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                Scholarship Matches ({scholarshipMatches.length})
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {scholarshipMatches.map((match: any, index: number) => (
                  <div key={index} className="border border-neutral-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-sm text-neutral-800">{match.scholarshipName}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {match.matchScore}% match
                      </Badge>
                    </div>
                    <p className="text-xs text-neutral-600">{match.reasoning}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Privacy */}
        <Card className="shadow-material">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Data Privacy</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Data Encryption</span>
                <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z"/>
                </svg>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">FERPA Compliant</span>
                <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                </svg>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Data Sharing</span>
                <Button variant="ghost" size="sm" className="text-primary hover:underline p-0 h-auto">
                  Manage Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
