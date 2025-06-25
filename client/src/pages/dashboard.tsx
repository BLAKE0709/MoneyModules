import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { toast } = useToast();
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Mock smart suggestions data
  const mockSuggestions = [
    {
      id: "1",
      type: "essay_match" as const,
      title: "Perfect writing sample found",
      description: "Your 'Summer Internship' essay matches well with your college application prompt. Consider using it as style reference.",
      actionLabel: "View Match",
      priority: "high" as const,
      relevantEssay: "College Application Essay",
      relevantSample: "Summer Internship Experience"
    },
    {
      id: "2", 
      type: "improvement_tip" as const,
      title: "Strengthen your conclusions",
      description: "Your essays tend to have weaker ending paragraphs. Here are some techniques to create more impactful conclusions.",
      actionLabel: "Learn More",
      priority: "medium" as const,
    },
    {
      id: "3",
      type: "deadline_reminder" as const,
      title: "Application deadline approaching",
      description: "Your Stanford application essay is due in 5 days. Make sure to review and submit before the deadline.",
      actionLabel: "Review Essay",
      priority: "high" as const,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      relevantEssay: "Stanford Application Essay"
    }
  ];

  const handleSuggestionAction = (suggestionId: string) => {
    const suggestion = mockSuggestions.find(s => s.id === suggestionId);
    if (suggestion) {
      toast({
        title: "Action taken",
        description: `Opening ${suggestion.actionLabel.toLowerCase()}...`,
      });
    }
  };
  
  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/activities"],
  });

  const { data: essays, isLoading: essaysLoading } = useQuery({
    queryKey: ["/api/essays"],
  });

  const { data: scholarshipMatches, isLoading: scholarshipsLoading } = useQuery({
    queryKey: ["/api/scholarships/matches"],
  });

  const { data: persona, isLoading: personaLoading } = useQuery({
    queryKey: ["/api/persona"],
  });

  if (activitiesLoading || essaysLoading || scholarshipsLoading || personaLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  const completionPercentage = persona?.completionPercentage || 0;
  const essayCount = essays?.length || 0;
  const scholarshipCount = scholarshipMatches?.length || 0;
  const recentActivities = activities?.slice(0, 3) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Welcome Card */}
        <Card className="shadow-material">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-neutral-800 mb-2">
                  Welcome back, {user?.firstName || "Student"}!
                </h2>
                <p className="text-neutral-600 font-source">
                  Your AI-powered educational journey continues
                </p>
              </div>
              <div className="bg-gradient-primary text-white p-3 rounded-lg shadow-sm">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3L1 9v6c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V9l-11-6z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              </div>
            </div>
            
            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-neutral-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-600">Essays Created</span>
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                </div>
                <div className="text-2xl font-bold text-neutral-800">{essayCount}</div>
                <div className="text-xs text-success">Ready to polish</div>
              </div>
              
              <div className="bg-neutral-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-600">Scholarships Found</span>
                  <svg className="w-5 h-5 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z"/>
                  </svg>
                </div>
                <div className="text-2xl font-bold text-neutral-800">{scholarshipCount}</div>
                <div className="text-xs text-success">Potential matches</div>
              </div>
              
              <div className="bg-neutral-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-600">Profile Complete</span>
                  <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                  </svg>
                </div>
                <div className="text-2xl font-bold text-neutral-800">{completionPercentage}%</div>
                <div className="text-xs text-warning">
                  {100 - completionPercentage}% remaining
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Recent Activity</h3>
              {recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {recentActivities.map((activity: any) => (
                    <div key={activity.id} className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 3L1 9v6c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V9l-11-6z"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-800">{activity.description}</p>
                        <p className="text-xs text-neutral-500">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-xs bg-success text-white px-2 py-1 rounded-full">
                        {activity.type.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                  </svg>
                  <p className="font-medium">No recent activity</p>
                  <p className="text-sm">Start by creating an essay or updating your profile</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* AI Assistant Card */}
        <Card className="bg-gradient-primary text-white shadow-material-lg">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3L1 9v6c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V9l-11-6z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">AI Assistant</h3>
                <p className="text-sm opacity-90">Ready to help</p>
              </div>
            </div>
            <Button 
              variant="secondary" 
              className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-0"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4C22,2.89 21.1,2 20,2Z"/>
              </svg>
              Start Conversation
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-material">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button 
                variant="ghost" 
                className="w-full justify-start p-3 h-auto hover:bg-neutral-50"
              >
                <svg className="w-5 h-5 text-primary mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
                </svg>
                <span className="font-medium">Create New Essay</span>
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start p-3 h-auto hover:bg-neutral-50"
              >
                <svg className="w-5 h-5 text-secondary mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                </svg>
                <span className="font-medium">Update Profile</span>
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start p-3 h-auto hover:bg-neutral-50"
              >
                <svg className="w-5 h-5 text-accent mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.5,14H20.5L22,15.5V18.5L20.5,20H15.5L14,18.5V15.5L15.5,14M17,15.25A0.75,0.75 0 0,0 16.25,16A0.75,0.75 0 0,0 17,16.75A0.75,0.75 0 0,0 17.75,16A0.75,0.75 0 0,0 17,15.25M7,15H12V17H7V15M7,11H16V13H7V11M7,7H16V9H7V7M3,18V6A2,2 0 0,1 5,4H19A2,2 0 0,1 21,6V13.35C20.37,13.13 19.7,13 19,13A6,6 0 0,0 13,19A6,6 0 0,0 19,25C19.34,25 19.67,24.95 20,24.87V26A2,2 0 0,1 18,28H5A2,2 0 0,1 3,26V18Z"/>
                </svg>
                <span className="font-medium">Find Scholarships</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profile Completion */}
        {completionPercentage < 100 && (
          <Card className="shadow-material">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Complete Your Profile</h3>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-neutral-600">Progress</span>
                  <span className="font-medium">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
              <p className="text-sm text-neutral-600 mb-4">
                Complete your profile to get better scholarship matches and AI recommendations.
              </p>
              <Button variant="outline" className="w-full">
                Continue Setup
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
