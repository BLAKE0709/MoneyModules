import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Eye, 
  TrendingUp, 
  Users, 
  MapPin, 
  Briefcase, 
  Heart,
  Lightbulb,
  Network,
  DollarSign,
  Target
} from 'lucide-react';

interface IntelligentMatch {
  scholarshipId: string;
  matchType: 'hidden_gem' | 'social_network' | 'activity_based' | 'location_specific' | 'employer_based';
  matchReason: string;
  confidenceScore: number;
  discoverability: 'impossible' | 'unlikely' | 'difficult' | 'moderate';
  suggestedAction: string;
}

interface IntelligenceReport {
  totalHiddenValue: number;
  actionableTips: string[];
  networkingStrategy: string[];
  communityResearch: string[];
}

const getMatchTypeIcon = (type: string) => {
  switch (type) {
    case 'activity_based': return Heart;
    case 'social_network': return Network;
    case 'location_specific': return MapPin;
    case 'employer_based': return Briefcase;
    default: return Eye;
  }
};

const getDiscoverabilityColor = (level: string) => {
  switch (level) {
    case 'impossible': return 'bg-red-100 text-red-800 border-red-200';
    case 'unlikely': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'difficult': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'moderate': return 'bg-blue-100 text-blue-800 border-blue-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function IntelligentScholarshipDiscovery() {
  const [showAllTips, setShowAllTips] = useState(false);

  const { data: discoveryData, isLoading, error } = useQuery({
    queryKey: ['/api/scholarships/intelligent-discovery'],
    retry: false
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !discoveryData?.success) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          Complete your student profile to discover hidden scholarship opportunities that other students miss.
          <Button variant="link" className="ml-2 p-0 h-auto text-blue-600">
            Complete Profile →
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const { hiddenMatches, intelligenceReport, estimatedValue } = discoveryData.data;

  return (
    <div className="space-y-8">
      {/* Header with Discovery Stats */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Eye className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Hidden Scholarship Intelligence
          </h2>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-md border border-purple-100">
            <div className="text-2xl font-bold text-purple-600">{hiddenMatches.length}</div>
            <div className="text-sm text-gray-600">Hidden Opportunities</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md border border-green-100">
            <div className="text-2xl font-bold text-green-600">${estimatedValue.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Estimated Value</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md border border-orange-100">
            <div className="text-2xl font-bold text-orange-600">95%</div>
            <div className="text-sm text-gray-600">Students Miss These</div>
          </div>
        </div>
      </div>

      {/* Hidden Opportunities */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Opportunities Other Students Will Never Find
        </h3>
        
        {hiddenMatches.map((match: IntelligentMatch, index: number) => {
          const IconComponent = getMatchTypeIcon(match.matchType);
          
          return (
            <Card key={index} className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`text-xs ${getDiscoverabilityColor(match.discoverability)}`}>
                          {match.discoverability.charAt(0).toUpperCase() + match.discoverability.slice(1)} to Find
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(match.confidenceScore * 100)}% Match
                        </Badge>
                      </div>
                      <CardTitle className="text-sm font-medium text-gray-900">
                        {match.matchReason}
                      </CardTitle>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      ${(1500 + index * 250).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">Est. Value</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-blue-900 mb-1">Action Plan:</div>
                      <div className="text-sm text-blue-800">{match.suggestedAction}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Intelligence Report */}
      {intelligenceReport && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Your Scholarship Intelligence Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Actionable Tips */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-green-600" />
                Immediate Actions (Next 30 Days)
              </h4>
              <div className="space-y-2">
                {intelligenceReport.actionableTips.slice(0, showAllTips ? undefined : 2).map((tip: string, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-sm text-gray-700">{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Networking Strategy */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Network className="w-4 h-4 text-purple-600" />
                Social Network Strategy
              </h4>
              <div className="space-y-2">
                {intelligenceReport.networkingStrategy.slice(0, showAllTips ? undefined : 2).map((strategy: string, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                      <Users className="w-3 h-3 text-purple-600" />
                    </div>
                    <span className="text-sm text-gray-700">{strategy}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Research */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-600" />
                Local Community Research
              </h4>
              <div className="space-y-2">
                {intelligenceReport.communityResearch.slice(0, showAllTips ? undefined : 2).map((research: string, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                      <MapPin className="w-3 h-3 text-orange-600" />
                    </div>
                    <span className="text-sm text-gray-700">{research}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              variant="outline" 
              onClick={() => setShowAllTips(!showAllTips)}
              className="w-full"
            >
              {showAllTips ? 'Show Less' : 'Show All Intelligence'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
        <CardContent className="p-6 text-center">
          <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h3 className="text-xl font-bold mb-2">Start Your Hidden Scholarship Hunt Today</h3>
          <p className="text-green-100 mb-4">
            While other students compete for popular scholarships, you'll be applying to opportunities they'll never discover.
          </p>
          <Button variant="secondary" className="bg-white text-green-600 hover:bg-green-50">
            Download Action Plan
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}