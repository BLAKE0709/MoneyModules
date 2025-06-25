import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, DollarSign, Calendar, ExternalLink, RefreshCw, CheckCircle2, Clock, TrendingUp, Crown } from "lucide-react";
import UpgradeBanner from "./upgrade-banner";

export default function ScholarshipScoutDemo() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: matches = [], isLoading, refetch, error } = useQuery({
    queryKey: ['/api/scholarships/matches'],
    enabled: !!(user as any)?.id,
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/scholarships/matches?force=true', 'GET');
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scholarships/matches'] });
      toast({
        title: "Scholarships Updated",
        description: "Found new scholarship opportunities for you!",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to refresh scholarship matches",
        variant: "destructive",
      });
    },
  });

  const getCompetitivenessColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    return 'text-yellow-600';
  };

  const formatDeadline = (deadline: string | Date) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Deadline passed';
    if (diffDays === 0) return 'Due today!';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 30) return `${diffDays} days left`;
    if (diffDays <= 90) return `${Math.ceil(diffDays / 7)} weeks left`;
    return `${Math.ceil(diffDays / 30)} months left`;
  };

  const matchesArray = Array.isArray(matches) ? matches as any[] : [];
  const totalValue = matchesArray.reduce((sum: number, match: any) => sum + (match.amount || 0), 0);
  const avgMatchScore = matchesArray.length > 0 
    ? Math.round(matchesArray.reduce((sum: number, match: any) => sum + (match.matchScore || 0), 0) / matchesArray.length)
    : 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            ScholarshipScout
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-20 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle error state (incomplete profile)
  if (error && (error as any)?.status === 400) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            ScholarshipScout
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mb-4">
              <Clock className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <h3 className="text-lg font-medium text-gray-900">Complete Your Profile</h3>
              <p className="text-gray-600 mt-2">
                To find personalized scholarship matches, please complete your student profile first.
              </p>
            </div>
            <Button 
              onClick={() => {window.location.href = '/persona'}}
              className="mt-4"
            >
              Complete Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Premium scholarship upgrade banner */}
      <UpgradeBanner 
        context="premium-scholarships"
        feature="Premium Scholarship Database"
      />

      {/* Overview Stats */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              ScholarshipScout Results
            </CardTitle>
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3" />
              Active
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {matchesArray.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{matchesArray.length}</div>
                <div className="text-sm text-gray-600">Matches Found</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">${totalValue.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Value</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getMatchScoreColor(avgMatchScore)}`}>{avgMatchScore}%</div>
                <div className="text-sm text-gray-600">Avg Match</div>
              </div>
              <div className="text-center">
                <Button 
                  size="sm" 
                  onClick={() => refreshMutation.mutate()}
                  disabled={refreshMutation.isPending}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  {refreshMutation.isPending ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Matches Yet</h3>
              <p className="text-gray-600 mb-4">Complete your profile to find scholarship opportunities</p>
              <Button 
                onClick={() => refreshMutation.mutate()}
                disabled={refreshMutation.isPending}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                {refreshMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Target className="w-4 h-4 mr-2" />
                )}
                Find Scholarships
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scholarship Matches */}
      {matchesArray.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matchesArray.slice(0, 4).map((match: any, index: number) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                      {match.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{match.provider}</p>
                  </div>
                  <Badge className={`${getMatchScoreColor(match.matchScore || 0)} bg-opacity-10 border-0`}>
                    {match.matchScore || 0}% match
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Amount and Deadline */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-green-600">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-semibold">${(match.amount || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-orange-600 text-sm">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDeadline(match.deadline)}</span>
                    </div>
                  </div>

                  {/* Match Reasons */}
                  {match.matchReasons && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Why you match:</div>
                      <ul className="text-sm text-gray-700">
                        {match.matchReasons.slice(0, 2).map((reason: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2">
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Competitiveness and Time */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3 h-3" />
                      <span className="text-gray-600">Competitiveness:</span>
                      <Badge className={`${getCompetitivenessColor(match.competitiveness || 'medium')} text-white text-xs`}>
                        {match.competitiveness || 'medium'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="w-3 h-3" />
                      <span>{match.estimatedTimeToComplete || 3}h to apply</span>
                    </div>
                  </div>

                  {/* AI Recommendation */}
                  {match.aiRecommendation && (
                    <div className="bg-blue-50 p-2 rounded border-l-2 border-blue-300">
                      <div className="text-xs text-blue-600 font-medium mb-1">AI Insight:</div>
                      <p className="text-xs text-blue-700">{match.aiRecommendation}</p>
                    </div>
                  )}

                  {/* Apply Button */}
                  <Button 
                    asChild 
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    size="sm"
                  >
                    <a href={match.applicationUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3 mr-2" />
                      Apply Now
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}