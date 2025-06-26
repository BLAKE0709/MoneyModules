import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, Clock, DollarSign, Users, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function ScholarshipScoutDemo() {
  const { data: scholarships, isLoading } = useQuery({
    queryKey: ['/api/scholarships'],
  });

  const { data: matches } = useQuery({
    queryKey: ['/api/scholarships/matches'],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const scholarshipList = Array.isArray(scholarships) ? scholarships : [];
  const totalValue = scholarshipList.reduce((sum: number, s: any) => sum + (s.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Scholarship Discovery</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          AI-powered scholarship matching based on your profile. Find opportunities worth thousands of dollars.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{scholarshipList.length}</div>
            <div className="text-sm text-gray-600">Available Scholarships</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">${(totalValue / 1000).toFixed(0)}K+</div>
            <div className="text-sm text-gray-600">Total Value</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">{matches?.length || 0}</div>
            <div className="text-sm text-gray-600">Your Matches</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold">15min</div>
            <div className="text-sm text-gray-600">Avg Application Time</div>
          </CardContent>
        </Card>
      </div>

      {/* Scholarship Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scholarshipList.map((scholarship: any) => (
          <Card key={scholarship.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{scholarship.title}</CardTitle>
                <Badge variant="secondary">${(scholarship.amount / 1000).toFixed(0)}K</Badge>
              </div>
              <p className="text-sm text-gray-600">{scholarship.provider}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Deadline:</span>
                  <span className="font-medium">
                    {new Date(scholarship.deadline).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Match Score:</span>
                  <div className="flex items-center gap-2">
                    <Progress value={85} className="w-16 h-2" />
                    <span className="font-medium">85%</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {scholarship.requirements?.slice(0, 2).map((req: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {req}
                    </Badge>
                  ))}
                  {scholarship.requirements?.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{scholarship.requirements.length - 2} more
                    </Badge>
                  )}
                </div>

                <Button className="w-full" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Quick Apply
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {scholarshipList.length === 0 && (
        <Card className="text-center p-8">
          <CardContent>
            <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No Scholarships Found</h3>
            <p className="text-gray-600 mb-4">
              Complete your profile to discover personalized scholarship opportunities.
            </p>
            <Button>Complete Profile</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}