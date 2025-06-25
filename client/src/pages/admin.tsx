import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import AdminKPIDashboard from "@/components/admin-kpi-dashboard";
import InstitutionalReadinessTracker from "@/components/institutional-readiness-tracker";
import EthicsTransparencyCenter from "@/components/ethics-transparency-center";

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Redirect if not admin/counselor
  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "counselor") {
      toast({
        title: "Unauthorized",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/admin/analytics"],
    enabled: user?.role === "admin" || user?.role === "counselor",
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return false;
      }
      return failureCount < 3;
    },
  });

  const { data: recentActivities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/admin/activities"],
    enabled: user?.role === "admin" || user?.role === "counselor",
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error)) {
        return false;
      }
      return failureCount < 3;
    },
  });

  if (user?.role !== "admin" && user?.role !== "counselor") {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-neutral-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z"/>
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-neutral-800 mb-2">Access Restricted</h3>
        <p className="text-neutral-600 mb-6">This section is only available to administrators and counselors.</p>
      </div>
    );
  }

  const handleExportReport = (reportType: string) => {
    toast({
      title: "Export Report",
      description: `${reportType} export functionality coming soon.`,
    });
  };

  if (analyticsLoading || activitiesLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-800 mb-2">
          {user?.role === "admin" ? "School Administration Dashboard" : "Counselor Analytics"}
        </h2>
        <p className="text-neutral-600 font-source">
          Overview of student engagement and platform usage
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-material">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16,4C16.88,4 17.67,4.35 18.23,4.94L15.95,7.22C15.8,7.08 15.42,7 15,7C14.42,7 14,7.42 14,8V16C14,16.58 14.42,17 15,17C15.58,17 16,16.58 16,16V12H14V10H18V16A3,3 0 0,1 15,19A3,3 0 0,1 12,16V8A3,3 0 0,1 15,5C15.35,5 15.69,5.07 16,5.2V4M1,5A2,2 0 0,1 3,3H13A2,2 0 0,1 15,5V6.17C14.5,6.06 14,6 13.5,6A4.5,4.5 0 0,0 9,10.5A4.5,4.5 0 0,0 13.5,15C14,15 14.5,14.94 15,14.83V19A2,2 0 0,1 13,21H3A2,2 0 0,1 1,19V5M3,5V19H13V17H11V15H13V13H11V11H13V9H11V7H13V5H3Z"/>
                </svg>
              </div>
              <Badge variant="secondary" className="text-xs">
                +12%
              </Badge>
            </div>
            <div className="text-2xl font-bold text-neutral-800 mb-1">
              {analytics?.activeStudents || 0}
            </div>
            <div className="text-sm text-neutral-600">Active Students</div>
          </CardContent>
        </Card>

        <Card className="shadow-material">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-secondary bg-opacity-10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
              </div>
              <Badge variant="secondary" className="text-xs">
                +8%
              </Badge>
            </div>
            <div className="text-2xl font-bold text-neutral-800 mb-1">
              {analytics?.essaysPolished || 0}
            </div>
            <div className="text-sm text-neutral-600">Essays Polished</div>
          </CardContent>
        </Card>

        <Card className="shadow-material">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-accent bg-opacity-10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z"/>
                </svg>
              </div>
              <Badge variant="secondary" className="text-xs">
                +25%
              </Badge>
            </div>
            <div className="text-2xl font-bold text-neutral-800 mb-1">
              ${analytics?.scholarshipValue ? (analytics.scholarshipValue / 1000000).toFixed(1) : 0}M
            </div>
            <div className="text-sm text-neutral-600">Scholarships Found</div>
          </CardContent>
        </Card>

        <Card className="shadow-material">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                </svg>
              </div>
              <Badge variant="secondary" className="text-xs">
                +5%
              </Badge>
            </div>
            <div className="text-2xl font-bold text-neutral-800 mb-1">
              {analytics?.engagementRate || 0}%
            </div>
            <div className="text-sm text-neutral-600">Engagement Rate</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Usage Analytics */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-material p-6">
          <h3 className="text-xl font-semibold text-neutral-800 mb-6">Student Activity Overview</h3>
          
          {/* Activity Chart Placeholder */}
          <div className="h-64 bg-neutral-50 rounded-lg flex items-center justify-center mb-6">
            <div className="text-center text-neutral-500">
              <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16,11.78L20.24,4.45L21.97,5.45L16.74,14.5L10.23,10.75L5.46,19H22V21H2V3H4V17.54L9.5,8L16,11.78Z"/>
              </svg>
              <p className="font-medium">Activity Chart</p>
              <p className="text-sm">Essays, Scholarships, Profile Updates</p>
            </div>
          </div>

          {/* Recent Activity Table */}
          <div>
            <h4 className="text-lg font-semibold text-neutral-800 mb-4">Recent Activity</h4>
            {recentActivities?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left py-3 px-4 font-medium text-neutral-700">Student</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-700">Activity</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-700">Time</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivities.map((activity: any) => (
                      <tr key={activity.id} className="border-b border-neutral-100">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-semibold">
                                {activity.userId?.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium">{activity.userId}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{activity.description}</td>
                        <td className="py-3 px-4 text-neutral-600">
                          {new Date(activity.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary" className="text-xs">
                            {activity.type.replace('_', ' ')}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                </svg>
                <p className="font-medium">No recent activity</p>
                <p className="text-sm">Student activity will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Controls & Reports */}
        <div className="space-y-6">
          {/* API Usage */}
          <Card className="shadow-material">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">API Usage</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Monthly Calls</span>
                  <span className="font-semibold">47,392</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Rate Limit</span>
                  <Badge variant="secondary" className="text-xs">Normal</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Active Keys</span>
                  <span className="font-semibold">3</span>
                </div>
                <Button 
                  variant="default"
                  className="w-full bg-primary text-white hover:bg-blue-700"
                >
                  Manage API Access
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* School Settings */}
          <Card className="shadow-material">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">School Settings</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="schoolName">Institution Name</Label>
                  <Input 
                    id="schoolName"
                    defaultValue="Lincoln High School"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">Student Capacity</Label>
                  <Input 
                    id="capacity"
                    type="number"
                    defaultValue="1500"
                    className="text-sm"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoSync" className="text-sm font-medium text-neutral-700">
                    Auto-sync with SIS
                  </Label>
                  <Switch id="autoSync" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Reports */}
          <Card className="shadow-material">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Reports</h3>
              <div className="space-y-3">
                <Button 
                  variant="outline"
                  className="w-full justify-center"
                  onClick={() => handleExportReport("Student Engagement Report")}
                >
                  <svg className="w-4 h-4 mr-2 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16,4C16.88,4 17.67,4.35 18.23,4.94L15.95,7.22C15.8,7.08 15.42,7 15,7C14.42,7 14,7.42 14,8V16C14,16.58 14.42,17 15,17C15.58,17 16,16.58 16,16V12H14V10H18V16A3,3 0 0,1 15,19A3,3 0 0,1 12,16V8A3,3 0 0,1 15,5C15.35,5 15.69,5.07 16,5.2V4M1,5A2,2 0 0,1 3,3H13A2,2 0 0,1 15,5V6.17C14.5,6.06 14,6 13.5,6A4.5,4.5 0 0,0 9,10.5A4.5,4.5 0 0,0 13.5,15C14,15 14.5,14.94 15,14.83V19A2,2 0 0,1 13,21H3A2,2 0 0,1 1,19V5M3,5V19H13V17H11V15H13V13H11V11H13V9H11V7H13V5H3Z"/>
                  </svg>
                  <span className="font-medium text-sm">Student Engagement Report</span>
                </Button>
                <Button 
                  variant="outline"
                  className="w-full justify-center"
                  onClick={() => handleExportReport("Essay Polish Analytics")}
                >
                  <svg className="w-4 h-4 mr-2 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                  <span className="font-medium text-sm">Essay Polish Analytics</span>
                </Button>
                <Button 
                  variant="outline"
                  className="w-full justify-center"
                  onClick={() => handleExportReport("Scholarship Success Report")}
                >
                  <svg className="w-4 h-4 mr-2 text-accent" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z"/>
                  </svg>
                  <span className="font-medium text-sm">Scholarship Success Report</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card className="bg-gradient-primary text-white shadow-material-lg">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Need Support?</h3>
              <p className="text-sm opacity-90 mb-4">
                Our team is here to help you maximize student success with StudentOS.
              </p>
              <Button 
                variant="secondary"
                className="w-full bg-white text-primary hover:bg-gray-100"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,1C8.96,1 6.21,2.65 4.82,5.07C3.5,7.36 3.5,10.64 4.82,12.93C6.21,15.35 8.96,17 12,17C15.04,17 17.79,15.35 19.18,12.93C20.5,10.64 20.5,7.36 19.18,5.07C17.79,2.65 15.04,1 12,1M12,3A7,7 0 0,1 19,10A7,7 0 0,1 12,17A7,7 0 0,1 5,10A7,7 0 0,1 12,3M12,5A5,5 0 0,0 7,10A5,5 0 0,0 12,15A5,5 0 0,0 17,10A5,5 0 0,0 12,5M12,7A3,3 0 0,1 15,10A3,3 0 0,1 12,13A3,3 0 0,1 9,10A3,3 0 0,1 12,7Z"/>
                </svg>
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
