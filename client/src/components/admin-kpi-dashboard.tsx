import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Target, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  Activity
} from "lucide-react";

export default function AdminKPIDashboard() {
  const { data: healthMetrics } = useQuery({
    queryKey: ['/api/health'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['/api/activities'],
  });

  // Calculate KPIs from available data
  const calculateKPIs = () => {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    // Daily active users (users with activity in last 24h)
    const dailyActiveUsers = new Set(
      activities.filter((activity: any) => 
        new Date(activity.createdAt) > yesterday
      ).map((activity: any) => activity.userId)
    ).size;

    // Scholarship saves per student
    const scholarshipSaves = activities.filter((activity: any) => 
      activity.type === 'scholarship_saved'
    ).length;
    
    const avgScholarshipsPerStudent = dailyActiveUsers > 0 
      ? Math.round((scholarshipSaves / dailyActiveUsers) * 10) / 10 
      : 0;

    // User engagement metrics
    const totalUsers = new Set(activities.map((activity: any) => activity.userId)).size;
    const activeUsersLastWeek = new Set(
      activities.filter((activity: any) => 
        new Date(activity.createdAt) > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      ).map((activity: any) => activity.userId)
    ).size;

    const engagementRate = totalUsers > 0 
      ? Math.round((activeUsersLastWeek / totalUsers) * 100) 
      : 0;

    return {
      dailyActiveUsers,
      avgScholarshipsPerStudent,
      engagementRate,
      totalUsers,
      activeUsersLastWeek
    };
  };

  const kpis = calculateKPIs();
  const metrics = healthMetrics?.metrics || {};

  const getPerformanceStatus = () => {
    const p95 = metrics.p95ResponseTime || 0;
    if (p95 > 2000) return { status: 'critical', color: 'bg-red-500', text: 'Critical' };
    if (p95 > 1500) return { status: 'warning', color: 'bg-yellow-500', text: 'Warning' };
    return { status: 'healthy', color: 'bg-green-500', text: 'Healthy' };
  };

  const performanceStatus = getPerformanceStatus();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">KPI Dashboard</h2>
        <Badge className="bg-blue-100 text-blue-800 border-0">
          Live Metrics
        </Badge>
      </div>

      {/* Core KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.dailyActiveUsers}</div>
            <p className="text-xs text-muted-foreground">
              {kpis.totalUsers} total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Scholarships Saved</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.avgScholarshipsPerStudent}</div>
            <p className="text-xs text-muted-foreground">
              per active student
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.engagementRate}%</div>
            <p className="text-xs text-muted-foreground">
              weekly active / total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ARR Estimate</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0</div>
            <p className="text-xs text-muted-foreground">
              pre-revenue phase
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">P95 Response Time</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{metrics.p95ResponseTime || 0}ms</span>
                <Badge className={`${performanceStatus.color} text-white text-xs`}>
                  {performanceStatus.text}
                </Badge>
              </div>
            </div>
            <Progress 
              value={Math.min((metrics.p95ResponseTime || 0) / 2000 * 100, 100)} 
              className="h-2"
            />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Avg Response</div>
                <div className="font-medium">{metrics.avgResponseTime || 0}ms</div>
              </div>
              <div>
                <div className="text-muted-foreground">Error Rate</div>
                <div className="font-medium">{metrics.errorRate || 0}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Compliance Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">HTTPS Enforcement</span>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Audit Logging</span>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Similarity Monitoring</span>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Rate Limiting</span>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {activities.slice(0, 10).map((activity: any, index: number) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {activity.description}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(activity.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
            {activities.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent activity
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}